# 2026-09-29_024 — Header y footer nuevos, ligas como botón y orden del menú (W-121, parte 1)

**Backlog:** W-121
**Reporte esperado:** `reports/2026-09-29_024_header-footer-botones.md`

## Contexto

Pavel entregó el diseño de la página de inicio (W-121). Se construye en tres partes:

1. **Esta:** lo que es igual en todas las páginas (header, footer), botones y orden del menú.
2. Un sistema de bloques cerrados dentro del `.md` (`:::hero`, `:::features`, `:::cards`),
   con la misma idea que `:::columns`.
3. Más bloques (`:::faq`, `:::cta`, `:::areas`).

Studio lo hace cowork, no este prompt.

Hoy:

- El header tiene logo, "Ciudad, ST", teléfono y el menú en otro renglón.
- En celular el menú se parte en 3 renglones y el header ocupa casi media pantalla.
- El menú se ordena por id (alfabético) y no hay forma de controlar el orden.
- El footer solo trae marca, contacto y licencia.

El logo acaba de arreglarse en `83778b5` (W-132): no rompas eso.

## Objetivo

### 1. Orden del menú

- Agrega a la colección `pages` el campo opcional `navOrder` (entero >= 0), en
  `packages/template/src/content.config.ts`.
- Las páginas del menú se ordenan por `navOrder` ascendente y luego por id. Las que no lo
  tienen van después de las que sí.
- El menú empieza con una liga "Home" a `/`, con `aria-current` en la portada, y luego las
  páginas del menú.

### 2. Header en desktop (>= 64rem)

- Un solo renglón:
  - A la izquierda, el logo a 3.5rem de alto. Si no hay `brand.logo`, el wordmark de texto,
    como hoy.
  - En medio, las ligas del menú.
  - A la derecha, la liga de teléfono (ícono + `contact.displayPhone`, `tel:` a
    `contact.trackingPhone`) y un botón primario "Get a Quote" a `/contact/`.
- Se quita "Ciudad, ST" del header; pasa al footer.
- Si hoy el header es fijo (sticky), se queda así, pero más compacto.

### 3. Header en celular (< 64rem)

- Un renglón con:
  - el logo a 2.75rem;
  - una liga de teléfono solo con ícono (`aria-label` "Call {displayPhone}");
  - un botón de menú con `aria-expanded` y `aria-controls`.
- El botón abre un panel con las ligas apiladas y el botón "Get a Quote" a todo lo ancho.
  Escape y el mismo botón lo cierran.
- Mejora progresiva: sin JS el menú sigue siendo accesible. El script es el que agrega la
  clase que lo colapsa.
- Con el menú cerrado, el header mide 72px o menos a 390px de ancho. Sin scroll horizontal.

### 4. Footer

Oscuro, con `theme.footerColor` si existe, como hoy. En desktop va en 4 columnas y en celular
se apilan.

a. **Logo:** nuevo campo opcional `brand.logoOnDark` en el schema, con las mismas reglas que
   `brand.logo`. Si no existe, se muestra `brand.name` como texto. Nunca pongas el logo normal
   sobre el fondo oscuro.

b. **"Quick Links":** Home y las páginas del menú, en el mismo orden.

c. **"Service Areas":** `geo.serviceArea` como texto, **sin ligas**. El schema prohíbe páginas
   por localidad.

d. **"Contact":**
   - el teléfono como liga `tel:`;
   - el email como liga `mailto:`;
   - "{city}, {state}";
   - "Serving {county} County".

Renglón inferior:

- "© {año del build} {brand.name}. All rights reserved."
- Ligas a las páginas `privacy-policy`, `terms-of-use` y `disclaimer`, solo las que existan en
  el contenido (las crea W-131).
- La licencia y la dirección siguen condicionales, como hoy.

### 5. Ligas como botón

- Un párrafo cuyo único contenido es una liga en negritas (`**[Text](/path/)**`) se muestra
  como botón: fondo con el color de acento y color de texto de `textOnPrimary`, igual que el
  botón del header.
- Funciona también dentro de `:::columns`.
- El contenido de Stuart ya escribe así sus CTA, así que no hay que migrar nada.
- Agrega una prueba unitaria junto a `scripts/remark-columns.test.mjs`.

## Restricciones

- Solo template y schema. No toques `apps/studio/` ni el contenido de `sites/`.
- Sin dependencias nuevas.
- El único JS nuevo es el script chico del menú, inline y sin librerías.
- Mantén los checks de contraste de W-123 (`checkTheme`) y los tokens de tema existentes; no
  metas colores fijos que ignoren el tema.

## Pasos

1. Implementa los puntos 1 a 5.
2. Corre `npm run check`, el build de `stuart-homeowners` y el build de `_example`.
3. Construye también una copia temporal de Stuart sin `brand.logo`, para confirmar que el
   wordmark de texto sigue funcionando. No hagas commit de esa copia.
4. Mide a 1440px y a 390px:
   - que el logo se vea, con su tamaño;
   - la altura del header;
   - que el menú abra y cierre con mouse y con teclado;
   - que no haya scroll horizontal;
   - que el footer se lea.
5. Guarda capturas en `_drafts/review-2026-09-29/` (está en gitignore):
   - la portada de Stuart a 1440 y a 390, con el menú cerrado y abierto;
   - el footer.
6. Haz commit y `git push origin main`. Esto también sube el commit de docs local `45572b6`.
7. Espera Publish site Workers y reporta el hash, el id del run y su resultado.

## Criterio de aceptación

- [ ] Menú ordenado por `navOrder`, con Home primero.
- [ ] Header de un renglón en desktop, y de 72px o menos en celular con el menú cerrado.
- [ ] El menú de celular funciona con mouse, con teclado y sin JS.
- [ ] Footer de 4 columnas con los datos del config y las ligas legales condicionales.
- [ ] `**[Text](/path/)**` se ve como botón, con prueba unitaria.
- [ ] `npm run check` y los builds en verde; Publish site Workers en verde.
- [ ] Capturas guardadas en `_drafts/review-2026-09-29/`.

## Formato del reporte

El de `prompts/TEMPLATE.md`, más las medidas del paso 4 y las rutas de las capturas.

## Commit message

```
feat(template): new header, footer, button links and nav order (W-121 part 1)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBaoRL8uQWQ2D99CQnG7W1
```
