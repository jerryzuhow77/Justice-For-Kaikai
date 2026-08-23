(function(){
  "use strict";
  const base=window.initChairPrologueV2;
  if(typeof base!=="function") return;

  window.initChairPrologueV2=function(){
    base();
    const p=document.querySelector("#chair-maiden-prologue");
    if(!p||p.dataset.conceptEnhanced) return;
    p.dataset.conceptEnhanced="1";
    p.classList.add("chair-concept-prologue");

    const plane=document.createElement("div");
    plane.className="chair-scene-plane";
    plane.setAttribute("aria-hidden","true");
    plane.innerHTML=`
      <div class="chair-concept-plate"></div>
      <div class="chair-prologue-paper"></div>
      <div class="chair-prologue-bamboo"></div>
      <div class="chair-fog fog-a"></div><div class="chair-fog fog-b"></div>
      <div class="chair-dust"></div><div class="chair-lamp"></div>
      <div class="chair-women">
        <div class="chair-person-stage stage-left"><i class="chair-woman woman-left"></i></div>
        <div class="chair-person-stage stage-mid"><i class="chair-woman woman-mid"></i></div>
        <div class="chair-person-stage stage-right"><i class="chair-woman woman-right"></i></div>
      </div>
      <div class="chair-seat-stage"><div class="chair-seat"><i></i><b></b><span></span></div></div>`;
    p.prepend(plane);

    const title=p.querySelector(".chair-title");
    if(title){
      title.className="chair-prologue-label";
      title.innerHTML=`椅仔姑傳說<small>GSAP PROLOGUE</small>`;
    }
    const copy=p.querySelector(".chair-copy");
    if(copy){
      copy.classList.add("chair-prologue-copy");
      const group=document.createElement("div");
      group.className="chair-line-group";
      [...copy.querySelectorAll(".chair-line")].forEach(line=>group.append(line));
      copy.prepend(group);
    }
    p.querySelector(".scene-caption")?.remove();
    p.querySelector(".chair-scroll-mark")?.remove();

    if(!window.gsap) return;
    const q=s=>p.querySelector(s);
    const qa=s=>[...p.querySelectorAll(s)];
    const tweens=[];
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set(plane,{autoAlpha:0});
    gsap.set(q(".chair-concept-plate"),{transformOrigin:"50% 56%"});
    gsap.set(qa(".chair-person-stage"),{transformOrigin:"50% 82%"});
    gsap.set(q(".chair-seat-stage"),{transformOrigin:"50% 79%"});
    gsap.set(q(".chair-seat"),{transformOrigin:"50% 79%"});

    if(reduced){
      gsap.set(plane,{autoAlpha:1});
      gsap.set(q(".chair-progress i"),{scaleX:1});
      return;
    }

    const intro=gsap.timeline();
    intro
      .to(plane,{autoAlpha:1,duration:.72,ease:"power2.out"})
      .fromTo(q(".chair-concept-plate"),{scale:1.018,filter:"saturate(.58) contrast(1.02) brightness(.72)"},{scale:1.075,filter:"saturate(.72) contrast(1.08) brightness(.94)",duration:11.2,ease:"none"},0)
      .from(q(".stage-left"),{autoAlpha:0,x:-24,y:12,duration:1.4,ease:"power3.out"},.2)
      .from(q(".stage-mid"),{autoAlpha:0,x:-13,y:15,duration:1.35,ease:"power3.out"},.36)
      .from(q(".stage-right"),{autoAlpha:0,x:26,y:13,duration:1.45,ease:"power3.out"},.28)
      .from(q(".chair-seat-stage"),{autoAlpha:0,scale:.92,y:16,duration:1.5,ease:"power3.out"},.5)
      .to(q(".chair-seat-stage"),{rotation:-.72,y:-1,duration:.48,ease:"sine.inOut"},2.05)
      .to(q(".chair-seat-stage"),{rotation:.58,y:0,duration:.62,ease:"sine.inOut"},2.53)
      .to(q(".chair-seat-stage"),{rotation:-.16,duration:.42,ease:"sine.inOut"},3.15)
      .to(q(".chair-seat-stage"),{rotation:0,duration:.42,ease:"sine.inOut"},3.57)
      .to(q(".stage-right"),{x:-7,rotation:-.12,duration:1.35,ease:"sine.inOut"},4.12)
      .to(q(".stage-left"),{x:4,rotation:.1,duration:1.25,ease:"sine.inOut"},4.22)
      .to(q(".chair-seat-stage"),{rotation:.27,duration:.68,ease:"sine.inOut"},4.82)
      .to(q(".chair-seat-stage"),{rotation:-.15,duration:.68,ease:"sine.inOut"},5.5)
      .to(q(".chair-seat-stage"),{rotation:0,duration:.46,ease:"sine.inOut"},6.18)
      .to(qa(".chair-person-stage"),{opacity:.55,duration:1.2,ease:"sine.inOut"},6.66)
      .to(q(".chair-seat"),{filter:"saturate(.82) contrast(1.14) brightness(1.23) drop-shadow(0 30px 26px rgba(0,0,0,.78))",duration:1.15},6.7);
    tweens.push(intro);

    tweens.push(gsap.to(q(".chair-progress i"),{scaleX:1,duration:9.6,ease:"none"}));
    tweens.push(gsap.to(q(".fog-a"),{x:90,y:-8,duration:12,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".fog-b"),{x:-75,y:7,duration:15,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".chair-dust"),{backgroundPosition:"110px -90px, -80px -135px",duration:13,repeat:-1,ease:"none"}));
    tweens.push(gsap.to(q(".chair-prologue-bamboo"),{rotation:.24,x:5,duration:5.6,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".chair-lamp"),{opacity:.68,scale:1.05,duration:2.1,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".stage-left"),{y:-2,scaleY:1.004,duration:3.4,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".stage-mid"),{y:-1.5,scaleY:1.003,duration:3.8,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".stage-right"),{y:-2,scaleY:1.004,duration:3.2,repeat:-1,yoyo:true,ease:"sine.inOut"}));
    tweens.push(gsap.to(q(".chair-seat"),{scale:1.008,duration:2.9,repeat:-1,yoyo:true,ease:"sine.inOut",delay:6.4}));

    const observer=new MutationObserver(()=>{
      if(!p.isConnected){
        tweens.forEach(t=>t&&t.kill&&t.kill());
        observer.disconnect();
      }
    });
    observer.observe(document.body,{childList:true});
  };
})();
