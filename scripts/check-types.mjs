import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = resolve(repositoryRoot, "sites", "_example", "content");
// :::areas reads geo.serviceArea at render time (see remark-columns.mjs), so type-checking
// _example's content needs its config too, not just its content directory.
const configPath = resolve(repositoryRoot, "sites", "_example", "site.config.json");
const astroCli = resolve(repositoryRoot, "node_modules", "astro", "astro.js");

const check = spawnSync(process.execPath, [astroCli, "check", "--root", "packages/template", "--tsconfig", "tsconfig.json"], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, WICFL_SITE_CONTENT: contentPath, WICFL_SITE_CONFIG: configPath }
});

process.stdout.write(check.stdout ?? "");
process.stderr.write(check.stderr ?? check.error?.message ?? "");
process.exit(check.status ?? 1);
