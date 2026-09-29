import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import remarkColumns, { validateColumns } from "../packages/template/src/lib/remark-columns.mjs";

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

test("turns a paragraph containing only a bold link into a themed button, including in columns", () => {
  const plugin = remarkColumns();
  const tree = { type: "root", children: [{ type: "paragraph", children: [{ type: "strong", children: [{ type: "link", url: "/contact/", children: [{ type: "text", value: "Get a quote" }] }] }] }] };
  plugin(tree, { value: "**[Get a quote](/contact/)**", path: "button.md" });
  assert.deepEqual(tree.children[0].data.hProperties.className, ["button-link-wrap"]);
  assert.deepEqual(tree.children[0].children[0].children[0].data.hProperties.className, ["button-link"]);

  const columnsTree = { type: "root", children: [] };
  plugin(columnsTree, { value: ":::columns\n**[One](/one/)**\n:::next\nText\n:::", path: "columns-button.md" });
  const buttonParagraph = columnsTree.children.find((node) => node.type === "paragraph");
  assert.deepEqual(buttonParagraph.data.hProperties.className, ["button-link-wrap"]);
});
