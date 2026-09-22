# 2026-09-22_018 — WICFL Studio A1: completar lo que el 017 dejó a medias

**Backlog:** W-120
**Fase:** 3, en paralelo con el launch del sitio #1
**Reporte esperado:** `reports/2026-09-22_018_studio-a1-completar.md`

## Contexto

Lee completo, en este orden, antes de tocar nada:

1. `prompts/2026-09-22_017_studio-a1-estructura.md`: **la especificación de A1 sigue siendo
   esa**, con sus decisiones de diseño, objetivos, restricciones y criterio de aceptación. Todo
   lo que dice sigue vigente salvo lo que este prompt cambie explícitamente.
2. `reports/2026-09-22_017_studio-a1-estructura.md`: la revisión de cowork del primer intento
   (commit `e24994a`). **Se devolvió.** Ahí está la lista exacta de defectos.
3. El código actual de `apps/studio/`.

El primer intento dejó un esqueleto de 63 líneas, en buena parte minificado a mano, sin reporte,
sin tests de comportamiento, y con un defecto que lo hace inservible para Pavel: al volver a
abrir una página que acaba de guardar, ve la versión vieja, porque la app lee siempre de `main`.

Este prompt no pide nada nuevo respecto al 017. Pide **terminarlo bien**. Es la herramienta con
la que Vic va a capacitar a Pavel para el Sitio #2; tiene que funcionar como una aplicación.

## Estado al 2026-09-22, después del primer intento de este prompt (commit `f6457e4`)

El primer intento de este prompt se detuvo a los ~50 segundos con una corrección parcial y lo
dijo con honestidad. **Hay que continuarlo, no empezar de cero.** Lo que quedó y lo que falta:

- **Hecho y se conserva:** lectura de páginas y lista desde `draft/<slug>` si existe
  (`page()`, `siteDetail()`); handler con `fetcher` inyectable (`createHandler`); marca
  "Editada" con un solo compare; `aud` en `access.dev`.
- **Regresión que introdujo y hay que corregir primero:** `siteDetail()` ahora devuelve
  `pages` como objetos `{ path, edited }`, pero `public/app.js` sigue tratándolos como strings
  (`x.replace(...)`). **La vista de sitio está rota**: lanza un error al abrir cualquier sitio.
- **El mensaje de commit de `f6457e4` dice "real preview status, behavior tests" y ninguna de
  las dos cosas existe.** No repitas eso: el mensaje describe lo que el commit contiene.
- **Falta todo lo demás del Objetivo:** vista previa real (hoy `siteDetail` devuelve
  `preparing` fijo), "Sitios de prueba", los tests de comportamiento, los menores del review,
  código legible (hoy 16 líneas de más de 160 caracteres en 8 archivos de `apps/studio/`),
  reporte, bitácora y backlog.

**Trabaja hasta cumplir el criterio de aceptación completo antes de terminar tu turno.** Si en
algún momento no puedes seguir, escribe igual el reporte con lo hecho y lo pendiente, y no
pongas en el mensaje de commit nada que no esté hecho.

## Objetivo

Todo el objetivo y el criterio de aceptación del 017, más:

1. **El borrador es la fuente de verdad mientras exista.** Si existe `draft/<slug>`, la lista de
   páginas y el contenido de cada página se leen de esa rama; si no, de `main`. Una página
   guardada y reabierta muestra lo guardado.
2. **Marca "Editada"** en cada página que difiere entre el borrador y `main` (usa la lista de
   archivos del compare, una sola llamada, no un compare por página).
3. **Vista previa real,** con los cuatro estados del 017: *No hay borrador* / *Preparando vista
   previa…* / *Vista previa lista* con link / *La vista previa falló* con el motivo en una línea.
   El link sale del comentario de `preview.yml` (marcador `<!-- wicfl-preview:<slug> -->`) en
   el PR del borrador; "lista" o "falló" sale de los checks del último commit del borrador. Los
   nombres de los checks de `preview.yml` están en ese workflow: léelo, no los adivines.
4. **Tablero:** los sitios con `_` bajo "Sitios de prueba", separados.
5. **Los cinco tests del 017** más los de los puntos 1–3 de arriba, todos con `fetch` mockeado
   e **inyectado de verdad** hasta las rutas de `index.js` (el handler recibe el fetcher; en
   producción es `fetch`). Mínimo:
   - sin identidad → 401; email fuera de `ALLOWED_EMAILS` → 403;
   - primer guardado crea la rama desde `main` y abre **un** PR; segundo guardado de **otra**
     página del mismo sitio commitea a la misma rama y **no** abre otro PR;
   - leer una página con borrador existente la lee de la rama, no de `main`;
   - escritura fuera de `sites/<slug>/content/` → rechazada (incluye `..`, otro slug, y rutas
     fuera de `content/`);
   - descartar cierra el PR y borra la rama; descartar sin rama no falla;
   - conflicto de `sha` → mensaje en lenguaje llano;
   - rama existente sin PR abierto → el guardado abre uno;
   - vista previa: comentario presente + checks verdes → "lista" con la URL; checks fallidos →
     "falló"; sin comentario → "preparando".
6. **Código legible.** Nada minificado a mano. Un módulo por responsabilidad, funciones
   nombradas, formateo normal. La interfaz se puede partir en varios módulos ES.
7. **Menores del review:** título del PR `Draft: <brand name>`; `Edited-by: <email>` en el cuerpo
   de **cada** commit; `esc()` escapa `"` y `'`; `access.dev` con `aud` según la documentación
   de Cloudflare enlazada en el 017.

## Restricciones

- Las del 017, todas. En particular: no tocar `apps/content-form/`, `packages/`, `sites/`,
  `scripts/`, `pods/`, wrangler de pods ni workflows; sin CDN en runtime; sin dependencias npm
  en la raíz; ningún secreto en el cliente.
- Conserva lo que el primer intento hizo bien (ver la revisión): no lo reescribas por gusto.
- Antes de empezar, `git fetch`: tu `main` no puede estar detrás de `origin/main`. Al terminar,
  `git push origin main`.
- **No declares terminado nada que no hayas verificado.** Si algo no se pudo probar (por ejemplo
  la prueba real, porque el Worker todavía no está desplegado ni Access activo), va en "Lo que
  no pude verificar" y **W-120 no se cierra**.

## Pasos

1. Lee los tres documentos del Contexto y el código actual.
2. Refactoriza a módulos legibles conservando el comportamiento correcto.
3. Implementa los puntos 1–4 y 7 del Objetivo.
4. Escribe los tests del punto 5. Pega su salida completa en el reporte.
5. Recorrido local con `wrangler dev` (identidad de `access.dev`) contra el repo real si el
   `GITHUB_TOKEN` local lo permite; si no, dilo. Si lo haces, usa **solo** `sites/_example` y
   deja todo limpio al final (PR cerrado, rama borrada).
6. Despliegue y prueba real: igual que los pasos 5 y 6 del 017. Si no puedes desplegar, la
   lista exacta de lo que Vic hace en el dashboard, en orden, con los permisos del token.
7. `apps/studio/README.md` actualizado. Bitácora al **inicio**; avance al **final** de la fila
   de W-120.

## Criterio de aceptación

- [ ] Todo el criterio de aceptación del 017.
- [ ] Guardar y reabrir una página muestra lo guardado (test).
- [ ] Vista previa con los cuatro estados (tests).
- [ ] `apps/studio/` sin archivos minificados a mano: ningún archivo fuente con líneas de más de
      160 caracteres (muestra el comando que lo comprueba).
- [ ] Todos los tests pasan; salida completa en el reporte.
- [ ] Reporte completo en el formato del 017. Bitácora y backlog actualizados.
- [ ] CI verde en el commit final (link del run).

## Formato del reporte

El mismo del 017, en `reports/2026-09-22_018_studio-a1-completar.md`, más una sección
**"Defectos del review, uno por uno"** con cada punto de la revisión de cowork y cómo quedó.

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
feat(studio): complete A1, draft-aware reads, real preview status, behavior tests

Refs W-120
```
