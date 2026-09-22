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
  solo la lee: el link del comentario con `<!-- wicfl-preview:<slug> -->`, y los checks del
  último commit del borrador. Estados: sin borrador / preparando / lista / falló (con el nombre
  del check que falló).
- **Límite de escritura:** `src/paths.js` solo acepta rutas bajo `sites/<slug>/content/`, con
  segmentos `[a-z0-9-_]` y extensión `.md`. Es lo que garantiza, por construcción, el criterio
  de Gate A de que el trabajo de Pavel solo toca la carpeta de su sitio.
- **Descartar:** cierra el PR y borra la rama. `preview-cleanup.yml` borra el Worker de preview.

## Acceso

Cloudflare Access protege el Worker antes de que corra el código; el Worker lee el correo con
`ctx.access.getIdentity()`. Como segunda barrera, si la variable `ALLOWED_EMAILS` existe, el
correo tiene que estar en ella (401 sin sesión, 403 si no está en la lista).

## Despliegue (lo hace Vic en el dashboard, una sola vez)

1. **Token de GitHub** (fine-grained, solo el repo `microsites-wicfl/wicfl-microsites`):
   Contents read/write, Pull requests read/write, Commit statuses read, Checks read, Metadata
   read. El token de content-form tiene Contents y Pull requests pero probablemente no Checks:
   conviene uno nuevo solo para Studio.
2. **Worker:** Workers & Pages → Create → Import a repository → este repo, **root directory
   `apps/studio`**, deploy command `npx wrangler deploy`. Mismo mecanismo que content-form.
3. **Variables:** secreto `GITHUB_TOKEN`; variable `ALLOWED_EMAILS` con los correos de Vic y
   Pavel separados por coma.
4. **Access:** en el Worker → pestaña Access → "Protect this Worker behind Access" → política
   por correo con los mismos dos correos. Cubre la URL de `workers.dev`.
5. Abrir la URL, entrar, y probar contra **Sitios de prueba → Example**: editar dos páginas,
   ver un solo borrador con la vista previa lista, descartarlo.

## Desarrollo y pruebas

```sh
npm test --prefix apps/studio        # 25 pruebas, sin dependencias, GitHub simulado en memoria
npx wrangler dev --cwd apps/studio   # identidad falsa de access.dev; necesita GITHUB_TOKEN en .dev.vars
```

`test/fake-github.js` simula las partes del API de GitHub que Studio usa con ramas reales en
memoria, así las pruebas recorren flujos completos (rama desde `main`, commits, compare, PRs).
Una prueba adicional falla si cualquier archivo de `public/` contiene vocabulario de git, carga
algo de otro dominio, o tiene líneas de más de 120 caracteres.
