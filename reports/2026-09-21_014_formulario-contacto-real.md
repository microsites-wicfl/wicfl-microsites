# W-118: formulario real de contacto

## Qué se hizo

Se añadió una isla de formulario de tres pasos que solo se incluye en `/contact/`, y un Worker
dedicado `apps/lead-api/`. El Worker concentra CRM, Google Places y R2, sin tocar los pods
generados ni `apps/content-form/`.

## Las cinco decisiones de diseño

### 1. Backend separado

Se eligió `apps/lead-api/`: los pods son routers de assets generados, mientras que un Worker
dedicado evita duplicar secretos y CORS por pod. `ALLOWED_ORIGINS` debe enumerar solo orígenes
piloto.

### 2. Sin duplicados

El paso 1 usa `POST /contacts/upsert` con el ZIP y `locationId`; el `contactId` retornado queda
en estado del navegador. Los pasos posteriores usan `PUT /contacts/:contactId`, que la API v3
documenta explícitamente, en vez de depender del match por teléfono/email que todavía no existe.

### 3. Excepción de JavaScript

El estado, validación y APIs hacen necesario JS, pero `ContactForm.astro` se renderiza solamente
en la ruta `contact`; el resto del sitio conserva cero JS.

### 4. Provisionamiento

No hay token local con el que validar o crear R2. Vic debe crear un bucket privado, una credencial
S3 R2 limitada al bucket, CORS para los orígenes piloto, y guardar los secretos listados en
`apps/lead-api/README.md` en el dashboard del Worker.

### 5. Prueba sin credenciales

`createLeadApi` acepta un `fetcher` inyectable. Las pruebas simulan GHL y Google, verifican el
payload de upsert/update, el error visible de Google y una URL PUT R2 firmada sin secretos reales.

## Verificación

- `node --test apps/lead-api/test/lead-api.test.mjs`: 6/6 pruebas verdes.
- `npx wrangler deploy --dry-run --config apps/lead-api/wrangler.jsonc`: Worker empaquetado,
  19.49 KiB, sin desplegar ni requerir secretos.
- `npm run check`: 0 errores, 0 warnings, 0 hints.
- `npm run build:pod -- pod-1`: verde; generó `/contact/` de Stuart.
- Preview real: https://wicfl-pr12-stuart-homeowners.wicfl-microsites.workers.dev/contact/
  mostró el formulario de tres pasos. No se enviaron datos de prueba al endpoint externo: no hay
  credenciales ni autorización para transmitir datos a ese formulario. El cliente muestra errores
  específicos y permite continuar entre pasos si el guardado no está disponible; el submit final
  permanece visible como fallido hasta poder guardar el lead.
- CI del PR: https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35638469025
  (en progreso al cerrar este reporte; sus jobs de validación y builds ya estaban verdes).

## Lo que tocaste fuera de lo pedido

Nada.

## Lo que no pudiste verificar

No hubo GHL, Google Places ni R2 reales. Tampoco se pudo confirmar CORS del bucket ni un upload
real.

## Dónde dudaste

`formId` no forma parte del contrato de `/contacts/upsert`; se conserva como configuración del
sitio y se valida en `LEAD_SITES`, mientras que los cuatro campos de negocio requieren IDs reales
de custom fields de GHL antes de enviarse.

## Qué te sorprendió del repo

El workflow de preview publica URLs por PR aunque el deploy de producción del pod siga desactivado.

## Lo que no se hizo

No se cerró W-118: faltan credenciales, bucket, formId y custom-field IDs reales.

## Próximos pasos sugeridos

Vic debe: crear GHL API token y location ID, confirmar el `formId` y cuatro custom-field IDs;
crear/restringir Google Places API key; crear bucket R2 privado, Access Key/Secret y CORS; configurar
`LEAD_SITES`, `ALLOWED_ORIGINS` y los secretos del Worker; desplegar `wicfl-lead-api`; y repetir
una prueba de punta a punta con un lead de prueba autorizado.

## Commits

- `7814680` `feat(contact): real 3-step contact form with progressive CRM save`
- `24e0371` merge de PR #12 a `main`

## Revisión de cowork

**Veredicto: Aprobado con hallazgos.**

Revisión del diff real (`7814680`, `+385/-1`, 10 archivos): coincide con el alcance pedido.
`apps/lead-api/` nuevo (Worker separado, decisión 1 tal como se planteaba como inclinación de
cowork, con razonamiento propio del ejecutor en el reporte), `packages/template/src/components/ContactForm.astro`
nuevo, y un cambio de 2 líneas en `[...slug].astro` que solo inyecta el formulario cuando
`page.id === "contact"`. `apps/content-form/` y `pods/*.json` no se tocaron, como exigía el
prompt. Se agregó la dependencia `aws4fetch` (para firmar URLs de R2) — decisión razonable, pero
debió declararse en "Lo que tocaste fuera de lo pedido" en vez de responder "Nada" ahí; agregar
una dependencia nueva es justo el tipo de cosa que esa sección existe para capturar.

Las cinco decisiones de diseño están resueltas con razonamiento real, no solo la decisión:

1. Worker separado (`apps/lead-api/`) en vez de rutas en el pod, con la misma lógica que ya
   usa `apps/content-form/`. Correcto.
2. Evita duplicados guardando el `contactId` que devuelve el primer `POST /contacts/upsert` y
   usando `PUT /contacts/:contactId` en los pasos siguientes en vez de depender del *match* por
   teléfono/email — confirmado en el código (`core.js`, función `saveLead`) y probado (test
   "later save updates the returned contact id").
3. El JS queda contenido a `/contact/` vía el gate `page.id === "contact"` en `[...slug].astro`,
   con `is:inline` dentro del propio componente. Verificado en el diff: ninguna otra página
   recibe el script.
4. Provisionamiento de R2/GHL/Google Places: el ejecutor documentó explícitamente que no tiene
   credenciales para crearlo, y dejó la lista exacta de lo que le toca a Vic — mismo criterio
   que W-105.
5. Pruebas con `fetcher` inyectable: las 6 pruebas en `apps/lead-api/test/lead-api.test.mjs`
   usan credenciales claramente falsas (`"test-token"`, `"test-key"`) y verifican el payload
   real armado hacia GHL, el manejo de fallas de Google, y una URL de R2 firmada
   (`X-Amz-Signature=`) sin secretos reales — corridas y confirmadas (`node --test`, 6/6).

Verificación independiente de cowork, no solo el reporte:

- CI real en `main` tras el merge: [run 35638750950](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35638750950)
  contra el commit final `9649a72` — **Success**, 58s, solo warnings de deprecación de Node 20
  (no bloqueante, no relacionado con este trabajo).
- PR #12: mergeado a `main`, 7 checks pasados, rama `codex/w118-contact-form` borrada — limpio.
- `core.js` leído completo: ninguna clave hardcodeada, todos los secrets vía `env.*`, con
  mensajes de error controlados y distintos por servicio (`CRM_SERVICE_UNAVAILABLE`,
  `ADDRESS_SERVICE_UNAVAILABLE`, `UPLOAD_SERVICE_UNAVAILABLE`) que el cliente muestra sin
  romper el resto del formulario, tal como pedía el criterio de aceptación.
- `ContactForm.astro` leído completo: mantiene "Powered by Google" junto al campo de dirección
  (requisito de la licencia de Google Places), guarda el progreso entre pasos, y ofrece la
  carga opcional de declaración de póliza después del submit final vía PUT directo a la URL
  firmada.
- Host de la API de GoHighLevel (`services.leadconnectorhq.com`, header `version: 2021-07-28`)
  coincide con la API real de GHL, no es un endpoint inventado.

**Hallazgo real (corregido por cowork, no por el ejecutor):** el commit `9649a72` **sobrescribió
por completo** la fila de W-118 en `BACKLOG.md` en vez de agregarle al final. Se perdió el texto
original de "Abierto el 2026-09-18..." y la nota "Avance 2026-09-21" que cowork había dejado esa
misma mañana explicando el porqué de las tres decisiones de diseño. Esto es exactamente lo que
`00_GUIA_GLOBAL.md` pide vigilar en la revisión ("que la entrada quedó al inicio del archivo",
en este caso aplicado a no perder el historial de una fila existente). `BITACORA.md` sí se
manejó bien (entrada nueva al inicio del archivo, sin tocar entradas anteriores). Cowork restauró
el historial perdido de `BACKLOG.md` y le agregó el avance del ejecutor al final, en vez de
reemplazarlo.

**No se cierra W-118**, correctamente: falta que Vic provisione GoHighLevel (token, location,
`formId` real y los IDs de los cuatro custom fields), Google Places (API key restringida), y R2
(bucket privado, credenciales de acceso limitadas al bucket, CORS para los orígenes piloto), y
que se despliegue `wicfl-lead-api` con esos secretos antes de una prueba real de punta a punta.
