# Content standards

**Version 1.2 · 3 Sep 2026. Added a self-review checklist for Pavel to run before every publish, since there is no dedicated second reviewer yet.**

## The swap test

Take any page. Swap the city name for a different city.
**What else on the page has to change?**

If the answer is nothing, that page is a doorway page by Google's definition and it does
not ship, regardless of how well the site is built.

Google's published spam policy names our exact pattern under doorway abuse:

> "Having multiple domain names or pages targeted at specific regions or cities that funnel
> users to one page."

Their June 2026 spam update enforced this against local and home services businesses.

## Enforced twice: by hand while writing, by CI before deploy

**While writing, every page, by the person writing it.** Run the `differentiation-audit`
skill on a page as it is drafted, not on a site as it is finished. This is the anchor that
matters most and it is the one most easily skipped, because nothing blocks if you skip it.

The reason is arithmetic. Twenty pages written across three weeks, first checked four days
before launch, is three weeks of work to redo under launch pressure. Nobody rewrites in that
situation. They tune the threshold, and then the guardrail is decoration. Catching one page
on the day it is written costs an hour.

**Before deploy, by CI, across the whole portfolio.** Backlog item W-027 builds a check that
compares content across every site and **blocks the deploy** when two pages are too similar.
It costs a day and it protects the portfolio permanently, including against a future team
member who was never in this conversation.

Note what the CI gate can and cannot do: with a single site live it has nothing to compare
against. Its first real test is Site #2, in mid October. That is why the human pass is not
optional during Site #1. It is the only differentiation check that exists at that point.

Do not disable either one. If CI produces a false positive, tune the threshold and record why
in the bitácora.

## Standing rules

- **Spanish is written, never translated.** Machine translated insurance copy reads as
  inauthentic to the Miami and Broward market immediately, and it falls under Google's
  scaled content policies. Spanish sites need a native writer.
- **Local proof is required, not optional.** Real claims handled, area specific detail,
  local reviews, genuine market knowledge. This is the raw material the swap test looks for.
- **Florida insurance advertising rules apply on every page.** License number displayed,
  no misleading coverage claims, correct entity naming. Encoded in the template so it
  cannot be forgotten per site.
- **NAP consistency.** Name, address and phone must match the Google Business Profile
  exactly. Inconsistency actively suppresses local rankings.
- **No AI generated content shipped unreviewed.** See the section below.

## How AI may and may not be used

This came up directly on 25 Aug 2026, so it is written down rather than assumed.

**Allowed:** drafting from a brief, restructuring, tightening, generating outlines, research
support, and first passes that a human then edits into something true.

**Not allowed:** publishing anything without a human editing pass. Generating a site's content
from a template brief and shipping it. Producing Spanish content by translating or generating
from an English brief.

**Why the line is here and not somewhere more convenient:** Google's scaled content abuse policy
covers pages generated at volume to rank rather than to help, and it applies explicitly
"no matter how it's created." Combined with the doorway pattern our portfolio structurally
resembles, a hundred sites of brief driven generated copy is the exact profile enforcement
looks for. The mechanism is what gets caught, not the intent behind it.

**Spanish specifically:** written in Spanish from scratch by a fluent writer. Not translated,
not generated from an English brief. In the Miami and Broward market the difference is obvious
to a reader in one paragraph, and credibility is the entire product for an insurance site.

## Self-review checklist, since there is no second reviewer yet

Decided 2026-09-03. Pavel is writer, SEO lead and project lead at once, and there is no one
else on the team to add as a dedicated content reviewer right now. Rather than leave that gap
open, Pavel reviews his own content against this checklist before every page publishes. He can
ask Kevin for an informal second opinion when something feels ambiguous, but that is his call
to make, not a required approval step, and it does not block a publish.

**This is a floor, not a substitute for licensed compliance review.** If the portfolio grows
past the three pilot sites, one person writing, optimizing and self-approving Florida insurance
copy stops being workable and needs a real second reviewer. See the resolution on backlog item
W-095.

Before a page goes live, check:

1. **License number is correct and visible.** The template renders it automatically from
   `site.config.json` on every page, so this is really a check that the config has the right
   number, not something to add by hand.
2. **NAP matches exactly.** Name, address and phone as written on the page match the Google
   Business Profile character for character. A mismatch actively suppresses local rankings, not
   just a compliance nitpick.
3. **No guaranteed or absolute coverage claims.** Phrases like "guaranteed approval," "always
   covered," or "lowest rate guaranteed" are the kind of claim Florida advertising rules and
   Google both treat as misleading. Prefer qualified language: what the policy generally covers,
   what affects eligibility, what to confirm with an agent.
4. **Entity naming is correct.** The page names the actual licensed entity selling the policy,
   using the approved naming from Walker's brand assets (W-008), not an invented or informal name.
5. **No specific price or quote stated as a firm offer** unless it was explicitly approved for
   that page. General cost ranges and "get your quote" framing are fine; a number presented as a
   binding offer is not.
6. **Ran the swap test.** See above and the `differentiation-audit` skill. This is unrelated to
   compliance but belongs in the same pre-publish pass since it also happens page by page.
7. **Nothing reads like a legal or policy interpretation only a licensed agent should assert.**
   Specific exclusions, edge cases, or legal interpretation get softened to general, educational
   framing rather than stated as settled fact. When in doubt, that is exactly the kind of thing
   worth a quick message to Kevin, informally, before publishing rather than after.

## Page count guidance

Sites start at 15 to 25 pages and expand to 40 to 50 only once they are ranking and
producing leads. Do not build the long tail speculatively; that is how a site becomes thin
across forty pages instead of strong across twenty.
