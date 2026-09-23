# Reporte 023: patrón de teléfonos de ficción y prueba del gate

**Escrito por cowork a partir del diff** (`cd10c80`); el ejecutor no entregó reporte, bitácora ni
backlog. Ver la regla nueva en `prompts/00_GUIA_GLOBAL.md`.

## Revisión de cowork

**2026-09-23 · Aprobado.** El código hace lo pedido y se verificó independientemente.

- Regex corregida: detecta `+17725550142`, `772-555-0142`, `772 555 0142`, `(772) 555-0142` y
  `772.555.0142`; no marca `(772) 247-0106` ni `+17722470106`.
- `WICFL_SITES_ROOT` opcional para apuntar a otra carpeta; sin la variable, comportamiento igual.
- `scripts/check-production-config.test.mjs`: 3 pruebas (5 formatos de ficción; `demo` solo en
  `brand`/`seo`; placeholders, pending, `0000000`, config limpio pasa, `_fixture` se salta).
  Conectadas a `npm run check`, que corre en CI.
- **Mutation testing de cowork:** con la regex anterior, la prueba de teléfonos falla; sin el
  patrón de teléfonos, falla. Las pruebas atrapan la regresión real.
- Debilidad menor, no bloquea: las pruebas de "rechaza" solo comprueban código de salida distinto
  de cero, no el motivo; un config ilegible también pasaría como "rechazado". Mejorable si se
  vuelve a tocar el gate.
