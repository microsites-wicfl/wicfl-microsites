# Content standards

**Version 1.3 · 22 Sep 2026. License number is optional and not used on WICFL sites, per Kevin's decision and Florida DFS guidance.**

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
- **Florida insurance advertising rules apply on every page.** No misleading coverage claims
  and correct entity naming. A license number is optional; Kevin decided on 22 Sep 2026 that
  WICFL sites do not carry one.
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

**On AI watermarking and detection (researched 9-sep-2026):** tools like Google's SynthID and
the C2PA content-credentials standard exist, but as of now neither is used by Google as a search
ranking signal, and Google says directly that appropriate AI use is not against its guidelines,
the thing it penalizes is low-value content at volume, "no matter how it's created." A
watermark also does not reliably survive real editing, so a page that actually gets the human
pass this policy requires would not carry one either way. Separately, no disclosure law
currently applies to this site's own content: the EU AI Act's labeling rule only reaches
providers/deployers under EU jurisdiction, and the FTC's AI-disclosure rules target paid
ads and endorsements, not informational or coverage pages. None of this changes anything in
this policy, it is exactly why the policy is already written the way it is: it was cheaper to
have Google's actual policy right the first time than to chase a rumor about watermarks.
Revisit if a primary source (not an SEO blog) says otherwise.

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

1. **If the config carries a license number, it renders correctly.** WICFL sites do not carry
   one by Kevin's decision (22 Sep 2026), so it is never typed into page content.
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
8. **No leftover AI-tool artifacts.** Broken links pointing at the AI tool's own domain instead
   of a real page (seen for real on 9-sep-2026: internal links drafted as
   `https://chatgpt.com/<slug>` instead of `/<slug>/`), meta-commentary ("as an AI...", "I cannot
   browse the internet"), or placeholder brackets left in from a prompt. These are not a
   watermarking or detection risk (see the note below), they are just a sign the page did not
   get a real second read before it was called done.

## Page count guidance

Sites start at 15 to 25 pages and expand to 40 to 50 only once they are ranking and
producing leads. Do not build the long tail speculatively; that is how a site becomes thin
across forty pages instead of strong across twenty.
