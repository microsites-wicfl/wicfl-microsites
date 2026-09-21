# Reporte: 2026-09-18_013 — Crear un sitio nuevo desde el formulario

## Qué se hizo

- Se agregó el endpoint autenticado `POST /api/create-site` al Worker existente.
- El formulario ahora ofrece los modos "Edit existing site" y "Create new site" en una sola
  página. El modo nuevo crea un PR con `sites/<slug>/site.config.json` y
  `sites/<slug>/content/index.md`.
- El config incluye los datos que llena Pavel, un home con frontmatter generado y placeholders
  detectables para dominio, contacto, licencia, analítica y CRM.
- Se preservó el flujo de edición existente y la prohibición de merge automático.

## Las cinco decisiones de diseño

### 1. Comprobación de slug existente

`github()` ahora conserva el status HTTP en el error. `createSite()` intenta leer solo
`sites/<slug>/site.config.json`: un 404 permite continuar porque el sitio no existe; cualquier
otro error se propaga. Así no se duplica el escaneo de `sites(env)` ni se confunde una falla de
autorización o de red con un slug disponible.

### 2. Placeholders que bloquean producción

Se usaron valores que cumplen el schema y activan el gate: `placeholder-<slug>.example` para
dominio, `+10000000000` para teléfono, `PLACEHOLDER PHONE`,
`placeholder-<slug>@example.invalid`, `PLACEHOLDER ADDRESS`, `PLACEHOLDER CITY`,
`PLACEHOLDER-FL-LICENSE`, `G-PLACEHOLDER`, `GTM-PLACEHOLDER` y
`PENDING_GHL_FORM_ID`. El email evita el hueco de `_example`, cuyo correo no llevaba ningún
marcador reconocido.

### 3. Campos de Pavel y controles

El modo nuevo pide slug, marca, producto, audiencia, ciudad, condado, idioma, variante,
SEO, evidencia local, sección única y el cuerpo Markdown de home. Producto, audiencia, idioma,
tipo de evidencia y variante son selects con los enums reales. `state` se fija a `FL`,
`parent` a `WICFL`, `alternates` a `[]`, `products` contiene el producto elegido y cada variante
usa un color de acento predefinido. El Worker genera el frontmatter home para que Pavel no
escriba JSON ni frontmatter a mano.

### 4. Validación antes del PR

El modo nuevo verifica forma básica, campos obligatorios y opciones soportadas antes de llamar a
GitHub. No duplica el JSON Schema completo: sigue el criterio de `validatedPatch()`, y CI sigue
siendo la autoridad para validar el contrato completo en el PR. Esto mantiene una respuesta
rápida para errores comunes sin crear dos implementaciones del schema.

### 5. Convivencia en una sola página

Se mantuvo un único Worker y una sola página. Tras el login, un selector alterna los campos de
edición existentes y los de creación; el modo no activo se oculta. Ambos modos comparten la
misma sesión, estado visible y mensaje de PR, pero llaman endpoints distintos para conservar el
flujo de edición sin cambio de comportamiento.

## Verificación

Verificación local:

```text
node --check apps/content-form/src/index.js
npm run check
Result (10 files):
- 0 errors
- 0 warnings
- 0 hints
```

La versión desplegada expuso el texto "Create new site". Se inició sesión contra el Worker real,
se verificaron `GET /api/sites`, `/api/pages?site=stuart-homeowners` y
`/api/page?site=stuart-homeowners&page=index.md`, y siguieron respondiendo correctamente.

La primera prueba creó el PR #10 con un directorio `_w117-form-test-0921`, pero se cerró y su
rama se eliminó: el gate excluye por diseño todo nombre que empieza con `_`, así que no podía
cumplir la comprobación de fallo requerida. La prueba definitiva creó PR #11 desde el Worker con
`w117-form-test-0921`. GitHub confirmó exactamente estos dos archivos nuevos:

```text
sites/w117-form-test-0921/site.config.json
sites/w117-form-test-0921/content/index.md
```

`Validate and build` pasó, `changed-sites.mjs` produjo la matriz con
`w117-form-test-0921`, y `Preview w117-form-test-0921` pasó. El comentario de preview publicó
`https://wicfl-pr11-w117-form-test-0921.wicfl-microsites.workers.dev`; una petición directa
devolvió HTTP 200 y el contenido de la home de prueba.

El gate se ejecutó contra el config creado en el PR y falló con exit 1. Halló los placeholders
generados en dominio, `contact.trackingPhone`, `contact.displayPhone`, `contact.email`,
`contact.address.street`, `contact.address.city`, `contact.licenseNumber`, `analytics.ga4`,
`analytics.gtm` y `crm.formId`. También halló la palabra "placeholder" en la descripción
SEO de prueba, porque el texto desechable la contenía; no es un valor que genere el formulario.

PR #10 y PR #11 terminaron `CLOSED`; ambas ramas se eliminaron. No se hizo merge de ninguna.

La validación remota de GitHub Actions se comprobó directamente después del push: [Validate and
build, run 35606787036](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35606787036)
terminó con **Status: Success**. Pasaron `Validate all site configurations`, descubrimiento y
los builds de `stuart-homeowners` y `_example`.

## Lo que tocaste fuera de lo pedido

Nada. Solo se modificó `apps/content-form/src/index.js` y los archivos de reporte y seguimiento
requeridos.

## Lo que no pudiste verificar

Nada. La corrida remota de GitHub Actions se verificó verde después del push.

## Dónde dudaste

El prompt pide a la vez un directorio de prueba con prefijo `_` y ejecutar el gate contra él.
El gate salta explícitamente esos directorios. Se resolvió con un PR normal y desechable, nunca
mergeado, que permitió comprobar el bloqueo real y luego se limpió.

## Qué te sorprendió del repo

La descripción SEO de la prueba, aunque era un campo que llena Pavel, activó el gate por incluir
la palabra "placeholder" en la explicación desechable. El gate inspecciona toda cadena, como
está diseñado, no solo los campos que el Worker rellena automáticamente.

## Lo que no se hizo

No se tocaron el template, el generador, `pods/*.json`, configuraciones de Wrangler, sitios
existentes ni se añadieron dependencias. No se creó un segundo Worker ni se añadió capacidad de
merge.

## Próximos pasos sugeridos

Pavel puede crear el esqueleto de Port St. Lucie, pero sigue necesitando contenido original,
evidencia local y aprobación de datos de producción. Antes de un deploy real, Vic debe agregar
el sitio a un pod y provisionar dominio, contacto, licencia, analítica, CRM y número de tracking.

## Commits

- `f503692` — `feat(content-form): let Pavel create a new site, not just edit one`
- `b45ae44` — `docs: record W-117 live workflow verification`
