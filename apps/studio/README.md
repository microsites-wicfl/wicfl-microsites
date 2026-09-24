# WICFL Studio

La aplicación con la que Pavel edita los microsites sin ver nunca git. Backlog W-120.

## Qué hace hoy (fase A1)

- **Tablero:** todos los sitios de `sites/`, con "Cambios sin publicar / Al día" y "Publicado en
  <dominio> / Aún no se publica" (publicado = el slug está en algún `pods/*.json`). Los sitios
  cuyo nombre empieza con `_` aparecen aparte, como "Sitios de prueba".
- **Vista de sitio:** sus páginas (`content/**/*.md`), marcadas "Editada" si cambiaron en el
  borrador; estado de la vista previa; "Descartar borrador".
- **Edición:** el texto completo de la página (frontmatter incluido). "Guardar en borrador".
  Avisa antes de salir con cambios sin guardar.

Aún no: editor con vista previa lado a lado, página nueva, imágenes (A2); Publicar y alta de
sitio (A3). Mientras tanto Pavel le avisa a Vic para publicar.

## Cómo funciona por debajo

No hay base de datos: el repositorio es la base de datos.

- **Un borrador por sitio:** rama `draft/<slug>` y un solo PR abierto contra `main`. Cada
  guardado es un commit en esa rama (`content(<slug>): update <página>` con `Edited-by: <email>`
  en el cuerpo). El PR se abre en el primer guardado; si alguien lo cerró a mano, el siguiente
  guardado abre otro. Guardar sin cambios no hace nada.
- **Lecturas:** si existe el borrador, la lista de páginas y su contenido salen de él; si no,
  de `main`. Lo guardado es lo que se ve al reabrir.
- **Vista previa:** la produce `.github/workflows/preview.yml` en el PR del borrador. Studio
  solo la lee: el link del comentario con `<!-- wicfl-preview:<slug> -->`, y los jobs de Actions del
  último commit del borrador. Estados: sin borrador / preparando / lista / falló (con el nombre
  del check que falló).
- **Límite de escritura:** `src/paths.js` solo acepta páginas bajo `sites/<slug>/content/`
  (segmentos `[a-z0-9-_]`, extensión `.md`) e imágenes bajo `sites/<slug>/public/images/`
  (JPG, PNG, WebP o GIF, hasta 5 MB; sin SVG porque puede llevar scripts). Es lo que garantiza,
  por construcción, el criterio de Gate A de que el trabajo de Pavel solo toca la carpeta de su
  sitio.
- **Editor (A2):** campos por página (`src/pagefields.js`), vista previa en vivo junto al texto
  (`public/markdown.js`, render propio y seguro; la vista previa del sitio sigue siendo la
  referencia), imágenes que se insertan donde está el cursor, página nueva, borrar y restaurar.
- **Descartar:** cierra el PR y borra la rama. `preview-cleanup.yml` borra el Worker de preview.

## Acceso

Cloudflare Access protege el Worker antes de que corra el código. Para saber quién entró, el
Worker primero prueba `ctx.access.getIdentity()` (lo que simula `wrangler dev`), pero en
producción viene vacío: los Workers con Static Assets corren detrás de un router interno que no
pasa `ctx.access`. Por eso `src/access.js` verifica el token que Access adjunta a cada petición
(`Cf-Access-Jwt-Assertion` o la cookie `CF_Authorization`): firma RS256 contra las llaves públicas
del equipo (`<ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs`, en caché una hora), audiencia
`ACCESS_AUD`, emisor `ACCESS_TEAM_DOMAIN` y vigencia. Las dos variables están en
`wrangler.jsonc`; no son secretas. **Si se renombra el equipo de Zero Trust (`flat-rain-592f`),
hay que cambiar `ACCESS_TEAM_DOMAIN`.** Como segunda barrera, si la variable `ALLOWED_EMAILS`
existe, el correo tiene que estar en ella (401 sin sesión, 403 si no está en la lista).

Login: Access con **One-time PIN** como único método (código al correo) y la política
reutilizable **Studio - Team** (Emails: los de Vic y Pavel). La duración de la sesión la fija
esa política.

## Despliegue

GitHub Actions despliega Studio al cambiar `apps/studio/`, y Codex puede relanzar el workflow.
Lo único que hace Vic en el navegador es:

1. Crear un **token de GitHub** fine-grained, solo para `microsites-wicfl/wicfl-microsites`:
   **Contents: read/write, Pull requests: read/write, Actions: read-only** (Metadata se pone
   solo). Los tokens fine-grained no ofrecen el permiso "Checks", por eso Studio lee el estado
   de los jobs con el API de Actions. Conviene un token nuevo solo para Studio.
2. Guardarlo como secret del repositorio `STUDIO_GITHUB_TOKEN` y guardar la lista de correos de
   Vic y Pavel como `STUDIO_ALLOWED_EMAILS`.
3. Activar Access en el Worker `wicfl-studio` con una política
   por correo con los mismos dos correos. Cubre la URL de `workers.dev`.
4. Pedir a Codex que relance el workflow después de guardar los secrets.

## Desarrollo y pruebas

```sh
npm test --prefix apps/studio        # 42 pruebas, sin dependencias, GitHub simulado en memoria
npx wrangler dev --cwd apps/studio   # identidad falsa de access.dev; necesita GITHUB_TOKEN en .dev.vars
```

`test/fake-github.js` simula las partes del API de GitHub que Studio usa con ramas reales en
memoria, así las pruebas recorren flujos completos (rama desde `main`, commits, compare, PRs).
Una prueba adicional falla si cualquier archivo de `public/` contiene vocabulario de git, carga
algo de otro dominio, o tiene líneas de más de 120 caracteres.
