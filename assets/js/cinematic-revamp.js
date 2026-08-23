(function () {
  "use strict";

  let frame = 0;
  function updateMobileSafetyShortcut() {
    frame = 0;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const threshold = Math.max(360, window.innerHeight * .72);
    document.body.classList.toggle("show-help-fab", !isMobile || window.scrollY > threshold);
  }
  function scheduleSafetyShortcutUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateMobileSafetyShortcut);
  }

  function mountChapterTwoPreview() {
    if (document.querySelector("#chapter-two-preview")) return;
    const action = document.querySelector("#action");
    if (!action) return;
    const section = document.createElement("section");
    section.id = "chapter-two-preview";
    section.className = "chapter-two-preview";
    section.setAttribute("aria-labelledby", "chapter-two-title");
    section.innerHTML = `
      <div class="chapter-two-choice-field" aria-hidden="true">
        <span>住在哪裡</span><span>由誰照顧</span><span>何時探望</span><span>是否安全</span>
        <i class="child-dot"></i>
      </div>
      <div class="chapter-two-inner section-shell">
        <p class="kicker chapter-two-kicker">NEXT CHAPTER · 第二章預告</p>
        <header class="chapter-two-heading">
          <span class="chapter-two-number">02</span>
          <div><h2 id="chapter-two-title">沒人要的孩子</h2><p>孩子被選擇的人生</p></div>
        </header>
        <div class="chapter-two-copy">
          <p class="preview-line preview-question">如果你的人生，從來不能自己選呢？</p>
          <p class="preview-line">不能選擇出生在哪一個家庭，不能選擇誰來照顧自己，也不能選擇今晚睡在哪裡。</p>
          <p class="preview-line">當大人談的是出養、托育、媒合、訪視與處遇，孩子真正經歷的，卻是每天醒來看見誰、哭的時候誰會來、害怕的時候能不能離開。</p>
          <p class="preview-line">他沒有坐在決定人生的桌子旁，卻承受每一個決定帶來的結果。</p>
          <blockquote class="chapter-two-thesis"><span>對大人而言，那也許只是一次決定。</span><strong>對孩子而言——那就是他的人生。</strong></blockquote>
          <p class="chapter-two-note">第二章不先從制度究責開始。我們把鏡頭降到孩子的高度，看大人如何一次次替他選擇，而一個還不能替自己決定的孩子，如何生活在那些選擇之中。</p>
        </div>
      </div>`;
    action.before(section);

    const nav = document.querySelector("#main-nav");
    if (nav && !nav.querySelector('a[href="#chapter-two-preview"]')) {
      const link = document.createElement("a"); link.href = "#chapter-two-preview"; link.textContent = "第二章預告"; nav.append(link);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.from(section.querySelectorAll(".chapter-two-kicker,.chapter-two-heading"), {opacity:0,y:42,duration:1,stagger:.16,ease:"power3.out",scrollTrigger:{trigger:section,start:"top 78%"}});
      window.gsap.from(section.querySelectorAll(".preview-line,.chapter-two-thesis,.chapter-two-note"), {opacity:0,y:32,filter:"blur(7px)",duration:.9,stagger:.18,ease:"power2.out",scrollTrigger:{trigger:section.querySelector(".chapter-two-copy"),start:"top 82%"}});
      window.gsap.fromTo(section.querySelectorAll(".chapter-two-choice-field span"), {opacity:0,scale:.8},{opacity:.72,scale:1,duration:1.2,stagger:.2,ease:"power2.out",scrollTrigger:{trigger:section,start:"top 70%"}});
      window.gsap.to(section.querySelector(".child-dot"), {scale:1.18,duration:1.8,yoyo:true,repeat:-1,ease:"sine.inOut"});
    }
  }

  const core = document.createElement("script");
  core.src = "assets/js/cinematic-revamp-core.js?v=20260823-layout7";
  core.async = false;
  core.addEventListener("load", () => {
    updateMobileSafetyShortcut();
    mountChapterTwoPreview();
    window.addEventListener("scroll", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("resize", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleSafetyShortcutUpdate, { passive: true });
  });
  core.addEventListener("error", () => { console.error("Cinematic experience core failed to load."); mountChapterTwoPreview(); });
  document.head.append(core);
})();
