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
  const safePage = (PAGE + CREATE_MODE_SCRIPT).replaceAll("join('\n')", "join('\\n')").replaceAll("split('\n')", "split('\\n')").replaceAll("filter(Boolean)}})", "filter(Boolean)}}})");
  return new Response(safePage, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function base64ToText(value) {
  return decoder.decode(Uint8Array.from(atob(value.replace(/\n/g, "")), (character) => character.charCodeAt(0)));
}

function textToBase64(value) {
  let binary = "";
  for (const byte of encoder.encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function safeSlug(value) { return value === "_example" || (typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)); }
function safeSiteDirectory(value) { return safeSlug(value) || (typeof value === "string" && /^_[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)); }
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
      "user-agent": "wicfl-content-form/1.0",
      "x-github-api-version": "2022-11-28",
      ...(init.headers || {})
    }
  });
  if (!response.ok) {
    const error = new Error(`GitHub ${response.status}: ${await response.text()}`);
    error.status = response.status;
    throw error;
  }
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

const products = new Set(["flood", "homeowners", "renters", "landlord", "umbrella", "contractor", "commercial-property", "general-liability", "windstorm", "condo"]);
const audiences = new Set(["homeowner", "renter", "landlord", "contractor", "business-owner", "condo-owner"]);
const locales = new Set(["en", "es"]);
const themeAccents = { coastal: "#006D77", civic: "#365C8D", warm: "#A44A3F" };
const localProofTypes = new Set(["case-experience", "market-data", "review", "community-partnership", "local-regulation"]);

function requiredText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Complete ${label}.`);
  return value.trim();
}

function newSiteConfig(directory, draft) {
  const slug = directory.startsWith("_") ? directory.slice(1) : directory;
  if (!safeSlug(slug)) throw new Error("Invalid site name.");
  const brandName = requiredText(draft.brandName, "the brand name");
  const product = requiredText(draft.product, "the product");
  const audience = requiredText(draft.audience, "the audience");
  const city = requiredText(draft.city, "the city");
  const county = requiredText(draft.county, "the county");
  const primary = requiredText(draft.locale, "the primary language");
  const variant = requiredText(draft.themeVariant, "the theme variant");
  const seo = draft.seo || {};
  const localProof = draft.localProof || {};
  const uniqueSection = draft.uniqueSection || {};
  if (!products.has(product) || !audiences.has(audience) || !locales.has(primary) || !(variant in themeAccents) || !localProofTypes.has(localProof.type)) throw new Error("Choose a supported product, audience, language, theme, and local proof type.");
  if (!Array.isArray(seo.secondaryKeywords) || seo.secondaryKeywords.some((keyword) => typeof keyword !== "string" || !keyword.trim())) throw new Error("Secondary keywords must be a list of non-empty phrases.");
  return {
    slug,
    domain: `placeholder-${slug}.example`,
    brand: { name: brandName, parent: "WICFL" },
    niche: { product, audience },
    geo: { city, county, state: "FL", serviceArea: [city] },
    locale: { primary, alternates: [] },
    contact: {
      trackingPhone: "+10000000000",
      displayPhone: "PLACEHOLDER PHONE",
      email: `placeholder-${slug}@example.invalid`,
      address: { street: "PLACEHOLDER ADDRESS", city: "PLACEHOLDER CITY", state: "FL", zip: "00000" },
      licenseNumber: "PLACEHOLDER-FL-LICENSE"
    },
    products: [product],
    seo: {
      title: requiredText(seo.title, "the SEO title"),
      description: requiredText(seo.description, "the SEO description"),
      primaryKeyword: requiredText(seo.primaryKeyword, "the primary keyword"),
      secondaryKeywords: seo.secondaryKeywords.map((keyword) => keyword.trim())
    },
    analytics: { ga4: "G-PLACEHOLDER", gtm: "GTM-PLACEHOLDER" },
    crm: { formId: "PENDING_GHL_FORM_ID", leadSource: slug },
    theme: { variant, accentColor: themeAccents[variant] },
    differentiation: {
      localProof: [{ type: localProof.type, summary: requiredText(localProof.summary, "the local proof") }],
      uniqueSections: [{ title: requiredText(uniqueSection.title, "the unique section title"), rationale: requiredText(uniqueSection.rationale, "the unique section rationale") }]
    }
  };
}

async function createSite(env, body) {
  const directory = body.slug;
  if (!safeSiteDirectory(directory) || typeof body.markdown !== "string" || body.markdown.trim().length < 1 || body.markdown.length > 250000) throw new Error("Invalid submission.");
  try {
    await getFile(env, `sites/${directory}/site.config.json`);
    throw new Error("A site with that slug already exists.");
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const config = newSiteConfig(directory, body);
  const markdown = `---\ntitle: ${config.seo.title}\ndescription: ${config.seo.description}\npageType: home\n---\n\n${body.markdown.trim()}\n`;
  const base = await github(env, `${repository(env)}/git/ref/heads/${encodeURIComponent(env.GITHUB_BASE_BRANCH)}`);
  const branch = `content/${directory}/new-site-${crypto.randomUUID().slice(0, 8)}`;
  await github(env, `${repository(env)}/git/refs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }) });
  try {
    await github(env, `${repository(env)}/contents/sites/${directory}/site.config.json`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `content(${config.slug}): create site config`, content: textToBase64(`${JSON.stringify(config, null, 2)}\n`), branch }) });
    await github(env, `${repository(env)}/contents/sites/${directory}/content/index.md`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `content(${config.slug}): add home page`, content: textToBase64(markdown), branch }) });
    const pr = await github(env, `${repository(env)}/pulls`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: `New site draft: ${config.slug}`, head: branch, base: env.GITHUB_BASE_BRANCH, body: "New WICFL site created by the content form. Review the content checklist and differentiation audit before merging." }) });
    return { number: pr.number, url: pr.html_url, branch };
  } catch (error) {
    await github(env, `${repository(env)}/git/refs/heads/${branch}`, { method: "DELETE" }).catch(() => {});
    throw error;
  }
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
      if (url.pathname === "/api/create-site" && request.method === "POST") return json(await createSite(env, await request.json()), 201);
      return fail("Not found.", 404);
    } catch (error) {
      console.error(JSON.stringify({ event: "content-form-error", message: error instanceof Error ? error.message : "unknown" }));
      return fail("The draft could not be published. No pull request was merged.", 500);
    }
  }
};

const CREATE_MODE_SCRIPT = `<script>(()=>{const $=id=>document.getElementById(id);const editor=$('editor');const request=async(path,options={})=>{const response=await fetch(path,{headers:{'content-type':'application/json'},...options});const body=await response.json();if(!response.ok)throw Error(body.error);return body};let installed=false;const setup=()=>{if(installed||editor.classList.contains('hidden'))return;installed=true;const editOnly=[...editor.querySelectorAll('label'),...editor.querySelectorAll('p'),$('publish')];editOnly.forEach(node=>node.classList.add('edit-only'));editor.insertAdjacentHTML('afterbegin','<label>Mode<select id="mode"><option value="edit">Edit existing site</option><option value="create">Create new site</option></select></label><section id="create-fields" class="hidden"><label>Site slug<input id="new-slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="port-st-lucie"></label><label>Brand name<input id="new-brand"></label><label>Product<select id="new-product"><option value="flood">Flood</option><option value="homeowners">Homeowners</option><option value="renters">Renters</option><option value="landlord">Landlord</option><option value="umbrella">Umbrella</option><option value="contractor">Contractor</option><option value="commercial-property">Commercial property</option><option value="general-liability">General liability</option><option value="windstorm">Windstorm</option><option value="condo">Condo</option></select></label><label>Audience<select id="new-audience"><option value="homeowner">Homeowner</option><option value="renter">Renter</option><option value="landlord">Landlord</option><option value="contractor">Contractor</option><option value="business-owner">Business owner</option><option value="condo-owner">Condo owner</option></select></label><label>City<input id="new-city"></label><label>County<input id="new-county"></label><label>Primary language<select id="new-locale"><option value="en">English</option><option value="es">Spanish</option></select></label><label>Theme<select id="new-theme"><option value="coastal">Coastal</option><option value="civic">Civic</option><option value="warm">Warm</option></select></label><label>SEO title<input id="new-title"></label><label>SEO description<input id="new-description"></label><label>Primary keyword<input id="new-keyword"></label><label>Secondary keywords (one per line)<textarea id="new-keywords" rows="4"></textarea></label><label>Local proof type<select id="new-proof-type"><option value="market-data">Market data</option><option value="case-experience">Case experience</option><option value="review">Review</option><option value="community-partnership">Community partnership</option><option value="local-regulation">Local regulation</option></select></label><label>Local proof<input id="new-proof" placeholder="Specific, verifiable local evidence"></label><label>Unique section title<input id="new-section-title"></label><label>Why this section is unique<textarea id="new-section-rationale" rows="4"></textarea></label><label>Home page markdown<textarea id="new-markdown" placeholder="Write the home page content. The form creates its required frontmatter."></textarea></label><p>Use only evidence you can verify. This creates a draft pull request and never merges it.</p><button id="create-site">Create site draft</button></section>');const toggle=()=>{const creating=$('mode').value==='create';editor.querySelectorAll('.edit-only').forEach(node=>node.classList.toggle('hidden',creating));$('create-fields').classList.toggle('hidden',!creating)};$('mode').onchange=toggle;$('create-site').onclick=async()=>{try{$('create-site').disabled=true;$('status').textContent='Creating site draft pull request…';const newline=String.fromCharCode(10);const result=await request('/api/create-site',{method:'POST',body:JSON.stringify({slug:$('new-slug').value.trim(),brandName:$('new-brand').value,product:$('new-product').value,audience:$('new-audience').value,city:$('new-city').value,county:$('new-county').value,locale:$('new-locale').value,themeVariant:$('new-theme').value,seo:{title:$('new-title').value,description:$('new-description').value,primaryKeyword:$('new-keyword').value,secondaryKeywords:$('new-keywords').value.split(newline).map(value=>value.trim()).filter(Boolean)},localProof:{type:$('new-proof-type').value,summary:$('new-proof').value},uniqueSection:{title:$('new-section-title').value,rationale:$('new-section-rationale').value},markdown:$('new-markdown').value})});$('status').innerHTML='Draft pull request <a href="'+result.url+'" target="_blank" rel="noreferrer">#'+result.number+'</a> created. Review it before merging.'}catch(error){$('status').textContent=error.message}finally{$('create-site').disabled=false}};};new MutationObserver(setup).observe(editor,{attributes:true,attributeFilter:['class']});setup()})();</script>`;

const PAGE = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WICFL Content Drafts</title><style>body{font:16px system-ui;max-width:900px;margin:3rem auto;padding:0 1rem;color:#123}label{display:block;font-weight:700;margin-top:1rem}input,select,textarea,button{font:inherit;padding:.6rem;width:100%;box-sizing:border-box}textarea{min-height:18rem;font-family:ui-monospace,monospace}button{margin-top:1rem;background:#075c66;color:#fff;border:0;border-radius:.25rem;font-weight:700;cursor:pointer}.hidden{display:none}#status{padding:1rem;background:#eef7f7;margin-top:1rem}</style><main><h1>Content draft</h1><p>This creates a draft pull request. It never publishes or merges a site.</p><section id="login"><label>Password<input id="password" type="password" autocomplete="current-password"></label><button id="sign-in">Sign in</button></section><section id="editor" class="hidden"><label>Site<select id="site"></select></label><label>Page<select id="page"></select></label><label>Brand name<input id="brand"></label><label>Default SEO title<input id="title"></label><label>Default SEO description<input id="description"></label><label>Primary keyword<input id="keyword"></label><label>Secondary keywords (one per line)<textarea id="keywords" rows="4"></textarea></label><label>Markdown<textarea id="markdown"></textarea></label><p>Markdown supported: headings, paragraphs, links, bullet lists, and frontmatter. Review the content checklist and differentiation audit before merging.</p><button id="publish">Publish draft</button><div id="status" aria-live="polite"></div></section></main><script>const $=id=>document.getElementById(id),api=async(path,options={})=>{const r=await fetch(path,{headers:{'content-type':'application/json'},...options});const b=await r.json();if(!r.ok)throw Error(b.error);return b};let current;async function loadPage(){current=await api('/api/page?site='+encodeURIComponent($('site').value)+'&page='+encodeURIComponent($('page').value));$('brand').value=current.editableConfig.brand.name;$('title').value=current.editableConfig.seo.title;$('description').value=current.editableConfig.seo.description;$('keyword').value=current.editableConfig.seo.primaryKeyword;$('keywords').value=current.editableConfig.seo.secondaryKeywords.join('\n');$('markdown').value=current.markdown}async function loadPages(){const p=await api('/api/pages?site='+encodeURIComponent($('site').value));$('page').innerHTML=p.map(x=>'<option>'+x+'</option>').join('');await loadPage()}async function start(){const s=await api('/api/sites');$('site').innerHTML=s.map(x=>'<option value="'+x.slug+'">'+x.brandName+'</option>').join('');$('login').classList.add('hidden');$('editor').classList.remove('hidden');await loadPages()}$('sign-in').onclick=async()=>{try{await api('/api/login',{method:'POST',body:JSON.stringify({password:$('password').value})});await start()}catch(e){alert(e.message)}};$('site').onchange=loadPages;$('page').onchange=loadPage;$('publish').onclick=async()=>{try{$('publish').disabled=true;$('status').textContent='Creating draft pull request…';const r=await api('/api/publish',{method:'POST',body:JSON.stringify({slug:$('site').value,page:$('page').value,markdown:$('markdown').value,configPatch:{brand:{name:$('brand').value},seo:{title:$('title').value,description:$('description').value,primaryKeyword:$('keyword').value,secondaryKeywords:$('keywords').value.split('\n').map(x=>x.trim()).filter(Boolean)}})});$('status').innerHTML='Draft pull request <a href="'+r.url+'" target="_blank" rel="noreferrer">#'+r.number+'</a> created. Review it before merging.'}catch(e){$('status').textContent=e.message}finally{$('publish').disabled=false}};</script>`;
