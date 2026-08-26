# Gate B number: the model

**v1.0 · 26 Aug 2026 · Owner: Victor · Closes backlog item W-005**

Gate B asks whether the pilot sites produced enough business to justify building twenty more.
It cannot be decided without a number, and the number has to be set now, while there is no
data, because that is the only moment it can be set honestly.

This document exists so Kevin **approves** a number instead of **inventing** one. The
arithmetic is here. Three cells are blank because only he can fill them.

---

## Break-even is the wrong bar

The obvious bar is "does a site pay for itself." Run it and see why it is useless.

Marginal cash cost of one site, per year, from `COST_MODEL.md`:

| Line | Year 1 |
|---|---:|
| Domain, .com after 1 Nov 2026 | $11.15 |
| Tracking number, GoTo at $0.99/mo | $11.88 |
| Share of Cloudflare Workers Paid, at 20 sites | $3.00 |
| **Cash per site per year** | **$26.03** |

One policy pays for a site for a decade. A break-even bar passes on a rounding error, tells
Kevin nothing about whether to spend the next six months on this, and would have passed even
if the whole portfolio were a failure. **Gate B is not a break-even test. It is an
opportunity-cost test.**

The real cost of this project was never the platform. It is Pavel's time and the content it
produces, and that time has other uses inside Walker.

---

## The bar Kevin actually has to set

> **At what level of qualified calls per site per month is building twenty more sites the
> best available use of Pavel's next six months?**

That is the question. Everything below turns it into a number.

### The three cells only Kevin can fill

| | Input | Why only he knows it |
|---|---|---|
| **A** | Average first-year commission WICFL earns on one policy from these niches, in dollars | Depends on product mix and carrier agreements |
| **B** | Share of qualified calls that become a sold policy, as a percentage | Walker's own historical close rate on inbound calls |
| **C** | Annual gross commission per site that would make him say "yes, build twenty more" | This is a judgment about his business, not a calculation |

### The formula

```
Qualified calls per site per month  =  C  /  (A × B × 12)
```

That is the Gate B bar. Sites #1 and #2 each have to hit it, measured over the 120 days
after their own launch, and expressed as a monthly average so the two sites are comparable
despite launching three weeks apart.

### Worked example, illustrative numbers only

**These are placeholders to show the shape of the answer. Do not quote them to anyone.**

With A = $400, B = 20%, C = $12,000 per site per year:

```
12,000 / (400 × 0.20 × 12)  =  12,000 / 960  =  12.5 qualified calls per site per month
```

Which, over the 120-day window, is about **50 qualified calls per site**. Change A, B or C
and the bar moves. That is the entire point: the bar is derived, so a disagreement about the
bar becomes a disagreement about one of three concrete business facts.

---

## Sanity checks to run once the cells are filled

**Is the bar reachable?** Compare against the search volume Pavel found during W-016 niche
validation. If the primary keyword gets 300 searches a month and the bar needs 12 calls, that
requires a 4% search-to-call rate on the whole market including positions we will not hold.
A bar that arithmetic cannot reach is a bar designed to fail, and setting one is worse than
setting none.

**Is the bar worth reaching?** Run it the other way. If the bar is two calls a month, ask
whether Kevin would really commit six months of Pavel to that outcome. If not, the bar is
too low and Gate B will pass into a project nobody wanted.

If the reachable ceiling sits below the worthwhile floor, that is the most valuable thing
this exercise can tell us, and it tells us in August rather than in March.

---

## What "qualified" means has to be defined before launch

The bar counts qualified calls, and nobody has said what qualifies. This is not a detail to
settle in March when we are reading the report: the definition determines what the tracking
has to capture, and the tracking is wired before Site #1 launches on 9 October. Backlog item
**W-100**.

A workable starting definition, for Kevin to accept or replace:

> A call from a person in the site's service area, about a product the site sells, lasting
> longer than 60 seconds, that was not a wrong number, a solicitation, an existing client
> calling about an existing policy, or a repeat call from someone already counted.

Two mechanics follow from it and have to exist on launch day: GoTo call recording or
disposition tagging so someone can actually apply the definition, and a weekly rather than
quarterly tagging habit, because nobody can classify 120 days of calls from memory in March.

---

## Why this is set now and not in March

If the bar is defined after the data arrives, it gets defined by the data. Whatever number
the sites produced will look like the natural threshold, and the gate becomes a ceremony that
ratifies whatever happened. A bar set in August, in writing, against arithmetic, is the only
version of Gate B that can actually fail. A gate that cannot fail is not a gate.
