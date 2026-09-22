import assert from "node:assert/strict";
import test from "node:test";
import { createHandler } from "../src/index.js";
import { pageFile } from "../src/paths.js";
import { env, pavel, sampleRepository } from "./fake-github.js";

function call(github, method, path, { body, ctx = pavel, environment = env } = {}) {
  const handle = createHandler(github.fetch);
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
  const handle = createHandler(sampleRepository().fetch);
  const response = await handle(new Request("https://studio.test/"), env, {});
  assert.equal(await response.text(), "asset");
});

test("dashboard lists sites with published and test flags, sorted", async () => {
  const { status, body } = await call(sampleRepository(), "GET", "/api/sites");
  assert.equal(status, 200);
  assert.deepEqual(
    body.map((site) => [site.slug, site.brandName, site.published, site.isTest, site.hasChanges]),
    [
      ["_example", "Example", false, true, false],
      ["stuart", "Stuart Homes", true, false, false],
    ],
  );
});

test("first save creates the draft from main and opens one pull request", async () => {
  const github = sampleRepository();
  const response = await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: "New home" },
  });
  assert.equal(response.status, 200);
  assert.equal(github.branches.get("draft/stuart").files["sites/stuart/content/index.md"], "New home");
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
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: "One" } });
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", { body: { content: "Two" } });
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
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: "Saved text" } });
  const { body } = await call(github, "GET", "/api/sites/stuart/pages/index.md");
  assert.equal(body.text, "Saved text");
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
    { path: "es/index.md", edited: true },
    { path: "index.md", edited: false },
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
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: "First" } });
  const realFetch = github.fetch;
  github.fetch = async (input, init = {}) => {
    if (init.method === "PUT") return new Response("{}", { status: 409 });
    return realFetch(input, init);
  };
  const response = await call(github, "PUT", "/api/sites/stuart/pages/index.md", {
    body: { content: "Second" },
  });
  assert.equal(response.status, 409);
  assert.match(response.body.error, /cambió mientras la editabas/);
});

test("a draft branch whose pull request was closed gets a new one on the next save", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: "One" } });
  github.pulls[0].state = "closed";
  await call(github, "PUT", "/api/sites/stuart/pages/flood.md", { body: { content: "Two" } });
  assert.equal(github.pulls.filter((pull) => pull.state === "open").length, 1);
});

test("discard closes the pull request and deletes the draft; discarding twice is fine", async () => {
  const github = sampleRepository();
  await call(github, "PUT", "/api/sites/stuart/pages/index.md", { body: { content: "One" } });
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
