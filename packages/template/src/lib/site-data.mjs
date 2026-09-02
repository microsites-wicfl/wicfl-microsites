import { readFileSync } from "node:fs";

const configPath = process.env.WICFL_SITE_CONFIG;
if (!configPath) {
  throw new Error("Missing WICFL_SITE_CONFIG. Run npm run build:site -- <site-directory>.");
}

export const site = JSON.parse(readFileSync(configPath, "utf8"));
export const routeFromId = (id) => (id === "index" ? "/" : `/${id}/`);
