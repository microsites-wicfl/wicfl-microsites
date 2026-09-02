import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { pathToFileURL } from "node:url";

const contentDirectory = process.env.WICFL_SITE_CONTENT;
if (!contentDirectory) throw new Error("Missing WICFL_SITE_CONTENT. Run npm run build:site -- <site-directory>.");

const pages = defineCollection({
  loader: glob({ base: pathToFileURL(`${contentDirectory}/`), pattern: "**/*.md" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    pageType: z.enum(["home", "content", "coverage"]),
  }),
});

export const collections = { pages };
