import { UserError } from "./errors.js";

const SLUG = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEGMENT = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export function assertSlug(slug) {
  if (typeof slug !== "string" || !SLUG.test(slug)) throw new UserError("That site doesn't exist.", 404);
  return slug;
}

export function draftBranch(slug) {
  return `draft/${assertSlug(slug)}`;
}

export function contentRoot(slug) {
  return `sites/${assertSlug(slug)}/content/`;
}

// Turns a page path as the interface sends it ("index.md", "es/about.md") into the repository
// path under the site's own content folder. Anything that could escape that folder is rejected:
// this is the guard that keeps every write inside sites/<slug>/, which Gate A depends on.
export function pageFile(slug, relativePath) {
  if (typeof relativePath !== "string" || !relativePath.endsWith(".md")) {
    throw new UserError("Only the site's pages can be edited.", 400);
  }
  const segments = relativePath.slice(0, -3).split("/");
  if (segments.length === 0 || segments.length > 3 || !segments.every((part) => SEGMENT.test(part))) {
    throw new UserError("Only the site's pages can be edited.", 400);
  }
  return `${contentRoot(slug)}${relativePath}`;
}

export function relativePage(slug, repositoryPath) {
  return repositoryPath.slice(contentRoot(slug).length);
}

// Images Pavel uploads live in the site's own public/images/ folder and are served at /images/<name>.
// Only common web formats; SVG is excluded because it can carry scripts.
export const IMAGE_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
const IMAGE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp|gif)$/;

export function imagesRoot(slug) {
  return `sites/${assertSlug(slug)}/public/images/`;
}

export function imageFile(slug, name) {
  if (typeof name !== "string" || !IMAGE_NAME.test(name)) {
    throw new UserError("Images must be JPG, PNG, WebP or GIF files.", 400);
  }
  return `${imagesRoot(slug)}${name}`;
}

// "My Photo (1).JPG" -> "my-photo-1.jpg"
export function imageNameFrom(fileName) {
  const match = String(fileName || "").match(/^(.*?)(?:\.([A-Za-z0-9]+))?$/);
  const extension = (match[2] || "").toLowerCase();
  if (!IMAGE_TYPES[extension]) throw new UserError("Images must be JPG, PNG, WebP or GIF files.", 400);
  const base = match[1]
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
  return `${base || "image"}.${extension}`;
}

