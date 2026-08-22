import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships twelve translucent Minnan seals as decorative backgrounds", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  assert.equal((html.match(/assets\/img\/badges\/minnan-\d{2}\.webp/g) ?? []).length, 12);
  assert.match(html, /class="minnan-seal-field" aria-hidden="true"/);
  assert.match(css, /\.minnan-seal-field img/);
  assert.match(css, /clip-path: circle/);
  assert.match(css, /--seal-opacity: \.4/);
});

test("keeps transcripts vertically collapsible and screen-reader labelled", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  assert.match(html, /<details class="transcript" id="transcript">/);
  assert.match(html, /aria-controls="transcript"/);
  assert.match(app, /transcript\.open = !transcript\.open/);
  assert.match(app, /className = "transcript-scene"/);
  assert.match(app, /className = "library-transcript"/);
  assert.match(app, /className = "story-transcript"/);
  assert.match(app, /\$\$\("\.dialogue-list", target\)/);
  assert.match(app, /完整對話紀錄/);
});

test("restores six original scores to shadow and side theatre playback", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  assert.match(html, /id="cinema-audio"/);
  assert.match(html, /id="toggle-music"/);
  assert.match(html, /id="score-library-audio"/);
  assert.equal((html.match(/data-score="\d{2}"/g) ?? []).length, 6);
  assert.match(app, /const SCORE_TRACKS/);
  assert.match(app, /public\/media\/chapter-\$\{chapter\}\.m4a/);
  assert.match(app, /scene\.type !== "shadow" && scene\.type !== "side"/);
  assert.match(app, /playSceneAudio\(\)/);
  assert.match(app, /function selectLibraryScore/);
});

test("applies optical one-to-one actor calibration and dialogue hierarchy", async () => {
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  assert.match(app, /function actorOpticalScale/);
  assert.match(app, /const sharedScale = \(pose\.f\[3\] \+ pose\.m\[3\]\) \/ 2/);
  assert.match(app, /function enhanceStoryTypography/);
  assert.match(css, /dialogue-box\[data-speaker-tone="female"\]/);
  assert.match(css, /\.story-dialogue\.dialogue-male/);
});
