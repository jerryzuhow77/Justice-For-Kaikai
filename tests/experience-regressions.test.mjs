import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

function functionBlock(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  assert.notEqual(start, -1, `missing ${startToken}`);
  const end = source.indexOf(endToken, start + startToken.length);
  assert.notEqual(end, -1, `missing ${endToken}`);
  return source.slice(start, end);
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const propertyFirst = new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const contentFirst = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, "i");
  return html.match(propertyFirst)?.[1] || html.match(contentFirst)?.[1] || "";
}

function alternateHref(html, language) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => new RegExp(`\\bhreflang=["']${language}["']`, "i").test(candidate));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
}

test("keeps the prologue opt-in, session-stable, and bypassed by direct hashes", async () => {
  const [html, loader, legacy, app, css] = await Promise.all([
    read("index.html"),
    read("assets/js/cinematic-revamp.js"),
    read("assets/js/cinematic-revamp-legacy.js"),
    read("assets/js/cinematic-revamp-core.js"),
    read("assets/css/cinematic-revamp.css"),
  ]);

  assert.doesNotMatch(legacy, /sessionStorage\.removeItem\(["']kk-entered-v8["']\)/);
  assert.equal((legacy.match(/\bprologue\(\)/g) ?? []).length, 1, "legacy prologue must only be defined, never booted");
  assert.match(loader, /window\.playChairPrologue = function playChairPrologue\(\)/);
  assert.match(loader, /loadScript\(`assets\/js\/chair-prologue-refined\.js\?v=\$\{version\}`\)/);
  assert.match(loader, /loadStyle\(`assets\/css\/chair-prologue-refined\.css\?v=\$\{version\}`\)/);
  assert.match(loader, /loadStyle\(`assets\/css\/chair-prologue-mobile-v2-runtime\.css\?v=\$\{version\}`\)/);
  assert.doesNotMatch(css, /@import url\("\.\/chair-prologue-/);
  assert.doesNotMatch(loader, /(?:^|[;}]\s*)playChairPrologue\(\)/m);
  assert.match(app, /#enter-experience[\s\S]*?await window\.playChairPrologue\?\.\(\)/);
  assert.match(app, /function hasDirectHash\(\)\s*{\s*return Boolean\(window\.location\.hash && window\.location\.hash !== "#" && window\.location\.hash !== "#top"\)/);
  assert.match(app, /const gated = !hasDirectHash\(\) && !hasDirectPlayer && !hasEnteredSession\(\)/);
  assert.match(app, /function directPlayerRequest/);
  assert.match(html, /Number\.isInteger\(animation\) && animation >= 1 && animation <= 24/);
  assert.match(html, /\^\(\?:SP0\[0-9\]\|DV0\[0-9\]\|FM-\[ABCD\]\)\$/);
  assert.match(app, /function initDirectHash\(\)[\s\S]*?setPageGate\(false\);[\s\S]*?document\.getElementById\(id\)/);
  assert.match(html, /椅仔姑序幕約 12 秒，只在首次進站時提供；直接連到章節或動畫的網址不會被入口攔住/);
});

test("releases temporary prologue and player media resources", async () => {
  const [loader, app] = await Promise.all([
    read("assets/js/cinematic-revamp.js"),
    read("assets/js/cinematic-revamp-core.js"),
  ]);
  assert.match(loader, /function releaseMobileArtwork\(\)/);
  assert.match(loader, /URL\.revokeObjectURL\(window\.__chairMobileArtObjectUrl\)/);
  assert.match(loader, /delete window\.__chairMobileArtObjectUrl/);
  assert.match(loader, /finally\s*{\s*releaseMobileArtwork\(\);\s*}/);

  const release = functionBlock(app, "function releasePlayerSurface()", "function afterCinemaClose");
  assert.match(release, /cinemaAudio\.removeAttribute\("src"\)/);
  assert.match(release, /cinemaAudio\.load\(\)/);
  assert.match(release, /filmFoleyContext\.close\(\)/);
  assert.match(release, /filmFoleyContext = null/);
  assert.match(release, /filmFoleyCooldown\.clear\(\)/);
});

test("keeps language alternates reciprocal and routes x-default to the interactive entry", async () => {
  const files = ["index.html", "story.html", "story-zh-hans.html", "story-en.html", "story-ja.html"];
  const expected = {
    "zh-Hant": "https://jerryzuhow77.github.io/Justice-For-Kaikai/story.html",
    "zh-Hans": "https://jerryzuhow77.github.io/Justice-For-Kaikai/story-zh-hans.html",
    en: "https://jerryzuhow77.github.io/Justice-For-Kaikai/story-en.html",
    ja: "https://jerryzuhow77.github.io/Justice-For-Kaikai/story-ja.html",
    "x-default": "https://jerryzuhow77.github.io/Justice-For-Kaikai/",
  };
  for (const file of files) {
    const html = await read(file);
    for (const [language, href] of Object.entries(expected)) {
      assert.equal(alternateHref(html, language), href, `${file} ${language}`);
    }
  }
});

test("features exactly four films before the complete 24-animation catalog", async () => {
  const [html, app, home] = await Promise.all([
    read("index.html"),
    read("assets/js/cinematic-revamp-core.js"),
    read("assets/js/official-home-v2.js"),
  ]);
  const featured = [...html.matchAll(/data-featured-film="(FM-[ADBC])"/g)].map((match) => match[1]);
  assert.deepEqual(featured, ["FM-A", "FM-D", "FM-B", "FM-C"]);
  assert.ok(html.indexOf('class="film-act-grid featured-film-grid"') < html.indexOf('id="animation-catalog"'));
  assert.ok(home.indexOf('"#film-reel"') < home.indexOf('"#case-progress"'));

  const cardBuilder = functionBlock(app, "function createAnimationCard(scene)", "function observeCatalogPosters");
  assert.match(cardBuilder, /document\.createElement\("a"\)/);
  assert.match(cardBuilder, /button\.href = `\?animation=\$\{publicSceneNumber\(scene\)\}`/);
  assert.match(cardBuilder, /button\.dataset\.sceneId = scene\.id/);
  assert.match(cardBuilder, /production\s*\? production\.duration/);
  assert.match(cardBuilder, /formatTime\(duration\)/);
  assert.match(cardBuilder, /button\.setAttribute\("aria-label", `播放第\$\{publicSceneNumber\(scene\)\}篇，共\$\{PUBLIC_TOTAL\}篇/);
});

test("resolves CSS custom-property images from the stylesheet without duplicated asset paths", async () => {
  const [html, app] = await Promise.all([
    read("index.html"),
    read("assets/js/cinematic-revamp-core.js"),
  ]);
  const stylesheet = "https://jerryzuhow77.github.io/Justice-For-Kaikai/assets/css/cinematic-revamp-core.css";
  const featuredImages = [...html.matchAll(/--film-image:url\('([^']+)'\)/g)].map((match) => match[1]);
  assert.equal(featuredImages.length, 4);
  for (const image of featuredImages) {
    assert.match(new URL(image, stylesheet).pathname, /^\/Justice-For-Kaikai\/assets\/img\/films\//);
  }
  assert.doesNotMatch(html, /--film-image:url\(['"]assets\/img\//);

  const hydration = functionBlock(app, "function hydrateFmCAct(actIndex, shotIndex = 0)", "const filmSeparatedPalms");
  assert.match(hydration, /assetUrl\(frame\.dataset\.actBackdrop\)/);
  assert.match(hydration, /assetUrl\(shot\.dataset\.shotBackdrop\)/);
  assert.match(hydration, /assetUrl\(responsibility\.dataset\.adultFocusImage\)/);
  assert.doesNotMatch(hydration, /assets\/css\/assets\/img/);
});

test("ships the three-key mobile dock and a live visual description", async () => {
  const [html, app] = await Promise.all([
    read("index.html"),
    read("assets/js/cinematic-revamp-core.js"),
  ]);
  const dock = html.match(/<nav class="mobile-quick-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  assert.equal((dock.match(/<a\b/g) ?? []).length, 3);
  assert.match(dock, /href="#film-reel"[\s\S]*?>24場動畫</);
  assert.match(dock, /href="#full-copy"[\s\S]*?>章節</);
  assert.match(dock, /href="tel:113"/);
  assert.match(html, /id="cinema-stage"[^>]+aria-describedby="cinema-visual-description"/);
  assert.match(html, /id="cinema-visual-description"/);
  assert.match(app, /function describeSceneVisual\(scene, action = ""\)/);
  assert.match(app, /人物與場景皆為非肖像化藝術重構，不是案件影像/);
});

test("hides duplicate production storyboards and hydrates only the current and next FM-C shot", async () => {
  const app = await read("assets/js/cinematic-revamp-core.js");
  const storyboard = functionBlock(app, "function renderStoryboard(scene)", "function syncTranscriptToggle");
  assert.match(storyboard, /root\.hidden = Boolean\(production\)/);
  assert.match(storyboard, /if \(production\)\s*{\s*root\.removeAttribute\("data-beats"\);\s*return;/);

  const hydration = functionBlock(app, "function hydrateFmCAct(actIndex, shotIndex = 0)", "const filmSeparatedPalms");
  assert.match(hydration, /\[shotIndex, shotIndex \+ 1\]\.forEach/);
  assert.doesNotMatch(hydration, /shots\.forEach/);
  assert.doesNotMatch(hydration, /filmActFrames\.forEach/);
  assert.match(app, /function preloadCurrentAndNext\(scene\)/);
  assert.match(app, /preloadSceneStart\(sequenceNext \|\| storyNext\)/);
});

test("prevents audio metadata from joining the initial page load", async () => {
  const html = await read("index.html");
  for (const id of ["cinema-audio", "score-library-audio", "ambient-audio"]) {
    assert.match(html, new RegExp(`<audio[^>]+id=["']${id}["'][^>]+preload=["']none["']`));
  }
  assert.doesNotMatch(html, /<audio[^>]+preload=["'](?:auto|metadata)["']/);
});

test("updates only the current site stamp and leaves version-log dates immutable", async () => {
  const [html, home, data] = await Promise.all([
    read("index.html"),
    read("assets/js/official-home-v2.js"),
    read("assets/data/editorial-home-data.js"),
  ]);
  assert.match(home, /querySelectorAll\("\[data-current-site-updated\]"\)/);
  assert.doesNotMatch(home, /querySelectorAll\("\[data-site-updated\]"\)/);
  assert.equal((html.match(/data-current-site-updated/g) ?? []).length, 1);
  const versionList = html.match(/<ol class="version-list">([\s\S]*?)<\/ol>/)?.[1] || "";
  assert.ok(versionList);
  assert.doesNotMatch(versionList, /data-(?:current-)?site-updated/);
  const configuredDate = data.match(/siteUpdatedAt:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1];
  const currentStampDate = html.match(/<time datetime="(\d{4}-\d{2}-\d{2})" data-current-site-updated>/)?.[1];
  assert.equal(currentStampDate, configuredDate);
});

test("routes each film share to a unique static Open Graph page", async () => {
  const app = await read("assets/js/cinematic-revamp-core.js");
  const routes = {
    "FM-A": "fm-a",
    "FM-D": "fm-d",
    "FM-B": "fm-b",
    "FM-C": "fm-c",
  };
  for (const [sceneId, slug] of Object.entries(routes)) {
    assert.match(app, new RegExp(`"${sceneId}": "share/${slug}/"`));
  }
  assert.match(app, /filmSharePaths\[currentId\]/);

  const pages = await Promise.all(Object.entries(routes).map(async ([sceneId, slug]) => ({
    sceneId,
    slug,
    html: await read(`share/${slug}/index.html`),
  })));
  const titles = new Set();
  const images = new Set();
  const urls = new Set();
  for (const { sceneId, slug, html } of pages) {
    const title = metaContent(html, "og:title");
    const image = metaContent(html, "og:image");
    const url = metaContent(html, "og:url");
    assert.ok(title, `${slug} og:title`);
    assert.ok(image, `${slug} og:image`);
    assert.equal(url, `https://jerryzuhow77.github.io/Justice-For-Kaikai/share/${slug}/`);
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.ok(html.includes(`../../?scene=${sceneId}`), `${slug} redirects to ${sceneId}`);
    titles.add(title);
    images.add(image);
    urls.add(url);
  }
  assert.equal(titles.size, 4);
  assert.equal(images.size, 4);
  assert.equal(urls.size, 4);
});
