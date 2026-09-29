# Reporte: bloques de página, etapa 2 (render, fixture, verificación visual)

**Prompt:** `prompts/2026-09-29_026_bloques-hero-features-cards.md`, sección "Relevo a Claude Code"
**Fecha:** 2026-09-29
**Estado:** completado.

Codex se quedó sin cuota a la mitad de la etapa 2. Este reporte continúa desde donde lo dejó
cowork tras revisar el árbol de trabajo: se conservó `icons.mjs`/`LICENSE-lucide` (verificado de
nuevo, ver Verificación), `[...slug].astro`/`index.astro`, y las páginas de fixture con sus
imágenes. Se rehizo todo lo que la revisión marcó como no aprobado.

## Qué se hizo

**`packages/config-schema/blocks.mjs`** (compartido con el render, no solo con la validación):

- Se agregó `parseDocument(markdown)`, que hace el mismo recorrido de un solo paso que ya hacía
  `blockProblems`, pero además arma `segments`: una lista ordenada de trozos de markdown normal y
  bloques cerrados (con `intro`, `items`, `options`, línea), en el orden real del archivo.
  `blockProblems` ahora es un envoltorio de una línea sobre `parseDocument(...).problems`.
- Se exportaron `leadingSettings`, `contentLines` (líneas de un segmento sin sus `eyebrow:`/`icon:`
  iniciales) e `imageParagraphs`, que ya existían como privadas, para que el render los reuse en
  vez de re-detectar lo mismo con sus propias expresiones regulares.

**`packages/template/src/lib/remark-columns.mjs`** (`renderBlocks`, reescrito):

- Ya no hace su propio parseo con `split(/^:::item\s*$/m)` y regex de `setting()`. Llama a
  `parseDocument` una vez y recorre `segments`; cada bloque conocido (`hero`, `features`, `cards`,
  `columns`) tiene su propia función pequeña (`heroNode`, `sectionNode`, `columnsBlockNode`,
  `featureItemNode`, `cardItemNode`) de una instrucción por línea.
- Si `parseDocument` devuelve problemas, el error lanzado ahora incluye **todos**, uno por línea
  (`archivo:línea: mensaje`), no solo el primero.
- El camino de solo `:::columns` (sin hero/features/cards) no se tocó: sigue siendo el mismo
  parser antiguo con su propio `validateColumns`, tal como pide "`:::columns` debe seguir saliendo
  idéntico". Los dos caminos comparten el helper `columnsNode(columns)` de siempre.
- Cards: se agregó `markCardLink` (marca solo la **primera** liga del item con la clase
  `card-link`, recorriendo el árbol mdast ya construido, no el texto) y `markCardImage` (agrega
  `loading: lazy` a la imagen del item).

**`packages/template/src/layouts/BaseLayout.astro`:**

- **Ancho completo, arreglado de raíz.** `margin-left: calc(50% - 50dvw)` asume que el
  contenedor inmediato del bloque está centrado con márgenes simétricos. No lo está:
  `.page-home .page-content` tiene `padding-left: var(--s4)` (la barra decorativa) y un
  `max-width` distinto al de `.shell`. Eso rompía la fórmula en los dos sentidos: overflow a la
  derecha en viewports angostos, recorte a la izquierda en los anchos (ver Verificación). El
  arreglo calcula el desplazamiento real en vez de aproximarlo con un porcentaje: `--shell-inset`
  reconstruye la fórmula del propio `.shell` (`calc((100dvw - min(100dvw - 2.5rem, 68rem)) / 2)`)
  y `--content-inset` es una custom property que `.page-home .page-content` fija sobre sí mismo
  (`var(--s4)`, o `var(--s3)` bajo 42rem) y que el bloque hijo hereda. También se agregó
  `overflow-x: clip` en `<html>` como segunda red de seguridad: si algún bloque futuro vuelve a
  desbordar un poco, se recorta en vez de producir scrollbar.
- **Botón "Get a Quote" en modo compacto.** La regla que lo mostraba solo aplicaba entre 40rem y
  63.999rem. El modo compacto también se activa por JS arriba de 64rem cuando el menú no cabe
  (Stuart real, no el fixture). Se quitó el techo de la media query: ahora aplica desde 40rem sin
  límite superior, así que se ve sin importar qué disparó el modo compacto.
- **Tarjetas, liga estirada.** Se quitó `.block-cards-item a::before { content: "→"; ... }` (ese
  `::before` iba antes del texto y además duplicaba la flecha que ya escribe el propio fixture en
  el markdown: `[Learn More →](...)`; ver "Dónde dudaste"). `.block-cards-item a::after` ahora
  solo aplica a `a.card-link` (la primera liga del item, marcada por el render), no a todas.
- **Formato.** Las reglas nuevas/rehechas de hero/features/cards (base y las dos media queries que
  las tocan) quedaron con una declaración por línea. El resto del archivo, que no se tocó, sigue
  en su formato de siempre (una regla por línea con sus declaraciones separadas por `;`).

**Fixture:** se conservó `sites/_example/content/blocks-fixture.md`, `icons-fixture.md` y las 5
imágenes que dejó el intento anterior; no se modificó su contenido.

## Sintaxis final de cada bloque

Sin cambios respecto al reporte de la etapa 1 (la gramática no se tocó en esta etapa):

```md
:::hero
eyebrow: Optional short label
![Decorative hero image](/images/hero.jpg)
# Page H1
## Optional subtitle
Optional paragraph and **[button link](/contact/)**.
:::

:::features dark
eyebrow: Optional short label
## Optional section heading
Optional intro paragraph.
:::item
icon: shield-check
### Feature title
Feature text.
:::

:::cards
:::item
![Card image](/images/card.jpg)
### Card title
Card text and [Learn More →](/destination/).
:::

:::columns
First column Markdown.
:::next
Second column Markdown.
:::
```

`cards` no soporta `eyebrow:` a nivel de bloque (fuera de alcance de este prompt: la tabla del
punto 1 no lo pide; `features` sí). La flecha del link de cada card se escribe a mano en el
Markdown, como en el fixture; el render no la agrega. Solo la primera liga de un item `cards` se
vuelve el destino clicable de toda la tarjeta.

## Verificación

Con browser real de Chrome no fue posible: la extensión de Claude in Chrome no estaba conectada
en esta sesión (`Browser extension is not connected`). Se usó Playwright (ya está en
`node_modules` como dependencia del propio proyecto, con Chromium instalado) contra el sitio
**construido** (`npm run build:site`), servido por un servidor estático propio con content-type
correcto por extensión. Ver "Qué te sorprendió del repo" para por qué no se usó `astro dev`.

| Comando | Resultado |
| --- | --- |
| `node --test scripts/blocks.test.mjs` | 8 pruebas, sin cambios de comportamiento tras el refactor a `parseDocument`. |
| `npm run check` | 18 pruebas, 0 errores/advertencias de Astro. |
| `npm run build:site -- stuart-homeowners` | 10 páginas. |
| `npm run build:site -- _example` | 8 páginas (incluye `blocks-fixture` e `icons-fixture`). |
| `rg -n '^# ' sites/*/content/**/*.md` | Un solo resultado: `blocks-fixture.md:11`, dentro de `:::hero`. Ninguna página tiene H1 fuera de hero. |
| Diff de los 20 SVG de `icons.mjs` contra `lucide-static@1.48.0` (`npm pack`, ignorando espacios) | Coinciden exactamente los 20. |

**Medidas de `blocks-fixture` por ancho** (servidor estático, `document.documentElement`):

| Ancho | scrollWidth / clientWidth | `<h1>` | Imagen hero | Imágenes cards | Contraste texto/fondo del hero* |
| --- | --- | --- | --- | --- | --- |
| 390px | 390 / 390 — sin scroll horizontal | 1 | `loading=eager fetchpriority=high decoding=async alt=""` | `loading=lazy` ×4 | 15.85:1 |
| 768px | 768 / 768 — sin scroll horizontal | 1 | igual | igual | 7.9:1 |
| 1280px | 1280 / 1280 — sin scroll horizontal | 1 | igual | igual | 14.99:1 |
| 1440px | 1440 / 1440 — sin scroll horizontal | 1 | igual | igual | 15.33:1 |

\* Muestreado en el borde derecho de `.block-hero-content` (el punto donde la capa es más clara
pero todavía puede haber texto), comparado contra el color de texto calculado del H1. Los cuatro
anchos pasan AA (4.5:1) con margen amplio.

Todas las imágenes del fixture cargaron con `naturalWidth > 0` en los cuatro anchos. Sin errores
de consola en ninguna corrida.

**Liga estirada de las cards:** `a.card-link` de la primera card apunta a `/about-fixture/`.
Clic simulado cerca de la esquina inferior derecha de la tarjeta (fuera del texto de la liga)
navegó correctamente a `/about-fixture/`.

**`icons-fixture`:** los 20 `data-icon` renderizados son únicos y coinciden uno a uno con
`ICON_NAMES`.

**Botón "Get a Quote" en modo compacto, Stuart real** (antes de este fix solo se veía entre 40rem
y 64rem):

| Ancho | `.site-header.is-compact` | Botón visible |
| --- | --- | --- |
| 1024px | sí | sí |
| 1280px | sí (JS: el menú de Stuart no cabe) | sí — antes del fix, no se veía aquí |

## Una línea por captura

Guardadas en `_drafts/review-2026-09-29/026/` (mirado antes de escribir este reporte):

- `blocks-fixture-390.png`: hero a todo lo ancho con degradado oscuro y texto blanco, features
  apiladas, columns apilado (imagen, luego texto y botón), cards en una columna, features-dark
  apilado; sin scroll horizontal.
- `blocks-fixture-768.png`: header ya en modo compacto (botón junto al ícono de teléfono), cards
  en 2 columnas.
- `blocks-fixture-1280.png`: nav completo (el de `_example` es corto y cabe), cards en 4
  columnas, hero a todo lo ancho y sin recorte de ningún lado.
- `blocks-fixture-1440.png`: igual que 1280, hero y features-dark llegan exactos a ambos bordes
  de la ventana.
- `icons-fixture-1280.png`: los 20 íconos de Lucide, uno por feature, en 5 bloques de 4; título de
  página normal (`<h1>Icons fixture</h1>`) porque la página no usa hero.
- `stuart-header-1024.png`: header de Stuart en modo compacto con el botón "Get a Quote" visible.
- `stuart-header-1280.png`: header de Stuart todavía compacto a 1280 (el nav real no cabe) y con
  el botón visible: es la captura que confirma el fix del punto 4.
- `stuart-home-1280.png` (extra, no pedida): portada completa de Stuart sin cambios visibles más
  allá del botón — nada de bloques nuevos, barra decorativa intacta, sin scroll horizontal.

## Decisiones tomadas

- **Flecha de las cards:** el fixture ya escribe `[Learn More →](...)` con la flecha como texto.
  En vez de mover el `::before` roto a `::after` (que hubiera duplicado la flecha contra el texto
  del fixture), se quitó la flecha generada por CSS y se dejó que sea contenido de autor, como ya
  está en el fixture y en la sintaxis del reporte de la etapa 1.
- **Ancho completo:** en vez de solo agregar `overflow-x: clip` (que hubiera ocultado el síntoma
  sin arreglar que el hero se recorta ~44px por la izquierda en viewports anchos), se recalculó la
  fórmula del margen para que sea exacta. `overflow-x: clip` se agregó de todas formas como
  segunda red de seguridad, tal como sugiere la adenda.
- **`:::columns` sin tocar:** se dejó el camino viejo (regex propio, `validateColumns` exportado)
  intacto para páginas que no usan hero/features/cards, porque la adenda pide explícitamente que
  siga saliendo idéntico y el criterio de aceptación lo exige.

## Lo que tocaste fuera de lo pedido

Nada fuera de los archivos que la sección "Relevo a Claude Code" ya nombraba como pendientes de
rehacer (`remark-columns.mjs`, CSS de `BaseLayout.astro`) o de conservar (el resto). No se tocó
`apps/studio/`, `sites/stuart-homeowners/content/`, ni el schema de bloques en sí (las reglas de
`BLOCKS`/validación no cambiaron, solo se le agregó una forma de exponer la misma estructura ya
recorrida).

## Lo que no pudiste verificar

- No se pudo usar la extensión de Claude in Chrome (no conectada en esta sesión). La verificación
  visual y las medidas se hicieron con Playwright contra el build servido estáticamente, que mide
  lo mismo (DOM, `getBoundingClientRect`, `scrollWidth`, clics reales) pero no es una sesión de
  Chrome del usuario. Si Vic quiere una revisión con la extensión conectada, hay que repetirla.
- No se verificó el ítem "sin dependencias nuevas de npm" con un diff de `package-lock.json`
  porque no se tocó ningún `package.json`; no había necesidad de instalar nada nuevo (Playwright
  ya estaba en el repo).

## Dónde dudaste

- **"Una declaración por línea en el CSS nuevo, como el resto de BaseLayout.astro"**: el resto del
  archivo en realidad usa una regla por línea con declaraciones separadas por `;`, no una
  declaración por línea. Interpreté la nota como pidiendo el formato más legible/diffable para el
  CSS específicamente rehecho en esta etapa (igual que el pedido análogo para `blocks.mjs` en la
  etapa 1: "una instrucción por línea"), no como una descripción literal del estado actual del
  archivo. Apliqué el formato de una declaración por línea solo a las reglas de bloques que toqué
  o agregué; no reformateé el resto del archivo.
- **Causa del scroll horizontal**: la adenda la atribuye a "la barra de scroll vertical en
  Windows". Probando en Chromium headless (sin barra de scroll del SO en absoluto) el overflow
  seguía apareciendo en 390/768px, y aparecía un recorte simétrico por la izquierda en 1280/1440px
  que la barra de scroll no explica. La causa real es que `.page-content` no está centrado
  simétricamente (ver "Qué se hizo"). Documenté la causa real en el código y en este reporte por
  si la barra de scroll de Windows todavía agrega una diferencia adicional de unos px en un
  navegador real con scrollbar clásica; `overflow-x: clip` cubre ese caso también.

## Qué te sorprendió del repo

- **`astro dev` no sirve ninguna página que no sea la home, en este checkout.** Con
  `node scripts/dev-site.mjs <sitio>`, cada request a `/lo-que-sea/` cae en un warning de Astro
  ("`getStaticPaths()` route pattern was matched, but no matching static path was found") y 404,
  incluso para páginas que no toqué (`about-fixture`, `layout-fixture`) y en `stuart-homeowners`
  sin modificar. El log de sync de contenido muestra `[glob-loader] Duplicate id "index" found`
  para **cada** archivo, no solo para `index.md`; sospecho que es un bug de cómo Astro compara
  rutas absolutas de Windows (con espacios: `WICFL Microsites`) contra la URL base del loader
  `glob()`, y que termina colapsando toda la colección a una sola entrada con id `"index"`. `astro
  build` no lo sufre (genera las 8/10 páginas de cada sitio correctamente), así que no bloqueó
  nada de este prompt, pero vale un item de backlog: nadie puede usar `npm run dev` en Windows
  ahora mismo para ver más que la portada.
- La barra decorativa de `.page-home` (`padding-left` asimétrico en `.page-content`) es
  exactamente el tipo de detalle que rompe el truco clásico de CSS `calc(50% - 50vw)`. Vale la
  pena que quede como comentario en el CSS (ya quedó) para que el próximo bloque de ancho completo
  no reintroduzca el mismo bug.

## Lo que no se hizo

Nada de la lista "se rehace" quedó pendiente. No se renombró `remark-columns.mjs` a
`remark-blocks.mjs` (la adenda original del prompt permite mantenerlo; es lo que cambia menos y
así lo dejó también la etapa 1).

## Próximos pasos sugeridos

- Backlog: investigar el bug de `astro dev` en Windows con esta ruta (contiene espacios) antes de
  que alguien lo necesite para iterar visualmente sin pasar por un build completo.
- Cuando Studio migre a la gramática compartida (`apps/studio/`, fuera de este prompt), puede
  reusar `parseDocument`/`contentLines`/`leadingSettings` de `blocks.mjs` en vez de reimplementar
  la separación de `eyebrow:`/`icon:` una tercera vez.

## Commits

- `dd7ffe3` — `feat(template): page blocks hero, features and cards with shared grammar (W-121
  part 2b)`. Incluye el código, el fixture, este reporte y las entradas de BITACORA/BACKLOG.
- `git push origin main`: `60997e8..dd7ffe3`.
- **Validate and build** (`ci.yml`), run `36618580601`: verde (Test WICFL Studio, Validate all
  site configurations, Build `_example`, Build `stuart-homeowners`).
- **Publish site Workers** (`publish-sites.yml`), run `36618580787`: verde (Discover sites to
  publish, Publish `_example`, Publish `stuart-homeowners`). Ambas anotaciones son avisos de
  deprecación de Node 20/Ubuntu en los runners de GitHub, no relacionados con este cambio.

## Revisión de cowork

**Veredicto: aceptado.** Los detalles visuales pendientes van en el prompt 027, que es chico.

**Bien:**
- `parseDocument` queda como un solo parser para validar y para pintar. El render tiene una
  función por bloque y reporta todos los problemas a la vez.
- El diagnóstico del ancho completo fue correcto: la causa era el padding asimétrico de
  `.page-content`, no la barra de scroll.
- Íconos verificados contra `lucide-static` 1.48.0. En la captura de `icons-fixture` los 20 se
  ven bien.
- A 1280 px Stuart muestra "Get a Quote" en modo compacto, como se pidió.
- El reporte está completo y marca bien sus dudas.

**Detalles vistos en las capturas (van al 027):**
1. **Cards:** la imagen no llena el ancho de la tarjeta. Queda un hueco arriba y a la derecha,
   porque el margen negativo no coincide con el padding real.
2. **Features con 4 ítems:** se parten en 3 + 1. La rejilla tiene fijas 3 columnas; debe seguir
   el número de ítems (2, 3 o 4).
3. **Espacios verticales:** entre eyebrow y H2, y entre H2 e intro, dentro de features y cards,
   hay huecos de casi una pantalla de alto a 1440. El eyebrow tiene que ir pegado a su H2.
4. **Hero:** si es lo primero de la página, debe ir pegado al header, sin el margen blanco de
   arriba, como en el diseño de Pavel. Lo mismo para el hueco grande entre el último bloque
   oscuro y el footer.
5. **Features claro:** el primer ítem lleva divisor a la izquierda. El divisor va solo *entre*
   ítems.
6. **Escape de HTML:** el valor de `eyebrow:` y la ruta de la imagen del hero se insertan en el
   HTML sin escapar. El contenido lo escribe el equipo, pero un `<` o unas comillas en el
   eyebrow rompen el marcado. Hay que escaparlos.

**Anotado, sin acción ahora:** `astro dev` falla con rutas con espacios (`Duplicate id
"index"`). No afecta el build ni Studio. Queda para después del lanzamiento.
