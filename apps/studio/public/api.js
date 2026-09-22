import { text } from "./strings.js";

async function request(path, init = {}) {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json" } : {},
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || text.genericError);
  return body;
}

const pagePath = (slug, path) =>
  `/sites/${encodeURIComponent(slug)}/pages/${path.split("/").map(encodeURIComponent).join("/")}`;

export const api = {
  me: () => request("/me"),
  sites: () => request("/sites"),
  site: (slug) => request(`/sites/${encodeURIComponent(slug)}`),
  page: (slug, path) => request(pagePath(slug, path)),
  savePage: (slug, path, content) =>
    request(pagePath(slug, path), { method: "PUT", body: JSON.stringify({ content }) }),
  discardDraft: (slug) => request(`/sites/${encodeURIComponent(slug)}/draft`, { method: "DELETE" }),
};
