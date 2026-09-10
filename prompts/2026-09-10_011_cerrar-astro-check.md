# 2026-09-10_011 — Cerrar W-021: astro check en npm run check

**Backlog:** W-021
**Fase:** 2, Bloque A (obligatorio para el handoff del 18 de septiembre)
**Reporte esperado:** `reports/2026-09-10_011_cerrar-astro-check.md`

## Contexto

`packages/template` es el único layout/design system compartido por todos los sitios. Hoy
`npm run check` (definido en el `package.json` de la raíz) solo corre `validate:configs`
(valida los `site.config.json` contra el schema con `ajv`). No valida el código del template en
absoluto: ni tipos de TypeScript, ni props mal pasadas entre `.astro`, ni que el uso de
`astro:content` siga siendo válido.

El repo ya trae `@astrojs/check` y `typescript` como devDependencies (ver `package.json`), o
sea que la intención siempre fue correr `astro check`, pero nunca se conectó: quien lo intentó
a mano reportó que `astro check` "no terminó dentro de 30 segundos". Eso quedó anotado en
`BACKLOG.md` (W-021) como la razón de que el ítem siga abierto, sin que nadie haya vuelto a
investigar si de verdad cuelga, o si simplemente tarda más de 30 segundos la primera vez
(bastante típico en proyectos Astro con content collections, por el paso de sincronización de
tipos) y alguien cortó la espera antes de tiempo.

Importante: `npm run build:site -- <site-directory>` (usado en CI vía `scripts/build-site.mjs`)
sí construye el sitio con `astro build`, y como el CI reconstruye **todos** los sitios cuando
cambia algo compartido (`scripts/changed-sites.mjs`, incluyendo `packages/template/**`), un
error de sintaxis en el template ya rompe CI hoy. Lo que **no** se detecta hoy es un error de
*tipos*: por ejemplo, un prop que `BaseLayout.astro` espera y una página no le pasa, o le pasa
con el tipo equivocado, algo que `astro build` no necesariamente marca como error pero
`astro check` sí.

## Objetivo

Cuando termines: `npm run check` corre tanto la validación de configs que ya existía como
`astro check` contra `packages/template`, ambos en un tiempo acotado y razonable para CI (no
"eventualmente termina"), y queda demostrado con un caso real que `astro check` de verdad
atrapa un error de tipos que `astro build` no atraparía.

## Restricciones

- No toques la lógica de `scripts/build-site.mjs`, `scripts/build-pod.mjs` ni
  `scripts/changed-sites.mjs`: son otro mecanismo (build), este ítem es sobre *chequeo de
  tipos*, una capa adicional, no un reemplazo.
- No agregues dependencias npm nuevas: `@astrojs/check` y `typescript` ya están instaladas para
  exactamente esto.
- No relajes ni desactives ninguna regla de TypeScript para que el check pase más fácil; si
  encuentras errores de tipos reales al conectar `astro check` por primera vez, corrígelos en
  el código, no los silencies.
- Sigue las reglas de `CLAUDE.md` y de la guía global (`prompts/00_GUIA_GLOBAL.md`) para
  reportar, cerrar el item y actualizar `BITACORA.md`/`BACKLOG.md`.

## Pasos

1. Desde la raíz del repo, corre `npx astro check --root packages/template` a mano y cronometra
   cuánto tarda de verdad. Si de verdad cuelga (no termina nunca, no solo tarda), diagnostica
   por qué antes de seguir — puede hacer falta `astro sync --root packages/template` primero,
   para generar los tipos de las content collections (`astro:content`) que el check necesita
   leer.
2. Si el tiempo real es alto pero finito (por ejemplo, un minuto la primera vez por la
   sincronización de tipos), eso no es un bug a resolver, es información a documentar: define un
   timeout de CI razonable acorde a ese tiempo real medido, no a la suposición de 30 segundos
   que nadie verificó.
3. Agrega un script `check:types` en el `package.json` de la raíz que corra `astro check`
   contra `packages/template` (con `astro sync` antes si el paso 1 lo confirma necesario).
4. Actualiza el script `check` para que corra `validate:configs` **y** `check:types`, fallando
   si cualquiera de los dos falla.
5. Verifica que de verdad atrapa errores reales: introduce temporalmente un error de tipos
   genuino (por ejemplo, quita una prop requerida en una llamada a `<BaseLayout>` en algún
   `.astro` de prueba, o pásale un tipo equivocado), corre `npm run check` y confirma que falla
   con un mensaje que señala el error real. Revierte el cambio de prueba antes de commitear.
6. Corre `npm run check` limpio (sin el error de prueba) y confirma que pasa en verde.
7. Corre también `npm run build:site -- _example` (o el fixture que exista) para confirmar que
   nada de lo anterior rompió el build normal.

## Criterio de aceptación

- [ ] `npm run check` corre `validate:configs` y `astro check` contra `packages/template`, en
      ese orden o en paralelo, y falla si cualquiera de los dos falla.
- [ ] El tiempo real de `npm run check` en este entorno queda medido y anotado en el reporte
      (no asumido).
- [ ] Demostrado con un caso real, introducido y luego revertido: un error de tipos genuino en
      el template hace fallar `npm run check` con un mensaje que apunta al error real.
- [ ] `npm run check` limpio (sin el error de prueba) pasa en verde.
- [ ] `npm run build:site -- _example` (o el fixture equivalente) sigue construyendo sin errores.
- [ ] No se relajó ninguna regla de TypeScript ni se agregaron dependencias nuevas.

## Formato del reporte

Escribe `reports/2026-09-10_011_cerrar-astro-check.md` con:

- **Qué se hizo** — lista de cambios concretos
- **Decisiones tomadas** — cualquier bifurcación que resolviste y por qué
- **Verificación** — cómo comprobaste que funciona, con output real, incluyendo el tiempo real
  medido de `npm run check` y la prueba del error de tipos introducido y revertido
- **Lo que tocaste fuera de lo pedido** — cualquier archivo que cambiaste y que el prompt no
  te pidió cambiar, con la razón. Si no hubo, dilo explícitamente
- **Lo que no pudiste verificar** — cosas que hiciste pero no lograste comprobar
- **Dónde dudaste** — cada punto donde el prompt era ambiguo y tuviste que elegir
- **Qué te sorprendió del repo** — en particular, si `astro check` de verdad colgaba o si solo
  tardaba más de lo que alguien esperó
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos**
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
feat(ci): wire astro check into npm run check

Closes W-021
```
