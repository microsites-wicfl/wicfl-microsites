import test from "node:test";
import assert from "node:assert/strict";
import { formatConfig } from "../src/siteconfig.js";

const written = `{
  "slug": "demo",
  "brand": { "name": "Demo Insurance", "parent": "WICFL" },
  "geo": { "city": "Stuart", "serviceArea": ["Stuart", "Palm City"] },
  "contact": {
    "trackingPhone": "+17722470106",
    "displayPhone": "(772) 247-0106",
    "email": "info@example.com"
  },
  "seo": {
    "title": "Demo \\"quoted\\" title, with commas: and colons",
    "secondaryKeywords": ["one", "two"]
  }
}
`;

test("an unchanged config keeps its text exactly", () => {
  assert.equal(formatConfig(JSON.parse(written), written), written);
});

test("a save changes only the lines that changed", () => {
  const config = JSON.parse(written);
  config.contact.displayPhone = "(772) 555-1234";
  config.geo.serviceArea.push("Jensen Beach");
  const out = formatConfig(config, written);
  const before = written.split("\n");
  const after = out.split("\n");
  assert.equal(after.length, before.length);
  const changed = after.filter((line, i) => line !== before[i]);
  assert.deepEqual(changed, [
    '  "geo": { "city": "Stuart", "serviceArea": ["Stuart", "Palm City", "Jensen Beach"] },',
    '    "displayPhone": "(772) 555-1234",',
  ]);
  assert.deepEqual(JSON.parse(out), config);
});

test("a new config gets the compact layout", () => {
  const out = formatConfig({ slug: "x", brand: { name: "X" }, products: ["flood"] });
  assert.equal(out, '{\n  "slug": "x",\n  "brand": { "name": "X" },\n  "products": ["flood"]\n}\n');
});
