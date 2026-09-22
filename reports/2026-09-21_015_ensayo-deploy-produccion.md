# Reporte 015: ensayo de deploy a producción

## Qué se hizo

- Se agregó el alias `preview.stuarthomeownersinsurance.com` para `stuart-homeowners` en
  `pods/pod-1.json`; el generador valida aliases, bloquea slugs ajenos al pod y evita que un
  alias sobrescriba una ruta real.
- Se agregó el Worker/config de ensayo `wicfl-pod-1-rehearsal`, con Static Assets y
  `WICFL_REHEARSAL=1`; toda respuesta de ese Worker agrega `X-Robots-Tag: noindex, nofollow`.
- `deploy.yml` ahora solo corre por `workflow_dispatch`, requiere `confirm: deploy`, selecciona
  `rehearsal|production`, y deja el gate W-103 no bloqueante únicamente en rehearsal.
- Se agregó el test standalone del router, el runbook y las notas de setup/QA.

## Decisiones tomadas

- Wrangler 4 rechaza `/*` en un custom domain. El config de ensayo usa el hostname sin wildcard,
  ya que Worker recibe todas las rutas de ese hostname. No se modificó el config de producción:
  el prompt lo prohíbe explícitamente. Esa discrepancia queda como requisito de launch.
- Se mantuvo el Worker de ensayo desplegable aunque el gate encuentre placeholders. El workflow
  conserva esas fallas en el log y production permanece fail-closed.

## Verificación

- Local: `npm run check` terminó con 0 errores, warnings y hints; `npm run build:pod -- pod-1`
  construyó el pod; `node scripts/test-pod-worker.mjs` confirmó `preview` →
  `stuart-homeowners` y host desconocido → 404. El build emitió dos warnings preexistentes:
  duplicate `index` de contenido y Tailwind sin `content` configurado.
- No hubo cambios en `wrangler.pod-1.toml` ni `sites/stuart-homeowners/**`.
- Ensayo 1: [run 35764615432](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35764615432)
  llegó al deploy pero Wrangler rechazó `preview.../*`: "Wildcard operators (*) are not allowed
  in Custom Domains" y "Paths are not allowed in Custom Domains".
- Ensayo 2: [run 35764722059](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35764722059)
  construyó, subió 14 assets y el Worker `wicfl-pod-1-rehearsal`, pero falló al crear la ruta:
  `Cloudflare API (/zones/5ec7e4d5f9631394de6188240c0021e9/workers/routes): No access to the specified resource.`
  El gate imprimió los hallazgos de email/dirección/licencia/GA4/GTM/CRM placeholders y el summary
  registró: `REHEARSAL: gate findings above are expected while placeholders remain; production target would have blocked here.`
- Exterior después del fallo: `preview.stuarthomeownersinsurance.com` no resolvió DNS; apex y
  `www` siguieron HTTP 200, por lo que el ensayo no modificó los hosts de producción.

## Lo que tocaste fuera de lo pedido

- `scripts/test-pod-worker.mjs`: el prompt requiere un test standalone existente, pero no había
  uno en el repositorio. Se agregó el mínimo necesario, sin dependencias.
- Se corrigió el pattern de rehearsal después de la primera ejecución real. Era necesario para
  pasar la validación actual de Wrangler.

## Lo que no pude verificar

- HTTPS 200, contenido de Stuart y `X-Robots-Tag` en `preview.`: la ruta DNS no se creó por el
  permiso insuficiente del token.
- Un run de ensayo verde: el mismo permiso bloqueó el último paso.

## Dónde dudé

- El prompt pedía `/*` con `custom_domain=true`, pero Wrangler 4 lo rechazó. Elegí el formato
  válido para el entorno de ensayo y dejé producción intacta conforme a la restricción explícita.

## Qué me sorprendió del repo

- El token de Actions puede subir el Worker y sus assets, pero no administrar rutas de zona.
- El prompt asumía un test standalone de router que no existía.

## Lo que no se hizo

- No se tocaron DNS, apex, `www`, producción ni los placeholders del sitio.
- No se ajustó `wrangler.pod-1.toml`; eso requiere un cambio separado porque el prompt lo veta.

## Próximos pasos sugeridos

1. Vic actualiza el token limitado de Cloudflare con el permiso mínimo para Workers Routes/custom
   domains en la zona de Stuart, reemplaza el secret de GitHub y reintenta `target: rehearsal`.
2. Antes del launch, un cambio revisado ajusta los dos custom domains de
   `wrangler.pod-1.toml` a hostnames sin `/*`; de otro modo Wrangler actual rechazará producción.
3. Una vez el ensayo sea verde, repetir los curls de `preview.`, apex y `www` solicitados por el
   prompt y anexar los headers al reporte.

## Commits

- `e7b5c84` — `feat(deploy): rehearsal target on a preview subdomain, dispatch-only production deploy`
- `f777676` — `fix(deploy): use valid custom-domain hostname for rehearsal`

## Revisión de cowork

**2026-09-22 · Aprobado con hallazgos.** Revisado contra el diff (`e7b5c84`, `f777676`,
`ece912d`), no contra este reporte.

**El ensayo hizo exactamente su trabajo: encontró dos bloqueadores del launch dos semanas
antes.** Sin él, el 9 de octubre el deploy de producción habría fallado dos veces seguidas:
primero por los patterns `/*` que Wrangler 4 rechaza en custom domains, y después por el token
sin permiso de rutas, con el apex ya sin sus registros `A` (paso 2 del runbook) y el dominio sin
resolver. Que el run no esté verde no es fracaso del prompt; es su resultado más valioso.

**Verificado en el diff:**
- `deploy.yml`: solo `workflow_dispatch`; primer step aborta si `confirm != 'deploy'`;
  `continue-on-error` del gate condicionado a `inputs.target == 'rehearsal'`, así que production
  sigue fail-closed; el config se elige por target. Trigger `push` comentado, no borrado.
- `wrangler.pod-1.rehearsal.toml`: una sola ruta, `WICFL_REHEARSAL = "1"` solo aquí, comentario
  que prohíbe rutas de producción.
- `build-pod.mjs`: `addRoute` impide que un alias sobrescriba un dominio real y valida que el
  alias apunte a un slug del pod. Mejor que lo pedido.
- Worker: header `noindex` solo con la variable de ensayo; producción no toca headers.
- `wrangler.pod-1.toml` y `sites/stuart-homeowners/**` sin cambios, como exigía el prompt.
- Bitácora al inicio; W-119 con el avance agregado al final de la fila, sin sobreescribir.

**Hallazgos:**
1. **Patterns de producción corregidos por cowork** (fuera de este prompt, que lo prohibía):
   `wrangler.pod-1.toml` pasa a hostnames sin `/*`. Evidencia de que el formato es válido: el run
   35764722059 pasó la validación de Wrangler con ese mismo formato y falló después, solo en
   permisos. Dos líneas de config espejo de un fix ya validado; no justifica un prompt.
2. **Orden del runbook incorrecto.** Las precondiciones pedían rehearsal verde (paso 2) antes de
   arreglar el token (paso 4), que es lo que impide que sea verde. Reordenado por cowork, con el
   permiso exacto: **Zone → Workers Routes → Edit** en la zona de Stuart (documentación de
   Cloudflare: "Workers Routes Write for every affected zone").
3. `scripts/test-pod-worker.mjs` no está conectado a `npm run check` ni a CI; hoy solo corre a
   mano. Se anota para el prompt de higiene, no es bloqueante.
4. Warnings preexistentes del build (`index` duplicado en content, Tailwind sin `content`): se
   anotan para higiene.
5. Cuando PSL entre al pod, su zona se agrega al mismo token y su alias `preview.` a
   `pods/pod-1.json`.

**Queda abierto W-119** hasta el rerun verde con los `curl` de `preview.`, apex y `www`
pegados abajo. Depende solo de que Vic actualice el token.
