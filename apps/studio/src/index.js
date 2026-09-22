import { identity } from "./access.js";
import { discard, listSites, save, siteDetail, page } from "./model.js";

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export function createHandler(fetcher = fetch) {
  return async function handle(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const auth = await identity(ctx, env);
    if (auth.error) return json({ error: auth.message }, auth.error);
    try {
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.pathname === "/api/me") return json({ email: auth.user.email });
      if (url.pathname === "/api/sites") return json(await listSites(env, fetcher));
      const slug = parts[2];
      if (parts[1] !== "sites" || !slug) return json({ error: "No encontrado." }, 404);
      if (request.method === "DELETE" && parts[3] === "draft") { await discard(env, slug, fetcher); return json({ ok: true }); }
      const path = `sites/${slug}/content/${parts.slice(4).join("/")}`;
      if (request.method === "GET" && parts[3] === "pages") return json(await page(env, slug, path, fetcher));
      if (request.method === "PUT" && parts[3] === "pages") { await save(env, slug, path, (await request.json()).content, auth.user.email, fetcher); return json({ ok: true }); }
      if (request.method === "GET") return json(await siteDetail(env, slug, fetcher));
      return json({ error: "No encontrado." }, 404);
    } catch (error) { return json({ error: error.message || "No se pudo completar la acción." }, error.status || 500); }
  };
}

export default { fetch: createHandler() };
