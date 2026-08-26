# Cost model

**Verified 24 Aug 2026 against official sources. Tracking numbers confirmed 25 Aug 2026 by GoTo.**
**Re-verify before any budget commitment.**

## Headline

The platform is not a meaningful cost at any scale we are contemplating. The project's
financial risk is content and phone numbers.

## Annual cost at three scales

| Line | 3 sites | 25 sites | 100 sites |
|---|---:|---:|---:|
| Cloudflare Workers Paid | $60 | $60 | $60 |
| DNS, SSL, CDN, DDoS | $0 | $0 | $0 |
| Domains, .com after 1 Nov 2026 | $34 | $279 | $1,115 |
| Build pipeline | $0 | $0 | $0–300 |
| Tracking numbers, GoTo at $0.99/mo | $36 | $297 | $1,188 |
| **Platform subtotal** | **$130** | **$636** | **$2,363–2,663** |
| Content, one time, at $50/page | $3,000 | $25,000 | $100,000 |

## Verified figures and sources

- **Cloudflare Workers Paid: $5/month for the whole account**, not per site. Includes 10M
  requests and 30M CPU ms per month. **Requests to static assets are free and unlimited on
  both Free and Paid**, so a static portfolio never touches the metered pool.
  _Source: Cloudflare Workers pricing docs._
- **Static asset files per Worker version:** 20,000 Free / 100,000 Paid. 25 MiB per file.
  **Workers per account:** 100 Free / 500 Paid. **Routed zones per Worker:** 1,000.
  _Source: Cloudflare Workers platform limits._
- **Cloudflare Registrar sells at cost, no markup**, with free WHOIS redaction.
  _Source: Cloudflare Registrar product page._
- **.com wholesale rises from $10.26 to $10.97 effective 1 Nov 2026**, plus the $0.18 ICANN
  fee. This is the first of a four year cycle of roughly 7% annual increases. Budget
  approximately $11.90 in 2027, $12.70 in 2028, $13.60 in 2029.
  _Source: Verisign fee increase notice._
- **GitHub Actions**: free on public repos. Private repos get 2,000 min/month on Free,
  3,000 on Team, and additional Linux minutes at $0.006.
  _Source: GitHub Actions billing docs._
- **Twilio US**: local number $1.15/month, inbound $0.0085/min, outbound forwarding
  $0.0140/min, so roughly $0.023 per forwarded minute.
  _Source: Twilio US voice pricing._
- **CallRail** (only if keyword level attribution and recording are wanted later): $50/month
  for 5 numbers and 250 minutes, then $3 per number and $0.05 per minute.
  _Source: CallRail pricing page._

## Tracking numbers, resolved 25 Aug 2026

**GoTo confirmed $0.99 per standard phone number.** From GoTo customer care, via Kevin:
*"According to your invoices, you are currently paying $0.99 per standard phone number.
If you add more, that would be the additional pricing per phone number."*

That is $11.88 per number per year, or **$1,188 per year at 100 numbers**. It comes in below
the forwarding alternative we had costed at roughly $1,900 per year, and it is operationally
simpler because the numbers live natively inside the phone system the team already uses.
No forwarding leg, no second vendor, no separate per minute billing to reconcile.

**Decision: buy the tracking numbers directly from GoTo.** The Twilio forwarding route is
dropped. CallRail stays parked as an option only if we later want keyword level attribution
and call recording, which is a different product need, not a cheaper way to do this one.

**Why this mattered enough to block on:** third party comparison sites put GoTo's additional
DIDs at $4.99 to $14.99 per number per month, which projected to $6,000 to $18,000 per year at
100 numbers. The real number is roughly one fifth of the bottom of that range. Planning against
published comparisons instead of a written quote would have over budgeted this line by up to
$15,000 a year, or worse, killed the hundred site scenario on a false constraint.

**One item still to confirm:** that the $0.99 is monthly and that inbound minutes on those
numbers are not billed separately once volume grows. Worth one clarifying email to Helen
before the number count goes past the pilots.