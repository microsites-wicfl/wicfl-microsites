# 2026-09-29_028 — Bloques faq, cta y areas (W-121 parte 3, W-125)

**Backlog:** W-121, W-125, W-118 (agregado)
**Reporte esperado:** `reports/2026-09-29_028_bloques-faq-cta-areas.md`

## Contexto

Los prompts 026 y 027 dejaron `hero`, `features` y `cards` en la gramática compartida
(`packages/config-schema/blocks.mjs`, con `parseDocument` y `blockProblems`). El render está en
`packages/template/src/lib/remark-columns.mjs` y la página de prueba en
`sites/_example/content/blocks-fixture.md`. Lee los reportes 026a, 026b y 027 con sus revisiones
antes de empezar.

Este prompt agrega los tres bloques que faltan del diseño de Pavel:

- **FAQ en acordeón a dos columnas:** eyebrow, H2 y una liga "View all questions →" arriba a
  la derecha.
- **Banda de cotización:** foto de fondo con capa oscura. H2 y texto a la izquierda; botón y la
  línea chica "Quick. Easy. No obligation." a la derecha.
- **Zona de servicio:** una fila de lugares con ícono.

## Objetivo

### 1. `:::faq`

- **Gramática:**
  - Sin opciones.
  - Intro opcional: `eyebrow:`, `## H2`, párrafo y ligas.
  - Ítems con `:::item`, de 2 a 12. Cada ítem tiene exactamente un `### Pregunta` y al menos un
    párrafo de respuesta.
  - Puede haber más de un `:::faq` por página.
- **Render:**
  - Cada ítem es un `<details>` con `<summary>` (la pregunta) y la respuesta dentro. Sin JS.
  - Dos columnas en desktop y una en celular.
  - El ícono "+" pasa a "−" al abrir, con CSS.
  - Si la intro trae una liga normal, va alineada a la derecha del H2 en desktop, como en el
    diseño.
- **Schema FAQPage (W-125):**
  - El plugin junta las preguntas y respuestas **visibles** de todos los `:::faq` de la página y
    las deja en `remarkPluginFrontmatter` (por ejemplo `faq: [{ question, answer }]`).
  - Las páginas (`[...slug].astro` e `index.astro`) agregan un
    `<script type="application/ld+json">` con `@type: FAQPage` cuando hay preguntas.
  - `question` es el texto plano del `###`. `answer` es el texto plano de la respuesta: sin
    Markdown y con las ligas convertidas en su texto.
  - Debe coincidir con lo que se ve; no inventes ni recortes.
  - Prueba: el JSON-LD de `blocks-fixture` tiene tantas preguntas como `<details>` hay en el HTML,
    con el mismo texto.

### 2. `:::cta`

- **Gramática:**
  - Sin opciones y sin ítems.
  - Contenido:
    - una imagen opcional (párrafo que es solo imagen), que se usa de fondo;
    - `eyebrow:` opcional;
    - exactamente un `## H2`;
    - párrafos;
    - exactamente un botón (párrafo que es solo una liga en negritas);
    - una última línea chica opcional.
- **Render:**
  - Sección a todo lo ancho, igual que el hero: foto como `<img alt="" loading="lazy">` detrás y
    capa oscura para que el texto pase AA.
  - Sin foto, usa el color oscuro del tema.
  - Desktop: texto a la izquierda; botón y línea chica a la derecha. Celular: apilados.
  - Cuenta como bloque de ancho completo para los bordes de la página (027, punto 4).
  - Si es lo último antes del footer, se distingue del footer: la foto lo separa. Sin foto, usa
    un borde o un tono distinto del footer. Revísalo en captura.
- **Línea chica:** el último párrafo, si es corto y va después del botón, se muestra como texto
  chico bajo el botón. Define la regla exacta en `blocks.mjs` y documéntala en el reporte.

### 3. `:::areas`

- **Gramática:**
  - Sin opciones y sin ítems.
  - Solo acepta `eyebrow:` y un `## H2` opcionales. Cualquier otro contenido es un problema con
    su línea y el mensaje "the list of places comes from Site settings → Service area".
- **Render:**
  - Una fila con los lugares de `geo.serviceArea` del config del sitio, cada uno con el ícono
    `map-pin`, separados por divisores, sobre fondo suave.
  - En celular, dos columnas.
  - Los lugares son texto, **sin ligas**: el schema prohíbe páginas por localidad.
- **Config:** para leerlo desde el plugin, reutiliza cómo `site-data.mjs` carga el config
  (`WICFL_SITE_CONFIG`). No dupliques la lectura: exporta lo necesario de `site-data.mjs` o de un
  módulo común.

### 4. Agregados

- **Revisión del 027, detalle 1:** a 768 px la foto del hero no llega al borde inferior de la
  sección. Corrígelo.
- **W-118, pendiente menor:** en `packages/template/src/components/ContactForm.astro`, el guardado
  en segundo plano que se dispara con `input` en teléfono y email espera 1 s sin teclear
  (debounce). El de `focusout` sigue inmediato.
  - Si el visitante envía el formulario antes de que venza el segundo, el envío final sigue
    esperando cualquier guardado en curso, como hoy, y cancela el pendiente.
  - Prueba manual con el API simulado: una petición al terminar de escribir, no una por tecla.

### 5. Pruebas y página de prueba

- Reglas nuevas en `blockProblems`, con pruebas en `scripts/blocks.test.mjs`: un caso que pasa y
  uno que falla por regla.
- Agrega a `blocks-fixture.md`, con texto de relleno obvio:
  - un `:::faq` de 6 preguntas;
  - un `:::areas`;
  - un `:::cta` con la foto `fixture-hero.jpg` al final de la página.
- Agrega una segunda página de prueba sin foto en el `:::cta` para ver esa variante.

## Restricciones

- No toques `apps/studio/`: cowork está trabajando ahí en paralelo.
- Sin dependencias nuevas.
- Sin JS nuevo en el sitio, salvo el debounce del formulario.
- Código legible, una instrucción por línea, como en el 026b y el 027.
- No cambies el contenido de Stuart.

## Pasos

1. Implementa los puntos 1 a 5.
2. Corre `npm run check` y los builds de `stuart-homeowners` y `_example`.
3. Valida el JSON-LD de `blocks-fixture`: que sea JSON válido, que tenga `@type` FAQPage y que
   el número y el texto coincidan con los `<details>`.
4. Captura `blocks-fixture` a 390, 768 y 1440, y la página de prueba sin foto a 1440, en
   `_drafts/review-2026-09-29/028/`, más un acercamiento del FAQ con una pregunta abierta.
   - Míralas antes de escribir el reporte.
   - Describe en una línea por captura qué se ve.
5. Haz commit y `git push origin main`. Espera Publish site Workers y reporta el hash, el id del
   run y su resultado.

## Criterio de aceptación

- [ ] `faq`, `cta` y `areas` en la gramática, con pruebas.
- [ ] El FAQ funciona sin JS y su JSON-LD coincide con lo visible.
- [ ] `cta` con y sin foto, legible y separado del footer.
- [ ] `areas` sale del config, sin ligas.
- [ ] La franja del hero a 768 está corregida.
- [ ] Hay debounce del guardado del formulario.
- [ ] Checks y Publish en verde; capturas revisadas.

## Formato del reporte

El de `prompts/TEMPLATE.md`, completo, con la sintaxis final de los tres bloques.

## Commit message

```
feat(template): faq, cta and areas page blocks with FAQPage schema (W-121 part 3)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```
