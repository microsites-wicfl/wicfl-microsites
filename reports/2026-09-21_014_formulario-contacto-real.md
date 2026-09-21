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
