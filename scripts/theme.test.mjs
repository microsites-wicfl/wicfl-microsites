import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { checkTheme, textOnPrimary } from "../packages/config-schema/theme.mjs";

const root = process.cwd();
const invalidSite = resolve(root, "sites/_theme-contrast-invalid");

test("accepts accessible theme colors and selects the higher-contrast primary text", () => {
  assert.deepEqual(checkTheme({ accentColor: "#005F73", secondaryColor: "#0077B6", surfaceColor: "#F2F8FA", footerColor: "#182C3B" }), []);
  assert.equal(textOnPrimary("#005F73"), "#ffffff");
  assert.equal(textOnPrimary("#F2C94C"), "#12181f");
});

test("reports each inaccessible theme color", () => {
  const problems = checkTheme({ accentColor: "#9FD3E0", secondaryColor: "#DDEEFF", surfaceColor: "#12181F", footerColor: "#FFFFFF" });
  assert.deepEqual(problems.map((problem) => problem.field), ["accentColor", "surfaceColor", "footerColor", "footerColor", "secondaryColor"]);
});

test("a theme with insufficient contrast fails build-site", () => {
  const config = JSON.parse(readFileSync(resolve(root, "sites/_example/site.config.json"), "utf8"));
  config.slug = "theme-contrast-invalid";
  config.theme.accentColor = "#9FD3E0";
  mkdirSync(resolve(invalidSite, "content"), { recursive: true });
  writeFileSync(resolve(invalidSite, "site.config.json"), JSON.stringify(config));
  writeFileSync(resolve(invalidSite, "content/index.md"), "---\ntitle: Theme fixture\npageType: home\n---\n\nFixture.\n");
  try {
    assert.throws(() => execFileSync(process.execPath, ["scripts/build-site.mjs", "_theme-contrast-invalid"], { cwd: root, encoding: "utf8", stdio: "pipe" }), (error) => `${error.stdout}\n${error.stderr}`.includes("theme.accentColor #9FD3E0 is too light for links"));
  } finally {
    rmSync(invalidSite, { recursive: true, force: true });
  }
});
