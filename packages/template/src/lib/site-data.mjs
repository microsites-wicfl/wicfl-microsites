import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const configPath = process.env.WICFL_SITE_CONFIG;
const contentDirectory = process.env.WICFL_SITE_CONTENT;

if (!configPath || !contentDirectory) {
  throw new Error(
    "Missing WICFL_SITE_CONFIG or WICFL_SITE_CONTENT. Run npm run build:site -- <site-directory>."
  );
}

export const site = JSON.parse(readFileSync(configPath, "utf8"));

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function markdownToHtml(markdown) {
  return markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => {
      const escaped = escapeHtml(block.trim());
      if (escaped.startsWith("## ")) return `<h2>${escaped.slice(3)}</h2>`;
      if (escaped.startsWith("### ")) return `<h3>${escaped.slice(4)}</h3>`;
      return `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(path);
      return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
    });
}

function pageFromFile(path) {
  const relativePath = relative(contentDirectory, path).split(sep).join("/");
  const filename = relativePath.replace(/\.md$/, "");
  const route = filename === "index" ? "/" : `/${filename}/`;
  const source = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const [heading, ...body] = source.split("\n");
  return {
    route,
    title: heading.replace(/^#\s+/, "") || site.seo.title,
    html: markdownToHtml(body.join("\n").trim())
  };
}

export const pages = markdownFiles(contentDirectory).map(pageFromFile);

if (!pages.some((page) => page.route === "/")) {
  throw new Error(`Missing required content page: ${join(contentDirectory, "index.md")}`);
}

export function pageByRoute(route) {
  const page = pages.find((candidate) => candidate.route === route);
  if (!page) throw new Error(`No markdown content maps to route ${route}.`);
  return page;
}
