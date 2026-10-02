# 2026-10-02_035 — CI roto por Playwright fuera de npm ci

**Backlog:** W-098, W-005
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_035_ci-roto-playwright.md`

## Qué se hizo

- Reproduje el fallo en un worktree limpio con `npm ci && npm run check`.
- Separé las comprobaciones estáticas de GTM en `scripts/analytics.test.mjs` de la prueba de navegador en `scripts/analytics.browser.test.mjs`.
- Agregué `check:browser`, fijé `playwright` en `devDependencies` y actualicé el lockfile.
- Agregué el job independiente `Browser tests` a `Validate and build`; el job `Validate all site configurations` y `preview.yml` siguen ejecutando únicamente `npm run check`.
- Documenté en `CLAUDE.md` que cada push requiere verificar todos los workflows que disparó.

## Decisiones tomadas

- El job de navegador no es dependencia de `discover-sites` ni de `build-sites`, para que las vistas previas de Studio no dependan de Chromium.
- El re-run fallido de los borradores no se corrigió mediante cambios en `draft/*`, porque el prompt lo prohíbe expresamente.

## Verificación

La reproducción limpia antes del arreglo falló con:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright' imported from .../scripts/analytics.test.mjs
```

Después del arreglo, un worktree limpio pasó `npm ci && npm run check` con 27 pruebas base, la prueba estática de analytics y schema en verde. `npm run check:browser` pasó localmente.

Runs del commit `7185cb6`:

- `main`, [Validate and build](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37057665867): **success**. Los jobs `Validate all site configurations` y `Browser tests` quedaron verdes.
- `main`, [Publish site Workers](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37057665939): **success**.
- `draft/stuart-homeowners`, [Validate and build re-run](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37056114164): **failure**.
- `draft/stuart-homeowners`, [Preview deploy re-run](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37056113965): **failure**.
- `draft/testville-umbrella`, [Validate and build re-run](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37056206336): **failure**.
- `draft/testville-umbrella`, [Preview deploy re-run](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37056206363): **failure**.

El error del re-run de Stuart fue el mismo import antiguo:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright' imported from /home/runner/work/wicfl-microsites/wicfl-microsites/scripts/analytics.test.mjs
```

## Lo que tocaste fuera de lo pedido

Nada. Los cambios se limitaron a CI, pruebas de analytics, dependencias, la regla de verificación y este reporte.

## Lo que no pude verificar

No se pudo verificar una vista previa verde de las ramas draft. Los re-runs conservaron el merge commit anterior y no incorporaron `main`, contradiciendo la premisa del prompt.

## Dónde dudaste

El prompt afirma que un re-run de un workflow `pull_request` usa el merge actual con `main`. GitHub re-ejecutó el commit de merge anterior. No se intentó alterar las ramas de Pavel para forzar un nuevo merge commit.

## Qué me sorprendió del repo

Los re-runs de GitHub Actions no reconstruyen el ref sintético de merge de una pull request tras un cambio en la base. Por eso una corrección verde en `main` no llegó a las vistas previas mediante re-run.

## Lo que no se hizo

No se hicieron commits en `draft/stuart-homeowners` ni `draft/testville-umbrella`, y no se continuó con otra corrección después del re-run fallido, tal como exige el prompt.

## Próximos pasos sugeridos

- Cowork debe decidir un mecanismo autorizado que dispare nuevos runs de pull request contra `main` sin modificar el contenido de los borradores.

## Commits

- `7185cb6 fix(ci): npm run check no longer needs a browser; browser tests get their own job`

## Revisión de cowork

**Veredicto: aprobado.** `main` vuelve a verde y las vistas previas funcionan.

- Causa confirmada por el ejecutor con la reproducción limpia: `playwright` fuera de `npm ci`.
- La prueba de navegador vive en `scripts/analytics.browser.test.mjs`, con su job "Browser tests";
  `npm run check` ya no importa `playwright`; `playwright` 1.63.0 en `devDependencies`.
- `CLAUDE.md` ahora exige verificar todos los workflows de un push.

**El bloqueo de los re-runs no era un problema real:** un re-run reutiliza el merge viejo. Un
commit nuevo en la rama del borrador recalcula el merge contra `main`. Comprobado por cowork en
Studio con el sitio de prueba `testville-umbrella`: un guardado nuevo y la vista previa pasó a
**ready** (`wicfl-pr20-testville-umbrella…workers.dev`). Para `draft/stuart-homeowners` basta el
siguiente guardado de Pavel.

**De paso, W-121 quedó probado de punta a punta:** el sitio nuevo se construye con el esqueleto
de la portada (hero, tarjetas, filas de íconos, zona de servicio, banda), las tres imágenes de
muestra cargan, no hay desborde horizontal y Studio lista los avisos de imágenes de muestra y
texto de arranque.

**Lección, que es de cowork:** del 030 al 034 revisé solo "Publish site Workers". "Validate and
build" estuvo en rojo tres días y cada vista previa de Studio falló sin que nadie lo viera. La
revisión de cowork incluye desde hoy el estado de todos los workflows del commit.
