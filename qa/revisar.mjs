// Revisión del Centro de Marca en un navegador de verdad (07/10/2026).
//
// Recorre todas las rutas de PAGES (las lee del index.html, así una página nueva
// entra sola), en los dos temas y en cuatro anchos, y revisa:
//   1. que no haya errores de JavaScript ni de consola;
//   2. que nada desborde a lo ancho;
//   3. que no haya imágenes rotas y que cada página tenga su h1;
//   4. que los subtítulos del índice lleven a una sección que existe;
//   5. el contraste de cada texto contra su fondo real: 4,5:1, o 3:1 en texto
//      grande (24 px, o 18,66 px en negrita), como publica la página Color.
//
// Dos falsos positivos conocidos quedan afuera a propósito: el hero, que pinta con
// degradado y no tiene un color de fondo medible, y las tarjetas .demo, que fallan
// porque son la demostración de lo que no se hace.
//
// Uso, desde la raíz del repo:   node qa/revisar.mjs
// Necesita Playwright instalado fuera del repo (este sitio no tiene dependencias):
// busca 'playwright' y, si no está, el que esté instalado de forma global.
// Si Chromium no está en el lugar de siempre, se indica con CHROMIUM=/ruta.
// Sale con código 1 si encuentra algo.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, extname, resolve } from 'node:path';

const RAIZ = resolve(process.argv[2] || '.');
const ANCHOS = [1280, 430, 390, 360];
const TEMAS = ['light', 'dark'];

async function cargarPlaywright() {
  try { return await import('playwright'); }
  catch {
    const global = execSync('npm root -g').toString().trim();
    return await import(join(global, 'playwright', 'index.mjs'));
  }
}

const TIPOS = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2', '.zip':'application/zip' };

function servir() {
  const srv = createServer(async (req, res) => {
    const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const archivo = join(RAIZ, ruta === '/' ? 'index.html' : ruta);
    if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
    try {
      const datos = await readFile(archivo);
      res.writeHead(200, { 'content-type': TIPOS[extname(archivo)] || 'application/octet-stream' });
      res.end(datos);
    } catch { res.writeHead(404); res.end(); }
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const html = await readFile(join(RAIZ, 'index.html'), 'utf8');
const RUTAS = [...html.matchAll(/\{id:'(\/[^']*)'/g)].map(m => m[1]);
if (!RUTAS.length) { console.error('No encontré las rutas en PAGES de index.html.'); process.exit(1); }

const { chromium } = await cargarPlaywright();
const chromiumFijo = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const navegador = await chromium.launch(existsSync(chromiumFijo) ? { executablePath: chromiumFijo } : {});
const srv = await servir();
const base = `http://127.0.0.1:${srv.address().port}/`;

const fallas = [];
for (const tema of TEMAS) {
  for (const ancho of ANCHOS) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, colorScheme: tema });
    const pagina = await ctx.newPage();
    let errores = [];
    pagina.on('pageerror', e => errores.push(e.message));
    pagina.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
    for (const ruta of RUTAS) {
      await pagina.goto(`${base}#${ruta}`);
      await pagina.waitForLoadState('load');
      await pagina.waitForTimeout(150);
      const r = await pagina.evaluate(async (medirContraste) => {
        const out = { desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        // Las miniaturas cargan «lazy»: si no se las pide, nunca terminan. Se piden
        // todas y se espera a lo sumo 5 segundos, para que una imagen trabada se
        // reporte como rota en vez de colgar la revisión.
        const imgs = [...document.querySelectorAll('#view img')];
        imgs.forEach(i => { i.loading = 'eager'; });
        const cargas = imgs.map(i => i.complete ? null : new Promise(ok => { i.addEventListener('load', ok); i.addEventListener('error', ok); }));
        await Promise.race([Promise.all(cargas), new Promise(ok => setTimeout(ok, 5000))]);
        out.rotas = imgs.filter(i => i.naturalWidth === 0).map(i => i.getAttribute('src'));
        out.h1 = !!document.querySelector('#view h1');
        out.anclas = [...document.querySelectorAll('#rail a.sub')]
          .map(a => a.getAttribute('href').split('#')[2]).filter(id => !document.getElementById(id));
        out.contraste = [];
        if (!medirContraste) return out;
        document.querySelectorAll('details').forEach(d => { d.open = true; });
        const rgb = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
          const v = m[1].split(',').map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
        const lum = ({ r, g, b }) => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const fondo = el => {
          for (let e = el; e; e = e.parentElement) {
            const cs = getComputedStyle(e);
            if (cs.backgroundImage !== 'none') return null;           // degradado o imagen: no se puede medir
            const c = rgb(cs.backgroundColor); if (c && c.a > 0.5) return c;
          }
          return rgb(getComputedStyle(document.body).backgroundColor);
        };
        document.querySelectorAll('#view *').forEach(el => {
          if (el.closest('.demo')) return;                              // falla a propósito
          const texto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
          if (!texto) return;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const fg = rgb(cs.color), bg = fondo(el);
          if (!fg || !bg) return;
          const a = lum(fg), b = lum(bg);
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight) >= 700);
          if (ratio < (grande ? 3 : 4.5))
            out.contraste.push(`${ratio.toFixed(2)}:1 · ${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 50)}»`);
        });
        return out;
      }, ancho === 1280);
      const donde = `${ruta} · ${tema} · ${ancho} px`;
      if (r.desborde > 0) fallas.push(`${donde}: desborda ${r.desborde} px a lo ancho`);
      if (r.rotas.length) fallas.push(`${donde}: imágenes rotas ${r.rotas.join(', ')}`);
      if (!r.h1) fallas.push(`${donde}: no tiene h1`);
      if (r.anclas.length) fallas.push(`${donde}: el índice apunta a secciones que no existen: ${r.anclas.join(', ')}`);
      r.contraste.forEach(c => fallas.push(`${donde}: contraste ${c}`));
      errores.forEach(e => fallas.push(`${donde}: error ${e}`));
      errores = [];
    }
    await ctx.close();
  }
}
await navegador.close();
srv.close();

const total = RUTAS.length * TEMAS.length * ANCHOS.length;
if (fallas.length) {
  console.log(`✗ ${fallas.length} fallas en ${total} vistas (${RUTAS.length} rutas × ${TEMAS.length} temas × ${ANCHOS.length} anchos):`);
  fallas.forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log(`✓ ${total} vistas sin fallas (${RUTAS.length} rutas × ${TEMAS.length} temas × ${ANCHOS.length} anchos).`);
