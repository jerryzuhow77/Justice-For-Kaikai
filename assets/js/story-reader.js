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

  const buildAnimationTranscripts = async (container, status) => {
    if (container.dataset.ready) return;
    status.textContent = "正在載入24場動畫逐字稿……";
    try {
      await loadScript("assets/data/scenes.js?v=20260824-all-transcripts-1");
      await loadScript("assets/data/film-productions.js?v=20260824-all-transcripts-1");
      const scenes = Array.from(window.KAIKAI_SCENES || []);
      const labels = { film: "五幕電影", shadow: "皮影詩劇", side: "陰翳側視劇場" };
      const groups = ["film", "shadow", "side"];
      groups.forEach((type) => {
        const groupScenes = scenes.filter((scene) => scene.type === type);
        if (!groupScenes.length) return;
        const group = document.createElement("section"); group.className = "animation-transcript-group";
        const heading = document.createElement("h3"); heading.textContent = `${labels[type]}｜${groupScenes.length}場`;
        group.append(heading);
        groupScenes.forEach((scene, index) => {
          const lines = scene.production?.cues || scene.dialogue || [];
          const details = document.createElement("details"); details.className = "animation-transcript-item";
          const summary = document.createElement("summary");
          summary.innerHTML = `<span><b>${scene.id}</b>${scene.title}</span><small>${lines.length}段完整對話／場景說明</small>`;
          const body = document.createElement("div"); body.className = "animation-transcript-lines";
          lines.forEach((line) => {
            const row = document.createElement("p");
            const speaker = document.createElement("strong");
            const stamp = Number.isFinite(line.time) ? `${String(Math.floor(line.time / 60)).padStart(2,"0")}:${String(Math.round(line.time % 60)).padStart(2,"0")} · ` : "";
            speaker.textContent = `${stamp}${line.speaker || "旁白"}`;
            const text = document.createElement("span"); text.textContent = line.text || "";
            row.append(speaker, text); body.append(row);
          });
          details.append(summary, body); group.append(details);
        });
        container.append(group);
      });
      container.dataset.ready = "true";
      status.textContent = `已載入${scenes.length}場動畫完整逐字稿；點選各場標題展開或收合。`;
    } catch (error) {
      status.textContent = "逐字稿載入失敗，請重新整理頁面後再試。";
    }
  };

  if (document.documentElement.lang === "zh-Hant") {
    const transcriptSection = document.createElement("section");
    transcriptSection.className = "all-animation-transcripts";
    transcriptSection.id = "all-animation-transcripts";
    transcriptSection.innerHTML = '<h2>全部動畫完整逐字稿</h2><p>收錄四部五幕電影、十場皮影詩劇與十場陰翳側視劇場。為維持省流量模式，只有展開本區時才載入文字資料。</p>';
    const loader = document.createElement("details"); loader.className = "animation-transcript-loader";
    const summary = document.createElement("summary"); summary.innerHTML = '<span>展開24場動畫逐字稿</span><small>四部電影＋十場皮影＋十場陰翳側視</small>';
    const status = document.createElement("p"); status.className = "animation-transcript-status"; status.textContent = "尚未載入，展開後僅下載文字資料。";
    const container = document.createElement("div"); container.className = "animation-transcript-container";
    loader.append(summary, status, container); transcriptSection.append(loader);
    const sourceIndex = root.querySelector("#source-index");
    if (sourceIndex) sourceIndex.before(transcriptSection); else root.append(transcriptSection);
    loader.addEventListener("toggle", () => { if (loader.open) buildAnimationTranscripts(container, status); });
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
