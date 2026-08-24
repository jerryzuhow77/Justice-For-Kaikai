(function(){
  "use strict";
  const VERSION="20260824-design-polish-1";
  const SELECTOR=".copy-scene-group";

  function addLibraryNote(){
    const section=document.querySelector("#scene-library");
    const heading=section?.querySelector(".section-heading");
    if(!section||!heading||section.querySelector(".library-layout-note"))return;
    const note=document.createElement("p");
    note.className="library-layout-note";
    note.textContent="此區改為場景索引與逐字稿資料庫；完整尺寸的皮影、側視與電影劇場已分散回各篇正文，避免同一段動畫在頁面重複佔據閱讀節奏。";
    heading.insertAdjacentElement("afterend",note);
  }

  function markStages(root=document){
    root.querySelectorAll(SELECTOR).forEach((group,index)=>{
      if(group.dataset.designPolish===VERSION)return;
      group.dataset.designPolish=VERSION;
      group.dataset.hdStage="true";
      const header=group.querySelector(":scope > header");
      if(header&&!header.querySelector(".hd-stage-badge")){
        const badge=document.createElement("i");
        badge.className="hd-stage-badge";
        badge.textContent=`HD STAGE ${String(index+1).padStart(2,"0")}`;
        badge.setAttribute("aria-hidden","true");
        header.append(badge);
      }
    });
  }

  function setupStageProgress(){
    if(!window.gsap||!window.ScrollTrigger)return false;
    window.gsap.registerPlugin(window.ScrollTrigger);
    document.querySelectorAll(SELECTOR).forEach((group)=>{
      if(group.dataset.stageProgressBound)return;
      group.dataset.stageProgressBound="1";
      window.ScrollTrigger.create({
        trigger:group,
        start:"top 82%",
        end:"bottom 28%",
        scrub:true,
        onUpdate:self=>group.style.setProperty("--stage-progress",self.progress.toFixed(3))
      });
      const header=group.querySelector(":scope > header");
      if(header){
        window.gsap.from(header.children,{autoAlpha:0,y:18,duration:.72,stagger:.07,ease:"power2.out",scrollTrigger:{trigger:group,start:"top 84%",once:true}});
      }
    });
    return true;
  }

  function setupSeals(){
    if(!window.gsap||!window.ScrollTrigger)return false;
    const seals=[...document.querySelectorAll(".minnan-seal-field img")].slice(0,6);
    seals.forEach((seal,index)=>{
      if(seal.dataset.scrollDrift)return;
      seal.dataset.scrollDrift="1";
      window.gsap.to(seal,{yPercent:index%2?18:-18,rotation:`${index%2?'+=':'-='}${3+index}`,ease:"none",scrollTrigger:{trigger:document.body,start:"top top",end:"bottom bottom",scrub:1.8}});
    });
    return true;
  }

  function setupHeroDepth(){
    if(!window.gsap||!window.ScrollTrigger)return false;
    const hero=document.querySelector(".hero");
    if(!hero||hero.dataset.designDepth)return true;
    hero.dataset.designDepth="1";
    const copy=hero.querySelector(".hero-copy");
    const brief=hero.querySelector(".hero-brief");
    if(copy)window.gsap.to(copy,{yPercent:-7,opacity:.82,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1.25}});
    if(brief)window.gsap.to(brief,{yPercent:-12,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1.4}});
    return true;
  }

  function refresh(){
    document.body.classList.add("chapter1-design-polish");
    addLibraryNote();
    markStages(document);
    if(window.ScrollTrigger)window.ScrollTrigger.refresh();
  }

  function bootMotion(attempt=0){
    const ready=setupStageProgress()&&setupSeals()&&setupHeroDepth();
    if(!ready&&attempt<40)setTimeout(()=>bootMotion(attempt+1),150);
  }

  function boot(){
    refresh();
    bootMotion();
    const story=document.querySelector("#inline-story-content");
    if(story){
      const observer=new MutationObserver(()=>{
        markStages(story);
        setupStageProgress();
        window.ScrollTrigger?.refresh();
      });
      observer.observe(story,{childList:true,subtree:true});
      setTimeout(()=>observer.disconnect(),20000);
    }
    addEventListener("orientationchange",()=>setTimeout(()=>window.ScrollTrigger?.refresh(),250),{passive:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
