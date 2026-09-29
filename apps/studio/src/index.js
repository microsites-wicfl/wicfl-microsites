import { requireUser } from "./access.js";
import { UserError, json } from "./errors.js";
import { GitHub } from "./github.js";
import { ICONS } from "../../../packages/config-schema/icons.mjs";
import {
  createPage,
  createSite,
  getSettings,
  publishDraft,
  saveSettings,
  deletePage,
  discardDraft,
  getSite,
  listImages,
  listSites,
  pagesLinkingTo,
  readImage,
  readLogo,
  uploadLogo,
  readPage,
  restorePage,
  savePage,
  uploadImage,
} from "./sites.js";

// Routes:
//   GET    /api/me
//   GET    /api/sites
//   GET    /api/sites/:slug
//   GET    /api/sites/:slug/pages/<path>.md
//   PUT    /api/sites/:slug/pages/<path>.md     body: { "fields": {...}, "body": "..." } or { "content": "..." }
//   POST   /api/sites/:slug/pages                body: { "fields": {...}, "body": "..." }   (new page)
//   DELETE /api/sites/:slug/pages/<path>.md
//   GET    /api/sites/:slug/links?page=<path>.md  (pages that link to it)
//   POST   /api/sites/:slug/restore              body: { "path": "<path>.md" }
//   GET    /api/sites/:slug/images               (list)
//   POST   /api/sites/:slug/images               body: { "name": "photo.jpg", "data": "<base64>" }
//   GET    /api/sites/:slug/images/<name>        (the image itself, from the draft if there is one)
//   GET    /api/sites/:slug/logo                 (the site's logo, from the draft if there is one)
//   POST   /api/sites/:slug/logo                 body: { "name": "logo.svg", "data": "<base64>" }
//   GET    /api/icons                            (the icons page blocks can use, name -> SVG)
//   GET    /api/sites/:slug/logo/dark            (the logo for the dark footer)
//   POST   /api/sites/:slug/logo/dark            body: same as /logo
//   POST   /api/sites                           body: new site form            (new site, as a draft)
//   GET    /api/sites/:slug/settings
//   PUT    /api/sites/:slug/settings            body: settings form
//   POST   /api/sites/:slug/publish
//   DELETE /api/sites/:slug/draft
// Uploaded files are served so they can never run code in Studio, even if one is opened directly.
function fileResponse(file) {
  return new Response(file.bytes, {
    headers: {
      "content-type": file.type,
      "cache-control": "private, max-age=300",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "x-content-type-options": "nosniff",
    },
  });
}

async function route(request, github, user, web) {
  const url = new URL(request.url);
  const [, , resource, slug, section, ...rest] = url.pathname.split("/");
  const method = request.method;

  if (resource === "me" && method === "GET") return { email: user.email };
  // The icons page blocks can use, so the live preview draws the same pictures as the site.
  if (resource === "icons" && !slug && method === "GET") return ICONS;
  if (resource !== "sites") throw new UserError("Not found.", 404);
  if (!slug && method === "GET") return listSites(github, web);
  if (!slug && method === "POST") return createSite(github, await request.json().catch(() => ({})), user.email);
  if (section === "settings" && rest.length === 0 && method === "GET") return getSettings(github, slug);
  if (section === "settings" && rest.length === 0 && method === "PUT") {
    return saveSettings(github, slug, await request.json().catch(() => ({})), user.email);
  }
  if (section === "publish" && rest.length === 0 && method === "POST") {
    return publishDraft(github, slug, user.email, web);
  }
  if (slug && !section && method === "GET") return getSite(github, slug, web);

  if (section === "images" && rest.length === 0 && method === "GET") return listImages(github, slug);
  if (section === "images" && rest.length === 0 && method === "POST") {
    return uploadImage(github, slug, await request.json().catch(() => ({})), user.email);
  }
  if (section === "images" && rest.length === 1 && method === "GET") {
    const image = await readImage(github, slug, decodeURIComponent(rest[0]));
    return fileResponse(image);
  }
  if (section === "logo" && rest.length <= 1 && method === "GET") {
    return fileResponse(await readLogo(github, slug, rest[0] || "main"));
  }
  if (section === "logo" && rest.length <= 1 && method === "POST") {
    return uploadLogo(github, slug, await request.json().catch(() => ({})), user.email, rest[0] || "main");
  }
  if (section === "pages" && rest.length === 0 && method === "POST") {
    return createPage(github, slug, await request.json().catch(() => ({})), user.email);
  }
  if (section === "links" && rest.length === 0 && method === "GET") {
    return pagesLinkingTo(github, slug, url.searchParams.get("page") || "");
  }
  if (section === "restore" && rest.length === 0 && method === "POST") {
    const body = await request.json().catch(() => ({}));
    return restorePage(github, slug, body.path, user.email);
  }
  if (section === "pages" && rest.length > 0) {
    const page = rest.map(decodeURIComponent).join("/");
    if (method === "GET") return readPage(github, slug, page);
    if (method === "PUT") {
      const body = await request.json().catch(() => ({}));
      return savePage(github, slug, page, body, user.email);
    }
    if (method === "DELETE") return deletePage(github, slug, page, user.email);
  }
  if (section === "draft" && rest.length === 0 && method === "DELETE") return discardDraft(github, slug);
  throw new UserError("Not found.", 404);
}

// fetcher reaches GitHub; accessFetcher reaches the Access public keys; webFetcher checks whether a
// site's own domain is live. All injectable for tests.
export function createHandler(fetcher = fetch, accessFetcher = fetch, webFetcher = fetch) {
  return async function handle(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      const user = await requireUser(request, ctx, env, accessFetcher);
      const web = (input, init) => webFetcher(input, init);
      const result = await route(request, new GitHub(env, fetcher), user, web);
      return result instanceof Response ? result : json(result);
    } catch (error) {
      if (error instanceof UserError) return json({ error: error.message }, error.status);
      // One line with name and message: Workers Logs split a multi-line error and dropped the message.
      console.error(`Studio error: ${error?.name}: ${error?.message} | ${request.method} ${url.pathname}`);
      console.error(error?.stack);
      return json({ error: "Something went wrong on our side. Try again; if it keeps happening, let Vic know." }, 502);
    }
  };
}

export default { fetch: createHandler() };
