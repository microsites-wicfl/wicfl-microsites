import assert from "node:assert/strict";
import test from "node:test";
import { ICONS } from "../../../packages/config-schema/icons.mjs";
import { renderMarkdown } from "../public/markdown.js";
import { text } from "../public/strings.js";
import { validateBlocks } from "../src/blocks.js";

const two = "Intro\n\n:::columns\nLeft\n:::next\nRight\n:::\n\nAfter";

test("valid column blocks pass", () => {
  assert.doesNotThrow(() => validateBlocks(two));
  assert.doesNotThrow(() => validateBlocks(":::columns\nA\n:::next\nB\n:::next\nC\n:::  "));
  assert.doesNotThrow(() => validateBlocks("```\n:::columns\n```\nNo block here."));
});

test("broken blocks say which line to fix, all of them at once", () => {
  assert.throws(() => validateBlocks("Text\n:::columns\nA\n:::next\nB"), /Line 2: a :::columns block is not closed/);
  assert.throws(() => validateBlocks(":::columns\nOnly one\n:::"), /Line 1: .*needs 2 or 3 columns, found 1/);
  assert.throws(() => validateBlocks("A\n:::next\nB"), /Line 2: :::next appears outside/);
  assert.throws(() => validateBlocks("A\n:::"), /Line 2: ::: appears outside a block/);
  assert.throws(() => validateBlocks("# Title outside a hero"), /Line 1: # H1 is only allowed inside a :::hero/);
  const twoProblems = "Text\n\n:::features\n:::item\nicon: nope\n### A\nx\n:::item\nicon: sun\n### B\ny\n:::\n\n:::";
  assert.throws(
    () => validateBlocks(twoProblems),
    (error) => /Line 5: unknown icon "nope"/.test(error.message) && /Line 14: ::: appears outside/.test(error.message),
  );
});

test("a body that opens with a --- rule keeps its line numbers", () => {
  assert.throws(() => validateBlocks("---\nText\n:::next"), /Line 3: :::next appears outside/);
});

test("every section button inserts a block the site accepts", () => {
  for (const [kind, lines] of Object.entries(text.blockSamples)) {
    assert.doesNotThrow(() => validateBlocks(lines.join("\n")), `the ${kind} sample must be valid`);
  }
});

test("the live preview shows columns side by side, in order", () => {
  const html = renderMarkdown(two);
  const expected = [
    "<p>Intro</p>",
    '<div class="columns columns-2"><div class="column"><p>Left</p></div><div class="column"><p>Right</p></div></div>',
    "<p>After</p>",
  ].join("\n");
  assert.equal(html, expected);
});

test("an image alone in a column is marked as the image column", () => {
  const html = renderMarkdown(":::columns\n![Roof](/images/roof.jpg)\n:::next\nText\n:::");
  assert.match(html, /<div class="column column-image"><p><img alt="Roof" src="\/images\/roof.jpg"><\/p><\/div>/);
});

test("the live preview draws hero, icon rows and cards; settings lines are not shown as text", () => {
  const hero = renderMarkdown(text.blockSamples.hero.join("\n"), (url) => `/api/x${url}`);
  assert.match(hero, /<section class="pv-block pv-hero"><img class="pv-hero-image" alt="" src="\/api\/x\/images\//);
  assert.match(hero, /<p class="pv-eyebrow">Short label above the title<\/p>/);
  assert.doesNotMatch(hero, /eyebrow:/);

  const dark = renderMarkdown(text.blockSamples["features-dark"].join("\n"), undefined, ICONS);
  assert.match(dark, /pv-features pv-dark/);
  assert.match(dark, /pv-items-3/);
  assert.match(dark, /<span class="pv-icon"><svg/);
  assert.doesNotMatch(dark, /icon:/);

  const unknownIcon = renderMarkdown(":::features\n:::item\nicon: nope\n### A\n:::", undefined, ICONS);
  assert.match(unknownIcon, /pv-icon-unknown">nope\?/);

  const cards = renderMarkdown(text.blockSamples.cards.join("\n"));
  assert.match(cards, /pv-cards/);
  assert.equal((cards.match(/class="pv-item"/g) || []).length, 3);
});

test("a block the preview has no drawing for still shows, labeled", () => {
  const html = renderMarkdown(":::faq\n:::item\n### Question?\nAnswer.\n:::");
  assert.match(html, /pv-other"><span class="pv-label">faq<\/span>/);
  assert.match(html, /Question\?/);
});

test("text in blocks stays escaped", () => {
  assert.doesNotMatch(renderMarkdown(":::columns\n<script>x</script>\n:::next\nB\n:::"), /<script>/);
  assert.doesNotMatch(renderMarkdown(":::hero\neyebrow: <b>x</b>\n# T\n:::"), /<b>x<\/b>/);
  assert.doesNotMatch(renderMarkdown(":::cards\n:::item\n<img src=x onerror=y>\n:::"), /<img src=x/);
});
