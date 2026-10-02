# 2026-10-02_035 — URGENTE: CI y vistas previas rotas desde el 30-sep (Playwright fuera de `npm ci`)

**Backlog:** W-098 (vistas previas), W-005
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_035_ci-roto-playwright.md`

## Contexto

Desde el commit `957d6ae` (prompt 030, 30-sep) **todo run de "Validate and build" (`ci.yml`) y
de "Preview deploy" (`preview.yml`) falla**, en `main` y en cada borrador de Studio. Lista de
`ci.yml` en `main`: `96b6e15` verde el 29-sep; `957d6ae`, `a43948a`, `3212244`, `54f2414`,
`785be5f`, `b706f4c`, `6cdee81` en rojo. Hoy fallaron ocho runs seguidos de
`draft/stuart-homeowners`: Pavel está editando Stuart y **no puede ver su vista previa ni
publicar**, porque Studio solo deja publicar con la vista previa lista.

Causa: el 030 agregó `scripts/analytics.test.mjs` a `npm run check`, y ese archivo hace
`import { chromium } from "playwright"`. `playwright` **no está en `package.json`**: existe en la
máquina de Vic, así que `npm run check` pasa en local, pero en GitHub `npm ci` no lo instala y el
import falla. `ci.yml` y `preview.yml` corren `npm run check`.

Nadie lo vio porque los reportes del 030 al 034 solo esperaron "Publish site Workers", que no
corre `npm run check`.

## Objetivo

"Validate and build" y "Preview deploy" vuelven a verde en `main` y en los borradores, sin perder
la cobertura de las pruebas, y queda escrito cómo se verifica un push para que no se repita.

## Restricciones

- Todo lo construido en inglés.
- No toques `apps/`, `packages/template/` ni el contenido de ningún sitio.
- **`npm run check` no puede depender de un navegador.** Es lo que corre cada vista previa de
  Pavel y el deploy; tiene que ser rápido y pasar con solo `npm ci`.
- No borres la prueba de navegador: muévela.
- No toques `deploy.yml`.

## Pasos

1. **Reproduce el fallo como lo ve GitHub.** En una copia limpia (`git worktree` o un clon
   temporal) corre `npm ci && npm run check`. Debe fallar con el import de `playwright`. Pega el
   error en el reporte. Si falla por otra causa, repórtala y arregla esa.

2. **Separa la prueba de navegador.** Divide `scripts/analytics.test.mjs`:
   - lo que solo lee el HTML construido (snippet de GTM presente o ausente, sin `gtag.js`,
     `dataLayer` inicializado) se queda en `scripts/analytics.test.mjs`, sin importar `playwright`;
   - lo que abre un navegador (host real vs workers.dev, los `dataLayer.push` del formulario, sin
     PII) pasa a `scripts/analytics.browser.test.mjs`.
   Revisa `scripts/schema.test.mjs` y cualquier otra prueba de `npm run check`: ninguna puede
   importar `playwright`.

3. **Scripts.** En `package.json`:
   - `check` deja de incluir la prueba de navegador;
   - nuevo `check:browser` que corre `scripts/analytics.browser.test.mjs`;
   - `playwright` pasa a `devDependencies` con una versión fija compatible con la que ya se usó, y
     `package-lock.json` se actualiza. Así `check:browser` funciona después de `npm ci`.

4. **CI.** En `.github/workflows/ci.yml` agrega un job aparte, por ejemplo
   `browser-tests` ("Browser tests"), que haga `npm ci`, `npx playwright install --with-deps chromium`
   y `npm run check:browser`. **No lo hagas requisito de `discover-sites`/`build-sites`, y no
   cambies el nombre del job "Validate all site configurations"**: Studio lee ese nombre para
   decidir el estado de la vista previa (`apps/studio/src/preview.js`).
   `preview.yml` no instala navegador ni corre `check:browser`.

5. **Regla para que no se repita.** En `CLAUDE.md` (y en `AGENTS.md` si repite la regla de
   verificación), deja escrito: después de un push, la verificación es **todos** los workflows
   que el commit dispara, no uno. Como mínimo "Validate and build" y "Publish site Workers", y
   "Deploy WICFL Studio" si se tocó `apps/studio/`. El reporte lista cada run con su conclusión.

6. `npm run check` en verde en una copia limpia (`npm ci` primero). Commit y push.

7. **Verifica en GitHub, no en local:**
   - "Validate and build" de tu commit en `main`: **verde**, con el job "Validate all site
     configurations" y el job nuevo de navegador en verde;
   - "Publish site Workers": verde;
   - vuelve a correr (re-run) el último "Validate and build" y el último "Preview deploy" de
     `draft/stuart-homeowners` y de `draft/testville-umbrella`. Los runs de `pull_request` usan
     el merge con `main`, así que deben pasar sin tocar esas ramas. **No hagas commits en ramas
     `draft/*`: son el trabajo de Pavel.** Si un re-run sigue fallando, pega el error y detente.

## Criterio de aceptación

- [ ] `npm ci && npm run check` pasa en una copia limpia, sin navegador.
- [ ] "Validate and build" verde en `main`.
- [ ] La vista previa de `draft/stuart-homeowners` vuelve a construirse y Studio la muestra lista.
- [ ] La prueba de navegador sigue existiendo y corre en CI en su propio job.
- [ ] `CLAUDE.md` dice qué workflows se verifican después de un push.

## Formato del reporte

Escribe `reports/2026-10-02_035_ci-roto-playwright.md` con las secciones de `prompts/TEMPLATE.md`.
En **Verificación** pega el error reproducido, y la liga y conclusión de cada run: `main`
(Validate and build, Publish site Workers) y los re-runs de las dos ramas `draft/*`.

## Commit message

```
fix(ci): npm run check no longer needs a browser; browser tests get their own job
```
