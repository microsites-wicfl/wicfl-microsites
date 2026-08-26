# Schedule

**v1.2 · updated 26 Aug 2026 after architecture review: Gate B date corrected, Gate A criterion sharpened, Phase 2 split by real deadline**

Ten phases plus one parallel track. The tracked version with every activity, owner and
dependency lives in `WICFL-microsite-schedule.xlsx`.

| Phase | Dates | Owner | What happens |
|---|---|---|---|
| **0 · Alignment** | 24–28 Aug 26 | Kevin | Niches selected, content owner named, GoTo quote obtained, Gate B number defined, Pavel's availability confirmed |
| **1 · Infrastructure + validation** | 31 Aug–4 Sep | Victor + Pavel | Cloudflare and GitHub accounts, roles and 2FA, deploy pipeline. **Pavel validates the niches before any domain is bought** |
| **1b · Domains** | 7–8 Sep | Victor | Domains registered, only after niche validation passes |
| **2 · Framework** | 8–18 Sep | Victor | **Block A only:** config schema, Astro template, bilingual routing, minimal generator, handoff. See note below |
| **Parallel · Pavel ramp** | 31 Aug–18 Sep | Pavel | HTML/CSS to read and diagnose, Astro concepts, Git workflow, Cloudflare. Plus shadowing Phase 2 |
| **3 · Site #1 English** | 21 Sep–9 Oct | Pavel | Generated from config, content written, tracking wired, QA, launch |
| **4 · Site #2 Spanish** | 12–30 Oct | Pavel | Same flow, validates bilingual support. Content written natively in Spanish |
| **5 · Refinement** | 2–6 Nov | Victor + Pavel | Everything that was manual gets folded back into the framework |
| **Gate A · Site #3** | 9–13 Nov | Pavel alone | Repeatability test. Pass or return to Phase 5 |
| **7 · Automation** | 16 Nov–11 Dec | Victor | Domain registration, DNS, Search Console and tracking numbers, all through APIs |
| **8 · SEO window** | 12 Oct–5 Feb 27 | Pavel reports | Runs in parallel. Monthly reporting while sites accumulate organic data |
| **Gate B · Go or no-go** | 1–5 Mar 27 | Kevin | Commercial decision. Moved from February so Site #2 gets its full 120 days |
| **10 · Scale to 20** | from 8 Mar 27 | Pavel | Conditional. Nothing here starts unless Gate B passes |

## Schedule confirmed 25 Aug 2026

Pavel confirmed his dedication to the project and that he writes native Spanish. Two effects:

**Dates are locked.** Phase 3 starts 21 September, Site #1 launches 9 October, and Gate B holds
at 12 February 2027. The ramp window of 31 August to 18 September is realistic at full dedication.

**Site #2 no longer needs a hire.** Spanish content gets written natively by the person who also
does its keyword research, which is a better outcome than the external writer we had planned to
add before late October.

**What did not change:** Pavel now holds three roles at once, project lead, SEO lead and content
owner. That is workable across three pilot sites, roughly 50 to 75 pages. At twenty sites it is
400 to 500 pages on top of everything else, and content becomes the bottleneck. The role is
revisited at Gate B, and Kevin should expect that conversation rather than be surprised by it.

**New gap, opened 25 Aug:** nobody reviews Pavel's content before it publishes. He writes it,
optimizes it and ships it. For insurance copy that also means nobody at Walker is checking
coverage claims, disclosures and Florida advertising compliance. One review per site by someone
who actually sells insurance is not a bottleneck, but it needs a name on it. Backlog item W-095.

## Phase 2 is split by real deadline, not trimmed

Ten items in nine working days does not fit, especially with Pavel shadowing, which costs
velocity rather than adding it. The fix is not cutting scope. It is noticing that only half of
Phase 2 is actually gated by the 18 September handoff.

**Block A, due 18 September.** Config schema, Astro template, bilingual routing, the minimal
generator, and the handoff session. Without these Pavel cannot start Site #1 on 21 September.

**Block B, due 9 October.** Full technical SEO, tracking number wiring, analytics and CRM
capture, the CI differentiation gate, and the QA checklist. These are gated by Site #1's launch,
not by the handoff, and they get built during Phase 3 with Pavel already operating. If one
overruns, it slides inside October without touching the 21 September start.

One caveat that keeps this honest: the CI differentiation gate must exist **before the first
content publishes**, which is early October, not before the handoff. Do not let it drift past
that, because it is the guardrail the whole portfolio depends on.

## Why niche validation moved ahead of domain purchase

Added from Pavel's research. Kevin selecting a niche is not the same as the niche being
winnable. If a target market is dominated by national aggregators with no genuine local angle,
that is knowable in days through keyword and SERP analysis. Without this step, we would only
discover it at Gate B, four months and one full pilot later.

Framework construction in Phase 2 does not depend on domains existing, so this adds a week to
the domain purchase without touching the critical path.

## The two gates

### Gate A, does the factory work? · 13 Nov 2026 · Pavel, unassisted

The original wording, "Site #3 launches in 5 working days or fewer," left a hole: it never said
whether writing the content counted inside those five days. If it counts, nobody passes, because
15 to 25 pages of original insurance copy takes longer than that. If it does not count, five days
is far too generous and the gate measures almost nothing.

**Two clocks, and only one of them is the gate.**

**Factory time is the criterion.** Measured from the moment approved content and a filled config
are in hand, to a live site that passes the QA checklist. **Pass: 2 working days or fewer, with
zero code written by Victor.** If the factory works, this should be close to trivial; the
allowance exists for DNS propagation and QA, not for building.

**Total elapsed time is informational.** From niche selection to live, including research and
writing, compared against the same figure logged for Sites #1 and #2. It tells us whether the
whole loop is getting faster, but it is dominated by writing speed, which is not what this gate
is testing.

**Pavel picks the niche for Site #3 himself**, from candidates he validated. Running the full
loop unaided is part of what is being measured.

**Fail: return to Phase 5.** The framework is not repeatable yet, and building more sites would
only multiply manual work.

### Gate B, do the sites produce business? · 5 Mar 2027 · Kevin

**Moved from 12 February.** The gate promises 120 days of data on both pilot sites, but Site #2
launches 30 October and its 120 days land on 27 February, fifteen days after the original date.
Site #1 was fine at 6 February. Rather than quietly evaluate Site #2 at 105 days, the gate moves
to the week of 1 March. Two and a half weeks against a four month wait is noise; deciding to
build twenty sites on thinner data than we promised ourselves is not.

**Pass:** Sites #1 and #2 hit the qualified call target defined in backlog item W-005, each
measured 120 days after its own launch.

**Fail:** do not scale. Either niche selection was wrong and we retest, or the microsite model
does not work for this market.

**Gate B still has no number.** W-005 exists to set it. The bar has to be defined while there is
no data, because that is the only moment it can be set honestly.

### Why two gates

A new domain needs three to six months to show meaningful organic traffic. Gate A resolves in
weeks. Collapsing them is how a team ends up with twenty sites that deploy beautifully and
generate nothing. Phases 7 and 8 run in parallel so the waiting period stays productive.
