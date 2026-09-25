import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";
import remarkSmartypants from "remark-smartypants";

const MARKERS = new Set([":::columns", ":::next", ":::"]);
const COLUMN_STYLES = `<style>
main.shell { container-type: inline-size; }
main .page-content .columns { width: min(60rem, 100cqw); max-width: none; display: grid; gap: var(--s4); margin-block: var(--s4); }
html.page-home main .page-content .columns { width: min(60rem, calc(100cqw - var(--s4))); }
main .page-content .columns-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
main .page-content .columns-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
main .page-content .column { min-width: 0; display: flex; flex-direction: column; }
main .page-content .columns[data-has-image] .column:not(.column-image) { justify-content: center; }
main .page-content .column-image { overflow: hidden; border-radius: var(--radius); }
main .page-content .column-image p { margin: 0; }
main .page-content .column-image img { width: 100%; border-radius: var(--radius); }
@media (max-width: 42rem) { main .page-content .columns { grid-template-columns: 1fr; gap: var(--s3); } html.page-home main .page-content .columns { width: min(60rem, calc(100cqw - var(--s3))); } }
</style>`;

function fail(file, line, message) {
  const path = file.path ?? "Markdown file";
  throw new Error(`${path}:${line}: ${message}`);
}

function bodyStart(lines) {
  if (lines[0] !== "---") return 0;
  const closingLine = lines.slice(1).findIndex((line) => line === "---");
  return closingLine === -1 ? 0 : closingLine + 2;
}

const smartypants = remarkSmartypants();

function markdownChildren(markdown) {
  if (!markdown.trim()) return [];
  const tree = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  smartypants(tree);
  return tree.children;
}

function marker(line) {
  const trimmed = line.trimEnd();
  return MARKERS.has(trimmed) ? trimmed : null;
}

function fence(line) {
  const match = /^ {0,3}(`{3,}|~{3,})/.exec(line);
  return match ? { character: match[1][0], length: match[1].length } : null;
}

function eachMarker(lines, start, callback) {
  let activeFence = null;
  for (let index = start; index < lines.length; index += 1) {
    const delimiter = fence(lines[index]);
    if (delimiter) {
      if (!activeFence) activeFence = delimiter;
      else if (delimiter.character === activeFence.character && delimiter.length >= activeFence.length) activeFence = null;
      continue;
    }
    if (!activeFence) {
      const value = marker(lines[index]);
      if (value) callback(index, value);
    }
  }
}

function isImageOnly(children) {
  return children.length === 1 && children[0].type === "paragraph" && children[0].children.length === 1 && children[0].children[0].type === "image";
}

function columnsNode(columns) {
  const hasImage = columns.some((column) => isImageOnly(column));
  const children = [{ type: "html", value: `<div class="columns columns-${columns.length}"${hasImage ? " data-has-image" : ""}>` }];
  for (const column of columns) {
    children.push({ type: "html", value: `<div class="column${isImageOnly(column) ? " column-image" : ""}">` });
    children.push(...column);
    children.push({ type: "html", value: "</div>" });
  }
  children.push({ type: "html", value: "</div>" });
  return children;
}

export function validateColumns(markdown, path = "Markdown file") {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const start = bodyStart(lines);
  let openLine = null;
  let columnCount = 1;
  eachMarker(lines, start, (index, line) => {
    const sourceLine = index + 1;
    if (line === ":::columns") {
      if (openLine) fail({ path }, sourceLine, "nested :::columns blocks are not allowed");
      openLine = sourceLine;
      columnCount = 1;
    } else if (line === ":::next") {
      if (!openLine) fail({ path }, sourceLine, ":::next appears outside a :::columns block");
      columnCount += 1;
    } else {
      if (!openLine) fail({ path }, sourceLine, "::: appears outside a :::columns block");
      if (columnCount < 2 || columnCount > 3) fail({ path }, sourceLine, `:::columns blocks need 2 or 3 columns, found ${columnCount}`);
      openLine = null;
    }
  });
  if (openLine) fail({ path }, openLine, ":::columns block is not closed");
}

export default function remarkColumns() {
  return (tree, file) => {
    const lines = String(file.value ?? "").replace(/\r\n/g, "\n").split("\n");
    const start = bodyStart(lines);
    const body = lines.slice(start);
    let hasMarker = false;
    eachMarker(body, 0, () => { hasMarker = true; });
    if (!hasMarker) return;
    validateColumns(file.value, file.path);
    const children = [{ type: "html", value: COLUMN_STYLES }];
    let normalStart = 0;
    let block = null;
    const flushNormal = (end) => children.push(...markdownChildren(body.slice(normalStart, end).join("\n")));
    eachMarker(body, 0, (index, line) => {
      const sourceLine = start + index + 1;
      if (line === ":::columns") {
        if (block) fail(file, sourceLine, "nested :::columns blocks are not allowed");
        flushNormal(index);
        block = { line: sourceLine, columnStart: index + 1, columns: [] };
      } else if (line === ":::next") {
        if (!block) fail(file, sourceLine, ":::next appears outside a :::columns block");
        block.columns.push(markdownChildren(body.slice(block.columnStart, index).join("\n")));
        block.columnStart = index + 1;
      } else {
        if (!block) fail(file, sourceLine, "::: appears outside a :::columns block");
        block.columns.push(markdownChildren(body.slice(block.columnStart, index).join("\n")));
        children.push(...columnsNode(block.columns));
        block = null;
        normalStart = index + 1;
      }
    });
    if (block) fail(file, block.line, ":::columns block is not closed");
    flushNormal(body.length);
    tree.children = children;
  };
}
