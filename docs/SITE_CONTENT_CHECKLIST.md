# Site content checklist

**Version 1.0 · 8 Sep 2026 · What every site needs to exist, before it's ready for QA.**

This is not the launch QA checklist — that's `docs/QA_CHECKLIST.md`, and it asks "is this
specific page ready to publish." This is earlier and more basic: for any new site, what
config fields and what content actually have to exist in the first place. Use it when starting
a new site, or when checking how close an existing one (like `stuart-homeowners`) is to being
real instead of a placeholder demo.

Everything here traces back to `packages/config-schema/site.config.schema.json` and
`docs/SITE_CONFIG_SCHEMA.md` for the config, and `docs/CONTENT_STANDARDS.md` for the writing
rules — this page doesn't invent anything new, it just puts both in one place, organized as a
checklist instead of a schema reference.

## 1 · `site.config.json` — every field the schema requires

The schema rejects unknown fields and requires all of the groups below (`additionalProperties:
false` at every level). A clearly marked placeholder is allowed for anything not provisioned
yet, but it stays visible work until it's real — the production gate (W-103) blocks a real
deploy if any of these are still placeholders.

| Field | Required? | Who supplies it |
|---|---|---|
| `slug`, `domain` | Required | Set once, at site creation |
| `brand.name`, `brand.parent` (always `"WICFL"`) | Required | Kevin approves the public business name |
| `brand.logo` | Optional (file lives in `sites/<slug>/public/`) | Kevin's brand assets |
| `niche.product`, `niche.audience` | Required | Kevin (niche), from the fixed catalog below |
| `geo.city`, `geo.county`, `geo.state` (always `"FL"`), `geo.serviceArea` | Required | Kevin/Pavel, the real primary market — `serviceArea` is metadata only, it never becomes pages |
| `locale.primary`, `locale.alternates` | Required | Set once, at site creation |
| `contact.trackingPhone`, `contact.displayPhone` | Required | Provisioned in GoTo (W-024) |
| `contact.email` | Required | Kevin's approved public contact |
| `contact.address` (street, city, state, zip) | Optional, not used on WICFL sites | If present, the template renders it; Kevin decided on 23 Sep 2026 that WICFL sites show no mailing address |
| `contact.licenseNumber` | Optional, not used on WICFL sites | If present, the template renders it; Kevin decided on 22 Sep 2026 that WICFL sites do not carry one |
| `contact.googleBusinessProfilePlaceId` | Optional | Once a GBP exists (W-006), for NAP reconciliation |
| `products` (array, same catalog as `niche.product`) | Required | Which coverage pages this site will have |
| `seo.title`, `seo.description`, `seo.primaryKeyword`, `seo.secondaryKeywords` | Required | Pavel, from real keyword research — this is W-016's output |
| `analytics.ga4`, `analytics.gtm` | Required | Real IDs once GA4/GTM exist (W-025); placeholder allowed until then |
| `crm.formId`, `crm.leadSource` | Required | Real GoHighLevel form ID once the sub-account exists (W-025); placeholder allowed until then |
| `theme.variant`, `theme.accentColor` | Optional | Cosmetic only, pick one of the three prebuilt variants |
| `differentiation.localProof` (≥1), `differentiation.uniqueSections` (≥1) | Required | Pavel, real evidence and real site-specific sections — see below, this is not boilerplate |

**The fixed product catalog** (used by both `niche.product` and `products`): `flood`,
`homeowners`, `renters`, `landlord`, `umbrella`, `contractor`, `commercial-property`,
`general-liability`, `windstorm`, `condo`. A product outside this list needs a schema change
first, it's not something to work around in content.

**`differentiation` is not paperwork.** `localProof` needs real, verifiable local facts (case
experience, market data, a review, a community partnership, a local regulation) — each one at
least 20 characters of actual substance, not a placeholder sentence. `uniqueSections` needs real
working titles for sections that only make sense for this specific market. Both exist so the
person writing the site states, before writing a word of the actual pages, what makes this site
different from every other one — the same question the swap test asks per page, asked once per
site before content starts.

## 2 · Content pages

Per `docs/CONTENT_STANDARDS.md`, a site starts at **15 to 25 pages** and only expands past that
once it's ranking and producing leads — don't build the long tail speculatively.

- Exactly **one** `pageType: home` page (`content/index.md`), the site's front page.
- The rest are `pageType: content` (general pages — About, service-area explainers, FAQs) or
  `pageType: coverage` (one per relevant entry in `products`, explaining what that coverage
  does and doesn't include).
- Every page follows the frontmatter contract and worked example in
  `docs/OPERATOR_GUIDE.md` Part 2, written by the person publishing it, run through the
  `differentiation-audit` skill while it's being written, and checked against the self-review
  checklist in `docs/CONTENT_STANDARDS.md` before it publishes.
- **No page exists unless something links to it.** There's no site navigation menu — see the
  warning in `docs/OPERATOR_GUIDE.md`. Plan which pages link to which before writing 20 of them.

## 3 · Assets

- **Logo file** (optional, but expected before a real launch) — placed at
  `sites/<slug>/public/<file>`, referenced from `brand.logo` in the config.
- **Real contact details** (phone and email; no mailing address on WICFL sites since 23 Sep
  2026) that match the site's Google Business Profile character for character — a mismatch actively suppresses local rankings, not just a
  compliance nitpick (`docs/CONTENT_STANDARDS.md`).

## 4 · Where each piece is documented in full

| Need | Document |
|---|---|
| Every config field, in full detail with validation rules | `docs/SITE_CONFIG_SCHEMA.md` |
| Writing rules, the swap test, the self-review checklist | `docs/CONTENT_STANDARDS.md` |
| Whether a specific page/site is ready to go live | `docs/QA_CHECKLIST.md` |
| How to actually edit files and open a pull request | `docs/OPERATOR_GUIDE.md`, Part 2 |

## Status note

Written 8 Sep 2026 while `stuart-homeowners` is still a demo config: `brand.name` still says
"(Demo)", `contact.email`/`address` are explicit placeholders; `licenseNumber` is intentionally
absent under Kevin's 22 Sep 2026 decision. The fixtures and schema examples retain a license
number to exercise the optional-present case. `analytics` and `crm` are the schema's placeholder
patterns, and `differentiation` describes the config
itself as an internal preview rather than real evidence. This checklist is what needs to change,
field by field, once Kevin's real assets and Pavel's real research land — see backlog items
W-008 and W-016.
