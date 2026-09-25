// The brand editor in Site settings: the same colors, fonts and contrast rules as the site build
// (packages/config-schema/theme.mjs). A test keeps these two in step; the server checks again
// with the build's own rules when Pavel saves.
import { esc } from "./html.js";

export const INK = "#12181f";
const WHITE = "#ffffff";
const FOOTER_TEXT = "#eef1f5";

export const STYLES = [
  ["coastal", "Rounded"],
  ["civic", "Square"],
  ["warm", "Soft"],
];
export const VARIANT_SURFACE = { coastal: "#e8f5f5", civic: "#edf1f7", warm: "#fbf1e5" };
const RADIUS = { coastal: "14px", civic: "4px", warm: "9px" };

export const FONTS = [
  ["georgia", "Georgia (current titles)", 'Georgia, "Iowan Old Style", "Palatino Linotype", serif'],
  ["system-sans", "System (current text)", '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'],
  ["inter", "Inter", '"Inter", sans-serif'],
  ["source-sans-3", "Source Sans 3", '"Source Sans 3", sans-serif'],
  ["nunito-sans", "Nunito Sans", '"Nunito Sans", sans-serif'],
  ["montserrat", "Montserrat", '"Montserrat", sans-serif'],
  ["lora", "Lora", '"Lora", serif'],
  ["merriweather", "Merriweather", '"Merriweather", serif'],
  ["playfair-display", "Playfair Display", '"Playfair Display", serif'],
  ["fraunces", "Fraunces", '"Fraunces", serif'],
];
const fontCss = (key) => (FONTS.find(([name]) => name === key) || FONTS[0])[2];

function rgb(hex) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
}

function luminance(hex) {
  return rgb(hex)
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

export function contrastRatio(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function blend(foreground, background, alpha) {
  const mixed = rgb(foreground).map((value, index) => Math.round(value * alpha + rgb(background)[index] * (1 - alpha)));
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

const RULES = [
  ["accentColor", (b) => contrastRatio(b.accentColor, WHITE), 4.5,
    "The main color is too light for links on white", "Pick a darker color."],
  ["surfaceColor", (b) => contrastRatio(INK, b.surfaceColor), 4.5,
    "The soft background is too dark for the text on it", "Pick a lighter color."],
  ["footerColor", (b) => Math.min(
    contrastRatio(FOOTER_TEXT, b.footerColor),
    contrastRatio(blend(FOOTER_TEXT, b.footerColor, 0.6), b.footerColor),
  ), 4.5, "The footer color is too light for the footer text", "Pick a darker color."],
  ["secondaryColor", (b) => contrastRatio(b.secondaryColor, WHITE), 3,
    "The second color is too light to show on white", "Pick a darker color."],
];

const HEX = /^#[0-9a-f]{6}$/i;

// [{ field, message }] for every color that wouldn't be readable; empty when all is fine.
export function brandProblems(brand) {
  return RULES.filter(([field]) => HEX.test(brand[field] || ""))
    .map(([field, measure, minimum, message, fix]) => ({ field, ratio: measure(brand), minimum, message, fix }))
    .filter((rule) => rule.ratio < rule.minimum)
    .map(({ field, ratio, minimum, message, fix }) => ({
      field,
      message: `${message}: ${ratio.toFixed(1)}:1, needs ${minimum}:1. ${fix}`,
    }));
}

export function textOnPrimary(accent) {
  return contrastRatio(WHITE, accent) >= contrastRatio(INK, accent) ? WHITE : INK;
}

// A small stand-in for a site page, drawn with the brand being edited.
export function brandPreview(brand, { brandName, logoUrl }) {
  const vars = [
    `--b-accent:${brand.accentColor}`,
    `--b-on-accent:${textOnPrimary(brand.accentColor)}`,
    `--b-secondary:${brand.secondaryColor}`,
    `--b-surface:${brand.surfaceColor}`,
    `--b-footer:${brand.footerColor}`,
    `--b-heading:${fontCss(brand.headingFont)}`,
    `--b-body:${fontCss(brand.bodyFont)}`,
    `--b-radius:${RADIUS[brand.style] || RADIUS.coastal}`,
  ].join(";");
  const mark = logoUrl
    ? `<img class="mock-logo" src="${esc(logoUrl)}" alt="">`
    : `<span class="mock-name">${esc(brandName)}</span>`;
  return `
    <div class="mock style-${esc(brand.style)}" style="${esc(vars)}">
      <div class="mock-header">
        ${mark}
        <span class="mock-phone">(772) 555-0100</span>
      </div>
      <div class="mock-nav"><span class="active">Home</span><span>Flood insurance</span><span>Contact</span></div>
      <div class="mock-body">
        <h3>Flood insurance in your town</h3>
        <p>Every paragraph uses the text font, and <a>links use the main color</a>.</p>
        <blockquote>Quotes and highlighted notes sit on the soft background.</blockquote>
      </div>
      <div class="mock-footer"><strong>${esc(brandName)}</strong><small>Talk to us</small></div>
    </div>`;
}
