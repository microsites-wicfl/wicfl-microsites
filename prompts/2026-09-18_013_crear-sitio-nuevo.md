# 2026-09-18_013 — El formulario también crea sitios nuevos, no solo edita (W-117)

**Backlog:** W-117 (extiende W-111)
**Fase:** 3 — desbloquea que Pavel arranque el Sitio #2 (Port St. Lucie, confirmado por Kevin
el 17-sep) sin que Vic tenga que crear la carpeta del sitio a mano
**Reporte esperado:** `reports/2026-09-18_013_sitio-nuevo-desde-formulario.md`

## Contexto

Lee `AGENTS.md` completo antes de tocar nada. Después `apps/content-form/src/index.js` entero
(166 líneas, es corto — léelo todo, no por encima), `packages/config-schema/site.config.schema.json`,
`docs/SITE_CONFIG_SCHEMA.md`, `docs/SITE_CONTENT_CHECKLIST.md`, y `scripts/check-production-config.mjs`
completo (también corto).

`apps/content-form` (W-111) ya está en producción y probado de punta a punta, pero solo hace una
cosa: edita el markdown de una página que ya existe, o los campos `brand.name`/`seo` de un sitio
que ya existe. La función `sites(env)` (línea 83) lista los directorios que ya tienen un
`site.config.json` válido — no hay ningún camino para que aparezca uno que todavía no existe.
`docs/OPERATOR_GUIDE.es.md` (Part 2a) ya documenta esta limitación explícitamente: "Lo que este
formulario todavía NO hace: crear una página nueva, publicar un lote de varias páginas de una
vez, o tocar cualquier campo de `site.config.json` fuera de marca/SEO." Y el camino de GitHub
(Part 2b) tampoco lo cubre: su sección "Crear una página nueva" asume que la carpeta
`sites/<slug>/` ya existe — solo explica agregar un archivo `.md` dentro de un sitio existente.

**Esto era teórico hasta el 17-sep.** Kevin confirmó por Slack que Port St. Lucie es la ciudad
del Sitio #2. Pavel ya está escribiendo el contenido en un doc aparte. Para que ese contenido
tenga dónde vivir en el repo, alguien tiene que crear `sites/port-st-lucie/site.config.json` +
`sites/port-st-lucie/content/index.md` — hoy eso lo tendría que hacer Vic a mano, exactamente el
mismo patrón manual que se usó para crear el demo de `stuart-homeowners` en septiembre, nunca
convertido en un paso repetible para Pavel. Ese es el hueco que cierra este prompt.

**Por qué es seguro dejar que Pavel cree el `site.config.json` completo él solo, aunque el
schema pida campos que hoy son de Kevin (dominio, licencia, GA4, CRM, contacto):** el formulario
nunca mergea nada — cada envío es un pull request, revisado antes de mergear, exactamente la
misma propiedad de seguridad que ya tiene el flujo de edición. Y `scripts/check-production-config.mjs`
ya existe como segundo gate, específicamente para que un config con placeholders nunca llegue a
producción aunque pase la validación de forma del schema. La estrategia de este prompt es
apoyarse en esos dos mecanismos que ya existen, no inventar uno nuevo: Pavel llena lo que sabe
(nicho, geografía, SEO, diferenciación, el contenido de la home), y todo lo que no sabe se llena
con el mismo patrón de placeholder que ya usa `sites/_example/site.config.json` — pero con un
matiz importante que tienes que resolver en el paso de diseño 2 de abajo.

## Objetivo

Desde el mismo formulario de `apps/content-form`, con un modo nuevo ("Crear sitio nuevo" además
del "Editar sitio existente" que ya hay), Pavel puede generar un pull request que agrega
`sites/<slug>/site.config.json` y `sites/<slug>/content/index.md` completos y válidos contra el
schema, con placeholders donde falte información que no es suya, sin tocar GitHub ni escribir
JSON a mano. El sitio nuevo se comporta después exactamente igual que uno creado a mano: CI lo
construye y previsualiza igual, nadie lo mergea automáticamente, y no puede llegar a producción
mientras conserve placeholders.

## Preguntas de diseño que TIENES que resolver

Cada una necesita decisión y razonamiento escrito en el reporte, no solo la decisión.

1. **Cómo se comprueba que un slug no existe ya**, sin duplicar lógica de `sites(env)`. El
   helper `github()` (línea 60) hoy lanza una excepción ante cualquier respuesta no-2xx,
   incluido un 404 legítimo de "esta carpeta no existe todavía". Decide cómo distinguir "no
   existe, se puede crear" de un error real de la API (mismo tipo de cuidado que ya tiene el
   `catch` de la línea 91, que trata cualquier error como "no es un sitio válido" — evalúa si
   ese mismo criterio es suficientemente preciso acá o si hace falta distinguir el código de
   estado).

2. **Qué placeholder exacto va en cada campo que Pavel no llena, y tiene que disparar
   `check-production-config.mjs`.** No copies a ciegas los valores de `sites/_example/site.config.json`:
   ese fixture está exento del gate por el guion bajo de su nombre, así que nadie notó que su
   propio `contact.email` (`"hello@example-flood.invalid"`) **no** dispara ninguno de los tres
   patrones que reconoce el script (`/placeholder/i`, `/^pending_/i`, `/0000000$/`). Si copias
   ese mismo patrón para un sitio real, ese sitio podría llegar a producción mostrando un email
   falso sin que el gate lo note. Revisa campo por campo (`contact.trackingPhone`,
   `contact.displayPhone`, `contact.email`, `contact.address`, `contact.licenseNumber`,
   `analytics.ga4`, `analytics.gtm`, `crm.formId`) y para cada uno que Pavel no llena, elige un
   valor que sí dispare al menos un patrón — pruébalo de verdad corriendo el script contra el
   sitio de prueba que crees en el paso de verificación, no lo des por hecho.

3. **Qué campos sí llena Pavel en el formulario nuevo**, con qué controles. Como mínimo:
   `slug` (o se deriva del nombre del sitio — decide y justifica), `brand.name`,
   `niche.product`/`niche.audience`, `geo.city`/`geo.county` (`geo.state` es siempre `"FL"`,
   fijo), `locale.primary`, `products` (mismo catálogo fijo que `niche.product`:
   `flood, homeowners, renters, landlord, umbrella, contractor, commercial-property,
   general-liability, windstorm, condo`), `theme.variant` (confirma las opciones reales contra
   `docs/SITE_CONFIG_SCHEMA.md`/el template, no las inventes), `seo.title`/`seo.description`/
   `seo.primaryKeyword`/`seo.secondaryKeywords`, `differentiation.localProof`/
   `differentiation.uniqueSections` (mínimo uno de cada uno, sustancia real, no boilerplate —
   `docs/SITE_CONTENT_CHECKLIST.md` explica qué cuenta), y el markdown de la página `home`
   (`pageType: home`, va directo al mismo cuadro de texto grande que ya existe para markdown).
   `brand.parent` es siempre `"WICFL"`, fijo. `locale.alternates` arranca en `[]` (ningún piloto
   real lo usa hoy, ver W-022 en `BACKLOG.md`).

4. **Cuánta validación duplica el Worker antes de crear el PR, versus dejársela a CI.**
   `validatedPatch()` (línea 108) hoy solo revisa que los campos editables no vengan vacíos, no
   valida contra el schema completo — se apoya en que `Validate and build` corre en cada PR.
   Decide si el modo "crear sitio" sigue el mismo criterio (consistente con el resto del
   archivo) o si justifica una validación más estricta antes de abrir el PR, y por qué.

5. **Cómo conviven los dos modos en el único archivo `PAGE` (la UI está embebida como string en
   la línea 166).** No dupliques el archivo ni crees un segundo Worker — es una sola página con
   un selector de modo, mostrando/ocultando los campos que correspondan.

## Restricciones

- **Todo esto es `apps/content-form/`.** No toques `packages/template/`, `scripts/build-site.mjs`,
  ni el generador.
- **El formulario sigue sin mergear nada, en ningún modo.** Sigue creando rama + PR, como hoy.
- **No agregues el sitio nuevo a ningún `pods/*.json` ni a ningún `wrangler.*.toml`.** Eso es
  "Adding a site to production" en `docs/SETUP.md`, deliberadamente manual y de Vic, después, y
  no es parte de este prompt.
- **No inventes campos de schema.** Todo lo que el modo nuevo escriba en `site.config.json`
  tiene que validar tal cual contra `packages/config-schema/site.config.schema.json` como está
  hoy — si algo no cierra, es una señal de que falta un campo real, no una excusa para
  inventarlo.
- **Reutiliza los helpers que ya existen** (`github()`, `textToBase64()`, `safeSlug()`, el patrón
  de rama con UUID corto, el try/catch que borra la rama si algo falla a mitad de camino) en vez
  de reescribirlos.
- **No rompas el modo de edición que ya funciona.** Es lo único que Pavel usa hoy en producción.
- **No toques `sites/_example/`** ni ningún sitio real existente.
- Si algo contradice `CLAUDE.md`, detente y repórtalo.

## Pasos

1. `git status` limpio, `git fetch origin`, confirma que local y remoto coinciden antes de
   empezar.
2. Resuelve las cinco preguntas de diseño arriba. Escribe el razonamiento, no solo la decisión.
3. Implementa el modo "Crear sitio nuevo": el endpoint (nuevo, o el mismo `/api/publish` con un
   campo `mode` — decide cuál es más simple de mantener) que arma el `site.config.json` completo
   a partir de lo que Pavel llenó más los placeholders decididos en la pregunta 2, crea
   `sites/<slug>/content/index.md` con el markdown de home que Pavel escribió, y abre el PR con
   los dos archivos en la misma rama — mismo patrón que `publish()` (línea 117), adaptado.
4. Implementa la UI del modo nuevo dentro del mismo `PAGE`.
5. **Prueba en vivo, de punta a punta, contra el repo real — no simules:**
   - Crea un sitio de prueba real desde el formulario, con un slug que dejes exento del gate de
     producción por convención de nombre (revisa cómo `check-production-config.mjs` y
     `.gitignore`/CI tratan los directorios que empiezan con `_`, y decide si tu sitio de prueba
     debería empezar así para no ensuciar el catálogo de sitios reales).
   - Confirma que el PR se creó con los dos archivos nuevos.
   - Confirma que `ci.yml` corre `Validate and build` en verde contra el sitio nuevo.
   - Confirma que `scripts/changed-sites.mjs` reconoce el sitio nuevo como sitio cambiado (una
     carpeta que no existía en el `base` sí cuenta como cambio) y que `preview.yml` lo agrega a
     su matriz y produce un link de preview real.
   - Corre `node scripts/check-production-config.mjs <tu-slug-de-prueba>` a mano contra ese
     sitio y confirma que **falla**, listando cada placeholder que debería encontrar. Si algún
     campo se te escapa sin disparar ningún patrón, ese es un bug de la pregunta 2 — corrígelo
     antes de seguir.
   - Confirma que el modo de edición de sitios/páginas existentes (`stuart-homeowners`, por
     ejemplo) sigue funcionando exactamente igual que antes.
   - Cierra el PR de prueba y borra su rama al terminar, mismo criterio de limpieza que ya se
     usó para probar W-111 el 17-sep.
6. Sube a `main` sin force y pega el resultado de la corrida.

## Criterio de aceptación

- [ ] Pavel puede crear un sitio nuevo completo desde el formulario, sin tocar GitHub ni escribir
      JSON
- [ ] El PR resultante trae `site.config.json` + `content/index.md` nuevos, y ambos validan
      contra el schema
- [ ] `node scripts/check-production-config.mjs <slug-de-prueba>` fallo confirmado en vivo,
      listando los placeholders reales que dejó el formulario
- [ ] `preview.yml` reconoce el sitio nuevo y produce un link de preview real, verificado en vivo
- [ ] El modo de editar un sitio/página que ya existe sigue funcionando sin cambios de
      comportamiento
- [ ] El formulario sigue sin poder mergear nada, en ningún modo
- [ ] Nada de `pods/*.json` ni `wrangler.*.toml` tocado
- [ ] `git status` limpio al terminar, PR y rama de prueba cerrados

## Formato del reporte

Escribe `reports/2026-09-18_013_sitio-nuevo-desde-formulario.md` con:

- **Qué se hizo**
- **Las cinco decisiones de diseño** — una sección por pregunta, con su razonamiento
- **Verificación** — output real de cada punto del paso 5, incluido el listado de placeholders
  que encontró `check-production-config.mjs`
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — en particular, qué le falta todavía a Pavel para arrancar
  Port St. Lucie de punta a punta con esto
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo** y actualiza
W-117 en `BACKLOG.md`. Ciérralo solo si los ocho criterios de arriba están verdes; si algo quedó
a medias, márcalo como avance y di exactamente qué falta.

## Commit message

```
feat(content-form): let Pavel create a new site, not just edit one

Advances W-117 (extends W-111).
```
