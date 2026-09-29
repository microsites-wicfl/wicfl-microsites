import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { checkTheme } from "../../../packages/config-schema/theme.mjs";
import { ICONS as ICONS_FOR_TEST } from "../../../packages/config-schema/icons.mjs";
import { brandProblems } from "../public/brand.js";
import { applyBrand, brandOf, checkSvg } from "../src/brand.js";
import { createHandler } from "../src/index.js";
import { resetLiveCache } from "../src/live.js";
import { FakeGitHub, env, offline, pavel } from "./fake-github.js";

const stuartPath = join(import.meta.dirname, "../../../sites/stuart-homeowners/site.config.json");
const stuartConfig = readFileSync(stuartPath, "utf8");

function repository() {
  return new FakeGitHub({
    "sites/stuart-homeowners/site.config.json": stuartConfig,
    "sites/stuart-homeowners/content/index.md": "---\ntitle: Home\npageType: home\n---\nHello",
    "pods/pod-1.json": JSON.stringify({ sites: ["stuart-homeowners"] }),
  });
}

async function call(github, method, path, body) {
  resetLiveCache();
  const handle = createHandler(github.fetch, undefined, offline);
  const request = new Request(`https://studio.test${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const response = await handle(request, env, pavel);
  const type = response.headers.get("content-type") || "";
  return {
    status: response.status,
    headers: response.headers,
    body: type.includes("json") ? await response.json() : new Uint8Array(await response.arrayBuffer()),
  };
}

const svgData = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const LOGO = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">' +
  '<defs><linearGradient id="g"><stop offset="0" stop-color="#000"/></linearGradient></defs>' +
  '<rect width="10" height="10" fill="url(#g)"/><use href="#g"/></svg>';

test("Studio's live check and the site build agree on every color", () => {
  const shades = ["#000000", "#12181f", "#0f6b75", "#3fb3bb", "#777777", "#9fd3e0", "#e8f5f5", "#ffffff", "#f2c94c"];
  for (const color of shades) {
    const theme = { accentColor: color, secondaryColor: color, surfaceColor: color, footerColor: color };
    const build = [...new Set(checkTheme(theme).map((problem) => problem.field))].sort();
    const studio = brandProblems(theme).map((problem) => problem.field).sort();
    assert.deepEqual(studio, build, color);
  }
});

test("values equal to their defaults stay out of the config", () => {
  const config = JSON.parse(stuartConfig);
  const brand = brandOf(config);
  const theme = applyBrand(config, brand);
  assert.deepEqual(theme, { variant: "coastal", accentColor: "#0f6b75" });
});

test("a changed brand is saved; unreadable colors and unknown fonts are refused", () => {
  const config = JSON.parse(stuartConfig);
  const brand = { ...brandOf(config), footerColor: "#1d3557", headingFont: "lora" };
  assert.deepEqual(applyBrand(config, brand), {
    variant: "coastal", accentColor: "#0f6b75", footerColor: "#1d3557", headingFont: "lora",
  });
  assert.throws(() => applyBrand(config, { ...brand, accentColor: "#9fd3e0" }), /main color is too light/);
  assert.throws(() => applyBrand(config, { ...brand, surfaceColor: "#12181f" }), /soft background is too dark/);
  assert.throws(() => applyBrand(config, { ...brand, bodyFont: "comic-sans" }), /fonts in the list/);
});

test("plain SVG logos pass; anything carrying code is refused", () => {
  assert.doesNotThrow(() => checkSvg(LOGO));
  const refused = [
    '<svg><script>alert(1)</script></svg>',
    '<svg onload="x()"></svg>',
    '<svg><a href="https://example.com"><rect/></a></svg>',
    '<svg><foreignObject><div/></foreignObject></svg>',
    '<svg><image xlink:href="https://example.com/x.png"/></svg>',
    '<svg><style>@import url(https://x);</style></svg>',
  ];
  for (const svg of refused) assert.throws(() => checkSvg(svg), /extra code/, svg);
  assert.throws(() => checkSvg("<html><body></body></html>"), /isn't an SVG/);
});

test("settings show and save the brand", async () => {
  const github = repository();
  const shown = await call(github, "GET", "/api/sites/stuart-homeowners/settings");
  assert.equal(shown.body.brand.accentColor, "#0f6b75");
  assert.equal(shown.body.brand.logo, "/logo.svg");
  const saved = await call(github, "PUT", "/api/sites/stuart-homeowners/settings", {
    ...shown.body.settings,
    ...shown.body.brand,
    footerColor: "#1d3557",
  });
  assert.equal(saved.status, 200);
  const draft = github.branches.get("draft/stuart-homeowners").files;
  const config = JSON.parse(draft["sites/stuart-homeowners/site.config.json"]);
  assert.equal(config.theme.footerColor, "#1d3557");
  const refused = await call(github, "PUT", "/api/sites/stuart-homeowners/settings", {
    ...shown.body.settings,
    ...shown.body.brand,
    accentColor: "#9fd3e0",
  });
  assert.equal(refused.status, 400);
  assert.match(refused.body.error, /main color is too light/);
});

test("a logo upload goes to the draft and is served so it can't run code", async () => {
  const github = repository();
  const bad = await call(github, "POST", "/api/sites/stuart-homeowners/logo", {
    name: "logo.svg", data: svgData('<svg onload="steal()"></svg>'),
  });
  assert.equal(bad.status, 400);
  assert.match(bad.body.error, /extra code/);

  const png = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
  const upload = await call(github, "POST", "/api/sites/stuart-homeowners/logo", {
    name: "Brand Logo.PNG", data: `data:image/png;base64,${png.toString("base64")}`,
  });
  assert.equal(upload.status, 200);
  assert.equal(upload.body.logo, "/logo.png");
  const draft = github.branches.get("draft/stuart-homeowners").files;
  assert.equal(JSON.parse(draft["sites/stuart-homeowners/site.config.json"]).brand.logo, "/logo.png");
  assert.deepEqual(Buffer.from(draft["sites/stuart-homeowners/public/logo.png"]), png);

  const served = await call(github, "GET", "/api/sites/stuart-homeowners/logo");
  assert.equal(served.headers.get("content-type"), "image/png");
  assert.match(served.headers.get("content-security-policy"), /sandbox/);
  assert.equal(served.headers.get("x-content-type-options"), "nosniff");

  const svg = await call(github, "POST", "/api/sites/stuart-homeowners/logo", {
    name: "logo.svg", data: svgData(LOGO),
  });
  assert.equal(svg.status, 200);
  assert.equal(svg.body.logo, "/logo.svg");
});

test("the light logo for the dark footer is its own file and config field", async () => {
  const github = repository();
  const png = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
  const upload = await call(github, "POST", "/api/sites/stuart-homeowners/logo/dark", {
    name: "White Logo.png", data: `data:image/png;base64,${png.toString("base64")}`,
  });
  assert.equal(upload.status, 200);
  assert.equal(upload.body.logoOnDark, "/logo-on-dark.png");
  assert.equal(upload.body.logo, "/logo.svg");
  const draft = github.branches.get("draft/stuart-homeowners").files;
  const config = JSON.parse(draft["sites/stuart-homeowners/site.config.json"]);
  assert.equal(config.brand.logoOnDark, "/logo-on-dark.png");
  assert.equal(config.brand.logo, "/logo.svg");
  assert.deepEqual(Buffer.from(draft["sites/stuart-homeowners/public/logo-on-dark.png"]), png);

  const served = await call(github, "GET", "/api/sites/stuart-homeowners/logo/dark");
  assert.equal(served.headers.get("content-type"), "image/png");
  assert.match(served.headers.get("content-security-policy"), /sandbox/);

  const shown = await call(github, "GET", "/api/sites/stuart-homeowners/settings");
  assert.equal(shown.body.brand.logoOnDark, "/logo-on-dark.png");

  const bad = await call(github, "POST", "/api/sites/stuart-homeowners/logo/dark", {
    name: "logo.svg", data: svgData('<svg onload="steal()"></svg>'),
  });
  assert.equal(bad.status, 400);
  assert.equal((await call(github, "POST", "/api/sites/stuart-homeowners/logo/other", {
    name: "logo.png", data: `data:image/png;base64,${png.toString("base64")}`,
  })).status, 404);
});

test("Studio serves the icons page blocks can use, the same ones the site draws", async () => {
  const response = await call(repository(), "GET", "/api/icons");
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(response.body), Object.keys(ICONS_FOR_TEST));
  assert.match(response.body["map-pin"], /^<svg/);
});
