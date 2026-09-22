# Reporte 017: WICFL Studio A1

**El ejecutor no entregó reporte.** Este archivo lo crea cowork solo para dejar registrada la
revisión del commit `e24994a` (`feat(studio): WICFL Studio A1, site dashboard and one draft per
site behind Cloudflare Access`, 12 archivos, +63/−0, ~2 minutos de ejecución). El trabajo se
rehace en `prompts/2026-09-22_018_studio-a1-completar.md`.

## Revisión de cowork

**2026-09-22 · Se devuelve.** Revisado contra el diff. Lo entregado es un esqueleto, no A1: el
código de la app completa cabe en 63 líneas, varias de ellas de más de 1,000 caracteres
minificados a mano. Hay decisiones buenas que se conservan (Worker con Static Assets, identidad
por `ctx.access` con allowlist, rama `draft/<slug>` y un solo PR por sitio, límite de ruta en
el guardado, strings en un archivo, test de vocabulario prohibido), pero el entregable es
incorrecto en lo que más importa y no cumple el criterio de aceptación.

**Defectos que hacen incorrecto el entregable:**

1. **Las ediciones de Pavel parecen perderse.** `GET /api/sites/:slug/pages/*` lee siempre de
   `main`, nunca del borrador. Pavel guarda, vuelve a abrir la página y ve la versión vieja.
   Lo mismo la lista de páginas del sitio (árbol de `main`).
2. **Vista previa inexistente.** El sitio dice "Preparando vista previa…" siempre que hay
   cambios, sin leer checks ni el comentario de `preview.yml`. No hay link, no hay "lista", no
   hay "falló". Era el objetivo 4 completo.
3. **Sin marca "Editada"** por página ni sección "Sitios de prueba" en el tablero.

**Incumplimientos del prompt:**

4. **Tests:** solo existe el de vocabulario prohibido. Faltan los cinco que el prompt pedía
   explícitamente (401/403, dos guardados → una rama y un PR, escritura fuera de
   `sites/<slug>/` rechazada, descartar, conflicto de `sha`). `github.js` acepta `fetcher` pero
   `index.js` nunca lo inyecta, así que tampoco se podrían probar las rutas.
5. **Sin reporte, sin entrada de bitácora, sin avance en W-120.**
6. **Código minificado a mano** (`app.js`, `index.js`, `model.js`, `style.css`, `strings.js`
   en una línea). Nadie más podrá mantenerlo, incluidos los ejecutores de A2 y A3.
7. Sin verificación de CI ni link del run.

**Defectos menores** (se corrigen en el mismo rehacer): título del PR con el slug en vez del
nombre de marca; `Edited-by` solo en el cuerpo del PR del primer guardado, no en cada commit;
descartar falla si la rama no existe; si la rama existe pero su PR se cerró a mano, nunca se
reabre uno; `esc()` no escapa comillas; `access.dev` sin `aud`.

**Lección para el proceso:** ~2 minutos y +63 líneas para un prompt de ese tamaño es la señal.
El reporte ausente también: un ejecutor que no escribe reporte no verificó lo que hizo. Se le
sugiere a Vic correr el 018 en Codex con el nivel de razonamiento más alto disponible.
