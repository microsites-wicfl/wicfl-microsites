# 2026-09-29_027 — Pulido visual de los bloques (W-121 parte 2c)

**Backlog:** W-121, W-128
**Reporte esperado:** `reports/2026-09-29_027_pulido-bloques.md`

## Contexto

El prompt 026 (`dd7ffe3`) dejó hero, features y cards funcionando en
`sites/_example/content/blocks-fixture.md` e `icons-fixture.md`. Cowork revisó las capturas de
`_drafts/review-2026-09-29/026/` y encontró seis detalles; están en la sección "Revisión de
cowork" de `reports/2026-09-29_026b_render-bloques.md`. Este prompt los corrige. Es un cambio
chico: solo CSS y escape de HTML.

## Objetivo

1. **Cards: la imagen llena el ancho de la tarjeta.**
   - Hoy queda un hueco arriba y a la derecha, porque el margen negativo no coincide con el
     padding de la tarjeta.
   - Lo más limpio: la tarjeta sin padding, la imagen arriba a todo lo ancho y el texto en un
     contenedor con su propio padding. Si eso requiere envolver el texto en el render, hazlo en
     `cardItemNode`.

2. **La rejilla sigue al número de ítems.**
   - `features` y `cards` usan tantas columnas como ítems (2, 3 o 4) en desktop.
   - En tablet, 2 columnas cuando hay 4 ítems.
   - En celular, 1 columna.
   - Pon el número en el HTML (por ejemplo `data-items="4"` o una clase), no uses `:has()`
     complicados.

3. **Espacios verticales.**
   - Dentro de features y cards, el eyebrow va pegado a su H2 (el margen del eyebrow abajo es
     chico y el H2 no suma margen arriba).
   - Entre H2 e intro, el espaciado normal de un párrafo.
   - Toma como referencia el diseño de Pavel: el eyebrow, el título y la intro se leen como un
     solo grupo.

4. **Bloques de ancho completo en los bordes de la página.**
   - Si el hero es lo primero de la página, va pegado al header, sin margen blanco arriba.
   - Si el último contenido de la página es un bloque de ancho completo (hero o
     `features dark`), no queda hueco blanco grande antes del footer.
   - Resuélvelo con selectores de posición (`:first-child` / `:last-child` del contenido) o
     con las marcas del frontmatter que ya existen, lo que sea más simple.

5. **Features claro:** el divisor vertical va solo entre ítems, no a la izquierda del primero.

6. **Escape de HTML.** Escapa `&`, `<`, `>` y `"` en:
   - el valor de `eyebrow:`;
   - la ruta de la imagen del hero;
   - el nombre del ícono en `data-icon`.

   Hazlo con una función `escapeHtml` pequeña. Agrega una prueba que construya un documento con
   `eyebrow: A <b>"test"</b> & more` y confirme que el HTML resultante lo muestra como texto.

## Restricciones

- Solo `packages/template/src/layouts/BaseLayout.astro`, `packages/template/src/lib/remark-columns.mjs`
  y pruebas.
- No cambies la gramática (`blocks.mjs`) ni las páginas de prueba, salvo que una prueba lo
  necesite.
- CSS nuevo con una declaración por línea, como quedó en el 026.

## Pasos

1. Implementa los puntos 1 a 6.
2. Corre `npm run check` y los builds de `stuart-homeowners` y `_example`.
3. Captura `blocks-fixture` a 390, 768 y 1440, e `icons-fixture` a 1280, en
   `_drafts/review-2026-09-29/027/`.
   - Míralas antes de escribir el reporte.
   - Describe en una línea por captura qué se ve, comparándola con la misma captura del 026.
4. Haz commit y `git push origin main`. Espera Publish site Workers y reporta el hash, el id del
   run y su resultado.

## Criterio de aceptación

- [ ] La imagen de la card llena el ancho, sin huecos.
- [ ] 4 ítems se ven en 4 columnas en desktop.
- [ ] Eyebrow, H2 e intro se leen como un solo grupo.
- [ ] El hero va pegado al header y no hay hueco grande antes del footer después de un bloque
      oscuro.
- [ ] No hay divisor antes del primer ítem de features claro.
- [ ] Hay escape de HTML, con su prueba.
- [ ] Checks y Publish en verde; capturas revisadas.

## Formato del reporte

El de `prompts/TEMPLATE.md`, completo.

## Commit message

```
fix(template): polish page blocks spacing, grid and card images; escape block settings (W-121 part 2c)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```
