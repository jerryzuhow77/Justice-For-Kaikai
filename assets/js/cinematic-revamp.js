(function(){
  "use strict";
  const version="20260824-prologue-audio-1";
  const coreVersion="20260825-fm123-event-motion-3-home-2-ambient-1-character-art-clean-2";
  const directVersion="20260824-fmc-act4-direct-2-prologue-audio-1";
  const mobileQuery=matchMedia("(max-width:760px)");
  const mobileParts=[
    "assets/data/prologue/chair-maiden-mobile-v2-0.b64",
    "assets/data/prologue/chair-maiden-mobile-v2-1.b64",
    "assets/data/prologue/chair-maiden-mobile-v2-2.b64",
    "assets/data/prologue/chair-maiden-mobile-v2-3.b64"
  ];

  const load=(src,onload,onerror)=>{
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.onload=onload;
    script.onerror=onerror;
    document.head.append(script);
  };

  const ensureMobileStyle=()=>new Promise(resolve=>{
    const current=document.querySelector("link[data-chair-mobile-v2]");
    if(current){resolve();return;}
    const link=document.createElement("link");
    let settled=false;
    const finish=()=>{if(settled)return;settled=true;resolve();};
    link.rel="stylesheet";
    link.href=`assets/css/chair-prologue-mobile-v2-runtime.css?v=${version}`;
    link.dataset.chairMobileV2="1";
    link.onload=finish;
    link.onerror=finish;
    document.head.append(link);
    setTimeout(finish,1200);
  });

  const bootDesignPolish=()=>load(`assets/js/chapter1-design-polish.js?v=${version}`,null,()=>{});
  const bootLegacy=()=>load(`assets/js/cinematic-revamp-legacy.js?v=${coreVersion}`,()=>bootDesignPolish(),()=>bootDesignPolish());
  let started=false;

  const start=()=>{
    if(started)return;
    started=true;
    load(`assets/js/chair-prologue-refined.js?v=${directVersion}`,()=>{
      try{
        if(typeof window.initChairPrologueRefined==="function")window.initChairPrologueRefined();
      }finally{
        bootLegacy();
      }
    },bootLegacy);
  };

  const prepareMobileArtwork=async()=>{
    const pieces=await Promise.all(mobileParts.map(async path=>{
      const response=await fetch(`${path}?v=${version}`,{cache:"force-cache"});
      if(!response.ok)throw new Error(`Mobile prologue artwork failed: ${response.status}`);
      return (await response.text()).replace(/\s+/g,"");
    }));
    const base64=pieces.join("");
    if(base64.length<50000||!base64.startsWith("UklGR"))throw new Error("Mobile prologue artwork is incomplete");
    const binary=atob(base64);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);
    const objectUrl=URL.createObjectURL(new Blob([bytes],{type:"image/webp"}));
    window.__chairMobileArtObjectUrl=objectUrl;
    document.documentElement.style.setProperty("--chair-mobile-art",`url("${objectUrl}")`);
    document.documentElement.classList.add("chair-mobile-art-ready");
  };

  if(mobileQuery.matches){
    const fallbackTimer=setTimeout(start,2400);
    Promise.all([ensureMobileStyle(),prepareMobileArtwork()])
      .catch(error=>console.warn("[Chair prologue] portrait artwork fallback",error))
      .finally(()=>{
        clearTimeout(fallbackTimer);
        start();
      });
  }else{
    const preload=document.createElement("link");
    preload.rel="preload";
    preload.as="image";
    preload.href=`assets/img/prologue/chair-maiden-concept.webp?v=${version}`;
    preload.fetchPriority="high";
    preload.addEventListener("load",start,{once:true});
    preload.addEventListener("error",start,{once:true});
    document.head.append(preload);
    setTimeout(start,900);
  }
})();
