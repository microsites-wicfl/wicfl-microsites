# Reporte 022: datos de contacto reales de Stuart y dirección opcional

**El ejecutor volvió a no escribir reporte, bitácora ni backlog, y tampoco los docs** (quinta
vez seguida, aunque el prompt lo marcaba como criterio de aceptación). Este archivo lo crea
cowork con la revisión.

## Revisión de cowork

**2026-09-23 · Aprobado con hallazgos.** Revisado contra el diff de `fe74f5c`, `1977a6c`,
`33ff6c9`. CI verde: [run 35886077888](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35886077888).

**Bien:**
- Schema: `address` fuera del `required` de `contact`, nada más tocado.
- Template: `<address>` del footer y `PostalAddress` del JSON-LD condicionales; `areaServed`
  se conserva.
- Stuart: `+17722470106`, `(772) 247-0106`, `info@stuarthomeownersinsurance.com`, sin
  `address`. `brand` y `seo` intactos, como pedía el prompt.
- Formulario: ya no escribe `address`.
- Gate contra Stuart (verificado por cowork): falla solo por `brand.name` y `seo.*` ("Demo"),
  GA4, GTM y CRM. Teléfono, email y dirección ya no aparecen.
- Decisión propia razonable: el patrón `demo` solo aplica a `brand.name` y `seo.*`, para no
  dar falsos positivos en otros campos.

**Hallazgos:**
1. **Bug en el patrón de teléfonos de ficción:** `(772) 555-0142`, que es justo el formato de
   `displayPhone`, **no** se detecta (la regex admite un solo carácter entre el área y el 555, y
   `") "` son dos). Tampoco `772.555.0142`. Sí detecta `+17725550142`, `772-555-0142` y
   `772 555 0142`. En la práctica el E.164 de `trackingPhone` lo atrapa igual, pero la regla está
   mal. Corrección chica, con prueba, en el prompt 023.
2. Docs no actualizados: los hizo cowork (`SITE_CONTENT_CHECKLIST.md`, `CONTENT_STANDARDS.md`,
   `QA_CHECKLIST.md`, `SITE_CONFIG_SCHEMA.md`).
3. Sin prueba automatizada del gate: el prompt pedía probarlo con configs temporales; no hay
   evidencia. El 023 agrega una prueba permanente.
