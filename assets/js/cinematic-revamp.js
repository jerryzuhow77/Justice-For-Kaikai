(function(){
  "use strict";
  const version="20260823-prologue-v2";
  const load=(src,onload,onerror)=>{
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.onload=onload;
    script.onerror=onerror;
    document.head.append(script);
  };
  const bootLegacy=()=>load(`assets/js/cinematic-revamp-legacy.js?v=${version}`,null,()=>{});
  load(`assets/js/chair-prologue-v2.js?v=${version}`,()=>{
    try{
      if(typeof window.initChairPrologueV2==="function") window.initChairPrologueV2();
    }finally{
      bootLegacy();
    }
  },bootLegacy);
})();
