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
| `assets/fonts/` | Nunito Sans e Inter (woff2 variable) con sus licencias SIL OFL. |
| `descargas/` | Los paquetes `.zip` y la paleta en `.ase`, CSS, SCSS y JSON. |

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

El sitio los declara en su propia página de **Versión y cambios**, a la vista
de cualquiera que lo use. Se anotan acá para que no se pierdan:

| Pendiente | Por qué importa |
|---|---|
| **Vectoriales SVG y EPS en CMYK** | Sin esto no hay imprenta ni gran formato. El isologotipo PNG (759 × 284) no pasa de **6,4 cm** a 300 dpi. Es el bloqueante principal. |
| Confirmar los dos tamaños mínimos | Los valores publicados son una propuesta corregida, no una medición. |
| Dueño y correo de marca | El centro no tiene todavía a quién derivar una consulta. |
| Circuito de aprobación de piezas | No hay plazo ni responsable definido. |
| Reglas de lockup con aliados | Ya hay más de diez marcas conviviendo con la de SP. |
| Abrir `SP_Paleta.ase` en Illustrator | El archivo se lee de vuelta y es correcto según la especificación: 62 bloques, 9 grupos, 44 colores y 3 tintas CMYK con sus valores. Eso descarta que esté mal escrito, pero no prueba que Adobe lo acepte — falta abrirlo una vez. |
| Guía de fotografía, iconografía y plantillas | Hay material, falta criterio escrito. |

## Correcciones que este centro introduce

Al publicarlo aparecieron tres cosas que el manual anterior daba por buenas:

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
