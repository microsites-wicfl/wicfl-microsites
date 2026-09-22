// W-014. Assembles a pod's real production deploy unit: builds every site listed in
// pods/<pod-name>.json, collects their static output under one directory, and generates the
// routing Worker (scripts/pod-worker-template.mjs) that picks the right site by Host header at
// request time. See wrangler.pod-1.toml and docs/ARCHITECTURE.md ("Grouping" decision) for why
// this exists instead of one Worker per site.
import { existsSync, readFileSync, writeFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const podName = process.argv[2];

if (!podName || !/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/.test(podName)) {
  console.error("Usage: node scripts/build-pod.mjs <pod-name>");
  process.exit(1);
}

const podConfigPath = resolve(repositoryRoot, "pods", `${podName}.json`);
if (!existsSync(podConfigPath)) {
  console.error(`No pod definition at pods/${podName}.json.`);
  process.exit(1);
}

const pod = JSON.parse(readFileSync(podConfigPath, "utf8"));
if (!Array.isArray(pod.sites) || pod.sites.length === 0) {
  console.error(`pods/${podName}.json has no sites listed.`);
  process.exit(1);
}
if (pod.sites.length > 25) {
  // Not a hard Cloudflare limit, just the size docs/ARCHITECTURE.md's decision assumed. Flag it
  // instead of silently growing a pod past the number the decision was reasoned against.
  console.error(
    `pods/${podName}.json lists ${pod.sites.length} sites; docs/ARCHITECTURE.md's pod size is ~25. Split into another pod (or revisit that decision on purpose) before continuing.`
  );
  process.exit(1);
}

const podOutputRoot = resolve(repositoryRoot, "dist/pods", podName);
const podSitesRoot = resolve(podOutputRoot, "sites");
rmSync(podOutputRoot, { recursive: true, force: true });
mkdirSync(podSitesRoot, { recursive: true });

const routes = {};

function addRoute(host, slug, source) {
  const normalizedHost = host.toLowerCase();
  if (routes[normalizedHost]) {
    console.error(
      `Route "${normalizedHost}" from ${source} would overwrite the existing route to "${routes[normalizedHost]}". Fix pods/${podName}.json before continuing.`
    );
    process.exit(1);
  }
  routes[normalizedHost] = slug;
}

for (const slug of pod.sites) {
  console.log(`\n== Building ${slug} (pod ${podName}) ==`);
  const build = spawnSync(process.execPath, [resolve(repositoryRoot, "scripts/build-site.mjs"), slug], {
    cwd: repositoryRoot,
    stdio: "inherit"
  });
  if (build.status !== 0) {
    console.error(`Failed to build ${slug}; pod ${podName} was not assembled.`);
    process.exit(build.status ?? 1);
  }

  const siteConfigPath = resolve(repositoryRoot, "sites", slug, "site.config.json");
  const siteConfig = JSON.parse(readFileSync(siteConfigPath, "utf8"));
  const domain = siteConfig.domain;
  if (!domain) {
    console.error(`sites/${slug}/site.config.json has no "domain"; cannot route to it in the pod.`);
    process.exit(1);
  }
  addRoute(domain, slug, `sites/${slug}/site.config.json`);
  addRoute(`www.${domain}`, slug, `sites/${slug}/site.config.json`);

  const builtSiteDir = resolve(repositoryRoot, "dist/sites", slug);
  cpSync(builtSiteDir, resolve(podSitesRoot, slug), { recursive: true });
}

if (pod.aliases !== undefined && (typeof pod.aliases !== "object" || Array.isArray(pod.aliases) || pod.aliases === null)) {
  console.error(`pods/${podName}.json "aliases" must be an object mapping hostnames to site slugs.`);
  process.exit(1);
}

for (const [host, slug] of Object.entries(pod.aliases ?? {})) {
  if (!pod.sites.includes(slug)) {
    console.error(`Alias "${host}" points to "${slug}", which is not listed in pods/${podName}.json "sites".`);
    process.exit(1);
  }
  addRoute(host, slug, `pods/${podName}.json aliases`);
}

const workerTemplate = readFileSync(resolve(repositoryRoot, "scripts/pod-worker-template.mjs"), "utf8");
const workerSource = workerTemplate.replace("__WICFL_POD_ROUTES__", JSON.stringify(routes, null, 2));
writeFileSync(resolve(podOutputRoot, "worker.mjs"), workerSource);

console.log(`\nPod "${podName}" assembled at dist/pods/${podName}/ (${pod.sites.length} site${pod.sites.length === 1 ? "" : "s"}).`);
console.log("Routes:", routes);
