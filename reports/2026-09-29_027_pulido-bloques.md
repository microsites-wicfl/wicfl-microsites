# Reporte: pulido visual de los bloques (W-121 parte 2c)

**Prompt:** `prompts/2026-09-29_027_pulido-bloques.md`
**Fecha:** 2026-09-29
**Estado:** completado.

## Qué se hizo

Los seis detalles de la revisión de cowork en `reports/2026-09-29_026b_render-bloques.md`,
todos en `remark-columns.mjs` y el CSS de `BaseLayout.astro`:

1. **Cards, imagen a todo el ancho.** `cardItemNode` ahora separa la imagen del resto del
   contenido con el helper compartido `splitLeadImage` (lo usa también `heroNode`) y la
   envuelve aparte; el texto queda en su propio `<div class="block-cards-body">`. En CSS,
   `.block-cards-item` perdió su `padding`; la imagen mide `width: 100%` sin margen negativo, y
   `.block-cards-body` tiene el padding que antes llevaba toda la tarjeta. Se quitó también el
   párrafo que Markdown pone alrededor de la imagen suelta (`.block-cards-item > p:first-child
   { margin: 0; }`), que era la causa real del hueco: el `<p>` conservaba su margen de
   párrafo por defecto y empujaba la imagen hacia abajo.
2. **La rejilla sigue al número de ítems.** `sectionNode` pone `data-items="N"` en
   `.block-inner` (N = `block.items.length`). El CSS define `.block-inner[data-items="2|3|4"]`
   con 2, 3 o 4 columnas; en tablet (42.001–62rem), `[data-items="4"]` baja a 2 columnas, para
   `features` y `cards` por igual (antes solo aplicaba a `cards`). En celular sigue en 1
   columna (regla existente, sin tocar).
3. **Espacios verticales.** Nueva función `introNode`: envuelve eyebrow + H2 + párrafo de
   intro en un `<div class="block-intro">` que es **un solo** ítem del grid exterior. Dentro de
   ese div el flujo es de bloque normal, así que los márgenes colapsan como en cualquier
   página; se fijó `.block-intro h2 { margin: 0 0 var(--s2); }` y `.block-intro p { margin: 0;
   }` para que el eyebrow (que ya tenía `margin-bottom` chico) quede pegado al H2 y el H2 deje
   un solo espaciado de párrafo antes de la intro. La causa real del hueco enorme: `.block-inner`
   es `display: grid`, y un grid **no colapsa márgenes** entre sus propios ítems — el
   `margin-top: var(--s5)` del `h2` global (pensado para separar secciones en un artículo
   largo) se sumaba en vez de colapsar.
4. **Bloques de ancho completo, pegados a los bordes.** El hero siempre es el primer contenido
   del body cuando existe (la gramática lo exige), así que `.block-hero { margin-top: 0; }` es
   incondicional, más `main:has(> .page-content > .block-hero) { padding-top: 0; }` para el
   padding del propio `main`. Para el cierre: `section.block-hero:last-child,
   section.block-features.block-dark:last-child { margin-bottom: 0; }`, el mismo `:has()` con
   `:last-child` para el `padding-bottom` de `main`, y un selector de hermano
   (`main:has(...) ~ .site-footer { margin-top: 0; }`) para el `margin-top` del footer, que
   era la tercera fuente del hueco. Sin esto, quitar solo el padding de `main` dejaba ~64px
   (el `margin-block` del propio bloque) o ~160px (bloque + footer) de hueco real.
5. **Features claro, divisor solo entre ítems.** `.block-features-item:not(:first-of-type)`
   en vez de `:not(:first-child)`: como `.block-intro` es un `<div>` que antecede a los
   `<article>` de cada ítem, `:first-child` nunca los alcanzaba (el primer *hijo* del grid es
   el intro, no el primer ítem); `:first-of-type` está acotado a la etiqueta `<article>`, así
   que sí encuentra el primer ítem real sin importar qué lo precede.
6. **Escape de HTML.** `escapeHtml(value)` (reemplaza `&`, `<`, `>`, `"`) aplicado en los tres
   lugares que el prompt pide: el valor de `eyebrow:` (`eyebrowHtml`), la ruta de la imagen del
   hero (`heroNode`) y el nombre del ícono en `data-icon` (`icon`). Dos pruebas nuevas en
   `scripts/remark-columns.test.mjs` construyen un `:::hero` con
   `eyebrow: A <b>"test"</b> & more` y con una ruta de imagen con `"` y `<>`, y confirman que
   el HTML resultante los muestra escapados, no como marcado.

Nada de esto tocó `packages/config-schema/blocks.mjs` ni ninguna página de prueba, como pide la
restricción.

## Verificación

| Comando | Resultado |
| --- | --- |
| `node --test scripts/remark-columns.test.mjs` | 5 pruebas (las 3 existentes + las 2 nuevas de escape). |
| `npm run check` | 20 pruebas, 0 errores/advertencias de Astro. |
| `npm run build:site -- stuart-homeowners` | 10 páginas. |
| `npm run build:site -- _example` | 8 páginas. |

Con el mismo servidor estático del reporte anterior (`_drafts/026/static-server.mjs`, content-type
correcto) y Playwright (la extensión de Claude in Chrome sigue sin conectar en esta sesión), medí
`blocks-fixture` a 390/768/1440 e `icons-fixture` a 1280:

| Ancho | scrollWidth/clientWidth | Hueco imagen de card (arriba/izq/der) | Columnas por `data-items` | eyebrow→H2 / H2→intro | Hero pegado al header / hueco antes del footer | Borde del 1er ítem de features claro |
| --- | --- | --- | --- | --- | --- | --- |
| 390px | 390/390 | 1px / 1px / 1px (solo el borde de la tarjeta) | 3→1, 4→1, 3→1 | 0px / 16px | 0px / 0px | `0px` (ítems 2 y 3: `1px`) |
| 768px | 768/768 | 1px / 1px / 1px | 3→3, 4→2, 3→3 | 0px / 16px | 0px / 0px | `0px` |
| 1440px | 1440/1440 | 1px / 1px / 1px | 3→3, 4→4, 3→3 | 0px / 16px | 0px / 0px | `0px` |
| `icons-fixture` 1280px | — | — | los 5 bloques de 4 ítems → 4 columnas | — | — | — |

El "1px" de la imagen de la card es el borde de la propia tarjeta (`border: 1px solid
var(--line)`), no un hueco: la imagen llena el resto exacto. `stuart-homeowners` (sin bloques)
midió `scrollWidth === clientWidth === 1280` sin cambios visibles.

**Antes de arreglar el punto 4**, medí de más: quitar solo el `padding-top`/`padding-bottom` de
`main` dejaba 64px de hueco arriba (el `margin-block` del propio `.block-hero`) y 160px abajo
(`margin-bottom` del bloque oscuro + `margin-top` del footer, 64 + 96). Los números de la tabla
de arriba son **después** de corregir las tres fuentes.

**Antes de arreglar el punto 5**, `.block-features-item:not(:first-child)` seguía poniendo borde
en el primer ítem (`1px` en los tres anchos) porque `.block-intro` es el verdadero primer hijo
del grid. Con `:first-of-type` el primer `<article>` mide `0px` en los tres anchos.

## Una línea por captura, comparada con el 026

Guardadas en `_drafts/review-2026-09-29/027/` (miradas antes de escribir este reporte):

- `blocks-fixture-390.png`: hero ya pegado al header (antes había un margen blanco arriba);
  cards con la imagen llenando la tarjeta de borde a borde (antes quedaba un hueco arriba y a
  la derecha); features claro con el eyebrow pegado al título y sin línea antes del primer
  ítem; sección oscura pegada al footer sin hueco blanco.
- `blocks-fixture-768.png`: mismo resultado que 390, y las 4 cards ahora en 2 columnas (antes
  no había regla específica para features/cards de 4 en tablet fuera de cards).
- `blocks-fixture-1440.png`: hero y sección oscura tocan los bordes de la ventana; las 4 cards
  en una sola fila con imágenes exactas; eyebrow/H2/intro de features y cards leídos como un
  solo grupo compacto (antes el salto entre eyebrow y H2 se notaba claramente).
- `icons-fixture-1280.png`: los 5 bloques de 4 ítems se ven en 4 columnas parejas (antes se
  partían 3 + 1 con un hueco visible donde faltaba el cuarto).

## Decisiones tomadas

- **Punto 4, alcance:** el prompt menciona el hero solo para "pegado al header" (no lo generalicé
  a cualquier bloque de ancho completo), porque la gramática solo obliga al hero a ser el primer
  contenido; un `features dark` sí puede aparecer al inicio sin hero y el prompt no pidió tratarlo
  igual ahí. Para el cierre sí cubre ambos (hero o `features dark`), como pide el texto.
- **`:has()`:** el prompt solo desaconseja `:has()` "complicados" para el punto 2 (contar ítems).
  Para el punto 4 usé `:has()` de una sola condición de existencia/posición
  (`main:has(> .page-content > .block-hero)`, con `:first-of-type`/`:last-child` adentro), que es
  exactamente el estilo "selector de posición" que el prompt sugiere como alternativa simple; no
  hay JS ni marca de frontmatter nueva involucrada.
- **`data-items` en vez de contar con CSS:** puse el número directamente en el HTML
  (`sectionNode`), como pide el prompt, en lugar de intentar inferir el conteo con selectores
  `:nth-child`/`:has()` en CSS.

## Lo que tocaste fuera de lo pedido

Nada. Los tres archivos que cambiaron (`BaseLayout.astro`, `remark-columns.mjs`,
`scripts/remark-columns.test.mjs`) son exactamente los que la restricción permite.

## Lo que no pudiste verificar

Igual que en el reporte anterior: sin la extensión de Claude in Chrome conectada, la
verificación visual fue con Playwright contra el sitio construido, no con una sesión real de
Chrome.

## Dónde dudaste

- El hueco real antes de llegar al fix del punto 4 tenía **tres** fuentes apiladas (padding de
  `main`, `margin-block` del propio bloque, `margin-top` del footer), no una sola. El prompt
  solo menciona "sin margen blanco arriba" / "no queda hueco grande antes del footer" sin
  detallar la causa, así que medí primero en vez de asumir que bastaba con tocar `main`.
- Punto 5 (divisor de features): mi primer intento usó `:not(:first-child)`, que parecía
  correcto por el nombre pero dejó de funcionar en cuanto el punto 3 envolvió el intro en su
  propio `<div>`. No fue obvio mirando solo el CSS; lo encontré al medir con Playwright
  (`border-left` del primer ítem seguía en `1px`). Queda como recordatorio de que estos dos
  puntos interactúan: el fix del punto 3 le cambia la estructura de hijos al punto 5.

## Qué te sorprendió del repo

Nada nuevo respecto al reporte anterior. El servidor estático y el flujo de verificación con
Playwright de la etapa 2 se reusaron tal cual.

## Lo que no se hizo

Nada de los 6 puntos quedó pendiente.

## Próximos pasos sugeridos

- Cuando Studio importe estas clases (`block-intro`, `block-cards-body`, `data-items`) para su
  vista en vivo, debe replicar la misma estructura (intro envuelto, imagen de card separada del
  cuerpo) para que la vista previa no diverja del sitio publicado.
- El bug de `astro dev` en Windows (anotado en el reporte anterior, "sin acción ahora" según
  cowork) sigue sin tocar.

## Commits

Pendiente de completar después de commit/push (ver instrucciones del prompt): hash, resultado de
Validate and build y de Publish site Workers.
