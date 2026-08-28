(function () {
  "use strict";

  const data = window.KAIKAI_EDITORIAL_DATA;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderTimeline() {
    const list = document.querySelector("#case-timeline");
    if (!list || !data?.timeline?.length) return;

    const fragment = document.createDocumentFragment();
    data.timeline.forEach((item) => {
      const entry = el("li");
      const date = el("time", "", item.label);
      date.dateTime = item.date;
      const marker = el("span", "timeline-marker");
      marker.setAttribute("aria-hidden", "true");
      const card = el("div");
      card.append(
        el("small", "", item.day),
        el("h4", "", item.title),
        el("p", "", item.summary),
        el("em", "", `界線｜${item.boundary}`)
      );
      entry.append(date, marker, card);
      fragment.append(entry);
    });
    list.replaceChildren(fragment);
    list.dataset.rendered = "true";
  }

  function renderEditorialDates() {
    if (!data) return;
    document.querySelectorAll("[data-status-checked]").forEach((node) => {
      node.textContent = `司法狀態核對至 ${data.statusCheckedLabel}`;
      node.setAttribute("datetime", data.statusCheckedAt);
    });
    document.querySelectorAll("[data-current-site-updated]").forEach((node) => {
      node.textContent = data.siteUpdatedAt.replaceAll("-", ".");
      node.setAttribute("datetime", data.siteUpdatedAt);
    });
  }

  function renderSourceLabels() {
    const list = document.querySelector("#source-label-key");
    if (!list || !data?.sourceLabels?.length) return;
    const fragment = document.createDocumentFragment();
    data.sourceLabels.forEach((item) => {
      const card = el("li");
      card.dataset.source = item.key;
      card.append(el("strong", "", item.label), el("span", "", item.note));
      fragment.append(card);
    });
    list.replaceChildren(fragment);
  }

  function renderGlossary() {
    const list = document.querySelector("#glossary-list");
    if (!list || !data?.glossary?.length) return;
    const fragment = document.createDocumentFragment();
    data.glossary.forEach((item, index) => {
      const details = el("details", "glossary-item");
      const summary = el("summary");
      summary.append(
        el("span", "glossary-number", String(index + 1).padStart(2, "0")),
        el("strong", "", item.term),
        el("small", "", item.kind)
      );
      const body = el("div", "glossary-body");
      body.append(el("p", "", item.definition));
      const source = el("a", "", `依據／界線：${item.source} ↗`);
      source.href = item.href;
      if (item.href.startsWith("http")) {
        source.target = "_blank";
        source.rel = "noopener noreferrer";
      }
      body.append(source);
      details.append(summary, body);
      fragment.append(details);
    });
    list.replaceChildren(fragment);
  }

  function reorderHomepage() {
    const main = document.querySelector("#main");
    if (!main) return;

    [
      ".ethics-strip",
      "#film-reel",
      "#case-progress",
      "#reading-map",
      "#full-copy",
      "#source-guide",
      "#materials-guide",
      "#glossary",
      "#responsibility-map",
      "#original-scores",
      "#production-boundaries",
      "#chapter-two-preview",
      "#action",
      "#version-history",
      ".visual-system"
    ].forEach((selector) => {
      const section = main.querySelector(selector);
      if (section) main.append(section);
    });
  }

  function init() {
    renderTimeline();
    renderEditorialDates();
    renderSourceLabels();
    renderGlossary();
    reorderHomepage();
    document.body.classList.add("editorial-home-v3");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
