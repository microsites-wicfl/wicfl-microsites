# 2026-09-08_009 — Sincronizar `main` local con `origin/main`

**Backlog:** W-110
**Fase:** Bloqueante — antes de correr `prompts/2026-09-08_008_formulario-carga-contenido.md` y
antes de repetir la prueba de PR de W-098.
**Reporte esperado:** `reports/2026-09-08_009_sincronizar-main-con-origin.md`

## Contexto

Lee `CLAUDE.md` completo antes de tocar nada. Este prompt no toca código de producto: es
exclusivamente una operación de git para dejar el repo limpio.

El 2026-09-08, al probar el flujo de preview con un pull request real, se descubrió que el
`main` local de este repo tiene commits que nunca se subieron a `origin/main` en GitHub. Ahí
adentro va trabajo ya verificado localmente pero invisible para GitHub, para CI, y para
cualquiera que abra el repo ahí: W-014 (arquitectura de pods), la reescritura real de
`preview.yml` (W-098), el soporte de logo (W-109), documentación actualizada, y los items
W-110/W-111 más el prompt 008. Ver la entrada de `BITACORA.md` del 2026-09-08 ("Prueba real de
W-098 con un PR de verdad") para el detalle completo de cómo se encontró.

Al momento de escribir esto: `git status` reporta `main` 17 commits adelante de
`origin/main`, sin mensaje de divergencia (es decir, ningún commit existe en `origin/main` que
no esté ya en el historial de `main` local — un fast-forward limpio, no un merge). Esto ya se
intentó empujar dos veces desde el bridge de Cowork y falló las dos por falta de credenciales de
git en ese entorno (`fatal: could not read Username for 'https://github.com'`) — por eso este
prompt existe para el ejecutor, que sí corre con las credenciales de Vic.

## Objetivo

`origin/main` en GitHub queda exactamente igual a `main` local — mismo commit en la punta —
sin reescribir historia, sin forzar nada, y sin haber tocado ningún archivo de código.

## Restricciones

- **No uses `git push --force` ni `--force-with-lease` bajo ninguna circunstancia.** Si el push
  normal es rechazado, es señal de que la situación cambió desde que se escribió este prompt —
  detente y repórtalo, no lo resuelvas forzando.
- **No hagas `rebase`, `merge`, `reset`, ni amends de ningún commit existente.** El objetivo es
  subir el historial tal cual está, no reescribirlo.
- **No toques ningún archivo de código, config, template o workflow.** Este prompt es
  exclusivamente `git fetch` + verificación + `git push`, más el cierre de W-110 en
  `BACKLOG.md`/`BITACORA.md`.
- **No ejecutes `prompts/2026-09-08_008_formulario-carga-contenido.md` como parte de este
  prompt.** Son dos prompts separados a propósito. Ese le corresponde a otra sesión, después de
  que este cierre.
- Si `git status` no está limpio al empezar (hay cambios sin commitear), detente y repórtalo —
  no commitees nada que no hayas verificado que pertenece a este repo y a este momento.

## Pasos

1. `git status`. Si el árbol de trabajo no está limpio, detente y repórtalo.
2. `git fetch origin`.
3. Verifica que la relación es un fast-forward limpio:
   `git merge-base --is-ancestor origin/main main && echo "fast-forward limpio"`.
   - Si el comando falla (no es ancestro, es decir, `origin/main` tiene commits que `main`
     local no tiene), **detente y reporta exactamente qué commits son esos**
     (`git log main..origin/main --oneline`). No intentes resolverlo tú mismo.
4. Si el paso 3 confirma fast-forward limpio: `git push origin main`.
5. Verifica el resultado: `git fetch origin` de nuevo y confirma que
   `git rev-parse origin/main` y `git rev-parse main` devuelven el mismo hash.
6. Anota el identificador de la corrida de CI que se disparó en GitHub por este push (workflow
   `Validate and build` sobre `main`), y si terminó en verde. Si tienes forma de consultarlo
   (por ejemplo `gh run list` o revisando en GitHub), pégalo en el reporte. Si no tienes acceso
   para consultarlo, dilo explícitamente — no es bloqueante para cerrar este item, pero sí para
   la nota del reporte.

## Criterio de aceptación

- [ ] `git rev-parse main` y `git rev-parse origin/main` son idénticos al terminar
- [ ] No se usó `--force` ni se reescribió ningún commit existente
- [ ] Ningún archivo de código, config, template o workflow fue modificado
- [ ] `git status` limpio al terminar

## Formato del reporte

Escribe `reports/2026-09-08_009_sincronizar-main-con-origin.md` con:

- **Qué se hizo** — resultado de cada paso, con el hash antes y después
- **Verificación** — output real de los pasos 3 y 5
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente (debería ser el caso)
- **Lo que no pudiste verificar** — por ejemplo, si no pudiste confirmar el estado de CI
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — como mínimo, recordar que `prompts/2026-09-08_008_formulario-carga-contenido.md`
  ya puede correr, y que cowork debe repetir la prueba de PR real de W-098 para confirmarla en verde
- **Commits** — no debería haber commits nuevos de código en este prompt; si `BACKLOG.md`/`BITACORA.md`
  generan un commit al cerrar W-110, pon su hash y mensaje aquí

No escribas la sección `## Revisión de cowork`.

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo** y cierra W-110
en `BACKLOG.md` con la referencia al push confirmado. No toques nada más de esos dos archivos.

## Commit message

Este prompt no debería generar commits de código — el push del paso 4 sube los commits que ya
existen en `main`, no crea uno nuevo. El único commit nuevo posible es el de cerrar W-110 en
`BACKLOG.md`/`BITACORA.md`:

```
docs: close W-110 — main synced with origin

Closes W-110.
```
