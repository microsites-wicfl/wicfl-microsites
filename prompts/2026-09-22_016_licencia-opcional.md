# 2026-09-22_016 — El número de licencia deja de ser obligatorio en los sitios

**Backlog:** W-008 (reduce el bloqueador), W-103 (el gate deja de tropezar con la licencia)
**Fase:** 3 (Bloque B, obligatorio para el launch del sitio #1 el 9 de octubre)
**Reporte esperado:** `reports/2026-09-22_016_licencia-opcional.md`

## Contexto

El plan original asumía que la publicidad de seguros en Florida exige mostrar el número de
licencia, y el framework lo encodó como regla dura: `contact.licenseNumber` es obligatorio en
el schema, `BaseLayout.astro` lo renderiza en el footer de toda página ("Florida license: …"),
`docs/CONTENT_STANDARDS.md` lo lista como regla permanente, y `sites/stuart-homeowners` lleva
`PLACEHOLDER-FL-LICENSE-PENDING-W-008` esperando el número real de Kevin.

**Kevin decidió el 2026-09-22 que los sitios no muestran número de licencia.** Se verificó
contra la guía de cumplimiento del Florida Department of Financial Services (General
Guidelines, Division of Agent and Agency Services): el número de licencia se exige en las
**solicitudes de póliza**, no en publicidad. Es decisión de negocio de Kevin, consistente con
la regla, y no se reabre aquí.

Consecuencia práctica: el bloqueador del launch (W-008) se reduce a teléfono, email y
dirección aprobados. Pero hoy el gate de producción (`scripts/check-production-config.mjs`)
sigue rechazando `stuart-homeowners` por el placeholder de licencia, y el schema no acepta un
config sin ese campo. Este prompt quita esa dependencia sin romper ningún config existente.

## Objetivo

Cuando termines tiene que ser cierto:

1. `contact.licenseNumber` es **opcional** en el schema. Un config con el campo sigue siendo
   válido (compatibilidad hacia atrás); un config sin el campo también.
2. El template renderiza la línea "Florida license: …" **solo** si el campo existe y no está
   vacío. Sin el campo, el footer no muestra nada de licencia, sin espacio vacío ni etiqueta
   huérfana.
3. `sites/stuart-homeowners/site.config.json` **ya no tiene** el campo. Con eso, el único
   motivo por el que el gate de W-103 rechaza ese sitio son los placeholders que sí siguen
   pendientes (teléfono, email, dirección, GA4, GTM, CRM). Demuéstralo con la salida del gate
   antes y después.
4. El formulario de Pavel (`apps/content-form/src/index.js`, modo "Create new site") deja de
   escribir `licenseNumber: "PLACEHOLDER-FL-LICENSE"` en los configs nuevos.
5. Los fixtures y ejemplos (`sites/_example`, `packages/config-schema/examples/*.json`)
   conservan el campo a propósito, porque ejercitan el caso "con licencia". Documenta que es
   intencional en un comentario del reporte, no los toques.
6. La documentación deja de decir que la licencia es obligatoria, en todos los lugares
   listados abajo, y dice en su lugar que es opcional por decisión de Kevin del 2026-09-22.

## Restricciones

- `CLAUDE.md` regla 3: el schema es el contrato y cambiarlo es caro. Este cambio es
  **relajar** una obligatoriedad, que es el único tipo de cambio de schema que no rompe nada
  ya existente. No toques ningún otro campo, ni el `required` de otros objetos.
- **No cambies los patrones del gate** (`check-production-config.mjs`). El gate no sabe de
  licencia; detecta la palabra "placeholder" en cualquier string. Al quitar el campo del
  config de Stuart, el hallazgo desaparece solo. Si te ves tentado a "excluir la licencia"
  en el gate, detente: ese sería el enfoque equivocado.
- No toques `wrangler.*.toml`, workflows ni `pods/`. El prompt 015 está trabajando ahí en
  paralelo; este prompt no debe generar conflicto con él.
- Sin dependencias nuevas.
- Repo sincronizado con `origin/main` antes de empezar; si no lo está, detente y repórtalo.

## Pasos

1. **Schema.** En `packages/config-schema/site.config.schema.json`, quita `"licenseNumber"`
   del array `required` del objeto `contact`. Actualiza la `description` del campo: ya no dice
   "Required"; dice que es opcional, que si está presente el template lo muestra en el footer,
   y que Kevin decidió el 2026-09-22 no mostrarlo en los sitios de WICFL. Conserva
   `minLength: 1`: si alguien lo pone, no puede ser cadena vacía.

2. **Template.** En `packages/template/src/layouts/BaseLayout.astro`, la línea del footer se
   renderiza condicionalmente. Verifica que no queda ningún otro uso de `licenseNumber` en
   `packages/template/src/**` (JSON-LD, meta, otros layouts). Si el JSON-LD `InsuranceAgency`
   de W-023 lo incluye, también condicional.

3. **Config de Stuart.** Quita la línea `licenseNumber` de
   `sites/stuart-homeowners/site.config.json`. No toques nada más de ese archivo.

4. **Formulario.** En `apps/content-form/src/index.js`, el objeto `contact` que arma
   `createSite()` deja de incluir `licenseNumber`. No agregues un campo de licencia al
   formulario.

5. **Verificación.** Con output real en el reporte:
   - `npm run check` verde (valida ejemplos con licencia y el config de Stuart sin ella).
   - `npm run build:site -- stuart-homeowners` y `npm run build:site -- _example`: ambos
     construyen. En el HTML de Stuart no aparece la cadena "Florida license"; en el de
     `_example` sí (`grep -c "Florida license" dist/...`).
   - `node scripts/check-production-config.mjs stuart-homeowners` **antes** del cambio (pega
     la lista de hallazgos, incluye la licencia) y **después** (la lista ya no incluye
     licencia; sigue fallando por los otros placeholders, y eso es correcto).
   - `node --check apps/content-form/src/index.js`.

6. **Docs.** Cada archivo, con el cambio mínimo, sin reescribir secciones enteras:
   - `docs/CONTENT_STANDARDS.md`: la regla "Florida insurance advertising rules apply on
     every page. License number displayed, …" quita "License number displayed"; en el
     checklist de self-review, el punto 1 ("License number is correct and visible") pasa a
     "If the config carries a license number it renders correctly; WICFL sites do not carry
     one by Kevin's decision (22 Sep 2026)". Agrega una línea al historial de versiones del
     encabezado.
   - `docs/SITE_CONTENT_CHECKLIST.md`: la fila de `contact.licenseNumber` pasa de "Required" a
     "Optional, not used on WICFL sites"; la viñeta "Real Florida license number" se quita; la
     nota sobre placeholders de `_example` se ajusta.
   - `docs/QA_CHECKLIST.md`: la fila "License number correct and visible" se reescribe igual
     que el self-review; la fila del gate que menciona "fake license" pasa a otro ejemplo
     (tracking phone).
   - `docs/SITE_CONFIG_SCHEMA.md`: donde dice que `licenseNumber` es requerido, ya no; una
     línea de decisión de diseño nueva con la fecha y la razón (guía del Florida DFS).
   - `docs/OPERATOR_GUIDE.md` (y `.es.md` si la sección existe ahí): las menciones de que el
     template renderiza la licencia automáticamente pasan a "si existe en el config"; la
     regla 5 del final quita "License numbers".
   - `docs/ARCHITECTURE.md` y `docs/SETUP.md`: el ejemplo de placeholder "fake license
     number" pasa a "unset tracking phone". Nada más.
   - `CLAUDE.md` línea de W-008: quita "license numbers" de la lista.
   - **No toques** `docs/master-file-source.html`; eso lo republica cowork.

7. **Bitácora y backlog.** Entrada al **inicio** de `BITACORA.md`. En `BACKLOG.md`, agrega al
   **final** de la fila de W-008 (sin sobreescribir lo que ya dice) que la licencia salió del
   bloqueador por este prompt, y al final de W-103 que el gate ya no tropieza con ese campo.

## Criterio de aceptación

- [ ] `npm run check` verde con Stuart sin `licenseNumber` y los ejemplos con él.
- [ ] Build de Stuart sin la cadena "Florida license"; build de `_example` con ella.
- [ ] Salida del gate antes/después pegada en el reporte; después ya no menciona licencia y
      sigue fallando por los demás placeholders.
- [ ] `git diff --stat` no toca `check-production-config.mjs`, `wrangler.*`, workflows ni
      `pods/`.
- [ ] El formulario no escribe `licenseNumber` en sitios nuevos (muestra el fragmento).
- [ ] Docs listados actualizados; `grep -rn -i "license" docs/ CLAUDE.md` en el reporte, con
      una línea por hallazgo restante explicando por qué se queda (p. ej. "licensed agent" en
      contexto de revisión de compliance, que no cambia).
- [ ] CI verde en el commit final (link del run).

## Formato del reporte

Escribe `reports/2026-09-22_016_licencia-opcional.md` con:

- **Qué se hizo** — lista de cambios concretos
- **Decisiones tomadas** — cualquier bifurcación que resolviste y por qué
- **Verificación** — cómo comprobaste que funciona, con output real
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

Un commit para código (schema, template, config de Stuart, formulario) y otro para docs:

```
feat(schema): make contact.licenseNumber optional; render it only when present

Kevin decided on 2026-09-22 that WICFL sites do not display the agency
license number. Florida DFS guidance requires it on policy applications,
not in advertising. Narrows W-008 to phone, email and address.
```

```
docs: license number is optional on WICFL sites, per Kevin (22 Sep 2026)
```
