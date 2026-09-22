# 2026-09-22_019 — Studio: reescribir `apps/studio/` como código legible y arreglar la vista de sitio

**Backlog:** W-120 (pieza 1 de 3 de A1)
**Reporte esperado:** `reports/2026-09-22_019_studio-legible.md`

## Actualización de cowork, 2026-09-22 (léela primero)

El primer intento de este prompt no cambió nada: la herramienta de edición rechazó reemplazar
`public/app.js` de una sola línea. **Cowork ya formateó todo `apps/studio/` con Prettier**
(commit siguiente a `75bfe44`, mensaje `style(studio): format…`), verificando que el árbol de
sintaxis (AST) de cada archivo JS es idéntico antes y después: cero cambios de comportamiento.
Ahora todos los archivos tienen líneas normales y se pueden editar con parches.

Quedan tres líneas de más de 120 caracteres en `public/app.js` (22, 32 y 45): son plantillas
HTML largas que Prettier no parte. Se resuelven en el objetivo 3 al separar las vistas en
módulos. El resto del prompt sigue igual; la restricción de "escribir cada archivo completo" ya
no hace falta, usa la herramienta de edición normal.

## Contexto

WICFL Studio es la app donde Pavel va a editar sus sitios (especificación completa en
`prompts/2026-09-22_017_studio-a1-estructura.md`; no hace falta implementarla toda aquí). Dos
intentos anteriores dejaron `apps/studio/` funcional a medias y **escrito en una sola línea por
archivo**: `public/app.js` es una línea de 2,251 caracteres, y `model.js`, `github.js`,
`index.js`, `strings.js`, `style.css` e `index.html` tienen líneas de más de 160.

Eso ya está rompiendo el trabajo: el último intento no pudo aplicar su propio parche a
`public/app.js` porque un archivo de una línea no tiene contexto para un diff. Además hay una
regresión: `siteDetail()` en `src/model.js` devuelve `pages` como objetos `{ path, edited }`,
y `public/app.js` todavía los trata como texto (`x.replace(...)`), así que **abrir cualquier
sitio en la interfaz da error**.

El 018 se reemplaza por tres prompts chicos. Este es el primero y es deliberadamente acotado.

## Objetivo

1. Todo archivo fuente de `apps/studio/` (`src/`, `public/`, `test/`, `README.md`) formateado
   como código normal: una instrucción por línea, funciones con nombre, **ninguna línea de más
   de 120 caracteres**.
2. **Mismo comportamiento que hoy**, salvo la regresión: la vista de sitio usa `page.path` y
   muestra "Editada" en las páginas con `page.edited`.
3. `public/app.js` partido en módulos ES si ayuda a leerlo (por ejemplo `api.js`,
   `views/dashboard.js`, `views/site.js`, `views/page.js`, `html.js` con `esc()`), sin CDN ni
   build. `esc()` escapa `&`, `<`, `>`, `"` y `'`.
4. Tests nuevos, mínimos, con `fetch` inyectado vía `createHandler(fetcher)`:
   - sin identidad → 401; email fuera de `ALLOWED_EMAILS` → 403;
   - `GET /api/sites/:slug` con borrador existente devuelve `pages` como objetos con `edited`
     correcto, leyendo el árbol de la rama del borrador;
   - `GET` de una página con borrador existente la lee de `draft/<slug>`, no de `main`.
   El test de vocabulario prohibido existente se conserva y sigue pasando.

## Restricciones

- **Escribe cada archivo completo** (reemplazo total), no con parches por contexto. Es la
  razón por la que falló el intento anterior.
- **No agregues funcionalidad**: nada de vista previa real, sitios de prueba, ni cambios al
  guardado o al descarte. Eso son los prompts 020 y 021. Si ves un bug fuera de la regresión,
  anótalo en el reporte; no lo arregles.
- Solo `apps/studio/`, `BITACORA.md`, `BACKLOG.md` y tu reporte. Nada más del repo.
- `git fetch` al empezar (no puedes estar detrás de `origin/main`); `git push origin main` al
  terminar.
- El mensaje de commit describe solo lo que el commit contiene.

## Criterio de aceptación

- [ ] Salida de `find apps/studio -name '*.js' -o -name '*.css' -o -name '*.html' | xargs awk
      'length>120{print FILENAME": "FNR}'` vacía, pegada en el reporte.
- [ ] `npm test --prefix apps/studio` verde; salida completa en el reporte.
- [ ] La regresión de la vista de sitio corregida (test del objetivo 4, segundo punto, más la
      interfaz usando `page.path`).
- [ ] `git diff --stat` solo toca los archivos permitidos.
- [ ] Reporte en el formato de `prompts/TEMPLATE.md`, entrada de bitácora **al inicio**, avance
      **al final** de la fila de W-120.

## Commit message

```
refactor(studio): readable source, fix site view page objects, first handler tests

Refs W-120
```
