import assert from "node:assert/strict";
import test from "node:test";
import { composePage, pageRoute, parsePage } from "../src/pagefields.js";

const flood = [
  "---",
  'title: "Flood Insurance in Stuart, FL"',
  'description: "Explore flood insurance."',
  "pageType: coverage",
  'navLabel: "Flood Insurance"',
  "---",
  "",
  "Living in Stuart.",
  "",
].join("\n");

test("a real page reads as fields plus text", () => {
  assert.deepEqual(parsePage(flood), {
    fields: {
      title: "Flood Insurance in Stuart, FL",
      description: "Explore flood insurance.",
      navLabel: "Flood Insurance",
      showInNav: true,
      pageType: "coverage",
    },
    body: "Living in Stuart.\n",
  });
});

test("saving without changes rebuilds the exact same file, quoting and spacing included", () => {
  const samples = [
    flood,
    "---\ntitle: About this demo\ndescription: Explains.\npageType: content\nshowInNav: false\n---\n\nText\n",
    '---\n  title: "Coastal"\n  pageType: content\n  navLabel: "Coastal"\n---\n\n  Living near the coast.\n',
    "---\ntitle: Home\npageType: home\n---\nHello",
  ];
  for (const text of samples) {
    const { fields, body } = parsePage(text);
    assert.equal(composePage(text, fields, body), text);
  }
});

test("changed fields are written safely; other header lines stay", () => {
  const withExtra = flood.replace("pageType: coverage", "pageType: coverage\nlayout: wide");
  const { fields, body } = parsePage(withExtra);
  const out = composePage(withExtra, { ...fields, title: 'Say "hi": now', navLabel: "" }, body);
  assert.match(out, /^title: "Say \\"hi\\": now"$/m);
  assert.doesNotMatch(out, /navLabel/);
  assert.match(out, /^layout: wide$/m);
  assert.deepEqual(parsePage(out).fields.title, 'Say "hi": now');
});

test("hiding a page from the menu writes showInNav: false; showing it removes the line", () => {
  const { fields, body } = parsePage(flood);
  const hidden = composePage(flood, { ...fields, showInNav: false }, body);
  assert.match(hidden, /^showInNav: false$/m);
  const shown = composePage(hidden, { ...parsePage(hidden).fields, showInNav: true }, body);
  assert.doesNotMatch(shown, /showInNav/);
});

test("an indented header keeps its indentation for new lines", () => {
  const text = '---\n  title: "Coastal"\n  pageType: content\n---\n\nBody\n';
  const { fields, body } = parsePage(text);
  assert.match(composePage(text, { ...fields, navLabel: "Coast" }, body), /^ {2}navLabel: "Coast"$/m);
});

test("a missing title or an unknown page type is refused", () => {
  const { fields, body } = parsePage(flood);
  assert.throws(() => composePage(flood, { ...fields, title: "  " }, body), /needs a title/);
  assert.throws(() => composePage(flood, { ...fields, pageType: "blog" }, body), /page type/);
});

test("pages without a header, or with a field over several lines, fall back to raw text", () => {
  assert.equal(parsePage("Just text"), null);
  assert.equal(parsePage('---\ntitle: >\n  Folded\n  title\npageType: content\n---\nBody'), null);
});

test("a description pasted with line breaks is saved on one line", () => {
  const { fields, body } = parsePage(flood);
  const out = composePage(flood, { ...fields, description: "One\ntwo\n  three" }, body);
  assert.match(out, /^description: "One two three"$/m);
});

test("page routes follow the site template", () => {
  assert.equal(pageRoute("index.md"), "/");
  assert.equal(pageRoute("flood-insurance.md"), "/flood-insurance/");
  assert.equal(pageRoute("es/index.md"), "/es/");
  assert.equal(pageRoute("es/seguro-de-casa.md"), "/es/seguro-de-casa/");
});
