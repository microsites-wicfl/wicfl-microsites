import { api, file, repo, encode } from "./github.js";
const validSlug = (slug) =>
  typeof slug === "string" &&
  (/^_[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
const safePath = (slug, path) =>
  validSlug(slug) &&
  typeof path === "string" &&
  path.startsWith(`sites/${slug}/content/`) &&
  path.endsWith(".md") &&
  !path.includes("..");
const draft = (slug) => `draft/${slug}`;
export async function listSites(env, fetcher) {
  const root = await api(
    env,
    `${repo(env)}/contents/sites?ref=${env.GITHUB_BASE_BRANCH}`,
    {},
    fetcher,
  );
  const pods = await api(
    env,
    `${repo(env)}/contents/pods?ref=${env.GITHUB_BASE_BRANCH}`,
    {},
    fetcher,
  ).catch(() => []);
  const published = new Set();
  for (const pod of pods.filter((item) => item.name.endsWith(".json"))) {
    const data = JSON.parse(
      (await file(env, `pods/${pod.name}`, env.GITHUB_BASE_BRANCH, fetcher)).text,
    );
    data.sites?.forEach((slug) => published.add(slug));
  }
  const sites = [];
  for (const entry of root.filter((item) => item.type === "dir")) {
    try {
      const config = JSON.parse(
        (await file(env, `sites/${entry.name}/site.config.json`, env.GITHUB_BASE_BRANCH, fetcher))
          .text,
      );
      const comparison = await api(
        env,
        `${repo(env)}/compare/${env.GITHUB_BASE_BRANCH}...${draft(entry.name)}`,
        {},
        fetcher,
      ).catch(() => null);
      sites.push({
        slug: entry.name,
        brandName: config.brand.name,
        domain: config.domain,
        changed: Boolean(comparison?.ahead_by),
        published: published.has(entry.name),
      });
    } catch {}
  }
  return sites.sort((a, b) => a.slug.localeCompare(b.slug));
}
export async function save(env, slug, path, content, email, fetcher) {
  if (!safePath(slug, path)) throw new Error("Solo puedes guardar páginas del sitio seleccionado.");
  const branch = draft(slug);
  const base = await api(env, `${repo(env)}/git/ref/heads/${env.GITHUB_BASE_BRANCH}`, {}, fetcher);
  let exists = true;
  try {
    await api(env, `${repo(env)}/git/ref/heads/${encodeURIComponent(branch)}`, {}, fetcher);
  } catch (error) {
    if (error.status !== 404) throw error;
    exists = false;
    await api(
      env,
      `${repo(env)}/git/refs`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }),
      },
      fetcher,
    );
  }
  let current;
  try {
    current = await file(env, path, branch, fetcher);
  } catch (error) {
    throw error;
  }
  try {
    await api(
      env,
      `${repo(env)}/contents/${path}`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: `content(${slug}): update ${path.replace(`sites/${slug}/content/`, "")}`,
          content: encode(content),
          sha: current.sha,
          branch,
        }),
      },
      fetcher,
    );
  } catch (error) {
    if (error.status === 409)
      throw new Error(
        "Esta página cambió mientras la editabas. Recarga para ver la versión actual.",
      );
    throw error;
  }
  if (!exists)
    await api(
      env,
      `${repo(env)}/pulls`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: `Draft: ${slug}`,
          head: branch,
          base: env.GITHUB_BASE_BRANCH,
          body: `WICFL Studio draft. Edited-by: ${email}. Do not edit by hand.`,
        }),
      },
      fetcher,
    );
}
export async function discard(env, slug, fetcher) {
  if (!validSlug(slug)) throw new Error("Sitio inválido.");
  const prs = await api(
    env,
    `${repo(env)}/pulls?state=open&head=${encodeURIComponent(`${env.GITHUB_OWNER}:${draft(slug)}`)}`,
    {},
    fetcher,
  );
  for (const pr of prs)
    await api(
      env,
      `${repo(env)}/pulls/${pr.number}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state: "closed" }),
      },
      fetcher,
    );
  await api(
    env,
    `${repo(env)}/git/refs/heads/${encodeURIComponent(draft(slug))}`,
    { method: "DELETE" },
    fetcher,
  );
}

async function draftExists(env, slug, fetcher) {
  try {
    await api(env, `${repo(env)}/git/ref/heads/${encodeURIComponent(draft(slug))}`, {}, fetcher);
    return true;
  } catch (error) {
    if (error.status === 404) return false;
    throw error;
  }
}

export async function page(env, slug, path, fetcher) {
  if (!safePath(slug, path)) throw new Error("Solo puedes abrir páginas del sitio seleccionado.");
  const ref = (await draftExists(env, slug, fetcher)) ? draft(slug) : env.GITHUB_BASE_BRANCH;
  return file(env, path, ref, fetcher);
}

export async function siteDetail(env, slug, fetcher) {
  if (!validSlug(slug)) throw new Error("Sitio inválido.");
  const [sites, hasDraft] = await Promise.all([
    listSites(env, fetcher),
    draftExists(env, slug, fetcher),
  ]);
  const site = sites.find((item) => item.slug === slug);
  if (!site) {
    const error = new Error("No encontrado.");
    error.status = 404;
    throw error;
  }
  const ref = hasDraft ? draft(slug) : env.GITHUB_BASE_BRANCH;
  const tree = await api(
    env,
    `${repo(env)}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
    {},
    fetcher,
  );
  const compare = hasDraft
    ? await api(env, `${repo(env)}/compare/${env.GITHUB_BASE_BRANCH}...${draft(slug)}`, {}, fetcher)
    : null;
  const edited = new Set(compare?.files?.map((item) => item.filename) || []);
  return {
    ...site,
    pages: tree.tree
      .filter((item) => item.path.startsWith(`sites/${slug}/content/`) && item.path.endsWith(".md"))
      .map((item) => ({ path: item.path, edited: edited.has(item.path) })),
    preview: hasDraft ? { state: "preparing" } : { state: "none" },
  };
}
