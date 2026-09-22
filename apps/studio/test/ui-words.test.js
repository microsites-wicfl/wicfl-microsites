import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
test("la interfaz no expone vocabulario técnico prohibido", () => {
  for (const name of readdirSync(join(import.meta.dirname, "..", "public"))) {
    const body = readFileSync(join(import.meta.dirname, "..", "public", name), "utf8");
    for (const word of forbidden)
      assert.equal(
        new RegExp(`\\b${word.replace(" ", "\\s+")}\\b`, "i").test(body),
        false,
        `${name} contiene ${word}`,
      );
  }
});
