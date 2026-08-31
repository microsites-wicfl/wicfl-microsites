# Local setup and deployment handoff

This repository is the WICFL microsite factory. The shared Astro template runs locally without a Cloudflare account or a real domain.

## Run the template locally

1. Install Node.js 22 or newer.
2. Clone this repository and open a terminal in its root folder.
3. Run `npm install` once to install the workspace dependencies.
4. Run `npm run dev`.
5. Open the local address printed by Astro, normally `http://localhost:4321`.
6. Press `Ctrl+C` in the terminal when you are done.

To check the current contract and template without starting a server, run `npm run check`. To generate the static template output, run `npm run build`; Astro writes it to `packages/template/dist/`.

The reusable bilingual fixture is `sites/_example/site.config.json`. It deliberately has English as its primary language and Spanish as an alternate so future bilingual routing can be tested even though the two pilots are independent monolingual sites. Do not treat it as a real site or publish its placeholder details.

## How preview deploys will work for Pavel

After Cloudflare is connected, Pavel changes only a site's `site.config.json` or markdown, creates a branch, and pushes it. GitHub Actions validates the configuration and builds the changed site. A successful run posts a temporary preview URL on the pull request; Pavel opens that URL to review the rendered site before merging. The branch is merged only after review, then the production workflow deploys the approved site.

Today, the preview workflow is intentionally disabled. It is a documented connection point, not a working deployment.

## Pending until the Cloudflare account exists

Complete these steps only after W-092 supplies the company mailbox and W-010 creates the WICFL account:

1. Create the WICFL Cloudflare account with the company mailbox, required administrators, 2FA, and recovery-code handling defined in W-010.
2. Create a scoped API token limited to the Workers resources required for deployment. Never use a Global API Key.
3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets; do not place them in files or workflow YAML.
4. Create the Workers Static Assets configuration (`wrangler.toml`), choose Worker names and pod-to-route mapping, and configure production routes/custom domains after domain work is approved.
5. Enable `.github/workflows/deploy.yml`, replacing its placeholder Worker configuration with the approved production configuration.
6. Enable `.github/workflows/preview.yml`, define unique branch preview Worker names and the URL that GitHub Actions reports to the pull request.
7. Run one preview deploy and one production deploy with a non-production fixture before relying on the flow for Pavel's content work.

GitHub Actions cannot perform a Cloudflare deploy until those secrets and Worker configuration exist.
