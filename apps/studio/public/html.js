const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => entities[character]);
}

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function pageLink(slug, path) {
  return `#/site/${encodeURIComponent(slug)}/page/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function siteLink(slug) {
  return `#/site/${encodeURIComponent(slug)}`;
}
