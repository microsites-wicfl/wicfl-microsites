# 2026-10-09_040 — Aviso de contacto bajo el formulario de cotización

**Backlog:** W-131 (páginas legales y consentimiento)
**Fase:** 3 (lanzamiento de Stuart, hoy 9 de octubre)
**Reporte esperado:** `reports/2026-10-09_040_aviso-formulario-cotizacion.md`

## Contexto

Kevin aprobó el 8-oct una política maestra y, con ella, un aviso para el formulario de cotización
("Section A" de su borrador): la persona que manda el formulario pide que la agencia la contacte
sobre su cotización, incluso con comunicaciones automáticas, y se le dice con quién se comparte su
información. Va en la plantilla, así que aplica a todos los sitios. La casilla opcional de
marketing NO es parte de este prompt (necesita un campo en GoHighLevel; va después del lanzamiento).

El formulario está en `packages/template/src/components/ContactForm.astro`. El paso 3 termina con
`<div class="contact-form-actions">…<button type="submit">Request my quote</button></div>`.

## Qué hacer

1. En el paso 3 (`fieldset data-step="3"`), **justo antes** del `div.contact-form-actions`, agrega
   un párrafo con la clase `contact-form-consent` y exactamente este texto (la liga es relativa,
   cada sitio tiene su propia política):

   ```html
   <p class="contact-form-consent">By submitting this form, you request that Walker Insurance of Central FL Inc. contact you about your insurance inquiry using the phone number, email address and other information you provide. We may contact you about your requested quote, appointment scheduling and related insurance services, including through automated communications where permitted by law. Your information may be shared with insurance carriers, underwriting partners and authorized service providers as described in our <a href="/privacy-policy/">Privacy Policy</a>.</p>
   ```

2. Estilo: texto más chico y en color secundario, legible (contraste AA contra el fondo del
   formulario), con un poco de espacio arriba y abajo. Usa las variables de color que ya usa el
   formulario; no inventes colores. Si el formulario no tiene hoja de estilos propia, ponlo donde
   viven hoy los estilos de `.contact-form`.
3. No cambies nada más del formulario: ni campos, ni pasos, ni el guardado en segundo plano, ni el
   Lead API, ni el texto de confirmación.

## Pruebas

- Agrega una prueba que construya el sitio `sites/_example` (o lea el HTML de su página de
  contacto ya construida, como hagan las pruebas existentes) y afirme que el paso 3 contiene
  `contact-form-consent`, que aparece antes del botón `Request my quote` y que liga a
  `/privacy-policy/`. **Ninguna prueba puede nombrar ni leer un sitio real** (regla del 6-oct,
  guardia en `scripts/schema.test.mjs`).
- `npm run check` en verde.

## Verificación

1. Push a `main` y espera **todos** los workflows que dispare. Anota cada uno con id y conclusión.
2. Cuando Publish site Workers termine, abre
   `https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev/contact/` y confirma en el
   HTML que el aviso está dentro del paso 3, antes del botón, con la liga a `/privacy-policy/`.
3. Corre `node scripts/check-production-config.mjs stuart-homeowners` y pega la salida.
4. No mandes el formulario: no crees leads de prueba.

## Commit

`feat(template): contact notice above the quote form submit button`, con las líneas de atribución
de `CLAUDE.md`. Incluye este prompt.
