import { validateColumns } from "./columns.js";
import { validatePageHeader } from "./frontmatter.js";
import { isLive } from "./live.js";
import { composePage, pageRoute, parsePage } from "./pagefields.js";
import { UserError } from "./errors.js";
import {
  IMAGE_TYPES,
  assertSlug,
  contentRoot,
  draftBranch,
  imageFile,
  imageNameFrom,
  imagesRoot,
  pageFile,
  relativePage,
} from "./paths.js";
import { previewStatus } from "./preview.js";
import {
  applySettings,
  formatConfig,
  launchBlockers,
  newSiteConfig,
  settingsOf,
  starterPages,
} from "./siteconfig.js";

const configPath = (slug) => `sites/${assertSlug(slug)}/site.config.json`;

// The site's settings as Pavel last saved them: from its draft when there is one (a new site
// exists only there until it is published), otherwise from the published version.
async function readConfig(github, slug, { draft = true } = {}) {
  const draftSha = draft ? await github.branchSha(draftBranch(slug)) : null;
  return readConfigAt(github, slug, draftSha ? draftBranch(slug) : github.env.GITHUB_BASE_BRANCH);
}

async function readConfigAt(github, slug, ref) {
  const file = await github.readFile(configPath(slug), ref);
  return file ? JSON.parse(file.text) : null;
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

// Every site on main also has its published version on workers.dev (CI "Publish site Workers"),
// so a site that isn't live yet can still be seen as it is now, without the draft.
export function publishedUrl(env, slug) {
  const host = env?.PUBLISHED_SITES_HOST;
  return host ? `https://wicfl-${slug}-published.${host}/` : null;
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

  const slugs = new Set(directories.filter((item) => item.type === "dir").map((item) => item.name));
  // New sites live only in their draft until they are published.
  for (const branch of drafts) slugs.add(branch.replace(/^draft\//, ""));

  const sites = [];
  for (const slug of slugs) {
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

// Everything the site view needs, fetched in as few sequential rounds as possible: each GitHub
// call is ~0.3-0.6 s, and doing them one after another made this view take ~7 s.
export async function getSite(github, slug, web = null) {
  assertSlug(slug);
  const base = github.env.GITHUB_BASE_BRANCH;
  const [published, draftSha, baseSha, baseConfig] = await Promise.all([
    publishedSlugs(github),
    github.branchSha(draftBranch(slug)),
    github.branchSha(base),
    readConfigAt(github, slug, base),
  ]);
  const [config, paths, changed, basePaths, pull] = await Promise.all([
    draftSha ? readConfigAt(github, slug, draftBranch(slug)) : baseConfig,
    github.treePaths(draftSha || baseSha),
    draftSha ? draftChanges(github, slug) : [],
    draftSha ? github.treePaths(baseSha) : [],
    draftSha ? findPull(github, slug) : null,
  ]);
  if (!config) throw new UserError("That site doesn't exist.", 404);

  const edited = new Set(changed);
  // Pages removed in the draft still show, marked, until the draft is published or discarded.
  const current = new Set(paths);
  const isPage = (path) => path.startsWith(contentRoot(slug)) && path.endsWith(".md");
  const deleted = basePaths.filter((path) => isPage(path) && !current.has(path));
  const pages = paths
    .filter(isPage)
    .map((path) => {
      const page = relativePage(slug, path);
      return {
        path: page,
        route: pageRoute(page),
        edited: edited.has(path),
        protected: isProtectedPage(page),
      };
    })
    .concat(
      deleted.map((path) => {
        const page = relativePage(slug, path);
        return { path: page, route: pageRoute(page), edited: true, deleted: true, protected: false };
      }),
    )
    .sort((left, right) => left.path.localeCompare(right.path));

  const [preview, site] = await Promise.all([
    previewStatus(github, slug, { headSha: draftSha, pull }),
    summary(slug, config, published, edited.size, web),
  ]);
  return {
    ...site,
    isNew: !baseConfig,
    publishedUrl: baseConfig ? publishedUrl(github.env, slug) : null,
    blockers: slug.startsWith("_") ? [] : launchBlockers(config),
    canPublish: preview.state === "ready",
    pages,
    preview,
  };
}

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
    protected: isProtectedPage(relativePath),
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
  validateColumns(byFields ? input.body : parsePage(text)?.body ?? text);

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

// Pages a site can't lose: its home page (in any language) and its contact page.
export function isProtectedPage(relativePath) {
  return relativePath === "contact.md" || relativePath.split("/").pop() === "index.md";
}

// A page's file name comes from its title: "Flood Insurance in Stuart, FL" -> "flood-insurance-in-stuart-fl".
export function pageNameFromTitle(title) {
  return String(title || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

async function currentRef(github, slug) {
  const draftSha = await github.branchSha(draftBranch(slug));
  return draftSha ? draftBranch(slug) : github.env.GITHUB_BASE_BRANCH;
}

export async function createPage(github, slug, input, email) {
  const fields = input?.fields || {};
  if (!["content", "coverage"].includes(fields.pageType)) {
    throw new UserError("Choose a page type: content or coverage.", 400);
  }
  const name = pageNameFromTitle(input?.name || fields.title);
  if (!name) throw new UserError("The page needs a title.", 400);
  const relativePath = `${name}.md`;
  const path = pageFile(slug, relativePath);

  const ref = await currentRef(github, slug);
  if (await github.readFile(path, ref)) {
    throw new UserError(`A page at /${name}/ already exists. Change the title or open that page.`, 409);
  }
  validateColumns(input?.body || "");
  const text = composePage("", fields, input?.body || "Write the page text here.");
  const branch = await ensureDraftBranch(github, slug);
  await github.writeFile(path, {
    text,
    branch,
    message: `content(${slug}): add ${relativePath}\n\nEdited-by: ${email}`,
  });
  await ensurePull(github, slug);
  return { created: true, path: relativePath, route: pageRoute(relativePath) };
}

export async function deletePage(github, slug, relativePath, email) {
  const path = pageFile(slug, relativePath);
  if (isProtectedPage(relativePath)) {
    throw new UserError("The home page and the contact page can't be deleted.", 400);
  }
  const ref = await currentRef(github, slug);
  const current = await github.readFile(path, ref);
  if (!current) return { deleted: false };
  const branch = await ensureDraftBranch(github, slug);
  const inDraft = await github.readFile(path, branch);
  await github.deleteFile(path, {
    sha: (inDraft || current).sha,
    branch,
    message: `content(${slug}): delete ${relativePath}\n\nEdited-by: ${email}`,
  });
  await ensurePull(github, slug);
  return { deleted: true };
}

// Brings back a page deleted in the draft, exactly as it is on the published version.
export async function restorePage(github, slug, relativePath, email) {
  const path = pageFile(slug, relativePath);
  const published = await github.readFile(path, github.env.GITHUB_BASE_BRANCH);
  if (!published) throw new UserError("That page doesn't exist on the published site.", 404);
  const branch = await ensureDraftBranch(github, slug);
  if (await github.readFile(path, branch)) return { restored: false };
  await github.writeFile(path, {
    text: published.text,
    branch,
    message: `content(${slug}): restore ${relativePath}\n\nEdited-by: ${email}`,
  });
  return { restored: true };
}

// Other pages of the site that link to this one, so deleting it doesn't leave broken links.
export async function pagesLinkingTo(github, slug, relativePath) {
  pageFile(slug, relativePath);
  const route = pageRoute(relativePath);
  const bare = route.replace(/\/$/, "");
  const ref = await currentRef(github, slug);
  const sha = await github.branchSha(ref);
  const paths = (await github.treePaths(sha)).filter(
    (path) => path.startsWith(contentRoot(slug)) && path.endsWith(".md") && path !== pageFile(slug, relativePath),
  );
  const linking = [];
  for (const path of paths) {
    const file = await github.readFile(path, ref);
    const text = file?.text || "";
    if (text.includes(`](${route})`) || (bare && text.includes(`](${bare})`))) linking.push(relativePage(slug, path));
  }
  return { route, linkedFrom: linking };
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function listImages(github, slug) {
  assertSlug(slug);
  const ref = await currentRef(github, slug);
  const items = await github.listDirectory(imagesRoot(slug).replace(/\/$/, ""), ref);
  return items
    .filter((item) => item.type === "file" && IMAGE_TYPES[item.name.split(".").pop()])
    .map((item) => ({ name: item.name, url: `/images/${item.name}` }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function readImage(github, slug, name) {
  const path = imageFile(slug, name);
  const ref = await currentRef(github, slug);
  const bytes = await github.readBinary(path, ref);
  if (!bytes) throw new UserError("That image doesn't exist.", 404);
  return { bytes, type: IMAGE_TYPES[name.split(".").pop()] };
}

// Uploads go into the site's draft. A name already taken gets -2, -3... so nothing is overwritten.
export async function uploadImage(github, slug, input, email) {
  const base64 = String(input?.data || "").replace(/^data:[^,]*,/, "");
  if (!base64) throw new UserError("The image didn't arrive.", 400);
  const size = Math.floor((base64.length * 3) / 4);
  if (size > MAX_IMAGE_BYTES) {
    throw new UserError("That image is larger than 5 MB. Make it smaller and try again.", 400);
  }
  const wanted = imageNameFrom(input?.name);
  const taken = new Set((await listImages(github, slug)).map((image) => image.name));
  const [stem, extension] = [wanted.replace(/\.[^.]+$/, ""), wanted.split(".").pop()];
  let name = wanted;
  for (let counter = 2; taken.has(name); counter += 1) name = `${stem}-${counter}.${extension}`;
  imageFile(slug, name);

  const branch = await ensureDraftBranch(github, slug);
  await github.writeBinary(`${imagesRoot(slug)}${name}`, {
    base64,
    branch,
    message: `content(${slug}): add image ${name}\n\nEdited-by: ${email}`,
  });
  await ensurePull(github, slug);
  return { name, url: `/images/${name}` };
}

export async function getSettings(github, slug) {
  const config = await readConfig(github, slug);
  if (!config) throw new UserError("That site doesn't exist.", 404);
  return { settings: settingsOf(config), blockers: slug.startsWith("_") ? [] : launchBlockers(config) };
}

export async function saveSettings(github, slug, input, email) {
  const branchExists = await github.branchSha(draftBranch(slug));
  const ref = branchExists ? draftBranch(slug) : github.env.GITHUB_BASE_BRANCH;
  const file = await github.readFile(configPath(slug), ref);
  if (!file) throw new UserError("That site doesn't exist.", 404);
  const next = formatConfig(applySettings(JSON.parse(file.text), input || {}), file.text);
  if (JSON.stringify(JSON.parse(next)) === JSON.stringify(JSON.parse(file.text))) return { saved: false };

  const branch = await ensureDraftBranch(github, slug);
  const inDraft = await github.readFile(configPath(slug), branch);
  await github.writeFile(configPath(slug), {
    text: next,
    sha: inDraft.sha,
    branch,
    message: `content(${slug}): update site settings\n\nEdited-by: ${email}`,
  });
  await ensurePull(github, slug);
  return { saved: true, blockers: launchBlockers(JSON.parse(next)) };
}

// A new site is born as a draft: its settings plus three starter pages, all inside sites/<slug>/.
// It is not wired to any domain; going live the first time stays with Vic.
export async function createSite(github, input, email) {
  const config = newSiteConfig(input || {});
  const slug = config.slug;
  const base = github.env.GITHUB_BASE_BRANCH;
  if ((await github.readFile(configPath(slug), base)) || (await github.branchSha(draftBranch(slug)))) {
    throw new UserError(`A site for ${config.geo.city} and ${config.niche.product} already exists.`, 409);
  }
  const branch = await ensureDraftBranch(github, slug);
  await github.writeFile(configPath(slug), {
    text: formatConfig(config),
    branch,
    message: `content(${slug}): create site\n\nEdited-by: ${email}`,
  });
  for (const [name, text] of Object.entries(starterPages(config))) {
    await github.writeFile(pageFile(slug, name), {
      text,
      branch,
      message: `content(${slug}): add starter ${name}\n\nEdited-by: ${email}`,
    });
  }
  await ensurePull(github, slug);
  return { created: true, slug };
}

// Publish = the draft becomes the site's official version. A site already live on its domain is
// then deployed; a site that isn't live yet (before launch, or a new site) waits for Vic.
export async function publishDraft(github, slug, email, web = null) {
  const draftSha = await github.branchSha(draftBranch(slug));
  if (!draftSha) throw new UserError("There is nothing to publish on this site.", 400);
  const pull = await findPull(github, slug);
  const preview = await previewStatus(github, slug, { headSha: draftSha, pull });
  if (preview.state !== "ready") {
    throw new UserError("Wait until the preview is ready, and check it, before publishing.", 409);
  }
  try {
    await github.mergePull(pull.number, {
      title: `content(${slug}): publish from Studio`,
      message: `Published-by: ${email}`,
    });
  } catch (error) {
    if (error.status === 405 || error.status === 409) {
      throw new UserError("This draft can't be published automatically right now. Let Vic know.", 409);
    }
    throw error;
  }
  try {
    await github.deleteBranch(draftBranch(slug));
  } catch (error) {
    if (error.status !== 404 && error.status !== 422) throw error;
  }

  const config = await readConfig(github, slug, { draft: false });
  const inPod = (await publishedSlugs(github)).has(slug);
  const live = inPod && config ? await isLive(config.domain, web) : false;
  if (!live) return { published: true, deploying: false };
  try {
    await github.dispatchWorkflow("deploy.yml", { target: "production", confirm: "deploy" });
    return { published: true, deploying: true };
  } catch (error) {
    console.error(`Studio error: publish deploy dispatch failed: ${error.message}`);
    return { published: true, deploying: false, needsVic: true };
  }
}
