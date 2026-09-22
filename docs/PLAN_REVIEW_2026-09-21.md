# WICFL Microsite Factory — Plan Review

**v1.2 · 22 Sep 2026 · Prepared by Victor · For Kevin, and for the AI assistant that helped build the plan in August**

---

## How to use this document

This is a status update on the WICFL Microsite Factory plan, plus nine proposals for Kevin to consider. It was written four weeks after the plan was agreed (24–25 Aug 2026) and three days after the framework handoff to Pavel (18 Sep 2026).

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
- **Production gate.** A site whose config still contains placeholders (an unset tracking phone, an unprovisioned analytics ID) cannot deploy to a real domain. Fails closed. Verified.
- **Bilingual routing** with `hreflang`. Built and exercised in CI. Neither pilot uses it yet (Site #1 is English-only; Site #2 was planned as Spanish-only).
- **Technical SEO** generated from config: canonical URLs, `robots.txt`, `sitemap.xml`, schema.org `InsuranceAgency` markup with the site's NAP. Closed 21 Sep.
- **Navigation menu** generated automatically from the site's pages, zero JavaScript. Closed 21 Sep.
- **Logo support** in schema and template. Site #1's logo is live.
- **Operator tooling for Pavel.** A password-protected web form (a Cloudflare Worker) that lets Pavel edit any page's markdown and SEO fields, and create a brand-new site from a form, without touching Git. Every action opens a pull request with a preview link; nothing publishes without review. Verified with real PRs on 15–21 Sep. Git remains underneath as the storage and audit layer; Pavel does not see it. Remaining gaps (creating a new page inside an existing site, publishing from the form, image upload, a better editor) are scheduled for Phase 7.
- **The lead capture funnel Kevin designed on 18 Sep.** The three-step `/contact/` form (ZIP → reason and address → contact details, with progressive save to the CRM, address autocomplete, and optional policy declaration upload) is built and showing on Site #1's preview. It is not yet live: it needs GoHighLevel, Google Places and Cloudflare R2 credentials provisioned, then one authorized end-to-end test.

### Site status

- **Site #1 — Stuart homeowners, English.** `StuartHomeownersInsurance.com`, domain owned by Kevin (registered at GoDaddy, DNS on Cloudflare). Eight real content pages written by Pavel are merged and visible on the preview. **Launch is 9 Oct 2026.** Still blocked on: the approved phone, email and mailing address from Kevin (the license number is no longer needed on the sites, see Proposal 3); and the credentials for the lead funnel above.
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
- **Qualified call definition.** Kevin answered the two open questions by chat on 11 Sep: calls from outside the service area are not rejected, and repeat calls are deduplicated across the full 120-day window. Final agreed text, now written into `docs/QUALIFIED_CALL_DEFINITION.md` and `docs/GATE_B_MODEL.md` (v1.1, 21 Sep):

  > A call from a person about a product the site sells, lasting longer than 60 seconds, that was not a wrong number, a solicitation, an existing client calling about an existing policy, or a repeat call (within the 120-day measurement window) from someone already counted.

### Still open on Kevin

1. Approved phone, email and mailing address for Site #1 (blocks the 9 Oct launch). Kevin has said the license number does not need to appear on the sites; Florida's Department of Financial Services guidance agrees (the license number is required on policy applications, not in advertising), so that field is being made optional.
2. The three business figures that produce the Gate B number: average first-year commission per policy, share of qualified calls that become a sale, and the annual return per site that would make him say yes to twenty more. The model is written; Kevin fills three cells.
3. Whether Site #2 (Port St. Lucie) is the Spanish site, and its domain.
4. Whether pilot sites get their own Google Business Profile (open since 28 Aug; see Proposal 2, which argues Google's rules already answer it).

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

## Part 2 — Nine proposals for Kevin to consider

Ordered by impact. Each one states what the current plan says, what we think the problem is, what we are proposing instead, and what it asks of Kevin. The current plan stays as written until he decides on each.

### Proposal 1 — Gate B cannot be answered organically in 120 days; add a paid test and leading indicators

**What the current plan says.** Gate B passes if Sites #1 and #2 hit a qualified-call target, each measured over the 120 days after its own launch, on organic traffic.

**The problem.** A brand-new domain does not rank in 120 days. With no authority, no backlinks and no reviews, six months is the realistic floor for a new site to hold positions on competitive insurance terms, and twelve is common. Site #1 will have five months of life on 5 March; Site #2 will have four. Measured on organic calls alone, the most probable outcome of Gate B is a miss, not because the model is wrong but because the clock is too short for the thing it is measuring. A "no" in March would close a project that may well have worked. The plan half-acknowledges this ("Gate B cannot resolve faster than organic search allows") but does not confront it.

Gate B currently bundles two different questions: *can we rank?* and *does the page convert?* The second one can be answered in weeks. The first one cannot be answered by March at all.

**Proposal.**

- **Add a paid conversion test.** A small Google Ads or Local Services Ads campaign on Site #1, roughly $500–1,000, sends real buying-intent traffic and measures whether the page produces qualified calls. This answers "do the sites produce business" in four to six weeks, independent of whether Google ranks them, and it gives Walker real leads while the organic curve builds. One thing to be precise about, because it comes up: **paid ads do not move organic rankings.** Google has said repeatedly that the two systems are separate. The ads buy evidence and leads, not positions.
- **Actually shorten the organic curve** with the things that do move it for a new domain: a link from `wicfl.com` and Walker's other properties to each microsite, local citations, early indexing through Search Console, and steady content additions after launch. None of this is in the plan today and all of it is cheap.
- **Add leading indicators for organic.** Indexation, impressions and average position in Search Console, click-through rate. These are the things that actually move inside 120 days. Set a bar for them too.
- **Make Gate B two-stage.** B1 in March 2027: conversion test plus leading indicators, deciding whether to continue to five sites. B2 in September 2027: real organic data, deciding whether to build twenty.

**What it asks of Kevin.** Approve a small ad budget for October–November, allow links from Walker's existing sites to the microsites, and accept that the March decision is "continue to 5" rather than "scale to 20".

### Proposal 2 — Stop waiting on the Google Business Profile question; Google's rules already answer it

**What the current plan says.** "Do pilot sites get their own Google Business Profiles?" is an open item on Kevin since 28 Aug, flagged as something that "may change which niches are viable."

**The problem.** The question has been open for three weeks and it is not really a business decision. Google Business Profile guidelines allow one listing per physical business location. Every microsite is the same agency at the same Stuart address, so they cannot each have a profile, and trying is grounds for suspension of all of them. The consequence is concrete: microsites compete in organic results only, never in the map pack. The map pack belongs to Walker's single existing profile.

A related risk that this question was standing in for: the sites all share Walker's name, phone and address, so Google sees one business behind all of them. That is honest and it is fine. What is not fine is if two of our sites, or a site and `wicfl.com`, chase the same keywords in the same geography, because then they compete with each other and split whatever authority exists. That is a keyword and geography planning problem, not a profile problem.

**Proposal.** Record the answer as no, by Google's rules, and close the item. Then have Pavel keep a simple keyword and geography map across all sites and `wicfl.com` as part of niche validation, so no two properties target the same query in the same area.

**What it asks of Kevin.** Nothing, unless he disagrees.

### Proposal 3 — Make the factory domain-agnostic, and test subdirectories with Site #3

**What the current plan says.** Every site is its own domain, bought through Cloudflare Registrar. A hub-and-spoke alternative sits in the "watch" list, to be evaluated only if Gate B fails.

**The problem.** The plan's doorway mitigation is content differentiation, which is right but is only half the picture. The other strong signal Google reads is the entity footprint: a hundred domains sharing the same phone, address and agency name look like a network even if every page passes the swap test. The alternative (`wicfl.com/stuart-homeowners/` instead of `stuarthomeownersinsurance.com`) inherits the parent domain's authority from day one, forms no pattern of doorway domains, and runs on the identical factory. What it gives up is the exact-match domain, which is worth far less today than it was ten years ago.

This also matters for timing: Phase 7 automates domain purchasing. If it turns out in March that subdirectories were the right call, Phase 7 was wasted work.

*Side note recorded here because it came up in this discussion: Kevin has said the sites do not need to display the agency license number. Florida DFS guidance is consistent with that (the license number is required on policy applications, not in advertising), so the license field in the site config is being made optional, the template stops rendering it, and it drops out of the launch blocker. This is a decision Kevin already made, not a proposal.*

**Proposal.** Do not decide now which is better. Make the factory not decide either: a config field (`deploy.mode: "domain" | "subpath"`) makes it a per-site choice. Then use Site #3, which is already the repeatability test, to test the variable: Sites #1 and #2 on their own domains, Site #3 as a subdirectory of the main brand domain. Same Gate A test, plus a data point nobody has today.

**What it asks of Kevin.** Agree that Site #3 may live under the main domain rather than a new one.

### Proposal 4 — Page count is an output, not a target

**What the current plan says.** 15 to 25 pages per site.

**The problem.** More pages do not hurt by themselves. Twenty-five strong pages beat eight. What hurts is pages that exist to hit a count: the "flood insurance in Palm City" / "flood insurance in Jensen Beach" pattern where the city changes and nothing else does. That is the doorway pattern Google's June 2026 update enforced against, and a numeric target is exactly what pushes a writer toward it in week three. Site #1 has eight real pages and reads as complete; if Pavel has real local material for twenty more, twenty more is right.

**Proposal.** Drop the number as a target. The rule is the one the plan already has: every page passes the swap test, and a page gets written when there is local evidence that only that page can carry. Page count per site becomes whatever that rule produces.

**What it asks of Kevin.** Nothing.

### Proposal 5 — Tag qualified calls with a script, spot-check with a person

**What the current plan says.** Gate B counts qualified calls; applying the definition requires "someone tagging calls weekly rather than reconstructing 120 days from memory in March." The owner is not named.

**The problem.** Gate B's unit of measurement is a qualified call, defined as: over 60 seconds, about a product the site sells, not a wrong number, not a solicitation, not an existing client about an existing policy, not a repeat caller within the window. Someone has to apply those five checks to every call that comes in on a tracking number, every week, for five months. As written, that someone is a person listening to recordings in GoTo and keeping a spreadsheet. That habit breaks in November, and when it breaks, Gate B has no data.

**Proposal.** Make it automatic. GoTo records the call and notifies our existing lead API when it ends. The API pulls the recording, transcribes it, and has a language model apply the five checks, storing the verdict with the transcript and the reasons. Pavel reviews a 10% sample each week for accuracy instead of tagging 100%. The count is live from 9 October and the criteria are applied the same way every time. This does not conflict with the "no AI-generated content" rule: nothing here is published, it is internal measurement.

Two things have to be true for this to work: GoTo's recording and call-event integration has to be verified against their current API before we commit to it, and **Florida is an all-party consent state for call recording**, so every tracking line has to play a "this call may be recorded" announcement. GoTo supports that; it just has to be switched on.

**What it asks of Kevin.** Confirm that call recording, with the announcement, is acceptable on the tracking lines.

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

### Proposal 8 — Three compliance items the new lead funnel requires before it goes live

**What the current plan says.** Florida insurance advertising rules are encoded in the template (correct entity naming, no misleading claims).

**The problem.** The funnel Kevin designed on 18 Sep collects property address, current insurer, current premium, and uploads policy declaration pages: personal and financial data of Florida residents. GoHighLevel sends automated SMS. And Proposal 5 adds call recording. The template does not yet have what any of that requires.

**Proposal.**

- A **privacy policy page** on every site, and an explicit **TCPA consent** on the form (checkbox and text agreeing to calls and text messages). Without the consent, GoHighLevel's automated texting is a real legal exposure for Walker.
- A **retention rule** for uploaded declaration pages: how long they live in storage and who deletes them.
- The **recording announcement** on every tracking line, if Proposal 5 is adopted.

Hours of work, not days, but it goes in before the first real lead, not after.

**What it asks of Kevin.** The privacy policy text, or approval to use a standard one.

### Proposal 9 — The differentiation gate is the whole thesis and has not been started

**What the current plan says.** A CI check compares content across every site in the portfolio and blocks a deploy when two pages are too similar. Due before Site #2's content, mid-October.

**The problem.** The entire anti-doorway argument rests on this check, and it has the worst ratio of importance to attention in the backlog. No prompt, no report.

**Proposal.** Build the cheap version now: shingling or MinHash similarity across all sites' markdown, with the threshold in config. One day of work. Its first real test is Site #2 in mid-October, so it needs to exist by then.

**What it asks of Kevin.** Nothing.

### Summary — what each proposal asks of Kevin

| # | Proposal | Asks of Kevin |
|---|---|---|
| 1 | Gate B can't be answered organically in 120 days: paid conversion test, real organic accelerators, leading indicators, two-stage decision | Approve ~$500–1,000 ad budget; allow links from Walker's sites; accept March = "continue to 5" |
| 2 | GBP question answered by Google's rules; keyword/geo map so sites don't compete with each other | Nothing, unless he disagrees |
| 3 | Domain-agnostic factory; Site #3 tests subdirectories | Agree Site #3 may live under the main domain |
| 4 | Page count is an output of the swap test, not a target | Nothing |
| 5 | Script-tagged qualified calls, human spot-check | Confirm recording with announcement is acceptable on tracking lines |
| 6 | Generated monthly dashboard instead of written report | Nothing |
| 7 | Written budget on Victor's time post-handoff | Acknowledge the budget |
| 8 | Privacy policy + TCPA consent + retention rule + recording notice before the funnel goes live | Privacy policy text, or approve a standard one |
| 9 | Build the differentiation gate before Site #2 | Nothing |

If Kevin adopts only three: **1, 3 and 8.** The first two change whether March produces a real answer; the third has to be in place before the first lead arrives.

---

## Questions for the reviewer

1. Does the two-stage Gate B (Proposal 1) preserve the current plan's intent that "advancement runs on evidence, not elapsed time," or does it weaken it?
2. Is there a version of the domain strategy (Proposal 3) that the plan considered and rejected in August, and if so, why?
3. Is there anything in the automated call tagging (Proposal 5) that GoTo's current integration cannot support?
4. What in the current plan does this review fail to mention that Kevin should still be tracking?
5. Ranked by urgency, what does Kevin need to decide in the next two weeks?

---

*Maintained by Victor. Source of truth for the project remains the repository (`CLAUDE.md`, `BACKLOG.md`, `BITACORA.md`, `docs/`). This review does not replace the master file (v1.6, 10 Sep 2026), which remains the plan of record; it proposes changes to it for Kevin's decision. v1.1 (22 Sep) reworded the framing so the current plan and the proposals are clearly separate. v1.2 (22 Sep) incorporated Victor's review: Proposal 1 leads with the 120-day problem and is explicit that ads do not move rankings; Proposal 2 separates the profile question from keyword overlap; the license number is recorded as not required (Kevin's decision, consistent with Florida DFS guidance); Proposal 4 drops the page target instead of lowering it; Proposal 5 spells out the mechanics and Florida's recording-consent rule; the former Proposal 8 (decision defaults) was removed as an internal working practice rather than something to formalize.*
