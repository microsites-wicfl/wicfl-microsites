import { UserError } from "./errors.js";

// Studio shows a page as separate fields plus its text, so nobody edits the "---" header by hand.
// Only these fields are editable; any other line in the header is kept exactly as it was.
export const PAGE_TYPES = ["home", "content", "coverage"];
const FIELDS = ["title", "description", "navLabel", "showInNav", "pageType"];
const OPTIONAL = new Set(["description", "navLabel"]);

function split(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines[0].trim() !== "---") return null;
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end === -1) return null;
  return { header: lines.slice(1, end), body: lines.slice(end + 1).join("\n") };
}

function unquote(raw) {
  const value = raw.trim();
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

// Returns { fields, body } or null when the page can't be shown as fields safely (no header, or a
// known field written across several lines); the interface then falls back to the raw text.
export function parsePage(text) {
  const parts = split(text);
  if (!parts) return null;
  const fields = { title: "", description: "", navLabel: "", showInNav: true, pageType: "content" };
  for (let index = 0; index < parts.header.length; index += 1) {
    const match = parts.header[index].match(/^\s*([A-Za-z_][\w-]*):(.*)$/);
    if (!match || !FIELDS.includes(match[1])) continue;
    const next = parts.header[index + 1];
    const indent = parts.header[index].match(/^\s*/)[0].length;
    if (next !== undefined && next.trim() && next.match(/^\s*/)[0].length > indent) return null;
    const value = unquote(match[2]);
    if (match[1] === "showInNav") fields.showInNav = value !== "false";
    else fields[match[1]] = value;
  }
  return { fields, body: parts.body.replace(/^\n+/, "") };
}

function format(key, value) {
  if (key === "showInNav" || key === "pageType") return String(value);
  return JSON.stringify(value);
}

function clean(fields) {
  const title = String(fields?.title ?? "").trim();
  if (!title) throw new UserError("The page needs a title.", 400);
  const pageType = String(fields?.pageType ?? "");
  if (!PAGE_TYPES.includes(pageType)) throw new UserError("Choose a page type.", 400);
  return {
    title,
    description: String(fields?.description ?? "").replace(/\s+/g, " ").trim(),
    navLabel: String(fields?.navLabel ?? "").trim(),
    showInNav: fields?.showInNav !== false,
    pageType,
  };
}

// Writes the fields back into the page's own header, keeping every other line and its indentation.
export function composePage(originalText, fields, body) {
  const values = clean(fields);
  const parts = split(originalText || "") || { header: [], body: "\n" };
  const indent = (parts.header.find((line) => line.trim()) || "").match(/^\s*/)[0];
  const header = [];
  const written = new Set();
  for (const line of parts.header) {
    const match = line.match(/^(\s*)([A-Za-z_][\w-]*):/);
    if (!match || !FIELDS.includes(match[2])) {
      header.push(line);
      continue;
    }
    const key = match[2];
    written.add(key);
    if (OPTIONAL.has(key) && !values[key]) continue;
    const before = unquote(line.slice(match[0].length));
    const same = key === "showInNav" ? (before !== "false") === values.showInNav : before === values[key];
    // An unchanged field keeps its original line, quoting included, so a save without edits
    // produces the exact same file and Studio reports "no changes" instead of creating a draft.
    if (same) {
      header.push(line);
      continue;
    }
    if (key === "showInNav" && values.showInNav) continue;
    header.push(`${match[1]}${key}: ${format(key, values[key])}`);
  }
  for (const key of FIELDS) {
    if (written.has(key)) continue;
    if (OPTIONAL.has(key) && !values[key]) continue;
    if (key === "showInNav" && values.showInNav) continue;
    header.push(`${indent}${key}: ${format(key, values[key])}`);
  }
  const text = String(body ?? "").replace(/\r\n/g, "\n");
  // Keep the page's own spacing between the header and the text (a blank line or none).
  const lead = parts.body.match(/^\n*/)[0];
  return `---\n${header.join("\n")}\n---\n${lead}${text.replace(/^\n+/, "")}`;
}

// The public address of a page, the same way the site template routes it.
export function pageRoute(relativePath) {
  const parts = relativePath.replace(/\.md$/, "").split("/");
  const name = parts.pop();
  const prefix = parts.length ? `/${parts.join("/")}` : "";
  return name === "index" ? `${prefix}/` : `${prefix}/${name}/`;
}
