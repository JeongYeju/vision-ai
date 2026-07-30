import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("공개용 코드베이스에 핵심 화면과 자산이 포함된다", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    access(new URL("public/seoul-plant.jpg", root)),
  ]);

  assert.match(page, /우리 셋이/);
  assert.match(page, /미래 A/);
  assert.match(page, /성북구 처마 포식 덩굴/);
  assert.match(layout, /서울 2070: 두 개의 미래/);
  assert.match(packageJson, /"private": false/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|drizzle/);
});
