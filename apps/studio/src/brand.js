import { UserError } from "./errors.js";
import { FONT_FAMILIES, INK, checkTheme } from "../../../packages/config-schema/theme.mjs";

// A site's brand: style (corners and shadows), four colors and two fonts. The rules live in
// packages/config-schema/theme.mjs, shared with the site build, so Studio refuses exactly what the
// build would refuse. A value equal to its default is left out of the config, so the file only
// records what a site really changed.

export const STYLES = ["coastal", "civic", "warm"];
export const VARIANT_SURFACE = { coastal: "#e8f5f5", civic: "#edf1f7", warm: "#fbf1e5" };
export const FONTS = Object.keys(FONT_FAMILIES);
const HEX = /^#[0-9a-f]{6}$/i;

const MESSAGES = {
  accentColor: "The main color is too light for links on white",
  surfaceColor: "The soft background is too dark for the text on it",
  footerColor: "The footer color is too light for the footer text",
  secondaryColor: "The second color is too light to show on white",
};
const FIX = {
  accentColor: "Pick a darker color.",
  surfaceColor: "Pick a lighter color.",
  footerColor: "Pick a darker color.",
  secondaryColor: "Pick a darker color.",
};

export function brandOf(config) {
  const theme = config.theme || {};
  const variant = STYLES.includes(theme.variant) ? theme.variant : "coastal";
  const accentColor = (theme.accentColor || "#0f6b75").toLowerCase();
  return {
    style: variant,
    accentColor,
    secondaryColor: (theme.secondaryColor || accentColor).toLowerCase(),
    surfaceColor: (theme.surfaceColor || VARIANT_SURFACE[variant]).toLowerCase(),
    footerColor: (theme.footerColor || INK).toLowerCase(),
    headingFont: theme.headingFont || "georgia",
    bodyFont: theme.bodyFont || "system-sans",
    logo: config.brand?.logo || null,
    logoOnDark: config.brand?.logoOnDark || null,
  };
}

function color(value, label) {
  const clean = String(value ?? "").trim().toLowerCase();
  if (!HEX.test(clean)) throw new UserError(`${label} must be a color like #0f6b75.`, 400);
  return clean;
}

export function themeProblems(theme) {
  const seen = new Set();
  return checkTheme(theme)
    .filter((problem) => !seen.has(problem.field) && seen.add(problem.field))
    .map((problem) => {
      const measured = `${problem.contrast.toFixed(1)}:1, needs ${problem.minimum}:1`;
      return `${MESSAGES[problem.field]}: ${measured}. ${FIX[problem.field]}`;
    });
}

// Returns the new theme, or null when the brand fields weren't sent (older clients).
export function applyBrand(config, input) {
  if (!input || input.style === undefined) return null;
  if (!STYLES.includes(input.style)) throw new UserError("Choose one of the styles.", 400);
  for (const key of ["headingFont", "bodyFont"]) {
    if (!FONTS.includes(input[key])) throw new UserError("Choose one of the fonts in the list.", 400);
  }
  const variant = input.style;
  const accentColor = color(input.accentColor, "Main color");
  const theme = { ...(config.theme || {}), variant, accentColor };
  const optional = {
    secondaryColor: [color(input.secondaryColor, "Second color"), accentColor],
    surfaceColor: [color(input.surfaceColor, "Soft background"), VARIANT_SURFACE[variant]],
    footerColor: [color(input.footerColor, "Footer color"), INK],
    headingFont: [input.headingFont, "georgia"],
    bodyFont: [input.bodyFont, "system-sans"],
  };
  for (const [key, [value, fallback]] of Object.entries(optional)) {
    if (value === fallback) delete theme[key];
    else theme[key] = value;
  }
  const problems = themeProblems(theme);
  if (problems.length) throw new UserError(problems.join(" "), 400);
  return theme;
}

// Logos: SVG, PNG or WebP. An SVG is checked line by line for anything that isn't a drawing and
// refused, not cleaned: a logo from Illustrator or Figma passes, anything carrying code doesn't.
export const LOGO_TYPES = { svg: "image/svg+xml", png: "image/png", webp: "image/webp" };
export const MAX_LOGO_BYTES = 1024 * 1024;
const SVG_REFUSED = [
  /<script\b/i,
  /<foreignObject\b/i,
  /<!ENTITY/i,
  /<!DOCTYPE/i,
  /<(iframe|embed|object|audio|video|canvas)\b/i,
  /\son[a-z]+\s*=/i,
  /javascript:/i,
  /@import/i,
  /url\(\s*['"]?(?!#)/i,
  /(?:xlink:)?href\s*=\s*["'](?!#|data:image\/(?:png|jpeg|webp);base64,)/i,
];

export function checkSvg(textValue) {
  const svg = String(textValue);
  const start = svg.replace(/^﻿/, "").replace(/<\?xml[^>]*\?>/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  const plain = "This logo file has extra code in it. Export it again as a plain SVG, or upload a PNG.";
  if (!/^<svg[\s>]/i.test(start) || !/<\/svg>\s*$/i.test(start)) {
    throw new UserError("That file isn't an SVG logo. Export it again as SVG, or upload a PNG.", 400);
  }
  if (SVG_REFUSED.some((rule) => rule.test(svg))) throw new UserError(plain, 400);
}
