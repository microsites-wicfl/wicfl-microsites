# Content standards

**Version 1.0 · 25 Aug 2026**

## The swap test

Take any page. Swap the city name for a different city.
**What else on the page has to change?**

If the answer is nothing, that page is a doorway page by Google's definition and it does
not ship, regardless of how well the site is built.

Google's published spam policy names our exact pattern under doorway abuse:

> "Having multiple domain names or pages targeted at specific regions or cities that funnel
> users to one page."

Their June 2026 spam update enforced this against local and home services businesses.

## This is enforced by CI, not by discipline

Backlog item W-027 builds a check that compares content across every site in the portfolio
and **blocks the deploy** when two pages are too similar. It costs a day and it protects the
portfolio permanently, including from a future team member who was never in this conversation.

Do not disable it. If it produces a false positive, tune the threshold and record why in
the bitácora.

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

## Page count guidance

Sites start at 15 to 25 pages and expand to 40 to 50 only once they are ranking and
producing leads. Do not build the long tail speculatively; that is how a site becomes thin
across forty pages instead of strong across twenty.
