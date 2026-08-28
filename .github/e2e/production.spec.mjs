import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PRODUCTION_BASE_URL || "https://jerryzuhow77.github.io/Justice-For-Kaikai/";
const WORKSPACE = process.env.GITHUB_WORKSPACE_PATH || process.cwd();
const ARTIFACTS = path.join(process.cwd(), "artifacts");
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 16; SM-F9360) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36";

const profiles = {
  desktop: { width: 1440, height: 900, isMobile: false, hasTouch: false },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, userAgent: MOBILE_UA }
};

const filmCases = [
  { animation: 1, id: "FM-A", title: "土掩埋不住的清朝民間傳說" },
  { animation: 18, id: "FM-D", title: "無法再相見▪︎天涯各自分" },
  { animation: 21, id: "FM-B", title: "青絲變白髮" },
  { animation: 24, id: "FM-C", title: "兩個朝代▪︎不同世界▪︎同一扇門" }
];

const shareCases = [
  { slug: "fm-a", scene: "FM-A", animation: 1, title: "土掩埋不住的清朝民間傳說｜第一部電影", image: "fm-a-buried-name.webp" },
  { slug: "fm-d", scene: "FM-D", animation: 18, title: "無法再相見▪︎天涯各自分｜第二部電影", image: "fm-d-unarrived-visit.webp" },
  { slug: "fm-b", scene: "FM-B", animation: 21, title: "青絲變白髮｜第三部電影", image: "fm-b-hair-to-white.webp" },
  { slug: "fm-c", scene: "FM-C", animation: 24, title: "兩個朝代▪︎不同世界▪︎同一扇門｜第四部電影", image: "fm-c-two-worlds-v2.webp" }
];

test.use({
  channel: "chrome",
  headless: true,
  locale: "zh-TW",
  colorScheme: "dark",
  reducedMotion: "no-preference",
  ignoreHTTPSErrors: false,
  screenshot: "only-on-failure",
  trace: "retain-on-failure",
  video: "off"
});
test.setTimeout(150_000);

await mkdir(ARTIFACTS, { recursive: true });

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function meta(html, selector, attr = "content") {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+${attr}=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+${attr}=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function linkHref(html, rel, hreflang = null) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const relMatch = tag.match(/\brel=["']([^"']+)["']/i);
    const langMatch = tag.match(/\bhreflang=["']([^"']+)["']/i);
    const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
    if (!relMatch || !hrefMatch || !relMatch[1].split(/\s+/).includes(rel)) continue;
    if (hreflang !== null && langMatch?.[1] !== hreflang) continue;
    return hrefMatch[1];
  }
  return null;
}

async function newContext(browser, profile) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    screen: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    deviceScaleFactor: 1,
    userAgent: profile.userAgent,
    locale: "zh-TW",
    colorScheme: "dark",
    reducedMotion: "no-preference"
  });
  await context.addInitScript(() => {
    try { localStorage.setItem("kk-reduced-v8", "false"); }
    catch { /* The production fallback is tested through visible behavior. */ }
    const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
    if (NativeAudioContext) {
      const contexts = [];
      const TrackedAudioContext = new Proxy(NativeAudioContext, {
        construct(Target, args) {
          const context = Reflect.construct(Target, args, Target);
          contexts.push(context);
          return context;
        }
      });
      window.__productionE2eAudioContexts = contexts;
      if (window.AudioContext) window.AudioContext = TrackedAudioContext;
      if (window.webkitAudioContext) window.webkitAudioContext = TrackedAudioContext;
    }
  });
  return context;
}

function monitor(page, label) {
  const record = { label, pageErrors: [], consoleErrors: [], httpErrors: [], requestFailures: [] };
  page.on("pageerror", (error) => record.pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") record.consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.url().startsWith(BASE) && response.status() >= 400) {
      record.httpErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText || "unknown request failure";
    if (request.url().startsWith(BASE) && !error.includes("ERR_ABORTED")) {
      record.requestFailures.push(`${error} ${request.url()}`);
    }
  });
  return record;
}

async function expectClean(record) {
  expect(record.pageErrors, `${record.label}: page errors`).toEqual([]);
  expect(record.httpErrors, `${record.label}: production HTTP errors`).toEqual([]);
  expect(record.requestFailures, `${record.label}: production request failures`).toEqual([]);
  expect(record.consoleErrors, `${record.label}: console errors`).toEqual([]);
}

async function waitForApp(page) {
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#animation-catalog")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  await expect(page.locator("#animation-catalog .animation-card")).toHaveCount(24);
}

async function screenshotEvidence(page, name) {
  const file = path.join(ARTIFACTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  expect((await stat(file)).size, `${name} screenshot should not be blank`).toBeGreaterThan(20_000);
}

async function viewportAudit(page, label, selectors = []) {
  const audit = await page.evaluate((requiredSelectors) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const insideHorizontalScroller = (element) => {
      for (let current = element.parentElement; current && current !== document.body; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (/(auto|scroll)/.test(style.overflowX) && current.scrollWidth > current.clientWidth + 1) return true;
      }
      return false;
    };
    const candidates = [...document.querySelectorAll("a,button,input,summary,[role='button']")];
    const offenders = candidates.filter((element) => {
      if (!visible(element) || element.closest("[inert],[aria-hidden='true']") || insideHorizontalScroller(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.left < -1 || rect.right > innerWidth + 1;
    }).map((element) => ({
      selector: element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
      left: Math.round(element.getBoundingClientRect().left),
      right: Math.round(element.getBoundingClientRect().right)
    }));
    const required = requiredSelectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return { selector, missing: true };
      const rect = element.getBoundingClientRect();
      return { selector, visible: visible(element), left: rect.left, right: rect.right, width: rect.width, height: rect.height };
    });
    return {
      viewport: innerWidth,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      offenders,
      required
    };
  }, selectors);
  expect(audit.documentWidth, `${label}: document horizontal overflow`).toBeLessThanOrEqual(audit.viewport + 1);
  expect(audit.offenders, `${label}: visible controls outside viewport`).toEqual([]);
  for (const item of audit.required) {
    expect(item.missing, `${label}: ${item.selector} exists`).not.toBe(true);
    expect(item.visible, `${label}: ${item.selector} visible`).toBe(true);
    expect(item.left, `${label}: ${item.selector} left edge`).toBeGreaterThanOrEqual(-1);
    expect(item.right, `${label}: ${item.selector} right edge`).toBeLessThanOrEqual(audit.viewport + 1);
  }
}

async function verifyFreshEntry(browser, name, profile) {
  const context = await newContext(browser, profile);
  const page = await context.newPage();
  const record = monitor(page, `${name} fresh entry`);
  await page.goto(`${BASE}?production-e2e=fresh-${name}`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);

  await expect(page.locator("body")).toHaveClass(/is-gated/);
  await expect(page.locator("#entry-gate")).toBeVisible();
  await expect(page.locator("#main")).toHaveAttribute("inert", "");
  await expect(page.locator("#site-header")).toHaveAttribute("inert", "");
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(false);

  const preEntry = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource").map((entry) => entry.name);
    return {
      prologueResources: resources.filter((url) => /chair-prologue|assets\/data\/prologue|prologue-chair-maiden\.m4a/.test(url)),
      catalogImagesWithSrc: document.querySelectorAll("#animation-catalog img[src]").length,
      hydratedCatalogCards: document.querySelectorAll("#animation-catalog .is-poster-ready").length
    };
  });
  expect(preEntry.prologueResources, `${name}: prologue stays lazy before click`).toEqual([]);
  expect(preEntry.catalogImagesWithSrc, `${name}: catalog does not preload every actor`).toBeLessThan(12);
  expect(preEntry.hydratedCatalogCards, `${name}: catalog keeps distant cards lazy`).toBeLessThan(12);

  for (const selector of ["#enter-experience", "#enter-reading", ".gate-actions a[href='story.html']"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await expect(page.locator(selector)).toBeVisible();
  }
  await screenshotEvidence(page, `${name}-fresh-entry`);

  await page.locator("#enter-experience").scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    window.__productionE2ePrologueResult = null;
    window.addEventListener("kaikai:prologue-finished", (event) => {
      window.__productionE2ePrologueResult = { skipped: event.detail?.skipped, finishedAt: performance.now() };
    }, { once: true });
  });
  const started = Date.now();
  await page.locator("#enter-experience").click();
  await expect(page.locator("#chair-maiden-prologue")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".kkp6__skip")).toBeVisible();
  await viewportAudit(page, `${name} prologue`, [".kkp6__skip", ".kkp6__sound"]);

  await page.locator(".kkp6__sound").click();
  await expect(page.locator(".kkp6__sound")).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
  await expect.poll(() => page.locator("#ambient-audio").evaluate((audio) => !audio.paused)).toBe(true);
  await page.locator(".kkp6__sound").click();
  await expect(page.locator(".kkp6__sound")).toHaveAttribute("aria-pressed", "false");

  await expect(page.locator("#chair-maiden-prologue")).toBeHidden({ timeout: 20_000 });
  expect(Date.now() - started, `${name}: natural prologue duration`).toBeGreaterThan(10_000);
  await expect.poll(() => page.evaluate(() => window.__productionE2ePrologueResult?.skipped)).toBe(false);
  await expect(page.locator("body")).not.toHaveClass(/is-gated/);
  await expect(page.locator("#main")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#site-header")).not.toHaveAttribute("inert", "");
  expect(await page.evaluate(() => sessionStorage.getItem("kk-entered-v8"))).toBe("true");

  await expect.poll(() => page.locator("#ambient-audio").evaluate((audio) => !audio.paused)).toBe(true);
  await page.locator("#ambient-audio").dispatchEvent("ended");
  await expect.poll(() => page.locator("#ambient-audio").evaluate((audio) => audio.currentSrc.includes("site-background.m4a"))).toBe(true);

  if (profile.isMobile) {
    const mobileRelease = await page.evaluate(() => ({
      objectUrl: Boolean(window.__chairMobileArtObjectUrl),
      cssValue: document.documentElement.style.getPropertyValue("--chair-mobile-art"),
      readyClass: document.documentElement.classList.contains("chair-mobile-art-ready")
    }));
    expect(mobileRelease, "mobile prologue Blob URL is released").toEqual({ objectUrl: false, cssValue: "", readyClass: false });
  }

  await screenshotEvidence(page, `${name}-home-after-prologue`);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("body")).not.toHaveClass(/is-gated/);
  await expect(page.locator("#entry-gate")).toBeHidden();
  await expect(page.locator("#chair-maiden-prologue")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("kk-entered-v8"))).toBe("true");

  await page.evaluate(() => sessionStorage.removeItem("kk-entered-v8"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("body")).toHaveClass(/is-gated/);
  await page.locator("#enter-reading").click();
  await expect(page.locator("body")).not.toHaveClass(/is-gated/);
  await expect(page.locator(".full-copy-details")).toHaveAttribute("open", "");
  expect(await page.evaluate(() => sessionStorage.getItem("kk-entered-v8"))).toBe("true");

  await expectClean(record);
  await context.close();
}

async function verifyFilmPlayer(page, film, label) {
  await page.goto(`${BASE}?animation=${film.animation}`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
  await expect(page.locator("#cinema-title")).toHaveText(film.title);
  await expect(page.locator("#cinema-stage")).toHaveAttribute("data-production", "true");
  await expect(page.locator("#act-markers button")).toHaveCount(5);
  await expect(page.locator("#play-cinema")).toHaveText("播放");
  expect(await page.evaluate(() => Boolean(window.gsap) && !matchMedia("(prefers-reduced-motion: reduce)").matches), `${label}: normal GSAP motion`).toBe(true);

  const before = Number(await page.locator("#timeline-progress").inputValue());
  await page.locator("#play-cinema").click();
  await expect(page.locator("#play-cinema")).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(1_500);
  const after = Number(await page.locator("#timeline-progress").inputValue());
  expect(after, `${label}: ${film.id} GSAP clock advances`).toBeGreaterThan(before);
  await expect.poll(() => page.locator("#cinema-audio").evaluate((audio) => audio.currentTime)).toBeGreaterThan(0);
  await page.locator("#play-cinema").click();
  await expect(page.locator("#play-cinema")).toHaveAttribute("aria-pressed", "false");
  await viewportAudit(page, `${label} ${film.id} player`, ["#close-cinema", "#prev-beat", "#play-cinema", "#next-beat", "#toggle-captions", "#toggle-more-controls"]);
}

async function verifyCoreExperience(browser, name, profile) {
  const context = await newContext(browser, profile);
  const page = await context.newPage();
  const record = monitor(page, `${name} core experience`);

  await page.goto(`${BASE}#film-reel`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("body")).not.toHaveClass(/is-gated/);
  await expect(page.locator("#entry-gate")).toBeHidden();
  await expect(page.locator(".featured-film-grid .film-act-card")).toHaveCount(4);
  await expect(page.locator("#animation-catalog .animation-card[data-type='film']")).toHaveCount(4);
  await expect(page.locator("#animation-catalog .animation-card[data-type='shadow']")).toHaveCount(10);
  await expect(page.locator("#animation-catalog .animation-card[data-type='side']")).toHaveCount(10);

  const order = await page.evaluate(() => ({
    afterEthics: document.querySelector(".ethics-strip")?.nextElementSibling?.id || "",
    filmTop: document.querySelector("#film-reel")?.offsetTop || 0,
    caseTop: document.querySelector("#case-progress")?.offsetTop || 0
  }));
  expect(order.afterEthics).toBe("film-reel");
  expect(order.filmTop).toBeLessThan(order.caseTop);

  for (const view of ["type", "chapter", "story"]) {
    await page.locator(`[data-catalog-view='${view}']`).click();
    await expect(page.locator(`[data-catalog-view='${view}']`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#animation-catalog .animation-card")).toHaveCount(24);
  }

  if (profile.isMobile) {
    await expect(page.locator(".mobile-quick-nav a")).toHaveCount(3);
    await viewportAudit(page, `${name} animation map`, [".mobile-quick-nav", "#nav-toggle"]);
  } else {
    await viewportAudit(page, `${name} animation map`);
  }
  await screenshotEvidence(page, `${name}-animation-map`);

  await page.goto(`${BASE}?animation=18`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
  await page.locator("#next-beat").click();
  await expect(page.locator("#frame-counter")).toHaveText("第二幕 / 五幕");
  await expect(page).toHaveURL(/\?animation=18&act=2$/);
  await page.locator("#close-cinema").click();
  await expect(page.locator("#cinema-dialog")).not.toHaveAttribute("open", "");
  await expect(page.locator("#resume-animation")).toBeVisible();
  await page.locator("#resume-animation").click();
  await expect(page.locator("#frame-counter")).toHaveText("第二幕 / 五幕");

  await page.locator("#toggle-captions").click();
  await expect(page.locator("#toggle-captions")).toHaveAttribute("aria-pressed", "false");
  await page.locator("#toggle-more-controls").click();
  await expect(page.locator("#toggle-more-controls")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#toggle-transcript").click();
  await expect(page.locator("#transcript")).toHaveAttribute("open", "");
  await expect(page.locator("#transcript-body .transcript-lines p")).toHaveCount(18);

  await page.locator("#next-story").click();
  await expect(page.locator("#cinema-type")).toContainText("19 / 24");
  await expect(page).toHaveURL(/\?animation=19$/);
  await page.locator("#prev-story").click();
  await expect(page.locator("#cinema-type")).toContainText("18 / 24");

  for (const film of filmCases) await verifyFilmPlayer(page, film, name);

  await page.goto(`${BASE}?animation=24`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
  const initialHydration = await page.evaluate(() => [...document.querySelectorAll(".fm-c-act-frame")].map((frame) => ({
    rig: frame.dataset.rigHydrated === "true",
    shots: frame.querySelectorAll('.fm-c-act-shot[data-hydrated="true"]').length,
    srcs: [...frame.querySelectorAll(".fm-c-act-shot img")].filter((image) => image.getAttribute("src")).length
  })));
  expect(initialHydration).toEqual([
    { rig: true, shots: 2, srcs: 2 },
    { rig: false, shots: 0, srcs: 0 },
    { rig: false, shots: 0, srcs: 0 },
    { rig: false, shots: 0, srcs: 0 },
    { rig: false, shots: 0, srcs: 0 }
  ]);
  await expect.poll(() => page.locator(".fm-c-act-frame").first().locator("img[src]").evaluateAll((images) => (
    images.length === 2 && images.every((image) => image.complete && image.naturalWidth > 0)
  ))).toBe(true);
  await page.locator("#next-beat").click();
  await expect(page.locator("#frame-counter")).toHaveText("第二幕 / 五幕");
  await expect(page).toHaveURL(/\?animation=24&act=2$/);
  await screenshotEvidence(page, `${name}-fm-c-act-2`);
  await page.locator("#next-beat").click();
  await expect(page.locator("#frame-counter")).toHaveText("第三幕 / 五幕");
  await expect.poll(() => page.evaluate(() => performance.now())).toBeGreaterThan(950);
  await page.locator("#play-cinema").click();
  await page.waitForTimeout(900);
  await page.locator("#play-cinema").click();
  await expect.poll(() => page.evaluate(() => window.__productionE2eAudioContexts?.length || 0)).toBeGreaterThan(0);
  await page.locator("#close-cinema").click();
  await expect(page.locator("#cinema-dialog")).not.toHaveAttribute("open", "");
  const expectedRelease = {
    actorSrcs: [null, null], cinemaAudioSrc: null, backgrounds: ["", "", "", "", ""],
    rigs: 0, shots: 0, shotSrcs: 0, actBackdrops: 0, shotBackdrops: 0,
    mobileFocus: "", bodyOverflow: "", audioContextStates: ["closed"], url: BASE
  };
  await expect.poll(() => page.evaluate(() => ({
    actorSrcs: [...document.querySelectorAll("#cinema-actor-female img,#cinema-actor-male img")].map((image) => image.getAttribute("src")),
    cinemaAudioSrc: document.querySelector("#cinema-audio")?.getAttribute("src"),
    backgrounds: ["#cinema-bg-a", "#cinema-bg-b", "#cinema-depth-far", "#cinema-depth-mid", "#cinema-depth-near"].map((selector) => document.querySelector(selector)?.style.backgroundImage || ""),
    rigs: document.querySelectorAll('.fm-c-act-frame[data-rig-hydrated="true"]').length,
    shots: document.querySelectorAll('.fm-c-act-shot[data-hydrated="true"]').length,
    shotSrcs: [...document.querySelectorAll(".fm-c-act-shot img")].filter((image) => image.getAttribute("src")).length,
    actBackdrops: [...document.querySelectorAll(".fm-c-act-frame")].filter((frame) => frame.style.getPropertyValue("--act-backdrop")).length,
    shotBackdrops: [...document.querySelectorAll(".fm-c-act-shot")].filter((shot) => shot.style.getPropertyValue("--shot-backdrop")).length,
    mobileFocus: document.querySelector("#cinema-stage")?.style.getPropertyValue("--scene-mobile-focus") || "",
    bodyOverflow: document.body.style.overflow,
    audioContextStates: (window.__productionE2eAudioContexts || []).map((context) => context.state),
    url: location.href
  })), { timeout: 10_000 }).toEqual(expectedRelease);

  await page.goto(`${BASE}?reel=1`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
  await page.locator("#timeline-progress").fill("998");
  await page.locator("#play-cinema").click();
  await expect(page.locator("#cinema-complete")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("#animation-progress-label")).toContainText("已觀看 4 / 24");

  await expectClean(record);
  await context.close();
}

test("production bytes match the QA branch public assets", async ({ request }) => {
  for (const file of ["index.html", "assets/js/cinematic-revamp-core.js"]) {
    const local = await readFile(path.join(WORKSPACE, file));
    const response = await request.get(`${BASE}${file}?production-e2e-parity=${Date.now()}`);
    expect(response.status(), `${file} production status`).toBe(200);
    const live = Buffer.from(await response.body());
    expect(sha256(live), `${file} production SHA-256`).toBe(sha256(local));
  }
});

test("canonical, hreflang and four unique share previews are reciprocal", async ({ request }) => {
  const expectedAlternates = {
    "zh-Hant": `${BASE}story.html`,
    "zh-Hans": `${BASE}story-zh-hans.html`,
    en: `${BASE}story-en.html`,
    ja: `${BASE}story-ja.html`,
    "x-default": BASE
  };
  const pages = ["index.html", "story.html", "story-zh-hans.html", "story-en.html", "story-ja.html"];
  for (const file of pages) {
    const response = await request.get(`${BASE}${file}?production-e2e-seo=${Date.now()}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    for (const [language, href] of Object.entries(expectedAlternates)) {
      expect(linkHref(html, "alternate", language), `${file} ${language}`).toBe(href);
    }
  }

  const titles = new Set();
  const images = new Set();
  for (const item of shareCases) {
    const shareUrl = `${BASE}share/${item.slug}/`;
    const response = await request.get(`${shareUrl}?production-e2e-og=${Date.now()}`);
    expect(response.status(), `${item.slug} response`).toBe(200);
    const html = await response.text();
    expect(linkHref(html, "canonical"), `${item.slug} canonical`).toBe(shareUrl);
    expect(meta(html, "og:url"), `${item.slug} og:url`).toBe(shareUrl);
    expect(meta(html, "og:title"), `${item.slug} og:title`).toBe(item.title);
    expect(meta(html, "og:image"), `${item.slug} og:image`).toContain(item.image);
    expect(meta(html, "robots"), `${item.slug} redirect indexing intent`).toBe("noindex,follow");
    titles.add(meta(html, "og:title"));
    images.add(meta(html, "og:image"));
    const imageResponse = await request.get(meta(html, "og:image"));
    expect(imageResponse.status(), `${item.slug} OG image`).toBe(200);
    expect((await imageResponse.body()).byteLength, `${item.slug} OG image bytes`).toBeGreaterThan(25_000);
  }
  expect(titles.size).toBe(4);
  expect(images.size).toBe(4);
});

test("invalid player parameters keep the first-visit gate", async ({ browser }) => {
  for (const query of ["?animation=999", "?animation=abc", "?scene=not-a-scene"]) {
    const context = await newContext(browser, profiles.desktop);
    const page = await context.newPage();
    await page.goto(`${BASE}${query}`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await expect(page.locator("body")).toHaveClass(/is-gated/);
    await expect(page.locator("#entry-gate")).toBeVisible();
    await expect(page.locator("#cinema-dialog")).not.toHaveAttribute("open", "");
    expect(await page.evaluate(() => sessionStorage.getItem("kk-entered-v8"))).toBeNull();
    if (query === "?animation=999") {
      await page.locator("#enter-experience").click();
      await expect(page.locator("#chair-maiden-prologue")).toBeVisible({ timeout: 8_000 });
      await page.locator(".kkp6__skip").click();
      await expect(page.locator("#chair-maiden-prologue")).toBeHidden();
    }
    await context.close();
  }
});

for (const [name, profile] of Object.entries(profiles)) {
  test(`${name}: natural prologue, audio handoff, session reload and direct reading`, async ({ browser }) => {
    await verifyFreshEntry(browser, name, profile);
  });
  test(`${name}: 24-map, four films, controls, resume, lazy hydration and cleanup`, async ({ browser }) => {
    await verifyCoreExperience(browser, name, profile);
  });
}

test("deep links and share redirects reach the correct live player", async ({ browser }) => {
  const context = await newContext(browser, profiles.desktop);
  const page = await context.newPage();
  const record = monitor(page, "deep links");

  await page.goto(`${BASE}?scene=FM-C&act=5`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("#cinema-title")).toHaveText(filmCases[3].title);
  await expect(page.locator("#frame-counter")).toHaveText("第五幕 / 五幕");
  await expect(page).toHaveURL(/\?animation=24&act=5$/);

  for (const item of shareCases) {
    await page.goto(`${BASE}share/${item.slug}/`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
    await expect(page.locator("#cinema-title")).toContainText(item.title.split("｜")[0]);
    await expect(page).toHaveURL(new RegExp(`\\?animation=${String(item.animation).padStart(2, "0")}$`));
  }

  await expectClean(record);
  await context.close();
});

test("all 24 animations complete in order and persist the finished state", async ({ browser }) => {
  test.setTimeout(240_000);
  const context = await newContext(browser, profiles.desktop);
  const page = await context.newPage();
  const record = monitor(page, "24-animation completion");
  await page.goto(`${BASE}?animation=01`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);

  for (let animation = 1; animation <= 24; animation += 1) {
    const publicNumber = String(animation).padStart(2, "0");
    await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
    await expect(page.locator("#cinema-type"), `animation ${publicNumber}`).toContainText(`${publicNumber} / 24`);
    await page.locator("#timeline-progress").fill("998");
    await page.locator("#play-cinema").click();
    await expect(page.locator("#cinema-complete"), `animation ${publicNumber} completes`).toBeVisible({ timeout: 15_000 });
    if (animation < 24) {
      await page.locator("#complete-next-story").click();
      await expect(page.locator("#cinema-complete")).toBeHidden();
    }
  }

  await expect(page.locator("#cinema-complete-title")).toHaveText("二十四篇動畫長卷已看完");
  await expect(page.locator("#complete-next-story")).toBeDisabled();
  await expect(page.locator("#animation-progress-label")).toContainText("已觀看 24 / 24");
  const watched = await page.evaluate(() => JSON.parse(localStorage.getItem("kk-animation-watched-v9") || "[]"));
  expect(new Set(watched).size).toBe(24);

  await page.goto(`${BASE}#film-reel`, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await expect(page.locator("#animation-progress-label")).toContainText("已觀看 24 / 24");
  await expectClean(record);
  await context.close();
});

test("responsive matrix has no homepage or player horizontal regression", async ({ browser }) => {
  const matrix = [
    [320, 568, true],
    [360, 640, true],
    [390, 844, true],
    [844, 390, false],
    [1440, 900, false]
  ];
  for (const [width, height, isMobile] of matrix) {
    const context = await newContext(browser, { width, height, isMobile, hasTouch: isMobile, userAgent: isMobile ? MOBILE_UA : undefined });
    const page = await context.newPage();
    const label = `${width}x${height}`;
    await page.goto(`${BASE}#film-reel`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await viewportAudit(page, `${label} homepage`, width <= 760 ? [".mobile-quick-nav", "#nav-toggle"] : []);
    await page.goto(`${BASE}?animation=24`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await expect(page.locator("#cinema-dialog")).toHaveAttribute("open", "", { timeout: 20_000 });
    await viewportAudit(page, `${label} player`, ["#close-cinema", "#play-cinema", "#timeline-progress"]);
    await context.close();
  }
});
