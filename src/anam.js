/**
 * Configuración de la sesión de avatar en anam.ai.
 *
 * Antes se pedía el token solo con { personaId }. Con una persona guardada,
 * la API de Anam NO deja cambiar nada más en la sesión (ni idioma, ni saludo,
 * ni tiempos de silencio), así que el avatar:
 *   - saludaba por su cuenta en inglés al conectarse (saludo automático de Anam);
 *   - se desconectaba al rato, porque en la sala el micrófono va desactivado
 *     (disableInputAudio) y Anam interpreta ese silencio como "el usuario se
 *     ha ido" y cierra la sesión.
 *
 * Ahora se lee la persona guardada (cara, voz, modelo) y se pide una sesión
 * "efímera" con esos mismos datos más los ajustes que necesitamos:
 *   - skipGreeting: sin saludo propio; quien abre la reunión es la simulación.
 *   - languageCode 'es': castellano fijo en lugar del modo multilingüe.
 *   - llmId CUSTOMER_CLIENT_V1: el texto lo pone siempre Claude, nunca Anam.
 *   - silenceBeforeSessionEndSeconds y maxSessionLengthSeconds largos.
 *
 * Si algo falla al leer la persona, se vuelve al comportamiento anterior
 * ({ personaId }) para que el avatar siga funcionando como hasta ahora.
 *
 * Variables de entorno opcionales (Render):
 *   ANAM_SILENCIO_MAX_SEG  segundos de silencio antes de que Anam cierre (por defecto 1800, máx. 7200)
 *   ANAM_SESION_MAX_SEG    duración máxima de la sesión (por defecto 3600)
 *   ANAM_IDIOMA            código ISO 639 (por defecto 'es')
 */

const ANAM_PERSONAS = 'https://api.anam.ai/v1/personas/';

function entero(valor, porDefecto, max) {
  const v = parseInt(valor, 10);
  if (!Number.isFinite(v) || v <= 0) return porDefecto;
  return Math.min(v, max);
}

// Las personas guardadas cambian muy poco: se cachean unos minutos para no
// pedir los datos a Anam en cada sesión.
const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

async function leerPersona(personaId, env) {
  const guardada = cache.get(personaId);
  if (guardada && guardada.caduca > Date.now()) return guardada.persona;
  const r = await fetch(ANAM_PERSONAS + encodeURIComponent(personaId), {
    headers: { Authorization: `Bearer ${env.ANAM_API_KEY}` },
  });
  if (!r.ok) throw new Error(`Anam GET persona ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const persona = await r.json();
  cache.set(personaId, { persona, caduca: Date.now() + CACHE_MS });
  return persona;
}

export async function configSesionAvatar(personaId, env) {
  const silencio = entero(env.ANAM_SILENCIO_MAX_SEG, 1800, 7200);
  const duracion = entero(env.ANAM_SESION_MAX_SEG, 3600, 4 * 3600);
  const idioma = (env.ANAM_IDIOMA || 'es').trim();

  let persona;
  try {
    persona = await leerPersona(personaId, env);
  } catch (err) {
    console.error('Avatar: no se ha podido leer la persona, se usa la configuración guardada:', err.message);
    return { personaId };
  }
  const avatarId = persona.avatar && persona.avatar.id;
  const voiceId = persona.voice && persona.voice.id;
  if (!avatarId || !voiceId) {
    console.error('Avatar: la persona no tiene cara o voz; se usa la configuración guardada.');
    return { personaId };
  }

  const config = {
    name: persona.name || 'Contraparte',
    avatarId,
    voiceId,
    llmId: 'CUSTOMER_CLIENT_V1',
    skipGreeting: true,
    languageCode: idioma,
    maxSessionLengthSeconds: duracion,
    voiceDetectionOptions: {
      ...sinNulos(persona.voiceDetectionOptions),
      silenceBeforeSessionEndSeconds: silencio,
    },
  };
  if (persona.avatarModel) config.avatarModel = persona.avatarModel;
  if (persona.voiceGenerationOptions) config.voiceGenerationOptions = sinNulos(persona.voiceGenerationOptions);
  return config;
}

// La API devuelve campos a null que no acepta de vuelta al crear la sesión.
function sinNulos(obj) {
  const salida = {};
  for (const [k, v] of Object.entries(obj || {})) if (v !== null && v !== undefined) salida[k] = v;
  return salida;
}
