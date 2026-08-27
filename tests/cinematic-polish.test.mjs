import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("removes the duplicate scene-library block while keeping chapter theatres", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  assert.doesNotMatch(html, /id="scene-library"/);
  assert.doesNotMatch(html, /SCENE LIBRARY · 場景資料庫/);
  assert.doesNotMatch(html, /href="#scene-library"/);
  assert.match(html, /皮影與陰翳側視已分散至各篇章節/);
  assert.match(app, /className = `copy-scene-item \$\{scene\.type\}`/);
  assert.match(app, /\$\$\("h2, h3, h4, h5", target\)/);
  for (const sceneId of ["SP00", "DV00", "FM-A", "FM-D", "FM-B", "SP09", "DV09", "FM-C"]) {
    assert.match(app, new RegExp(`"${sceneId}"`));
  }
  assert.doesNotMatch(app, /renderSceneLibrary/);
});

test("exposes the canonical 24-animation map without public production codes", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/official-home-v2.css", root), "utf8");
  const reader = await readFile(new URL("assets/js/story-reader.js", root), "utf8");

  assert.match(html, /id="animation-catalog"/);
  assert.match(html, /4部主線電影（各5幕）＋10場皮影詩劇＋10場陰翳側視劇場/);
  assert.equal((html.match(/data-catalog-view=/g) ?? []).length, 3);
  assert.match(html, /id="animation-progress-label"/);
  assert.match(html, /id="resume-animation"/);
  assert.match(html, /id="prev-story"/);
  assert.match(html, /id="next-story"/);
  assert.match(html, /id="return-animation-map"/);
  assert.match(html, /id="continue-reading"/);
  assert.match(html, /id="toggle-more-controls"/);
  assert.doesNotMatch(html, /FILM A · D · B · C/);
  assert.match(app, /window\.KAIKAI_SCENE_ORDER \|\| fallbackStoryOrder/);
  assert.match(app, /function publicSceneNumber/);
  assert.match(app, /function renderAnimationCatalog/);
  assert.match(app, /function completeCurrentPlayback/);
  assert.match(app, /url\.searchParams\.set\("animation", publicSceneNumber/);
  assert.match(app, /new IntersectionObserver/);
  assert.match(app, /data-src="\$\{shot\.src\}"/);
  assert.doesNotMatch(app, /<img src="\$\{shot\.src\}"[^>]*loading="eager"/);
  assert.doesNotMatch(app, /fromTo\("\.cinema-control-dock", \{ autoAlpha: 0 \}/);
  assert.match(reader, /const publicLabel = publicIndex >= 0/);
  assert.match(css, /\.animation-card-grid/);
  assert.match(css, /\.cinema-control-dock\.is-expanded \.cinema-secondary-controls/);
  assert.match(css, /--scene-mobile-focus/);
});

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

test("ships ten theatre scores and two consent-based alternating background tracks", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  assert.match(html, /id="cinema-audio"/);
  assert.match(html, /id="toggle-music"/);
  assert.match(html, /id="score-library-audio"/);
  assert.match(html, /id="ambient-audio"/);
  assert.doesNotMatch(html, /id="ambient-audio"[^>]*\bloop\b/);
  assert.match(html, /id="gate-music"[^>]*checked/);
  assert.equal((html.match(/data-score="\d{2}"/g) ?? []).length, 10);
  assert.match(app, /const SCORE_TRACKS/);
  assert.match(app, /chapter-00\.m4a/);
  assert.match(app, /chapter-09\.m4a/);
  assert.match(app, /prologue-chair-maiden\.m4a/);
  assert.match(app, /site-background\.m4a/);
  assert.match(app, /const AMBIENT_TRACKS = \[PROLOGUE_BACKGROUND_TRACK, SITE_BACKGROUND_TRACK\]/);
  assert.match(app, /function advanceAmbientTrack/);
  assert.match(app, /addEventListener\("ended", advanceAmbientTrack\)/);
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
  assert.match(html, /assets\/data\/scenes\.js\?v=20260825-fm123-event-motion-3/);
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

test("keeps the prologue skip control immediately visible and mobile-safe", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const loader = await readFile(new URL("assets/js/cinematic-revamp.js", root), "utf8");
  const prologue = await readFile(new URL("assets/js/chair-prologue-refined.js", root), "utf8");
  const refinedCss = await readFile(new URL("assets/css/chair-prologue-refined.css", root), "utf8");
  const mobileCss = await readFile(new URL("assets/css/chair-prologue-mobile-v2.css", root), "utf8");

  assert.match(prologue, /class="kkp6__skip"[^>]*>略過序幕<\/button>/);
  assert.match(prologue, /skip\.addEventListener\("click",finish\)/);
  assert.doesNotMatch(prologue, /\.from\("\.kkp6__skip",\{autoAlpha:0/);
  assert.match(refinedCss, /\.kkp6__skip\{[^}]*opacity:1;visibility:visible/);
  assert.match(mobileCss, /\.kkp6__skip\{[^}]*top:var\(--mobile-safe-top\)!important;[^}]*bottom:auto!important/);
  assert.match(mobileCss, /\.kkp6__skip\{[^}]*opacity:1!important;[^}]*visibility:visible!important/);
  assert.match(loader, /const version="20260826-directors-cut-1"/);
  assert.match(html, /cinematic-revamp\.css\?v=20260826-directors-cut-1/);
  assert.match(html, /cinematic-revamp\.js\?v=20260826-directors-cut-1/);
  assert.match(html, /audio=20260826-skip-immediate-2/);
  assert.match(prologue, /if\(skipped\)\{settle\(true\);return\}/);
  assert.match(prologue, /duration:\.72/);
  assert.match(prologue, /status\.textContent="已略過序幕"/);
});

test("ships the director's cut, evidence-separated Chen statements, and complete player controls", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const story = await readFile(new URL("story.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/official-home-v2.css", root), "utf8");

  assert.ok(html.indexOf('id="film-reel"') < html.indexOf('id="responsibility-map"'));
  assert.match(html, /id="chen-statements"/);
  assert.match(html, /本人說法／具名報導/);
  assert.match(html, /他人發言／內部群組說法/);
  assert.match(html, /不是陳尚潔本人發言/);
  assert.match(html, /「管他死活」引語｜檢辯與證人說法分讀/);
  assert.match(html, /檢方指控／攻防中的前提/);
  assert.match(html, /辯方反駁／具名報導/);
  assert.match(html, /證人說法／依辯方所述譯文/);
  assert.match(html, /官方摘要未列引語/);
  assert.match(html, /並非本站認定的本人原話/);
  assert.match(html, /不確認陳尚潔確曾說過，也不確認檢察官故意捏造/);
  assert.match(html, /「毫無悔意」在不同報導中的發言者與程序脈絡並不一致/);
  assert.match(html, /238921/);
  assert.match(html, /court-notes-site\.vercel\.app\/sessions\/s-114-1-6/);
  assert.match(story, /id="chen-statements-text"/);
  assert.match(story, /偽造文書部分無罪/);
  assert.match(story, /公開觀庭筆記不是法院正式逐字稿/);
  assert.match(html, /class="full-copy-details"/);
  assert.match(html, /id="replay-act"/);
  assert.match(html, /id="toggle-captions"[^>]*aria-pressed="true"/);
  assert.match(app, /function adjacentUnit/);
  assert.match(app, /function replayCurrentUnit/);
  assert.match(app, /function setCaptions/);
  assert.match(app, /尚餘/);
  assert.match(app, /scene\.type === "shadow"\) return Math\.max\(6/);
  assert.match(app, /scene\.type === "side"\) return Math\.max\(4/);
  assert.match(css, /\.inline-story>\.copy-scene-group\{[\s\S]*?width:100%/);
  assert.match(css, /\.cinema-stage\.captions-hidden \.dialogue-box\{visibility:hidden!important;opacity:0!important/);
  assert.match(html, /official-home-v2\.css\?v=20260826-directors-cut-4/);
  assert.match(story, /official-home-v2\.css\?v=20260826-directors-cut-4/);
  assert.match(css, /\.quote-dispute>\.quote-dispute-boundary\{padding-right:10\.25rem\}/);
  assert.match(css, /\.story-page \.story-quote-dispute>\.quote-dispute-boundary\{[\s\S]*?color:#3f554e;[\s\S]*?background:rgba\(82,120,110,\.12\);[\s\S]*?font-size:\.875rem/);
});

test("gives the prologue an explicit mobile-safe music control", async () => {
  const prologue = await readFile(new URL("assets/js/chair-prologue-refined.js", root), "utf8");
  const mobileCss = await readFile(new URL("assets/css/chair-prologue-mobile-v2.css", root), "utf8");

  assert.match(prologue, /class="kkp6__sound"[^>]*aria-pressed="false"/);
  assert.match(prologue, /播放序幕配樂/);
  assert.match(prologue, /const PROLOGUE_SCORE="public\/media\/prologue-chair-maiden\.m4a"/);
  assert.match(prologue, /new CustomEvent\("kaikai:ambient-intent"/);
  assert.match(mobileCss, /\.kkp6__sound\{[^}]*bottom:var\(--mobile-safe-bottom\)!important/);
  assert.match(mobileCss, /\.kkp6__sound\{[^}]*min-height:44px!important/);
});

test("keeps every prologue line readable without depending on GSAP", async () => {
  const prologue = await readFile(new URL("assets/js/chair-prologue-refined.js", root), "utf8");
  const css = await readFile(new URL("assets/css/chair-prologue-refined.css", root), "utf8");

  assert.match(css, /\.kkp6\{[^}]*opacity:1;visibility:visible/);
  assert.match(css, /\.kkp6__line\{[^}]*opacity:1;visibility:visible/);
  assert.match(css, /\.kkp6__bridge\{[^}]*opacity:1;visibility:visible/);
  assert.doesNotMatch(prologue, /gsap\.set\(p,\{autoAlpha:0\}\)/);
  assert.doesNotMatch(prologue, /fromTo\(lines\[\d\],\{autoAlpha:0/);
  assert.doesNotMatch(prologue, /clipPath:"inset\(0 49% 0 49%\)"/);
});
