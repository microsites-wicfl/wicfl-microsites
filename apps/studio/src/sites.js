import { validatePageHeader } from "./frontmatter.js";
import { isLive } from "./live.js";
import { composePage, pageRoute, parsePage } from "./pagefields.js";
import { UserError } from "./errors.js";
import { assertSlug, contentRoot, draftBranch, pageFile, relativePage } from "./paths.js";
import { previewStatus } from "./preview.js";

async function readConfig(github, slug) {
  const file = await github.readFile(`sites/${slug}/site.config.json`, github.env.GITHUB_BASE_BRANCH);
  if (!file) return null;
  return JSON.parse(file.text);
}

// Slugs listed in any pods/*.json on the base branch: those are the sites wired to production.
async function publishedSlugs(github) {
  const published = new Set();
  const podFiles = await github.listDirectory("pods", github.env.GITHUB_BASE_BRANCH);
  for (const entry of podFiles.filter((item) => item.type === "file" && item.name.endsWith(".json"))) {
    const file = await github.readFile(`pods/${entry.name}`, github.env.GITHUB_BASE_BRANCH);
    for (const slug of JSON.parse(file.text).sites || []) published.add(slug);
  }
  return published;
}

async function draftChanges(github, slug) {
  const files = await github.changedFiles(github.env.GITHUB_BASE_BRANCH, draftBranch(slug));
  return files.filter((path) => path.startsWith(`sites/${slug}/`));
}

// inPod: wired for production (listed in pods/*.json). live: the domain really serves this site.
// Test sites (slug starting with "_") are never live and are never checked.
async function summary(slug, config, published, changedCount, web) {
  const isTest = slug.startsWith("_");
  const inPod = published.has(slug);
  const live = !isTest && inPod ? await isLive(config.domain, web) : false;
  return {
    slug,
    brandName: config.brand?.name || slug,
    domain: config.domain,
    isTest,
    inPod,
    live,
    liveUrl: live ? `https://${config.domain}/` : null,
    hasChanges: changedCount > 0,
  };
}

export async function listSites(github, web = null) {
  const base = github.env.GITHUB_BASE_BRANCH;
  const [directories, published, drafts] = await Promise.all([
    github.listDirectory("sites", base),
    publishedSlugs(github),
    github.draftBranchNames(),
  ]);

  const sites = [];
  for (const directory of directories.filter((item) => item.type === "dir")) {
    const slug = directory.name;
    const config = await readConfig(github, slug);
    if (!config) continue;
    const changed = drafts.includes(`draft/${slug}`) ? await draftChanges(github, slug) : [];
    sites.unshift(await summary(slug, config, published, changed.length, web));
  }
  return sites.sort((left, right) => left.slug.localeCompare(right.slug));
}

async function findPull(github, slug) {
  const pulls = await github.openPulls(draftBranch(slug));
  return pulls[0] || null;
}

export async function getSite(github, slug, web = null) {
  assertSlug(slug);
  const config = await readConfig(github, slug);
  if (!config) throw new UserError("That site doesn't exist.", 404);

  const base = github.env.GITHUB_BASE_BRANCH;
  const [published, draftSha, baseSha] = await Promise.all([
    publishedSlugs(github),
    github.branchSha(draftBranch(slug)),
    github.branchSha(base),
  ]);

  const paths = await github.treePaths(draftSha || baseSha);
  const edited = new Set(draftSha ? await draftChanges(github, slug) : []);
  const pull = draftSha ? await findPull(github, slug) : null;
  const pages = paths
    .filter((path) => path.startsWith(contentRoot(slug)) && path.endsWith(".md"))
    .map((path) => {
      const page = relativePage(slug, path);
      return { path: page, route: pageRoute(page), edited: edited.has(path) };
    })
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    ...(await summary(slug, config, published, edited.size, web)),
    pages,
    preview: await previewStatus(github, slug, { headSha: draftSha, pull }),
  };
}

// While a draft exists it is the source of truth: what Pavel saved is what he sees next time.
// `fields` and `body` are what the editor shows; `text` stays as the fallback when a page can't
// be shown as fields (parsePage returns null), so nothing is ever hidden or lost.
export async function readPage(github, slug, relativePath) {
  const path = pageFile(slug, relativePath);
  const draftSha = await github.branchSha(draftBranch(slug));
  const ref = draftSha ? draftBranch(slug) : github.env.GITHUB_BASE_BRANCH;
  const file = await github.readFile(path, ref);
  if (!file) throw new UserError("That page doesn't exist.", 404);
  const parsed = parsePage(file.text);
  return {
    path: relativePath,
    route: pageRoute(relativePath),
    text: file.text,
    fields: parsed?.fields || null,
    body: parsed?.body ?? null,
    inDraft: Boolean(draftSha),
  };
}

async function ensureDraftBranch(github, slug) {
  const branch = draftBranch(slug);
  if (await github.branchSha(branch)) return branch;
  const baseSha = await github.branchSha(github.env.GITHUB_BASE_BRANCH);
  try {
    await github.createBranch(branch, baseSha);
  } catch (error) {
    // 422 means someone created it between our check and our create; that is fine.
    if (error.status !== 422) throw error;
  }
  return branch;
}

async function ensurePull(github, slug) {
  if (await findPull(github, slug)) return;
  const config = await readConfig(github, slug);
  await github.createPull({
    branch: draftBranch(slug),
    title: `Draft: ${config.brand?.name || slug}`,
    body:
      `Draft of \`${slug}\`, managed from WICFL Studio.\n\n` +
      "Every save in Studio adds a commit here. Do not edit this branch by hand; " +
      "publish or discard it from Studio.",
  });
}

// Accepts either { fields, body } from the fields editor or { content } with the whole file.
export async function savePage(github, slug, relativePath, input, email) {
  const byFields = input && typeof input === "object" && input.fields;
  if (!byFields && typeof input?.content !== "string") {
    throw new UserError("The page content didn't arrive.", 400);
  }
  const path = pageFile(slug, relativePath);

  const existingDraft = await github.branchSha(draftBranch(slug));
  const current = await github.readFile(
    path,
    existingDraft ? draftBranch(slug) : github.env.GITHUB_BASE_BRANCH,
  );
  if (!current) throw new UserError("That page doesn't exist.", 404);
  const text = byFields ? composePage(current.text, input.fields, input.body) : input.content;
  if (current.text === text) return { saved: false };
  validatePageHeader(text, current.text);

  const branch = await ensureDraftBranch(github, slug);
  try {
    await github.writeFile(path, {
      text,
      sha: current.sha,
      branch,
      message: `content(${slug}): update ${relativePath}\n\nEdited-by: ${email}`,
    });
  } catch (error) {
    if (error.status === 409) {
      throw new UserError(
        "This page changed while you were editing it. Reload to see the current version.",
        409,
      );
    }
    throw error;
  }

  await ensurePull(github, slug);
  return { saved: true };
}

export async function discardDraft(github, slug) {
  const branch = draftBranch(slug);
  for (const pull of await github.openPulls(branch)) await github.closePull(pull.number);
  try {
    await github.deleteBranch(branch);
  } catch (error) {
    // Already gone (404) or never existed (422): discarding is idempotent.
    if (error.status !== 404 && error.status !== 422) throw error;
  }
  return { discarded: true };
}
