# 2026-09-30_030 — Analítica: Google Tag Manager y eventos de conversión (Gate B)

**Backlog:** W-005 (Gate B), W-118
**Reporte esperado:** `reports/2026-09-30_030_analitica-gtm.md`

## Contexto

Stuart lanza el 9-oct y desde ese día corre el reloj de Gate B. Para medir necesitamos visitas,
leads del formulario y clics al teléfono. Hoy:

- el config trae `analytics.ga4` y `analytics.gtm` con `PLACEHOLDER`, y el gate de producción
  (`scripts/check-production-config.mjs`, W-103) bloquea el placeholder;
- pero el template **nunca inserta** GTM ni GA4 en las páginas. Aunque haya IDs reales, no se
  mide nada.

Vic ya creó las cuentas:

- GA4: propiedad "Stuart Homeowners Insurance", Measurement ID **`G-YBYQXRCBLN`**.
- GTM: contenedor "stuarthomeownersinsurance.com", ID **`GTM-TV5RN2DB`**. Adentro hay un Google
  Tag con el ID de GA4 disparado en Initialization – All Pages. Es decir, **GA4 se carga desde
  GTM**, no directo.

Mide solo lo que se necesita. No pongas datos personales (nombre, teléfono, email, dirección)
en ningún evento.

## Objetivo

### 1. Cargar GTM, solo en el dominio real

- En `BaseLayout.astro`, si `site.analytics.gtm` es un ID real (formato `GTM-XXXXXXX`, no
  placeholder), inserta el snippet estándar de GTM:
  - el `<script>` lo más arriba posible del `<head>`;
  - el `<noscript><iframe>` justo después de abrir `<body>`.
- **Sin cargar GA4 directo** (sin `gtag.js` con el `G-`): GA4 va dentro de GTM y cargarlo dos
  veces duplica las visitas.
- **Solo en producción:** el script de GTM se carga solo cuando `location.hostname` es
  `site.domain` o `www.` + `site.domain`. Así las vistas previas (`wicfl-pr*`), la versión
  publicada (`*-published.workers.dev`), el ensayo (`preview.`) y localhost no ensucian los
  datos.
  - Implementa la comprobación en el mismo snippet inline, antes de insertar `gtm.js`.
  - El `<noscript>` no puede comprobar el hostname. Omítelo, o déjalo sabiendo que solo afecta a
    visitantes sin JS en otros hosts. Decide y explica en el reporte.
- Hazlo por sitio, desde el config. Nada fijo para Stuart.

### 2. Eventos en `dataLayer`

`window.dataLayer = window.dataLayer || []` debe existir antes de cualquier `push`, aunque GTM
no cargue (en vistas previas los `push` no deben fallar).

| Evento | Cuándo | Parámetros |
|---|---|---|
| `quote_start` | El visitante pasa del paso 1 al 2 del formulario (ZIP válido) | `form_id`, `site_slug` |
| `quote_step` | Pasa del paso 2 al 3 | `form_id`, `site_slug`, `step: 3` |
| `generate_lead` | El envío final del formulario responde OK y se muestra la confirmación | `form_id`, `site_slug`, `lead_source` |
| `policy_upload` | La declaración se sube bien | `form_id`, `site_slug` |
| `phone_click` | Clic en cualquier liga `tel:` de la página: header, menú de celular, footer, contenido, botones | `site_slug`, `link_location` (`header`, `footer`, `content` o el que aplique) |

Reglas:

- `generate_lead` se manda **una sola vez** por envío exitoso, aunque haya reintentos.
- Los guardados en segundo plano (paso 3, debounce) **no** mandan `generate_lead`.
- `phone_click` se engancha con un solo listener delegado en `document`, sin tocar cada liga.
  Usa el ancestro más cercano (`header`, `footer`, `main`) para `link_location`.
- El JS nuevo va inline y es chico, como el del formulario.

### 3. IDs reales en Stuart

Pon en `sites/stuart-homeowners/site.config.json`:

- `analytics.ga4`: `G-YBYQXRCBLN`
- `analytics.gtm`: `GTM-TV5RN2DB`

Confirma que el gate de producción ya no marca analytics para Stuart.

### 4. Pruebas

- Pruebas unitarias o de build:
  - con un ID real y el dominio correcto, el HTML incluye el snippet con ese ID;
  - con `PLACEHOLDER`, no incluye nada de GTM;
  - nunca se incluye `gtag/js?id=G-`.
- Prueba en navegador con Playwright, sobre el build servido localmente:
  - simula el hostname de producción, por ejemplo con `page.route` o con un servidor en el
    dominio vía `--host-resolver-rules`, lo que sea más simple;
  - intercepta `googletagmanager.com` para no cargar el real;
  - confirma el orden y el contenido de los `dataLayer.push` en el flujo completo del
    formulario, con el API del lead simulado;
  - confirma que en un hostname distinto (el publicado de workers.dev) **no** se pide `gtm.js`,
    pero los `push` siguen funcionando sin errores.

## Restricciones

- No toques `apps/studio/` ni `apps/lead-api/`.
- Sin dependencias nuevas.
- Ningún dato personal en `dataLayer`.
- Código legible, una instrucción por línea.

## Pasos

1. Implementa los puntos 1 a 4.
2. Corre `npm run check` y los builds de Stuart y `_example`.
3. Reporta la lista exacta de `dataLayer.push` observados en la prueba del formulario, en orden,
   con sus parámetros.
4. Haz commit y `git push origin main`. Esto también sube los commits de docs locales. Espera
   Publish site Workers y reporta el hash, el id del run y su resultado.
5. En el sitio publicado de workers.dev, confirma con el navegador (o con `curl` al HTML) que el
   snippet está en el HTML con la comprobación de hostname, y que por lo tanto ahí no se carga
   GTM.

## Criterio de aceptación

- [ ] GTM carga solo en el dominio real del sitio, sin GA4 directo.
- [ ] Los 5 eventos con sus parámetros, sin datos personales, probados en navegador.
- [ ] `generate_lead` una sola vez por envío.
- [ ] IDs reales en Stuart y el gate sin hallazgos de analytics.
- [ ] Checks y Publish en verde.

## Formato del reporte

El de `prompts/TEMPLATE.md`, más la lista de pushes observados.

## Commit message

```
feat(template): load GTM on the production domain and push conversion events (Gate B)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```
