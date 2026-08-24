(function () {
  "use strict";
  const root = document.querySelector(".story-content");
  const header = document.querySelector(".story-header");
  if (!root || !header) return;

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
