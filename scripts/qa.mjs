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

for (const required of ["index.html", "story.html", "assets/css/styles.css", "assets/js/app.js", "assets/data/scene-manifest.json", "assets/vendor/gsap/gsap.min.js", "assets/vendor/gsap/ScrollTrigger.min.js", "docs/V6.2-mother-script.md", "docs/V7.1-GSAP-production-notes.md"]) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`缺必要檔：${required}`);
}

const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const story = fs.readFileSync(path.join(root, "story.html"), "utf8");
for (const token of ["gsap.timeline", "gsap.matchMedia", "ScrollTrigger.batch", "timeline-progress", "stepTimes", "kill()", "applyStaticVisuals"]) {
  if (!app.includes(token) && !html.includes(token)) errors.push(`GSAP實作缺少：${token}`);
}
if (html.indexOf("gsap.min.js") > html.indexOf("app.js")) errors.push("GSAP載入順序晚於app.js");
if (!html.includes("stage-atmosphere") || !html.includes("stage-focus-light") || !html.includes("stage-red-thread")) errors.push("電影化舞臺圖層不完整");

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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("QA PASS｜24場＝10皮影＋10陰翳側視＋4電影；每場10動作節拍；男女各12姿勢、14張唯一場景主視覺、完整內嵌文案、GSAP時間軸與靜態備援齊全。");
