(function(){
  "use strict";
  const VERSION="20260824-design-final-1";
  const SELECTOR=".copy-scene-group";
  const motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)");
  const ownedTweens=[];
  const ownedTriggers=[];
  let storyObserver=null;
  let bodyObserver=null;

  function isReduced(){
    let stored=false;
    try{stored=localStorage.getItem("kk-reduced-v8")==="true";}catch{}
    return motionQuery.matches||stored||document.body.classList.contains("is-reduced");
  }

  function markStages(root=document){
    root.querySelectorAll(SELECTOR).forEach((group)=>{
      group.dataset.designPolish=VERSION;
      group.dataset.hdStage="true";
      if(isReduced())group.style.setProperty("--stage-progress","1");
    });
  }

  function ownTween(tween){
    if(!tween)return tween;
    ownedTweens.push(tween);
    if(tween.scrollTrigger)ownedTriggers.push(tween.scrollTrigger);
    return tween;
  }

  function ownTrigger(trigger){
    if(trigger)ownedTriggers.push(trigger);
    return trigger;
  }

  function clearMotion(){
    while(ownedTweens.length){
      try{ownedTweens.pop().kill();}catch{}
    }
    while(ownedTriggers.length){
      try{ownedTriggers.pop().kill();}catch{}
    }
    document.querySelectorAll(SELECTOR).forEach((group)=>{
      delete group.dataset.stageProgressBound;
      group.style.setProperty("--stage-progress",isReduced()?"1":"0");
      const header=group.querySelector(":scope > header");
      if(header&&window.gsap)window.gsap.set(header.children,{clearProps:"transform,opacity,visibility,filter"});
    });
    document.querySelectorAll(".minnan-seal-field img").forEach((seal)=>{
      delete seal.dataset.scrollDrift;
      if(window.gsap)window.gsap.set(seal,{clearProps:"transform"});
    });
    const hero=document.querySelector(".hero");
    if(hero)delete hero.dataset.designDepth;
    if(window.gsap){
      const copy=hero?.querySelector(".hero-copy");
      const brief=hero?.querySelector(".hero-brief");
      if(copy)window.gsap.set(copy,{clearProps:"transform,opacity"});
      if(brief)window.gsap.set(brief,{clearProps:"transform,opacity"});
    }
  }

  function setupStageProgress(){
    if(isReduced()){
      document.querySelectorAll(SELECTOR).forEach((group)=>group.style.setProperty("--stage-progress","1"));
      return true;
    }
    if(!window.gsap||!window.ScrollTrigger)return false;
    window.gsap.registerPlugin(window.ScrollTrigger);
    document.querySelectorAll(SELECTOR).forEach((group)=>{
      if(group.dataset.stageProgressBound)return;
      group.dataset.stageProgressBound="1";
      ownTrigger(window.ScrollTrigger.create({
        trigger:group,
        start:"top 82%",
        end:"bottom 28%",
        scrub:true,
        onUpdate:self=>group.style.setProperty("--stage-progress",self.progress.toFixed(3))
      }));
      const header=group.querySelector(":scope > header");
      if(header){
        ownTween(window.gsap.from(header.children,{autoAlpha:0,y:18,duration:.72,stagger:.07,ease:"power2.out",scrollTrigger:{trigger:group,start:"top 84%",once:true}}));
      }
    });
    return true;
  }

  function setupSeals(){
    if(isReduced())return true;
    if(!window.gsap||!window.ScrollTrigger)return false;
    const seals=[...document.querySelectorAll(".minnan-seal-field img")].slice(0,6);
    seals.forEach((seal,index)=>{
      if(seal.dataset.scrollDrift)return;
      seal.dataset.scrollDrift="1";
      ownTween(window.gsap.to(seal,{yPercent:index%2?18:-18,rotation:`${index%2?'+=':'-='}${3+index}`,ease:"none",scrollTrigger:{trigger:document.body,start:"top top",end:"bottom bottom",scrub:1.8}}));
    });
    return true;
  }

  function setupHeroDepth(){
    if(isReduced())return true;
    if(!window.gsap||!window.ScrollTrigger)return false;
    const hero=document.querySelector(".hero");
    if(!hero||hero.dataset.designDepth)return true;
    hero.dataset.designDepth="1";
    const copy=hero.querySelector(".hero-copy");
    const brief=hero.querySelector(".hero-brief");
    if(copy)ownTween(window.gsap.to(copy,{yPercent:-7,opacity:.82,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1.25}}));
    if(brief)ownTween(window.gsap.to(brief,{yPercent:-12,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1.4}}));
    return true;
  }

  function refresh(){
    document.body.classList.add("chapter1-design-polish");
    markStages(document);
    window.ScrollTrigger?.refresh();
  }

  function bootMotion(attempt=0){
    clearMotion();
    markStages(document);
    const ready=setupStageProgress()&&setupSeals()&&setupHeroDepth();
    if(!ready&&attempt<40)setTimeout(()=>bootMotion(attempt+1),150);
    else window.ScrollTrigger?.refresh();
  }

  function syncMotion(){
    window.requestAnimationFrame(()=>bootMotion());
  }

  function boot(){
    refresh();
    bootMotion();
    const story=document.querySelector("#inline-story-content");
    if(story){
      storyObserver=new MutationObserver(()=>{
        markStages(story);
        if(isReduced())story.querySelectorAll(SELECTOR).forEach((group)=>group.style.setProperty("--stage-progress","1"));
        else setupStageProgress();
        window.ScrollTrigger?.refresh();
      });
      storyObserver.observe(story,{childList:true,subtree:true});
      setTimeout(()=>{storyObserver?.disconnect();storyObserver=null;},20000);
    }
    bodyObserver=new MutationObserver((records)=>{
      if(records.some((record)=>record.attributeName==="class"))syncMotion();
    });
    bodyObserver.observe(document.body,{attributes:true,attributeFilter:["class"]});
    if(typeof motionQuery.addEventListener==="function")motionQuery.addEventListener("change",syncMotion);
    else if(typeof motionQuery.addListener==="function")motionQuery.addListener(syncMotion);
    addEventListener("orientationchange",()=>setTimeout(()=>window.ScrollTrigger?.refresh(),250),{passive:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
