import assert from "node:assert/strict";
import test from "node:test";
import { validateColumns } from "../src/columns.js";
import { renderMarkdown } from "../public/markdown.js";

const two = "Intro\n\n:::columns\nLeft\n:::next\nRight\n:::\n\nAfter";

test("valid column blocks pass", () => {
  assert.doesNotThrow(() => validateColumns(two));
  assert.doesNotThrow(() => validateColumns(":::columns\nA\n:::next\nB\n:::next\nC\n:::  "));
  assert.doesNotThrow(() => validateColumns("```\n:::columns\n```\nNo block here."));
});

test("broken blocks say which line to fix", () => {
  assert.throws(() => validateColumns("Text\n:::columns\nA\n:::next\nB"), /starts on line 2 is never closed/);
  assert.throws(() => validateColumns(":::columns\nOnly one\n:::"), /has 1 column\. Use 2 or 3/);
  assert.throws(() => validateColumns(":::columns\nA\n:::next\nB\n:::next\nC\n:::next\nD\n:::"), /has 4 columns/);
  assert.throws(() => validateColumns("A\n:::next\nB"), /Line 2: :::next is outside/);
  assert.throws(() => validateColumns("A\n:::"), /Line 2: ::: closes/);
  assert.throws(
    () => validateColumns(":::columns\nA\n:::columns\nB\n:::next\nC\n:::"),
    /Line 3: a columns block starts inside/,
  );
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

test("text in columns stays escaped", () => {
  const html = renderMarkdown(":::columns\n<script>x</script>\n:::next\nB\n:::");
  assert.doesNotMatch(html, /<script>/);
});
