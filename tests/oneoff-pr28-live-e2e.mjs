import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL || "https://jerryzuhow77.github.io/Justice-For-Kaikai/").replace(/\/?$/, "/");
const EXPECTED_PRODUCTION_SHA = process.env.EXPECTED_PRODUCTION_SHA || "5d3b7eba719ea743ab84b0082a25154778a8b96e";
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || "artifacts";
const REPOSITORY = "jerryzuhow77/Justice-For-Kaikai";
const startedAt = new Date().toISOString();

const report = {
  schemaVersion: 1,
  target: BASE_URL,
  expectedProductionSha: EXPECTED_PRODUCTION_SHA,
  startedAt,
  status: "running",
  checks: [],
  warnings: [],
  diagnostics: {},
};

let browser;
let terminalError;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function pass(name, details = {}) {
  const result = { name, status: "passed", ...details };
  report.checks.push(result);
  console.log(`PASS | ${name} | ${JSON.stringify(details)}`);
}

function warning(code, message, details = {}) {
  const result = { code, message, ...details };
  report.warnings.push(result);
  console.log(`WARN | ${code} | ${message} | ${JSON.stringify(details)}`);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Justice-For-Kaikai-oneoff-live-e2e" },
    cache: "no-store",
  });
  assert.ok(response.ok, `HTTP ${response.status} while fetching ${url}`);
  return { text: await response.text(), headers: Object.fromEntries(response.headers), status: response.status };
}

async function verifyProductionFingerprint() {
  const cacheBust = `qa-pr28-${Date.now()}`;
  const [productionIndex, productionCore] = await Promise.all([
    fetchText(`${BASE_URL}index.html?${cacheBust}`),
    fetchText(`${BASE_URL}assets/js/cinematic-revamp-core.js?${cacheBust}`),
  ]);

  const candidates = [EXPECTED_PRODUCTION_SHA];
  try {
    const mainResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/commits/main`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "Justice-For-Kaikai-oneoff-live-e2e",
      },
      cache: "no-store",
    });
    if (mainResponse.ok) {
      const currentMain = await mainResponse.json();
      if (currentMain.sha && !candidates.includes(currentMain.sha)) candidates.push(currentMain.sha);
    }
  } catch (error) {
    warning("main-sha-lookup-failed", "無法查詢執行當下的 main SHA；仍會比對啟動時快照。", { error: String(error) });
  }

  const productionHashes = {
    index: sha256(productionIndex.text),
    core: sha256(productionCore.text),
  };
  let matchedSha = null;
  const candidateHashes = {};
  for (const candidate of candidates) {
    const [rawIndex, rawCore] = await Promise.all([
      fetchText(`https://raw.githubusercontent.com/${REPOSITORY}/${candidate}/index.html`),
      fetchText(`https://raw.githubusercontent.com/${REPOSITORY}/${candidate}/assets/js/cinematic-revamp-core.js`),
    ]);
    candidateHashes[candidate] = { index: sha256(rawIndex.text), core: sha256(rawCore.text) };
    if (
      candidateHashes[candidate].index === productionHashes.index
      && candidateHashes[candidate].core === productionHashes.core
    ) {
      matchedSha = candidate;
      break;
    }
  }

  assert.ok(
    matchedSha,
    `Production index/core do not match expected or current main. production=${JSON.stringify(productionHashes)} candidates=${JSON.stringify(candidateHashes)}`,
  );
  report.production = {
    matchedSha,
    matchesExpectedSnapshot: matchedSha === EXPECTED_PRODUCTION_SHA,
    hashes: productionHashes,
    lastModified: {
      index: productionIndex.headers["last-modified"] || null,
      core: productionCore.headers["last-modified"] || null,
    },
    etag: {
      index: productionIndex.headers.etag || null,
      core: productionCore.headers.etag || null,
    },
  };
  pass("正式站內容指紋對應 main", report.production);
}

function watchPage(page, label) {
  const diagnostics = {
    label,
    pageErrors: [],
    consoleErrors: [],
    failedRequests: [],
    badResponses: [],
  };
  page.on("pageerror", (error) => diagnostics.pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") diagnostics.consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    diagnostics.failedRequests.push({
      url: request.url(),
      resourceType: request.resourceType(),
      error: request.failure()?.errorText || "unknown",
    });
  });
  page.on("response", (response) => {
    const resourceType = response.request().resourceType();
    if (response.status() >= 400 && ["document", "script", "stylesheet", "image"].includes(resourceType)) {
      diagnostics.badResponses.push({ url: response.url(), resourceType, status: response.status() });
    }
  });
  return diagnostics;
}

function assertCleanDiagnostics(diagnostics) {
  const criticalRequestFailures = diagnostics.failedRequests.filter((item) =>
    ["document", "script", "stylesheet", "image"].includes(item.resourceType)
    && !/ERR_ABORTED/.test(item.error),
  );
  assert.deepEqual(diagnostics.pageErrors, [], `${diagnostics.label}: uncaught page errors`);
  assert.deepEqual(diagnostics.consoleErrors, [], `${diagnostics.label}: console errors`);
  assert.deepEqual(criticalRequestFailures, [], `${diagnostics.label}: critical request failures`);
  assert.deepEqual(diagnostics.badResponses, [], `${diagnostics.label}: HTTP errors for critical resources`);
  report.diagnostics[diagnostics.label] = {
    ...diagnostics,
    failedRequests: criticalRequestFailures,
  };
}

async function newContext(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    locale: "zh-TW",
    ...options,
  });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("kk-entered-v8", "true");
      localStorage.setItem("kk-reduced-v8", "false");
      if (localStorage.getItem("kk-music-v8") === null) localStorage.setItem("kk-music-v8", "false");
    } catch {
      // Storage support is asserted later through the resume-state check.
    }
  });
  return context;
}

async function waitForPlayer(page) {
  await page.waitForSelector("#cinema-dialog", { state: "attached", timeout: 30_000 });
  await page.waitForFunction(() => document.querySelector("#cinema-dialog")?.open === true, null, { timeout: 30_000 });
  await page.waitForSelector("#cinema-play-overlay", { state: "visible", timeout: 15_000 });
}

async function catalogStats(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll(".animation-card")];
    return {
      total: cards.length,
      ready: cards.filter((card) => card.classList.contains("is-poster-ready")).length,
      posterPending: cards.filter((card) => card.hasAttribute("data-poster")).length,
      imageDeferred: cards.reduce((sum, card) => sum + card.querySelectorAll("img[data-src]").length, 0),
      loadedImages: cards.reduce((sum, card) => sum + card.querySelectorAll("img[src]").length, 0),
    };
  });
}

async function testLazyCatalog() {
  const context = await newContext();
  const page = await context.newPage();
  const diagnostics = watchPage(page, "desktop-lazy-catalog");
  await page.goto(`${BASE_URL}?qa=pr28-lazy-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForSelector(".animation-card", { timeout: 30_000 });
  await page.waitForTimeout(500);

  const before = await catalogStats(page);
  assert.equal(before.total, 24, "Animation catalog must contain exactly 24 cards");
  assert.ok(before.ready < before.total, `All ${before.total} posters were eagerly hydrated`);
  assert.ok(before.posterPending + before.imageDeferred > 0, "No deferred poster/image resources remained before scrolling");

  await page.locator("#film-reel").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    (readyBefore) => document.querySelectorAll(".animation-card.is-poster-ready").length > readyBefore,
    before.ready,
    { timeout: 15_000 },
  );
  const afterFirstScroll = await catalogStats(page);
  assert.ok(afterFirstScroll.ready > before.ready, "Scrolling into the catalog did not hydrate any poster");
  assert.ok(
    afterFirstScroll.posterPending + afterFirstScroll.imageDeferred < before.posterPending + before.imageDeferred,
    "Deferred resource count did not decrease after intersection",
  );

  await page.locator(".animation-card").last().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".animation-card:last-child")?.classList.contains("is-poster-ready"), null, { timeout: 15_000 });
  await page.waitForFunction(() => [...document.querySelectorAll(".animation-card.is-poster-ready img[src]")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 20_000 });
  const afterLastScroll = await catalogStats(page);
  assert.ok(afterLastScroll.ready >= afterFirstScroll.ready, "Poster hydration regressed while scrolling");

  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop-lazy-catalog.png`, fullPage: false });
  assertCleanDiagnostics(diagnostics);
  pass("桌機：24 篇總覽與延遲載入", { before, afterFirstScroll, afterLastScroll });
  await context.close();
}

async function playerReleaseState(page) {
  return page.evaluate(() => {
    const backgrounds = ["#cinema-bg-a", "#cinema-bg-b", "#cinema-depth-far", "#cinema-depth-mid", "#cinema-depth-near"];
    const actFrames = [...document.querySelectorAll(".fm-c-act-frame")];
    const shots = [...document.querySelectorAll(".fm-c-act-shot")];
    const audio = document.querySelector("#cinema-audio");
    return {
      dialogOpen: document.querySelector("#cinema-dialog")?.open === true,
      bodyOverflow: document.body.style.overflow,
      stageHasGsap: document.querySelector("#cinema-stage")?.classList.contains("is-gsap") || false,
      stageMobileFocus: document.querySelector("#cinema-stage")?.style.getPropertyValue("--scene-mobile-focus") || "",
      actorSrcCount: [...document.querySelectorAll("#cinema-actor-female img, #cinema-actor-male img")].filter((image) => image.hasAttribute("src")).length,
      inlineBackgroundCount: backgrounds.filter((selector) => document.querySelector(selector)?.style.getPropertyValue("background-image")).length,
      hydratedActFrames: actFrames.filter((frame) => frame.dataset.rigHydrated !== undefined).length,
      actBackdropCount: actFrames.filter((frame) => frame.style.getPropertyValue("--act-backdrop")).length,
      hydratedShots: shots.filter((shot) => shot.dataset.hydrated !== undefined).length,
      shotBackdropCount: shots.filter((shot) => shot.style.getPropertyValue("--shot-backdrop")).length,
      filmImageSrcCount: [...document.querySelectorAll(".fm-c-act-frame img[data-src]")].filter((image) => image.hasAttribute("src")).length,
      adultFocusCount: [...document.querySelectorAll(".fm-c-responsibility-rig")].filter((rig) => rig.style.getPropertyValue("--adult-focus-image")).length,
      audio: audio ? {
        paused: audio.paused,
        srcAttribute: audio.getAttribute("src") || "",
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : null,
        readyState: audio.readyState,
        networkState: audio.networkState,
        bufferedRanges: audio.buffered.length,
      } : null,
    };
  });
}

function assertReleased(state, label) {
  assert.equal(state.dialogOpen, false, `${label}: dialog remained open`);
  assert.equal(state.bodyOverflow, "", `${label}: body scroll remained locked`);
  assert.equal(state.stageHasGsap, false, `${label}: GSAP timeline marker remained active`);
  assert.equal(state.stageMobileFocus, "", `${label}: mobile focus CSS property remained`);
  assert.equal(state.actorSrcCount, 0, `${label}: actor image src remained attached`);
  assert.equal(state.inlineBackgroundCount, 0, `${label}: inline background images remained attached`);
  assert.equal(state.hydratedActFrames, 0, `${label}: FM-C act frame remained hydrated`);
  assert.equal(state.actBackdropCount, 0, `${label}: FM-C act backdrop remained attached`);
  assert.equal(state.hydratedShots, 0, `${label}: FM-C shot remained hydrated`);
  assert.equal(state.shotBackdropCount, 0, `${label}: FM-C shot backdrop remained attached`);
  assert.equal(state.filmImageSrcCount, 0, `${label}: FM-C image src remained attached`);
  assert.equal(state.adultFocusCount, 0, `${label}: FM-C focus image remained attached`);
  assert.equal(state.audio?.paused, true, `${label}: scene audio continued playing`);
}

async function testDesktopPlayerStateAndRelease() {
  const context = await newContext();
  const page = await context.newPage();
  const diagnostics = watchPage(page, "desktop-player-state-release");
  const qa = `pr28-player-${Date.now()}`;

  await page.goto(`${BASE_URL}?animation=01&qa=${qa}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await waitForPlayer(page);
  assert.match(await page.locator("#cinema-type").innerText(), /^01 \/ 24/);
  assert.equal(new URL(page.url()).searchParams.get("animation"), "01");
  assert.equal(await page.locator("#prev-story").isDisabled(), true);
  assert.equal(await page.evaluate(() => document.querySelector("#site-header")?.inert), false, "Deep link left the page gate active");

  await page.locator("#next-story").click();
  await page.waitForFunction(() => document.querySelector("#cinema-type")?.textContent?.startsWith("02 / 24"));
  assert.equal(new URL(page.url()).searchParams.get("animation"), "02");
  assert.equal(await page.locator("#prev-story").isDisabled(), false);

  await page.locator("#prev-story").click();
  await page.waitForFunction(() => document.querySelector("#cinema-type")?.textContent?.startsWith("01 / 24"));
  assert.equal(new URL(page.url()).searchParams.get("animation"), "01");
  await page.locator("#next-story").click();
  await page.waitForFunction(() => document.querySelector("#cinema-type")?.textContent?.startsWith("02 / 24"));

  const hasGsapTimeline = await page.evaluate(() => Boolean(window.gsap) && document.querySelector("#cinema-stage")?.classList.contains("is-gsap"));
  assert.equal(hasGsapTimeline, true, "Production player did not build its GSAP timeline");
  await page.locator("#play-cinema").click();
  await page.waitForFunction(() => document.querySelector("#play-cinema")?.getAttribute("aria-pressed") === "true");
  await page.waitForFunction(() => Number(document.querySelector("#timeline-progress")?.value || 0) > 0, null, { timeout: 10_000 });
  await page.locator("#play-cinema").click();
  await page.waitForFunction(() => document.querySelector("#play-cinema")?.getAttribute("aria-pressed") === "false");

  await page.locator("#next-beat").click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("kk-animation-resume-v9") || "null"));
  assert.equal(saved?.sceneId, "SP00");
  assert.ok(saved?.localStep > 0, `Resume localStep must be > 0, received ${JSON.stringify(saved)}`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop-deep-link-and-switch.png`, fullPage: false });

  const shadowBeforeClose = await playerReleaseState(page);
  assert.ok(shadowBeforeClose.actorSrcCount > 0, "Shadow-player actor assets were not hydrated before release test");
  await page.locator("#close-cinema").click();
  await page.waitForFunction(() => document.querySelector("#cinema-dialog")?.open === false);
  const shadowAfterClose = await playerReleaseState(page);
  assertReleased(shadowAfterClose, "shadow close");

  await page.reload({ waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForSelector(".animation-card", { timeout: 30_000 });
  await page.waitForFunction(() => {
    const button = document.querySelector("#resume-animation");
    return button && !button.hidden;
  });
  assert.match(await page.locator("#resume-animation").innerText(), /02 \/ 24/);
  await page.locator("#resume-animation").click();
  await waitForPlayer(page);
  assert.equal(new URL(page.url()).searchParams.get("animation"), "02");
  const restored = await page.evaluate(() => ({
    progress: Number(document.querySelector("#timeline-progress")?.value || 0),
    saved: JSON.parse(localStorage.getItem("kk-animation-resume-v9") || "null"),
  }));
  assert.ok(restored.progress > 0, `Resume restored to the first frame: ${JSON.stringify(restored)}`);
  assert.equal(restored.saved?.sceneId, "SP00");
  assert.equal(restored.saved?.localStep, saved.localStep);
  await page.locator("#close-cinema").click();
  await page.waitForFunction(() => document.querySelector("#cinema-dialog")?.open === false);

  await page.evaluate(() => localStorage.setItem("kk-music-v8", "true"));
  await page.goto(`${BASE_URL}?animation=24&qa=${qa}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await waitForPlayer(page);
  assert.match(await page.locator("#cinema-type").innerText(), /^24 \/ 24/);
  const heavyBefore = await playerReleaseState(page);
  assert.ok(
    heavyBefore.hydratedActFrames + heavyBefore.hydratedShots + heavyBefore.actBackdropCount + heavyBefore.filmImageSrcCount > 0,
    `FM-C heavy surface was not hydrated before release test: ${JSON.stringify(heavyBefore)}`,
  );
  await page.locator("#play-cinema").click();
  await page.waitForFunction(() => document.querySelector("#play-cinema")?.getAttribute("aria-pressed") === "true");
  await page.waitForTimeout(750);
  await page.locator("#close-cinema").click();
  await page.waitForFunction(() => document.querySelector("#cinema-dialog")?.open === false);
  const heavyAfter = await playerReleaseState(page);
  assertReleased(heavyAfter, "FM-C close");
  if (heavyAfter.audio?.srcAttribute) {
    warning(
      "paused-audio-src-retained",
      "播放器關閉後音訊已暫停，但 audio 的 src 仍保留；本次視為低風險殘留，不等同持續播放。",
      heavyAfter.audio,
    );
  }

  assertCleanDiagnostics(diagnostics);
  pass("桌機：深連結、前後篇切換與播放／暫停", { hasGsapTimeline, finalAnimation: "24" });
  pass("桌機：觀看進度與重新載入後續看", { saved, restored });
  pass("桌機：播放器關閉後釋放畫面資源", { shadowBeforeClose, shadowAfterClose, heavyBefore, heavyAfter });
  await context.close();
}

async function testMobilePlayer() {
  const context = await newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36",
  });
  const page = await context.newPage();
  const diagnostics = watchPage(page, "mobile-player");
  await page.goto(`${BASE_URL}?animation=24&qa=pr28-mobile-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await waitForPlayer(page);

  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box ? { x: box.x, right: box.right, width: box.width, top: box.top, bottom: box.bottom } : null;
    };
    return {
      innerWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      dialog: rect("#cinema-dialog"),
      shell: rect(".cinema-shell"),
      stage: rect("#cinema-stage"),
      primaryControls: rect(".cinema-primary-controls"),
    };
  });
  assert.ok(layout.documentScrollWidth <= layout.innerWidth + 2, `Mobile document overflow: ${JSON.stringify(layout)}`);
  assert.ok(layout.bodyScrollWidth <= layout.innerWidth + 2, `Mobile body overflow: ${JSON.stringify(layout)}`);
  for (const [name, rect] of Object.entries({ dialog: layout.dialog, shell: layout.shell, stage: layout.stage })) {
    assert.ok(rect, `${name} was not rendered`);
    assert.ok(rect.x >= -2 && rect.right <= layout.innerWidth + 2, `${name} exceeded mobile viewport: ${JSON.stringify(rect)}`);
  }

  assert.equal(await page.locator("#close-cinema").isVisible(), true);
  assert.equal(await page.locator("#play-cinema").isVisible(), true);
  assert.equal(await page.locator("#toggle-more-controls").isVisible(), true);
  assert.equal(await page.locator("#prev-story").isVisible(), true);
  assert.equal(await page.locator("#next-story").isVisible(), true);
  await page.locator("#toggle-more-controls").click();
  await page.waitForFunction(() => document.querySelector("#toggle-more-controls")?.getAttribute("aria-expanded") === "true");
  assert.equal(await page.locator("#cinema-secondary-controls").isVisible(), true);

  const mobileAssets = await playerReleaseState(page);
  assert.ok(
    mobileAssets.hydratedActFrames + mobileAssets.hydratedShots + mobileAssets.actBackdropCount + mobileAssets.filmImageSrcCount > 0,
    `Mobile FM-C surface did not hydrate: ${JSON.stringify(mobileAssets)}`,
  );
  await page.waitForFunction(() => [...document.querySelectorAll(".fm-c-act-frame img[src]")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 20_000 });
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile-390x844-player.png`, fullPage: false });

  await page.locator("#close-cinema").click();
  await page.waitForFunction(() => document.querySelector("#cinema-dialog")?.open === false);
  const mobileAfterClose = await playerReleaseState(page);
  assertReleased(mobileAfterClose, "mobile FM-C close");

  assertCleanDiagnostics(diagnostics);
  pass("手機 390×844：深連結、控制列、圖片與無水平溢位", { layout, mobileAssets });
  pass("手機 390×844：播放器關閉後釋放資源", { mobileAfterClose });
  await context.close();
}

async function run() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await verifyProductionFingerprint();
  browser = await chromium.launch({ headless: true });
  await testLazyCatalog();
  await testDesktopPlayerStateAndRelease();
  await testMobilePlayer();
  report.status = "passed";
}

try {
  await run();
} catch (error) {
  terminalError = error;
  report.status = "failed";
  report.error = {
    name: error?.name || "Error",
    message: error?.message || String(error),
    stack: error?.stack || null,
  };
  console.error(`FAIL | ${report.error.message}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.parse(report.finishedAt) - Date.parse(startedAt);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(`${ARTIFACT_DIR}/report.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`E2E_SUMMARY ${JSON.stringify({
    status: report.status,
    target: report.target,
    production: report.production || null,
    passedChecks: report.checks.map((check) => check.name),
    warnings: report.warnings,
    error: report.error || null,
  })}`);
}

if (terminalError) throw terminalError;
