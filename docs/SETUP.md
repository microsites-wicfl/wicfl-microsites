# Local setup and deployment handoff

**Updated 4 Sep 2026.** This repository is the WICFL microsite factory. The shared Astro
template runs locally without a Cloudflare account or a real domain.

## Run the template locally

1. Install Node.js 22 or newer.
2. Clone this repository and open a terminal in its root folder.
3. Run `npm install` once to install the workspace dependencies.
4. Run `npm run dev`.
5. Open the local address printed by Astro, normally `http://localhost:4321`.
6. Press `Ctrl+C` in the terminal when you are done.

To check the current contract, run `npm run check`. To generate the fixture site, run `npm run build`; the generator writes it to `dist/sites/_example/`. To build another site, create only `sites/<site-directory>/site.config.json` and markdown in `sites/<site-directory>/content/`, then run `npm run build:site -- <site-directory>`.

The reusable bilingual fixture is `sites/_example/site.config.json`. It deliberately has English as its primary language and Spanish as an alternate so bilingual routing has a real exercised test case, even though the two pilots are independent monolingual sites. Do not treat it as a real site or publish its placeholder details.

## How preview deploys work for Pavel

**Live as of 4 Sep 2026 (W-098).** Push a branch, open a pull request, and GitHub Actions
discovers which sites changed, validates the configuration, and builds each one. A successful
run deploys the site to its own ephemeral Worker and posts the URL as a comment on the pull
request, updating that same comment on every later push instead of adding a new one. Open the
URL to review the rendered site before merging. When the pull request closes, the preview Worker
is deleted automatically, so nothing accumulates against the account's Worker limit.

No local dev server is required for this. `npm run dev` above still works and is useful for fast
iteration, but the pull request preview is the reviewable, shareable link.

This has been verified to build and deploy correctly, but not yet exercised end to end with a
real pull request. If something about it doesn't work as described, that is exactly the kind of
gap Gate A's question-logging (`docs/SCHEDULE.md`) exists to catch — flag it rather than working
around it silently.

## How rehearsal and production deploys work

**Built (W-014), not yet turned on for a real site.** Sites are grouped into pods of up to ~25
per Cloudflare Worker (`docs/ARCHITECTURE.md`, "Grouping" decision) instead of one Worker per
site. `pods/pod-1.json` lists which site slugs belong to that pod; `wrangler.pod-1.toml` is its
real deploy configuration, including the custom domain routes for each site in it.
`.github/workflows/deploy.yml` is dispatch-only: in GitHub Actions, run **Deploy Cloudflare
Workers**, select `rehearsal` or `production`, and type exactly `deploy`. Push-based deployment
stays intentionally disabled until a separately reviewed post-launch change.

The rehearsal target deploys the separate `wicfl-pod-1-rehearsal` Worker to
`preview.stuarthomeownersinsurance.com`. It exercises custom-domain DNS, SSL, assets, and host
routing without touching the apex; every response carries `X-Robots-Tag: noindex, nofollow`.
Its readiness gate reports placeholder findings without blocking. Production uses
`wrangler.pod-1.toml` and the same gate is fail-closed: a real site's config must contain no
placeholder data before it can deploy. Follow `docs/LAUNCH_RUNBOOK.md` for the launch order.

Before it deploys, `deploy.yml` runs `scripts/check-production-config.mjs` against every site
actually listed in the pod being deployed. This rejects known placeholder patterns
(`PLACEHOLDER`, `PENDING_`, an unconfigured tracking phone) so a site cannot go live showing a
unset tracking phone or an unset GA4 ID. It does not run in the preview pipeline, on purpose:
legitimately iterating with pending fields while writing is fine, shipping them to production
is not.

**Adding a site to a pod:** add its slug to the relevant pod's JSON file, add its domain as a
`[[routes]]` pair in the production `wrangler.*.toml`, and add an explicit rehearsal alias to
the pod JSON. Make sure its config has no placeholder data before selecting production.

## Cloudflare account status

The account used for the deploys above exists and is verified working end to end (DNS, zone,
Worker deploys). It is not yet the fully governed account W-010 describes: two Super
Administrators, Pavel as Administrator, 2FA, and recovery codes in a shared vault rather than in
chat history. See `BACKLOG.md` items W-010 and W-105, and `docs/VAULT_SETUP_CHECKLIST.md`, for
where that stands.
