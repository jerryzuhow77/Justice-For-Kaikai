(function () {
  "use strict";

  function reorderHomepage() {
    const main = document.querySelector("#main");
    if (!main) return;

    const selectors = [
      "#case-progress",
      "#reading-map",
      "#responsibility-map",
      "#full-copy",
      "#film-reel",
      "#source-guide",
      "#production-boundaries",
      ".visual-system",
      "#original-scores",
      "#chapter-two-preview",
      "#action",
      "#version-history"
    ];

    selectors.forEach((selector) => {
      const section = main.querySelector(selector);
      if (section) main.append(section);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reorderHomepage, { once: true });
  } else {
    reorderHomepage();
  }
})();
