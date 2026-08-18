/**
 * Negociador Implacable — servidor de la API.
 *
 * Este servicio NO sirve la web: la web vive en GitHub Pages.
 * Aquí solo está la API, que es lo que necesita guardar la clave
 * y las fichas confidenciales de los casos.
 *
 * Sin dependencias: solo Node 20 o superior.
 */

import http from 'node:http';
import api from './src/index.js';

const PUERTO = process.env.PORT || 3000;

/* ─── Contadores de uso, en memoria ───
   Render free ejecuta una sola instancia, así que basta con esto.
   Se reinician cuando el servicio se despierta: siguen frenando el uso
   normal, pero la protección definitiva es el límite de gasto de Anthropic. */

const contadores = new Map();

const almacen = {
  async get(clave) {
    const e = contadores.get(clave);
    if (!e) return null;
    if (e.caduca < Date.now()) { contadores.delete(clave); return null; }
    return e.valor;
  },
  async put(clave, valor, opciones = {}) {
    contadores.set(clave, { valor, caduca: Date.now() + (opciones.expirationTtl || 3600) * 1000 });
  },
};

setInterval(() => {
  const ahora = Date.now();
  for (const [k, v] of contadores) if (v.caduca < ahora) contadores.delete(k);
}, 10 * 60 * 1000).unref();

const env = { ...process.env, LIMITES: almacen };

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Render usa esta ruta para comprobar que el servicio está vivo.
    if (url.pathname === '/' || url.pathname === '/salud') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, servicio: 'API del Negociador Implacable' }));
      return;
    }

    if (!url.pathname.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Ruta no encontrada.' }));
      return;
    }

    const trozos = [];
    for await (const c of req) trozos.push(c);

    const cabeceras = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') cabeceras.set(k, v);
    }
    // Render pone la IP real del visitante aquí; el control de límites la espera con este nombre.
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (ip) cabeceras.set('CF-Connecting-IP', ip);

    const peticion = new Request(url.toString(), {
      method: req.method,
      headers: cabeceras,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(trozos),
    });

    const r = await api.fetch(peticion, env);
    const salida = {};
    r.headers.forEach((v, k) => { salida[k] = v; });
    res.writeHead(r.status, salida);

    if (r.body) {
      const lector = r.body.getReader();
      while (true) {
        const { done, value } = await lector.read();
        if (done) break;
        res.write(Buffer.from(value));
        if (typeof res.flush === 'function') res.flush();
      }
    }
    res.end();
  } catch (err) {
    console.error('Error del servidor:', err);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error interno del servidor.' }));
  }
});

servidor.listen(PUERTO, () => {
  console.log(`API del Negociador Implacable escuchando en el puerto ${PUERTO}`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn('AVISO: falta ANTHROPIC_API_KEY. El chat no funcionará.');
  if (!process.env.ORIGEN_PERMITIDO) console.warn('AVISO: falta ORIGEN_PERMITIDO. Cualquier web podría usar tu clave.');
});
