import assert from "node:assert/strict";
import test from "node:test";
import { MAX_SIDE, shouldRedraw, targetSize } from "../public/resize.js";

test("big photos shrink to the longest side, keeping their shape", () => {
  assert.deepEqual(targetSize(4032, 3024), { width: MAX_SIDE, height: 1500, scaled: true });
  assert.deepEqual(targetSize(3024, 4032), { width: 1500, height: MAX_SIDE, scaled: true });
});

test("images that already fit keep their size", () => {
  assert.deepEqual(targetSize(1200, 800), { width: 1200, height: 800, scaled: false });
  assert.deepEqual(targetSize(MAX_SIDE, 10), { width: MAX_SIDE, height: 10, scaled: false });
});

test("JPEGs are always redrawn; PNG and WebP only when too big; GIFs never", () => {
  assert.equal(shouldRedraw("image/jpeg", 800, 600), true);
  assert.equal(shouldRedraw("image/png", 800, 600), false);
  assert.equal(shouldRedraw("image/png", 3000, 600), true);
  assert.equal(shouldRedraw("image/webp", 2500, 2500), true);
  assert.equal(shouldRedraw("image/gif", 4000, 4000), false);
});
