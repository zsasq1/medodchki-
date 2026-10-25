
/* Топанатомия груди: виды пневмоторакса (GSAP) */
(function(){
if(!window.gsap||!window.StepTL)return;
const NS='http://www.w3.org/2000/svg';
const fig=document.getElementById('a-pnx');if(!fig)return;const S=fig.querySelector('svg');
/* фронтальный срез: слева на рисунке — правая половина груди пациента (поражённая) */
const cR=d=>`M130 78 C92 120 84 230 102 318 C150 300 ${210+d*.5} 304 ${262+d} 326 L${262+d} 104 C${230+d*.5} 70 172 60 130 78 Z`;
const cL=d=>`M510 78 C548 120 556 230 538 318 C490 300 ${430+d*.5} 304 ${378+d} 326 L${378+d} 104 C${410+d*.5} 70 468 60 510 78 Z`;
const cavR=cR(0),cavL=cL(0),SH=56;
const AIR='rgba(120,180,240,.55)';
let s=`<defs><linearGradient id="px-lung" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b2b6"/><stop offset="1" stop-color="#d9868c"/></linearGradient></defs>
 <path d="M120 54 C60 100 52 250 78 344 L562 344 C588 250 580 100 520 54 C460 30 180 30 120 54 Z" fill="none" stroke="#d6b48a" stroke-width="22" stroke-linejoin="round"/>
 <g stroke="#b8925e" stroke-width="3" opacity=".7">${[96,136,176,216,256,296].map(y=>`<line x1="${y<200?66:62}" y1="${y}" x2="${y<200?84:80}" y2="${y+10}"/><line x1="${y<200?574:578}" y1="${y}" x2="${y<200?556:560}" y2="${y+10}"/>`).join('')}</g>
 <path d="M78 344 C150 300 230 300 320 340 C410 300 490 300 562 344" fill="none" stroke="#a46a5a" stroke-width="8"/>
 <path id="px-cavR" d="${cavR}" fill="${AIR}" stroke="var(--gx-muted)" stroke-width="1.5"/>
 <path id="px-cavL" d="${cavL}" fill="${AIR}" stroke="var(--gx-muted)" stroke-width="1.5"/>
 <path id="px-lungR" d="${cavR}" fill="url(#px-lung)" stroke="#a65059" stroke-width="2"/>
 <path id="px-lungL" d="${cavL}" fill="url(#px-lung)" stroke="#a65059" stroke-width="2"/>
 <g id="px-med"><path d="M300 40 V150 M340 40 V150" stroke="#9ab" stroke-width="10" stroke-linecap="round"/>
   <path d="M286 230 C270 170 330 150 362 176 C410 160 420 250 360 300 C330 322 300 300 286 230 Z" fill="#c9525d" stroke="#8a2f38" stroke-width="2"/>
   <text class="ts" x="330" y="240" text-anchor="middle" style="fill:#fff">сердце</text></g>
 <g id="px-wound"><rect x="60" y="186" width="32" height="20" fill="var(--gx-paper)"/><path d="M60 186 H92 M60 206 H92" stroke="#8a2f38" stroke-width="3"/></g>
 <path id="px-seal" d="M56 182 h40 v28 h-40 Z" fill="#e8e1d2" stroke="#8a7a5a" stroke-width="2" opacity="0"/>
 <path id="px-flap" d="M92 186 l18 10 l-18 10" fill="#d6b48a" stroke="#8a7a5a" stroke-width="2" opacity="0"/>
 <g id="px-needle" opacity="0"><path d="M30 120 L118 150" stroke="#555" stroke-width="5" stroke-linecap="round"/><rect x="6" y="108" width="30" height="16" rx="3" transform="rotate(19 21 116)" fill="#3b7"/></g>
 <g id="px-air"></g>
 <text class="ts" x="182" y="370" text-anchor="middle">поражённая сторона</text>
 <text class="ts" x="458" y="370" text-anchor="middle">здоровая сторона</text>
 <text id="px-say" class="tb" x="320" y="24" text-anchor="middle"></text>`;
S.setAttribute('viewBox','0 0 640 384');S.innerHTML=s;
fig.style.setProperty('--gxm-ts','24px');fig.style.setProperty('--gxm-tb','26px');
const q=x=>S.querySelector(x),lungR=q('#px-lungR'),lungL=q('#px-lungL'),med=q('#px-med'),cavR_=q('#px-cavR'),cavL_=q('#px-cavL'),seal=q('#px-seal'),flap=q('#px-flap'),needle=q('#px-needle'),say=q('#px-say'),airG=q('#px-air'),wound=q('#px-wound');
const A=[];for(let k=0;k<6;k++){const c=document.createElementNS(NS,'circle');c.setAttribute('r',7);c.setAttribute('fill','#4a90d9');c.setAttribute('cx',30);c.setAttribute('cy',196);c.style.opacity=0;airG.appendChild(c);A.push(c)}
gsap.set(lungR,{transformOrigin:'262px 200px'});
const T=(tl,t,pos)=>tl.call(()=>{say.textContent=t},null,pos);
const breath=(tl,n=2,amp=.03,lungs=[lungR,lungL])=>{for(let k=0;k<n;k++){tl.to(lungs,{scale:`+=${amp}`,duration:.7,ease:'sine.inOut'});tl.to(lungs,{scale:`-=${amp}`,duration:.7,ease:'sine.inOut'})}};
const airIn=(tl,pos,inside=true)=>tl.fromTo(A,{opacity:1,attr:{cx:20,cy:196}},{attr:{cx:i=>inside?120+(i%3)*24:150,cy:i=>inside?120+i*30:196},duration:.8,stagger:.06,ease:'power1.out'},pos);
const airOut=(tl,pos)=>tl.to(A,{attr:{cx:20,cy:196},duration:.7,stagger:.05,ease:'power1.in'},pos).set(A,{opacity:0});
function base(tl,{lr=1,sh=0,sealO=0,flapO=0,nd=0}={}){tl.set(lungR,{scale:lr});tl.set(lungL,{attr:{d:cL(sh)}});tl.set(cavL_,{attr:{d:cL(sh)}});tl.set(cavR_,{attr:{d:cR(sh)}});tl.set(med,{x:sh});
  tl.set(seal,{opacity:sealO});tl.set(flap,{opacity:flapO});tl.set(needle,{opacity:nd,x:0,y:0});tl.set(A,{opacity:0});tl.set(wound,{opacity:1})}
const shift=(tl,d,dur=.6,pos)=>{tl.to(med,{x:d,duration:dur},pos);tl.to([lungL,cavL_],{attr:{d:cL(d)},duration:dur},'<');tl.to(cavR_,{attr:{d:cR(d)},duration:dur},'<')};
const steps=[
 {label:'<b>Норма.</b> Плевральная полость щелевидная, лёгкие расправлены и следуют за грудной стенкой при дыхании.'},
 {label:'<b>Открытый пневмоторакс</b> — прямое сообщение плевральной полости с внешней средой: на вдохе воздух входит через рану, на выдохе выходит; лёгкое спадается. <b>Тактика:</b> иссечение раны, швы в 3 ряда (плевро-мышечный, мышцы и фасции, редкие на кожу) <span class="src">с. 13</span>.'},
 {label:'<b>Закрытый пневмоторакс</b> — воздух вошёл в момент ранения, затем рана закрылась; количество воздуха больше не меняется. <b>Тактика:</b> торакотомия с поднадкостничной резекцией двух рёбер → ревизия и ушивание дефекта лёгкого → ушивание стенки <span class="src">с. 13</span>.'},
 {label:'<b>Клапанный пневмоторакс</b> — воздух входит и не выходит: с каждым вдохом его всё больше, лёгкое сдавлено, средостение смещается в здоровую сторону <span class="src">с. 14</span>.'},
 {label:'<b>Неотложно при клапанном:</b> прокол стенки толстой иглой — воздух выходит, средостение возвращается. Затем торакотомия, ушивание раны лёгкого/бронха и стенки <span class="src">с. 14</span>.'}];
StepTL(fig,steps,(tl,i)=>{
  if(i===0){base(tl,{});tl.set(wound,{opacity:0});T(tl,'норма');breath(tl,2)}
  if(i===1){base(tl,{});T(tl,'открытый');T(tl,'вдох: воздух входит');airIn(tl);tl.to(lungR,{scale:.55,duration:1.1,ease:'power2.out'},'<');T(tl,'выдох: воздух выходит');airOut(tl,'+=.2');
    T(tl,'вдох: воздух входит');airIn(tl,'+=.1');T(tl,'выдох: воздух выходит');airOut(tl,'+=.2')}
  if(i===2){base(tl,{lr:.55});T(tl,'закрытый: рана закрылась');tl.set(A,{opacity:1,attr:{cx:k=>120+(k%3)*24,cy:k=>120+k*30}});tl.to(seal,{opacity:1,duration:.5});breath(tl,2,.03,[lungL])}
  if(i===3){base(tl,{lr:.55,flapO:1});for(let k=0;k<3;k++){T(tl,'вдох: воздух входит');
      tl.fromTo(A.slice(k*2,k*2+2),{opacity:1,attr:{cx:20,cy:196}},{attr:{cx:j=>130+j*30,cy:j=>140+k*50+j*20},duration:.7});
      tl.to(lungR,{scale:.55-.12*(k+1),duration:.6},'<');shift(tl,SH*(k+1)/3,.6,'<');
      T(tl,'выдох: клапан не выпускает');tl.to({},{duration:.6})}
    T(tl,'средостение смещено в здоровую сторону')}
  if(i===4){base(tl,{lr:.19,sh:SH,flapO:1});tl.set(A,{opacity:1,attr:{cx:k=>130+(k%2)*30,cy:k=>140+Math.floor(k/2)*50+(k%2)*20}});T(tl,'пункция толстой иглой');
    tl.to(needle,{opacity:1,duration:.3});tl.fromTo(needle,{x:-30,y:-10},{x:0,y:0,duration:.6});
    tl.to(A,{attr:{cx:30,cy:120},opacity:0,duration:.8,stagger:.08});shift(tl,0,1,'-=.6');tl.to(lungR,{scale:.45,duration:1},'<');T(tl,'давление снижено, затем торакотомия')}
},{repeatDelay:1.5});
})();
