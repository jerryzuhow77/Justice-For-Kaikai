(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const assetUrl = (value) => new URL(value, document.baseURI).href;
  const scenes = (window.KAIKAI_SCENES || []).slice();
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const filmProductions = window.KAIKAI_FILM_PRODUCTIONS || {};
  const hasGSAP = Boolean(window.gsap);
  const FILM_ORDER = ["FM-A", "FM-D", "FM-B", "FM-C"];
  const TYPE_LABELS = { film: "主線電影", shadow: "皮影詩劇", side: "陰翳側視劇場" };
  const TYPE_PURPOSES = { film: "推動事件與情感轉折｜五幕", shadow: "提出記憶與倫理問題｜六句內", side: "拆解制度接縫｜一個未完成行動" };
  const ACT_LABELS = { "FM-A": "第一部", "FM-D": "第二部", "FM-B": "第三部", "FM-C": "第四部" };
  const FILM_POSITIONS = { "FM-A": "22% 50%", "FM-D": "36% 50%", "FM-B": "70% 50%", "FM-C": "50% 50%" };
  const SCORE_TRACKS = {
    "FM-A": { src: "public/media/film-stamped-in-marble.m4a", label: "Stamped in Marble｜土掩埋不住的清朝民間傳說" },
    "FM-D": { src: "public/media/film-late-question.m4a", label: "來不及的追問｜無法再相見▪︎天涯各自分" },
    "FM-B": { src: "public/media/film-one-year-old-extended.m4a", label: "他才一歲多｜青絲變白髮" },
    "FM-C": { src: "public/media/film-who-opens-door.m4a", label: "誰肯先開門｜兩個朝代▪︎不同世界▪︎同一扇門" },
    "00": { src: "public/media/chapter-00.m4a", label: "序問｜石階雨滴" },
    ...Object.fromEntries(Array.from({ length: 6 }, (_, index) => {
      const chapter = String(index + 1).padStart(2, "0");
      return [chapter, { src: `public/media/chapter-${chapter}.m4a`, label: `第 ${chapter} 篇原創配樂` }];
    })),
    "07": { src: "public/media/chapter-07.m4a", label: "第七篇｜第一百一十五日" },
    "08": { src: "public/media/chapter-08.m4a", label: "第八篇｜穿過竹屋簷" },
    "09": { src: "public/media/chapter-09.m4a", label: "終章｜杉木上的晨光" }
  };
  const PROLOGUE_BACKGROUND_TRACK = { src: "public/media/prologue-chair-maiden.m4a", label: "序幕配樂｜椅仔姑傳說" };
  const SITE_BACKGROUND_TRACK = { src: "public/media/site-background.m4a", label: "全站背景｜玩偶落淚之處" };
  const AMBIENT_TRACKS = [PROLOGUE_BACKGROUND_TRACK, SITE_BACKGROUND_TRACK];

  // [canvas width, canvas height, visible alpha height]. Pose-specific bounds
  // let every pair share one optical body height even when source canvases use
  // very different transparent margins or aspect ratios.
  const ACTOR_ASSET_BOUNDS = {
    shadow: {
      female: [[362,362,361],[362,362,343],[362,362,362],[362,362,362],[362,362,361],[362,362,356],[362,362,362],[362,362,362],[362,362,346],[362,362,362],[362,362,346],[362,362,346]],
      male: [[384,341,308],[384,341,312],[384,341,316],[384,341,316],[384,341,332],[384,341,332],[384,341,286],[384,341,297],[384,342,302],[384,342,311],[384,342,298],[384,342,304]]
    },
    side: {
      female: [[420,360,324],[403,348,312],[405,364,328],[410,347,311],[412,375,339],[391,378,342],[371,378,342],[393,378,342],[403,327,291],[417,347,311],[401,347,311],[393,353,317]],
      male: [[303,360,324],[322,362,326],[385,357,321],[349,377,341],[415,378,342],[387,378,342],[419,378,342],[398,377,341],[331,362,326],[321,377,341],[341,363,327],[376,365,329]]
    }
  };
  const INLINE_PLACEMENTS = [
    { match: ["開頭引言", "花會再開", "童年不會重來"], label: "序幕電影", scenes: ["FM-A"] },
    { match: ["皮影序問", "六扇門", "先了解案件", "一個孩子生命最後的一百一十五天"], label: "序問雙劇場", scenes: ["SP00", "DV00"] },
    { match: ["古老的傳說", "綁在椅子上的孩子"], label: "第一篇章劇場", scenes: ["SP01", "DV01"] },
    { match: ["離開原來的家", "當孩子必須離開"], label: "第二篇章劇場", scenes: ["SP02", "DV02"] },
    { match: ["越來越多求救", "進入制度"], label: "第三篇章劇場", scenes: ["SP03", "DV03"] },
    { match: ["隔著布簾", "急診記憶"], label: "第四篇章劇場", scenes: ["SP04", "DV04"] },
    { match: ["兒福聯盟的誕生", "一紙修法"], label: "第五篇章劇場", scenes: ["SP05", "DV05"] },
    { match: ["珮珮", "另一間病房"], label: "第六篇章劇場", scenes: ["SP06", "DV06"] },
    { match: ["制度留下的接縫", "從珮珮到剴剴"], label: "第七篇章劇場", scenes: ["SP07", "DV07"] },
    { match: ["外婆的眼淚", "第二章前夜"], label: "第八篇章前奏", scenes: ["FM-D", "SP08", "DV08"] },
    { match: ["外婆含淚的指責", "正文收束"], label: "法庭電影", scenes: ["FM-B"] },
    { match: ["結尾皮影戲", "下一扇門更早打開", "普通清晨"], label: "終章三聯劇場", scenes: ["SP09", "DV09", "FM-C"] }
  ];
  const fallbackStoryOrder = [...new Set(INLINE_PLACEMENTS.flatMap((placement) => placement.scenes))];
  const STORY_ORDER = [...new Set((window.KAIKAI_SCENE_ORDER || fallbackStoryOrder).filter((id) => sceneById.has(id)))];
  const STORY_INDEX = new Map(STORY_ORDER.map((id, index) => [id, index]));
  const STORY_SCENES = STORY_ORDER.map((id) => sceneById.get(id)).filter(Boolean);
  const PUBLIC_TOTAL = STORY_ORDER.length;
  const STORAGE_KEYS = {
    watched: "kk-animation-watched-v9",
    resume: "kk-animation-resume-v9",
    catalogView: "kk-animation-catalog-view-v9"
  };

  function readStoredJson(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }

  function writeStoredJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Viewing progress remains optional when storage is unavailable. */ }
  }

  function hasEnteredSession() {
    try { return sessionStorage.getItem("kk-entered-v8") === "true"; }
    catch { return false; }
  }

  function rememberEnteredSession() {
    try { sessionStorage.setItem("kk-entered-v8", "true"); }
    catch { /* The entrance remains usable when session storage is unavailable. */ }
  }

  function publicSceneNumber(sceneOrId) {
    const id = typeof sceneOrId === "string" ? sceneOrId : sceneOrId?.id;
    const index = STORY_INDEX.get(id);
    return Number.isInteger(index) ? String(index + 1).padStart(2, "0") : "--";
  }

  function publicSceneLabel(sceneOrId) {
    return `${publicSceneNumber(sceneOrId)} / ${String(PUBLIC_TOTAL).padStart(2, "0")}`;
  }

  function chapterLabel(scene) {
    if (!scene) return "章節位置未定";
    if (scene.id === "FM-A") return "開場｜序幕與序問";
    if (scene.id === "SP00" || scene.id === "DV00") return "開場｜序幕與序問";
    if (["FM-D", "SP08", "DV08", "FM-B"].includes(scene.id)) return "第八篇";
    if (["SP09", "DV09", "FM-C"].includes(scene.id)) return "終章";
    const chapter = String(scene.chapter || "").match(/^0?([1-7])$/)?.[1];
    return chapter ? `第${["", "一", "二", "三", "四", "五", "六", "七"][Number(chapter)]}篇` : String(scene.chapter || "章節位置未定");
  }

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
  const preloadedAssets = new Set();
  let copyNavObserver = null;
  let readingProgressFrame = 0;
  let actorCalibrationFrame = 0;
  let gateMotionContext = null;
  let pageIntroPlayed = false;
  let inlineStoryLoaded = false;
  let inlineStoryPromise = null;
  let catalogPosterObserver = null;
  let gateHideTimer = 0;
  let decorativeSealsQueued = false;

  const storedWatched = readStoredJson(STORAGE_KEYS.watched, []);
  const storedResume = readStoredJson(STORAGE_KEYS.resume, null);
  const storedCatalogView = (() => {
    try { return localStorage.getItem(STORAGE_KEYS.catalogView); }
    catch { return null; }
  })();

  const state = {
    reduced: localStorage.getItem("kk-reduced-v8") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    navOpen: false,
    pageMedia: null,
    musicEnabled: localStorage.getItem("kk-music-v8") !== "false",
    catalogView: ["story", "type", "chapter"].includes(storedCatalogView) ? storedCatalogView : "story",
    watched: new Set(Array.isArray(storedWatched) ? storedWatched.filter((id) => STORY_INDEX.has(id)) : []),
    resume: storedResume && STORY_INDEX.has(storedResume.sceneId) ? storedResume : null,
    ambient: {
      requested: window.__kaikaiAmbientRequested === true,
      trackIndex: Number.isInteger(window.__kaikaiAmbientTrackIndex) ? clamp(window.__kaikaiAmbientTrackIndex, 0, AMBIENT_TRACKS.length - 1) : 0,
      resumeAfterForeground: false,
      resumeAfterVisibility: false
    },
    player: {
      mode: "single",
      sequence: [],
      stepMeta: [],
      stepTimes: [],
      stepIndex: 0,
      timeline: null,
      playing: false,
      captions: true,
      currentScene: null,
      currentBackdrop: 0,
      audioPlayPending: false,
      resumeAfterVisibility: false,
      returnFocus: null,
      returnUrl: null,
      shareTimer: null,
      completedSceneId: null
    }
  };

  const header = $("#site-header");
  const main = $("#main");
  const entryGate = $("#entry-gate");
  const footer = $("footer");
  const helpFab = $(".help-fab");
  const mobileQuickNav = $(".mobile-quick-nav");
  const skipLink = $(".skip-link");
  const nav = $("#main-nav");
  const navToggle = $("#nav-toggle");
  const motionToggle = $("#motion-toggle");
  const animationCatalog = $("#animation-catalog");
  const animationCatalogStatus = $("#animation-catalog-status");
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
  const paperCutRig = $("#paper-cut-rig");
  const filmProduction = $("#film-production");
  const FM_C_ACT_PLATES = [
    {
      src: "assets/img/films/fm-c-act4/shot-01-object.webp",
      actionSrc: "assets/img/films/fm-c-act4/shot-01-action.webp",
      approachSrc: "assets/img/films/fm-c-act4/shot-01-approach.webp",
      shadowSrc: "assets/img/films/fm-c-act4/shot-01-shadow-contact.webp",
      handsSrc: "assets/img/films/fm-c-act4/shot-01-hands-law.webp",
      label: "第一幕｜兩個孩子走向同一條門縫"
    },
    {
      src: "assets/img/films/fm-c-act4/shot-02-theatre.webp",
      actionSrc: "assets/img/films/fm-c-act4/shot-02-action.webp",
      routeSrc: "assets/img/films/fm-c-act4/shot-02-route.webp",
      relaySrc: "assets/img/films/fm-c-act4/shot-02-handoff-chain.webp",
      emptySrc: "assets/img/films/fm-c-act4/shot-02-empty-chair.webp",
      label: "第二幕｜資訊走得更快，保護仍可能遲到"
    },
    {
      src: "assets/img/films/fm-c-act4/shot-03-corridor.webp",
      actionSrc: "assets/img/films/fm-c-act4/shot-03-action.webp",
      clothSrc: "assets/img/films/fm-c-act4/shot-03-cloth-form.webp",
      signalsSrc: "assets/img/films/fm-c-act4/shot-03-signals.webp",
      adultSrc: "assets/img/films/fm-c-act4/shot-03-adult-page.webp",
      label: "第三幕｜沉默只是換了衣裳"
    },
    {
      src: "assets/img/films/fm-c-act4/shot-04-doors.webp",
      actionSrc: "assets/img/films/fm-c-act4/shot-04-action.webp",
      handoffSrc: "assets/img/films/fm-c-act4/shot-04-handoff.webp",
      handleSrc: "assets/img/films/fm-c-act4/shot-04-handle.webp",
      stepbackSrc: "assets/img/films/fm-c-act4/shot-04-stepback.webp",
      label: "第四幕｜把責任交給活著的人"
    },
    { src: "assets/img/films/fm-c-act4/shot-05-shadows.webp", actionSrc: "assets/img/films/fm-c-act4/shot-05-action.webp", label: "第五幕｜兩扇門各自打開一寸" }
  ];
  const FM_C_ACT_CAMERA = [
    { qing: "29% 47%", modern: "72% 47%", detail: 1.58, action: 1.08 },
    { qing: "39% 67%", modern: "61% 67%", detail: 2.16, action: 1.08 },
    { qing: "27% 58%", modern: "75% 58%", detail: 1.7, action: 1.075 },
    { qing: "25% 57%", modern: "76% 57%", detail: 1.68, action: 1.065 },
    { qing: "28% 48%", modern: "78% 48%", detail: 1.78, action: 1.07 }
  ];
  const fmCShotPlan = (actIndex) => {
    const plate = FM_C_ACT_PLATES[actIndex];
    const camera = FM_C_ACT_CAMERA[actIndex];
    if (actIndex === 0) {
      return [
        { src: plate.src, kind: "establish", start: 0, reveal: "full", origin: "50% 50%", from: { scale: 1.07, xPercent: 0, yPercent: .4 }, to: { scale: 1.025, xPercent: 0, yPercent: 0 } },
        { src: plate.src, kind: "kaikai-close", start: .11, reveal: "right", origin: camera.modern, from: { scale: camera.detail * .93, xPercent: 0, yPercent: .1 }, to: { scale: camera.detail, xPercent: 0, yPercent: -.2 } },
        { src: plate.src, kind: "qing-close", start: .25, reveal: "left", origin: camera.qing, from: { scale: camera.detail * .93, xPercent: 0, yPercent: .1 }, to: { scale: camera.detail, xPercent: 0, yPercent: -.2 } },
        { src: plate.approachSrc, kind: "approach", start: .39, reveal: "vertical", origin: "50% 62%", from: { scale: 1.1, xPercent: 0, yPercent: .4 }, to: { scale: 1.035, xPercent: 0, yPercent: 0 } },
        { src: plate.shadowSrc, kind: "shadow-contact", start: .55, reveal: "horizontal", origin: "50% 72%", from: { scale: 1.08, xPercent: 0, yPercent: .3 }, to: { scale: 1.025, xPercent: 0, yPercent: 0 } },
        { src: plate.actionSrc, kind: "reach", start: .7, reveal: "seam", origin: "50% 51%", from: { scale: 1.03, xPercent: 0, yPercent: .2 }, to: { scale: 1.085, xPercent: 0, yPercent: -.1 } },
        { src: plate.handsSrc, kind: "law-peel", start: .84, reveal: "iris", origin: "50% 42%", from: { scale: 1.09, xPercent: 0, yPercent: .15 }, to: { scale: 1.16, xPercent: 0, yPercent: -.15 } }
      ];
    }
    if (actIndex === 1) {
      return [
        { src: plate.src, kind: "establish", start: 0, reveal: "full", origin: "50% 50%", from: { scale: 1.065, xPercent: 0, yPercent: .35 }, to: { scale: 1.02, xPercent: 0, yPercent: 0 } },
        { src: plate.src, kind: "kaikai-close", start: .1, reveal: "right", origin: camera.modern, from: { scale: camera.detail * .9, xPercent: 0, yPercent: .1 }, to: { scale: camera.detail, xPercent: 0, yPercent: -.2 } },
        { src: plate.src, kind: "qing-close", start: .21, reveal: "left", origin: camera.qing, from: { scale: camera.detail * .9, xPercent: 0, yPercent: .1 }, to: { scale: camera.detail, xPercent: 0, yPercent: -.2 } },
        { src: plate.routeSrc, kind: "information-route", start: .33, reveal: "seam", origin: "50% 34%", from: { scale: 1.025, xPercent: 0, yPercent: .2 }, to: { scale: 1.075, xPercent: 0, yPercent: -.1 } },
        { src: plate.actionSrc, kind: "form-cascade", start: .45, reveal: "vertical", origin: "50% 48%", from: { scale: 1.03, xPercent: 0, yPercent: .25 }, to: { scale: 1.075, xPercent: 0, yPercent: 0 } },
        { src: plate.relaySrc, kind: "relay", start: .57, reveal: "horizontal", origin: "50% 31%", from: { scale: 1.04, xPercent: 0, yPercent: .15 }, to: { scale: 1.11, xPercent: 0, yPercent: -.12 } },
        { src: plate.relaySrc, kind: "unseen-child", start: .7, reveal: "iris", origin: "50% 76%", from: { scale: 1.13, xPercent: 0, yPercent: -.12 }, to: { scale: 1.22, xPercent: 0, yPercent: .08 } },
        { src: plate.emptySrc, kind: "empty-chair", start: .84, reveal: "seam", origin: "50% 50%", from: { scale: 1.085, xPercent: 0, yPercent: .1 }, to: { scale: 1.025, xPercent: 0, yPercent: 0 } }
      ];
    }
    if (actIndex === 2) {
      return [
        { src: plate.src, kind: "establish", start: 0, reveal: "full", origin: "50% 50%", from: { scale: 1.065, xPercent: 0, yPercent: .35 }, to: { scale: 1.02, xPercent: 0, yPercent: 0 } },
        { src: plate.src, kind: "qing-women-pass", start: .11, reveal: "left", origin: "24% 54%", from: { scale: 1.42, xPercent: -2, yPercent: .1 }, to: { scale: 1.5, xPercent: 1, yPercent: -.2 } },
        { src: plate.clothSrc, kind: "qing-woman-turn", start: .23, reveal: "left", origin: "34% 48%", from: { scale: 1.52, xPercent: 0, yPercent: .1 }, to: { scale: 1.62, xPercent: 1, yPercent: -.2 } },
        { src: plate.clothSrc, kind: "bamboo-door-close", start: .35, reveal: "seam", origin: "43% 46%", from: { scale: 1.18, xPercent: 0, yPercent: .15 }, to: { scale: 1.27, xPercent: -1, yPercent: -.12 } },
        { src: plate.signalsSrc, kind: "nurses-pass", start: .47, reveal: "right", origin: "73% 54%", from: { scale: 1.38, xPercent: 2, yPercent: .12 }, to: { scale: 1.48, xPercent: -1, yPercent: 0 } },
        { src: plate.actionSrc, kind: "nurse-turn", start: .59, reveal: "right", origin: "68% 45%", from: { scale: 1.52, xPercent: 0, yPercent: .04 }, to: { scale: 1.63, xPercent: -1, yPercent: -.12 } },
        { src: plate.signalsSrc, kind: "chair-rail-match", start: .71, reveal: "horizontal", origin: "50% 68%", from: { scale: 1.12, xPercent: 0, yPercent: .2 }, to: { scale: 1.22, xPercent: 0, yPercent: -.1 } },
        { src: plate.adultSrc, kind: "two-hands-stop", start: .84, reveal: "seam", origin: "50% 52%", from: { scale: 1.12, xPercent: 0, yPercent: .1 }, to: { scale: 1.04, xPercent: 0, yPercent: 0 } }
      ];
    }
    if (actIndex === 3) {
      return [
        { src: plate.src, kind: "establish", start: 0, reveal: "full", origin: "50% 50%", from: { scale: 1.075, xPercent: 0, yPercent: .5 }, to: { scale: 1.025, xPercent: 0, yPercent: 0 } },
        { src: plate.actionSrc, kind: "kaikai-close", start: .12, reveal: "right", origin: camera.modern, from: { scale: camera.detail * .94, xPercent: 0, yPercent: .08 }, to: { scale: camera.detail * 1.008, xPercent: 0, yPercent: -.18 } },
        { src: plate.src, kind: "qing-release-close", start: .24, reveal: "left", origin: camera.qing, from: { scale: camera.detail * .94, xPercent: 0, yPercent: .08 }, to: { scale: camera.detail, xPercent: 0, yPercent: -.18 } },
        { src: plate.actionSrc, kind: "transfer", start: .36, reveal: "seam", origin: "50% 50%", from: { scale: 1.035, xPercent: 0, yPercent: .28 }, to: { scale: camera.action, xPercent: 0, yPercent: 0 } },
        { src: plate.handoffSrc, kind: "handoff", start: .44, reveal: "iris", origin: "50% 54%", from: { scale: 1.06, xPercent: 0, yPercent: .2 }, to: { scale: 1.095, xPercent: 0, yPercent: -.08 } },
        { src: plate.handleSrc, kind: "handle", start: .58, reveal: "seam", origin: "50% 47%", from: { scale: 1.045, xPercent: 0, yPercent: .1 }, to: { scale: 1.115, xPercent: 0, yPercent: -.08 } },
        { src: plate.stepbackSrc, kind: "stepback", start: .76, reveal: "vertical", origin: "50% 52%", from: { scale: 1.12, xPercent: 0, yPercent: -.1 }, to: { scale: 1.055, xPercent: 0, yPercent: .08 } },
        { src: plate.handleSrc, kind: "responsibility-hold", start: .88, reveal: "horizontal", origin: "50% 47%", from: { scale: 1.28, xPercent: 0, yPercent: -.08 }, to: { scale: 1.2, xPercent: 0, yPercent: 0 } }
      ];
    }
    return [
      { src: plate.src, kind: "establish", start: 0, reveal: "full", origin: "50% 50%", from: { scale: 1.075, xPercent: 0, yPercent: .5 }, to: { scale: 1.025, xPercent: 0, yPercent: 0 } },
      { src: plate.src, kind: "handles-turn", start: .12, reveal: "seam", origin: "50% 48%", from: { scale: 1.16, xPercent: 0, yPercent: 0 }, to: { scale: 1.24, xPercent: 0, yPercent: -.2 } },
      { src: plate.actionSrc, kind: "doors-open", start: .25, reveal: "vertical", origin: "50% 50%", from: { scale: 1.04, xPercent: 0, yPercent: .2 }, to: { scale: 1.1, xPercent: 0, yPercent: 0 } },
      { src: plate.actionSrc, kind: "shared-corridor", start: .39, reveal: "iris", origin: "50% 43%", from: { scale: 1.05, xPercent: 0, yPercent: .25 }, to: { scale: 1.16, xPercent: 0, yPercent: -.2 } },
      { src: plate.src, kind: "children-remain", start: .52, reveal: "horizontal", origin: "50% 58%", from: { scale: 1.1, xPercent: 0, yPercent: 0 }, to: { scale: 1.04, xPercent: 0, yPercent: .1 } },
      { src: plate.actionSrc, kind: "record-sheet", start: .64, reveal: "seam", origin: "50% 52%", from: { scale: 1.08, xPercent: 0, yPercent: .2 }, to: { scale: 1.15, xPercent: 0, yPercent: -.15 } },
      { src: plate.actionSrc, kind: "six-actions", start: .75, reveal: "vertical", origin: "50% 60%", from: { scale: 1.04, xPercent: 0, yPercent: 0 }, to: { scale: 1.1, xPercent: 0, yPercent: -.1 } },
      { src: plate.src, kind: "memory-objects", start: .86, reveal: "horizontal", origin: "50% 68%", from: { scale: 1.12, xPercent: 0, yPercent: .1 }, to: { scale: 1.05, xPercent: 0, yPercent: 0 } },
      { src: plate.actionSrc, kind: "resolve", start: .94, reveal: "full", origin: "50% 50%", from: { scale: 1.04, xPercent: 0, yPercent: 0 }, to: { scale: 1.015, xPercent: 0, yPercent: 0 } }
    ];
  };
  const FM_C_ACT_SHOTS = FM_C_ACT_PLATES.map((plate, index) => fmCShotPlan(index));
  const fmCResponsibilityRigMarkup = (plate) => `<div class="fm-c-responsibility-rig" aria-hidden="true" data-adult-focus-image="${plate.handleSrc}">
    <span class="duty-fluorescent duty-fluorescent-qing"></span><span class="duty-fluorescent duty-fluorescent-modern"></span>
    <span class="duty-shadow duty-shadow-qing"></span><span class="duty-shadow duty-shadow-modern"></span>
    <span class="duty-grip"><i></i></span><span class="duty-release"><i></i><i></i><i></i></span>
    <svg class="duty-transfer-paths" viewBox="0 0 1000 562" preserveAspectRatio="none"><path class="duty-transfer-path duty-transfer-path-qing" d="M210 355 C245 410 292 348 336 270"></path><path class="duty-transfer-path duty-transfer-path-modern" d="M790 355 C755 410 708 348 664 270"></path></svg>
    <i class="duty-thread"></i><i class="duty-thread-transfer duty-thread-transfer-qing"></i><i class="duty-thread-transfer duty-thread-transfer-modern"></i>
    <i class="duty-paper duty-paper-qing"></i><i class="duty-paper duty-paper-modern"></i>
    <b class="duty-stamp duty-stamp-qing"></b><b class="duty-stamp duty-stamp-modern"></b>
    <span class="duty-adult-focus duty-adult-focus-qing"></span><span class="duty-adult-focus duty-adult-focus-modern"></span>
    <span class="duty-door-leaf duty-door-leaf-qing"></span><span class="duty-door-leaf duty-door-leaf-modern"></span>
    <b class="duty-handle duty-handle-qing"></b><b class="duty-handle duty-handle-modern"></b>
    <em class="duty-light duty-light-qing"></em><em class="duty-light duty-light-modern"></em>
    <span class="duty-breath duty-breath-qing"></span><span class="duty-breath duty-breath-modern"></span>
    <p class="duty-responsibility-title">把責任交給活著的人</p>
  </div>`;
  const fmCEncounterRigMarkup = () => `<div class="fm-c-encounter-rig" aria-hidden="true">
    <span class="encounter-seam"></span><em class="encounter-floor-light"></em>
    <span class="encounter-breath encounter-breath-qing"></span><span class="encounter-breath encounter-breath-modern"></span>
    <span class="encounter-shadow encounter-shadow-qing"></span><span class="encounter-shadow encounter-shadow-modern"></span>
    <i class="encounter-step encounter-step-qing-one"></i><i class="encounter-step encounter-step-qing-two"></i>
    <i class="encounter-step encounter-step-modern-one"></i><i class="encounter-step encounter-step-modern-two"></i>
    <p class="encounter-law"><strong class="encounter-law-copy">家法</strong><i></i><i></i><i></i><i></i><i></i></p>
  </div>`;
  const fmCInformationRigMarkup = () => `<div class="fm-c-information-rig" aria-hidden="true">
    <svg class="information-route" viewBox="0 0 1000 562" preserveAspectRatio="none"><path d="M92 148 C190 96 248 186 348 126 S525 96 620 144 S790 92 908 164"></path></svg>
    <b class="information-packet"></b>
    <i class="information-node" data-label="口信" style="--node-x:10%;--node-y:23%"></i>
    <i class="information-node" data-label="油燈" style="--node-x:24%;--node-y:18%"></i>
    <i class="information-node" data-label="電話" style="--node-x:43%;--node-y:24%"></i>
    <i class="information-node" data-label="訊息" style="--node-x:58%;--node-y:18%"></i>
    <i class="information-node" data-label="訪視" style="--node-x:75%;--node-y:23%"></i>
    <i class="information-node" data-label="卷宗" style="--node-x:90%;--node-y:29%"></i>
    <span class="information-file"></span><span class="information-stamp">已收件</span>
    <em class="information-empty-pulse information-empty-pulse-qing"></em><em class="information-empty-pulse information-empty-pulse-modern"></em>
    <p class="information-stall">下一個人會處理</p>
  </div>`;
  const fmCSilenceRigMarkup = () => `<div class="fm-c-silence-rig fm-c-witness-rig" aria-hidden="true">
    <span class="silence-lamp witness-door-qing"></span><span class="silence-fluorescent witness-door-modern"></span>
    <span class="silence-curtain witness-group-qing">
      <i class="witness-person qing-woman qing-woman-one has-character-art"><img data-src="assets/img/films/fm-c-characters/qing-woman-maroon-clean-mobile.png" alt="" loading="lazy" decoding="async"></i>
      <i class="witness-person qing-woman qing-woman-two has-character-art"><img data-src="assets/img/films/fm-c-characters/qing-woman-brown.webp" alt="" loading="lazy" decoding="async"></i>
      <i class="witness-person qing-woman qing-woman-turn has-character-art"><img data-src="assets/img/films/fm-c-characters/qing-woman-teal-turn.webp" alt="" loading="lazy" decoding="async"><span class="witness-fabric-motion witness-fabric-sleeve" aria-hidden="true"></span></i>
    </span><span class="silence-form-grid witness-group-modern">
      <i class="witness-person modern-nurse modern-nurse-walk has-character-art"><img data-src="assets/img/films/fm-c-characters/nurse-cart.webp" alt="" loading="lazy" decoding="async"></i>
      <i class="witness-person modern-nurse modern-nurse-turn has-character-art"><img data-src="assets/img/films/fm-c-characters/nurse-turn.webp" alt="" loading="lazy" decoding="async"><span class="witness-fabric-motion witness-fabric-arm" aria-hidden="true"></span></i>
    </span>
    <i class="silence-page silence-page-one witness-cart"></i><i class="silence-page silence-page-two witness-chair"></i><i class="silence-page silence-page-three witness-rail"></i>
    <b class="silence-check silence-check-one witness-hand witness-hand-qing"></b><b class="silence-check silence-check-two witness-hand witness-hand-modern"></b><b class="silence-check silence-check-three witness-look witness-look-qing"></b><b class="silence-check silence-check-four witness-look witness-look-modern"></b>
    <em class="silence-child-void witness-shadows"></em>
    <p class="silence-title">兩個時代，都有人回頭</p>
  </div>`;
  const fmCFinaleRigMarkup = () => `<div class="fm-c-finale-rig" aria-hidden="true">
    <span class="finale-corridor"></span><i class="finale-door finale-door-qing"></i><i class="finale-door finale-door-modern"></i>
    <b class="finale-record"></b><div class="finale-actions"><span>看見</span><span>追問</span><span>查證</span><span>通報</span><span>接手</span><span>完成</span></div>
    <em class="finale-memory finale-chair"></em><em class="finale-memory finale-socks"></em><p class="finale-title">讓大人在孩子之前抵達</p>
  </div>`;
  const fmCActRigMarkup = (index, plate) => {
    if (index === 0) return fmCEncounterRigMarkup();
    if (index === 1) return fmCInformationRigMarkup();
    if (index === 2) return fmCSilenceRigMarkup();
    if (index === 3) return fmCResponsibilityRigMarkup(plate);
    if (index === 4) return fmCFinaleRigMarkup();
    return "";
  };
  const filmActSequence = document.createElement("div");
  filmActSequence.className = "fm-c-five-act-sequence";
  filmActSequence.setAttribute("aria-hidden", "true");
  filmActSequence.innerHTML = FM_C_ACT_PLATES.map((plate, index) => `<section class="fm-c-act-frame" data-act-plate="${index + 1}" data-label="${plate.label}" data-act-backdrop="${plate.src}">${FM_C_ACT_SHOTS[index].map((shot, shotIndex) => `<figure class="fm-c-act-shot" data-shot="${shotIndex + 1}" data-shot-kind="${shot.kind}" data-shot-backdrop="${shot.src}" style="--shot-focus:${shot.origin}"><img data-src="${shot.src}" alt="" loading="lazy" decoding="async"></figure>`).join("")}${fmCActRigMarkup(index, plate)}<div class="fm-c-live-fx" aria-hidden="true"><b></b><em></em>${Array.from({ length: 8 }, (_, particleIndex) => `<i style="--particle:${particleIndex}"></i>`).join("")}</div></section>`).join("");
  filmProduction?.prepend(filmActSequence);
  const filmEventRig = document.createElement("div");
  filmEventRig.className = "fm123-event-rig";
  filmEventRig.setAttribute("aria-hidden", "true");
  filmEventRig.innerHTML = `<section class="fm123-event fm123-event-a">
    <div class="fm123-soil">${Array.from({ length: 12 }, (_, index) => `<i style="--soil:${index}"></i>`).join("")}</div>
    <span class="fm123-chair-reveal"></span><span class="fm123-red-hem"></span>
    <span class="fm123-paper-sheet"></span><span class="fm123-ink-bleed"></span>
  </section><section class="fm123-event fm123-event-d">
    <span class="fm123-bundle"><i></i></span><span class="fm123-hand fm123-hand-left"></span><span class="fm123-hand fm123-hand-right"></span>
    <span class="fm123-handoff-thread"></span><span class="fm123-door-gap"></span>
    <span class="fm123-corridor-lamps">${Array.from({ length: 6 }, () => "<i></i>").join("")}</span><span class="fm123-empty-handle"></span>
  </section><section class="fm123-event fm123-event-b">
    <svg class="fm123-time-thread" viewBox="0 0 1000 500" preserveAspectRatio="none"><path d="M32 352 C205 330 226 118 390 170 C520 212 542 374 690 310 C812 258 867 122 968 152" pathLength="1000"></path></svg>
    <span class="fm123-passers"><i></i><i></i><i></i></span><span class="fm123-curtain-edge"></span><span class="fm123-dossier-sheet"></span>
    <span class="fm123-witnesses"><i></i><i></i><i></i><i></i></span><span class="fm123-hair-wash"></span><span class="fm123-empty-seat"></span>
  </section>`;
  filmProduction?.prepend(filmEventRig);
  const filmEventGroups = $$(".fm123-event", filmEventRig);
  const filmEventA = $(".fm123-event-a", filmEventRig);
  const filmSoilItems = $$(".fm123-soil i", filmEventRig);
  const filmChairReveal = $(".fm123-chair-reveal", filmEventRig);
  const filmRedHem = $(".fm123-red-hem", filmEventRig);
  const filmPaperSheet = $(".fm123-paper-sheet", filmEventRig);
  const filmInkBleed = $(".fm123-ink-bleed", filmEventRig);
  const filmEventD = $(".fm123-event-d", filmEventRig);
  const filmBundle = $(".fm123-bundle", filmEventRig);
  const filmHandoffHands = $$(".fm123-hand", filmEventRig);
  const filmHandoffThread = $(".fm123-handoff-thread", filmEventRig);
  const filmDoorGap = $(".fm123-door-gap", filmEventRig);
  const filmCorridorLamps = $$(".fm123-corridor-lamps i", filmEventRig);
  const filmEmptyHandle = $(".fm123-empty-handle", filmEventRig);
  const filmEventB = $(".fm123-event-b", filmEventRig);
  const filmTimeThread = $(".fm123-time-thread path", filmEventRig);
  const filmPassers = $$(".fm123-passers i", filmEventRig);
  const filmCurtainEdge = $(".fm123-curtain-edge", filmEventRig);
  const filmDossierSheet = $(".fm123-dossier-sheet", filmEventRig);
  const filmWitnesses = $$(".fm123-witnesses i", filmEventRig);
  const filmHairWash = $(".fm123-hair-wash", filmEventRig);
  const filmEmptySeat = $(".fm123-empty-seat", filmEventRig);
  const filmActFrames = $$(".fm-c-act-frame", filmActSequence);
  const filmActShots = $$(".fm-c-act-shot", filmActSequence);
  const filmEncounterRig = $(".fm-c-encounter-rig", filmActSequence);
  const filmEncounterSeam = $(".encounter-seam", filmEncounterRig);
  const filmEncounterFloorLight = $(".encounter-floor-light", filmEncounterRig);
  const filmEncounterBreaths = $$(".encounter-breath", filmEncounterRig);
  const filmEncounterShadows = $$(".encounter-shadow", filmEncounterRig);
  const filmEncounterSteps = $$(".encounter-step", filmEncounterRig);
  const filmEncounterLaw = $(".encounter-law", filmEncounterRig);
  const filmEncounterLawCopy = $(".encounter-law-copy", filmEncounterRig);
  const filmEncounterLawFragments = $$(".encounter-law i", filmEncounterRig);
  const filmInformationRig = $(".fm-c-information-rig", filmActSequence);
  const filmInformationPath = $(".information-route path", filmInformationRig);
  const filmInformationPacket = $(".information-packet", filmInformationRig);
  const filmInformationNodes = $$(".information-node", filmInformationRig);
  const filmInformationFile = $(".information-file", filmInformationRig);
  const filmInformationStamp = $(".information-stamp", filmInformationRig);
  const filmInformationEmptyPulses = $$(".information-empty-pulse", filmInformationRig);
  const filmInformationStall = $(".information-stall", filmInformationRig);
  const filmSilenceRig = $(".fm-c-silence-rig", filmActSequence);
  const filmSilenceLamp = $(".silence-lamp", filmSilenceRig);
  const filmSilenceFluorescent = $(".silence-fluorescent", filmSilenceRig);
  const filmSilenceCurtain = $(".silence-curtain", filmSilenceRig);
  const filmSilenceForm = $(".silence-form-grid", filmSilenceRig);
  const filmQingWomen = $$(".qing-woman", filmSilenceRig);
  const filmNurses = $$(".modern-nurse", filmSilenceRig);
  const filmWitnessHeads = $$(".witness-head", filmSilenceRig);
  const filmQingSleeve = $(".witness-fabric-sleeve", filmSilenceRig);
  const filmNurseArm = $(".witness-fabric-arm", filmSilenceRig);
  const filmFabricMotions = [filmQingSleeve, filmNurseArm].filter(Boolean);
  const filmWitnessImages = $$(".witness-person img", filmSilenceRig);
  const filmSilencePages = $$(".silence-page", filmSilenceRig);
  const filmSilenceChecks = $$(".silence-check", filmSilenceRig);
  const filmSilenceVoid = $(".silence-child-void", filmSilenceRig);
  const filmSilenceTitle = $(".silence-title", filmSilenceRig);
  const filmResponsibilityRig = $(".fm-c-responsibility-rig", filmActSequence);
  const filmDutyThread = $(".duty-thread", filmResponsibilityRig);
  const filmDutyPapers = $$(".duty-paper", filmResponsibilityRig);
  const filmDutyHandles = $$(".duty-handle", filmResponsibilityRig);
  const filmDutyLights = $$(".duty-light", filmResponsibilityRig);
  const filmDutyBreaths = $$(".duty-breath", filmResponsibilityRig);
  const filmDutyFluorescents = $$(".duty-fluorescent", filmResponsibilityRig);
  const filmDutyShadows = $$(".duty-shadow", filmResponsibilityRig);
  const filmDutyGrip = $(".duty-grip", filmResponsibilityRig);
  const filmDutyRelease = $(".duty-release", filmResponsibilityRig);
  const filmDutyThreadTransfers = $$(".duty-thread-transfer", filmResponsibilityRig);
  const filmDutyTransferPaths = $$(".duty-transfer-path", filmResponsibilityRig);
  const filmDutyStamps = $$(".duty-stamp", filmResponsibilityRig);
  const filmDutyAdults = $$(".duty-adult-focus", filmResponsibilityRig);
  const filmDutyDoorLeaves = $$(".duty-door-leaf", filmResponsibilityRig);
  const filmDutyTitle = $(".duty-responsibility-title", filmResponsibilityRig);
  const filmFinaleRig = $(".fm-c-finale-rig", filmActSequence);
  const filmFinaleCorridor = $(".finale-corridor", filmFinaleRig);
  const filmFinaleDoors = $$(".finale-door", filmFinaleRig);
  const filmFinaleRecord = $(".finale-record", filmFinaleRig);
  const filmFinaleActions = $$(".finale-actions span", filmFinaleRig);
  const filmFinaleMemory = $$(".finale-memory", filmFinaleRig);
  const filmFinaleTitle = $(".finale-title", filmFinaleRig);
  function hydrateFmCAct(actIndex, shotIndex = 0) {
    const frame = filmActFrames[actIndex];
    if (!frame) return;
    if (frame.dataset.actBackdrop) frame.style.setProperty("--act-backdrop", `url('${assetUrl(frame.dataset.actBackdrop)}')`);
    const shots = $$(".fm-c-act-shot", frame);
    [shotIndex, shotIndex + 1].forEach((index) => {
      const shot = shots[index];
      if (!shot || shot.dataset.hydrated === "true") return;
      if (shot.dataset.shotBackdrop) shot.style.setProperty("--shot-backdrop", `url('${assetUrl(shot.dataset.shotBackdrop)}')`);
      const image = $("img[data-src]", shot);
      if (image?.dataset.src) image.src = image.dataset.src;
      shot.dataset.hydrated = "true";
    });
    if (frame.dataset.rigHydrated !== "true") {
      $$("img[data-src]", frame).filter((image) => !image.closest(".fm-c-act-shot")).forEach((image) => {
        if (image.dataset.src && !image.getAttribute("src")) image.src = image.dataset.src;
      });
      const responsibility = $(".fm-c-responsibility-rig", frame);
      if (responsibility?.dataset.adultFocusImage) responsibility.style.setProperty("--adult-focus-image", `url('${assetUrl(responsibility.dataset.adultFocusImage)}')`);
      frame.dataset.rigHydrated = "true";
    }
  }
  const filmSeparatedPalms = document.createElement("div");
  filmSeparatedPalms.className = "film-separated-palms";
  filmSeparatedPalms.innerHTML = '<i class="palms-child palms-qing"><b></b><span>椅仔姑</span></i><em aria-hidden="true"></em><i class="palms-child palms-modern"><b></b><span>剴剴</span></i>';
  filmProduction?.append(filmSeparatedPalms);
  const filmQingChild = $(".palms-qing", filmSeparatedPalms);
  const filmModernChild = $(".palms-modern", filmSeparatedPalms);
  const filmTimeRift = $("em", filmSeparatedPalms);
  const filmWorldQing = $(".film-world-qing", filmProduction);
  const filmWorldModern = $(".film-world-modern", filmProduction);
  const filmCurtain = $(".film-curtain", filmProduction);
  const filmSeam = $(".film-seam", filmProduction);
  const filmInfoItems = $$("i", $(".film-info-items", filmProduction));
  const filmDoorItems = $$("i", $(".film-door-grid", filmProduction));
  const filmHairItems = $$("i", $(".film-hair", filmProduction));
  const filmLinePath = $(".film-line path", filmProduction);
  const filmStamp = $(".film-stamp", filmProduction);
  const filmKeywordItems = $$("i", $(".film-keywords", filmProduction));
  const filmFlashItems = $$("i", $(".film-local-flash", filmProduction));
  const filmSourceTag = $(".film-source-tag", filmProduction);
  const filmActSlate = $(".film-act-slate", filmProduction);
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
  const ambientAudio = $("#ambient-audio");
  const ambientToggles = $$("[data-ambient-toggle]");
  const ambientTrackLabel = $("#ambient-track-label");
  const progressInput = $("#timeline-progress");
  const timelineTime = $("#timeline-time");
  let filmFoleyContext = null;
  const filmFoleyCooldown = new Map();

  function getFilmFoleyContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!filmFoleyContext) filmFoleyContext = new AudioContextClass();
    if (filmFoleyContext.state === "suspended") filmFoleyContext.resume().catch(() => {});
    return filmFoleyContext;
  }

  function addFoleyTone(context, { frequency, endFrequency, duration, gain, type = "sine", delay = 0 }) {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency || frequency), start + duration);
    volume.gain.setValueAtTime(.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + Math.min(.025, duration * .2));
    volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(volume).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }

  function addFoleyNoise(context, { duration, gain, frequency, type = "bandpass", delay = 0 }) {
    const frameCount = Math.max(1, Math.ceil(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) channel[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const volume = context.createGain();
    const start = context.currentTime + delay;
    source.buffer = buffer;
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = type === "bandpass" ? .7 : .3;
    volume.gain.setValueAtTime(.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + Math.min(.02, duration * .18));
    volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter).connect(volume).connect(context.destination);
    source.start(start);
  }

  function playFmCFoley(kind) {
    if (state.reduced || !state.musicEnabled || !state.player.playing || state.player.currentScene?.id !== "FM-C" || document.hidden) return;
    const now = performance.now();
    if (now - (filmFoleyCooldown.get(kind) || 0) < 900) return;
    filmFoleyCooldown.set(kind, now);
    const context = getFilmFoleyContext();
    if (!context) return;
    if (kind === "fluorescent") {
      addFoleyTone(context, { frequency: 118, endFrequency: 116, duration: .34, gain: .009, type: "sine" });
      addFoleyNoise(context, { duration: .16, gain: .006, frequency: 2800, type: "highpass", delay: .04 });
    } else if (kind === "paper") {
      addFoleyNoise(context, { duration: .32, gain: .016, frequency: 1800, type: "bandpass" });
      addFoleyNoise(context, { duration: .22, gain: .009, frequency: 3200, type: "highpass", delay: .12 });
    } else if (kind === "latch") {
      addFoleyTone(context, { frequency: 690, endFrequency: 260, duration: .14, gain: .024, type: "triangle" });
      addFoleyNoise(context, { duration: .09, gain: .013, frequency: 2100, type: "bandpass", delay: .025 });
    } else if (kind === "step") {
      addFoleyTone(context, { frequency: 94, endFrequency: 48, duration: .17, gain: .026, type: "sine" });
      addFoleyNoise(context, { duration: .2, gain: .011, frequency: 420, type: "lowpass", delay: .02 });
      addFoleyTone(context, { frequency: 86, endFrequency: 45, duration: .16, gain: .021, type: "sine", delay: .23 });
    } else if (kind === "cart") {
      addFoleyNoise(context, { duration: .7, gain: .008, frequency: 720, type: "bandpass" });
      addFoleyTone(context, { frequency: 176, endFrequency: 142, duration: .46, gain: .008, type: "triangle", delay: .04 });
    } else if (kind === "wood") {
      addFoleyNoise(context, { duration: .28, gain: .011, frequency: 520, type: "bandpass" });
      addFoleyTone(context, { frequency: 122, endFrequency: 76, duration: .3, gain: .012, type: "triangle", delay: .03 });
    } else if (kind === "notice") {
      addFoleyTone(context, { frequency: 620, endFrequency: 760, duration: .11, gain: .012, type: "sine" });
      addFoleyTone(context, { frequency: 760, endFrequency: 690, duration: .12, gain: .009, type: "sine", delay: .13 });
    } else if (kind === "stamp") {
      addFoleyTone(context, { frequency: 112, endFrequency: 58, duration: .12, gain: .02, type: "triangle" });
      addFoleyNoise(context, { duration: .14, gain: .014, frequency: 680, type: "lowpass", delay: .018 });
    }
  }

  if (hasGSAP) {
    document.documentElement.classList.add("has-gsap");
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
    if (window.MotionPathPlugin) window.gsap.registerPlugin(window.MotionPathPlugin);
  }

  function stopGateMotion() {
    gateMotionContext?.revert();
    gateMotionContext = null;
  }

  function playGateIntro() {
    if (!hasGSAP || state.reduced || !entryGate || !document.body.classList.contains("is-gated")) return;
    stopGateMotion();
    const { gsap } = window;
    gateMotionContext = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(".gate-panel", { scale: .975, y: 18, duration: .85 })
        .from(".gate-quatrain span", { y: 15, duration: .58, stagger: .075 }, "-=.54")
        .from(".gate-lead, .content-note", { y: 12, autoAlpha: .45, duration: .55, stagger: .08 }, "-=.42")
        .from(".gate-actions > *, .gate-options > *", { y: 10, autoAlpha: 0, duration: .45, stagger: .055 }, "-=.34")
        .from(".gate-film-frame", { scale: .94, autoAlpha: .2, duration: .8 }, .12)
        .from(".gate-film-copy > *", { y: 10, autoAlpha: 0, duration: .5, stagger: .08 }, .42);
      gsap.to(".gate-film-image", { scale: 1.065, xPercent: 1.4, duration: 7.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".gate-door-line", { scaleY: .58, opacity: .48, duration: 2.6, repeat: -1, yoyo: true, transformOrigin: "center", ease: "sine.inOut" });
      gsap.to(".gate-backdrop", { scale: 1.085, xPercent: -1.2, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, entryGate);
  }

  function playPageIntro() {
    if (!hasGSAP || state.reduced || pageIntroPlayed) return;
    pageIntroPlayed = true;
    const { gsap } = window;
    const intro = gsap.timeline({ delay: .28, defaults: { ease: "power3.out" } });
    intro
      .fromTo(header, { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .58, clearProps: "transform,opacity,visibility" })
      .from(".hero-copy > *", { y: 24, autoAlpha: 0, duration: .72, stagger: .075, clearProps: "transform,opacity,visibility" }, "-=.26")
      .from(".hero-brief", { x: 24, autoAlpha: 0, duration: .72, clearProps: "transform,opacity,visibility" }, "-=.54")
      .from(".scroll-cue", { y: -10, autoAlpha: 0, duration: .45, clearProps: "transform,opacity,visibility" }, "-=.3");
  }

  function queueDecorativeSeals() {
    if (decorativeSealsQueued) return;
    decorativeSealsQueued = true;
    const hydrate = () => {
      const limit = window.matchMedia("(max-width:760px)").matches ? 2 : 6;
      $$(".minnan-seal-field img[data-src]").slice(0, limit).forEach((image) => {
        image.src = image.dataset.src;
        delete image.dataset.src;
      });
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(hydrate, { timeout: 3200 });
    else window.setTimeout(hydrate, 2200);
  }

  function setPageGate(locked) {
    window.clearTimeout(gateHideTimer);
    if (locked && entryGate) entryGate.hidden = false;
    if (!locked) stopGateMotion();
    document.body.classList.toggle("is-gated", locked);
    if (header) header.inert = locked;
    if (main) main.inert = locked;
    [footer, helpFab, mobileQuickNav, skipLink].forEach((element) => { if (element) element.inert = locked; });
    entryGate?.setAttribute("aria-hidden", String(!locked));
    entryGate?.setAttribute("aria-modal", String(locked));
    if (!locked) queueDecorativeSeals();
    if (!locked && entryGate) gateHideTimer = window.setTimeout(() => { entryGate.hidden = true; }, 220);
  }

  function enterSite(target = "#top", options = {}) {
    const startWithMusic = options.startWithMusic ?? ($("#gate-music")?.checked === true);
    if (target === "#full-copy") { $(".full-copy-details")?.setAttribute("open", ""); loadInlineStory(); }
    setPageGate(false);
    rememberEnteredSession();
    if (startWithMusic) playAmbient(); else pauseAmbient(true);
    if (target === "#top") playPageIntro();
    window.setTimeout(() => {
      const targetElement = $(target);
      if (target !== "#top") targetElement?.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "start" });
      (target === "#top" ? main : targetElement)?.focus?.({ preventScroll: true });
      window.ScrollTrigger?.refresh();
    }, 220);
  }

  function refreshMotionUi() {
    document.body.classList.toggle("is-reduced", state.reduced);
    if (motionToggle) {
      motionToggle.textContent = state.reduced ? "低動態" : "動態";
      motionToggle.setAttribute("aria-pressed", String(state.reduced));
      motionToggle.setAttribute("aria-label", state.reduced ? "開啟完整頁面動態" : "切換為低動態模式");
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
    if (document.body.classList.contains("is-gated")) {
      if (state.reduced) stopGateMotion(); else playGateIntro();
    }
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
    const quickTargets = ["film-reel", "full-copy"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const current = quickTargets.reduce((active, target) => {
      const top = target.getBoundingClientRect().top;
      return top <= window.innerHeight * .42 ? target.id : active;
    }, window.scrollY < window.innerHeight * .75 ? "" : quickTargets[0]?.id || "");
    $$("[data-quick-section]", mobileQuickNav || document).forEach((link) => {
      if (link.dataset.quickSection === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, "").replace(/[｜|：:、，。；！？「」『』【】（）()]/g, "").toLowerCase();
  }

  function speakerTone(value) {
    const speaker = String(value || "").trim();
    if (/兩人合聲|^合(?:｜|$)/.test(speaker)) return "chorus";
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
      if (paragraph.parentElement !== target) return;
      const text = normalizeText(paragraph.textContent);
      if (/孩子的一日不能寄放在下一日|傳說止於此紀錄從這裡開始|記住他不只是記住一場悲劇|願下一個孩子|下一扇門更早打開/.test(text)) {
        paragraph.classList.add("story-key-line");
      } else if (/(62314|59559|57090|10810|一百一十五天|115日|24小時|202[0-9]年)/.test(text)) {
        paragraph.classList.add("story-data-line");
      } else if (/[？?]/.test(paragraph.textContent)) {
        paragraph.classList.add("story-question");
      } else if (/(不是.+而是|不等於|不能.+只)/.test(text)) {
        paragraph.classList.add("story-contrast");
      }
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
      details.addEventListener("toggle", () => animateTranscriptOpen(details, ".story-dialogue"));
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

  function warmImage(src) {
    if (!src || preloadedAssets.has(src)) return;
    preloadedAssets.add(src);
    const image = new Image();
    image.decoding = "async";
    image.src = src;
  }

  function preloadSceneStart(scene) {
    if (!scene) return;
    if (scene.image && scene.id !== "FM-C") warmImage(scene.image);
    if (scene.id === "FM-C") [...new Set((FM_C_ACT_SHOTS[0] || []).slice(0, 2).map((plan) => plan.src))].forEach(warmImage);
    if (scene.type !== "film") ["female", "male"].forEach((sex) => warmImage(poseAsset(scene, sex, actorPosePlan(scene, sex)[0])));
  }

  function preloadCurrentAndNext(scene) {
    preloadSceneStart(scene);
    const sequenceIndex = state.player.sequence.findIndex((item) => item.id === scene?.id);
    const sequenceNext = sequenceIndex >= 0 ? state.player.sequence[sequenceIndex + 1] : null;
    const storyIndex = STORY_INDEX.get(scene?.id);
    const storyNext = Number.isInteger(storyIndex) ? STORY_SCENES[storyIndex + 1] : null;
    preloadSceneStart(sequenceNext || storyNext);
  }

  function configurePreviewActor(image, scene, sex, pose) {
    image.dataset.actorType = scene.type;
    image.dataset.actorSex = sex;
    image.dataset.actorPose = String(pose);
    image.addEventListener("load", () => calibratePreviewActor(image), { once: true });
  }

  function calibratePreviewActor(image) {
    const type = image.dataset.actorType;
    const sex = image.dataset.actorSex;
    const pose = Number(image.dataset.actorPose);
    if (!type || !sex || !pose || !image.isConnected) return;
    const scale = actorOpticalScale({ type }, sex, pose, image);
    image.style.setProperty("--actor-optical-scale", scale.toFixed(3));
  }

  function calibratePreviewActors(root = document) {
    $$('[data-actor-pose]', root).forEach(calibratePreviewActor);
  }

  function requestActorCalibration(root = document) {
    if (actorCalibrationFrame) window.cancelAnimationFrame(actorCalibrationFrame);
    actorCalibrationFrame = window.requestAnimationFrame(() => {
      actorCalibrationFrame = 0;
      calibratePreviewActors(root);
    });
  }

  function productionFor(scene) {
    return scene?.production || filmProductions[scene?.id] || null;
  }

  function catalogGroups(view) {
    if (view === "type") {
      return [
        { eyebrow: "MAIN FILMS", title: "主線電影", description: "4部 · 各5幕", scenes: STORY_SCENES.filter((scene) => scene.type === "film") },
        { eyebrow: "SHADOW POETRY", title: "皮影詩劇", description: "10場 · 記憶與倫理提問", scenes: STORY_SCENES.filter((scene) => scene.type === "shadow") },
        { eyebrow: "SIDE VIEW", title: "陰翳側視劇場", description: "10場 · 制度接縫", scenes: STORY_SCENES.filter((scene) => scene.type === "side") }
      ];
    }
    if (view === "chapter") {
      const chapterTitles = ["第一篇", "第二篇", "第三篇", "第四篇", "第五篇", "第六篇", "第七篇"];
      return [
        { eyebrow: "OPENING", title: "開場｜序幕與序問", description: "主線起點與雙劇場", scenes: STORY_SCENES.filter((scene) => chapterLabel(scene).startsWith("開場")) },
        ...chapterTitles.map((title, index) => ({ eyebrow: `CHAPTER ${String(index + 1).padStart(2, "0")}`, title, description: "皮影＋側視", scenes: STORY_SCENES.filter((scene) => chapterLabel(scene) === title) })),
        { eyebrow: "CHAPTER 08", title: "第八篇", description: "2部主線＋雙劇場", scenes: STORY_SCENES.filter((scene) => chapterLabel(scene) === "第八篇") },
        { eyebrow: "EPILOGUE", title: "終章", description: "雙劇場＋主線收束", scenes: STORY_SCENES.filter((scene) => chapterLabel(scene) === "終章") }
      ].filter((group) => group.scenes.length);
    }
    return [{ eyebrow: "STORY ORDER", title: "故事順序｜二十四篇長卷", description: "依正文與劇場既定位置排列", scenes: STORY_SCENES }];
  }

  function createAnimationCard(scene) {
    const button = document.createElement("a");
    button.href = `?animation=${publicSceneNumber(scene)}`;
    button.className = "animation-card";
    button.dataset.sceneId = scene.id;
    button.dataset.type = scene.type;
    button.style.setProperty("--catalog-position", FILM_POSITIONS[scene.id] || "50% 50%");
    if (scene.image) button.dataset.poster = assetUrl(scene.image);
    button.setAttribute("aria-label", `播放第${publicSceneNumber(scene)}篇，共${PUBLIC_TOTAL}篇：${scene.title}，${TYPE_LABELS[scene.type]}`);

    const top = document.createElement("span"); top.className = "animation-card-top";
    const number = document.createElement("span"); number.className = "animation-card-number"; number.textContent = publicSceneLabel(scene);
    const watched = document.createElement("span"); watched.className = "animation-card-state"; watched.textContent = state.watched.has(scene.id) ? "已觀看" : "未觀看";
    top.append(number, watched);

    const preview = document.createElement("span");
    preview.className = "animation-card-preview";
    if (scene.type !== "film") {
      const actionIndex = Math.min(4, Math.max(0, scene.actions.length - 1));
      ["female", "male"].forEach((sex) => {
        const pose = actorPosePlan(scene, sex)[actionIndex];
        const image = document.createElement("img");
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.dataset.src = poseAsset(scene, sex, pose);
        image.className = `animation-card-actor ${sex}`;
        configurePreviewActor(image, scene, sex, pose);
        preview.append(image);
      });
    }

    const copy = document.createElement("span"); copy.className = "animation-card-copy";
    const type = document.createElement("small"); type.textContent = `${TYPE_LABELS[scene.type]} · ${chapterLabel(scene)}`;
    const title = document.createElement("strong"); title.textContent = scene.title;
    const subtitle = document.createElement("span"); subtitle.textContent = scene.type === "film" ? (scene.cardCopy || scene.subtitle) : scene.subtitle;
    const detail = document.createElement("i");
    const production = productionFor(scene);
    const duration = production
      ? production.duration
      : Array.from({ length: totalSteps(scene) }, (_, index) => stepDuration(scene, index)).reduce((sum, value) => sum + value, 0);
    detail.textContent = production
      ? `五幕 · ${formatTime(duration)}`
      : `${TYPE_PURPOSES[scene.type].split("｜")[0]} · ${formatTime(duration)}`;
    copy.append(type, title, subtitle, detail);
    button.append(top, preview, copy);
    button.classList.toggle("is-watched", state.watched.has(scene.id));
    button.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openCinema(scene.id, "single");
    });
    return button;
  }

  function observeCatalogPosters(root) {
    catalogPosterObserver?.disconnect();
    const cards = $$(".animation-card", root);
    const reveal = (card) => {
      if (card.dataset.poster) card.style.setProperty("--catalog-poster", `url('${card.dataset.poster}')`);
      $$("img[data-src]", card).forEach((image) => {
        image.src = image.dataset.src;
        delete image.dataset.src;
      });
      card.classList.add("is-poster-ready");
      delete card.dataset.poster;
    };
    if (!("IntersectionObserver" in window)) { cards.forEach(reveal); return; }
    catalogPosterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        catalogPosterObserver?.unobserve(entry.target);
      });
    }, { rootMargin: "260px 0px", threshold: .01 });
    cards.forEach((card) => catalogPosterObserver.observe(card));
  }

  function renderAnimationCatalog(view = state.catalogView) {
    if (!animationCatalog) return;
    state.catalogView = ["story", "type", "chapter"].includes(view) ? view : "story";
    try { localStorage.setItem(STORAGE_KEYS.catalogView, state.catalogView); }
    catch { /* The selected layout simply resets next visit. */ }
    $$('[data-catalog-view]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.catalogView === state.catalogView)));
    animationCatalog.replaceChildren();
    catalogGroups(state.catalogView).forEach((group) => {
      const section = document.createElement("section"); section.className = "animation-catalog-group";
      const header = document.createElement("header"); header.className = "animation-catalog-heading";
      const headingCopy = document.createElement("div");
      const eyebrow = document.createElement("span"); eyebrow.textContent = group.eyebrow;
      const heading = document.createElement("h3"); heading.textContent = group.title;
      const description = document.createElement("small"); description.textContent = `${group.scenes.length}篇 · ${group.description}`;
      headingCopy.append(eyebrow, heading); header.append(headingCopy, description);
      const grid = document.createElement("div"); grid.className = "animation-card-grid";
      group.scenes.forEach((scene) => grid.append(createAnimationCard(scene)));
      section.append(header, grid); animationCatalog.append(section);
    });
    animationCatalog.setAttribute("aria-busy", "false");
    if (animationCatalogStatus) {
      const labels = { story: "故事順序", type: "劇場類型", chapter: "八篇章節" };
      animationCatalogStatus.textContent = `已切換為${labels[state.catalogView]}檢視，共 ${PUBLIC_TOTAL} 篇動畫。`;
    }
    observeCatalogPosters(animationCatalog);
    updateAnimationProgressUi();
  }

  function updateAnimationProgressUi() {
    const count = state.watched.size;
    const label = $("#animation-progress-label");
    if (label) label.textContent = `已觀看 ${count} / ${PUBLIC_TOTAL}`;
    const bar = $("#animation-progress-bar");
    if (bar) bar.style.width = `${PUBLIC_TOTAL ? (count / PUBLIC_TOTAL) * 100 : 0}%`;
    const resumeButton = $("#resume-animation");
    const resumeScene = state.resume ? sceneById.get(state.resume.sceneId) : null;
    if (resumeButton) {
      resumeButton.hidden = !resumeScene;
      if (resumeScene) {
        resumeButton.textContent = `從上次位置繼續 · ${publicSceneLabel(resumeScene)}`;
        resumeButton.setAttribute("aria-label", `從上次位置繼續：${resumeScene.title}，第${publicSceneNumber(resumeScene)}篇，共${PUBLIC_TOTAL}篇`);
      }
    }
    $$(".animation-card", animationCatalog || document).forEach((card) => {
      const isWatched = state.watched.has(card.dataset.sceneId);
      card.classList.toggle("is-watched", isWatched);
      const status = $(".animation-card-state", card);
      if (status) status.textContent = isWatched ? "已觀看" : "未觀看";
    });
  }

  function createLibraryTranscript(scene) {
    const details = document.createElement("details");
    details.className = "library-transcript";
    const summary = document.createElement("summary");
    const lines = document.createElement("div"); lines.className = "library-transcript-lines";
    const production = productionFor(scene);
    const transcriptLines = production?.cues || scene.dialogue;
    const title = document.createElement("span"); title.textContent = `完整${TYPE_LABELS[scene.type]}逐字稿`;
    const hint = document.createElement("small"); hint.textContent = `${transcriptLines.length}段對話／場景說明 · 點擊展開或收合`;
    summary.append(title, hint);
    summary.setAttribute("aria-label", `${scene.title}完整逐字稿，共${transcriptLines.length}段，點擊展開或收合`);
    details.dataset.lineCount = String(transcriptLines.length);
    transcriptLines.forEach((line) => {
      const paragraph = document.createElement("p");
      const speaker = document.createElement("b"); speaker.textContent = Number.isFinite(line.time) ? `${formatTime(line.time)} · ${line.speaker}` : line.speaker;
      const copy = document.createElement("span"); copy.textContent = line.text;
      paragraph.append(speaker, copy); lines.append(paragraph);
    });
    details.append(summary, lines);
    details.addEventListener("toggle", () => animateTranscriptOpen(details, ".library-transcript-lines p"));
    return details;
  }

  function createInlineSceneCard(scene) {
    const item = document.createElement("article");
    item.className = `copy-scene-item ${scene.type}`;
    item.dataset.sceneId = scene.id;
    const button = document.createElement("button"); button.type = "button"; button.className = `copy-scene-card ${scene.type}`; button.setAttribute("aria-label", `播放隨文${TYPE_LABELS[scene.type]}：${scene.title}`);
    const poster = document.createElement("span"); poster.className = "copy-scene-poster";
    if (scene.image) poster.style.setProperty("--poster", `url('${assetUrl(scene.image)}')`);
    if (scene.type !== "film") {
      ["female", "male"].forEach((sex) => { const pose = actorPosePlan(scene, sex)[4]; const image = document.createElement("img"); image.className = `copy-scene-actor ${sex}`; image.alt = ""; image.loading = "lazy"; image.src = poseAsset(scene, sex, pose); configurePreviewActor(image, scene, sex, pose); poster.append(image); });
    }
    const meta = document.createElement("span"); meta.className = "copy-scene-meta";
    const small = document.createElement("small"); small.textContent = `${publicSceneLabel(scene)} · ${TYPE_LABELS[scene.type]} · ${TYPE_PURPOSES[scene.type]}`;
    const strong = document.createElement("strong"); strong.textContent = scene.title;
    const description = document.createElement("span"); description.textContent = scene.type === "film" ? (scene.cardCopy || scene.subtitle) : scene.subtitle;
    meta.append(small, strong, description); button.append(poster, meta);
    button.addEventListener("click", () => openCinema(scene.id, "single"));
    item.append(button);
    item.append(createLibraryTranscript(scene));
    return item;
  }

  function findPlacementHeading(target, placement) {
    const headings = $$("h2, h3, h4, h5", target);
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
      const note = document.createElement("small"); note.textContent = `${validScenes.length} 部 · 可播放，也可上下展開逐字稿`;
      groupHeader.append(label, title, note);
      const grid = document.createElement("div"); grid.className = "copy-scene-grid";
      grid.classList.toggle("is-single", validScenes.length === 1);
      validScenes.forEach((scene) => { inserted.add(scene.id); grid.append(createInlineSceneCard(scene)); });
      group.append(groupHeader, grid); heading.insertAdjacentElement("afterend", group);
    });
    requestActorCalibration(target);
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
    if (!target || !navRoot) return false;
    if (inlineStoryPromise) return inlineStoryPromise;
    if (inlineStoryLoaded) return true;
    inlineStoryLoaded = true;
    inlineStoryPromise = (async () => {
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
        return true;
      } catch (error) {
        inlineStoryLoaded = false;
        target.removeAttribute("aria-busy");
        const paragraph = document.createElement("p"); paragraph.append("完整文案暫時無法嵌入本頁。請改用 ");
        const link = document.createElement("a"); link.href = "story.html"; link.textContent = "純文字閱讀模式"; paragraph.append(link, "。");
        target.replaceChildren(paragraph); navRoot.textContent = "載入失敗"; console.error("Inline story load failed", error);
        return false;
      } finally {
        inlineStoryPromise = null;
      }
    })();
    return inlineStoryPromise;
  }

  function setupFullCopy() {
    const details = $(".full-copy-details");
    if (!details) { loadInlineStory(); return; }
    const openAndLoad = () => { details.open = true; loadInlineStory(); };
    details.addEventListener("toggle", () => { if (details.open) loadInlineStory(); });
    $$('a[href="#full-copy"]').forEach((link) => link.addEventListener("click", openAndLoad));
    if (window.location.hash === "#full-copy") openAndLoad();
  }

  function totalSteps(scene) {
    if (productionFor(scene)) return productionFor(scene).cues.length;
    if (scene.type === "shadow") return Math.max(6, scene.dialogue.length);
    if (scene.type === "side") return Math.max(4, scene.dialogue.length);
    return Math.max(10, scene.dialogue.length);
  }
  function actionIndexFor(scene, localStep) {
    const total = totalSteps(scene);
    const actionCount = Math.max(1, scene.actions.length);
    if (total <= 1 || actionCount <= 1) return 0;
    return Math.min(actionCount - 1, Math.round((localStep / (total - 1)) * (actionCount - 1)));
  }
  function dialogueIndexFor(scene, localStep) { return Math.min(scene.dialogue.length - 1, Math.floor((localStep / totalSteps(scene)) * scene.dialogue.length)); }
  function stepDuration(scene, localStep) {
    const line = scene.dialogue[dialogueIndexFor(scene, localStep)];
    const base = scene.type === "side" ? 4.35 : scene.type === "shadow" ? 3.75 : 2.9;
    return clamp(base + String(line?.text || "").length * .025, scene.type === "side" ? 5 : 4.1, 6.8);
  }

  function createStepMeta(sequence) {
    const result = [];
    let sceneStart = 0;
    sequence.forEach((scene, sequenceIndex) => {
      const production = productionFor(scene);
      if (production) {
        production.cues.forEach((item, cueIndex) => {
          const next = production.cues[cueIndex + 1];
          const actInfo = production.acts[item.act];
          result.push({
            scene,
            sequenceIndex,
            localStep: cueIndex,
            actionIndex: item.act,
            dialogueIndex: cueIndex,
            duration: Math.max(.1, (next?.time ?? production.duration) - item.time),
            isSceneStart: cueIndex === 0,
            isSceneEnd: cueIndex === production.cues.length - 1,
            isActStart: Math.abs(item.time - actInfo.start) < .001,
            sceneStart,
            localStart: item.time,
            cue: item,
            line: item
          });
        });
        sceneStart += production.duration;
        return;
      }
      const total = totalSteps(scene);
      let localStart = 0;
      for (let localStep = 0; localStep < total; localStep += 1) {
        const duration = stepDuration(scene, localStep);
        result.push({ scene, sequenceIndex, localStep, actionIndex: actionIndexFor(scene, localStep), dialogueIndex: dialogueIndexFor(scene, localStep), duration, isSceneStart: localStep === 0, isSceneEnd: localStep === total - 1, sceneStart, localStart });
        localStart += duration;
      }
      sceneStart += localStart;
    });
    return result;
  }

  function setBackdrop(scene, immediate = false) {
    const image = scene.id === "FM-C" ? "" : scene.image || "";
    const current = state.player.currentBackdrop === 0 ? bgA : bgB;
    const next = state.player.currentBackdrop === 0 ? bgB : bgA;
    if (scene.id === "FM-C") [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => { element.style.backgroundImage = "none"; });
    else if (scene.type === "shadow") [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => element.style.removeProperty("background-image"));
    else { const value = image ? `url('${image}')` : "none"; next.style.backgroundImage = value; [depthFar, depthMid, depthNear].forEach((element) => { element.style.backgroundImage = value; }); }
    if (!hasGSAP || immediate || state.reduced) { current.style.opacity = "0"; next.style.opacity = "1"; state.player.currentBackdrop = state.player.currentBackdrop === 0 ? 1 : 0; return; }
    window.gsap.set(next, { autoAlpha: 0, scale: 1.035 });
    window.gsap.to(current, { autoAlpha: 0, duration: .85, ease: "power2.inOut" });
    window.gsap.to(next, { autoAlpha: 1, scale: 1, duration: 1.05, ease: "power2.out" });
    state.player.currentBackdrop = state.player.currentBackdrop === 0 ? 1 : 0;
  }

  function describeSceneVisual(scene, action = "") {
    if (!scene) return "畫面描述：播放器尚未開始。";
    const overview = scene.description || scene.cardCopy || scene.subtitle || scene.title;
    const motifs = [scene.motif, scene.prop].filter(Boolean).join("、");
    return `畫面描述：${overview}${motifs ? `。畫面以${motifs}承接敘事` : ""}${action ? `；目前畫面為${action}` : ""}。人物與場景皆為非肖像化藝術重構，不是案件影像。`;
  }

  function applyScene(scene, immediate = false) {
    const changed = state.player.currentScene?.id !== scene.id;
    const production = productionFor(scene);
    state.player.currentScene = scene; stage.dataset.type = scene.type; stage.dataset.scene = scene.id; stage.dataset.production = String(Boolean(production));
    if (filmProduction) filmProduction.hidden = !production;
    $("#cinema-type").textContent = state.player.mode === "reel" ? `四部主線電影 · ${ACT_LABELS[scene.id] || TYPE_LABELS[scene.type]} · ${publicSceneLabel(scene)}` : `${publicSceneLabel(scene)} · ${TYPE_LABELS[scene.type]} · ${TYPE_PURPOSES[scene.type]}`;
    $("#cinema-title").textContent = scene.title; $("#cinema-subtitle").textContent = production ? `${scene.subtitle}｜五幕 ${formatTime(production.duration)}` : scene.subtitle; $("#cinema-source").textContent = production?.ethics || scene.source; stageProp.textContent = scene.prop || scene.motif || "";
    const filmIntro = $("#cinema-film-intro"); if (filmIntro) { filmIntro.textContent = scene.description || ""; filmIntro.hidden = !scene.description; }
    const visualDescription = $("#cinema-visual-description");
    if (visualDescription) visualDescription.textContent = describeSceneVisual(scene);
    if (changed) {
      preloadCurrentAndNext(scene); setBackdrop(scene, immediate); renderStoryboard(scene); updateActMarkers(scene.id); syncSceneAudio(scene); updateStoryNavigation(scene);
      const productionControls = Boolean(production);
      const previous = $("#prev-beat"); const next = $("#next-beat"); const replay = $("#replay-act");
      if (previous) previous.textContent = productionControls ? "上一幕" : "上一拍";
      if (next) next.textContent = productionControls ? "下一幕" : "下一拍";
      if (replay) replay.textContent = productionControls ? "重播本幕" : "重播本場";
    }
  }

  function scoreKeyForScene(scene) {
    if (!scene) return "";
    if (scene.chapter === "序問") return "00";
    if (scene.chapter === "終章") return "09";
    const numericChapter = String(scene.chapter || "").match(/^\d{1,2}$/)?.[0];
    return numericChapter ? numericChapter.padStart(2, "0") : "";
  }

  function scoreForScene(scene) {
    const production = productionFor(scene);
    if (production?.score) return production.score;
    if (!scene || (scene.type !== "shadow" && scene.type !== "side")) return null;
    return SCORE_TRACKS[scoreKeyForScene(scene)] || null;
  }

  function currentAmbientTrack() {
    if (!ambientAudio) return AMBIENT_TRACKS[state.ambient.trackIndex] || AMBIENT_TRACKS[0];
    const currentSrc = ambientAudio.currentSrc || ambientAudio.src;
    const matchedIndex = AMBIENT_TRACKS.findIndex((track) => new URL(track.src, window.location.href).href === currentSrc);
    if (matchedIndex >= 0) state.ambient.trackIndex = matchedIndex;
    return AMBIENT_TRACKS[state.ambient.trackIndex] || AMBIENT_TRACKS[0];
  }

  function setAmbientTrack(index, restart = false) {
    if (!ambientAudio) return AMBIENT_TRACKS[0];
    const normalizedIndex = ((Number(index) || 0) % AMBIENT_TRACKS.length + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    const track = AMBIENT_TRACKS[normalizedIndex];
    const nextSrc = new URL(track.src, window.location.href).href;
    state.ambient.trackIndex = normalizedIndex;
    window.__kaikaiAmbientTrackIndex = normalizedIndex;
    ambientAudio.loop = false;
    if (ambientAudio.src !== nextSrc) {
      ambientAudio.src = track.src;
      ambientAudio.load();
    } else if (restart) {
      try { ambientAudio.currentTime = 0; } catch { /* metadata is not ready yet */ }
    }
    return track;
  }

  function refreshAmbientUi() {
    if (!ambientAudio) return;
    const playing = !ambientAudio.paused;
    const track = currentAmbientTrack();
    if (ambientTrackLabel) ambientTrackLabel.textContent = track.label;
    ambientToggles.forEach((button) => {
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? `暫停${track.label}` : `播放${track.label}`);
      button.title = playing ? "暫停背景音樂" : "播放背景音樂";
      const status = $(".ambient-status", button);
      if (status) status.textContent = playing ? "暫停" : "播放";
    });
  }

  function playAmbient(trackIndex = null) {
    if (!ambientAudio) return;
    state.ambient.requested = true;
    window.__kaikaiAmbientRequested = true;
    ambientAudio.volume = .34;
    if (Number.isInteger(trackIndex)) setAmbientTrack(trackIndex); else if (!ambientAudio.src) setAmbientTrack(state.ambient.trackIndex);
    currentAmbientTrack();
    ambientAudio.play().then(refreshAmbientUi).catch(refreshAmbientUi);
  }

  function pauseAmbient(userInitiated = false) {
    if (!ambientAudio) return;
    ambientAudio.pause();
    if (userInitiated) {
      state.ambient.requested = false;
      window.__kaikaiAmbientRequested = false;
      state.ambient.resumeAfterForeground = false;
      state.ambient.resumeAfterVisibility = false;
    }
    refreshAmbientUi();
  }

  function toggleAmbient() {
    if (!ambientAudio) return;
    if (ambientAudio.paused) playAmbient(ambientAudio.ended ? (state.ambient.trackIndex + 1) % AMBIENT_TRACKS.length : null); else pauseAmbient(true);
  }

  function advanceAmbientTrack() {
    if (!state.ambient.requested || document.hidden || dialog?.open || scoreLibraryAudio?.paused === false) return;
    playAmbient((state.ambient.trackIndex + 1) % AMBIENT_TRACKS.length);
  }

  function syncPrologueAmbientIntent(event) {
    const detail = event?.detail || {};
    if (Number.isInteger(detail.trackIndex)) state.ambient.trackIndex = clamp(detail.trackIndex, 0, AMBIENT_TRACKS.length - 1);
    state.ambient.requested = detail.requested === true;
    if (!state.ambient.requested) {
      state.ambient.resumeAfterForeground = false;
      state.ambient.resumeAfterVisibility = false;
    }
    refreshAmbientUi();
  }

  function suspendAmbient() {
    if (!ambientAudio || ambientAudio.paused) return;
    state.ambient.resumeAfterForeground = state.ambient.requested;
    pauseAmbient(false);
  }

  function resumeAmbient() {
    if (!state.ambient.resumeAfterForeground || !state.ambient.requested) return;
    state.ambient.resumeAfterForeground = false;
    playAmbient();
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
    if (autoplay) {
      suspendAmbient();
      scoreLibraryAudio.play().catch(() => {});
    }
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

  function scorePauseDurationBefore(score, localTime) {
    return (score?.silentWindows || []).reduce((total, windowInfo) => total + (windowInfo.transport === "pause" && localTime >= windowInfo.end ? windowInfo.end - windowInfo.start : 0), 0);
  }

  function scoreEndOnFilmTime(score) {
    const transportPauses = (score?.silentWindows || []).reduce((total, windowInfo) => total + (windowInfo.transport === "pause" ? windowInfo.end - windowInfo.start : 0), 0);
    return (score?.duration || 0) + transportPauses;
  }

  function audioStateAt(scene, localTime) {
    const score = scoreForScene(scene);
    if (!score) return { score: null, audioTime: 0, shouldPlay: false, volume: 0 };
    const production = productionFor(scene);
    if (!production) return { score, audioTime: Math.max(0, localTime), shouldPlay: true, volume: .48 };
    const silentWindow = (score.silentWindows || []).find((windowInfo) => localTime >= windowInfo.start && localTime < windowInfo.end);
    const audioTime = Math.max(0, silentWindow?.transport === "pause" ? silentWindow.start - scorePauseDurationBefore(score, silentWindow.start) : localTime - scorePauseDurationBefore(score, localTime));
    const scoreEnd = scoreEndOnFilmTime(score);
    const cueInfo = state.player.stepMeta[state.player.stepIndex]?.cue;
    const duckDb = cueInfo?.duckDb ?? score.defaultDuckDb ?? 6;
    let volume = (score.baseVolume ?? .58) * Math.pow(10, -duckDb / 20);
    if (score.fadeIn && localTime < score.fadeIn) volume *= clamp(localTime / score.fadeIn, 0, 1);
    if (score.fadeOutAt != null && localTime > score.fadeOutAt) volume *= clamp((scoreEnd - localTime) / Math.max(.1, scoreEnd - score.fadeOutAt), 0, 1);
    if (silentWindow) volume = 0;
    return { score, audioTime: Math.min(audioTime, score.duration), shouldPlay: localTime < scoreEnd && silentWindow?.transport !== "pause", volume: clamp(volume, 0, 1) };
  }

  function currentSceneLocalTime() {
    const meta = state.player.stepMeta[state.player.stepIndex];
    if (!meta) return 0;
    if (!state.player.timeline) return meta.localStart || 0;
    return clamp(state.player.timeline.time() - meta.sceneStart, 0, productionFor(meta.scene)?.duration || Number.POSITIVE_INFINITY);
  }

  function syncSceneAudioToTimeline(forceSeek = false) {
    if (!cinemaAudio || !state.player.currentScene) return;
    const audioState = audioStateAt(state.player.currentScene, currentSceneLocalTime());
    if (!audioState.score || !cinemaAudio.src) return;
    if (forceSeek || Math.abs(cinemaAudio.currentTime - audioState.audioTime) > .28) {
      try { cinemaAudio.currentTime = audioState.audioTime; } catch { /* metadata is not ready yet */ }
    }
    cinemaAudio.volume = audioState.volume;
    const shouldPlay = state.player.playing && state.musicEnabled && audioState.shouldPlay;
    if (!shouldPlay) {
      cinemaAudio.pause();
      return;
    }
    if (cinemaAudio.paused && !state.player.audioPlayPending) {
      state.player.audioPlayPending = true;
      cinemaAudio.play().catch(() => {}).finally(() => { state.player.audioPlayPending = false; });
    }
  }

  function playSceneAudio() {
    if (!cinemaAudio || !state.musicEnabled || !scoreForScene(state.player.currentScene)) return;
    syncSceneAudioToTimeline(true);
  }

  function syncSceneAudio(scene) {
    if (!cinemaAudio) return;
    const track = scoreForScene(scene);
    updateMusicUi(track);
    if (!track) { cinemaAudio.pause(); cinemaAudio.removeAttribute("src"); cinemaAudio.load(); return; }
    const nextSrc = new URL(track.src, window.location.href).href;
    if (cinemaAudio.src !== nextSrc) { cinemaAudio.pause(); cinemaAudio.src = track.src; cinemaAudio.loop = false; cinemaAudio.load(); }
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

  const CHINESE_ACT_NUMBERS = ["一", "二", "三", "四", "五"];

  function productionView(actInfo) {
    const compact = window.matchMedia("(max-width: 760px)").matches;
    return compact ? actInfo.view.mobile : actInfo.view.desktop;
  }

  function productionSplitForCue(item) {
    if (item?.side === "qing") return "56%";
    if (item?.side === "modern") return "44%";
    return "50%";
  }

  function setProductionState(meta) {
    const production = productionFor(meta.scene);
    if (!production || !filmProduction) return;
    const actInfo = production.acts[meta.actionIndex];
    filmProduction.dataset.film = meta.scene.id;
    filmProduction.dataset.act = String(meta.actionIndex + 1);
    filmProduction.dataset.effect = actInfo.effect;
    const slateSmall = $("small", filmActSlate);
    const slateStrong = $("strong", filmActSlate);
    if (slateSmall) slateSmall.textContent = `第${CHINESE_ACT_NUMBERS[meta.actionIndex]}幕 · ${formatTime(actInfo.start)}–${formatTime(actInfo.end)}`;
    if (slateStrong) slateStrong.textContent = actInfo.title;
    if (filmSourceTag) filmSourceTag.textContent = meta.cue?.speaker || production.ethics;
    if (meta.cue?.keyword) {
      const keywordIndex = production.cues.filter((item) => item.keyword && item.time <= meta.cue.time).length - 1;
      const keyword = filmKeywordItems[keywordIndex];
      if (keyword) keyword.textContent = meta.cue.keyword;
    }
  }

  function resetProductionLayers(timeline, at) {
    const hiddenLayers = [filmCurtain, filmStamp, filmSourceTag, ...filmInfoItems, ...filmDoorItems, ...filmKeywordItems, ...filmFlashItems];
    timeline.set(hiddenLayers, { autoAlpha: 0, x: 0, y: 0, rotation: 0, scale: 1, clearProps: "clipPath,backgroundColor,filter" }, at);
    timeline.set(filmHairItems, { autoAlpha: 0, yPercent: 0, rotation: 0, backgroundColor: "#262724" }, at);
    timeline.set(filmLinePath, { autoAlpha: 0, strokeDasharray: 1000, strokeDashoffset: 1000 }, at);
    timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 0 }, at);
    timeline.set(filmSeparatedPalms, { autoAlpha: 0 }, at);
    timeline.set([filmQingChild, filmModernChild], { xPercent: 0, y: 0, scale: 1 }, at);
    timeline.set(filmTimeRift, { scaleY: .82, autoAlpha: 0 }, at);
    timeline.set([filmEventRig, ...filmEventGroups], { autoAlpha: 0 }, at);
    timeline.set([...filmSoilItems, filmChairReveal, filmRedHem, filmPaperSheet, filmInkBleed, filmBundle, ...filmHandoffHands, filmHandoffThread, filmDoorGap, ...filmCorridorLamps, filmEmptyHandle, ...filmPassers, filmCurtainEdge, filmDossierSheet, ...filmWitnesses, filmHairWash, filmEmptySeat], { autoAlpha: 0, x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, rotationY: 0, scale: 1, scaleX: 1, scaleY: 1, clearProps: "filter,clipPath,backgroundColor,motionPath" }, at);
    timeline.set(filmTimeThread, { autoAlpha: 0, strokeDasharray: 1000, strokeDashoffset: 1000 }, at);
    timeline.set(filmActSequence, { autoAlpha: 0 }, at);
    timeline.set(filmActFrames, { autoAlpha: 0, filter: "brightness(.72)" }, at);
    timeline.set(filmActShots, { autoAlpha: 0, clipPath: "inset(0 0 0 0)", zIndex: 0 }, at);
    timeline.set($$(".fm-c-act-shot img", filmActSequence), { clearProps: "transform" }, at);
    timeline.set($$(".fm-c-live-fx", filmActSequence), { autoAlpha: 0, clearProps: "filter" }, at);
    timeline.set($$(".fm-c-live-fx b,.fm-c-live-fx em,.fm-c-live-fx i", filmActSequence), { autoAlpha: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, clearProps: "filter" }, at);
    timeline.set([filmEncounterRig, filmInformationRig, filmSilenceRig, filmFinaleRig], { autoAlpha: 0 }, at);
    timeline.set([filmEncounterSeam, filmEncounterFloorLight, ...filmEncounterBreaths, ...filmEncounterShadows, ...filmEncounterSteps, filmEncounterLaw, filmEncounterLawCopy, ...filmEncounterLawFragments], { autoAlpha: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, clearProps: "filter,clipPath" }, at);
    timeline.set(filmInformationPath, { autoAlpha: 0, strokeDasharray: 980, strokeDashoffset: 980 }, at);
    timeline.set([filmInformationPacket, ...filmInformationNodes, filmInformationFile, filmInformationStamp, ...filmInformationEmptyPulses, filmInformationStall], { autoAlpha: 0, x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, rotationY: 0, scale: 1, clearProps: "filter,clipPath,offsetDistance" }, at);
    timeline.set([filmSilenceRig, filmSilenceLamp, filmSilenceFluorescent, filmSilenceCurtain, filmSilenceForm, ...filmQingWomen, ...filmNurses, ...filmWitnessHeads, ...filmFabricMotions, ...filmWitnessImages, ...filmSilencePages, ...filmSilenceChecks, filmSilenceVoid, filmSilenceTitle], { autoAlpha: 0, xPercent: 0, yPercent: 0, rotation: 0, rotationY: 0, scale: 1, scaleX: 1, scaleY: 1, clearProps: "filter,clipPath,letterSpacing,transformOrigin" }, at);
    timeline.set(filmResponsibilityRig, { autoAlpha: 0 }, at);
    timeline.set(filmDutyThread, { autoAlpha: 0, scaleX: .35, xPercent: 0, clearProps: "filter" }, at);
    timeline.set(filmDutyPapers, { autoAlpha: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1 }, at);
    timeline.set(filmDutyHandles, { autoAlpha: 0, rotation: 0, scale: 1, clearProps: "filter" }, at);
    timeline.set(filmDutyLights, { autoAlpha: 0, scaleX: .12, scaleY: .86, clearProps: "filter" }, at);
    timeline.set(filmDutyBreaths, { autoAlpha: 0, scale: 1, yPercent: 0 }, at);
    timeline.set(filmDutyFluorescents, { autoAlpha: 0, scaleX: .9, clearProps: "filter" }, at);
    timeline.set(filmDutyShadows, { autoAlpha: 0, scaleY: .45, yPercent: -8 }, at);
    timeline.set([filmDutyGrip, filmDutyRelease], { autoAlpha: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1 }, at);
    timeline.set(filmDutyThreadTransfers, { autoAlpha: 0, x: 0, y: 0, scale: .7, clearProps: "offsetDistance" }, at);
    timeline.set(filmDutyTransferPaths, { autoAlpha: 0, strokeDasharray: 160, strokeDashoffset: 160 }, at);
    timeline.set(filmDutyStamps, { autoAlpha: 0, yPercent: -130, rotation: 0, scale: 1 }, at);
    timeline.set(filmDutyAdults, { autoAlpha: 0, filter: "blur(12px) brightness(.72)" }, at);
    timeline.set(filmDutyDoorLeaves, { autoAlpha: 0, xPercent: 0, scaleX: 1 }, at);
    timeline.set(filmDutyTitle, { autoAlpha: 0, yPercent: 18, clipPath: "inset(0 50% 0 50%)", letterSpacing: ".34em" }, at);
    timeline.set([filmFinaleCorridor, ...filmFinaleDoors, filmFinaleRecord, ...filmFinaleActions, ...filmFinaleMemory, filmFinaleTitle], { autoAlpha: 0, xPercent: 0, yPercent: 0, rotation: 0, rotationY: 0, scale: 1, scaleX: 1, clearProps: "filter,clipPath,letterSpacing" }, at);
    timeline.set(door, { autoAlpha: 0 }, at);
    timeline.set([$("i", door), $("b", door)], { xPercent: 0 }, at);
  }

  function addFmCActPlate(timeline, meta, at, duration) {
    const frame = filmActFrames[meta.actionIndex];
    if (!frame) return;
    const shots = $$(".fm-c-act-shot", frame);
    const plans = FM_C_ACT_SHOTS[meta.actionIndex];
    const fx = $(".fm-c-live-fx", frame);
    const fxPulse = $("b", fx);
    const fxBeam = $("em", fx);
    const particles = $$("i", fx);
    const usesSemanticRig = meta.actionIndex <= 2;
    const transition = Math.min(.82, Math.max(.48, duration * .026));
    const revealClips = {
      left: ["inset(0 100% 0 0)", "inset(0 0 0 0)"],
      right: ["inset(0 0 0 100%)", "inset(0 0 0 0)"],
      seam: ["polygon(50% 0,50% 0,50% 100%,50% 100%)", "polygon(0 0,100% 0,100% 100%,0 100%)"],
      iris: ["circle(2% at 50% 54%)", "circle(78% at 50% 54%)"],
      vertical: ["inset(100% 0 0 0)", "inset(0 0 0 0)"],
      horizontal: ["inset(47% 0 47% 0)", "inset(0 0 0 0)"]
    };
    timeline.set(filmActSequence, { autoAlpha: 1 }, at);
    timeline.fromTo(frame, { autoAlpha: 0, filter: "brightness(.72)" }, { autoAlpha: 1, filter: "brightness(1)", duration: transition, ease: "power2.inOut", immediateRender: false }, at);
    timeline.set(fx, { autoAlpha: 1 }, at);
    timeline.fromTo(fxPulse, { autoAlpha: .08, xPercent: -50, scaleX: .62, scaleY: .76 }, { autoAlpha: usesSemanticRig ? .26 : .72, xPercent: -50, scaleX: 1.14, scaleY: 1.08, duration: duration / 8, repeat: 7, yoyo: true, ease: "sine.inOut", immediateRender: false }, at);
    timeline.fromTo(fxBeam, { autoAlpha: 0, xPercent: -135 }, { autoAlpha: usesSemanticRig ? .1 : .34, xPercent: 135, duration, ease: "sine.inOut", immediateRender: false }, at);

    plans.forEach((plan, shotIndex) => {
      const shot = shots[shotIndex];
      const image = $("img", shot);
      const shotAt = at + duration * plan.start;
      const nextStart = plans[shotIndex + 1]?.start ?? 1;
      const motionDuration = Math.max(1.2, duration * (nextStart - plan.start) + transition);
      const preloadAt = Math.max(at, shotAt - Math.min(1.2, duration * .04));
      timeline.call(() => hydrateFmCAct(meta.actionIndex, shotIndex), null, preloadAt);
      timeline.set(shot, { zIndex: shotIndex + 1 }, shotAt);
      if (shotIndex === 0) {
        timeline.set(shot, { autoAlpha: 1, clipPath: "inset(0 0 0 0)" }, shotAt);
      } else {
        const [reveal, fullReveal] = revealClips[plan.reveal] || revealClips.horizontal;
        timeline.fromTo(shot, { autoAlpha: 0, clipPath: reveal }, { autoAlpha: 1, clipPath: fullReveal, duration: transition, ease: plan.reveal === "seam" || plan.reveal === "iris" ? "power3.inOut" : "power2.out", immediateRender: false }, shotAt);
        timeline.to(shots[shotIndex - 1], { autoAlpha: 0, duration: transition * .55, ease: "power1.out" }, shotAt + transition * .45);
        timeline.fromTo(fx, { filter: "brightness(1.38)" }, { filter: "brightness(1)", duration: transition * .7, ease: "power2.out", immediateRender: false }, shotAt);
      }
      timeline.fromTo(image, plan.from, { ...plan.to, duration: motionDuration, ease: plan.kind === "establish" || plan.kind === "resolve" || plan.kind === "responsibility-hold" ? "none" : "sine.inOut", immediateRender: false }, shotAt);
    });

    if (!usesSemanticRig) {
      particles.forEach((particle, particleIndex) => {
        const particleAt = at + duration * (.05 + particleIndex * .075);
        const direction = particleIndex % 2 === 0 ? 1 : -1;
        timeline.fromTo(particle, { autoAlpha: 0, xPercent: direction * -160, yPercent: 120 + particleIndex * 12, rotation: direction * -18, scale: .72 + particleIndex * .035 }, { autoAlpha: .5, xPercent: direction * 210, yPercent: -170 - particleIndex * 8, rotation: direction * 70, scale: 1, duration: duration * .34, ease: "sine.out", immediateRender: false }, particleAt);
        timeline.to(particle, { autoAlpha: 0, duration: .5, ease: "power1.out" }, particleAt + duration * .3);
      });
    }
  }

  function addProductionAct(timeline, meta, at) {
    const production = productionFor(meta.scene);
    const actInfo = production.acts[meta.actionIndex];
    const duration = actInfo.end - actInfo.start;
    const view = productionView(actInfo);
    const travel = Math.min(2.2, duration * .16);
    const backgroundDuration = actInfo.effect === "white-hair" ? 15.5 : duration;
    const usesFmCActPlate = meta.scene.id === "FM-C" && Boolean(filmActFrames[meta.actionIndex]);
    timeline.call(() => setProductionState(meta), null, at);
    resetProductionLayers(timeline, at);
    if (usesFmCActPlate) {
      timeline.set([bgA, bgB, depthFar, depthMid, depthNear], { autoAlpha: 0 }, at);
      addFmCActPlate(timeline, meta, at, duration);
    } else {
      timeline.set([bgA, bgB], { clearProps: "filter" }, at);
      timeline.set([bgA, bgB, depthFar, depthMid, depthNear], { backgroundPosition: view.position, backgroundSize: view.size }, at);
      timeline.fromTo([bgA, bgB], { scale: 1.018 }, { scale: 1.055, duration: backgroundDuration, ease: "none" }, at);
      timeline.fromTo(depthFar, { xPercent: -1.2, scale: 1.02 }, { xPercent: 1.2, scale: 1.06, duration: backgroundDuration, ease: "none" }, at);
      timeline.fromTo(depthMid, { xPercent: .8, scale: 1.03 }, { xPercent: -1.1, scale: 1.075, duration: backgroundDuration, ease: "sine.inOut" }, at);
      timeline.fromTo(depthNear, { xPercent: 1.4, scale: 1.05 }, { xPercent: -1.8, scale: 1.1, duration: backgroundDuration, ease: "sine.inOut" }, at);
    }
    timeline.fromTo(filmActSlate, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .55, ease: "power2.out" }, at + .08);
    timeline.to(filmActSlate, { autoAlpha: 0, duration: .65 }, at + Math.min(4.5, duration * .28));

    const lineDraw = (startOffset = .4, drawDuration = Math.min(8, duration * .6), end = 0) => {
      timeline.set(filmLinePath, { autoAlpha: .82 }, at + startOffset);
      timeline.to(filmLinePath, { strokeDashoffset: end, duration: drawDuration, ease: "power1.inOut" }, at + startOffset);
    };
    const doorLeft = $("i", door);
    const doorRight = $("b", door);
    const eventGroup = meta.scene.id === "FM-A" ? filmEventA : meta.scene.id === "FM-D" ? filmEventD : meta.scene.id === "FM-B" ? filmEventB : null;
    if (eventGroup) timeline.set([filmEventRig, eventGroup], { autoAlpha: 1 }, at);

    switch (actInfo.effect) {
      case "mud-thread":
        lineDraw(.5, duration * .78, 0);
        timeline.fromTo(mist, { autoAlpha: .08, xPercent: -5 }, { autoAlpha: .38, xPercent: 4, duration, ease: "sine.inOut" }, at);
        timeline.fromTo(filmChairReveal, { autoAlpha: 0, scale: .7, clipPath: "inset(68% 18% 0 18%)" }, { autoAlpha: .42, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: duration * .72, ease: "power1.inOut", immediateRender: false }, at + duration * .18);
        filmSoilItems.forEach((flake, index) => {
          const flakeAt = at + .3 + index * .32;
          const flakeDuration = 4.6 + index % 4 * .55;
          const direction = index % 2 === 0 ? 1 : -1;
          const from = { autoAlpha: 0, x: direction * (18 + index * 3), y: -70 - index * 4, rotation: direction * -18, scale: .72 + index * .018 };
          const to = { autoAlpha: .46, rotation: direction * (38 + index * 4), scale: 1, duration: flakeDuration, ease: "sine.in", immediateRender: false };
          if (window.MotionPathPlugin) to.motionPath = { path: [{ x: direction * -8, y: 10 }, { x: direction * 18, y: 78 }, { x: direction * -5, y: 164 }], curviness: 1.35 };
          else Object.assign(to, { x: direction * -5, y: 164 });
          timeline.fromTo(flake, from, to, flakeAt);
          timeline.to(flake, { autoAlpha: .12, duration: .8, ease: "power1.out" }, flakeAt + flakeDuration - .4);
        });
        break;
      case "bundle":
        lineDraw(.5, duration * .78, 230);
        timeline.fromTo(mist, { autoAlpha: .08, xPercent: -5 }, { autoAlpha: .28, xPercent: 3, duration, ease: "sine.inOut" }, at);
        timeline.fromTo(filmBundle, { autoAlpha: 0, xPercent: -38, rotation: -7, scale: .9 }, { autoAlpha: .64, xPercent: 0, rotation: 0, scale: 1, duration: duration * .34, ease: "power2.out", immediateRender: false }, at + .4);
        timeline.fromTo(filmHandoffHands[0], { autoAlpha: 0, xPercent: -42 }, { autoAlpha: .46, xPercent: -12, duration: duration * .28, ease: "power2.out", immediateRender: false }, at + duration * .34);
        timeline.fromTo(filmHandoffThread, { autoAlpha: 0, scaleX: .12 }, { autoAlpha: .58, scaleX: .78, duration: duration * .34, transformOrigin: "left center", ease: "power1.inOut", immediateRender: false }, at + duration * .46);
        break;
      case "night-door":
        timeline.set(door, { autoAlpha: .68 }, at + 1.2);
        timeline.fromTo(door, { xPercent: -.35 }, { xPercent: .35, duration: .24, repeat: 5, yoyo: true, ease: "sine.inOut", immediateRender: false }, at + 1.6);
        timeline.to(doorLeft, { xPercent: -82, duration: duration * .52, ease: "power1.inOut" }, at + 3.2);
        timeline.to(doorRight, { xPercent: 82, duration: duration * .52, ease: "power1.inOut" }, at + 3.2);
        timeline.fromTo(filmRedHem, { autoAlpha: 0, xPercent: -64, scaleY: .82 }, { autoAlpha: .52, xPercent: 0, scaleY: 1, duration: duration * .28, ease: "power2.out", immediateRender: false }, at + duration * .32);
        timeline.fromTo(filmCurtain, { autoAlpha: 0, scaleY: .82, skewX: -2 }, { autoAlpha: .72, scaleY: 1.06, skewX: 2, duration: duration * .44, ease: "sine.inOut" }, at + duration * .42);
        break;
      case "match-cut":
        timeline.fromTo(filmCurtain, { autoAlpha: .86, clipPath: "inset(0 48% 0 48%)" }, { autoAlpha: .1, clipPath: "inset(0 0% 0 0%)", duration: Math.min(2.2, duration * .3), ease: "power2.inOut" }, at);
        timeline.fromTo(filmRedHem, { autoAlpha: .62, clipPath: "inset(0 0 0 0)" }, { autoAlpha: .2, clipPath: "inset(0 0 78% 0)", duration: duration * .38, ease: "power2.inOut", immediateRender: false }, at);
        timeline.fromTo(filmPaperSheet, { autoAlpha: 0, scaleY: .08, yPercent: 36 }, { autoAlpha: .46, scaleY: 1, yPercent: 0, duration: duration * .58, transformOrigin: "center bottom", ease: "power2.inOut", immediateRender: false }, at + duration * .22);
        timeline.to([bgA, bgB], { filter: "saturate(.62) contrast(1.04) brightness(.8)", duration: duration * .72, ease: "sine.inOut" }, at + .4);
        timeline.set(door, { autoAlpha: .4 }, at + duration * .48);
        timeline.to(doorLeft, { xPercent: -96, duration: 2.2, ease: "power2.inOut" }, at + duration * .55);
        timeline.to(doorRight, { xPercent: 96, duration: 2.2, ease: "power2.inOut" }, at + duration * .55);
        break;
      case "verdict":
        lineDraw(1.2, duration * .7, 0);
        timeline.fromTo(filmPaperSheet, { autoAlpha: 0, scale: .94, yPercent: 4 }, { autoAlpha: .52, scale: 1, yPercent: 0, duration: 1.4, ease: "power2.out", immediateRender: false }, at + .4);
        timeline.fromTo(filmStamp, { autoAlpha: 0, y: -22, scaleX: 1.14, scaleY: 1.3, rotation: -7 }, { autoAlpha: .72, y: 0, scaleX: 1, scaleY: .92, rotation: -3, duration: .28, ease: "power3.in" }, at + duration * .28);
        timeline.to(filmStamp, { scaleY: 1, duration: .18, ease: "power2.out" }, at + duration * .28 + .28);
        timeline.fromTo(filmInkBleed, { autoAlpha: 0, scale: .36, filter: "blur(0px)" }, { autoAlpha: .34, scale: 1.5, filter: "blur(7px)", duration: 2.8, ease: "sine.out", immediateRender: false }, at + duration * .28 + .2);
        timeline.fromTo(filmPaperSheet, { xPercent: -.18 }, { xPercent: .18, duration: .08, repeat: 3, yoyo: true, ease: "none", immediateRender: false }, at + duration * .28);
        timeline.to(focusLight, { xPercent: 28, autoAlpha: .34, duration: travel, ease: "sine.inOut" }, at);
        break;
      case "safe-flash":
        timeline.set(filmInkBleed, { autoAlpha: .16, scale: 1.25 }, at);
        filmFlashItems.forEach((flash, index) => {
          const first = at + 4 + index * 1.28;
          timeline.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: .16, duration: .08, repeat: 1, yoyo: true, ease: "none" }, first);
          timeline.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: .13, duration: .08, repeat: 1, yoyo: true, ease: "none" }, first + 5.2);
        });
        break;
      case "phone-door":
        timeline.set(door, { autoAlpha: .46 }, at + 1);
        timeline.fromTo(filmDoorGap, { autoAlpha: 0, scaleX: .05 }, { autoAlpha: .54, scaleX: .2, duration: 2.4, transformOrigin: "center", ease: "sine.inOut", immediateRender: false }, at + duration * .38);
        timeline.fromTo(filmEmptyHandle, { autoAlpha: 0, rotation: -14 }, { autoAlpha: .58, rotation: 0, duration: .7, ease: "power2.out", immediateRender: false }, at + duration * .31);
        timeline.to([doorLeft, doorRight], { xPercent: (index, target) => target === doorLeft ? -5 : 5, duration: 2.4, ease: "sine.inOut" }, at + duration * .42);
        timeline.to([doorLeft, doorRight], { xPercent: 0, duration: 1.5, ease: "sine.inOut" }, at + duration * .68);
        timeline.to(filmDoorGap, { autoAlpha: .08, scaleX: .04, duration: 1.5, ease: "sine.inOut" }, at + duration * .68);
        timeline.fromTo(focusLight, { xPercent: -18, autoAlpha: .12 }, { xPercent: 24, autoAlpha: .3, duration, ease: "sine.inOut" }, at);
        break;
      case "trust-corridor":
        timeline.fromTo(filmSourceTag, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .55 }, at + duration * .34);
        lineDraw(.6, duration * .74, 170);
        timeline.fromTo(filmHandoffHands, { autoAlpha: 0, xPercent: (index) => index === 0 ? -62 : 62 }, { autoAlpha: .64, xPercent: (index) => index === 0 ? -5 : 5, duration: duration * .32, stagger: .55, ease: "power2.out", immediateRender: false }, at + duration * .16);
        timeline.fromTo(filmHandoffThread, { autoAlpha: 0, scaleX: .08 }, { autoAlpha: .72, scaleX: 1, duration: duration * .26, transformOrigin: "left center", ease: "power1.inOut", immediateRender: false }, at + duration * .39);
        timeline.to(filmHandoffHands[0], { xPercent: -18, duration: duration * .18, ease: "power2.inOut" }, at + duration * .61);
        timeline.to(filmHandoffHands[1], { xPercent: 68, autoAlpha: .18, duration: duration * .24, ease: "power2.inOut" }, at + duration * .66);
        break;
      case "six-doors":
        timeline.fromTo(filmDoorItems, { autoAlpha: 0, y: 16, rotationY: -12 }, { autoAlpha: .9, y: 0, rotationY: 0, duration: .7, stagger: 1.2, ease: "power2.out" }, at + .8);
        timeline.fromTo(filmCorridorLamps, { autoAlpha: 0, scaleY: .65 }, { autoAlpha: .7, scaleY: 1, duration: .38, stagger: .36, ease: "power2.out", immediateRender: false }, at + .5);
        [...filmCorridorLamps].reverse().forEach((lamp, index) => timeline.to(lamp, { autoAlpha: .08, filter: "brightness(.4)", duration: .34, ease: "power1.out" }, at + duration * .48 + index * 1.15));
        timeline.set(filmHandoffThread, { autoAlpha: .6, scaleX: .12 }, at + .7);
        timeline.to(filmHandoffThread, { scaleX: .84, duration: duration * .55, transformOrigin: "left center", ease: "power1.inOut" }, at + 1);
        lineDraw(1.1, 8.1, 145);
        timeline.to(filmDoorItems[5], { autoAlpha: .48, filter: "brightness(.72)", duration: .45 }, at + 8.9);
        break;
      case "testimony":
        timeline.fromTo(filmSourceTag, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .5 }, at + .4);
        timeline.fromTo(filmEmptyHandle, { autoAlpha: 0, yPercent: 16, rotation: -10 }, { autoAlpha: .62, yPercent: 0, rotation: 0, duration: 1.2, ease: "power2.out", immediateRender: false }, at + .8);
        timeline.set(filmHandoffThread, { autoAlpha: .5, scaleX: .84 }, at + .6);
        timeline.to(filmHandoffThread, { autoAlpha: .2, scaleX: 1, duration: duration * .74, transformOrigin: "left center", ease: "sine.out" }, at + .6);
        timeline.fromTo(focusLight, { xPercent: -24, autoAlpha: .1 }, { xPercent: 14, autoAlpha: .28, duration: 5, ease: "sine.inOut" }, at);
        lineDraw(3.2, duration * .64, 115);
        break;
      case "qing-hair":
        timeline.fromTo(filmHairItems, { autoAlpha: 0, yPercent: -6, backgroundColor: "#161816" }, { autoAlpha: (index) => .34 + index % 3 * .045, yPercent: 4, duration: 2.4, stagger: .12, ease: "sine.inOut" }, at + .5);
        timeline.fromTo(filmPassers, { autoAlpha: 0, xPercent: -110, yPercent: 4 }, { autoAlpha: .56, xPercent: (index) => index < 2 ? 124 : 30, yPercent: 0, duration: duration * .52, stagger: .9, ease: "power1.out", immediateRender: false }, at + duration * .08);
        timeline.to(filmPassers[2], { rotationY: -18, xPercent: 18, duration: 1.1, transformOrigin: "center bottom", ease: "power3.inOut" }, at + duration * .62);
        timeline.fromTo(filmTimeThread, { autoAlpha: 0, strokeDashoffset: 1000 }, { autoAlpha: .62, strokeDashoffset: 620, duration: duration * .72, ease: "power1.inOut", immediateRender: false }, at + duration * .18);
        break;
      case "medical-curtain":
        timeline.fromTo(filmCurtain, { autoAlpha: .1, scaleX: .72 }, { autoAlpha: .62, scaleX: 1.08, duration: 4.6, ease: "sine.inOut" }, at);
        timeline.fromTo(filmTimeThread, { autoAlpha: .42, strokeDashoffset: 620 }, { autoAlpha: .62, strokeDashoffset: 260, duration: duration * .58, ease: "power1.inOut", immediateRender: false }, at);
        timeline.fromTo(filmCurtainEdge, { autoAlpha: 0, scaleY: .18, xPercent: -18 }, { autoAlpha: .58, scaleY: 1, xPercent: 0, duration: duration * .3, transformOrigin: "top center", ease: "power2.out", immediateRender: false }, at + duration * .16);
        timeline.fromTo(filmWitnesses.slice(0, 2), { autoAlpha: 0, xPercent: 48 }, { autoAlpha: .44, xPercent: (index) => index === 0 ? -44 : -12, duration: duration * .28, stagger: 1.1, ease: "power2.out", immediateRender: false }, at + duration * .32);
        timeline.to(filmWitnesses[1], { rotationY: 16, xPercent: -18, duration: 1.1, transformOrigin: "center bottom", ease: "power3.inOut" }, at + duration * .68);
        timeline.fromTo(rain, { autoAlpha: 0, yPercent: -7 }, { autoAlpha: .19, yPercent: 7, duration, ease: "none" }, at);
        break;
      case "dossier":
        timeline.fromTo(filmCurtain, { autoAlpha: .65, clipPath: "inset(0 0 0 0)" }, { autoAlpha: .08, clipPath: "inset(0 45% 0 45%)", duration: 3.2, ease: "power2.inOut" }, at);
        timeline.set(filmTimeThread, { autoAlpha: .56, strokeDashoffset: 260 }, at);
        timeline.to(filmTimeThread, { strokeDashoffset: 0, duration: duration * .58, ease: "power1.inOut" }, at + .2);
        timeline.fromTo(filmDossierSheet, { autoAlpha: 0, scaleX: .12 }, { autoAlpha: .34, scaleX: 1, duration: duration * .34, transformOrigin: "left center", ease: "power2.inOut", immediateRender: false }, at + duration * .16);
        timeline.fromTo(filmWitnesses, { autoAlpha: 0, yPercent: 12, scale: .86 }, { autoAlpha: .5, yPercent: 0, scale: 1, duration: .55, stagger: .52, ease: "power2.out", immediateRender: false }, at + duration * .36);
        timeline.fromTo(papers, { autoAlpha: 0 }, { autoAlpha: .46, duration: 1.4 }, at + 2.2);
        break;
      case "white-hair":
        timeline.set(filmTimeThread, { autoAlpha: .42, strokeDashoffset: 0 }, at);
        timeline.fromTo(filmHairItems, { autoAlpha: .34, backgroundColor: "#20211f" }, { autoAlpha: (index) => .3 + index % 4 * .035, backgroundColor: "#b8bbb5", duration: 9.2, stagger: .55, ease: "none" }, at);
        timeline.fromTo(filmHairWash, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" }, { autoAlpha: .34, clipPath: "inset(0 0 0% 0)", duration: 15.2, ease: "none", immediateRender: false }, at + .2);
        timeline.to([atmosphere, mist, rain], { autoAlpha: .04, duration: .25 }, at + 16);
        timeline.to([atmosphere, mist, rain], { autoAlpha: .18, duration: .4 }, at + 19);
        timeline.to([bgA, bgB, depthFar, depthMid, depthNear], { scale: "+=.012", duration: 3, ease: "sine.inOut" }, at + 19);
        break;
      case "empty-court":
        timeline.fromTo(filmEmptySeat, { autoAlpha: 0, yPercent: 8 }, { autoAlpha: .56, yPercent: 0, duration: 1.2, ease: "power2.out", immediateRender: false }, at + .2);
        timeline.to([atmosphere, focusLight, thread, filmTimeThread, filmHairWash], { autoAlpha: .05, duration: 4.6, ease: "sine.out" }, at);
        timeline.to(filmWitnesses, { autoAlpha: 0, xPercent: (index) => index % 2 ? 38 : -38, duration: 3.8, stagger: .2, ease: "power1.in" }, at + .4);
        break;
      case "split-shadow":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        if (usesFmCActPlate) {
          timeline.set(filmEncounterRig, { autoAlpha: 1 }, at);
          timeline.fromTo(filmEncounterSeam, { autoAlpha: .16, scaleY: .72, filter: "brightness(.72)" }, { autoAlpha: .76, scaleY: 1.08, filter: "brightness(1.35)", duration: 2.4, repeat: 5, yoyo: true, ease: "sine.inOut" }, at + .2);
          timeline.fromTo(filmEncounterBreaths, { autoAlpha: 0, scale: .94, yPercent: 1.4 }, { autoAlpha: .2, scale: 1.05, yPercent: -1.4, duration: 1.55, repeat: 8, yoyo: true, stagger: .16, ease: "sine.inOut" }, at + duration * .08);
          timeline.fromTo(filmEncounterSteps, { autoAlpha: 0, scale: .68, yPercent: 16 }, { autoAlpha: .62, scale: 1, yPercent: 0, duration: .34, stagger: .28, ease: "power2.out" }, at + duration * .37);
          timeline.call(() => playFmCFoley("step"), null, at + duration * .39);
          timeline.fromTo(filmEncounterShadows, { autoAlpha: 0, scaleY: .45, xPercent: 0 }, { autoAlpha: .58, scaleY: 1.18, xPercent: (index) => index === 0 ? 68 : -68, duration: duration * .16, stagger: .08, ease: "power2.inOut" }, at + duration * .52);
          timeline.fromTo(filmEncounterFloorLight, { autoAlpha: 0, scaleX: .08 }, { autoAlpha: .62, scaleX: 1, duration: duration * .18, ease: "sine.inOut" }, at + duration * .66);
          timeline.fromTo(filmEncounterLaw, { autoAlpha: 0, yPercent: -18, clipPath: "inset(0 48% 0 48%)" }, { autoAlpha: .9, yPercent: 0, clipPath: "inset(0 0% 0 0%)", duration: .75, ease: "power3.out" }, at + duration * .82);
          timeline.set([filmEncounterLawCopy, ...filmEncounterLawFragments], { autoAlpha: 1 }, at + duration * .84);
          timeline.to(filmEncounterLawCopy, { autoAlpha: .24, filter: "blur(1.2px)", duration: duration * .13, ease: "power2.in" }, at + duration * .86);
          timeline.to(filmEncounterLawFragments, { autoAlpha: 0, xPercent: (index) => [-190, -88, 42, 118, 210][index], yPercent: (index) => 120 + index * 26, rotation: (index) => [-38, 24, -18, 42, -31][index], duration: duration * .14, stagger: .045, ease: "power1.in" }, at + duration * .86);
          timeline.call(() => playFmCFoley("wood"), null, at + duration * .84);
          lineDraw(.8, duration * .7, 430);
          break;
        }
        timeline.fromTo(filmSeparatedPalms, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, at + .25);
        timeline.fromTo(filmQingChild, { xPercent: -12 }, { xPercent: 0, duration: 3.2, ease: "power2.out" }, at + .25);
        timeline.fromTo(filmModernChild, { xPercent: 12 }, { xPercent: 0, duration: 3.2, ease: "power2.out" }, at + .25);
        timeline.fromTo(filmTimeRift, { autoAlpha: 0, scaleY: .65 }, { autoAlpha: 1, scaleY: 1, duration: 1.8, ease: "sine.out" }, at + 1.25);
        lineDraw(1.6, duration * .64, 430);
        break;
      case "information":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        if (usesFmCActPlate) {
          timeline.set(filmInformationRig, { autoAlpha: 1 }, at);
          timeline.fromTo(filmInformationPath, { autoAlpha: 0, strokeDashoffset: 980 }, { autoAlpha: .78, strokeDashoffset: 0, duration: duration * .36, ease: "power1.inOut" }, at + duration * .08);
          timeline.fromTo(filmInformationNodes, { autoAlpha: 0, scale: .72, filter: "brightness(.65)" }, { autoAlpha: .88, scale: 1, filter: "brightness(1.28)", duration: .5, stagger: duration * .035, ease: "back.out(1.55)" }, at + duration * .09);
          timeline.call(() => playFmCFoley("notice"), null, at + duration * .1);
          timeline.fromTo(filmInformationPacket, { autoAlpha: 0, scale: .58 }, { autoAlpha: 1, scale: 1, duration: .3, ease: "power2.out" }, at + duration * .11);
          if (window.MotionPathPlugin && filmInformationPath) {
            timeline.to(filmInformationPacket, { motionPath: { path: filmInformationPath, align: filmInformationPath, alignOrigin: [.5, .5], start: 0, end: 1 }, duration: duration * .58, ease: "power1.inOut" }, at + duration * .12);
          } else {
            timeline.to(filmInformationPacket, { xPercent: 2500, yPercent: 90, duration: duration * .58, ease: "power1.inOut" }, at + duration * .12);
          }
          timeline.fromTo(filmInformationFile, { autoAlpha: 0, yPercent: -55, rotationY: -76, scale: .82 }, { autoAlpha: .9, yPercent: 0, rotationY: 0, scale: 1, duration: duration * .09, ease: "power3.out" }, at + duration * .43);
          timeline.call(() => playFmCFoley("paper"), null, at + duration * .44);
          timeline.fromTo(filmInformationStamp, { autoAlpha: 0, yPercent: -145, rotation: -9, scale: 1.28 }, { autoAlpha: .9, yPercent: 0, rotation: -3, scale: 1, duration: .42, ease: "back.out(2.2)" }, at + duration * .48);
          timeline.call(() => playFmCFoley("stamp"), null, at + duration * .49);
          timeline.fromTo(filmInformationEmptyPulses, { autoAlpha: 0, scale: .35 }, { autoAlpha: .48, scale: 1.35, duration: 1.4, repeat: 3, yoyo: true, stagger: .12, ease: "sine.inOut" }, at + duration * .7);
          timeline.to([filmInformationPath, ...filmInformationNodes, filmInformationPacket, filmInformationFile, filmInformationStamp], { autoAlpha: .24, filter: "brightness(.72)", duration: 1.15, ease: "power2.out" }, at + duration * .82);
          timeline.fromTo(filmInformationStall, { autoAlpha: 0, yPercent: 20, clipPath: "inset(0 50% 0 50%)" }, { autoAlpha: 1, yPercent: 0, clipPath: "inset(0 0% 0 0%)", duration: .8, ease: "power3.out" }, at + duration * .84);
          lineDraw(.7, duration * .72, 210);
          break;
        }
        timeline.set([filmSeparatedPalms, filmTimeRift], { autoAlpha: 1 }, at);
        timeline.to([filmQingChild, filmModernChild], { y: -3, duration: 2.8, repeat: 3, yoyo: true, ease: "sine.inOut" }, at + .4);
        timeline.fromTo(filmInfoItems, { autoAlpha: 0, y: 18, rotation: -4 }, { autoAlpha: .76, y: 0, rotation: 0, duration: .65, stagger: 1, ease: "power2.out" }, at + .8);
        timeline.to(filmInfoItems, { autoAlpha: .32, y: -8, duration: duration * .55, stagger: .18, ease: "sine.inOut" }, at + 7);
        break;
      case "silence-clothes":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        if (usesFmCActPlate) {
          timeline.set(filmSilenceRig, { autoAlpha: 1 }, at);
          timeline.fromTo(filmSilenceLamp, { autoAlpha: .08, scale: .86, filter: "brightness(.58)" }, { autoAlpha: .62, scale: 1.08, filter: "brightness(1.32)", duration: .16, repeat: 5, yoyo: true, ease: "steps(1)" }, at + .18);
          timeline.fromTo(filmSilenceFluorescent, { autoAlpha: .04, scaleX: .88, filter: "brightness(.5)" }, { autoAlpha: .58, scaleX: 1, filter: "brightness(1.42)", duration: .12, repeat: 7, yoyo: true, ease: "steps(1)" }, at + .35);
          timeline.call(() => playFmCFoley("fluorescent"), null, at + .34);
          timeline.fromTo(filmSilenceCurtain, { autoAlpha: 0, xPercent: -24, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: .72, xPercent: 0, clipPath: "inset(0 0% 0 0)", duration: duration * .2, ease: "power2.inOut" }, at + duration * .18);
          timeline.fromTo(filmSilenceForm, { autoAlpha: 0, xPercent: 24, clipPath: "inset(0 0 0 100%)" }, { autoAlpha: .72, xPercent: 0, clipPath: "inset(0 0 0 0%)", duration: duration * .2, ease: "power2.inOut" }, at + duration * .29);
          timeline.fromTo(filmQingWomen, { autoAlpha: 0, xPercent: -34, yPercent: 3 }, { autoAlpha: .94, xPercent: 0, yPercent: 0, duration: duration * .18, stagger: duration * .035, ease: "power2.out" }, at + duration * .22);
          timeline.fromTo(filmWitnessImages, { autoAlpha: 0, filter: "brightness(.55) saturate(.62)", scale: .96 }, { autoAlpha: 1, filter: "brightness(1.08) saturate(.88)", scale: 1, duration: 1.2, stagger: .12, ease: "power2.out" }, at + duration * .23);
          timeline.to(filmQingWomen.slice(0, 2), { xPercent: 96, autoAlpha: .32, duration: duration * .22, stagger: duration * .035, ease: "none" }, at + duration * .39);
          timeline.to(filmQingWomen[2], { xPercent: 38, duration: duration * .11, ease: "power1.out" }, at + duration * .42);
          timeline.to($(".qing-woman-turn img", filmSilenceRig), { rotationY: -9, xPercent: -3, scale: 1.035, duration: .82, ease: "power3.inOut" }, at + duration * .52);
          if (filmQingSleeve) timeline.to(filmQingSleeve, { autoAlpha: .38, rotation: -18, xPercent: 5, duration: .72, ease: "power2.out" }, at + duration * .55);
          timeline.fromTo(filmNurses, { autoAlpha: 0, xPercent: 38, yPercent: 2 }, { autoAlpha: .96, xPercent: 0, yPercent: 0, duration: duration * .17, stagger: duration * .04, ease: "power2.out" }, at + duration * .34);
          timeline.to(filmNurses[0], { xPercent: -92, autoAlpha: .34, duration: duration * .21, ease: "none" }, at + duration * .5);
          timeline.to(filmNurses[1], { xPercent: -34, duration: duration * .1, ease: "power1.out" }, at + duration * .51);
          timeline.to($(".modern-nurse-turn img", filmSilenceRig), { rotationY: 9, xPercent: 3, scale: 1.035, duration: .82, ease: "power3.inOut" }, at + duration * .6);
          if (filmNurseArm) timeline.to(filmNurseArm, { autoAlpha: .34, rotation: 14, xPercent: -5, duration: .72, ease: "power2.out" }, at + duration * .62);
          timeline.to([...filmQingWomen, ...filmNurses], { yPercent: -1.8, duration: .46, repeat: 3, yoyo: true, stagger: .08, ease: "sine.inOut" }, at + duration * .31);
          if (filmFabricMotions.length) timeline.fromTo(filmFabricMotions, { autoAlpha: 0, rotation: 0 }, { autoAlpha: .2, rotation: (index) => index % 2 ? 5 : -5, duration: .38, repeat: 5, yoyo: true, stagger: .05, ease: "sine.inOut", immediateRender: false }, at + duration * .32);
          timeline.to(filmSilenceCurtain, { xPercent: 7, scaleX: .92, transformOrigin: "0% 50%", duration: duration * .13, ease: "power2.inOut" }, at + duration * .58);
          timeline.fromTo(filmSilencePages, { autoAlpha: 0, yPercent: 24, rotationY: -68, rotation: -3 }, { autoAlpha: .78, yPercent: 0, rotationY: 0, rotation: 0, duration: .72, stagger: duration * .04, ease: "power3.out" }, at + duration * .51);
          timeline.call(() => playFmCFoley("step"), null, at + duration * .38);
          timeline.call(() => playFmCFoley("cart"), null, at + duration * .52);
          timeline.fromTo(filmSilenceChecks, { autoAlpha: 0, scale: .55, rotation: -10 }, { autoAlpha: .88, scale: 1, rotation: 0, duration: .38, stagger: duration * .055, ease: "back.out(1.6)" }, at + duration * .58);
          timeline.to(filmSilenceChecks.slice(2), { xPercent: (index) => index === 0 ? 16 : -16, rotation: (index) => index === 0 ? 9 : -9, duration: .65, ease: "power2.out" }, at + duration * .67);
          timeline.fromTo(filmSilenceVoid, { autoAlpha: 0, scaleX: .35, filter: "blur(10px)" }, { autoAlpha: .7, scaleX: 1.18, filter: "blur(1px)", duration: duration * .15, ease: "power2.inOut" }, at + duration * .72);
          timeline.to([...filmSilencePages, ...filmSilenceChecks, filmSilenceCurtain, filmSilenceForm], { autoAlpha: .24, filter: "brightness(.68)", duration: 1, ease: "power2.out" }, at + duration * .83);
          timeline.to([...filmQingWomen, ...filmNurses], { autoAlpha: .68, filter: "brightness(.82)", duration: 1, ease: "power2.out" }, at + duration * .83);
          timeline.fromTo(filmSilenceTitle, { autoAlpha: 0, yPercent: 18, clipPath: "inset(0 50% 0 50%)", letterSpacing: ".28em" }, { autoAlpha: 1, yPercent: 0, clipPath: "inset(0 0% 0 0%)", letterSpacing: ".18em", duration: .9, ease: "power3.out" }, at + duration * .84);
          lineDraw(.9, duration * .7, 120);
          break;
        }
        timeline.set([filmSeparatedPalms, filmTimeRift], { autoAlpha: 1 }, at);
        timeline.fromTo(filmDoorItems, { autoAlpha: 0, filter: "brightness(.65)" }, { autoAlpha: .32, filter: "brightness(1)", duration: .7, stagger: .7 }, at + .5);
        timeline.fromTo(filmInfoItems.slice(1, 4), { autoAlpha: .18, rotation: -4 }, { autoAlpha: .45, rotation: 5, duration: duration * .74, stagger: .6, ease: "sine.inOut" }, at + 1.4);
        break;
      case "responsibility":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        if (usesFmCActPlate) {
          timeline.set(filmResponsibilityRig, { autoAlpha: 1 }, at);
          timeline.call(() => playFmCFoley("fluorescent"), null, at + .3);
          timeline.fromTo(filmDutyFluorescents, { autoAlpha: .04, scaleX: .92, filter: "brightness(.55)" }, { autoAlpha: .5, scaleX: 1, filter: "brightness(1.45)", duration: .12, repeat: 7, yoyo: true, stagger: .07, ease: "steps(1)" }, at + .18);
          timeline.fromTo(filmDutyShadows, { autoAlpha: 0, scaleY: .45, yPercent: -8 }, { autoAlpha: .5, scaleY: 1.28, yPercent: 18, duration: duration * .1, stagger: .08, ease: "power2.inOut" }, at + .35);
          timeline.to([...filmDutyFluorescents, ...filmDutyShadows], { autoAlpha: 0, duration: .55, ease: "power1.out" }, at + duration * .115);
          timeline.fromTo(filmSeam, { autoAlpha: .28, scaleX: .72 }, { autoAlpha: .92, scaleX: 1.12, duration: 2.4, repeat: 7, yoyo: true, ease: "sine.inOut" }, at + .6);
          timeline.fromTo(filmDutyBreaths, { autoAlpha: 0, scale: .96, yPercent: 1.2 }, { autoAlpha: .22, scale: 1.04, yPercent: -1.2, duration: 1.65, repeat: 9, yoyo: true, stagger: .18, ease: "sine.inOut" }, at + duration * .1);
          timeline.fromTo(filmDutyGrip, { autoAlpha: 0, scale: .88, rotation: -4 }, { autoAlpha: .88, scale: 1.08, rotation: 2, duration: .6, repeat: 3, yoyo: true, ease: "sine.inOut" }, at + duration * .12);
          timeline.to(filmDutyGrip, { autoAlpha: 0, duration: .45, ease: "power1.out" }, at + duration * .235);
          timeline.fromTo(filmDutyRelease, { autoAlpha: 0, scaleX: .42, rotation: -8 }, { autoAlpha: .9, scaleX: 1, rotation: 4, duration: duration * .1, ease: "power2.out" }, at + duration * .24);
          timeline.to($$("i", filmDutyRelease), { rotation: (index) => [-34, 2, 34][index], duration: duration * .08, stagger: .08, ease: "sine.out" }, at + duration * .27);
          timeline.fromTo(filmDutyThread, { autoAlpha: 0, scaleX: .34, filter: "brightness(.74)" }, { autoAlpha: .82, scaleX: 1, filter: "brightness(1.28)", duration: duration * .12, ease: "power2.inOut" }, at + duration * .28);
          timeline.fromTo(filmDutyTransferPaths, { autoAlpha: 0, strokeDashoffset: 160 }, { autoAlpha: .72, strokeDashoffset: 0, duration: duration * .12, stagger: .06, ease: "sine.inOut" }, at + duration * .34);
          filmDutyThreadTransfers.forEach((transfer, index) => {
            const transferAt = at + duration * (.36 + index * .018);
            timeline.fromTo(transfer, { autoAlpha: 0, scale: .68 }, { autoAlpha: 1, scale: 1, duration: .28, ease: "power2.out" }, transferAt);
            if (window.MotionPathPlugin && filmDutyTransferPaths[index]) {
              timeline.to(transfer, { motionPath: { path: filmDutyTransferPaths[index], align: filmDutyTransferPaths[index], alignOrigin: [.5, .5], start: 0, end: 1 }, duration: duration * .15, ease: "power2.inOut" }, transferAt);
            } else {
              timeline.to(transfer, { xPercent: index === 0 ? 900 : -900, yPercent: -620, duration: duration * .15, ease: "power2.inOut" }, transferAt);
            }
          });
          timeline.fromTo(filmDutyPapers, { autoAlpha: 0, xPercent: (index) => index === 0 ? -155 : 155, yPercent: 28, rotation: (index) => index === 0 ? -8 : 8, rotationY: -78, scale: .86 }, { autoAlpha: .84, xPercent: 0, yPercent: -4, rotation: 0, rotationY: 0, scale: 1, duration: duration * .1, stagger: .12, ease: "power3.out" }, at + duration * .36);
          timeline.fromTo(filmDutyStamps, { autoAlpha: 0, yPercent: -150, rotation: (index) => index === 0 ? -12 : 12, scale: 1.25 }, { autoAlpha: .86, yPercent: 0, rotation: 0, scale: 1, duration: .46, stagger: .12, ease: "back.out(2.4)" }, at + duration * .405);
          timeline.call(() => playFmCFoley("paper"), null, at + duration * .44);
          timeline.fromTo(filmDutyAdults, { autoAlpha: 0, filter: "blur(14px) brightness(.68)" }, { autoAlpha: .9, filter: "blur(0px) brightness(1.03)", duration: duration * .13, stagger: .1, ease: "power2.inOut" }, at + duration * .44);
          timeline.to(filmDutyThread, { autoAlpha: .18, scaleX: .72, duration: duration * .1, ease: "sine.inOut" }, at + duration * .48);
          timeline.to([filmDutyRelease, ...filmDutyThreadTransfers, ...filmDutyTransferPaths], { autoAlpha: 0, duration: .65, ease: "power1.out" }, at + duration * .54);
          timeline.to(filmDutyAdults, { autoAlpha: 0, duration: .62, ease: "power1.out" }, at + duration * .62);
          timeline.fromTo(filmDutyHandles, { autoAlpha: 0, rotation: 0, scale: .86, filter: "brightness(.72)" }, { autoAlpha: .9, rotation: (index) => index === 0 ? 24 : -24, scale: 1.08, filter: "brightness(1.55)", duration: .42, stagger: .08, ease: "back.out(1.6)" }, at + duration * .58);
          timeline.to(filmDutyHandles, { rotation: (index) => index === 0 ? 12 : -12, scale: 1, duration: .55, ease: "power2.out" }, at + duration * .595);
          timeline.call(() => playFmCFoley("latch"), null, at + duration * .58);
          timeline.fromTo(filmDutyDoorLeaves, { autoAlpha: .28, xPercent: 0, scaleX: 1 }, { autoAlpha: .08, xPercent: (index) => index === 0 ? -10 : 10, scaleX: .92, duration: duration * .17, stagger: .08, ease: "power2.inOut" }, at + duration * .59);
          timeline.fromTo(filmDutyLights, { autoAlpha: 0, scaleX: .12, scaleY: .86 }, { autoAlpha: .44, scaleX: .78, scaleY: 1, duration: duration * .12, stagger: .09, ease: "power2.inOut" }, at + duration * .59);
          timeline.to(filmDutyLights, { autoAlpha: .64, scaleX: 1.6, filter: "brightness(1.4) blur(.2px)", duration: duration * .14, ease: "sine.inOut" }, at + duration * .75);
          timeline.to(filmDutyBreaths, { xPercent: (index) => index === 0 ? -18 : 18, yPercent: 8, autoAlpha: .12, duration: duration * .1, ease: "power2.out" }, at + duration * .76);
          timeline.call(() => playFmCFoley("step"), null, at + duration * .76);
          timeline.to([filmDutyThread, ...filmDutyPapers, ...filmDutyStamps], { autoAlpha: 0, duration: .72, ease: "power2.out" }, at + duration * .78);
          timeline.to(filmDutyHandles, { autoAlpha: 0, duration: .8, ease: "power2.out" }, at + duration * .86);
          timeline.to(filmDutyDoorLeaves, { autoAlpha: 0, duration: .7, ease: "power2.out" }, at + duration * .875);
          timeline.to(filmDutyLights, { autoAlpha: .18, scaleX: 1.14, duration: duration * .1, ease: "sine.out" }, at + duration * .88);
          timeline.fromTo(filmDutyTitle, { autoAlpha: 0, yPercent: 18, clipPath: "inset(0 50% 0 50%)", letterSpacing: ".34em" }, { autoAlpha: 1, yPercent: 0, clipPath: "inset(0 0% 0 0%)", letterSpacing: ".22em", duration: 1.2, ease: "power3.out" }, at + duration * .88);
          timeline.to(filmDutyTitle, { filter: "brightness(1.12)", duration: 1.8, repeat: 1, yoyo: true, ease: "sine.inOut" }, at + duration * .91);
          lineDraw(1.4, duration * .72, 0);
          break;
        }
        timeline.set([filmSeparatedPalms, filmTimeRift], { autoAlpha: 1 }, at);
        timeline.to(filmQingChild, { xPercent: 2.5, duration: 3.6, repeat: 2, yoyo: true, ease: "sine.inOut" }, at + .8);
        timeline.to(filmModernChild, { xPercent: -2.5, duration: 3.6, repeat: 2, yoyo: true, ease: "sine.inOut" }, at + .8);
        timeline.to(filmTimeRift, { filter: "brightness(1.5) drop-shadow(0 0 14px rgba(241,220,168,.8))", duration: 1.8, repeat: 3, yoyo: true, ease: "sine.inOut" }, at + 1.2);
        lineDraw(1.4, duration * .46, 0);
        break;
      case "one-inch":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        if (usesFmCActPlate) {
          timeline.set(filmFinaleRig, { autoAlpha: 1 }, at);
          timeline.fromTo(filmFinaleDoors, { autoAlpha: .88, rotationY: 0 }, { autoAlpha: .72, rotationY: (index) => index === 0 ? -68 : 68, duration: duration * .22, stagger: .08, ease: "power3.inOut" }, at + duration * .08);
          timeline.call(() => playFmCFoley("latch"), null, at + duration * .09);
          timeline.fromTo(filmFinaleCorridor, { autoAlpha: 0, scale: .92, filter: "brightness(.72)" }, { autoAlpha: .82, scale: 1.13, filter: "brightness(1.1)", duration: duration * .28, ease: "power1.inOut" }, at + duration * .2);
          timeline.fromTo(filmFinaleRecord, { autoAlpha: 0, yPercent: -36, rotationY: -72 }, { autoAlpha: .9, yPercent: 0, rotationY: 0, duration: duration * .1, ease: "power3.out" }, at + duration * .43);
          timeline.call(() => playFmCFoley("paper"), null, at + duration * .44);
          timeline.fromTo(filmFinaleActions, { autoAlpha: 0, yPercent: 55, filter: "blur(7px)" }, { autoAlpha: .92, yPercent: 0, filter: "blur(0px)", duration: .48, stagger: duration * .035, ease: "power2.out" }, at + duration * .54);
          timeline.to(filmFinaleActions.slice(0, 5), { autoAlpha: .28, duration: .65, stagger: .05 }, at + duration * .77);
          timeline.fromTo(filmFinaleMemory, { autoAlpha: 0, yPercent: 18 }, { autoAlpha: .82, yPercent: 0, duration: .9, stagger: .16, ease: "power2.out" }, at + duration * .78);
          timeline.to([filmFinaleRecord, ...filmFinaleActions], { autoAlpha: 0, duration: .8, ease: "power2.out" }, at + duration * .86);
          timeline.fromTo(filmFinaleTitle, { autoAlpha: 0, yPercent: 18, letterSpacing: ".32em" }, { autoAlpha: 1, yPercent: 0, letterSpacing: ".18em", duration: 1.2, ease: "power3.out" }, at + duration * .88);
          lineDraw(1.2, duration * .76, 0);
          break;
        }
        timeline.set([filmSeparatedPalms, filmTimeRift], { autoAlpha: 1 }, at);
        timeline.set(door, { autoAlpha: .42 }, at + .4);
        timeline.to(doorLeft, { xPercent: -4, duration: 4.2, ease: "power1.inOut" }, at + 1.2);
        timeline.to(doorRight, { xPercent: 4, duration: 4.2, ease: "power1.inOut" }, at + 1.2);
        lineDraw(1.2, 6, 0);
        break;
      default:
        timeline.to(focusLight, { xPercent: 14, autoAlpha: .28, duration: travel, ease: "sine.inOut" }, at);
    }
  }

  function addProductionCue(timeline, meta, at) {
    const production = productionFor(meta.scene);
    if (!production) return;
    if (meta.isActStart) addProductionAct(timeline, meta, at);
    timeline.call(() => setProductionState(meta), null, at);
    if (meta.scene.id === "FM-C") {
      const split = productionSplitForCue(meta.cue);
      timeline.to(filmProduction, { "--split": split, duration: 1, ease: "power1.inOut" }, at);
      timeline.to(meta.cue.side === "qing" ? filmWorldQing : meta.cue.side === "modern" ? filmWorldModern : [filmWorldQing, filmWorldModern], { autoAlpha: 1, duration: .8 }, at);
      if (/兩人合聲/.test(meta.cue?.speaker || "")) {
        timeline.fromTo(filmSeam, { autoAlpha: .38, scaleX: .82 }, { autoAlpha: 1, scaleX: 1.32, duration: 1.15, repeat: 1, yoyo: true, ease: "sine.inOut" }, at);
        timeline.fromTo(dialogueBox, { filter: "brightness(1)" }, { filter: "brightness(1.12)", duration: .8, repeat: 1, yoyo: true, ease: "sine.inOut" }, at);
      }
    }
    if (meta.cue?.keyword) {
      const keywordIndex = production.cues.filter((item) => item.keyword && item.time <= meta.cue.time).length - 1;
      const keyword = filmKeywordItems[keywordIndex];
      if (keyword) timeline.fromTo(keyword, { autoAlpha: 0, y: 10, scale: .94 }, { autoAlpha: .92, y: 0, scale: 1, duration: .5, ease: "power2.out" }, at);
    }
    if (meta.cue?.visual === "stamp") timeline.fromTo(filmStamp, { autoAlpha: .15, scale: 1.12 }, { autoAlpha: .88, scale: 1, duration: .32, ease: "back.out(1.6)" }, at);
    if (meta.cue?.visual === "source" || meta.cue?.visual === "testimony") timeline.fromTo(filmSourceTag, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .45 }, at);
  }

  function actorOpticalScale(scene, sex, pose, element) {
    const bounds = ACTOR_ASSET_BOUNDS[scene.type]?.[sex]?.[Math.max(0, Number(pose) - 1)];
    if (!bounds) return 1;
    const [canvasWidth, canvasHeight, visibleHeight] = bounds;
    const boxWidth = element?.offsetWidth || (window.matchMedia("(max-width: 760px)").matches ? 260 : 340);
    const boxHeight = element?.offsetHeight || (window.matchMedia("(max-width: 760px)").matches ? 330 : 430);
    const containScale = Math.min(boxWidth / canvasWidth, boxHeight / canvasHeight);
    const projectedVisibleHeight = Math.max(1, visibleHeight * containScale);
    const targetRatio = scene.type === "side" ? .74 : .78;
    return clamp((boxHeight * targetRatio) / projectedVisibleHeight, .72, 1.28);
  }

  function actorTargets(scene, actionIndex) {
    const pose = MOTION_POSES[actionIndex];
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const ratio = compact ? (scene.type === "side" ? .3 : .38) : (scene.type === "side" ? .7 : 1);
    const sharedScale = (pose.f[3] + pose.m[3]) / 2;
    const target = (values, sex, actorElement) => ({
      x: values[0] * ratio,
      y: values[1] * ratio,
      rotation: values[2],
      scale: sharedScale * (scene.type === "side" ? .94 : 1) * actorOpticalScale(scene, sex, actorPosePlan(scene, sex)[actionIndex], actorElement)
    });
    return { female: target(pose.f, "female", actorFemale), male: target(pose.m, "male", actorMale) };
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

  function applyProductionStatic(meta) {
    const production = productionFor(meta.scene);
    if (!production || !filmProduction) return;
    const actInfo = production.acts[meta.actionIndex];
    const view = productionView(actInfo);
    const sourceProgress = clamp((meta.localStart - actInfo.start) / Math.max(.1, actInfo.end - actInfo.start), 0, 1);
    const reducedActProgress = [.9, .9, .9, .82, .9];
    const progress = state.reduced && meta.scene.id === "FM-C" ? reducedActProgress[meta.actionIndex] : sourceProgress;
    setProductionState(meta);
    if (hasGSAP) {
      const { gsap } = window;
      const clearTargets = [filmCurtain, filmStamp, filmSourceTag, ...filmInfoItems, ...filmDoorItems, ...filmHairItems, ...filmKeywordItems, ...filmFlashItems, filmWorldQing, filmWorldModern, filmSeam];
      const usesFmCActPlate = meta.scene.id === "FM-C" && Boolean(filmActFrames[meta.actionIndex]);
      gsap.set(clearTargets, { clearProps: "opacity,visibility,transform,filter,clipPath,backgroundColor" });
      gsap.set([filmEventRig, ...filmEventGroups, ...filmSoilItems, filmChairReveal, filmRedHem, filmPaperSheet, filmInkBleed, filmBundle, ...filmHandoffHands, filmHandoffThread, filmDoorGap, ...filmCorridorLamps, filmEmptyHandle, ...filmPassers, filmCurtainEdge, filmDossierSheet, ...filmWitnesses, filmHairWash, filmEmptySeat], { autoAlpha: 0, clearProps: "transform,filter,clipPath,backgroundColor" });
      gsap.set(filmTimeThread, { autoAlpha: 0, strokeDasharray: 1000, strokeDashoffset: 1000 });
      gsap.set(filmActSequence, { autoAlpha: 0 });
      gsap.set(filmActFrames, { autoAlpha: 0, filter: "brightness(1)" });
      gsap.set(filmActShots, { autoAlpha: 0, clipPath: "inset(0 0 0 0)", zIndex: 0 });
      gsap.set($$(".fm-c-live-fx", filmActSequence), { autoAlpha: 0, clearProps: "filter" });
      gsap.set([filmEncounterRig, filmInformationRig, filmSilenceRig, filmFinaleRig], { autoAlpha: 0 });
      gsap.set([filmEncounterSeam, filmEncounterFloorLight, ...filmEncounterBreaths, ...filmEncounterShadows, ...filmEncounterSteps, filmEncounterLaw, filmEncounterLawCopy, ...filmEncounterLawFragments], { autoAlpha: 0, clearProps: "transform,filter,clipPath" });
      gsap.set([filmInformationPath, filmInformationPacket, ...filmInformationNodes, filmInformationFile, filmInformationStamp, ...filmInformationEmptyPulses, filmInformationStall], { autoAlpha: 0, clearProps: "transform,filter,clipPath,strokeDashoffset" });
      gsap.set([filmSilenceLamp, filmSilenceFluorescent, filmSilenceCurtain, filmSilenceForm, ...filmQingWomen, ...filmNurses, ...filmWitnessHeads, ...filmFabricMotions, ...filmWitnessImages, ...filmSilencePages, ...filmSilenceChecks, filmSilenceVoid, filmSilenceTitle], { autoAlpha: 0, clearProps: "transform,filter,clipPath,letterSpacing,transformOrigin" });
      gsap.set(filmResponsibilityRig, { autoAlpha: 0 });
      gsap.set([filmDutyThread, ...filmDutyPapers, ...filmDutyHandles, ...filmDutyLights, ...filmDutyBreaths], { autoAlpha: 0, clearProps: "transform,filter" });
      gsap.set([...filmDutyFluorescents, ...filmDutyShadows, filmDutyGrip, filmDutyRelease, ...filmDutyThreadTransfers, ...filmDutyTransferPaths, ...filmDutyStamps, ...filmDutyAdults, ...filmDutyDoorLeaves, filmDutyTitle], { autoAlpha: 0, clearProps: "transform,filter,clipPath,letterSpacing,strokeDashoffset" });
      gsap.set([filmFinaleCorridor, ...filmFinaleDoors, filmFinaleRecord, ...filmFinaleActions, ...filmFinaleMemory, filmFinaleTitle], { autoAlpha: 0, clearProps: "transform,filter,clipPath,letterSpacing" });
      filmProduction.style.setProperty("--split", productionSplitForCue(meta.cue));
      if (usesFmCActPlate) {
        const frame = filmActFrames[meta.actionIndex];
        const plans = FM_C_ACT_SHOTS[meta.actionIndex];
        const shots = $$(".fm-c-act-shot", frame);
        const shotIndex = plans.reduce((current, plan, index) => progress + .0001 >= plan.start ? index : current, 0);
        const shotPlan = plans[shotIndex];
        const shot = shots[shotIndex];
        const image = $("img", shot);
        const nextStart = plans[shotIndex + 1]?.start ?? 1;
        const shotProgress = clamp((progress - shotPlan.start) / Math.max(.001, nextStart - shotPlan.start), 0, 1);
        const interpolate = (key) => shotPlan.from[key] + (shotPlan.to[key] - shotPlan.from[key]) * shotProgress;
        gsap.set([bgA, bgB, depthFar, depthMid, depthNear], { autoAlpha: 0 });
        gsap.set(filmActSequence, { autoAlpha: 1 });
        gsap.set(frame, { autoAlpha: 1, filter: "brightness(1)" });
        gsap.set(shot, { autoAlpha: 1, clipPath: "inset(0 0 0 0)", zIndex: shotIndex + 1 });
        gsap.set(image, { scale: interpolate("scale"), xPercent: interpolate("xPercent"), yPercent: interpolate("yPercent") });
        if (meta.actionIndex === 0) {
          gsap.set(filmEncounterRig, { autoAlpha: 1 });
          gsap.set([filmEncounterSeam, ...filmEncounterBreaths], { autoAlpha: .5 });
          if (progress >= .39) gsap.set(filmEncounterSteps, { autoAlpha: .62, scale: 1 });
          if (progress >= .55) gsap.set(filmEncounterShadows, { autoAlpha: .58, scaleY: 1.18, xPercent: (index) => index === 0 ? 68 : -68 });
          if (progress >= .7) gsap.set(filmEncounterFloorLight, { autoAlpha: .62, scaleX: 1 });
          if (progress >= .84) {
            const peelProgress = clamp((progress - .84) / .16, 0, 1);
            gsap.set(filmEncounterLaw, { autoAlpha: .9, yPercent: 0, clipPath: "inset(0 0% 0 0%)" });
            gsap.set(filmEncounterLawCopy, { autoAlpha: 1 - peelProgress * .76, filter: `blur(${peelProgress * 1.2}px)` });
            gsap.set(filmEncounterLawFragments, { autoAlpha: 1 - peelProgress, xPercent: (index) => [-190, -88, 42, 118, 210][index] * peelProgress, yPercent: (index) => (120 + index * 26) * peelProgress, rotation: (index) => [-38, 24, -18, 42, -31][index] * peelProgress });
          }
        } else if (meta.actionIndex === 1) {
          gsap.set(filmInformationRig, { autoAlpha: 1 });
          gsap.set(filmInformationPath, { autoAlpha: .72, strokeDashoffset: 0 });
          gsap.set(filmInformationNodes, { autoAlpha: progress >= .82 ? .24 : .82, scale: 1 });
          if (progress >= .43) gsap.set(filmInformationFile, { autoAlpha: progress >= .82 ? .24 : .88, yPercent: 0, rotationY: 0 });
          if (progress >= .48) gsap.set(filmInformationStamp, { autoAlpha: progress >= .82 ? .24 : .88, yPercent: 0, scale: 1 });
          if (progress >= .7) gsap.set(filmInformationEmptyPulses, { autoAlpha: .44, scale: 1.25 });
          if (progress >= .84) gsap.set(filmInformationStall, { autoAlpha: 1, yPercent: 0, clipPath: "inset(0 0% 0 0%)" });
        } else if (meta.actionIndex === 2) {
          gsap.set(filmSilenceRig, { autoAlpha: 1 });
          gsap.set([filmSilenceLamp, filmSilenceFluorescent], { autoAlpha: .52 });
          if (progress >= .18) gsap.set(filmSilenceCurtain, { autoAlpha: progress >= .83 ? .24 : .68, xPercent: progress >= .45 ? 28 : 0 });
          if (progress >= .29) gsap.set(filmSilenceForm, { autoAlpha: progress >= .83 ? .24 : .68, xPercent: 0 });
          if (progress >= .22) gsap.set(filmWitnessImages, { autoAlpha: 1, filter: progress >= .83 ? "brightness(.82)" : "brightness(1.08) saturate(.88)" });
          if (progress >= .22) gsap.set(filmQingWomen, { autoAlpha: progress >= .83 ? .68 : .92, xPercent: (index) => index < 2 && progress >= .56 ? 96 : index === 2 && progress >= .42 ? 38 : 0 });
          if (progress >= .34) gsap.set(filmNurses, { autoAlpha: progress >= .83 ? .68 : .94, xPercent: (index) => index === 0 && progress >= .68 ? -92 : index === 1 && progress >= .51 ? -34 : 0 });
          if (progress >= .52) gsap.set($(".qing-woman-turn img", filmSilenceRig), { rotationY: -9, xPercent: -3, scale: 1.035 });
          if (progress >= .6) gsap.set($(".modern-nurse-turn img", filmSilenceRig), { rotationY: 9, xPercent: 3, scale: 1.035 });
          if (progress >= .56) gsap.set(filmSilencePages, { autoAlpha: progress >= .83 ? .24 : .72, yPercent: 0, rotationY: 0 });
          if (progress >= .62) gsap.set(filmSilenceChecks, { autoAlpha: progress >= .83 ? .24 : .82, scale: 1 });
          if (progress >= .69) gsap.set(filmSilenceVoid, { autoAlpha: .72, scale: 1.18, filter: "blur(1px)" });
          if (progress >= .84) gsap.set(filmSilenceTitle, { autoAlpha: 1, yPercent: 0, clipPath: "inset(0 0% 0 0%)", letterSpacing: ".18em" });
        } else if (meta.actionIndex === 3) {
          gsap.set(filmResponsibilityRig, { autoAlpha: 1 });
          if (progress < .12) {
            gsap.set(filmDutyFluorescents, { autoAlpha: .42, scaleX: 1 });
            gsap.set(filmDutyShadows, { autoAlpha: .48, scaleY: 1.28, yPercent: 18 });
          }
          if (progress >= .12 && progress < .24) gsap.set(filmDutyGrip, { autoAlpha: .88, scale: 1.03 });
          if (progress >= .24 && progress < .55) gsap.set(filmDutyRelease, { autoAlpha: .88, scaleX: 1, rotation: 4 });
          if (progress >= .28 && progress < .8) gsap.set(filmDutyThread, { autoAlpha: progress >= .58 ? .18 : .82, scaleX: progress >= .58 ? .72 : 1 });
          if (progress >= .34 && progress < .58) {
            gsap.set(filmDutyTransferPaths, { autoAlpha: .7, strokeDashoffset: 0 });
            const transferProgress = clamp((progress - .34) / .24, 0, 1);
            filmDutyThreadTransfers.forEach((transfer, index) => {
              if (window.MotionPathPlugin && filmDutyTransferPaths[index]) {
                gsap.set(transfer, { autoAlpha: 1, scale: 1, motionPath: { path: filmDutyTransferPaths[index], align: filmDutyTransferPaths[index], alignOrigin: [.5, .5], start: transferProgress, end: transferProgress } });
              } else {
                gsap.set(transfer, { autoAlpha: 1, scale: 1, xPercent: (index === 0 ? 900 : -900) * transferProgress, yPercent: -620 * transferProgress });
              }
            });
          }
          if (progress >= .36 && progress < .8) gsap.set(filmDutyPapers, { autoAlpha: progress >= .76 ? .22 : .84, xPercent: 0, yPercent: -4, rotation: 0, rotationY: 0, scale: 1 });
          if (progress >= .405 && progress < .8) gsap.set(filmDutyStamps, { autoAlpha: .84, yPercent: 0, rotation: 0, scale: 1 });
          if (progress >= .44 && progress < .62) gsap.set(filmDutyAdults, { autoAlpha: .9, filter: "blur(0px) brightness(1.03)" });
          if (progress >= .58 && progress < .88) gsap.set(filmDutyHandles, { autoAlpha: .9, rotation: (index) => index === 0 ? 12 : -12, scale: 1 });
          if (progress >= .59 && progress < .88) gsap.set(filmDutyDoorLeaves, { autoAlpha: .08, xPercent: (index) => index === 0 ? -10 : 10, scaleX: .92 });
          if (progress >= .59) gsap.set(filmDutyLights, { autoAlpha: progress >= .88 ? .18 : .58, scaleX: progress >= .76 ? 1.6 : .78, scaleY: 1 });
          if (progress < .76) gsap.set(filmDutyBreaths, { autoAlpha: .18, scale: 1.02 });
          if (progress >= .88) gsap.set(filmDutyTitle, { autoAlpha: 1, yPercent: 0, clipPath: "inset(0 0% 0 0%)", letterSpacing: ".22em" });
        } else if (meta.actionIndex === 4) {
          gsap.set(filmFinaleRig, { autoAlpha: 1 });
          if (progress >= .08) gsap.set(filmFinaleDoors, { autoAlpha: .72, rotationY: (index) => index === 0 ? -68 : 68 });
          if (progress >= .2) gsap.set(filmFinaleCorridor, { autoAlpha: .82, scale: 1.13, filter: "brightness(1.1)" });
          if (progress >= .43 && progress < .86) gsap.set(filmFinaleRecord, { autoAlpha: .9, yPercent: 0, rotationY: 0 });
          if (progress >= .54 && progress < .86) gsap.set(filmFinaleActions, { autoAlpha: progress >= .77 ? .32 : .92, yPercent: 0, filter: "blur(0px)" });
          if (progress >= .78) gsap.set(filmFinaleMemory, { autoAlpha: .82, yPercent: 0 });
          if (progress >= .88) gsap.set(filmFinaleTitle, { autoAlpha: 1, yPercent: 0, letterSpacing: ".18em" });
        }
      } else {
        gsap.set([bgA, bgB, depthFar, depthMid, depthNear], { backgroundPosition: view.position, backgroundSize: view.size, scale: 1.018 + progress * .037, xPercent: 0, yPercent: 0 });
        const staticEventGroup = meta.scene.id === "FM-A" ? filmEventA : meta.scene.id === "FM-D" ? filmEventD : meta.scene.id === "FM-B" ? filmEventB : null;
        if (staticEventGroup) gsap.set([filmEventRig, staticEventGroup], { autoAlpha: 1 });
        if (actInfo.effect === "mud-thread") {
          gsap.set(filmChairReveal, { autoAlpha: .42, scale: 1, clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(filmSoilItems.slice(0, Math.max(1, Math.ceil(progress * filmSoilItems.length))), { autoAlpha: .3, y: 110, rotation: 28 });
        } else if (actInfo.effect === "night-door") gsap.set(filmRedHem, { autoAlpha: .52, xPercent: 0, scaleY: 1 });
        else if (actInfo.effect === "match-cut") gsap.set([filmRedHem, filmPaperSheet], { autoAlpha: .34, scaleY: 1, clipPath: "inset(0 0 0 0)" });
        else if (actInfo.effect === "verdict") gsap.set([filmPaperSheet, filmInkBleed], { autoAlpha: .4, scale: 1 });
        else if (actInfo.effect === "safe-flash") gsap.set(filmInkBleed, { autoAlpha: .16, scale: 1.25 });
        else if (actInfo.effect === "bundle") gsap.set([filmBundle, filmHandoffHands[0], filmHandoffThread], { autoAlpha: .52, xPercent: 0, scaleX: 1 });
        else if (actInfo.effect === "phone-door") gsap.set([filmDoorGap, filmEmptyHandle], { autoAlpha: .46, scaleX: .18, rotation: 0 });
        else if (actInfo.effect === "trust-corridor") gsap.set([...filmHandoffHands, filmHandoffThread], { autoAlpha: .58, xPercent: 0, scaleX: 1 });
        else if (actInfo.effect === "six-doors") gsap.set([...filmCorridorLamps, filmHandoffThread], { autoAlpha: .5, scaleX: .84, filter: "brightness(.74)" });
        else if (actInfo.effect === "testimony") gsap.set([filmEmptyHandle, filmHandoffThread], { autoAlpha: .46, scaleX: 1, rotation: 0 });
        else if (actInfo.effect === "qing-hair") {
          gsap.set(filmPassers, { autoAlpha: .5, xPercent: (index) => index < 2 ? 124 : 18, rotationY: (index) => index === 2 ? -18 : 0 });
          gsap.set(filmTimeThread, { autoAlpha: .58, strokeDashoffset: 620 });
        } else if (actInfo.effect === "medical-curtain") {
          gsap.set([filmCurtainEdge, ...filmWitnesses.slice(0, 2)], { autoAlpha: .48, scaleY: 1 });
          gsap.set(filmTimeThread, { autoAlpha: .58, strokeDashoffset: 260 });
        } else if (actInfo.effect === "dossier") {
          gsap.set([filmDossierSheet, ...filmWitnesses], { autoAlpha: .42, scaleX: 1, scale: 1 });
          gsap.set(filmTimeThread, { autoAlpha: .58, strokeDashoffset: 0 });
        } else if (actInfo.effect === "white-hair") {
          gsap.set(filmHairWash, { autoAlpha: .34, clipPath: "inset(0 0 0% 0)" });
          gsap.set(filmTimeThread, { autoAlpha: .42, strokeDashoffset: 0 });
        } else if (actInfo.effect === "empty-court") gsap.set(filmEmptySeat, { autoAlpha: .56, yPercent: 0 });
      }
      gsap.set(filmActSlate, { autoAlpha: 1, y: 0 });
      gsap.set(filmLinePath, { clearProps: "opacity,visibility", strokeDasharray: 1000, strokeDashoffset: 1000 - progress * 1000 });
      if (/mud-thread|bundle|trust-corridor|six-doors|testimony|split-shadow|responsibility|one-inch/.test(actInfo.effect)) gsap.set(filmLinePath, { autoAlpha: .8 });
      if (meta.scene.id === "FM-C") {
        gsap.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 });
        gsap.set([filmSeparatedPalms, filmTimeRift], { autoAlpha: 0 });
        gsap.set([filmQingChild, filmModernChild], { xPercent: 0, y: 0, scale: 1 });
      }
      if (actInfo.effect === "six-doors" || actInfo.effect === "silence-clothes") gsap.set(filmDoorItems.slice(0, Math.max(1, Math.ceil(progress * 6))), { autoAlpha: .82 });
      if (actInfo.effect === "information") gsap.set(filmInfoItems.slice(0, Math.max(1, Math.ceil(progress * 5))), { autoAlpha: .62 });
      if (actInfo.effect === "qing-hair" || actInfo.effect === "white-hair") gsap.set(filmHairItems, { autoAlpha: actInfo.effect === "white-hair" ? .38 : .44, backgroundColor: actInfo.effect === "white-hair" ? "#b8bbb5" : "#20211f" });
      if (actInfo.effect === "verdict" && meta.localStart >= 96) gsap.set(filmStamp, { autoAlpha: .86, rotation: -3 });
      if (meta.cue?.visual === "source" || meta.cue?.visual === "testimony") gsap.set(filmSourceTag, { autoAlpha: 1, y: 0 });
      if (actInfo.effect === "night-door" || actInfo.effect === "phone-door" || actInfo.effect === "one-inch") {
        gsap.set(door, { autoAlpha: actInfo.effect === "one-inch" ? .42 : .58 });
        const amount = actInfo.effect === "one-inch" ? 4 : actInfo.effect === "phone-door" ? 4 : 72;
        gsap.set($("i", door), { xPercent: -amount });
        gsap.set($("b", door), { xPercent: amount });
      }
      if (meta.cue?.keyword) {
        const keywordIndex = production.cues.filter((item) => item.keyword && item.time <= meta.cue.time).length - 1;
        gsap.set(filmKeywordItems.slice(0, keywordIndex + 1), { autoAlpha: .92 });
      }
    } else {
      filmProduction.style.setProperty("--split", productionSplitForCue(meta.cue));
      const usesFmCActPlate = meta.scene.id === "FM-C" && Boolean(filmActFrames[meta.actionIndex]);
      filmActSequence.style.opacity = usesFmCActPlate ? "1" : "0";
      const setFallbackOpacity = (elements, visible) => (Array.isArray(elements) ? elements : [elements]).filter(Boolean).forEach((element) => { element.style.opacity = visible ? "1" : "0"; });
      const fallbackEventGroup = meta.scene.id === "FM-A" ? filmEventA : meta.scene.id === "FM-D" ? filmEventD : meta.scene.id === "FM-B" ? filmEventB : null;
      setFallbackOpacity([filmEventRig, fallbackEventGroup], Boolean(fallbackEventGroup));
      setFallbackOpacity(filmChairReveal, actInfo.effect === "mud-thread");
      setFallbackOpacity(filmRedHem, actInfo.effect === "night-door" || actInfo.effect === "match-cut");
      setFallbackOpacity([filmPaperSheet, filmInkBleed], actInfo.effect === "verdict");
      setFallbackOpacity([filmBundle, filmHandoffThread], actInfo.effect === "bundle" || actInfo.effect === "trust-corridor");
      setFallbackOpacity(filmHandoffHands, actInfo.effect === "trust-corridor");
      setFallbackOpacity(filmDoorGap, actInfo.effect === "phone-door");
      setFallbackOpacity(filmCorridorLamps, actInfo.effect === "six-doors");
      setFallbackOpacity(filmEmptyHandle, actInfo.effect === "testimony");
      setFallbackOpacity(filmPassers, actInfo.effect === "qing-hair");
      setFallbackOpacity(filmCurtainEdge, actInfo.effect === "medical-curtain");
      setFallbackOpacity(filmDossierSheet, actInfo.effect === "dossier");
      setFallbackOpacity(filmWitnesses, actInfo.effect === "dossier");
      setFallbackOpacity(filmHairWash, actInfo.effect === "white-hair");
      setFallbackOpacity(filmEmptySeat, actInfo.effect === "empty-court");
      setFallbackOpacity(filmTimeThread, meta.scene.id === "FM-B");
      setFallbackOpacity(filmEncounterRig, usesFmCActPlate && meta.actionIndex === 0);
      setFallbackOpacity(filmInformationRig, usesFmCActPlate && meta.actionIndex === 1);
      setFallbackOpacity(filmSilenceRig, usesFmCActPlate && meta.actionIndex === 2);
      setFallbackOpacity(filmResponsibilityRig, usesFmCActPlate && meta.actionIndex === 3);
      setFallbackOpacity(filmFinaleRig, usesFmCActPlate && meta.actionIndex === 4);
      filmActFrames.forEach((frame, index) => { frame.style.opacity = usesFmCActPlate && index === meta.actionIndex ? "1" : "0"; });
      if (usesFmCActPlate) {
        const plans = FM_C_ACT_SHOTS[meta.actionIndex];
        const frame = filmActFrames[meta.actionIndex];
        const shots = $$(".fm-c-act-shot", frame);
        const shotIndex = plans.reduce((current, plan, index) => progress + .0001 >= plan.start ? index : current, 0);
        filmActShots.forEach((shot) => { shot.style.opacity = "0"; });
        if (shots[shotIndex]) shots[shotIndex].style.opacity = "1";
        [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => { element.style.opacity = "0"; });
        if (meta.actionIndex === 0) {
          setFallbackOpacity([filmEncounterSeam, ...filmEncounterBreaths], true);
          setFallbackOpacity(filmEncounterSteps, progress >= .39);
          setFallbackOpacity(filmEncounterShadows, progress >= .55);
          setFallbackOpacity(filmEncounterFloorLight, progress >= .7);
          setFallbackOpacity(filmEncounterLaw, progress >= .84);
        } else if (meta.actionIndex === 1) {
          setFallbackOpacity([filmInformationPath, ...filmInformationNodes], true);
          setFallbackOpacity(filmInformationFile, progress >= .43);
          setFallbackOpacity(filmInformationStamp, progress >= .48);
          setFallbackOpacity(filmInformationEmptyPulses, progress >= .7);
          setFallbackOpacity(filmInformationStall, progress >= .84);
        } else if (meta.actionIndex === 2) {
          setFallbackOpacity([filmSilenceLamp, filmSilenceFluorescent], true);
          setFallbackOpacity(filmSilenceCurtain, progress >= .18);
          setFallbackOpacity(filmSilenceForm, progress >= .29);
          setFallbackOpacity(filmSilencePages, progress >= .56);
          setFallbackOpacity(filmSilenceChecks, progress >= .62);
          setFallbackOpacity(filmSilenceVoid, progress >= .69);
          setFallbackOpacity(filmSilenceTitle, progress >= .84);
        } else if (meta.actionIndex === 3) {
          setFallbackOpacity(filmDutyFluorescents, progress < .12);
          setFallbackOpacity(filmDutyShadows, progress < .12);
          setFallbackOpacity(filmDutyGrip, progress >= .12 && progress < .24);
          setFallbackOpacity(filmDutyRelease, progress >= .24 && progress < .55);
          setFallbackOpacity(filmDutyThread, progress >= .28 && progress < .8);
          setFallbackOpacity(filmDutyTransferPaths, progress >= .34 && progress < .58);
          setFallbackOpacity(filmDutyThreadTransfers, false);
          setFallbackOpacity(filmDutyPapers, progress >= .36 && progress < .8);
          setFallbackOpacity(filmDutyStamps, progress >= .405 && progress < .8);
          setFallbackOpacity(filmDutyAdults, progress >= .44 && progress < .62);
          setFallbackOpacity(filmDutyHandles, progress >= .58 && progress < .88);
          setFallbackOpacity(filmDutyDoorLeaves, progress >= .59 && progress < .88);
          setFallbackOpacity(filmDutyLights, progress >= .59);
          setFallbackOpacity(filmDutyBreaths, progress < .76);
          setFallbackOpacity(filmDutyTitle, progress >= .88);
        } else if (meta.actionIndex === 4) {
          setFallbackOpacity(filmFinaleDoors, progress >= .08);
          setFallbackOpacity(filmFinaleCorridor, progress >= .2);
          setFallbackOpacity(filmFinaleRecord, progress >= .43 && progress < .86);
          setFallbackOpacity(filmFinaleActions, progress >= .54 && progress < .86);
          setFallbackOpacity(filmFinaleMemory, progress >= .78);
          setFallbackOpacity(filmFinaleTitle, progress >= .88);
        }
      }
      else {
        [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => {
          element.style.backgroundPosition = view.position;
          element.style.backgroundSize = view.size;
        });
      }
      filmLinePath.style.strokeDashoffset = String(1000 - progress * 1000);
    }
  }

  function applyStaticVisuals(meta) {
    resetEffects(true);
    if (productionFor(meta.scene)) {
      applyProductionStatic(meta);
      return;
    }
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

  function addPaperCutBeat(timeline, meta, at, duration) {
    if (meta.scene.type !== "shadow" || !paperCutRig) return;
    const group = $("[data-paper-scene=\"" + meta.scene.id + "\"]", paperCutRig);
    if (!group) return;
    const pieces = $$(".paper-piece", group).slice(0, 2);
    if (!pieces.length) return;
    const primary = pieces[meta.actionIndex % pieces.length];
    const secondary = pieces[(meta.actionIndex + Math.ceil(pieces.length / 2)) % pieces.length];
    const direction = meta.actionIndex % 2 === 0 ? 1 : -1;
    const travel = Math.min(.72, duration * .18);
    timeline.to(primary, {
      x: "+=" + direction * (3 + meta.actionIndex % 3),
      y: "+=" + (meta.actionIndex % 3 - 1),
      rotation: "+=" + direction * .9,
      duration: travel,
      ease: "sine.inOut",
      yoyo: true,
      repeat: 1
    }, at + Math.min(.24, duration * .06));
    timeline.to(secondary, {
      x: "+=" + -direction * (2 + meta.actionIndex % 2),
      y: "+=" + (meta.actionIndex % 2 ? 2 : -2),
      rotation: "+=" + -direction * .55,
      duration: Math.min(.62, travel),
      ease: "sine.inOut",
      yoyo: true,
      repeat: 1
    }, at + Math.min(.48, duration * .12));
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
    if (meta.scene.type === "shadow") {
      const wristTurn = meta.actionIndex % 2 ? 1.15 : -1.15;
      timeline.to(actorFemaleImage, { rotation: wristTurn, transformOrigin: "48% 78%", duration: .42, ease: "sine.inOut", yoyo: true, repeat: 1 }, at + Math.min(.58, duration * .14));
      timeline.to(actorMaleImage, { rotation: -wristTurn * .72, transformOrigin: "52% 76%", duration: .46, ease: "sine.inOut", yoyo: true, repeat: 1 }, at + Math.min(.72, duration * .18));
      addPaperCutBeat(timeline, meta, at, duration);
    }
    animateEffect(timeline, meta, at, duration);
  }

  function addBeatAnimation(timeline, meta, at) {
    const duration = meta.duration;
    if (productionFor(meta.scene)) addProductionCue(timeline, meta, at);
    else if (meta.scene.type === "film") addFilmBeat(timeline, meta, at, duration);
    else addActorBeat(timeline, meta, at, duration);
    const dialogueAt = meta.scene.type === "shadow" ? at + Math.min(.8, duration * .2) : meta.scene.type === "side" ? at + Math.min(.28, duration * .08) : at;
    timeline.fromTo(dialogueBox, { autoAlpha: .52, y: 10 }, { autoAlpha: 1, y: 0, duration: .45, ease: "power2.out", immediateRender: false }, dialogueAt);
    timeline.fromTo($("#frame-counter"), { scale: .86, autoAlpha: .5 }, { scale: 1, autoAlpha: 1, duration: .34, immediateRender: false }, at);
  }

  function saveResumePosition(meta) {
    if (!meta || !STORY_INDEX.has(meta.scene.id)) return;
    state.resume = { sceneId: meta.scene.id, localStep: meta.localStep, actionIndex: meta.actionIndex };
    writeStoredJson(STORAGE_KEYS.resume, state.resume);
  }

  function setCompletionState(completed) {
    const panel = $("#cinema-complete");
    if (!panel) return;
    panel.hidden = !completed;
    if (!completed) return;
    const current = state.player.currentScene;
    const index = STORY_INDEX.get(current?.id);
    const next = Number.isInteger(index) ? STORY_SCENES[index + 1] : null;
    const title = $("#cinema-complete-title");
    if (title) title.textContent = next ? `下一篇是 ${publicSceneLabel(next)}｜${next.title}` : "二十四篇動畫長卷已看完";
    const button = $("#complete-next-story");
    if (button) {
      button.disabled = !next;
      button.textContent = next ? `選擇下一篇 · ${publicSceneNumber(next)}` : "已到長卷尾聲";
      button.setAttribute("aria-label", next ? `開啟下一篇：${next.title}` : "已到二十四篇動畫長卷尾聲");
    }
    window.requestAnimationFrame(() => panel.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "nearest" }));
  }

  function completeCurrentPlayback() {
    const current = state.player.currentScene;
    if (!current || state.player.completedSceneId === current.id) return;
    state.player.completedSceneId = current.id;
    state.player.sequence.forEach((scene) => { if (STORY_INDEX.has(scene.id)) state.watched.add(scene.id); });
    writeStoredJson(STORAGE_KEYS.watched, [...state.watched]);
    const currentIndex = STORY_INDEX.get(current.id);
    const next = Number.isInteger(currentIndex) ? STORY_SCENES[currentIndex + 1] : null;
    const lastMeta = state.player.stepMeta[state.player.stepMeta.length - 1];
    state.resume = next ? { sceneId: next.id, localStep: 0, actionIndex: 0 } : { sceneId: current.id, localStep: lastMeta?.localStep || 0, actionIndex: lastMeta?.actionIndex || 0 };
    writeStoredJson(STORAGE_KEYS.resume, state.resume);
    updateAnimationProgressUi();
    updateStoryNavigation(current);
    setCompletionState(true);
  }

  function updateStoryNavigation(scene = state.player.currentScene) {
    const index = STORY_INDEX.get(scene?.id);
    const previous = Number.isInteger(index) ? STORY_SCENES[index - 1] : null;
    const next = Number.isInteger(index) ? STORY_SCENES[index + 1] : null;
    const previousButton = $("#prev-story");
    const nextButton = $("#next-story");
    if (previousButton) {
      previousButton.disabled = !previous;
      previousButton.textContent = previous ? `上一篇 · ${publicSceneNumber(previous)}` : "已是第一篇";
      previousButton.setAttribute("aria-label", previous ? `開啟上一篇：${previous.title}` : "已是第一篇動畫");
    }
    if (nextButton) {
      nextButton.disabled = !next;
      nextButton.textContent = next ? `下一篇 · ${publicSceneNumber(next)}` : "已是最後一篇";
      nextButton.setAttribute("aria-label", next ? `開啟下一篇：${next.title}` : "已是最後一篇動畫");
    }
    const progress = $("#cinema-story-progress");
    if (progress) progress.textContent = `${publicSceneLabel(scene)} · 已觀看 ${state.watched.size} / ${PUBLIC_TOTAL}`;
  }

  function switchStoryScene(delta) {
    const index = STORY_INDEX.get(state.player.currentScene?.id);
    if (!Number.isInteger(index)) return;
    const scene = STORY_SCENES[index + delta];
    if (scene) openCinema(scene.id, "single");
  }

  function resumeLastAnimation() {
    const saved = state.resume ? { ...state.resume } : null;
    const scene = saved ? sceneById.get(saved.sceneId) : null;
    if (!scene) return;
    openCinema(scene.id, "single");
    const target = state.player.stepMeta.findIndex((meta) => meta.scene.id === scene.id && meta.localStep === saved.localStep);
    if (target > 0) goToStep(target);
  }

  function renderStep(index, staticVisuals = false) {
    const meta = state.player.stepMeta[index]; if (!meta) return;
    state.player.stepIndex = index; applyScene(meta.scene, staticVisuals); if (meta.scene.type !== "film") setActorSprites(meta.scene, meta.actionIndex);
    saveResumePosition(meta);
    if (index !== state.player.stepMeta.length - 1 && state.player.completedSceneId === meta.scene.id) state.player.completedSceneId = null;
    if (state.player.completedSceneId !== meta.scene.id || index !== state.player.stepMeta.length - 1) setCompletionState(false);
    const production = productionFor(meta.scene);
    const line = meta.line || meta.scene.dialogue[meta.dialogueIndex];
    const visualDescription = $("#cinema-visual-description");
    if (visualDescription) {
      const currentAction = productionFor(meta.scene)?.acts?.[meta.actionIndex]?.action || meta.scene.actions?.[meta.actionIndex] || "場景推進";
      visualDescription.textContent = describeSceneVisual(meta.scene, currentAction);
    }
    if (production) {
      const actInfo = production.acts[meta.actionIndex];
      if (meta.scene.id === "FM-C") {
        const progress = clamp((meta.localStart - actInfo.start) / Math.max(.1, actInfo.end - actInfo.start), 0, 1);
        const plans = FM_C_ACT_SHOTS[meta.actionIndex] || [];
        const shotIndex = plans.reduce((current, plan, planIndex) => progress + .0001 >= plan.start ? planIndex : current, 0);
        hydrateFmCAct(meta.actionIndex, shotIndex);
      }
      stage.style.setProperty("--scene-mobile-focus", productionView(actInfo).position);
      setProductionState(meta);
      $("#frame-counter").textContent = `第${CHINESE_ACT_NUMBERS[meta.actionIndex]}幕 / 五幕`;
      $("#shot-number").textContent = `第${CHINESE_ACT_NUMBERS[meta.actionIndex]}幕 · ${formatTime(meta.localStart)}`;
      $("#shot-action").textContent = actInfo.action;
      const status = $("#current-act-status"); if (status) status.textContent = `第${CHINESE_ACT_NUMBERS[meta.actionIndex]}幕，共五幕：${actInfo.title}`;
    } else {
      stage.style.setProperty("--scene-mobile-focus", "50% 50%");
      const sceneSteps = totalSteps(meta.scene);
      $("#frame-counter").textContent = `${String(meta.localStep + 1).padStart(2, "0")} / ${String(sceneSteps).padStart(2, "0")}`;
      $("#shot-number").textContent = `${TYPE_LABELS[meta.scene.type]} ${String(meta.localStep + 1).padStart(2, "0")}`;
      $("#shot-action").textContent = meta.scene.actions[meta.actionIndex] || "場景推進";
      const status = $("#current-act-status"); if (status) status.textContent = `${TYPE_LABELS[meta.scene.type]}第${meta.localStep + 1}段，共${sceneSteps}段`;
    }
    const activeSpeaker = line?.speaker || "旁白";
    $("#speaker").textContent = activeSpeaker; $("#dialogue-text").textContent = line?.text || meta.scene.title;
    dialogueBox.dataset.speakerTone = speakerTone(activeSpeaker);
    const beats = $$(".story-beat", $("#storyboard"));
    const closestBeat = beats.reduce((closest, beat) => Math.abs(Number(beat.dataset.actionIndex) - meta.actionIndex) < Math.abs(Number(closest?.dataset.actionIndex ?? Infinity) - meta.actionIndex) ? beat : closest, null);
    beats.forEach((beat) => beat.classList.toggle("is-current", beat === closestBeat)); updateActMarkers(meta.scene.id, meta.actionIndex);
    if (staticVisuals || state.reduced || !hasGSAP) applyStaticVisuals(meta); if (!state.player.timeline) syncFallbackProgress();
    if ((state.reduced || !hasGSAP) && index === state.player.stepMeta.length - 1) completeCurrentPlayback();
  }

  function buildTimeline() {
    destroyTimeline(); state.player.stepMeta = createStepMeta(state.player.sequence); state.player.stepTimes = [];
    if (!hasGSAP || state.reduced) { state.player.timeline = null; syncFallbackProgress(); return; }
    const timeline = window.gsap.timeline({ paused: true }); let cursor = 0; stage.classList.add("is-gsap");
    state.player.stepMeta.forEach((meta, index) => { state.player.stepTimes.push(cursor); timeline.addLabel(`step-${index}`, cursor); if (meta.isSceneStart) timeline.addLabel(`scene-${meta.scene.id}`, cursor); if (meta.isActStart) timeline.addLabel(`${meta.scene.id}-act${meta.actionIndex + 1}`, cursor); timeline.call(() => renderStep(index, false), null, cursor); addBeatAnimation(timeline, meta, cursor); timeline.to({}, { duration: meta.duration }, cursor); cursor += meta.duration; });
    timeline.eventCallback("onUpdate", syncTimelineProgress); timeline.eventCallback("onComplete", () => { cinemaAudio?.pause(); state.player.playing = false; updatePlayButton(); syncTimelineProgress(); completeCurrentPlayback(); });
    state.player.timeline = timeline; syncTimelineProgress();
  }

  function destroyTimeline() { state.player.timeline?.kill(); state.player.timeline = null; state.player.stepTimes = []; cinemaAudio?.pause(); stage?.classList.remove("is-gsap"); }
  function formatTime(seconds) { if (!Number.isFinite(seconds)) return "00:00"; const rounded = Math.max(0, Math.round(seconds)); return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`; }
  function syncTimelineProgress() { if (!state.player.timeline) return; const total = state.player.timeline.duration() || 1; const current = state.player.timeline.time(); const value = Math.round((current / total) * 1000); progressInput.value = String(value); progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%，尚餘${formatTime(total - current)}`); timelineTime.textContent = `${formatTime(current)} / ${formatTime(total)} · 尚餘 ${formatTime(total - current)}`; syncSceneAudioToTimeline(false); }
  function syncFallbackProgress() { const total = state.player.stepMeta.length; const value = total <= 1 ? 0 : Math.round((state.player.stepIndex / (total - 1)) * 1000); progressInput.value = String(value); progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`); timelineTime.textContent = `${String(state.player.stepIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`; }
  function stepAtTime(time) { let found = 0; state.player.stepTimes.forEach((start, index) => { if (start <= time + .001) found = index; }); return found; }

  function updatePlayButton() {
    const button = $("#play-cinema"); const overlay = $("#cinema-play-overlay");
    if (button) { button.textContent = state.player.playing ? "暫停" : (state.reduced ? "下一拍" : "播放"); button.setAttribute("aria-pressed", String(state.player.playing)); }
    if (overlay) { overlay.classList.toggle("is-playing", state.player.playing); overlay.setAttribute("aria-label", state.reduced ? "前往下一拍" : "播放動畫"); const small = $("small", overlay); if (small) small.textContent = state.reduced ? "下一拍" : "播放"; }
  }

  function startPlayback() { if (!state.player.stepMeta.length) return; if (state.reduced || !state.player.timeline) { goToStep(state.player.stepIndex + 1); return; } if (state.player.timeline.progress() >= .999) { state.player.timeline.pause(0, true); renderStep(0, false); } scoreLibraryAudio?.pause(); state.player.playing = true; updatePlayButton(); playSceneAudio(); state.player.timeline.play(); }
  function pausePlayback() { state.player.timeline?.pause(); cinemaAudio?.pause(); state.player.playing = false; updatePlayButton(); }
  function goToStep(index) { if (!state.player.stepMeta.length) return; pausePlayback(); const target = clamp(index, 0, state.player.stepMeta.length - 1); if (state.player.timeline) state.player.timeline.pause(state.player.stepTimes[target] || 0, true); renderStep(target, true); syncTimelineProgress(); syncSceneAudioToTimeline(true); const meta = state.player.stepMeta[target]; if (state.player.mode === "single" && meta) setPlayerUrl(meta.scene.id, "single", meta.actionIndex, meta.localStep); }
  function jumpToScene(id) { const index = state.player.stepMeta.findIndex((meta) => meta.scene.id === id); if (index >= 0) goToStep(index); }
  function adjacentUnit(delta) {
    const current = state.player.stepMeta[state.player.stepIndex];
    if (!current || !productionFor(current.scene)) { goToStep(state.player.stepIndex + delta); return; }
    const actStarts = state.player.stepMeta.map((meta, index) => ({ meta, index })).filter(({ meta }) => meta.isActStart);
    const currentUnit = actStarts.reduce((found, unit, index) => unit.index <= state.player.stepIndex ? index : found, 0);
    goToStep(actStarts[clamp(currentUnit + delta, 0, actStarts.length - 1)]?.index ?? state.player.stepIndex);
  }
  function replayCurrentUnit() {
    const current = state.player.stepMeta[state.player.stepIndex]; if (!current) return;
    const index = productionFor(current.scene)
      ? state.player.stepMeta.findIndex((meta) => meta.scene.id === current.scene.id && meta.actionIndex === current.actionIndex)
      : state.player.stepMeta.findIndex((meta) => meta.scene.id === current.scene.id);
    goToStep(index >= 0 ? index : state.player.stepIndex);
  }
  function setCaptions(enabled) {
    state.player.captions = Boolean(enabled);
    stage?.classList.toggle("captions-hidden", !state.player.captions);
    const button = $("#toggle-captions");
    if (button) { button.textContent = state.player.captions ? "字幕：開" : "字幕：關"; button.setAttribute("aria-pressed", String(state.player.captions)); }
  }

  function renderActMarkers() {
    const root = $("#act-markers"); if (!root) return; root.replaceChildren();
    const singleScene = state.player.sequence[0];
    const singleProduction = state.player.mode === "single" ? productionFor(singleScene) : null;
    if (singleProduction) {
      singleProduction.acts.forEach((actInfo, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.sceneId = singleScene.id;
        button.dataset.actIndex = String(index);
        const usesNewActPlate = singleScene.id === "FM-C" && Boolean(FM_C_ACT_PLATES[index]);
        const shotCount = usesNewActPlate ? FM_C_ACT_SHOTS[index].length : 0;
        button.textContent = `第${CHINESE_ACT_NUMBERS[index]}幕 · ${actInfo.title}${usesNewActPlate ? ` · ${shotCount}鏡位` : ""}`;
        if (usesNewActPlate) {
          button.dataset.newPlate = "true";
          button.title = `依設計概念圖重製的 GSAP 第${CHINESE_ACT_NUMBERS[index]}幕 ${shotCount} 鏡位動畫`;
        }
        button.addEventListener("click", () => {
          const stepIndex = state.player.stepMeta.findIndex((meta) => meta.scene.id === singleScene.id && meta.actionIndex === index);
          if (stepIndex >= 0) goToStep(stepIndex);
        });
        root.append(button);
      });
      return;
    }
    state.player.sequence.forEach((scene) => { const button = document.createElement("button"); button.type = "button"; button.dataset.sceneId = scene.id; button.textContent = state.player.mode === "reel" ? `${ACT_LABELS[scene.id]} · ${publicSceneLabel(scene)} · ${scene.title}` : `${publicSceneLabel(scene)} · ${scene.title}`; button.addEventListener("click", () => jumpToScene(scene.id)); root.append(button); });
  }
  function updateActMarkers(sceneId, actIndex = 0) { $$("button", $("#act-markers")).forEach((button) => button.classList.toggle("is-current", button.dataset.sceneId === sceneId && (button.dataset.actIndex == null || Number(button.dataset.actIndex) === actIndex))); }

  function renderStoryboard(scene) {
    const root = $("#storyboard"); if (!root) return; root.replaceChildren();
    const production = productionFor(scene);
    root.hidden = Boolean(production);
    if (production) {
      root.removeAttribute("data-beats");
      return;
    }
    const beatCount = production ? production.acts.length : scene.type === "shadow" ? 6 : scene.type === "side" ? 4 : 10;
    for (let beatIndex = 0; beatIndex < beatCount; beatIndex += 1) {
      const actionIndex = production ? beatIndex : Math.round((beatIndex / Math.max(1, beatCount - 1)) * Math.max(0, scene.actions.length - 1));
      const actInfo = production?.acts[actionIndex];
      const action = actInfo?.action || scene.actions[actionIndex] || `分鏡 ${actionIndex + 1}`;
      const button = document.createElement("button"); button.type = "button"; button.className = "story-beat"; button.dataset.actionIndex = String(actionIndex); button.dataset.number = production ? `幕${CHINESE_ACT_NUMBERS[actionIndex]}` : String(beatIndex + 1).padStart(2, "0"); button.title = actInfo ? `${actInfo.title}｜${action}` : action; button.setAttribute("aria-label", production ? `跳到第${CHINESE_ACT_NUMBERS[actionIndex]}幕：${actInfo.title}` : `跳到${TYPE_LABELS[scene.type]}鏡位${beatIndex + 1}：${action}`);
      if (scene.id === "FM-C" && FM_C_ACT_PLATES[actionIndex]) {
        button.style.setProperty("--beat-image", `url('${assetUrl(FM_C_ACT_PLATES[actionIndex].src)}')`);
        button.style.setProperty("--beat-size", "cover");
        button.style.setProperty("--beat-position", "center");
      }
      else if (scene.image) {
        button.style.setProperty("--beat-image", `url('${assetUrl(scene.image)}')`);
        if (production) {
          const view = productionView(actInfo);
          button.style.setProperty("--beat-size", view.size);
          button.style.setProperty("--beat-position", view.position);
        } else if (scene.type === "film") {
          const shot = currentFilmShot(scene, actionIndex); button.style.setProperty("--beat-size", `${Math.round(105 + (shot.scale - 1) * 140)}% auto`); button.style.setProperty("--beat-position", `${50 + shot.x * .9}% ${50 + shot.y * .7}%`);
        }
      }
      else button.style.setProperty("--beat-image", "radial-gradient(ellipse at center, #695e43, #17130f 74%)");
      button.addEventListener("click", () => { const index = state.player.stepMeta.findIndex((meta) => meta.scene.id === scene.id && meta.actionIndex === actionIndex); if (index >= 0) goToStep(index); }); root.append(button);
    }
    root.dataset.beats = String(beatCount);
  }

  function syncTranscriptToggle(shouldScroll = false) {
    const button = $("#toggle-transcript");
    if (!button || !transcript) return;
    button.setAttribute("aria-expanded", String(transcript.open));
    button.textContent = transcript.open ? "收合逐字稿 ↑" : "展開逐字稿 ↓";
    if (shouldScroll && transcript.open) transcript.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "nearest" });
  }

  function animateTranscriptOpen(details, selector) {
    if (!details?.open || !hasGSAP || state.reduced) return;
    const lines = $$(selector, details);
    if (!lines.length) return;
    window.gsap.fromTo(lines, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .42, stagger: .045, ease: "power2.out", clearProps: "transform,opacity,visibility" });
  }

  function renderTranscript() {
    const root = $("#transcript-body"); if (!root) return; root.replaceChildren();
    if (transcript) transcript.open = false;
    state.player.sequence.forEach((scene, sceneIndex) => {
      const section = document.createElement("details");
      section.className = "transcript-scene";
      section.open = state.player.sequence.length === 1 || sceneIndex === 0;
      const summary = document.createElement("summary");
      const heading = document.createElement("strong"); heading.textContent = `${publicSceneLabel(scene)}｜${scene.title}`;
      const source = document.createElement("small"); source.textContent = scene.source;
      summary.append(heading, source);
      const lines = document.createElement("div"); lines.className = "transcript-lines";
      const production = productionFor(scene);
      const transcriptLines = production?.cues || scene.dialogue;
      transcriptLines.forEach((line) => {
        const paragraph = document.createElement("p");
        const timestamp = Number.isFinite(line.time) ? `${formatTime(line.time)} · ` : "";
        const speaker = document.createElement("b"); speaker.textContent = `${timestamp}${line.id ? `${line.speaker} · ${line.id}` : line.speaker}`;
        const text = document.createElement("span"); text.textContent = line.text;
        paragraph.append(speaker, text); lines.append(paragraph);
      });
      section.append(summary, lines); root.append(section);
    });
    syncTranscriptToggle(false);
  }

  function relativeUrl(url) { return `${url.pathname}${url.search}${url.hash}`; }
  function urlWithoutPlayer() { const url = new URL(window.location.href); url.searchParams.delete("animation"); url.searchParams.delete("scene"); url.searchParams.delete("reel"); url.searchParams.delete("act"); return relativeUrl(url); }
  function setPlayerUrl(id, mode, actIndex = 0, localStep = 0) {
    const url = new URL(window.location.href);
    const scene = sceneById.get(id);
    const publicAct = productionFor(scene) ? actIndex + 1 : localStep + 1;
    url.hash = "";
    url.searchParams.delete("animation");
    url.searchParams.delete("scene");
    url.searchParams.delete("reel");
    url.searchParams.delete("act");
    if (mode === "reel") url.searchParams.set("reel", "1");
    else {
      url.searchParams.set("animation", publicSceneNumber(id));
      if (publicAct > 1) url.searchParams.set("act", String(publicAct));
    }
    window.history.replaceState({ scene: id, mode, act: publicAct }, "", relativeUrl(url));
  }

  function openCinema(id, mode = "single") {
    const scene = sceneById.get(id) || sceneById.get(FILM_ORDER[0]); if (!scene || !dialog) return;
    const openingFresh = !dialog.open;
    if (openingFresh) { state.player.returnFocus = document.activeElement; state.player.returnUrl = urlWithoutPlayer(); }
    state.player.mode = mode; state.player.sequence = mode === "reel" ? FILM_ORDER.map((filmId) => sceneById.get(filmId)).filter(Boolean) : [scene]; state.player.currentScene = null; state.player.currentBackdrop = 0; state.player.completedSceneId = null;
    suspendAmbient();
    if (openingFresh) dialog.showModal();
    document.body.style.overflow = "hidden";
    scoreLibraryAudio?.pause();
    $("#cinema-control-dock")?.classList.remove("is-expanded");
    $("#toggle-more-controls")?.setAttribute("aria-expanded", "false");
    setCompletionState(false); renderActMarkers(); renderTranscript(); buildTimeline(); renderStep(0, true); setCaptions(state.player.captions); setPlayerUrl(scene.id, mode); updatePlayButton();
    if (openingFresh) animateCinemaEntrance();
    $("#cinema-play-overlay")?.focus();
  }

  function animateCinemaEntrance() {
    if (!hasGSAP || state.reduced || !dialog?.open) return;
    const { gsap } = window;
    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .fromTo(".cinema-header, .source-ribbon, .cinema-audio-bar", { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .46, stagger: .055, clearProps: "transform,opacity,visibility" })
      .fromTo(stage, { scale: .985, autoAlpha: .25 }, { scale: 1, autoAlpha: 1, duration: .62, clearProps: "transform,opacity,visibility" }, "-=.3")
      .fromTo(".cinema-meta-row, .storyboard, .transcript", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .48, stagger: .06, clearProps: "transform,opacity,visibility" }, "-=.38");
  }
  function closeCinema() { pausePlayback(); destroyTimeline(); if (dialog?.open) dialog.close(); }

  function releasePlayerSurface() {
    if (cinemaAudio) {
      cinemaAudio.pause();
      cinemaAudio.removeAttribute("src");
      cinemaAudio.load();
    }
    if (filmFoleyContext) {
      filmFoleyContext.close().catch(() => {});
      filmFoleyContext = null;
    }
    filmFoleyCooldown.clear();
    [actorFemaleImage, actorMaleImage].forEach((image) => image?.removeAttribute("src"));
    [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => element?.style.removeProperty("background-image"));
    filmActFrames.forEach((frame) => {
      delete frame.dataset.rigHydrated;
      frame.style.removeProperty("--act-backdrop");
      $$(".fm-c-act-shot", frame).forEach((shot) => {
        delete shot.dataset.hydrated;
        shot.style.removeProperty("--shot-backdrop");
      });
      $$("img[data-src]", frame).forEach((image) => image.removeAttribute("src"));
      $(".fm-c-responsibility-rig", frame)?.style.removeProperty("--adult-focus-image");
    });
    stage?.style.removeProperty("--scene-mobile-focus");
  }

  function afterCinemaClose(action) {
    if (!dialog?.open) { action(); return; }
    dialog.addEventListener("close", () => window.requestAnimationFrame(action), { once: true });
    closeCinema();
  }

  function returnToAnimationMap() {
    afterCinemaClose(() => {
      const target = $("#film-reel");
      target?.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "start" });
      const heading = $("#film-reel-title");
      if (heading) { heading.setAttribute("tabindex", "-1"); window.setTimeout(() => heading.focus({ preventScroll: true }), state.reduced ? 0 : 450); }
    });
  }

  function continueReadingCurrentScene() {
    const sceneId = state.player.currentScene?.id;
    afterCinemaClose(async () => {
      const details = $(".full-copy-details");
      if (details) details.open = true;
      const loaded = await loadInlineStory();
      const target = loaded && sceneId ? $(`.copy-scene-item[data-scene-id="${sceneId}"]`) : $("#full-copy");
      target?.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "center" });
      const focusTarget = $(".copy-scene-card", target || document);
      window.setTimeout(() => focusTarget?.focus?.({ preventScroll: true }), state.reduced ? 0 : 450);
    });
  }
  function sceneShareUrl() {
    const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
    const filmSharePaths = { "FM-A": "share/fm-a/", "FM-D": "share/fm-d/", "FM-B": "share/fm-b/", "FM-C": "share/fm-c/" };
    const currentId = state.player.currentScene?.id;
    if (state.player.mode === "single" && filmSharePaths[currentId]) return new URL(filmSharePaths[currentId], canonical).href;
    const url = new URL(canonical, window.location.href);
    if (state.player.mode === "reel") url.searchParams.set("reel", "1");
    else if (state.player.currentScene) url.searchParams.set("animation", publicSceneNumber(state.player.currentScene));
    return url.href;
  }
  function setShareStatus(message) { const status = $("#share-status"); if (!status) return; window.clearTimeout(state.player.shareTimer); status.textContent = message; state.player.shareTimer = window.setTimeout(() => { status.textContent = ""; }, 3200); }

  async function shareCinema() {
    const current = state.player.currentScene;
    const shareData = { title: state.player.mode === "reel" ? "四部五幕電影｜剴剴案特別專題" : `${current?.title || "動畫"}｜剴剴案特別專題`, text: state.player.mode === "reel" ? "四部各自完成五幕的電影動畫，沿同一條線走到清晨。" : `${current?.subtitle || ""}（${TYPE_LABELS[current?.type] || "動畫"}）`, url: sceneShareUrl() };
    if (navigator.share) { try { await navigator.share(shareData); setShareStatus("分享面板已開啟"); return; } catch (error) { if (error?.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(shareData.url); setShareStatus("專屬連結已複製"); } catch { setShareStatus("請從網址列複製此場連結"); }
  }

  function setupPageMotion() {
    if (!hasGSAP || !window.ScrollTrigger || state.reduced || state.pageMedia) return;
    const { gsap } = window;
    const scroll = window.ScrollTrigger;
    const revealBatch = (selector, fromVars = {}) => {
      const targets = gsap.utils.toArray(selector);
      if (!targets.length) return;
      scroll.batch(targets, {
        start: "top 92%",
        once: true,
        interval: .08,
        batchMax: 5,
        onEnter: (batch) => gsap.fromTo(batch, { y: 32, autoAlpha: 0, ...fromVars }, { y: 0, x: 0, rotation: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: .82, stagger: .085, ease: "power3.out", clearProps: "transform,opacity,visibility" })
      });
    };
    state.pageMedia = gsap.matchMedia();
    state.pageMedia.add({ desktop: "(min-width: 761px)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      if (!context.conditions.motion || state.reduced) return undefined;
      gsap.to(".hero-layer-far", { scale: context.conditions.desktop ? 1.1 : 1.045, yPercent: context.conditions.desktop ? 5 : 2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .75 } });
      gsap.to(".hero-layer-mid", { xPercent: context.conditions.desktop ? -2.2 : -.8, yPercent: context.conditions.desktop ? 3 : 1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".reel-stage-image", { scale: 1.015 }, { scale: 1.09, xPercent: 1.5, ease: "none", scrollTrigger: { trigger: ".reel-stage", start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".reel-stage-thread", { scaleX: .08 }, { scaleX: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: ".reel-stage", start: "top 82%", end: "bottom 34%", scrub: .8 } });
      gsap.utils.toArray(".section-heading, .score-library > header, .full-copy-heading, .visual-copy, .action > .section-shell > p").forEach((target) => gsap.from(target, { y: 34, autoAlpha: 0, duration: .85, ease: "power3.out", scrollTrigger: { trigger: target, start: "top 91%", once: true } }));
      revealBatch(".film-act-card", { y: 42, rotationX: context.conditions.desktop ? 7 : 0, scale: .965 });
      revealBatch(".score-track-grid button", { y: 24, scale: .95 });
      revealBatch(".reading-map-grid a", { y: 28, scale: .975 });
      revealBatch(".source-grid article, .visual-montage figure, .action-cards a", { y: 30, scale: .98 });
      gsap.from(".ambient-track-row, .score-now-playing, .score-player-card audio", { y: 18, autoAlpha: 0, duration: .62, stagger: .09, ease: "power2.out", scrollTrigger: { trigger: ".score-player-card", start: "top 86%", once: true } });
      gsap.utils.toArray(".minnan-seal-field img").forEach((seal, index) => {
        const direction = index % 2 ? -1 : 1;
        gsap.fromTo(seal, { xPercent: 0, yPercent: -direction * (3 + index % 3) }, { xPercent: direction * (2 + index % 4), yPercent: direction * (8 + index % 4), ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.15 } });
      });
      gsap.to(".page-light-a", { xPercent: 18, yPercent: 14, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".page-light-b", { xPercent: -16, yPercent: -10, duration: 21, repeat: -1, yoyo: true, ease: "sine.inOut" });
      return () => undefined;
    });
  }

  function animateNewContent(root) {
    if (!hasGSAP || state.reduced || !window.ScrollTrigger) return;
    window.ScrollTrigger.batch($$(".copy-scene-item", root), { start: "top 92%", once: true, onEnter: (batch) => window.gsap.fromTo(batch, { autoAlpha: 0, y: 26, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .72, stagger: .09, ease: "power3.out", clearProps: "opacity,visibility,transform" }) });
    const storyHighlights = $$("h4[data-chapter-number], .story-key-line, .story-data-line, .story-contrast, .story-transcript > summary, blockquote", root);
    window.ScrollTrigger.batch(storyHighlights, { start: "top 91%", once: true, interval: .1, batchMax: 4, onEnter: (batch) => window.gsap.fromTo(batch, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .68, stagger: .075, ease: "power3.out", clearProps: "opacity,visibility,transform" }) });
  }
  function teardownPageMotion() { state.pageMedia?.revert(); state.pageMedia = null; }

  async function startEntrancePrologue({ automatic = false } = {}) {
    const button = $("#enter-experience");
    if (!entryGate || entryGate.dataset.prologueStarting === "true") return;
    entryGate.dataset.prologueStarting = "true";
    if ($("#gate-reduced")?.checked) setReduced(true);
    if (button) {
      button.disabled = true;
      button.textContent = automatic ? "序幕自動播放中…" : "序幕播放中…";
    }
    entryGate.inert = true;
    entryGate.setAttribute("aria-hidden", "true");
    entryGate.setAttribute("aria-modal", "false");
    const result = await window.playChairPrologue?.();
    const target = result?.target === "#chapter-two-preview" ? result.target : "#top";
    const startWithMusic = automatic ? window.__kaikaiAmbientRequested === true : $("#gate-music")?.checked === true;
    if (target !== "#top" && window.location.hash !== target) window.history.pushState(null, "", target);
    enterSite(target, { startWithMusic });
  }

  function bindEvents() {
    $("#enter-experience")?.addEventListener("click", () => startEntrancePrologue({ automatic: false }));
    $("#enter-reading")?.addEventListener("click", () => enterSite("#full-copy"));
    $("#gate-reduced")?.addEventListener("change", (event) => setReduced(event.target.checked)); motionToggle?.addEventListener("click", () => setReduced(!state.reduced)); navToggle?.addEventListener("click", () => setNavOpen(!state.navOpen));
    $$("a", nav).forEach((link) => link.addEventListener("click", () => setNavOpen(false))); window.addEventListener("resize", () => { if (window.innerWidth > 1120) setNavOpen(false); requestActorCalibration(); });
    window.addEventListener("scroll", () => { if (!readingProgressFrame) readingProgressFrame = window.requestAnimationFrame(updateReadingProgress); }, { passive: true });
    $("#hero-play-reel")?.addEventListener("click", () => openCinema(FILM_ORDER[0], "reel")); $("#play-full-reel")?.addEventListener("click", () => openCinema(FILM_ORDER[0], "reel"));
    $$('[data-featured-film]').forEach((button) => button.addEventListener("click", () => openCinema(button.dataset.featuredFilm, "single")));
    $$('[data-catalog-view]').forEach((button) => button.addEventListener("click", () => renderAnimationCatalog(button.dataset.catalogView)));
    $("#resume-animation")?.addEventListener("click", resumeLastAnimation);
    $("#close-cinema")?.addEventListener("click", closeCinema); $("#share-cinema")?.addEventListener("click", shareCinema); $("#prev-beat")?.addEventListener("click", () => adjacentUnit(-1)); $("#next-beat")?.addEventListener("click", () => adjacentUnit(1));
    $("#prev-story")?.addEventListener("click", () => switchStoryScene(-1)); $("#next-story")?.addEventListener("click", () => switchStoryScene(1));
    $("#return-animation-map")?.addEventListener("click", returnToAnimationMap); $("#continue-reading")?.addEventListener("click", continueReadingCurrentScene);
    $("#complete-next-story")?.addEventListener("click", () => switchStoryScene(1)); $("#complete-return-map")?.addEventListener("click", returnToAnimationMap); $("#complete-continue-reading")?.addEventListener("click", continueReadingCurrentScene);
    $("#play-cinema")?.addEventListener("click", () => state.player.playing ? pausePlayback() : startPlayback()); $("#cinema-play-overlay")?.addEventListener("click", () => state.player.playing ? pausePlayback() : startPlayback()); dialogueBox?.addEventListener("click", () => goToStep(state.player.stepIndex + 1));
    $("#replay-act")?.addEventListener("click", replayCurrentUnit);
    $("#toggle-captions")?.addEventListener("click", () => setCaptions(!state.player.captions));
    $("#toggle-more-controls")?.addEventListener("click", () => {
      const dock = $("#cinema-control-dock"); const expanded = !dock?.classList.contains("is-expanded");
      dock?.classList.toggle("is-expanded", expanded); $("#toggle-more-controls")?.setAttribute("aria-expanded", String(expanded));
    });
    $("#toggle-transcript")?.addEventListener("click", () => { if (!transcript) return; transcript.open = !transcript.open; syncTranscriptToggle(true); });
    transcript?.addEventListener("toggle", () => { syncTranscriptToggle(false); animateTranscriptOpen(transcript, ".transcript-scene"); });
    progressInput?.addEventListener("input", (event) => { if (!state.player.stepMeta.length) return; pausePlayback(); const ratio = Number(event.target.value) / 1000; if (state.player.timeline) { const time = ratio * state.player.timeline.duration(); const target = stepAtTime(time); state.player.timeline.pause(time, true); renderStep(target, false); syncTimelineProgress(); const meta = state.player.stepMeta[target]; if (state.player.mode === "single" && meta) setPlayerUrl(meta.scene.id, "single", meta.actionIndex, meta.localStep); } else goToStep(Math.round(ratio * (state.player.stepMeta.length - 1))); });
    dialog?.addEventListener("close", () => { pausePlayback(); destroyTimeline(); resetEffects(); releasePlayerSurface(); updateAnimationProgressUi(); document.body.style.overflow = ""; if (state.player.returnUrl) window.history.replaceState(null, "", state.player.returnUrl); state.player.returnUrl = null; const target = state.player.returnFocus; state.player.returnFocus = null; target?.focus?.({ preventScroll: true }); resumeAmbient(); });
    musicToggle?.addEventListener("click", toggleMusic);
    cinemaAudio?.addEventListener("loadedmetadata", () => syncSceneAudioToTimeline(true));
    ambientToggles.forEach((button) => button.addEventListener("click", toggleAmbient));
    ambientAudio?.addEventListener("play", refreshAmbientUi);
    ambientAudio?.addEventListener("pause", refreshAmbientUi);
    ambientAudio?.addEventListener("ended", advanceAmbientTrack);
    window.addEventListener("kaikai:ambient-intent", syncPrologueAmbientIntent);
    scoreLibraryButtons.forEach((button) => button.addEventListener("click", () => selectLibraryScore(button, true)));
    scoreLibraryAudio?.addEventListener("play", () => { cinemaAudio?.pause(); suspendAmbient(); });
    scoreLibraryAudio?.addEventListener("pause", () => { if (!dialog?.open) resumeAmbient(); });
    scoreLibraryAudio?.addEventListener("ended", () => { if (!dialog?.open) resumeAmbient(); });
    document.addEventListener("keydown", (event) => {
      if (!dialog?.open) { if (event.key === "Escape") setNavOpen(false); return; }
      const target = event.target;
      const usesNativeKeys = target instanceof HTMLElement && (target.matches("button, input, summary, a, select, textarea") || target.isContentEditable);
      if (usesNativeKeys) return;
      if (event.key === "ArrowRight") adjacentUnit(1);
      if (event.key === "ArrowLeft") adjacentUnit(-1);
      if (event.key.toLowerCase() === "c") setCaptions(!state.player.captions);
      if (event.key === " ") { event.preventDefault(); if (state.player.playing) pausePlayback(); else startPlayback(); }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        state.player.resumeAfterVisibility = state.player.playing;
        pausePlayback();
        if (ambientAudio && !ambientAudio.paused) {
          state.ambient.resumeAfterVisibility = state.ambient.requested;
          pauseAmbient(false);
        }
      } else {
        if (state.player.resumeAfterVisibility && dialog?.open && !state.reduced) {
          state.player.resumeAfterVisibility = false;
          startPlayback();
        }
        if (state.ambient.resumeAfterVisibility && !dialog?.open && scoreLibraryAudio?.paused !== false) {
          state.ambient.resumeAfterVisibility = false;
          playAmbient();
        }
      }
    });
  }

  function directPlayerRequest(params = new URLSearchParams(window.location.search)) {
    const animation = Number(params.get("animation"));
    const publicScene = Number.isInteger(animation) && animation >= 1 && animation <= PUBLIC_TOTAL ? STORY_SCENES[animation - 1] : null;
    const requestedScene = params.get("scene");
    const sceneId = publicScene?.id || (sceneById.has(requestedScene) ? requestedScene : null);
    const scene = sceneById.get(sceneId);
    const production = productionFor(scene);
    const maxAct = production?.acts?.length || (scene ? totalSteps(scene) : 1);
    return {
      sceneId,
      reel: params.get("reel") === "1",
      requestedAct: clamp(Math.trunc(Number(params.get("act"))) || 1, 1, maxAct) - 1
    };
  }

  function initDirectPlayer() {
    const { sceneId, reel, requestedAct } = directPlayerRequest();
    if (reel || (sceneId && sceneById.has(sceneId))) {
      setPageGate(false); rememberEnteredSession();
      window.setTimeout(() => {
        const targetSceneId = reel ? FILM_ORDER[0] : sceneId;
        openCinema(targetSceneId, reel ? "reel" : "single");
        if (!reel && requestedAct > 0) {
          const production = productionFor(sceneById.get(targetSceneId));
          const stepIndex = state.player.stepMeta.findIndex((meta) => meta.scene.id === targetSceneId && (production ? meta.actionIndex : meta.localStep) === requestedAct);
          if (stepIndex >= 0) goToStep(stepIndex);
        }
      }, 120);
      return true;
    }
    return false;
  }

  function hasDirectHash() {
    return Boolean(window.location.hash && window.location.hash !== "#" && window.location.hash !== "#top");
  }

  function initDirectHash() {
    if (!hasDirectHash()) return false;
    setPageGate(false);
    rememberEnteredSession();
    window.setTimeout(async () => {
      let id = "";
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch { id = window.location.hash.slice(1); }
      let target = document.getElementById(id);
      if (!target) {
        const details = $(".full-copy-details");
        if (details) details.open = true;
        await loadInlineStory();
        target = document.getElementById(id);
      } else if (target.id === "full-copy") {
        $(".full-copy-details")?.setAttribute("open", "");
      }
      (target || $("#main"))?.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "start" });
      target?.setAttribute?.("tabindex", "-1");
      window.setTimeout(() => target?.focus?.({ preventScroll: true }), state.reduced ? 0 : 450);
      window.ScrollTrigger?.refresh();
    }, 180);
    return true;
  }

  function init() {
    if (!scenes.length) { console.error("Scene registry was not loaded."); return; }
    const params = new URLSearchParams(window.location.search);
    const requestedPlayer = directPlayerRequest(params);
    const hasDirectPlayer = requestedPlayer.reel || Boolean(requestedPlayer.sceneId);
    const gated = !hasDirectHash() && !hasDirectPlayer && !hasEnteredSession();
    setPageGate(gated);
    refreshMotionUi(); refreshAmbientUi(); renderAnimationCatalog(); bindEvents(); updateReadingProgress(); setupFullCopy(); setupPageMotion();
    const directPlayer = initDirectPlayer();
    const directHash = !directPlayer && initDirectHash();
    if (!directPlayer && !directHash) {
      if (gated) {
        playGateIntro();
        window.requestAnimationFrame(() => startEntrancePrologue({ automatic: true }));
      } else playPageIntro();
    }
  }

  init();
})();
