# 2026-09-23_023 — Gate: corregir el patrón de teléfonos de ficción y dejarle una prueba

**Backlog:** W-103
**Reporte esperado:** `reports/2026-09-23_023_gate-telefonos-prueba.md`

## Contexto

`scripts/check-production-config.mjs` es el gate que impide publicar un sitio con datos falsos.
El prompt 022 le agregó un patrón para teléfonos de ficción (`555-0100` a `555-0199`), pero la
regex solo admite **un** carácter entre el código de área y el `555`. Resultado, medido:

| Valor | Detectado hoy |
|---|---|
| `+17725550142` | sí |
| `772-555-0142` | sí |
| `772 555 0142` | sí |
| `(772) 555-0142` | **no** (es el formato de `displayPhone`) |
| `772.555.0142` | **no** |

Y el gate no tiene ninguna prueba automatizada.

## Objetivo

1. Corrige el patrón para que detecte los cinco formatos de la tabla y no marque teléfonos
   reales como `(772) 247-0106` / `+17722470106`.
2. Crea `scripts/check-production-config.test.mjs` (`node:test`, sin dependencias) que ejecute el
   script contra configs temporales en un directorio temporal del sistema (no dentro de
   `sites/`) y compruebe:
   - cada uno de los cinco formatos de ficción → falla;
   - `demo` en `brand.name` o en un campo de `seo` → falla; `demo` en otro campo → no falla;
   - `PLACEHOLDER`, `PENDING_...` y un teléfono terminado en `0000000` → falla;
   - un config limpio → pasa;
   - un sitio cuyo nombre empieza con `_` → se salta.
   Si el script no permite apuntar a otro directorio, agrega un parámetro opcional mínimo (por
   ejemplo una variable de entorno con la raíz de `sites/`), sin cambiar el comportamiento por
   defecto.
3. Agrega la prueba a `npm run check` o a un job de CI existente, lo que cambie menos.

## Restricciones

- Solo `scripts/check-production-config*.mjs`, `package.json` (si hace falta un script) o
  `.github/workflows/ci.yml` (un paso), tu reporte, `BITACORA.md` y `BACKLOG.md`.
- `git fetch` al empezar; `git push origin main` al terminar.

## Criterio de aceptación

- [ ] Salida completa de la prueba nueva, en verde, pegada en el reporte.
- [ ] Salida del gate contra `stuart-homeowners`, igual que hoy (brand/seo Demo, GA4, GTM, CRM).
- [ ] CI verde (link).
- [ ] **Reporte, bitácora al inicio y avance al final de W-103.** Este prompt es chico a
      propósito: no hay razón para entregarlo sin esos tres archivos. Si faltan, se devuelve.

## Commit message

```
fix(gate): catch (NPA) 555-01xx and dotted fictional phones; add gate tests
```
