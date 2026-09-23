import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = mkdtempSync(join(tmpdir(), "wicfl-gate-"));
const script = join(import.meta.dirname, "check-production-config.mjs");
function run(name, config) {
  const directory = join(root, name);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "site.config.json"), JSON.stringify(config));
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
