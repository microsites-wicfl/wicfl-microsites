# W-107 real markdown pipeline and W-021 template advance

## Qué se hizo

- Corrected the contact surfaces: visible phone text now uses `contact.displayPhone`, while each `tel:` link uses the E.164 `contact.trackingPhone`.
- Rendered the complete configured address in the footer, alongside the required license and contact phone on every page.
- Replaced the handwritten markdown renderer with Astro's content collection and glob loader. The collection reads the external `sites/<slug>/content/` directory through `WICFL_SITE_CONTENT` converted to a file URL.
- Added mandatory markdown frontmatter: `title`, optional `description`, and `pageType` (`home`, `content`, or `coverage`). A missing or invalid field fails the Astro content sync instead of relying on a fragile first heading.
- Added the shared, no-JavaScript design system: responsive layout, tokens, keyboard focus, mobile phone CTA, NAP/compliance footer, and the three config-only variants (`coastal`, `civic`, `warm`). `theme.accentColor` is emitted as `--site-accent`; no site CSS or component override exists.
- Expanded `_example` with clearly marked disposable markdown coverage for headings, nested hierarchy, unordered and ordered lists, links, bold, italics, quote, code block, and table. Added a disposable `coverage` page type.

## Decisiones de diseño

Astro content collections use `glob({ base: pathToFileURL(WICFL_SITE_CONTENT), pattern: "**/*.md" })`. This keeps each site's markdown outside the template while preserving Astro's parsing, rendering, and schema validation. Frontmatter is mandatory so page metadata and page type are explicit operator inputs; markdown body remains the operator's only content surface.

The visual system uses restrained serif typography, structural borders, clear spacing, and a prominent but non-invasive phone action. It avoids gradients, floating cards, and decorative icons. `coastal`, `civic`, and `warm` vary only the shared surface token; accent color comes only from config. No JavaScript was added or needed.

## Verificación

`npm run check` passed with all three configs valid. `npm run build:site -- _example` passed and built `/`, `/about-fixture/`, and `/coverage-fixture/`.

Generated HTML contained `Example Flood Insurance`, `123 Placeholder Avenue`, visible `(772) 000-0000`, `href="tel:+17720000000"`, and `PLACEHOLDER-FL-LICENSE`. It rendered `<ul>`, `<ol>`, `<strong>`, `<em>`, `<blockquote>`, `<table>`, and `<pre><code>` from the fixture. A search for `<script` in `dist/sites/_example` returned no output.

For the config-only variation proof, the fixture was temporarily changed to `theme.variant: civic` and `theme.accentColor: #7A3E00`. The rebuilt HTML contained `class="variant-civic page-home"` and `--site-accent: #7A3E00`; the config was restored to `coastal/#006D77` before the final successful build. `git diff --check` passed.

## Tensiones que encontraste

Astro's `glob` loader requires a `file:` URL, not a Windows filesystem string. Converting the environment-provided external content path with `pathToFileURL` preserves the generator boundary without copying content into the template.

## Lo que tocaste fuera de lo pedido

Nothing outside the shared template, the disposable `_example` fixture, this report, BITACORA, and the two named backlog entries.

## Lo que no pudiste verificar

The remote CI run identifier was not available during this local execution. The optional product-page completeness and accent contrast build checks were not implemented.

## Dónde dudaste

Whether to close W-021: it remains open because its existing `astro check` restoration note is not resolved by this prompt. W-107 is complete.

## Qué te sorprendió del repo

The initial Astro glob loader failure on Windows was specific to base-path URL handling; the main build boundary itself was already clean and reusable.

## Lo que no se hizo

The two optional checks were deferred to keep the completed template and markdown migration focused: the build does not yet fail when a declared product lacks a coverage markdown page, and it does not yet enforce accent contrast. No JavaScript was added.

## Preguntas para Pavel

- Confirm that the frontmatter fields `title`, `description`, and `pageType` are clear enough for the writing workflow.
- Confirm that the three page types cover the first pilot's information architecture before writing begins.

## Próximos pasos sugeridos

Cowork should review the generated HTML and determine whether to create follow-up work for the two optional build checks and the outstanding `astro check` restoration in W-021.

## Commits

- `8e4a277 feat(template): real markdown pipeline and design system`
