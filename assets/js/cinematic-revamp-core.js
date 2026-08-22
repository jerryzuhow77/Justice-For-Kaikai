(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const scenes = (window.KAIKAI_SCENES || []).slice();
  const order = (window.KAIKAI_SCENE_ORDER || scenes.map((scene) => scene.id)).slice();
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const hasGSAP = Boolean(window.gsap);
  const FILM_ORDER = ["FM-A", "FM-D", "FM-B", "FM-C"];
  const TYPE_LABELS = { film: "主線電影", shadow: "皮影詩劇", side: "陰翳側視劇場" };
  const ACT_LABELS = { "FM-A": "第一幕", "FM-D": "第二幕", "FM-B": "第三幕", "FM-C": "第四幕" };
  const FILM_POSITIONS = { "FM-A": "9% 50%", "FM-D": "36% 50%", "FM-B": "70% 50%", "FM-C": "50% 50%" };
  const SCORE_TRACKS = Object.fromEntries(Array.from({ length: 6 }, (_, index) => {
    const chapter = String(index + 1).padStart(2, "0");
    return [chapter, { src: `public/media/chapter-${chapter}.m4a`, label: `第 ${chapter} 章原創配樂` }];
  }));
  const INLINE_PLACEMENTS = [
    { match: ["開頭引言", "花會再開", "童年不會重來"], label: "序幕電影", scenes: ["FM-A"] },
    { match: ["皮影序問", "六扇門"], label: "序問雙劇場", scenes: ["SP00", "DV00"] },
    { match: ["古老的傳說", "綁在椅子上的孩子"], label: "第一篇章劇場", scenes: ["SP01", "DV01"] },
    { match: ["離開原來的家", "當孩子必須離開"], label: "第二篇章劇場", scenes: ["SP02", "DV02"] },
    { match: ["越來越多求救", "進入制度"], label: "第三篇章劇場", scenes: ["SP03", "DV03"] },
    { match: ["隔著布簾", "急診記憶"], label: "第四篇章劇場", scenes: ["SP04", "DV04"] },
    { match: ["兒福聯盟的誕生", "一紙修法"], label: "第五篇章劇場", scenes: ["SP05", "DV05"] },
    { match: ["珮珮", "另一間病房"], label: "第六篇章劇場", scenes: ["SP06", "DV06"] },
    { match: ["制度留下的接縫", "從珮珮到剴剴"], label: "第七篇章劇場", scenes: ["SP07", "DV07"] },
    { match: ["外婆的眼淚", "第二章前夜"], label: "第八篇章前奏", scenes: ["FM-D", "SP08", "DV08"] },
    { match: ["外婆含淚的指責", "正文收束"], label: "法庭電影", scenes: ["FM-B"] },
    { match: ["結尾皮影戲", "下一扇門更早打開"], label: "終章三聯劇場", scenes: ["SP09", "DV09", "FM-C"] }
  ];

  const MOTION_POSES = [
    { f: [-18, 0, -2, .98], m: [18, 0, 2, 1] },
    { f: [14, -3, 2, 1], m: [-4, 6, -1, .99] },
    { f: [38, 0, -1, .97], m: [-22, 0, -3, 1] },
    { f: [10, 20, 5, .96], m: [-46, 2, 0, 1] },
    { f: [56, -2, -4, 1], m: [-58, -2, 4, 1] },
    { f: [68, 14, 6, .96], m: [-68, 14, -6, .96] },
    { f: [30, -4, -8, 1], m: [-22, 2, 8, 1] },
    { f: [-10, 26, 5, .95], m: [10, 30, -5, .95] },
    { f: [-46, 0, -4, 1], m: [46, 0, 4, 1] },
    { f: [-76, -2, 0, 1], m: [76, -2, 0, 1] }
  ];

  const FILM_DIRECTIONS = {
    "FM-A": {
      bridge: "thread",
      shots: [
        { scale: 1.02, x: -1, y: 0, light: -28, thread: .12, fx: "mist" },
        { scale: 1.1, x: -5, y: 1, light: -18, thread: .19, fx: "mist" },
        { scale: 1.16, x: -10, y: 2, light: -8, thread: .3, fx: "thread" },
        { scale: 1.08, x: -4, y: -1, light: 2, thread: .36, fx: "door" },
        { scale: 1.22, x: 4, y: 0, light: 10, thread: .45, fx: "mist" },
        { scale: 1.28, x: 10, y: 1, light: 18, thread: .55, fx: "thread" },
        { scale: 1.16, x: 5, y: -1, light: 24, thread: .64, fx: "thread" },
        { scale: 1.25, x: 13, y: 0, light: 30, thread: .74, fx: "papers" },
        { scale: 1.18, x: 8, y: -2, light: 20, thread: .87, fx: "papers" },
        { scale: 1.06, x: 1, y: 0, light: 0, thread: 1, fx: "thread" }
      ]
    },
    "FM-D": {
      bridge: "rain",
      shots: [
        { scale: 1.05, x: -8, y: 1, light: -22, thread: .18, fx: "thread" },
        { scale: 1.16, x: -11, y: 2, light: -12, thread: .27, fx: "thread" },
        { scale: 1.12, x: -4, y: 0, light: -4, thread: .34, fx: "mist" },
        { scale: 1.22, x: 2, y: -1, light: 5, thread: .41, fx: "rain" },
        { scale: 1.28, x: 6, y: 0, light: 13, thread: .49, fx: "papers" },
        { scale: 1.18, x: 1, y: 1, light: 20, thread: .57, fx: "mist" },
        { scale: 1.3, x: 10, y: 0, light: 28, thread: .68, fx: "rain" },
        { scale: 1.34, x: 14, y: 1, light: 34, thread: .78, fx: "door" },
        { scale: 1.2, x: 8, y: -1, light: 22, thread: .88, fx: "mist" },
        { scale: 1.08, x: 1, y: 0, light: 6, thread: 1, fx: "rain" }
      ]
    },
    "FM-B": {
      bridge: "hair",
      shots: [
        { scale: 1.05, x: -10, y: 0, light: -30, thread: .14, fx: "thread" },
        { scale: 1.15, x: -7, y: 1, light: -20, thread: .24, fx: "mist" },
        { scale: 1.21, x: -2, y: 0, light: -10, thread: .34, fx: "thread" },
        { scale: 1.26, x: 3, y: -1, light: 0, thread: .43, fx: "rain" },
        { scale: 1.18, x: 0, y: 0, light: 10, thread: .53, fx: "mist" },
        { scale: 1.28, x: 8, y: 1, light: 18, thread: .63, fx: "thread" },
        { scale: 1.24, x: 12, y: 0, light: 25, thread: .73, fx: "papers" },
        { scale: 1.36, x: 17, y: -1, light: 32, thread: .82, fx: "mist" },
        { scale: 1.22, x: 11, y: 0, light: 20, thread: .91, fx: "papers" },
        { scale: 1.08, x: 2, y: 0, light: 4, thread: 1, fx: "door" }
      ]
    },
    "FM-C": {
      bridge: "door",
      shots: [
        { scale: 1.02, x: 0, y: 0, light: 0, thread: .12, fx: "door" },
        { scale: 1.12, x: -12, y: 0, light: -22, thread: .2, fx: "mist" },
        { scale: 1.14, x: 12, y: 0, light: 22, thread: .28, fx: "mist" },
        { scale: 1.2, x: 0, y: -1, light: 0, thread: .38, fx: "door" },
        { scale: 1.18, x: 8, y: 0, light: 18, thread: .48, fx: "papers" },
        { scale: 1.22, x: -8, y: 1, light: -18, thread: .58, fx: "papers" },
        { scale: 1.13, x: 2, y: 2, light: 4, thread: .68, fx: "rain" },
        { scale: 1.26, x: -5, y: 0, light: -12, thread: .78, fx: "mist" },
        { scale: 1.28, x: 6, y: 0, light: 14, thread: .88, fx: "door" },
        { scale: 1.04, x: 0, y: 0, light: 0, thread: 1, fx: "open-door" }
      ]
    }
  };

  const SHADOW_POSE_ROOT = "public/media/poses";
  const SIDE_POSE_ROOT = "assets/img/actors/side";
  const posePlanCache = new Map();
  let copyNavObserver = null;
  let readingProgressFrame = 0;

  const state = {
    reduced: localStorage.getItem("kk-reduced-v8") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    navOpen: false,
    pageMedia: null,
    musicEnabled: localStorage.getItem("kk-music-v8") !== "false",
    player: {
      mode: "single",
      sequence: [],
      stepMeta: [],
      stepTimes: [],
      stepIndex: 0,
      timeline: null,
      playing: false,
      currentScene: null,
      currentBackdrop: 0,
      returnFocus: null,
      returnUrl: null,
      shareTimer: null
    }
  };

  const header = $("#site-header");
  const main = $("#main");
  const entryGate = $("#entry-gate");
  const nav = $("#main-nav");
  const navToggle = $("#nav-toggle");
  const motionToggle = $("#motion-toggle");
  const sceneGrid = $("#scene-grid");
  const filmActGrid = $("#film-act-grid");
  const dialog = $("#cinema-dialog");
  const stage = $("#cinema-stage");
  const bgA = $("#cinema-bg-a");
  const bgB = $("#cinema-bg-b");
  const depthFar = $("#cinema-depth-far");
  const depthMid = $("#cinema-depth-mid");
  const depthNear = $("#cinema-depth-near");
  const atmosphere = $("#cinema-atmosphere");
  const rain = $("#cinema-rain");
  const mist = $("#cinema-mist");
  const focusLight = $("#cinema-focus");
  const door = $("#cinema-door");
  const thread = $("#cinema-thread");
  const papers = $("#cinema-papers");
  const stageProp = $("#cinema-prop");
  const actorFemale = $("#cinema-actor-female");
  const actorMale = $("#cinema-actor-male");
  const actorFemaleImage = $("img", actorFemale);
  const actorMaleImage = $("img", actorMale);
  const dialogueBox = $("#dialogue-box");
  const transcript = $("#transcript");
  const cinemaAudio = $("#cinema-audio");
  const cinemaAudioBar = $("#cinema-audio-bar");
  const cinemaAudioTrack = $("#cinema-audio-track");
  const musicToggle = $("#toggle-music");
  const scoreLibraryAudio = $("#score-library-audio");
  const scoreLibraryLabel = $("#score-library-label");
  const scoreLibraryButtons = $$("[data-score]");
  const progressInput = $("#timeline-progress");
  const timelineTime = $("#timeline-time");

  if (hasGSAP) {
    document.documentElement.classList.add("has-gsap");
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
  }

  function setPageGate(locked) {
    document.body.classList.toggle("is-gated", locked);
    if (header) header.inert = locked;
    if (main) main.inert = locked;
    entryGate?.setAttribute("aria-hidden", String(!locked));
  }

  function enterSite(target = "#top") {
    setPageGate(false);
    sessionStorage.setItem("kk-entered-v8", "true");
    window.setTimeout(() => {
      const targetElement = $(target);
      if (target !== "#top") targetElement?.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "start" });
      window.ScrollTrigger?.refresh();
    }, 120);
  }

  function refreshMotionUi() {
    document.body.classList.toggle("is-reduced", state.reduced);
    if (motionToggle) {
      motionToggle.textContent = state.reduced ? "低動態" : "動態";
      motionToggle.setAttribute("aria-pressed", String(state.reduced));
    }
    const gateToggle = $("#gate-reduced");
    if (gateToggle) gateToggle.checked = state.reduced;
  }

  function setReduced(enabled) {
    state.reduced = Boolean(enabled);
    localStorage.setItem("kk-reduced-v8", String(state.reduced));
    refreshMotionUi();
    pausePlayback();
    teardownPageMotion();
    setupPageMotion();
    if (dialog?.open) {
      buildTimeline();
      goToStep(state.player.stepIndex);
    }
  }

  function setNavOpen(open) {
    state.navOpen = Boolean(open);
    nav?.classList.toggle("is-open", state.navOpen);
    navToggle?.setAttribute("aria-expanded", String(state.navOpen));
    if (navToggle) navToggle.textContent = state.navOpen ? "關閉" : "選單";
  }

  function updateReadingProgress() {
    readingProgressFrame = 0;
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = clamp(window.scrollY / available, 0, 1);
    const bar = $("#reading-progress-bar");
    if (bar) bar.style.width = `${ratio * 100}%`;
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, "").replace(/[｜|：:、，。；！？「」『』【】（）()]/g, "").toLowerCase();
  }

  function speakerTone(value) {
    const speaker = String(value || "").trim();
    if (/醫師|護理/.test(speaker)) return "medical";
    if (/照顧者|外婆|家屬|剴剴/.test(speaker)) return "family";
    if (/^(女|嫂)|婦人|椅仔姑/.test(speaker)) return "female";
    if (/^(男|兄)/.test(speaker)) return "male";
    return "narrator";
  }

  function enhanceStoryTypography(target) {
    $$('blockquote', target).forEach((quote) => {
      const text = normalizeText(quote.textContent);
      let type = "callout-quote";
      if (/來源門牌|官方資訊|資料口徑/.test(text)) type = "callout-source";
      else if (/非案件人物對話|非真實錄音|閱讀界線|情境重構說明|編輯註/.test(text)) type = "callout-boundary";
      else if (/過場句|記住他|願下一個孩子|花有重開日/.test(text)) type = "callout-key";
      quote.classList.add(type);
    });

    $$("p", target).forEach((paragraph) => {
      const label = $("strong", paragraph)?.textContent || "";
      const tone = speakerTone(label);
      if (tone !== "narrator") {
        paragraph.classList.add("story-dialogue", `dialogue-${tone}`);
        const item = paragraph.closest("li");
        if (item) {
          item.classList.add("dialogue-item");
          item.closest("ul")?.classList.add("dialogue-list");
        }
        return;
      }
      if (paragraph.closest("blockquote")) return;
      const text = normalizeText(paragraph.textContent);
      if (/孩子的一日不能寄放在下一日|傳說止於此紀錄從這裡開始|記住他不只是記住一場悲劇|願下一個孩子|下一扇門更早打開/.test(text)) paragraph.classList.add("story-key-line");
    });

    $$("h4", target).forEach((heading) => {
      const match = heading.textContent.trim().match(/^(\d{2})[｜|]/);
      if (match) heading.dataset.chapterNumber = match[1];
    });
    $$(':scope > ul, :scope > ol', target).forEach((list) => {
      if (!list.classList.contains("dialogue-list")) list.classList.add("story-fact-list");
    });

    $$(".dialogue-list", target).forEach((list) => {
      const details = document.createElement("details");
      details.className = "story-transcript";
      const summary = document.createElement("summary");
      const title = document.createElement("span"); title.textContent = "完整對話紀錄";
      const hint = document.createElement("small"); hint.textContent = "點擊可上下展開／收合";
      summary.append(title, hint);
      const body = document.createElement("div"); body.className = "story-transcript-body";
      list.replaceWith(details);
      body.append(list);
      details.append(summary, body);
    });
  }

  function poseAsset(scene, sex, poseNumber) {
    const number = String(poseNumber).padStart(2, "0");
    if (scene.type === "side") return `${SIDE_POSE_ROOT}/guardian-${sex}-${number}.webp`;
    return `${SHADOW_POSE_ROOT}/${sex}-${number}.webp`;
  }

  function semanticPose(scene, action, sex, actionIndex) {
    const side = scene.type === "side";
    const text = `${action} ${scene.motif || ""} ${scene.prop || ""}`;
    if (/門|門檻|推開|門縫|開門/.test(text)) return actionIndex >= 8 ? 12 : 11;
    if (/椅|椅腳|榫|跪|俯身/.test(text)) return sex === "female" ? (side ? 9 : 8) : (side ? 8 : 7);
    if (/線|繡線|布帶|線結|結繩|髮/.test(text)) return sex === "female" ? (side ? 7 : 5) : (side ? 7 : 10);
    if (/燈|提燈|舉燈|亮起|微光/.test(text)) return sex === "female" ? (side ? 5 : 3) : (side ? 6 : 9);
    if (/卷|頁|表|紀錄|文件|姓名|來源|信紙|判決|筆|核對|資料/.test(text)) return sex === "female" ? (side ? 4 : 6) : (side ? (actionIndex > 6 ? 10 : 3) : (actionIndex > 6 ? 10 : 4));
    if (/聽|側耳|交頭|回看|回望/.test(text)) return sex === "female" ? (side ? 3 : 2) : (side ? 4 : 3);
    if (/走|入場|離席|靠近|前行|退到|穿過/.test(text)) return sex === "female" ? (side ? 2 : 1) : 2;
    if (/扶|觸摸|按住|放下|校準|接住|交付/.test(text)) return sex === "female" ? (side ? 6 : 6) : (side ? 9 : 8);
    if (/印章|停筆|擋住|停止|停住/.test(text)) return sex === "female" ? (side ? 8 : 1) : (side ? 5 : 1);
    return (actionIndex % 10) + 1;
  }

  function actorPosePlan(scene, sex) {
    const key = `${scene.id}:${sex}`;
    if (posePlanCache.has(key)) return posePlanCache.get(key);
    const used = new Set();
    const plan = scene.actions.map((action, actionIndex) => {
      const preferred = semanticPose(scene, action, sex, actionIndex);
      const pool = [preferred, ...Array.from({ length: 12 }, (_, offset) => ((actionIndex + offset) % 12) + 1)];
      const chosen = pool.find((candidate) => !used.has(candidate)) || preferred;
      used.add(chosen);
      return chosen;
    });
    posePlanCache.set(key, plan);
    return plan;
  }

  function setActorSprites(scene, actionIndex) {
    if (!scene || scene.type === "film") return;
    const femalePose = actorPosePlan(scene, "female")[actionIndex];
    const malePose = actorPosePlan(scene, "male")[actionIndex];
    const femaleSrc = poseAsset(scene, "female", femalePose);
    const maleSrc = poseAsset(scene, "male", malePose);
    if (actorFemaleImage.getAttribute("src") !== femaleSrc) actorFemaleImage.src = femaleSrc;
    if (actorMaleImage.getAttribute("src") !== maleSrc) actorMaleImage.src = maleSrc;
    actorFemale.dataset.pose = String(femalePose);
    actorMale.dataset.pose = String(malePose);
  }

  function preloadSequence(sequence) {
    sequence.forEach((scene) => {
      if (scene.image) { const image = new Image(); image.src = scene.image; }
      if (scene.type !== "film") {
        ["female", "male"].forEach((sex) => actorPosePlan(scene, sex).forEach((pose) => { const image = new Image(); image.src = poseAsset(scene, sex, pose); }));
      }
    });
  }

  function createFilmActCard(scene, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "film-act-card";
    button.style.setProperty("--film-image", `url('${scene.image}')`);
    button.style.setProperty("--film-position", FILM_POSITIONS[scene.id] || "center");
    button.setAttribute("aria-label", `播放${ACT_LABELS[scene.id]}：${scene.title}`);
    const badge = document.createElement("span"); badge.textContent = `ACT ${String(index + 1).padStart(2, "0")}`;
    const copy = document.createElement("div");
    const small = document.createElement("small"); small.textContent = ACT_LABELS[scene.id];
    const heading = document.createElement("h3"); heading.textContent = scene.title;
    const paragraph = document.createElement("p"); paragraph.textContent = scene.subtitle;
    copy.append(small, heading, paragraph); button.append(badge, copy);
    button.addEventListener("click", () => openCinema(scene.id, "single"));
    return button;
  }

  function renderFilmActs() {
    if (!filmActGrid) return;
    filmActGrid.replaceChildren();
    FILM_ORDER.forEach((id, index) => { const scene = sceneById.get(id); if (scene) filmActGrid.append(createFilmActCard(scene, index)); });
  }

  function createLibraryTranscript(scene) {
    const details = document.createElement("details");
    details.className = "library-transcript";
    const summary = document.createElement("summary");
    const title = document.createElement("span"); title.textContent = `${TYPE_LABELS[scene.type]}逐字稿`;
    const hint = document.createElement("small"); hint.textContent = "上下展開／收合";
    summary.append(title, hint);
    const lines = document.createElement("div"); lines.className = "library-transcript-lines";
    scene.dialogue.forEach((line) => {
      const paragraph = document.createElement("p");
      const speaker = document.createElement("b"); speaker.textContent = line.speaker;
      const copy = document.createElement("span"); copy.textContent = line.text;
      paragraph.append(speaker, copy); lines.append(paragraph);
    });
    details.append(summary, lines);
    return details;
  }

  function createSceneCard(scene, position) {
    const item = document.createElement("article");
    item.className = `scene-library-item ${scene.type}`;
    item.dataset.type = scene.type;
    item.dataset.sceneId = scene.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scene-card ${scene.type}`;
    button.dataset.type = scene.type;
    button.dataset.sceneId = scene.id;
    button.setAttribute("aria-label", `播放${TYPE_LABELS[scene.type]}：${scene.title}`);
    const poster = document.createElement("span"); poster.className = "scene-card-poster";
    if (scene.image) poster.style.setProperty("--scene-poster", `url('${scene.image}')`);
    if (scene.type !== "film") {
      const previewBeat = scene.chapter === "終章" ? 9 : 4;
      ["female", "male"].forEach((sex) => {
        const image = document.createElement("img"); image.className = `scene-card-actor ${sex}`; image.alt = ""; image.loading = "lazy"; image.src = poseAsset(scene, sex, actorPosePlan(scene, sex)[previewBeat]); button.append(image);
      });
    }
    const play = document.createElement("span"); play.className = "scene-card-play"; play.textContent = scene.type === "film" ? "電影" : "播放";
    const meta = document.createElement("span"); meta.className = "scene-card-meta";
    const small = document.createElement("small"); small.textContent = `${String(position + 1).padStart(2, "0")} / 24 · ${scene.id} · ${TYPE_LABELS[scene.type]}`;
    const heading = document.createElement("h3"); heading.textContent = scene.title;
    const paragraph = document.createElement("p"); paragraph.textContent = scene.subtitle;
    meta.append(small, heading, paragraph); button.append(poster, play, meta);
    button.addEventListener("click", () => openCinema(scene.id, "single"));
    item.append(button);
    if (scene.type === "shadow" || scene.type === "side") item.append(createLibraryTranscript(scene));
    return item;
  }

  function renderSceneLibrary() {
    if (!sceneGrid) return;
    const fragment = document.createDocumentFragment();
    order.forEach((id, index) => { const scene = sceneById.get(id); if (scene) fragment.append(createSceneCard(scene, index)); });
    sceneGrid.replaceChildren(fragment);
  }

  function createInlineSceneCard(scene) {
    const button = document.createElement("button"); button.type = "button"; button.className = `copy-scene-card ${scene.type}`; button.setAttribute("aria-label", `播放隨文${TYPE_LABELS[scene.type]}：${scene.title}`);
    const poster = document.createElement("span"); poster.className = "copy-scene-poster";
    if (scene.image) poster.style.setProperty("--poster", `url('${scene.image}')`);
    if (scene.type !== "film") {
      ["female", "male"].forEach((sex) => { const image = document.createElement("img"); image.className = `copy-scene-actor ${sex}`; image.alt = ""; image.loading = "lazy"; image.src = poseAsset(scene, sex, actorPosePlan(scene, sex)[4]); poster.append(image); });
    }
    const meta = document.createElement("span"); meta.className = "copy-scene-meta";
    const small = document.createElement("small"); small.textContent = `${scene.id} · ${TYPE_LABELS[scene.type]}`;
    const strong = document.createElement("strong"); strong.textContent = scene.title;
    const description = document.createElement("span"); description.textContent = scene.subtitle;
    meta.append(small, strong, description); button.append(poster, meta);
    button.addEventListener("click", () => openCinema(scene.id, "single"));
    return button;
  }

  function findPlacementHeading(target, placement) {
    const headings = $$("h2, h3, h4", target);
    return headings.find((heading) => { const normalized = normalizeText(heading.textContent); return placement.match.some((needle) => normalized.includes(normalizeText(needle))); });
  }

  function insertInlineScenes(target) {
    const inserted = new Set();
    INLINE_PLACEMENTS.forEach((placement) => {
      const heading = findPlacementHeading(target, placement);
      if (!heading) return;
      const validScenes = placement.scenes.map((id) => sceneById.get(id)).filter(Boolean);
      if (!validScenes.length || validScenes.every((scene) => inserted.has(scene.id))) return;
      const group = document.createElement("aside"); group.className = "copy-scene-group"; group.setAttribute("aria-label", placement.label);
      const groupHeader = document.createElement("header");
      const label = document.createElement("span"); label.textContent = "文學化影像轉場";
      const title = document.createElement("b"); title.textContent = placement.label;
      const note = document.createElement("small"); note.textContent = `${validScenes.length} 部 · 點選後進入全螢幕劇場`;
      groupHeader.append(label, title, note);
      const grid = document.createElement("div"); grid.className = "copy-scene-grid";
      validScenes.forEach((scene) => { inserted.add(scene.id); grid.append(createInlineSceneCard(scene)); });
      group.append(groupHeader, grid); heading.insertAdjacentElement("afterend", group);
    });
  }

  function setupCopyNavigation(headings, navRoot) {
    copyNavObserver?.disconnect();
    const links = new Map($$("a", navRoot).map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
    const setCurrent = (id) => links.forEach((link, targetId) => { if (targetId === id) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
    if (headings[0]) setCurrent(headings[0].id);
    if (!("IntersectionObserver" in window)) return;
    copyNavObserver = new IntersectionObserver((entries) => { const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (current) setCurrent(current.target.id); }, { rootMargin: "-18% 0px -70% 0px", threshold: [0, 1] });
    headings.forEach((heading) => copyNavObserver.observe(heading));
  }

  async function loadInlineStory() {
    const target = $("#inline-story-content"); const navRoot = $("#copy-chapter-nav");
    if (!target || !navRoot) return;
    try {
      const response = await fetch("story.html", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const sourceDocument = new DOMParser().parseFromString(await response.text(), "text/html");
      const source = $(".story-content", sourceDocument);
      if (!source) throw new Error("完整文案節點不存在");
      source.querySelector("#title-block-header")?.remove(); source.querySelectorAll("a[download]").forEach((link) => link.remove());
      target.replaceChildren(...Array.from(source.childNodes).map((node) => node.cloneNode(true))); target.removeAttribute("aria-busy"); enhanceStoryTypography(target); insertInlineScenes(target);
      navRoot.replaceChildren(); const headings = $$("h2, h4", target);
      headings.forEach((heading, index) => { if (!heading.id) heading.id = `copy-heading-${index + 1}`; const link = document.createElement("a"); link.href = `#${heading.id}`; link.textContent = heading.textContent.replace(/\s+/g, " ").trim(); navRoot.append(link); });
      if (!headings.length) navRoot.textContent = "完整正文"; else setupCopyNavigation(headings, navRoot);
      animateNewContent(target); window.ScrollTrigger?.refresh();
    } catch (error) {
      target.removeAttribute("aria-busy");
      const paragraph = document.createElement("p"); paragraph.append("完整文案暫時無法嵌入本頁。請改用 ");
      const link = document.createElement("a"); link.href = "story.html"; link.textContent = "純文字閱讀模式"; paragraph.append(link, "。");
      target.replaceChildren(paragraph); navRoot.textContent = "載入失敗"; console.error("Inline story load failed", error);
    }
  }

  function totalSteps(scene) { return Math.max(10, scene.dialogue.length); }
  function actionIndexFor(scene, localStep) { return Math.min(9, Math.floor((localStep / totalSteps(scene)) * 10)); }
  function dialogueIndexFor(scene, localStep) { return Math.min(scene.dialogue.length - 1, Math.floor((localStep / totalSteps(scene)) * scene.dialogue.length)); }
  function stepDuration(scene, localStep) { const line = scene.dialogue[dialogueIndexFor(scene, localStep)]; return clamp(2.9 + String(line?.text || "").length * .025, 3.6, 6.5); }

  function createStepMeta(sequence) {
    const result = [];
    sequence.forEach((scene, sequenceIndex) => {
      const total = totalSteps(scene);
      for (let localStep = 0; localStep < total; localStep += 1) result.push({ scene, sequenceIndex, localStep, actionIndex: actionIndexFor(scene, localStep), dialogueIndex: dialogueIndexFor(scene, localStep), duration: stepDuration(scene, localStep), isSceneStart: localStep === 0, isSceneEnd: localStep === total - 1 });
    });
    return result;
  }

  function setBackdrop(scene, immediate = false) {
    const image = scene.image || "";
    const current = state.player.currentBackdrop === 0 ? bgA : bgB;
    const next = state.player.currentBackdrop === 0 ? bgB : bgA;
    if (scene.type === "shadow") [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => element.style.removeProperty("background-image"));
    else { const value = image ? `url('${image}')` : "none"; next.style.backgroundImage = value; [depthFar, depthMid, depthNear].forEach((element) => { element.style.backgroundImage = value; }); }
    if (!hasGSAP || immediate || state.reduced) { current.style.opacity = "0"; next.style.opacity = "1"; state.player.currentBackdrop = state.player.currentBackdrop === 0 ? 1 : 0; return; }
    window.gsap.set(next, { autoAlpha: 0, scale: 1.035 });
    window.gsap.to(current, { autoAlpha: 0, duration: .85, ease: "power2.inOut" });
    window.gsap.to(next, { autoAlpha: 1, scale: 1, duration: 1.05, ease: "power2.out" });
    state.player.currentBackdrop = state.player.currentBackdrop === 0 ? 1 : 0;
  }

  function applyScene(scene, immediate = false) {
    const changed = state.player.currentScene?.id !== scene.id;
    state.player.currentScene = scene; stage.dataset.type = scene.type; stage.dataset.scene = scene.id;
    $("#cinema-type").textContent = state.player.mode === "reel" ? `四幕連續電影 · ${ACT_LABELS[scene.id] || TYPE_LABELS[scene.type]}` : `${TYPE_LABELS[scene.type]} · ${scene.id}`;
    $("#cinema-title").textContent = scene.title; $("#cinema-subtitle").textContent = scene.subtitle; $("#cinema-source").textContent = scene.source; stageProp.textContent = scene.prop || scene.motif || "";
    if (changed) { setBackdrop(scene, immediate); renderStoryboard(scene); updateActMarkers(scene.id); syncSceneAudio(scene); }
  }

  function scoreForScene(scene) {
    if (!scene || (scene.type !== "shadow" && scene.type !== "side")) return null;
    return SCORE_TRACKS[String(scene.chapter || "").padStart(2, "0")] || null;
  }

  function selectLibraryScore(button, autoplay = true) {
    if (!button || !scoreLibraryAudio) return;
    const chapter = button.dataset.score;
    const track = SCORE_TRACKS[chapter];
    if (!track) return;
    scoreLibraryButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const nextSrc = new URL(track.src, window.location.href).href;
    if (scoreLibraryAudio.src !== nextSrc) scoreLibraryAudio.src = track.src;
    if (scoreLibraryLabel) scoreLibraryLabel.textContent = button.querySelector("span")?.textContent || track.label;
    cinemaAudio?.pause();
    if (autoplay) scoreLibraryAudio.play().catch(() => {});
  }

  function updateMusicUi(track = scoreForScene(state.player.currentScene)) {
    const available = Boolean(track);
    cinemaAudioBar?.setAttribute("data-available", String(available));
    if (cinemaAudioTrack) cinemaAudioTrack.textContent = available ? track.label : "本場無配樂";
    if (musicToggle) {
      musicToggle.disabled = !available;
      musicToggle.setAttribute("aria-pressed", String(state.musicEnabled));
      musicToggle.textContent = state.musicEnabled ? "配樂：開" : "配樂：關";
    }
  }

  function playSceneAudio() {
    if (!cinemaAudio || !state.musicEnabled || !scoreForScene(state.player.currentScene)) return;
    cinemaAudio.volume = .48;
    cinemaAudio.play().catch(() => {});
  }

  function syncSceneAudio(scene) {
    if (!cinemaAudio) return;
    const track = scoreForScene(scene);
    updateMusicUi(track);
    if (!track) { cinemaAudio.pause(); cinemaAudio.removeAttribute("src"); cinemaAudio.load(); return; }
    const nextSrc = new URL(track.src, window.location.href).href;
    if (cinemaAudio.src !== nextSrc) { cinemaAudio.src = track.src; cinemaAudio.load(); }
    if (state.player.playing) playSceneAudio();
  }

  function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;
    localStorage.setItem("kk-music-v8", String(state.musicEnabled));
    updateMusicUi();
    if (state.musicEnabled && state.player.playing) playSceneAudio(); else cinemaAudio?.pause();
  }

  function currentFilmShot(scene, actionIndex) {
    const base = FILM_DIRECTIONS[scene.id]?.shots[actionIndex] || { scale: 1.08, x: 0, y: 0, light: 0, thread: (actionIndex + 1) / 10, fx: "mist" };
    if (!window.matchMedia("(max-width: 760px)").matches) return base;
    return { ...base, scale: 1 + (base.scale - 1) * .56, x: base.x * .35, y: base.y * .45, light: base.light * .55 };
  }

  function actorOpticalScale(scene, sex, compact) {
    if (scene.type !== "shadow") return 1;
    // The shadow-puppet PNG crops carry different transparent margins. These
    // optical factors equalise visible body height while keeping one shared
    // animation frame; the narrower male puppet needs slightly more lift on mobile.
    if (sex === "male") return compact ? 1.1 : 1.06;
    return compact ? .97 : .98;
  }

  function actorTargets(scene, actionIndex) {
    const pose = MOTION_POSES[actionIndex];
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const ratio = compact ? (scene.type === "side" ? .3 : .38) : (scene.type === "side" ? .7 : 1);
    const sharedScale = (pose.f[3] + pose.m[3]) / 2;
    const target = (values, sex) => ({
      x: values[0] * ratio,
      y: values[1] * ratio,
      rotation: values[2],
      scale: sharedScale * (scene.type === "side" ? .94 : 1) * actorOpticalScale(scene, sex, compact)
    });
    return { female: target(pose.f, "female"), male: target(pose.m, "male") };
  }

  function effectForMeta(meta) {
    if (meta.scene.type === "film") return currentFilmShot(meta.scene, meta.actionIndex).fx;
    const text = `${meta.scene.actions[meta.actionIndex] || ""} ${meta.scene.motif || ""}`;
    if (/雨|水|醫院|長廊/.test(text)) return "rain";
    if (/門|門檻|開門|門縫/.test(text)) return meta.actionIndex >= 8 ? "open-door" : "door";
    if (/紙|卷|表|信|判決|資料|訊息/.test(text)) return "papers";
    if (/線|髮|繡|布帶|紅/.test(text)) return "thread";
    return "mist";
  }

  function resetEffects(staticOnly = false) {
    if (hasGSAP) {
      const { gsap } = window; gsap.set(rain, { autoAlpha: 0, xPercent: 0, yPercent: 0 }); gsap.set(mist, { autoAlpha: 0, xPercent: 0 }); gsap.set(papers, { autoAlpha: 0 }); gsap.set(door, { autoAlpha: 0 });
      if (!staticOnly) $$("i", papers).forEach((paper) => gsap.set(paper, { clearProps: "transform" }));
    } else { rain.style.opacity = "0"; mist.style.opacity = "0"; papers.style.opacity = "0"; door.style.opacity = "0"; }
  }

  function applyStaticVisuals(meta) {
    resetEffects(true);
    const effect = effectForMeta(meta); const threadScale = meta.scene.type === "film" ? currentFilmShot(meta.scene, meta.actionIndex).thread : .1 + meta.actionIndex * .1;
    thread.style.transform = `scaleX(${threadScale})`;
    if (effect === "rain") rain.style.opacity = ".34"; if (effect === "mist") mist.style.opacity = ".44"; if (effect === "papers") papers.style.opacity = ".72"; if (effect === "door" || effect === "open-door") door.style.opacity = effect === "open-door" ? ".25" : ".55";
    if (meta.scene.type === "film") {
      const shot = currentFilmShot(meta.scene, meta.actionIndex);
      [bgA, bgB].forEach((element) => { element.style.transform = `translate(${shot.x}%, ${shot.y}%) scale(${shot.scale})`; });
      depthFar.style.transform = `translate(${shot.x * -.18}%, ${shot.y * -.12}%) scale(${shot.scale * 1.02})`;
      depthMid.style.transform = `translate(${shot.x * .26}%, ${shot.y * .2}%) scale(${shot.scale * 1.05})`;
      depthNear.style.transform = `translate(${shot.x * .5}%, ${shot.y * .38}%) scale(${shot.scale * 1.09})`;
      focusLight.style.transform = `translateX(${shot.light}%) skewX(-10deg)`;
    } else {
      const targets = actorTargets(meta.scene, meta.actionIndex); setActorSprites(meta.scene, meta.actionIndex);
      actorFemale.style.transform = `translate(${targets.female.x}px, ${targets.female.y}px) rotate(${targets.female.rotation}deg) scale(${targets.female.scale})`;
      actorMale.style.transform = `translate(${targets.male.x}px, ${targets.male.y}px) rotate(${targets.male.rotation}deg) scale(${targets.male.scale})`;
    }
  }

  function animatePaperFlight(timeline, at, duration) {
    const paperElements = $$("i", papers); timeline.set(papers, { autoAlpha: 1 }, at);
    paperElements.forEach((paper, index) => timeline.fromTo(paper, { xPercent: -80 + index * 16, yPercent: 80 - index * 22, rotation: -18 + index * 9, scale: .7 + index * .04 }, { xPercent: 190 + index * 25, yPercent: -90 + index * 13, rotation: 100 + index * 45, scale: 1, duration: duration * .85, ease: "sine.inOut" }, at + index * .08));
    timeline.to(papers, { autoAlpha: 0, duration: .7 }, at + duration * .75);
  }

  function animateDoor(timeline, effect, at, duration) {
    const left = $("i", door); const right = $("b", door); timeline.set(door, { autoAlpha: effect === "open-door" ? .9 : .55 }, at);
    if (effect === "open-door") {
      timeline.fromTo(left, { xPercent: 0 }, { xPercent: -94, duration: Math.min(2.4, duration * .62), ease: "power3.inOut" }, at);
      timeline.fromTo(right, { xPercent: 0 }, { xPercent: 94, duration: Math.min(2.4, duration * .62), ease: "power3.inOut" }, at);
      timeline.to(door, { autoAlpha: 0, duration: .8 }, at + duration * .68);
    } else {
      timeline.fromTo(left, { xPercent: -100 }, { xPercent: -8, duration: Math.min(1.8, duration * .42), ease: "power2.inOut" }, at);
      timeline.fromTo(right, { xPercent: 100 }, { xPercent: 8, duration: Math.min(1.8, duration * .42), ease: "power2.inOut" }, at);
      timeline.to(left, { xPercent: -100, duration: Math.min(1.8, duration * .42), ease: "power2.inOut" }, at + duration * .45);
      timeline.to(right, { xPercent: 100, duration: Math.min(1.8, duration * .42), ease: "power2.inOut" }, at + duration * .45);
      timeline.to(door, { autoAlpha: 0, duration: .5 }, at + duration * .78);
    }
  }

  function animateEffect(timeline, meta, at, duration) {
    const effect = effectForMeta(meta);
    if (effect === "rain") { timeline.fromTo(rain, { autoAlpha: 0, xPercent: 0, yPercent: -8 }, { autoAlpha: .42, xPercent: -5, yPercent: 9, duration, ease: "none" }, at); timeline.to(rain, { autoAlpha: .08, duration: .5 }, at + duration * .82); }
    else if (effect === "mist") { timeline.fromTo(mist, { autoAlpha: 0, xPercent: -4 }, { autoAlpha: .48, xPercent: 6, duration, ease: "sine.inOut" }, at); timeline.to(mist, { autoAlpha: .12, duration: .6 }, at + duration * .78); }
    else if (effect === "papers") animatePaperFlight(timeline, at, duration);
    else if (effect === "door" || effect === "open-door") animateDoor(timeline, effect, at, duration);
  }

  function addFilmBeat(timeline, meta, at, duration) {
    const shot = currentFilmShot(meta.scene, meta.actionIndex); const travel = Math.min(2.5, duration * .5);
    timeline.to([bgA, bgB], { xPercent: shot.x, yPercent: shot.y, scale: shot.scale, duration: travel, ease: "power2.inOut" }, at);
    timeline.to(depthFar, { xPercent: shot.x * -.18, yPercent: shot.y * -.12, scale: shot.scale * 1.02, duration, ease: "none" }, at);
    timeline.to(depthMid, { xPercent: shot.x * .26, yPercent: shot.y * .2, scale: shot.scale * 1.05, duration, ease: "sine.inOut" }, at);
    timeline.to(depthNear, { xPercent: shot.x * .5, yPercent: shot.y * .38, scale: shot.scale * 1.09, duration, ease: "sine.inOut" }, at);
    timeline.to(focusLight, { xPercent: shot.light, autoAlpha: .18 + (meta.actionIndex % 3) * .05, duration: travel, ease: "sine.inOut" }, at);
    timeline.to(atmosphere, { xPercent: (meta.actionIndex - 4.5) * -1.4, yPercent: ((meta.actionIndex % 3) - 1) * 1.2, autoAlpha: .28 + (meta.actionIndex % 4) * .04, duration, ease: "none" }, at);
    timeline.to(thread, { scaleX: shot.thread, autoAlpha: meta.actionIndex === 9 ? .76 : .48, duration: travel, ease: "power2.out" }, at);
    animateEffect(timeline, meta, at, duration);
  }

  function addActorBeat(timeline, meta, at, duration) {
    const targets = actorTargets(meta.scene, meta.actionIndex); const reactionDelay = meta.actionIndex % 2 === 0 ? .18 : 0; const femaleAt = at + (reactionDelay ? 0 : .18); const maleAt = at + reactionDelay; const travel = Math.min(1.85, duration * .42);
    timeline.to(actorFemale, { x: targets.female.x, y: targets.female.y, rotation: targets.female.rotation, scale: targets.female.scale, duration: travel, ease: "power2.inOut" }, femaleAt);
    timeline.to(actorMale, { x: targets.male.x, y: targets.male.y, rotation: targets.male.rotation, scale: targets.male.scale, duration: travel, ease: "power2.inOut" }, maleAt);
    timeline.fromTo(actorFemaleImage, { autoAlpha: .28, scale: .97, yPercent: 1.5 }, { autoAlpha: 1, scale: 1, yPercent: 0, duration: .65, ease: "power2.out", immediateRender: false }, femaleAt);
    timeline.fromTo(actorMaleImage, { autoAlpha: .28, scale: .97, yPercent: 1.5 }, { autoAlpha: 1, scale: 1, yPercent: 0, duration: .65, ease: "power2.out", immediateRender: false }, maleAt);
    timeline.to([bgA, bgB], { xPercent: (meta.actionIndex - 4.5) * .75, yPercent: ((meta.actionIndex % 3) - 1) * .55, scale: meta.scene.type === "side" ? 1.06 : 1.015, duration, ease: "none" }, at);
    timeline.to(stageProp, { x: (meta.actionIndex - 4.5) * 5, y: ((meta.actionIndex % 3) - 1) * 5, rotation: (meta.actionIndex % 2 ? 1 : -1) * 1.2, duration: travel, ease: "sine.inOut" }, at);
    timeline.to(thread, { scaleX: .1 + meta.actionIndex * .1, autoAlpha: meta.actionIndex === 9 ? .72 : .42, duration: travel, ease: "power2.out" }, at);
    timeline.to(focusLight, { xPercent: (meta.actionIndex - 4.5) * 8, autoAlpha: .18 + (meta.actionIndex % 3) * .05, duration: travel, ease: "sine.inOut" }, at);
    animateEffect(timeline, meta, at, duration);
  }

  function addBeatAnimation(timeline, meta, at) {
    const duration = meta.duration;
    if (meta.scene.type === "film") addFilmBeat(timeline, meta, at, duration); else addActorBeat(timeline, meta, at, duration);
    timeline.fromTo(dialogueBox, { autoAlpha: .52, y: 10 }, { autoAlpha: 1, y: 0, duration: .45, ease: "power2.out", immediateRender: false }, at);
    timeline.fromTo($("#frame-counter"), { scale: .86, autoAlpha: .5 }, { scale: 1, autoAlpha: 1, duration: .34, immediateRender: false }, at);
  }

  function renderStep(index, staticVisuals = false) {
    const meta = state.player.stepMeta[index]; if (!meta) return;
    state.player.stepIndex = index; applyScene(meta.scene, staticVisuals); if (meta.scene.type !== "film") setActorSprites(meta.scene, meta.actionIndex);
    const line = meta.scene.dialogue[meta.dialogueIndex];
    $("#frame-counter").textContent = `${String(meta.actionIndex + 1).padStart(2, "0")} / 10`;
    $("#shot-number").textContent = `分鏡 ${String(meta.actionIndex + 1).padStart(2, "0")}`;
    $("#shot-action").textContent = meta.scene.actions[meta.actionIndex] || "場景推進";
    const activeSpeaker = line?.speaker || "旁白";
    $("#speaker").textContent = activeSpeaker; $("#dialogue-text").textContent = line?.text || meta.scene.title;
    dialogueBox.dataset.speakerTone = speakerTone(activeSpeaker);
    $$(".story-beat", $("#storyboard")).forEach((beat, beatIndex) => beat.classList.toggle("is-current", beatIndex === meta.actionIndex)); updateActMarkers(meta.scene.id);
    if (staticVisuals || state.reduced || !hasGSAP) applyStaticVisuals(meta); if (!state.player.timeline) syncFallbackProgress();
  }

  function buildTimeline() {
    destroyTimeline(); state.player.stepMeta = createStepMeta(state.player.sequence); state.player.stepTimes = [];
    if (!hasGSAP || state.reduced) { state.player.timeline = null; syncFallbackProgress(); return; }
    const timeline = window.gsap.timeline({ paused: true }); let cursor = 0; stage.classList.add("is-gsap");
    state.player.stepMeta.forEach((meta, index) => { state.player.stepTimes.push(cursor); timeline.addLabel(`step-${index}`, cursor); if (meta.isSceneStart) timeline.addLabel(`scene-${meta.scene.id}`, cursor); timeline.call(() => renderStep(index, false), null, cursor); addBeatAnimation(timeline, meta, cursor); timeline.to({}, { duration: meta.duration }, cursor); cursor += meta.duration; });
    timeline.eventCallback("onUpdate", syncTimelineProgress); timeline.eventCallback("onComplete", () => { cinemaAudio?.pause(); state.player.playing = false; updatePlayButton(); syncTimelineProgress(); });
    state.player.timeline = timeline; syncTimelineProgress();
  }

  function destroyTimeline() { state.player.timeline?.kill(); state.player.timeline = null; state.player.stepTimes = []; stage?.classList.remove("is-gsap"); }
  function formatTime(seconds) { if (!Number.isFinite(seconds)) return "00:00"; const rounded = Math.max(0, Math.round(seconds)); return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`; }
  function syncTimelineProgress() { if (!state.player.timeline) return; const total = state.player.timeline.duration() || 1; const value = Math.round((state.player.timeline.time() / total) * 1000); progressInput.value = String(value); progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`); timelineTime.textContent = `${formatTime(state.player.timeline.time())} / ${formatTime(total)}`; }
  function syncFallbackProgress() { const total = state.player.stepMeta.length; const value = total <= 1 ? 0 : Math.round((state.player.stepIndex / (total - 1)) * 1000); progressInput.value = String(value); progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`); timelineTime.textContent = `${String(state.player.stepIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`; }
  function stepAtTime(time) { let found = 0; state.player.stepTimes.forEach((start, index) => { if (start <= time + .001) found = index; }); return found; }

  function updatePlayButton() {
    const button = $("#play-cinema"); const overlay = $("#cinema-play-overlay");
    if (button) { button.textContent = state.player.playing ? "暫停" : (state.reduced ? "下一拍" : "播放"); button.setAttribute("aria-pressed", String(state.player.playing)); }
    if (overlay) { overlay.classList.toggle("is-playing", state.player.playing); overlay.setAttribute("aria-label", state.reduced ? "前往下一拍" : "播放動畫"); const small = $("small", overlay); if (small) small.textContent = state.reduced ? "下一拍" : "播放"; }
  }

  function startPlayback() { if (!state.player.stepMeta.length) return; if (state.reduced || !state.player.timeline) { goToStep(state.player.stepIndex + 1); return; } if (state.player.timeline.progress() >= .999) { state.player.timeline.pause(0, true); renderStep(0, false); } scoreLibraryAudio?.pause(); state.player.playing = true; updatePlayButton(); playSceneAudio(); state.player.timeline.play(); }
  function pausePlayback() { state.player.timeline?.pause(); cinemaAudio?.pause(); state.player.playing = false; updatePlayButton(); }
  function goToStep(index) { if (!state.player.stepMeta.length) return; pausePlayback(); const target = clamp(index, 0, state.player.stepMeta.length - 1); if (state.player.timeline) state.player.timeline.pause(state.player.stepTimes[target] || 0, true); renderStep(target, true); syncTimelineProgress(); }
  function jumpToScene(id) { const index = state.player.stepMeta.findIndex((meta) => meta.scene.id === id); if (index >= 0) goToStep(index); }

  function renderActMarkers() {
    const root = $("#act-markers"); if (!root) return; root.replaceChildren();
    state.player.sequence.forEach((scene, index) => { const button = document.createElement("button"); button.type = "button"; button.dataset.sceneId = scene.id; button.textContent = state.player.mode === "reel" ? `${ACT_LABELS[scene.id]} · ${scene.title}` : `${String(index + 1).padStart(2, "0")} · ${scene.title}`; button.addEventListener("click", () => jumpToScene(scene.id)); root.append(button); });
  }
  function updateActMarkers(sceneId) { $$("button", $("#act-markers")).forEach((button) => button.classList.toggle("is-current", button.dataset.sceneId === sceneId)); }

  function renderStoryboard(scene) {
    const root = $("#storyboard"); if (!root) return; root.replaceChildren();
    for (let actionIndex = 0; actionIndex < 10; actionIndex += 1) {
      const button = document.createElement("button"); button.type = "button"; button.className = "story-beat"; button.dataset.number = String(actionIndex + 1).padStart(2, "0"); button.title = scene.actions[actionIndex] || `分鏡 ${actionIndex + 1}`; button.setAttribute("aria-label", `跳到分鏡${actionIndex + 1}：${scene.actions[actionIndex] || "場景推進"}`);
      if (scene.image) { button.style.setProperty("--beat-image", `url('${scene.image}')`); if (scene.type === "film") { const shot = currentFilmShot(scene, actionIndex); button.style.setProperty("--beat-size", `${Math.round(105 + (shot.scale - 1) * 140)}% auto`); button.style.setProperty("--beat-position", `${50 + shot.x * .9}% ${50 + shot.y * .7}%`); } }
      else button.style.setProperty("--beat-image", "radial-gradient(ellipse at center, #695e43, #17130f 74%)");
      button.addEventListener("click", () => { const index = state.player.stepMeta.findIndex((meta) => meta.scene.id === scene.id && meta.actionIndex === actionIndex); if (index >= 0) goToStep(index); }); root.append(button);
    }
  }

  function syncTranscriptToggle(shouldScroll = false) {
    const button = $("#toggle-transcript");
    if (!button || !transcript) return;
    button.setAttribute("aria-expanded", String(transcript.open));
    button.textContent = transcript.open ? "收合逐字稿 ↑" : "展開逐字稿 ↓";
    if (shouldScroll && transcript.open) transcript.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "nearest" });
  }

  function renderTranscript() {
    const root = $("#transcript-body"); if (!root) return; root.replaceChildren();
    if (transcript) transcript.open = false;
    state.player.sequence.forEach((scene, sceneIndex) => {
      const section = document.createElement("details");
      section.className = "transcript-scene";
      section.open = state.player.sequence.length === 1 || sceneIndex === 0;
      const summary = document.createElement("summary");
      const heading = document.createElement("strong"); heading.textContent = `${scene.id}｜${scene.title}`;
      const source = document.createElement("small"); source.textContent = scene.source;
      summary.append(heading, source);
      const lines = document.createElement("div"); lines.className = "transcript-lines";
      scene.dialogue.forEach((line) => {
        const paragraph = document.createElement("p");
        const speaker = document.createElement("b"); speaker.textContent = line.id ? `${line.speaker} · ${line.id}` : line.speaker;
        const text = document.createElement("span"); text.textContent = line.text;
        paragraph.append(speaker, text); lines.append(paragraph);
      });
      section.append(summary, lines); root.append(section);
    });
    syncTranscriptToggle(false);
  }

  function relativeUrl(url) { return `${url.pathname}${url.search}${url.hash}`; }
  function urlWithoutPlayer() { const url = new URL(window.location.href); url.searchParams.delete("scene"); url.searchParams.delete("reel"); return relativeUrl(url); }
  function setPlayerUrl(id, mode) { const url = new URL(window.location.href); url.hash = ""; url.searchParams.delete("scene"); url.searchParams.delete("reel"); if (mode === "reel") url.searchParams.set("reel", "1"); else url.searchParams.set("scene", id); window.history.replaceState({ scene: id, mode }, "", relativeUrl(url)); }

  function openCinema(id, mode = "single") {
    const scene = sceneById.get(id) || sceneById.get(FILM_ORDER[0]); if (!scene || !dialog) return;
    state.player.returnFocus = document.activeElement; state.player.returnUrl = urlWithoutPlayer(); state.player.mode = mode; state.player.sequence = mode === "reel" ? FILM_ORDER.map((filmId) => sceneById.get(filmId)).filter(Boolean) : [scene]; state.player.currentScene = null; state.player.currentBackdrop = 0;
    preloadSequence(state.player.sequence); renderActMarkers(); renderTranscript(); buildTimeline(); if (!dialog.open) dialog.showModal(); document.body.style.overflow = "hidden"; renderStep(0, true); setPlayerUrl(scene.id, mode); updatePlayButton(); $("#cinema-play-overlay")?.focus();
  }
  function closeCinema() { pausePlayback(); destroyTimeline(); if (dialog?.open) dialog.close(); }
  function sceneShareUrl() { const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href; const url = new URL(canonical, window.location.href); if (state.player.mode === "reel") url.searchParams.set("reel", "1"); else if (state.player.currentScene) url.searchParams.set("scene", state.player.currentScene.id); return url.href; }
  function setShareStatus(message) { const status = $("#share-status"); if (!status) return; window.clearTimeout(state.player.shareTimer); status.textContent = message; state.player.shareTimer = window.setTimeout(() => { status.textContent = ""; }, 3200); }

  async function shareCinema() {
    const current = state.player.currentScene;
    const shareData = { title: state.player.mode === "reel" ? "四幕連續電影｜剴剴案特別專題" : `${current?.title || "動畫"}｜剴剴案特別專題`, text: state.player.mode === "reel" ? "一部四幕電影長卷，沿同一條線走到清晨。" : `${current?.subtitle || ""}（${TYPE_LABELS[current?.type] || "動畫"}）`, url: sceneShareUrl() };
    if (navigator.share) { try { await navigator.share(shareData); setShareStatus("分享面板已開啟"); return; } catch (error) { if (error?.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(shareData.url); setShareStatus("專屬連結已複製"); } catch { setShareStatus("請從網址列複製此場連結"); }
  }

  function setupPageMotion() {
    if (!hasGSAP || !window.ScrollTrigger || state.reduced || state.pageMedia) return;
    const { gsap } = window; state.pageMedia = gsap.matchMedia();
    state.pageMedia.add({ desktop: "(min-width: 761px)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      if (!context.conditions.motion || state.reduced) return undefined;
      gsap.to(".hero-layer-far", { scale: context.conditions.desktop ? 1.1 : 1.045, yPercent: context.conditions.desktop ? 5 : 2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .75 } });
      gsap.to(".hero-layer-mid", { xPercent: context.conditions.desktop ? -2.2 : -.8, yPercent: context.conditions.desktop ? 3 : 1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".reel-stage-image", { scale: 1.015 }, { scale: 1.09, xPercent: 1.5, ease: "none", scrollTrigger: { trigger: ".reel-stage", start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".reel-stage-thread", { scaleX: .08 }, { scaleX: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: ".reel-stage", start: "top 82%", end: "bottom 34%", scrub: .8 } });
      gsap.utils.toArray(".section-heading, .film-act-card, .reading-map-grid a, .source-grid article, .scene-card, .visual-copy, .visual-montage figure, .action-cards a").forEach((target) => gsap.from(target, { y: 34, autoAlpha: 0, duration: .85, ease: "power3.out", scrollTrigger: { trigger: target, start: "top 91%", once: true } }));
      gsap.to(".page-light-a", { xPercent: 18, yPercent: 14, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".page-light-b", { xPercent: -16, yPercent: -10, duration: 21, repeat: -1, yoyo: true, ease: "sine.inOut" });
      return () => undefined;
    });
  }

  function animateNewContent(root) {
    if (!hasGSAP || state.reduced || !window.ScrollTrigger) return;
    window.ScrollTrigger.batch($$(".copy-scene-card", root), { start: "top 92%", once: true, onEnter: (batch) => window.gsap.fromTo(batch, { autoAlpha: 0, y: 26, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .72, stagger: .09, ease: "power3.out", clearProps: "opacity,visibility,transform" }) });
  }
  function teardownPageMotion() { state.pageMedia?.revert(); state.pageMedia = null; }

  function bindEvents() {
    $("#enter-experience")?.addEventListener("click", () => { if ($("#gate-reduced")?.checked) setReduced(true); enterSite("#top"); });
    $("#enter-reading")?.addEventListener("click", () => enterSite("#full-copy"));
    $("#gate-reduced")?.addEventListener("change", (event) => setReduced(event.target.checked)); motionToggle?.addEventListener("click", () => setReduced(!state.reduced)); navToggle?.addEventListener("click", () => setNavOpen(!state.navOpen));
    $$("a", nav).forEach((link) => link.addEventListener("click", () => setNavOpen(false))); window.addEventListener("resize", () => { if (window.innerWidth > 1120) setNavOpen(false); });
    window.addEventListener("scroll", () => { if (!readingProgressFrame) readingProgressFrame = window.requestAnimationFrame(updateReadingProgress); }, { passive: true });
    $("#hero-play-reel")?.addEventListener("click", () => openCinema(FILM_ORDER[0], "reel")); $("#play-full-reel")?.addEventListener("click", () => openCinema(FILM_ORDER[0], "reel"));
    $("#close-cinema")?.addEventListener("click", closeCinema); $("#share-cinema")?.addEventListener("click", shareCinema); $("#prev-beat")?.addEventListener("click", () => goToStep(state.player.stepIndex - 1)); $("#next-beat")?.addEventListener("click", () => goToStep(state.player.stepIndex + 1));
    $("#play-cinema")?.addEventListener("click", () => state.player.playing ? pausePlayback() : startPlayback()); $("#cinema-play-overlay")?.addEventListener("click", () => state.player.playing ? pausePlayback() : startPlayback()); dialogueBox?.addEventListener("click", () => goToStep(state.player.stepIndex + 1));
    $("#toggle-transcript")?.addEventListener("click", () => { if (!transcript) return; transcript.open = !transcript.open; syncTranscriptToggle(true); });
    transcript?.addEventListener("toggle", () => syncTranscriptToggle(false));
    progressInput?.addEventListener("input", (event) => { if (!state.player.stepMeta.length) return; pausePlayback(); const ratio = Number(event.target.value) / 1000; if (state.player.timeline) { const time = ratio * state.player.timeline.duration(); state.player.timeline.pause(time, true); renderStep(stepAtTime(time), false); syncTimelineProgress(); } else goToStep(Math.round(ratio * (state.player.stepMeta.length - 1))); });
    dialog?.addEventListener("close", () => { pausePlayback(); destroyTimeline(); resetEffects(); document.body.style.overflow = ""; if (state.player.returnUrl) window.history.replaceState(null, "", state.player.returnUrl); state.player.returnUrl = null; const target = state.player.returnFocus; state.player.returnFocus = null; target?.focus?.({ preventScroll: true }); });
    musicToggle?.addEventListener("click", toggleMusic);
    scoreLibraryButtons.forEach((button) => button.addEventListener("click", () => selectLibraryScore(button, true)));
    scoreLibraryAudio?.addEventListener("play", () => cinemaAudio?.pause());
    $$(".filter").forEach((button) => button.addEventListener("click", () => { $$(".filter").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); }); const filter = button.dataset.filter; $$(".scene-library-item", sceneGrid).forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.type !== filter)); window.setTimeout(() => window.ScrollTrigger?.refresh(), 60); }));
    document.addEventListener("keydown", (event) => { if (!dialog?.open) { if (event.key === "Escape") setNavOpen(false); return; } if (event.key === "ArrowRight") goToStep(state.player.stepIndex + 1); if (event.key === "ArrowLeft") goToStep(state.player.stepIndex - 1); if (event.key === " ") { event.preventDefault(); if (state.player.playing) pausePlayback(); else startPlayback(); } });
    document.addEventListener("visibilitychange", () => { if (document.hidden) pausePlayback(); });
  }

  function initDirectPlayer() {
    const params = new URLSearchParams(window.location.search); const sceneId = params.get("scene"); const reel = params.get("reel") === "1";
    if (reel || (sceneId && sceneById.has(sceneId))) { setPageGate(false); sessionStorage.setItem("kk-entered-v8", "true"); window.setTimeout(() => openCinema(reel ? FILM_ORDER[0] : sceneId, reel ? "reel" : "single"), 120); }
  }

  function init() {
    if (!scenes.length) { console.error("Scene registry was not loaded."); return; }
    if (sessionStorage.getItem("kk-entered-v8") === "true") setPageGate(false); else setPageGate(true);
    refreshMotionUi(); renderFilmActs(); renderSceneLibrary(); bindEvents(); updateReadingProgress(); loadInlineStory(); setupPageMotion(); initDirectPlayer();
  }

  init();
})();
