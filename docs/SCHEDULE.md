# Schedule

**v1.3 · updated 26 Aug 2026. Gate A now has command-verifiable criteria instead of a stopwatch, Phase 2 Block A gains branch previews and the QA list, and the differentiation gate gets its two correct anchors.**

Ten phases plus one parallel track. The tracked version with every activity, owner and
dependency lives in `WICFL-microsite-schedule.xlsx`.

| Phase | Dates | Owner | What happens |
|---|---|---|---|
| **0 · Alignment** | 24–28 Aug 26 | Kevin | Niches selected, content owner named, GoTo quote obtained, Gate B number defined, Pavel's availability confirmed |
| **1 · Infrastructure + validation** | 31 Aug–4 Sep | Victor + Pavel | Cloudflare and GitHub accounts, roles and 2FA, deploy pipeline. **Pavel validates the niches before any domain is bought** |
| **1b · Domains** | 7–8 Sep | Victor | Domains registered, only after niche validation passes |
| **2 · Framework** | 8–18 Sep | Victor | **Block A only:** config schema, Astro template, bilingual routing, minimal generator, branch previews, QA list, handoff. See note below |
| **Parallel · Pavel ramp** | 31 Aug–18 Sep | Pavel | HTML/CSS to read and diagnose, Astro concepts, Git workflow, Cloudflare. Plus shadowing Phase 2 |
| **3 · Site #1 English** | 21 Sep–9 Oct | Pavel | Generated from config, content written, tracking wired, QA, launch |
| **4 · Site #2 Spanish** | 12–30 Oct | Pavel | Same flow, validates bilingual support. Content written natively in Spanish |
| **5 · Refinement** | 2–6 Nov | Victor + Pavel | Everything that was manual gets folded back into the framework |
| **Gate A · Site #3** | 9–13 Nov | Pavel alone | Repeatability test, rehearsed in Phase 5. Pass or return to Phase 5 |
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
generator, **branch preview deploys**, **the QA list**, and the handoff session. Without these
Pavel cannot start Site #1 on 21 September.

**Block B, due 9 October.** Full technical SEO, tracking number wiring, analytics and CRM
capture, the CI differentiation gate, and the automation of the QA list. These are gated by
Site #1's launch rather than by the handoff, and they get built during Phase 3 with Pavel
already operating. If one overruns, it slides inside October without touching 21 September.

### Two items moved into Block A on 26 August

**Branch preview deploys, W-098.** Pavel spends three weeks writing markdown between
21 September and 9 October. If the only way to see a rendered page is running the Astro dev
server, we are asking for `npm install` and a terminal from someone three weeks into a
technical ramp. If that is not available he writes blind, or he asks Victor to show him, which
is precisely the dependency the handoff exists to cut. Push markdown, get a URL. It costs
little alongside the W-014 pipeline and a great deal to retrofit.

**The QA list, W-029, split from its automation, W-099.** Automating the checklist is Block B.
The list itself is not: it is Pavel's definition of ready to publish. If it does not exist on
21 September he writes for three weeks without knowing what he is writing toward, and worse,
the checklist ends up authored on 8 October to match whatever got built. Half a day, mostly
his own work, and it makes Block B's automation aim at something real instead of something
assumed.

## The differentiation gate has two anchors, not one

The 26 August draft anchored the CI gate at "before the first content publishes, early
October." That date is wrong in both directions, so both are written down here.

**The CI gate's real deadline is Site #2's content, mid October.** With one site live it has
nothing to compare against; a portfolio similarity check needs a portfolio. Building it
earlier is fine, but nothing is protected by it until Site #2 exists.

**The human audit's deadline is the handoff, 18 September.** The swap test earns its keep
while content is being written, not at publish time. If Pavel writes twenty pages through late
September and the first similarity check runs on 5 October, a failure means rewriting three
weeks of work four days before launch, and the pressure in that moment will be to loosen the
threshold rather than rewrite. The `differentiation-audit` skill already exists for exactly
this. Running it per page as he writes goes into the handoff documentation as a standing
practice, not a launch step.

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
whether writing the content counted inside those five days. Excluding it made five days far too
generous; including it made the gate unpassable. The 26 August revision fixed that by excluding
content and tightening to two days. This version fixes the remaining problem, which is that a
stopwatch measures the wrong thing.

**Two working days of wall clock also measures Cloudflare's certificate queue.** Universal SSL
normally issues in about fifteen minutes, but the published allowance is up to 24 hours. If
Pavel draws an unlucky domain he fails a gate that had nothing to do with the factory. If he
draws a fast one he passes with room to spare and we learn nothing we did not already know.
Time is a proxy. Better to measure the thing itself.

**Pass requires all four. The first two are the real gate.**

**1 · Nothing outside the site directory was edited by hand.** Pavel's own commits for Site #3
touch only `sites/<slug>/**`. Anything the generator writes elsewhere (pod routing, the site
registry) is fine because the generator wrote it; a file Pavel opened and patched is not.
Verified with `git diff --name-only`, so it is settled by a command rather than by argument
in November.

**2 · The live site is reproducible from its config.** Re-run `new-site` from
`site.config.json` plus the content directory into a clean tree and diff against what shipped.
They match. A difference means something was hand patched after generation, which is exactly
the failure this gate exists to catch, and it is invisible to a stopwatch.

**3 · Two working days or fewer of hands-on time, external waits excluded.** Measured from
approved content and a filled config to a live site that passes the QA checklist. Time spent
waiting on certificate issuance, registry propagation or GoTo number provisioning is logged
with its start and end and excluded from the total. Those are vendor queues, not the factory.

**4 · Zero code written by Victor, and every question logged.** "No code" alone misses the
likelier failure: Pavel writes nothing and sends nine messages instead. Each question the
handoff documentation fails to answer gets logged with its timestamp. The count is not itself
pass or fail, but the log goes straight into Phase 5 as a list of documentation defects. A
gate that only says yes or no teaches nothing.

**Pavel picks the niche for Site #3 himself**, from candidates he validated. Running the full
loop unaided is part of what is being measured.

**Total elapsed time is informational.** From niche selection to live, including research and
writing, compared against the same figure logged for Sites #1 and #2. It tells us whether the
whole loop is getting faster, but it is dominated by writing speed, which is not what this
gate tests.

**Rehearse it in Phase 5.** Backlog item W-097. During the week of 2 November, run the full
factory clock against a throwaway config on a subdomain, no domain purchased, no content
written. Finding a hole in the runbook on 4 November costs an afternoon. Finding it on
10 November costs the gate. Gate A should confirm something we already believe, not discover it.

**One dependency people forget:** if Pavel picks the niche, Pavel buys the domain. That needs
the company card and vault from W-093 in place since September, not on gate day.

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

**Gate B still has no number, but it now has a model.** See `GATE_B_MODEL.md`: the bar is
derived from three business facts only Kevin can supply, so W-005 becomes an approval rather
than an invention. The bar has to be set while there is no data, because a bar set after the
data arrives gets defined by the data, and a gate that cannot fail is not a gate.

### Why two gates

A new domain needs three to six months to show meaningful organic traffic. Gate A resolves in
weeks. Collapsing them is how a team ends up with twenty sites that deploy beautifully and
generate nothing. Phases 7 and 8 run in parallel so the waiting period stays productive.
