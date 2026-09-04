// Prints the site slugs in a pod, one per line. Small enough to feel unnecessary, but it keeps
// .github/workflows/deploy.yml from hardcoding a site list that pods/<pod>.json already owns.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const podName = process.argv[2];

if (!podName) {
  console.error("Usage: node scripts/pod-sites.mjs <pod-name>");
  process.exit(1);
}

const pod = JSON.parse(readFileSync(resolve(repositoryRoot, "pods", `${podName}.json`), "utf8"));
console.log(pod.sites.join("\n"));
