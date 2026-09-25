import { UserError } from "./errors.js";

// Column blocks in a page: a line ":::columns" opens one, ":::next" starts the next column and
// ":::" closes it; 2 or 3 columns. The site build (packages/template/src/lib/remark-columns.mjs)
// fails the whole preview on a broken block, so Studio checks the same rules at save time and
// says which line to fix. Lines are counted in the text Pavel is editing.

const MARKERS = new Set([":::columns", ":::next", ":::"]);

function fence(line) {
  const match = /^ {0,3}(`{3,}|~{3,})/.exec(line);
  return match ? { character: match[1][0], length: match[1].length } : null;
}

export function columnMarkers(text) {
  const found = [];
  let open = null;
  String(text || "").replace(/\r\n/g, "\n").split("\n").forEach((line, index) => {
    const delimiter = fence(line);
    if (delimiter) {
      if (!open) open = delimiter;
      else if (delimiter.character === open.character && delimiter.length >= open.length) open = null;
      return;
    }
    const value = line.trimEnd();
    if (!open && MARKERS.has(value)) found.splice(found.length, 0, { line: index + 1, value });
  });
  return found;
}

export function validateColumns(text) {
  let openLine = null;
  let count = 0;
  for (const { line, value } of columnMarkers(text)) {
    if (value === ":::columns") {
      if (openLine) {
        throw new UserError(
          `Line ${line}: a columns block starts inside another one (opened on line ${openLine}). ` +
            "Close the first block with a line that says just ::: before starting a new one.",
          400,
        );
      }
      openLine = line;
      count = 1;
    } else if (value === ":::next") {
      if (!openLine) {
        throw new UserError(
          `Line ${line}: :::next is outside a columns block. Remove it or add :::columns above.`,
          400,
        );
      }
      count += 1;
    } else {
      if (!openLine) {
        throw new UserError(`Line ${line}: ::: closes a columns block, but none is open. Remove that line.`, 400);
      }
      if (count < 2 || count > 3) {
        throw new UserError(
          `The columns block that starts on line ${openLine} has ${count} column${count === 1 ? "" : "s"}. ` +
            "Use 2 or 3: each :::next starts a new column.",
          400,
        );
      }
      openLine = null;
    }
  }
  if (openLine) {
    throw new UserError(
      `The columns block that starts on line ${openLine} is never closed. ` +
        "Add a line that says just ::: where the block ends.",
      400,
    );
  }
}
