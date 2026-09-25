# Site config schema

**Version 1.1 · 31 Aug 2026, updated 4 Sep 2026 · Closed by W-020.** Backward-compatible addition on 4 Sep: optional `brand.logo` (see design decision 7). Existing configs without it are still valid; the field was added as optional specifically so nothing else had to change

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
  "brand": { "name": "Stuart Flood Insurance", "parent": "WICFL", "logo": "/logo.svg" },
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

Every field has a type, description, and applicable pattern in the JSON Schema. It rejects unknown fields. The two executable examples live in `packages/config-schema/examples/`. The contract overview intentionally includes `licenseNumber` to demonstrate the optional-present case; WICFL sites normally omit it under Kevin's 22 Sep 2026 decision.

## Design decisions

### 1. `serviceArea` is metadata only

`geo.serviceArea` records places the agency may serve for eligibility and on-site metadata. It must never generate routes, location pages, or keyword copy. A nearby-city query is handled by one strong site with genuine primary-market evidence, useful service information, and any page that earns its existence through original content—not by city-name substitution. This avoids encoding the doorway mechanism prohibited by the swap test.

### 2. `products` is a fixed enum

Products use the supported shared-template catalog: flood, homeowners, renters, landlord, umbrella, contractor, commercial-property, general-liability, windstorm, and condo. The template can therefore guarantee a correct coverage-page implementation for each selected product. A new product is a deliberate schema-and-template change, rather than silent text that produces an incomplete site.

### 3. Theme stays in config, with constrained tokens

`theme.variant` controls only the prebuilt shape and shadow personality. `accentColor` remains the accessible primary color for links and controls. The optional `secondaryColor` is restricted to decorative details such as borders and icons, never text. `surfaceColor` replaces the selected variant's surface token and `footerColor` sets the footer background. All four colors are six-digit hex values and are checked during every site build for the relevant WCAG contrast ratio.

`headingFont` and `bodyFont` are optional closed-list choices: `system-sans`, `georgia`, `inter`, `source-sans-3`, `nunito-sans`, `montserrat`, `lora`, `merriweather`, `playfair-display`, and `fraunces`. The defaults are `georgia` for headings and `system-sans` for body text. Downloadable choices are self-hosted Latin WOFF2 assets at weights 400 and 700, with `font-display: swap`; builds copy only the families selected by that site and preload the heading font. Omitting every new field retains the existing site appearance exactly.

### 4. NAP has one local capture, then launch reconciliation

The config is the template's single NAP source: it has exactly one name, tracking phone, and display phone, plus an optional address (WICFL sites carry none since 23 Sep 2026, by Kevin's decision; the template renders it only when present). JSON Schema cannot truthfully validate a remote Google Business Profile, so it does not pretend to. When a GBP exists, its optional Place ID enables W-029 launch QA to compare the config to the canonical profile before publishing. Until then, the approved capture is the source of truth; duplicating NAP fields would create drift.

### 5. Differentiation is structured for humans; CI evaluates output

`differentiation.localProof` and `uniqueSections` are required structured declarations. They make the author state the evidence and the site-specific information architecture before generation. W-027 must evaluate rendered markdown and pages across the portfolio, because declarations cannot prove that published copy is unique. This keeps the gate grounded in the actual thing Google and visitors see, while preserving useful review input.

### 6. Required fields protect legal operation and measurement

The root schema requires contact, analytics, CRM, SEO, products, locale, geography, and differentiation. `contact.trackingPhone` and both differentiation arrays are required. This prevents a site from validating without call attribution, lead routing, and a human differentiation record. Clearly marked placeholders are allowed for systems that have not yet been provisioned, but they remain explicit work to close before launch QA.

### 7. Logo is optional, root-relative, and lives beside the site's own content

`brand.logo` is an optional path such as `/logo.svg`. Without it, the template renders the
brand name as text, exactly as every site did before this field existed — adding it never
breaks an existing site. The image file itself is not a config value: it lives at
`sites/<slug>/public/<file>`, inside the operator's own site directory, and the generator
copies that folder over the built output the same way Astro's own `public/` convention works.
This keeps the operator boundary intact (a logo is still something Pavel can add without
touching the shared template) while keeping brand assets out of the JSON config, where a binary
file has no business being.

### 8. License number is optional by business decision

On 22 Sep 2026 Kevin decided WICFL sites do not display an agency license number. Florida DFS
guidance requires it on policy applications, not advertising. `contact.licenseNumber` therefore
remains valid when present, but is optional and rendered only when supplied.

## Adding a field without breaking existing sites

1. Confirm the field belongs in operator config rather than shared template code or markdown.
2. Add it as optional with a description and validation to the schema; preserve `additionalProperties: false`.
3. Add it to examples when it has an established safe value, then validate every existing config.
4. Update the template and this document in the same change. Make it required only in a later, explicitly versioned migration after all sites have a value.

Never add a field that turns cities, keywords, or content fragments into programmatic pages. The swap test remains the governing constraint.
