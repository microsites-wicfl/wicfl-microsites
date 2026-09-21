import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { routeForPageId, site } from "../lib/site-data.mjs";

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  "\"": "&quot;"
}[character] ?? character));

export const prerender = true;

export const GET: APIRoute = async () => {
  const pages = await getCollection("pages");
  const urls = pages
    .map((page) => `  <url><loc>${escapeXml(`https://${site.domain}${routeForPageId(page.id)}`)}</loc></url>`)
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
