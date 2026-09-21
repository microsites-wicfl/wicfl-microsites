import type { APIRoute } from "astro";
import { site } from "../lib/site-data.mjs";

export const prerender = true;

export const GET: APIRoute = () => new Response(`User-agent: *
Allow: /

Sitemap: https://${site.domain}/sitemap.xml
`, {
  headers: { "content-type": "text/plain; charset=utf-8" }
});
