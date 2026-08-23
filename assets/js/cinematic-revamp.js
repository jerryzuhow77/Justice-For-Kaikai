(function(){
  "use strict";
  const version="20260823-prologue-v3";
  const load=(src,onload,onerror)=>{
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.onload=onload;
    script.onerror=onerror;
    document.head.append(script);
  };
  const bootLegacy=()=>load(`assets/js/cinematic-revamp-legacy.js?v=${version}`,null,()=>{});
  const start=()=>{
    try{
      if(typeof window.initChairPrologueV2==="function") window.initChairPrologueV2();
    }finally{
      bootLegacy();
    }
  };
  load(`assets/js/chair-prologue-v2.js?v=${version}`,()=>{
    load(`assets/js/chair-prologue-concept.js?v=${version}`,start,start);
  },bootLegacy);
})();
