import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { createHandler } from "../src/index.js";
import { resetLiveCache } from "../src/live.js";
import { launchBlockers, newSiteConfig, phoneFrom, starterPages } from "../src/siteconfig.js";
import { env, offline, pavel, sampleRepository } from "./fake-github.js";

function call(github, method, path, { body, web = offline } = {}) {
  resetLiveCache();
  const handle = createHandler(github.fetch, undefined, web);
  const request = new Request(`https://studio.test${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(request, env, pavel).then(async (response) => ({
    status: response.status,
    body: await response.json(),
  }));
}

const newSite = {
  brandName: "Port St. Lucie Home Insurance",
  domain: "https://www.PortSaintLucieHomeInsurance.com/",
  city: "Port St. Lucie",
  county: "St. Lucie",
  product: "homeowners",
  audience: "homeowner",
  serviceArea: "Port St. Lucie\nTradition, St. Lucie West",
  seoTitle: "Home Insurance in Port St. Lucie, FL",
  seoDescription: "Compare homeowners insurance options in Port St. Lucie, Florida with a local agency.",
  primaryKeyword: "Port St. Lucie home insurance",
  proofType: "market-data",
  proofSummary: "Newer construction in Tradition changes wind mitigation credits for many homes.",
  sectionTitle: "Newer homes in Tradition",
  sectionRationale: "Wind mitigation on post-2002 builds is specific to this market's housing stock.",
};

// The real contract, when the repository's validator is installed (locally; not in the Studio CI job).
const require = createRequire(import.meta.url);
const root = join(import.meta.dirname, "..", "..", "..");
const schemaPath = join(root, "packages", "config-schema", "site.config.schema.json");
let validate = null;
try {
  const Ajv = require(join(root, "node_modules", "ajv", "dist", "2020.js")).default;
  if (existsSync(schemaPath)) {
    validate = new Ajv({ strict: false }).compile(JSON.parse(readFileSync(schemaPath, "utf8")));
  }
} catch {
  validate = null;
}

test("a new site's settings satisfy the repository schema", { skip: !validate && "validator not installed" }, () => {
  const config = newSiteConfig(newSite);
  assert.equal(validate(config), true, JSON.stringify(validate.errors));
});

test("a new site starts blocked from launch until the real phone, email, analytics and CRM exist", () => {
  const config = newSiteConfig(newSite);
  assert.equal(config.slug, "port-st-lucie-homeowners");
  assert.equal(config.domain, "portsaintluciehomeinsurance.com");
  assert.deepEqual(config.geo.serviceArea, ["Port St. Lucie", "Tradition", "St. Lucie West"]);
  const blockers = launchBlockers(config).join(" ");
  for (const label of ["Phone", "Email", "Google Analytics", "Tag Manager", "CRM form"]) {
    assert.match(blockers, new RegExp(label));
  }
});

test("starter pages are English, valid pages, and say they must be replaced", () => {
  const pages = starterPages(newSiteConfig(newSite));
  assert.deepEqual(Object.keys(pages), ["index.md", "contact.md", "homeowners-insurance.md"]);
  for (const text of Object.values(pages)) {
    assert.match(text, /^---\ntitle: ".+"\n/);
    assert.match(text, /Replace this text/);
  }
  assert.match(pages["index.md"], /pageType: home/);
});

test("phones are normalized for the site", () => {
  assert.deepEqual(phoneFrom("772.247.0106"), { trackingPhone: "+17722470106", displayPhone: "(772) 247-0106" });
  assert.deepEqual(phoneFrom("+1 (772) 247-0106").trackingPhone, "+17722470106");
  assert.throws(() => phoneFrom("247-0106"), /10-digit/);
});

test("creating a site writes only inside sites/<slug>/ in its draft, and it shows on the dashboard", async () => {
  const github = sampleRepository();
  const created = await call(github, "POST", "/api/sites", { body: newSite });
  assert.deepEqual(created.body, { created: true, slug: "port-st-lucie-homeowners" });
  const draft = github.branches.get("draft/port-st-lucie-homeowners");
  const written = Object.keys(draft.files).filter((file) => !(file in github.branches.get("main").files));
  assert.ok(written.length === 4 && written.every((file) => file.startsWith("sites/port-st-lucie-homeowners/")));
  assert.equal(github.branches.get("main").files["sites/port-st-lucie-homeowners/site.config.json"], undefined);

  const dashboard = await call(github, "GET", "/api/sites");
  assert.ok(dashboard.body.some((site) => site.slug === "port-st-lucie-homeowners" && site.hasChanges));
  const site = await call(github, "GET", "/api/sites/port-st-lucie-homeowners");
  assert.equal(site.body.isNew, true);
  assert.equal(site.body.pages.length, 3);

  const again = await call(github, "POST", "/api/sites", { body: newSite });
  assert.equal(again.status, 409);
});

test("a new site needs its local proof and unique section, in real words", async () => {
  const body = { ...newSite, proofSummary: "Short" };
  const response = await call(sampleRepository(), "POST", "/api/sites", { body });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Local proof needs at least 20 characters/);
});

test("site settings read and save through the draft, and report what still blocks the launch", async () => {
  const github = sampleRepository();
  const created = await call(github, "POST", "/api/sites", { body: newSite });
  const slug = created.body.slug;
  const before = await call(github, "GET", `/api/sites/${slug}/settings`);
  assert.equal(before.body.settings.brandName, "Port St. Lucie Home Insurance");
  const saved = await call(github, "PUT", `/api/sites/${slug}/settings`, {
    body: { ...before.body.settings, phone: "(772) 335-4779", email: "info@portsaintluciehomeinsurance.com" },
  });
  assert.equal(saved.body.saved, true);
  const config = JSON.parse(github.branches.get(`draft/${slug}`).files[`sites/${slug}/site.config.json`]);
  assert.equal(config.contact.trackingPhone, "+17723354779");
  assert.doesNotMatch(saved.body.blockers.join(" "), /Phone|Email/);
  assert.match(saved.body.blockers.join(" "), /Google Analytics/);
  assert.equal(before.body.settings.phone, "", "a placeholder phone shows as empty");
  const bad = await call(github, "PUT", `/api/sites/${slug}/settings`, {
    body: { ...before.body.settings, seoTitle: "Short" },
  });
  assert.match(bad.body.error, /SEO title needs at least 10/);
});

async function readyDraft(github) {
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", {
    body: { content: "---\ntitle: Flood\n---\nPublished copy" },
  });
  github.addComment(1, "<!-- wicfl-preview:stuart -->\nhttps://wicfl-pr1-stuart.wicfl-microsites.workers.dev");
  github.setCheckRuns(github.headOf("draft/stuart"), [
    { name: "Preview stuart", status: "completed", conclusion: "success" },
  ]);
}

test("Publish waits for a ready preview", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", { body: { content: "---\ntitle: Flood\n---\nNew" } });
  const early = await call(github, "POST", "/api/sites/stuart/publish");
  assert.equal(early.status, 409);
  assert.match(early.body.error, /Wait until the preview is ready/);
});

test("Publish makes the draft the official version; a site not live yet is not deployed", async () => {
  const github = sampleRepository();
  await readyDraft(github);
  const published = await call(github, "POST", "/api/sites/stuart/publish");
  assert.deepEqual(published.body, { published: true, deploying: false });
  const official = github.branches.get("main").files["sites/stuart/content/flood.md"];
  assert.equal(official, "---\ntitle: Flood\n---\nPublished copy");
  assert.equal(github.branches.has("draft/stuart"), false);
  assert.equal(github.dispatches, undefined);
});

test("Publish on a live site also deploys it; without permission to deploy it says Vic is needed", async () => {
  const live = async (url) => new Response(`<link rel="canonical" href="${url}">`, { status: 200 });
  const github = sampleRepository();
  await readyDraft(github);
  const published = await call(github, "POST", "/api/sites/stuart/publish", { web: live });
  assert.deepEqual(published.body, { published: true, deploying: true });
  assert.deepEqual(github.dispatches, [
    { workflow: "deploy.yml", ref: "main", inputs: { target: "production", confirm: "deploy" } },
  ]);

  const locked = sampleRepository();
  locked.dispatchForbidden = true;
  await readyDraft(locked);
  const response = await call(locked, "POST", "/api/sites/stuart/publish", { web: live });
  assert.deepEqual(response.body, { published: true, deploying: false, needsVic: true });
});

test("a draft that can't be merged is not published and Studio says so plainly", async () => {
  const github = sampleRepository();
  await readyDraft(github);
  github.mergeConflict = true;
  const response = await call(github, "POST", "/api/sites/stuart/publish");
  assert.equal(response.status, 409);
  assert.match(response.body.error, /can't be published automatically/);
  assert.equal(github.branches.has("draft/stuart"), true, "the draft is kept");
});

test("launch blockers use plain field names, also inside lists", () => {
  const config = newSiteConfig({ ...newSite, primaryKeyword: "demo keyword" });
  config.seo.secondaryKeywords = ["real one", "demo two"];
  const text = launchBlockers(config).join(" ");
  assert.match(text, /Other keywords still says "demo"/);
  assert.doesNotMatch(text, /\[\d\]/);
});

