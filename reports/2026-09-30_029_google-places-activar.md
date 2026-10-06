# Reporte 029 — Google Places activado

Fecha de ejecución: 2026-10-06

## Qué se hizo

- Se leyó la última entrada no vacía de `GOOGLE_PLACES_API_KEY` en `.env`, removiendo únicamente comillas exteriores. Se validó sin imprimir el secreto: 39 caracteres y prefijo `AIza`.
- Se guardó ese valor en el secreto de repositorio `LEAD_API_GOOGLE_PLACES_API_KEY` de `microsites-wicfl/wicfl-microsites`.
- Se ejecutó manualmente `Deploy WICFL Lead API` sobre `main`. La corrida `37528103998` terminó en `success`, incluido el paso `Set Lead API secrets`.
- Se probó `POST /v1/addresses` con el origen publicado de Stuart y el texto de prueba permitido. Respondió `200` con cinco sugerencias.
- Se verificó visualmente el formulario publicado de Stuart: después de ZIP `34994`, al escribir `123 SE Ocean Blvd, Stuart, FL` en el paso 2 aparecieron cinco sugerencias y el aviso `Powered by Google`. No se envió el formulario ni se creó un contacto.
- Se guardó la evidencia visual local en `_drafts/review-2026-09-30/029/google-places-stuart-contact.jpg` (directorio ignorado por Git).

## Decisiones tomadas

- Se usó la última clave no vacía porque `.env` contiene una definición anterior duplicada; la clave final estaba entre comillas y se normalizó sólo para la carga del secreto.
- Se mantuvo el alcance sin cambios de aplicación, configuración ni workflows. Este reporte es el único archivo versionado creado por la ejecución.

## Verificación

- Secret de GitHub: carga aceptada sin exponer el valor.
- Workflow: [Deploy WICFL Lead API #37528103998](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37528103998) — `success`.
- Endpoint publicado: `200 OK`; cinco sugerencias para la consulta de prueba.
- Formulario publicado: lista de sugerencias visible y texto `Powered by Google` visible; captura local guardada.

## Lo que tocaste fuera de lo pedido

- Nada versionado fuera del reporte. La captura solicitada quedó en `_drafts/`, que está ignorado por Git.

## Lo que no pudiste verificar

- No se verificó consumo, facturación ni cuotas de Google Cloud; no eran necesarios para comprobar la integración.

## Dónde dudaste

- `.env` tenía una entrada duplicada y la última estaba entre comillas. Se comprobó la forma de la clave sin mostrarla y se eligió la última entrada no vacía, como indicó el prompt.

## Qué te sorprendió del repo

- El workflow de Lead API ya contiene un paso explícito para cargar los secretos del Worker después del deploy, así que la actualización no requirió editar código ni configuración.

## Lo que no se hizo

- No se enviaron formularios, no se crearon contactos en GHL y no se hicieron cambios de código, sitios, dependencias, secretos locales ni workflows.

## Próximos pasos sugeridos

- Vigilar en Google Cloud el consumo de Places API del proyecto y revisar la decisión de facturación cuando se aproxime el fin del periodo de prueba.

## Commits

- Pendiente al momento de redactar este reporte: `docs: report 029, Google address autocomplete enabled (W-118)`.

## Revisión de cowork

**Veredicto: aceptado.** Revisado contra el diff de `664764f` y contra el resultado real.

- El único archivo versionado es este reporte. Sin cambios de código, config ni workflows.
- **La llave no aparece en ningún lado:** busqué el patrón completo de una llave de Google en los archivos de `origin/main` y en los diffs de los últimos doce commits: cero coincidencias. `apps/lead-api/.env` sigue ignorado por git. Las dos menciones de "AIza" son el prefijo, citado en el prompt y en este reporte.
- **Probado por cowork, no solo leído:** desde la página `/contact/` de la copia publicada de Stuart, `POST /v1/addresses` respondió 200 con cinco sugerencias para "123 SE Ocean Blvd Stuart" (la primera, "123 SE Ocean Blvd, Stuart, FL, USA").
- "Deploy WICFL Lead API" 37528103998: success, verificado en la API.

**Pendiente que deja abierto:** la cuenta de Google Cloud es de prueba gratuita y vence hacia el 4-ene-2027 (ver `BACKLOG.md`, W-118). Sin upgrade, el autocompletado deja de responder ese día y el campo vuelve a ser texto normal.
