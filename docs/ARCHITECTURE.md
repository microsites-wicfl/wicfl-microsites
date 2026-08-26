# Architecture

**Version 1.1 · 25 Aug 2026 · Owner: Victor**

Settled decisions with the reasoning attached, so we do not relitigate them in six months
without remembering why.

## Decision record

| Decision | Choice | Reasoning |
|---|---|---|
| Hosting | **Cloudflare Workers** with Static Assets | Pages still works but no longer receives new platform features and caps at 100 projects per account, a wall at exactly our target scale. Same cost, no ceiling. |
| Framework | **Astro** | At 100 sites averaging 30 pages, plain HTML is 3,000 hand maintained files. Astro gives content collections, native en/es routing, zero JS by default, and a config driven build. |
| Repositories | **One monorepo** | With 100 repos, one template fix becomes 100 pull requests. Same trap as 100 WordPress installs. |
| Domains | **Cloudflare Registrar** | At cost with no markup, free WHOIS redaction, registration API. Keeps domains, DNS, SSL and hosting in one place. |
| Grouping | **Pods of ~25 sites** per Worker | One Worker per site caps at 500 and multiplies deploys. One Worker for everything means a bad deploy takes down the portfolio. |
| Advancement | **Two separate gates** | Technical repeatability and commercial validity are different questions on different clocks. |
| Generator timing | **Minimal generator from Site #1**, heavy automation after Site #3 | Pavel argued for building sites #1 and #2 first and extracting the pattern afterward. Middle ground: the Phase 2 generator is deliberately crude, it only renders the template from config, and it gets rewritten during the pilots. If Site #1 is hand assembled there is no config driven path to improve, and Gate A stops meaning anything. Domain registration and provisioning automation do wait until after Site #3. |
| Niche selection | **SEO validation before any domain is bought** | Added 25 Aug 2026 from Pavel's research. Kevin selecting a niche is not the same as the niche being winnable. If a market is dominated by national aggregators with no real local angle, we find out in days rather than at Gate B four months later. Backlog item W-016, blocks W-007 and W-011. |
| Operator profile | **Config and markdown only** | Pavel leads SEO and content and is ramping on the technical side. Framework design must assume the operator never writes HTML, never edits components to launch a site, and can diagnose but not build. This is a hard requirement, not a preference. |
| Site #3 | **Generated, not hand built** | If all three are assembled by hand, #3 is faster because Pavel has done it twice. That measures the learning curve, not the factory. |

## How a site comes into existence

```
packages/template ─┐
site.config.json ──┼──> new-site ──> differentiation gate ──> Cloudflare Worker ──> live
content/ ──────────┘        │              │  (pod of ~25)
                            │              └── fails: content too similar, rewrite
                            ├──> Cloudflare API: register domain → zone → DNS → SSL → custom domain
                            └──> Search Console API: property → sitemap · analytics · tracking number
```

Launching a site never means writing HTML. It means running `new-site`, filling in the
config, and writing markdown. Template code is touched only when improving the framework
for every site at once.

## Repository layout

```
wicfl-microsites/
├── packages/
│   ├── template/          shared Astro theme, layouts, components
│   └── config-schema/     the contract + validation
├── sites/
│   ├── <slug>/
│   │   ├── site.config.json
│   │   └── content/
├── scripts/               new-site, provisioning, differentiation check
└── .github/workflows/     path filtered builds, only changed sites rebuild
```

## What the framework provides out of the box

- **Bilingual routing** with correct `hreflang`, built in from Site #2 rather than retrofitted
- **Technical SEO**: sitemap, robots, canonical, schema.org InsuranceAgency markup, all from config
- **Analytics**: GA4 and GTM wired identically on every site, so cross site reporting works
- **Lead capture**: forms routed into the CRM with the originating site recorded on every lead
- **Call tracking**: the number is a config field, rendered everywhere, routed into GoTo
- **Performance**: zero JavaScript by default. Core Web Vitals are a build output, not a project

## Platform limits that matter

| | Free | Paid, $5/mo |
|---|---|---|
| Static asset requests | Free and unlimited | Free and unlimited |
| Static asset files per Worker version | 20,000 | 100,000 |
| Workers per account | 100 | 500 |
| Routed zones per Worker | 1,000 | 1,000 |
| DNS, SSL, CDN, DDoS | Included | Included |

The $5 is for the whole account, not per site. Free would technically carry this project;
we take Paid for the file headroom, the Worker ceiling and the observability tooling.

**Watch item:** Cloudflare regulates bulk zone additions on free plans. Raise this with them
at around 25 domains, not at 90.

## Known constraints

- **Cloudflare Registrar API is beta** (launched April 2026). It can search, price check and
  register. It cannot renew, transfer or update contacts, and it covers only a subset of TLDs.
  Renewals stay on auto renew through the dashboard.
- **Domains registered with Cloudflare must use Cloudflare nameservers.** For us this is a
  feature, since Cloudflare is already our DNS and hosting.
- **A .com registration cannot be transferred out within 60 days.** Standard ICANN rule.
