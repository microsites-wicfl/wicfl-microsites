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
  { name: "demo marker", regex: /\bdemo\b/i, visible: true },
  { name: "internal marker", regex: /\binternal\b/i, visible: true },
  { name: "unpublished-content marker", regex: /\bnot published\b/i, visible: true },
  { name: "template marker", regex: /\btemplate preview\b|\bmicrosite template\b/i, visible: true }
];

const findings = [];

function walk(value, path) {
  if (typeof value === "string") {
    for (const pattern of patterns) {
      if (pattern.visible && path !== "brand.name" && !path.startsWith("seo.")) continue;
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
const testPageName = /(?:^|[-_])(demo|test|sample|fixture|placeholder)(?:[-_]|$)/i;
const testPageText = /\bdemo\b|\bplaceholder\b|\btest page\b|\binternal preview\b/i;
const contentPages = new Map();
let privacyPolicyHasBlockedContent = false;

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

function pageFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fields: {}, body: text };
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(title|description):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return { fields, body: match[2] };
}

if (existsSync(contentRoot)) {
  for (const path of markdownFiles(contentRoot)) {
    const text = readFileSync(path, "utf8");
    const relativePath = path.slice(contentRoot.length + 1).replaceAll("\\", "/");
    const contentPath = `content/${relativePath}`;
    const page = pageFrontmatter(text);
    contentPages.set(relativePath, page);
    const hasSampleImage = text.includes("/images/sample-");
    const hasStarterText = text.includes("Replace this text with the real page before publishing.") || starterText.test(text);
    if (hasSampleImage) contentFindings.push(`${contentPath}: sample image`);
    if (hasStarterText) {
      contentFindings.push(`${contentPath}: starter text`);
    }
    const filename = relativePath.split("/").at(-1).replace(/\.md$/, "");
    const isTestPage = filename !== "index" && (testPageName.test(filename) || testPageText.test(page.fields.title ?? "") || testPageText.test(page.fields.description ?? ""));
    if (isTestPage) {
      contentFindings.push(`${contentPath}: looks like a test page (it would go live and into the sitemap); delete it in Studio`);
    }
    if (relativePath === "privacy-policy.md" && (hasStarterText || isTestPage)) privacyPolicyHasBlockedContent = true;
  }
}

const privacyPolicy = contentPages.get("privacy-policy.md");
if (!privacyPolicy) {
  contentFindings.push('content/privacy-policy.md: missing. The quote form collects personal data, so the site cannot go live without a Privacy Policy page (title exactly "Privacy Policy", created in Studio).');
} else if (!privacyPolicy.fields.title) {
  contentFindings.push("content/privacy-policy.md: missing a title in frontmatter");
} else if (privacyPolicy.body.length < 1500) {
  contentFindings.push("content/privacy-policy.md: body is shorter than 1,500 characters");
} else if (privacyPolicyHasBlockedContent) {
  contentFindings.push("content/privacy-policy.md: contains starter text or looks like a test page");
}

if (findings.length > 0 || contentFindings.length > 0) {
  console.error(`Production-readiness check failed for sites/${siteDirectory}/:`);
  for (const finding of findings) {
    console.error(`  - ${finding.path}: "${finding.value}" looks like a ${finding.pattern}`);
  }
  for (const finding of contentFindings) console.error(`  - ${finding}`);
  console.error("\nThis site still carries placeholder data, starter content, test pages, or missing legal content. It cannot go to a real production deploy.");
  process.exit(1);
}

console.log(`Production-readiness check passed for sites/${siteDirectory}/site.config.json.`);
