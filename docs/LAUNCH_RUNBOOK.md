# Site #1 launch runbook

**Owner:** Vic. **Launch target:** Friday, 9 October 2026. This is the operational sequence for
`stuarthomeownersinsurance.com`; it deliberately separates the permanent rehearsal environment
from the production apex.

## Day-before preconditions

0. **Before the production dispatch**, make the separately reviewed production config correction:
   current Wrangler rejects `custom_domain = true` patterns containing `/*`; custom domains use
   the hostname only. W-119 did not change `wrangler.pod-1.toml` because its prompt explicitly
   prohibited it. The rehearsal failure documented in its report established this as a required
   pre-launch fix.
1. Vic merges the approved, real Site #1 values into `sites/stuart-homeowners/site.config.json`.
   The production-readiness gate must contain no placeholder findings.
2. Vic runs **Deploy Cloudflare Workers** from GitHub Actions with `target: rehearsal` and
   `confirm: deploy`. The run must be green, its W-103 output must be clean, and
   `https://preview.stuarthomeownersinsurance.com/` must serve the final content with valid
   HTTPS. The rehearsal target still runs the gate, while production would block on any finding.
3. Pavel completes the content and conversion checks in `docs/QA_CHECKLIST.md`.
4. Vic updates the GitHub `CLOUDFLARE_API_TOKEN` to include the zone permission needed to create
   Workers routes/custom domains, then re-runs rehearsal successfully. The current token uploads
   a Worker and assets but Cloudflare rejects `zones/.../workers/routes` with "No access to the
   specified resource." Do not broaden it beyond the least privilege necessary.

## Launch sequence, 9 October

| Order | Owner | Action | Verify before continuing |
|---|---|---|---|
| 1 | Vic, Cloudflare dashboard | Set **SSL/TLS → Overview** to **Full (strict)**. | The zone is active and the certificate state is valid. |
| 2 | Vic, Cloudflare dashboard | In **DNS**, delete the two apex `A` records that point to GoDaddy parking and the obsolete `_domainconnect` CNAME. | The old parked apex is gone. Do not leave hours between this and the next step: the apex will not resolve until the Worker deploy creates its record. |
| 3 | Vic, GitHub Actions | Open **Deploy Cloudflare Workers**, click **Run workflow**, choose `production`, enter exactly `deploy`, then run it. | `npm run check`, pod build, and every W-103 readiness check are green. Confirm the deploy log uses `wrangler.pod-1.toml`, not the rehearsal config. |
| 4 | Vic | Check `https://stuarthomeownersinsurance.com/` and `https://www.stuarthomeownersinsurance.com/`. | Both return HTTPS 200 and neither response has `X-Robots-Tag`. Check `robots.txt` and `sitemap.xml` use the real domain. |
| 5 | Vic | Make one tracking call and submit one test lead at `/contact/`. | The call is recorded in GoTo; the lead reaches GoHighLevel with the site tag. |
| 6 | Vic | Confirm measurement and discovery. | GA4 shows the visit in real time; create/verify Search Console property and submit the sitemap manually. Search Console automation is Phase 7 work. |

## Rollback

An apex `A` record pointing back to GoDaddy parking is not a useful rollback: it removes the
site rather than restoring the last known working version. If the Worker is unhealthy, first
use Cloudflare's deployment history to identify the previous good version, then run from this
repository with the production credentials available to the workflow:

```sh
npx wrangler rollback --config wrangler.pod-1.toml
```

Confirm the selected prior deployment is healthy at both apex hosts and record the incident in
`BITACORA.md` before trying another production deploy.

## Permanent rehearsal environment

Do not remove `wicfl-pod-1-rehearsal` or `preview.stuarthomeownersinsurance.com` after launch.
They remain the pod's rehearsal environment. Add an explicit alias for each future site to
`pods/pod-1.json`, test it through this Worker, and keep its `X-Robots-Tag: noindex, nofollow`
header in place.
