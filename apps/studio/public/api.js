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
  // payload is { fields, body } from the fields editor, or { content } for the whole file.
  savePage: (slug, path, payload) =>
    request(pagePath(slug, path), { method: "PUT", body: JSON.stringify(payload) }),
  createPage: (slug, payload) =>
    request(`/sites/${encodeURIComponent(slug)}/pages`, { method: "POST", body: JSON.stringify(payload) }),
  deletePage: (slug, path) => request(pagePath(slug, path), { method: "DELETE" }),
  links: (slug, path) =>
    request(`/sites/${encodeURIComponent(slug)}/links?page=${encodeURIComponent(path)}`),
  restorePage: (slug, path) =>
    request(`/sites/${encodeURIComponent(slug)}/restore`, { method: "POST", body: JSON.stringify({ path }) }),
  images: (slug) => request(`/sites/${encodeURIComponent(slug)}/images`),
  uploadImage: (slug, name, data) =>
    request(`/sites/${encodeURIComponent(slug)}/images`, {
      method: "POST",
      body: JSON.stringify({ name, data }),
    }),
  createSite: (payload) => request("/sites", { method: "POST", body: JSON.stringify(payload) }),
  settings: (slug) => request(`/sites/${encodeURIComponent(slug)}/settings`),
  saveSettings: (slug, payload) =>
    request(`/sites/${encodeURIComponent(slug)}/settings`, { method: "PUT", body: JSON.stringify(payload) }),
  publish: (slug) => request(`/sites/${encodeURIComponent(slug)}/publish`, { method: "POST" }),
  discardDraft: (slug) => request(`/sites/${encodeURIComponent(slug)}/draft`, { method: "DELETE" }),
};
