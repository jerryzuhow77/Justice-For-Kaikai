(function () {
  "use strict";

  const CHAPTER_TWO_VERSION = "chosen-life-v5";
  let frame = 0;

  // The opening poem is part of the experience, not a one-time notice.
  // Clear the old session flag before the core script decides whether to show it.
  try {
    sessionStorage.removeItem("kk-entered-v8");
  } catch {
    // Storage can be unavailable in strict privacy modes; the page remains usable.
  }

  function updateMobileSafetyShortcut() {
    frame = 0;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const threshold = Math.max(360, window.innerHeight * .72);
    document.body.classList.toggle("show-help-fab", !isMobile || window.scrollY > threshold);
  }

  function scheduleSafetyShortcutUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateMobileSafetyShortcut);
  }

  function previewMarkup() {
    return `
      <div class="chapter-two-choice-field" aria-hidden="true">
        <span>住在哪裡</span><span>由誰照顧</span><span>何時探望</span><span>是否安全</span>
        <i class="child-dot"></i>
      </div>
      <div class="chapter-two-inner section-shell">
        <p class="kicker chapter-two-kicker">NEXT CHAPTER · 第二章預告</p>
        <header class="chapter-two-heading">
          <span class="chapter-two-number" aria-hidden="true">02</span>
          <div>
            <h2 id="chapter-two-title">沒人要的孩子</h2>
            <p>孩子被選擇的人生</p>
          </div>
        </header>
        <div class="chapter-two-copy">
          <p class="preview-line preview-question">如果你的人生，從來不能自己選呢？</p>
          <p class="preview-line">不能選擇出生在哪一個家庭，不能選擇誰來照顧自己，也不能選擇今晚睡在哪裡。</p>
          <p class="preview-line">當大人談的是出養、托育、媒合、訪視與處遇，孩子真正經歷的，卻是每天醒來看見誰、哭的時候誰會來、害怕的時候能不能離開。</p>
          <p class="preview-line">他沒有坐在決定人生的桌子旁，卻承受每一個決定帶來的結果。</p>
          <blockquote class="chapter-two-thesis">
            <span>對大人而言，那也許只是一次決定。</span>
            <strong>對孩子而言——那就是他的人生。</strong>
          </blockquote>
          <p class="chapter-two-note">第二章不先從制度究責開始。我們把鏡頭降到孩子的高度，看大人如何一次次替他選擇，而一個還不能替自己決定的孩子，如何生活在那些選擇之中。</p>
          <p class="chapter-two-ethic">「沒人要」不是孩子的標籤。這一章追問的是：當所有人都能替一個孩子決定，他卻無法決定自己的人生，替他做選擇的大人，要如何確定那是一個安全的選擇？</p>
          <nav class="chapter-actions" aria-label="第二章預告導覽">
            <a href="#reading-map">回到閱讀地圖</a>
            <a href="story.html#chapter-two-preview">閱讀文字版預告</a>
            <a href="story.html#source-index">查看全部來源</a>
            <span aria-disabled="true">第二章製作中</span>
          </nav>
        </div>
      </div>`;
  }

  function ensureChapterTwoPreview() {
    const existing = document.querySelector("#chapter-two-preview");
    if (existing && !existing.closest("#inline-story-content")) return existing;

    const action = document.querySelector("#action");
    if (!action) return null;

    const section = document.createElement("section");
    section.id = "chapter-two-preview";
    section.className = "chapter-two-preview";
    section.dataset.chapterTwoVersion = CHAPTER_TWO_VERSION;
    section.setAttribute("aria-labelledby", "chapter-two-title");
    section.innerHTML = previewMarkup();
    action.before(section);
    return section;
  }

  function ensurePreviewNavigation() {
    const nav = document.querySelector("#main-nav");
    if (!nav || nav.querySelector('a[href="#chapter-two-preview"]')) return;
    const link = document.createElement("a");
    link.href = "#chapter-two-preview";
    link.textContent = "第二章預告";
    const localeLinks = nav.querySelector(".locale-links");
    if (localeLinks) nav.insertBefore(link, localeLinks);
    else nav.append(link);
  }

  function animateChapterTwoPreview() {
    const root = ensureChapterTwoPreview();
    if (!root) return;

    root.dataset.chapterTwoVersion = CHAPTER_TWO_VERSION;
    document.documentElement.dataset.chapterTwoPreview = CHAPTER_TWO_VERSION;
    ensurePreviewNavigation();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.body.classList.contains("is-reduced");
    if (reduced || !window.gsap || !window.ScrollTrigger || root.dataset.animated === "true") return;

    root.dataset.animated = "true";
    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.from(root.querySelectorAll(".chapter-two-kicker,.chapter-two-heading"), {
      opacity: 0,
      y: 44,
      duration: 1,
      stagger: .16,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 80%", once: true }
    });

    window.gsap.from(root.querySelectorAll(".preview-line,.chapter-two-thesis,.chapter-two-note,.chapter-two-ethic,.chapter-actions"), {
      opacity: 0,
      y: 30,
      filter: "blur(6px)",
      duration: .9,
      stagger: .15,
      ease: "power2.out",
      clearProps: "filter",
      scrollTrigger: { trigger: root.querySelector(".chapter-two-copy"), start: "top 84%", once: true }
    });

    window.gsap.fromTo(
      root.querySelectorAll(".chapter-two-choice-field span"),
      { opacity: 0, scale: .82 },
      {
        opacity: .72,
        scale: 1,
        duration: 1.1,
        stagger: .16,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 76%", once: true }
      }
    );

    const childDot = root.querySelector(".child-dot");
    if (childDot) {
      window.gsap.to(childDot, {
        scale: 1.16,
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }
  }

  function removeInlineDuplicate() {
    const story = document.querySelector("#inline-story-content");
    if (!story) return;

    const heading = story.querySelector("#chapter-two-preview,.chapter-two-story-heading");
    const preview = story.querySelector(".chapter-two-story-preview");
    if (heading) heading.remove();
    if (preview) preview.remove();
  }

  function watchInlineStory() {
    const story = document.querySelector("#inline-story-content");
    if (!story) return;

    removeInlineDuplicate();
    const observer = new MutationObserver(removeInlineDuplicate);
    observer.observe(story, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 12000);
  }

  // Mount readable content immediately. GSAP only enhances it later.
  ensureChapterTwoPreview();
  ensurePreviewNavigation();

  const core = document.createElement("script");
  core.src = "assets/js/cinematic-revamp-core.js?v=20260823-ch2-8";
  core.async = false;
  core.addEventListener("load", () => {
    updateMobileSafetyShortcut();
    animateChapterTwoPreview();
    watchInlineStory();
    window.addEventListener("scroll", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("resize", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleSafetyShortcutUpdate, { passive: true });
  });
  core.addEventListener("error", () => {
    console.error("Cinematic experience core failed to load.");
    animateChapterTwoPreview();
  });
  document.head.append(core);
})();