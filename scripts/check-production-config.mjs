import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// W-103: the JSON schema validates *shape*, not *readiness*. A config can be schema-valid and
// still carry a fake license number or a placeholder analytics ID all the way onto a live public
// page, which for Florida insurance advertising is not a cosmetic bug. This is the second gate:
// it rejects known placeholder patterns in a real site's built config before it ever reaches a
// production deploy. It intentionally does NOT run on preview/branch deploys or on plain builds,
// because Pavel iterates with some fields still pending (see the schema's own note that a
// "clearly marked placeholder is valid before accounts are provisioned"); it runs immediately
// before the step that attaches a site to its real custom domain.
//
// Fixture sites are exempt by convention: any site directory starting with "_" (sites/_example,
// sites/_invalid-config-test, ...) exists specifically to carry placeholder data and is never
// deployed to a real domain, so it is skipped entirely rather than special-cased field by field.

const repositoryRoot = resolve(import.meta.dirname, "..");
const siteDirectory = process.argv[2];

if (!siteDirectory) {
  console.error("Usage: node scripts/check-production-config.mjs <site-directory>");
  process.exit(1);
}

if (siteDirectory.startsWith("_")) {
  console.log(`Skipping production-readiness check for fixture site "${siteDirectory}" (name starts with "_").`);
  process.exit(0);
}

const sitesRoot = process.env.WICFL_SITES_ROOT || resolve(repositoryRoot, "sites");
const configPath = resolve(sitesRoot, siteDirectory, "site.config.json");
if (!existsSync(configPath)) {
  console.error(`Cannot check ${siteDirectory}: no site.config.json at ${configPath}.`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));

// Known placeholder patterns. Matched case-insensitively against every string value in the
// config, not just specific fields, so a placeholder in a field nobody thought to hardcode a
// check for still gets caught.
const patterns = [
  { name: "placeholder marker", regex: /placeholder/i },
  { name: "pending marker", regex: /^pending_/i },
  { name: "placeholder tracking phone (ends in 0000000)", regex: /0000000$/ },
  { name: "fictional 555-01xx phone", regex: /(?:\+1\d{3}55501\d{2}|(?:\(\d{3}\)|\b\d{3}\b)[ .-]*555[ .-]*01\d{2}\b)/ },
  { name: "demo marker", regex: /\bdemo\b/i }
];

const findings = [];

function walk(value, path) {
  if (typeof value === "string") {
    for (const pattern of patterns) {
      if (pattern.name === "demo marker" && path !== "brand.name" && !path.startsWith("seo.")) continue;
      if (pattern.regex.test(value)) {
        findings.push({ path, value, pattern: pattern.name });
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      walk(nested, path ? `${path}.${key}` : key);
    }
  }
}

walk(config, "");

const contentFindings = [];
const contentRoot = resolve(sitesRoot, siteDirectory, "content");
const starterText = /\[(?:Write|Name|Explain) [^\]\n]*\](?!\()/;

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

if (existsSync(contentRoot)) {
  for (const path of markdownFiles(contentRoot)) {
    const text = readFileSync(path, "utf8");
    const relativePath = path.slice(sitesRoot.length + 1).replaceAll("\\", "/");
    if (text.includes("/images/sample-")) contentFindings.push({ path: relativePath, type: "sample image" });
    if (text.includes("Replace this text with the real page before publishing.") || starterText.test(text)) {
      contentFindings.push({ path: relativePath, type: "starter text" });
    }
  }
}

if (findings.length > 0 || contentFindings.length > 0) {
  console.error(`Production-readiness check failed for sites/${siteDirectory}/:`);
  for (const finding of findings) {
    console.error(`  - ${finding.path}: "${finding.value}" looks like a ${finding.pattern}`);
  }
  for (const finding of contentFindings) console.error(`  - ${finding.path}: ${finding.type}`);
  console.error("\nThis site still carries placeholder data or starter content. It cannot go to a real production deploy.");
  process.exit(1);
}

console.log(`Production-readiness check passed for sites/${siteDirectory}/site.config.json.`);
