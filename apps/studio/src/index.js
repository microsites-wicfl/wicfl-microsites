import { requireUser } from "./access.js";
import { UserError, json } from "./errors.js";
import { GitHub } from "./github.js";
import { discardDraft, getSite, listSites, readPage, savePage } from "./sites.js";

// Routes:
//   GET    /api/me
//   GET    /api/sites
//   GET    /api/sites/:slug
//   GET    /api/sites/:slug/pages/<path>.md
//   PUT    /api/sites/:slug/pages/<path>.md     body: { "content": "..." }
//   DELETE /api/sites/:slug/draft
async function route(request, github, user) {
  const url = new URL(request.url);
  const [, , resource, slug, section, ...rest] = url.pathname.split("/");
  const method = request.method;

  if (resource === "me" && method === "GET") return { email: user.email };
  if (resource !== "sites") throw new UserError("No encontrado.", 404);
  if (!slug && method === "GET") return listSites(github);
  if (slug && !section && method === "GET") return getSite(github, slug);

  if (section === "pages" && rest.length > 0) {
    const page = rest.map(decodeURIComponent).join("/");
    if (method === "GET") return readPage(github, slug, page);
    if (method === "PUT") {
      const body = await request.json().catch(() => ({}));
      return savePage(github, slug, page, body.content, user.email);
    }
  }
  if (section === "draft" && rest.length === 0 && method === "DELETE") return discardDraft(github, slug);
  throw new UserError("No encontrado.", 404);
}

export function createHandler(fetcher = fetch) {
  return async function handle(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      const user = await requireUser(ctx, env);
      return json(await route(request, new GitHub(env, fetcher), user));
    } catch (error) {
      if (error instanceof UserError) return json({ error: error.message }, error.status);
      console.error(error);
      return json({ error: "Algo falló de nuestro lado. Intenta de nuevo; si sigue, avísale a Vic." }, 502);
    }
  };
}

export default { fetch: createHandler() };
