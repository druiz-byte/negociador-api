/**
 * Competición por grupos: grupos con código, evaluación oficial, ranking,
 * descarga privada del informe y panel del profesor.
 *
 * Necesita una base de datos PostgreSQL (env.BD, que prepara servidor.mjs a
 * partir de DATABASE_URL). Sin base de datos, todo esto responde 503 y la
 * web esconde la competición: el simulador sigue funcionando como siempre.
 *
 * Datos personales: solo se guarda el nombre o alias que el participante
 * escribe al apuntarse, junto con su resultado, su informe y su hoja de
 * preparación. Nada de correo, IP ni cuenta. Se borran solos al cumplir
 * RETENCION_DIAS (365 por defecto) y el propio participante puede borrar
 * los suyos en cualquier momento.
 */

import { buscarCaso } from './casos.js';
import { verificar, ultimoDeLaSimulacion } from './firma.js';
import { evaluar, calcularPuntos, informeMarkdown, normalizarHoja } from './evaluacion.js';

/* ─────────── Base de datos ─────────── */

const ESQUEMA_SQL = `
CREATE TABLE IF NOT EXISTS grupos (
  codigo      text PRIMARY KEY,
  nombre      text NOT NULL,
  abierto     boolean NOT NULL DEFAULT true,
  creado      timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS resultados (
  id                uuid PRIMARY KEY,
  grupo             text NOT NULL REFERENCES grupos(codigo) ON DELETE CASCADE,
  nombre            text NOT NULL,
  caso_id           text NOT NULL,
  caso_titulo       text NOT NULL,
  rol_id            text NOT NULL,
  rol_nombre        text NOT NULL,
  dureza            integer NOT NULL,
  hoja_rellenada    boolean NOT NULL DEFAULT false,
  hoja_completitud  integer NOT NULL DEFAULT 0,
  hoja              jsonb,
  rubrica           numeric NOT NULL,
  resultado         numeric NOT NULL,
  factor            numeric NOT NULL,
  puntos            numeric NOT NULL,
  evaluacion        jsonb NOT NULL,
  informe           text NOT NULL,
  token_hash        text NOT NULL,
  firma_hash        text NOT NULL UNIQUE,
  creado            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS resultados_grupo_puntos ON resultados (grupo, puntos DESC);
`;

let esquemaListo = null;
let ultimaPurga = 0;

async function bd(env) {
  if (!env.BD) return null;
  if (!esquemaListo) {
    esquemaListo = env.BD.query(ESQUEMA_SQL).catch((err) => {
      esquemaListo = null;
      throw err;
    });
  }
  await esquemaListo;
  // Retención: borra resultados antiguos, como mucho dos veces al día.
  if (Date.now() - ultimaPurga > 12 * 3600 * 1000) {
    ultimaPurga = Date.now();
    const dias = Math.max(1, parseInt(env.RETENCION_DIAS, 10) || 365);
    env.BD.query(`DELETE FROM resultados WHERE creado < now() - make_interval(days => $1)`, [dias]).catch((err) =>
      console.error('Purga de resultados:', err.message)
    );
  }
  return env.BD;
}

/* ─────────── Utilidades ─────────── */

const codificador = new TextEncoder();

async function sha256(texto) {
  const h = await crypto.subtle.digest('SHA-256', codificador.encode(texto));
  return Buffer.from(h).toString('hex');
}

function tokenAleatorio() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function codigoAleatorio() {
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  return 'NEG-' + Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join('');
}

const normalizarCodigo = (c) => (typeof c === 'string' ? c.trim().toUpperCase() : '');
const CODIGO_VALIDO = /^[A-Z0-9][A-Z0-9-]{3,23}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function limpiarNombre(n) {
  if (typeof n !== 'string') return '';
  return n.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

async function leerJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function sinBd(u) {
  return u.error('La competición no está disponible en este servidor.', 503);
}

/* ─────────── Rutas públicas ─────────── */

async function datosGrupo(request, env, u, codigo) {
  const limite = await u.limites({
    prefijo: 'grupo:',
    claveDia: 'GRUPO_MAX_DIA',
    claveHoraIp: 'GRUPO_MAX_HORA_IP',
    mensajeHoraIp: 'Demasiados intentos con códigos de grupo. Espera un rato.',
  });
  if (!limite.ok) return u.error(limite.mensaje, limite.status);
  const db = await bd(env);
  if (!db) return sinBd(u);
  const { rows } = await db.query('SELECT codigo, nombre, abierto FROM grupos WHERE codigo = $1', [normalizarCodigo(codigo)]);
  if (!rows.length) return u.error('No existe ningún grupo con ese código.', 404);
  return u.json({ grupo: rows[0] });
}

async function ranking(request, env, u, codigo) {
  const db = await bd(env);
  if (!db) return sinBd(u);
  const c = normalizarCodigo(codigo);
  const g = await db.query('SELECT codigo, nombre, abierto FROM grupos WHERE codigo = $1', [c]);
  if (!g.rows.length) return u.error('No existe ningún grupo con ese código.', 404);
  const { rows } = await db.query(
    `SELECT id, nombre, caso_id, caso_titulo, rol_id, rol_nombre, dureza, hoja_rellenada, hoja_completitud,
            rubrica::float AS rubrica, resultado::float AS resultado, factor::float AS factor, puntos::float AS puntos, creado
       FROM resultados WHERE grupo = $1 ORDER BY puntos DESC, creado ASC LIMIT 1000`,
    [c]
  );
  return u.json({ grupo: g.rows[0], resultados: rows });
}

async function handleEvaluar(request, env, u) {
  if (!env.ANTHROPIC_API_KEY) return u.error('El simulador no está configurado: falta la clave de API.', 503);
  const db = await bd(env);
  if (!db) return sinBd(u);

  const body = await leerJson(request);
  if (!body) return u.error('Petición mal formada.');

  if (body.consentimiento !== true)
    return u.error('Para puntuar en la competición tienes que aceptar las condiciones de participación.');

  const nombre = limpiarNombre(body.nombre);
  if (nombre.length < 2) return u.error('Escribe un nombre o alias de al menos 2 caracteres.');

  const codigo = normalizarCodigo(body.grupo);
  const g = await db.query('SELECT codigo, abierto FROM grupos WHERE codigo = $1', [codigo]);
  if (!g.rows.length) return u.error('No existe ningún grupo con ese código.', 404);
  if (!g.rows[0].abierto) return u.error('Esta competición está cerrada y ya no admite resultados.', 403);

  const caso = buscarCaso(body.casoId);
  if (!caso) return u.error('Caso no encontrado.', 404);
  const rolParticipante = caso.roles.find((r) => r.id === body.rolId);
  const rolSimulacion = caso.roles.find((r) => r.id !== body.rolId);
  if (!rolParticipante || !rolSimulacion) return u.error('Rol no encontrado.', 404);

  const dureza = parseInt(body.config && body.config.dureza, 10);
  if (![1, 2, 3, 4].includes(dureza)) return u.error('Configuración inválida.');
  const modo = body.config && body.config.modo;
  if (modo !== 'contraparte') return u.error('En competición la simulación solo puede jugar como contraparte.');

  const problema = u.validarMensajes(body.mensajes);
  if (problema) return u.error(problema);

  // Solo cuenta lo que la simulación ha respondido y el servidor ha firmado.
  const fin = ultimoDeLaSimulacion(body.mensajes);
  const mensajes = body.mensajes.slice(0, fin + 1);
  const firmaOk =
    fin >= 0 && (await verificar(env, { casoId: caso.id, rolId: rolParticipante.id, dureza, modo, mensajes }, body.firma));
  if (!firmaOk)
    return u.error(
      'No se puede puntuar esta negociación: la conversación no coincide con la que registró el servidor.',
      400
    );

  if (mensajes.filter((m) => m.role === 'user').length < 3)
    return u.error('La negociación es demasiado corta para puntuarla: necesitas al menos tres intervenciones.');

  const firmaHash = await sha256(body.firma);
  const repetida = await db.query('SELECT id FROM resultados WHERE firma_hash = $1', [firmaHash]);
  if (repetida.rows.length) return u.error('Esta negociación ya está registrada en el ranking.', 409);

  const limite = await u.limites({
    prefijo: 'eval:',
    claveDia: 'EVAL_MAX_DIA',
    claveHoraIp: 'EVAL_MAX_HORA_IP',
    mensajeDia: 'El evaluador ha alcanzado su límite de uso diario. Vuelve a intentarlo mañana.',
    mensajeHoraIp: 'Has alcanzado el límite de evaluaciones por hora. Espera un rato.',
  });
  if (!limite.ok) return u.error(limite.mensaje, limite.status);

  const hoja = body.hoja ? normalizarHoja(body.hoja, caso.variables) : null;

  const r = await evaluar(env, { caso, rolParticipante, rolSimulacion, dureza, mensajes, hoja });
  if (!r.ok) {
    console.error('Error del evaluador:', r.status, r.detalle);
    return u.error('No se ha podido completar la evaluación. Inténtalo de nuevo en un momento.', 502);
  }

  const puntos = calcularPuntos(r.evaluacion, dureza);
  const informe = informeMarkdown(r.evaluacion, puntos, { dureza, hoja });
  const id = crypto.randomUUID();
  const token = tokenAleatorio();

  try {
    await db.query(
      `INSERT INTO resultados (id, grupo, nombre, caso_id, caso_titulo, rol_id, rol_nombre, dureza,
         hoja_rellenada, hoja_completitud, hoja, rubrica, resultado, factor, puntos, evaluacion, informe, token_hash, firma_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [
        id, codigo, nombre, caso.id, caso.titulo, rolParticipante.id, rolParticipante.nombre, dureza,
        hoja ? hoja.rellenada : false, hoja ? hoja.completitud : 0, hoja ? JSON.stringify(hoja.datos) : null,
        puntos.rubrica, puntos.resultado, puntos.factor, puntos.puntos,
        JSON.stringify(r.evaluacion), informe, await sha256(token), firmaHash,
      ]
    );
  } catch (err) {
    if (err && err.code === '23505') return u.error('Esta negociación ya está registrada en el ranking.', 409);
    throw err;
  }

  const pos = await db.query('SELECT count(*)::int AS n FROM resultados WHERE grupo = $1 AND puntos > $2', [
    codigo,
    puntos.puntos,
  ]);

  return u.json({
    id,
    token,
    posicion: pos.rows[0].n + 1,
    puntos,
    hoja: hoja ? { rellenada: hoja.rellenada, completitud: hoja.completitud } : null,
    informe,
  });
}

async function resultadoPropio(request, env, u, id, accion) {
  const db = await bd(env);
  if (!db) return sinBd(u);
  if (!UUID.test(id)) return u.error('Resultado no encontrado.', 404);
  const body = await leerJson(request);
  const token = body && typeof body.token === 'string' ? body.token : '';
  const { rows } = await db.query(
    `SELECT id, grupo, nombre, caso_titulo, rol_nombre, dureza, hoja, informe, puntos::float AS puntos, creado, token_hash
       FROM resultados WHERE id = $1`,
    [id]
  );
  // Misma respuesta si no existe o si el token no vale: no revelamos qué ids existen.
  if (!rows.length || !token || (await sha256(token)) !== rows[0].token_hash)
    return u.error('No tienes acceso a este resultado.', 403);

  const f = rows[0];
  if (accion === 'borrar') {
    await db.query('DELETE FROM resultados WHERE id = $1', [id]);
    return u.json({ ok: true });
  }
  delete f.token_hash;
  return u.json({ resultado: f });
}

/* ─────────── Panel del profesor ─────────── */

async function autorizarAdmin(request, env, u) {
  if (!env.ADMIN_CLAVE || env.ADMIN_CLAVE.length < 12)
    return u.error('El panel del profesor no está configurado (falta ADMIN_CLAVE).', 503);

  const kv = env.LIMITES;
  const ip = request.headers.get('CF-Connecting-IP') || 'desconocida';
  const claveFallos = `admin-fallos:${ip}`;
  const fallos = kv ? parseInt((await kv.get(claveFallos)) || '0', 10) : 0;
  if (fallos >= 10) return u.error('Demasiados intentos fallidos. Espera una hora.', 429);

  const cabecera = request.headers.get('Authorization') || '';
  const dada = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
  // Comparación en tiempo constante (sobre los resúmenes, de igual longitud).
  const [a, b] = await Promise.all([sha256(dada), sha256(env.ADMIN_CLAVE)]);
  let distinto = 0;
  for (let i = 0; i < a.length; i++) distinto |= a.charCodeAt(i) ^ b.charCodeAt(i);
  if (distinto !== 0 || !dada) {
    if (kv) await kv.put(claveFallos, String(fallos + 1), { expirationTtl: 3600 });
    return u.error('Clave de profesor incorrecta.', 401);
  }
  return null;
}

async function rutaAdmin(request, env, u, partes) {
  const denegado = await autorizarAdmin(request, env, u);
  if (denegado) return denegado;
  const db = await bd(env);
  if (!db) return sinBd(u);
  const metodo = request.method;

  // /api/admin/grupos
  if (partes[0] === 'grupos' && partes.length === 1) {
    if (metodo === 'GET') {
      const { rows } = await db.query(
        `SELECT g.codigo, g.nombre, g.abierto, g.creado, count(r.id)::int AS resultados
           FROM grupos g LEFT JOIN resultados r ON r.grupo = g.codigo
          GROUP BY g.codigo ORDER BY g.creado DESC`
      );
      return u.json({ grupos: rows });
    }
    if (metodo === 'POST') {
      const body = (await leerJson(request)) || {};
      const nombre = limpiarNombre(body.nombre);
      if (nombre.length < 2) return u.error('Ponle un nombre al grupo (por ejemplo, «EMBA 2026 · grupo A»).');
      let codigo = normalizarCodigo(body.codigo) || codigoAleatorio();
      if (!CODIGO_VALIDO.test(codigo))
        return u.error('El código debe tener entre 4 y 24 caracteres: letras, números y guiones.');
      try {
        await db.query('INSERT INTO grupos (codigo, nombre) VALUES ($1, $2)', [codigo, nombre]);
      } catch (err) {
        if (err && err.code === '23505') return u.error('Ya existe un grupo con ese código.', 409);
        throw err;
      }
      return u.json({ grupo: { codigo, nombre, abierto: true } }, 201);
    }
  }

  // /api/admin/grupos/:codigo
  if (partes[0] === 'grupos' && partes.length === 2) {
    const codigo = normalizarCodigo(decodeURIComponent(partes[1]));
    if (metodo === 'PATCH') {
      const body = (await leerJson(request)) || {};
      if (typeof body.abierto !== 'boolean') return u.error('Falta el estado del grupo.');
      const r = await db.query('UPDATE grupos SET abierto = $2 WHERE codigo = $1', [codigo, body.abierto]);
      if (!r.rowCount) return u.error('Grupo no encontrado.', 404);
      return u.json({ ok: true });
    }
    if (metodo === 'DELETE') {
      const r = await db.query('DELETE FROM grupos WHERE codigo = $1', [codigo]);
      if (!r.rowCount) return u.error('Grupo no encontrado.', 404);
      return u.json({ ok: true });
    }
    if (metodo === 'GET') {
      const { rows } = await db.query(
        `SELECT id, nombre, caso_titulo, rol_nombre, dureza, hoja_rellenada, hoja_completitud,
                rubrica::float AS rubrica, resultado::float AS resultado, factor::float AS factor, puntos::float AS puntos, creado
           FROM resultados WHERE grupo = $1 ORDER BY puntos DESC, creado ASC`,
        [codigo]
      );
      return u.json({ resultados: rows });
    }
  }

  // /api/admin/resultados/:id
  if (partes[0] === 'resultados' && partes.length === 2) {
    const id = partes[1];
    if (!UUID.test(id)) return u.error('Resultado no encontrado.', 404);
    if (metodo === 'GET') {
      const { rows } = await db.query(
        `SELECT id, grupo, nombre, caso_titulo, rol_nombre, dureza, hoja, informe, puntos::float AS puntos, creado
           FROM resultados WHERE id = $1`,
        [id]
      );
      if (!rows.length) return u.error('Resultado no encontrado.', 404);
      return u.json({ resultado: rows[0] });
    }
    if (metodo === 'DELETE') {
      const r = await db.query('DELETE FROM resultados WHERE id = $1', [id]);
      if (!r.rowCount) return u.error('Resultado no encontrado.', 404);
      return u.json({ ok: true });
    }
  }

  return u.error('Ruta no encontrada.', 404);
}

/* ─────────── Enrutador ─────────── */

export async function rutaCompeticion(request, env, url, u) {
  const p = url.pathname;
  const m = request.method;

  if (p === '/api/evaluar' && m === 'POST') return handleEvaluar(request, env, u);

  let r;
  if ((r = p.match(/^\/api\/grupos\/([^/]+)$/)) && m === 'GET') return datosGrupo(request, env, u, decodeURIComponent(r[1]));
  if ((r = p.match(/^\/api\/ranking\/([^/]+)$/)) && m === 'GET') return ranking(request, env, u, decodeURIComponent(r[1]));
  if ((r = p.match(/^\/api\/resultados\/([^/]+)\/(descarga|borrar)$/)) && m === 'POST')
    return resultadoPropio(request, env, u, r[1], r[2]);

  if (p.startsWith('/api/admin/')) return rutaAdmin(request, env, u, p.slice('/api/admin/'.length).split('/').filter(Boolean));

  return null;
}

export function competicionDisponible(env) {
  return Boolean(env.BD);
}
