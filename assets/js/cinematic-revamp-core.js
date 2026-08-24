(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const scenes = (window.KAIKAI_SCENES || []).slice();
  const order = (window.KAIKAI_SCENE_ORDER || scenes.map((scene) => scene.id)).slice();
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const filmProductions = window.KAIKAI_FILM_PRODUCTIONS || {};
  const hasGSAP = Boolean(window.gsap);
  const FILM_ORDER = ["FM-A", "FM-D", "FM-B", "FM-C"];
  const TYPE_LABELS = { film: "主線電影", shadow: "皮影詩劇", side: "陰翳側視劇場" };
  const ACT_LABELS = { "FM-A": "第一部", "FM-D": "第二部", "FM-B": "第三部", "FM-C": "第四部" };
  const FILM_POSITIONS = { "FM-A": "22% 50%", "FM-D": "36% 50%", "FM-B": "70% 50%", "FM-C": "50% 50%" };
  const SCORE_TRACKS = {
    "FM-A": { src: "public/media/film-stamped-in-marble.m4a", label: "Stamped in Marble｜土掩埋不住的清朝民間傳說" },
    "FM-D": { src: "public/media/film-late-question.m4a", label: "來不及的追問｜無法再相見▪︎天涯各自分" },
    "FM-B": { src: "public/media/film-one-year-old.m4a", label: "他才一歲多｜青絲變白髮" },
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
  const SITE_BACKGROUND_TRACK = { src: "public/media/site-background.m4a", label: "全站背景｜玩偶落淚之處" };

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
  let actorCalibrationFrame = 0;
  let gateMotionContext = null;
  let pageIntroPlayed = false;

  const state = {
    reduced: localStorage.getItem("kk-reduced-v8") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    navOpen: false,
    pageMedia: null,
    musicEnabled: localStorage.getItem("kk-music-v8") !== "false",
    ambient: {
      requested: false,
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
      currentScene: null,
      currentBackdrop: 0,
      audioPlayPending: false,
      resumeAfterVisibility: false,
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
  const filmProduction = $("#film-production");
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
  const progressInput = $("#timeline-progress");
  const timelineTime = $("#timeline-time");

  if (hasGSAP) {
    document.documentElement.classList.add("has-gsap");
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
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

  function setPageGate(locked) {
    if (!locked) stopGateMotion();
    document.body.classList.toggle("is-gated", locked);
    if (header) header.inert = locked;
    if (main) main.inert = locked;
    entryGate?.setAttribute("aria-hidden", String(!locked));
  }

  function enterSite(target = "#top") {
    const startWithMusic = $("#gate-music")?.checked === true;
    setPageGate(false);
    sessionStorage.setItem("kk-entered-v8", "true");
    if (startWithMusic) playAmbient();
    if (target === "#top") playPageIntro();
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

  function preloadSequence(sequence) {
    sequence.forEach((scene) => {
      if (scene.image) { const image = new Image(); image.src = scene.image; }
      if (scene.type !== "film") {
        ["female", "male"].forEach((sex) => actorPosePlan(scene, sex).forEach((pose) => { const image = new Image(); image.src = poseAsset(scene, sex, pose); }));
      }
    });
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

  function createFilmActCard(scene, index) {
    const production = productionFor(scene);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "film-act-card";
    button.dataset.sceneId = scene.id;
    button.style.setProperty("--film-image", `url('${scene.image}')`);
    button.style.setProperty("--film-position", FILM_POSITIONS[scene.id] || "center");
    button.setAttribute("aria-label", `播放${ACT_LABELS[scene.id]}：${scene.title}`);
    const badge = document.createElement("span"); badge.textContent = `ACT ${String(index + 1).padStart(2, "0")}`;
    const copy = document.createElement("div");
    const small = document.createElement("small"); small.textContent = ACT_LABELS[scene.id];
    const heading = document.createElement("h3"); heading.textContent = scene.title;
    const paragraph = document.createElement("p"); paragraph.textContent = production ? `${scene.subtitle}｜五幕 ${formatTime(production.duration)}｜${production.score.label.split("｜")[0]}` : scene.subtitle;
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
        const pose = actorPosePlan(scene, sex)[previewBeat];
        const image = document.createElement("img"); image.className = `scene-card-actor ${sex}`; image.alt = ""; image.loading = "lazy"; image.src = poseAsset(scene, sex, pose); configurePreviewActor(image, scene, sex, pose); button.append(image);
      });
    }
    const play = document.createElement("span"); play.className = "scene-card-play"; play.textContent = scene.type === "film" ? "電影" : "播放";
    const meta = document.createElement("span"); meta.className = "scene-card-meta";
    const small = document.createElement("small"); small.textContent = `${String(position + 1).padStart(2, "0")} / 24 · ${scene.id} · ${TYPE_LABELS[scene.type]}`;
    const heading = document.createElement("h3"); heading.textContent = scene.title;
    const production = productionFor(scene);
    const paragraph = document.createElement("p"); paragraph.textContent = production ? `${scene.subtitle}｜五幕 ${formatTime(production.duration)}｜${production.score.label.split("｜")[0]}` : scene.subtitle;
    meta.append(small, heading, paragraph); button.append(poster, play, meta);
    button.addEventListener("click", () => openCinema(scene.id, "single"));
    item.append(button);
    item.append(createLibraryTranscript(scene));
    return item;
  }

  function renderSceneLibrary() {
    if (!sceneGrid) return;
    const fragment = document.createDocumentFragment();
    order.forEach((id, index) => { const scene = sceneById.get(id); if (scene) fragment.append(createSceneCard(scene, index)); });
    sceneGrid.replaceChildren(fragment);
    requestActorCalibration(sceneGrid);
  }

  function createInlineSceneCard(scene) {
    const item = document.createElement("article");
    item.className = `copy-scene-item ${scene.type}`;
    item.dataset.sceneId = scene.id;
    const button = document.createElement("button"); button.type = "button"; button.className = `copy-scene-card ${scene.type}`; button.setAttribute("aria-label", `播放隨文${TYPE_LABELS[scene.type]}：${scene.title}`);
    const poster = document.createElement("span"); poster.className = "copy-scene-poster";
    if (scene.image) poster.style.setProperty("--poster", `url('${scene.image}')`);
    if (scene.type !== "film") {
      ["female", "male"].forEach((sex) => { const pose = actorPosePlan(scene, sex)[4]; const image = document.createElement("img"); image.className = `copy-scene-actor ${sex}`; image.alt = ""; image.loading = "lazy"; image.src = poseAsset(scene, sex, pose); configurePreviewActor(image, scene, sex, pose); poster.append(image); });
    }
    const meta = document.createElement("span"); meta.className = "copy-scene-meta";
    const small = document.createElement("small"); small.textContent = `${scene.id} · ${TYPE_LABELS[scene.type]}`;
    const strong = document.createElement("strong"); strong.textContent = scene.title;
    const description = document.createElement("span"); description.textContent = scene.subtitle;
    meta.append(small, strong, description); button.append(poster, meta);
    button.addEventListener("click", () => openCinema(scene.id, "single"));
    item.append(button);
    item.append(createLibraryTranscript(scene));
    return item;
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

  function totalSteps(scene) { return productionFor(scene)?.cues.length || Math.max(10, scene.dialogue.length); }
  function actionIndexFor(scene, localStep) { return Math.min(9, Math.floor((localStep / totalSteps(scene)) * 10)); }
  function dialogueIndexFor(scene, localStep) { return Math.min(scene.dialogue.length - 1, Math.floor((localStep / totalSteps(scene)) * scene.dialogue.length)); }
  function stepDuration(scene, localStep) { const line = scene.dialogue[dialogueIndexFor(scene, localStep)]; return clamp(2.9 + String(line?.text || "").length * .025, 3.6, 6.5); }

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
    const production = productionFor(scene);
    state.player.currentScene = scene; stage.dataset.type = scene.type; stage.dataset.scene = scene.id; stage.dataset.production = String(Boolean(production));
    if (filmProduction) filmProduction.hidden = !production;
    $("#cinema-type").textContent = state.player.mode === "reel" ? `四部連續電影 · ${ACT_LABELS[scene.id] || TYPE_LABELS[scene.type]}` : `${TYPE_LABELS[scene.type]} · ${scene.id}`;
    $("#cinema-title").textContent = scene.title; $("#cinema-subtitle").textContent = production ? `${scene.subtitle}｜五幕 ${formatTime(production.duration)}` : scene.subtitle; $("#cinema-source").textContent = production?.ethics || scene.source; stageProp.textContent = scene.prop || scene.motif || "";
    if (changed) { setBackdrop(scene, immediate); renderStoryboard(scene); updateActMarkers(scene.id); syncSceneAudio(scene); }
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

  function refreshAmbientUi() {
    if (!ambientAudio) return;
    const playing = !ambientAudio.paused;
    ambientToggles.forEach((button) => {
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? `暫停${SITE_BACKGROUND_TRACK.label}` : `播放${SITE_BACKGROUND_TRACK.label}`);
      button.title = playing ? "暫停背景音樂" : "播放背景音樂";
      const status = $(".ambient-status", button);
      if (status) status.textContent = playing ? "暫停" : "播放";
    });
  }

  function playAmbient() {
    if (!ambientAudio) return;
    state.ambient.requested = true;
    ambientAudio.volume = .34;
    const nextSrc = new URL(SITE_BACKGROUND_TRACK.src, window.location.href).href;
    if (ambientAudio.src !== nextSrc) ambientAudio.src = SITE_BACKGROUND_TRACK.src;
    ambientAudio.play().then(refreshAmbientUi).catch(refreshAmbientUi);
  }

  function pauseAmbient(userInitiated = false) {
    if (!ambientAudio) return;
    ambientAudio.pause();
    if (userInitiated) {
      state.ambient.requested = false;
      state.ambient.resumeAfterForeground = false;
      state.ambient.resumeAfterVisibility = false;
    }
    refreshAmbientUi();
  }

  function toggleAmbient() {
    if (!ambientAudio) return;
    if (ambientAudio.paused) playAmbient(); else pauseAmbient(true);
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
    timeline.set(door, { autoAlpha: 0 }, at);
    timeline.set([$("i", door), $("b", door)], { xPercent: 0 }, at);
  }

  function addProductionAct(timeline, meta, at) {
    const production = productionFor(meta.scene);
    const actInfo = production.acts[meta.actionIndex];
    const duration = actInfo.end - actInfo.start;
    const view = productionView(actInfo);
    const travel = Math.min(2.2, duration * .16);
    const backgroundDuration = actInfo.effect === "white-hair" ? 9.5 : duration;
    timeline.call(() => setProductionState(meta), null, at);
    resetProductionLayers(timeline, at);
    timeline.set([bgA, bgB], { clearProps: "filter" }, at);
    timeline.set([bgA, bgB, depthFar, depthMid, depthNear], { backgroundPosition: view.position, backgroundSize: view.size }, at);
    timeline.fromTo([bgA, bgB], { scale: 1.018 }, { scale: 1.055, duration: backgroundDuration, ease: "none" }, at);
    timeline.fromTo(depthFar, { xPercent: -1.2, scale: 1.02 }, { xPercent: 1.2, scale: 1.06, duration: backgroundDuration, ease: "none" }, at);
    timeline.fromTo(depthMid, { xPercent: .8, scale: 1.03 }, { xPercent: -1.1, scale: 1.075, duration: backgroundDuration, ease: "sine.inOut" }, at);
    timeline.fromTo(depthNear, { xPercent: 1.4, scale: 1.05 }, { xPercent: -1.8, scale: 1.1, duration: backgroundDuration, ease: "sine.inOut" }, at);
    timeline.fromTo(filmActSlate, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .55, ease: "power2.out" }, at + .08);
    timeline.to(filmActSlate, { autoAlpha: 0, duration: .65 }, at + Math.min(4.5, duration * .28));

    const lineDraw = (startOffset = .4, drawDuration = Math.min(8, duration * .6), end = 0) => {
      timeline.set(filmLinePath, { autoAlpha: .82 }, at + startOffset);
      timeline.to(filmLinePath, { strokeDashoffset: end, duration: drawDuration, ease: "power1.inOut" }, at + startOffset);
    };
    const doorLeft = $("i", door);
    const doorRight = $("b", door);

    switch (actInfo.effect) {
      case "mud-thread":
      case "bundle":
        lineDraw(.5, duration * .78, actInfo.effect === "bundle" ? 230 : 0);
        timeline.fromTo(mist, { autoAlpha: .08, xPercent: -5 }, { autoAlpha: .38, xPercent: 4, duration, ease: "sine.inOut" }, at);
        break;
      case "night-door":
        timeline.set(door, { autoAlpha: .68 }, at + 1.2);
        timeline.to(doorLeft, { xPercent: -82, duration: duration * .56, ease: "power1.inOut" }, at + 2);
        timeline.to(doorRight, { xPercent: 82, duration: duration * .56, ease: "power1.inOut" }, at + 2);
        timeline.fromTo(filmCurtain, { autoAlpha: 0, scaleY: .82, skewX: -2 }, { autoAlpha: .72, scaleY: 1.06, skewX: 2, duration: duration * .44, ease: "sine.inOut" }, at + duration * .42);
        break;
      case "match-cut":
        timeline.fromTo(filmCurtain, { autoAlpha: .86, clipPath: "inset(0 48% 0 48%)" }, { autoAlpha: .1, clipPath: "inset(0 0% 0 0%)", duration: Math.min(2.2, duration * .3), ease: "power2.inOut" }, at);
        timeline.to([bgA, bgB], { filter: "saturate(.62) contrast(1.04) brightness(.8)", duration: duration * .72, ease: "sine.inOut" }, at + .4);
        timeline.set(door, { autoAlpha: .4 }, at + duration * .48);
        timeline.to(doorLeft, { xPercent: -96, duration: 2.2, ease: "power2.inOut" }, at + duration * .55);
        timeline.to(doorRight, { xPercent: 96, duration: 2.2, ease: "power2.inOut" }, at + duration * .55);
        break;
      case "verdict":
        lineDraw(1.2, duration * .7, 0);
        timeline.fromTo(filmStamp, { autoAlpha: 0, y: -18, scale: 1.18, rotation: -7 }, { autoAlpha: .86, y: 0, scale: 1, rotation: -3, duration: .34, ease: "back.out(1.7)" }, at + duration * .28);
        timeline.to(focusLight, { xPercent: 28, autoAlpha: .34, duration: travel, ease: "sine.inOut" }, at);
        break;
      case "safe-flash":
        filmFlashItems.forEach((flash, index) => {
          const first = at + 4 + index * 1.28;
          timeline.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: .16, duration: .08, repeat: 1, yoyo: true, ease: "none" }, first);
          timeline.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: .13, duration: .08, repeat: 1, yoyo: true, ease: "none" }, first + 5.2);
        });
        break;
      case "phone-door":
        timeline.set(door, { autoAlpha: .46 }, at + 1);
        timeline.to([doorLeft, doorRight], { xPercent: (index, target) => target === doorLeft ? -5 : 5, duration: 2.4, ease: "sine.inOut" }, at + duration * .42);
        timeline.to([doorLeft, doorRight], { xPercent: 0, duration: 1.5, ease: "sine.inOut" }, at + duration * .68);
        timeline.fromTo(focusLight, { xPercent: -18, autoAlpha: .12 }, { xPercent: 24, autoAlpha: .3, duration, ease: "sine.inOut" }, at);
        break;
      case "trust-corridor":
        timeline.fromTo(filmSourceTag, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .55 }, at + duration * .34);
        lineDraw(.6, duration * .74, 170);
        break;
      case "six-doors":
        timeline.fromTo(filmDoorItems, { autoAlpha: 0, y: 16, rotationY: -12 }, { autoAlpha: .9, y: 0, rotationY: 0, duration: .7, stagger: 1.2, ease: "power2.out" }, at + .8);
        lineDraw(1.1, 8.1, 145);
        timeline.to(filmDoorItems[5], { autoAlpha: .48, filter: "brightness(.72)", duration: .45 }, at + 8.9);
        break;
      case "testimony":
        timeline.fromTo(filmSourceTag, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .5 }, at + .4);
        timeline.fromTo(focusLight, { xPercent: -24, autoAlpha: .1 }, { xPercent: 14, autoAlpha: .28, duration: 5, ease: "sine.inOut" }, at);
        lineDraw(3.2, duration * .64, 115);
        break;
      case "qing-hair":
        timeline.fromTo(filmHairItems, { autoAlpha: 0, yPercent: -6, backgroundColor: "#161816" }, { autoAlpha: .74, yPercent: 4, duration: 2.4, stagger: .12, ease: "sine.inOut" }, at + .5);
        break;
      case "medical-curtain":
        timeline.fromTo(filmCurtain, { autoAlpha: .1, scaleX: .72 }, { autoAlpha: .62, scaleX: 1.08, duration: 4.6, ease: "sine.inOut" }, at);
        timeline.fromTo(rain, { autoAlpha: 0, yPercent: -7 }, { autoAlpha: .19, yPercent: 7, duration, ease: "none" }, at);
        break;
      case "dossier":
        timeline.fromTo(filmCurtain, { autoAlpha: .65, clipPath: "inset(0 0 0 0)" }, { autoAlpha: .08, clipPath: "inset(0 45% 0 45%)", duration: 3.2, ease: "power2.inOut" }, at);
        timeline.fromTo(papers, { autoAlpha: 0 }, { autoAlpha: .46, duration: 1.4 }, at + 2.2);
        break;
      case "white-hair":
        timeline.fromTo(filmHairItems, { autoAlpha: .78, backgroundColor: "#20211f" }, { autoAlpha: .9, backgroundColor: "#d8d8d2", duration: 5.4, stagger: .28, ease: "none" }, at);
        timeline.to([atmosphere, mist, rain], { autoAlpha: .06, duration: .25 }, at + 10);
        timeline.to([atmosphere, mist, rain], { autoAlpha: .2, duration: .4 }, at + 13);
        timeline.to([bgA, bgB, depthFar, depthMid, depthNear], { scale: "+=.012", duration: 3, ease: "sine.inOut" }, at + 13);
        break;
      case "empty-court":
        timeline.to([atmosphere, focusLight, thread], { autoAlpha: .05, duration: duration * .72, ease: "sine.out" }, at);
        break;
      case "split-shadow":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        lineDraw(1.6, duration * .64, 430);
        break;
      case "information":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        timeline.fromTo(filmInfoItems, { autoAlpha: 0, y: 18, rotation: -4 }, { autoAlpha: .76, y: 0, rotation: 0, duration: .65, stagger: 1, ease: "power2.out" }, at + .8);
        timeline.to(filmInfoItems, { autoAlpha: .32, y: -8, duration: duration * .55, stagger: .18, ease: "sine.inOut" }, at + 7);
        break;
      case "silence-clothes":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        timeline.fromTo(filmDoorItems, { autoAlpha: 0, filter: "brightness(.65)" }, { autoAlpha: .32, filter: "brightness(1)", duration: .7, stagger: .7 }, at + .5);
        timeline.fromTo(filmInfoItems.slice(1, 4), { autoAlpha: .18, rotation: -4 }, { autoAlpha: .45, rotation: 5, duration: duration * .74, stagger: .6, ease: "sine.inOut" }, at + 1.4);
        break;
      case "responsibility":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        lineDraw(1.4, duration * .46, 0);
        break;
      case "one-inch":
        timeline.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 }, at);
        timeline.set(door, { autoAlpha: .42 }, at + .4);
        timeline.to(doorLeft, { xPercent: -4, duration: 4.2, ease: "power1.inOut" }, at + 1.2);
        timeline.to(doorRight, { xPercent: 4, duration: 4.2, ease: "power1.inOut" }, at + 1.2);
        timeline.to(filmSeam, { scaleX: 1.18, autoAlpha: 1, duration: 4.2, ease: "power1.inOut" }, at + 1.2);
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
    const progress = clamp((meta.localStart - actInfo.start) / Math.max(.1, actInfo.end - actInfo.start), 0, 1);
    setProductionState(meta);
    if (hasGSAP) {
      const { gsap } = window;
      const clearTargets = [filmCurtain, filmStamp, filmSourceTag, ...filmInfoItems, ...filmDoorItems, ...filmHairItems, ...filmKeywordItems, ...filmFlashItems, filmWorldQing, filmWorldModern, filmSeam];
      gsap.set(clearTargets, { clearProps: "opacity,visibility,transform,filter,clipPath,backgroundColor" });
      filmProduction.style.setProperty("--split", productionSplitForCue(meta.cue));
      gsap.set([bgA, bgB, depthFar, depthMid, depthNear], { backgroundPosition: view.position, backgroundSize: view.size, scale: 1.018 + progress * .037, xPercent: 0, yPercent: 0 });
      gsap.set(filmActSlate, { autoAlpha: 1, y: 0 });
      gsap.set(filmLinePath, { clearProps: "opacity,visibility", strokeDasharray: 1000, strokeDashoffset: 1000 - progress * 1000 });
      if (/mud-thread|bundle|trust-corridor|six-doors|testimony|split-shadow|responsibility|one-inch/.test(actInfo.effect)) gsap.set(filmLinePath, { autoAlpha: .8 });
      if (meta.scene.id === "FM-C") gsap.set([filmWorldQing, filmWorldModern, filmSeam], { autoAlpha: 1 });
      if (actInfo.effect === "six-doors" || actInfo.effect === "silence-clothes") gsap.set(filmDoorItems.slice(0, Math.max(1, Math.ceil(progress * 6))), { autoAlpha: .82 });
      if (actInfo.effect === "information") gsap.set(filmInfoItems.slice(0, Math.max(1, Math.ceil(progress * 5))), { autoAlpha: .62 });
      if (actInfo.effect === "qing-hair" || actInfo.effect === "white-hair") gsap.set(filmHairItems, { autoAlpha: .82, backgroundColor: actInfo.effect === "white-hair" ? "#d8d8d2" : "#20211f" });
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
      [bgA, bgB, depthFar, depthMid, depthNear].forEach((element) => {
        element.style.backgroundPosition = view.position;
        element.style.backgroundSize = view.size;
      });
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
    if (productionFor(meta.scene)) addProductionCue(timeline, meta, at);
    else if (meta.scene.type === "film") addFilmBeat(timeline, meta, at, duration);
    else addActorBeat(timeline, meta, at, duration);
    timeline.fromTo(dialogueBox, { autoAlpha: .52, y: 10 }, { autoAlpha: 1, y: 0, duration: .45, ease: "power2.out", immediateRender: false }, at);
    timeline.fromTo($("#frame-counter"), { scale: .86, autoAlpha: .5 }, { scale: 1, autoAlpha: 1, duration: .34, immediateRender: false }, at);
  }

  function renderStep(index, staticVisuals = false) {
    const meta = state.player.stepMeta[index]; if (!meta) return;
    state.player.stepIndex = index; applyScene(meta.scene, staticVisuals); if (meta.scene.type !== "film") setActorSprites(meta.scene, meta.actionIndex);
    const production = productionFor(meta.scene);
    const line = meta.line || meta.scene.dialogue[meta.dialogueIndex];
    if (production) {
      const actInfo = production.acts[meta.actionIndex];
      setProductionState(meta);
      $("#frame-counter").textContent = `第${CHINESE_ACT_NUMBERS[meta.actionIndex]}幕 / 五幕`;
      $("#shot-number").textContent = `第${CHINESE_ACT_NUMBERS[meta.actionIndex]}幕 · ${formatTime(meta.localStart)}`;
      $("#shot-action").textContent = actInfo.action;
    } else {
      $("#frame-counter").textContent = `${String(meta.actionIndex + 1).padStart(2, "0")} / 10`;
      $("#shot-number").textContent = `分鏡 ${String(meta.actionIndex + 1).padStart(2, "0")}`;
      $("#shot-action").textContent = meta.scene.actions[meta.actionIndex] || "場景推進";
    }
    const activeSpeaker = line?.speaker || "旁白";
    $("#speaker").textContent = activeSpeaker; $("#dialogue-text").textContent = line?.text || meta.scene.title;
    dialogueBox.dataset.speakerTone = speakerTone(activeSpeaker);
    $$(".story-beat", $("#storyboard")).forEach((beat, beatIndex) => beat.classList.toggle("is-current", beatIndex === meta.actionIndex)); updateActMarkers(meta.scene.id, meta.actionIndex);
    if (staticVisuals || state.reduced || !hasGSAP) applyStaticVisuals(meta); if (!state.player.timeline) syncFallbackProgress();
  }

  function buildTimeline() {
    destroyTimeline(); state.player.stepMeta = createStepMeta(state.player.sequence); state.player.stepTimes = [];
    if (!hasGSAP || state.reduced) { state.player.timeline = null; syncFallbackProgress(); return; }
    const timeline = window.gsap.timeline({ paused: true }); let cursor = 0; stage.classList.add("is-gsap");
    state.player.stepMeta.forEach((meta, index) => { state.player.stepTimes.push(cursor); timeline.addLabel(`step-${index}`, cursor); if (meta.isSceneStart) timeline.addLabel(`scene-${meta.scene.id}`, cursor); if (meta.isActStart) timeline.addLabel(`${meta.scene.id}-act${meta.actionIndex + 1}`, cursor); timeline.call(() => renderStep(index, false), null, cursor); addBeatAnimation(timeline, meta, cursor); timeline.to({}, { duration: meta.duration }, cursor); cursor += meta.duration; });
    timeline.eventCallback("onUpdate", syncTimelineProgress); timeline.eventCallback("onComplete", () => { cinemaAudio?.pause(); state.player.playing = false; updatePlayButton(); syncTimelineProgress(); });
    state.player.timeline = timeline; syncTimelineProgress();
  }

  function destroyTimeline() { state.player.timeline?.kill(); state.player.timeline = null; state.player.stepTimes = []; cinemaAudio?.pause(); stage?.classList.remove("is-gsap"); }
  function formatTime(seconds) { if (!Number.isFinite(seconds)) return "00:00"; const rounded = Math.max(0, Math.round(seconds)); return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`; }
  function syncTimelineProgress() { if (!state.player.timeline) return; const total = state.player.timeline.duration() || 1; const value = Math.round((state.player.timeline.time() / total) * 1000); progressInput.value = String(value); progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`); timelineTime.textContent = `${formatTime(state.player.timeline.time())} / ${formatTime(total)}`; syncSceneAudioToTimeline(false); }
  function syncFallbackProgress() { const total = state.player.stepMeta.length; const value = total <= 1 ? 0 : Math.round((state.player.stepIndex / (total - 1)) * 1000); progressInput.value = String(value); progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`); timelineTime.textContent = `${String(state.player.stepIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`; }
  function stepAtTime(time) { let found = 0; state.player.stepTimes.forEach((start, index) => { if (start <= time + .001) found = index; }); return found; }

  function updatePlayButton() {
    const button = $("#play-cinema"); const overlay = $("#cinema-play-overlay");
    if (button) { button.textContent = state.player.playing ? "暫停" : (state.reduced ? "下一拍" : "播放"); button.setAttribute("aria-pressed", String(state.player.playing)); }
    if (overlay) { overlay.classList.toggle("is-playing", state.player.playing); overlay.setAttribute("aria-label", state.reduced ? "前往下一拍" : "播放動畫"); const small = $("small", overlay); if (small) small.textContent = state.reduced ? "下一拍" : "播放"; }
  }

  function startPlayback() { if (!state.player.stepMeta.length) return; if (state.reduced || !state.player.timeline) { goToStep(state.player.stepIndex + 1); return; } if (state.player.timeline.progress() >= .999) { state.player.timeline.pause(0, true); renderStep(0, false); } scoreLibraryAudio?.pause(); state.player.playing = true; updatePlayButton(); playSceneAudio(); state.player.timeline.play(); }
  function pausePlayback() { state.player.timeline?.pause(); cinemaAudio?.pause(); state.player.playing = false; updatePlayButton(); }
  function goToStep(index) { if (!state.player.stepMeta.length) return; pausePlayback(); const target = clamp(index, 0, state.player.stepMeta.length - 1); if (state.player.timeline) state.player.timeline.pause(state.player.stepTimes[target] || 0, true); renderStep(target, true); syncTimelineProgress(); syncSceneAudioToTimeline(true); }
  function jumpToScene(id) { const index = state.player.stepMeta.findIndex((meta) => meta.scene.id === id); if (index >= 0) goToStep(index); }

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
        button.textContent = `第${CHINESE_ACT_NUMBERS[index]}幕 · ${actInfo.title}`;
        button.addEventListener("click", () => {
          const stepIndex = state.player.stepMeta.findIndex((meta) => meta.scene.id === singleScene.id && meta.actionIndex === index);
          if (stepIndex >= 0) goToStep(stepIndex);
        });
        root.append(button);
      });
      return;
    }
    state.player.sequence.forEach((scene, index) => { const button = document.createElement("button"); button.type = "button"; button.dataset.sceneId = scene.id; button.textContent = state.player.mode === "reel" ? `${ACT_LABELS[scene.id]} · ${scene.title}` : `${String(index + 1).padStart(2, "0")} · ${scene.title}`; button.addEventListener("click", () => jumpToScene(scene.id)); root.append(button); });
  }
  function updateActMarkers(sceneId, actIndex = 0) { $$("button", $("#act-markers")).forEach((button) => button.classList.toggle("is-current", button.dataset.sceneId === sceneId && (button.dataset.actIndex == null || Number(button.dataset.actIndex) === actIndex))); }

  function renderStoryboard(scene) {
    const root = $("#storyboard"); if (!root) return; root.replaceChildren();
    const production = productionFor(scene);
    const beatCount = production ? production.acts.length : 10;
    for (let actionIndex = 0; actionIndex < beatCount; actionIndex += 1) {
      const actInfo = production?.acts[actionIndex];
      const action = actInfo?.action || scene.actions[actionIndex] || `分鏡 ${actionIndex + 1}`;
      const button = document.createElement("button"); button.type = "button"; button.className = "story-beat"; button.dataset.number = production ? `幕${CHINESE_ACT_NUMBERS[actionIndex]}` : String(actionIndex + 1).padStart(2, "0"); button.title = actInfo ? `${actInfo.title}｜${action}` : action; button.setAttribute("aria-label", production ? `跳到第${CHINESE_ACT_NUMBERS[actionIndex]}幕：${actInfo.title}` : `跳到分鏡${actionIndex + 1}：${action}`);
      if (scene.image) {
        button.style.setProperty("--beat-image", `url('${scene.image}')`);
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
      const heading = document.createElement("strong"); heading.textContent = `${scene.id}｜${scene.title}`;
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
  function urlWithoutPlayer() { const url = new URL(window.location.href); url.searchParams.delete("scene"); url.searchParams.delete("reel"); return relativeUrl(url); }
  function setPlayerUrl(id, mode) { const url = new URL(window.location.href); url.hash = ""; url.searchParams.delete("scene"); url.searchParams.delete("reel"); if (mode === "reel") url.searchParams.set("reel", "1"); else url.searchParams.set("scene", id); window.history.replaceState({ scene: id, mode }, "", relativeUrl(url)); }

  function openCinema(id, mode = "single") {
    const scene = sceneById.get(id) || sceneById.get(FILM_ORDER[0]); if (!scene || !dialog) return;
    state.player.returnFocus = document.activeElement; state.player.returnUrl = urlWithoutPlayer(); state.player.mode = mode; state.player.sequence = mode === "reel" ? FILM_ORDER.map((filmId) => sceneById.get(filmId)).filter(Boolean) : [scene]; state.player.currentScene = null; state.player.currentBackdrop = 0;
    suspendAmbient();
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    scoreLibraryAudio?.pause();
    preloadSequence(state.player.sequence); renderActMarkers(); renderTranscript(); buildTimeline(); renderStep(0, true); setPlayerUrl(scene.id, mode); updatePlayButton(); animateCinemaEntrance(); $("#cinema-play-overlay")?.focus();
  }

  function animateCinemaEntrance() {
    if (!hasGSAP || state.reduced || !dialog?.open) return;
    const { gsap } = window;
    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .fromTo(".cinema-header, .source-ribbon, .cinema-audio-bar", { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .46, stagger: .055, clearProps: "transform,opacity,visibility" })
      .fromTo(stage, { scale: .985, autoAlpha: .25 }, { scale: 1, autoAlpha: 1, duration: .62, clearProps: "transform,opacity,visibility" }, "-=.3")
      .fromTo(".cinema-meta-row, .storyboard, .transcript", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .48, stagger: .06, clearProps: "transform,opacity,visibility" }, "-=.38")
      .fromTo(".cinema-control-dock", { autoAlpha: 0 }, { autoAlpha: 1, duration: .35, clearProps: "opacity,visibility" }, "-=.26");
  }
  function closeCinema() { pausePlayback(); destroyTimeline(); if (dialog?.open) dialog.close(); }
  function sceneShareUrl() { const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href; const url = new URL(canonical, window.location.href); if (state.player.mode === "reel") url.searchParams.set("reel", "1"); else if (state.player.currentScene) url.searchParams.set("scene", state.player.currentScene.id); return url.href; }
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
      revealBatch(".source-grid article, .scene-library-item, .visual-montage figure, .action-cards a", { y: 30, scale: .98 });
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

  function bindEvents() {
    $("#enter-experience")?.addEventListener("click", () => { if ($("#gate-reduced")?.checked) setReduced(true); enterSite("#top"); });
    $("#enter-reading")?.addEventListener("click", () => enterSite("#full-copy"));
    $("#gate-reduced")?.addEventListener("change", (event) => setReduced(event.target.checked)); motionToggle?.addEventListener("click", () => setReduced(!state.reduced)); navToggle?.addEventListener("click", () => setNavOpen(!state.navOpen));
    $$("a", nav).forEach((link) => link.addEventListener("click", () => setNavOpen(false))); window.addEventListener("resize", () => { if (window.innerWidth > 1120) setNavOpen(false); requestActorCalibration(); });
    window.addEventListener("scroll", () => { if (!readingProgressFrame) readingProgressFrame = window.requestAnimationFrame(updateReadingProgress); }, { passive: true });
    $("#hero-play-reel")?.addEventListener("click", () => openCinema(FILM_ORDER[0], "reel")); $("#play-full-reel")?.addEventListener("click", () => openCinema(FILM_ORDER[0], "reel"));
    $("#close-cinema")?.addEventListener("click", closeCinema); $("#share-cinema")?.addEventListener("click", shareCinema); $("#prev-beat")?.addEventListener("click", () => goToStep(state.player.stepIndex - 1)); $("#next-beat")?.addEventListener("click", () => goToStep(state.player.stepIndex + 1));
    $("#play-cinema")?.addEventListener("click", () => state.player.playing ? pausePlayback() : startPlayback()); $("#cinema-play-overlay")?.addEventListener("click", () => state.player.playing ? pausePlayback() : startPlayback()); dialogueBox?.addEventListener("click", () => goToStep(state.player.stepIndex + 1));
    $("#toggle-transcript")?.addEventListener("click", () => { if (!transcript) return; transcript.open = !transcript.open; syncTranscriptToggle(true); });
    transcript?.addEventListener("toggle", () => { syncTranscriptToggle(false); animateTranscriptOpen(transcript, ".transcript-scene"); });
    progressInput?.addEventListener("input", (event) => { if (!state.player.stepMeta.length) return; pausePlayback(); const ratio = Number(event.target.value) / 1000; if (state.player.timeline) { const time = ratio * state.player.timeline.duration(); state.player.timeline.pause(time, true); renderStep(stepAtTime(time), false); syncTimelineProgress(); } else goToStep(Math.round(ratio * (state.player.stepMeta.length - 1))); });
    dialog?.addEventListener("close", () => { pausePlayback(); destroyTimeline(); resetEffects(); document.body.style.overflow = ""; if (state.player.returnUrl) window.history.replaceState(null, "", state.player.returnUrl); state.player.returnUrl = null; const target = state.player.returnFocus; state.player.returnFocus = null; target?.focus?.({ preventScroll: true }); resumeAmbient(); });
    musicToggle?.addEventListener("click", toggleMusic);
    cinemaAudio?.addEventListener("loadedmetadata", () => syncSceneAudioToTimeline(true));
    ambientToggles.forEach((button) => button.addEventListener("click", toggleAmbient));
    ambientAudio?.addEventListener("play", refreshAmbientUi);
    ambientAudio?.addEventListener("pause", refreshAmbientUi);
    scoreLibraryButtons.forEach((button) => button.addEventListener("click", () => selectLibraryScore(button, true)));
    scoreLibraryAudio?.addEventListener("play", () => { cinemaAudio?.pause(); suspendAmbient(); });
    scoreLibraryAudio?.addEventListener("pause", () => { if (!dialog?.open) resumeAmbient(); });
    scoreLibraryAudio?.addEventListener("ended", () => { if (!dialog?.open) resumeAmbient(); });
    $$(".filter").forEach((button) => button.addEventListener("click", () => { $$(".filter").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); }); const filter = button.dataset.filter; $$(".scene-library-item", sceneGrid).forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.type !== filter)); window.setTimeout(() => window.ScrollTrigger?.refresh(), 60); }));
    document.addEventListener("keydown", (event) => { if (!dialog?.open) { if (event.key === "Escape") setNavOpen(false); return; } if (event.key === "ArrowRight") goToStep(state.player.stepIndex + 1); if (event.key === "ArrowLeft") goToStep(state.player.stepIndex - 1); if (event.key === " ") { event.preventDefault(); if (state.player.playing) pausePlayback(); else startPlayback(); } });
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

  function initDirectPlayer() {
    const params = new URLSearchParams(window.location.search); const sceneId = params.get("scene"); const reel = params.get("reel") === "1";
    if (reel || (sceneId && sceneById.has(sceneId))) { setPageGate(false); sessionStorage.setItem("kk-entered-v8", "true"); window.setTimeout(() => openCinema(reel ? FILM_ORDER[0] : sceneId, reel ? "reel" : "single"), 120); return true; }
    return false;
  }

  function init() {
    if (!scenes.length) { console.error("Scene registry was not loaded."); return; }
    const gated = sessionStorage.getItem("kk-entered-v8") !== "true";
    setPageGate(gated);
    refreshMotionUi(); refreshAmbientUi(); renderFilmActs(); renderSceneLibrary(); bindEvents(); updateReadingProgress(); loadInlineStory(); setupPageMotion();
    const directPlayer = initDirectPlayer();
    if (!directPlayer) { if (gated) playGateIntro(); else playPageIntro(); }
  }

  init();
})();
