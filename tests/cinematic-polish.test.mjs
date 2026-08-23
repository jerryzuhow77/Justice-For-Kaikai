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
  assert.match(app, /className = `copy-scene-item \$\{scene\.type\}`/);
  assert.match(app, /item\.append\(createLibraryTranscript\(scene\)\)/);
  assert.match(app, /完整對話紀錄/);
});

test("sets the opening proverb as four lines and varies article emphasis", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const story = await readFile(new URL("story.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  assert.match(story, /<strong>花有重開日，<\/strong><br \/>\s*<strong>人無再少年。<\/strong><br \/>\s*<strong>應須惜兒孫，<\/strong><br \/>\s*<strong>安樂是天倫。<\/strong>/);
  assert.match(html, /<h1 class="gate-quatrain" id="gate-title"><span>花有重開日，<\/span><span>人無再少年。<\/span><span>應須惜兒孫，<\/span><span>安樂是天倫。<\/span><\/h1>/);
  assert.match(app, /story-data-line/);
  assert.match(app, /story-question/);
  assert.match(app, /story-contrast/);
  assert.equal((css.match(/h4\[data-chapter-number="\d{2}"\]/g) ?? []).length, 8);
  assert.match(css, /blockquote\.opening-quatrain/);
});

test("ships ten theatre scores and one consent-based site background track", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  assert.match(html, /id="cinema-audio"/);
  assert.match(html, /id="toggle-music"/);
  assert.match(html, /id="score-library-audio"/);
  assert.match(html, /id="ambient-audio"/);
  assert.match(html, /id="gate-music"[^>]*checked/);
  assert.equal((html.match(/data-score="\d{2}"/g) ?? []).length, 10);
  assert.match(app, /const SCORE_TRACKS/);
  assert.match(app, /chapter-00\.m4a/);
  assert.match(app, /chapter-09\.m4a/);
  assert.match(app, /site-background\.m4a/);
  assert.match(app, /public\/media\/chapter-\$\{chapter\}\.m4a/);
  assert.match(app, /scene\.type !== "shadow" && scene\.type !== "side"/);
  assert.match(app, /playSceneAudio\(\)/);
  assert.match(app, /function selectLibraryScore/);
  assert.match(app, /function toggleAmbient/);
});

test("applies optical one-to-one actor calibration and dialogue hierarchy", async () => {
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  assert.match(app, /function actorOpticalScale/);
  assert.match(app, /ACTOR_ASSET_BOUNDS/);
  assert.match(app, /projectedVisibleHeight/);
  assert.match(app, /const sharedScale = \(pose\.f\[3\] \+ pose\.m\[3\]\) \/ 2/);
  assert.match(app, /function enhanceStoryTypography/);
  assert.match(css, /dialogue-box\[data-speaker-tone="female"\]/);
  assert.match(css, /\.story-dialogue\.dialogue-male/);
});

test("synchronizes four act names and repairs single film cards and the dark first cover", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const registry = await readFile(new URL("assets/data/scenes.js", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  for (const title of ["土掩埋不住的清朝民間傳說", "無法再相見▪︎天涯各自分", "青絲變白髮", "兩個朝代▪︎不同世界▪︎同一扇門"]) {
    assert.match(registry, new RegExp(title));
  }
  assert.match(app, /grid\.classList\.toggle\("is-single", validScenes\.length === 1\)/);
  assert.match(html, /assets\/data\/scenes\.js\?v=20260823-scene2/);
  assert.match(css, /\.copy-scene-grid\.is-single/);
  assert.match(css, /data-scene-id="FM-A"/);
});

test("layers GSAP motion across the gate, seals, score cards, copy, and cinema", async () => {
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  for (const token of ["function playGateIntro", "function playPageIntro", "function animateCinemaEntrance", "function animateTranscriptOpen", "revealBatch", ".minnan-seal-field img", ".score-track-grid button", "storyHighlights"]) {
    assert.match(app, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(css, /perspective: 1100px/);
  assert.match(css, /html\.has-gsap \.gate-film-image/);
});
