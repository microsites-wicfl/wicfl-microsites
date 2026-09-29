# 2026-09-29_025 — Header: que el menú de escritorio quepa, y el logo del footer (W-121, parte 1b)

**Backlog:** W-121
**Reporte esperado:** `reports/2026-09-29_025_header-menu-cabe.md`

## Contexto

El prompt 024 (`8e5bab0`) hizo el header y el footer nuevos. Cowork lo revisó (ver la sección
"Revisión de cowork" en `reports/2026-09-29_024_header-footer-botones.md`) y encontró dos cosas.

**1. El menú no cabe en escritorio.**

- En un build de `8e5bab0`, a 1024, 1280, 1440 y 1920 px, los links se parten en 2 y 3
  renglones:
  - "Difficult / to / Insure"
  - "High- / Value / Homes"
  - "After a / Non- / Renewal"
- El header mide 88 px.
- Stuart tiene Home más 8 páginas en el menú, y el `.shell` limita el ancho aunque la ventana
  sea más grande.
- Cada sitio tendrá un número distinto de páginas, así que un solo breakpoint fijo no lo
  resuelve.

**2. `.footer-logo` repite el bug de W-132.**

- Usa `width:auto` con `max-height`, sin altura fija.
- Un SVG sin `width`/`height` (como el logo de Stuart) puede salir en 0 o deformado.

Además, las capturas del 024 muestran el logo roto (el texto alternativo) porque el servidor
local no sirvió `/logo.svg`. En el sitio publicado sí carga.

## Objetivo

1. **Los links del menú nunca se parten en varios renglones.** Ponles `white-space: nowrap`.

2. **El header pasa solo al modo compacto cuando el renglón completo no cabe**, a cualquier
   ancho. El modo compacto es el de celular que ya existe: logo, teléfono con ícono y botón de
   menú.
   - Un script inline chico, en el mismo que ya existe, mide si el renglón completo cabe
     (logo + menú + teléfono + botón). Usa `ResizeObserver` sobre el header.
   - El script agrega o quita una clase en el header, por ejemplo `is-compact`, que aplica las
     reglas de celular.
   - Mide sin provocar parpadeos: calcula el ancho natural del renglón una vez, en modo
     completo, y compáralo contra el disponible. No alternes clases en un ciclo.
   - Evita un bucle de medición. Por ejemplo, calcula el ancho natural una sola vez y vuelve a
     calcularlo solo si cambian las fuentes (`document.fonts.ready`).
   - Sin JS: se conserva la regla actual de `< 64rem`. Arriba de eso, el menú puede pasar a un
     segundo renglón completo con `flex-wrap`, pero sin partir las palabras de un link.

3. **`.footer-logo`:** `height: 3.5rem; width: auto; max-width: 220px; display: block;`, igual
   que el arreglo de W-132.

## Restricciones

- Solo `packages/template/src/layouts/BaseLayout.astro`, salvo que necesites una prueba.
- No toques contenido, `apps/studio/` ni el schema.
- Sin dependencias nuevas.
- No cambies el diseño del modo completo cuando sí cabe.

## Pasos

1. Implementa los puntos 1 a 3.

2. Tu servidor local tiene que servir los archivos de `public/` (`/logo.svg`). Antes de medir,
   confirma que `img.wordmark-logo` tiene `naturalWidth > 0`.

3. Stuart a 390, 1024, 1280, 1440 y 1920 px. Para cada ancho reporta:
   - el modo (completo o compacto);
   - la altura del header;
   - la altura máxima de un link del menú (debe ser la de un renglón);
   - `scrollWidth` contra `clientWidth`;
   - el tamaño y `naturalWidth` del logo.

4. Lo mismo con `_example` a 1024 y 1440.

5. En una copia temporal de Stuart con `brand.logoOnDark: "/logo.svg"`, sin commit, confirma
   que el logo del footer mide más de 0 y conserva su proporción.

6. Guarda capturas del header a esos anchos y del footer de la copia temporal en
   `_drafts/review-2026-09-29/025/`.
   - **Míralas antes de escribir el reporte.**
   - En el reporte, di en una línea por captura qué se ve.
   - Si algo no se ve bien, es un hallazgo aunque los números pasen.

7. `npm run check` y builds de Stuart y `_example`.

8. Haz commit y `git push origin main`. Esto también sube los commits de docs locales. Espera
   Publish site Workers y reporta el hash, el id del run y su resultado.

## Criterio de aceptación

- [ ] Ningún link del menú mide más de un renglón en ningún ancho.
- [ ] Stuart pasa a modo compacto cuando no cabe y a modo completo cuando cabe, con el cambio
      reportado por ancho.
- [ ] Sin scroll horizontal en ningún ancho.
- [ ] El logo carga en las capturas, con `naturalWidth > 0`.
- [ ] El logo del footer, en la copia temporal, mide más de 0 y conserva su proporción.
- [ ] Checks y Publish en verde.

## Formato del reporte

El de `prompts/TEMPLATE.md`, más la tabla por ancho y una línea por captura.

## Commit message

```
fix(template): collapse header nav when it does not fit; size footer logo (W-121 part 1b)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```
