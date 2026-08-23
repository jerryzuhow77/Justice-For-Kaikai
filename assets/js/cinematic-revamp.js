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
  const preload=document.createElement("link");
  preload.rel="preload";
  preload.as="image";
  preload.href=`assets/img/prologue/chair-maiden-concept.webp?v=${version}`;
  preload.fetchPriority="high";
  document.head.append(preload);
  const bootLegacy=()=>load(`assets/js/cinematic-revamp-legacy.js?v=${version}`,null,()=>{});
  load(`assets/js/chair-prologue-refined.js?v=${version}`,()=>{
    try{
      if(typeof window.initChairPrologueRefined==="function")window.initChairPrologueRefined();
    }finally{
      bootLegacy();
    }
  },bootLegacy);
})();
