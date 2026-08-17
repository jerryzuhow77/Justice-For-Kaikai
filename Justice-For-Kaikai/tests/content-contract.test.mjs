import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("scene manifest has one official ten-scene sequence", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/data/scene-manifest.json", root), "utf8"));
  assert.equal(manifest.release, "V6.0.2");
  assert.equal(manifest.canonical_project_url, "https://github.com/jerryzuhow77/Justice-For-Kaikai");
  assert.deepEqual(manifest.sequence.map((scene) => scene.scene_id), [
    "S00-PROLOGUE", "S01-CHAIR", "S02-HANDOVER", "S03-SIGNALS", "S04-EMERGENCY",
    "S05-AMENDMENT", "S06-PEIPEI", "S07-SEAMS", "S08-GRANDMOTHER", "S09-NEXT-DOOR",
  ]);
});

test("all four locales include eight chapters and stable dialogue ids", async () => {
  for (const locale of ["zh-Hant", "zh-Hans", "en", "ja"]) {
    const copy = await readFile(new URL(`public/content/${locale}.md`, root), "utf8");
    assert.equal((copy.match(/^#{2,4}\s+0[1-8]\s*[｜|]/gm) ?? []).length, 8, locale);
    assert.match(copy, /S01-L01/);
    assert.match(copy, /S08-L05/);
  }
});

test("six original music masters and six web audio files exist", async () => {
  for (const id of ["1000025837", "1000025838", "1000025840", "1000025841", "1000025842", "1000025843"]) {
    await access(new URL(`public/media/${id}.mp4`, root));
  }
  for (let index = 1; index <= 6; index += 1) {
    await access(new URL(`public/media/chapter-0${index}.m4a`, root));
  }
});

test("sensitive reconstructions keep permanent source boundaries", async () => {
  const copy = await readFile(new URL("public/content/zh-Hant.md", root), "utf8");
  assert.match(copy, /未具名讀者來函／情境重構｜非病歷、非錄音、非法院認定/);
  assert.match(copy, /家屬庭上陳述｜具名庭審報導可支持的間接引述/);
});
