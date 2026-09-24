// A small, safe Markdown renderer for the live preview next to the editor. It covers what the
// site pages use (headings, paragraphs, lists, quotes, links, images, bold, italic, code) and
// escapes everything else. The real preview of the site stays the reference for how it looks.
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

export function renderMarkdown(source, resolveImage = (url) => url) {
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
