# CLAUDE.md — WICFL Microsites

Reglas duras de este proyecto. Léeme completo antes de tocar nada.

## Qué es este repo

La **fábrica** de microsites de seguros para WICFL (Walker Insurance Company of Florida),
marca hermana pero separada de Walker Insurance Agency (WAGS).

No es un sitio. Es el sistema que genera sitios. Si alguna vez te encuentras escribiendo
HTML para un sitio individual, eso es un defecto del framework y se arregla en el framework.

**Estado al 2026-08-26:** Fase 0, cerrando. Todavía no existe código de producto. Este repo
contiene la documentación de arquitectura y el sistema de trabajo. El primer trabajo real es
`prompts/2026-08-25_001_site-config-schema.md`.

## Lectura obligatoria antes de trabajar

1. `PROJECT_BRIEF.md` — contexto completo, cómo llegamos aquí, qué está decidido y por qué
2. `BACKLOG.md` — qué sigue
3. `BITACORA.md` — qué ya pasó
4. `docs/ARCHITECTURE.md` — las decisiones técnicas
5. `prompts/00_GUIA_GLOBAL.md` — cómo se ejecuta el trabajo aquí

## División de roles

| Quién | Hace |
|---|---|
| **Vic** | Arquitecto de negocio. Decide, prioriza, habla con Kevin y Pavel. NO ejecuta comandos. |
| **Cowork (agente arquitecto)** | Piensa, decide arquitectura, mantiene docs, escribe prompts, opera el repo |
| **Agente ejecutor** (Claude Code o Codex) | Recibe prompts de `/prompts`, ejecuta, reporta en `/reports` |
| **Pavel** | Lead del proyecto WICFL. Opera la fábrica desde Fase 3 |
| **Kevin** | Owner. Dirección de negocio, nichos, presupuesto, decisión de Gate B |

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

9. **Este repo tiene git desde el 2026-08-26.** Todo cambio va con commit, y los items del
   backlog se cierran con refs a prompt, report y commit. Todavía no hay remoto: el push a
   GitHub llega con W-012.

## Idioma

- **Docs operativos** (CLAUDE.md, BITACORA, BACKLOG, prompts, reports): español
- **Docs de referencia del equipo** (`/docs`, cualquier cosa que vea Kevin o Pavel): inglés
- **Todo output para el equipo**: inglés, tono ejecutivo, con formato
  "what we did / what's needed"
- **Conversación con Vic**: español mexicano. NO voseo.

## Bloqueadores activos al 2026-08-26

**Todos son de Kevin.** Si siguen abiertos, dilo antes de avanzar. La fuente de verdad es
`BACKLOG.md`; esta lista es un recordatorio, no un sustituto.

- **W-092** — correo de empresa para la cuenta de Cloudflare, y quién es el segundo Super Admin.
  Sin esto no hay cuenta el lunes 31, y sin cuenta Pavel arranca sin accesos.
- **W-093** — vault compartido de contraseñas y tarjeta de empresa para billing
- **W-094** — ¿Walker ya tiene org de GitHub o creamos una?
- **W-096** — **qué CRM usa WICFL.** Aparece a media Fase 2 en W-025 y nadie lo ha nombrado
- **W-008** — assets de marca de Walker (logo, contacto aprobado, disclosures, license numbers)
- **W-095** — quién firma el contenido antes de publicar, incluido compliance de seguros en Florida

**Ya cerrados, no los vuelvas a levantar:** W-001 (GoTo confirmó $0.99 por número el 25-ago),
W-002 (Kevin asignó contenido a Pavel, que además escribe español nativo), W-009 (disponibilidad
de Pavel confirmada, fechas fijas).

## Referencias vivas

- **Master file (página web publicada):** https://claude.ai/code/artifact/b1c34949-479b-48f6-a269-8522d4b2aa82
  La página vive hospedada en claude.ai, no en este repo. Lo que sí vive aquí es su fuente:
  `docs/master-file-source.html`.

  **Regla: cada vez que se republique la página, la fuente se commitea aquí en el mismo movimiento.**
  Se desincronizó tres versiones entre el 25 y el 26 de agosto porque se publicaba sin commitear.
  Si la versión del `<title>`/sidebar del archivo no coincide con la de la página publicada,
  el repo está atrasado y hay que sincronizarlo antes de editar nada más.
- **Calendario de actividades:** `WICFL-microsite-schedule.xlsx` (tracker semanal)
- Proyecto hermano: `../Walker Insurance Agency` (WAGS, Next.js, no comparte código con este)
