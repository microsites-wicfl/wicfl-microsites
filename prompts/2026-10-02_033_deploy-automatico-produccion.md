# 2026-10-02_033 — Deploy automático a producción después del lanzamiento

**Backlog:** W-119 (continuación), `docs/LAUNCH_RUNBOOK.md` paso 8
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_033_deploy-automatico-produccion.md`

> **NO EJECUTAR ANTES DEL LANZAMIENTO.** Este prompt se escribió el 2 de octubre y se corre el
> 9 de octubre después del paso 7 del runbook, o el 10 temprano. Su propio push dispara un
> deploy a producción. Si el sitio todavía no está en vivo, detente en el paso 1.

## Contexto

`deploy.yml` ("Deploy Cloudflare Workers") publica el pod-1 en el dominio real. Desde W-119 solo
corre por `workflow_dispatch` con `target` y `confirm: deploy`; su trigger de `push` está
comentado a propósito hasta el lanzamiento.

Consecuencia hoy: cuando Pavel publica desde Studio (un commit a `main`), "Publish site Workers"
actualiza la copia de workers.dev, pero el dominio real se queda en la versión del lanzamiento.
El manual de Pavel dice que "un sitio en vivo se actualiza en su dominio en minutos", y eso solo
es cierto cuando este prompt esté aplicado.

## Objetivo

Un push a `main` que cambie un sitio del pod, el template o el pipeline despliega solo a
producción, con las mismas comprobaciones y el mismo gate que el deploy manual. El deploy manual
(ensayo y producción) sigue funcionando igual.

## Restricciones

- Todo lo construido en inglés.
- **El gate de producción (W-103) sigue cerrado en falla.** En producción, automática o manual,
  `check-production-config.mjs` bloquea el deploy. `continue-on-error` solo aplica al ensayo.
- `npm run check` sigue corriendo antes de cualquier deploy.
- No cambies `wrangler.pod-1.toml`, `wrangler.pod-1.rehearsal.toml`, `pods/pod-1.json`, el
  template, los sitios ni `apps/`.
- No cambies `publish-sites.yml` ni `preview.yml`.
- No toques secretos. Los dos que usa el workflow ya existen.
- Un borrador de Studio vive en una rama, no en `main`: no debe disparar nada. No agregues
  triggers de `pull_request`.

## Pasos

1. **Comprueba que el sitio ya está en vivo.** `https://stuarthomeownersinsurance.com/` responde
   200, **sin** cabecera `X-Robots-Tag`, y sirve el sitio de Stuart. Si no se cumple, no cambies
   nada: escribe el reporte diciendo qué viste y termina.

2. **Trigger de push.** En `.github/workflows/deploy.yml` reactiva `push` a `main` con las rutas
   que están comentadas y agrega la exclusión de los sitios de práctica, que no pertenecen a
   ningún pod:

   ```yaml
   push:
     branches: [main]
     paths:
       - "package.json"
       - "package-lock.json"
       - "packages/template/**"
       - "packages/config-schema/**"
       - "sites/**"
       - "!sites/_*/**"
       - "scripts/**"
       - "pods/**"
       - "wrangler.pod-1.toml"
       - ".github/workflows/deploy.yml"
   ```

   Sustituye el comentario viejo ("Re-enable this push trigger only in a separate post-launch
   change…") por uno que diga qué dispara el deploy automático y por qué.

3. **Target resuelto una sola vez.** En un push no existen `inputs`. Define el destino en un solo
   lugar (por ejemplo `env.TARGET` a nivel de job:
   `${{ github.event_name == 'push' && 'production' || inputs.target }}`) y úsalo en el nombre
   del job, en el `continue-on-error` del gate, en el paso de ensayo y en la elección del
   archivo de wrangler. No dejes ninguna referencia directa a `inputs.target` que en un push
   valga vacío.

4. **Confirmación solo en manual.** El paso "Confirm intentional deployment" se evalúa solo
   cuando `github.event_name == 'workflow_dispatch'`.

5. **Sin deploys encimados.** Agrega `concurrency` con un grupo por destino (por ejemplo
   `deploy-pod-1-${{ … target … }}`) y `cancel-in-progress: false`, para que dos publicaciones
   seguidas se encolen y la última gane en orden.

6. **Permisos mínimos.** `permissions: contents: read`.

7. **Resumen legible.** Al final, escribe en `$GITHUB_STEP_SUMMARY` el destino, el evento y el
   commit desplegado. Si el gate bloquea en producción, el resumen debe decir en una línea que
   el dominio real se quedó en la versión anterior y qué sitio y qué campo lo bloquearon (la
   salida de `check-production-config.mjs` ya lo dice; solo asegúrate de que quede en el resumen).

8. **Prueba permanente.** Agrega `scripts/deploy-workflow.test.mjs` a `npm run check`. Lee
   `deploy.yml` como texto o YAML (sin dependencias nuevas; si hace falta un parser, usa lo que
   ya esté instalado en el repo) y comprueba:
   - el trigger `push` existe, solo para `main`, y excluye `sites/_*/**`;
   - no hay trigger `pull_request`;
   - `npm run check` y el gate W-103 van antes del paso de deploy;
   - el `continue-on-error` del gate no puede ser verdadero cuando el destino es producción;
   - existe `concurrency` con `cancel-in-progress: false`.

9. **Documentación.**
   - `docs/LAUNCH_RUNBOOK.md`: marca el paso 8 como hecho, con fecha y el run.
   - Busca en `docs/`, `CLAUDE.md` y `AGENTS.md` cualquier frase que diga que `deploy.yml` es
     solo manual y corrígela. No reescribas nada más.

10. `npm run check` en verde. Commit y push. **Ese push cambia `deploy.yml`, así que dispara el
    primer deploy automático a producción.** Espera a que termine y verifica:
    - el run de "Deploy Cloudflare Workers" se disparó por `push`, destino `production`, verde;
    - `https://stuarthomeownersinsurance.com/` y `https://www.stuarthomeownersinsurance.com/`
      responden 200 sin `X-Robots-Tag`;
    - `https://preview.stuarthomeownersinsurance.com/` sigue respondiendo con
      `X-Robots-Tag: noindex, nofollow` (el ensayo no se tocó).

    Si el run falla, **no reintentes a ciegas**: el dominio real sigue en la versión anterior.
    Reporta el paso que falló y su salida.

## Criterio de aceptación

- [ ] Un push a `main` con cambios en un sitio del pod despliega a producción sin intervención.
- [ ] Un cambio solo en `sites/_example/` no dispara el deploy.
- [ ] El gate W-103 bloquea producción también en automático.
- [ ] El deploy manual de ensayo y de producción sigue pidiendo `confirm: deploy`.
- [ ] El primer run automático terminó verde y el dominio real responde bien.
- [ ] `npm run check` verde con la prueba nueva.

## Formato del reporte

Escribe `reports/2026-10-02_033_deploy-automatico-produccion.md` con las secciones de
`prompts/TEMPLATE.md`. En **Verificación** incluye el `deploy.yml` final completo, la liga del
primer run automático y las cabeceras que viste en apex, `www` y `preview`.

Cowork hará después la prueba de punta a punta: una publicación mínima desde Studio y comprobar
que aparece en el dominio real.

## Commit message

```
ci(deploy): deploy pod-1 to production on push to main, gate stays fail-closed (W-119)
```
