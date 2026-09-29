import { readFileSync } from "node:fs";

// The single place that reads WICFL_SITE_CONFIG off disk, so site-data.mjs (every Astro page)
// and remark-columns.mjs (the :::areas block, which needs geo.serviceArea) read the exact
// same file instead of each opening it themselves.
let cached;

export function loadSiteConfig() {
  if (cached) return cached;
  const configPath = process.env.WICFL_SITE_CONFIG;
  if (!configPath) {
    throw new Error("Missing WICFL_SITE_CONFIG. Run npm run build:site -- <site-directory>.");
  }
  cached = JSON.parse(readFileSync(configPath, "utf8"));
  return cached;
}
