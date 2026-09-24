import assert from "node:assert/strict";
import test from "node:test";
import { validatePageHeader } from "../src/frontmatter.js";

const page = (header, body = "\nLiving in Stuart means...\n") => `---\n${header}\n---\n${body}`;
const original = page('title: "Flood"\ndescription: "D"\npageType: coverage\nnavLabel: "Flood"');

test("a valid header and a changed body pass", () => {
  validatePageHeader(page('title: "Flood"\ndescription: "D"\npageType: coverage\nnavLabel: "Flood"',
    "\nLiving in Stuart means...\n\nPrueba Studio\n"), original);
});

test("a loose line inside the header is rejected and named (the 23 Sep test case)", () => {
  const broken = page('title: "Flood"\ndescription: "D"\npageType: coverage\nnavLabel: "Flood"\nPrueba Estudio');
  assert.throws(() => validatePageHeader(broken, original), (error) => {
    assert.equal(error.status, 400);
    assert.match(error.message, /"Prueba Estudio"/);
    assert.match(error.message, /below/);
    return true;
  });
});

test("a line with a comma but no field name is still rejected", () => {
  const broken = page('title: "Flood"\npageType: coverage\nprueba, studio');
  assert.throws(() => validatePageHeader(broken, original), /"prueba, studio"/);
});

test("removing the header entirely is rejected when the page had one", () => {
  assert.throws(() => validatePageHeader("Just text", original), /header is missing/);
});

test("an unclosed header is rejected", () => {
  assert.throws(() => validatePageHeader('---\ntitle: "Flood"\npageType: coverage\n\nText', original),
    /isn't closed/);
});

test("deleting title or pageType is rejected", () => {
  assert.throws(() => validatePageHeader(page('description: "D"\npageType: coverage'), original), /title/);
  assert.throws(() => validatePageHeader(page('title: "F"\ndescription: "D"'), original), /pageType/);
});

test("comments, indented continuations, list items and Windows line endings are allowed", () => {
  const ok = '---\r\ntitle: "Flood"\r\n# note\r\npageType: coverage\r\ntags:\r\n  - flood\r\n- extra\r\n---\r\nBody';
  validatePageHeader(ok, original);
});

test("pages without a header (and no header before) are left alone", () => {
  validatePageHeader("Plain text", "Older plain text");
});
