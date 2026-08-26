# AGENTS.md — WICFL Microsites

**Este archivo no contiene reglas. Las reglas viven en [`CLAUDE.md`](./CLAUDE.md).**

Existe porque algunos agentes ejecutores (Codex y compatibles) buscan `AGENTS.md` por
convención, y otros buscan `CLAUDE.md`. Son el mismo proyecto y las mismas reglas.

**Lee `CLAUDE.md` completo antes de tocar nada.** Luego, en este orden:

1. `PROJECT_BRIEF.md` — contexto completo, cómo llegamos aquí, qué está decidido y por qué
2. `BACKLOG.md` — qué sigue
3. `BITACORA.md` — qué ya pasó
4. `docs/ARCHITECTURE.md` — las decisiones técnicas
5. `prompts/00_GUIA_GLOBAL.md` — cómo se ejecuta el trabajo aquí

---

**Por qué es un puntero y no una copia:** el 2026-08-26 aparecieron los dos archivos con el
mismo contenido y un solo detalle distinto (el nombre del agente ejecutor). Dos copias de las
reglas duras se desincronizan siempre, y cuando se desincronizan nadie sabe cuál manda.
Una sola fuente, un solo lugar donde editarlas.

Si necesitas cambiar una regla, cámbiala en `CLAUDE.md`. Nunca aquí.
