/**
 * Firma de la conversación.
 *
 * El navegador guarda el historial y lo reenvía en cada turno. Sin más,
 * cualquiera podría inventarse una conversación (con la contraparte
 * cediendo en todo) y mandarla a evaluar para la competición.
 *
 * Para impedirlo, cada vez que la simulación termina una intervención el
 * servidor firma (HMAC-SHA256) el historial completo hasta ese punto, junto
 * con el caso, el rol, la dureza y el modo. El navegador devuelve esa firma
 * en el turno siguiente; el servidor la comprueba antes de seguir firmando.
 * Así, una conversación con una sola intervención de la simulación alterada
 * o inventada pierde la firma y no puede puntuar.
 *
 * No hace falta guardar nada en el servidor: la firma viaja con el historial.
 */

const codificador = new TextEncoder();
const cacheClaves = new Map();

function secreto(env) {
  if (env.FIRMA_SECRETO) return env.FIRMA_SECRETO;
  // Si no se define un secreto propio, se deriva de la clave de Anthropic
  // (que ya es secreta y solo vive en el servidor). Cambiarla invalida las
  // negociaciones a medias, nada más.
  if (env.ANTHROPIC_API_KEY) return 'negociador-firma:' + env.ANTHROPIC_API_KEY;
  return null;
}

async function clave(env) {
  const s = secreto(env);
  if (!s) return null;
  if (!cacheClaves.has(s)) {
    const material = await crypto.subtle.digest('SHA-256', codificador.encode(s));
    cacheClaves.set(
      s,
      crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
    );
  }
  return cacheClaves.get(s);
}

function contenido({ casoId, rolId, dureza, modo, mensajes }) {
  return codificador.encode(
    JSON.stringify({
      v: 1,
      casoId,
      rolId,
      dureza: Number(dureza),
      modo,
      mensajes: mensajes.map((m) => [m.role, m.content]),
    })
  );
}

const aBase64Url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const deBase64Url = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(Buffer.from(b64 + '='.repeat((4 - (b64.length % 4)) % 4), 'base64'));
};

export async function firmar(env, datos) {
  const k = await clave(env);
  if (!k) return null;
  const sig = await crypto.subtle.sign('HMAC', k, contenido(datos));
  return aBase64Url(sig);
}

export async function verificar(env, datos, firma) {
  if (typeof firma !== 'string' || !firma || firma.length > 200) return false;
  const k = await clave(env);
  if (!k) return false;
  try {
    return await crypto.subtle.verify('HMAC', k, deBase64Url(firma), contenido(datos));
  } catch {
    return false;
  }
}

/** Índice del último mensaje de la simulación, o -1 si no hay ninguno. */
export function ultimoDeLaSimulacion(mensajes) {
  for (let i = mensajes.length - 1; i >= 0; i--) if (mensajes[i].role === 'assistant') return i;
  return -1;
}
