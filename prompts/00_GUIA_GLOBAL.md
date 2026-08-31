# Guía global de ejecución — WICFL Microsites

Léeme antes de ejecutar cualquier prompt de esta carpeta.

## Cómo funciona el flujo

1. **Cowork** escribe un prompt en `prompts/YYYY-MM-DD_NNN_slug.md`
2. **Vic** lo pega en el agente ejecutor (Claude Code o Codex)
3. **El ejecutor** lo ejecuta y escribe `reports/YYYY-MM-DD_NNN_slug.md` (mismo NNN, mismo slug)
4. **Cowork revisa.** No contra el reporte: contra el diff. Escribe su veredicto **dentro del
   mismo reporte** y luego actualiza `BITACORA.md` y `BACKLOG.md`
5. **Nada avanza al siguiente prompt sin ese paso 4.**

## La revisión

**Por qué contra el diff y no contra el reporte.** Un reporte es la versión que el ejecutor
tiene de su propio trabajo, y hay dos clases de error que por construcción no puede contener:
lo que hizo y no mencionó, y lo que no hizo sin darse cuenta de que no lo hizo. Ninguna de las
dos se detecta leyendo. El 31 de agosto, revisar el schema directamente encontró que un número
de licencia en placeholder pasaba la validación y que ningún sitio piloto ejercitaba el ruteo
bilingüe. Lo segundo era invisible en el reporte, que estaba bien escrito.

**Qué revisar, en este orden:**

1. `git show --stat` de cada commit. ¿Tocó algo que el prompt no pedía?
2. Los archivos entregables, abiertos y leídos de verdad. No el resumen de ellos.
3. Las decisiones de diseño contra `CLAUDE.md` y `docs/CONTENT_STANDARDS.md`. Una decisión
   puede ser razonable y aun así contradecir una regla del proyecto.
4. Lo que el reporte mandó a "próximos pasos". El ejecutor no puede crear items de backlog,
   así que ahí es donde deja lo que encontró y no pudo abrir. Si algo de eso merece ser item,
   cowork lo crea; si algo se mandó a un checklist humano y es automatizable, se corrige.
5. `BITACORA.md` y `BACKLOG.md`: que la entrada quedó al **inicio** del archivo y que el item
   se cerró con sus refs.

**El veredicto se escribe al final del reporte**, en una sección `## Revisión de cowork`, con
fecha y una de tres conclusiones:

- **Aprobado.** El entregable queda como está.
- **Aprobado con hallazgos.** El entregable queda, y salen items nuevos. Es el caso normal.
- **Se devuelve.** El entregable está mal y hay que rehacerlo. Raro, y se reserva para cuando
  lo entregado es incorrecto, no para cuando falta un seguimiento.

Se escribe dentro del reporte y no en el chat porque el chat se pierde. `reports/` es el
registro de lo que realmente pasó, y si dice qué se entregó pero no si sirvió, está a la mitad.

Los prompts son self-contained. El ejecutor no tiene memoria de las sesiones de cowork.

**Por qué existen las dos carpetas.** `prompts/` es lo que se pidió; `reports/` es lo que
realmente pasó, con la verificación pegada. Juntas son el registro de ejecución del proyecto:
dentro de tres meses, la pregunta "por qué el schema quedó así" se contesta con el reporte, no
con la memoria de nadie. Por eso **todo prompt genera reporte, sin excepciones**, aunque la
tarea tome treinta segundos y el reporte sean diez líneas.

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
- **Reporta todo lo que viste, no solo lo que hiciste.** El reporte es tu única forma de pasar
  lo que aprendiste; nadie más estuvo ahí. Cuatro secciones existen justo para eso y suelen
  ser las más valiosas del reporte: lo que tocaste fuera de lo pedido, lo que no pudiste
  verificar, dónde dudaste, y qué te sorprendió del repo. Un reporte que solo dice que todo
  salió bien no le sirve a nadie.
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
