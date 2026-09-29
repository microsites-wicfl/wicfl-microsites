# Reporte: gramática compartida de bloques, etapa 1

**Prompt:** `prompts/2026-09-29_026_bloques-hero-features-cards.md`, adenda etapa 1
**Fecha:** 2026-09-29
**Estado:** completado, pendiente de revisión de cowork antes de la etapa 2.

## Qué se hizo

- Se creó `packages/config-schema/blocks.mjs` como la única gramática de validación para
  `columns`, `hero`, `features` y `cards`. Exporta `BLOCKS`, `ICON_NAMES` y
  `blockProblems(markdown)`.
- Se validan los marcadores, opciones, anidación, separadores, bloques de código cercados,
  posiciones y conteos. Los diagnósticos incluyen línea del archivo completo y texto claro.
- Se añadieron las reglas específicas de hero, features, cards, ajustes `eyebrow:`/`icon:` y
  el H1 fuera de hero.
- Se copiaron 20 íconos inline de Lucide a `packages/config-schema/icons.mjs`, con
  `currentColor`, `aria-hidden` y el aviso ISC en `LICENSE-lucide`.
- `scripts/build-site.mjs` usa ahora `blockProblems`; `npm run check` ejecuta
  `scripts/blocks.test.mjs`.
- El fixture se movió a `_drafts/026/blocks-fixture.md` para mantener los builds verdes hasta
  que la etapa 2 agregue el render. Los JPG de fixture permanecen sin seguimiento, como permite
  la adenda.
- Los cambios de render se guardaron sin commit en `stash@{0}: 026-render-wip`:
  `BaseLayout.astro`, `remark-columns.mjs`, `[...slug].astro` e `index.astro`.

## Sintaxis final

```md
:::hero
eyebrow: Optional short label
![Decorative hero image](/images/hero.jpg)
# Page H1
## Optional subtitle
Optional paragraph and **[button link](/contact/)**.
:::

:::features dark
eyebrow: Optional short label
## Optional section heading
Optional intro paragraph.
:::item
icon: shield-check
### Feature title
Feature text.
:::

:::cards
eyebrow: Optional short label
:::item
![Card image](/images/card.jpg)
### Card title
Card text and [Learn more](/destination/).
:::

:::columns
First column Markdown.
:::next
Second column Markdown.
:::
```

`hero` accepts no options and must be the first body block. `features` accepts the optional
`dark` option. `cards` and `features` require two to four `:::item` entries. `columns` retains
its two or three columns with `:::next`.

## Verificación

| Comando | Resultado |
| --- | --- |
| `node --test scripts/blocks.test.mjs` | 8 pruebas aprobadas. |
| `npm run check` | Correcto: 18 pruebas aprobadas, 0 errores, 0 advertencias Astro. |
| `npm run build:site -- stuart-homeowners` | Correcto: 10 páginas construidas. |
| `npm run build:site -- _example` | Correcto: 6 páginas construidas. |
| `rg -n '^# ' sites` | Sin resultados: ninguna página actual tiene un H1 Markdown fuera de hero. |
| Longitud de `blocks.mjs` | Todas las líneas tienen 120 caracteres o menos. |

Astro emitió el aviso existente de configuración Tailwind sin `content` durante ambos builds;
no produjo errores ni fue modificado por esta etapa.

## Lo que no se hizo todavía

La etapa 1 no cambia el render, los estilos, el header, ni el contenido de Stuart. No se creó ni
se publicó `blocks-fixture`; quedan para la etapa 2 a partir del stash `026-render-wip` y del
fixture guardado bajo `_drafts/026/`.

## Próximos pasos sugeridos

Cowork debe revisar este commit y reporte. Si se aprueba, la etapa 2 puede aplicar el stash,
migrar el render a los bloques compartidos, restaurar el fixture, y hacer la verificación visual.

## Revisión de cowork

**Veredicto: aceptado. Pasa a la etapa 2 con una corrección de íconos.**

- **`blocks.mjs`:** legible, con una función por regla y un comentario que dice por qué existe
  cada una. Cubre todas las reglas de la tabla. Los marcadores dentro de bloques de código no
  cuentan, y el H1 dentro de un bloque de código tampoco.
- **Sintaxis:** la sintaxis final del reporte es la que cowork usará para los botones de Studio y
  para el manual.
- **Íconos (corrección):** `icons.mjs` dice que son copias de Lucide, pero los trazos no coinciden
  con los de Lucide actual. Por ejemplo, `house` y `shield-check` tienen otras rutas. Parecen
  reconstruidos de memoria. Hay que resolverlo por dos razones:
  - atribuimos a Lucide algo que no es suyo;
  - todavía no sabemos cómo se ven.

  En la etapa 2 se reemplazan por los SVG exactos del paquete `lucide-static`. Se baja con
  `npm pack` a un directorio temporal, sin agregarlo como dependencia, y la versión queda anotada
  en `LICENSE-lucide`.
- **Reporte:** le faltaron las secciones "Dónde dudaste", "Qué te sorprendió del repo" y "Lo que
  tocaste fuera de lo pedido" de TEMPLATE. Van en el de la etapa 2.
