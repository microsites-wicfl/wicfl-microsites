# Reporte 019: WICFL Studio A1, escrita por cowork

**Autor: cowork**, por excepción autorizada por Vic (ver `CLAUDE.md`, "Excepción registrada").
Cubre todo el alcance de A1 definido en `prompts/2026-09-22_017_studio-a1-estructura.md` y
`prompts/2026-09-22_018_studio-a1-completar.md`, y reemplaza lo que planeaban 019, 020 y 021.

## Qué se hizo

Reescritura completa de `apps/studio/` (25 archivos, +1505/−385). Se conservaron las decisiones
buenas del 017 (Worker con Static Assets, `ctx.access` + `ALLOWED_EMAILS`, `draft/<slug>` con
un PR por sitio, strings en un archivo, test de vocabulario) y se reescribió el resto.

**Backend (`src/`)**
- `access.js`: identidad de Access; 401 sin sesión, 403 fuera de la lista.
- `paths.js`: el único lugar donde una ruta de página se vuelve ruta del repo. Solo acepta
  `sites/<slug>/content/**.md`, segmentos `[a-z0-9-_]`, máximo 3 niveles.
- `github.js`: cliente REST con `fetcher` inyectable; UTF-8 correcto en base64 por bloques.
- `sites.js`: tablero, detalle de sitio, lectura (del borrador si existe), guardado (no-op si no
  hay cambios; crea rama y PR solo al primer cambio real; reabre PR si lo cerraron a mano;
  `Edited-by` en cada commit; 409 en lenguaje llano), descarte idempotente.
- `preview.js`: estado real de la vista previa desde el comentario de `preview.yml` y los check
  runs del último commit: `none | preparing | ready | failed`, conservando la URL anterior
  mientras se prepara una nueva.
- `index.js`: router y manejo de errores (los errores inesperados no filtran detalles; 502).

**Interfaz (`public/`)**, vanilla ES modules, sin CDN ni build: tablero con "Sitios de prueba"
aparte; vista de sitio con panel de vista previa (se refresca sola cada 15 s mientras se
prepara), páginas con "Editada" y "Descartar borrador" con confirmación propia; edición con
aviso de "¿salir sin guardar?" dentro de la app y al cerrar la pestaña; avisos (toast) de
guardado. Aviso honesto de que Publicar llega en A3 ("avísale a Vic").

## Verificación

**25 pruebas, verdes en el equipo de Vic** (Node 22.23.2), `npm test --prefix apps/studio`:
401/403; assets; tablero con banderas publicado/prueba; primer guardado crea rama y un PR con
título de marca; segundo guardado de otra página reusa rama y PR; guardado sin cambios no crea
nada; reabrir muestra lo guardado; sin borrador se lee de `main`; "Editada" en páginas anidadas;
escrituras fuera de `content/` rechazadas (incluye `..` codificado hacia `site.config.json` y
hacia otro sitio); `pageFile` directo con 13 casos malos; página inexistente → 404, no se crea;
409 de sha; PR cerrado a mano se reabre; descartar dos veces; errores de GitHub no filtran; los
cinco estados de vista previa; vocabulario prohibido; nada externo; ninguna línea > 120.

`test/fake-github.js` es un GitHub en memoria con ramas reales y resolución de `..` como la de
GitHub, para que las pruebas recorran flujos completos y no respuestas enlatadas.

**Las pruebas se probaron a sí mismas (mutation testing):** se rompió a propósito el código en
cuatro lugares y se confirmó que alguna prueba falla en cada caso: leer siempre de `main`, quitar
el guardia de rutas, abrir siempre un PR nuevo, ignorar checks fallidos. El guardia de rutas no
lo detectaba al principio (el GitHub falso no resolvía `..`); se corrigió el falso y se agregaron
casos hasta que sí.

**Prueba en navegador real** (Chromium/Playwright contra el Worker con el GitHub falso): tablero →
sitio → página → editar → guardar → aviso → la vista previa pasa a "lista" → "Editada" → reabrir
muestra lo guardado → cambio sin guardar + volver → diálogo "¿salir sin guardar?" → "Seguir
editando" se queda, "Salir" sale → descartar → confirmación → sitio "Al día". **Cero errores de
JavaScript.** Capturas revisadas visualmente.

## Lo que no pude verificar

- **Contra GitHub y Cloudflare reales:** el Worker no está desplegado ni Access activo. La prueba
  real (README, paso 5) la hace Vic al desplegar. Hasta entonces **W-120 no se cierra.**
- `run_worker_first: ["/api/*"]` en `wrangler.jsonc`: si la versión de Wrangler de Workers
  Builds no lo soportara, el comportamiento es el mismo (las rutas `/api/*` no existen como
  archivos y caen al Worker igual).
- Que el token fine-grained con "Checks: read" alcance para `commits/:sha/check-runs`; así lo
  dice la documentación de GitHub, sin probar aquí.

## Lo que no se hizo

A2 (editor con vista previa, página nueva, imágenes) y A3 (Publicar, alta de sitio). Conectar
estas pruebas a CI: es un cambio de workflow y va en el prompt de revisión del ejecutor.

## Commits

Ver `git log -- apps/studio` (commit de esta entrada).
