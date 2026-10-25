
/* Патофизиология: патогенез и стадии лихорадки (GSAP) */
(function(){
if(!window.gsap||!window.StepTL)return;
const NS='http://www.w3.org/2000/svg';
const HOT='var(--hot,#c0262f)',COLD='var(--cold,#1f5fa8)',HS='var(--hot-soft,#fbe9ea)',CS='var(--cold-soft,#e6eef8)';
/* ---------- 1. Патогенез ---------- */
(function(){
  const fig=document.getElementById('a-fevpath');if(!fig)return;const S=fig.querySelector('svg');
  const NODES=[['Экзопироген','ЛПС и др. компоненты микробов, ИК'],['Лейкоциты','синтез ИЛ-1β, ИЛ-6, ФНО-α'],['Эндотелий мозга, OVLT','здесь ГЭБ проницаемее'],['ЦОГ-2 + мПГЕС-1','синтез ПГЕ₂'],['Преоптическая область','ПГЕ₂ → EP3: уст. точка ↑'],['Эффекторы','спазм сосудов кожи, дрожь, термогенез']];
  const X0=8,W=352,H=62,G=24,Y=k=>14+k*(H+G);
  let s='';
  NODES.forEach(([a,b],k)=>{s+=`<g class="nd" data-k="${k}"><rect x="${X0}" y="${Y(k)}" width="${W}" height="${H}" rx="10" fill="var(--gx-paper)" stroke="var(--gx-line)" stroke-width="2"/>
    <text class="tb" x="${X0+14}" y="${Y(k)+26}">${a}</text><text class="ts" x="${X0+14}" y="${Y(k)+49}">${b}</text></g>`;
    if(k<5)s+=`<path d="M${X0+W/2} ${Y(k)+H+2} v${G-4}" stroke="var(--gx-line)" stroke-width="2"/>`});
  /* термометр */
  const TX=432,ty=t=>470-(t-36)*80;
  s+=`<text class="ts" x="${TX+10}" y="22" text-anchor="middle">°C</text>
   <rect x="${TX-12}" y="40" width="24" height="440" rx="12" fill="var(--gx-paper)" stroke="var(--gx-line)" stroke-width="2"/>
   <circle cx="${TX}" cy="498" r="22" fill="${HOT}"/><rect id="fp-hg" x="${TX-6}" y="${ty(36.8)}" width="12" height="${490-ty(36.8)}" fill="${HOT}"/>`;
  [36,37,38,39,40,41].forEach(t=>s+=`<line x1="${TX+14}" x2="${TX+24}" y1="${ty(t)}" y2="${ty(t)}" stroke="var(--gx-muted)"/><text class="ts" x="${TX+30}" y="${ty(t)+5}">${t}</text>`);
  s+=`<g id="fp-sp"><path d="M${TX-34} 0 l16 -9 v18 Z" fill="var(--gx-fg)"/></g>
   <g id="fp-x" opacity="0"><path d="M${X0+W-46} ${Y(3)+14} l34 34 M${X0+W-12} ${Y(3)+14} l-34 34" stroke="${COLD}" stroke-width="6" stroke-linecap="round"/></g>
   <g id="fp-nsaid" opacity="0"><rect x="${X0+W-170}" y="${Y(3)-20}" width="166" height="26" rx="13" fill="${COLD}"/><text class="ts" x="${X0+W-87}" y="${Y(3)-2}" text-anchor="middle" fill="#fff" style="fill:#fff">ингибитор ЦОГ</text></g>
   <g id="fp-cap" opacity="0"><line x1="${TX-30}" x2="${TX+30}" y1="${ty(41)}" y2="${ty(41)}" stroke="${COLD}" stroke-width="4" stroke-dasharray="6 4"/></g>
   <g id="fp-endo" opacity="0"><rect x="${X0+W-244}" y="${Y(4)-20}" width="240" height="26" rx="13" fill="var(--ok,#1f6b52)"/><text class="ts" x="${X0+W-124}" y="${Y(4)-2}" text-anchor="middle" style="fill:#fff">АВП, α-МСГ, ГК, ИЛ-1Ra</text></g>
   <g id="fp-dots"></g>`;
  S.setAttribute('viewBox','0 0 500 530');S.innerHTML=s;
  const nd=[...S.querySelectorAll('.nd rect')],dots=S.querySelector('#fp-dots'),hg=S.querySelector('#fp-hg'),sp=S.querySelector('#fp-sp');
  const D=[];for(let k=0;k<5;k++){const row=[];for(let j=0;j<4;j++){const c=document.createElementNS(NS,'circle');c.setAttribute('r',6);c.setAttribute('cx',X0+W/2-30+j*20);c.setAttribute('cy',Y(k)+H/2);c.setAttribute('fill',k<1?'var(--gx-muted)':HOT);c.style.opacity=0;dots.appendChild(c);row.push(c)}D.push(row)}
  const temp=(tl,t,d=1.4,pos)=>tl.to(hg,{attr:{y:ty(t),height:490-ty(t)},duration:d,ease:'power1.inOut'},pos);
  const setp=(tl,t,d=.6,pos)=>tl.to(sp,{y:ty(t),duration:d,ease:'back.out(1.6)'},pos);
  const lit=(tl,k,pos)=>tl.to(nd[k],{attr:{stroke:HOT,fill:HS},duration:.35},pos);
  const flow=(tl,k,pos)=>tl.fromTo(D[k],{opacity:1,attr:{cy:Y(k)+H/2}},{attr:{cy:Y(k+1)+H/2},duration:.9,stagger:.12,ease:'power1.inOut'},pos).to(D[k],{opacity:0,duration:.2});
  function base(tl,upto,t,spT){tl.set(nd,{attr:{stroke:'var(--gx-line)',fill:'var(--gx-paper)'}});tl.set(D.flat(),{opacity:0});
    tl.set(['#fp-x','#fp-nsaid','#fp-cap','#fp-endo'].map(q=>S.querySelector(q)),{opacity:0});
    for(let k=0;k<=upto;k++)tl.set(nd[k],{attr:{stroke:HOT,fill:HS}});tl.set(hg,{attr:{y:ty(t),height:490-ty(t)}});tl.set(sp,{y:ty(spT)})}
  const steps=[
   {label:'<b>1. Образование эндопирогенов.</b> Экзопироген активирует лейкоциты, они синтезируют ИЛ-1β, ИЛ-6, ФНО-α. Температура пока нормальная.'},
   {label:'<b>2. Передача сигнала в мозг.</b> Цитокины действуют на эндотелий сосудов мозга и OVLT, где ГЭБ проницаемее.'},
   {label:'<b>3. Синтез ПГЕ₂.</b> Индуцируются ЦОГ-2 и микросомальная ПГЕ-синтаза-1; ПГЕ₂ диффундирует к нейронам преоптической области.'},
   {label:'<b>4. Установочная точка смещается вверх</b> (ПГЕ₂ через EP3). Температура тела ещё 37 °C, но для центра она теперь «ниже нормы». <span class="tag fact">факт</span> без EP3 у мышей лихорадка резко ослаблена.'},
   {label:'<b>5. Эффекторы</b> (симпатическая система, двигательные пути) поднимают температуру до новой установочной точки.'},
   {label:'<b>6. Жаропонижающие — ингибиторы ЦОГ</b> прерывают цепь на синтезе ПГЕ₂: установочная точка и температура возвращаются. Экзопироген при этом остаётся — причину они не устраняют.'},
   {label:'<b>7. Эндогенные антипиретики</b> (аргинин-вазопрессин, α-МСГ, глюкокортикоиды, антагонист рецептора ИЛ-1) ограничивают подъём — в типичных случаях лихорадка редко выше 41 °C. <span class="tag fact">факт</span>'}];
  StepTL(fig,steps,(tl,i)=>{
    if(i===0){base(tl,-1,36.8,36.8);lit(tl,0);flow(tl,0);lit(tl,1,'-=.3')}
    if(i===1){base(tl,1,36.8,36.8);flow(tl,1);lit(tl,2,'-=.3')}
    if(i===2){base(tl,2,36.8,36.8);flow(tl,2);lit(tl,3,'-=.3')}
    if(i===3){base(tl,3,36.8,36.8);flow(tl,3);lit(tl,4,'-=.3');setp(tl,39.2)}
    if(i===4){base(tl,4,36.8,39.2);flow(tl,4);lit(tl,5,'-=.3');temp(tl,39.2,1.6)}
    if(i===5){base(tl,5,39.2,39.2);tl.to(S.querySelector('#fp-nsaid'),{opacity:1,duration:.4});tl.to(S.querySelector('#fp-x'),{opacity:1,duration:.3});
      tl.to([nd[3],nd[4],nd[5]],{attr:{stroke:'var(--gx-line)',fill:'var(--gx-paper)'},duration:.5,stagger:.15});setp(tl,36.8,.6);temp(tl,36.8,1.6,'-=.2')}
    if(i===6){base(tl,5,39.2,39.2);tl.to(S.querySelector('#fp-endo'),{opacity:1,duration:.4});tl.to(S.querySelector('#fp-cap'),{opacity:1,duration:.4});
      setp(tl,40.6,.8);temp(tl,40.6,1.2,'<');temp(tl,40.3,.6)}
  },{repeatDelay:1.5});
})();

/* ---------- 2. Стадии ---------- */
(function(){
  const fig=document.getElementById('a-fevst');if(!fig)return;const S=fig.querySelector('svg');
  fig.style.setProperty('--gxm-t','24px');fig.style.setProperty('--gxm-ts','22px');fig.style.setProperty('--gxm-tb','24px');
  const y=t=>210-(t-36)*44;
  const seg={norm:`M50 ${y(36.8)} H120`,
    I1:`M120 ${y(36.8)} C135 ${y(36.8)} 145 ${y(36.9)} 150 ${y(37)}`,
    I2:`M150 ${y(37)} C190 ${y(37.6)} 220 ${y(39.4)} 250 ${y(39.5)}`,
    II:`M250 ${y(39.5)} C280 ${y(39.8)} 300 ${y(39.2)} 335 ${y(39.4)} S390 ${y(39.8)} 420 ${y(39.5)}`,
    lys:`M420 ${y(39.5)} C470 ${y(39.4)} 540 ${y(37.4)} 600 ${y(36.8)}`,
    cri:`M420 ${y(39.5)} C432 ${y(39.4)} 440 ${y(36.9)} 455 ${y(36.6)} S520 ${y(36.8)} 600 ${y(36.8)}`};
  let s=`<defs><clipPath id="fs-clip"><rect id="fs-cr" x="40" y="0" width="0" height="230"/></clipPath></defs>
   <rect x="50" y="10" width="550" height="${y(36)-10}" fill="none" stroke="var(--gx-line)"/>
   <rect x="120" y="10" width="130" height="${y(36)-10}" fill="${CS}"/><rect x="250" y="10" width="170" height="${y(36)-10}" fill="${HS}"/>
   <text class="t" x="185" y="38" text-anchor="middle">I подъём</text><text class="t" x="335" y="38" text-anchor="middle">II стояние</text><text class="t" x="510" y="38" text-anchor="middle">III снижение</text>`;
  [37,38,39,40].forEach(t=>s+=`<line x1="50" x2="600" y1="${y(t)}" y2="${y(t)}" stroke="var(--gx-line)" stroke-dasharray="2 4"/><text class="ts" x="42" y="${y(t)+6}" text-anchor="end">${t}</text>`);
  s+=`<path clip-path="url(#fs-clip)" d="M50 ${y(36.8)} H120 V${y(39.5)} H420 V${y(36.8)} H600" fill="none" stroke="var(--gx-fg)" stroke-width="2.5" stroke-dasharray="8 6"/>`;
  Object.entries(seg).forEach(([k,d])=>s+=`<path class="sg" id="fs-${k}" d="${d}" fill="none" stroke="${k==='cri'?COLD:HOT}" stroke-width="4" stroke-linecap="butt"/>`);
  s+=`<circle id="fs-dot" r="8" fill="${HOT}" stroke="var(--gx-paper)" stroke-width="3"/>
   <text class="ts" x="600" y="${y(36)+24}" text-anchor="end">время →</text>
   <text id="fs-say" class="tb" x="16" y="${y(36)+58}"></text>
   <text class="ts" x="16" y="${y(36)+98}">теплопродукция</text><rect id="fs-hp" x="250" y="${y(36)+80}" height="24" rx="6" width="200" fill="${HOT}"/>
   <text class="ts" x="16" y="${y(36)+138}">теплоотдача</text><rect id="fs-hl" x="250" y="${y(36)+120}" height="24" rx="6" width="200" fill="${COLD}"/>`;
  S.setAttribute('viewBox',`0 0 620 ${y(36)+152}`);S.innerHTML=s;
  const P={};Object.keys(seg).forEach(k=>{const p=S.querySelector('#fs-'+k),L=p.getTotalLength();p.style.strokeDasharray=L+' '+(L+10);P[k]={p,L}});
  const cr=S.querySelector('#fs-cr'),dot=S.querySelector('#fs-dot'),hp=S.querySelector('#fs-hp'),hl=S.querySelector('#fs-hl'),say=S.querySelector('#fs-say');
  const SPX=[0,79,82,379,570];/* ширина отсечки пунктира: норма, до скачка, после скачка, конец II, до конца */
  const spGo=(tl,k,d=.5,pos)=>tl.to(cr,{attr:{width:SPX[k]},duration:d,ease:'none'},pos);
  const at=(k,f)=>P[k].p.getPointAtLength(P[k].L*f);
  function draw(tl,k,d,pos){tl.fromTo(P[k].p,{strokeDashoffset:P[k].L},{strokeDashoffset:0,duration:d,ease:'none',
    onUpdate:function(){const pt=at(k,this.progress());dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y)}},pos)}
  const bars=(tl,h,l,pos)=>tl.to(hp,{attr:{width:h},duration:.7},pos).to(hl,{attr:{width:l},duration:.7},'<');
  const txt=(tl,a,pos)=>tl.call(()=>{say.textContent=a},null,pos);
  function base(tl,drawn,spk,h,l){Object.keys(P).forEach(k=>tl.set(P[k].p,{strokeDashoffset:drawn.includes(k)?0:P[k].L}));tl.set(cr,{attr:{width:SPX[spk]}});
    const last=drawn[drawn.length-1];const pt=last?at(last,1):{x:50,y:y(36.8)};tl.set(dot,{attr:{cx:pt.x,cy:pt.y}});tl.set(hp,{attr:{width:h}});tl.set(hl,{attr:{width:l}})}
  const steps=[
   {label:'<b>Норма.</b> Температура тела равна установочной точке (пунктир), теплопродукция уравновешена теплоотдачей.'},
   {label:'<b>I стадия, начало.</b> Установочная точка поднимается скачком. Первой <b>снижается теплоотдача</b>: спазм сосудов кожи — бледная холодная кожа, «гусиная кожа», ощущение холода.'},
   {label:'<b>I стадия.</b> Затем <b>растёт теплопродукция</b>: озноб, мышечная дрожь, тахикардия. Температура догоняет установочную точку с запозданием.'},
   {label:'<b>II стадия (стояние).</b> Теплопродукция ≈ теплоотдача, но на повышенном уровне. Кожа горячая, гиперемированная; суточные колебания сохраняются — по ним определяют тип кривой.'},
   {label:'<b>III стадия, литическое снижение.</b> Установочная точка возвращается к норме, теплоотдача преобладает: расширение сосудов кожи, обильный пот, полиурия. Температура снижается постепенно, за несколько суток.'},
   {label:'<b>III стадия, критическое снижение</b> — за несколько часов. Риск <b>коллапса</b>.'}];
  StepTL(fig,steps,(tl,i)=>{
    if(i===0){base(tl,[],0,200,200);txt(tl,'Норма: баланс, 37 °C');spGo(tl,1,1);draw(tl,'norm',1,'<')}
    if(i===1){base(tl,['norm'],1,200,200);txt(tl,'I: теплоотдача ↓ (спазм сосудов кожи)');spGo(tl,2,.3);bars(tl,200,90);draw(tl,'I1',.8)}
    if(i===2){base(tl,['norm','I1'],2,200,90);txt(tl,'I: теплопродукция ↑ (дрожь, озноб)');bars(tl,340,90);draw(tl,'I2',1.6,'-=.3')}
    if(i===3){base(tl,['norm','I1','I2'],2,340,90);txt(tl,'II: баланс на высоком уровне');spGo(tl,3,2);bars(tl,260,260,'<');draw(tl,'II',2,'<')}
    if(i===4){base(tl,['norm','I1','I2','II'],3,260,260);txt(tl,'III: теплоотдача ↑ (пот, полиурия)');spGo(tl,4,.5);bars(tl,200,340,'<');draw(tl,'lys',2.2)}
    if(i===5){base(tl,['norm','I1','I2','II'],3,260,260);txt(tl,'III критич.: риск коллапса');spGo(tl,4,.4);bars(tl,200,360,'<');draw(tl,'cri',1.2)}
  },{repeatDelay:1.5});
})();
})();
