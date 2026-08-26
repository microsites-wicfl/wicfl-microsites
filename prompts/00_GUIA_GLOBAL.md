# Guía global de ejecución — WICFL Microsites

Léeme antes de ejecutar cualquier prompt de esta carpeta.

## Cómo funciona el flujo

1. **Cowork** escribe un prompt en `prompts/YYYY-MM-DD_NNN_slug.md`
2. **Vic** lo pega en el agente ejecutor (Claude Code)
3. **El ejecutor** lo ejecuta y escribe `reports/YYYY-MM-DD_NNN_slug.md` (mismo NNN, mismo slug)
4. **Cowork** lee el reporte, actualiza `BITACORA.md` y `BACKLOG.md`

Los prompts son self-contained. El ejecutor no tiene memoria de las sesiones de cowork.

## Reglas para el ejecutor

**Antes de empezar:**
- Lee `CLAUDE.md` completo
- Lee `PROJECT_BRIEF.md` si es tu primera sesión en este repo
- Lee el item del backlog que tu prompt cierra

**Durante:**
- Nunca reabras una decisión cerrada en `docs/ARCHITECTURE.md` sin razón nueva y explícita
- Si el prompt te pide algo que contradice `CLAUDE.md`, **detente y repórtalo**. No lo resuelvas tú.
- Si necesitas crear un item de backlog nuevo, no lo crees: anótalo en "Próximos pasos
  sugeridos" del reporte para que cowork lo evalúe

**Al cerrar:**
- **Todo prompt genera reporte. Sin excepciones**, aunque la tarea tome 30 segundos y el
  reporte sean 10 líneas.
- Agrega tu entrada nueva a `BITACORA.md` con lo que hiciste, decisiones tomadas,
  verificación y lecciones
- Cierra el item del `BACKLOG.md` que tu prompt cerraba, con refs a prompt, report y commit

**Prohibido para el ejecutor:**
- Reescribir secciones de BITACORA o BACKLOG que no creó
- Cambiar prioridades de items existentes
- Reorganizar la estructura de esos archivos
- Editar entradas anteriores de BITACORA
- Crear items de backlog nuevos

## Anatomía de un prompt válido

Si un prompt no tiene estas cuatro cosas, es un bug del prompt. Márcaselo a cowork antes
de ejecutar:

1. ID `YYYY-MM-DD_NNN`
2. Path explícito al reporte: `reports/YYYY-MM-DD_NNN_<mismo-slug>.md`
3. Sección "Formato del reporte" con qué incluir
4. Commit message que cierre los ids de backlog relevantes, si aplica

## Estado del repo

Al 2026-08-25 este repo **no tiene código todavía**. Solo documentación y sistema de
trabajo. El código arranca con la Fase 1 del backlog. Si tu prompt asume que existe un
`packages/template`, verifica primero.
