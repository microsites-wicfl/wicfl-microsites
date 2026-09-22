import assert from "node:assert/strict";
import test from "node:test";
import { createHandler } from "../src/index.js";
import { env, pavel, sampleRepository } from "./fake-github.js";

async function preview(github) {
  const handle = createHandler(github.fetch);
  const response = await handle(new Request("https://studio.test/api/sites/stuart"), env, pavel);
  return (await response.json()).preview;
}

async function withDraft() {
  const github = sampleRepository();
  const handle = createHandler(github.fetch);
  await handle(
    new Request("https://studio.test/api/sites/stuart/pages/index.md", {
      method: "PUT",
      body: JSON.stringify({ content: "Changed" }),
    }),
    env,
    pavel,
  );
  return github;
}

const url = "https://wicfl-pr1-stuart.wicfl-microsites.workers.dev";
const comment = `<!-- wicfl-preview:stuart -->\n**Preview for \`stuart\`:** ${url}\n\n_Updates automatically._`;

test("no draft: preview state is none", async () => {
  assert.deepEqual(await preview(sampleRepository()), { state: "none" });
});

test("draft without comment yet: preparing", async () => {
  assert.equal((await preview(await withDraft())).state, "preparing");
});

test("comment present and Preview check green: ready with the URL from the comment", async () => {
  const github = await withDraft();
  github.addComment(1, comment);
  github.setCheckRuns(github.headOf("draft/stuart"), [
    { name: "Build stuart", status: "completed", conclusion: "success" },
    { name: "Preview stuart", status: "completed", conclusion: "success" },
  ]);
  assert.deepEqual(await preview(github), { state: "ready", url });
});

test("a failed check on the latest commit: failed, with the reason in one line", async () => {
  const github = await withDraft();
  github.addComment(1, comment);
  github.setCheckRuns(github.headOf("draft/stuart"), [
    { name: "Validate all site configurations", status: "completed", conclusion: "failure" },
    { name: "Preview stuart", status: "queued", conclusion: null },
  ]);
  assert.deepEqual(await preview(github), {
    state: "failed",
    reason: "Validate all site configurations: failure",
    url,
  });
});

test("new commit still building: preparing, keeping the previous URL reachable", async () => {
  const github = await withDraft();
  github.addComment(1, comment);
  github.setCheckRuns(github.headOf("draft/stuart"), [
    { name: "Preview stuart", status: "in_progress", conclusion: null },
  ]);
  assert.deepEqual(await preview(github), { state: "preparing", url });
});

test("a failing check unrelated to the site (Studio's own tests) does not mark the preview failed", async () => {
  const github = await withDraft();
  github.addComment(1, comment);
  github.setCheckRuns(github.headOf("draft/stuart"), [
    { name: "Test WICFL Studio", status: "completed", conclusion: "failure" },
    { name: "Build stuart", status: "completed", conclusion: "success" },
    { name: "Preview stuart", status: "completed", conclusion: "success" },
  ]);
  assert.deepEqual(await preview(github), { state: "ready", url });
});

test("a failing check for another site does not mark this site's preview failed", async () => {
  const github = await withDraft();
  github.addComment(1, comment);
  github.setCheckRuns(github.headOf("draft/stuart"), [
    { name: "Build _example", status: "completed", conclusion: "failure" },
    { name: "Preview stuart", status: "completed", conclusion: "success" },
  ]);
  assert.deepEqual(await preview(github), { state: "ready", url });
});

