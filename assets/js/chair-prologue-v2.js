(function(){
  "use strict";

  function sceneMarkup(isMobile){
    const preserve=isMobile?"xMidYMid meet":"xMidYMid slice";
    return `
      <div class="chair-stage" aria-hidden="true">
        <svg class="chair-scene" viewBox="0 0 1600 900" preserveAspectRatio="${preserve}" role="img" aria-label="清代婦女們在幽暗古宅中望向中央竹椅">
          <defs>
            <linearGradient id="cp-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171d1a"/><stop offset=".48" stop-color="#101512"/><stop offset="1" stop-color="#080b09"/></linearGradient>
            <linearGradient id="cp-floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#171711"/><stop offset="1" stop-color="#060706"/></linearGradient>
            <linearGradient id="cp-robe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#252723"/><stop offset=".55" stop-color="#131714"/><stop offset="1" stop-color="#090c0a"/></linearGradient>
            <linearGradient id="cp-robe-warm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2b2421"/><stop offset=".58" stop-color="#171413"/><stop offset="1" stop-color="#090b09"/></linearGradient>
            <radialGradient id="cp-lamp" cx="50%" cy="50%" r="50%"><stop stop-color="#f0c384" stop-opacity=".78"/><stop offset=".22" stop-color="#c88b4d" stop-opacity=".38"/><stop offset="1" stop-color="#8e4a32" stop-opacity="0"/></radialGradient>
            <radialGradient id="cp-chair-glow" cx="50%" cy="52%" r="50%"><stop stop-color="#d8ad70" stop-opacity=".19"/><stop offset="1" stop-color="#b76d52" stop-opacity="0"/></radialGradient>
            <pattern id="cp-lattice" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M0 0H34V34H0Z M17 0V34 M0 17H34" fill="none" stroke="#675a49" stroke-width="2" opacity=".34"/></pattern>
            <pattern id="cp-robe-pattern" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M8 24c10-16 22-16 32 0-10 16-22 16-32 0Z" fill="none" stroke="#806050" stroke-width="1.3" opacity=".33"/><circle cx="24" cy="24" r="3" fill="#8d6653" opacity=".22"/></pattern>
            <filter id="cp-soft-shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="15"/><feOffset dy="18"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .82 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="cp-fog" x="-25%" y="-100%" width="150%" height="300%"><feGaussianBlur stdDeviation="18"/></filter>
            <filter id="cp-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="22"/></filter>
            <filter id="cp-paper"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="19"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .12"/></feComponentTransfer></filter>
          </defs>

          <g class="chair-stage-core">
            <rect width="1600" height="900" fill="#050807"/>
            <rect x="90" y="42" width="1420" height="790" rx="6" fill="url(#cp-wall)"/>
            <rect x="90" y="42" width="1420" height="790" rx="6" filter="url(#cp-paper)" opacity=".42"/>

            <g opacity=".76">
              <rect x="126" y="92" width="292" height="500" fill="#080b0a" stroke="#3e3930" stroke-width="8"/>
              <rect x="144" y="110" width="256" height="464" fill="url(#cp-lattice)"/>
              <rect x="1182" y="90" width="292" height="505" fill="#080b0a" stroke="#3f372f" stroke-width="8"/>
              <rect x="1200" y="108" width="256" height="469" fill="url(#cp-lattice)"/>
            </g>

            <g class="bamboo-shadow" opacity=".21" fill="none" stroke="#050806" stroke-width="18" stroke-linecap="round">
              <path d="M80 40C210 160 170 300 275 410S325 690 450 850"/>
              <path d="M1500 30C1370 190 1435 315 1320 450S1280 690 1170 855"/>
              <path d="M250 20C360 105 390 188 410 300"/>
              <path d="M1350 20C1240 135 1210 220 1190 335"/>
            </g>
            <g class="bamboo-shadow" opacity=".22" fill="none" stroke="#111512" stroke-width="5" stroke-linecap="round">
              <path d="M68 118l156 12M95 210l172 25M1330 150l176-23M1300 244l183-29"/>
            </g>

            <rect x="565" y="92" width="470" height="476" fill="#0b100e" stroke="#352f28" stroke-width="10"/>
            <rect x="604" y="128" width="392" height="405" fill="#0a0d0c" stroke="#24231f" stroke-width="3"/>
            <g opacity=".34" stroke="#69584a" fill="none"><path d="M800 132V531"/><path d="M618 322H982"/><path d="M650 162h300M650 492h300"/></g>
            <g opacity=".38" fill="#6f5d48"><rect x="522" y="120" width="24" height="418"/><rect x="1054" y="118" width="24" height="420"/><rect x="91" y="42" width="26" height="790"/><rect x="1483" y="42" width="27" height="790"/></g>

            <path d="M90 598H1510V832H90Z" fill="url(#cp-floor)"/>
            <g opacity=".24" stroke="#675544" stroke-width="2"><path d="M800 598L470 832M800 598L1130 832M800 598L220 832M800 598L1380 832"/><path d="M160 650H1440M130 710H1470M105 780H1495"/></g>
            <g opacity=".19" stroke="#88705a" stroke-width="1"><path d="M410 621l95 12-42 28 108 12M1018 631l99 13-46 28 115 15M690 733l74 9-38 25 104 17"/></g>

            <g class="light-breath">
              <ellipse cx="800" cy="550" rx="360" ry="300" fill="url(#cp-chair-glow)"/>
              <path d="M1198 136L940 650H1395Z" fill="#c28b56" opacity=".055"/>
            </g>

            <g class="lantern" transform="translate(1324 278)">
              <circle class="lantern-halo" cx="0" cy="0" r="112" fill="url(#cp-lamp)" filter="url(#cp-glow)"/>
              <rect x="-32" y="-52" width="64" height="96" rx="4" fill="#211811" stroke="#75604b" stroke-width="5"/>
              <rect x="-22" y="-42" width="44" height="74" fill="#d59b5d" opacity=".34"/>
              <circle class="lantern-core" cx="0" cy="-4" r="18" fill="#f1c989" opacity=".82"/>
              <path d="M-42-52H42M-42 44H42M0-72V-52M0 44V66" stroke="#705846" stroke-width="5"/>
            </g>

            <ellipse class="chair-shadow" cx="800" cy="748" rx="165" ry="28" fill="#000" opacity=".82" filter="url(#cp-fog)"/>
            <g class="chair-object" filter="url(#cp-soft-shadow)">
              <ellipse cx="800" cy="600" rx="205" ry="210" fill="url(#cp-chair-glow)" opacity=".55"/>
              <path class="chair-bamboo" d="M705 450V720M895 450V720M702 452H898M720 570H880M730 650H870"/>
              <path class="chair-bamboo" d="M720 565L675 623M880 565L925 623M675 623V710M925 623V710"/>
              <path class="chair-bamboo-thin" d="M728 474V555M752 466V558M776 463V558M800 462V558M824 463V558M848 466V558M872 474V555"/>
              <path class="chair-bamboo-thin" d="M735 583H865M730 600H870M726 618H874M722 636H878"/>
              <path class="chair-bamboo-thin" d="M690 623H726M874 623H910"/>
              <g class="chair-knots"><circle class="chair-knot" cx="705" cy="452" r="8"/><circle class="chair-knot" cx="895" cy="452" r="8"/><circle class="chair-knot" cx="720" cy="570" r="7"/><circle class="chair-knot" cx="880" cy="570" r="7"/><circle class="chair-knot" cx="675" cy="623" r="7"/><circle class="chair-knot" cx="925" cy="623" r="7"/></g>
            </g>

            <g class="wind-ribbons" fill="none" stroke="#b39168" stroke-width="3" stroke-linecap="round" opacity=".22">
              <path class="wind-a" d="M570 590C660 548 709 576 760 590S880 620 1018 562"/>
              <path class="wind-b" d="M590 654C686 615 721 632 782 646S901 668 1000 622"/>
            </g>

            <g class="prologue-woman woman-a" filter="url(#cp-soft-shadow)">
              <path d="M96 827C122 646 135 467 193 361c31-57 83-82 132-58 50 25 69 89 80 154l42 370Z" fill="url(#cp-robe-warm)" stroke="#584b41" stroke-width="3"/>
              <path d="M154 447c75 18 139 16 216-1l25 266c-93 34-185 31-276 2Z" fill="url(#cp-robe-pattern)" opacity=".52"/>
              <g class="woman-head" transform="translate(0 0)"><ellipse cx="270" cy="285" rx="58" ry="70" fill="#4e4036"/><circle cx="222" cy="252" r="43" fill="#111512"/><path d="M228 239c25-53 93-48 110 4 10 30-5 73-37 91-7-28-21-48-45-58Z" fill="#121713"/><path class="face-line" d="M306 276c12 5 20 13 25 24M314 304c-8 6-15 8-24 7"/></g>
              <g class="woman-sleeve"><path d="M341 430c58 48 95 99 130 169-23 22-47 31-76 35-33-65-67-118-103-157Z" fill="#171816" stroke="#5c4e43" stroke-width="3"/><path d="M405 620c21 11 36 25 42 42-19 18-40 18-63 5 2-17 8-33 21-47Z" fill="#6d5848"/></g>
              <g class="robe-stitch" fill="none" stroke="#896653" stroke-width="2"><path d="M182 494c60 42 108 88 152 145M160 553c61 35 115 81 159 135"/><circle cx="234" cy="610" r="24"/><path d="M220 610h28M234 596v28"/></g>
            </g>

            <g class="prologue-woman woman-b" filter="url(#cp-soft-shadow)">
              <path d="M345 820C366 674 373 514 422 411c26-55 70-75 111-54 43 22 61 82 68 137l31 326Z" fill="url(#cp-robe)" stroke="#554a40" stroke-width="3"/>
              <path d="M410 492c62 20 120 19 175-2l17 227c-69 27-139 25-210 3Z" fill="url(#cp-robe-pattern)" opacity=".42"/>
              <g class="woman-head"><ellipse cx="500" cy="340" rx="48" ry="58" fill="#4c3d33"/><circle cx="462" cy="316" r="35" fill="#111512"/><path d="M463 306c23-42 72-36 84 8 7 25-6 55-31 70-5-23-18-39-37-47Z" fill="#111512"/><path class="face-line" d="M528 337c9 4 15 10 18 18M531 360c-6 4-12 6-18 5"/></g>
              <g class="woman-sleeve"><path d="M545 469c42 42 67 81 92 136-18 17-36 23-58 25-23-52-49-94-79-127Z" fill="#151816" stroke="#51463d" stroke-width="3"/></g>
              <g class="robe-stitch" fill="none" stroke="#7c6352" stroke-width="1.7"><path d="M434 532c45 37 81 74 115 122M420 588c46 31 83 66 114 108"/></g>
            </g>

            <g class="prologue-woman woman-c" filter="url(#cp-soft-shadow)">
              <path d="M970 827l34-358c8-84 39-145 96-165 54-19 104 16 133 83 45 105 59 277 75 440Z" fill="url(#cp-robe)" stroke="#5a4e43" stroke-width="3"/>
              <path d="M1018 458c70 26 137 27 204 1l31 258c-92 29-180 28-264-2Z" fill="url(#cp-robe-pattern)" opacity=".45"/>
              <g class="woman-head"><ellipse cx="1113" cy="287" rx="57" ry="68" fill="#4c3d33"/><circle cx="1160" cy="255" r="42" fill="#101512"/><path d="M1059 244c24-51 89-53 116-5l-34 41c-21 7-37 24-47 52-30-18-45-55-35-88Z" fill="#111512"/><path class="face-line" d="M1078 279c-12 4-20 11-25 22M1068 306c8 5 15 7 24 5"/></g>
              <g class="woman-sleeve"><path d="M1018 428c-70 35-116 78-161 142 18 25 42 38 72 42 45-55 90-95 143-125Z" fill="#171816" stroke="#5b4e42" stroke-width="3"/><path d="M862 565c-26 2-46 11-59 27 12 23 31 33 57 31 9-18 10-38 2-58Z" fill="#6b5647"/><path class="face-line" d="M808 590c-22-5-40-3-56 6M812 602c-23 2-39 8-51 19"/></g>
              <g class="robe-stitch" fill="none" stroke="#806554" stroke-width="2"><path d="M1046 488c-46 50-76 104-102 169M1104 472c-32 58-53 119-67 184"/><circle cx="1134" cy="584" r="26"/><path d="M1118 584h32M1134 568v32"/></g>
            </g>

            <g class="prologue-woman woman-d" filter="url(#cp-soft-shadow)">
              <path d="M1238 824l28-322c7-73 34-126 83-143 47-16 91 14 116 73 38 92 50 242 64 392Z" fill="url(#cp-robe-warm)" stroke="#584a40" stroke-width="3"/>
              <path d="M1280 491c60 22 117 23 174 2l24 222c-77 25-151 23-224-2Z" fill="url(#cp-robe-pattern)" opacity=".47"/>
              <g class="woman-head"><ellipse cx="1361" cy="342" rx="49" ry="59" fill="#4d3c33"/><circle cx="1403" cy="317" r="35" fill="#101512"/><path d="M1317 308c21-44 76-46 99-5l-29 35c-18 7-31 21-40 45-25-15-38-48-30-75Z" fill="#111512"/><path class="face-line" d="M1331 341c-9 4-15 10-18 18M1326 365c6 4 12 5 18 4"/></g>
              <g class="woman-sleeve"><path d="M1282 486c-42 39-70 81-98 136 17 17 35 24 57 26 27-50 55-91 88-123Z" fill="#171615" stroke="#54483f" stroke-width="3"/></g>
              <g class="robe-stitch" fill="none" stroke="#7b5d50" stroke-width="1.7"><path d="M1310 528c-38 41-66 87-87 140M1360 506c-28 48-47 99-59 153"/></g>
            </g>

            <g class="mist-band mist-a" filter="url(#cp-fog)" opacity=".2"><path d="M-120 684C210 618 410 706 690 665s530-90 1030 10v92H-120Z" fill="#a79b86"/></g>
            <g class="mist-band mist-b" filter="url(#cp-fog)" opacity=".12"><path d="M-180 760c380-78 620 16 930-26s550-68 1030 42v84H-180Z" fill="#b8ac96"/></g>

            <g class="dust-field" fill="#d7b98b">
              <circle class="dust" cx="620" cy="470" r="2"/><circle class="dust" cx="710" cy="410" r="1.6"/><circle class="dust" cx="785" cy="525" r="2.2"/><circle class="dust" cx="865" cy="445" r="1.4"/><circle class="dust" cx="960" cy="520" r="1.8"/><circle class="dust" cx="1030" cy="390" r="1.4"/><circle class="dust" cx="565" cy="560" r="1.5"/><circle class="dust" cx="890" cy="600" r="1.7"/><circle class="dust" cx="740" cy="670" r="1.3"/><circle class="dust" cx="980" cy="685" r="2"/>
            </g>
          </g>
        </svg>
        <div class="chair-scene-wash"></div><div class="chair-grain"></div><div class="chair-vignette"></div>
      </div>
      <div class="chair-title"><strong>椅仔姑傳說</strong><span>FOLK MEMORY · PROLOGUE</span></div>
      <div class="chair-copy" aria-live="polite"><p class="chair-line chair-line-one">「陽間無歸處，陰間無人迎。」</p><p class="chair-line chair-line-two">「孤身一椅，歲歲徘徊。」</p><p class="chair-line chair-sigh">「可憐喔……」</p></div>
      <div class="chair-bridge"><span>這是一則古老的民間傳說。</span><strong>而有些孩子的等待，不是傳說。</strong></div>
      <div class="chair-progress" aria-hidden="true"><i></i></div><div class="chair-scroll-mark" aria-hidden="true"></div><span class="scene-caption" aria-hidden="true">清代民間傳說 × 當代兒童守護</span>
      <button class="chair-skip" type="button" aria-label="略過椅仔姑傳說序幕">略過序幕</button>`;
  }

  function initChairPrologueV2(){
    if(document.querySelector("#chair-maiden-prologue")) return;
    const gate=document.querySelector("#entry-gate");
    if(!gate) return;

    const p=document.createElement("section");
    p.id="chair-maiden-prologue";
    p.className="chair-prologue chair-prologue-v2";
    p.setAttribute("role","dialog");
    p.setAttribute("aria-modal","true");
    p.setAttribute("aria-label","椅仔姑傳說序幕");
    p.innerHTML=sceneMarkup(matchMedia("(max-width:760px)").matches);
    document.body.insertBefore(p,gate);
    document.body.classList.add("chair-prologue-active");

    const skip=p.querySelector(".chair-skip");
    const lines=[...p.querySelectorAll(".chair-line")];
    const progress=p.querySelector(".chair-progress i");
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ending=false,ctx=null,master=null;
    const loops=[];

    const cleanup=()=>{
      loops.forEach(t=>t&&t.kill&&t.kill());
      if(ctx) ctx.revert();
      p.remove();
      document.body.classList.remove("chair-prologue-active");
      document.removeEventListener("keydown",onKey);
    };
    const finish=()=>{
      if(ending) return;
      ending=true;
      if(master) master.pause();
      if(window.gsap) gsap.to(p,{autoAlpha:0,duration:.72,ease:"power2.inOut",onComplete:cleanup});
      else cleanup();
    };
    const onKey=e=>{if(e.key==="Escape") finish()};
    skip.addEventListener("click",finish);
    document.addEventListener("keydown",onKey);

    if(!window.gsap){
      p.style.opacity="1";
      lines.forEach(x=>x.style.opacity="1");
      p.querySelector(".chair-bridge").style.opacity="1";
      setTimeout(finish,7200);
      return;
    }

    ctx=gsap.context(()=>{
      gsap.set(p,{autoAlpha:0});
      gsap.set(".chair-stage-core",{transformOrigin:"50% 56%"});
      gsap.set(".chair-object",{transformOrigin:"50% 100%"});
      gsap.set(".chair-shadow",{transformOrigin:"50% 50%"});
      gsap.set(".woman-a,.woman-b",{transformOrigin:"50% 100%"});
      gsap.set(".woman-c,.woman-d",{transformOrigin:"50% 100%"});
      gsap.set(".woman-head",{transformOrigin:"50% 80%"});
      gsap.set(".woman-sleeve",{transformOrigin:"80% 15%"});

      if(reduce){
        gsap.set(p,{autoAlpha:1});
        gsap.set(lines,{autoAlpha:1});
        gsap.set(".chair-bridge",{autoAlpha:1});
        master=gsap.delayedCall(7,finish);
        return;
      }

      loops.push(gsap.to(".mist-a",{x:90,duration:14,repeat:-1,yoyo:true,ease:"sine.inOut"}));
      loops.push(gsap.to(".mist-b",{x:-75,duration:17,repeat:-1,yoyo:true,ease:"sine.inOut"}));
      loops.push(gsap.to(".bamboo-shadow",{x:5,rotation:.22,duration:5.8,repeat:-1,yoyo:true,ease:"sine.inOut",transformOrigin:"50% 0%"}));
      loops.push(gsap.to(".lantern-core",{opacity:.48,scale:.86,duration:.24,repeat:-1,yoyo:true,repeatDelay:.72,ease:"sine.inOut"}));
      loops.push(gsap.to(".lantern-halo",{opacity:.62,scale:1.08,duration:1.8,repeat:-1,yoyo:true,ease:"sine.inOut",transformOrigin:"50% 50%"}));
      loops.push(gsap.to(".light-breath",{opacity:.72,duration:2.8,repeat:-1,yoyo:true,ease:"sine.inOut"}));
      loops.push(gsap.to(".woman-a,.woman-c",{scaleY:1.004,y:-1.5,duration:3.3,repeat:-1,yoyo:true,ease:"sine.inOut"}));
      loops.push(gsap.to(".woman-b,.woman-d",{scaleY:1.003,y:-1,duration:3.9,repeat:-1,yoyo:true,ease:"sine.inOut"}));
      loops.push(gsap.to(".dust",{autoAlpha:.52,y:-34,x:"random(-12,12)",duration:"random(3.5,6)",repeat:-1,stagger:{each:.36,repeat:-1},ease:"none"}));
      loops.push(gsap.to(".wind-a",{x:34,opacity:.08,duration:3.1,repeat:-1,yoyo:true,ease:"sine.inOut"}));
      loops.push(gsap.to(".wind-b",{x:-25,opacity:.09,duration:3.8,repeat:-1,yoyo:true,ease:"sine.inOut"}));

      master=gsap.timeline({defaults:{ease:"power2.out"},onComplete:finish});
      master
        .to(p,{autoAlpha:1,duration:.8})
        .fromTo(".chair-stage-core",{scale:1.018},{scale:1.065,duration:11.2,ease:"none"},0)
        .from(".prologue-woman",{autoAlpha:0,y:24,x:i=>i<2?-28:28,duration:1.45,stagger:.18,ease:"power3.out"},.22)
        .from(".chair-object",{autoAlpha:0,scale:.9,y:18,duration:1.55,ease:"power3.out"},.46)
        .from(".chair-shadow",{autoAlpha:0,scaleX:.72,duration:1.5},.52)
        .from(".chair-title",{autoAlpha:0,x:-14,duration:.8},.28)
        .from(".chair-skip",{autoAlpha:0,y:-10,duration:.65},.45)
        .to(".woman-a .woman-head",{rotation:2.4,x:3,duration:1.05,ease:"sine.inOut"},1.45)
        .to(".woman-b .woman-head",{rotation:1.8,x:2,duration:1.1,ease:"sine.inOut"},1.72)
        .to(".woman-c .woman-head",{rotation:-2.6,x:-3,duration:1.05,ease:"sine.inOut"},1.58)
        .to(".woman-d .woman-head",{rotation:-1.7,x:-2,duration:1.1,ease:"sine.inOut"},1.84)
        .to(".chair-object",{rotation:-.72,y:-1,duration:.48,ease:"sine.inOut"},2.08)
        .to(".chair-shadow",{x:8,scaleX:.96,duration:.48,ease:"sine.inOut"},2.08)
        .to(".chair-object",{rotation:.58,y:0,duration:.62,ease:"sine.inOut"},2.56)
        .to(".chair-shadow",{x:-6,scaleX:1.03,duration:.62,ease:"sine.inOut"},2.56)
        .to(".chair-object",{rotation:-.18,duration:.42,ease:"sine.inOut"},3.18)
        .to(".chair-object",{rotation:0,duration:.42,ease:"sine.inOut"},3.6)
        .add(()=>lines[0].classList.add("is-spoken"),2.52)
        .fromTo(lines[0],{autoAlpha:0,y:14,filter:"blur(6px)",clipPath:"inset(0 48% 0 48%)"},{autoAlpha:1,y:0,filter:"blur(0px)",clipPath:"inset(0 0% 0 0%)",duration:1.08},2.52)
        .to(progress,{y:"34%",duration:1.2,ease:"sine.inOut"},2.55)
        .add(()=>lines[1].classList.add("is-spoken"),4.02)
        .fromTo(lines[1],{autoAlpha:0,y:14,filter:"blur(6px)",clipPath:"inset(0 48% 0 48%)"},{autoAlpha:1,y:0,filter:"blur(0px)",clipPath:"inset(0 0% 0 0%)",duration:1.08},4.02)
        .to(progress,{y:"78%",duration:1.2,ease:"sine.inOut"},4.05)
        .to(".woman-c .woman-sleeve",{rotation:-4.5,x:-8,y:-2,duration:1.35,ease:"sine.inOut"},4.2)
        .to(".woman-a .woman-sleeve",{rotation:1.8,x:3,duration:1.25,ease:"sine.inOut"},4.35)
        .to(".chair-object",{rotation:.28,duration:.7,ease:"sine.inOut"},4.85)
        .to(".chair-object",{rotation:-.16,duration:.7,ease:"sine.inOut"},5.55)
        .to(".chair-object",{rotation:0,duration:.48,ease:"sine.inOut"},6.25)
        .add(()=>lines[2].classList.add("is-spoken"),5.58)
        .fromTo(lines[2],{autoAlpha:0,y:13,filter:"blur(7px)",scale:.98},{autoAlpha:1,y:0,filter:"blur(0px)",scale:1,duration:1.18},5.58)
        .to(progress,{y:"calc(18vh - 5px)",duration:1.25,ease:"sine.inOut"},5.62)
        .to(".prologue-woman",{opacity:.48,duration:1.25,ease:"sine.inOut"},6.68)
        .to(".chair-object",{filter:"brightness(1.16)",duration:1.1},6.72)
        .fromTo(".chair-bridge",{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:1.05},7.02)
        .to(lines,{opacity:.28,duration:.75},7.08)
        .fromTo(".chair-scroll-mark",{opacity:0,y:-7},{opacity:.62,y:0,duration:.75},7.42)
        .to({}, {duration:2.35});
    },p);
  }

  window.initChairPrologueV2=initChairPrologueV2;
})();
