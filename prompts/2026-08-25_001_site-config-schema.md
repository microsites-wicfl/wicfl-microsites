# 2026-08-25_001 — Cerrar el site.config.json schema

**Backlog:** W-020
**Fase:** 2 (adelantado, no depende de nada de Fase 1)
**Reporte esperado:** `reports/2026-08-25_001_site-config-schema.md`

## Contexto

Este repo es la **fábrica** de microsites de seguros para WICFL. No es un sitio, es el sistema
que genera sitios. Todavía no hay código: solo documentación y sistema de trabajo.

Antes de tocar nada, lee en este orden:
1. `CLAUDE.md` — reglas duras del proyecto
2. `PROJECT_BRIEF.md` — contexto completo, no estuviste en la conversación original
3. `docs/ARCHITECTURE.md` — decisiones cerradas y su razonamiento
4. `docs/SITE_CONFIG_SCHEMA.md` — el borrador que vas a cerrar
5. `docs/CONTENT_STANDARDS.md` — la regla que gobierna el contenido
6. `prompts/00_GUIA_GLOBAL.md` — cómo se trabaja aquí

**Por qué este prompt existe primero:** el schema es el contrato entre el template y cada
sitio. El template, el generador, los gates de CI y toda la automatización de provisioning se
construyen encima. Cambiarlo cuando ya existan tres sitios es caro. Este es el momento de
romperlo.

## Paso 0 — Limpieza de git antes de cualquier otra cosa

El repo se inicializó el 2026-08-26 desde un bridge remoto que **no puede borrar archivos**.
Quedaron residuos que hay que limpiar antes de que hagas tu primer commit, o te va a fallar:

- Archivos `tmp_obj_*` huérfanos dentro de `.git/objects/`
- Una carpeta `.git/_stale/` donde se fueron moviendo locks que no se pudieron borrar

Corre, en este orden, y **pega el output real en el reporte**:

```
git status
rm -rf .git/_stale
git gc --prune=now
git fsck
git log --oneline
```

Criterio: `git fsck` no debe reportar corrupción y `git log` debe mostrar los tres commits
existentes (`beeb0c2`, `09045ec`, `6964f1e`). Si algo sale mal, **detente y repórtalo antes de
tocar cualquier otro archivo**. No intentes reparar el repo por tu cuenta.

## Objetivo

Al terminar debe existir un schema **cerrado, validable por máquina y con ejemplos que pasen
validación**, más las decisiones de diseño documentadas con su razonamiento.

## Restricciones

- **No reabras decisiones de `docs/ARCHITECTURE.md`.** Astro, Cloudflare Workers, monorepo y
  pods están cerrados.
- **El operador solo toca config y markdown.** Nunca escribe HTML ni edita componentes para
  lanzar un sitio. Si un campo del schema obliga a tocar código, ese campo está mal diseñado.
- **Ningún campo puede facilitar contenido plantilla.** Ver la sección del swap test abajo.
- No instales dependencias del proyecto ni crees `package.json`. Eso pertenece a W-012/W-014.
  Para validar usa `npx` directo.

## Preguntas abiertas que TIENES que resolver

El borrador las dejó marcadas. Cada una necesita decisión y razonamiento escrito:

1. **`serviceArea`: ¿es solo metadata, o genera páginas por área?**
   Si genera páginas, ese es exactamente el mecanismo que la política de doorway abuse de Google
   describe. Si decides que las genera, el schema tiene que exigir contenido específico por área,
   no solo el nombre. Si decides que no, di qué pasa con la intención de rankear por ciudad vecina.

2. **`products`: ¿enum fijo o texto libre?**
   Un enum permite que el template garantice que existan las páginas de cobertura correspondientes.
   Texto libre da flexibilidad pero rompe esa garantía.

3. **Variación de diseño por sitio: ¿bloque `theme` en el config, o archivo de overrides aparte?**
   Config es más simple, overrides es más flexible. La postura por defecto del proyecto es config
   hasta que se demuestre insuficiente. Si te desvías, justifica.

4. **NAP (name, address, phone): ¿el schema valida contra una fuente canónica, o confía en lo
   que se capture por sitio?**
   La inconsistencia de NAP suprime activamente rankings locales.

5. **`differentiation`: ¿cómo lo consume el gate de CI de W-027?**
   Hoy es texto libre. Decide si necesita estructura para que una máquina pueda usarlo, o si el
   gate trabaja solo sobre el contenido renderizado y este bloque es únicamente para humanos.

6. **Campos requeridos vs opcionales.** Un sitio no debería poder generarse sin lo mínimo para
   ser legal y rastreable: license number, teléfono de tracking, y el bloque de diferenciación.

## Pasos

1. Lee todo lo listado en Contexto.
2. Resuelve las seis preguntas abiertas. Escribe el razonamiento de cada una, no solo la decisión.
3. Escribe `packages/config-schema/site.config.schema.json` como **JSON Schema draft 2020-12**,
   con `title`, `description` por campo, `required`, tipos, patrones donde apliquen
   (teléfono E.164, dominio, códigos de idioma) y `additionalProperties: false`.
4. Escribe dos ejemplos completos y realistas en `packages/config-schema/examples/`:
   - `stuart-flood.example.json` — inglés, nicho flood, Stuart FL
   - `seguro-casa-miami.example.json` — español, homeowners, Miami-Dade
   Usa valores placeholder claramente marcados para lo que todavía no sabemos (teléfono de
   tracking, license number, IDs de analytics).
5. **Valida los dos ejemplos contra el schema** con `npx ajv-cli` o equivalente. Pega el output
   real en el reporte.
6. Reescribe `docs/SITE_CONFIG_SCHEMA.md` como versión final: el schema comentado, las seis
   decisiones con su razonamiento, y una sección corta de "cómo agregar un campo nuevo sin
   romper sitios existentes".
7. Escribe una lista de **preguntas para Pavel**: lo que necesitas que él valide desde su lado
   de SEO y contenido antes de considerar esto congelado.

## Criterio de aceptación

- [ ] `git fsck` limpio y los tres commits previos intactos
- [ ] Las seis preguntas abiertas están resueltas, cada una con razonamiento
- [ ] `site.config.schema.json` existe y es JSON Schema válido
- [ ] Los dos ejemplos validan contra él, con output real pegado en el reporte
- [ ] Ningún campo permite generar un sitio sin license number, teléfono de tracking ni bloque de diferenciación
- [ ] `docs/SITE_CONFIG_SCHEMA.md` reescrito, sin marcadores de borrador
- [ ] Existe la lista de preguntas para Pavel

## Formato del reporte

Escribe `reports/2026-08-25_001_site-config-schema.md` con:

- **Limpieza de git** — el output real de los cinco comandos del Paso 0
- **Qué se hizo** — archivos creados y modificados
- **Las seis decisiones** — una sección por pregunta, con la decisión y por qué
- **Verificación** — el output real de la validación de ambos ejemplos
- **Tensiones que encontraste** — cualquier punto donde el schema empuje contra una regla de
  `CLAUDE.md` o de `docs/CONTENT_STANDARDS.md`
- **Preguntas para Pavel**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — incluidos items de backlog que creas que faltan
- **Commits** — hashes y mensajes

Después del reporte, agrega tu entrada a `BITACORA.md` y cierra W-020 en `BACKLOG.md` con refs.
No toques nada más de esos dos archivos.

## Commit message

```
feat(schema): close site.config.json contract with validation and examples

Closes W-020
```
