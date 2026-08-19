/**
 * Mapeo de rol → persona de anam.ai.
 *
 * Cada ID es una Persona ya creada en el panel de anam.ai (cara + voz).
 * Para que el avatar hable exactamente lo que genera Claude (y no lo que
 * decida el propio LLM de Anam), cada una de estas personas debe tener su
 * LLM configurado como "gestionado por el cliente" (Custom / Client managed)
 * en el panel de Anam. Si en su lugar Anam usa su propio cerebro, el avatar
 * ignorará el texto que le envía la sala y dirá otra cosa.
 *
 * Este fichero vive en el backend privado porque, aunque los IDs de persona
 * no son secretos confidenciales del caso, son parte de la configuración de
 * despliegue y así se cambian sin tocar el repositorio público.
 */

export const AVATAR_POR_ROL = {
  // Caso "Recuperar el retraso" (haizea-interna)
  pm: 'a169d2da-5d42-4f54-9eae-00696b3fd52b',
  produccion: '382494a2-d791-455b-a753-8d6c9300fd57',

  // Caso "Suministro offshore" (haizea-cliente)
  comprador: '997d4a3d-d662-4762-81bb-dd3cb3f0f035',
  vendedor: 'f620e713-6437-4a4c-82a8-2e6264e89bea',
};

export function avatarParaRol(rolId) {
  return AVATAR_POR_ROL[rolId] || null;
}
