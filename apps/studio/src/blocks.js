import { UserError } from "./errors.js";
import { blockProblems } from "../../../packages/config-schema/blocks.mjs";

// Page blocks (:::columns, :::hero, :::features, :::cards and the ones added after them) follow
// one grammar, packages/config-schema/blocks.mjs, shared with the site build. The build fails the
// whole preview on a broken block, so Studio checks the same grammar at save time and lists every
// line to fix at once. Lines are counted in the text Pavel is editing (the page body).
export function validateBlocks(body) {
  const text = String(body || "").replace(/\r\n/g, "\n");
  // The shared grammar skips a page's leading "---" header. A body never has one, but a body that
  // opens with a "---" rule would be misread as one: an empty line goes first and the line
  // numbers shift back by one.
  const shift = text.startsWith("---") ? 1 : 0;
  const problems = blockProblems(shift ? `\n${text}` : text);
  if (!problems.length) return;
  const lines = problems.map(({ line, message }) => message.replace(/^Line \d+:/, `Line ${line - shift}:`));
  throw new UserError(lines.join("\n"), 400);
}
