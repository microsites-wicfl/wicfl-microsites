# 2026-09-21_014 — Formulario real de `/contact/`: 3 pasos, guardado progresivo, autocompletado y carga de póliza (W-118)

**Backlog:** W-118 (nace de W-025, que resolvió qué campos pedir pero no cómo construirlos)
**Fase:** 3 — el `/contact/` de cada sitio hoy es solo texto estático
(`sites/stuart-homeowners/content/contact.md`) diciendo "prepárate para darnos esta
información"; no existe ningún formulario real
**Reporte esperado:** `reports/2026-09-21_014_formulario-contacto-real.md`

## Contexto

Lee `CLAUDE.md` completo, `docs/ARCHITECTURE.md` (especialmente la fila "Framework: Astro...
zero JS by default" y la sección "Grouping" sobre pods), `packages/config-schema/site.config.schema.json`
completo (los objetos `contact` y `crm`), `scripts/pod-worker-template.mjs` completo (17 líneas,
es corto), `apps/content-form/src/index.js` completo como referencia del patrón de Worker que ya
usa el proyecto (auth, helpers, manejo de secrets vía Cloudflare dashboard), y
`sites/stuart-homeowners/content/contact.md`.

El 9 de septiembre Vic le preguntó a Kevin qué campos capturar en el formulario de contacto real
(W-025). Kevin contestó el 18 de septiembre, y no fue solo una lista de campos: mandó el diseño
completo del funnel. Es un formulario progresivo de 3 pasos:

1. Código postal
2. Razón de la compra + dirección de la propiedad
3. Nombre, teléfono, email, timing, aseguradora actual, prima anual (opcional)

Con guardado progresivo del lead en el CRM antes del submit final (para no perder leads que
abandonan a mitad de camino), autocompletado de dirección en el paso 2, copy de landing page y
de la pantalla de confirmación, y una carga opcional de la declaración de póliza actual después
del submit. Ver `BITACORA.md`, entrada del 17/18-sep ("Kevin respondió la pregunta de campos del
formulario de contacto"), para el texto completo de la respuesta de Kevin.

Esto abre alcance nuevo que W-025 no había anticipado, y cowork ya resolvió las tres decisiones
de diseño que lo bloqueaban, con aprobación de Vic el 21-sep:

- **Guardado progresivo → GoHighLevel `POST /contacts/upsert` (API v3).** Solo exige
  `locationId`; todos los demás campos son opcionales, así que acepta datos parciales.
  Documentación: https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/
- **Autocompletado de dirección → Google Places API.** Con el volumen de hoy (3 sitios piloto)
  no hay forma de acercarse al tier gratis de 5,000 sesiones/mes, así que en la práctica sale
  gratis. Obliga a mostrar el atributo "Powered by Google" en la UI del autocompletado — no lo
  quites.
- **Carga de la declaración de póliza → Cloudflare R2, bucket privado con URLs firmadas de
  corta duración.** El navegador sube el archivo directo a R2 vía `PUT` con una URL firmada que
  el Worker genera después de validar la sesión del formulario; el Worker nunca maneja los bytes
  del archivo.

**Ninguna de las tres credenciales reales existe todavía.** W-101 (alta de GoHighLevel) sigue
abierto: falta que Vic saque las credenciales de API y el `formId` real. No existe ninguna API
key de Google Places. No existe ningún bucket de R2 provisionado. Esto no bloquea escribir el
código — bloquea probarlo en vivo contra los tres servicios reales. Ver la sección de
Verificación más abajo para cómo probar sin esas credenciales.

## Objetivo

Cuando termines, `/contact/` en cada sitio (empezando por `stuart-homeowners`, el único con
contenido real) muestra el formulario de 3 pasos que describió Kevin, guarda el lead
progresivamente en GoHighLevel conforme el visitante avanza, ofrece autocompletado de dirección
en el paso 2 vía Google Places, y permite subir opcionalmente la declaración de póliza actual
después del submit final, guardándola en un bucket privado de R2 vía URL firmada. Nada de esto
se puede verificar en vivo contra los tres servicios externos todavía (faltan credenciales
reales), pero el código, la validación y el manejo de errores sí.

## Preguntas de diseño que TIENES que resolver

Cada una necesita decisión y razonamiento escrito en el reporte, no solo la decisión.

1. **Dónde vive el backend del formulario.** `scripts/pod-worker-template.mjs` (el Worker que
   sirve cada pod hoy) es puramente un router de assets estáticos hacia `env.ASSETS.fetch()` —
   no tiene secrets, no tiene ninguna ruta dinámica, y el comentario en el archivo lo marca como
   generado, "no editar a mano". Dos caminos: (a) agregarle rutas dinámicas antes del fallback a
   `ASSETS.fetch()`, con secrets (GHL, Google Places, credenciales de R2) bindeados por pod en
   cada `wrangler.pod-N.toml`; o (b) un Worker nuevo y separado (p.ej. `apps/lead-api/`), con sus
   propios secrets en un solo lugar, al que el formulario le hace `fetch()` desde el navegador
   (cross-origin, con CORS explícito solo para los dominios de los sitios piloto). La inclinación
   de cowork es (b): mantiene los secrets en un solo Worker en vez de duplicados en cada pod, no
   toca infraestructura generada que crece con el conteo de sitios, y sigue el mismo patrón que
   ya usa `apps/content-form` (un Worker chico y dedicado, no lógica metida en el pipeline de
   sitios). Decide tú, con tu propio razonamiento, no solo repitas el nuestro si no lo comparás
   de verdad.

2. **Cómo evitar leads duplicados en el guardado progresivo, dado que el paso 1 no tiene ni
   teléfono ni email.** El endpoint `/contacts/upsert` de GoHighLevel hace *match* por teléfono o
   email — pero esos campos no existen todavía en el paso 1 (solo código postal) ni en el paso 2
   (razón de compra + dirección). Lee la documentación real de la API de contactos de GoHighLevel
   (no solo el resumen de este prompt) y decide el mecanismo: por ejemplo, guardar el `contactId`
   que devuelve la primera llamada (aunque sea con datos parciales y sin email/teléfono) en el
   estado del formulario en el navegador, y usar ese id explícito en las llamadas de los pasos 2
   y 3 en vez de depender del *match* automático por teléfono/email. Verifica en la
   documentación real si eso es posible antes de construirlo así.

3. **Cómo convive un formulario con estado y JavaScript con el principio de "zero JS by
   default" de `docs/ARCHITECTURE.md`.** Es una desviación real y consciente, no un descuido: un
   formulario progresivo de 3 pasos con llamadas a APIs externas no puede ser HTML puro.
   Constrúyelo como una isla aislada, cargada solo en la página de contacto (nunca un script
   global que se sirva en páginas que no lo necesitan), y documenta la decisión en el reporte con
   el mismo criterio que ya se usó para `showInNav` en W-116 (una desviación justificada, no
   silenciosa).

4. **Quién provisiona el bucket de R2 y las claves de API reales, y cómo lo documentas si no
   puedes hacerlo tú.** Si tienes un token de Cloudflare con permisos para crear un bucket de R2
   (revisa si el mismo `CLOUDFLARE_API_TOKEN` que ya existe en GitHub Actions alcanza, o si hace
   falta uno nuevo con permisos de R2), créalo y documenta el nombre exacto y el binding. Si no
   tienes ese acceso, dilo explícitamente en el reporte con los pasos exactos que le quedan a
   Vic, mismo criterio que ya se usó en W-105 (dejar un checklist en vez de bloquear el prompt
   completo).

5. **Cómo se prueba esto sin credenciales reales de GoHighLevel ni de Google Places.** No
   inventes credenciales de prueba ni las dejes hardcodeadas en el código. Decide cómo aislar las
   llamadas a las tres APIs externas detrás de una capa que se pueda probar con un mock/stub en
   pruebas automatizadas (por ejemplo, un cliente HTTP inyectable, o una variable de entorno que
   apunte a un servidor de prueba local durante el test), de forma que la lógica de tu Worker
   (armar el payload correcto, manejar errores, guardar el `contactId`) quede probada de verdad,
   aunque la llamada real a GoHighLevel/Google Places no se pueda ejercitar todavía.

## Restricciones

- No inventes campos de schema. Si el formulario necesita guardar algo en `site.config.json`
  (por ejemplo el `formId` real de GoHighLevel), ya existe en `crm.formId` — no agregues campos
  nuevos al schema sin que falte uno real y lo justifiques en el reporte.
- No hardcodees ninguna clave de API, token, o secreto en el código ni en los archivos del repo.
  Todo secret real se referencia por nombre de variable de entorno, documentado, nunca con un
  valor de ejemplo que parezca real.
- No agregues el Worker nuevo (si eliges el camino (b) de la pregunta 1) a ningún `pods/*.json`
  — eso es infraestructura de sitios estáticos, no aplica aquí.
- No toques `apps/content-form/` — es un Worker completamente distinto, para el operador, no
  para el visitante del sitio.
- El resto del sitio (nav, otras páginas) sigue sin JavaScript. Esta es la única excepción, y
  tiene que quedar contenida a `/contact/`.
- Si algo contradice `CLAUDE.md`, detente y repórtalo.

## Pasos

1. `git status` limpio, `git fetch origin`, confirma que local y remoto coinciden antes de
   empezar.
2. Resuelve las cinco preguntas de diseño arriba. Escribe el razonamiento, no solo la decisión.
3. Implementa el backend (Worker nuevo o rutas nuevas, según lo que decidiste en la pregunta 1):
   - Endpoint de guardado progresivo del lead (llama a GoHighLevel `/contacts/upsert` o
     `PUT /contacts/{id}` según lo que decidiste en la pregunta 2).
   - Endpoint (o proxy) de autocompletado de dirección vía Google Places, de forma que la clave
     de API nunca llegue al navegador del visitante.
   - Endpoint que genera la URL firmada de R2 para la carga opcional de la declaración de
     póliza, con expiración corta y `Content-Type` restringido a PDF/imagen.
4. Implementa la UI de los 3 pasos en `/contact/`, con el copy que mandó Kevin (revisa
   `BITACORA.md` 17/18-sep para el texto completo; si algo del copy no está ahí, escribe un copy
   propio en el mismo tono que el resto del sitio, y dilo en el reporte).
5. Implementa la pantalla de confirmación y el flujo de carga opcional de la declaración de
   póliza después del submit final.
6. Prueba lo que se puede probar sin credenciales reales:
   - Pruebas automatizadas de la lógica del backend con las llamadas externas mockeadas
     (pregunta 5).
   - `wrangler deploy --dry-run` del Worker nuevo (o de los pods si elegiste el camino (a)).
   - Prueba en vivo del formulario contra `stuart-homeowners` en preview: que los 3 pasos
     avancen, que la validación de campos funcione, que el estado se mantenga entre pasos, y que
     las llamadas a las APIs externas fallen de forma visible y controlada (no un error
     genérico) porque no hay credenciales reales todavía — confirma que ese fallo no rompe el
     resto del formulario.
   - `npm run check` y el build del pod, verdes.
7. Sube a `main` sin force y pega el resultado de la corrida.

## Criterio de aceptación

- [ ] Las cinco preguntas de diseño resueltas con razonamiento escrito
- [ ] Backend nuevo (Worker o rutas) implementado, sin secrets hardcodeados
- [ ] `/contact/` de `stuart-homeowners` muestra el formulario de 3 pasos real, probado en vivo
      en preview
- [ ] Lógica de guardado progresivo, autocompletado y carga de R2 probada con mocks, con output
      real en el reporte
- [ ] Fallo controlado y visible cuando las APIs externas no responden (porque no hay
      credenciales), sin romper el formulario
- [ ] `npm run check` y build del pod en verde
- [ ] Ningún secret real en el repo
- [ ] `git status` limpio al terminar

## Formato del reporte

Escribe `reports/2026-09-21_014_formulario-contacto-real.md` con:

- **Qué se hizo**
- **Las cinco decisiones de diseño** — una sección por pregunta, con su razonamiento
- **Verificación** — output real de cada punto del paso 6
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar** — en particular, todo lo que depende de credenciales reales de
  GoHighLevel, Google Places o R2
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — en particular, la lista exacta de lo que Vic tiene que
  provisionar (credenciales, bucket, formId) para que esto se pueda probar en vivo de punta a
  punta, y qué automatización sigue si sobra
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas
tú.)*

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo** y actualiza
W-118 en `BACKLOG.md`. Ciérralo solo si los ocho criterios de arriba están verdes; si algo quedó
a medias (muy probable, dado que faltan las tres credenciales reales), márcalo como avance y di
exactamente qué falta.

## Commit message

```
feat(contact): real 3-step contact form with progressive CRM save

Advances W-118.
```
