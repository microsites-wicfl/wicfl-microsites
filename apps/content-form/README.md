# WICFL content form (W-111)

This Worker is a small, protected front door to the existing GitHub pull-request workflow. It never merges a pull request and writes only `site.config.json` plus Markdown under `sites/<slug>/content/`.

## Required Worker secrets

Set these interactively; never put their values in this repository:

```sh
npx wrangler secret put GITHUB_TOKEN --config apps/content-form/wrangler.jsonc
npx wrangler secret put OPERATOR_PASSWORD --config apps/content-form/wrangler.jsonc
```

`GITHUB_TOKEN` must be a fine-grained GitHub token restricted to `microsites-wicfl/wicfl-microsites`, with **Contents: Read and write** and **Pull requests: Read and write** only. `OPERATOR_PASSWORD` is the shared password for the current single operator; HTTPS and an HttpOnly signed cookie protect the session.

Deploy only after both secrets are set:

```sh
npx wrangler deploy --config apps/content-form/wrangler.jsonc
```

The Worker reads the available sites and existing Markdown directly from GitHub's `main` branch. It exposes only `brand.name` and the `seo` object from the config; legal contact details, analytics, CRM, domain, theme, geography, locale, products, and differentiation stay outside the daily content editor.
