import { UserError } from "./errors.js";

// Every page starts with a header between two "---" lines (title, description, pageType, navLabel).
// It has a strict format: one "name: value" per line. A loose line there breaks the whole site
// build, and GitHub only reports "failure". This check catches it at save time and says, in
// Pavel's words, which line is wrong and where it should go. A2 replaces the raw header with
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
        "Falta el encabezado de la página: la primera línea tiene que ser --- y después vienen " +
          "title, description, pageType y navLabel. Recarga la página para recuperarlo.",
        400,
      );
    }
    return;
  }
  if (!after.closed) {
    throw new UserError(
      "El encabezado de la página no está cerrado: falta la segunda línea --- después de navLabel.",
      400,
    );
  }

  for (const line of after.lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (/^\s/.test(line) || trimmed.startsWith("- ")) continue;
    if (!KEY_LINE.test(line)) {
      throw new UserError(
        `La línea «${trimmed.slice(0, 60)}» quedó dentro del encabezado de la página (entre las ` +
          "dos líneas ---), donde solo van campos como title: o description:. Muévela debajo " +
          "de la segunda línea ---, con el resto del texto.",
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
        `Falta ${missing.join(" y ")} en el encabezado de la página. Recarga para recuperarlo.`,
        400,
      );
    }
  }
}
