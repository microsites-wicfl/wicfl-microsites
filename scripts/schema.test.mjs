import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = resolve(import.meta.dirname, "..");
const fixtureSlug = "_example";

function buildSite(slug) {
  const build = spawnSync(process.execPath, [resolve(repositoryRoot, "scripts/build-site.mjs"), slug], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);
}

function configFor(slug) {
  return JSON.parse(readFileSync(resolve(repositoryRoot, "sites", slug, "site.config.json"), "utf8"));
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

function realSiteSlugs() {
  return readdirSync(resolve(repositoryRoot, "sites"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name);
}

function sourceForRoute(slug, route, config) {
  if (route === ".") return resolve(repositoryRoot, "sites", slug, "content/index.md");
  const [locale] = route.split("/");
  if (config.locale.alternates.includes(locale) && !route.includes("/")) {
    return resolve(repositoryRoot, "sites", slug, "content", route, "index.md");
  }
  return resolve(repositoryRoot, "sites", slug, "content", `${route}.md`);
}

function hasServiceName(slug, route, config) {
  return /^\s*serviceName:\s*\S/m.test(readFileSync(sourceForRoute(slug, route, config), "utf8"));
}

test("schema fixture covers agency, service, breadcrumb, and FAQ contracts", async () => {
  buildSite(fixtureSlug);
  const fixtureConfig = configFor(fixtureSlug);

  for (const path of pagePaths(fixtureSlug)) {
    const graph = graphFor(fixtureSlug, path);
    assertConnectedGraph(graph);
    insuranceAgency(graph);
    const pageEntities = graph.filter((entity) => ["WebPage", "ContactPage"].includes(entity["@type"]));
    assert.equal(pageEntities.length, 1, `Expected one page entity in ${fixtureSlug}/${path}`);
    assert.ok(pageEntities[0].isPartOf["@id"].endsWith("/#website"));
    assert.ok(pageEntities[0].about["@id"].endsWith("/#insurance-agency"));
  }

  const exampleHome = graphFor(fixtureSlug, ".");
  assert.equal(exampleHome.some((entity) => entity["@type"] === "BreadcrumbList"), false);
  const agency = insuranceAgency(exampleHome);
  assert.equal(agency["@id"], `https://${fixtureConfig.domain}/#insurance-agency`);
  assert.equal(agency.url, `https://${fixtureConfig.domain}/`);
  assert.equal(agency.logo, `https://${fixtureConfig.domain}${fixtureConfig.brand.logo}`);
  assert.equal(agency.parentOrganization["@id"], "https://www.walkerinsuranceagency.com/#organization");
  assert.equal(agency.address, undefined);
  assert.equal(agency.telephone, fixtureConfig.contact.trackingPhone);
  assert.equal(agency.email, fixtureConfig.contact.email);
  assert.deepEqual(agency.areaServed, [
    { "@type": "City", name: fixtureConfig.geo.city },
    { "@type": "AdministrativeArea", name: "Martin County" },
    { "@type": "Place", name: "Port Salerno" },
    { "@type": "Place", name: "Palm City" },
    { "@type": "Place", name: "Hobe Sound" }
  ]);
  const walker = exampleHome.find((entity) => entity["@id"] === "https://www.walkerinsuranceagency.com/#organization");
  assert.deepEqual({ "@type": walker["@type"], name: walker.name, url: walker.url, telephone: walker.telephone, address: walker.address }, {
    "@type": "Organization",
    name: "Walker Insurance Agency",
    url: "https://www.walkerinsuranceagency.com/",
    telephone: undefined,
    address: undefined
  });

  const coverage = graphFor(fixtureSlug, "coverage-fixture");
  const breadcrumb = coverage.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [
    `https://${fixtureConfig.domain}/`,
    `https://${fixtureConfig.domain}/coverage-fixture/`
  ]);
  assert.equal(breadcrumb.itemListElement[1].name, "Coverage page fixture");
  const service = coverage.find((entity) => entity["@type"] === "Service");
  assert.equal(service.name, `Fixture coverage in ${fixtureConfig.geo.city}`);
  assert.equal(service.serviceType, "Fixture coverage");
  assert.deepEqual(service.areaServed, {
    "@type": "City",
    name: fixtureConfig.geo.city,
    containedInPlace: { "@type": "AdministrativeArea", name: `${fixtureConfig.geo.county} County` }
  });
  assert.equal(service.provider["@id"], `https://${fixtureConfig.domain}/#insurance-agency`);
  assert.equal(graphFor(fixtureSlug, "about-fixture").some((entity) => entity["@type"] === "Service"), false);

  const spanishPage = graphFor(fixtureSlug, "es/about-fixture");
  const spanishBreadcrumb = spanishPage.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(spanishBreadcrumb.itemListElement.map((item) => item.item), [
    `https://${fixtureConfig.domain}/es/`,
    `https://${fixtureConfig.domain}/es/about-fixture/`
  ]);
  assert.equal(spanishBreadcrumb.itemListElement[0].name, "Inicio");
  assert.equal(graphFor(fixtureSlug, "es").some((entity) => entity["@type"] === "BreadcrumbList"), false);

  const contact = graphFor(fixtureSlug, "contact");
  assert.equal(contact.find((entity) => entity["@type"] === "ContactPage").url, `https://${fixtureConfig.domain}/contact/`);

  const faqScripts = schemaScripts(fixtureSlug, "blocks-fixture").filter((script) => script.data["@type"] === "FAQPage");
  assert.equal(faqScripts.length, 1);
  assert.equal(faqScripts[0].data.mainEntity.length, 6);

  process.env.WICFL_SITE_CONFIG = resolve(repositoryRoot, "sites/_example/site.config.json");
  const { serviceAreaEntities, siteGraphJsonLd } = await import(`../packages/template/src/lib/site-data.mjs?without-agency=${Date.now()}`);
  const configWithoutAgency = structuredClone(fixtureConfig);
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

test("real sites retain only schema invariants derived from their own config and content", () => {
  for (const slug of realSiteSlugs()) {
    const config = configFor(slug);
    buildSite(slug);
    for (const route of pagePaths(slug)) {
      const graph = graphFor(slug, route);
      assertConnectedGraph(graph);
      const agency = insuranceAgency(graph);
      assert.equal(agency.telephone, config.contact.trackingPhone);
      assert.equal(agency.email, config.contact.email);
      assert.deepEqual(agency.areaServed.map((area) => area.name), config.geo.serviceArea);
      assert.equal(agency.address, undefined);
      assert.equal(graph.some((entity) => entity["@type"] === "Service"), hasServiceName(slug, route, config));
    }
  }
});

test("test scripts do not name real sites", () => {
  const testFiles = readdirSync(resolve(repositoryRoot, "scripts"))
    .filter((file) => file.endsWith(".test.mjs"));
  for (const slug of realSiteSlugs()) {
    for (const file of testFiles) {
      const text = readFileSync(resolve(repositoryRoot, "scripts", file), "utf8");
      assert.equal(text.includes(slug), false, `Tests must not depend on a real site's content: ${file} mentions "${slug}". Use sites/_example or a temporary _fixture.`);
    }
  }
});
