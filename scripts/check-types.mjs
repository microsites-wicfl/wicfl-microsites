import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = resolve(repositoryRoot, "sites", "_example", "content");
const astroCli = resolve(repositoryRoot, "node_modules", "astro", "astro.js");

const check = spawnSync(process.execPath, [astroCli, "check", "--root", "packages/template", "--tsconfig", "tsconfig.json"], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, WICFL_SITE_CONTENT: contentPath }
});

process.stdout.write(check.stdout ?? "");
process.stderr.write(check.stderr ?? check.error?.message ?? "");
process.exit(check.status ?? 1);
