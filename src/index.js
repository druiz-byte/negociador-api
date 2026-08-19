/**
 * Negociador Implacable — backend
 *
 * Cloudflare Worker que hace de intermediario con la API de Claude.
 * La clave de API vive aquí como secreto: nunca llega al navegador.
 * Las fichas confidenciales de los casos tampoco.
 */

import { catalogoPublico, buscarCaso } from './casos.js';
import { construirPrompt, CONFIG_VALIDA } from './prompt.js';
import { avatarParaRol } from './avatares.js';

const API = 'https://api.anthropic.com/v1/messages';
const VERSION_API = '2023-06-01';
const ANAM_API = 'https://api.anam.ai/v1/auth/session-token';

// Valores por defecto; se pueden cambiar como variables de entorno en Cloudflare.
const POR_DEFECTO = {
  MODELO: 'claude-sonnet-5',
  MAX_TOKENS: 900,
  MAX_MENSAJES: 60, // intervenciones por simulación
  MAX_CARACTERES: 90000, // tamaño máximo del historial enviado
  MAX_DIA: 300, // peticiones totales al día (tope de gasto)
  MAX_HORA_IP: 40, // peticiones por IP y hora
  ANAM_MAX_DIA: 80, // sesiones de avatar al día (coste aparte del de Claude)
  ANAM_MAX_HORA_IP: 20, // sesiones de avatar por IP y hora
};

function num(env, clave) {
  const v = parseInt(env[clave], 10);
  return Number.isFinite(v) && v > 0 ? v : POR_DEFECTO[clave];
}

function cors(env, request) {
  const permitidos = (env.ORIGEN_PERMITIDO || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origen = request.headers.get('Origin') || '';
  let allow = '*';
  if (!permitidos.includes('*')) {
    allow = permitidos.includes(origen) ? origen : permitidos[0] || '';
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, env, request, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(env, request) },
  });
}

function error(mensaje, env, request, status = 400) {
  return json({ error: mensaje }, env, request, status);
}

/* ─────────────── Límites de uso ─────────────── */

async function contar(kv, clave, ttl) {
  const actual = parseInt((await kv.get(clave)) || '0', 10);
  const nuevo = actual + 1;
  await kv.put(clave, String(nuevo), { expirationTtl: ttl });
  return nuevo;
}

async function comprobarLimites(env, request, opciones = {}) {
  const {
    prefijo = '',
    claveDia = 'MAX_DIA',
    claveHoraIp = 'MAX_HORA_IP',
    mensajeDia = 'El simulador ha alcanzado su límite de uso diario. Vuelve mañana — es un proyecto docente con presupuesto acotado.',
    mensajeHoraIp = 'Has alcanzado el límite de mensajes por hora. Espera un rato y retoma la negociación.',
  } = opciones;

  const kv = env.LIMITES;
  if (!kv) return { ok: true, aviso: 'sin-kv' };

  const ahora = new Date();
  const dia = ahora.toISOString().slice(0, 10);
  const hora = ahora.toISOString().slice(0, 13);
  const ip = request.headers.get('CF-Connecting-IP') || 'desconocida';

  const totalDia = await contar(kv, `${prefijo}dia:${dia}`, 60 * 60 * 48);
  if (totalDia > num(env, claveDia)) {
    return { ok: false, status: 429, mensaje: mensajeDia };
  }

  const totalIp = await contar(kv, `${prefijo}ip:${ip}:${hora}`, 60 * 60 * 2);
  if (totalIp > num(env, claveHoraIp)) {
    return { ok: false, status: 429, mensaje: mensajeHoraIp };
  }

  return { ok: true, totalDia, totalIp };
}

/* ─────────────── Validación ─────────────── */

function validarConfig(body) {
  const c = body.config || {};
  const dureza = parseInt(c.dureza, 10);
  if (!CONFIG_VALIDA.dureza.includes(dureza)) return null;
  if (!CONFIG_VALIDA.modo.includes(c.modo)) return null;
  if (!CONFIG_VALIDA.color.includes(c.color)) return null;
  return { dureza, modo: c.modo, color: c.color };
}

function validarMensajes(mensajes, env) {
  if (!Array.isArray(mensajes)) return 'Faltan los mensajes de la conversación.';
  if (mensajes.length > num(env, 'MAX_MENSAJES'))
    return 'Esta simulación ha alcanzado su longitud máxima. Pide el informe con el botón "Fin de la simulación".';
  let caracteres = 0;
  for (const m of mensajes) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return 'Formato de mensajes inválido.';
    if (typeof m.content !== 'string') return 'Formato de mensajes inválido.';
    caracteres += m.content.length;
  }
  if (caracteres > num(env, 'MAX_CARACTERES'))
    return 'La conversación es demasiado larga. Pide el informe para cerrarla.';
  return null;
}

/* ─────────────── Endpoints ─────────────── */

async function handleChat(request, env) {
  if (!env.ANTHROPIC_API_KEY)
    return error('El simulador no está configurado: falta la clave de API.', env, request, 503);

  const limite = await comprobarLimites(env, request);
  if (!limite.ok) return error(limite.mensaje, env, request, limite.status);

  let body;
  try {
    body = await request.json();
  } catch {
    return error('Petición mal formada.', env, request);
  }

  const caso = buscarCaso(body.casoId);
  if (!caso) return error('Caso no encontrado.', env, request, 404);

  const rolParticipante = caso.roles.find((r) => r.id === body.rolId);
  const rolSimulacion = caso.roles.find((r) => r.id !== body.rolId);
  if (!rolParticipante || !rolSimulacion) return error('Rol no encontrado.', env, request, 404);

  const config = validarConfig(body);
  if (!config) return error('Configuración inválida.', env, request);

  const problema = validarMensajes(body.mensajes, env);
  if (problema) return error(problema, env, request, 400);

  const system = construirPrompt({ caso, rolSimulacion, rolParticipante, config });

  // Si el historial viene vacío, pedimos a la simulación que abra la reunión.
  const mensajes = body.mensajes.length
    ? body.mensajes
    : [{ role: 'user', content: '(El participante entra en la sala y se sienta.)' }];

  const peticion = {
    model: env.MODELO || POR_DEFECTO.MODELO,
    max_tokens: num(env, 'MAX_TOKENS'),
    stream: true,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: mensajes,
  };

  const respuesta = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': VERSION_API,
    },
    body: JSON.stringify(peticion),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    console.error('Error de la API:', respuesta.status, detalle.slice(0, 500));
    const publico =
      respuesta.status === 429
        ? 'El servicio está saturado ahora mismo. Espera unos segundos y reintenta.'
        : 'No se ha podido contactar con la simulación. Inténtalo de nuevo en un momento.';
    return error(publico, env, request, 502);
  }

  return new Response(respuesta.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...cors(env, request),
    },
  });
}

async function handleBriefing(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('Petición mal formada.', env, request);
  }
  const caso = buscarCaso(body.casoId);
  if (!caso) return error('Caso no encontrado.', env, request, 404);
  const rol = caso.roles.find((r) => r.id === body.rolId);
  if (!rol) return error('Rol no encontrado.', env, request, 404);

  const contraparte = caso.roles.find((r) => r.id !== body.rolId);
  return json(
    {
      casoId: caso.id,
      titulo: caso.titulo,
      contexto: caso.contexto,
      variables: caso.variables,
      rol: { id: rol.id, nombre: rol.nombre, briefing: rol.briefing },
      contraparte: { id: contraparte.id, nombre: contraparte.nombre },
    },
    env,
    request
  );
}

async function handleAvatarToken(request, env) {
  if (!env.ANAM_API_KEY)
    return error('El avatar no está configurado en este servidor.', env, request, 503);

  const limite = await comprobarLimites(env, request, {
    prefijo: 'anam:',
    claveDia: 'ANAM_MAX_DIA',
    claveHoraIp: 'ANAM_MAX_HORA_IP',
    mensajeDia: 'El avatar ha alcanzado su límite de uso diario. La negociación sigue funcionando en modo texto.',
    mensajeHoraIp: 'Límite de sesiones de avatar por hora alcanzado. La negociación sigue en modo texto.',
  });
  if (!limite.ok) return error(limite.mensaje, env, request, limite.status);

  let body;
  try {
    body = await request.json();
  } catch {
    return error('Petición mal formada.', env, request);
  }

  const caso = buscarCaso(body.casoId);
  if (!caso) return error('Caso no encontrado.', env, request, 404);

  const rolParticipante = caso.roles.find((r) => r.id === body.rolId);
  const rolSimulacion = caso.roles.find((r) => r.id !== body.rolId);
  if (!rolParticipante || !rolSimulacion) return error('Rol no encontrado.', env, request, 404);

  const personaId = avatarParaRol(rolSimulacion.id);
  if (!personaId) return error('No hay avatar configurado para este papel.', env, request, 404);

  let respuesta;
  try {
    respuesta = await fetch(ANAM_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.ANAM_API_KEY}`,
      },
      body: JSON.stringify({ personaConfig: { personaId } }),
    });
  } catch (err) {
    console.error('Error de red hacia Anam:', err);
    return error('No se ha podido contactar con el servicio de avatar.', env, request, 502);
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    console.error('Error de la API de Anam:', respuesta.status, detalle.slice(0, 500));
    return error('No se ha podido preparar el avatar en este momento.', env, request, 502);
  }

  const datos = await respuesta.json();
  return json({ sessionToken: datos.sessionToken }, env, request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(env, request) });
    }

    if (url.pathname === '/api/salud') {
      return json(
        {
          ok: true,
          clave: Boolean(env.ANTHROPIC_API_KEY),
          anam: Boolean(env.ANAM_API_KEY),
          kv: Boolean(env.LIMITES),
          modelo: env.MODELO || POR_DEFECTO.MODELO,
          limites: {
            dia: num(env, 'MAX_DIA'),
            horaPorIp: num(env, 'MAX_HORA_IP'),
            mensajesPorSesion: num(env, 'MAX_MENSAJES'),
            anamDia: num(env, 'ANAM_MAX_DIA'),
            anamHoraPorIp: num(env, 'ANAM_MAX_HORA_IP'),
          },
        },
        env,
        request
      );
    }

    if (url.pathname === '/api/casos' && request.method === 'GET') {
      return json({ casos: catalogoPublico() }, env, request);
    }

    if (url.pathname === '/api/briefing' && request.method === 'POST') {
      return handleBriefing(request, env);
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    if (url.pathname === '/api/avatar-token' && request.method === 'POST') {
      return handleAvatarToken(request, env);
    }

    return error('Ruta no encontrada.', env, request, 404);
  },
};
