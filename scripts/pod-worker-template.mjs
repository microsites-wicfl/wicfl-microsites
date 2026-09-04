// GENERATED FILE — do not edit dist/pods/**/worker.mjs by hand. This is the source template;
// scripts/build-pod.mjs copies it and substitutes the ROUTES marker below with the pod's real
// domain -> site-slug map, built from each site's site.config.json "domain" field.
//
// Why this file exists at all: docs/ARCHITECTURE.md's "Grouping" decision is pods of ~25 sites
// per Worker, not one Worker per site (caps at 500, multiplies deploys) and not one Worker for
// everything (a bad deploy takes down the portfolio). A single Workers Static Assets binding
// only ever serves one directory tree, so putting several sites behind one Worker needs a script
// that picks the right site's assets per request — this is that script, plus a fixed rule: which
// site "won" the pathname for a given request is decided by the Host header, once, here.

const ROUTES = __WICFL_POD_ROUTES__;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const slug = ROUTES[host] ?? ROUTES[host.replace(/^www\./, "")];

    if (!slug) {
      return new Response(`No site in this pod is configured for host "${host}".`, { status: 404 });
    }

    const assetUrl = new URL(request.url);
    assetUrl.pathname = `/${slug}${url.pathname}`;
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
};
