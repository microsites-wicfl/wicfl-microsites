const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const SESSION_NAME = "wicfl_content_form";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const editableConfig = (config) => ({ brand: { name: config.brand.name }, seo: config.seo });

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { ...JSON_HEADERS, ...headers } });
}

function fail(message, status = 400) { return json({ error: message }, status); }

function html() {
  return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function base64ToText(value) {
  return decoder.decode(Uint8Array.from(atob(value.replace(/\n/g, "")), (character) => character.charCodeAt(0)));
}

function textToBase64(value) {
  let binary = "";
  for (const byte of encoder.encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function safeSlug(value) { return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }
function safePage(value) { return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(value); }

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/g, "");
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function sessionCookie(secret) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${expires}.${crypto.randomUUID()}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

async function isAuthenticated(request, secret) {
  const value = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_NAME}=`))?.slice(SESSION_NAME.length + 1);
  if (!value) return false;
  const [expires, nonce, signature] = value.split(".");
  if (!expires || !nonce || !signature || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  return constantTimeEqual(signature, await hmac(`${expires}.${nonce}`, secret));
}

async function github(env, path, init = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      ...(init.headers || {})
    }
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

function repository(env) { return `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`; }

async function getFile(env, path, ref = env.GITHUB_BASE_BRANCH) {
  const item = await github(env, `${repository(env)}/contents/${path}?ref=${encodeURIComponent(ref)}`);
  if (Array.isArray(item)) throw new Error(`Expected a file at ${path}.`);
  return { text: base64ToText(item.content), sha: item.sha };
}

async function sites(env) {
  const root = await github(env, `${repository(env)}/contents/sites?ref=${encodeURIComponent(env.GITHUB_BASE_BRANCH)}`);
  const found = [];
  for (const entry of root.filter((item) => item.type === "dir")) {
    try {
      const config = await getFile(env, `sites/${entry.name}/site.config.json`);
      const parsed = JSON.parse(config.text);
      found.push({ slug: entry.name, brandName: parsed.brand.name, editableConfig: editableConfig(parsed) });
    } catch { /* A directory without a valid site config is not an operator site. */ }
  }
  return found.sort((left, right) => left.slug.localeCompare(right.slug));
}

async function pageData(env, slug, page) {
  if (!safeSlug(slug) || !safePage(page)) throw new Error("Invalid site or page name.");
  const [config, markdown] = await Promise.all([getFile(env, `sites/${slug}/site.config.json`), getFile(env, `sites/${slug}/content/${page}`)]);
  return { markdown: markdown.text, editableConfig: editableConfig(JSON.parse(config.text)) };
}

async function pages(env, slug) {
  if (!safeSlug(slug)) throw new Error("Invalid site name.");
  const items = await github(env, `${repository(env)}/contents/sites/${slug}/content?ref=${encodeURIComponent(env.GITHUB_BASE_BRANCH)}`);
  return items.filter((item) => item.type === "file" && safePage(item.name)).map((item) => item.name).sort();
}

function validatedPatch(current, patch) {
  if (!patch || typeof patch !== "object") return current;
  const next = structuredClone(current);
  if (typeof patch.brand?.name === "string") next.brand.name = patch.brand.name.trim();
  for (const key of ["title", "description", "primaryKeyword", "secondaryKeywords"]) if (key in (patch.seo || {})) next.seo[key] = patch.seo[key];
  if (!next.brand.name || !next.seo.title || !next.seo.description || !next.seo.primaryKeyword || !Array.isArray(next.seo.secondaryKeywords)) throw new Error("Complete the editable brand and SEO fields.");
  return next;
}

async function publish(env, body) {
  const { slug, page, markdown, configPatch } = body;
  if (!safeSlug(slug) || !safePage(page) || typeof markdown !== "string" || markdown.length < 1 || markdown.length > 250000) throw new Error("Invalid submission.");
  const [configFile, markdownFile, base] = await Promise.all([
    getFile(env, `sites/${slug}/site.config.json`),
    getFile(env, `sites/${slug}/content/${page}`),
    github(env, `${repository(env)}/git/ref/heads/${encodeURIComponent(env.GITHUB_BASE_BRANCH)}`)
  ]);
  const config = JSON.parse(configFile.text);
  const patch = validatedPatch(editableConfig(config), configPatch);
  config.brand.name = patch.brand.name;
  config.seo = patch.seo;
  const branch = `content/${slug}/${page.slice(0, -3)}-${crypto.randomUUID().slice(0, 8)}`;
  await github(env, `${repository(env)}/git/refs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }) });
  try {
    await github(env, `${repository(env)}/contents/sites/${slug}/site.config.json`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `content(${slug}): update editorial config`, content: textToBase64(`${JSON.stringify(config, null, 2)}\n`), sha: configFile.sha, branch }) });
    await github(env, `${repository(env)}/contents/sites/${slug}/content/${page}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `content(${slug}): update ${page}`, content: textToBase64(markdown), sha: markdownFile.sha, branch }) });
    const pr = await github(env, `${repository(env)}/pulls`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: `Content draft: ${slug}/${page}`, head: branch, base: env.GITHUB_BASE_BRANCH, body: "Draft created by the WICFL content form. Review the content checklist and differentiation audit before merging." }) });
    return { number: pr.number, url: pr.html_url, branch };
  } catch (error) {
    await github(env, `${repository(env)}/git/refs/heads/${branch}`, { method: "DELETE" }).catch(() => {});
    throw error;
  }
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/") return html();
      if (url.pathname === "/api/login" && request.method === "POST") {
        const { password } = await request.json();
        if (typeof password !== "string" || !constantTimeEqual(password, env.OPERATOR_PASSWORD)) return fail("Incorrect password.", 401);
        const value = await sessionCookie(env.OPERATOR_PASSWORD);
        return json({ ok: true }, 200, { "set-cookie": `${SESSION_NAME}=${value}; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict; Path=/` });
      }
      if (!(await isAuthenticated(request, env.OPERATOR_PASSWORD))) return fail("Sign in required.", 401);
      if (url.pathname === "/api/sites" && request.method === "GET") return json(await sites(env));
      if (url.pathname === "/api/pages" && request.method === "GET") return json(await pages(env, url.searchParams.get("site")));
      if (url.pathname === "/api/page" && request.method === "GET") return json(await pageData(env, url.searchParams.get("site"), url.searchParams.get("page")));
      if (url.pathname === "/api/publish" && request.method === "POST") return json(await publish(env, await request.json()), 201);
      return fail("Not found.", 404);
    } catch (error) {
      console.error(JSON.stringify({ event: "content-form-error", message: error instanceof Error ? error.message : "unknown" }));
      return fail("The draft could not be published. No pull request was merged.", 500);
    }
  }
};

const PAGE = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WICFL Content Drafts</title><style>body{font:16px system-ui;max-width:900px;margin:3rem auto;padding:0 1rem;color:#123}label{display:block;font-weight:700;margin-top:1rem}input,select,textarea,button{font:inherit;padding:.6rem;width:100%;box-sizing:border-box}textarea{min-height:18rem;font-family:ui-monospace,monospace}button{margin-top:1rem;background:#075c66;color:#fff;border:0;border-radius:.25rem;font-weight:700;cursor:pointer}.hidden{display:none}#status{padding:1rem;background:#eef7f7;margin-top:1rem}</style><main><h1>Content draft</h1><p>This creates a draft pull request. It never publishes or merges a site.</p><section id="login"><label>Password<input id="password" type="password" autocomplete="current-password"></label><button id="sign-in">Sign in</button></section><section id="editor" class="hidden"><label>Site<select id="site"></select></label><label>Page<select id="page"></select></label><label>Brand name<input id="brand"></label><label>Default SEO title<input id="title"></label><label>Default SEO description<input id="description"></label><label>Primary keyword<input id="keyword"></label><label>Secondary keywords (one per line)<textarea id="keywords" rows="4"></textarea></label><label>Markdown<textarea id="markdown"></textarea></label><p>Markdown supported: headings, paragraphs, links, bullet lists, and frontmatter. Review the content checklist and differentiation audit before merging.</p><button id="publish">Publish draft</button><div id="status" aria-live="polite"></div></section></main><script>const $=id=>document.getElementById(id),api=async(path,options={})=>{const r=await fetch(path,{headers:{'content-type':'application/json'},...options});const b=await r.json();if(!r.ok)throw Error(b.error);return b};let current;async function loadPage(){current=await api('/api/page?site='+encodeURIComponent($('site').value)+'&page='+encodeURIComponent($('page').value));$('brand').value=current.editableConfig.brand.name;$('title').value=current.editableConfig.seo.title;$('description').value=current.editableConfig.seo.description;$('keyword').value=current.editableConfig.seo.primaryKeyword;$('keywords').value=current.editableConfig.seo.secondaryKeywords.join('\n');$('markdown').value=current.markdown}async function loadPages(){const p=await api('/api/pages?site='+encodeURIComponent($('site').value));$('page').innerHTML=p.map(x=>'<option>'+x+'</option>').join('');await loadPage()}async function start(){const s=await api('/api/sites');$('site').innerHTML=s.map(x=>'<option value="'+x.slug+'">'+x.brandName+'</option>').join('');$('login').classList.add('hidden');$('editor').classList.remove('hidden');await loadPages()}$('sign-in').onclick=async()=>{try{await api('/api/login',{method:'POST',body:JSON.stringify({password:$('password').value})});await start()}catch(e){alert(e.message)}};$('site').onchange=loadPages;$('page').onchange=loadPage;$('publish').onclick=async()=>{try{$('publish').disabled=true;$('status').textContent='Creating draft pull request…';const r=await api('/api/publish',{method:'POST',body:JSON.stringify({slug:$('site').value,page:$('page').value,markdown:$('markdown').value,configPatch:{brand:{name:$('brand').value},seo:{title:$('title').value,description:$('description').value,primaryKeyword:$('keyword').value,secondaryKeywords:$('keywords').value.split('\n').map(x=>x.trim()).filter(Boolean)}})});$('status').innerHTML='Draft pull request <a href="'+r.url+'" target="_blank" rel="noreferrer">#'+r.number+'</a> created. Review it before merging.'}catch(e){$('status').textContent=e.message}finally{$('publish').disabled=false}};</script>`;
