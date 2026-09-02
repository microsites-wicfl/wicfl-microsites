# Reporte — 2026-09-02_004 verificar-triggers-ci

## Qué se hizo

1. Se hizo `git fetch origin` antes de cualquier cambio y se comparó `main` local con `origin/main`.
2. Se consultó el estado de permisos de Actions a nivel de organización y repositorio.
3. Se despachó `ci.yml` manualmente y se esperó su resultado.
4. Se creó el PR desechable #1 desde `ci/verify-triggers`, con un comentario temporal en `packages/template/src/pages/index.astro` para coincidir con los filtros de paths.
5. Se registraron los runs de CI y preview, se cerró el PR sin merge y se borró la rama local y remota.

## Las cuatro preguntas

### 1. ¿El workflow es válido y pasa en verde cuando corre?

**No pasa en verde.** El despacho manual de `ci.yml` creó el run `33660590859` por `workflow_dispatch`; llegó a `npm ci` correctamente y falló en `npm run check` con exit code 2. Esto demuestra que Actions puede cargar y ejecutar el workflow, pero no que el pipeline esté sano.

El log real del paso fallido fue:

```text
> wicfl-microsites@0.1.0 check
> npm run validate:configs

> wicfl-microsites@0.1.0 validate:configs
> ajv validate --spec=draft2020 -s packages/config-schema/site.config.schema.json -d packages/config-schema/examples/*.json -d sites/_example/site.config.json

error: invalid syntax (too many arguments)

usage:
    validate:  ajv [validate] -s schema[.json] -d data[.json]
```

La causa probable es la expansión de `packages/config-schema/examples/*.json` por Bash en el runner Linux: AJV recibe varias entradas `-d`, mientras que la misma cadena no se expande igual en PowerShell. No se corrigió porque este prompt prohíbe cambiar workflows y exige no arreglar a ciegas; el ajuste propuesto está en próximos pasos.

### 2. ¿El trigger `pull_request` se dispara y aplica bien el filtro de paths?

**Sí.** El cambio de prueba en `packages/template/src/pages/index.astro` abrió el PR #1 y generó el run `33660687277` de `Validate and build`, evento `pull_request`, rama `ci/verify-triggers`, SHA `6fd3635fcfee0788c4378beaf94528001428fc92`. El job llegó a `npm run check` y falló por el mismo error de AJV; por tanto el trigger y el filtro de paths sí aplicaron.

### 3. ¿Los jobs de deploy.yml y preview.yml quedan efectivamente omitidos dentro de un run?

**Preview:** sí. El PR generó el run `33660687375` de `Preview deploy`, evento `pull_request`. Su workflow **sí corrió**, pero su único job, `Disabled branch preview until Cloudflare exists`, terminó con `conclusion: skipped`, sin pasos, por el guard `if: ${{ false }}`.

**Deploy:** no hubo run de `Deploy Cloudflare Workers` para el PR, como corresponde: su trigger es `push` a `main`, no `pull_request`.

La distinción es explícita: un **workflow que no corrió** no tiene run alguno (deploy en este PR); un **job omitido por guard** sí aparece dentro de un run como `skipped` (preview en este PR).

### 4. ¿Los cero runs del push inicial fueron un artefacto de una sola vez o un defecto real en filtros?

La evidencia descarta que Actions o el trigger `pull_request` estén deshabilitados: el despacho manual y el PR produjeron runs. No permite atribuir con certeza los cero runs del push inicial a una sola causa, porque GitHub no expone un registro de eventos de push filtrados que no generaron run. La hipótesis de un artefacto del primer push a un repo vacío sigue siendo consistente con los datos; también es posible que haya intervenido el cálculo de paths de ese evento. No hay evidencia para modificar YAML por ese punto.

## Verificación

Estado de sincronía tras `git fetch origin`:

```text
local HEAD:  7323693e4e7e0f2efcb8f6238142abd54d685aa8
origin/main: a499aed9a8b66eae123d2ebb4e7d3c3b5af63828
local ahead: 2 commits
remote ahead: 0 commits
```

La diferencia ya existía antes del prompt: son los commits locales `9601dd7` y `7323693`, de documentación/revisión del prompt 003 y del prompt 004. Para que el PR de prueba no los mezclara ni modificara `main` remoto, la rama desechable se creó desde `origin/main`.

Estado de permisos de Actions:

```text
GET /orgs/microsites-wicfl/actions/permissions: 404 Not Found
GET /repos/microsites-wicfl/wicfl-microsites/actions/permissions: 403
You must have repository read permissions or have the repository Actions policies fine-grained permission.
```

Esto impidió leer la política, pero no prueba que Actions esté deshabilitado. Los runs reales posteriores prueban que está habilitado para este repo.

Despacho manual:

```text
33660590859  workflow_dispatch  main  failure
```

PR desechable:

```text
PR #1: https://github.com/microsites-wicfl/wicfl-microsites/pull/1
CI run:      33660687277  pull_request  failure
Preview run: 33660687375  pull_request  skipped
Deploy runs for the PR: none
```

Limpieza:

```text
✓ Closed pull request microsites-wicfl/wicfl-microsites#1 (test(ci): verify workflow triggers)
✓ Deleted branch ci/verify-triggers
Deleted branch ci/verify-triggers (was 6fd3635)
```

Después de `git fetch --prune origin`, `git ls-remote --heads origin ci/verify-triggers` no devolvió salida. La rama remota de prueba ya no existe y `main` remoto no recibió un merge.

## Lo que tocaste fuera de lo pedido

No se modificó ningún workflow, secret, configuración Cloudflare ni archivo permanente del producto. El único cambio de código fue un comentario en una rama desechable; se cerró el PR sin merge y se borraron ambas ramas. El reporte, bitácora y backlog son el cierre exigido por el prompt.

## Lo que no pudiste verificar

- La política exacta de Actions a nivel de organización/repositorio, porque la cuenta no tiene permiso de lectura de políticas de Actions; los runs reales sí confirman que Actions está habilitado.
- La causa exacta de los cero runs del primer push: GitHub no registró un run ni expone una explicación de un evento filtrado.
- Un job de deploy omitido por guard dentro de un run: deploy no tiene trigger `pull_request`, y no se hizo un push de prueba a `main` para forzarlo.

## Dónde dudaste

El requisito de confirmar que local y remoto coincidieran no se cumplió: `main` local ya estaba dos commits adelante antes de empezar. No publiqué esos commits, porque no forman parte de este prompt y un push habría alterado `main` remoto. Basar el PR en `origin/main` permitió probar el evento remoto con un diff mínimo y dejar `main` remoto intacto.

## Qué te sorprendió del repo

- El workflow se validó localmente en Windows, pero su comando de AJV falla en Bash por expansión de glob. La validación previa no ejercitó el comportamiento del shell del runner.
- La API de políticas de Actions requiere permisos adicionales, aunque la misma cuenta puede despachar workflows, crear PRs y observar runs.
- Preview no quedó "inactivo": el workflow se disparó y su job quedó omitido. Esa diferencia solo se hizo visible al mirar el run del PR.

## Lo que no se hizo

- No se modificó YAML, `package.json` ni scripts para corregir el fallo de AJV.
- No se habilitó deploy o preview, no se crearon secretos y no se tocó Cloudflare.
- El PR #1 no se mergeó y su rama no quedó local ni remotamente.
- W-012 no se cerró porque `ci.yml` no terminó verde.

## Próximos pasos sugeridos

1. Corregir el script `validate:configs` de `package.json` para que sea portable en Bash y PowerShell, por ejemplo validando cada ejemplo por separado o evitando que el glob se expanda en múltiples argumentos. Este es un cambio de script, no una modificación necesaria de YAML.
2. Repetir el despacho manual y el PR desechable después de ese ajuste; solo entonces cerrar W-012 si CI queda verde.
3. Si se necesita auditar políticas de Actions, pedir a un Owner que otorgue permiso de lectura de políticas a la cuenta de operación. No es necesario para que CI ejecute.

## Commits

- `6fd3635` — `test(ci): trigger pull request workflow` (rama desechable; no se mergeó y la rama fue borrada).
