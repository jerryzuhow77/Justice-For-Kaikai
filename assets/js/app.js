(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const typeLabels = { shadow: "皮影詩劇", side: "陰翳側視劇場", film: "電影式動畫" };
  const scenes = (window.KAIKAI_SCENES || []).slice();
  const order = window.KAIKAI_SCENE_ORDER || scenes.map((scene) => scene.id);
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const hasGSAP = Boolean(window.gsap);

  if (hasGSAP) {
    document.documentElement.classList.add("has-gsap");
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
  }

  const MOTION_POSES = [
    { f: [-18, 0, -2, .98, -3, 10, -12], m: [18, 0, 2, 1, 2, 12, -10] },
    { f: [14, -3, 2, 1, 5, 18, -62], m: [-4, 6, -1, .99, -2, 8, -16] },
    { f: [38, 0, -1, .97, -6, 16, -22], m: [-22, 0, -3, 1, 4, 58, -8] },
    { f: [10, 20, 5, .96, 11, 35, -18], m: [-46, 2, 0, 1, -5, 14, -32] },
    { f: [56, -2, -4, 1, -4, 12, 74], m: [-58, -2, 4, 1, 4, 74, -12] },
    { f: [68, 14, 6, .96, 7, 48, -20], m: [-68, 14, -6, .96, -7, 18, -50] },
    { f: [30, -4, -8, 1, -8, 72, -14], m: [-22, 2, 8, 1, 8, 22, -46] },
    { f: [-10, 26, 5, .95, 7, 18, -38], m: [10, 30, -5, .95, -12, 46, -16] },
    { f: [-46, 0, -4, 1, -5, 42, -20], m: [46, 0, 4, 1, 5, 42, -20] },
    { f: [-76, -2, 0, 1, 8, 14, -12], m: [76, -2, 0, 1, -8, 12, -14] }
  ];

  const SHADOW_POSE_ROOT = "public/media/poses";
  const SIDE_POSE_ROOT = "assets/img/actors/side";
  const posePlanCache = new Map();

  const state = {
    scene: null,
    step: 0,
    timer: null,
    playing: false,
    reduced: localStorage.getItem("kk-reduced") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    timeline: null,
    stepTimes: [],
    pageMedia: null
  };

  const dialog = $("#scene-dialog");
  const stage = $("#stage");
  const stageBg = $("#stage-bg");
  const stageProp = $("#stage-prop");
  const stagePaper = $(".stage-paper", stage);
  const stageAtmosphere = $("#stage-atmosphere");
  const stageFocusLight = $("#stage-focus-light");
  const stageRedThread = $("#stage-red-thread");
  const actorFemale = $(".actor-female", stage);
  const actorMale = $(".actor-male", stage);
  const actorFemaleImage = $("#actor-female-image", stage);
  const actorMaleImage = $("#actor-male-image", stage);
  const curtainLeft = $(".curtain-left", stage);
  const curtainRight = $(".curtain-right", stage);
  const dialogueBox = $("#dialogue-box");
  const sceneGrid = $("#scene-grid");
  const progressInput = $("#timeline-progress");
  const timelineTime = $("#timeline-time");

  function enterSite(target = "#top") {
    document.body.classList.remove("is-gated");
    sessionStorage.setItem("kk-entered", "true");
    window.setTimeout(() => {
      const targetElement = $(target);
      targetElement?.focus?.({ preventScroll: true });
      if (target !== "#top") targetElement?.scrollIntoView?.({ behavior: state.reduced ? "auto" : "smooth", block: "start" });
      window.ScrollTrigger?.refresh();
    }, 160);
  }

  if (sessionStorage.getItem("kk-entered") === "true") document.body.classList.remove("is-gated");

  function refreshMotionButton() {
    const button = $("#motion-toggle");
    button?.setAttribute("aria-pressed", String(state.reduced));
    if (button) button.textContent = state.reduced ? "低動態" : "動態";
    if ($("#gate-reduced")) $("#gate-reduced").checked = state.reduced;
  }

  document.body.classList.toggle("is-reduced", state.reduced);
  refreshMotionButton();

  $("#enter-site")?.addEventListener("click", () => {
    if ($("#gate-reduced").checked) setReduced(true);
    enterSite("#top");
  });
  $("#enter-reading")?.addEventListener("click", () => {
    enterSite("#full-copy");
  });
  $("#gate-reduced")?.addEventListener("change", (event) => setReduced(event.target.checked));
  $("#motion-toggle")?.addEventListener("click", () => setReduced(!state.reduced));
  $("#sound-toggle")?.addEventListener("click", (event) => {
    event.currentTarget.textContent = "待掛曲";
    event.currentTarget.title = "保留六首原創音樂與音景掛載槽；收到音檔後可依時間軸標籤精準對應。";
  });

  function setReduced(enabled) {
    state.reduced = enabled;
    document.body.classList.toggle("is-reduced", enabled);
    localStorage.setItem("kk-reduced", String(enabled));
    refreshMotionButton();
    pausePlayback();
    if (enabled) {
      destroyTimeline();
      stage?.classList.remove("is-gsap");
      teardownPageMotion();
      if (state.scene) renderStep(state.step, true);
    } else {
      setupPageMotion();
      if (state.scene && dialog?.open) {
        stage.classList.toggle("is-gsap", hasGSAP);
        buildTimeline(state.scene);
        goToStep(state.step);
      }
    }
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
    if (/線|繡線|布帶|線結|結繩/.test(text)) return sex === "female" ? (side ? 7 : 5) : (side ? 7 : 10);
    if (/燈|提燈|舉燈|亮起|微光/.test(text)) return sex === "female" ? (side ? 5 : 3) : (side ? 6 : 9);
    if (/卷|頁|表|紀錄|文件|姓名|來源|信紙|判決|筆|核對|資料/.test(text)) return sex === "female" ? (side ? 4 : 6) : (side ? (actionIndex > 6 ? 10 : 3) : (actionIndex > 6 ? 10 : 4));
    if (/聽|側耳|交頭|回看|回望/.test(text)) return sex === "female" ? (side ? 3 : 2) : (side ? 4 : 3);
    if (/走|入場|離席|靠近|前行|退到|穿過/.test(text)) return sex === "female" ? (side ? 2 : 1) : 2;
    if (/扶|觸摸|按住|放下|校準|接住/.test(text)) return sex === "female" ? (side ? 6 : 6) : (side ? 9 : 8);
    if (/印章|停筆|擋住|停止/.test(text)) return sex === "female" ? (side ? 8 : 1) : (side ? 5 : 1);
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
    if (actorFemaleImage?.getAttribute("src") !== femaleSrc) actorFemaleImage.src = femaleSrc;
    if (actorMaleImage?.getAttribute("src") !== maleSrc) actorMaleImage.src = maleSrc;
    actorFemale.dataset.poseAsset = String(femalePose);
    actorMale.dataset.poseAsset = String(malePose);
  }

  function preloadActorSet(scene) {
    if (!scene || scene.type === "film") return;
    ["female", "male"].forEach((sex) => {
      actorPosePlan(scene, sex).forEach((pose) => {
        const image = new Image();
        image.src = poseAsset(scene, sex, pose);
      });
    });
  }

  async function loadInlineStory() {
    const target = $("#inline-story-content");
    const nav = $("#copy-chapter-nav");
    if (!target || !nav) return;
    try {
      const response = await fetch("story.html", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const documentCopy = new DOMParser().parseFromString(await response.text(), "text/html");
      const source = $(".story-content", documentCopy);
      if (!source) throw new Error("完整文案節點不存在");
      source.querySelectorAll("a[download]").forEach((link) => link.remove());
      target.replaceChildren(...Array.from(source.childNodes).map((node) => node.cloneNode(true)));
      target.removeAttribute("aria-busy");
      nav.replaceChildren();
      const headings = $$("h2, h3", target);
      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `copy-heading-${index + 1}`;
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        nav.append(link);
      });
      if (!headings.length) nav.textContent = "完整正文";
      window.ScrollTrigger?.refresh();
    } catch (error) {
      target.removeAttribute("aria-busy");
      target.innerHTML = `<p>完整文案暫時無法嵌入本頁。請改用 <a href="story.html">純文字閱讀模式</a>。</p>`;
      nav.textContent = "載入失敗";
      console.error("Inline story load failed", error);
    }
  }

  function createBadges() {
    const field = $(".badge-field");
    if (!field) return;
    for (let i = 0; i < 12; i += 1) {
      const img = document.createElement("img");
      img.className = "badge-deco";
      img.alt = "";
      img.src = `assets/img/badges/minnan-${String(i + 1).padStart(2, "0")}.webp`;
      img.loading = "lazy";
      img.style.top = `${2 + i * 8.15}%`;
      img.style.left = i % 2 ? "auto" : `${-7 + (i % 3) * 2}%`;
      img.style.right = i % 2 ? `${-8 + (i % 4) * 1.5}%` : "auto";
      img.style.setProperty("--rot", `${(i % 2 ? 1 : -1) * (4 + i * 3)}deg`);
      img.style.width = `clamp(260px, ${24 + (i % 4) * 3}vw, 560px)`;
      field.append(img);
    }
  }

  function createCard(scene, position) {
    const card = document.createElement("button");
    card.className = `scene-card ${scene.type}`;
    card.type = "button";
    card.dataset.type = scene.type;
    card.dataset.sceneId = scene.id;
    card.setAttribute("aria-label", `播放${typeLabels[scene.type]} ${scene.id} ${scene.title}`);
    const imageStyle = scene.image ? ` style="background-image:url('${scene.image}')"` : "";
    card.innerHTML = `
      <span class="card-image"${imageStyle}></span>
      <span class="card-shade"></span>
      <span class="card-badge">${typeLabels[scene.type]}</span>
      <span class="card-play" aria-hidden="true">播放</span>
      <span class="card-meta">
        <span class="card-code">${String(position + 1).padStart(2, "0")} / 24 · ${scene.id} · ${scene.chapter}</span>
        <h3>${scene.title}</h3>
        <p>${scene.subtitle}</p>
      </span>`;
    card.addEventListener("click", () => openScene(scene.id));
    return card;
  }

  function renderSceneGrid() {
    if (!sceneGrid) return;
    const fragment = document.createDocumentFragment();
    order.forEach((id, index) => {
      const scene = sceneById.get(id);
      if (scene) fragment.append(createCard(scene, index));
    });
    sceneGrid.append(fragment);
  }

  $$(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".filter").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      const filter = button.dataset.filter;
      $$(".scene-card").forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.type !== filter));
      window.setTimeout(() => window.ScrollTrigger?.refresh(), 80);
    });
  });

  function setupPageMotion() {
    if (!hasGSAP || !window.ScrollTrigger || state.reduced || state.pageMedia) return;
    const { gsap } = window;
    state.pageMedia = gsap.matchMedia();
    state.pageMedia.add({ desktop: "(min-width: 681px)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      if (!context.conditions.motion || state.reduced) return undefined;
      gsap.fromTo(".hero-image", { scale: 1.015 }, {
        scale: context.conditions.desktop ? 1.1 : 1.045,
        yPercent: context.conditions.desktop ? 4 : 1.5,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .75 }
      });
      window.ScrollTrigger.batch(".scene-card", {
        start: "top 92%",
        once: true,
        onEnter: (batch) => gsap.fromTo(batch, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: .85, stagger: .08, ease: "power3.out", clearProps: "opacity,visibility,transform" })
      });
      gsap.from(".stats-band article", {
        y: 24,
        autoAlpha: 0,
        duration: .7,
        stagger: .1,
        scrollTrigger: { trigger: ".stats-band", start: "top 88%", once: true }
      });
      gsap.utils.toArray(".visual-board figure").forEach((figure, index) => {
        gsap.from(figure, {
          x: index % 2 ? 38 : -38,
          autoAlpha: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: figure, start: "top 90%", once: true }
        });
      });
      return () => undefined;
    });
  }

  function teardownPageMotion() {
    state.pageMedia?.revert();
    state.pageMedia = null;
  }

  function totalSteps(scene) {
    return Math.max(10, scene.dialogue.length);
  }

  function actionIndexFor(scene, step) {
    return Math.min(9, Math.floor((step / totalSteps(scene)) * 10));
  }

  function dialogueIndexFor(scene, step) {
    return Math.min(scene.dialogue.length - 1, Math.floor((step / totalSteps(scene)) * scene.dialogue.length));
  }

  function stepDuration(scene, step) {
    const line = scene.dialogue[dialogueIndexFor(scene, step)];
    return Math.max(3.2, Math.min(8.4, 2.55 + line.text.length * .036));
  }

  function filmTarget(scene, actionIndex) {
    if (scene.id === "FM-C") {
      const twoWorldShots = [
        [116, 50, 50], [128, 24, 47], [136, 74, 49], [146, 51, 45], [123, 67, 42],
        [139, 36, 53], [126, 54, 62], [148, 42, 58], [132, 79, 50], [118, 50, 49]
      ];
      const [size, x, y] = twoWorldShots[actionIndex];
      return { size: `${size}% auto`, position: `${x}% ${y}%` };
    }
    const panelShots = [
      [442, 2, 43], [498, 7, 52], [454, 28, 45], [486, 37, 53], [430, 54, 46],
      [510, 62, 55], [448, 71, 43], [492, 82, 51], [462, 94, 45], [520, 99, 54]
    ];
    const [size, x, y] = panelShots[actionIndex];
    return { size: `${size}% auto`, position: `${x}% ${y}%` };
  }

  function backgroundTarget(scene, actionIndex) {
    if (scene.type === "film") return filmTarget(scene, actionIndex);
    if (scene.type === "side") {
      return {
        size: window.innerWidth < 680 ? "auto 112%" : "auto 116%",
        position: `${42 + (actionIndex - 4.5) * 2.1}% ${48 + ((actionIndex % 3) - 1) * 3}%`
      };
    }
    return { size: "108% auto", position: "50% 50%" };
  }

  function renderStep(step, staticVisuals = false) {
    const scene = state.scene;
    if (!scene) return;
    const total = totalSteps(scene);
    state.step = Math.max(0, Math.min(total - 1, step));
    const actionIndex = actionIndexFor(scene, state.step);
    const line = scene.dialogue[dialogueIndexFor(scene, state.step)];
    setActorSprites(scene, actionIndex);
    stage.dataset.pose = String(actionIndex);
    stage.dataset.type = scene.type;
    stage.dataset.scene = scene.id;
    $("#frame-counter").textContent = `${String(actionIndex + 1).padStart(2, "0")} / 10`;
    $("#shot-number").textContent = `分鏡 ${String(actionIndex + 1).padStart(2, "0")}`;
    $("#shot-action").textContent = scene.actions[actionIndex];
    $("#speaker").textContent = line.speaker;
    $("#dialogue-text").textContent = line.text;
    stageProp.textContent = scene.prop;
    $$(".story-beat", $("#storyboard")).forEach((beat, index) => beat.classList.toggle("is-current", index === actionIndex));
    if (staticVisuals || !hasGSAP || state.reduced) applyStaticVisuals(scene, actionIndex);
    if (!state.timeline) syncFallbackProgress();
  }

  function poseTargets(scene, actionIndex) {
    const pose = MOTION_POSES[actionIndex];
    const ratio = scene.type === "side" ? .72 : 1;
    const target = (values) => ({ x: values[0] * ratio, y: values[1] * ratio, rotation: values[2], scale: values[3] * (scene.type === "side" ? .94 : 1) });
    return { female: target(pose.f), male: target(pose.m) };
  }

  function setActorPose(actor, target) {
    if (!hasGSAP || !actor) return;
    const { gsap } = window;
    gsap.set(actor, { x: target.x, y: target.y, rotation: target.rotation, scale: target.scale });
  }

  function applyStaticVisuals(scene, actionIndex) {
    const bg = backgroundTarget(scene, actionIndex);
    stageBg.style.backgroundSize = bg.size;
    stageBg.style.backgroundPosition = bg.position;
    stageRedThread.style.transform = `scaleX(${.08 + actionIndex * .095})`;
    if (!hasGSAP) return;
    const { gsap } = window;
    const poses = poseTargets(scene, actionIndex);
    if (scene.type !== "film") {
      setActorPose(actorFemale, poses.female);
      setActorPose(actorMale, poses.male);
    }
    gsap.set(stageFocusLight, { xPercent: (actionIndex - 4.5) * 10, opacity: .18 + (actionIndex % 3) * .05 });
    gsap.set(stageAtmosphere, { xPercent: (actionIndex - 4.5) * -1.6, yPercent: ((actionIndex % 3) - 1) * 1.2 });
    gsap.set(stageProp, { x: (actionIndex - 4.5) * 5, y: ((actionIndex % 3) - 1) * 5, rotation: (actionIndex % 2 ? 1 : -1) * 1.2 });
    if (scene.type === "shadow") {
      gsap.set(curtainLeft, { xPercent: actionIndex === 9 ? -28 : -96 });
      gsap.set(curtainRight, { xPercent: actionIndex === 9 ? 28 : 96 });
    }
  }

  function animateActor(timeline, actor, target, at, duration) {
    timeline.to(actor, { x: target.x, y: target.y, rotation: target.rotation, scale: target.scale, duration, ease: "power2.inOut" }, at);
    timeline.fromTo($("img", actor), { autoAlpha: .28, scale: .965, yPercent: 1.4 }, { autoAlpha: 1, scale: 1, yPercent: 0, duration: Math.min(.72, duration * .45), ease: "power2.out", immediateRender: false }, at);
  }

  function animateShot(timeline, scene, step, at, beatDuration) {
    const actionIndex = actionIndexFor(scene, step);
    const travel = Math.min(2.2, beatDuration * .48);
    const bg = backgroundTarget(scene, actionIndex);
    const poses = poseTargets(scene, actionIndex);
    timeline.to(stageBg, { backgroundSize: bg.size, backgroundPosition: bg.position, scale: scene.type === "shadow" ? 1 + (actionIndex % 3) * .008 : 1.015 + (actionIndex % 2) * .012, filter: `saturate(${scene.type === "film" ? .72 : .62}) contrast(1.06) brightness(${.78 + (actionIndex % 3) * .025})`, duration: travel, ease: "power2.inOut" }, at);
    if (scene.type !== "film") {
      animateActor(timeline, actorFemale, poses.female, at, Math.min(1.65, travel));
      animateActor(timeline, actorMale, poses.male, at, Math.min(1.72, travel));
    }
    timeline.to(stageProp, { x: (actionIndex - 4.5) * 5, y: ((actionIndex % 3) - 1) * 5, rotation: (actionIndex % 2 ? 1 : -1) * 1.2, autoAlpha: scene.type === "film" ? 0 : .7, duration: travel, ease: "sine.inOut" }, at);
    timeline.to(stageAtmosphere, { xPercent: (actionIndex - 4.5) * -1.6, yPercent: ((actionIndex % 3) - 1) * 1.2, opacity: .25 + (actionIndex % 4) * .035, duration: beatDuration, ease: "none" }, at);
    timeline.to(stageFocusLight, { xPercent: (actionIndex - 4.5) * 10, opacity: .18 + (actionIndex % 3) * .05, duration: travel, ease: "sine.inOut" }, at);
    timeline.to(stagePaper, { xPercent: (actionIndex % 2 ? 1 : -1) * 1.2, opacity: .11 + (actionIndex % 3) * .025, duration: beatDuration, ease: "none" }, at);
    timeline.to(stageRedThread, { scaleX: .08 + actionIndex * .095, opacity: actionIndex === 9 ? .7 : .42, duration: travel, ease: "power2.out" }, at);
    timeline.fromTo(dialogueBox, { autoAlpha: .42, y: 13 }, { autoAlpha: 1, y: 0, duration: .48, ease: "power2.out", immediateRender: false }, at);
    timeline.fromTo($("#frame-counter"), { scale: .88, autoAlpha: .5 }, { scale: 1, autoAlpha: 1, duration: .36, immediateRender: false }, at);
    if (scene.type === "shadow" && step === 0) {
      timeline.fromTo(curtainLeft, { xPercent: 0 }, { xPercent: -96, duration: 1.35, ease: "power3.inOut", immediateRender: false }, at);
      timeline.fromTo(curtainRight, { xPercent: 0 }, { xPercent: 96, duration: 1.35, ease: "power3.inOut", immediateRender: false }, at);
    }
    if (scene.type === "shadow" && step === totalSteps(scene) - 1) {
      timeline.to(curtainLeft, { xPercent: -28, duration: Math.min(1.7, beatDuration * .55), ease: "power2.inOut" }, at + Math.max(.7, beatDuration * .34));
      timeline.to(curtainRight, { xPercent: 28, duration: Math.min(1.7, beatDuration * .55), ease: "power2.inOut" }, at + Math.max(.7, beatDuration * .34));
    }
  }

  function buildTimeline(scene) {
    destroyTimeline();
    if (!hasGSAP || state.reduced) return;
    const { gsap } = window;
    const timeline = gsap.timeline({ paused: true });
    const total = totalSteps(scene);
    let cursor = 0;
    state.stepTimes = [];
    stage.classList.add("is-gsap");
    for (let step = 0; step < total; step += 1) {
      const duration = stepDuration(scene, step);
      state.stepTimes.push(cursor);
      timeline.addLabel(`step-${step}`, cursor);
      timeline.call(() => renderStep(step, false), null, cursor);
      animateShot(timeline, scene, step, cursor, duration);
      timeline.to({}, { duration }, cursor);
      cursor += duration;
    }
    timeline.eventCallback("onUpdate", syncTimelineProgress);
    timeline.eventCallback("onComplete", () => {
      state.playing = false;
      updatePlayButton();
      syncTimelineProgress();
    });
    state.timeline = timeline;
    syncTimelineProgress();
  }

  function destroyTimeline() {
    state.timeline?.kill();
    state.timeline = null;
    state.stepTimes = [];
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const rounded = Math.max(0, Math.round(seconds));
    return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
  }

  function syncTimelineProgress() {
    if (!state.timeline) return;
    const total = state.timeline.duration() || 1;
    const value = Math.round((state.timeline.time() / total) * 1000);
    progressInput.value = String(value);
    progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`);
    timelineTime.textContent = `${formatTime(state.timeline.time())} / ${formatTime(total)}`;
  }

  function syncFallbackProgress() {
    if (!state.scene) return;
    const total = totalSteps(state.scene);
    const value = total <= 1 ? 0 : Math.round((state.step / (total - 1)) * 1000);
    progressInput.value = String(value);
    progressInput.setAttribute("aria-valuetext", `${Math.round(value / 10)}%`);
    timelineTime.textContent = `${String(state.step + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }

  function stepAtTime(time) {
    let found = 0;
    state.stepTimes.forEach((start, index) => { if (start <= time + .001) found = index; });
    return found;
  }

  function renderStoryboard(scene) {
    const board = $("#storyboard");
    board.replaceChildren();
    for (let index = 0; index < 10; index += 1) {
      const beat = document.createElement("button");
      beat.type = "button";
      beat.className = "story-beat";
      beat.dataset.number = String(index + 1).padStart(2, "0");
      beat.title = scene.actions[index];
      beat.setAttribute("aria-label", `跳到分鏡${index + 1}：${scene.actions[index]}`);
      if (scene.type === "film") {
        const target = filmTarget(scene, index);
        beat.style.backgroundImage = `linear-gradient(rgba(8,12,11,.08),rgba(8,12,11,.38)),url('${scene.image}')`;
        beat.style.backgroundSize = `cover, ${target.size}`;
        beat.style.backgroundPosition = `center, ${target.position}`;
      } else {
        const female = poseAsset(scene, "female", actorPosePlan(scene, "female")[index]);
        const male = poseAsset(scene, "male", actorPosePlan(scene, "male")[index]);
        const background = scene.image ? `url('${scene.image}')` : "radial-gradient(ellipse at center, #655b3e, #17120e 72%)";
        beat.style.backgroundImage = `linear-gradient(rgba(8,12,11,.08),rgba(8,12,11,.5)),url('${female}'),url('${male}'),${background}`;
        beat.style.backgroundSize = "cover, 42% 78%, 42% 78%, cover";
        beat.style.backgroundPosition = `center, ${10 + index * 1.4}% 84%, ${90 - index * 1.4}% 84%, ${44 + (index - 4.5) * 2}% 50%`;
        beat.style.backgroundRepeat = "no-repeat";
      }
      beat.addEventListener("click", () => goToStep(Math.round((index / 9) * (totalSteps(scene) - 1))));
      board.append(beat);
    }
  }

  function renderTranscript(scene) {
    const body = $("#transcript-body");
    body.replaceChildren();
    scene.dialogue.forEach((line) => {
      const p = document.createElement("p");
      const speaker = document.createElement("b");
      const text = document.createElement("span");
      speaker.textContent = line.id ? `${line.speaker} · ${line.id}` : line.speaker;
      text.textContent = line.text;
      p.append(speaker, text);
      body.append(p);
    });
  }

  function resetStageInline() {
    if (!hasGSAP) return;
    const { gsap } = window;
    const targets = [stageBg, stageProp, stagePaper, stageAtmosphere, stageFocusLight, stageRedThread, actorFemale, actorMale, actorFemaleImage, actorMaleImage, curtainLeft, curtainRight, dialogueBox, $("#frame-counter")];
    gsap.set(targets, { clearProps: "transform,opacity,visibility,filter,backgroundPosition,backgroundSize" });
  }

  function openScene(id) {
    const scene = sceneById.get(id);
    if (!scene) return;
    pausePlayback();
    destroyTimeline();
    resetStageInline();
    state.scene = scene;
    state.step = 0;
    $("#scene-type").textContent = `${typeLabels[scene.type]} · ${scene.id} · 第${scene.chapter}篇`;
    $("#scene-title").textContent = scene.title;
    $("#scene-subtitle").textContent = scene.subtitle;
    $("#scene-source").textContent = scene.source;
    stageBg.style.backgroundImage = scene.image ? `url('${scene.image}')` : "none";
    preloadActorSet(scene);
    renderStoryboard(scene);
    renderTranscript(scene);
    $("#transcript").hidden = true;
    $("#toggle-transcript").setAttribute("aria-expanded", "false");
    renderStep(0, true);
    dialog.showModal();
    document.body.style.overflow = "hidden";
    stage.classList.toggle("is-gsap", hasGSAP && !state.reduced);
    buildTimeline(scene);
    goToStep(0);
    $("#close-player").focus();
  }

  function closeScene() {
    pausePlayback();
    destroyTimeline();
    if (dialog.open) dialog.close();
    document.body.style.overflow = "";
  }

  function goToStep(step) {
    if (!state.scene) return;
    pausePlayback();
    const total = totalSteps(state.scene);
    const target = Math.max(0, Math.min(total - 1, step));
    if (state.timeline) state.timeline.pause(state.stepTimes[target] || 0, true);
    renderStep(target, true);
    syncTimelineProgress();
  }

  function stepScene(direction) {
    goToStep(state.step + direction);
  }

  function scheduleNext() {
    if (!state.playing || !state.scene) return;
    state.timer = window.setTimeout(() => {
      if (state.step >= totalSteps(state.scene) - 1) {
        state.playing = false;
        updatePlayButton();
        return;
      }
      state.step += 1;
      renderStep(state.step, true);
      scheduleNext();
    }, stepDuration(state.scene, state.step) * 1000);
  }

  function updatePlayButton() {
    const button = $("#play-scene");
    if (!button) return;
    button.textContent = state.playing ? "暫停" : "播放";
    button.setAttribute("aria-pressed", String(state.playing));
  }

  function startPlayback() {
    if (state.reduced || !state.scene) return;
    state.playing = true;
    updatePlayButton();
    if (state.timeline) {
      if (state.timeline.progress() >= .999) {
        state.timeline.pause(0, true);
        renderStep(0, false);
      }
      state.timeline.play();
    } else {
      scheduleNext();
    }
  }

  function pausePlayback() {
    window.clearTimeout(state.timer);
    state.timer = null;
    state.timeline?.pause();
    state.playing = false;
    updatePlayButton();
  }

  $("#close-player")?.addEventListener("click", closeScene);
  dialog?.addEventListener("close", () => {
    pausePlayback();
    destroyTimeline();
    document.body.style.overflow = "";
  });
  $("#prev-beat")?.addEventListener("click", () => stepScene(-1));
  $("#next-beat")?.addEventListener("click", () => stepScene(1));
  $("#play-scene")?.addEventListener("click", () => state.playing ? pausePlayback() : startPlayback());
  $("#dialogue-box")?.addEventListener("click", () => stepScene(1));
  $("#toggle-transcript")?.addEventListener("click", (event) => {
    const panel = $("#transcript");
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) panel.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "nearest" });
  });
  progressInput?.addEventListener("input", (event) => {
    if (!state.scene) return;
    pausePlayback();
    const ratio = Number(event.target.value) / 1000;
    if (state.timeline) {
      const time = ratio * state.timeline.duration();
      state.timeline.pause(time, true);
      renderStep(stepAtTime(time), false);
      syncTimelineProgress();
    } else {
      goToStep(Math.round(ratio * (totalSteps(state.scene) - 1)));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!dialog?.open) return;
    if (event.key === "ArrowRight") stepScene(1);
    if (event.key === "ArrowLeft") stepScene(-1);
    if (event.key === " ") {
      event.preventDefault();
      state.playing ? pausePlayback() : startPlayback();
    }
  });

  createBadges();
  renderSceneGrid();
  loadInlineStory();
  setupPageMotion();

  const hashScene = new URLSearchParams(window.location.search).get("scene");
  if (hashScene && sceneById.has(hashScene)) {
    enterSite();
    window.setTimeout(() => openScene(hashScene), 160);
  }
})();
