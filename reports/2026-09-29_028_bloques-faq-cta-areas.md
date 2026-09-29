# Reporte: bloques faq, cta y areas (W-121 parte 3, W-125)

**Prompt:** `prompts/2026-09-29_028_bloques-faq-cta-areas.md`
**Fecha:** 2026-09-29
**Estado:** completado.

## Qué se hizo

### 1. `:::faq`

- **Gramática** (`packages/config-schema/blocks.mjs`): `faq` usa separador `item`, 2 a 12
  ítems. Cada ítem necesita exactamente un `### Pregunta` y al menos un párrafo de respuesta.
  `eyebrow:` se agregó a la lista de bloques donde aplica (junto con `cta`/`areas`).
- **Render** (`packages/template/src/lib/remark-columns.mjs`): `faqItemParts(item)` separa la
  línea de pregunta del resto (la respuesta) **una sola vez**; tanto `faqItemNode` (el
  `<details><summary>` que se ve) como `faqItemEntry` (el par para el JSON-LD) parten de esa
  misma llamada, así que no hay dos lecturas que puedan discrepar. Sin JS: el signo
  "+"/"−" es CSS puro sobre el atributo `[open]` nativo de `<details>`.
  `faqIntroNode` es un wrapper propio (no el `introNode` compartido) porque el H2 y la liga
  "View all questions" van en la misma fila, alineados con `justify-content: space-between`.
- **Schema FAQPage:** `renderBlocks` junta `faqItemEntry` de **todos** los `:::faq` de la
  página, en orden, en `remarkPluginFrontmatter.faq`. `site-data.mjs` expone
  `faqPageJsonLd(faq)` (JSON válido, `@type: FAQPage`, con cada `<` del texto escapado como
  entidad Unicode para que un `</script>` dentro de una respuesta no rompa la página);
  `BaseLayout.astro` lo recibe como prop `faqJsonLd` y lo imprime en `<head>`
  junto al `InsuranceAgency` existente, solo si hay preguntas. `[...slug].astro` e
  `index.astro` calculan la prop desde `remarkPluginFrontmatter.faq`.

### 2. `:::cta`

- **Gramática:** sin ítems (como hero). Exactamente un `## H2`, a lo más una imagen suelta,
  exactamente un botón (párrafo que es solo una liga en negritas).
- **Línea chica, regla exacta:** `ctaFinePrint(lines)` en `blocks.mjs`, exportada. Agrupa el
  contenido en párrafos (el mismo `paragraphGroups` que ya usan `imageParagraphs` y las
  nuevas `buttonParagraphs`/`linkParagraphs`); encuentra el párrafo-botón; si es **el último**
  párrafo, no hay línea chica (nada después del botón). Si hay algo después, la línea chica es
  **el último párrafo del bloque**, y solo cuenta como tal si es de **una sola línea** (esa es
  la definición de "corto": no cuántos caracteres tiene, sino que el autor lo escribió como un
  renglón suelto, igual que un párrafo normal de una liga). El render (`ctaNode`) llama a la
  misma función, así que lo que se valida es exactamente lo que se separa visualmente.
- **Render:** sección de ancho completo igual que el hero (mismo `--shell-inset`); con foto,
  `<img class="block-bleed-media" alt="" loading="lazy">` de fondo con la misma capa oscura en
  degradado; sin foto, color oscuro del tema. Desktop: texto a la izquierda
  (`.block-cta-text`), botón y línea chica a la derecha (`.block-cta-actions`), con
  `display:flex; justify-content:space-between`. Celular: `flex-direction:column`.
- **Separación del footer:** ver "Qué te sorprendió del repo" — con foto, la foto ya lo separa
  (el fondo de la foto no es plano); sin foto, `.block-cta-plain` usa un tono
  `color-mix(in srgb, var(--ink) 88%, white 6%)` (más claro que el `var(--ink)` puro del
  footer) más `border-block: 1px solid ...` para que nunca se confundan, aunque el bloque
  quede pegado justo antes del footer.

### 3. `:::areas`

- **Gramática:** sin opciones ni ítems. Solo `eyebrow:` y un `## H2`, ambos opcionales;
  cualquier otra línea con contenido es un problema con el mensaje exacto que pide el prompt
  ("the list of places comes from Site settings → Service area").
- **Config sin duplicar la lectura:** se creó `packages/template/src/lib/site-config.mjs` con
  `loadSiteConfig()` (lee `WICFL_SITE_CONFIG` una vez, cachea). `site-data.mjs` ahora importa
  `site` desde ahí (mismo valor, misma API pública, sin cambios para quien ya lo usa).
  `remark-columns.mjs` llama a `loadSiteConfig()` **solo dentro de `areasNode`**, no en el
  import de nivel superior: así, las páginas y pruebas que nunca usan `:::areas` (todas las de
  `scripts/remark-columns.test.mjs`, por ejemplo) siguen sin necesitar `WICFL_SITE_CONFIG`.
- **Render:** una fila (`display:flex`, se envuelve) con cada lugar de `geo.serviceArea` como
  `<span class="block-areas-item">` con el ícono `map-pin` y el texto **sin pasar por el
  parser de Markdown**: se inserta escapado directo, así que no hay forma de que una entrada
  del config se vuelva una liga por accidente. Divisor (`border-left`) solo entre ítems
  (`:first-of-type`, no `:first-child`, mismo motivo que en el 027: `.block-intro` va antes).
  En celular, grid de 2 columnas y sin divisores (no se veían bien partidos por fila).
- `sites/_example/site.config.json`: `geo.serviceArea` pasó de un solo lugar ("Stuart") a
  cuatro (agregué "Port Salerno", "Palm City", "Hobe Sound", ya usados como referencia en
  Stuart) para que el fixture realmente muestre divisores y el wrap de 2 columnas en celular.

### 4. Agregados

- **Franja oscura del hero a 768px (revisión del 027):** no era un problema de layout, era
  **especificidad de CSS**. `main .page-content img { height: auto }` (una clase + dos
  selectores de elemento) le ganaba a `.block-hero > img { height: 100% }` (una clase + un
  elemento) **en la propiedad `height` específicamente** aunque `position`/`inset` sí venían
  de la regla del hero: la especificidad se resuelve por declaración, no por regla completa.
  Con `height:auto`, la imagen usaba su relación de aspecto intrínseca (1600×900); a 768px de
  ancho eso da 432px de alto, contra los 480px del `min-height` del hero → 48px de franja
  visible. A 1440px la imagen intrínseca mide más que el hero, así que ahí nunca se notó.
  Arreglo: la imagen ahora lleva `class="block-bleed-media"` (compartida entre hero y cta) y el
  selector es `:is(.block-hero, .block-cta) .block-bleed-media` (dos clases), que sí le gana a
  la regla genérica. Verificado a 390/768/1280/1440: la imagen mide exactamente lo mismo que la
  sección en los cuatro anchos.
- **Debounce del formulario** (`ContactForm.astro`): el `input` en teléfono/email ahora arma
  un `setTimeout` de 1000ms (`saveDebounce`), reiniciado en cada tecla; solo al vencer el
  segundo sin teclear se llama a `saveContactInBackground()`. El `submit` agrega
  `clearTimeout(saveDebounce)` antes de todo lo demás, así que un envío antes de que venza el
  segundo cancela el guardado pendiente que nunca llegó a salir; un guardado que **ya** está en
  vuelo se sigue esperando exactamente como antes (`if (state.step === 3 && saveInFlight) await
  saveInFlight`, sin tocar). El de `focusout` queda igual de inmediato, sin debounce.

### 5. Pruebas y página de prueba

- `scripts/blocks.test.mjs`: tres pruebas nuevas (`faq`, `cta`, `areas`), cada una con un caso
  que pasa y uno que falla por cada regla (conteo de ítems, pregunta única, respuesta,
  H2 único, imagen única, botón único, contenido fuera de lo permitido en `areas`).
- `sites/_example/content/blocks-fixture.md`: se agregaron, en este orden, `:::areas`,
  `:::faq` (6 preguntas, una con **negrita** y una liga para probar que el JSON-LD las
  aplana a texto) y `:::cta` con `fixture-hero.jpg` **al final de la página**.
- `sites/_example/content/cta-plain-fixture.md` (nueva): una página que es *solo* un `:::cta`
  sin foto, así queda como primer **y** último contenido a la vez y se ven ambos extremos del
  ajuste de bordes (027, punto 4) más la variante sin foto en un solo vistazo.

## Sintaxis final de cada bloque

```md
:::faq
eyebrow: Optional short label
## Optional heading
[View all questions](/faq/)

Optional intro paragraph.
:::item
### Question text?
Answer paragraph.
:::item
### Another question?
Answer paragraph, links become their own text in the JSON-LD.
:::

:::cta
eyebrow: Optional short label
![Optional background photo](/images/cta.jpg)
## Heading

Optional paragraph(s).

**[Button text](/contact/)**

Optional short line under the button.
:::

:::areas
eyebrow: Optional short label
## Optional heading
:::
```

`areas` no acepta nada más que eso: la lista de lugares siempre sale de
`geo.serviceArea` del `site.config.json`, nunca de contenido escrito a mano.

## Verificación

| Comando | Resultado |
| --- | --- |
| `node --test scripts/blocks.test.mjs` | 14 pruebas (11 existentes + 3 nuevas). |
| `npm run check` | 23 pruebas, 0 errores/advertencias de Astro. |
| `npm run build:site -- stuart-homeowners` | 10 páginas, sin cambios de contenido. |
| `npm run build:site -- _example` | 9 páginas (agrega `cta-plain-fixture`). |

**JSON-LD de `blocks-fixture`** (leído del HTML construido): 2 scripts `application/ld+json`
(`InsuranceAgency` existente + `FAQPage` nuevo), JSON válido. `FAQPage.mainEntity` tiene 6
entradas; el HTML tiene 6 `<details class="block-faq-item">`; el texto de cada pregunta y
respuesta coincide carácter a carácter con lo visible, incluida la que tiene **negrita** y una
liga (el texto plano las aplana: "Fixture answer two, with bold text and a fixture link.").

**Debounce, con la API simulada (Playwright, `page.route`):**

| Escenario | Resultado |
| --- | --- |
| Escribir 10 caracteres en teléfono, sin soltar | 0 peticiones a `/v1/leads` en los primeros 400ms |
| Mismo campo, esperar 1.3s en total | exactamente 1 petición |
| Escribir y enviar el formulario antes de que pase 1s | el conteo justo después del submit y 1.2s después son iguales: ninguna petición extra aparece más tarde |

El segundo escenario incluye peticiones de `focusout` (inmediato, sin debounce, como se pide)
al mover el foco entre campos con `.fill()`; eso está bien y es esperado, pero hace que contar
peticiones "del submit" en aislado no sea limpio. La propiedad que sí se prueba sin ambigüedad,
y es la que importa, es que **ningún guardado debounced llega tarde** después de enviar.

**Hero a 768px:** `heroRect.height === imgRect.height` (480px ambos) en 390/768/1280/1440,
antes de este cambio la imagen medía 432px a 768px (48px de franja) mientras el hero medía 480.

**cta separado del footer:** `footerRect.top - ctaRect.bottom === 0` en `cta-plain-fixture`
(pegados, como pide 027 punto 4) y visualmente distinguibles por tono + borde (ver capturas).

`stuart-homeowners` (sin bloques nuevos): sin scroll horizontal en portada (1280px) ni en
`/contact/` (1024px), header compacto con "Get a Quote" visible confirmado por clase
(`is-compact` presente), formulario funcional.

## Una línea por captura

Guardadas en `_drafts/review-2026-09-29/028/` (miradas antes de escribir este reporte):

- `blocks-fixture-390.png`: todo apilado en una columna; `areas` en grid de 2 columnas sin
  divisores; `faq` en una columna; `cta` con texto arriba y botón/línea chica abajo.
- `blocks-fixture-768.png`: hero sin franja oscura abajo (el fix del punto 4 funcionando);
  cards en 2 columnas; `areas` en una fila con divisores; `cta` con botón a la derecha.
- `blocks-fixture-1440.png`: `areas` con el eyebrow/H2 en su propia línea y los 4 lugares
  centrados debajo con divisores; `faq` en 2 columnas con "View all questions →" alineada a
  la derecha del H2; `cta` con foto, degradado y botón/línea chica a la derecha, pegado al
  footer sin hueco.
- `cta-plain-fixture-1440.png`: página que es solo el `:::cta` sin foto; tono gris azulado
  claramente distinto del negro del footer, con una línea divisoria sutil entre ambos.
- `faq-section-open-1440.png` / `faq-open-1440.png`: la primera pregunta abierta muestra "−"
  y la respuesta; las demás muestran "+" y quedan cerradas, sin JS.

**Nota sobre las capturas `fullPage`:** en dos capturas exploratorias (no las de arriba) con
`page.screenshot({ fullPage: true })` sobre páginas con el header `position: sticky`, aparecía
un artefacto visual (texto del menú "fantasma" encima del hero, o el nav completo visible en
vez del modo compacto) que **no existe** en el render real: una captura del elemento solo
(`.locator(...).screenshot()`) o del viewport sin `fullPage` en la misma página sale limpia.
Es un artefacto del *stitching* de Playwright con elementos `sticky`, no un bug del sitio; lo
anoto para que si cowork lo ve en alguna captura futura, no lo confunda con algo real.

## Decisiones tomadas

- **`cta` "pegado al header" es condicional, no incondicional como el hero.** La gramática no
  obliga a `cta` a ser el primer contenido (a diferencia de `hero`), así que el CSS usa
  `section.block-cta:first-of-type` (verifica la posición real) en vez de asumirlo siempre,
  como si podía hacerse con `hero`.
- **La línea chica del cta se define por estructura, no por longitud de caracteres.** "Corto"
  significa "el autor lo escribió como su propio párrafo de una línea", no un conteo arbitrario
  de caracteres. Es una regla que se puede explicar y que el autor puede predecir mirando su
  propio Markdown.
- **`areas` no pasa el texto por el parser de Markdown.** Los lugares vienen de JSON de config,
  no de contenido de autor; insertarlos como texto escapado directo (no como Markdown) hace
  imposible que una liga se cuele por accidente, que es justo lo que el punto 3 pide evitar.

## Lo que tocaste fuera de lo pedido

- **`scripts/check-types.mjs`**: le faltaba `WICFL_SITE_CONFIG`. Nunca hizo falta hasta ahora
  porque ningún bloque leía el config al renderizar; `:::areas` sí, así que `astro check`
  fallaba al sincronizar contenido (con una advertencia, no con código de salida distinto de
  cero, lo cual era en sí mismo confuso). Se agregó el mismo `site.config.json` de `_example`
  que ya usa `build-site.mjs`.
- **`scripts/build-site.mjs`**: se agregó `--force` al build de Astro. Ver el hallazgo de caché
  abajo: sin esto, un cambio en `blocks.mjs`/`remark-columns.mjs` sin tocar el `.md` puede
  quedar sin verse en el sitio construido. No hay costo real para builds de un solo uso como
  este (no hay una segunda corrida que se beneficie de la caché).
- Ninguno de los dos estaba en la lista de restricciones ("solo estos archivos"); esta vez el
  prompt no traía esa lista, así que los dos quedan dentro de lo permitido, pero los marco
  aquí porque no estaban explícitamente pedidos.

## Lo que no pudiste verificar

Sin la extensión de Claude in Chrome conectada en esta sesión, igual que en los reportes
anteriores: verificación visual y de comportamiento con Playwright contra el sitio construido
y servido por el servidor estático de la etapa 2, no con una sesión real de Chrome.

## Dónde dudaste

- **El hallazgo de caché de Astro fue el bloqueo más largo de esta sesión.** Edité
  `remark-columns.mjs`, reconstruí, y el HTML no cambiaba ni un byte. Después de descartar el
  caché de contenido obvio (`packages/template/.astro`, borrado sin efecto), un vite dep cache
  y una posible duplicación de `node_modules`, agregué un `console.error` dentro de `heroNode`
  y confirmé que la función **no se estaba llamando en absoluto** durante el build.
  `astro build --force` lo resolvió; el flag existe
  exactamente para esto ("Clear the content layer and content collection cache"). El caché
  vive fuera de `packages/template/.astro` (borrar esa carpeta no bastó), así que no puedo
  decir con certeza dónde queda en disco, solo que `--force` lo evita. Si algún prompt futuro
  edita `blocks.mjs`/`remark-columns.mjs` sin tocar el `.md` que los ejercita y el build no
  refleja el cambio, este es el primer sospechoso.
- **`faqIntroNode` no valida que haya como mucho un `## H2`.** La gramática del prompt solo
  dice "eyebrow:, ## H2, párrafo y ligas" sin decir "exactamente uno", y las intros de
  `features`/`cards` ya son igual de permisivas hoy. Lo dejé consistente con esas en vez de
  agregar una regla que el prompt no pidió.

## Qué te sorprendió del repo

- La caché del content layer de Astro (arriba). Vale la pena que quede como aviso para
  cualquiera que edite un `remark plugin` o `blocks.mjs` sin tocar contenido: reconstruir no
  garantiza ver el cambio a menos que se use `--force` (ya aplicado en `build-site.mjs`) o se
  toque el `.md`.
- La especificidad de CSS por *declaración*, no por *regla completa*, es lo que causaba la
  franja del hero. `position`/`inset` sí venían de la regla correcta; `height` no. Es fácil
  mirar una regla que "gana" en unas propiedades y asumir que gana en todas.

## Lo que no se hizo

Nada de los 5 puntos del objetivo quedó pendiente.

## Próximos pasos sugeridos

- Backlog: si Studio (que ya está migrando a la gramática compartida en paralelo, commit
  `61c7bda`) necesita vista previa en vivo de `faq`/`cta`/`areas`, puede reusar
  `ctaFinePrint`/`buttonParagraphs`/`linkParagraphs` de `blocks.mjs` igual que ya reusa el
  resto de la gramática, en vez de reimplementar la detección de párrafos sueltos.
- Backlog: documentar en algún lado visible (README de `scripts/`, o un comentario en
  `astro.config.mjs`) que un cambio en el remark plugin necesita `--force` o tocar el `.md`
  para verse reflejado; hoy solo queda anotado en este reporte y en el comentario de
  `build-site.mjs`.

## Commits

- `06d2c4a` — `feat(template): faq, cta and areas page blocks with FAQPage schema (W-121 part
  3)`. Incluye el código, la página de prueba nueva, este reporte y las entradas de
  BITACORA/BACKLOG.
- `git push origin main`: `5229b1f..06d2c4a`.
- **Validate and build** (`ci.yml`), run `36627912837`: verde (Test WICFL Studio, Validate all
  site configurations, Build `_example`, Build `stuart-homeowners`).
- **Publish site Workers** (`publish-sites.yml`), run `36627912844`: verde (Discover sites to
  publish, Publish `_example`, Publish `stuart-homeowners`). Mismas anotaciones de deprecación
  de Node 20/Ubuntu de siempre, no relacionadas con este cambio.

## Revisión de cowork

**Veredicto: aceptado.**

Revisé las capturas de `blocks-fixture` a 1440, de `cta-plain-fixture` y del FAQ abierto.

**Bien:**
- FAQ a dos columnas, sin JS, con "View all questions →" alineado al H2.
- JSON-LD armado desde los mismos nodos que se pintan. Es la mejor forma de que no se separen.
- `areas` sale del config y va como texto.
- La banda de cotización funciona con y sin foto, y la versión sin foto tiene un tono distinto
  del footer.
- Encontró la causa real de la franja del hero (especificidad de `height: auto`) y un bug de
  caché de Astro que habría hecho perder tiempo en cada cambio del plugin (`--force`).
- Debounce del formulario probado con el API simulado.

**Detalles menores, sin prompt por ahora:**
- En `:::cta` queda un hueco grande entre el eyebrow y el H2, el mismo tipo de hueco que el 027
  corrigió en features y cards.
- A 1440, el botón de la banda queda más arriba que el H2.

Se revisan cuando Pavel arme la portada real de Stuart con fotos, porque con contenido real
pueden cambiar.

**Studio:** cowork agregó los botones "Questions (FAQ)", "Service area" y "Quote band", con su
dibujo en la vista en vivo. Mismo commit de docs.
