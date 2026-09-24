import { UserError } from "./errors.js";

// Site settings Pavel can change from Studio, and what a brand-new site starts with. Everything
// here follows packages/config-schema/site.config.schema.json; a test checks generated configs
// against that schema whenever the repository's validator is installed.

export const PRODUCTS = [
  "flood", "homeowners", "renters", "landlord", "umbrella", "contractor",
  "commercial-property", "general-liability", "windstorm", "condo",
];
export const AUDIENCES = ["homeowner", "renter", "landlord", "contractor", "business-owner", "condo-owner"];
export const PROOF_TYPES = ["case-experience", "market-data", "review", "community-partnership", "local-regulation"];

const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Same patterns as scripts/check-production-config.mjs, so Studio shows exactly what would stop
// a launch, before anyone tries.
const BLOCKERS = [
  { regex: /placeholder/i, why: "is still a placeholder" },
  { regex: /^pending_/i, why: "is still pending" },
  { regex: /0000000$/, why: "is still a placeholder phone" },
  { regex: /(?:\+1\d{3}55501\d{2}|(?:\(\d{3}\)|\b\d{3}\b)[ .-]*555[ .-]*01\d{2}\b)/, why: "is a fictional 555 phone" },
  { regex: /\bdemo\b/i, why: 'still says "demo"', only: (path) => path === "brand.name" || path.startsWith("seo.") },
];
const LABELS = {
  "brand.name": "Brand name",
  "contact.trackingPhone": "Phone",
  "contact.displayPhone": "Phone",
  "contact.email": "Email",
  "seo.title": "SEO title",
  "seo.description": "SEO description",
  "seo.primaryKeyword": "Main keyword",
  "seo.secondaryKeywords": "Other keywords",
  "geo.serviceArea": "Service area",
  "analytics.ga4": "Google Analytics (Vic)",
  "analytics.gtm": "Tag Manager (Vic)",
  "crm.formId": "CRM form (Vic)",
};

export function launchBlockers(config) {
  const found = new Map();
  const walk = (value, path) => {
    if (typeof value === "string") {
      for (const rule of BLOCKERS) {
        if (rule.only && !rule.only(path)) continue;
        if (rule.regex.test(value)) {
          const field = path.replace(/\[\d+\]$/, "");
          const label = LABELS[field] || field;
          if (!found.has(label)) found.set(label, `${label} ${rule.why}.`);
        }
      }
    } else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${path}[${index}]`));
    else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) walk(item, path ? `${path}.${key}` : key);
    }
  };
  walk(config, "");
  return [...found.values()];
}

export function settingsOf(config) {
  return {
    brandName: config.brand?.name || "",
    // Placeholders show as empty fields: nothing to "correct", just something still missing.
    phone: /0000000$/.test(config.contact?.trackingPhone || "") ? "" : config.contact?.displayPhone || "",
    email: /^pending_/i.test(config.contact?.email || "") ? "" : config.contact?.email || "",
    seoTitle: config.seo?.title || "",
    seoDescription: config.seo?.description || "",
    primaryKeyword: config.seo?.primaryKeyword || "",
    secondaryKeywords: (config.seo?.secondaryKeywords || []).join("\n"),
    serviceArea: (config.geo?.serviceArea || []).join("\n"),
  };
}

function text(value, label, min, max) {
  const clean = String(value ?? "").replace(/\s+/g, " ").trim();
  if (clean.length < min) throw new UserError(`${label} needs at least ${min} characters.`, 400);
  if (clean.length > max) throw new UserError(`${label} can have at most ${max} characters.`, 400);
  return clean;
}

function lines(value, label, { min, max, minLength, maxLength }) {
  const items = [...new Set(String(value ?? "").split(/\n|,/).map((item) => item.trim()).filter(Boolean))];
  if (items.length < min) {
    throw new UserError(`${label} needs at least ${min} ${min === 1 ? "entry" : "entries"}.`, 400);
  }
  if (items.length > max) throw new UserError(`${label} can have at most ${max} entries.`, 400);
  for (const item of items) {
    if (item.length < minLength || item.length > maxLength) {
      throw new UserError(`Each ${label.toLowerCase()} entry must be ${minLength} to ${maxLength} characters.`, 400);
    }
  }
  return items;
}

// "(772) 247-0106" or "772.247.0106" -> tracking "+17722470106", display "(772) 247-0106".
export function phoneFrom(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) throw new UserError("Enter a 10-digit US phone number.", 400);
  return {
    trackingPhone: `+1${national}`,
    displayPhone: `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`,
  };
}

export function applySettings(config, input) {
  const next = structuredClone(config);
  next.brand.name = text(input.brandName, "Brand name", 2, 100);
  // Phone and email can stay empty until Kevin provides them; the launch check keeps blocking.
  if (String(input.phone ?? "").trim()) Object.assign(next.contact, phoneFrom(input.phone));
  const email = String(input.email ?? "").trim();
  if (email) {
    if (!EMAIL.test(email) || email.length > 254) throw new UserError("Enter a valid email address.", 400);
    next.contact.email = email;
  }
  next.seo.title = text(input.seoTitle, "SEO title", 10, 60);
  next.seo.description = text(input.seoDescription, "SEO description", 50, 160);
  next.seo.primaryKeyword = text(input.primaryKeyword, "Main keyword", 3, 100);
  next.seo.secondaryKeywords = lines(input.secondaryKeywords, "Other keywords", {
    min: 0, max: 10, minLength: 3, maxLength: 100,
  });
  next.geo.serviceArea = lines(input.serviceArea, "Service area", { min: 1, max: 25, minLength: 2, maxLength: 80 });
  return next;
}

export function slugFor(city, product) {
  return `${city}-${product}`
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
}

const productLabel = (product) =>
  product.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");

// A new site starts with everything the schema requires. What only Kevin or Vic can supply
// (phone, email, analytics, CRM) starts as a marked placeholder, so the launch check blocks it.
export function newSiteConfig(input) {
  const product = String(input.product || "");
  if (!PRODUCTS.includes(product)) throw new UserError("Choose what the site sells.", 400);
  const audience = String(input.audience || "");
  if (!AUDIENCES.includes(audience)) throw new UserError("Choose who the site is for.", 400);
  const domain = String(input.domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "")
    .replace(/\/.*$/, "");
  if (!DOMAIN.test(domain)) throw new UserError("Enter the site's domain, like portsaintluciehomeinsurance.com.", 400);
  const city = text(input.city, "City", 2, 80);
  const county = text(input.county, "County", 2, 80);
  const slug = slugFor(city, product);
  if (slug.length < 3) throw new UserError("The city name is too short.", 400);
  const proofType = String(input.proofType || "");
  if (!PROOF_TYPES.includes(proofType)) throw new UserError("Choose what kind of local proof you have.", 400);

  return {
    slug,
    domain,
    brand: { name: text(input.brandName, "Brand name", 2, 100), parent: "WICFL" },
    niche: { product, audience },
    geo: {
      city,
      county,
      state: "FL",
      serviceArea: lines(input.serviceArea || city, "Service area", { min: 1, max: 25, minLength: 2, maxLength: 80 }),
    },
    locale: { primary: "en", alternates: [] },
    contact: {
      trackingPhone: "+10000000000",
      displayPhone: "Phone pending",
      email: `pending_email@${domain}`,
    },
    products: [product],
    seo: {
      title: text(input.seoTitle, "SEO title", 10, 60),
      description: text(input.seoDescription, "SEO description", 50, 160),
      primaryKeyword: text(input.primaryKeyword, "Main keyword", 3, 100),
      secondaryKeywords: [],
    },
    analytics: { ga4: "G-PLACEHOLDER", gtm: "GTM-PLACEHOLDER" },
    crm: { formId: "PENDING_GHL_FORM_ID", leadSource: slug },
    theme: { variant: "coastal", accentColor: "#0F6B75" },
    differentiation: {
      localProof: [{ type: proofType, summary: text(input.proofSummary, "Local proof", 20, 500) }],
      uniqueSections: [
        {
          title: text(input.sectionTitle, "Unique section title", 5, 100),
          rationale: text(input.sectionRationale, "Why it's unique to this market", 20, 500),
        },
      ],
    },
  };
}

// Three starter pages: home, contact and one coverage page, each with a clear note to replace it.
export function starterPages(config) {
  const label = productLabel(config.niche.product);
  const where = `${config.geo.city}, FL`;
  const page = (fields, body) => {
    const header = Object.entries(fields).map(([key, value]) =>
      `${key}: ${key === "pageType" ? value : JSON.stringify(value)}`);
    return `---\n${header.join("\n")}\n---\n\n${body}\n`;
  };
  const note = "Replace this text with the real page before publishing.";
  return {
    "index.md": page(
      { title: `${label} Insurance in ${where}`, pageType: "home" },
      `${note}\n\nIntroduce ${config.brand.name} and who it helps in ${config.geo.city}.`,
    ),
    "contact.md": page(
      { title: `Get a ${label} Insurance Quote in ${where}`, pageType: "content", navLabel: "Contact" },
      `${note}\n\nTell visitors how to reach the agency and what happens after they call.`,
    ),
    [`${config.niche.product}-insurance.md`]: page(
      { title: `${label} Insurance in ${where}`, pageType: "coverage", navLabel: `${label} Insurance` },
      `${note}\n\nExplain this coverage for ${config.geo.city} specifically, ` +
        "using the local proof in the site settings.",
    ),
  };
}

export function formatConfig(config) {
  return `${JSON.stringify(config, null, 2)}\n`;
}
