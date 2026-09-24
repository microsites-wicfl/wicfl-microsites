import assert from "node:assert/strict";
import test from "node:test";
import { createHandler } from "../src/index.js";
import { pageFile } from "../src/paths.js";
import { env, offline, pavel, sampleRepository } from "./fake-github.js";
import { resetLiveCache } from "../src/live.js";

// Real pages always carry a header; saves must keep it valid (see src/frontmatter.js).
const page = (body) => `---\ntitle: Home\n---\n${body}`;

function call(github, method, path, { body, ctx = pavel, environment = env, web = offline } = {}) {
  resetLiveCache();
  const handle = createHandler(github.fetch, undefined, web);
  const request = new Request(`https://studio.test${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(request, environment, ctx).then(async (response) => ({
    status: response.status,
    body: await response.json(),
  }));
}

test("without an Access identity every API route answers 401", async () => {
  const github = sampleRepository();
  const response = await call(github, "GET", "/api/sites", { ctx: {} });
  assert.equal(response.status, 401);
  assert.equal(github.calls.length, 0, "no GitHub call before authentication");
});

test("an email outside ALLOWED_EMAILS answers 403", async () => {
  const stranger = { access: { getIdentity: async () => ({ email: "someone@else.test" }) } };
  const response = await call(sampleRepository(), "GET", "/api/me", { ctx: stranger });
  assert.equal(response.status, 403);
});

test("non-API paths are served from static assets", async () => {
  const handle = createHandler(sampleRepository().fetch, undefined, offline);
  const response = await handle(new Request("https://studio.test/"), env, {});
  assert.equal(await response.text(), "asset");
});

test("dashboard lists sites with pod, live and test flags, sorted", async () => {
  const { status, body } = await call(sampleRepository(), "GET", "/api/sites");
  assert.equal(status, 200);
  assert.deepEqual(
    body.map((site) => [site.slug, site.brandName, site.inPod, site.live, site.isTest, site.hasChanges]),
    [
      ["_example", "Example", false, false, true, false],
      ["stuart", "Stuart Homes", true, false, false, false],
    ],
  );
});

test("a site is live only when its own domain serves a page with its canonical address", async () => {
  const seen = [];
  const serving = (html, status = 200) => async (url) => {
    seen.push(String(url));
    return new Response(html, { status });
  };
  const ours = '<link rel="canonical" href="https://stuart.test/">';
  const cases = [
    [serving(ours), true],
    [serving("<html>Parked domain</html>"), false],
    [serving(ours, 503), false],
    [async () => { throw new Error("DNS"); }, false],
  ];
  for (const [web, expected] of cases) {
    const { body } = await call(sampleRepository(), "GET", "/api/sites", { web });
    const stuart = body.find((site) => site.slug === "stuart");
    assert.equal(stuart.live, expected);
    assert.equal(stuart.liveUrl, expected ? "https://stuart.test/" : null);
  }
  assert.ok(seen.every((url) => url === "https://stuart.test/"), "test sites are never probed");
});

test("first save creates the draft from main and opens one pull request", async () => {
  const github = sampleRepository();
  const response = await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: page("New home") },
  });
  assert.equal(response.status, 200);
  assert.equal(github.branches.get("draft/stuart").files["sites/stuart/content/index.md"], page("New home"));
  assert.equal(
    github.branches.get("main").files["sites/stuart/content/index.md"],
    "---\ntitle: Home\n---\nHello",
  );
  assert.equal(github.pulls.length, 1);
  assert.equal(github.pulls[0].title, "Draft: Stuart Homes");
  assert.match(github.commitsOn("draft/stuart")[0].message, /Edited-by: pavel@example\.test/);
});

test("a second save of another page reuses the same draft and pull request", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: page("One") } });
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", { body: { content: page("Two") } });
  assert.equal(github.pulls.length, 1);
  assert.equal(github.commitsOn("draft/stuart").length, 2);
  for (const commit of github.commitsOn("draft/stuart")) assert.match(commit.message, /Edited-by: /);
});

test("saving identical content makes no commit", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", {
    body: { content: "---\ntitle: Flood\n---\nFlood copy" },
  });
  assert.equal(github.branches.has("draft/stuart"), false, "no draft is created for a no-op save");
  assert.equal(github.pulls.length, 0);
});

test("a page reopened after saving shows the saved text, read from the draft", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: page("Saved text") } });
  const { body } = await call(github, "GET", "/api/sites/stuart/pages/index.md");
  assert.equal(body.text, page("Saved text"));
  assert.equal(body.inDraft, true);
});

test("without a draft, pages are read from main", async () => {
  const { body } = await call(sampleRepository(), "GET", "/api/sites/stuart/pages/flood.md");
  assert.equal(body.text, "---\ntitle: Flood\n---\nFlood copy");
  assert.equal(body.inDraft, false);
});

test("site view marks edited pages, including nested language pages", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/_example/pages/es/index.md", { body: { content: "Hola" } });
  const { body } = await call(github, "GET", "/api/sites/_example");
  assert.deepEqual(body.pages, [
    { path: "es/index.md", route: "/es/", edited: true, protected: true },
    { path: "index.md", route: "/", edited: false, protected: true },
  ]);
  assert.equal(body.hasChanges, true);
  const dashboard = await call(github, "GET", "/api/sites");
  assert.equal(dashboard.body.find((site) => site.slug === "_example").hasChanges, true);
});

test("writes outside sites/<slug>/content are rejected", async () => {
  const github = sampleRepository();
  const attempts = [
    "/api/sites/stuart/pages/..%2F..%2Fpackages%2Ftemplate%2Findex.md",
    "/api/sites/stuart/pages/..%2Fsite.config.json",
    "/api/sites/stuart/pages/..%2F..%2F_example%2Fcontent%2Findex.md",
    "/api/sites/stuart/pages/../site.config.md",
    "/api/sites/stuart/pages/index.astro",
    "/api/sites/stuart/pages/.hidden.md",
    "/api/sites/..%2Fpackages/pages/index.md",
    "/api/sites/STUART/pages/index.md",
  ];
  for (const path of attempts) {
    const response = await call(github, "PUT", path, { body: { content: "x" } });
    assert.ok([400, 404].includes(response.status), `${path} answered ${response.status}`);
  }
  assert.equal(github.branches.has("draft/stuart"), false, "no draft was created by a rejected write");
  assert.equal(github.branches.get("main").files["packages/template/index.astro"], "template");
});

test("pageFile only ever resolves inside the site's content folder", () => {
  assert.equal(pageFile("stuart", "index.md"), "sites/stuart/content/index.md");
  assert.equal(pageFile("_example", "es/index.md"), "sites/_example/content/es/index.md");
  for (const bad of [
    "../site.config.json",
    "../../x.md",
    "a/../../b.md",
    "/etc/x.md",
    "index.MD",
    "x.md/",
    "",
    "a//b.md",
  ]) {
    assert.throws(() => pageFile("stuart", bad), `${JSON.stringify(bad)} should be rejected`);
  }
  for (const badSlug of ["../x", "Stuart", "stuart/other", "", "-x"]) {
    assert.throws(() => pageFile(badSlug, "index.md"), `slug ${JSON.stringify(badSlug)} should be rejected`);
  }
});

test("saving a page that does not exist is refused, not created", async () => {
  const response = await call(sampleRepository(), "PUT", "/api/sites/stuart/pages/new-page.md", {
    body: { content: "x" },
  });
  assert.equal(response.status, 404);
});

test("a stale sha answers 409 in plain language", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: page("First") } });
  const realFetch = github.fetch;
  github.fetch = async (input, init = {}) => {
    if (init.method === "PUT") return new Response("{}", { status: 409 });
    return realFetch(input, init);
  };
  const response = await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: page("Second") },
  });
  assert.equal(response.status, 409);
  assert.match(response.body.error, /changed while you were editing/);
});

test("a draft branch whose pull request was closed gets a new one on the next save", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: page("One") } });
  github.pulls[0].state = "closed";
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", { body: { content: page("Two") } });
  assert.equal(github.pulls.filter((pull) => pull.state === "open").length, 1);
});

test("discard closes the pull request and deletes the draft; discarding twice is fine", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: page("One") } });
  const first = await call(github, "DELETE", "/api/sites/stuart/draft");
  assert.equal(first.status, 200);
  assert.equal(github.pulls[0].state, "closed");
  assert.equal(github.branches.has("draft/stuart"), false);
  const second = await call(github, "DELETE", "/api/sites/stuart/draft");
  assert.equal(second.status, 200);
  const { body } = await call(github, "GET", "/api/sites/stuart/pages/index.md");
  assert.equal(body.inDraft, false);
});

test("unexpected GitHub failures do not leak details", async () => {
  const github = sampleRepository();
  github.fetch = async () => new Response("secret internal detail", { status: 500 });
  const response = await call(github, "GET", "/api/sites");
  assert.equal(response.status, 502);
  assert.doesNotMatch(response.body.error, /secret/);
});

test("a token saved with a trailing newline or spaces still works", async () => {
  const seen = [];
  const { GitHub } = await import("../src/github.js");
  const github = new GitHub({ ...env, GITHUB_TOKEN: "  ghp_example\n" }, async (url, init) => {
    seen.push(init.headers.authorization);
    return Response.json({ ok: true });
  });
  await github.request("/rate_limit");
  assert.deepEqual(seen, ["Bearer ghp_example"]);
});

test("a missing token fails with a clear message instead of calling GitHub", async () => {
  const { GitHub } = await import("../src/github.js");
  let called = false;
  const github = new GitHub({ ...env, GITHUB_TOKEN: "" }, async () => {
    called = true;
    return Response.json({});
  });
  await assert.rejects(github.request("/rate_limit"), /GITHUB_TOKEN is not set/);
  assert.equal(called, false);
});

test("the platform fetch is never called with the GitHub client as `this`", async () => {
  // Mimics Workers: fetch throws "Illegal invocation" when called with a foreign `this`.
  const { GitHub } = await import("../src/github.js");
  const strictFetch = function (url, init) {
    if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
    return Promise.resolve(Response.json({ ok: true }));
  };
  const github = new GitHub(env, strictFetch);
  assert.deepEqual(await github.request("/rate_limit"), { ok: true });
});

test("saving a page with a loose line in its header answers 400 and writes nothing", async () => {
  const github = sampleRepository();
  // Seed the page with a valid header through a normal save first.
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: '---\ntitle: "Home"\npageType: home\n---\nBody' },
  });
  const writes = () => github.calls.filter((c) => c.method === "PUT").length;
  const writesBefore = writes();
  const response = await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: '---\ntitle: "Home"\npageType: home\nPrueba Estudio\n---\nBody' },
  });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Prueba Estudio/);
  assert.equal(writes(), writesBefore, "no commit for an invalid header");
});

test("the editor reads a page as fields and saves it back through them", async () => {
  const github = sampleRepository();
  const opened = await call(github, "GET", "/api/sites/stuart/pages/flood.md");
  assert.deepEqual(opened.body.fields, {
    title: "Flood", description: "", navLabel: "", showInNav: true, pageType: "content",
  });
  assert.equal(opened.body.route, "/flood/");
  const fields = { ...opened.body.fields, title: "Flood insurance", pageType: "coverage" };
  const saved = await call(github, "PUT", "/api/sites/stuart/pages/flood.md", {
    body: { fields, body: "New flood copy" },
  });
  assert.equal(saved.status, 200);
  const text = github.branches.get("draft/stuart").files["sites/stuart/content/flood.md"];
  assert.equal(text, '---\ntitle: "Flood insurance"\npageType: coverage\n---\nNew flood copy');
});

test("saving fields without edits reports no changes", async () => {
  const github = sampleRepository();
  const opened = await call(github, "GET", "/api/sites/stuart/pages/index.md");
  // The fixture has no pageType; the editor sends what it shows, which adds it: that is a change.
  const text = '---\ntitle: Home\npageType: home\n---\nHello';
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: text } });
  const again = await call(github, "GET", "/api/sites/stuart/pages/index.md");
  const saved = await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { fields: again.body.fields, body: again.body.body },
  });
  assert.deepEqual(saved.body, { saved: false });
  assert.equal(opened.status, 200);
});

test("a new page is created in the draft from its title, with its header and a starter text", async () => {
  const github = sampleRepository();
  const created = await call(github, "POST", "/api/sites/stuart/pages", {
    body: { fields: { title: "Wind & Hurricane Coverage!", pageType: "coverage", navLabel: "Wind" } },
  });
  assert.equal(created.status, 200);
  assert.deepEqual(created.body, {
    created: true, path: "wind-hurricane-coverage.md", route: "/wind-hurricane-coverage/",
  });
  const text = github.branches.get("draft/stuart").files["sites/stuart/content/wind-hurricane-coverage.md"];
  assert.equal(
    text,
    '---\ntitle: "Wind & Hurricane Coverage!"\nnavLabel: "Wind"\npageType: coverage\n---\n\nWrite the page text here.',
  );
  assert.equal(github.pulls.length, 1, "the new page lives in the site's one draft");
  assert.equal(github.branches.get("main").files["sites/stuart/content/wind-hurricane-coverage.md"], undefined);
});

test("creating a page whose address already exists is refused in plain words", async () => {
  const response = await call(sampleRepository(), "POST", "/api/sites/stuart/pages", {
    body: { fields: { title: "Flood", pageType: "content" } },
  });
  assert.equal(response.status, 409);
  assert.match(response.body.error, /\/flood\/ already exists/);
});

test("a new page can't be a home page, and needs a title", async () => {
  const github = sampleRepository();
  const home = await call(github, "POST", "/api/sites/stuart/pages", {
    body: { fields: { title: "Another home", pageType: "home" } },
  });
  assert.equal(home.status, 400);
  const empty = await call(github, "POST", "/api/sites/stuart/pages", {
    body: { fields: { title: " !! ", pageType: "content" } },
  });
  assert.equal(empty.status, 400);
  assert.equal(github.branches.has("draft/stuart"), false, "nothing is written for a refused page");
});

test("deleting a page removes it in the draft only; the site view keeps it, marked, until restored", async () => {
  const github = sampleRepository();
  const deleted = await call(github, "DELETE", "/api/sites/stuart/pages/flood.md");
  assert.deepEqual(deleted.body, { deleted: true });
  assert.equal(github.branches.get("draft/stuart").files["sites/stuart/content/flood.md"], undefined);
  const original = "---\ntitle: Flood\n---\nFlood copy";
  assert.equal(github.branches.get("main").files["sites/stuart/content/flood.md"], original);

  const site = await call(github, "GET", "/api/sites/stuart");
  const row = site.body.pages.find((page) => page.path === "flood.md");
  assert.equal(row.deleted, true);

  const restored = await call(github, "POST", "/api/sites/stuart/restore", { body: { path: "flood.md" } });
  assert.deepEqual(restored.body, { restored: true });
  assert.equal(github.branches.get("draft/stuart").files["sites/stuart/content/flood.md"], original);
  const after = await call(github, "GET", "/api/sites/stuart");
  assert.equal(after.body.pages.find((page) => page.path === "flood.md").deleted, undefined);
});

test("the home page and the contact page can't be deleted", async () => {
  const github = sampleRepository();
  for (const page of ["index.md", "contact.md"]) {
    const response = await call(github, "DELETE", `/api/sites/stuart/pages/${page}`);
    assert.equal(response.status, 400);
    assert.match(response.body.error, /can't be deleted/);
  }
  assert.equal(github.branches.has("draft/stuart"), false);
});

test("before deleting, Studio lists the pages that link to it", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: page("See [flood](/flood/) and [again](/flood).") },
  });
  const links = await call(github, "GET", "/api/sites/stuart/links?page=flood.md");
  assert.deepEqual(links.body, { route: "/flood/", linkedFrom: ["index.md"] });
});


// A real 1x1 PNG, so the round trip proves bytes survive untouched.
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

test("an uploaded image lands in the site's public/images in the draft and can be read back", async () => {
  const github = sampleRepository();
  const uploaded = await call(github, "POST", "/api/sites/stuart/images", {
    body: { name: "Roof Photo (1).PNG", data: `data:image/png;base64,${PNG}` },
  });
  assert.deepEqual(uploaded.body, { name: "roof-photo-1.png", url: "/images/roof-photo-1.png" });
  const stored = github.branches.get("draft/stuart").files["sites/stuart/public/images/roof-photo-1.png"];
  assert.equal(Buffer.compare(stored, Buffer.from(PNG, "base64")), 0);
  assert.equal(github.branches.get("main").files["sites/stuart/public/images/roof-photo-1.png"], undefined);

  const list = await call(github, "GET", "/api/sites/stuart/images");
  assert.deepEqual(list.body, [{ name: "roof-photo-1.png", url: "/images/roof-photo-1.png" }]);

  resetLiveCache();
  const handle = createHandler(github.fetch, undefined, offline);
  const image = await handle(new Request("https://studio.test/api/sites/stuart/images/roof-photo-1.png"), env, pavel);
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.equal(Buffer.compare(Buffer.from(await image.arrayBuffer()), Buffer.from(PNG, "base64")), 0);
});

test("a second image with the same name gets a new name instead of overwriting", async () => {
  const github = sampleRepository();
  await call(github, "POST", "/api/sites/stuart/images", { body: { name: "roof.png", data: PNG } });
  const second = await call(github, "POST", "/api/sites/stuart/images", { body: { name: "roof.png", data: PNG } });
  assert.equal(second.body.name, "roof-2.png");
});

test("only web image formats under 5 MB are accepted, and never outside the site", async () => {
  const github = sampleRepository();
  for (const name of ["logo.svg", "script.js", "noextension"]) {
    const response = await call(github, "POST", "/api/sites/stuart/images", { body: { name, data: PNG } });
    assert.equal(response.status, 400, name);
  }
  const big = "A".repeat(7 * 1024 * 1024);
  const tooBig = await call(github, "POST", "/api/sites/stuart/images", { body: { name: "big.jpg", data: big } });
  assert.match(tooBig.body.error, /larger than 5 MB/);
  const escape = await call(github, "GET", "/api/sites/stuart/images/..%2F..%2Fsite.config.json");
  assert.equal(escape.status, 400);
  assert.equal(github.branches.has("draft/stuart"), false);
});
