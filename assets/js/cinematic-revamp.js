(function () {
  "use strict";

  const CHAPTER_TWO_VERSION = "chosen-life-v4";
  let frame = 0;
  let previewObserver = null;
  let previewFallbackTimer = null;

  function updateMobileSafetyShortcut() {
    frame = 0;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const threshold = Math.max(360, window.innerHeight * .72);
    document.body.classList.toggle("show-help-fab", !isMobile || window.scrollY > threshold);
  }

  function scheduleSafetyShortcutUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateMobileSafetyShortcut);
  }

  function previewBodyMarkup() {
    return `
      <div class="chapter-two-choice-field" aria-hidden="true">
        <span>住在哪裡</span><span>由誰照顧</span><span>何時探望</span><span>是否安全</span>
        <i class="child-dot"></i>
      </div>
      <div class="chapter-two-copy">
        <p class="chapter-two-subtitle">孩子被選擇的人生</p>
        <p class="preview-line preview-question">如果你的人生，從來不能自己選呢？</p>
        <p class="preview-line">不能選擇出生在哪一個家庭，不能選擇誰來照顧自己，也不能選擇今晚睡在哪裡。</p>
        <p class="preview-line">當大人談的是出養、托育、媒合、訪視與處遇，孩子真正經歷的，卻是每天醒來看見誰、哭的時候誰會來、害怕的時候能不能離開。</p>
        <p class="preview-line">他沒有坐在決定人生的桌子旁，卻承受每一個決定帶來的結果。</p>
        <blockquote class="chapter-two-thesis">
          <span>對大人而言，那也許只是一次決定。</span>
          <strong>對孩子而言——那就是他的人生。</strong>
        </blockquote>
        <p class="chapter-two-note">第二章不先從制度究責開始。我們把鏡頭降到孩子的高度，看大人如何一次次替他選擇，而一個還不能替自己決定的孩子，如何生活在那些選擇之中。</p>
        <nav class="chapter-actions" aria-label="第二章預告導覽">
          <a href="https://jerryzuhow77.github.io/child-advocacy-site/">回到護童行動聯盟</a>
          <a href="#reading-map">回到閱讀地圖</a>
          <a href="story.html#source-index">查看全部來源</a>
          <span aria-disabled="true">第二章製作中</span>
        </nav>
      </div>`;
  }

  function animatePreview(root) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !window.gsap || !window.ScrollTrigger || root.dataset.animated === "true") return;

    root.dataset.animated = "true";
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.from(root.querySelectorAll(".chapter-two-subtitle,.preview-question"), {
      opacity: 0,
      y: 34,
      duration: 1,
      stagger: .14,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 82%" }
    });
    window.gsap.from(root.querySelectorAll(".preview-line:not(.preview-question),.chapter-two-thesis,.chapter-two-note"), {
      opacity: 0,
      y: 28,
      filter: "blur(6px)",
      duration: .85,
      stagger: .15,
      ease: "power2.out",
      scrollTrigger: { trigger: root.querySelector(".chapter-two-copy"), start: "top 84%" }
    });
    window.gsap.fromTo(root.querySelectorAll(".chapter-two-choice-field span"),
      { opacity: 0, scale: .82 },
      { opacity: .72, scale: 1, duration: 1.1, stagger: .16, ease: "power2.out", scrollTrigger: { trigger: root, start: "top 76%" } }
    );
    const childDot = root.querySelector(".child-dot");
    if (childDot) window.gsap.to(childDot, { scale: 1.16, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  function ensurePreviewNav() {
    const nav = document.querySelector("#main-nav");
    if (!nav || nav.querySelector('a[href="#chapter-two-preview"]')) return;
    const link = document.createElement("a");
    link.href = "#chapter-two-preview";
    link.textContent = "第二章預告";
    const localeLinks = nav.querySelector(".locale-links");
    if (localeLinks) nav.insertBefore(link, localeLinks);
    else nav.append(link);
  }

  function removeOldPreviewContent(heading) {
    const headingLevel = Number(heading.tagName.slice(1));
    let node = heading.nextElementSibling;
    while (node) {
      const isHeading = /^H[1-6]$/.test(node.tagName);
      const nodeLevel = isHeading ? Number(node.tagName.slice(1)) : 99;
      if (isHeading && nodeLevel <= headingLevel) break;
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
  }

  function upgradeInlineChapterTwoPreview() {
    const story = document.querySelector("#inline-story-content");
    if (!story) return false;

    const headings = [...story.querySelectorAll("h2,h3,h4,h5,h6")];
    const heading = headings.find((item) => /進入第二章|沒人要的孩子/.test(item.textContent || ""));
    if (!heading) return false;

    if (heading.dataset.chapterTwoVersion === CHAPTER_TWO_VERSION) {
      ensurePreviewNav();
      return true;
    }

    document.querySelector("#chapter-two-preview-fallback")?.remove();
    removeOldPreviewContent(heading);

    heading.id = "chapter-two-preview";
    heading.classList.add("chapter-two-inline-heading");
    heading.dataset.chapterTwoVersion = CHAPTER_TWO_VERSION;
    heading.textContent = "進入第二章｜沒人要的孩子";

    const preview = document.createElement("section");
    preview.className = "chapter-two-inline-preview";
    preview.dataset.chapterTwoVersion = CHAPTER_TWO_VERSION;
    preview.setAttribute("aria-label", "第二章預告：孩子被選擇的人生");
    preview.innerHTML = previewBodyMarkup();
    heading.after(preview);

    ensurePreviewNav();
    animatePreview(preview);
    document.documentElement.dataset.chapterTwoPreview = CHAPTER_TWO_VERSION;
    return true;
  }

  function mountFallbackPreview() {
    if (document.querySelector("#chapter-two-preview") || document.querySelector("#chapter-two-preview-fallback")) return;
    const action = document.querySelector("#action");
    if (!action) return;

    const section = document.createElement("section");
    section.id = "chapter-two-preview-fallback";
    section.className = "chapter-two-preview chapter-two-preview-fallback";
    section.setAttribute("aria-labelledby", "chapter-two-fallback-title");
    section.innerHTML = `
      <div class="chapter-two-choice-field" aria-hidden="true">
        <span>住在哪裡</span><span>由誰照顧</span><span>何時探望</span><span>是否安全</span>
        <i class="child-dot"></i>
      </div>
      <div class="chapter-two-inner section-shell">
        <p class="kicker chapter-two-kicker">NEXT CHAPTER · 第二章預告</p>
        <header class="chapter-two-heading">
          <span class="chapter-two-number">02</span>
          <div><h2 id="chapter-two-fallback-title">沒人要的孩子</h2><p>孩子被選擇的人生</p></div>
        </header>
        ${previewBodyMarkup()}
      </div>`;
    action.before(section);
    ensurePreviewNav();
    animatePreview(section);
  }

  function observeChapterTwoPreview() {
    if (upgradeInlineChapterTwoPreview()) return;
    const target = document.querySelector("#inline-story-content") || document.body;
    previewObserver?.disconnect();
    previewObserver = new MutationObserver(() => {
      if (upgradeInlineChapterTwoPreview()) {
        previewObserver?.disconnect();
        previewObserver = null;
        if (previewFallbackTimer) window.clearTimeout(previewFallbackTimer);
      }
    });
    previewObserver.observe(target, { childList: true, subtree: true });
    previewFallbackTimer = window.setTimeout(() => {
      if (!upgradeInlineChapterTwoPreview()) mountFallbackPreview();
    }, 4500);
  }

  const core = document.createElement("script");
  core.src = "assets/js/cinematic-revamp-core.js?v=20260823-ch2-4";
  core.async = false;
  core.addEventListener("load", () => {
    updateMobileSafetyShortcut();
    observeChapterTwoPreview();
    window.addEventListener("scroll", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("resize", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleSafetyShortcutUpdate, { passive: true });
  });
  core.addEventListener("error", () => {
    console.error("Cinematic experience core failed to load.");
    observeChapterTwoPreview();
    mountFallbackPreview();
  });
  document.head.append(core);
})();
