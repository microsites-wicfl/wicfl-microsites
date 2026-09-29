import { ICON_NAMES } from "./icons.mjs";

export { ICON_NAMES } from "./icons.mjs";

export const BLOCKS = {
  columns: { options: [], separator: "next" },
  hero: { options: [], separator: null },
  features: { options: ["dark"], separator: "item" },
  cards: { options: [], separator: "item" }
};

function addProblem(problems, line, message) {
  problems.push({ line, message: `Line ${line}: ${message}` });
}

function bodyStart(lines) {
  if (lines[0] !== "---") return 0;
  const closing = lines.slice(1).findIndex((line) => line === "---");
  return closing < 0 ? 0 : closing + 2;
}

function isFence(line) {
  return /^ {0,3}(`{3,}|~{3,})/.test(line);
}

function marker(line) {
  return /^:::(\S+)(?:\s+(.*))?$/.exec(line.trimEnd());
}

function headings(lines, level) {
  const expression = new RegExp(`^#{${level}}(?!#)\\s+`);
  return lines.filter((entry) => expression.test(entry.text.trimStart()));
}

function hasLink(lines) {
  return lines.some((entry) => /(^|[^!])\[[^\]]+\]\([^)]*\)/.test(entry.text));
}

export function leadingSettings(segment) {
  const settings = [];
  for (const entry of segment.lines) {
    if (!entry.text.trim()) continue;
    const match = /^(eyebrow|icon):\s*(.*)$/.exec(entry.text.trim());
    if (!match) break;
    settings.push({ key: match[1], value: match[2], line: entry.line });
  }
  return settings;
}

// The renderer needs each segment's body without its own eyebrow/icon setting lines,
// so it can turn the rest into markdown without printing "eyebrow: ..." as literal text.
export function contentLines(segment) {
  const settingLines = new Set(leadingSettings(segment).map((setting) => setting.line));
  return segment.lines.filter((entry) => !settingLines.has(entry.line));
}

function settingsIn(segment) {
  return segment.lines
    .map((entry) => ({ entry, match: /^(eyebrow|icon):\s*(.*)$/.exec(entry.text.trim()) }))
    .filter(({ match }) => match)
    .map(({ entry, match }) => ({ key: match[1], value: match[2], line: entry.line }));
}

function validateSettings(block, problems) {
  // Settings are metadata, so invalid placement must not silently become page copy.
  for (const segment of [block.intro, ...block.items]) {
    const leadingLines = new Set(leadingSettings(segment).map((setting) => setting.line));
    for (const setting of settingsIn(segment)) {
      if (!leadingLines.has(setting.line)) {
        addProblem(problems, setting.line, `${setting.key}: must appear at the start of its content.`);
        continue;
      }
      const allowed = setting.key === "eyebrow"
        ? segment === block.intro && ["hero", "features", "cards"].includes(block.name)
        : block.name === "features" && segment !== block.intro;
      if (!allowed) {
        addProblem(problems, setting.line, `${setting.key}: does not apply in this ${block.name} content.`);
      }
    }
  }
}

function validateColumns(block, problems) {
  // Columns remain limited so responsive layouts always have a known shape.
  const count = block.items.length + 1;
  if (count < 2 || count > 3) {
    addProblem(problems, block.line, `a :::columns block needs 2 or 3 columns, found ${count}.`);
  }
}

function validateHero(block, problems) {
  const content = block.intro.lines;
  // Hero supplies the document H1, which keeps each page semantically singular.
  if (headings(content, 1).length !== 1) {
    addProblem(problems, block.line, "a :::hero block needs exactly one # H1.");
  }
  // The image must stand alone so it can safely become decorative hero media.
  const images = imageParagraphs(content);
  if (images.length !== 1) {
    addProblem(problems, block.line, "a :::hero block needs exactly one image-only paragraph.");
  }
}

function validateItemCount(block, problems) {
  // Fixed item counts prevent incomplete or visually unbalanced section layouts.
  const count = block.items.length;
  if (count < 2 || count > 4) {
    addProblem(problems, block.line, `a :::${block.name} block needs 2 to 4 items, found ${count}.`);
  }
}

function validateFeatures(block, problems) {
  // Feature icons are a closed vocabulary shared with Studio's future live preview.
  validateItemCount(block, problems);
  for (const item of block.items) {
    const icon = leadingSettings(item).find((setting) => setting.key === "icon");
    if (!icon) {
      addProblem(problems, item.line, "each :::features item needs an icon: setting.");
    } else if (!ICON_NAMES.includes(icon.value)) {
      addProblem(problems, icon.line, `unknown icon "${icon.value}". Use: ${ICON_NAMES.join(", ")}.`);
    }
    if (headings(item.lines, 3).length !== 1) {
      addProblem(problems, item.line, "each :::features item needs one ### title.");
    }
  }
}

function validateCards(block, problems) {
  // Cards need a predictable image, heading, and destination for a clickable whole card.
  validateItemCount(block, problems);
  for (const item of block.items) {
    const imageLines = imageParagraphs(item.lines);
    if (imageLines.length !== 1) {
      addProblem(problems, item.line, "each :::cards item needs one image-only paragraph.");
    }
    if (headings(item.lines, 3).length !== 1) {
      addProblem(problems, item.line, "each :::cards item needs one ### title.");
    }
    if (!hasLink(item.lines)) {
      addProblem(problems, item.line, "each :::cards item needs a link.");
    }
  }
}

function validateBlock(block, problems) {
  validateSettings(block, problems);
  if (block.name === "columns") validateColumns(block, problems);
  if (block.name === "hero") validateHero(block, problems);
  if (block.name === "features") validateFeatures(block, problems);
  if (block.name === "cards") validateCards(block, problems);
}

function validateOutsideH1(lines, problems) {
  // A page without a hero still cannot introduce a second, unstyled document H1.
  for (const entry of lines) {
    if (/^#(?!#)\s+/.test(entry.text.trimStart())) {
      addProblem(problems, entry.line, "# H1 is only allowed inside a :::hero block.");
    }
  }
}

// Exported so the renderer can find the same image-only paragraph the validator already
// confirmed exists, instead of re-detecting it with a second, possibly different rule.
export function imageParagraphs(lines) {
  const paragraphs = [];
  let current = [];
  for (const entry of lines) {
    const text = entry.text.trim();
    if (/^(eyebrow|icon):\s*/.test(text) || /^#{1,6}\s+/.test(text)) {
      if (current.length) paragraphs.push(current);
      current = [];
    } else if (text) current.push(entry);
    else if (current.length) {
      paragraphs.push(current);
      current = [];
    }
  }
  if (current.length) paragraphs.push(current);
  return paragraphs
    .filter((paragraph) => paragraph.length === 1)
    .flat()
    .filter((entry) => /^!\[[^\]]*\]\([^)]*\)$/.test(entry.text.trim()));
}

// Shared by the CI check (blockProblems) and the Astro renderer, so both agree on exactly
// where each block starts and ends instead of running two independent parsers that could drift.
export function parseDocument(markdown) {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const problems = [];
  const segments = [];
  const outside = [];
  let text = [];
  let block = null;
  let fence = false;
  let seenHero = false;

  const flushText = () => {
    if (text.length) segments.push({ type: "text", lines: text });
    text = [];
  };

  for (let index = bodyStart(lines); index < lines.length; index += 1) {
    const entry = { line: index + 1, text: lines[index] };
    // Code samples can document markers without accidentally defining a page block.
    if (isFence(entry.text)) {
      fence = !fence;
      if (block) block.current.lines.push(entry);
      else text.push(entry);
      continue;
    }
    if (fence) {
      if (block) block.current.lines.push(entry);
      else text.push(entry);
      continue;
    }
    const found = marker(entry.text);
    // A bare marker only closes the current block; it never starts an implicit one.
    if (entry.text.trimEnd() === ":::") {
      if (!block) addProblem(problems, entry.line, "::: appears outside a block.");
      else {
        validateBlock(block, problems);
        const { current, ...closedBlock } = block;
        segments.push({ type: "block", ...closedBlock });
        block = null;
      }
      continue;
    }
    if (found) {
      const [, name, optionText = ""] = found;
      // Separators are block-specific to keep column and card syntax unambiguous.
      if (name === "next" || name === "item") {
        if (!block || BLOCKS[block.name].separator !== name) {
          addProblem(problems, entry.line, `:::${name} appears outside its matching block.`);
        } else {
          const item = { line: entry.line, lines: [] };
          block.items.push(item);
          block.current = item;
        }
        continue;
      }
      // Unknown names and options are rejected before they become invisible plain text.
      if (!BLOCKS[name]) {
        addProblem(problems, entry.line, `unknown block :::${name}.`);
        continue;
      }
      // Nested blocks have no stable rendering model, so they are deliberately forbidden.
      if (block) {
        addProblem(problems, entry.line, "blocks cannot be nested.");
        continue;
      }
      const options = optionText ? optionText.split(/\s+/) : [];
      for (const option of options) {
        if (!BLOCKS[name].options.includes(option)) {
          addProblem(problems, entry.line, `unknown option "${option}" for :::${name}.`);
        }
      }
      // A hero leads the body and is unique because it owns the page-level heading.
      if (name === "hero") {
        if (seenHero) addProblem(problems, entry.line, "only one :::hero block is allowed per page.");
        if (outside.some((outsideEntry) => outsideEntry.text.trim())) {
          addProblem(problems, entry.line, "a :::hero block must be the first body content.");
        }
        seenHero = true;
      }
      flushText();
      const intro = { line: entry.line, lines: [] };
      block = { name, options, line: entry.line, intro, items: [], current: intro };
      continue;
    }
    if (block) block.current.lines.push(entry);
    else {
      text.push(entry);
      outside.push(entry);
    }
  }
  flushText();
  if (block) addProblem(problems, block.line, `a :::${block.name} block is not closed.`);
  validateOutsideH1(outside, problems);
  return { segments, problems };
}

export function blockProblems(markdown) {
  return parseDocument(markdown).problems;
}
