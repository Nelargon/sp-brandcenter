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
| `descargas/` | Los paquetes `.zip` y la paleta en `.ase`, CSS, SCSS y JSON. |

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

Este repo publica **lo aplicable**: logos, color, tipografía, reglas de uso y
formatos. Nada de esto es exposición nueva — los logos ya se sirven desde
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
build: el chequeo es abrir el sitio.

## Continuidad: primera entrega de Inicio y Color (01/10/2026)

**Estado de revisión:** propuesta implementada en la rama
`codex/brandcenter-inicio-color-20261001`, destinada a un PR en borrador.
Esta entrega no autoriza merge, despliegue ni publicación. Consultar el PR
de esa rama para el SHA final, las comprobaciones y el estado vigente.

### Alcance y decisiones

La dirección aprobada es simplificar la experiencia del Centro de Marca:
primero la tarea, después la regla y finalmente el detalle técnico. La
referencia visual de esta entrega son las propuestas de Inicio y Color
revisadas; el home de lanzamiento de SP aporta aprendizajes de jerarquía,
espacio y claridad, sin trasladar objetivos de venta al manual.

- Inicio ofrece cuatro entradas: **Recursos, Diseñar, Escribir y Antes de
  entregar**. Los mismos grupos ordenan el encabezado y el índice contextual.
- Color muestra primero un ejemplo de uso, los dos colores principales y
  la descarga real de paleta. Imprenta, escalas y reglas de texto permanecen
  disponibles en bloques desplegables; los enlaces directos abren el bloque
  correspondiente.
- Nunito Sans conserva títulos y etiquetas; Inter conserva el texto de
  lectura. Navy ordena la jerarquía en claro. Turquesa oscuro sirve al texto
  y las acciones que necesitan contraste. Los radios se diferencian por
  función (10, 12, 16 y 20 px); la sombra de toque corresponde a controles.
- Se mantienen rutas anteriores, archivos canónicos, datos de color,
  permisos, advertencias y pendientes. El contenido de las demás páginas
  se conserva, salvo la aclaración del caption en Tipografía para reflejar
  el color secundario legible que ya usa cada tema.
- Se corrige una contradicción de Color: blanco para texto sobre navy o
  turquesa **900**, nunca turquesa 500. No cambia la paleta.
- Menús con teclado y Escape, foco visible, restauración de foco, alternativa
  de copiado manual y respeto por movimiento reducido forman parte de
  esta entrega.

Las nuevas rutas son `#/recursos`, `#/disenar`, `#/escribir` y
`#/entregar`. Las 16 rutas anteriores siguen disponibles. Uso y permisos,
pendientes y versión mantienen acceso desde el pie. Los assets, descargas
y el workflow de publicación no se modifican.

### Comprobaciones y cómo retomar

La validación local usa Chrome con las fuentes reales: 20 rutas en 360,
390, 430 y 1440 px, en temas claro y oscuro (160 combinaciones), sin
desbordamiento horizontal ni errores de JavaScript. Se comprueban contraste
de texto sobre fondos sólidos, navegación por teclado, Escape y foco,
anclas que despliegan detalles, copiado exitoso y bloqueado, destino de
descarga, índice móvil y movimiento reducido. Las demostraciones de
contraste deliberadamente incorrecto y los fondos con gradiente quedan
fuera del cálculo automático: no equivale a una certificación completa
de accesibilidad.

Tras revisión independiente se comprueba también abrir, cerrar y reabrir el
mismo fragmento por clic y por Enter, con foco en el destino. El anillo de
foco distingue superficies: turquesa brillante sobre el encabezado navy
(4,75:1 en ambos temas); en los desplegables usa el turquesa de texto de
cada tema (6,37:1 en claro y 10,55:1 en oscuro). Estas regresiones se prueban
en 390 y 1440 px, además de repetir la batería de 160 vistas.

Para retomar en Claude u otra sesión:

1. Leer este README y `CLAUDE.md`; localizar el PR en borrador de la rama
   indicada y comprobar su estado antes de editar.
2. Revalidar `main` y el SHA del PR. La base de esta entrega fue
   `618217c14b9447fa6667c38a78913d47cce7e748`.
3. Mantener la primera entrega en Inicio, Color y navegación; los cambios
   editoriales o rediseños de otras secciones son propuestas posteriores,
   pendientes de revisión. Brand Atlas no constituye una norma de SP.
4. Repetir las comprobaciones en el SHA que se proponga revisar, especialmente
   ambas apariencias, tamaños móviles, enlaces y acceso a los detalles.
5. Registrar en el PR cualquier cambio de alcance y sus pruebas. El workflow
   actual publica al hacer push a `main`; no usar merge o push a `main`
   como forma de obtener una vista previa.

Este registro resume decisiones de producto y estado técnico; no contiene
conversaciones privadas ni información estratégica interna.
