(function () {
  "use strict";
  const root = document.querySelector(".story-content");
  const header = document.querySelector(".story-header");
  if (!root || !header) return;

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src^="${src}"]`);
    if (existing) { if (window.KAIKAI_SCENES) resolve(); else existing.addEventListener("load", resolve, { once: true }); return; }
    const script = document.createElement("script");
    script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script);
  });

  let scenePromise;
  const getScenes = () => {
    if (scenePromise) return scenePromise;
    scenePromise = (async () => {
      await loadScript("assets/data/scenes.js?v=20260825-fm123-event-motion-3");
      await loadScript("assets/data/film-productions.js?v=20260825-fm123-event-motion-3");
      return new Map(Array.from(window.KAIKAI_SCENES || []).map((scene) => [scene.id, scene]));
    })();
    return scenePromise;
  };

  const createTranscriptItem = (scene) => {
    const lines = scene.production?.cues || scene.dialogue || [];
    const labels = { film: "五幕電影", shadow: "皮影詩劇", side: "陰翳側視劇場" };
    const order = Array.from(window.KAIKAI_SCENE_ORDER || []);
    const publicIndex = order.indexOf(scene.id);
    const publicLabel = publicIndex >= 0 ? `${String(publicIndex + 1).padStart(2, "0")} / ${String(order.length).padStart(2, "0")}` : "動畫";
    const details = document.createElement("details"); details.className = `animation-transcript-item ${scene.type}`;
    const summary = document.createElement("summary");
    summary.innerHTML = `<span><b>${publicLabel}</b>${scene.title}</span><small>${labels[scene.type]} · ${lines.length}段完整對話／場景說明</small>`;
    const body = document.createElement("div"); body.className = "animation-transcript-lines";
    lines.forEach((line) => {
      const row = document.createElement("p");
      const speaker = document.createElement("strong");
      const stamp = Number.isFinite(line.time) ? `${String(Math.floor(line.time / 60)).padStart(2,"0")}:${String(Math.round(line.time % 60)).padStart(2,"0")} · ` : "";
      speaker.textContent = `${stamp}${line.speaker || "旁白"}`;
      const text = document.createElement("span"); text.textContent = line.text || "";
      row.append(speaker, text); body.append(row);
    });
    details.append(summary, body);
    return details;
  };

  const buildChapterTranscripts = async (container, status, sceneIds) => {
    if (container.dataset.ready) return;
    status.textContent = "正在載入本章動畫逐字稿……";
    try {
      const sceneMap = await getScenes();
      const storyOrder = Array.from(window.KAIKAI_SCENE_ORDER || []);
      sceneIds.map((id) => sceneMap.get(id)).filter(Boolean).sort((a, b) => storyOrder.indexOf(a.id) - storyOrder.indexOf(b.id)).forEach((scene) => container.append(createTranscriptItem(scene)));
      container.dataset.ready = "true";
      status.textContent = `本章共${container.children.length}場動畫；點選各場標題展開或收合。`;
    } catch (error) {
      status.textContent = "逐字稿載入失敗，請重新整理頁面後再試。";
    }
  };

  if (document.documentElement.lang === "zh-Hant") {
    const placements = [
      ["古老的傳說綁在椅子上的孩子", ["FM-A", "SP00", "DV00", "SP01", "DV01"]],
      ["當孩子必須離開原來的家", ["SP02", "DV02"]],
      ["越來越多求救進入制度", ["SP03", "DV03"]],
      ["隔著布簾的急診記憶", ["SP04", "DV04"]],
      ["從一紙修法開始兒福聯盟的誕生", ["SP05", "DV05"]],
      ["珮珮另一間病房裡的孩子", ["SP06", "DV06"]],
      ["從珮珮到剴剴制度留下的接縫", ["SP07", "DV07"]],
      ["外婆的眼淚第二章前夜", ["FM-D", "FM-B", "SP08", "DV08"]],
      ["普通清晨", ["FM-C", "SP09", "DV09"]]
    ];
    placements.forEach(([headingId, sceneIds], chapterIndex) => {
      const heading = document.getElementById(headingId);
      if (!heading) return;
      const section = document.createElement("aside"); section.className = "chapter-animation-transcripts";
      const loader = document.createElement("details"); loader.className = "animation-transcript-loader";
      const summary = document.createElement("summary");
      summary.innerHTML = `<span>本章動畫完整逐字稿</span><small>${sceneIds.length}場 · 點擊展開</small>`;
      const status = document.createElement("p"); status.className = "animation-transcript-status"; status.textContent = "尚未載入；展開後僅下載文字資料。";
      const container = document.createElement("div"); container.className = "animation-transcript-container";
      loader.append(summary, status, container); section.append(loader); heading.insertAdjacentElement("afterend", section);
      loader.addEventListener("toggle", () => { if (loader.open) buildChapterTranscripts(container, status, sceneIds); });
    });
  }

  const progress = document.createElement("span");
  progress.className = "story-reading-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<i></i>";
  header.append(progress);

  const headings = Array.from(root.querySelectorAll(":scope > h2, :scope > h3"));
  if (headings.length) {
    const toc = document.createElement("details");
    toc.className = "story-toc";
    const summary = document.createElement("summary");
    summary.innerHTML = "<span>本頁閱讀目錄</span><small>快速前往章節與段落</small>";
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "本頁閱讀目錄");
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `story-section-${index + 1}`;
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.className = heading.tagName === "H2" ? "is-major" : "is-minor";
      link.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      link.addEventListener("click", () => { if (matchMedia("(max-width: 700px)").matches) toc.open = false; });
      nav.append(link);
    });
    toc.append(summary, nav);
    root.insertBefore(toc, root.querySelector("#title-block-header")?.nextSibling || root.firstChild);
  }

  document.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector(":scope > summary");
    if (!summary) return;
    const sync = () => summary.setAttribute("aria-expanded", String(details.open));
    sync(); details.addEventListener("toggle", sync);
  });

  const top = document.createElement("a");
  top.className = "story-back-top";
  top.href = "#top";
  top.textContent = "返回頁首 ↑";
  top.setAttribute("aria-label", "返回省流量文字版頁首");
  document.body.append(top);
  if (!document.getElementById("top")) document.body.id = "top";

  let frame = 0;
  const update = () => {
    frame = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const ratio = Math.min(1, Math.max(0, scrollY / max));
    progress.style.setProperty("--story-progress", ratio);
    top.classList.toggle("is-visible", scrollY > innerHeight * .75);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  update();
})();
