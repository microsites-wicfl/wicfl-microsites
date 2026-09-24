import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown } from "../public/markdown.js";

test("renders the markdown the site pages use", () => {
  const html = renderMarkdown(
    [
      "## Coverage",
      "",
      "A **strong** and *soft* [link](/flood/).",
      "",
      "- one\n- two",
      "",
      "1. first",
      "",
      "> quote",
      "",
      "![Roof](/images/roof.jpg)",
    ].join("\n"),
    (url) => url.replace("/images/", "/api/sites/x/images/"),
  );
  assert.match(html, /<h2>Coverage<\/h2>/);
  assert.match(html, /<strong>strong<\/strong> and <em>soft<\/em> <a href="\/flood\/">link<\/a>/);
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(html, /<ol><li>first<\/li><\/ol>/);
  assert.match(html, /<blockquote>quote<\/blockquote>/);
  assert.match(html, /<img alt="Roof" src="\/api\/sites\/x\/images\/roof.jpg">/);
});

test("never lets raw HTML or script links through", () => {
  const html = renderMarkdown('<script>alert(1)</script> [x](javascript:alert(1)) <img src=x onerror="y">');
  assert.doesNotMatch(html, /<script|<img src=x|href="javascript/);
  assert.match(html, /&lt;script&gt;/);
});
