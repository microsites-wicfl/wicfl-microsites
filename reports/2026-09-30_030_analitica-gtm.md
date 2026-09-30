# 2026-09-30_030 — Analítica: Google Tag Manager y eventos de conversión (Gate B)

**Backlog:** W-005 (Gate B), W-118

## Qué se hizo

- El layout compartido inicializa siempre `window.dataLayer`, para que los eventos sean seguros
  también en previews donde GTM no se carga.
- Si el config trae un ID GTM válido, el HTML incluye un cargador inline que solo inserta
  `gtm.js` cuando el hostname es el dominio configurado o su variante `www`.
- El iframe de `<noscript>` se omitió deliberadamente: no puede validar el hostname y habría
  permitido medición en previews para visitantes sin JavaScript.
- No se cargó GA4 directo. El único cargador externo es GTM, que contiene el Google Tag de GA4.
- Se añadieron `quote_start`, `quote_step`, `generate_lead`, `policy_upload` y `phone_click`.
  Los eventos solo contienen IDs y etiquetas operativas, nunca datos del formulario.
- `generate_lead` queda protegido por estado y se envía una sola vez al mostrar la confirmación
  de un envío final exitoso.
- Stuart ahora usa `G-YBYQXRCBLN` y `GTM-TV5RN2DB` desde su propio config.
- Se agregó una prueba de build y navegador con Playwright al comando `npm run check`.

## Decisiones tomadas

- **Sin `<noscript>` de GTM:** protege todos los entornos no productivos, incluidos los
  workers.dev publicados, de tráfico analítico accidental.
- **`phone_click` delegado desde `document`:** una sola escucha cubre header, footer, contenido
  y ligas futuras sin instrumentar cada enlace.
- **Prueba de hostname real con resolución local:** Playwright abre
  `stuarthomeownersinsurance.com` contra el servidor local e intercepta GTM y las APIs. La
  página local usa HTTP, por lo que la prueba proporciona solo el shim de `crypto.randomUUID`
  que el navegador ya entrega en el HTTPS de producción.

## Verificación

`npm run check` pasó con 24 pruebas, cero errores de Astro y cero advertencias. Incluye la nueva
prueba de navegador, que construyó Stuart y `_example`, interceptó `gtm.js` y recorrió el
formulario completo contra una API simulada.

Los `dataLayer.push` observados, en orden, fueron:

1. `{ "gtm.start": <timestamp>, "event": "gtm.js" }`
2. `{ "event": "quote_start", "form_id": "wicfl-quote-v1", "site_slug": "stuart-homeowners" }`
3. `{ "event": "quote_step", "form_id": "wicfl-quote-v1", "site_slug": "stuart-homeowners", "step": 3 }`
4. `{ "event": "generate_lead", "form_id": "wicfl-quote-v1", "site_slug": "stuart-homeowners", "lead_source": "stuart-homeowners" }`
5. `{ "event": "policy_upload", "form_id": "wicfl-quote-v1", "site_slug": "stuart-homeowners" }`
6. `{ "event": "phone_click", "site_slug": "stuart-homeowners", "link_location": "header" }`

La prueba comprobó explícitamente que la serialización de esos pushes no contiene dirección,
email ni teléfono de prueba. En el hostname de workers.dev simulado no hubo solicitud de
`gtm.js`, y `window.dataLayer` quedó disponible y vacío.

El build de `_example`, que conserva `GTM-PLACEHOLDER`, no contiene el cargador de GTM. El build
de Stuart contiene `GTM-TV5RN2DB`, la comprobación de hostname y no contiene
`gtag/js?id=G-`.

El gate de producción de Stuart ya no reporta `analytics.ga4` ni `analytics.gtm`. Sigue fallando
correctamente por los marcadores de demo que no pertenecen a este prompt (`brand.name` y campos
de SEO).

## Lo que tocaste fuera de lo pedido

Nada. Los cambios se limitaron al layout/template compartido, el formulario, el config de Stuart,
la prueba requerida, el script de check y este reporte.

## Lo que no pude verificar

Nada pendiente de este prompt. Después del push se consultó
`https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev/contact/`: el HTML
publicado incluye `GTM-TV5RN2DB` y la comprobación `location.hostname === domain`, y no contiene
`gtag/js?id=G-`. Por ello workers.dev conserva el snippet visible para auditoría, pero no inserta
ni solicita GTM en ese hostname.

## Dónde dudé

El prompt deja abierta la decisión del iframe `<noscript>`. Se omitió para que el requisito de
no medir previews sea absoluto, incluso sin JavaScript.

## Qué me sorprendió del repo

El formulario depende de `crypto.randomUUID`, disponible en el dominio HTTPS real pero no en el
servidor HTTP local de la prueba. El shim se limita al entorno de prueba y no cambia producción.

## Lo que no se hizo

No se modificaron `apps/studio/` ni `apps/lead-api/`, y no se agregaron dependencias.

## Próximos pasos sugeridos

- Completar los marcadores restantes de Stuart antes del launch para que el gate de producción
  pueda pasar completo.

## Commits

- `957d6ae` — `feat(template): load GTM on the production domain and push conversion events (Gate B)`.
- Publish site Workers para `957d6ae`: run
  [`36762944717`](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/36762944717),
  **success**. Publicó `_example` y `stuart-homeowners`.
