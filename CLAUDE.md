# CLAUDE.md — WICFL Microsites

Reglas duras de este proyecto. Léeme completo antes de tocar nada.

## Qué es este repo

La **fábrica** de microsites de seguros para WICFL (Walker Insurance Company of Florida),
marca hermana pero separada de Walker Insurance Agency (WAGS).

No es un sitio. Es el sistema que genera sitios. Si alguna vez te encuentras escribiendo
HTML para un sitio individual, eso es un defecto del framework y se arregla en el framework.

**Estado al 2026-10-02:** la fábrica funciona. El sitio #1 (Stuart) se lanza el 9 de octubre y
Pavel empieza el #2 (Port St. Lucie) el 12. El estado detallado, lo pendiente y las trampas del
entorno están en `RELEVO.md`.

## Lectura obligatoria antes de trabajar

**Si eres el agente arquitecto y acabas de llegar, empieza por `RELEVO.md`.**

1. `PROJECT_BRIEF.md` — contexto completo, cómo llegamos aquí, qué está decidido y por qué.
   Es historia del arranque, no estado actual
2. `BACKLOG.md` — qué sigue
3. `BITACORA.md` — qué ya pasó
4. `docs/ARCHITECTURE.md` — las decisiones técnicas
5. `prompts/00_GUIA_GLOBAL.md` — cómo se ejecuta el trabajo aquí

## División de roles

| Quién | Hace |
|---|---|
| **Vic** | Arquitecto de negocio. Decide, prioriza, habla con Kevin y Pavel. NO ejecuta comandos. |
| **Cowork (agente arquitecto)** | Piensa, decide arquitectura, mantiene docs, escribe prompts, opera el repo |
| **Agente ejecutor** (Codex de nuevo desde el 5-oct-2026; Claude Code de respaldo si Codex se queda sin tokens; Claude Code del 29-sep al 2-oct) | Recibe prompts de `/prompts`, ejecuta, reporta en `/reports`, y hace todos los push |
| **Pavel** | Lead del proyecto WICFL. Opera la fábrica desde Fase 3 |
| **Kevin** | Owner. Dirección de negocio, nichos, presupuesto, decisión de Gate B |

**Excepción registrada, 2026-09-22 — WICFL Studio A1 (`apps/studio/`):** el código de esta
fase lo escribió cowork, no el ejecutor. Autorizado por Vic después de cinco intentos del
ejecutor (prompts 017, 018 ×2, 019 ×2) que en total produjeron ~170 líneas y un test, con una
regresión y código minificado a mano que le impedía al propio ejecutor editarlo. Los papeles se
invierten solo para esta pieza: cowork escribe y verifica (tests + prueba en navegador), el
ejecutor hace una revisión adversarial del código de cowork con su propio prompt y reporte. La
regla general no cambia: el trabajo de producto lo hace el ejecutor.

**Ampliación, 2026-09-23 — Studio A2 y A3:** Vic autorizó que cowork escriba también A2 (editor
con campos, validación, ligas en vivo, página nueva, borrar página, imágenes) y A3 (Publicar y
alta de sitio), con el mismo reparto: cowork escribe y verifica; el ejecutor sube, despliega y
revisa. Motivo: sostener el 1-oct para el panel completo. Fuera de `apps/studio/` la regla
general sigue igual.

**Ampliación, 2026-09-25 — Studio después del lanzamiento del panel:** Vic autorizó que cowork
siga escribiendo los cambios de Studio que salen del uso real (botón Sign out, formato del config,
botón a la versión publicada, bloques de columnas en el editor, y los que vienen de la junta con
Pavel: W-121 a W-130), con el mismo reparto. El template y CI siguen siendo del ejecutor.

**Vic no ejecuta ningún comando, ni siquiera de lectura.** Ni `git status`, ni `ls`, ni `npm`.
No existe "que Vic lo corra en su terminal": si un doc lo sugiere, ese doc está mal.

**Quién sí toca el filesystem, en orden de preferencia:**

1. **Cowork**, a través del bridge del escritorio, para inspección, higiene del repo y
   ediciones de documentación. Es la ruta rápida para cualquier cosa de lectura o de
   mantenimiento que no sea trabajo de producto.
2. **El agente ejecutor**, para todo el trabajo de producto: código, schema, template,
   scripts. Siempre desde un prompt de `/prompts`, siempre con reporte.

**Limitación conocida del bridge:** no puede borrar archivos sin que el usuario apruebe el
permiso en el momento. Los comandos de git que borran (`gc`, `prune`, limpieza de locks)
requieren esa aprobación. Si no la hay, se dejan los residuos y se anota, nunca se inventa
una terminal local que no existe.

## Reglas no negociables

1. **Workers con Static Assets, nunca Pages.** Pages topa en 100 proyectos por cuenta
   y ya no recibe features. La decisión está cerrada, no la reabras sin razón nueva.

2. **Un monorepo.** Nunca un repo por sitio. Un fix del template debe aplicar a todos.

3. **El `site.config.json` schema es el contrato.** Todo lo demás se construye encima.
   Cambiarlo cuando ya existan sitios es caro. Piénsalo dos veces antes de tocarlo.

4. **Ningún sitio se construye a mano.** Se genera desde su config. Si el generador no
   puede producirlo, se arregla el generador.

5. **El swap test es ley.** Toma cualquier página, cambia el nombre de la ciudad. Si nada
   más tiene que cambiar, esa página es doorway page según la definición de Google y no
   se publica. Hay un gate de CI que lo enforcea; no lo desactives.

6. **El español se escribe, no se traduce.** Contenido de seguros traducido por máquina se
   nota de inmediato en el mercado de Miami y cae bajo scaled content abuse.

7. **Tokens de API con permisos acotados, nunca el Global API Key de Cloudflare.**

8. **Todo prompt genera reporte.** Sin excepciones, aunque la tarea tome 30 segundos.

9. **Todo cambio va con commit,** y los items del backlog se cierran con refs a prompt, report
   y commit. El remoto es `microsites-wicfl/wicfl-microsites` en GitHub; los push los hace el
   ejecutor.

   **Después de cada push, verifica todos los workflows que el commit disparó en GitHub, no
   sólo uno. Como mínimo: "Validate and build" y "Publish site Workers"; añade "Deploy WICFL
   Studio" si el cambio tocó `apps/studio/`. El reporte lista cada run y su conclusión.**

10. **`BITACORA.md` y `BACKLOG.md` se mantienen solos, sin que Vic los pida.** Es trabajo de
    cowork, no de Vic. Se actualizan **conforme pasan las cosas**, no al final: al cerrar una
    decisión, al leer un reporte del ejecutor, al descubrir un hueco, al reasignar un dueño.
    Vic no debería tener que pedir nunca que se actualicen.

    Reparto con el ejecutor: **el ejecutor agrega su propia entrada** a la bitácora y cierra
    el item que su prompt cerraba. **Cowork es dueño de la corrección de ambos archivos** y lo
    único que crea o reprioriza items. Si el ejecutor los deja mal (orden, ubicación, un item
    que debió abrirse), cowork lo arregla.

11. **Ningún reporte del ejecutor se da por bueno sin revisión de cowork, y nada avanza al
    siguiente prompt sin ella.** La revisión se hace contra el diff, no contra el reporte: un
    reporte no puede contener lo que el ejecutor hizo y no mencionó, ni lo que no hizo sin
    notarlo. El veredicto se escribe dentro del mismo reporte, en `## Revisión de cowork`.
    Procedimiento completo en `prompts/00_GUIA_GLOBAL.md`.

12. **El día cierra con un session wrap.** Ver la skill `session-wrap`. Verifica que la
    bitácora y el backlog reflejen el día, que el repo quede limpio y commiteado, que los
    documentos vivos no se hayan desincronizado, y nombra la siguiente acción. El wrap
    **verifica**, no es el único punto de guardado: si la bitácora solo se escribe ahí, el día
    ya se perdió a medias.

## Idioma

- **Docs operativos** (CLAUDE.md, BITACORA, BACKLOG, prompts, reports): español
- **Docs de referencia del equipo** (`/docs`, cualquier cosa que vea Kevin o Pavel): inglés
- **Todo output para el equipo**: inglés, tono ejecutivo, con formato
  "what we did / what's needed"
- **Nunca uses guiones largos (—) en los copys para el equipo (Kevin, Pavel).** Punto,
  coma o dos puntos en su lugar. Regla de Vic, ya avisada una vez e incumplida: no se repite.
- **Conversación con Vic**: español mexicano. NO voseo.
- **Regla de Vic, 24-sep-2026: todo lo que se construye es en inglés.** WICFL Studio (cada
  texto de la interfaz, cada mensaje de error), las páginas que se crean y todo el contenido de
  los sitios. Nada en español en el producto. Studio lo vigila con una prueba que falla si
  aparece un carácter del español en `apps/studio/public` o `apps/studio/src`. La guía de Pavel
  para Studio se escribe en inglés. Lo único que sigue en español son los docs operativos de
  arriba y la conversación con Vic. **Choca con el plan original de un sitio en español
  (W-031, Fase 4):** queda como pregunta para Kevin, no se construye nada en español mientras.

## Bloqueadores activos al 2026-10-02

La fuente de verdad es `BACKLOG.md` y `RELEVO.md`; esta lista es un recordatorio, no un sustituto.

**De Kevin, y solo lo que nadie más puede hacer.** Kevin es owner, no ejecutor: si una tarea
la puede resolver Vic o Pavel, no se le pide.

- **Aprobar la política de privacidad de Stuart** (W-131). Sin ella no se lanza el 9 de octubre.
- **Número nuevo de GoTo para Port St. Lucie** (W-024). El que dio es una línea existente.
- **Acceso de facturación en Google Cloud** para el autocompletado de direcciones (W-118). No
  bloquea el lanzamiento.

**Ya cerrados, no los vuelvas a levantar:** GoTo a $0.99 por número; contenido asignado a Pavel;
la org de GitHub la creamos nosotros; el CRM es GoHighLevel, sub-cuenta Walker Insurance, con el
sitio en **Contact source**; **sin dirección postal ni número de licencia en ningún sitio**
(Kevin, 23-sep y 2-oct); teléfono y correo de Stuart definidos; la definición de llamada
calificada está aprobada (`docs/QUALIFIED_CALL_DEFINITION.md`).

## Referencias vivas

- **Manual de Pavel para Studio (el documento vivo que el equipo sí usa):**
  https://claude.ai/artifact/5ebz5VQL1Q7iFrLv9zJ6B5. Su texto de referencia es
  `docs/OPERATOR_GUIDE.md`; se actualizan juntos.
- **Master file y tracker: retirados el 2026-10-05 (decisión de Vic).** La página publicada
  (https://claude.ai/code/artifact/b1c34949-479b-48f6-a269-8522d4b2aa82) ahora solo dice que se
  retiró y manda al manual; su fuente sigue siendo `docs/master-file-source.html` y la última
  versión completa (v1.6) vive en el historial de git. `WICFL-microsite-schedule.xlsx` se queda
  como historia y no se actualiza. `docs/SCHEDULE.md` es el plan original (sitio #2 en español):
  historia, no estado; el estado vive en `BACKLOG.md` y `RELEVO.md`.
- Proyecto hermano: `../Walker Insurance Agency` (WAGS, Next.js, no comparte código con este)
