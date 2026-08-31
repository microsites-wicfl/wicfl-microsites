# Site config schema

**Version 1.0 · 31 Aug 2026 · Closed by W-020**

`packages/config-schema/site.config.schema.json` is the machine-validatable contract between the shared Astro template and each WICFL microsite. An operator creates a site by editing this configuration and markdown only; the schema intentionally provides no HTML, component, CSS, route, or arbitrary override field.

Validate a config with:

```sh
npx --yes ajv-cli validate --spec=draft2020 -s packages/config-schema/site.config.schema.json -d path/to/site.config.json
```

## Contract overview

```json
{
  "slug": "stuart-flood",
  "domain": "stuartfloodinsurance.com",
  "brand": { "name": "Stuart Flood Insurance", "parent": "WICFL" },
  "niche": { "product": "flood", "audience": "homeowner" },
  "geo": { "city": "Stuart", "county": "Martin", "state": "FL", "serviceArea": ["Stuart", "Palm City"] },
  "locale": { "primary": "en", "alternates": [] },
  "contact": { "trackingPhone": "+17720000000", "displayPhone": "(772) 000-0000", "email": "hello@example.com", "address": { "street": "123 Example Avenue", "city": "Stuart", "state": "FL", "zip": "34994" }, "licenseNumber": "PLACEHOLDER-FL-LICENSE" },
  "products": ["flood", "homeowners"],
  "seo": { "title": "Human-reviewed default title", "description": "Human-reviewed default meta description with original local context.", "primaryKeyword": "flood insurance Stuart FL", "secondaryKeywords": [] },
  "analytics": { "ga4": "G-PLACEHOLDER", "gtm": "GTM-PLACEHOLDER" },
  "crm": { "formId": "PENDING_GHL_FORM_ID", "leadSource": "stuart-flood" },
  "theme": { "variant": "coastal", "accentColor": "#006D77" },
  "differentiation": { "localProof": [{ "type": "market-data", "summary": "Specific evidence to verify before publishing." }], "uniqueSections": [{ "title": "Local context", "rationale": "Why this needs evidence unique to this market." }] }
}
```

Every field has a type, description, and applicable pattern in the JSON Schema. It rejects unknown fields. The two executable examples live in `packages/config-schema/examples/`.

## Design decisions

### 1. `serviceArea` is metadata only

`geo.serviceArea` records places the agency may serve for eligibility and on-site metadata. It must never generate routes, location pages, or keyword copy. A nearby-city query is handled by one strong site with genuine primary-market evidence, useful service information, and any page that earns its existence through original content—not by city-name substitution. This avoids encoding the doorway mechanism prohibited by the swap test.

### 2. `products` is a fixed enum

Products use the supported shared-template catalog: flood, homeowners, renters, landlord, umbrella, contractor, commercial-property, general-liability, windstorm, and condo. The template can therefore guarantee a correct coverage-page implementation for each selected product. A new product is a deliberate schema-and-template change, rather than silent text that produces an incomplete site.

### 3. Theme stays in config, with constrained tokens

Optional `theme` configures only a prebuilt variant and an accent color. This follows the project default of config over overrides, lets an operator vary a site without editing code, and prevents per-site CSS or component forks. If future requirements exceed these design tokens, extend the shared template first; do not add arbitrary overrides.

### 4. NAP has one local capture, then launch reconciliation

The config is the template's single NAP source: it has exactly one name, address, tracking phone, display phone, and license number. JSON Schema cannot truthfully validate a remote Google Business Profile, so it does not pretend to. When a GBP exists, its optional Place ID enables W-029 launch QA to compare the config to the canonical profile before publishing. Until then, the approved capture is the source of truth; duplicating NAP fields would create drift.

### 5. Differentiation is structured for humans; CI evaluates output

`differentiation.localProof` and `uniqueSections` are required structured declarations. They make the author state the evidence and the site-specific information architecture before generation. W-027 must evaluate rendered markdown and pages across the portfolio, because declarations cannot prove that published copy is unique. This keeps the gate grounded in the actual thing Google and visitors see, while preserving useful review input.

### 6. Required fields protect legal operation and measurement

The root schema requires contact, analytics, CRM, SEO, products, locale, geography, and differentiation. `contact.licenseNumber`, `contact.trackingPhone`, and both differentiation arrays are required. This prevents a site from validating without the minimum legal disclosure, call attribution, lead routing, and human differentiation record. Clearly marked placeholders are allowed for systems that have not yet been provisioned, but they remain explicit work to close before launch QA.

## Adding a field without breaking existing sites

1. Confirm the field belongs in operator config rather than shared template code or markdown.
2. Add it as optional with a description and validation to the schema; preserve `additionalProperties: false`.
3. Add it to examples when it has an established safe value, then validate every existing config.
4. Update the template and this document in the same change. Make it required only in a later, explicitly versioned migration after all sites have a value.

Never add a field that turns cities, keywords, or content fragments into programmatic pages. The swap test remains the governing constraint.
