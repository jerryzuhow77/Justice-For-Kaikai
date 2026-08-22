(function () {
  "use strict";

  const current = document.currentScript?.src || new URL("assets/js/app.js", document.baseURI).href;
  const base = current.slice(0, current.lastIndexOf("/") + 1);
  const version = "20260822-2";
  window.KaikaiFilmAssetBase = base;

  function loadScript(file) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${base}${file}?v=${version}`;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${file}`));
      document.head.append(script);
    });
  }

  async function inflate(path) {
    const response = await fetch(`${base}${path}.bin?v=${version}`);
    if (!response.ok || !response.body) throw new Error(`Unable to load ${path}`);
    const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  async function loadCompressedStyle(path) {
    const style = document.createElement("style");
    style.dataset.kaikaiFilmStyle = path;
    style.textContent = await inflate(path);
    document.head.append(style);
  }

  async function loadCompressedScript(path) {
    const script = document.createElement("script");
    script.dataset.kaikaiFilmModule = path;
    script.textContent = await inflate(path);
    document.head.append(script);
  }

  loadScript("app-core.js")
    .then(async () => {
      if (!("DecompressionStream" in window)) return;
      window.KaikaiFilmCssReady = Promise.all([
        loadCompressedStyle("../css/film-sequence-feature.css"),
        loadCompressedStyle("../css/film-sequence-player.css"),
      ]);
      await window.KaikaiFilmCssReady;
      for (const module of [
        "film-sequence-model.js",
        "film-sequence-view.js",
        "film-sequence-render.js",
        "film-sequence-player.js",
      ]) await loadCompressedScript(module);
    })
    .catch((error) => console.error("Justice for Kaikai runtime failed to load", error));
})();
