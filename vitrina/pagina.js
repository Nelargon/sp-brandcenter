/* Marca Salud Protegida — lo que hace la vitrina: arma las grillas (logos, errores,
   matriz, íconos, aliados), las láminas de muestra, las descargas y el taller. */
(function () {
  'use strict';
  const { SP_LOGOS, SP_ARCHIVOS_LOGO, SP_ICONOS, SP_ALIADOS, SP_MATRIZ, SP_MAL } = window.SP_MARCA;
  const T = window.SP_TALLER;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let tiempoToast = null;
  function aviso(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(tiempoToast); tiempoToast = setTimeout(() => { t.hidden = true; }, 3200);
  }

  /* El logo vive en un solo lugar: toda imagen con data-logo lo toma de SP_LOGOS */
  document.querySelectorAll('img[data-logo]').forEach(img => {
    const l = SP_LOGOS[img.dataset.logo]; if (l && img.getAttribute('src') !== l.src) img.src = l.src;
  });

  /* Logos: los 18 archivos, cada uno para bajar suelto */
  const ficha = ([archivo, mini, nombre, uso, fondo]) =>
    '<div class="logo-ficha"><div class="lienzo ' + fondo + '"><img src="' + (mini ? 'assets/miniaturas/' + mini : 'assets/logos/' + archivo) + '" alt="' + esc(nombre) + '" loading="lazy"></div>'
    + '<div class="pie"><b>' + esc(nombre) + '</b><span>' + esc(uso) + '</span><span class="nombre">' + esc(archivo) + '</span>'
    + '<button class="btn btn-chico btn-2" data-bajar="assets/logos/' + archivo + '">Bajar</button></div></div>';
  const logos = $('#logos'), logosMas = $('#logos-mas');
  if (logos) logos.innerHTML = SP_ARCHIVOS_LOGO.slice(0, 4).map(ficha).join('');
  if (logosMas) logosMas.innerHTML = SP_ARCHIVOS_LOGO.slice(4).map(ficha).join('');

  /* Los once errores, recreados sobre el logo real */
  const mal = $('#mal'), iso = 'assets/logos/SP_Isologotipo_Fullcolor_RGB.png';
  if (mal) mal.innerHTML = SP_MAL.map(([k, t, s]) => {
    let dentro = '<img src="' + iso + '" alt="">';
    if (k === 'outline') dentro = '<img src="assets/logos/SP_Isologotipo_Navy_RGB.png" alt="">';
    if (k === 'over') dentro += '<b>20% OFF</b>';
    if (k === 'box') dentro = '<span><img src="' + iso + '" alt=""></span>';
    if (k === 'lockup') dentro = '<span><img src="' + iso + '" alt="">| FAMILIA</span>';
    if (k === 'pattern') dentro = '';
    const fondo = k === 'pattern' ? ' style="background-image:url(assets/miniaturas/SP_Isotipo_Turquesa_RGB_mini.png)"' : '';
    return '<figure><div class="escena x-' + k + '"' + fondo + '><span class="asi-no">Así no</span>' + dentro + '</div><figcaption>' + esc(t) + '<span>' + esc(s) + '</span></figcaption></figure>';
  }).join('');

  /* La matriz de uso */
  const matriz = $('#matriz');
  const ESTADO = { si: ['e-si', 'Preferido'], ok: ['e-ok', 'Permitido'], no: ['e-no', 'No usar'], gap: ['e-gap', 'Falta archivo'] };
  if (matriz) matriz.innerHTML = '<thead><tr><th>Dónde</th>' + SP_MATRIZ.cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>'
    + SP_MATRIZ.rows.map(r => '<tr><td>' + esc(r[0]) + '</td>' + r.slice(1).map(v => '<td><span class="estado ' + ESTADO[v][0] + '">' + ESTADO[v][1] + '</span></td>').join('') + '</tr>').join('') + '</tbody>';

  /* Los 26 íconos */
  const iconos = $('#iconos-grilla');
  if (iconos) iconos.innerHTML = SP_ICONOS.map(([a, n, u]) =>
    '<button type="button" class="ico-ficha" data-bajar="assets/iconos/SP_Icono_' + a + '.svg" aria-label="Bajar SP_Icono_' + a + '.svg: ' + esc(u) + '">'
    + '<img src="assets/iconos/SP_Icono_' + a + '.svg" alt="" loading="lazy"><b>' + esc(n) + '</b><span>' + esc(u) + '</span></button>').join('');

  /* Los aliados */
  const aliados = $('#aliados');
  if (aliados) aliados.innerHTML = SP_ALIADOS.map(([a, n]) =>
    '<figure><img src="assets/aliados/' + a + '.webp" alt="' + esc(n) + '" loading="lazy"><figcaption>' + esc(n) + '</figcaption></figure>').join('');

  /* Copiar un código de color */
  document.addEventListener('click', async e => {
    const b = e.target.closest('.copiar-hex'); if (!b) return;
    const ok = await T.copiar(b.dataset.hex);
    aviso(ok ? 'Copiado: ' + b.dataset.hex : 'Copialo a mano: ' + b.dataset.hex);
  });

  /* Descargas: los archivos publicados junto a la página */
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-bajar]'); if (!b) return;
    const ruta = b.dataset.bajar, nombre = ruta.split('/').pop();
    b.disabled = true;
    try {
      const r = await fetch(ruta);
      if (!r.ok) throw new Error(r.status);
      const res = await T.guardar(nombre, await r.blob());
      aviso(res.msg);
    } catch (err) { aviso('No se pudo bajar ' + nombre + '.'); }
    finally { b.disabled = false; }
  });

  /* La palabra a un toque y las opciones planas */
  const term = $('#term-demo'), burbuja = $('#burbuja-demo');
  if (term) term.addEventListener('click', () => { const abierta = burbuja.hidden; burbuja.hidden = !abierta; term.setAttribute('aria-expanded', String(abierta)); });
  const ops = $('#opciones-demo');
  if (ops) ops.addEventListener('click', e => {
    const b = e.target.closest('.opcion'); if (!b) return;
    ops.querySelectorAll('.opcion').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  });

  /* Las láminas de muestra, dibujadas con el mismo motor del taller */
  const MUESTRAS = {
    'portada-presentar': ['portada', { modo: 'presentar', rotulo: 'Charla interna', titulo: 'Cómo hablamos con una familia', destacado: 'con una familia', subtitulo: 'Equipo de Salud Protegida' }],
    'portada-leer': ['portada', { modo: 'leer', rotulo: 'Informe mensual', titulo: 'Instagram en agosto', destacado: '', subtitulo: 'Pauta y feed, del 1 al 31 de agosto' }],
    'dato': ['dato', {}],
    'idea': ['idea', {}],
  };
  document.querySelectorAll('canvas[data-lamina]').forEach(c => {
    const m = MUESTRAS[c.dataset.lamina]; if (!m) return;
    T.dibujar(c, 'diapositiva', m[0], m[1]).catch(() => {});
  });

  /* El taller */
  const app = $('#taller-app');
  if (app) {
    const taller = T.iniciar(app, aviso);
    document.querySelectorAll('[data-ir-formato]').forEach(a => a.addEventListener('click', () => taller.ir(a.dataset.irFormato)));
  }
})();
