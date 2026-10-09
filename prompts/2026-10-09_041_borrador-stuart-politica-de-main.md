# 2026-10-09_041 — El borrador de Stuart recupera la política de privacidad de `main`

**Backlog:** W-131
**Fase:** 3 (lanzamiento de Stuart, hoy 9 de octubre)
**Reporte esperado:** `reports/2026-10-09_041_borrador-stuart-politica-de-main.md`

## Contexto

El borrador de Studio `draft/stuart-homeowners` (PR #22) salió de `main` antes del prompt 039. El
9-oct a las 14:56 UTC Pavel editó en Studio `sites/stuart-homeowners/content/privacy-policy.md`
sobre la versión vieja (commit `e2bb0ab`). En `main` esa página ya es la versión maestra aprobada
por Kevin (`39b3f26`). Resultado: el PR #22 está en conflicto (`mergeable: false`), Studio no
puede publicarlo y sus workflows de vista previa dejaron de correr.

La política que vale es la de `main`. Todo lo demás del borrador (portada, títulos, imágenes,
`site.config.json`) es trabajo de Pavel y se queda tal cual.

## Qué hacer

1. `git fetch origin` y cámbiate a `draft/stuart-homeowners` siguiendo `origin/draft/stuart-homeowners`.
2. Restaura **solo** ese archivo desde `main`:
   `git checkout origin/main -- sites/stuart-homeowners/content/privacy-policy.md`
3. Confirma que `git diff origin/main -- sites/stuart-homeowners/content/privacy-policy.md` queda
   vacío y que ningún otro archivo cambió.
4. Commit en la rama del borrador:
   `content(stuart-homeowners): privacy policy back to the approved master version from main`,
   con las líneas de atribución de `CLAUDE.md`. No hagas merge de `main` en la rama, no hagas
   rebase, no fuerces el push: un commit normal encima del borrador.
5. Push a `origin draft/stuart-homeowners`.
6. Regresa tu copia local a `main` al terminar.

Este prompt y su reporte van en un commit aparte en `main` (solo docs).

## Verificación

1. El PR #22 queda `mergeable: true` (consúltalo con `gh pr view 22 --json mergeable,mergeStateStatus`
   hasta que deje de decir UNKNOWN). Pega la salida.
2. El push al borrador dispara Validate and build y Preview deploy. Espera **todos** y anota id y
   conclusión.
3. En el diff del PR (`gh pr diff 22 --name-only`) ya no aparece `privacy-policy.md`. Pega la lista.
4. No publiques el borrador, no lo hagas merge y no toques nada más de la rama.
