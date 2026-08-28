(function () {
  "use strict";

  const version = "20260828-production-pass-1";
  const coreVersion = "20260828-paper-art-motion-2-production-pass-1-css-url-1";
  const animationMapVersion = "20260827-animation-map-2";
  const mobileQuery = matchMedia("(max-width:760px)");
  const mobileParts = [
    "assets/data/prologue/chair-maiden-mobile-v2-0.b64",
    "assets/data/prologue/chair-maiden-mobile-v2-1.b64",
    "assets/data/prologue/chair-maiden-mobile-v2-2.b64",
    "assets/data/prologue/chair-maiden-mobile-v2-3.b64"
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-lazy-src="${src}"]`);
      if (existing?.dataset.loaded === "true") { resolve(); return; }
      const script = existing || document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.lazySrc = src;
      script.addEventListener("load", () => { script.dataset.loaded = "true"; resolve(); }, { once: true });
      script.addEventListener("error", reject, { once: true });
      if (!existing) document.head.append(script);
    });
  }

  function loadStyle(href) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`link[data-lazy-href="${href}"]`);
      if (existing?.dataset.loaded === "true") { resolve(); return; }
      const link = existing || document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.lazyHref = href;
      link.addEventListener("load", () => { link.dataset.loaded = "true"; resolve(); }, { once: true });
      link.addEventListener("error", reject, { once: true });
      if (!existing) document.head.append(link);
    });
  }

  async function prepareMobileArtwork() {
    if (window.__chairMobileArtObjectUrl) return;
    const pieces = await Promise.all(mobileParts.map(async (path) => {
      const response = await fetch(`${path}?v=${version}`, { cache: "force-cache" });
      if (!response.ok) throw new Error(`Mobile prologue artwork failed: ${response.status}`);
      return (await response.text()).replace(/\s+/g, "");
    }));
    const base64 = pieces.join("");
    if (base64.length < 50000 || !base64.startsWith("UklGR")) throw new Error("Mobile prologue artwork is incomplete");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const objectUrl = URL.createObjectURL(new Blob([bytes], { type: "image/webp" }));
    window.__chairMobileArtObjectUrl = objectUrl;
    document.documentElement.style.setProperty("--chair-mobile-art", `url("${objectUrl}")`);
    document.documentElement.classList.add("chair-mobile-art-ready");
  }

  function releaseMobileArtwork() {
    if (window.__chairMobileArtObjectUrl) URL.revokeObjectURL(window.__chairMobileArtObjectUrl);
    delete window.__chairMobileArtObjectUrl;
    document.documentElement.style.removeProperty("--chair-mobile-art");
    document.documentElement.classList.remove("chair-mobile-art-ready");
  }

  async function prepareDesktopArtwork() {
    const image = new Image();
    image.decoding = "async";
    image.src = `assets/img/prologue/chair-maiden-concept.webp?v=${version}`;
    try { await image.decode(); }
    catch { /* The prologue keeps a dark fallback while the image finishes. */ }
  }

  let prologuePromise = null;
  window.playChairPrologue = function playChairPrologue() {
    if (prologuePromise) return prologuePromise;
    prologuePromise = (async () => {
      try {
        const styleTasks = [loadStyle(`assets/css/chair-prologue-refined.css?v=${version}`)];
        if (mobileQuery.matches) styleTasks.push(loadStyle(`assets/css/chair-prologue-mobile-v2-runtime.css?v=${version}`));
        await Promise.all([
          ...styleTasks,
          mobileQuery.matches ? prepareMobileArtwork() : prepareDesktopArtwork()
        ]);
        await loadScript(`assets/js/chair-prologue-refined.js?v=${version}`);
        if (typeof window.initChairPrologueRefined !== "function") return;
        await new Promise((resolve) => {
          const fallback = window.setTimeout(resolve, 15000);
          window.addEventListener("kaikai:prologue-finished", () => {
            window.clearTimeout(fallback);
            resolve();
          }, { once: true });
          window.initChairPrologueRefined();
        });
      } catch (error) {
        console.warn("[Chair prologue] lazy experience unavailable", error);
      } finally {
        releaseMobileArtwork();
      }
    })();
    return prologuePromise;
  };

  const bootDesignPolish = () => loadScript(`assets/js/chapter1-design-polish.js?v=${version}`).catch(() => {});
  loadScript(`assets/js/cinematic-revamp-legacy.js?v=${coreVersion}&map=${animationMapVersion}`)
    .then(bootDesignPolish)
    .catch(bootDesignPolish);
})();
