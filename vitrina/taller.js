/* El taller de Marca Salud Protegida: piezas de SP al tamaño real, en un canvas.
   Lo que se ve en la vista previa es exactamente lo que se baja.

   Cómo está armado:
   - FORMATOS: cada formato (post, historia, diapositiva, membrete…) con su medida,
     sus plantillas y cómo sale (PNG, PDF, HTML o texto).
   - PLANTILLAS: los campos de cada una y la función que la dibuja.
   - revisar(): las reglas de la marca aplicadas al texto. Lo que «frena» deshabilita
     la descarga; lo que hay que «mirar» se avisa y no frena.
   - La capa interna suma formatos con SP_TALLER.registrar() antes de iniciar().
   Depende de vitrina/marca.js (logos, íconos, colores y contacto). */
(function () {
  'use strict';
  const { SP_LOGOS, SP_ICONOS, SP_CONTACTO, SP_COLOR: C } = window.SP_MARCA;

  /* ---------- recursos ---------- */
  const cache = {};
  function cargarImg(src) {
    if (!cache[src]) cache[src] = new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => { delete cache[src]; mal(new Error('No cargó ' + src)); };
      i.src = src;
    });
    return cache[src];
  }
  const imgLogo = k => cargarImg(SP_LOGOS[k].src);
  const imgIcono = n => cargarImg('assets/iconos/SP_Icono_' + n + '.svg');
  let fuentesListas = null;
  function fuentes() {
    if (!fuentesListas) {
      const pedidos = ['700', '800', '900'].map(p => p + ' 40px "Nunito Sans"').concat(['400', '500', '600'].map(p => p + ' 40px Inter'));
      fuentesListas = Promise.all(pedidos.map(f => document.fonts.load(f))).catch(() => null);
    }
    return fuentesListas;
  }

  /* ---------- dibujo ---------- */
  const FUENTE = {
    d: (peso, tam) => peso + ' ' + tam + 'px "Nunito Sans", "Segoe UI", sans-serif',
    l: (peso, tam) => peso + ' ' + tam + 'px Inter, system-ui, sans-serif',
  };
  const MM = 300 / 25.4; // píxeles por milímetro a 300 dpi

  /* Escribe un bloque de texto con salto de línea, una frase destacada en otro color y
     achique automático hasta `min` si no entra en `max` líneas. o.medir: solo mide. */
  function texto(ctx, o) {
    let t = String(o.t || '').replace(/\s+/g, ' ').trim();
    if (o.mayus) t = t.toLocaleUpperCase('es');
    if (!t) return { alto: 0, lineas: 0, ok: true, tam: o.tam };
    const min = o.min || o.tam;
    let tam = o.tam, lineas, ok = true;
    const dest = String(o.dest || '').replace(/\s+/g, ' ').trim();
    const tBaja = t.toLocaleLowerCase('es');
    const ini = dest ? tBaja.indexOf(dest.toLocaleLowerCase('es')) : -1;
    const fin = ini >= 0 ? ini + dest.length : -1;
    const toks = [];
    t.replace(/\S+/g, (m, off) => { toks.push({ p: m, a: off, b: off + m.length }); return m; });
    const esp = o.espaciado || 0;
    const medir = s => ctx.measureText(s).width + (esp ? esp * tam * Math.max(0, s.length - 1) : 0);
    for (;;) {
      ctx.font = FUENTE[o.fam](o.peso, tam);
      lineas = []; let actual = [];
      for (const k of toks) {
        const prueba = actual.concat(k).map(x => x.p).join(' ');
        if (actual.length && medir(prueba) > o.w) { lineas.push(actual); actual = [k]; } else actual.push(k);
      }
      if (actual.length) lineas.push(actual);
      const anchoMax = Math.max.apply(null, lineas.map(l => medir(l.map(x => x.p).join(' '))));
      if ((!o.max || lineas.length <= o.max) && anchoMax <= o.w + 1) break;
      if (tam <= min) { ok = false; break; }
      tam = Math.max(min, tam - Math.max(1, Math.round(tam * 0.04)));
    }
    const lh = Math.round(tam * (o.lh || 1.2));
    const visibles = o.max ? lineas.slice(0, o.max) : lineas;
    if (!o.medir) {
      ctx.textBaseline = 'alphabetic';
      let y = o.y + Math.round((lh - tam) / 2 + tam * 0.8);
      for (const l of visibles) {
        const anchoL = medir(l.map(x => x.p).join(' '));
        let x = o.alin === 'center' ? o.x + (o.w - anchoL) / 2 : o.alin === 'right' ? o.x + o.w - anchoL : o.x;
        for (const k of l) {
          const enDest = ini >= 0 && k.a >= ini && k.b <= fin + 1;
          ctx.fillStyle = enDest ? (o.colorDest || o.color) : o.color;
          if (esp) {
            for (const ch of k.p) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + esp * tam; }
            x += ctx.measureText(' ').width;
          } else {
            ctx.fillText(k.p, x, y);
            x += ctx.measureText(k.p + ' ').width;
          }
        }
        y += lh;
      }
    }
    return { alto: lh * visibles.length, lineas: visibles.length, ok: ok && (!o.max || lineas.length <= o.max), tam };
  }

  function caja(ctx, x, y, w, h, r, color) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    ctx.fillStyle = color; ctx.fill();
  }
  function boton(ctx, t, x, y, h, fondo, color) {
    ctx.font = FUENTE.d(800, Math.round(h * 0.36));
    const w = Math.round(ctx.measureText(t).width + h * 0.9);
    caja(ctx, x, y, w, h, Math.round(h * 0.24), fondo);
    ctx.fillStyle = color; ctx.textBaseline = 'middle';
    ctx.fillText(t, x + h * 0.45, y + h / 2 + h * 0.02);
    ctx.textBaseline = 'alphabetic';
    return w;
  }
  async function logo(ctx, k, x, y, w) {
    const img = await imgLogo(k);
    const h = Math.round(w * img.naturalHeight / img.naturalWidth);
    ctx.drawImage(img, x, y, w, h);
    return h;
  }
  async function icono(ctx, nombre, x, y, s) {
    if (!nombre) return;
    const img = await imgIcono(nombre);
    ctx.drawImage(img, x, y, s, s);
  }
  function guia(ctx, x, y, w, h, color) { // solo en la vista previa
    ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.strokeRect(x, y, w, h); ctx.restore();
  }

  /* Los fondos posibles de una pieza. El logo y los colores del texto los decide el fondo */
  const TEMAS = {
    navy:     { nombre: 'Azul marino', bg: C.navyDeep, tit: C.blanco, dest: C.mint, txt: C.blueIce, sec: C.blueSoft, logo: 'isologo-blanco', btnBg: C.tealDeep, btnTx: C.blanco, card: C.blanco },
    menta:    { nombre: 'Menta', bg: C.mintBg, tit: C.navy, dest: C.tealDeep, txt: C.text, sec: C.tealInk, logo: 'isologo-color', btnBg: C.tealDeep, btnTx: C.blanco, card: C.blanco },
    blanco:   { nombre: 'Blanco', bg: C.blanco, tit: C.navy, dest: C.tealDeep, txt: C.text, sec: C.muted, logo: 'isologo-color', btnBg: C.tealDeep, btnTx: C.blanco, card: C.mintSoft },
    turquesa: { nombre: 'Turquesa', bg: C.teal, tit: C.navyDeep, dest: C.navyDeep, txt: C.navyDeep, sec: C.navyDeep, logo: 'isologo-blanco', btnBg: C.navyDeep, btnTx: C.blanco, card: C.blanco },
  };
  const opcionesFondo = ids => ids.map(id => [id, TEMAS[id].nombre]);

  /* Los textos de botón permitidos (uno solo para ir al simulador: «Simulá tu plan») */
  const CTAS = [['Simulá tu plan', 'Simulá tu plan'], ['Escribinos por WhatsApp', 'Escribinos por WhatsApp'], ['Buscá tu médico', 'Buscá tu médico'], ['', 'Sin botón']];
  const ICONOS = [['', 'Sin ícono']].concat(SP_ICONOS.map(i => [i[0], i[1]]));

  /* Zonas seguras: la historia de Instagram tapa arriba y abajo con su propia interfaz */
  function zonas(f, W, H) {
    const m = Math.round(Math.min(W, H) * 0.074);
    if (f === 'historia') return { m, arriba: 250, abajo: 330 };
    return { m, arriba: m, abajo: m };
  }

  /* ---------- plantillas de redes y web ---------- */
  async function dibTitular(ctx, W, H, d, f, av) {
    const T = TEMAS[d.fondo] || TEMAS.navy, z = zonas(f, W, H), ancho = f === 'compartir';
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    const logoW = ancho ? 260 : Math.round(W * 0.3);
    const logoH = await logo(ctx, T.logo, z.m, z.arriba, logoW);
    const s = ancho ? 210 : Math.round(Math.min(W, H) * 0.13);
    if (ancho) await icono(ctx, d.icono, W - z.m - s, (H - s) / 2, s);
    else await icono(ctx, d.icono, W - z.m - s, z.arriba - Math.round(s * 0.08), s);
    const w = ancho ? W - 2 * z.m - s - 60 : W - 2 * z.m - Math.round(W * 0.04);
    const btnH = ancho ? 0 : Math.round(W * 0.088);
    const pieY = H - z.abajo - (btnH || Math.round(H * 0.06));
    let y = z.arriba + logoH + Math.round(ancho ? H * 0.09 : H * 0.1);
    const titTam = { post: 108, historia: 112, cuadrado: 100, compartir: 76 }[f] || 100;
    const r1 = texto(ctx, { t: sinPunto(d.titulo), x: z.m, y, w, fam: 'd', peso: 800, tam: titTam, min: Math.round(titTam * 0.62), lh: 1.06, max: ancho ? 3 : 4, color: T.tit, dest: d.destacado, colorDest: T.dest });
    if (!r1.ok) av.push(['frena', 'El título no entra: acortalo.']);
    y += r1.alto + Math.round(r1.tam * 0.45);
    const bajTam = ancho ? 30 : Math.round(W * 0.037);
    const r2 = texto(ctx, { t: d.bajada, x: z.m, y, w: ancho ? w : w - Math.round(W * 0.06), fam: 'l', peso: 400, tam: bajTam, min: Math.round(bajTam * 0.85), lh: 1.45, max: f === 'cuadrado' || ancho ? 3 : 4, color: T.txt });
    if (!r2.ok) av.push(['frena', 'La bajada no entra: acortala.']);
    if (y + r2.alto > pieY - 24) av.push(['frena', 'El texto se pisa con el pie de la pieza: acortá el título o la bajada.']);
    if (ancho) {
      ctx.font = FUENTE.l(600, 24); ctx.fillStyle = T.sec; ctx.fillText(SP_CONTACTO.web, z.m, H - z.m);
    } else {
      let x = z.m;
      if (d.cta) x += boton(ctx, d.cta, z.m, H - z.abajo - btnH, btnH, T.btnBg, T.btnTx) + 28;
      ctx.font = FUENTE.l(600, Math.round(W * 0.031)); ctx.fillStyle = T.sec; ctx.textBaseline = 'middle';
      const web = SP_CONTACTO.web, ww = ctx.measureText(web).width;
      ctx.fillText(web, Math.max(x, W - z.m - ww), H - z.abajo - btnH / 2);
      ctx.textBaseline = 'alphabetic';
    }
  }

  async function dibCifra(ctx, W, H, d, f, av) {
    const T = TEMAS[d.fondo] || TEMAS.blanco, z = zonas(f, W, H), ancho = f === 'compartir';
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    const logoH = await logo(ctx, T.logo, z.m, z.arriba, ancho ? 240 : Math.round(W * 0.27));
    const s = ancho ? 160 : Math.round(Math.min(W, H) * 0.12);
    await icono(ctx, d.icono, W - z.m - s, z.arriba - Math.round(s * 0.08), s);
    const w = W - 2 * z.m;
    let y = z.arriba + logoH + Math.round(H * (ancho ? 0.06 : 0.09));
    const cTam = ancho ? 170 : { post: 300, historia: 330, cuadrado: 250 }[f] || 260;
    const r1 = texto(ctx, { t: d.cifra, x: z.m, y, w, fam: 'd', peso: 900, tam: cTam, min: Math.round(cTam * 0.5), lh: 1, max: 1, color: T.dest });
    if (!r1.ok) av.push(['frena', 'La cifra es muy larga: tiene que entrar en una línea.']);
    y += r1.alto + Math.round(cTam * 0.12);
    const qTam = ancho ? 40 : Math.round(W * 0.062);
    const r2 = texto(ctx, { t: sinPunto(d.que), x: z.m, y, w, fam: 'd', peso: 800, tam: qTam, min: Math.round(qTam * 0.75), lh: 1.12, max: ancho ? 2 : 3, color: T.tit });
    if (!r2.ok) av.push(['frena', 'Lo que dice la cifra no entra: acortalo.']);
    y += r2.alto + Math.round(qTam * 0.5);
    const eTam = ancho ? 24 : Math.round(W * 0.035);
    const r3 = texto(ctx, { t: d.explicacion, x: z.m, y, w: w - Math.round(W * 0.06), fam: 'l', peso: 400, tam: eTam, min: Math.round(eTam * 0.85), lh: 1.45, max: ancho ? 2 : 4, color: T.txt });
    if (!r3.ok) av.push(['frena', 'La explicación no entra: acortala.']);
    const pieTam = ancho ? 20 : Math.round(W * 0.024);
    const pieY = H - z.abajo - pieTam * 2.6;
    if (y + r3.alto > pieY - 16) av.push(['frena', 'El texto se pisa con la fuente: acortá algo.']);
    texto(ctx, { t: d.fuente ? 'Fuente: ' + d.fuente : 'Fuente: falta', x: z.m, y: pieY, w: w * 0.62, fam: 'l', peso: 500, tam: pieTam, lh: 1.3, max: 2, color: T.sec });
    ctx.font = FUENTE.l(600, pieTam); ctx.fillStyle = T.sec;
    ctx.fillText(SP_CONTACTO.web, W - z.m - ctx.measureText(SP_CONTACTO.web).width, H - z.abajo - pieTam * 0.4);
  }

  async function dibPregunta(ctx, W, H, d, f, av) {
    const T = TEMAS[d.fondo] || TEMAS.menta, z = zonas(f, W, H);
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    const logoH = await logo(ctx, T.logo, z.m, z.arriba, Math.round(W * 0.27));
    const s = Math.round(Math.min(W, H) * 0.12);
    await icono(ctx, d.icono, W - z.m - s, z.arriba - Math.round(s * 0.08), s);
    const w = W - 2 * z.m;
    let y = z.arriba + logoH + Math.round(H * 0.08);
    const pTam = { post: 92, historia: 96, cuadrado: 84 }[f] || 88;
    const r1 = texto(ctx, { t: d.pregunta, x: z.m, y, w, fam: 'd', peso: 800, tam: pTam, min: Math.round(pTam * 0.65), lh: 1.08, max: 4, color: T.tit, dest: d.destacado, colorDest: T.dest });
    if (!r1.ok) av.push(['frena', 'La pregunta no entra: acortala.']);
    y += r1.alto + Math.round(pTam * 0.5);
    const btnH = Math.round(W * 0.088);
    const limite = H - z.abajo - (d.cta ? btnH + 40 : 0);
    const pad = Math.round(W * 0.05), rTam = Math.round(W * 0.039);
    const med = texto(ctx, { t: d.respuesta, x: 0, y: 0, w: w - 2 * pad, fam: 'l', peso: 400, tam: rTam, min: Math.round(rTam * 0.8), lh: 1.45, max: f === 'cuadrado' ? 4 : 7, color: C.text, medir: true });
    const altoCaja = med.alto + 2 * pad;
    if (!med.ok || y + altoCaja > limite) av.push(['frena', 'La respuesta no entra: acortala.']);
    caja(ctx, z.m, y, w, altoCaja, 32, T.card);
    texto(ctx, { t: d.respuesta, x: z.m + pad, y: y + pad, w: w - 2 * pad, fam: 'l', peso: 400, tam: rTam, min: Math.round(rTam * 0.8), lh: 1.45, max: f === 'cuadrado' ? 4 : 7, color: C.text });
    if (d.cta) boton(ctx, d.cta, z.m, H - z.abajo - btnH, btnH, T.btnBg, T.btnTx);
  }

  async function dibCita(ctx, W, H, d, f, av) {
    const T = TEMAS[d.fondo] || TEMAS.menta, z = zonas(f, W, H);
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    const logoH = await logo(ctx, T.logo, z.m, z.arriba, Math.round(W * 0.27));
    const w = W - 2 * z.m;
    let y = z.arriba + logoH + Math.round(H * 0.06);
    ctx.font = FUENTE.d(900, Math.round(W * 0.26)); ctx.fillStyle = T.dest;
    ctx.fillText('“', z.m - Math.round(W * 0.01), y + Math.round(W * 0.2));
    y += Math.round(W * 0.2);
    const cTam = { post: 54, historia: 58, cuadrado: 48 }[f] || 52;
    const vacia = !String(d.cita || '').trim();
    const r = texto(ctx, { t: vacia ? 'La frase del cliente, textual' : d.cita, x: z.m, y, w, fam: 'l', peso: 500, tam: cTam, min: Math.round(cTam * 0.72), lh: 1.38, max: f === 'cuadrado' ? 5 : 7, color: vacia ? T.sec : T.tit });
    if (!r.ok) av.push(['frena', 'La cita no entra: si hay que cortarla, se corta con su dueño.']);
    y += r.alto + Math.round(cTam * 0.9);
    texto(ctx, { t: d.autor || 'Nombre de quien lo dijo', x: z.m, y, w, fam: 'd', peso: 800, tam: Math.round(W * 0.036), lh: 1.2, max: 1, color: d.autor ? T.tit : T.sec });
    y += Math.round(W * 0.05);
    texto(ctx, { t: d.rol, x: z.m, y, w, fam: 'l', peso: 400, tam: Math.round(W * 0.028), lh: 1.3, max: 2, color: T.sec });
    if (y + Math.round(W * 0.05) > H - z.abajo) av.push(['frena', 'El texto se sale de la pieza: acortá la cita.']);
  }

  /* ---------- diapositivas (1920 × 1080, márgenes de 128 px, nada por debajo de 24 px) ---------- */
  const DM = 128;
  function pieLamina(ctx, W, H, d, color) {
    ctx.font = FUENTE.l(500, 24); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
    if (d.fuente) ctx.fillText('Fuente: ' + d.fuente, DM, H - 64);
    if (d.pagina) { ctx.font = FUENTE.l(500, 24); const p = d.pagina; ctx.fillText(p, W - DM - ctx.measureText(p).width, H - 64); }
  }
  async function dibPortada(ctx, W, H, d, f, av) {
    const leer = d.modo === 'leer';
    ctx.fillStyle = leer ? C.blanco : C.navy; ctx.fillRect(0, 0, W, H);
    await logo(ctx, leer ? 'isologo-color' : 'isologo-blanco', DM, DM, 360);
    const w = W - 2 * DM;
    const sub = texto(ctx, { t: d.subtitulo, x: DM, y: 0, w, fam: 'l', peso: 400, tam: 40, lh: 1.3, max: 1, medir: true });
    const tit = texto(ctx, { t: sinPunto(d.titulo), x: DM, y: 0, w, fam: 'd', peso: 800, tam: 96, min: 72, lh: 1.05, max: 2, medir: true });
    const rot = texto(ctx, { t: d.rotulo, x: DM, y: 0, w, fam: 'd', peso: 700, tam: 32, lh: 1.2, max: 1, mayus: true, espaciado: 0.12, medir: true });
    if (!tit.ok) av.push(['frena', 'El título de la portada tiene que entrar en dos líneas.']);
    if (!sub.ok) av.push(['frena', 'El subtítulo tiene que entrar en una línea.']);
    let y = H - DM - sub.alto;
    texto(ctx, { t: d.subtitulo, x: DM, y, w, fam: 'l', peso: 400, tam: 40, lh: 1.3, max: 1, color: leer ? C.muted : C.blueSoft });
    y -= tit.alto + 24;
    texto(ctx, { t: sinPunto(d.titulo), x: DM, y, w, fam: 'd', peso: 800, tam: 96, min: 72, lh: 1.05, max: 2, color: leer ? C.navy : C.blanco, dest: d.destacado, colorDest: leer ? C.tealDeep : C.mint });
    y -= rot.alto + 20;
    texto(ctx, { t: d.rotulo, x: DM, y, w, fam: 'd', peso: 700, tam: 32, lh: 1.2, max: 1, mayus: true, espaciado: 0.12, color: leer ? C.teal900 : C.mint });
  }
  async function dibSeparador(ctx, W, H, d, f, av) {
    ctx.fillStyle = C.navyDeep; ctx.fillRect(0, 0, W, H);
    let y = H / 2 - 150;
    if (d.numero) { texto(ctx, { t: d.numero, x: DM, y: y - 120, w: 600, fam: 'd', peso: 900, tam: 200, lh: 1, max: 1, color: C.mint }); y += 110; }
    const r = texto(ctx, { t: sinPunto(d.titulo), x: DM, y, w: W - 2 * DM, fam: 'd', peso: 800, tam: 96, min: 64, lh: 1.06, max: 2, color: C.blanco });
    if (!r.ok) av.push(['frena', 'El título del separador tiene que entrar en dos líneas.']);
  }
  async function dibIdea(ctx, W, H, d, f, av) {
    ctx.fillStyle = C.blanco; ctx.fillRect(0, 0, W, H);
    const w = W - 2 * DM;
    const o1 = { t: sinPunto(d.frase), x: DM, y: 0, w, fam: 'd', peso: 800, tam: 96, min: 64, lh: 1.08, max: 4, color: C.navy, dest: d.destacado, colorDest: C.tealDeep };
    const o2 = { t: d.bajada, x: DM, y: 0, w: w * 0.8, fam: 'l', peso: 400, tam: 40, min: 32, lh: 1.45, max: 3, color: C.text };
    const m1 = texto(ctx, Object.assign({}, o1, { medir: true })), m2 = texto(ctx, Object.assign({}, o2, { medir: true }));
    const y0 = Math.max(DM, Math.round((H - m1.alto - (m2.alto ? m2.alto + 48 : 0)) / 2) - 30);
    const r = texto(ctx, Object.assign(o1, { y: y0 }));
    if (!r.ok) av.push(['frena', 'La frase no entra: una lámina, una idea.']);
    const r2 = texto(ctx, Object.assign(o2, { y: y0 + r.alto + 48 }));
    if (!r2.ok) av.push(['frena', 'La bajada no entra: lo demás lo dice quien presenta.']);
    pieLamina(ctx, W, H, d, C.muted);
  }
  async function dibDato(ctx, W, H, d, f, av) {
    ctx.fillStyle = C.blanco; ctx.fillRect(0, 0, W, H);
    const w = W - 2 * DM;
    let y = DM + 10;
    const r1 = texto(ctx, { t: d.cifra, x: DM, y, w, fam: 'd', peso: 900, tam: 300, min: 160, lh: 1, max: 1, color: C.tealDeep });
    if (!r1.ok) av.push(['frena', 'La cifra tiene que entrar en una línea.']);
    y += r1.alto + 36;
    const r2 = texto(ctx, { t: sinPunto(d.que), x: DM, y, w, fam: 'd', peso: 800, tam: 64, min: 48, lh: 1.12, max: 2, color: C.navy });
    if (!r2.ok) av.push(['frena', 'Lo que dice la cifra tiene que entrar en dos líneas.']);
    y += r2.alto + 28;
    const r3 = texto(ctx, { t: d.explicacion, x: DM, y, w: w * 0.8, fam: 'l', peso: 400, tam: 40, min: 32, lh: 1.45, max: 2, color: C.text });
    if (!r3.ok || y + r3.alto > H - 110) av.push(['frena', 'La explicación no entra: acortala.']);
    pieLamina(ctx, W, H, Object.assign({}, d, { fuente: d.fuente || 'falta' }), C.muted);
  }
  async function dibCitaLamina(ctx, W, H, d, f, av) {
    ctx.fillStyle = C.mintBg; ctx.fillRect(0, 0, W, H);
    ctx.font = FUENTE.d(900, 300); ctx.fillStyle = C.tealDeep; ctx.fillText('“', DM - 16, DM + 210);
    const vacia = !String(d.cita || '').trim();
    const r = texto(ctx, { t: vacia ? 'La frase del cliente, textual' : d.cita, x: DM, y: DM + 250, w: W - 2 * DM - 200, fam: 'l', peso: 500, tam: 56, min: 40, lh: 1.35, max: 4, color: vacia ? C.tealInk : C.navy });
    if (!r.ok) av.push(['frena', 'La cita no entra en cuatro líneas.']);
    const y = DM + 250 + r.alto + 48;
    texto(ctx, { t: d.autor || 'Nombre de quien lo dijo', x: DM, y, w: 1200, fam: 'd', peso: 800, tam: 40, lh: 1.2, max: 1, color: d.autor ? C.navy : C.tealInk });
    texto(ctx, { t: d.rol, x: DM, y: y + 56, w: 1200, fam: 'l', peso: 400, tam: 32, lh: 1.3, max: 1, color: C.tealInk });
    pieLamina(ctx, W, H, d, C.tealInk);
  }
  async function dibImpacto(ctx, W, H, d, f, av) {
    ctx.fillStyle = C.teal; ctx.fillRect(0, 0, W, H);
    const med = texto(ctx, { t: sinPunto(d.frase), x: DM, y: 0, w: W - 2 * DM, fam: 'd', peso: 800, tam: 120, min: 80, lh: 1.06, max: 3, medir: true });
    if (!med.ok) av.push(['frena', 'La frase de impacto tiene que entrar en tres líneas.']);
    texto(ctx, { t: sinPunto(d.frase), x: DM, y: (H - med.alto) / 2, w: W - 2 * DM, fam: 'd', peso: 800, tam: 120, min: 80, lh: 1.06, max: 3, color: C.navyDeep });
  }
  async function dibCierre(ctx, W, H, d, f, av) {
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
    await logo(ctx, 'isologo-blanco', DM, DM, 360);
    const w = W - 2 * DM;
    const r2 = texto(ctx, { t: d.gracias, x: DM, y: 0, w, fam: 'l', peso: 400, tam: 40, lh: 1.3, max: 1, medir: true });
    const r1 = texto(ctx, { t: sinPunto(d.frase), x: DM, y: 0, w, fam: 'd', peso: 800, tam: 88, min: 64, lh: 1.08, max: 3, medir: true });
    if (!r1.ok) av.push(['frena', 'La frase de cierre tiene que entrar en tres líneas.']);
    let y = H - DM - r2.alto;
    texto(ctx, { t: d.gracias, x: DM, y, w, fam: 'l', peso: 400, tam: 40, lh: 1.3, max: 1, color: C.blueSoft });
    y -= r1.alto + (r2.alto ? 28 : 0);
    texto(ctx, { t: sinPunto(d.frase), x: DM, y, w, fam: 'd', peso: 800, tam: 88, min: 64, lh: 1.08, max: 3, color: C.blanco, dest: d.destacado, colorDest: C.mint });
  }

  /* ---------- papelería (a 300 dpi) ---------- */
  async function dibMembrete(ctx, W, H, d, f, av, vista) {
    ctx.fillStyle = C.blanco; ctx.fillRect(0, 0, W, H);
    const m = Math.round(20 * MM);
    await logo(ctx, 'isologo-color', m, Math.round(16 * MM), Math.round(45 * MM));
    if (d.area) texto(ctx, { t: d.area, x: W / 2, y: Math.round(22 * MM), w: W / 2 - m, fam: 'd', peso: 700, tam: Math.round(9 / 72 * 300), lh: 1.25, max: 2, alin: 'right', color: C.navy });
    const yLinea = H - Math.round(26 * MM);
    ctx.fillStyle = C.teal; ctx.fillRect(m, yLinea, W - 2 * m, Math.round(0.6 * MM));
    const t8 = Math.round(8 / 72 * 300);
    const contacto = [SP_CONTACTO.web, SP_CONTACTO.correo, SP_CONTACTO.telefono].join('   ·   ');
    texto(ctx, { t: contacto, x: m, y: yLinea + Math.round(3 * MM), w: W - 2 * m, fam: 'l', peso: 500, tam: t8, lh: 1.4, max: 1, color: C.text });
    if (d.legal) texto(ctx, { t: d.legal, x: m, y: yLinea + Math.round(8 * MM), w: W - 2 * m, fam: 'l', peso: 400, tam: t8, lh: 1.4, max: 2, color: C.muted });
    if (vista) guia(ctx, m, Math.round(45 * MM), W - 2 * m, yLinea - Math.round(52 * MM), C.blueSoft);
  }
  async function dibTarjeta(ctx, W, H, d, f, av, vista, cara) {
    const s = Math.round(3 * MM), seg = Math.round(4 * MM) + s; // sangrado y zona segura
    if ((cara || d.cara) === 'frente') {
      ctx.fillStyle = C.navyDeep; ctx.fillRect(0, 0, W, H);
      const lw = Math.round(46 * MM), lh = Math.round(lw * 284 / 759);
      await logo(ctx, 'isologo-blanco', (W - lw) / 2, (H - lh) / 2, lw);
    } else {
      ctx.fillStyle = C.blanco; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.teal; ctx.fillRect(0, H - s - Math.round(2.2 * MM), W, s + Math.round(2.2 * MM));
      const iso = await imgLogo('isotipo-turquesa'); const iw = Math.round(9 * MM);
      ctx.drawImage(iso, W - seg - iw, seg, iw, Math.round(iw * iso.naturalHeight / iso.naturalWidth));
      const w = W - 2 * seg - iw - Math.round(3 * MM);
      let y = seg + Math.round(1 * MM);
      const r1 = texto(ctx, { t: d.nombre || 'Nombre y apellido', x: seg, y, w, fam: 'd', peso: 800, tam: Math.round(11 / 72 * 300), min: Math.round(9 / 72 * 300), lh: 1.15, max: 2, color: d.nombre ? C.navy : C.muted });
      if (!r1.ok) av.push(['frena', 'El nombre no entra en la tarjeta.']);
      y += r1.alto + Math.round(0.8 * MM);
      texto(ctx, { t: d.cargo || 'Cargo o área', x: seg, y, w, fam: 'l', peso: 500, tam: Math.round(8 / 72 * 300), lh: 1.3, max: 2, color: d.cargo ? C.text : C.muted });
      const t75 = Math.round(7.5 / 72 * 300);
      const lineas = [d.telefono, d.correo, SP_CONTACTO.web].filter(Boolean);
      let yb = H - seg - Math.round(2.2 * MM) - lineas.length * Math.round(t75 * 1.45);
      for (const l of lineas) { texto(ctx, { t: l, x: seg, y: yb, w: W - 2 * seg, fam: 'l', peso: 400, tam: t75, lh: 1.45, max: 1, color: C.text }); yb += Math.round(t75 * 1.45); }
    }
    if (vista) { guia(ctx, s, s, W - 2 * s, H - 2 * s, C.muted); guia(ctx, seg, seg, W - 2 * seg, H - 2 * seg, C.blueSoft); }
  }

  /* ---------- firma de correo (HTML) y WhatsApp (texto) ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function htmlFirma(d) {
    const logoUrl = SP_CONTACTO.centroDeMarca + SP_LOGOS['isologo-color'].src;
    const cargo = [d.cargo, d.area].filter(Boolean).map(esc).join(' · ');
    const tels = [d.telefono, d.celular].filter(Boolean).map(esc).join(' · ');
    return '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Inter,Arial,Helvetica,sans-serif;color:#3D3D3D;font-size:13px;line-height:1.5">'
      + '<tr><td style="padding:0 0 10px"><img src="' + logoUrl + '" width="180" height="67" alt="Salud Protegida" style="display:block;width:180px;height:auto;border:0"></td></tr>'
      + '<tr><td style="font-family:\'Nunito Sans\',Arial,Helvetica,sans-serif;font-size:16px;font-weight:800;color:#003B71">' + (esc(d.nombre) || 'Tu nombre') + '</td></tr>'
      + (cargo ? '<tr><td style="color:#3D3D3D">' + cargo + '</td></tr>' : '')
      + '<tr><td style="padding-top:8px;color:#3D3D3D">' + (tels ? tels + '<br>' : '') + (d.correo ? '<a href="mailto:' + esc(d.correo) + '" style="color:#00695F;text-decoration:none">' + esc(d.correo) + '</a><br>' : '')
      + '<a href="https://' + SP_CONTACTO.web + '" style="color:#00695F;text-decoration:none">' + SP_CONTACTO.web + '</a></td></tr>'
      + '</table>';
  }
  function htmlWhatsApp(t) {
    return esc(t).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/_([^_\n]+)_/g, '<i>$1</i>').replace(/~([^~\n]+)~/g, '<s>$1</s>');
  }

  /* ---------- el catálogo ---------- */
  const fondoCampo = (ids, def) => ({ id: 'fondo', tipo: 'select', et: 'Fondo', ops: opcionesFondo(ids), def });
  const iconoCampo = def => ({ id: 'icono', tipo: 'select', et: 'Ícono', ops: ICONOS, def, ayuda: 'Solo si dice algo que el texto no dice. Si no, sin ícono.' });
  const ctaCampo = def => ({ id: 'cta', tipo: 'select', et: 'Botón', ops: CTAS, def, ayuda: 'Para ir al simulador, siempre «Simulá tu plan».' });

  const PLANTILLAS = {
    titular: {
      nombre: 'Titular', dibujar: dibTitular, campos: [
        fondoCampo(['navy', 'menta', 'blanco'], 'navy'),
        { id: 'titulo', tipo: 'texto', et: 'Título', def: 'Elegí tu plan con calma', max: 60, ayuda: 'Sin punto final.' },
        { id: 'destacado', tipo: 'texto', et: 'Parte destacada del título', def: 'con calma', ayuda: 'Una o dos palabras del título, en otro color.' },
        { id: 'bajada', tipo: 'area', et: 'Bajada', def: 'Mirá los tres planes y simulá el tuyo antes de dejar tus datos.', max: 160 },
        iconoCampo('Letra'), ctaCampo('Simulá tu plan'),
      ],
    },
    cifra: {
      nombre: 'Cifra', dibujar: dibCifra, campos: [
        fondoCampo(['blanco', 'menta', 'navy'], 'blanco'),
        { id: 'cifra', tipo: 'texto', et: 'La cifra', def: '24 h', max: 10, ayuda: 'Como se diría en voz alta: «8 de cada 10» antes que «80%».' },
        { id: 'que', tipo: 'texto', et: 'Qué dice la cifra', def: 'Para urgencias, todos los días', max: 70 },
        { id: 'explicacion', tipo: 'area', et: 'Explicación', def: 'Un solo número para urgencias, WhatsApp y consultas: +595 21 319 00 00.', max: 140 },
        { id: 'fuente', tipo: 'texto', et: 'Fuente y fecha', def: 'saludprotegida.com.py, octubre de 2026', obligatorio: 'Sin fuente y fecha, un dato no existe.' },
        iconoCampo(''),
      ],
    },
    pregunta: {
      nombre: 'Pregunta y respuesta', dibujar: dibPregunta, campos: [
        fondoCampo(['menta', 'navy', 'blanco'], 'menta'),
        { id: 'pregunta', tipo: 'texto', et: 'La pregunta', def: '¿Qué es el tiempo de espera?', max: 70, ayuda: 'Con las palabras con que la hace la gente.' },
        { id: 'destacado', tipo: 'texto', et: 'Parte destacada', def: 'tiempo de espera' },
        { id: 'respuesta', tipo: 'area', et: 'La respuesta', def: 'Es lo que esperás desde que entrás al plan para usar algunos servicios. En el contrato se llama carencia, y cada plan dice cuánto es.', max: 260 },
        iconoCampo('Espera'), ctaCampo(''),
      ],
    },
    cita: {
      nombre: 'Cita', dibujar: dibCita, campos: [
        fondoCampo(['menta', 'blanco', 'navy'], 'menta'),
        { id: 'cita', tipo: 'area', et: 'La frase, textual', def: '', max: 220, ph: 'Copiá la frase tal como la dijo la persona', obligatorio: 'Falta la frase.' },
        { id: 'autor', tipo: 'texto', et: 'Quién lo dijo', def: '', ph: 'Nombre y apellido', obligatorio: 'Falta quién lo dijo.' },
        { id: 'rol', tipo: 'texto', et: 'Quién es', def: '', ph: 'Por ejemplo: asociada desde 2019' },
        { id: 'consentimiento', tipo: 'casilla', et: 'Tengo su consentimiento firmado para publicarlo, y la frase es textual', def: false, obligatorio: 'Una cita de un cliente necesita su consentimiento firmado.' },
      ],
    },
    portada: {
      nombre: 'Portada', dibujar: dibPortada, campos: [
        { id: 'modo', tipo: 'select', et: 'Modo', ops: [['presentar', 'Para presentar (navy)'], ['leer', 'Para leer (claro)']], def: 'presentar' },
        { id: 'rotulo', tipo: 'texto', et: 'Rótulo', def: 'Capacitación', max: 40 },
        { id: 'titulo', tipo: 'texto', et: 'Título', def: 'Así se ve Salud Protegida', max: 70 },
        { id: 'destacado', tipo: 'texto', et: 'Parte destacada', def: 'Salud Protegida' },
        { id: 'subtitulo', tipo: 'texto', et: 'Subtítulo', def: 'La marca, en diez minutos', max: 80, ayuda: 'En un informe, el período completo: «del 1 al 31 de agosto».' },
      ],
    },
    separador: {
      nombre: 'Separador', dibujar: dibSeparador, campos: [
        { id: 'numero', tipo: 'texto', et: 'Número de la parte (opcional)', def: '2', max: 3 },
        { id: 'titulo', tipo: 'texto', et: 'Título de la parte', def: 'Cómo hablamos', max: 60 },
      ],
    },
    idea: {
      nombre: 'Idea', dibujar: dibIdea, campos: [
        { id: 'frase', tipo: 'area', et: 'La frase', def: 'Si una familia no lo dice en su casa, nosotros tampoco', max: 110 },
        { id: 'destacado', tipo: 'texto', et: 'Parte destacada', def: 'nosotros tampoco' },
        { id: 'bajada', tipo: 'area', et: 'Bajada (opcional)', def: '', max: 160 },
        { id: 'fuente', tipo: 'texto', et: 'Fuente (si hay un dato)', def: '' },
        { id: 'pagina', tipo: 'texto', et: 'Página', def: '3 / 12', max: 9 },
      ],
    },
    dato: {
      nombre: 'Dato grande', dibujar: dibDato, campos: [
        { id: 'cifra', tipo: 'texto', et: 'La cifra', def: '24 h', max: 10 },
        { id: 'que', tipo: 'texto', et: 'Qué dice la cifra', def: 'Para urgencias, todos los días', max: 80 },
        { id: 'explicacion', tipo: 'area', et: 'Qué significa', def: 'Un solo número para urgencias, WhatsApp y consultas.', max: 140 },
        { id: 'fuente', tipo: 'texto', et: 'Fuente y período', def: 'saludprotegida.com.py, octubre de 2026', obligatorio: 'Sin fuente y fecha, un dato no existe.' },
        { id: 'pagina', tipo: 'texto', et: 'Página', def: '4 / 12', max: 9 },
      ],
    },
    citaLamina: {
      nombre: 'Cita', dibujar: dibCitaLamina, campos: [
        { id: 'cita', tipo: 'area', et: 'La frase, textual', def: '', max: 220, ph: 'Copiá la frase tal como la dijo la persona', obligatorio: 'Falta la frase.' },
        { id: 'autor', tipo: 'texto', et: 'Quién lo dijo', def: '', ph: 'Nombre y apellido', obligatorio: 'Falta quién lo dijo.' },
        { id: 'rol', tipo: 'texto', et: 'Quién es', def: '' },
        { id: 'consentimiento', tipo: 'casilla', et: 'Tengo su consentimiento firmado y la frase es textual', def: false, obligatorio: 'La voz de un cliente va textual, verificada y con consentimiento.' },
        { id: 'pagina', tipo: 'texto', et: 'Página', def: '', max: 9 },
      ],
    },
    impacto: {
      nombre: 'Impacto', dibujar: dibImpacto, campos: [
        { id: 'frase', tipo: 'area', et: 'La frase', def: 'Ninguna sorpresa grande puede estar solo en el contrato', max: 90, ayuda: 'Una sola por presentación: es el momento que se recuerda.' },
      ],
    },
    cierre: {
      nombre: 'Cierre', dibujar: dibCierre, campos: [
        { id: 'frase', tipo: 'area', et: 'La frase', def: 'Que cada pieza se reconozca de lejos', max: 100 },
        { id: 'destacado', tipo: 'texto', et: 'Parte destacada', def: 'de lejos' },
        { id: 'gracias', tipo: 'texto', et: 'Debajo', def: 'Gracias', ayuda: 'En una presentación para leer, sin «gracias».' },
      ],
    },
    membrete: {
      nombre: 'Membrete', dibujar: dibMembrete, campos: [
        { id: 'area', tipo: 'texto', et: 'Área (opcional)', def: '', ph: 'Por ejemplo: Dirección de Marketing', max: 60 },
        { id: 'legal', tipo: 'texto', et: 'Pie legal (opcional)', def: '', ph: 'Razón social y dirección', max: 140 },
      ],
    },
    tarjeta: {
      nombre: 'Tarjeta', dibujar: dibTarjeta, caras: ['frente', 'dorso'], campos: [
        { id: 'cara', tipo: 'select', et: 'Cara que ves', ops: [['dorso', 'Dorso, con los datos'], ['frente', 'Frente, con el logo']], def: 'dorso', ayuda: 'El PDF lleva las dos caras.' },
        { id: 'nombre', tipo: 'texto', et: 'Nombre y apellido', def: '', ph: 'Nombre y apellido', max: 40 },
        { id: 'cargo', tipo: 'texto', et: 'Cargo o área', def: '', ph: 'Cargo o área', max: 50 },
        { id: 'telefono', tipo: 'texto', et: 'Teléfono', def: SP_CONTACTO.telefono, ayuda: 'Con el formato de Paraguay: +595 981 654 234.' },
        { id: 'correo', tipo: 'texto', et: 'Correo', def: SP_CONTACTO.correo },
      ],
    },
    firma: {
      nombre: 'Firma', html: d => htmlFirma(d), campos: [
        { id: 'nombre', tipo: 'texto', et: 'Nombre y apellido', def: '', ph: 'Tu nombre' },
        { id: 'cargo', tipo: 'texto', et: 'Cargo', def: '', ph: 'Por ejemplo: Asesora comercial' },
        { id: 'area', tipo: 'texto', et: 'Área (opcional)', def: '' },
        { id: 'telefono', tipo: 'texto', et: 'Teléfono', def: SP_CONTACTO.telefono },
        { id: 'celular', tipo: 'texto', et: 'Celular (opcional)', def: '', ph: '+595 981 654 234' },
        { id: 'correo', tipo: 'texto', et: 'Correo', def: '', ph: 'tu correo de SP' },
      ],
    },
    mensaje: {
      nombre: 'Mensaje', wa: true, campos: [
        { id: 'mensaje', tipo: 'area', et: 'El mensaje', filas: 7, def: 'Buen día. Le escribimos de Salud Protegida.\n\nYa puede buscar a su médico en la *Guía Médica*, en saludprotegida.com.py.\n\nSi necesita ayuda, respóndanos por este mismo chat.', max: 700, ayuda: '*negrita* y _cursiva_, como en WhatsApp.' },
      ],
    },
  };

  const FORMATOS = {
    post:        { nombre: 'Post', medida: '1080 × 1350', w: 1080, h: 1350, tipo: 'Post', fmt: 'Feed', canal: 'IG', plantillas: ['titular', 'cifra', 'pregunta', 'cita'], voz: 'vos' },
    historia:    { nombre: 'Historia', medida: '1080 × 1920', w: 1080, h: 1920, tipo: 'Post', fmt: 'Story', canal: 'IG', plantillas: ['titular', 'cifra', 'pregunta', 'cita'], voz: 'vos', nota: 'Arriba y abajo queda libre lo que tapa Instagram.' },
    cuadrado:    { nombre: 'Cuadrado', medida: '1080 × 1080', w: 1080, h: 1080, tipo: 'Post', fmt: 'Cuadrado', canal: 'IG', plantillas: ['titular', 'cifra', 'pregunta', 'cita'], voz: 'vos' },
    compartir:   { nombre: 'Para compartir', medida: '1200 × 630', w: 1200, h: 630, tipo: 'Banner', fmt: 'Compartir', canal: 'Web', plantillas: ['titular', 'cifra'], voz: 'vos', nota: 'La imagen que aparece al pegar un enlace en WhatsApp o Facebook.' },
    diapositiva: { nombre: 'Diapositiva', medida: '1920 × 1080', w: 1920, h: 1080, tipo: 'Lamina', fmt: '16x9', canal: 'Pres', plantillas: ['portada', 'separador', 'idea', 'dato', 'citaLamina', 'impacto', 'cierre'], voz: 'vos' },
    membrete:    { nombre: 'Membrete A4', medida: '210 × 297 mm', w: Math.round(210 * MM), h: Math.round(297 * MM), mm: [210, 297], tipo: 'Doc', fmt: 'A4', canal: 'Print', plantillas: ['membrete'], pdf: true, nota: 'Las líneas punteadas marcan el área de texto y no salen en el archivo.' },
    tarjeta:     { nombre: 'Tarjeta personal', medida: '85 × 55 mm', w: Math.round(91 * MM), h: Math.round(61 * MM), mm: [91, 61], tipo: 'Tarjeta', fmt: '85x55', canal: 'Print', plantillas: ['tarjeta'], pdf: true, nota: 'Lleva 3 mm de sangrado por lado. Las líneas punteadas (corte y zona segura) no salen en el archivo.' },
    firma:       { nombre: 'Firma de correo', medida: 'HTML', html: true, tipo: 'Firma', fmt: 'Correo', canal: 'Mail', plantillas: ['firma'], voz: 'vos' },
    whatsapp:    { nombre: 'WhatsApp', medida: 'Texto', wa: true, tipo: 'Mensaje', fmt: 'WA', canal: 'WA', plantillas: ['mensaje'], voz: 'usted', nota: 'Con un paciente, por WhatsApp, va usted.' },
  };

  /* ---------- la revisión del texto con las reglas de la marca ---------- */
  const sinPunto = t => String(t || '').trim().replace(/(?<![.…])\.\s*$/, '');
  const REGLAS = [
    [/\bcartillas?\b/i, 'frena', '«Cartilla» no la dice una familia: usá «qué cubre», «cobertura» o «Guía Médica».'],
    [/\bprestaci(?:ón|on|ones)\b/i, 'frena', '«Prestación» es palabra de contrato: usá «servicio».'],
    [/\bpr[áa]cticas?\b/i, 'frena', '«Práctica» es ambigua: usá «estudio», «consulta» o «lo que necesitás».'],
    [/\bno cubiert[oa]s?\b/i, 'frena', 'Nunca «No cubierto»: decí «No entra en este plan».'],
    [/\b(?:seguros? (?:m[ée]dicos?|de salud)|nuestro seguro|tu seguro|su seguro|aseguradora)\b/i, 'frena', 'SP es «medicina prepaga», nunca «seguro».'],
    [/\b(?:el|la|los|las) (?:únic[oa]s?|unic[oa]s?|mejor(?:es)?|más grandes?|primer[oa]s?)\b|\bexclusiv[oa]s?\b|\bn[úu]mero uno\b/i, 'frena', '«El único», «el mejor», «el primero» o «exclusivo» necesitan respaldo documentado: mejor el dato concreto.'],
    [/\bexcelencia\b/i, 'mira', '«Excelencia» no dice nada: un dato concreto dice más.'],
    [/\bsu contrato\b/i, 'mira', '«Su contrato» pone distancia: probá con «tu plan».'],
    [/₲/, 'mira', 'En las piezas, la moneda se escribe «Gs. 1.250.000».'],
    [/\$\s?\d/, 'mira', 'En Paraguay la moneda se escribe «Gs. 1.250.000».'],
    [/\b\d{1,3}(?:,\d{3})+\b/, 'mira', 'Los miles van con punto: 1.250.000.'],
    [/\d\.\d+\s?%/, 'mira', 'Los decimales van con coma: 37,5%.'],
    [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'mira', 'Hay emojis: en las piezas de SP no se usan.'],
    [/\b[A-ZÁÉÍÓÚÑ]{5,}\b/, 'mira', 'Hay MAYÚSCULAS sostenidas: los nombres van en Tipo Oración.'],
    [/\b(?:precio|precios|cuesta|cuestan|cubre|cubren|cobertura|reintegro|tope|Gs\.?\s?\d)/i, 'mira', 'Si la pieza afirma algo sobre cobertura, precios o plazos, necesita aprobación previa y va contra la grilla vigente.'],
  ];
  const VOSEO = /\b(?:tenés|querés|podés|sabés|elegí|mirá|escribinos|llamá|contanos|fijate|vos|necesitás|buscá|simulá|entrás|esperás)\b/i;
  const USTED = /\b(?:usted|le escribimos|puede usted|su plan|sus datos|respóndanos|consulte|llame|escríbanos)\b/i;

  function revisar(fid, pid, d) {
    const f = FORMATOS[fid], p = PLANTILLAS[pid], out = [];
    const textos = p.campos.filter(c => c.tipo === 'texto' || c.tipo === 'area').map(c => d[c.id] || '').join('\n');
    for (const [re, nivel, msg] of REGLAS) {
      if (re.test(textos) && !out.some(o => o[1] === msg)) {
        if (msg.startsWith('Hay MAYÚSCULAS') && /\b(?:SALUD|PROTEGIDA)\b/.test(textos.match(re)[0])) continue;
        out.push([nivel, msg]);
      }
    }
    const iCar = textos.search(/\bcarencias?\b/i);
    if (iCar >= 0 && !/tiempos? de espera/i.test(textos.slice(0, iCar))) out.push(['mira', '«Carencia» no va primero: decí «tiempo de espera» y la palabra del contrato después.']);
    for (const c of p.campos) {
      if (c.obligatorio && (c.tipo === 'casilla' ? !d[c.id] : !String(d[c.id] || '').trim())) out.push(['frena', c.obligatorio]);
      if (c.max && String(d[c.id] || '').length > c.max) out.push(['mira', c.et + ': ' + String(d[c.id]).length + ' caracteres; conviene no pasar de ' + c.max + '.']);
    }
    if (d.destacado && d.titulo != null && !String(d.titulo).toLowerCase().includes(String(d.destacado).toLowerCase())) out.push(['mira', 'La parte destacada no aparece en el título: no se va a ver.']);
    if (d.destacado && d.frase != null && !String(d.frase).toLowerCase().includes(String(d.destacado).toLowerCase())) out.push(['mira', 'La parte destacada no aparece en la frase: no se va a ver.']);
    for (const k of ['titulo', 'pregunta', 'que', 'rotulo']) if (/[^.]\.\s*$/.test(String(d[k] || ''))) out.push(['mira', 'Le saqué el punto final: los títulos van sin punto.']);
    if (f && f.voz === 'usted' && VOSEO.test(textos)) out.push(['mira', 'Con un paciente, por WhatsApp, va usted: «puede», «le escribimos».']);
    if (f && f.voz === 'vos' && USTED.test(textos)) out.push(['mira', 'En redes, la web y las presentaciones va voseo: «tenés», «elegí», «mirá».']);
    return out;
  }

  /* ---------- dibujar una pieza en un canvas ---------- */
  async function dibujar(canvas, fid, pid, datos, opciones) {
    const f = FORMATOS[fid], p = PLANTILLAS[pid];
    const d = Object.assign({}, valoresPorDefecto(pid), datos || {});
    canvas.width = f.w; canvas.height = f.h;
    await fuentes();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, f.w, f.h);
    const av = [];
    await p.dibujar(ctx, f.w, f.h, d, fid, av, !!(opciones && opciones.vista), opciones && opciones.cara);
    return av;
  }
  function valoresPorDefecto(pid) {
    const o = {};
    for (const c of PLANTILLAS[pid].campos) o[c.id] = c.def;
    return o;
  }

  /* ---------- guardar archivos (claude.ai o fuera de él) ---------- */
  async function guardar(nombre, datos) {
    const blob = datos instanceof Blob ? datos : new Blob([datos]);
    if (window.claude && typeof window.claude.use === 'function') {
      let cap = null;
      try { cap = await window.claude.use('downloads'); } catch (e) { cap = null; }
      if (!cap) return { ok: false, msg: 'Este visor no permite bajar archivos. Abrí la vitrina desde el Centro de Marca.' };
      try { await cap.save({ filename: nombre, data: blob }); return { ok: true, msg: 'Listo: ' + nombre }; }
      catch (e) { return { ok: false, msg: e && e.code === 'declined' ? 'No se bajó.' : 'No se pudo bajar (' + ((e && e.code) || 'error') + ').' }; }
    }
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { ok: true, msg: 'Listo: ' + nombre };
  }
  async function copiar(texto, html) {
    try {
      if (html && window.ClipboardItem && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([texto], { type: 'text/plain' }) })]);
      } else await navigator.clipboard.writeText(texto);
      return true;
    } catch (e) { return false; }
  }
  const fecha = () => { const h = new Date(); return '' + h.getFullYear() + String(h.getMonth() + 1).padStart(2, '0') + String(h.getDate()).padStart(2, '0'); };
  const concepto = d => {
    const base = d.titulo || d.frase || d.pregunta || d.que || d.cita || d.nombre || d.mensaje || 'pieza';
    return String(base).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').split('-').filter(Boolean).slice(0, 4).join('-') || 'pieza';
  };
  /* La convención de nombres de SP: AAAAMMDD_SP_[Tipo]_[Formato]-[Concepto]-[Canal]_v1 */
  const nombreArchivo = (fid, d, ext) => { const f = FORMATOS[fid]; return fecha() + '_SP_' + f.tipo + '_' + f.fmt + '-' + concepto(d) + '-' + f.canal + '_v1.' + ext; };

  /* ---------- la interfaz ---------- */
  const CLAVE = 'sp-taller-v1';
  function leerBorrador() { try { return JSON.parse(localStorage.getItem(CLAVE)) || null; } catch (e) { return null; } }
  function guardarBorrador(e) { try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch (x) { /* sin almacenamiento: no pasa nada */ } }

  function iniciar(raiz, aviso) {
    const $ = s => raiz.querySelector(s);
    const elF = $('#formatos'), elP = $('#plantillas'), elL = $('#lienzo-caja'), elC = $('#campos');
    const guardado = leerBorrador() || {};
    const estado = { f: FORMATOS[guardado.f] ? guardado.f : 'post', p: null, datos: guardado.datos || {} };
    estado.p = FORMATOS[estado.f].plantillas.includes(guardado.p) ? guardado.p : FORMATOS[estado.f].plantillas[0];
    const datosDe = pid => (estado.datos[pid] = Object.assign(valoresPorDefecto(pid), estado.datos[pid] || {}));
    let canvas = null, turno = 0, temporizador = null;

    function chips() {
      elF.innerHTML = Object.entries(FORMATOS).map(([id, f]) =>
        '<button type="button" class="chip" aria-pressed="' + (id === estado.f) + '" data-f="' + id + '">' + esc(f.nombre) + '<small>' + esc(f.medida) + '</small></button>').join('');
      elP.innerHTML = FORMATOS[estado.f].plantillas.map(pid =>
        '<button type="button" class="chip" aria-pressed="' + (pid === estado.p) + '" data-p="' + pid + '">' + esc(PLANTILLAS[pid].nombre) + '</button>').join('');
      elP.parentElement.hidden = FORMATOS[estado.f].plantillas.length < 2;
    }
    function campos() {
      const p = PLANTILLAS[estado.p], d = datosDe(estado.p);
      elC.innerHTML = p.campos.map(c => {
        const id = 'tc-' + estado.p + '-' + c.id;
        const ayuda = c.ayuda ? '<span class="campo-ayuda">' + esc(c.ayuda) + '</span>' : '';
        if (c.tipo === 'select') return '<label for="' + id + '"><span class="campo-et">' + esc(c.et) + '</span><select class="campo" id="' + id + '" data-c="' + c.id + '">' + c.ops.map(o => '<option value="' + esc(o[0]) + '"' + (o[0] === d[c.id] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>' + ayuda + '</label>';
        if (c.tipo === 'imagen') return '<label for="' + id + '"><span class="campo-et">' + esc(c.et) + '</span><input class="campo" type="file" accept="image/*" id="' + id + '" data-c="' + c.id + '">' + ayuda + '</label>';
        if (c.tipo === 'casilla') return '<label class="casilla" for="' + id + '"><input type="checkbox" id="' + id + '" data-c="' + c.id + '"' + (d[c.id] ? ' checked' : '') + '><span>' + esc(c.et) + '</span></label>';
        if (c.tipo === 'area') return '<label for="' + id + '"><span class="campo-et">' + esc(c.et) + '</span><textarea class="campo" id="' + id + '" rows="' + (c.filas || 3) + '" data-c="' + c.id + '"' + (c.ph ? ' placeholder="' + esc(c.ph) + '"' : '') + '>' + esc(d[c.id]) + '</textarea>' + ayuda + '</label>';
        return '<label for="' + id + '"><span class="campo-et">' + esc(c.et) + '</span><input class="campo" id="' + id + '" data-c="' + c.id + '" value="' + esc(d[c.id]) + '"' + (c.ph ? ' placeholder="' + esc(c.ph) + '"' : '') + '>' + ayuda + '</label>';
      }).join('') + '<div><span class="campo-et">Revisión</span><ul class="revision" id="revision"></ul></div><div class="salidas" id="salidas"></div><p class="aviso-salida" id="aviso-salida"></p>';
    }
    function lienzo() {
      const f = FORMATOS[estado.f];
      if (f.html) elL.innerHTML = '<div class="vista-html" id="vista-html"></div><p class="medida">' + esc(f.nombre) + ' · el logo se carga desde el Centro de Marca, así se actualiza solo</p>';
      else if (f.wa) elL.innerHTML = '<div class="fondo-wa"><div class="burbuja-wa" id="vista-wa"></div></div><p class="medida">' + esc(f.nota || '') + '</p>';
      else {
        elL.innerHTML = '<canvas id="lienzo" role="img" aria-label="Vista previa de la pieza"></canvas><p class="medida">' + esc(f.nombre + ' · ' + f.medida + (f.mm ? ' · 300 dpi' : ' px')) + (f.nota ? ' · ' + esc(f.nota) : '') + '</p>';
        canvas = $('#lienzo');
        canvas.style.width = 'min(100%, calc(72vh * ' + (f.w / f.h).toFixed(4) + '))';
        canvas.style.marginInline = 'auto';
      }
    }
    function salidas(frena) {
      const f = FORMATOS[estado.f], el = $('#salidas');
      const dis = frena ? ' disabled' : '';
      const b = [];
      if (f.html) b.push('<button type="button" class="btn" data-sal="copiar-firma"' + dis + '>Copiar la firma</button>', '<button type="button" class="btn btn-2" data-sal="html"' + dis + '>Bajar .html</button>');
      else if (f.wa) b.push('<button type="button" class="btn" data-sal="copiar-wa"' + dis + '>Copiar el mensaje</button>');
      else {
        if (f.pdf) b.push('<button type="button" class="btn" data-sal="pdf"' + dis + '>Bajar PDF para imprenta</button>');
        b.push('<button type="button" class="btn' + (f.pdf ? ' btn-2' : '') + '" data-sal="png"' + dis + '>Bajar PNG</button>');
      }
      el.innerHTML = b.join('');
      $('#aviso-salida').textContent = frena ? 'Resolvé lo que frena y la pieza queda lista para bajar.' : '';
    }
    async function pintar() {
      const mi = ++turno, f = FORMATOS[estado.f], d = datosDe(estado.p);
      let av = [];
      if (f.html) $('#vista-html').innerHTML = PLANTILLAS[estado.p].html(d);
      else if (f.wa) $('#vista-wa').innerHTML = htmlWhatsApp(d.mensaje) || '&nbsp;';
      else {
        const tmp = document.createElement('canvas');
        try { av = await dibujar(tmp, estado.f, estado.p, d, { vista: true }); }
        catch (e) { av = [['frena', 'No se pudo dibujar: ' + e.message]]; }
        if (mi !== turno) return;
        canvas.width = tmp.width; canvas.height = tmp.height;
        canvas.getContext('2d').drawImage(tmp, 0, 0);
      }
      const lista = revisar(estado.f, estado.p, d).concat(av);
      const unicos = lista.filter((x, i) => lista.findIndex(y => y[1] === x[1]) === i);
      const frena = unicos.some(x => x[0] === 'frena');
      $('#revision').innerHTML = unicos.length
        ? unicos.sort((a, b) => (a[0] === 'frena' ? 0 : 1) - (b[0] === 'frena' ? 0 : 1)).map(x => '<li class="rev-' + x[0] + '"><span><b>' + (x[0] === 'frena' ? 'Frena la descarga. ' : 'Para mirar. ') + '</b>' + esc(x[1]) + '</span></li>').join('')
        : '<li class="rev-bien"><span><b>Lista. </b>El texto cumple las reglas de la marca.</span></li>';
      salidas(frena);
      guardarBorrador({ f: estado.f, p: estado.p, datos: JSON.parse(JSON.stringify(estado.datos, (k, v) => (typeof v === 'string' && v.startsWith('data:image') ? undefined : v))) });
    }
    function todo() { chips(); lienzo(); campos(); pintar(); }

    elF.addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      estado.f = b.dataset.f; estado.p = FORMATOS[estado.f].plantillas[0]; todo();
    });
    elP.addEventListener('click', e => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      estado.p = b.dataset.p; chips(); campos(); pintar();
    });
    elC.addEventListener('change', e => {
      const c = e.target.dataset && e.target.dataset.c; if (!c || e.target.type !== 'file') return;
      const archivo = e.target.files && e.target.files[0]; if (!archivo) return;
      const lector = new FileReader();
      lector.onload = () => { datosDe(estado.p)[c] = lector.result; pintar(); };
      lector.readAsDataURL(archivo);
    });
    elC.addEventListener('input', e => {
      const c = e.target.dataset && e.target.dataset.c; if (!c || e.target.type === 'file') return;
      datosDe(estado.p)[c] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      clearTimeout(temporizador); temporizador = setTimeout(pintar, 90);
    });
    elC.addEventListener('click', async e => {
      const b = e.target.closest('[data-sal]'); if (!b || b.disabled) return;
      const f = FORMATOS[estado.f], d = datosDe(estado.p), tipo = b.dataset.sal;
      let r;
      if (tipo === 'png') {
        const c = document.createElement('canvas');
        await dibujar(c, estado.f, estado.p, d, { vista: false });
        const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
        r = await guardar(nombreArchivo(estado.f, d, 'png'), blob);
      } else if (tipo === 'pdf') {
        if (!window.jspdf) { r = { ok: false, msg: 'No cargó el generador de PDF. Probá de nuevo en un momento.' }; }
        else {
          const [wmm, hmm] = f.mm, doc = new window.jspdf.jsPDF({ unit: 'mm', format: [wmm, hmm], orientation: wmm > hmm ? 'landscape' : 'portrait' });
          const caras = PLANTILLAS[estado.p].caras || [null];
          for (let i = 0; i < caras.length; i++) {
            const c = document.createElement('canvas');
            await dibujar(c, estado.f, estado.p, d, { vista: false, cara: caras[i] });
            if (i) doc.addPage([wmm, hmm], wmm > hmm ? 'landscape' : 'portrait');
            doc.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, wmm, hmm, undefined, 'FAST');
          }
          r = await guardar(nombreArchivo(estado.f, d, 'pdf'), doc.output('blob'));
        }
      } else if (tipo === 'html') {
        const html = '<!doctype html><meta charset="utf-8"><title>Firma de correo · Salud Protegida</title>' + htmlFirma(d);
        r = await guardar(nombreArchivo(estado.f, d, 'html'), new Blob([html], { type: 'text/html' }));
      } else if (tipo === 'copiar-firma') {
        const ok = await copiar($('#vista-html').innerText, htmlFirma(d));
        if (!ok) { const sel = window.getSelection(), rango = document.createRange(); rango.selectNodeContents($('#vista-html')); sel.removeAllRanges(); sel.addRange(rango); }
        r = { ok, msg: ok ? 'Firma copiada: pegala en la configuración de tu correo.' : 'No pude copiarla sola: quedó seleccionada, copiala con Ctrl+C.' };
      } else if (tipo === 'copiar-wa') {
        const ok = await copiar(d.mensaje);
        r = { ok, msg: ok ? 'Mensaje copiado.' : 'No pude copiarlo: seleccioná el texto del campo y copialo.' };
      }
      if (r) { $('#aviso-salida').textContent = r.msg; if (aviso) aviso(r.msg); }
    });

    todo();
    return {
      ir(fid, pid) { if (!FORMATOS[fid]) return; estado.f = fid; estado.p = pid && FORMATOS[fid].plantillas.includes(pid) ? pid : FORMATOS[fid].plantillas[0]; todo(); },
    };
  }

  function registrar(fid, formato, plantillas) {
    Object.assign(PLANTILLAS, plantillas || {});
    FORMATOS[fid] = formato;
  }

  window.SP_TALLER = { FORMATOS, PLANTILLAS, TEMAS, cargarImg, dibujar, revisar, iniciar, registrar, guardar, copiar, texto, logo, icono, caja, boton, FUENTE, MM };
})();
