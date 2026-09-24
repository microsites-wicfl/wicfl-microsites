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
