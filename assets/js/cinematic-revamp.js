(function(){
  "use strict";
  const version="20260823-prologue-refined-v2";
  const load=(src,onload,onerror)=>{
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.onload=onload;
    script.onerror=onerror;
    document.head.append(script);
  };
  const bootLegacy=()=>load(`assets/js/cinematic-revamp-legacy.js?v=${version}`,null,()=>{});
  let started=false;
  const start=()=>{
    if(started)return;
    started=true;
    load(`assets/js/chair-prologue-refined.js?v=${version}`,()=>{
      try{
        if(typeof window.initChairPrologueRefined==="function")window.initChairPrologueRefined();
      }finally{
        bootLegacy();
      }
    },bootLegacy);
  };
  const preload=document.createElement("link");
  preload.rel="preload";
  preload.as="image";
  preload.href=`assets/img/prologue/chair-maiden-concept.webp?v=${version}`;
  preload.fetchPriority="high";
  preload.addEventListener("load",start,{once:true});
  preload.addEventListener("error",start,{once:true});
  document.head.append(preload);
  setTimeout(start,900);
})();
