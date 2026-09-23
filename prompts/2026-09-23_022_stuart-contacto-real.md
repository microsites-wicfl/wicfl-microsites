# 2026-09-23_022 — Datos de contacto reales de Stuart y dirección opcional

**Backlog:** W-008, W-103
**Reporte esperado:** `reports/2026-09-23_022_stuart-contacto-real.md`

## Contexto

Kevin cerró por Zoom (22–23 sep) los datos de contacto del sitio #1 (Stuart), que lanza el 9 de
octubre:

- **Teléfono:** `1 772 247 0106`. Cada sitio tiene su propio número (el de Port St. Lucie es
  otro: `1 772 335 4779`, no se usa aquí).
- **Email:** `info@stuarthomeownersinsurance.com` (reenvío a `info@wicfl.com`, lo configura Vic).
- **Sin dirección postal en los sitios.** Decisión nueva de Kevin.

Hoy `contact.address` es **obligatorio** en el schema, y el template lo usa en dos lugares:
el `<address>` del footer y el `PostalAddress` del JSON-LD `InsuranceAgency` en
`packages/template/src/layouts/BaseLayout.astro`. Mismo patrón que la licencia en el prompt 016:
se vuelve opcional y se renderiza solo si existe.

Además, revisando el config de Stuart apareció que el gate de producción (W-103) **no detecta
dos cosas que no deben salir a producción**: el teléfono de ficción `(772) 555-0100` (no termina
en `0000000`) y las marcas "Demo" del config (`brand.name` es
`"Stuart Homeowners Insurance (Demo)"` y los campos de `seo` dicen "Internal Demo").

## Objetivo

1. **Schema:** `contact.address` sale del `required` de `contact`. Descripción actualizada:
   opcional; si existe, el template lo muestra; los sitios de WICFL no muestran dirección por
   decisión de Kevin del 2026-09-23. No toques nada más del schema.
2. **Template:** el `<address>` del footer y la propiedad `address` del JSON-LD solo existen si
   `site.contact.address` existe. Sin dirección, el JSON-LD conserva `areaServed` (negocio por
   área de servicio, lo correcto para Google en este caso).
3. **Config de Stuart** (`sites/stuart-homeowners/site.config.json`): `trackingPhone`
   `+17722470106`, `displayPhone` `(772) 247-0106`, `email`
   `info@stuarthomeownersinsurance.com`, y se quita `address`. **No toques** `brand` ni `seo`:
   los textos reales los decide Pavel (ver objetivo 5).
4. **Formulario** (`apps/content-form/src/index.js`, alta de sitio): deja de escribir `address`
   en los configs nuevos. No toques `apps/studio/`.
5. **Gate de producción** (`scripts/check-production-config.mjs`), dos patrones nuevos:
   - teléfonos del rango reservado para ficción en EE. UU., `555-0100` a `555-0199` (en E.164
     `+1NPA55501dd` y en formato de pantalla);
   - la palabra `demo` como palabra completa (`/\bdemo\b/i`).
   `sites/_*` sigue exento. Resultado esperado: el gate sigue fallando contra Stuart, ahora
   **solo** por `brand.name`, los campos de `seo` con "Demo", GA4, GTM y CRM. Ya no por
   teléfono, email ni dirección.
6. **Docs**, cambio mínimo: `docs/SITE_CONFIG_SCHEMA.md` (address opcional, decisión con fecha),
   `docs/SITE_CONTENT_CHECKLIST.md` (fila de address → "Optional, not used on WICFL sites";
   quitar la dirección de la lista de datos reales), `docs/CONTENT_STANDARDS.md` y
   `docs/QA_CHECKLIST.md` (la regla NAP pasa a "name and phone"; sin dirección no hay A que
   comparar), y `docs/QA_CHECKLIST.md` / `docs/SETUP.md` si mencionan los patrones del gate.

## Restricciones

- Fixtures y ejemplos (`sites/_example`, `packages/config-schema/examples/*`) **conservan**
  `address`: cubren el caso "con dirección".
- No toques workflows, `wrangler*`, `pods/` ni `apps/studio/`.
- `git fetch` al empezar (no puedes estar detrás de `origin/main`); `git push origin main` al
  terminar. El mensaje de commit describe solo lo que contiene.

## Criterio de aceptación

- [ ] `npm run check` verde.
- [ ] Build de Stuart: el HTML no tiene `<address>` ni `PostalAddress`, y muestra
      `(772) 247-0106` con `tel:+17722470106`. Build de `_example`: sí tiene ambos. Pega los
      `grep -c`.
- [ ] Gate contra Stuart antes y después, salida pegada: después no aparece teléfono, email ni
      dirección, y sí aparecen `brand.name`, `seo.*` (Demo), GA4, GTM y CRM.
- [ ] Una prueba del gate: un config temporal con `(772) 555-0142` y otro con "Demo" fallan; uno
      limpio pasa. Salida pegada. No dejes esos configs en el repo.
- [ ] **Reporte escrito** en el formato de `prompts/TEMPLATE.md`, **entrada de bitácora al
      inicio** de `BITACORA.md` y **avance al final** de las filas de W-008 y W-103. Los últimos
      cuatro prompts se entregaron sin reporte ni bitácora; este no se da por terminado sin ellos.
- [ ] CI verde en el commit final (link del run).

## Commit messages

```
feat(schema): make contact.address optional; render it only when present
```
```
feat(stuart): real phone and email from Kevin; no mailing address
```
```
feat(gate): reject fictional 555-01xx phones and demo markers before production
```
```
docs: address optional on WICFL sites, per Kevin (23 Sep 2026)
```
