import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { chromium } from "playwright";

const repositoryRoot = resolve(import.meta.dirname, "..");
const fixtureSlug = "_example";
const fixtureConfig = JSON.parse(readFileSync(resolve(repositoryRoot, "sites", fixtureSlug, "site.config.json"), "utf8"));
const mimeTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

function buildSite(slug) {
  const build = spawnSync(process.execPath, [resolve(repositoryRoot, "scripts/build-site.mjs"), slug], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);
}

function serveSite(slug) {
  const siteRoot = resolve(repositoryRoot, "dist", "sites", slug);
  const server = createServer(async (request, response) => {
    const requestPath = new URL(request.url, "http://localhost").pathname;
    const relativePath = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
    const path = resolve(siteRoot, `.${relativePath}`);
    if (!path.startsWith(siteRoot)) return response.writeHead(404).end();
    try {
      response.writeHead(200, { "content-type": mimeTypes[extname(path)] ?? "application/octet-stream" });
      response.end(await readFile(path));
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((ready) => server.listen(0, "127.0.0.1", () => ready(server)));
}

test("GTM only loads on the production host and conversion events exclude form data", { timeout: 20000 }, async () => {
  buildSite(fixtureSlug);
  const server = await serveSite(fixtureSlug);
  const port = server.address().port;
  const browser = await chromium.launch({ args: [`--host-resolver-rules=MAP ${fixtureConfig.domain} 127.0.0.1`, "--proxy-server=direct://", "--proxy-bypass-list=*"] });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => { crypto.randomUUID ??= () => "test-address-session"; });
    let gtmRequests = 0;
    await page.route("https://www.googletagmanager.com/gtm.js*", async (route) => { gtmRequests += 1; await route.fulfill({ body: "" }); });
    await page.route("https://wicfl-lead-api.wicfl-microsites.workers.dev/**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith("/uploads")) return route.fulfill({ contentType: "application/json", body: JSON.stringify({ url: "https://uploads.example.test/policy" }) });
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ contactId: "test-contact" }) });
    });
    await page.route("https://uploads.example.test/**", (route) => route.fulfill({ status: 200 }));
    await page.goto(`http://${fixtureConfig.domain}:${port}/contact/`);
    const submitStep = (step) => page.evaluate((currentStep) => document.querySelector(`fieldset[data-step="${currentStep}"] button[type="submit"]`).click(), step);
    await page.locator("input[name=zip]").fill("34994");
    await submitStep(1);
    await page.locator('fieldset[data-step="2"]').waitFor({ state: "visible" });
    const stepTwo = page.locator('fieldset[data-step="2"]');
    await stepTwo.locator("select[name=purchaseReason]").selectOption({ label: "Buying a home" });
    await stepTwo.locator("input[name=address]").fill("1 Test Street");
    await submitStep(2);
    await page.locator('fieldset[data-step="3"]').waitFor({ state: "visible" });
    const stepThree = page.locator('fieldset[data-step="3"]');
    await stepThree.locator("input[name=firstName]").fill("Test");
    await stepThree.locator("input[name=lastName]").fill("Visitor");
    await stepThree.locator("input[name=phone]").fill("7722470106");
    await stepThree.locator("input[name=email]").fill("test@example.test");
    await stepThree.locator("select[name=timing]").selectOption({ label: "As soon as possible" });
    await stepThree.locator("input[name=currentInsurer]").fill("Test insurer");
    await submitStep(3);
    await page.locator("[data-confirmation]").waitFor({ state: "visible" });
    await page.locator("[data-policy]").setInputFiles({ name: "policy.pdf", mimeType: "application/pdf", buffer: Buffer.from("test") });
    await page.getByRole("button", { name: "Upload declaration" }).click();
    await page.locator("header a[href^='tel:']").click({ noWaitAfter: true });
    const pushes = await page.evaluate(() => window.dataLayer.map(({ "gtm.start": ignored, ...event }) => event));
    assert.equal(gtmRequests, 1);
    assert.deepEqual(pushes.slice(1), [
      { event: "quote_start", form_id: fixtureConfig.crm.formId, site_slug: fixtureConfig.slug },
      { event: "quote_step", form_id: fixtureConfig.crm.formId, site_slug: fixtureConfig.slug, step: 3 },
      { event: "generate_lead", form_id: fixtureConfig.crm.formId, site_slug: fixtureConfig.slug, lead_source: fixtureConfig.crm.leadSource },
      { event: "policy_upload", form_id: fixtureConfig.crm.formId, site_slug: fixtureConfig.slug },
      { event: "phone_click", site_slug: fixtureConfig.slug, link_location: "header" }
    ]);
    assert.doesNotMatch(JSON.stringify(pushes), /Test Street|test@example\.test|7722470106/);
    const preview = await browser.newPage();
    await preview.goto(`http://127.0.0.1:${port}/contact/`);
    assert.equal(gtmRequests, 1);
    assert.deepEqual(await preview.evaluate(() => window.dataLayer), []);
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise((close) => server.close(close));
  }
});
