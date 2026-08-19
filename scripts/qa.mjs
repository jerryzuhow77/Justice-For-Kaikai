import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const registry = fs.readFileSync(path.join(root, "assets/data/scenes.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(registry, sandbox);

const scenes = sandbox.window.KAIKAI_SCENES;
const order = sandbox.window.KAIKAI_SCENE_ORDER;
const errors = [];
const ids = new Set();

if (scenes.length !== 24) errors.push(`場次應為24，實際為${scenes.length}`);
if (scenes.filter((s) => s.type === "shadow").length !== 10) errors.push("皮影場次不是10");
if (scenes.filter((s) => s.type === "side").length !== 10) errors.push("側視場次不是10");
if (scenes.filter((s) => s.type === "film").length !== 4) errors.push("電影場次不是4");
if (order.length !== 24 || new Set(order).size !== 24) errors.push("正式順序不是24個唯一ID");

for (const scene of scenes) {
  if (ids.has(scene.id)) errors.push(`重複scene_id：${scene.id}`);
  ids.add(scene.id);
  if (!order.includes(scene.id)) errors.push(`正式順序缺少：${scene.id}`);
  if (!Array.isArray(scene.actions) || scene.actions.length !== 10) errors.push(`${scene.id}動作節拍不是10`);
  if (!Array.isArray(scene.dialogue) || scene.dialogue.length === 0) errors.push(`${scene.id}沒有對話`);
  if (!scene.source) errors.push(`${scene.id}沒有來源牌`);
  if (scene.image && !fs.existsSync(path.join(root, scene.image))) errors.push(`${scene.id}缺圖：${scene.image}`);
}

for (const required of ["index.html", "story.html", "story-zh-hans.html", "story-en.html", "story-ja.html", "assets/css/styles.css", "assets/js/app.js", "assets/data/scene-manifest.json", "assets/vendor/gsap/gsap.min.js", "assets/vendor/gsap/ScrollTrigger.min.js", "docs/V6.2-mother-script.md", "docs/V7.1-GSAP-production-notes.md"]) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`缺必要檔：${required}`);
}

const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const story = fs.readFileSync(path.join(root, "story.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/styles.css"), "utf8");
for (const token of ["gsap.timeline", "gsap.matchMedia", "ScrollTrigger.batch", "timeline-progress", "stepTimes", "kill()", "applyStaticVisuals"]) {
  if (!app.includes(token) && !html.includes(token)) errors.push(`GSAP實作缺少：${token}`);
}
if (html.indexOf("gsap.min.js") > html.indexOf("app.js")) errors.push("GSAP載入順序晚於app.js");
if (!html.includes("stage-atmosphere") || !html.includes("stage-focus-light") || !html.includes("stage-red-thread")) errors.push("電影化舞臺圖層不完整");
if (!html.includes('id="stage-visual"')) errors.push("手機版舞臺與對話區尚未分層");
if (!html.includes('id="nav-toggle"') || !html.includes('id="reading-progress-bar"')) errors.push("手機導覽或閱讀進度尚未接入");
if (!html.includes('id="toggle-all-scenes"') || !app.includes("FEATURED_SCENE_IDS")) errors.push("六場精選與24場總覽切換尚未接入");
if (html.includes('id="sound-toggle"') || app.includes("待掛曲")) errors.push("公開頁面仍顯示未完成的音樂控制");
if (!html.includes('id="source-guide"') || !story.includes('id="source-index"')) errors.push("來源分層或完整來源索引尚未公開");

for (const [file, lang] of [["story-zh-hans.html", "zh-Hans"], ["story-en.html", "en"], ["story-ja.html", "ja"]]) {
  const localePage = fs.readFileSync(path.join(root, file), "utf8");
  if (!localePage.includes(`<html lang="${lang}">`) || !localePage.includes("story-locales")) errors.push(`${file}語言或切換導覽不完整`);
}

const sideImages = scenes.filter((scene) => scene.type === "side").map((scene) => scene.image);
const filmImages = scenes.filter((scene) => scene.type === "film").map((scene) => scene.image);
if (new Set(sideImages).size !== 10) errors.push("十場陰翳側視未使用十張唯一場景圖");
if (new Set(filmImages).size !== 4) errors.push("四場電影式動畫未使用四張唯一主視覺");

for (const sex of ["female", "male"]) {
  for (let index = 1; index <= 12; index += 1) {
    const number = String(index).padStart(2, "0");
    const shadowAsset = path.join(root, `public/media/poses/${sex}-${number}.webp`);
    const sideAsset = path.join(root, `assets/img/actors/side/guardian-${sex}-${number}.webp`);
    if (!fs.existsSync(shadowAsset)) errors.push(`皮影${sex}缺少姿勢${number}`);
    if (!fs.existsSync(sideAsset)) errors.push(`守門人${sex}缺少姿勢${number}`);
  }
}

if (/<a\b[^>]*\bdownload\b/i.test(html) || /<a\b[^>]*\bdownload\b/i.test(story)) errors.push("網頁仍存在下載連結");
if (!html.includes('id="full-copy"') || !html.includes('id="inline-story-content"') || !app.includes("loadInlineStory")) errors.push("完整文案尚未整合到主頁");
if (!html.includes("fm-c-two-worlds-v2.webp") || !registry.includes("淺藍與深藍條紋上衣")) errors.push("剴剴服裝未鎖定淺藍／深藍條紋");
if (!app.includes("actorPosePlan") || !app.includes("setActorSprites") || !app.includes("SIDE_POSE_ROOT")) errors.push("多姿勢角色切換尚未接入播放器");

const placementBlock = app.match(/const INLINE_SCENE_PLACEMENTS = \[([\s\S]*?)\n  \];/)?.[1] || "";
for (const anchor of [...placementBlock.matchAll(/anchor: "([^"]+)"/g)].map((match) => match[1])) {
  if (!story.includes(`id="${anchor}"`)) errors.push(`隨文動畫找不到文案錨點：${anchor}`);
}
for (const id of order) {
  const occurrences = (placementBlock.match(new RegExp(`"${id}"`, "g")) || []).length;
  if (occurrences !== 1) errors.push(`隨文動畫配置${id}應出現1次，實際${occurrences}次`);
}
if (!app.includes("insertInlineScenes") || !app.includes("decorateInlineCopy") || !app.includes("setupInlineStoryMotion")) errors.push("隨文動畫、正文圖章或GSAP進場尚未接入");
for (const colour of ["--xuanqing", "--dailan", "--tianshuibi", "--xieqing", "--yuebai", "--zhusha", "--yanzhi", "--zheshi", "--songhua", "--ehuang", "--wujin", "--xuanzhi"]) {
  if (!css.includes(colour)) errors.push(`缺少中國傳統色變數：${colour}`);
}
for (let index = 1; index <= 12; index += 1) {
  const badge = path.join(root, `assets/img/badges/minnan-${String(index).padStart(2, "0")}.webp`);
  if (!fs.existsSync(badge)) errors.push(`缺少閩南工藝圖章${index}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("QA PASS｜24場動畫各自嵌入文案一次；12枚大型半透明閩南圖章、12項中國傳統色、48張角色姿勢、14張唯一主視覺、GSAP時間軸與靜態備援齊全。");
