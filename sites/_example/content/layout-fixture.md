---
title: Layout fixture
description: Disposable page that exercises shared Markdown column layouts.
pageType: content
showInNav: false
---

## Image with text

Outside a column: "fixture quotes", ~~obsolete copy~~, https://example.com, and this table remains ordinary Markdown.

| Fixture field | Placeholder value |
| --- | --- |
| Outside table | Preserved by the shared parser |

:::columns

![Example WICFL logo](/images/wags-logo-big.png)

:::next

**A visual companion.** This text column is vertically centered beside the image and supports ordinary [Markdown links](/about-fixture/).

Inside a column: "fixture quotes", ~~obsolete copy~~, and https://example.com.

| Column field | Placeholder value |
| --- | --- |
| Inside table | GFM survives reparsing |

:::

## Two text columns

:::columns

**First column.** Paragraphs, lists and emphasis work normally.

- One
- Two

:::next

**Second column.** The same block can carry another independent piece of Markdown.

:::

## Three text columns

:::columns

**One.** A first short explanation.

:::next

**Two.** A second short explanation.

:::next

**Three.** A third short explanation.

:::

## No blank lines around markers

:::columns
**First.** The markers do not require blank lines.
:::next
**Second.** The output stays in source order on narrow screens.
:::
