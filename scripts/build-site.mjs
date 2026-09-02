import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteDirectory = process.argv[2];

if (!siteDirectory || !/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/.test(siteDirectory)) {
  console.error("Usage: npm run build:site -- <site-directory>");
  process.exit(1);
}

const siteRoot = resolve(repositoryRoot, "sites", siteDirectory);
const configPath = resolve(siteRoot, "site.config.json");
const contentPath = resolve(siteRoot, "content");
const schemaPath = resolve(repositoryRoot, "packages/config-schema/site.config.schema.json");

if (!existsSync(configPath) || !existsSync(contentPath)) {
  console.error(`Cannot build ${siteDirectory}: expected site.config.json and content/ in sites/${siteDirectory}/.`);
  process.exit(1);
}

const validation = spawnSync(process.execPath, [resolve(repositoryRoot, "node_modules/ajv-cli/dist/index.js"), "validate", "--spec=draft2020", "-s", schemaPath, "-d", configPath], {
  cwd: repositoryRoot,
  encoding: "utf8"
});

if (validation.status !== 0) {
  console.error(`Configuration for ${siteDirectory} is invalid; no site was built.`);
  process.stderr.write(validation.stdout ?? "");
  process.stderr.write(validation.stderr ?? validation.error?.message ?? "");
  process.exit(validation.status ?? 1);
}

const build = spawnSync(process.execPath, [resolve(repositoryRoot, "node_modules/astro/astro.js"), "build", "--root", "packages/template", "--outDir", `../../dist/sites/${siteDirectory}`], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, WICFL_SITE_CONFIG: configPath, WICFL_SITE_CONTENT: contentPath }
});
process.stdout.write(build.stdout ?? "");
process.stderr.write(build.stderr ?? build.error?.message ?? "");
process.exit(build.status ?? 1);
