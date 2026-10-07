/* Marca Salud Protegida — los datos que comparten la vitrina y el taller.
   Todo sale del Centro de Marca (index.html, assets/ y descargas/) y del sitio de
   clientes (sp-prototipo). Si algo cambia allá, cambia acá.

   EL LOGO VIVE EN UN SOLO LUGAR: SP_LOGOS. Cada pieza del taller y cada imagen de
   la vitrina (data-logo="…") lo toman de acá. Cuando llegue un logo nuevo, se
   reemplazan los archivos de assets/logos/ con el mismo nombre (o se cambia la
   ruta acá) y todo se actualiza solo. */
(function () {
  'use strict';
  const L = 'assets/logos/', M = 'assets/miniaturas/';

  const SP_LOGOS = {
    'isologo-color':  { src: L + 'SP_Isologotipo_Fullcolor_RGB.png', ancho: 759, alto: 284 },
    'isologo-blanco': { src: L + 'SP_Isologotipo_Blanco_RGB.png',    ancho: 759, alto: 284 },
    'isologo-navy':   { src: L + 'SP_Isologotipo_Navy_RGB.png',      ancho: 759, alto: 284 },
    'isologo-negro':  { src: L + 'SP_Isologotipo_Negro_RGB.png',     ancho: 759, alto: 284 },
    'isotipo-turquesa': { src: L + 'SP_Isotipo_Turquesa_RGB.png', ancho: 1759, alto: 2048 },
    'isotipo-blanco':   { src: L + 'SP_Isotipo_Blanco_RGB.png',   ancho: 1759, alto: 2048 },
    'isotipo-turquesa-mini': { src: M + 'SP_Isotipo_Turquesa_RGB_mini.png' },
  };

  /* Los 18 archivos de assets/logos/, con lo que dice el Centro de Marca de cada uno */
  const SP_ARCHIVOS_LOGO = [
    ['SP_Isologotipo_Fullcolor_RGB.png', null, 'Isologotipo a color', 'Por defecto. Fondos claros o blancos.', ''],
    ['SP_Isologotipo_Blanco_RGB.png', null, 'Isologotipo blanco', 'Fondos navy, turquesa, oscuros o foto.', 'f-navy'],
    ['SP_Isologotipo_Navy_RGB.png', null, 'Isologotipo navy', 'Una sola tinta sobre claro.', ''],
    ['SP_Isologotipo_Negro_RGB.png', null, 'Isologotipo negro', 'Una tinta o escala de grises.', ''],
    ['SP_Isotipo_Turquesa_RGB.png', 'SP_Isotipo_Turquesa_RGB_mini.png', 'Isotipo turquesa', 'El símbolo solo, sobre claro.', ''],
    ['SP_Isotipo_Blanco_RGB.png', 'SP_Isotipo_Blanco_RGB_mini.png', 'Isotipo blanco', 'Sobre oscuro, color o foto.', 'f-navy'],
    ['SP_Isotipo_Navy_RGB.png', 'SP_Isotipo_Navy_RGB_mini.png', 'Isotipo navy', 'Monocromo sobre claro.', ''],
    ['SP_Isotipo_Negro_RGB.png', 'SP_Isotipo_Negro_RGB_mini.png', 'Isotipo negro', 'A una tinta.', ''],
    ['SP_Perfil_Turquesa_1024.png', 'SP_Perfil_Turquesa_1024_mini.png', 'Perfil turquesa', 'Foto de perfil de WhatsApp, IG y FB.', 'f-damero'],
    ['SP_Perfil_Navy_1024.png', 'SP_Perfil_Navy_1024_mini.png', 'Perfil navy', 'Variante navy del perfil.', 'f-damero'],
    ['SP_Perfil_Blanco_1024.png', 'SP_Perfil_Blanco_1024_mini.png', 'Perfil blanco', 'Variante blanca del perfil.', 'f-damero'],
    ['SP_MarcaDeAgua_Turquesa15.png', 'SP_MarcaDeAgua_Turquesa15_mini.png', 'Marca de agua turquesa', 'Sobre fotos o documentos claros. No se re-atenúa.', ''],
    ['SP_MarcaDeAgua_Blanco30.png', 'SP_MarcaDeAgua_Blanco30_mini.png', 'Marca de agua blanca', 'Sobre fotos oscuras o de color.', 'f-navy'],
    ['SP_Favicon_512.png', 'SP_Favicon_512_mini.png', 'Ícono de app', '512 × 512, para app y PWA.', 'f-damero'],
    ['SP_Favicon_192.png', null, 'Ícono de Android', '192 × 192.', 'f-damero'],
    ['SP_Favicon_64.png', null, 'Pestaña densa', '64 × 64.', 'f-damero'],
    ['SP_Favicon_32.png', null, 'Pestaña', '32 × 32.', 'f-damero'],
    ['SP_Favicon.ico', null, 'Favicon .ico', '16 a 64 px, para la pestaña del navegador.', 'f-damero'],
  ];

  /* Los 26 íconos: [archivo, nombre, para qué]. Fuente: app/components/iconos-sp.js del sitio */
  const SP_ICONOS = [
    ['Plan', 'Plan', 'El plan'], ['Credencial', 'Credencial', 'La credencial'], ['Turnos', 'Turnos', 'El período, un turno'],
    ['Pagos', 'Pagos', 'La inversión, un pago'], ['Red', 'Red', 'La red médica'], ['Hospital', 'Hospital', 'Un centro médico'],
    ['Letra', 'Letra chica', 'La letra chica, a la vista'], ['Domicilio', 'Domicilio', 'Atención en casa'], ['Mental', 'Salud mental', 'Salud mental'],
    ['Listo', 'Listo', 'Algo resuelto'], ['Enviar', 'Enviar', 'Enviar, contactar'], ['Espera', 'Espera', 'Tiempos y plazos'],
    ['Orden', 'Orden', 'Una orden médica'], ['Consejo', 'Consejo', 'Una idea, un consejo'], ['Papel', 'Papel', 'Entender el plan'],
    ['Escudo', 'Escudo', 'Prevención'], ['Corazon', 'Corazón', 'Primeros años'], ['Sol', 'Sol', 'Vivir más años'],
    ['Libro', 'Libro', 'Una nota, una lectura'], ['Megafono', 'Megáfono', 'La pauta, los avisos'], ['Celular', 'Celular', 'El feed, las redes'],
    ['Personas', 'Personas', 'La audiencia, las personas'], ['Uno', 'Uno', 'Número 1'], ['Dos', 'Dos', 'Número 2'],
    ['Tres', 'Tres', 'Número 3'], ['Cuatro', 'Cuatro', 'Número 4'],
  ];

  /* Los 12 aliados: [archivo, nombre]. Son marcas de terceros */
  const SP_ALIADOS = [
    ['acuidarte', 'Acuidarte'], ['assistcard', 'Assist Card'], ['barberos', 'Barberos López'], ['billio', 'Billio'],
    ['charpentier', 'Charpentier'], ['sanjose', 'Farmacia San José'], ['farmatotal', 'Farmatotal'], ['fisiospa', 'Fisio Spa'],
    ['promedik', 'Promedik'], ['puntofarma', 'Punto Farma'], ['upalala', 'Upalala'], ['meister', 'Óptica Meister'],
  ];

  /* La matriz de uso del Centro de Marca: si = preferido · ok = permitido · no = no usar · gap = falta archivo */
  const SP_MATRIZ = {
    cols: ['Isologotipo', 'Isotipo', 'Perfil de redes', 'Marca de agua', 'Favicon'],
    rows: [
      ['Portada de una pieza', 'si', 'no', 'no', 'no', 'no'],
      ['Primera aparición en cualquier pieza', 'si', 'no', 'no', 'no', 'no'],
      ['Encabezado de sitio, documento o membrete', 'si', 'ok', 'no', 'no', 'no'],
      ['Pie, cuando ya apareció arriba', 'ok', 'si', 'no', 'no', 'no'],
      ['Firma de correo', 'si', 'ok', 'no', 'no', 'no'],
      ['Pestaña del navegador o ícono de app', 'no', 'no', 'no', 'no', 'si'],
      ['Foto de perfil de WhatsApp, IG o FB', 'no', 'no', 'si', 'no', 'no'],
      ['Marca de agua sobre foto o documento', 'no', 'ok', 'no', 'si', 'no'],
      ['Espacio chico donde el texto no se lee', 'no', 'si', 'no', 'no', 'ok'],
      ['Impresión de más de 6,4 cm de ancho', 'gap', 'gap', 'no', 'no', 'no'],
    ],
  };

  /* Los once usos indebidos del Centro de Marca */
  const SP_MAL = [
    ['recolor', 'No lo recolorees', 'Solo existe en color, navy, negro y blanco.'],
    ['stretch', 'No lo estires', 'La proporción es fija: 759 × 284.'],
    ['rotate', 'No lo rotes', 'En piezas fijas va siempre a nivel.'],
    ['outline', 'No lo uses en contorno', 'Es una forma llena, no un trazo.'],
    ['shadow', 'No le pongas efectos', 'Nada de sombras, degradados ni brillos.'],
    ['busy', 'No sobre una imagen cargada', 'Sobre foto, la versión blanca y en zona tranquila.'],
    ['tiny', 'No bajes del mínimo', 'Debajo del mínimo el texto no se lee.'],
    ['over', 'No le pongas nada encima', 'El aire del logo queda vacío.'],
    ['pattern', 'No lo uses de fondo', 'El logo identifica; no decora.'],
    ['box', 'No lo encierres en otro color', 'Sobre color va la versión blanca, sin caja.'],
    ['lockup', 'No le sumes nombres', 'No hay sub-marcas en público.'],
  ];

  /* Datos de contacto públicos (los del sitio: app/quote.js y app/layout.jsx) */
  const SP_CONTACTO = {
    telefono: '+595 21 319 00 00',   // un solo número para WhatsApp, urgencias y teléfono
    correo: 'hola@saludprotegida.com.py',
    web: 'saludprotegida.com.py',
    centroDeMarca: 'https://nelargon.github.io/sp-brandcenter/',
  };

  /* Los colores que usa el taller (los mismos de la vitrina) */
  const SP_COLOR = {
    navy: '#003B71', navyDeep: '#002A52', teal: '#00BCB4', tealDeep: '#007D77', tealInk: '#00695F',
    teal900: '#006B66', mint: '#80DDD8', mintBg: '#E6F7F6', mintSoft: '#F2FBFA', blueIce: '#E6F0FA',
    blueSoft: '#B3C7DB', blueBg: '#E6EDF4', goldInk: '#7A5F10', goldBg: '#F8F1DE', ink: '#1D1D1B',
    text: '#3D3D3D', muted: '#6B6B6B', line: '#E8E8E8', surface: '#F5F5F5', blanco: '#FFFFFF',
    estadoBg: '#F4F5F6', estadoInk: '#5F6D6C',
  };

  window.SP_MARCA = { SP_LOGOS, SP_ARCHIVOS_LOGO, SP_ICONOS, SP_ALIADOS, SP_MATRIZ, SP_MAL, SP_CONTACTO, SP_COLOR };
})();
