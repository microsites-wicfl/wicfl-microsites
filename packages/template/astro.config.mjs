import { defineConfig } from "astro/config";
import remarkColumns from "./src/lib/remark-columns.mjs";

export default defineConfig({
  output: "static",
  markdown: {
    remarkPlugins: [remarkColumns]
  }
});
