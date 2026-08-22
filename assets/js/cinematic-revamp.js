(function () {
  "use strict";

  let frame = 0;

  function updateMobileSafetyShortcut() {
    frame = 0;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const threshold = Math.max(360, window.innerHeight * .72);
    document.body.classList.toggle(
      "show-help-fab",
      !isMobile || window.scrollY > threshold,
    );
  }

  function scheduleSafetyShortcutUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateMobileSafetyShortcut);
  }

  const core = document.createElement("script");
  core.src = "assets/js/cinematic-revamp-core.js?v=20260822-layout4";
  core.async = false;
  core.addEventListener("load", () => {
    updateMobileSafetyShortcut();
    window.addEventListener("scroll", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("resize", scheduleSafetyShortcutUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleSafetyShortcutUpdate, { passive: true });
  });
  core.addEventListener("error", () => {
    console.error("Cinematic experience core failed to load.");
  });
  document.head.append(core);
})();
