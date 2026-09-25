import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { validateColumns } from "../packages/template/src/lib/remark-columns.mjs";

const repositoryRoot = process.cwd();
const invalidFixture = resolve(repositoryRoot, "sites/_example/content/columns-invalid-fixture.md");

test("an unclosed columns block fails the site build with its file and line", () => {
  writeFileSync(invalidFixture, `---\ntitle: Invalid columns fixture\npageType: content\nshowInNav: false\n---\n\n:::columns\nThis block never closes.\n`);
  try {
    assert.throws(() => {
      execFileSync(process.execPath, ["scripts/build-site.mjs", "_example"], {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: "pipe"
      });
    }, (error) => {
      const output = `${error.stdout}\n${error.stderr}`;
      return error.status !== 0 && output.includes("columns-invalid-fixture.md:7:");
    });
  } finally {
    rmSync(invalidFixture, { force: true });
  }
});

test("ignores markers in fenced code and accepts trailing marker spaces", () => {
  assert.doesNotThrow(() => validateColumns(`\`\`\`md\n:::columns\n:::next\n:::\n\`\`\`\n\n:::columns   \nOne\n:::next  \nTwo\n:::   \n`, "fixture.md"));
});
