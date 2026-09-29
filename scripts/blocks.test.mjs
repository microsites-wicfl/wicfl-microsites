import assert from "node:assert/strict";
import test from "node:test";
import { blockProblems } from "../packages/config-schema/blocks.mjs";

const hero = `:::hero
eyebrow: Local
![Background](/hero.jpg)
# A page title
## Subtitle
Paragraph.
:::`;

const features = `:::features dark
eyebrow: Helpful
## Heading
:::item
icon: house
### First
Text.
:::item
icon: wind
### Second
Text.
:::`;

const cards = `:::cards
:::item
![One](/one.jpg)
### First
Text [Read more](/one/).
:::item
![Two](/two.jpg)
### Second
Text [Read more](/two/).
:::`;

const faq = `:::faq
eyebrow: Answers
## Questions
[View all questions](/faq/)
:::item
### First question?
First answer.
:::item
### Second question?
Second answer.
:::`;

const cta = `:::cta
eyebrow: Ready
![Background](/cta.jpg)
## Get a quote

Some copy.

**[Get a quote](/contact/)**

Quick. Easy. No obligation.
:::`;

const areas = `:::areas
eyebrow: Where
## Service area
:::`;

function messages(markdown) {
  return blockProblems(markdown).map((problem) => problem.message).join("\n");
}

test("accepts every supported block", () => {
  const columns = ":::columns\nFirst\n:::next\nSecond\n:::";
  assert.equal(blockProblems(`${hero}\n${features}\n${cards}\n${columns}\n${faq}\n${cta}\n${areas}`).length, 0);
});

test("hero must be first, unique, and contain one image and H1", () => {
  assert.match(messages(`Text\n${hero}`), /first body content/);
  assert.match(messages(`${hero}\n${hero}`), /only one/);
  assert.match(messages(":::hero\n# Title\n:::"), /image-only paragraph/);
  assert.match(messages(":::hero\n![Image](/one.jpg)\n:::"), /exactly one # H1/);
});

test("features require a valid icon, title, and two to four items", () => {
  assert.match(messages(":::features\n:::item\n### One\nText\n:::item\nicon: house\n### Two\nText\n:::"), /needs an icon/);
  assert.match(messages(features.replace("icon: house", "icon: unknown")), /unknown icon.*map-pin/);
  assert.match(messages(features.replace("### First", "First")), /one ### title/);
  assert.match(messages(":::features\n:::item\nicon: house\n### One\n:::"), /needs 2 to 4/);
});

test("cards require an image, title, link, and two to four items", () => {
  assert.match(messages(cards.replace("![One](/one.jpg)\n", "")), /image-only paragraph/);
  assert.match(messages(cards.replace("### First", "First")), /one ### title/);
  assert.match(messages(cards.replaceAll(/\[Read more\]\([^)]*\)/g, "plain text")), /needs a link/);
  assert.match(messages(":::cards\n:::item\n![One](/one.jpg)\n### One\n[Link](/)\n:::"), /needs 2 to 4/);
});

test("faq needs 2 to 12 items, one ### question and an answer per item", () => {
  assert.equal(blockProblems(faq).length, 0);
  assert.match(messages(":::faq\n:::item\n### Only one\nAnswer.\n:::"), /needs 2 to 12/);
  assert.match(messages(faq.replace("### First question?", "First question?")), /one ### question/);
  assert.match(messages(faq.replace("First answer.", "")), /at least one paragraph answer/);
});

test("cta needs exactly one H2, at most one image, and exactly one button", () => {
  assert.equal(blockProblems(cta).length, 0);
  assert.match(messages(cta.replace("## Get a quote", "Get a quote")), /exactly one ## H2/);
  assert.match(messages(cta.replace("## Get a quote", "## Get a quote\n## Twice")), /exactly one ## H2/);
  const twoImages = cta.replace("![Background](/cta.jpg)\n", "![Background](/cta.jpg)\n\n![Second](/cta2.jpg)\n");
  assert.match(messages(twoImages), /at most one background image/);
  assert.match(messages(cta.replace("**[Get a quote](/contact/)**", "Get a quote")), /needs exactly one button/);
});

test("areas only accepts an optional eyebrow and H2", () => {
  assert.equal(blockProblems(areas).length, 0);
  assert.equal(blockProblems(":::areas\n:::").length, 0);
  assert.match(messages(":::areas\n## Service area\nExtra text\n:::"), /Site settings/);
  assert.match(messages(":::areas\n[A link](/somewhere/)\n:::"), /Site settings/);
});

test("reports bad markers, nesting, separators, options, and settings", () => {
  assert.match(messages(":::unknown\n:::"), /unknown block/);
  assert.match(messages(":::features light\n:::"), /unknown option/);
  assert.match(messages(":::next"), /outside its matching block/);
  assert.match(messages(":::columns\n:::item\n:::"), /outside its matching block/);
  assert.match(messages(":::columns\n:::hero\n:::"), /cannot be nested/);
  assert.match(messages(":::cards\neyebrow: No\n:::item\nicon: house\n:::"), /icon: does not apply/);
  assert.match(messages(":::features\n:::item\neyebrow: No\nicon: house\n### One\n:::item\nicon: wind\n### Two\n:::"), /eyebrow: does not apply/);
  assert.match(messages(":::features\n:::item\n### One\nicon: house\n:::item\nicon: wind\n### Two\n:::"), /must appear at the start/);
});

test("keeps columns validation and rejects H1 outside hero", () => {
  assert.equal(blockProblems(":::columns\nOne\n:::next\nTwo\n:::").length, 0);
  assert.match(messages(":::columns\nOne\n:::"), /needs 2 or 3/);
  assert.match(messages("# Outside\nParagraph"), /only allowed inside a :::hero/);
});

test("ignores markers and H1 inside fenced code", () => {
  const markdown = "```md\n:::unknown\n# Not a title\n:::next\n```\nParagraph";
  assert.equal(blockProblems(markdown).length, 0);
});

test("returns line numbers from the complete file", () => {
  const markdown = "---\ntitle: Test\n---\n\n:::features\n:::item\nicon: nope\n### One\n:::item\nicon: wind\n### Two\n:::";
  const problem = blockProblems(markdown).find((entry) => entry.message.includes("unknown icon"));
  assert.equal(problem.line, 7);
  assert.match(problem.message, /^Line 7:/);
});
