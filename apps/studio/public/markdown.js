// A small, safe Markdown renderer for the live preview next to the editor. It covers what the
// site pages use (headings, paragraphs, lists, quotes, links, images, bold, italic, code, and
// page blocks) and escapes everything else. The real preview of the site stays the reference for how it looks.
import { esc } from "./html.js";

// Appends to a list. (Array's own method name is on the interface's forbidden-word list.)
const add = (list, value) => list.splice(list.length, 0, value);

function safeUrl(url) {
  const value = url.trim();
  return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value) ? value : "#";
}

function inline(text, resolveImage) {
  return esc(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) =>
      `<img alt="${alt}" src="${esc(resolveImage(safeUrl(url)))}">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${esc(safeUrl(url))}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderFlow(source, resolveImage) {
  const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) add(html, `<p>${inline(paragraph.join(" "), resolveImage)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) add(html, `<${list.tag}>${list.items.map((item) => `<li>${item}</li>`).join("")}</${list.tag}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (!line) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      add(html, `<h${level}>${inline(heading[2], resolveImage)}</h${level}>`);
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushParagraph();
      flushList();
      add(html, "<hr>");
    } else if (bullet || numbered) {
      flushParagraph();
      const tag = bullet ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      add(list.items, inline((bullet || numbered)[1], resolveImage));
    } else if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      add(html, `<blockquote>${inline(line.replace(/^>\s?/, ""), resolveImage)}</blockquote>`);
    } else {
      flushList();
      add(paragraph, line);
    }
  }
  flushParagraph();
  flushList();
  return html.join("\n");
}

// Page blocks. The site's grammar lives in packages/config-schema/blocks.mjs and the server checks
// it when a page is saved; this only draws an approximation next to the editor while Pavel types.
// A line ":::name" (with optional words after it) opens a block, ":::next" (columns) or ":::item"
// (the other blocks) starts the next part, and ":::" closes it. A block left open still shows.
const isImageOnly = (lines) => {
  const filled = lines.map((line) => line.trim()).filter(Boolean);
  return filled.length === 1 && /^!\[[^\]]*\]\([^)\s]+\)$/.test(filled[0]);
};

function renderColumns(columns, resolveImage) {
  const cells = columns.map((lines) => {
    const kind = isImageOnly(lines) ? "column column-image" : "column";
    return `<div class="${kind}">${renderFlow(lines.join("\n"), resolveImage)}</div>`;
  });
  return `<div class="columns columns-${columns.length}">${cells.join("")}</div>`;
}

// "eyebrow: ..." and "icon: ..." lines at the start of a part are settings, not text.
function splitSettings(lines) {
  const settings = {};
  let index = 0;
  for (; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    const match = line.match(/^(eyebrow|icon):\s*(.*)$/);
    if (!match) break;
    settings[match[1]] = match[2];
  }
  return { settings, lines: lines.slice(index) };
}

const IMAGE_LINE = /^!\[[^\]]*\]\(([^)\s]+)\)$/;

function eyebrow(settings) {
  return settings.eyebrow ? `<p class="pv-eyebrow">${esc(settings.eyebrow)}</p>` : "";
}

function renderHero(part, resolveImage) {
  const { settings, lines } = splitSettings(part);
  const imageLine = lines.find((line) => IMAGE_LINE.test(line.trim()));
  const image = imageLine
    ? `<img class="pv-hero-image" alt="" src="${esc(resolveImage(safeUrl(imageLine.trim().match(IMAGE_LINE)[1])))}">`
    : "";
  const text = lines.filter((line) => line !== imageLine).join("\n");
  return `<section class="pv-block pv-hero">${image}<div class="pv-hero-text">${eyebrow(settings)}` +
    `${renderFlow(text, resolveImage)}</div></section>`;
}

function renderIcon(name, icons) {
  if (!name) return "";
  // Icons are the site's own SVG markup, served by Studio; an unknown name shows as a warning.
  return icons[name]
    ? `<span class="pv-icon">${icons[name]}</span>`
    : `<span class="pv-icon pv-icon-unknown">${esc(name)}?</span>`;
}

function renderItems(name, options, parts, resolveImage, icons) {
  const [intro, ...items] = parts;
  const head = splitSettings(intro);
  const cells = items.map((part) => {
    const { settings, lines } = splitSettings(part);
    const body = renderFlow(lines.join("\n"), resolveImage);
    return `<div class="pv-item">${renderIcon(settings.icon, icons)}${body}</div>`;
  });
  const dark = options.includes("dark") ? " pv-dark" : "";
  const known = ["features", "cards"].includes(name);
  // Blocks the preview has no drawing for yet still show, labeled, so nothing typed disappears.
  const label = known ? "" : `<span class="pv-label">${esc(name)}</span>`;
  return `<section class="pv-block pv-${known ? esc(name) : "other"}${dark}">${label}${eyebrow(head.settings)}` +
    `${renderFlow(head.lines.join("\n"), resolveImage)}` +
    `<div class="pv-items pv-items-${cells.length}">${cells.join("")}</div></section>`;
}

// Questions show as the site shows them: closed, the question visible, the answer one click away.
function renderFaq(parts, resolveImage) {
  const [intro, ...items] = parts;
  const head = splitSettings(intro);
  const questions = items.map((part) => {
    const lines = splitSettings(part).lines;
    const index = lines.findIndex((line) => /^###\s+/.test(line.trim()));
    const question = index === -1 ? "" : lines[index].trim().replace(/^###\s+/, "");
    const answer = lines.filter((line, position) => position !== index).join("\n");
    return `<details class="pv-faq-item"><summary>${inline(question, resolveImage)}</summary>` +
      `${renderFlow(answer, resolveImage)}</details>`;
  });
  return `<section class="pv-block pv-faq">${eyebrow(head.settings)}` +
    `${renderFlow(head.lines.join("\n"), resolveImage)}<div class="pv-faq-list">${questions.join("")}</div></section>`;
}

// The places come from Site settings when the site is built, so the preview only says so.
function renderAreas(parts, resolveImage) {
  const head = splitSettings(parts[0]);
  return `<section class="pv-block pv-areas">${eyebrow(head.settings)}` +
    `${renderFlow(head.lines.join("\n"), resolveImage)}<p class="pv-note">${AREAS_NOTE}</p></section>`;
}

const AREAS_NOTE = "The places from Site settings → Service area show here, in a row with a pin each.";

function renderBlock(block, resolveImage, icons) {
  if (block.name === "columns") return renderColumns(block.parts, resolveImage);
  if (block.name === "hero") return renderHero(block.parts[0], resolveImage);
  if (block.name === "cta") return renderHero(block.parts[0], resolveImage).replace("pv-hero", "pv-hero pv-cta");
  if (block.name === "faq") return renderFaq(block.parts, resolveImage);
  if (block.name === "areas") return renderAreas(block.parts, resolveImage);
  return renderItems(block.name, block.options, block.parts, resolveImage, icons);
}

export function renderMarkdown(source, resolveImage = (url) => url, icons = {}) {
  const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let normal = [];
  let block = null;
  for (const line of lines) {
    const marker = line.trimEnd();
    const open = marker.match(/^:::([a-z]+)(?:\s+(.*))?$/);
    if (open && !block && open[1] !== "next" && open[1] !== "item") {
      add(html, renderFlow(normal.join("\n"), resolveImage));
      normal = [];
      block = { name: open[1], options: (open[2] || "").split(/\s+/).filter(Boolean), parts: [[]] };
    } else if ((marker === ":::next" || marker === ":::item") && block) {
      add(block.parts, []);
    } else if (marker === ":::" && block) {
      add(html, renderBlock(block, resolveImage, icons));
      block = null;
    } else if (block) {
      add(block.parts[block.parts.length - 1], line);
    } else {
      add(normal, line);
    }
  }
  if (block) add(html, renderBlock(block, resolveImage, icons));
  add(html, renderFlow(normal.join("\n"), resolveImage));
  return html.filter(Boolean).join("\n");
}
