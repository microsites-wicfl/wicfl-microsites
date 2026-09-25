export const INK = "#12181f";
export const WHITE = "#ffffff";
export const FOOTER_TEXT = "#eef1f5";

/** @type {Record<string, { css: string, package?: string, family?: string }>} */
export const FONT_FAMILIES = {
  "system-sans": { css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  georgia: { css: 'Georgia, "Iowan Old Style", "Palatino Linotype", serif' },
  inter: { css: '"Inter", sans-serif', package: "inter", family: "Inter" },
  "source-sans-3": { css: '"Source Sans 3", sans-serif', package: "source-sans-3", family: "Source Sans 3" },
  "nunito-sans": { css: '"Nunito Sans", sans-serif', package: "nunito-sans", family: "Nunito Sans" },
  montserrat: { css: '"Montserrat", sans-serif', package: "montserrat", family: "Montserrat" },
  lora: { css: '"Lora", serif', package: "lora", family: "Lora" },
  merriweather: { css: '"Merriweather", serif', package: "merriweather", family: "Merriweather" },
  "playfair-display": { css: '"Playfair Display", serif', package: "playfair-display", family: "Playfair Display" },
  fraunces: { css: '"Fraunces", serif', package: "fraunces", family: "Fraunces" },
};

function rgb(hex) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
}

function luminance(hex) {
  return rgb(hex).map((channel) => channel / 255).map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )).reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

export function contrastRatio(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function composite(foreground, background, alpha) {
  const [red, green, blue] = rgb(foreground).map((value, index) => Math.round(value * alpha + rgb(background)[index] * (1 - alpha)));
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function textOnPrimary(accentColor) {
  return contrastRatio(WHITE, accentColor) >= contrastRatio(INK, accentColor) ? WHITE : INK;
}

export function checkTheme(theme) {
  const problems = [];
  const check = (field, color, against, minimum, description) => {
    const contrast = contrastRatio(color, against);
    if (contrast < minimum) problems.push({ field, color, contrast, minimum, description });
  };
  check("accentColor", theme.accentColor, WHITE, 4.5, "links");
  if (theme.surfaceColor) check("surfaceColor", INK, theme.surfaceColor, 4.5, "site text");
  if (theme.footerColor) {
    check("footerColor", FOOTER_TEXT, theme.footerColor, 4.5, "footer text");
    check("footerColor", composite(FOOTER_TEXT, theme.footerColor, 0.6), theme.footerColor, 4.5, "footer labels");
  }
  if (theme.secondaryColor) check("secondaryColor", theme.secondaryColor, WHITE, 3, "decorative details");
  return problems;
}
