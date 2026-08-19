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
for (const token of ["gsap.timeline", "gsap.matchMedia", "ScrollTrigger.batch", "timeline-progress", "stepTimes", "kill()", "applyStaticVisuals"]) {
  if (!app.includes(token) && !html.includes(token)) errors.push(`GSAP實作缺少：${token}`);
}
if (html.indexOf("gsap.min.js") > html.indexOf("app.js")) errors.push("GSAP載入順序晚於app.js");
if (!html.includes("stage-atmosphere") || !html.includes("stage-focus-light") || !html.includes("stage-red-thread")) errors.push("電影化舞臺圖層不完整");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("QA PASS｜24場＝10皮影＋10陰翳側視＋4電影；每場10動作節拍；GSAP時間軸、本地資產、進度控制與靜態備援齊全。 ");
