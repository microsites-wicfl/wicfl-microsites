import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = resolve(import.meta.dirname, "..");

function buildSite(slug) {
  const build = spawnSync(process.execPath, [resolve(repositoryRoot, "scripts/build-site.mjs"), slug], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);
}

test("GTM markup is limited to the production host", () => {
  buildSite("stuart-homeowners");
  buildSite("_example");
  const stuartHtml = readFileSync(resolve(repositoryRoot, "dist/sites/stuart-homeowners/contact/index.html"), "utf8");
  const exampleHtml = readFileSync(resolve(repositoryRoot, "dist/sites/_example/index.html"), "utf8");
  assert.match(stuartHtml, /GTM-TV5RN2DB/);
  assert.match(stuartHtml, /location\.hostname === domain/);
  assert.doesNotMatch(stuartHtml, /gtag\/js\?id=G-/);
  assert.doesNotMatch(exampleHtml, /googletagmanager\.com\/gtm\.js/);
});
