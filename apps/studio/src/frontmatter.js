import { UserError } from "./errors.js";

// Every page starts with a header between two "---" lines (title, description, pageType, navLabel).
// It has a strict format: one "name: value" per line. A loose line there breaks the whole site
// build, and GitHub only reports "failure". This check catches it at save time and says, in
// plain English, which line is wrong and where it should go. A2 replaces the raw header with
// separate fields; this guard stays underneath as the last line of defence.

const KEY_LINE = /^[A-Za-z_][\w-]*:(\s|$)/;
const REQUIRED = ["title", "pageType"];

function header(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines[0].trim() !== "---") return null;
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  return { lines: lines.slice(1, end === -1 ? lines.length : end), closed: end !== -1 };
}

function keys(lines) {
  return lines.filter((line) => KEY_LINE.test(line)).map((line) => line.split(":")[0]);
}

export function validatePageHeader(newText, oldText) {
  const before = header(oldText || "");
  const after = header(newText);

  if (!after) {
    if (before) {
      throw new UserError(
        "The page header is missing: the first line must be --- followed by title, " +
          "description, pageType and navLabel. Reload the page to get it back.",
        400,
      );
    }
    return;
  }
  if (!after.closed) {
    throw new UserError(
      "The page header isn't closed: the second --- line after navLabel is missing.",
      400,
    );
  }

  for (const line of after.lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (/^\s/.test(line) || trimmed.startsWith("- ")) continue;
    if (!KEY_LINE.test(line)) {
      throw new UserError(
        `The line "${trimmed.slice(0, 60)}" ended up inside the page header (between the two --- ` +
          "lines), where only fields like title: or description: belong. Move it below the " +
          "second --- line, with the rest of the text.",
        400,
      );
    }
  }

  if (before) {
    const had = new Set(keys(before.lines));
    const has = new Set(keys(after.lines));
    const missing = REQUIRED.filter((key) => had.has(key) && !has.has(key));
    if (missing.length) {
      throw new UserError(
        `The page header is missing ${missing.join(" and ")}. Reload the page to get it back.`,
        400,
      );
    }
  }
}
