# Launch QA checklist

**Version 0.1 · draft, 4 Sep 2026 · Owner: Pavel, drafted by Vic ahead of the 17 Sep handoff.**

This is Pavel's definition of "ready to publish," per backlog item W-029. It exists so he is not
writing content for three weeks without knowing what he is writing toward, and so the checklist
does not get authored on 8 October to match whatever got built. **Pavel should read this before
Site #1's content starts and change anything that does not match how he actually works** — the
whole point of writing it now instead of at handoff is that there is time left to fix it before
it matters.

Each item says who checks it and how. "Automatic" means CI or the build already blocks a bad
state; nothing to do by hand except notice if it fails. "Manual" means it is Pavel's judgment
call. A few items are marked **not built yet**: they are real requirements for launch, but the
tooling behind them is Block B work that lands during Phase 3, alongside Site #1's construction,
not before it. Do not wait on those to start writing.

## 1 · Technical

| Check | Who / how |
|---|---|
| `site.config.json` validates against the schema | Automatic — `npm run check`, also runs in CI on every push |
| Site builds cleanly from config + markdown | Automatic — `npm run build:site -- <slug>`, also runs in CI |
| No placeholder data (fake license, unprovisioned analytics ID) in the config going to production | Automatic — the W-103 gate, runs right before deploy |
| Every internal link resolves (no 404s within the site) | Manual — click through the built site once before requesting launch |
| Site renders correctly in the theme variant it's assigned | Manual — open the built site, compare against the other pilot to confirm they read as distinct |

## 2 · SEO

| Check | Who / how |
|---|---|
| Title and meta description are set per page, within the schema's length limits | Automatic (schema enforces length) + Manual (Pavel judges whether they're actually good) |
| `primaryKeyword` and `secondaryKeywords` reflect real research, not placeholders | Manual — this is W-016's output landing in the config |
| Sitemap, robots.txt, canonical tags, schema.org `InsuranceAgency` markup | **Not built yet (W-023, Block B).** Required before launch, built during Phase 3 |
| Search Console property verified, sitemap submitted | **Not built yet.** Vic sets this up once the site has a real domain attached |
| NAP (name, address, phone) on the page matches the Google Business Profile exactly | Manual — mismatches actively suppress local rankings, this is not a nitpick |

## 3 · Content and compliance

Full detail lives in `docs/CONTENT_STANDARDS.md`; this is the short version to run per page,
right before it publishes:

| Check | Who / how |
|---|---|
| License number correct and visible | Manual — really a check that the config has the right number, the template renders it automatically |
| NAP matches the Google Business Profile character for character | Manual |
| No guaranteed or absolute coverage claims | Manual |
| Entity naming matches Walker's approved brand assets (W-008) | Manual |
| No firm price/quote stated unless explicitly approved for that page | Manual |
| Swap test run (`differentiation-audit` skill) | Manual, **while writing, not at the end** — see CONTENT_STANDARDS.md for why waiting three weeks makes this unfixable under launch pressure |
| Nothing states a legal/coverage interpretation only a licensed agent should make | Manual |
| Portfolio-wide similarity check across sites | **Not built yet (W-027).** Needs Site #2 to have content to compare against; the human swap test is the only differentiation check that exists during Site #1 |

## 4 · Mobile

| Check | Who / how |
|---|---|
| Page is usable at common phone widths, nothing overlapping or cut off | Manual — check on an actual phone or a resized browser window, not just by assumption |
| Phone number and any tap targets are comfortably tappable | Manual |
| Sticky header does not eat too much vertical space on a small screen | Manual |
| Core Web Vitals are reasonable (the template ships zero JS by default, so this should rarely be the bottleneck) | Manual spot-check with PageSpeed Insights on the live page |

## 5 · Conversion

| Check | Who / how |
|---|---|
| `trackingPhone` (not `displayPhone`) is what actually renders in every `tel:` link | Automatic — the template always uses `trackingPhone` for links, `displayPhone` only for the visible text |
| Contact form submits and lands in the CRM with the correct `leadSource` | **Not fully built yet (W-025, Block B).** GoHighLevel sub-account and field mapping land during Phase 3 |
| Call-to-action (phone, form) is visible without scrolling on the home page | Manual |

## 6 · Tracking

| Check | Who / how |
|---|---|
| GA4 measurement ID is real, not `G-PLACEHOLDER` | Automatic — caught by the W-103 gate before it can reach production |
| GTM container ID is real, not `GTM-PLACEHOLDER` | Automatic — same gate |
| Tracking phone number is provisioned in GoTo and routes correctly | **Not built yet (W-024, Block B).** GoTo confirmed at $0.99/number; wiring it to the config lands during Phase 3 |
| Every lead in the CRM records which site it came from | **Not built yet**, same as the conversion item above — same underlying W-025 work |

## 7 · Deploy

| Check | Who / how |
|---|---|
| `npm run check` and the build both pass in CI | Automatic |
| The W-103 production-readiness gate passes | Automatic |
| Rehearsal deploy serves the final content at `preview.stuarthomeownersinsurance.com` with valid HTTPS and `X-Robots-Tag: noindex, nofollow` | Manual — run the dispatch-only workflow with `target: rehearsal`, `confirm: deploy`; see `docs/LAUNCH_RUNBOOK.md` |
| DNS points at the real Worker, not a parked/placeholder page | Manual — confirm in the Cloudflare dashboard before announcing launch |
| SSL is active on the custom domain | Manual — Cloudflare handles issuance, confirm the certificate shows valid |
| The deploy that went out matches what's in `main` | Manual — sanity check the deployed commit SHA against `git log` |

The production run is also dispatch-only and requires `target: production` plus `confirm: deploy`.
It keeps the W-103 gate blocking. Follow `docs/LAUNCH_RUNBOOK.md` for the required DNS-to-deploy
order; do not treat the rehearsal exception as a production bypass.

## What to do if something here doesn't fit

This is a draft. If an item doesn't make sense once Pavel is actually writing Site #1, or
something real is missing, that's exactly the kind of documentation gap Gate A (13 Nov) logs and
counts — see `docs/SCHEDULE.md`. Flag it and this file gets updated; it is not meant to be
followed blindly once it stops matching reality.
