# Site config schema

**Draft v0.1 · 25 Aug 2026 · Closed in backlog item W-020**

This is the contract between the template and each site, and it is the most important
artifact in the project. Everything downstream, including all provisioning automation,
is built on top of it. Changing it after sites exist is expensive.

```json
{
  "slug": "stuart-flood",
  "domain": "stuartfloodinsurance.com",
  "brand": { "name": "Stuart Flood Insurance", "parent": "WICFL" },

  "niche": { "product": "flood", "audience": "homeowner" },
  "geo": {
    "city": "Stuart", "county": "Martin", "state": "FL",
    "serviceArea": ["Stuart", "Palm City", "Jensen Beach", "Hobe Sound"]
  },

  "locale": { "primary": "en", "alternates": [] },

  "contact": {
    "trackingPhone": "+1-772-000-0000",
    "displayPhone": "(772) 000-0000",
    "email": "...",
    "address": { "street": "...", "city": "...", "state": "FL", "zip": "..." },
    "licenseNumber": "..."
  },

  "products": ["flood", "homeowners", "umbrella"],

  "seo": {
    "title": "...", "description": "...",
    "primaryKeyword": "...", "secondaryKeywords": ["..."]
  },

  "analytics": { "ga4": "G-...", "gtm": "GTM-..." },
  "crm": { "formId": "...", "leadSource": "stuart-flood" },

  "differentiation": {
    "localProof": ["..."],
    "uniqueSections": ["..."]
  }
}
```

## Why `differentiation` is a required field

It forces every site to declare, in writing, what makes it different from every other site
**before it can be generated**. A site that cannot fill this in is a site that should not
be built. This is the schema level counterpart to the CI differentiation gate.

## Open questions for W-020

- Does `serviceArea` drive generated location pages, or is it metadata only? If it generates
  pages, that is the exact mechanism Google's doorway policy describes, and it needs a
  per area content requirement attached.
- Should `products` map to a fixed enum so the template can guarantee coverage pages exist?
- Where does per site design variation live: a `theme` block in config, or a separate
  overrides file? Config is simpler; overrides are more flexible. Lean config until proven insufficient.
- NAP fields must match the Google Business Profile exactly. Should validation enforce that
  against a canonical source rather than trusting per site entry?
