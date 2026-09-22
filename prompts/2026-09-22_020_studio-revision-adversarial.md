# 2026-09-22_020 — Revisión adversarial de WICFL Studio A1 (código escrito por cowork)

**Backlog:** W-120
**Reporte esperado:** `reports/2026-09-22_020_studio-revision-adversarial.md`

## Contexto

Por excepción (ver `CLAUDE.md`, "Excepción registrada, 2026-09-22"), cowork escribió
`apps/studio/` completo. Esta vez **tú revisas el trabajo de cowork**, y tu trabajo es
encontrarle fallas, no confirmarlo. Lee primero `apps/studio/README.md` y
`reports/2026-09-22_019_studio-legible.md`; la especificación de fondo está en
`prompts/2026-09-22_017_studio-a1-estructura.md`.

Es una app que va a usar Pavel, sin conocimientos técnicos, para editar sitios de seguros que
salen a producción. Los errores caros son: perder lo que escribió, escribir fuera de la carpeta
de su sitio, mostrarle un estado falso ("vista previa lista" cuando no lo está), o dejar entrar
a quien no debe.

## Objetivo

1. **Revisa, con esta lista como mínimo:**
   - **Seguridad del límite de escritura:** ¿hay alguna forma de que `PUT /api/sites/:slug/pages/…`
     escriba fuera de `sites/<slug>/content/`? (codificaciones dobles, `%2e%2e`, barras invertidas,
     mayúsculas, unicode, slug con `_`, rutas largas).
   - **Acceso:** ¿alguna ruta responde sin identidad? ¿La comparación con `ALLOWED_EMAILS` tiene
     algún hueco?
   - **Pérdida de trabajo:** carreras entre dos guardados, borrador descartado mientras alguien
     edita, `main` avanzando mientras hay borrador, página borrada en el borrador.
   - **Estado de vista previa:** ¿algún caso donde diga "lista" y no lo esté, o "falló" por un
     check que no tiene que ver con el sitio? (ojo: los checks son del commit, no del sitio).
   - **Interfaz:** XSS (todo lo que viene del repo pasa por `esc()`?), rutas con caracteres raros,
     doble clic en Guardar, el diálogo de "salir sin guardar".
   - **Supuestos sobre el API de GitHub** que el GitHub falso de `test/fake-github.js` modela
     distinto a la realidad (códigos de estado, forma de las respuestas, paginación).
2. **Por cada problema real:** primero una prueba que falle y lo demuestre, después el arreglo
   mínimo, después la prueba en verde. Si no es real, no lo "arregles".
3. **Conecta las pruebas de Studio a CI:** un job en `.github/workflows/ci.yml` que corra
   `npm test --prefix apps/studio` cuando cambie `apps/studio/**` (y en `push` a `main`). No
   toques otros jobs.

## Restricciones

- Solo `apps/studio/**`, `.github/workflows/ci.yml` (el job nuevo), tu reporte, `BITACORA.md`
  (entrada al inicio) y `BACKLOG.md` (avance al final de W-120).
- **Nada de reescrituras ni cambios de estilo.** Arreglos mínimos, cada uno con su prueba.
- Ninguna línea de más de 120 caracteres (hay una prueba que lo exige).
- `git fetch` al empezar (no puedes estar detrás de `origin/main`); `git push origin main` al
  terminar. El mensaje de commit describe solo lo que el commit contiene.

## Criterio de aceptación

- [ ] Reporte con **una fila por punto de la lista del objetivo 1**: "problema real / no es
      problema", con la evidencia (la prueba, o por qué no aplica).
- [ ] Cada problema real con prueba roja → verde, visible en el diff.
- [ ] `npm test --prefix apps/studio` verde, salida completa en el reporte.
- [ ] Job de CI agregado y verde (link del run).
- [ ] Si no encontraste nada en algún punto, dilo; "no encontré nada" con el razonamiento vale.

## Formato del reporte

El de `prompts/TEMPLATE.md`, más la tabla del primer criterio.

## Commit message

Uno por arreglo (`fix(studio): …`) y uno para CI (`ci: run WICFL Studio tests`).
