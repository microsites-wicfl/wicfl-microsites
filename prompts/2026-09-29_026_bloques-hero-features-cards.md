# 2026-09-29_026 — Bloques de página: hero, features y cards (W-121 parte 2, W-128)

**Backlog:** W-121, W-128
**Reporte esperado:** `reports/2026-09-29_026_bloques-hero-features-cards.md`

## Contexto

El diseño de la portada de Pavel (W-121) se arma con **bloques cerrados** escritos dentro del
mismo `.md`, con la misma idea que `:::columns` (W-122). No es un constructor libre: es un set
chico, consistente, responsive y validable en CI. Studio los inserta con botones y los muestra
en su vista en vivo; eso lo hace cowork después, no este prompt.

Hoy existe:
- `packages/template/src/lib/remark-columns.mjs`: el plugin que convierte `:::columns` /
  `:::next` / `:::` y la regla de "párrafo que es solo una liga en negritas = botón".
- `scripts/build-site.mjs`: llama `validateColumns` antes del build.
- `apps/studio/src/columns.js`: una copia de las mismas reglas para validar al guardar. Está
  duplicada; este prompt crea la gramática compartida, y cowork migra Studio a ella.

Este prompt agrega tres bloques y el mecanismo común. El prompt siguiente trae `:::faq`,
`:::cta` y `:::areas`.

Así se ve la portada en el diseño de Pavel:

1. **Hero:** foto de fondo con capa oscura a la izquierda. Encima: eyebrow ("LOCAL.
   EXPERIENCED. FLORIDA FOCUSED."), H1, subtítulo, párrafo, botón y una línea chica.
2. **Tira de 3 íconos**, cada uno con título y texto, sobre fondo suave y con divisores.
3. **Sección oscura** con eyebrow, H2 e intro, y 3 tarjetas con ícono, título y texto.
4. **4 tarjetas con foto arriba**, título, texto y "Learn More →".

## Objetivo

### 1. Gramática compartida: `packages/config-schema/blocks.mjs`

JS puro, sin dependencias, importable desde Node (build) y desde el Worker de Studio (como hoy
`packages/config-schema/theme.mjs`).

**Qué exporta:**
- La definición de los bloques.
- `ICON_NAMES`.
- `blockProblems(markdown)`: devuelve `[{ line, message }]` con las líneas contadas en el texto
  completo del archivo, igual que hoy.

**Reglas generales:**
- Un bloque se abre con una línea exacta `:::<nombre>` más opciones separadas por espacio.
  Ejemplo: `:::features dark`.
- `:::` solo cierra. No se anidan bloques.
- Dentro de un bloque de código cercado (```) nada cuenta como marcador, como hoy.
- Nombres válidos: `columns` (igual que hoy), `hero`, `features`, `cards`. Un nombre desconocido
  o una opción desconocida es un problema con su línea.
- Separadores:
  - `columns` usa `:::next`, sin cambios.
  - `features` y `cards` usan `:::item`.
  - Lo que va antes del primer `:::item` es la intro del bloque: eyebrow, H2 y párrafo,
    opcionales.
- Líneas de ajuste: al inicio de la intro o de un item, líneas `clave: valor` con las claves
  conocidas `eyebrow` e `icon`. Se consumen y no se muestran como texto. Una clave conocida en
  un lugar donde no aplica es un problema; por ejemplo, `icon:` en `cards`.

**Mensajes:** en inglés claro, pensados para Pavel. Por ejemplo: `Line 12: a :::features block
needs 2 to 4 items, found 5.`

**Reglas por bloque:**

| Bloque | Opciones | Items | Reglas |
|---|---|---|---|
| `hero` | ninguna | ninguno | Solo uno por página y tiene que ser lo primero del cuerpo, antes de cualquier texto. Exactamente una imagen de fondo: un párrafo que es solo una imagen. Exactamente un `# H1`. `eyebrow:` opcional. `## subtítulo` opcional. Párrafos y botón (liga en negritas) opcionales. |
| `features` | `dark` opcional | 2 a 4 | Cada item: `icon:` obligatorio (de `ICON_NAMES`), un `###` título y texto. |
| `cards` | ninguna | 2 a 4 | Cada item: una imagen (párrafo que es solo una imagen), un `###` título, texto y una liga. La primera liga del item es el destino de toda la tarjeta. |

- **H1:** fuera del hero no se permite `# H1` en ninguna página. Hoy ninguna lo usa;
  compruébalo con un grep y repórtalo.
- **`build-site.mjs`:** usa `blockProblems` en lugar de `validateColumns` y falla con archivo y
  línea, como hoy. Mantén `validateColumns` exportado solo si algo más lo usa.

### 2. Plugin del template

Renombra `remark-columns.mjs` a `remark-blocks.mjs` (o mantenlo; lo que cambie menos) para que
haga el parse de todos los bloques con la gramática compartida. `:::columns` debe seguir
saliendo idéntico.

**Hero:**

- `<section class="block-hero">` a todo lo ancho de la ventana, rompiendo el contenedor.
- La foto es un `<img>` real detrás del texto, con `object-fit: cover`, no un
  `background-image` de CSS. Así se puede priorizar:
  - `loading="eager"`, `fetchpriority="high"`, `decoding="async"`;
  - `alt=""`, porque es decoración (W-128: nada importante va escrito dentro de la foto).
- La capa oscura es un degradado desde la izquierda, usando el color del footer del tema o la
  tinta.
- Todo el texto va en blanco y tiene que pasar AA contra la parte más clara de la capa donde hay
  texto.
- En celular la capa cubre todo.
- El H1 del hero es el H1 de la página:
  - `[...slug].astro` e `index.astro` no pintan su `<h1>{title}</h1>` cuando la página empieza
    con hero;
  - usa `remarkPluginFrontmatter` de `render()`: el plugin marca `hasHero`;
  - el `title` del frontmatter sigue siendo el `<title>` del documento.
- **Eyebrow:** texto chico en mayúsculas con letter-spacing, arriba del H1. Úsalo igual en los
  tres bloques.

**Features:**

- Sin `dark`: tira de fondo suave (`--variant-surface`), ítems en fila con divisor vertical
  entre ellos, e ícono a la izquierda del título y del texto.
- Con `dark`: sección a todo lo ancho con el color del footer del tema; intro en blanco; ítems
  como tarjetas con borde claro translúcido, ícono arriba, título y texto.
- En celular, los ítems se apilan.

**Cards:**

- Grid de 2 a 4 columnas según el número de ítems; 2 columnas en tablet y 1 en celular.
- La imagen va arriba, recortada a una proporción fija (por ejemplo 16:10) con
  `object-fit: cover` y `loading="lazy"`.
- Después van el título y el texto, y al final la liga con "→".
- Toda la tarjeta es clicable con el patrón de liga estirada: una sola `<a>` real, accesible, con
  `::after` cubriendo la tarjeta.

**Íconos:**

- Un set cerrado de unos 20 íconos inline SVG, tomados de Lucide (licencia ISC). Guarda
  `LICENSE` o el aviso en el mismo directorio.
- Usa los nombres de Lucide tal cual: `map-pin`, `shield-check`, `users`, `house`,
  `file-text`, `triangle-alert`, `waves`, `tree-palm`, `sailboat`, `trees`, `phone`, `mail`,
  `clipboard-check`, `key-round`, `umbrella`, `sun`, `cloud-rain`, `wind`, `hammer`,
  `badge-dollar-sign`.
- Van con `currentColor` y `aria-hidden`.
- No hay subida de íconos.

**Ancho completo:** hero y `features dark` rompen el contenedor.
- La barra decorativa izquierda de `.page-home .page-content::before` no debe atravesar esos
  bloques: quítala en las páginas que tengan un bloque de ancho completo.
- Sin scroll horizontal. Ojo con `100vw` y la barra de scroll: usa una técnica que no lo cause y
  mídelo.

**Tema:** todo usa los tokens de tema existentes (`--site-accent`, `--variant-surface`, color
del footer, fuentes de W-123). Nada de colores fijos que ignoren el tema.

### 3. Agregado del prompt 025: botón en modo compacto

Cuando el header está en modo compacto y la ventana mide 40rem o más, el botón "Get a Quote" se
ve junto al ícono de teléfono, no solo dentro del menú. En menos de 40rem se queda como está.

### 4. Página de prueba

Agrega `sites/_example/content/blocks-fixture.md` con `showInNav: false` y `navOrder` sin
definir. Contiene:
- un hero;
- `features` normal con 3 ítems;
- un `:::columns` con imagen y texto y un botón;
- `cards` con 4 ítems;
- `features dark` con 3 ítems.

Reglas de contenido:
- El texto es de relleno obvio en inglés ("Fixture heading", etc.).
- Las imágenes son placeholders generados por ti: degradados o formas simples en JPG o WebP de
  menos de 150 KB, en `sites/_example/public/images/`. No uses fotos de terceros.
- No toques el contenido de `sites/stuart-homeowners/`.

### 5. Pruebas

Pruebas unitarias con `node:test`, en `scripts/` como las actuales, para `blockProblems`:
- cada regla de la tabla, con un caso que falla y otro que pasa;
- que los marcadores dentro de un bloque de código cercado no cuenten;
- que `:::columns` siga igual que hoy;
- que un icono desconocido falle con la lista de nombres válidos.

Agrégalas a `npm run check`.

## Restricciones

- No toques `apps/studio/`. Cowork migra Studio a la gramática compartida y agrega los botones.
- Sin dependencias nuevas de npm. Los SVG de Lucide van copiados como texto, no como paquete.
- Sin JS nuevo en el sitio, salvo el ajuste del header del punto 3.
- Stuart debe verse igual que hoy: no usa bloques nuevos, solo recibe el ajuste del punto 3.

## Pasos

1. Implementa los puntos 1 a 5.
2. Corre `npm run check` y los builds de `stuart-homeowners` y `_example`.
3. Sirve `_example` con un servidor que entregue `public/` con el content-type correcto.
   Revisa que `naturalWidth > 0` en todas las imágenes.
4. Mide `blocks-fixture` a 390, 768, 1280 y 1440 px:
   - que no haya scroll horizontal;
   - que exista un solo `<h1>` en la página;
   - el contraste del texto del hero contra la capa;
   - la carga de la imagen del hero (eager + fetchpriority);
   - que las tarjetas completas sean clicables con una sola liga cada una.
5. Guarda capturas a esos anchos en `_drafts/review-2026-09-29/026/`, más una del header de
   Stuart a 1024 px (punto 3).
   - **Míralas antes de escribir el reporte.**
   - Describe en una línea por captura qué se ve.
   - Si algo se ve mal, es un hallazgo aunque los números pasen.
6. Haz commit y `git push origin main`. Espera Publish site Workers y reporta el hash, el id del
   run y su resultado.

## Criterio de aceptación

- [ ] `packages/config-schema/blocks.mjs` con `blockProblems`, usado por el build.
- [ ] Hero, features (normal y `dark`) y cards funcionando en `blocks-fixture`, con un solo H1.
- [ ] `:::columns` y el contenido de Stuart sin cambios visibles, salvo el botón del punto 3.
- [ ] Íconos de Lucide con su licencia.
- [ ] Pruebas nuevas en `npm run check`; checks y Publish en verde.
- [ ] Capturas revisadas y descritas en el reporte.

## Formato del reporte

El de `prompts/TEMPLATE.md`, más la tabla de medidas por ancho, una línea por captura y la
sintaxis final de cada bloque tal como quedó. Cowork la usa para los botones de Studio y para el
manual de Pavel.

## Commit message

```
feat(template): page blocks hero, features and cards with shared grammar (W-121 part 2)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```

---

## Adenda 2026-09-29: se ejecuta en dos etapas

El primer intento se detuvo a la mitad sin commit, y eso estuvo bien. Dejó en el árbol de
trabajo un `blocks.mjs` inicial, un render parcial y la página de prueba con sus imágenes. Para
que cada avance quede revisable, el prompt se ejecuta en dos etapas. Cada etapa tiene su commit y
su reporte, y cowork revisa entre una y otra.

### Etapa 1: gramática, validación, íconos y pruebas (sin render)

Parte del trabajo sin commit que ya existe. Termina:

- **`packages/config-schema/blocks.mjs`** con **todas** las reglas de la tabla del punto 1:
  - hero: primero, uno por página, exactamente una imagen y exactamente un `# H1`;
  - `features`: `icon:` obligatorio y válido;
  - `cards`: imagen, `###` y liga en cada item;
  - `eyebrow:` e `icon:` solo donde aplican;
  - `# H1` prohibido fuera del hero;
  - conteo de items;
  - opciones.
- **Código legible:**
  - una instrucción por línea;
  - líneas de 120 caracteres o menos;
  - funciones con nombre por regla;
  - un comentario corto por cada regla que diga por qué existe.

  El borrador actual está comprimido en líneas largas. Ese estilo no pasa la prueba de formato
  de Studio, que va a importar este archivo.
- **`ICON_NAMES`** y los SVG de Lucide como datos en `packages/config-schema/icons.mjs`, con
  export `{ name: "<svg ...>" }`, más el aviso de licencia ISC en
  `packages/config-schema/LICENSE-lucide`. Van en `config-schema` porque Studio los usará para
  su vista en vivo.
- **Pruebas completas** en `scripts/blocks.test.mjs` (lo pedido en el punto 5) dentro de
  `npm run check`.
- **Build:** `scripts/build-site.mjs` usa `blockProblems`.
- **Grep:** confirma que ninguna página actual tiene `# H1` y repórtalo.

**Para que el build siga verde sin el render:**

- Mueve `sites/_example/content/blocks-fixture.md` a `_drafts/026/blocks-fixture.md` (en
  gitignore) hasta la etapa 2.
- Las imágenes de la página de prueba pueden quedarse sin commit.
- Los cambios de render (`remark-columns.mjs`, `[...slug].astro`, `index.astro`,
  `BaseLayout.astro`) **no** van en este commit: déjalos en un `git stash` con nombre
  `026-render-wip` y dilo en el reporte.
- Si alguno de esos archivos necesita un cambio mínimo para usar `blockProblems`, sí va.

**Cierre de la etapa 1:**

- Commit: `feat(config-schema): shared page block grammar, icons and tests (W-121 part 2a)`.
- `git push origin main`, y espera a que los checks queden verdes.
- Reporte: `reports/2026-09-29_026a_gramatica-bloques.md`, con el formato de TEMPLATE y la
  sintaxis final de cada bloque.

### Etapa 2: render, página de prueba y verificación visual

Se ejecuta con un mensaje aparte, después de la revisión de cowork. Son los puntos 2, 3 y 4 y los
pasos 3 a 6 del prompt, partiendo del stash `026-render-wip` y de la página de prueba en
`_drafts/026/`.

- Reporte: `reports/2026-09-29_026b_render-bloques.md`.
- Commit: el mensaje original del prompt con "(W-121 part 2b)".

### Etapa 2: agregado después de la revisión de la etapa 1

- **Íconos exactos de Lucide.** Reemplaza los trazos de `packages/config-schema/icons.mjs` por los
  SVG exactos de Lucide:
  - Descarga `lucide-static` con `npm pack lucide-static` en un directorio temporal. No es una
    dependencia del repo.
  - Copia el contenido interior de `icons/<name>.svg` de los 20 nombres de `ICON_NAMES`.
  - Anota en `LICENSE-lucide` la versión del paquete usado.
  - Si algún nombre no existe en esa versión, cámbialo por el equivalente actual y actualiza
    `ICON_NAMES` y las pruebas.
  - Incluye en las capturas los 20 íconos. Como `features` acepta 2 a 4 ítems, usa una página
    aparte, `sites/_example/content/icons-fixture.md` (`showInNav: false`), con 5 bloques
    `features` de 4 ítems cada uno.
- **Reporte completo:** el de la etapa 2 lleva todas las secciones de `prompts/TEMPLATE.md`.

### Relevo a Claude Code (2026-09-29): estado de la etapa 2

Codex se quedó sin cuota a la mitad de la etapa 2. Continúa Claude Code como ejecutor, con las
mismas reglas de `CLAUDE.md`.

Cowork revisó el árbol de trabajo. **No hay commit de la etapa 2**; todo está sin commit, y el
stash ya se aplicó (`git stash list` está vacío).

**Se conserva (revisado por cowork):**

- `packages/config-schema/icons.mjs` y `LICENSE-lucide`: íconos tomados de `lucide-static`
  1.48.0. Confirma con un diff contra el paquete que el contenido interior de cada SVG coincide
  exactamente.
- `[...slug].astro` e `index.astro`: usan `remarkPluginFrontmatter` para `hasHero` y
  `hasFullBlock`, y omiten el `<h1>` si hay hero. Es la idea correcta.
- `sites/_example/content/blocks-fixture.md`, `icons-fixture.md` y las 5 imágenes de fixture.

**Se rehace (no pasa revisión):**

1. **`renderBlocks` en `remark-columns.mjs`.**
   - Está comprimido en líneas largas con varias instrucciones.
   - Hace su propio parse con regex en lugar de apoyarse en la estructura de
     `blockProblems`/`blocks.mjs`. Hoy hay dos parsers que pueden discrepar.
   - Solo reporta el primer problema.

   Reescríbelo legible: una instrucción por línea, 120 caracteres o menos. Idealmente
   `blocks.mjs` exporta una función que devuelva la estructura de bloques ya separada (intro,
   items, ajustes, líneas), y el plugin solo la convierte en nodos. Si hay errores, falla con
   **todos** los problemas, no solo el primero.
2. **Cards: la liga estirada.**
   - `.block-cards-item a::after` estira **todas** las ligas de la tarjeta. Solo la primera liga
     del item (la del destino) lleva la clase que se estira.
   - La flecha va **después** del texto ("Learn more →"), no antes.
3. **Ancho completo.** `100dvw` con `margin-left: calc(50% - 50dvw)` provoca scroll horizontal
   cuando hay barra de scroll vertical en Windows. Usa una técnica sin ese problema; por ejemplo,
   que el bloque salga del `main.shell` con un contenedor de ancho completo, o que
   `overflow-x: clip` quede en el lugar correcto. Mide `scrollWidth === clientWidth` con barra de
   scroll visible.
4. **Botón "Get a Quote" en modo compacto.**
   - La regla nueva solo aplica entre 40rem y 64rem.
   - El modo compacto también se activa por JS arriba de 64rem cuando el menú no cabe (Stuart a
     1280 px).
   - Debe verse en modo compacto siempre que la ventana mida 40rem o más.
5. **Estilos.** Una declaración por línea en el CSS nuevo, como el resto de `BaseLayout.astro`.

Después sigue los pasos 2 a 6 del prompt:

- checks y builds;
- servidor que entregue `public/`;
- medidas a 390, 768, 1280 y 1440;
- capturas **revisadas** en `_drafts/review-2026-09-29/026/`, más el header de Stuart a 1024 y a
  1280;
- reporte completo `reports/2026-09-29_026b_render-bloques.md`;
- commit `feat(template): page blocks hero, features and cards with shared grammar (W-121 part
  2b)`;
- push y Publish en verde.
