# 2026-09-21_015 — Camino de deploy a producción, ensayado en un subdominio antes del launch

**Backlog:** W-119 (nuevo), y deja listo W-014 para el launch
**Fase:** 3 (Bloque B, obligatorio para el launch del sitio #1 el 9 de octubre)
**Reporte esperado:** `reports/2026-09-21_015_ensayo-deploy-produccion.md`

## Contexto

Nadie ha desplegado nunca un sitio de esta fábrica a un dominio real. Lo que existe hoy:

- `.github/workflows/deploy.yml` está en `if: ${{ false }}` desde el 4 de septiembre. Corre
  `npm run check`, `npm run build:pod -- pod-1`, el gate de producción de W-103
  (`scripts/check-production-config.mjs` por cada slug de `pods/pod-1.json`) y
  `npx wrangler deploy --config wrangler.pod-1.toml`.
- `wrangler.pod-1.toml` declara dos `[[routes]]` con `custom_domain = true`:
  `stuarthomeownersinsurance.com/*` y `www.stuarthomeownersinsurance.com/*`. Eso significa que
  **el primer deploy real que corra engancha el dominio apex y lo pone en vivo en el mismo
  acto**. No hay estado intermedio.
- El dominio ya está en Cloudflare (nameservers cambiados el 4-sep), pero todavía tiene dos
  registros `A` apuntando al parking de GoDaddy y un `CNAME _domainconnect` que ya no sirve.
  `custom_domain = true` le pide a Cloudflare crear el registro DNS; si ya existe un `A` en el
  apex, el deploy falla por conflicto.
- `sites/stuart-homeowners/site.config.json` todavía lleva placeholders (licencia, teléfono,
  email, dirección, GA4, GTM, CRM). El gate de W-103 lo rechaza a propósito, verificado.
- El router del pod (`scripts/pod-worker-template.mjs`) decide qué sitio responde por el header
  `Host`, con un mapa `dominio → slug` que `scripts/build-pod.mjs` arma desde el campo `domain`
  de cada `site.config.json` (apex y `www.`). Ningún otro host resuelve: devuelve 404.

El sitio #1 lanza el viernes 9 de octubre. Si el modo SSL, los registros DNS, el binding de
assets o el router fallan, hoy lo descubriríamos ese día. Este prompt existe para descubrirlo
esta semana o la próxima, contra un **subdominio de ensayo** que ejercita custom domain, DNS y
SSL sin tocar el apex.

Este prompt **no** mete los datos reales de Kevin al config ni activa el deploy por push. Eso
viene después, cuando los datos existan.

## Objetivo

Cuando termines tiene que ser cierto:

1. `https://preview.stuarthomeownersinsurance.com/` sirve el sitio `stuart-homeowners`
   construido desde `main`, con HTTPS válido, a través de un Worker de ensayo separado
   (`wicfl-pod-1-rehearsal`), sin que el apex ni `www` hayan cambiado (siguen mostrando el
   parking de GoDaddy).
2. Toda respuesta del Worker de ensayo lleva `X-Robots-Tag: noindex, nofollow`. Es un
   subdominio público con placeholders; no debe indexarse nunca.
3. `deploy.yml` ya no está en `if: false`. Corre **solo** por `workflow_dispatch`, con un input
   `target` (`rehearsal` | `production`) y un input `confirm` que debe ser exactamente `deploy`.
   El trigger por `push` queda comentado (no borrado) con una nota de que se reactiva después
   del launch, en un prompt aparte.
4. Con `target: production`, el gate de W-103 es bloqueante (como hoy). Con
   `target: rehearsal`, el gate **corre y su salida queda en el log**, pero no bloquea, porque
   el ensayo se hace a propósito con los placeholders todavía puestos. Esto tiene que quedar
   documentado en el propio workflow, en un comentario, para que nadie lo lea como un bypass.
5. Existe `docs/LAUNCH_RUNBOOK.md`: la secuencia exacta del 9 de octubre, con qué hace Vic en
   el dashboard (DNS, SSL) y qué hace el workflow, en orden, con qué verificar después de cada
   paso.

## Restricciones

- **No toques `wrangler.pod-1.toml`.** El config de producción se queda idéntico. El ensayo
  usa un archivo nuevo, `wrangler.pod-1.rehearsal.toml`, con **solo** la ruta del subdominio.
- **No toques `sites/stuart-homeowners/**`.** Los placeholders se quedan; el ensayo los
  ejercita.
- **No relajes el gate de W-103** para producción. El modo "reporta pero no bloquea" existe
  solo para `target: rehearsal`, y el workflow tiene que hacer imposible que `production` lo use.
- **No borres registros DNS.** Eso es del runbook y lo hace Vic en el dashboard el día del
  launch. Tú documentas cuáles y por qué.
- `CLAUDE.md` regla 1: Workers con Static Assets, nunca Pages. Regla 3: el schema de
  `site.config.json` no se toca; si crees que el alias de host necesita un campo en el schema,
  no lo agregues, va en `pods/pod-1.json` (ver paso 1).
- Sin dependencias nuevas.
- Repo sincronizado con `origin/main` antes de empezar; si no lo está, detente y repórtalo.

## Pasos

1. **Alias de host en el pod.** Extiende `pods/pod-1.json` con un campo opcional
   `"aliases": { "preview.stuarthomeownersinsurance.com": "stuart-homeowners" }` y haz que
   `scripts/build-pod.mjs` los sume al mapa `ROUTES` que inyecta en el Worker (después de los
   dominios reales, sin poder sobreescribir uno). Un alias que apunte a un slug que no está en
   `sites` del pod es error de build, no silencio. Actualiza el comentario de cabecera de
   `scripts/pod-worker-template.mjs` para que mencione los alias.

2. **Header `noindex` en modo ensayo.** El Worker lee `env.WICFL_REHEARSAL`; si es `"1"`,
   agrega `X-Robots-Tag: noindex, nofollow` a toda respuesta. En producción la variable no
   existe y el Worker no toca headers. La variable se declara en `[vars]` del
   `wrangler.pod-1.rehearsal.toml`, nunca en el de producción.

3. **`wrangler.pod-1.rehearsal.toml`.** Mismo `main`, mismo `[assets]`, mismo
   `compatibility_date` que el de producción; `name = "wicfl-pod-1-rehearsal"`;
   `[vars] WICFL_REHEARSAL = "1"`; una sola `[[routes]]`:
   `pattern = "preview.stuarthomeownersinsurance.com/*"`, `custom_domain = true`. Comentario de
   cabecera explicando que este archivo existe para ensayar el camino de producción sin tocar
   el apex, y que **nunca** debe llevar las rutas del apex o `www`.

4. **`deploy.yml`.** Quita `if: false`. Cambia `on:` a `workflow_dispatch` con inputs:
   `target` (choice: `rehearsal`, `production`; default `rehearsal`) y `confirm` (string,
   required; descripción: "type deploy to confirm"). Primer step: falla si `confirm != 'deploy'`.
   El trigger `push` se comenta con nota. El gate de W-103 corre siempre; en `rehearsal` con
   `continue-on-error: true` y un step que imprime en el summary del run "REHEARSAL: gate
   findings above are expected while placeholders remain; production target would have
   blocked here". El step de deploy elige el config por `target`. Deja el nombre del job
   reflejando el target (`Deploy pod-1 (${{ inputs.target }})`).

5. **Correr el ensayo de verdad.** Dispara el workflow con `target: rehearsal`,
   `confirm: deploy` (con `gh workflow run` si tienes `gh` autenticado; si no, detente en este
   paso, deja todo commiteado en una rama, y reporta exactamente qué botón tiene que apretar Vic
   en GitHub → Actions → "Deploy Cloudflare Workers" → Run workflow, con qué valores). Espera
   el run. Verifica desde fuera, con output real en el reporte:
   - `curl -sI https://preview.stuarthomeownersinsurance.com/` → `HTTP/2 200`, certificado
     válido (sin `-k`), header `x-robots-tag: noindex, nofollow`.
   - `curl -s https://preview.stuarthomeownersinsurance.com/ | grep -c "Stuart"` > 0 y una
     página interior (`/flood-insurance/`) también 200.
   - `curl -sI https://stuarthomeownersinsurance.com/` sigue devolviendo lo que devolvía antes
     (parking de GoDaddy), y `www.` igual. Pega los headers antes y después.
   - El gate imprimió sus hallazgos en el log del run (cita las líneas) y el run terminó verde.
   - `curl -sI -H "Host: nadie.example" https://preview.stuarthomeownersinsurance.com/` no
     aplica (Cloudflare enruta por hostname real); en su lugar confirma con el test standalone
     del router (el que ya existe para `pod-worker-template.mjs`) que un host no mapeado
     devuelve 404 y que el alias resuelve al slug.

6. **`docs/LAUNCH_RUNBOOK.md`.** Secuencia del 9 de octubre, con owner por paso:
   - Precondiciones (día anterior): datos reales en `site.config.json` mergeados; gate de
     W-103 verde en un run de `rehearsal` (sí, con `production` bloquearía; con `rehearsal` se
     ve verde en el log, esa es la señal); ensayo del subdominio sirviendo el contenido final.
   - Vic, dashboard de Cloudflare, en este orden: (a) SSL/TLS → modo **Full (strict)**; (b) DNS
     → borrar los dos registros `A` del apex que apuntan al parking de GoDaddy y el
     `CNAME _domainconnect`; anotar que a partir de ese momento el apex no resuelve hasta que
     el deploy cree su registro, así que (b) y (c) van seguidos, no con horas entre medio.
   - (c) Workflow: `target: production`, `confirm: deploy`. Qué mirar en el log.
   - Verificación post-deploy: apex y `www` 200 con HTTPS; **sin** header `x-robots-tag`;
     `robots.txt` y `sitemap.xml` con el dominio real; una llamada al número de tracking que
     quede grabada en GoTo; un lead de prueba desde `/contact/` que llegue a GoHighLevel con el
     tag del sitio; GA4 registrando en tiempo real; propiedad creada en Search Console y sitemap
     enviado (manual; la automatización es Fase 7).
   - Rollback: qué hacer si el apex no responde (volver a apuntar el `A` al parking no es
     rollback útil; el rollback real es `wrangler rollback` del Worker o re-deploy del commit
     anterior por dispatch). Documenta el comando exacto.
   - Después del launch: el Worker de ensayo y el subdominio `preview.` se quedan como entorno
     de ensayo permanente para futuros sitios del pod (agregar alias por sitio), no se borran.

7. **Docs de apoyo.** `docs/SETUP.md` y `docs/QA_CHECKLIST.md` sección 7 ("Deploy"): que
   mencionen el target de ensayo, el subdominio y el runbook. `docs/ARCHITECTURE.md` no se
   toca salvo una línea en "What the framework provides" si hace falta mencionar el entorno de
   ensayo.

8. **Bitácora y backlog.** Entrada al **inicio** de `BITACORA.md`. En `BACKLOG.md`, agrega el
   avance al **final** de la fila de W-119 sin sobreescribir lo que ya dice (el 21-sep un
   ejecutor reemplazó la fila de W-118 entera y se perdió historial; no lo repitas), y una nota
   en W-014 de que el workflow ya está activo por dispatch.

## Criterio de aceptación

- [ ] `https://preview.stuarthomeownersinsurance.com/` responde 200 con HTTPS válido y el
      contenido de `stuart-homeowners` construido desde `main`.
- [ ] Toda respuesta del subdominio lleva `x-robots-tag: noindex, nofollow`.
- [ ] Apex y `www` no cambiaron: headers antes/después idénticos, pegados en el reporte.
- [ ] `wrangler.pod-1.toml` y `sites/stuart-homeowners/**` sin cambios (`git diff --stat`
      lo demuestra).
- [ ] `deploy.yml` solo corre por dispatch, exige `confirm: deploy`, y con `target:
      production` el gate de W-103 sigue siendo bloqueante (demuéstralo leyendo el YAML en el
      reporte, no hace falta correr production).
- [ ] El run de ensayo muestra en el log los hallazgos del gate contra `stuart-homeowners`
      y aun así terminó verde, con el aviso de REHEARSAL en el summary.
- [ ] El test standalone del router pasa con el alias y con un host desconocido.
- [ ] `docs/LAUNCH_RUNBOOK.md` existe, con owner por paso, el orden DNS→deploy explícito y el
      comando de rollback.
- [ ] `npm run check` verde; CI verde en el commit final (pega el link del run).

## Formato del reporte

Escribe `reports/2026-09-21_015_ensayo-deploy-produccion.md` con:

- **Qué se hizo** — lista de cambios concretos
- **Decisiones tomadas** — cualquier bifurcación que resolviste y por qué
- **Verificación** — cómo comprobaste que funciona, con output real (los `curl`, el link del
  run, las líneas del gate)
- **Lo que tocaste fuera de lo pedido** — con la razón. Si no hubo, dilo explícitamente
- **Lo que no pudiste verificar** — distinto de lo que no se hizo
- **Dónde dudaste** — cada punto donde el prompt era ambiguo y tuviste que elegir
- **Qué te sorprendió del repo** — cualquier cosa que no coincidió con lo que el prompt te
  llevó a esperar
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — incluido cualquier item de backlog que creas que falta. Tú no
  los creas: los anotas aquí y cowork los evalúa
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

Un commit para el código (pod alias, Worker, wrangler de ensayo, workflow) y otro para docs
(runbook, SETUP, QA, bitácora, backlog):

```
feat(deploy): rehearsal target on a preview subdomain, dispatch-only production deploy

Closes W-119
```

```
docs: launch runbook for Site #1 and rehearsal environment notes
```
