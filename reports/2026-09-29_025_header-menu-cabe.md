# Reporte: W-121 parte 1b

## Qué se hizo

- Se evitó que los enlaces del menú partan sus palabras con `white-space: nowrap`.
- El script inline ahora mide una vez el ancho natural del logo, menú, acciones y gaps; `ResizeObserver` alterna `is-compact` cuando ya no caben. Vuelve a medir únicamente cuando las fuentes terminan de cargar.
- El contenedor del header puede usar hasta 100rem, sin cambiar el ancho de los demás `.shell`, para que el modo completo aproveche el ancho disponible.
- Se aplicaron las reglas existentes de móvil también a `.is-compact` en cualquier viewport.
- `.footer-logo` usa ahora altura explícita de 3.5rem, ancho automático y máximo de 220px.

## Decisiones tomadas

- El modo compacto se fuerza por debajo de 64rem sin JavaScript, conservando la mejora progresiva existente. Por encima, JavaScript decide mediante el ancho natural, no por un breakpoint fijo.
- Para medir el menú sin ciclo, el script deja el modo completo solamente durante la lectura síncrona y restaura el estado antes de renderizar; el observador no vuelve a medir salvo al completar la carga de fuentes.

## Verificación

`npm run check` terminó con 10 pruebas aprobadas, 0 fallos y Astro con 0 errores, 0 warnings y 0 hints.

`npm run build:site -- stuart-homeowners` terminó correctamente con 10 páginas. `npm run build:site -- _example` terminó correctamente con 6 páginas.

El servidor local sirvió los assets copiados de `public/` con `image/svg+xml`. En todas las capturas `wordmark-logo.naturalWidth` fue mayor que cero.

Stuart, header cerrado. Para modos compactos, la altura de enlace se tomó al abrir el panel sin cambiar de modo.

| Viewport | Modo | Header cerrado | Máx. alto de enlace | scrollWidth/clientWidth | Logo renderizado | naturalWidth |
| --- | --- | ---: | ---: | --- | --- | ---: |
| 390 | compacto | 69 px | 36.78 px | 390 / 390 | 72.28 × 44 px | 246 |
| 1024 | compacto | 69 px | 36.78 px | 1024 / 1024 | 72.28 × 44 px | 246 |
| 1280 | compacto | 69 px | 36.78 px | 1280 / 1280 | 72.28 × 44 px | 246 |
| 1440 | completo | 88.19 px | 28.78 px | 1440 / 1440 | 92 × 56 px | 246 |
| 1920 | completo | 88.19 px | 28.78 px | 1920 / 1920 | 92 × 56 px | 246 |

_example:

| Viewport | Modo | Header cerrado | Máx. alto de enlace | scrollWidth/clientWidth | Logo renderizado | naturalWidth |
| --- | --- | ---: | ---: | --- | --- | ---: |
| 1024 | compacto | 69 px | 36.78 px | 1024 / 1024 | 220 × 44 px | 260 |
| 1440 | completo | 88.19 px | 28.78 px | 1440 / 1440 | 220 × 56 px | 260 |

Una copia temporal de Stuart con `brand.logoOnDark: "/logo.svg"` produjo un footer logo de 92 × 56 px, `naturalWidth` 246, `naturalHeight` 150 y proporciones 1.643 renderizada frente a 1.640 natural.

Capturas revisadas visualmente, todas bajo `_drafts/review-2026-09-29/025/`:

- `stuart-390-header.png`: header compacto, logo cargado, icono de llamada y menú en una sola fila.
- `stuart-1024-header.png`: header compacto sin salto de palabras ni scroll horizontal.
- `stuart-1280-header.png`: header compacto sin enlaces cortados.
- `stuart-1440-header.png`: header completo en una sola fila, con todos los enlaces, teléfono y CTA visibles.
- `stuart-1920-header.png`: header completo con espacio sobrante y sin cambios de diseño no deseados.
- `example-1024-header.png`: header compacto y logo de fixture cargado.
- `example-1440-header.png`: header completo y logo de fixture cargado.
- `stuart-footer.png`: footer de texto de Stuart legible en cuatro columnas.
- `stuart-footer-logo-temp.png`: logo temporal tiene tamaño correcto, pero el asset normal azul marino tiene contraste bajo sobre el footer oscuro.

## Lo que tocaste fuera de lo pedido

Nada. Solo se cambió `packages/template/src/layouts/BaseLayout.astro` y este reporte solicitado.

## Lo que no pudiste verificar

Nada. Publish site Workers terminó en verde para `851fd1d`: [run 36605937334](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/36605937334). Discover sites, Publish stuart-homeowners y Publish _example terminaron correctamente.

## Dónde dudaste

El prompt pide que el header responda al ancho disponible y también señala que `.shell` lo limita. Se amplió únicamente el `.shell` del header a 100rem, para que el cálculo refleje el espacio real de la barra sin afectar el ancho de contenido, main ni footer.

## Qué te sorprendió del repo

Los SVG de Stuart no traen atributos de tamaño, y el servidor local sin Content-Type de SVG hacía que Playwright expusiera `naturalWidth: 0`. El servidor de revisión se corrigió para servir `/logo.svg` como `image/svg+xml`; el build copiado sí contenía el archivo.

Los builds mantienen los warnings existentes de Astro por id `index` duplicado y de Tailwind por `content` vacío. No fueron modificados por este prompt.

## Lo que no se hizo

No se agregó ni cambió contenido, schema ni Studio. La copia de prueba de `logoOnDark` no se versionó y fue eliminada tras medirla.

## Próximos pasos sugeridos

- Cuando un sitio use `brand.logoOnDark`, proporcionar un asset diseñado para fondo oscuro. La prueba con el logo normal demuestra tamaño correcto, pero no constituye un asset de contraste adecuado.

## Commits

- `851fd1d` — `fix(template): collapse header nav when it does not fit; size footer logo (W-121 part 1b)`

## Revisión de cowork

**Veredicto: aceptado.**

- Revisé las capturas de 1440 y 1280 y el footer temporal:
  - 1440: completo en un renglón, sin palabras partidas.
  - 1280: compacto.
  - El logo carga en todas.
- La tabla por ancho y la descripción de cada captura resuelven el problema del reporte 024.
- Ampliar solo el `.shell` del header a 100rem fue una buena decisión.

**Pendientes (no bloquean):**

- **Directorios vacíos:** las copias temporales dejaron `sites/_draft_stuart_footer_logo/` y
  `sites/_draft_stuart_no_logo/` sin archivos. Git no los ve, pero `Discover sites` en local sí
  podría encontrarlos. Cowork los borró.
- **Botón "Get a Quote" en el modo compacto:** a 1024–1280 px, que son laptops comunes, el
  botón queda escondido dentro del menú. En modo compacto con 40rem o más de ancho debería
  seguir visible junto al teléfono. Va como agregado en el siguiente prompt.
- **Menú de Stuart:** a 1280 px Stuart ya cae en modo compacto porque tiene 8 ligas. El diseño
  de Pavel trae 6. Recortarlo es decisión de contenido de Pavel, con `navOrder` y
  `showInNav`.
- **Alineación a 1440:** el logo queda en x=20 y el contenido en x=176. Se revisa con el header
  del diseño de Pavel, que es de ancho completo.
