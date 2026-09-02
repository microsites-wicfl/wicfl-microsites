import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteDirectory = process.argv[2];
const siteRoot = resolve(repositoryRoot, "sites", siteDirectory || "");
const configPath = resolve(siteRoot, "site.config.json");
const contentPath = resolve(siteRoot, "content");

if (!siteDirectory || !existsSync(configPath) || !existsSync(contentPath)) {
  console.error("Usage: npm run dev -- <site-directory> (requires site.config.json and content/).");
  process.exit(1);
}

const dev = spawnSync(process.execPath, [resolve(repositoryRoot, "node_modules/astro/astro.js"), "dev", "--root", "packages/template"], {
  cwd: repositoryRoot,
  stdio: "inherit",
  env: { ...process.env, WICFL_SITE_CONFIG: configPath, WICFL_SITE_CONTENT: contentPath }
});
process.exit(dev.status ?? 1);
