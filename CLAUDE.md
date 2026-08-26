# CLAUDE.md — WICFL Microsites

Reglas duras de este proyecto. Léeme completo antes de tocar nada.

## Qué es este repo

La **fábrica** de microsites de seguros para WICFL (Walker Insurance Company of Florida),
marca hermana pero separada de Walker Insurance Agency (WAGS).

No es un sitio. Es el sistema que genera sitios. Si alguna vez te encuentras escribiendo
HTML para un sitio individual, eso es un defecto del framework y se arregla en el framework.

**Estado al 2026-08-25:** Fase 0. Todavía no existe código. Este repo contiene la
documentación de arquitectura y el sistema de trabajo. El código arranca en Fase 1.

## Lectura obligatoria antes de trabajar

1. `PROJECT_BRIEF.md` — contexto completo, cómo llegamos aquí, qué está decidido y por qué
2. `BACKLOG.md` — qué sigue
3. `BITACORA.md` — qué ya pasó
4. `docs/ARCHITECTURE.md` — las decisiones técnicas
5. `prompts/00_GUIA_GLOBAL.md` — cómo se ejecuta el trabajo aquí

## División de roles

| Quién | Hace |
|---|---|
| **Vic** | Arquitecto. Decide, planifica, documenta. NO ejecuta comandos. |
| **Cowork (agente de planeación)** | Piensa, decide arquitectura, escribe prompts, mantiene docs |
| **Claude Code (agente ejecutor)** | Recibe prompts de `/prompts`, ejecuta, reporta en `/reports` |
| **Pavel** | Lead del proyecto WICFL. Opera la fábrica desde Fase 3 |
| **Kevin** | Owner. Dirección de negocio, nichos, presupuesto, decisión de Gate B |

**Vic no ejecuta ningún comando, ni siquiera de lectura.** Ni `git status`, ni `ls`,
ni `npm`. Si necesitas saber el estado real del filesystem o del repo, se genera un
prompt para Claude Code que lo recoja y lo reporte.

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

## Idioma

- **Docs operativos** (CLAUDE.md, BITACORA, BACKLOG, prompts, reports): español
- **Docs de referencia del equipo** (`/docs`, cualquier cosa que vea Kevin o Pavel): inglés
- **Todo output para el equipo**: inglés, tono ejecutivo, con formato
  "what we did / what's needed"
- **Conversación con Vic**: español mexicano. NO voseo.

## Bloqueadores activos

Dos cosas paran la Fase 1 y ambas son de Kevin. Si siguen abiertas, dilo antes de avanzar:

- Quote escrito de GoTo por número mensual (rango en juego: $1,900 vs $6,000–$18,000/año a 100 números)
- Dueño del contenido asignado, más escritor nativo de español

## Referencias vivas

- **Master file (página web):** https://claude.ai/code/artifact/b1c34949-479b-48f6-a269-8522d4b2aa82
- **Calendario de actividades:** `WICFL-microsite-schedule.xlsx` (tracker semanal, vive fuera del repo)
- Proyecto hermano: `../Walker Insurance Agency` (WAGS, Next.js, no comparte código con este)
