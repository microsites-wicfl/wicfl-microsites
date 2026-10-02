# Site #1 launch runbook

**Owner:** Vic. **Launch target:** Friday, 9 October 2026. This is the operational sequence for
`stuarthomeownersinsurance.com`; it deliberately separates the permanent rehearsal environment
from the production apex.

## Preconditions, in this order

Order matters: the rehearsal in step 3 cannot go green until steps 1 and 2 are done.

1. ~~Production config correction~~ **Done 2026-09-22 (cowork).** `wrangler.pod-1.toml` now
   declares both custom domains as bare hostnames. Wrangler 4 rejects `/*` and paths on custom
   domains (found by the W-119 rehearsal, run 35764615432); the rehearsal config's hostname-only
   form passed Wrangler's validation in run 35764722059, which failed later only on permissions.
2. ~~Token update~~ **Done 2026-09-28 (Vic).** Account API token `cool-snowflake-1555` (the only
   account token; the one behind `CLOUDFLARE_API_TOKEN`) now also has **Workers Routes: Edit**
   on `stuarthomeownersinsurance.com` only. Original instruction, kept for future zones: **Vic updates the Cloudflare API token** behind the GitHub secret `CLOUDFLARE_API_TOKEN`: add
   **Zone → Workers Routes → Edit**, scoped to the `stuarthomeownersinsurance.com` zone (add each
   future site's zone to the same token as it joins Cloudflare). Keep the existing Workers Scripts
   permission. Nothing broader. The current token uploads a Worker and assets but Cloudflare
   rejects `zones/.../workers/routes` with "No access to the specified resource."
3. ~~Rehearsal run green~~ **Done 2026-09-28**, run 36458226291: `preview.` and two inner pages
   answer 200 with `noindex, nofollow`; apex and `www` unchanged; W-103 reported the expected
   placeholders (Demo, GA4/GTM, CRM form) and would have blocked production. Original check: **Rehearsal run green.** GitHub Actions → **Deploy Cloudflare Workers** → `target: rehearsal`,
   `confirm: deploy`. `https://preview.stuarthomeownersinsurance.com/` serves Site #1 over valid
   HTTPS with `X-Robots-Tag: noindex, nofollow`; apex and `www` unchanged.
4. **Pavel clears the demo markers in Studio and publishes, by Tuesday 6 October.** Checked on 1-oct with `scripts/check-production-config.mjs`: the only findings left are `brand.name`, `seo.title`, `seo.primaryKeyword` and one secondary keyword, all carrying "Demo"/"demo". All four are Site settings fields; the list is in `docs/OPERATOR_GUIDE.md`, *Getting Stuart ready to launch*. Analytics, phone, email and CRM form are real since 30-sep.
5. **Wednesday 7 October:** rehearsal run again: green, and this time the W-103 output is **clean** (no findings). That
   is the signal production will pass the gate.
6. Pavel completes the content and conversion checks in `docs/QA_CHECKLIST.md`.
7. The test pages `about-demo` and `coverage-demo` are deleted from `sites/stuart-homeowners/content/` (Pavel, in Studio). They are not in the menu, but they would go live and into the sitemap. Checklist for Pavel: `docs/OPERATOR_GUIDE.md`, *Getting Stuart ready to launch*.
8. **Privacy Policy published** (W-131), text approved by Kevin. The quote form collects name, phone, email and the property address, so the site does not launch without one. Terms of Use and Disclaimer can follow; the footer links each page as soon as it exists.
9. **Not a precondition: Google address autocomplete (W-118, prompt 029).** Without the key the address field is a normal text field: the form catches the error and hides the suggestions (`ContactForm.astro`). Turn it on whenever Kevin's billing access arrives.

## Launch sequence, 9 October

| Order | Owner | Action | Verify before continuing |
|---|---|---|---|
| 1 | Vic, Cloudflare dashboard | Set **SSL/TLS → Overview** to **Full (strict)**. | The zone is active and the certificate state is valid. |
| 2 | Vic, Cloudflare dashboard | In **DNS → Records**, delete every record named `stuarthomeownersinsurance.com` (the apex `A` records to GoDaddy parking) **and every record named `www`**, plus the obsolete `_domainconnect` CNAME. Leave `preview`, the email-routing `MX`/`TXT` records and anything else untouched. | Only apex and `www` records are gone. Cloudflare refuses to attach a Worker custom domain to a hostname that already has a DNS record, so a leftover `www` record fails step 3. On 28-sep both apex and `www` still answered 200 through Cloudflare, so both have records today. Do not leave hours between this and step 3: the site does not resolve until the deploy creates its records. |
| 3 | Vic, GitHub Actions | Open **Deploy Cloudflare Workers**, click **Run workflow**, choose `production`, enter exactly `deploy`, then run it. | `npm run check`, pod build, and every W-103 readiness check are green. Confirm the deploy log uses `wrangler.pod-1.toml`, not the rehearsal config. |
| 4 | Vic | Check `https://stuarthomeownersinsurance.com/` and `https://www.stuarthomeownersinsurance.com/`. | Both return HTTPS 200 and neither response has `X-Robots-Tag`. Check `robots.txt` and `sitemap.xml` use the real domain. |
| 5 | Vic | Make one tracking call and submit one test lead at `/contact/`. | The call rings someone and is recorded in GoTo. The lead reaches GoHighLevel (sub-account Walker Insurance) with **Contact source** `stuart-homeowners`; the form sets no tags. Delete the test contact afterwards. |
| 6 | Vic | Confirm measurement and discovery. | GA4 shows the visit in real time; create/verify Search Console property and submit the sitemap manually. Search Console automation is Phase 7 work. |
| 7 | Vic, GA4 | Mark the conversions. GTM container `GTM-TV5RN2DB` (version 3, "Conversion events") and the GA4 custom dimensions `link_location` and `site_slug` are already live since 30-sep. GA4 only lets you star an event after it has arrived once, so this waits for the test lead and call in step 5. In **Admin → Data display → Events → Recent events**, star `generate_lead` and `phone_click`. | Both appear under **Key events**. Optional: run GTM **Preview** on the real domain and confirm `GA4 events` fires on `quote_start`, `generate_lead` and `phone_click`. |

| 8 | Vic → Claude Code, `prompts/2026-10-02_033_deploy-automatico-produccion.md` | **Re-enable automatic production deploys.** `deploy.yml` has its `push` trigger commented out until launch. Until it is back, a Studio publish only updates the workers.dev copy and the live domain stays on the launch version, which contradicts the handbook ("a live site updates on its domain within minutes"). Do it on 9-oct after step 7, or first thing on 10-oct. | A small test publish from Studio appears on `stuarthomeownersinsurance.com` within minutes. |

Start step 1 in the morning, Eastern time, so anything that goes wrong is solved during business hours.

## Rollback

An apex `A` record pointing back to GoDaddy parking is not a useful rollback: it removes the
site rather than restoring the last known working version. If the Worker is unhealthy, roll back
from the browser: Cloudflare dashboard → **Workers & Pages** → `wicfl-pod-1` → **Deployments** →
the last good version → **Rollback**. (Vic never runs commands; if a command-line rollback is
ever needed, it goes to the executor as a prompt.)

Confirm the selected prior deployment is healthy at both apex hosts and record the incident in
`BITACORA.md` before trying another production deploy.

## Permanent rehearsal environment

Do not remove `wicfl-pod-1-rehearsal` or `preview.stuarthomeownersinsurance.com` after launch.
They remain the pod's rehearsal environment. Add an explicit alias for each future site to
`pods/pod-1.json`, test it through this Worker, and keep its `X-Robots-Tag: noindex, nofollow`
header in place.
