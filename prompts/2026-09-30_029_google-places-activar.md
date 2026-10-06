# 2026-09-30_029 — Activar el autocompletado de direcciones de Google (W-118)

**Backlog:** W-118
**Reporte esperado:** `reports/2026-09-30_029_google-places-activar.md`

## Contexto

El formulario de cotización (`/contact/`) ya tiene todo el código del autocompletado de
direcciones. El Worker `wicfl-lead-api` responde `POST /v1/addresses` llamando a Google Places
API (New) `places:autocomplete`, pero hoy devuelve `ADDRESS_SERVICE_UNAVAILABLE` porque
`GOOGLE_PLACES_API_KEY` está vacía.

Kevin ya agregó la tarjeta al proyecto de Google Cloud `wicfl-microsites`. Vic ya:

- activó Places API (New);
- creó la llave, restringida solo a esa API;
- le puso un límite diario y una alerta de presupuesto;
- la guardó en `apps/lead-api/.env` como `GOOGLE_PLACES_API_KEY`. Ese archivo está en
  gitignore.

El workflow `.github/workflows/deploy-lead-api.yml` carga cada secreto al Worker solo si su
valor en GitHub no está vacío. El de Google viene de `LEAD_API_GOOGLE_PLACES_API_KEY`.

## Nota del 2026-10-06, antes de ejecutar

- La facturación del proyecto quedó ligada hoy (cuenta de prueba gratuita de Google Cloud). Vic
  activó Places API (New) y restringió la llave a esa sola API. El tope diario y la alerta de
  presupuesto **no** están puestos: Google no deja editar cuotas en la prueba gratuita. No es un
  motivo para detenerte.
- **`apps/lead-api/.env` tiene dos líneas `GOOGLE_PLACES_API_KEY=`:** una vacía (la de relleno)
  y más abajo la real, **entre comillas**. Usa la **última línea no vacía** y **quítale las
  comillas de los extremos** antes de pasarla a `gh secret set`. Una llave de Google mide 39
  caracteres y empieza con `AIza`: comprueba esas dos cosas (sin mostrar nada más) y repórtalas.
  Si no se cumplen, detente y repórtalo. No edites el `.env`.
- El ejecutor es Codex. Ignora las líneas `Co-Authored-By` y `Claude-Session` del mensaje de
  commit de abajo: son de una sesión anterior.

## Objetivo

La dirección del paso 2 del formulario publicado de Stuart muestra sugerencias de Google con
"Powered by Google", y la llave nunca aparece en ningún log, commit, reporte ni salida de
terminal.

## Restricciones

- **Nunca imprimas, copies ni muestres el valor de la llave** ni de ningún otro secreto de
  `.env`. Léela y pásala por entrada estándar a `gh secret set`, sin `echo` ni `cat` a la
  terminal.
- Si `GOOGLE_PLACES_API_KEY` está vacía o no existe en `apps/lead-api/.env`, detente y repórtalo
  sin hacer nada más.
- No cambies código.

## Pasos

1. Confirma, sin mostrar el valor, que `GOOGLE_PLACES_API_KEY` en `apps/lead-api/.env` no está
   vacía. Reporta solo su longitud.
2. Carga el secreto de GitHub `LEAD_API_GOOGLE_PLACES_API_KEY` con ese valor, pasándolo por
   stdin a `gh secret set`.
3. Dispara `deploy-lead-api.yml` con `workflow_dispatch`, espera a que termine y reporta el id
   del run y su resultado.
4. Prueba el endpoint:
   - `POST https://wicfl-lead-api.wicfl-microsites.workers.dev/v1/addresses`;
   - header `Origin: https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev`;
   - body `{"siteSlug":"stuart-homeowners","input":"123 SE Ocean Blvd Stuart","sessionToken":"<un uuid cualquiera>"}`.

   Reporta el status y cuántas sugerencias llegaron. No hace falta el contenido completo.
5. En el formulario publicado de Stuart (`/contact/`): pasa al paso 2 con un ZIP válido, escribe
   una dirección de Stuart y confirma que aparecen sugerencias y "Powered by Google". Guarda una
   captura en `_drafts/review-2026-09-30/029/` y di en una línea qué se ve. No envíes el
   formulario, para no crear un contacto en GHL.
6. Si Google responde con error (API no activada, llave restringida a otra API, facturación),
   reporta el mensaje de error de Google tal cual, sin la llave, y detente.

## Criterio de aceptación

- [ ] El secreto está cargado en GitHub y en el Worker, sin que su valor aparezca en ningún
      lado.
- [ ] `/v1/addresses` responde 200 con sugerencias.
- [ ] El formulario muestra sugerencias y "Powered by Google", con captura revisada.

## Formato del reporte

El de `prompts/TEMPLATE.md`.

## Commit message

Solo el reporte:

```
docs: report 029, Google address autocomplete enabled (W-118)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```
