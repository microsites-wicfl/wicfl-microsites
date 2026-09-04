import { readFileSync } from "node:fs";

const configPath = process.env.WICFL_SITE_CONFIG;
if (!configPath) {
  throw new Error("Missing WICFL_SITE_CONFIG. Run npm run build:site -- <site-directory>.");
}

export const site = JSON.parse(readFileSync(configPath, "utf8"));

// W-022: bilingual routing. Only non-primary locales get a URL prefix, so a monolingual site
// (both current pilots: locale.alternates is always []) keeps exactly the routes it has today,
// unprefixed. An alternate locale's content lives under content/<locale>/ and the primary
// locale's content stays flat at content/<name>.md, exactly as before this existed.
//
// Astro's glob content loader collapses an "index.md" file's id to just its directory: a
// top-level content/index.md has id "index", but content/es/index.md has id "es", not
// "es/index" (an empty "rest" after the locale segment). Every helper below treats that empty
// rest as the locale's home page, i.e. equivalent to a bare "index".
const isAlternateLocale = (locale) => site.locale.alternates.includes(locale);

export const routeFromId = (id) => (id === "index" ? "/" : `/${id}/`);

export function routeForPageId(id) {
  const [first, ...rest] = id.split("/");
  if (isAlternateLocale(first)) {
    const name = rest.length > 0 ? rest.join("/") : "index";
    return name === "index" ? `/${first}/` : `/${first}/${name}/`;
  }
  return routeFromId(id);
}

export function localeOfPageId(id) {
  const [first] = id.split("/");
  return isAlternateLocale(first) ? first : site.locale.primary;
}

// The name a page shares with its counterpart in another locale: content/index.md (id "index")
// and content/es/index.md (id "es") are "the same page" (both bareName to "index");
// content/about.md and content/es/about.md both bareName to "about".
function bareName(id) {
  const [first, ...rest] = id.split("/");
  if (!isAlternateLocale(first)) return id;
  return rest.length > 0 ? rest.join("/") : "index";
}

// hreflang alternates for one page, computed against the site's full page collection. Returns
// [] for a monolingual site, since there is nothing to point at: docs/SCHEDULE.md is explicit
// that this routing is built and exercised (by the bilingual sites/_example fixture in CI) but
// not used by either real pilot site yet.
export function hreflangAlternatesFor(pageId, allPages) {
  if (site.locale.alternates.length === 0) return [];
  const name = bareName(pageId);
  const matches = allPages.filter((page) => bareName(page.id) === name);
  const links = matches.map((page) => ({ hreflang: localeOfPageId(page.id), href: routeForPageId(page.id) }));
  const primaryMatch = matches.find((page) => localeOfPageId(page.id) === site.locale.primary);
  if (primaryMatch) links.push({ hreflang: "x-default", href: routeForPageId(primaryMatch.id) });
  return links;
}
