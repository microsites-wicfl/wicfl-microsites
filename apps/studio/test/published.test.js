import assert from "node:assert/strict";
import test from "node:test";
import { createHandler } from "../src/index.js";
import { resetLiveCache } from "../src/live.js";
import { env, offline, pavel, sampleRepository } from "./fake-github.js";

const withHost = { ...env, PUBLISHED_SITES_HOST: "wicfl-microsites.workers.dev" };

async function call(github, method, path, body, useEnv = withHost) {
  resetLiveCache();
  const handle = createHandler(github.fetch, undefined, offline);
  const request = new Request(`https://studio.test${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const response = await handle(request, useEnv, pavel);
  return { status: response.status, body: await response.json() };
}

test("a site on main links to its published version", async () => {
  const site = await call(sampleRepository(), "GET", "/api/sites/stuart");
  assert.equal(site.status, 200);
  assert.equal(site.body.live, false);
  assert.equal(site.body.publishedUrl, "https://wicfl-stuart-published.wicfl-microsites.workers.dev/");
});

test("practice sites link to their published version too", async () => {
  const site = await call(sampleRepository(), "GET", "/api/sites/_example");
  assert.equal(site.body.publishedUrl, "https://wicfl-_example-published.wicfl-microsites.workers.dev/");
});

test("without the host setting there is no published link", async () => {
  const site = await call(sampleRepository(), "GET", "/api/sites/stuart", undefined, env);
  assert.equal(site.body.publishedUrl, null);
});
