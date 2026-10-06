import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = mkdtempSync(join(tmpdir(), "wicfl-gate-"));
const script = join(import.meta.dirname, "check-production-config.mjs");
const privacyPolicy = `---\ntitle: "Privacy Policy"\n---\n\n${"This Privacy Policy explains how the site handles quote requests and personal information. ".repeat(25)}`;
function run(name, config, pages = {}) {
  const directory = join(root, name);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "site.config.json"), JSON.stringify(config));
  for (const [path, text] of Object.entries({ "privacy-policy.md": privacyPolicy, ...pages })) {
    if (text === null) continue;
    const file = join(directory, "content", path);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, text);
  }
  return spawnSync(process.execPath, [script, name], { env: { ...process.env, WICFL_SITES_ROOT: root }, encoding: "utf8" });
}
function config(value = {}) { return { brand: { name: "Clean Brand" }, seo: { title: "Clean title" }, contact: { trackingPhone: "+17722470106" }, ...value }; }
test.after(() => rmSync(root, { recursive: true, force: true }));
test("rejects all reserved fictional phone formats", () => {
  for (const phone of ["+17725550142", "772-555-0142", "772 555 0142", "(772) 555-0142", "772.555.0142"]) assert.notEqual(run(phone.replace(/\W/g, "x"), config({ contact: { trackingPhone: phone } })).status, 0);
});
test("scopes demo to brand and seo", () => {
  assert.notEqual(run("brand", config({ brand: { name: "Demo Brand" } })).status, 0);
  assert.notEqual(run("seo", config({ seo: { title: "Demo title" } })).status, 0);
  assert.equal(run("other", config({ notes: "demo only" })).status, 0);
});
test("rejects existing markers and accepts clean config", () => {
  for (const value of ["PLACEHOLDER", "PENDING_THING", "+17720000000"]) assert.notEqual(run(value.replace(/\W/g, "x"), config({ value })).status, 0);
  assert.equal(run("clean", config()).status, 0);
  assert.equal(run("_fixture", config({ brand: { name: "Demo" } })).status, 0);
});
test("checks placeholder markers inside the associated agency", () => {
  assert.notEqual(run("agency", config({ agency: { name: "PLACEHOLDER Agency" } })).status, 0);
});
test("rejects starter sample images and text in content pages", () => {
  assert.notEqual(run("sample-image", config(), { "index.md": "![x](/images/sample-hero.jpg)" }).status, 0);
  assert.notEqual(run("starter-instruction", config(), { "index.md": "[Write the headline]" }).status, 0);
  assert.notEqual(run("starter-note", config(), { "contact.md": "Replace this text with the real page before publishing." }).status, 0);
  const combined = run("starter-content", config(), {
    "index.md": "![x](/images/sample-hero.jpg)\n\n[Write the headline]",
    "contact.md": "Replace this text with the real page before publishing."
  });
  assert.match(combined.stderr, /content\/index\.md: sample image/);
  assert.match(combined.stderr, /content\/index\.md: starter text/);
  assert.match(combined.stderr, /content\/contact\.md: starter text/);
});
test("accepts real content and keeps fixtures exempt", () => {
  const realContent = { "index.md": "[our guide](/flood/)\n\n![A real home](/images/home.jpg)" };
  assert.equal(run("real-content", config(), realContent).status, 0);
  assert.equal(run("_starter-fixture", config({ brand: { name: "Demo" } }), { "index.md": "[Write the headline]" }).status, 0);
});
test("rejects internal SEO markers but allows internal differentiation notes", () => {
  assert.notEqual(run("internal-seo", config({ seo: { description: "Internal preview of the microsite template." } })).status, 0);
  assert.equal(run("internal-differentiation", config({ differentiation: { localProof: [{ summary: "Internal demo history is not rendered." }] } })).status, 0);
});
test("rejects test pages but allows ordinary body copy", () => {
  assert.notEqual(run("about-demo", config(), { "about-demo.md": "---\ntitle: About\n---\n\nReal body" }).status, 0);
  assert.notEqual(run("coverage-demo", config(), { "coverage-demo.md": "---\ntitle: Coverage\ndescription: Placeholder coverage page\n---\n\nReal body" }).status, 0);
  assert.equal(run("ordinary-demo-mention", config(), { "index.md": "Our agency has never called this a demo." }).status, 0);
});
test("requires a substantive privacy policy", () => {
  assert.notEqual(run("missing-privacy", config(), { "privacy-policy.md": null }).status, 0);
  assert.notEqual(run("short-privacy", config(), { "privacy-policy.md": "---\ntitle: Privacy Policy\n---\n\nShort policy.".repeat(10) }).status, 0);
  assert.equal(run("valid-privacy", config()).status, 0);
});
test("reports internal copy, test pages, and missing privacy policy", () => {
  const result = run("all-production-markers", config({ seo: { description: "Internal preview that is not published in this microsite template." } }), {
    "about-demo.md": "---\ntitle: About\n---\n\nReal body",
    "coverage-demo.md": "---\ntitle: Coverage\n---\n\nReal body",
    "privacy-policy.md": null
  });
  assert.match(result.stderr, /seo\.description: .*internal marker/);
  assert.match(result.stderr, /seo\.description: .*unpublished-content marker/);
  assert.match(result.stderr, /seo\.description: .*template marker/);
  assert.match(result.stderr, /content\/about-demo\.md: looks like a test page/);
  assert.match(result.stderr, /content\/coverage-demo\.md: looks like a test page/);
  assert.match(result.stderr, /content\/privacy-policy\.md: missing/);
});
