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

function schemaScripts(slug, path) {
  const html = readFileSync(resolve(repositoryRoot, "dist/sites", slug, path, "index.html"), "utf8");
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => ({ raw: match[1], data: JSON.parse(match[1]) }));
}

function graphFor(slug, path) {
  const graph = schemaScripts(slug, path).find((script) => script.data["@graph"]);
  assert.ok(graph, `Expected a graph in ${slug}/${path}`);
  assert.doesNotMatch(graph.raw, /</);
  return graph.data["@graph"];
}

function references(value, found = []) {
  if (Array.isArray(value)) value.forEach((entry) => references(entry, found));
  else if (value && typeof value === "object") {
    if (Object.keys(value).length === 1 && value["@id"]) found.push(value["@id"]);
    Object.values(value).forEach((entry) => references(entry, found));
  }
  return found;
}

function assertConnectedGraph(graph) {
  const definedIds = graph.map((entity) => entity["@id"]);
  assert.equal(new Set(definedIds).size, definedIds.length, "Every entity @id must be unique");
  for (const reference of references(graph)) assert.ok(definedIds.includes(reference), `Missing entity for ${reference}`);
}

test("site schema graphs connect entities and preserve FAQPage", async () => {
  buildSite("_example");
  buildSite("stuart-homeowners");

  const exampleHome = graphFor("_example", ".");
  assertConnectedGraph(exampleHome);
  assert.equal(exampleHome.some((entity) => entity["@type"] === "BreadcrumbList"), false);

  const coverage = graphFor("_example", "coverage-fixture");
  assertConnectedGraph(coverage);
  const breadcrumb = coverage.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [
    "https://example-flood.invalid/",
    "https://example-flood.invalid/coverage-fixture/"
  ]);
  assert.equal(breadcrumb.itemListElement[1].name, "Coverage page fixture");
  const service = coverage.find((entity) => entity["@type"] === "Service");
  assert.equal(service.provider["@id"], "https://example-flood.invalid/#agency");
  assert.equal(graphFor("_example", "about-fixture").some((entity) => entity["@type"] === "Service"), false);

  const spanishPage = graphFor("_example", "es/about-fixture");
  const spanishBreadcrumb = spanishPage.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(spanishBreadcrumb.itemListElement.map((item) => item.item), [
    "https://example-flood.invalid/es/",
    "https://example-flood.invalid/es/about-fixture/"
  ]);

  const stuartHome = graphFor("stuart-homeowners", ".");
  assertConnectedGraph(stuartHome);
  const stuartAgency = stuartHome.find((entity) => entity["@id"] === "https://stuarthomeownersinsurance.com/#agency");
  assert.equal(stuartAgency.url, "https://stuarthomeownersinsurance.com/");
  assert.equal(stuartAgency.logo, "https://stuarthomeownersinsurance.com/logo.svg");
  assert.equal(stuartAgency.parentOrganization["@id"], "https://www.walkerinsuranceagency.com/#organization");
  const walker = stuartHome.find((entity) => entity["@id"] === "https://www.walkerinsuranceagency.com/#organization");
  assert.deepEqual({ name: walker.name, url: walker.url, telephone: walker.telephone, address: walker.address }, {
    name: "Walker Insurance Agency",
    url: "https://www.walkerinsuranceagency.com/",
    telephone: "+14079777100",
    address: { "@type": "PostalAddress", streetAddress: "789 SW Federal Highway, Suite 201", addressLocality: "Stuart", addressRegion: "FL", postalCode: "34994" }
  });
  assert.equal(graphFor("stuart-homeowners", "flood-insurance").some((entity) => entity["@type"] === "Service"), false);

  const faqScripts = schemaScripts("_example", "blocks-fixture").filter((script) => script.data["@type"] === "FAQPage");
  assert.equal(faqScripts.length, 1);
  assert.equal(faqScripts[0].data.mainEntity.length, 6);

  process.env.WICFL_SITE_CONFIG = resolve(repositoryRoot, "sites/_example/site.config.json");
  const { siteGraphJsonLd } = await import(`../packages/template/src/lib/site-data.mjs?without-agency=${Date.now()}`);
  const configWithoutAgency = JSON.parse(readFileSync(resolve(repositoryRoot, "sites/_example/site.config.json"), "utf8"));
  delete configWithoutAgency.agency;
  const withoutAgency = JSON.parse(siteGraphJsonLd(configWithoutAgency, { title: "About", path: "/about/", lang: "en" }));
  assert.equal(withoutAgency["@graph"].some((entity) => entity.parentOrganization), false);
  assert.equal(withoutAgency["@graph"].some((entity) => entity["@id"].endsWith("#organization")), false);
});
