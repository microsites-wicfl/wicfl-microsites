import { existsSync, readFileSync } from "node:fs";
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

const configPath = resolve(repositoryRoot, "sites", siteDirectory, "site.config.json");
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
  { name: "placeholder tracking phone (ends in 0000000)", regex: /0000000$/ }
];

const findings = [];

function walk(value, path) {
  if (typeof value === "string") {
    for (const pattern of patterns) {
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

if (findings.length > 0) {
  console.error(`Production-readiness check failed for sites/${siteDirectory}/site.config.json:`);
  for (const finding of findings) {
    console.error(`  - ${finding.path}: "${finding.value}" looks like a ${finding.pattern}`);
  }
  console.error("\nThis config still carries placeholder data. It cannot go to a real production deploy.");
  process.exit(1);
}

console.log(`Production-readiness check passed for sites/${siteDirectory}/site.config.json.`);
