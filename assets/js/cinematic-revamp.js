(function () {
  "use strict";

  const CHAPTER_TWO_VERSION = "chosen-life-v6";
  let frame = 0;

  try { sessionStorage.removeItem("kk-entered-v8"); } catch {}

  function updateMobileSafetyShortcut() {
    frame = 0;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const threshold = Math.max(360, window.innerHeight * .72);
    document.body.classList.toggle("show-help-fab", !isMobile || window.scrollY > threshold);
  }
  function scheduleSafetyShortcutUpdate() { if (!frame) frame = requestAnimationFrame(updateMobileSafetyShortcut); }

  function previewMarkup() {
    return `<div class="chapter-two-choice-field" aria-hidden="true"><span>住在哪裡</span><span>由誰照顧</span><span>何時探望</span><span>是否安全</span><i class="child-dot"></i></div><div class="chapter-two-inner section-shell"><p class="kicker chapter-two-kicker">NEXT CHAPTER · 第二章預告</p><header class="chapter-two-heading"><span class="chapter-two-number" aria-hidden="true">02</span><div><h2 id="chapter-two-title">沒人要的孩子</h2><p>孩子被選擇的人生</p></div></header><div class="chapter-two-copy"><p class="preview-line preview-question">如果你的人生，從來不能自己選呢？</p><p class="preview-line">不能選擇出生在哪一個家庭，不能選擇誰來照顧自己，也不能選擇今晚睡在哪裡。</p><p class="preview-line">當大人談的是出養、托育、媒合、訪視與處遇，孩子真正經歷的，卻是每天醒來看見誰、哭的時候誰會來、害怕的時候能不能離開。</p><p class="preview-line">他沒有坐在決定人生的桌子旁，卻承受每一個決定帶來的結果。</p><blockquote class="chapter-two-thesis"><span>對大人而言，那也許只是一次決定。</span><strong>對孩子而言——那就是他的人生。</strong></blockquote><p class="chapter-two-note">第二章不先從制度究責開始。我們把鏡頭降到孩子的高度，看大人如何一次次替他選擇，而一個還不能替自己決定的孩子，如何生活在那些選擇之中。</p><p class="chapter-two-ethic">「沒人要」不是孩子的標籤。這一章追問的是：當所有人都能替一個孩子決定，他卻無法決定自己的人生，替他做選擇的大人，要如何確定那是一個安全的選擇？</p><nav class="chapter-actions" aria-label="第二章預告導覽"><a href="#reading-map">回到閱讀地圖</a><a href="story.html#chapter-two-preview">閱讀文字版預告</a><a href="story.html#source-index">查看全部來源</a><span aria-disabled="true">第二章製作中</span></nav></div></div>`;
  }

  function ensureChapterTwoPreview() {
    const existing = document.querySelector("#chapter-two-preview");
    if (existing && !existing.closest("#inline-story-content")) return existing;
    const action = document.querySelector("#action"); if (!action) return null;
    const section = document.createElement("section"); section.id="chapter-two-preview"; section.className="chapter-two-preview"; section.dataset.chapterTwoVersion=CHAPTER_TWO_VERSION; section.setAttribute("aria-labelledby","chapter-two-title"); section.innerHTML=previewMarkup(); action.before(section); return section;
  }
  function ensurePreviewNavigation(){const nav=document.querySelector("#main-nav");if(!nav||nav.querySelector('a[href="#chapter-two-preview"]'))return;const link=document.createElement("a");link.href="#chapter-two-preview";link.textContent="第二章預告";const locale=nav.querySelector(".locale-links");locale?nav.insertBefore(link,locale):nav.append(link)}

  function animateChapterTwoPreview(){const root=ensureChapterTwoPreview();if(!root)return;root.dataset.chapterTwoVersion=CHAPTER_TWO_VERSION;document.documentElement.dataset.chapterTwoPreview=CHAPTER_TWO_VERSION;ensurePreviewNavigation();const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches||document.body.classList.contains("is-reduced");if(reduced||!window.gsap||!window.ScrollTrigger||root.dataset.animated==="true")return;root.dataset.animated="true";gsap.registerPlugin(ScrollTrigger);gsap.from(root.querySelectorAll(".chapter-two-kicker,.chapter-two-heading"),{opacity:0,y:44,duration:1,stagger:.16,ease:"power3.out",scrollTrigger:{trigger:root,start:"top 80%",once:true}});gsap.from(root.querySelectorAll(".preview-line,.chapter-two-thesis,.chapter-two-note,.chapter-two-ethic,.chapter-actions"),{opacity:0,y:30,filter:"blur(6px)",duration:.9,stagger:.15,ease:"power2.out",clearProps:"filter",scrollTrigger:{trigger:root.querySelector(".chapter-two-copy"),start:"top 84%",once:true}});gsap.fromTo(root.querySelectorAll(".chapter-two-choice-field span"),{opacity:0,scale:.82},{opacity:.72,scale:1,duration:1.1,stagger:.16,ease:"power2.out",scrollTrigger:{trigger:root,start:"top 76%",once:true}});const dot=root.querySelector(".child-dot");if(dot)gsap.to(dot,{scale:1.16,duration:1.8,yoyo:true,repeat:-1,ease:"sine.inOut"})}

  function removeInlineDuplicate(){const story=document.querySelector("#inline-story-content");if(!story)return;const heading=story.querySelector("#chapter-two-preview,.chapter-two-story-heading");const preview=story.querySelector(".chapter-two-story-preview");if(heading)heading.remove();if(preview)preview.remove()}
  function watchInlineStory(){const story=document.querySelector("#inline-story-content");if(!story)return;removeInlineDuplicate();const observer=new MutationObserver(()=>{removeInlineDuplicate();enhanceDistributedTheatre()});observer.observe(story,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),15000)}

  const OST_NAMES={"00":"序問｜石階雨滴","01":"第一篇｜沒有父母的孤兒","02":"第二篇｜沒有人回答的房間","03":"第三篇｜門外的人沒有來","04":"第四篇｜那些沒有被看見的日子","05":"第五篇｜燈熄以前","06":"第六篇｜名字留在紙上","07":"第七篇｜第一百一十五日","08":"第八篇｜穿過竹屋簷","09":"終章｜杉木上的晨光"};
  function renameOriginalScores(){document.querySelectorAll(".score-track-row,.score-track,.track-row,[data-score-track]").forEach(row=>{const text=row.textContent||"";const m=text.match(/(?:第\s*)?(0[0-9])(?:\s*篇)?/);if(m&&OST_NAMES[m[1]]){const candidates=row.querySelectorAll("strong,[data-track-label],.track-title");if(candidates.length)candidates[0].textContent=OST_NAMES[m[1]]}});document.querySelectorAll("strong,span,p").forEach(el=>{const t=el.textContent.trim();const m=t.match(/^第\s*(0[1-6])\s*篇原創配樂$/);if(m)el.textContent=OST_NAMES[m[1]]});}

  function refineHeroCopy(){const h=document.querySelector(".hero h1");if(h)h.innerHTML="一個孩子生命裡，<br><em>最後的一百一十五天。</em>";const title=document.querySelector("#film-reel-title");if(title)title.innerHTML="四段故事，最後都走向<br>同一扇沒有更早打開的門。"}

  function enhanceDistributedTheatre(){const story=document.querySelector("#inline-story-content");if(!story)return;const groups=[...story.querySelectorAll(".copy-scene-group")];if(!groups.length)return;groups.forEach((group,i)=>{if(group.dataset.cinematicEnhanced)return;group.dataset.cinematicEnhanced="true";group.dataset.chapterStage=String(i+1).padStart(2,"0");const cards=[...group.querySelectorAll(".copy-scene-card")];cards.forEach(card=>{const item=card.closest(".copy-scene-item");if(item)item.classList.toggle("is-hd-theatre",card.classList.contains("shadow")||card.classList.contains("side"));});if(window.gsap&&window.ScrollTrigger&&!document.body.classList.contains("is-reduced")){gsap.registerPlugin(ScrollTrigger);gsap.from(group,{opacity:0,y:70,duration:1.05,ease:"power3.out",scrollTrigger:{trigger:group,start:"top 88%",once:true}});cards.forEach((card,j)=>{const poster=card.querySelector(".copy-scene-poster");const actors=card.querySelectorAll(".copy-scene-actor");const meta=card.querySelector(".copy-scene-meta");if(poster)gsap.fromTo(poster,{scale:1.1},{scale:1,duration:1.8,ease:"power2.out",scrollTrigger:{trigger:card,start:"top 86%",once:true}});if(actors.length)gsap.from(actors,{opacity:0,y:36,x:(k)=>k===0?-26:26,scale:.94,duration:1.25,stagger:.12,ease:"power3.out",scrollTrigger:{trigger:card,start:"top 82%",once:true}});if(meta)gsap.from(meta,{opacity:0,y:24,duration:.8,delay:.12*j,ease:"power2.out",scrollTrigger:{trigger:card,start:"top 80%",once:true}});if(poster)gsap.to(poster,{yPercent:5,ease:"none",scrollTrigger:{trigger:card,start:"top bottom",end:"bottom top",scrub:1.2}})})}});ScrollTrigger.refresh()}

  ensureChapterTwoPreview();ensurePreviewNavigation();
  const core=document.createElement("script");core.src="assets/js/cinematic-revamp-core.js?v=20260823-ch2-8";core.async=false;core.addEventListener("load",()=>{updateMobileSafetyShortcut();animateChapterTwoPreview();watchInlineStory();refineHeroCopy();renameOriginalScores();setTimeout(()=>{renameOriginalScores();enhanceDistributedTheatre()},500);setTimeout(()=>{renameOriginalScores();enhanceDistributedTheatre()},1800);window.addEventListener("scroll",scheduleSafetyShortcutUpdate,{passive:true});window.addEventListener("resize",scheduleSafetyShortcutUpdate,{passive:true});window.addEventListener("orientationchange",scheduleSafetyShortcutUpdate,{passive:true})});core.addEventListener("error",()=>{console.error("Cinematic experience core failed to load.");animateChapterTwoPreview()});document.head.append(core);
})();