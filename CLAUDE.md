# Instrucciones del proyecto — `sp-brandcenter` (para Claude)

Este repo es el **Centro de Marca** de Salud Protegida: el sitio público donde
agencias, imprentas y cualquier proveedor sacan los recursos y las reglas.
Leé el `README.md` para saber qué hay dónde.

## Regla cero: actualizarse antes de trabajar

Hay varias sesiones trabajando en paralelo sobre este ecosistema, y el clon de
cada sesión es una foto del momento en que arrancó su contenedor. Antes de
empezar: `git fetch origin main && git checkout main && git pull`. Y toda rama
de trabajo nace de `origin/main` recién traído.

## Qué distingue a este repo de los otros

- **`sp-prototipo`** es el sitio de clientes. Cambia cada semana, va con
  `noindex`, y algún día se reemplaza.
- **`sp-interno`** es privado y **no se comparte con proveedores**.
- **Este repo lo lee gente de afuera de SP.** Todo lo que se escribe acá lo va
  a leer alguien que no conoce el proyecto y que va a producir una pieza con
  eso. Se escribe para esa persona.

## La regla que ordena qué entra

Ante cualquier contenido nuevo, la pregunta es: **¿le sirve a un competidor si
lo lee?** Si la respuesta es sí, va a `sp-interno` y acá no queda ni un
puntero con datos.

Concretamente **no entra acá**: qué puede prometer SP hoy frente a lo que está
en camino, la política sobre competidores, los registros de voz y su gating,
cifras de cartera, precios, y cualquier análisis de mercado.

## Reglas técnicas

- **No hay build, y es a propósito.** `index.html` es un solo archivo estático
  con las rutas relativas a `assets/` y `descargas/`. No introducir un
  framework ni un bundler sin una razón que se escriba en el `README`.
- **Los archivos de marca no se renombran.** Los nombres de `assets/logos/`
  son canónicos y el sitio los referencia; además son los que el proveedor ve
  al descargar. Un rename rompe las dos cosas.
- **La convención de nombres codifica el espacio de color**, no el formato:
  `SP_Isologotipo_Fullcolor_RGB.png`. Cuando lleguen los vectoriales serán
  `SP_Isologotipo_Fullcolor_CMYK.eps` y `..._RGB.svg`.
- **Verificar los estilos computados en el navegador**, no el código fuente.
  En este mismo sitio, dos reglas de fondo (`.f-busy`, `.f-pattern`) las ganaba
  en silencio un selector más específico: en el código estaban, en la pantalla
  no. Por eso llevan la especificidad explícita y un comentario.
- **Verificaciones móviles: 360 / 390 / 430 px como mínimo.** El diagrama del
  área de resguardo ya desbordó una vez a 360.
- **El sitio cumple sus propias reglas de contraste, y eso se mide.** El
  auditor es `node qa/revisar.mjs` (desde el 07/10/2026 vive en el repo; antes
  se armaba a mano en cada sesión). Lee las rutas de `PAGES`, así que una página
  nueva entra sola, y recorre todas en los dos temas y en 1280 / 430 / 390 /
  360 px. Mide el color computado de cada texto sobre su fondo real (4,5:1, o
  3:1 en texto grande) y además marca errores de consola, desborde a lo ancho,
  imágenes rotas, páginas sin h1 y subtítulos del índice que no llevan a ninguna
  sección. Ya encontró que `--faint` reprobaba en claro (2,55) y raspaba en
  oscuro (4,44). **Antes de tocar un token de color, y antes de fusionar
  cualquier cambio al sitio, correlo.** Los dos falsos positivos conocidos ya
  quedan afuera solos: el hero pinta con degradado (no tiene `background-color`
  medible) y las tarjetas `.demo` fallan a propósito — son la demostración.
  Necesita Playwright instalado fuera del repo; el sitio sigue sin dependencias.
- **Las miniaturas son una optimización de RED, no de bytes en general.** La
  grilla de descargas muestra `assets/miniaturas/` y descarga el archivo real.
  Solo existe miniatura donde de verdad ahorra: en los isologotipos y los
  favicons chicos la miniatura pesaba MÁS que el original, así que no se generó.
  En el artefacto autocontenido no se usan: sin red, solo agregarían peso.
- **Los dos temas se prueban.** El sitio responde a `prefers-color-scheme` y al
  toggle; un color que solo funciona en claro es un bug, no una preferencia.
- **El sitio cumple sus propias reglas.** El logo del header no tiene un tamaño
  elegido a ojo: sale del mínimo publicado. El isologotipo es 759 × 284 (razón
  2,673:1) y su mínimo es 180 px de ancho, o sea **67,3 px de alto** — por eso
  va a 68. Por debajo de 900 px ya no entra sin incumplirlo, así que ahí el
  header pasa al **isotipo**, que es lo que la matriz de uso indica para
  espacios chicos. Si alguien achica ese logo, rompe la regla de la página que
  tiene al lado.

## Regla de contenido: nada se publica sin verificar

Este sitio corrige tres afirmaciones del manual anterior que no resistían la
verificación. Esa es la vara: **un número que se publica acá es un número que
alguien midió.**

- Los ratios de contraste se calculan, no se estiman.
- Los tamaños mínimos se derivan de la dimensión real del archivo.
- Lo que no está verificado se publica **marcado como pendiente**, nunca
  omitido y nunca afirmado. Un "pendiente" honesto vale más que un dato
  completado por inferencia.

## Tipografía y lenguaje

Valen las reglas del ecosistema, y acá se predican además de aplicarse:

- **Nunito Sans es display, Inter es lectura.** Si el texto tiene más de una
  línea o termina en punto, va en Inter.
- **Se escribe en el idioma del cliente.** Prohibido "cartilla", "prestación",
  "práctica". Ante una palabra nueva: ¿la dice una familia en su casa?
- **Este centro solo distribuye tipografías con licencia libre.** Nunito Sans e
  Inter son SIL OFL: se pueden repartir sin trámite, y por eso el sitio existe.
  **Nunca subir una tipografía comercial acá**, aunque aparezca en los archivos
  internos de la marca — una página pública de descarga no cumple los términos
  de casi ninguna licencia comercial. Si hace falta discutir el estado de una
  licencia, esa conversación va a `sp-interno`, no a una página que lee
  cualquiera.

## Flujo git

Rama propia por sesión → PR en borrador → verificar el sitio en navegador →
fusionar. El `README.md` se actualiza en el mismo PR que cambia el sitio.
