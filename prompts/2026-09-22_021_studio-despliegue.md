# 2026-09-22_021 — Desplegar WICFL Studio desde GitHub Actions

**Backlog:** W-120
**Reporte esperado:** `reports/2026-09-22_021_studio-despliegue.md`

## Contexto

`apps/studio/` (WICFL Studio A1) está terminado y probado (27 pruebas, CI con el job
`Test WICFL Studio`). Falta desplegarlo. El README describe un despliegue manual por el dashboard
de Cloudflare; **se cambia**: Vic no ejecuta comandos ni configura por dashboard lo que se puede
automatizar. El despliegue lo hace GitHub Actions, con el mismo secret `CLOUDFLARE_API_TOKEN` que
ya desplegó el Worker de ensayo `wicfl-pod-1-rehearsal` (creó un Worker nuevo, así que tiene el
permiso necesario).

Studio necesita dos secretos en runtime que **no** van en el repo:
- `GITHUB_TOKEN` del Worker: token fine-grained de GitHub. Lo crea Vic en el navegador (GitHub no
  permite crearlos por API) y lo guarda como secret del repo con el nombre `STUDIO_GITHUB_TOKEN`.
- `ALLOWED_EMAILS`: lista de correos. Secret del repo `STUDIO_ALLOWED_EMAILS`.

Cloudflare Access (el login) se activa en el dashboard; tampoco va aquí.

## Objetivo

1. `.github/workflows/deploy-studio.yml`:
   - Dispara en `push` a `main` con cambios en `apps/studio/**` o en el propio workflow, y en
     `workflow_dispatch`.
   - Corre primero `npm test --prefix apps/studio`; si falla, no despliega.
   - Despliega con `npx wrangler deploy --config apps/studio/wrangler.jsonc` usando
     `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (mismo patrón que `deploy.yml`).
   - Si existen los secrets `STUDIO_GITHUB_TOKEN` y `STUDIO_ALLOWED_EMAILS`, los carga al Worker
     como secrets `GITHUB_TOKEN` y `ALLOWED_EMAILS` (`wrangler secret put`, leyendo de stdin,
     nunca imprimiéndolos). Si no existen, el workflow **no falla**: escribe en el summary del run
     "Studio desplegado sin credenciales: falta el secret X" y termina verde. Así el primer deploy
     funciona antes de que Vic cree el token.
   - Escribe en el summary la URL `workers.dev` del Worker.
2. Ejecuta el workflow una vez (`gh workflow run` si tienes `gh` autenticado; si no, el push a
   `main` lo dispara solo porque el workflow es un archivo nuevo bajo su propio filtro).
   Verifica con output real:
   - el run verde y la URL;
   - `curl -s <url>/` devuelve el HTML de Studio (`<title>WICFL Studio</title>`);
   - `curl -s -o /dev/null -w "%{http_code}" <url>/api/sites` devuelve **401** (sin Access ni
     identidad no entra nadie: es el comportamiento correcto y seguro).
3. `apps/studio/README.md`, sección "Despliegue": reemplázala por el mecanismo real (este
   workflow) y una lista corta de **lo único que hace Vic en el navegador**, sin comandos:
   crear el token fine-grained (permisos: Contents read/write, Pull requests read/write, Commit
   statuses read, Checks read, Metadata read; solo este repo), guardarlo como secret
   `STUDIO_GITHUB_TOKEN`, guardar `STUDIO_ALLOWED_EMAILS`, y activar Access en el Worker
   `wicfl-studio` con una política por esos correos. Después, relanzar el workflow (eso lo hace
   Codex, no Vic).

## Restricciones

- No toques `apps/studio/src|public|test`, `apps/content-form/`, ni otros workflows.
- Ningún secreto en el repo, en logs ni en el summary.
- `git fetch` al empezar; `git push origin main` al terminar (hay commits de cowork locales que
  suben junto con los tuyos: es lo esperado). El mensaje de commit describe solo lo que contiene.

## Criterio de aceptación

- [ ] Run del workflow verde (link) y URL de Studio en el reporte.
- [ ] `curl` de la página: 200 con el título; `curl` de `/api/sites`: 401. Output pegado.
- [ ] README actualizado con el mecanismo real y los pasos de navegador de Vic.
- [ ] Reporte en el formato de `prompts/TEMPLATE.md`, bitácora al inicio, avance al final de W-120.

## Commit message

```
ci: deploy WICFL Studio from GitHub Actions

Refs W-120
```
