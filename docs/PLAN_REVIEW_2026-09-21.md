# WICFL Microsite Factory — Plan Review

**v1.1 · 22 Sep 2026 · Prepared by Victor · For Kevin, and for the AI assistant that helped build the plan in August**

---

## How to use this document

This is a status update on the WICFL Microsite Factory plan, plus ten proposals for Kevin to consider. It was written four weeks after the plan was agreed (24–25 Aug 2026) and three days after the framework handoff to Pavel (18 Sep 2026).

**The plan as agreed in August is the plan. It stays in force as written.** Nothing in Part 2 is adopted; each item is a proposal that changes nothing until Kevin decides. Work continues under the current plan in the meantime.

**If you are the AI assistant that helped Kevin write the plan:** Part 1 brings you up to date on what has happened since August, so that your picture of the project matches where it actually is. Read it as a progress report against the plan you already know, not as a replacement for it. Then evaluate each proposal in Part 2 on its merits, against the current plan. For each one, say whether you agree, disagree, or would modify it, with reasoning. Where the current plan is right and the proposal is wrong, say so. Flag anything in the current plan that this review missed or got wrong. Finish with a short, ordered list of the decisions Kevin needs to make, most urgent first.

**If you are Kevin:** Part 1 is a two-minute read. Part 2 is longer; the summary table at the end of Part 2 lists what each proposal asks of you. None of it happens without your yes.

---

## Part 1 — Where the plan stands on 21 Sep 2026

### What the plan is

Build a factory that generates niche insurance microsites for WICFL from a config file and markdown, so that launching a site never means writing HTML. Prove the factory works (Gate A, 13 Nov 2026) and prove the sites produce business (Gate B, 5 Mar 2027) as two separate questions. Three sites are committed; nothing beyond Site #3 is. The long-term target of 100 sites is not what is being built now, because Google's spam policy names this exact pattern under doorway abuse, and the plan exists to avoid building a hundred of something before knowing it works.

### What is built and verified (as of today)

- **The factory core.** Config schema with validation, shared Astro template, generator (`build:site`), monorepo, CI on every change, deploy pipeline to Cloudflare Workers with pod routing (one Worker serves ~25 sites, routed by hostname).
- **Preview per branch.** Every draft gets its own URL before it publishes. Verified end to end with real pull requests.
- **Production gate.** A site whose config still contains placeholders (a fake license number, an unprovisioned analytics ID) cannot deploy to a real domain. Fails closed. Verified.
- **Bilingual routing** with `hreflang`. Built and exercised in CI. Neither pilot uses it yet (Site #1 is English-only; Site #2 was planned as Spanish-only).
- **Technical SEO** generated from config: canonical URLs, `robots.txt`, `sitemap.xml`, schema.org `InsuranceAgency` markup with the site's NAP. Closed 21 Sep.
- **Navigation menu** generated automatically from the site's pages, zero JavaScript. Closed 21 Sep.
- **Logo support** in schema and template. Site #1's logo is live.
- **Operator tooling for Pavel.** A password-protected web form (a Cloudflare Worker) that lets Pavel edit any page's markdown and SEO fields, and create a brand-new site from a form, without touching Git. Every action opens a pull request with a preview link; nothing publishes without review. Verified with real PRs on 15–21 Sep. Git remains underneath as the storage and audit layer; Pavel does not see it. Remaining gaps (creating a new page inside an existing site, publishing from the form, image upload, a better editor) are scheduled for Phase 7.
- **The lead capture funnel Kevin designed on 18 Sep.** The three-step `/contact/` form (ZIP → reason and address → contact details, with progressive save to the CRM, address autocomplete, and optional policy declaration upload) is built and showing on Site #1's preview. It is not yet live: it needs GoHighLevel, Google Places and Cloudflare R2 credentials provisioned, then one authorized end-to-end test.

### Site status

- **Site #1 — Stuart homeowners, English.** `StuartHomeownersInsurance.com`, domain owned by Kevin (registered at GoDaddy, DNS on Cloudflare). Eight real content pages written by Pavel are merged and visible on the preview. **Launch is 9 Oct 2026.** Still blocked on: the real Florida license number, approved phone, email and address from Kevin; and the credentials for the lead funnel above.
- **Site #2 — Port St. Lucie.** Kevin confirmed "Let's do PSL" on 17 Sep. Pavel has a structure, SEO and content outline. **Launch is 30 Oct 2026.** Open: the domain is not chosen or bought, and whether Site #2 is still the Spanish-language site as originally planned is not written down anywhere. This needs an explicit answer.
- **Site #3 — Gate A repeatability test.** 9–13 Nov, Pavel alone, niche of his choosing. Not started, by design.

### Decisions taken since August, all within the plan

- **Tracking numbers:** GoTo confirmed $0.99 per number per month. Buy directly from GoTo. Closed.
- **Content owner:** Kevin assigned the role to Pavel, who writes native Spanish. No external writer needed for Site #2.
- **CRM:** GoHighLevel, using the existing "Walker Insurance" sub-account, since every microsite lead is a Walker lead regardless of origin. Leads are tagged by originating site.
- **Company email:** `microsites@wicfl.com`, created by Kevin. Cloudflare and GitHub live under it. Company card on file.
- **Content review before publish:** no one at Walker is available as a dedicated reviewer, so Pavel self-reviews against the compliance checklist, with Kevin available informally. Decided by Victor, not Kevin.
- **Gate A criteria** were tightened twice: the "five working days" stopwatch was replaced by two conditions a command can verify (Pavel's changes touch only his site's folder; rebuilding from config reproduces exactly what shipped), plus two days or less of hands-on time and zero code written by Victor.
- **Gate B moved** from 12 Feb to the week of 1 Mar 2027 so Site #2 gets its full 120 days.
- **Qualified call definition.** Kevin answered the two open questions by chat on 11 Sep: calls from outside the service area are not rejected, and repeat calls are deduplicated across the full 120-day window. Final agreed text, not yet written into the docs:

  > A call from a person about a product the site sells, lasting longer than 60 seconds, that was not a wrong number, a solicitation, an existing client calling about an existing policy, or a repeat call (within the 120-day measurement window) from someone already counted.

### Still open on Kevin

1. Real license number, phone, email and mailing address for Site #1 (blocks the 9 Oct launch).
2. The three business figures that produce the Gate B number: average first-year commission per policy, share of qualified calls that become a sale, and the annual return per site that would make him say yes to twenty more. The model is written; Kevin fills three cells.
3. Whether Site #2 (Port St. Lucie) is the Spanish site, and its domain.
4. Whether pilot sites get their own Google Business Profile (open since 28 Aug; see Proposal 2, which argues this is not actually his decision).

### Key dates

| Date | Milestone |
|---|---|
| 9 Oct 2026 | Site #1 launches; Gate B's 120-day clock starts |
| 12–30 Oct | Site #2 built and launched by Pavel |
| 2–6 Nov | Refinement + Gate A rehearsal against a throwaway config |
| 13 Nov | **Gate A** — does the factory work? |
| 16 Nov – 11 Dec | Phase 7: provisioning automation (domains, DNS, Search Console, tracking numbers) |
| 1–5 Mar 2027 | **Gate B** — do the sites produce business? |

---

## Part 2 — Ten proposals for Kevin to consider

Ordered by impact. Each one states what the current plan says, what we think the problem is, what we are proposing instead, and what it asks of Kevin. The current plan stays as written until he decides on each.

### Proposal 1 — Split Gate B into a conversion test and a ranking test

**What the current plan says.** Gate B passes if Sites #1 and #2 hit a qualified-call target, each measured over the 120 days after its own launch, on organic traffic.

**The problem.** A brand-new domain with no authority, no backlinks and no reviews typically takes six to twelve months to rank for anything competitive. Site #1 will have five months of life on 5 March. Measured on organic calls alone, Gate B will very likely fail, not because the model is wrong but because it is too early. A "no" in March would kill a project that may well have worked. The plan half-acknowledges this ("Gate B cannot resolve faster than organic search allows") but does not confront it.

Gate B currently bundles two different questions: *can we rank?* and *does the page convert?* The second one can be answered in weeks.

**Proposal.**

- **Add a paid conversion test.** A small Google Ads or Local Services Ads campaign on Site #1, roughly $500–1,000, sends real buying-intent traffic and measures whether the page produces qualified calls. This answers "do the sites produce business" in four to six weeks, independent of whether Google ranks them.
- **Add leading indicators for organic.** Indexation, impressions and average position in Search Console, click-through rate. These are the things that actually move inside 120 days. Set a bar for them too.
- **Make Gate B two-stage.** B1 in March 2027: conversion test plus leading indicators, deciding whether to continue to five sites. B2 in September 2027: real organic data, deciding whether to build twenty.

**What it asks of Kevin.** Approve a small ad budget for October–November, and accept that the March decision is "continue to 5" rather than "scale to 20".

### Proposal 2 — Close the Google Business Profile question by policy, not by asking

**What the current plan says.** "Do pilot sites get their own Google Business Profiles?" is an open item on Kevin since 28 Aug, flagged as something that "may change which niches are viable."

**The problem.** This is not Kevin's decision; it is Google's rule. Google Business Profile guidelines allow one listing per physical business location. A hundred microsites of the same agency at the same Stuart address cannot each have a profile; attempting it is grounds for suspension of all of them. So the answer is no, and the consequence is that microsites compete in organic results only, never in the map pack. That is a design constraint to accept, not a decision to wait on.

**Proposal.** Treat the item as settled by Google's rules rather than by a decision: microsites do not get their own GBP. Walker's single GBP is the only one, and every site's NAP points to it. If Kevin agrees, this removes a blocker that has been "overdue" for three weeks without anyone needing to do anything.

**What it asks of Kevin.** Nothing, unless he disagrees.

### Proposal 3 — Make the factory domain-agnostic, and test subdirectories with Site #3

**What the current plan says.** Every site is its own domain, bought through Cloudflare Registrar. A hub-and-spoke alternative sits in the "watch" list, to be evaluated only if Gate B fails.

**The problem.** The plan's doorway mitigation is content differentiation, which is right but is only half the picture. The other strong signal Google reads is the entity footprint: a hundred domains sharing the same phone, address, license and agency name look like a network even if every page passes the swap test. The alternative (`wicfl.com/stuart-homeowners/` instead of `stuarthomeownersinsurance.com`) inherits the parent domain's authority from day one, forms no pattern of doorway domains, and runs on the identical factory. What it gives up is the exact-match domain, which is worth far less today than it was ten years ago.

This also matters for timing: Phase 7 automates domain purchasing. If it turns out in March that subdirectories were the right call, Phase 7 was wasted work.

**Proposal.** Do not decide now which is better. Make the factory not decide either: a config field (`deploy.mode: "domain" | "subpath"`) makes it a per-site choice. Then use Site #3, which is already the repeatability test, to test the variable: Sites #1 and #2 on their own domains, Site #3 as a subdirectory of the main brand domain. Same Gate A test, plus a data point nobody has today.

**What it asks of Kevin.** Agree that Site #3 may live under the main domain rather than a new one.

### Proposal 4 — Minimum viable site is 6–8 pages, not 15–25

**What the current plan says.** 15 to 25 pages per site. Content at $50 per page is the project's real cost: $3,000 for the pilots, $100,000 at a hundred sites, and Pavel, holding three roles, is the bottleneck.

**The problem.** Site #1 has eight real pages and looks complete. Spam risk is per thin page, not per small site. Six dense pages with real local proof pass the swap test more easily than twenty-five that spread the same local evidence thin.

**Proposal.** Change the target from "15–25 pages" to "minimum viable site is 6–8 pages; add a page only when there is local evidence that justifies it." This cuts content cost by roughly 60%, relieves Pavel's triple role, and shrinks the doorway surface. It is the largest cost lever the plan has and is not using.

**What it asks of Kevin.** Agree to the smaller target.

### Proposal 5 — Tag qualified calls with a script, spot-check with a person

**What the current plan says.** Gate B counts qualified calls; applying the definition requires "someone tagging calls weekly rather than reconstructing 120 days from memory in March." The owner is not named.

**The problem.** Weekly manual tagging is the kind of habit that breaks in November. GoTo records calls; transcribing and classifying a call against the definition (over 60 seconds, about a product the site sells, not a wrong number, not an existing client, not a repeat) is exactly what a language model does well and consistently. This does not conflict with the "no AI-generated content" rule: it is internal operations, not published content.

**Proposal.** The lead API Worker that already exists receives GoTo's call webhook, transcribes and classifies, and stores the result with the transcript. Pavel spot-checks 10% instead of tagging 100%. Gate B data accumulates automatically from 9 Oct.

**What it asks of Kevin.** Confirm GoTo call recording is on for the tracking numbers.

### Proposal 6 — Generate the monthly report; do not write it

**What the current plan says.** Pavel produces a monthly performance report during the SEO window (12 Oct – 5 Feb).

**The problem.** GA4, Search Console, GoHighLevel and GoTo all have APIs. A hand-written monthly report costs Pavel time, gives Kevin a long message he will not read, and leaves Gate B to be reconstructed in March.

**Proposal.** A scheduled job builds a per-site dashboard: impressions, clicks, average position, calls, qualified calls, leads in the CRM. Kevin gets continuous visibility without messages. Gate B is read at a glance. This is natural Phase 7 work and the "view" half of Pavel's operator tooling.

**What it asks of Kevin.** Nothing.

### Proposal 7 — Put a written budget on Victor's time after the handoff

**What the current plan says.** Victor exits the critical path at the 18 Sep handoff and is "advisory only" afterward.

**The problem.** The handoff transferred Pavel's workflow, not Victor's workload. Every Block B item due 9 Oct is still Victor's: tracking-number wiring, analytics and CRM capture, the lead funnel Kevin designed on 18 Sep (which grew considerably), the GoHighLevel integration, email routing, the differentiation gate. Without a written limit, the plan will consume the time by default; the backlog already shows the pattern.

**Proposal.** An explicit budget, for example four hours a week of advisory time until Gate A. Anything that does not fit becomes a Phase 7 item with a date, not an unscheduled favor.

**What it asks of Kevin.** Acknowledge the budget so that when something is deferred to Phase 7, it is not a surprise.

### Proposal 8 — Kevin's open items get a default that stands unless he overrides it

**What the current plan says.** Several decisions sit on Kevin with dates in late August and are marked "open, overdue."

**The problem.** The one mechanism that has worked well is the Gate B model: propose a number, Kevin approves it instead of inventing it. Open-ended questions do not get answered; concrete defaults do.

**Proposal.** Every item on Kevin carries a proposed default and a date. If there is no answer by the date, the default stands and is recorded as "decided by default on X; Kevin can reverse." The Spanish-site question, the qualified-call definition and the GBP question can all close this week under this rule.

**What it asks of Kevin.** Agree to the mechanism, which mostly saves him messages.

### Proposal 9 — Two compliance items the new lead funnel requires before it goes live

**What the current plan says.** Florida insurance advertising rules are encoded in the template (license number displayed, correct entity naming, no misleading claims).

**The problem.** The funnel Kevin designed on 18 Sep collects property address, current insurer, current premium, and uploads policy declaration pages: personal and financial data of Florida residents. And GoHighLevel sends automated SMS. The template does not yet have what that requires.

**Proposal.**

- A **privacy policy page** on every site, and an explicit **TCPA consent** on the form (checkbox and text agreeing to calls and text messages). Without the consent, GoHighLevel's automated texting is a real legal exposure for Walker.
- A **retention rule** for uploaded declaration pages: how long they live in storage and who deletes them.

Hours of work, not days, but it goes in before the first real lead, not after.

**What it asks of Kevin.** The privacy policy text, or approval to use a standard one.

### Proposal 10 — The differentiation gate is the whole thesis and has not been started

**What the current plan says.** A CI check compares content across every site in the portfolio and blocks a deploy when two pages are too similar. Due before Site #2's content, mid-October.

**The problem.** The entire anti-doorway argument rests on this check, and it has the worst ratio of importance to attention in the backlog. No prompt, no report.

**Proposal.** Build the cheap version now: shingling or MinHash similarity across all sites' markdown, with the threshold in config. One day of work. Its first real test is Site #2 in mid-October, so it needs to exist by then.

**What it asks of Kevin.** Nothing.

### Summary — what each proposal asks of Kevin

| # | Proposal | Asks of Kevin |
|---|---|---|
| 1 | Split Gate B: paid conversion test + leading indicators; two-stage decision | Approve ~$500–1,000 ad budget; accept March = "continue to 5" |
| 2 | Close the GBP question by policy: microsites have no GBP of their own | Nothing, unless he disagrees |
| 3 | Domain-agnostic factory; Site #3 tests subdirectories | Agree Site #3 may live under the main domain |
| 4 | Minimum viable site = 6–8 pages | Agree to the smaller target |
| 5 | Script-tagged qualified calls, human spot-check | Confirm GoTo call recording is on |
| 6 | Generated monthly dashboard instead of written report | Nothing |
| 7 | Written budget on Victor's time post-handoff | Acknowledge the budget |
| 8 | Defaults that stand unless Kevin overrides | Agree to the mechanism |
| 9 | Privacy policy + TCPA consent + retention rule before the funnel goes live | Privacy policy text, or approve a standard one |
| 10 | Build the differentiation gate before Site #2 | Nothing |

If Kevin adopts only three: **1, 3 and 4.** They are the ones that change the odds of reaching March with a real answer instead of "we don't know yet."

---

## Questions for the reviewer

1. Does the two-stage Gate B (Proposal 1) preserve the current plan's intent that "advancement runs on evidence, not elapsed time," or does it weaken it?
2. Is there a version of the domain strategy (Proposal 3) that the plan considered and rejected in August, and if so, why?
3. Is the 6–8 page minimum (Proposal 4) too thin for the insurance niches Kevin has in mind, and is there evidence either way?
4. What in the current plan does this review fail to mention that Kevin should still be tracking?
5. Ranked by urgency, what does Kevin need to decide in the next two weeks?

---

*Maintained by Victor. Source of truth for the project remains the repository (`CLAUDE.md`, `BACKLOG.md`, `BITACORA.md`, `docs/`). This review does not replace the master file (v1.6, 10 Sep 2026), which remains the plan of record; it proposes changes to it for Kevin's decision. v1.1 (22 Sep) reworded the framing so the current plan and the proposals are clearly separate; the content of the proposals is unchanged.*
