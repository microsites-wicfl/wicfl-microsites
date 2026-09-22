import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Pavel never sees version-control vocabulary. This scans every file the browser receives,
// code included, so the rule cannot drift as the interface grows.
const forbidden = [
  "pull request",
  "PR",
  "branch",
  "rama",
  "merge",
  "commit",
  "GitHub",
  "repositorio",
  "push",
];
const publicDir = join(import.meta.dirname, "..", "public");

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test("the interface never shows version-control vocabulary", () => {
  for (const file of files(publicDir)) {
    const body = readFileSync(file, "utf8");
    for (const word of forbidden) {
      const pattern = new RegExp(`\\b${word.replace(" ", "\\s+")}\\b`, "i");
      assert.equal(pattern.test(body), false, `${file} contains "${word}"`);
    }
  }
});

test("the interface loads nothing from other hosts", () => {
  for (const file of files(publicDir)) {
    const body = readFileSync(file, "utf8");
    const external = body.match(/(src|href)=["']https?:\/\//);
    assert.equal(external, null, `${file} loads an external resource`);
  }
});

test("no hand-minified source: every line fits in 120 characters", () => {
  const roots = [publicDir, join(import.meta.dirname, "..", "src"), import.meta.dirname];
  for (const file of roots.flatMap(files).filter((path) => /\.(js|css|html)$/.test(path))) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) =>
        assert.ok(line.length <= 120, `${file}:${index + 1} has ${line.length} characters`),
      );
  }
});
