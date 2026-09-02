import { existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const repositoryRoot = process.cwd();
const base = process.argv[2];
const head = process.argv[3];

function allSites() {
  const sitesDirectory = resolve(repositoryRoot, "sites");
  return readdirSync(sitesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(sitesDirectory, entry.name, "site.config.json")))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function changedFiles() {
  if (!base || !head) return null;
  try {
    return execFileSync("git", ["diff", "--name-only", base, head], { cwd: repositoryRoot, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return null;
  }
}

const files = changedFiles();
const sharedInputChanged = files?.some((file) =>
  file === "package.json" ||
  file === "package-lock.json" ||
  file.startsWith("packages/template/") ||
  file.startsWith("packages/config-schema/") ||
  file.startsWith("scripts/") ||
  file === ".github/workflows/ci.yml"
);

const sites = !files || sharedInputChanged
  ? allSites()
  : [...new Set(files
      .map((file) => /^sites\/([^/]+)\//.exec(file)?.[1])
      .filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));

process.stdout.write(`matrix=${JSON.stringify({ include: sites.map((site) => ({ site })) })}\n`);
