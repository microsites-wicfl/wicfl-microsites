import { loadSiteConfig } from "./site-config.mjs";

export const site = loadSiteConfig();

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

// FAQPage JSON-LD (W-125) from the faq entries a page's :::faq blocks collect in
// remarkPluginFrontmatter.faq (see remark-columns.mjs). null when the page has none, so the
// caller can skip the <script> tag entirely instead of emitting an empty FAQPage.
export function faqPageJsonLd(faq) {
  if (!faq || faq.length === 0) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  }).replace(/</g, "\\u003c");
}

function absoluteUrl(origin, path) {
  return new URL(path, `${origin}/`).toString();
}

function postalAddress(address) {
  if (!address) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.city,
    addressRegion: address.state,
    postalCode: address.zip
  };
}

// Shared page-level schema graph. The config supplies business entities; page frontmatter only
// decides whether the page represents a concrete service. No author writes JSON-LD by hand.
export function siteGraphJsonLd(config, page) {
  const origin = `https://${config.domain}`;
  const pageUrl = absoluteUrl(origin, page.path);
  const agencyId = `${origin}/#agency`;
  const websiteId = `${origin}/#website`;
  const associatedAgencyId = config.agency
    ? `${config.agency.url.replace(/\/+$/, "")}/#organization`
    : undefined;
  const graph = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${origin}/`,
      name: config.brand.name,
      inLanguage: config.locale.primary,
      publisher: { "@id": agencyId }
    },
    {
      "@type": "InsuranceAgency",
      "@id": agencyId,
      name: config.brand.name,
      url: `${origin}/`,
      telephone: config.contact.trackingPhone,
      email: config.contact.email,
      ...(config.geo.serviceArea ? { areaServed: config.geo.serviceArea } : {}),
      ...(config.contact.address ? { address: postalAddress(config.contact.address) } : {}),
      ...(config.brand.logo ? { logo: absoluteUrl(origin, config.brand.logo) } : {}),
      ...(associatedAgencyId ? { parentOrganization: { "@id": associatedAgencyId } } : {})
    }
  ];
  if (config.agency) {
    graph.push({
      "@type": "InsuranceAgency",
      "@id": associatedAgencyId,
      name: config.agency.name,
      url: config.agency.url,
      ...(config.agency.telephone ? { telephone: config.agency.telephone } : {}),
      ...(config.agency.address ? { address: postalAddress(config.agency.address) } : {})
    });
  }
  if (page.path !== "/") {
    const homePath = page.lang === config.locale.primary ? "/" : `/${page.lang}/`;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(origin, homePath) },
        { "@type": "ListItem", position: 2, name: page.navLabel ?? page.title, item: pageUrl }
      ]
    });
  }
  if (page.serviceName) {
    graph.push({
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: page.serviceName,
      serviceType: page.serviceName,
      url: pageUrl,
      ...(page.description ? { description: page.description } : {}),
      provider: { "@id": agencyId },
      ...(config.geo.serviceArea ? { areaServed: config.geo.serviceArea } : {})
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
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
