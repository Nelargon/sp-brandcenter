# sp-brandcenter — Centro de Marca de Salud Protegida

Sitio público con los recursos de marca de **Salud Protegida**: logos, color,
tipografía, voz, formatos locales y las reglas para quien produce piezas
por encargo de SP.

Existe para que ningún proveedor tenga que pedir un ZIP por mail —
ni trabajar con una versión vieja de la marca.

## 🌐 Ver en vivo

<https://nelargon.github.io/sp-brandcenter/>

## Qué hay acá

| Carpeta | Qué contiene |
|---|---|
| `index.html` | El sitio completo. Un solo archivo, sin build ni dependencias. |
| `assets/logos/` | Los 18 archivos de marca, con nombres canónicos. |
| `assets/aliados/` | Los 12 logos de aliados. **Marcas de terceros**, no de SP — ver abajo. |
| `assets/fonts/` | Nunito Sans e Inter (woff2 variable) con sus licencias SIL OFL. |
| `assets/iconos/` | Los 26 íconos de SP en SVG (`SP_Icono_[Nombre].svg`). Salen del archivo de íconos del sitio de clientes (`sp-prototipo`, `app/components/iconos-sp.js`): si allá se suma uno, se regenera acá. |
| `descargas/` | Los paquetes `.zip` y la paleta en `.ase`, CSS, SCSS y JSON. |
| `vitrina.html` · `vitrina/` | La fuente del artifact **Marca Salud Protegida**: la vitrina de la marca y el taller de piezas. Ver abajo. |
| `qa/revisar.mjs` | La revisión del sitio en un navegador: todas las rutas, los dos temas, cuatro anchos y el contraste de cada texto. Se corre con `node qa/revisar.mjs`; no es parte del sitio ni le agrega dependencias. |

## La vitrina y el taller (artifact de claude.ai)

`vitrina.html` y la carpeta `vitrina/` son la fuente de **Marca Salud Protegida**
(<https://claude.ai/artifact/EbRBjVG8FpLZa7mfDsnWkM>): la marca en una página,
para mostrarla en tres minutos, y un **taller** que arma piezas con la marca ya
puesta (post, historia, cuadrado, imagen para compartir, diapositivas, membrete A4,
tarjeta personal, firma de correo y mensaje de WhatsApp) y revisa el texto con las
reglas de la marca antes de dejarlas bajar. Nació el 07/10/2026 (dirección «B · La
muestra», lámina 80 de `sp-prototipo/docs/diseno`).

| Archivo | Qué es |
|---|---|
| `vitrina.html` | La página. Va sin `<!doctype>` ni `<head>` porque claude.ai le pone el esqueleto al publicar. |
| `vitrina/estilos.css` | Los estilos. Los usa también la capa interna (`sp-interno/marca-interna/`). |
| `vitrina/marca.js` | Los datos: **el logo vive en un solo lugar** (`SP_LOGOS`), más los íconos, los aliados, la matriz de uso y el contacto. El teléfono está dos veces a propósito: `telefono` es como lo lee la gente, «(021) 319 0000», y `telefonoEnlace` es el de los `tel:` y WhatsApp, el único lugar donde va el +595. |
| `vitrina/taller.js` | El motor del taller: cada pieza se dibuja en un canvas al tamaño real (lo que se ve es lo que se baja), con su revisión de texto. |
| `vitrina/pagina.js` | Lo que hace la página: grillas, descargas y las láminas de muestra. |

- **No es un build.** El artifact carga estos archivos tal cual, los mismos
  `assets/` de este centro. Cuando cambia un logo acá y se vuelve a publicar, la
  vitrina, el taller y la firma de correo cambian con él.
- **Cómo se publica:** con la herramienta Artifact de Claude Code, `file_path`
  `vitrina.html`, `root` la raíz de este repo, en `files` los `vitrina/*` y los
  `assets/` que usa, y `capabilities: {downloads: true}`. Los `.zip` no viajan:
  claude.ai no los acepta, así que los paquetes se bajan desde este sitio.
- **Es privada hasta que Arturo la comparte.** Por eso este sitio no la enlaza
  todavía. GitHub Pages también sirve `vitrina.html`, pero sin esqueleto: el
  lugar para verla es el artifact.

## Marcas que no son de SP

`assets/aliados/` tiene doce logos de terceros. SP los usa por el acuerdo
comercial que tiene con cada aliado; el permiso es tácito y su versión escrita
está declarada como pendiente en el sitio.

Dos cosas que conviene saber antes de tocarlos:

- **No sirven para imprenta.** Miden de 29 a 124 px de ancho — entre 0,2 y
  1,0 cm a 300 dpi. Son los archivos de la franja de aliados del sitio de
  socios, y nada más. El vectorial lo tiene que dar cada aliado.
- **Las reglas para ponerlos al lado de la marca de SP** están en el sitio, en
  *Marca junto a otra marca* (`#/lockup`). La separación no se eligió a ojo:
  sale del área de resguardo que el centro ya publicaba.

Los **prestadores** y las **fotos de profesionales** tienen su espacio armado
en `#/red`, pero **sin contenido**: falta la lista y los permisos en un caso, y
el consentimiento de cada persona en el otro.

**No hay proceso de build.** Es HTML estático: se edita `index.html` y se
publica. Esa fue una decisión deliberada — un manual de marca cambia una vez
al año y no debe depender de que un pipeline siga funcionando dentro de dos.

## Por qué es un repo aparte

- **`sp-prototipo` es el sitio de clientes**, cambia cada semana, va con
  `noindex` y en algún momento se reemplaza. El manual de marca tiene otro
  ciclo de vida y otra audiencia.
- **`sp-interno` es privado** y su propio README dice, textual, *"No compartir
  acceso a este repositorio con proveedores."*

## Qué es público y qué no

Este repo publica **lo aplicable**: logos, color, tipografía, íconos, reglas de uso,
formatos y el formato de las presentaciones. Nada de esto es exposición nueva — los logos ya se sirven desde
`sp-prototipo`, los colores viven en su CSS y las dos tipografías son libres.

**No entra acá** y sigue viviendo en `sp-interno`: qué puede prometer SP hoy
frente a lo que está en camino, la política sobre competidores, los registros
de voz completos y cualquier cifra de cartera.

El criterio, ante la duda: *¿le sirve a un competidor si lo lee?*

## Pendientes conocidos

La lista completa vive en el sitio, en **Qué falta y qué llegó**
(`#/faltantes`), y **vive solo ahí**. Está separada en dos, porque son dos
conversaciones distintas: lo que **se le encarga a un diseñador** —con el
nombre exacto que tiene que tener cada archivo cuando vuelva— y lo que
**resuelve SP** puertas adentro. Esa página tiene además el pedido escrito en
texto, listo para copiar y mandar.

No se duplica acá: dos copias de la misma lista se separan con el tiempo y
después no se sabe cuál es la buena.

Lo único que se repite, porque ordena todo lo demás:

> **No hay un solo archivo vectorial.** El isologotipo más grande es un PNG de
> 759 × 284 px, que a 300 dpi da **6,4 cm** de ancho. Sin SVG y EPS en CMYK no
> hay imprenta ni gran formato.

## Correcciones que este centro introduce

Al publicarlo aparecieron cinco cosas que el manual anterior daba por buenas.
Las dos últimas salieron de mirar el archivo del logo, no el manual:

4. **El isologotipo no dice "MEDICINA PREPAGA".** Dice `SALUD PROTEGIDA`, en
   dos líneas. El sitio justificaba el mínimo de 180 px con que por debajo
   "MEDICINA PREPAGA deja de leerse" — texto que no está en el archivo. El
   número no cambia; la razón sí: la línea que se pierde primero es PROTEGIDA.
5. **El área de resguardo se medía con una letra que no existe.** La regla
   pedía "la altura de la letra «a» del logotipo", pero el logotipo va todo en
   mayúsculas. Ahora dice la **A** de SALUD, que sí se puede señalar y medir.

Y las tres originales:

1. **`SP-700` sobre `SP-50` da 3,30:1** — no llega a AA. El manual lo
   recomendaba para texto. El correcto es `SP-900` (5,77:1).
2. **`Ámbar-700` sobre `Ámbar-50` da 3,03:1** — tampoco llega. Sobre fondo
   ámbar claro el texto va en `#3D3D3D`; el sistema no tiene un ámbar
   suficientemente oscuro.
3. **El tamaño mínimo era uno solo (72 px) para dos piezas distintas.** A
   72 px de ancho el isologotipo queda en 27 px de alto y su texto en unos
   3 px por línea. Quedó separado en isologotipo e isotipo.

## Publicación

Cada push a `main` publica a GitHub Pages. No hay CI de build porque no hay
build: el chequeo es abrir el sitio y correr `node qa/revisar.mjs` antes de
fusionar.
