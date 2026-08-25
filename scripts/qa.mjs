import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const registry = fs.readFileSync(path.join(root, "assets/data/scenes.js"), "utf8");
const filmRegistry = fs.readFileSync(path.join(root, "assets/data/film-productions.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(registry, sandbox);
vm.runInContext(filmRegistry, sandbox);

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

for (const required of ["index.html", "story.html", "story-zh-hans.html", "story-en.html", "story-ja.html", "assets/css/cinematic-revamp-core.css", "assets/js/cinematic-revamp-core.js", "assets/data/film-productions.js", "assets/data/scene-manifest.json", "assets/vendor/gsap/gsap.min.js", "assets/vendor/gsap/ScrollTrigger.min.js", "docs/V6.2-mother-script.md", "docs/V7.1-GSAP-production-notes.md"]) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`缺必要檔：${required}`);
}

const fmCBaseShotNames = ["object", "theatre", "corridor", "doors", "shadows"];
for (let index = 1; index <= 5; index += 1) {
  const number = String(index).padStart(2, "0");
  for (const suffix of [fmCBaseShotNames[index - 1], "action"]) {
    const shot = path.join(root, `assets/img/films/fm-c-act4/shot-${number}-${suffix}.webp`);
    if (!fs.existsSync(shot)) errors.push(`第四部第${index}幕缺少${suffix === "action" ? "動作" : "建立"}鏡位`);
  }
}
for (const shotName of ["shot-04-handoff.webp", "shot-04-handle.webp", "shot-04-stepback.webp"]) {
  const shot = path.join(root, "assets/img/films/fm-c-act4", shotName);
  if (!fs.existsSync(shot)) errors.push(`第四部第四幕缺少加強動作鏡位：${shotName}`);
}
for (const shotName of [
  "shot-01-approach.webp", "shot-01-shadow-contact.webp", "shot-01-hands-law.webp",
  "shot-02-route.webp", "shot-02-handoff-chain.webp", "shot-02-empty-chair.webp",
  "shot-03-cloth-form.webp", "shot-03-signals.webp", "shot-03-adult-page.webp",
]) {
  const shot = path.join(root, "assets/img/films/fm-c-act4", shotName);
  if (!fs.existsSync(shot)) errors.push(`第四部前三幕缺少語意動作鏡位：${shotName}`);
}
if (!fs.existsSync(path.join(root, "assets/vendor/gsap/MotionPathPlugin.min.js"))) errors.push("第四幕缺少 GSAP MotionPathPlugin 正式資產");

const app = fs.readFileSync(path.join(root, "assets/js/cinematic-revamp-core.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const story = fs.readFileSync(path.join(root, "story.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/cinematic-revamp-core.css"), "utf8");
for (const token of ["gsap.timeline", "gsap.matchMedia", "ScrollTrigger.batch", "stepTimes", "kill()", "applyStaticVisuals", "addProductionAct", "syncSceneAudioToTimeline"]) {
  if (!app.includes(token) && !html.includes(token)) errors.push(`GSAP實作缺少：${token}`);
}
if (html.indexOf("gsap.min.js") > html.indexOf("cinematic-revamp.js")) errors.push("GSAP載入順序晚於cinematic-revamp.js");
if (!html.includes('id="cinema-atmosphere"') || !html.includes('id="cinema-focus"') || !html.includes('id="film-production"')) errors.push("電影化舞臺圖層不完整");
if (!html.includes('class="cinema-visual"')) errors.push("手機版舞臺與對話區尚未分層");
if (!html.includes('id="nav-toggle"') || !html.includes('id="reading-progress-bar"')) errors.push("手機導覽或閱讀進度尚未接入");
if (!html.includes('class="entry-gate"') || !html.includes('class="hero-brief"') || !html.includes('id="reading-map"')) errors.push("參考專題式序幕、案件快覽或閱讀地圖尚未接入");
if (!html.includes('class="full-copy"') || !css.includes(".inline-story h2") || !app.includes("setupCopyNavigation")) errors.push("正文層級、章節標記或導覽狀態尚未加強");
if ((html.match(/<\/main>/g) || []).length !== 1) errors.push("首頁主要內容結束標籤數量不正確");
if (html.includes('id="sound-toggle"') || app.includes("待掛曲")) errors.push("公開頁面仍顯示未完成的音樂控制");
if (!html.includes('id="source-guide"') || !story.includes('id="source-index"')) errors.push("來源分層或完整來源索引尚未公開");
if (!css.includes("@media (max-width: 760px)") || !css.includes("height: clamp(410px, 112vw, 690px)") || !css.includes('.cinema-stage[data-type="side"] .cinema-actor img')) errors.push("手機舞臺比例或全身角色構圖尚未重構");
if (!app.includes("productionView") || !css.includes('.film-production[data-film="FM-C"]')) errors.push("手機電影構圖或雙世界分割尚未接入");
if (!app.includes("FM_C_ACT_SHOTS") || !app.includes("data-shot-kind") || !css.includes(".fm-c-live-fx")) errors.push("第四部五幕仍缺多鏡位或動態效果層");
if (!app.includes("filmEncounterRig") || !app.includes("filmInformationRig") || !app.includes("filmSilenceRig")) errors.push("第四部前三幕仍缺靠近、延誤或制度遮蔽的專屬動態層");
if (!app.includes('kind: "shadow-contact"') || !app.includes('kind: "empty-chair"') || !app.includes('kind: "adult-page"')) errors.push("第四部前三幕仍缺關鍵語意鏡位");
if (!css.includes(".encounter-shadow") || !css.includes(".information-route") || !css.includes(".silence-form-grid")) errors.push("第四部前三幕專屬 GSAP 視覺層樣式不完整");
if (!app.includes('playFmCFoley("wood")') || !app.includes('playFmCFoley("notice")') || !app.includes('playFmCFoley("stamp")')) errors.push("第四部前三幕木門、通知或印章環境聲未接入");
if (!app.includes("filmResponsibilityRig") || !app.includes("playFmCFoley") || !css.includes(".fm-c-responsibility-rig")) errors.push("第四部第四幕仍缺責任交接、門把或環境聲動態");
if (!app.includes("filmDutyThreadTransfers") || !app.includes("filmDutyStamps") || !app.includes("filmDutyAdults") || !app.includes("filmDutyTitle") || !app.includes("motionPath: { path:")) errors.push("第四部第四幕仍缺絲線路徑、印章、成人對焦或責任定格");
if (!html.includes("MotionPathPlugin.min.js") || !css.includes(".duty-responsibility-title")) errors.push("第四部第四幕 MotionPathPlugin 或責任標題未載入正式頁");
if (!filmRegistry.includes("椅仔姑與剴剴｜兩人合聲")) errors.push("第四部古句尚未改成兩人合聲");
if (app.includes(".stats-band") || app.includes('trigger: ".stats-band"')) errors.push("播放器仍引用不存在的stats-band動畫目標");
if (!html.includes('id="cinema-play-overlay"') || !html.includes('id="share-cinema"') || !app.includes("shareCinema")) errors.push("播放器中央播放鍵或單場分享尚未接入");
if (!html.includes('class="cinema-control-dock"') || !css.includes(".cinema-control-dock { position: fixed")) errors.push("播放器控制列尚未固定於可視範圍");
if (!html.includes('href="story.html">省流量文字版')) errors.push("首頁尚未提供明確的省流量文字入口");
if (!html.includes('href="tel:113"') || !html.includes('href="tel:110"') || !html.includes('href="tel:119"')) errors.push("臺灣求助卡尚未提供直撥連結");
if (!html.includes('type="application/ld+json"') || !html.includes('name="twitter:title"')) errors.push("首頁JSON-LD或Twitter分享資訊不完整");
if (story.includes("PRODUCTION SPEC") || story.includes("本區只放讀者會看到的文字")) errors.push("繁中公開文字版仍顯示內部製作備註");
if (order.slice(17, 21).join(",") !== "FM-D,SP08,DV08,FM-B") errors.push("第八篇動畫編號未依閱讀順序排列");

for (const [file, lang] of [["story-zh-hans.html", "zh-Hans"], ["story-en.html", "en"], ["story-ja.html", "ja"]]) {
  const localePage = fs.readFileSync(path.join(root, file), "utf8");
  if (!localePage.includes(`<html lang="${lang}">`) || !localePage.includes("story-locales")) errors.push(`${file}語言或切換導覽不完整`);
  if (!localePage.includes("story-mode") || !localePage.includes("story-help") || !localePage.includes('href="tel:113"')) errors.push(`${file}省流量標籤或在地求助提示不完整`);
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

const homeDownloads = html.match(/<a\b[^>]*\bdownload\b[^>]*>/gi) || [];
const unexpectedHomeDownloads = homeDownloads.filter((tag) => !/href="assets\/data\/timeline-115-days\.csv"/i.test(tag));
if (unexpectedHomeDownloads.length || /<a\b[^>]*\bdownload\b/i.test(story)) errors.push("網頁仍存在未核准的下載連結");
if (!html.includes('id="full-copy"') || !html.includes('id="inline-story-content"') || !app.includes("loadInlineStory")) errors.push("完整文案尚未整合到主頁");
if (!html.includes("fm-c-two-worlds-v2.webp") || !registry.includes("淺藍與深藍條紋上衣")) errors.push("剴剴服裝未鎖定淺藍／深藍條紋");
if (!app.includes("actorPosePlan") || !app.includes("setActorSprites") || !app.includes("SIDE_POSE_ROOT")) errors.push("多姿勢角色切換尚未接入播放器");

const placementBlock = app.match(/const INLINE_PLACEMENTS = \[([\s\S]*?)\n  \];/)?.[1] || "";
for (const id of order) {
  const occurrences = (placementBlock.match(new RegExp(`"${id}"`, "g")) || []).length;
  if (occurrences !== 1) errors.push(`隨文動畫配置${id}應出現1次，實際${occurrences}次`);
}
if (!app.includes("insertInlineScenes") || !app.includes("enhanceStoryTypography") || !app.includes("animateNewContent")) errors.push("隨文動畫、正文圖章或GSAP進場尚未接入");
for (const colour of ["--xuanqing", "--dailan", "--tianshui", "--xieqing", "--yuebai", "--zhusha", "--yanzhi", "--zheshi", "--songhua", "--ehuang", "--wujin", "--xuanzhi"]) {
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
