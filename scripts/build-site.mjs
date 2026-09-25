import { existsSync, cpSync, copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { validateColumns } from "../packages/template/src/lib/remark-columns.mjs";
import { checkTheme, FONT_FAMILIES } from "../packages/config-schema/theme.mjs";

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

const config = JSON.parse(readFileSync(configPath, "utf8"));

const themeProblems = checkTheme(config.theme);
if (themeProblems.length > 0) {
  console.error(`Theme contrast check failed for ${configPath}:`);
  for (const problem of themeProblems) {
    console.error(`  - theme.${problem.field} ${problem.color} is too light for ${problem.description}: ${problem.contrast.toFixed(1)}:1, needs ${problem.minimum}:1`);
  }
  process.exit(1);
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

try {
  for (const markdownPath of markdownFiles(contentPath)) {
    validateColumns(readFileSync(markdownPath, "utf8"), markdownPath);
  }
} catch (error) {
  console.error(error.message);
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
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

// Per-site static assets (a logo, other brand images) live in sites/<slug>/public/ and are not
// part of the shared template, so Astro's own build never sees them. Copy them over the built
// output afterward, same as Astro's own publicDir convention: a file at public/logo.svg is
// served from "/logo.svg". Optional: most sites have no public/ directory yet.
const sitePublicDir = resolve(siteRoot, "public");
if (existsSync(sitePublicDir)) {
  cpSync(sitePublicDir, resolve(repositoryRoot, "dist/sites", siteDirectory), { recursive: true });
}

const selectedFonts = new Set([config.theme.headingFont ?? "georgia", config.theme.bodyFont ?? "system-sans"]);
const fontsOutput = resolve(repositoryRoot, "dist/sites", siteDirectory, "fonts");
for (const font of selectedFonts) {
  const fontDefinition = FONT_FAMILIES[font];
  if (!fontDefinition.package) continue;
  mkdirSync(fontsOutput, { recursive: true });
  for (const weight of [400, 700]) {
    const filename = `${fontDefinition.package}-latin-${weight}-normal.woff2`;
    copyFileSync(resolve(repositoryRoot, "node_modules", "@fontsource", fontDefinition.package, "files", filename), resolve(fontsOutput, filename));
  }
}

process.exit(0);
