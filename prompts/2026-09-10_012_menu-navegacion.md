# 2026-09-10_012 — Menú de navegación real en el header (W-116)

**Backlog:** W-116
**Fase:** 2, Bloque B (no bloquea el 18-sep de forma dura, sí importa para el 9-oct: un
sitio real de cara al público sin navegación es un hueco de UX/SEO notorio)
**Reporte esperado:** `reports/2026-09-10_012_menu-navegacion.md`

## Contexto

`packages/template/src/layouts/BaseLayout.astro` es el layout compartido por todos los sitios.
Su `<header class="site-header">` hoy solo renderiza el wordmark/logo (enlazado a `/`), la
ciudad y el teléfono — cero lista de links a las demás páginas del sitio. Cada página solo es
alcanzable por URL directa o por los links sueltos que el propio contenido markdown pone entre
párrafos. No es una decisión documentada en `docs/ARCHITECTURE.md` ni en ningún otro doc, es un
hueco real que nadie construyó.

**Decisión de diseño ya tomada, no la reabras:** un nav plano (sin dropdown, sin JavaScript),
porque a la escala de un sitio piloto (7-8 páginas de contenido) un dropdown es complejidad sin
beneficio, y el proyecto ya declara explícitamente "Zero JavaScript by default" como principio
de rendimiento (ver `docs/master-file-source.html`, sección Architecture). Cualquier menú con
JS (toggle de hamburguesa, dropdown animado) rompe ese principio y no se pide aquí.

Las páginas viven en la content collection `pages` (`packages/template/src/content.config.ts`),
una por archivo markdown en `sites/<slug>/content/`. Cada una trae frontmatter `title`,
`description` y `pageType` (`"home" | "content" | "coverage"`, ver
`packages/config-schema/site.config.schema.json`... en realidad el enum vive en la interfaz
`Props` de `BaseLayout.astro` y en el `content.config.ts` de la collection, revísalo ahí).
`site-data.mjs` ya expone `routeForPageId(id)` para calcular la ruta real de cualquier página,
con el prefijo de idioma correcto para locales alternativos (W-022) — úsalo, no reinventes el
cálculo de rutas.

**El problema real que hay que resolver, no solo cosmético:** los títulos de página son
oraciones largas pensadas para `<title>` y SEO ("High-Value Home Insurance in Stuart, FL"), no
para un link de nav. Usarlos tal cual en el header se ve mal con 7 páginas. Al mismo tiempo, el
operador (Pavel) **nunca toca el template**, solo config y markdown — así que el nav no puede
ser una lista hardcodeada en `BaseLayout.astro` que alguien tiene que recordar actualizar a mano
cada vez que Pavel agrega o quita una página. Tiene que salir de la misma content collection,
igual que el resto del sitio.

## Objetivo

Cuando termines: el `<header>` de cualquier sitio construido con este template muestra un menú
de navegación horizontal, sin JavaScript, generado automáticamente a partir de las páginas
reales del sitio (nunca hardcodeado por sitio), con textos de link cortos y legibles aunque el
`title` de la página sea largo, y que se sigue viendo bien en mobile.

## Restricciones

- **Sin JavaScript.** CSS puro. Nada de toggle de menú hamburguesa con `<script>`; si hace
  falta un patrón mobile, resuélvelo con el mismo enfoque que ya usa `.header-content` (flex que
  envuelve/apila por media query), no con JS.
- **No hardcodees la lista de páginas por sitio.** El nav se arma iterando la content
  collection `pages` (mismo patrón que ya usan `index.astro`/`[...slug].astro` con
  `getCollection("pages")`), excluyendo la página `pageType: "home"` (esa ya está enlazada por
  el logo). Un sitio nuevo con otras páginas debe tener su nav correcto sin tocar el template.
- **No toques la línea que arregló W-115** (`main .page-content { max-width: 46rem; }`) ni el
  resto del `<style is:global>` fuera de lo necesario para el nav nuevo.
- **No agregues dependencias npm nuevas.**
- Sigue las reglas de `CLAUDE.md` y de la guía global (`prompts/00_GUIA_GLOBAL.md`) para
  reportar, cerrar el item y actualizar `BITACORA.md`/`BACKLOG.md`.

## Pasos

1. Lee `BaseLayout.astro`, `content.config.ts`, `site-data.mjs`, `index.astro` y
   `[...slug].astro` completos antes de tocar nada.
2. Resuelve el problema de los textos largos agregando un campo opcional `navLabel` al
   frontmatter de la content collection `pages` (por ejemplo, en `content.config.ts` como
   `navLabel: z.string().optional()`). Cuando una página no lo defina, el nav usa su `title`
   completo como fallback — no rompas los sitios/páginas existentes que todavía no lo tengan.
3. En `sites/stuart-homeowners/content/`, agrega `navLabel` corto a cada página real que hoy
   tiene `pageType: "content"` o `"coverage"` (no a `index.md`, esa es `pageType: "home"` y no
   entra al nav). Ejemplos razonables, ajústalos si el contenido real sugiere algo mejor:
   `flood-insurance.md` → "Flood Insurance", `waterfront-home-insurance.md` → "Waterfront",
   `coastal-home-insurance.md` → "Coastal", `high-value-home-insurance.md` → "High-Value Homes",
   `difficult-to-insure-homes.md` → "Difficult to Insure", `home-insurance-after-nonrenewal.md`
   → "After a Non-Renewal", `contact.md` → "Contact". Dos páginas de fixture, `about-demo.md` y
   `coverage-demo.md`, existen en esa misma carpeta pero no forman parte de las 8 páginas reales
   del sitio (revisa si son basura de una demo anterior o si algo las usa antes de tocarlas; si
   no se usan en ningún lado, anótalo en el reporte, no las borres sin más como parte de este
   prompt).
4. Agrega el nav a `BaseLayout.astro`: dentro de `<header class="site-header">`, une la
   collection completa (`getCollection("pages")`), filtra `pageType !== "home"`, ordena de forma
   determinística (alfabético por `id` es suficiente, no hace falta un campo de orden nuevo), y
   renderiza un `<nav>` con un `<a>` por página, `href={routeForPageId(page.id)}`, texto
   `page.data.navLabel ?? page.data.title`.
5. Dale estilo en el mismo `<style is:global>`: legible, con separación clara entre links,
   sin romper el `sticky` del header ni el layout existente de `.header-content`. En la media
   query de `@media (max-width: 42rem)` que ya existe, decide cómo se comporta el nav en mobile
   (envolver en varias líneas es aceptable; no ocultar páginas).
6. Marca el link correspondiente a la página actual (compara `Astro.url.pathname` contra la ruta
   de cada link) con un estado visual distinto (por ejemplo `aria-current="page"` más un estilo
   asociado), para que el visitante sepa dónde está.
7. Construye `stuart-homeowners` y revisa el HTML/CSS generado de al menos dos páginas
   distintas: que el nav aparezca completo, con los 7 links reales, ninguno roto, y que la
   página `home` no se liste a sí misma.
8. Corre `npm run check` (o `npm run check` más lo que haya dejado el prompt de W-021 si ya
   corrió antes que este) y confirma que sigue en verde.

## Criterio de aceptación

- [ ] El `<header>` de una página construida de `stuart-homeowners` trae un `<nav>` con exactamente
      7 links (las páginas reales, sin la home), cada uno con `href` correcto y texto corto
      (`navLabel` o `title` como fallback).
- [ ] Ningún link del nav apunta a `/` de forma redundante (la home solo se alcanza por el logo).
- [ ] El link de la página actual trae `aria-current="page"` (o equivalente) y se distingue
      visualmente de los demás.
- [ ] El nav se ve razonable en el viewport mobile ya cubierto por la media query existente
      (`max-width: 42rem`): no se corta, no se superpone con el teléfono/ciudad.
- [ ] Cero JavaScript agregado. El nav funciona con CSS puro.
- [ ] Un sitio o página nueva sin `navLabel` en su frontmatter sigue construyendo y aparece en
      el nav usando su `title` completo, sin romper nada.
- [ ] No se tocó la línea de W-115 en `BaseLayout.astro`.
- [ ] `npm run check` sigue en verde.

## Formato del reporte

Escribe `reports/2026-09-10_012_menu-navegacion.md` con:

- **Qué se hizo** — lista de cambios concretos
- **Decisiones tomadas** — cualquier bifurcación que resolviste y por qué, en particular qué
  hiciste con `about-demo.md`/`coverage-demo.md` si te los encontraste en el camino
- **Verificación** — cómo comprobaste que funciona, con output real
- **Lo que tocaste fuera de lo pedido** — cualquier archivo que cambiaste y que el prompt no
  te pidió cambiar, con la razón. Si no hubo, dilo explícitamente
- **Lo que no pudiste verificar** — cosas que hiciste pero no lograste comprobar
- **Dónde dudaste** — cada punto donde el prompt era ambiguo y tuviste que elegir
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos**
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
feat(nav): add a config-driven navigation menu to the shared header

Closes W-116
```
