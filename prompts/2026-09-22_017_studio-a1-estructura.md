# 2026-09-22_017 — WICFL Studio, fase A1: la plataforma de Pavel (estructura, tablero y borrador por sitio)

**Backlog:** W-120 (nuevo)
**Fase:** 3, en paralelo con el launch del sitio #1
**Reporte esperado:** `reports/2026-09-22_017_studio-a1-estructura.md`

## Contexto

Pavel opera la fábrica desde el 21 de septiembre y escribe el sitio #2 (Port St. Lucie) desde
el 12 de octubre. Hoy su herramienta es `apps/content-form/`: un Worker de una sola página con
un `<textarea>` por página, que abre **un pull request por cada página editada** y le responde
"Draft pull request #N created. Review it before merging". No puede crear páginas, no puede
publicar, no ve el preview ni el estado de su trabajo sin ir a GitHub, y el vocabulario es de
git. Vic lo identificó como su bloqueo más grande para capacitar a Pavel. `docs/OPERATOR_GUIDE.md`
todavía enseña GitHub botón por botón porque el formulario no alcanza.

Se decidió construir **WICFL Studio**: una sola aplicación donde Pavel ve sus sitios, edita,
previsualiza y (en A3) publica, sin ver jamás git. Se construye en tres prompts:

- **A1 (este):** la app, el acceso, el tablero, la vista de sitio y el modelo de un borrador por
  sitio, con una edición básica para poder probar el modelo de punta a punta.
- **A2:** editor de verdad (frontmatter como formulario, markdown con preview lado a lado),
  página nueva, subida de imágenes.
- **A3:** panel de "¿listo para publicar?", botón Publicar, y el alta de sitio nuevo migrada
  aquí. Después de A3, `apps/content-form/` se retira.

### Lo que no cambia, y por qué

Git, los PRs, el preview por PR (`preview.yml`) y los gates **siguen siendo el mecanismo**; la
app los esconde, no los reemplaza. Los dos criterios que deciden Gate A se verifican con git
(el diff de Pavel solo toca `sites/<slug>/**`; regenerar desde config reproduce lo publicado), y
el preview y el gate de diferenciación cuelgan del PR. **No hay base de datos: el repo es la
base de datos.**

### Las decisiones de diseño ya tomadas (no se reabren)

1. **Un borrador por sitio, no por página.** Rama `draft/<slug>`, un solo PR abierto por sitio.
   Todas las ediciones de ese sitio se acumulan ahí como commits. Un preview del sitio completo.
   Hoy son N PRs y N previews por N páginas; eso es lo que se elimina.
2. **Acceso con Cloudflare Access**, no contraseña compartida. Access protege el Worker antes de
   que corra el código (se activa en el dashboard: Workers & Pages → el Worker → Access →
   "Protect this Worker behind Access"). El Worker lee la identidad con
   `await ctx.access.getIdentity()`, sin parsear JWT. Documentación:
   https://developers.cloudflare.com/workers/configuration/cloudflare-access/
3. **Interfaz en español.** Pavel es el usuario. Vocabulario completo que ve: *sitio, página,
   borrador, cambios sin publicar, vista previa, publicar, en vivo, descartar borrador*.
   **Prohibido en cualquier texto visible:** "pull request", "PR", "branch", "rama", "merge",
   "commit", "GitHub", "repositorio", "push". Todos los textos de interfaz en un solo archivo de
   strings.
4. **Nombre:** "WICFL Studio". Worker `wicfl-studio`. URL inicial la de `workers.dev`; dominio
   propio después.

## Objetivo

Cuando termines tiene que ser cierto:

1. Existe `apps/studio/`: un Worker con Static Assets para la interfaz y rutas `/api/*`,
   con su propio `wrangler.jsonc`, deployable de forma independiente del resto del repo.
2. Toda ruta `/api/*` exige identidad de Access: sin identidad, 401. Además, si existe la
   variable `ALLOWED_EMAILS` (lista separada por comas), el email tiene que estar en ella; si no,
   403. Defensa en profundidad por si alguien desactiva Access sin querer.
3. **Tablero de sitios** (pantalla inicial): cada sitio de `sites/*/site.config.json` con su nombre
   de marca, dominio, y estado en lenguaje llano: *"Cambios sin publicar"* si existe
   `draft/<slug>` con diferencias contra `main`, *"Al día"* si no. Además *"Publicado en
   <dominio>"* si el slug aparece en algún `pods/*.json`, o *"Aún no se publica"* si no. Los
   sitios que empiezan con `_` aparecen aparte bajo "Sitios de prueba".
4. **Vista de sitio:** lista de sus páginas (`content/**/*.md`, incluidas las de subcarpetas de
   idioma), cada una marcada "Editada" si difiere en el borrador. Arriba, el estado de la vista
   previa del borrador: *"No hay borrador"*, *"Preparando vista previa…"*, *"Vista previa lista"*
   con link, o *"La vista previa falló"* con el motivo en una línea. Botón "Descartar borrador".
5. **Edición básica** (se reemplaza en A2): abrir una página muestra su contenido completo
   (frontmatter incluido) en un área de texto; "Guardar en borrador" lo escribe en `draft/<slug>`.
   Si el borrador no existe, se crea desde `main` y se abre su PR en ese momento. Guardados
   siguientes van a la misma rama y al mismo PR.
6. **Descartar borrador:** cierra el PR y borra la rama, tras una confirmación dentro de la app
   (no `window.confirm`). `preview-cleanup.yml` ya borra el Worker de preview al cerrar el PR.
7. **Límite de escritura duro:** el backend rechaza cualquier escritura cuya ruta no esté bajo
   `sites/<slug>/` del sitio que se está editando. Con test.

## Restricciones

- **No toques `apps/content-form/`.** Pavel lo usa hoy y lo seguirá usando hasta A3. Si quieres
  reutilizar sus helpers de GitHub, cópialos a `apps/studio/` (con los fixes que ya tienen: header
  `User-Agent`, status HTTP conservado en errores, slugs con `_`).
- No toques `packages/`, `sites/`, `scripts/`, `pods/`, `wrangler.pod-1*.toml` ni los workflows.
  Si el modelo de un borrador por sitio necesita algo de `preview.yml` que hoy no hace, **no lo
  cambies**: repórtalo en "Dónde dudaste".
- **Sin paso de build obligatorio para la interfaz.** Vanilla JS con módulos ES, o una
  micro-librería (p. ej. Preact + htm) **vendoreada como archivo del repo**, nunca cargada desde
  un CDN en runtime. Elige y justifica. Sin dependencias npm nuevas en la raíz.
- La interfaz tiene que verse como una aplicación, no como un formulario de prueba: tipografía
  legible, jerarquía clara, estados vacíos y de carga explícitos, errores en lenguaje llano. No
  hace falta diseño elaborado; hace falta que Pavel no tenga que adivinar.
- Ningún secreto en el cliente. El token de GitHub vive solo en el Worker (`GITHUB_TOKEN`).
- Antes de empezar, `git fetch`: tu `main` local no puede estar **detrás** de `origin/main`; si lo está, detente y repórtalo. Estar **adelante** es normal (commits de cowork sin subir) y no es motivo para detenerse. Al terminar, `git push origin main`: sube tus commits y los de cowork juntos.

## Pasos

1. **Estructura.** `apps/studio/` con `wrangler.jsonc` (`name: wicfl-studio`, `assets` apuntando
   a `apps/studio/public`, vars `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BASE_BRANCH` iguales a las
   de content-form, `observability` activado), `src/` para el backend y `public/` para la
   interfaz. Configura el bloque `access.dev` de wrangler para desarrollo local con una identidad
   de prueba, según la documentación enlazada arriba.

2. **Backend.** Separa en módulos: acceso (identidad + allowlist), cliente de GitHub (fetch
   inyectable para tests), modelo de sitios, modelo de borrador. Endpoints mínimos:
   `GET /api/me`, `GET /api/sites`, `GET /api/sites/:slug`, `GET /api/sites/:slug/pages/*`,
   `PUT /api/sites/:slug/pages/*`, `DELETE /api/sites/:slug/draft`. Ajusta nombres si lo
   justificas.
   - Estado del borrador: existencia de `draft/<slug>`, diff contra `main` (compare API), PR
     abierto con head `draft/<slug>`.
   - Estado de la vista previa: checks/statuses del último commit del borrador, y la URL del
     comentario que deja `preview.yml` (marcador `<!-- wicfl-preview:<slug> -->`). Si el
     comentario todavía no existe, "Preparando vista previa…".
   - Guardado: usa el `sha` del archivo **en la rama del borrador**; si GitHub responde conflicto,
     el mensaje es "Esta página cambió mientras la editabas. Recarga para ver la versión actual."
   - Mensajes de commit automáticos en inglés, legibles: `content(<slug>): update <ruta>` y el
     email de Access en el cuerpo (`Edited-by: <email>`), para que el historial diga quién editó.
   - Título del PR: `Draft: <brand name>`; cuerpo: que es el borrador del sitio gestionado desde
     WICFL Studio y que no se debe editar a mano.

3. **Interfaz.** Tres pantallas (tablero, sitio, edición) con navegación por URL (`#/`,
   `#/sitio/<slug>`, `#/sitio/<slug>/pagina/<ruta>`) para que Vic pueda mandarle a Pavel un link
   directo. Muestra el email de la sesión arriba. Todos los textos en `public/strings.js` (o
   equivalente).

4. **Tests** (`node --test`, sin dependencias, fetch mockeado):
   - Sin identidad → 401; email fuera de `ALLOWED_EMAILS` → 403.
   - Primer guardado crea rama desde `main` y abre PR; segundo guardado de **otra** página del
     mismo sitio commitea a la misma rama y **no** abre otro PR.
   - Escritura fuera de `sites/<slug>/` → rechazada.
   - Descartar cierra PR y borra rama.
   - Conflicto de `sha` → mensaje en lenguaje llano.
   - **Un test que recorre todos los archivos de `public/` y falla si aparece cualquier palabra
     prohibida** de la lista de arriba en texto visible. Conéctalo a un script
     `npm test --prefix apps/studio` o equivalente y documenta cómo correrlo.

5. **Despliegue y acceso.** Intenta desplegar con las credenciales que tengas. Si no puedes,
   deja en el reporte la lista exacta que Vic hace en el dashboard, en orden:
   crear el Worker conectado al repo (Workers Builds, directorio raíz `apps/studio`, igual que
   content-form); cargar el secreto `GITHUB_TOKEN` (fine-grained, solo este repo, permisos
   **Contents: read/write, Pull requests: read/write, Commit statuses: read, Checks: read**; di si
   el token actual de content-form ya los tiene o no); activar Access en el Worker con política
   por email; `ALLOWED_EMAILS` con los correos de Vic y Pavel.

6. **Prueba real de punta a punta**, si quedó desplegado y con Access activo (si no, déjala
   descrita como pendiente y **no** cierres W-120): contra `sites/_example`, editar dos páginas
   distintas → confirmar **un** PR y **una** rama `draft/_example` con dos commits; esperar la
   vista previa y confirmar que la app muestra "Vista previa lista" con el link correcto; abrir
   el link; descartar el borrador → PR cerrado, rama borrada, app de vuelta en "Al día". Pega
   evidencia (números de PR, SHAs, URL del preview, capturas si puedes).

7. **Docs.** `apps/studio/README.md`: qué es, cómo se despliega de verdad (el mecanismo que
   usaste, no uno teórico: content-form tuvo ese problema), cómo se corre local y los tests, los
   permisos del token. No toques `docs/OPERATOR_GUIDE*.md`; se reescriben después de A3.

8. **Bitácora y backlog.** Entrada al **inicio** de `BITACORA.md`. En `BACKLOG.md`, agrega el
   avance al **final** de la fila de W-120 sin sobreescribir lo que ya dice.

## Criterio de aceptación

- [ ] `apps/studio/` existe, despliega de forma independiente, y `git diff --stat` no toca
      `apps/content-form/`, `packages/`, `sites/`, `scripts/`, `pods/`, wrangler de pods ni
      workflows.
- [ ] Todos los tests pasan, incluido el de palabras prohibidas (pega la salida).
- [ ] Dos ediciones de dos páginas del mismo sitio producen una rama y un PR (test, y prueba
      real si hubo despliegue).
- [ ] Ninguna escritura puede salir de `sites/<slug>/` (test).
- [ ] Sin identidad → 401; fuera de allowlist → 403 (test).
- [ ] La interfaz no tiene ninguna dependencia cargada desde un CDN (muéstralo con un grep de
      `http` en `public/`).
- [ ] README con el mecanismo real de despliegue y los permisos del token.
- [ ] CI verde en el commit final (link del run).

## Formato del reporte

Escribe `reports/2026-09-22_017_studio-a1-estructura.md` con:

- **Qué se hizo** — lista de cambios concretos
- **Decisiones tomadas** — cualquier bifurcación que resolviste y por qué (en particular: librería
  de interfaz o vanilla, y cómo detectas la URL del preview)
- **Verificación** — cómo comprobaste que funciona, con output real
- **Lo que tocaste fuera de lo pedido** — con la razón. Si no hubo, dilo explícitamente
- **Lo que no pudiste verificar** — distinto de lo que no se hizo
- **Dónde dudaste** — cada punto donde el prompt era ambiguo y tuviste que elegir
- **Qué te sorprendió del repo** — cualquier cosa que no coincidió con lo que el prompt te
  llevó a esperar
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — incluido lo que A2 y A3 deberían saber de lo que encontraste
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
feat(studio): WICFL Studio A1, site dashboard and one draft per site behind Cloudflare Access

Refs W-120
```
