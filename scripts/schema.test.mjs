import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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

function pagePaths(slug, directory = resolve(repositoryRoot, "dist/sites", slug), relative = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return pagePaths(slug, resolve(directory, entry.name), `${relative}${entry.name}/`);
    return entry.name === "index.html" ? [relative === "" ? "." : relative.slice(0, -1)] : [];
  });
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

function insuranceAgency(graph) {
  const agencies = graph.filter((entity) => entity["@type"] === "InsuranceAgency");
  assert.equal(agencies.length, 1, "Every page must declare exactly one InsuranceAgency");
  return agencies[0];
}

test("site schema graphs connect entities and preserve FAQPage", async () => {
  buildSite("_example");
  buildSite("stuart-homeowners");

  for (const slug of ["_example", "stuart-homeowners"]) {
    for (const path of pagePaths(slug)) {
      const graph = graphFor(slug, path);
      assertConnectedGraph(graph);
      insuranceAgency(graph);
      const pageEntities = graph.filter((entity) => ["WebPage", "ContactPage"].includes(entity["@type"]));
      assert.equal(pageEntities.length, 1, `Expected one page entity in ${slug}/${path}`);
      assert.ok(pageEntities[0].isPartOf["@id"].endsWith("/#website"));
      assert.ok(pageEntities[0].about["@id"].endsWith("/#insurance-agency"));
    }
  }

  const exampleHome = graphFor("_example", ".");
  assertConnectedGraph(exampleHome);
  assert.equal(exampleHome.some((entity) => entity["@type"] === "BreadcrumbList"), false);
  assert.equal(insuranceAgency(exampleHome).address.addressCountry, "US");
  assert.equal(exampleHome.find((entity) => entity["@type"] === "WebPage").inLanguage, "en-US");

  const coverage = graphFor("_example", "coverage-fixture");
  assertConnectedGraph(coverage);
  const breadcrumb = coverage.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [
    "https://example-flood.invalid/",
    "https://example-flood.invalid/coverage-fixture/"
  ]);
  assert.equal(breadcrumb.itemListElement[1].name, "Coverage page fixture");
  const service = coverage.find((entity) => entity["@type"] === "Service");
  assert.equal(service.name, "Fixture coverage in Stuart");
  assert.equal(service.serviceType, "Fixture coverage");
  assert.deepEqual(service.areaServed, {
    "@type": "City",
    name: "Stuart",
    containedInPlace: { "@type": "AdministrativeArea", name: "Martin County" }
  });
  assert.equal(service.provider["@id"], "https://example-flood.invalid/#insurance-agency");
  assert.equal(graphFor("_example", "about-fixture").some((entity) => entity["@type"] === "Service"), false);

  const spanishPage = graphFor("_example", "es/about-fixture");
  const spanishBreadcrumb = spanishPage.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(spanishBreadcrumb.itemListElement.map((item) => item.item), [
    "https://example-flood.invalid/es/",
    "https://example-flood.invalid/es/about-fixture/"
  ]);
  assert.equal(spanishBreadcrumb.itemListElement[0].name, "Inicio");
  const spanishHome = graphFor("_example", "es");
  assert.equal(spanishHome.some((entity) => entity["@type"] === "BreadcrumbList"), false);

  for (const graph of [exampleHome, coverage, graphFor("_example", "about-fixture"), spanishPage, spanishHome]) {
    assert.ok(graph.some((entity) => ["WebPage", "ContactPage"].includes(entity["@type"])));
    insuranceAgency(graph);
  }

  const stuartHome = graphFor("stuart-homeowners", ".");
  assertConnectedGraph(stuartHome);
  const stuartAgency = insuranceAgency(stuartHome);
  assert.equal(stuartAgency["@id"], "https://stuarthomeownersinsurance.com/#insurance-agency");
  assert.equal(stuartAgency.url, "https://stuarthomeownersinsurance.com/");
  assert.equal(stuartAgency.logo, "https://stuarthomeownersinsurance.com/logo.svg");
  assert.equal(stuartAgency.parentOrganization["@id"], "https://www.walkerinsuranceagency.com/#organization");
  assert.equal(stuartAgency.address, undefined);
  assert.equal(stuartAgency.telephone, "+17722470106");
  assert.equal(stuartAgency.email, "info@stuarthomeownersinsurance.com");
  assert.deepEqual(stuartAgency.areaServed, [
    { "@type": "City", name: "Stuart" },
    { "@type": "Place", name: "Port Salerno" },
    { "@type": "Place", name: "Palm City" }
  ]);
  const walker = stuartHome.find((entity) => entity["@id"] === "https://www.walkerinsuranceagency.com/#organization");
  assert.deepEqual({ "@type": walker["@type"], name: walker.name, url: walker.url, telephone: walker.telephone, address: walker.address }, {
    "@type": "Organization",
    name: "Walker Insurance Agency",
    url: "https://www.walkerinsuranceagency.com/",
    telephone: undefined,
    address: undefined
  });
  const stuartContact = graphFor("stuart-homeowners", "contact");
  assert.equal(stuartContact.find((entity) => entity["@type"] === "ContactPage").url, "https://stuarthomeownersinsurance.com/contact/");
  assert.equal(stuartContact.some((entity) => entity["@type"] === "Service"), false);
  assert.equal(graphFor("stuart-homeowners", "flood-insurance").some((entity) => entity["@type"] === "Service"), false);

  const faqScripts = schemaScripts("_example", "blocks-fixture").filter((script) => script.data["@type"] === "FAQPage");
  assert.equal(faqScripts.length, 1);
  assert.equal(faqScripts[0].data.mainEntity.length, 6);

  process.env.WICFL_SITE_CONFIG = resolve(repositoryRoot, "sites/_example/site.config.json");
  const { serviceAreaEntities, siteGraphJsonLd } = await import(`../packages/template/src/lib/site-data.mjs?without-agency=${Date.now()}`);
  const configWithoutAgency = JSON.parse(readFileSync(resolve(repositoryRoot, "sites/_example/site.config.json"), "utf8"));
  delete configWithoutAgency.agency;
  const withoutAgency = JSON.parse(siteGraphJsonLd(configWithoutAgency, { id: "about", title: "About", path: "/about/", lang: "en" }));
  assert.equal(withoutAgency["@graph"].some((entity) => entity.parentOrganization), false);
  assert.equal(withoutAgency["@graph"].some((entity) => entity["@id"].endsWith("#organization")), false);

  const countyConfig = structuredClone(configWithoutAgency);
  countyConfig.geo.serviceArea = ["Martin County", "Martin"];
  assert.deepEqual(serviceAreaEntities(countyConfig), [
    { "@type": "AdministrativeArea", name: "Martin County" },
    { "@type": "AdministrativeArea", name: "Martin" }
  ]);
});
