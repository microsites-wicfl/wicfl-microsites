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

const fixtureSlug = "_example";
const fixtureConfig = JSON.parse(readFileSync(resolve(repositoryRoot, "sites", fixtureSlug, "site.config.json"), "utf8"));

test("GTM markup is limited to the production host", () => {
  buildSite(fixtureSlug);
  const fixtureHtml = readFileSync(resolve(repositoryRoot, "dist/sites", fixtureSlug, "contact/index.html"), "utf8");
  assert.match(fixtureHtml, new RegExp(fixtureConfig.analytics.gtm));
  assert.match(fixtureHtml, /location\.hostname === domain/);
  assert.doesNotMatch(fixtureHtml, /gtag\/js\?id=G-/);
});

test("quote form fixture places the privacy notice before the submit button", () => {
  buildSite(fixtureSlug);
  const fixtureHtml = readFileSync(resolve(repositoryRoot, "dist/sites", fixtureSlug, "contact/index.html"), "utf8");
  const stepThree = fixtureHtml.match(/<fieldset data-step="3"[\s\S]*?<\/fieldset>/)?.[0];
  assert.ok(stepThree, "Expected the fixture contact page to contain step 3");
  const notice = stepThree.indexOf('class="contact-form-consent"');
  const submit = stepThree.indexOf("Request my quote");
  assert.ok(notice >= 0, "Expected the privacy notice in step 3");
  assert.ok(notice < submit, "Expected the privacy notice before the quote submit button");
  assert.match(stepThree, /class="contact-form-consent"[\s\S]*?href="\/privacy-policy\/"/);
});
