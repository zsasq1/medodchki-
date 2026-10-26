/* Патанатомия, занятие 9: три GSAP-анимации (фазы воспаления; крупозное и дифтеритическое; абсцесс и флегмона) */
(function(){
if(!window.gsap||!window.StepTL)return;
const NS='http://www.w3.org/2000/svg';
const el=(p,tag,a)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
const say=(tl,node,t,pos)=>tl.call(()=>{node.textContent=t},null,pos);
const NEU='#efe4f6',NEUs='#7a5ca8',NUC='#6a3d9a',MIC='#2f9e5a',PUS='#d9b83c',RBC='#d23a48',TIS='#f2c9c0',TISs='#c98f86',DEAD='#a8a1a0';
function neut(p,x,y){const g=el(p,'g',{});el(g,'circle',{cx:0,cy:0,r:12,fill:NEU,stroke:NEUs,'stroke-width':1.5});
  [[-4,-3],[3,-4],[1,4]].forEach(([a,b])=>el(g,'circle',{cx:a,cy:b,r:3.2,fill:NUC}));gsap.set(g,{x,y});return g}
function microbe(p,x,y,r){const g=el(p,'g',{});el(g,'rect',{x:x-6,y:y-2.5,width:12,height:5,rx:2.5,fill:MIC,transform:`rotate(${r} ${x} ${y})`});g._x=x;g._y=y;return g}

/* ───── 1. Фазы воспаления ───── */
(function(){
const fig=document.getElementById('a-stages');if(!fig)return;const S=fig.querySelector('svg');
S.setAttribute('viewBox','0 0 640 380');fig.style.setProperty('--gxm-ts','25px');fig.style.setProperty('--gxm-tb','28px');
el(S,'rect',{x:10,y:186,width:620,height:186,rx:8,fill:TIS,opacity:.35});
const edema=el(S,'rect',{x:10,y:186,width:620,height:186,rx:8,fill:'#7fb4e8',opacity:0});
const lumen=el(S,'rect',{x:10,y:100,width:620,height:56,fill:'rgba(210,58,72,.10)'});
const rb=el(S,'g',{});const R=[];for(let k=0;k<11;k++)R.push(el(rb,'ellipse',{cx:0,cy:128+((k%3)-1)*12,rx:10,ry:5.5,fill:RBC,opacity:.9}));
const wallT=el(S,'g',{}),wallB=el(S,'g',{});
for(let x=10;x<630;x+=40){el(wallT,'rect',{x,y:92,width:38,height:8,rx:4,fill:'#c97a83'});el(wallB,'rect',{x,y:156,width:38,height:8,rx:4,fill:'#c97a83'})}
const plug=wallB.children[9]; /* x 370–408: здесь откроется щель */
/* клетки ткани */
const cells=[];for(let r=0;r<3;r++)for(let c=0;c<10;c++){const x=40+c*60+(r%2)*28,y=222+r*48;if(x>610)continue;const g=el(S,'g',{});
  const b=el(g,'rect',{x:x-22,y:y-16,width:44,height:32,rx:9,fill:TIS,stroke:TISs,'stroke-width':1.2});el(g,'circle',{cx:x,cy:y,r:5.5,fill:'#9c5a63'});cells.push({g,b,x,y})}
const hurt=cells.filter(c=>Math.hypot(c.x-480,c.y-270)<70);
const medG=el(S,'g',{});const M=[];for(let k=0;k<9;k++)M.push(el(medG,'circle',{cx:0,cy:0,r:4,fill:'#f0b429',stroke:'#a8740a','stroke-width':1}));
const plG=el(S,'g',{});const PL=[];for(let k=0;k<8;k++)PL.push(el(plG,'circle',{cx:0,cy:0,r:5,fill:'#6aa6e0',opacity:0}));
const micG=el(S,'g',{});const MI=[];[[470,262,20],[490,276,-30],[506,258,60],[478,292,80],[512,290,10],[460,282,-60]].forEach(([x,y,r])=>MI.push(microbe(micG,x,y,r)));
const fibG=el(S,'g',{});const FB=[];[[420,236,-20],[540,236,25],[452,322,10],[540,320,-15],[600,276,40]].forEach(([x,y,r])=>{const g=el(fibG,'g',{transform:`rotate(${r} ${x} ${y})`});el(g,'ellipse',{cx:x,cy:y,rx:20,ry:5,fill:'#e9d3a6',stroke:'#a7884a','stroke-width':1.2});el(g,'ellipse',{cx:x,cy:y,rx:6,ry:2.6,fill:'#8a6a32'});FB.push(g)});
const sprout=el(S,'path',{d:'M560 164 C566 200 548 230 560 262 C570 290 600 300 612 320',fill:'none',stroke:'#c97a83','stroke-width':7,'stroke-linecap':'round'});
const L=sprout.getTotalLength();sprout.style.strokeDasharray=L;
const neuG=el(S,'g',{});const N=[neut(neuG,0,0),neut(neuG,0,0),neut(neuG,0,0)];
el(S,'text',{class:'ts',x:18,y:66}).textContent='капилляр (просвет с эритроцитами)';
el(S,'text',{class:'ts',x:18,y:205}).textContent='ткань';
const lab=el(S,'text',{class:'tb',x:320,y:28,'text-anchor':'middle'});
/* поток эритроцитов — отдельный бесконечный твин, скорость меняется по шагам */
R.forEach((r,k)=>gsap.set(r,{x:k*60}));
const flow=gsap.to(R,{x:'+=660',duration:5,ease:'none',repeat:-1,modifiers:{x:gsap.utils.unitize(x=>((parseFloat(x)%660)+660)%660-10)}});
const SPEED=[1,1,.45,.3,.25,.4,.8];
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?flow.play():flow.pause()),{threshold:.1}).observe(fig);
if(matchMedia('(prefers-reduced-motion: reduce)').matches)flow.pause();
function base(tl,i){
  tl.set(hurt.map(c=>c.b),{attr:{fill:i>=1&&i<6?DEAD:TIS}});tl.set(hurt.map(c=>c.g),{opacity:1});
  tl.set(M,{opacity:0});tl.set(PL,{opacity:0});tl.set(plug,{opacity:i>=3?0:1});
  const dil=i>=2;tl.set(wallT,{y:dil?-14:0});tl.set(wallB,{y:dil?14:0});tl.set(lumen,{attr:{y:dil?86:100,height:dil?84:56}});
  tl.set(edema,{opacity:i>=3&&i<6?.22:i>=6?.08:0});
  tl.set(MI,{opacity:i>=1&&i<5?1:0,x:0,y:0,scale:1,transformOrigin:'50% 50%'});
  tl.set(N,{opacity:i>=4?1:0});
  const nAt=i<4?null:i===4?[[150,128],[220,128],[290,128]]:[[466,270],[498,262],[492,292]];
  if(nAt)N.forEach((n,k)=>tl.set(n,{x:nAt[k][0],y:nAt[k][1],scale:1}));
  tl.set(FB,{opacity:i>=6?1:0,scale:1,transformOrigin:'50% 50%'});tl.set(sprout,{strokeDashoffset:i>=6?0:L,opacity:i>=6?1:0});
}
const steps=[
 {label:'<b>Норма.</b> Кровь течёт по капилляру, клетки ткани целы.'},
 {label:'<b>1. Альтерация.</b> Агент (здесь — микробы) повреждает клетки: дистрофия, некроз (серые клетки). Из повреждённых клеток, тучных клеток и плазмы выделяются <b>медиаторы</b> (жёлтые точки) — они запускают всё дальнейшее.'},
 {label:'<b>2. Реакция микроциркуляторного русла.</b> После кратковременного спазма сосуды расширяются (артериальная, затем венозная гиперемия), кровоток замедляется.'},
 {label:'<b>3. Экссудация.</b> Проницаемость стенки растёт (щели между эндотелием) — плазма с белком выходит в ткань: воспалительный отёк, <b>экссудат</b>.'},
 {label:'<b>4. Эмиграция лейкоцитов.</b> Нейтрофилы отходят к стенке (краевое стояние), прилипают, протискиваются между эндотелием и по <b>хемотаксису</b> идут к очагу.'},
 {label:'<b>5. Фагоцитоз.</b> Нейтрофилы (и позже макрофаги) захватывают и переваривают микробы и детрит. Клетки и экссудат в ткани — воспалительный инфильтрат.'},
 {label:'<b>3-я фаза — пролиферация.</b> Размножаются фибробласты и эндотелий, растут новые капилляры — <b>грануляционная ткань</b>; погибшие клетки замещаются, в исходе — рубец.'}];
StepTL(fig,steps,(tl,i)=>{
  base(tl,i);
  if(i===0){say(tl,lab,'норма');tl.to({},{duration:1.4})}
  if(i===1){say(tl,lab,'альтерация');tl.fromTo(MI,{opacity:0,scale:.2},{opacity:1,scale:1,duration:.6,stagger:.08});
    tl.to(hurt.map(c=>c.b),{attr:{fill:DEAD},duration:.8});
    tl.set(M,{opacity:1});tl.fromTo(M,{attr:{cx:k=>hurt[k%hurt.length].x,cy:k=>hurt[k%hurt.length].y}},{attr:{cx:k=>300+k*30,cy:170},duration:1.4,stagger:.08,ease:'power1.inOut'});
    say(tl,lab,'медиаторы → к сосудам')}
  if(i===2){say(tl,lab,'расширение, замедление');tl.to(wallT,{y:-14,duration:1.2,ease:'power2.inOut'});tl.to(wallB,{y:14,duration:1.2,ease:'power2.inOut'},'<');
    tl.to(lumen,{attr:{y:86,height:84},duration:1.2,ease:'power2.inOut'},'<')}
  if(i===3){say(tl,lab,'проницаемость ↑ → экссудат');tl.set(plug,{opacity:1});tl.to(plug,{opacity:0,duration:.5});
    tl.fromTo(PL,{opacity:.9,attr:{cx:389,cy:170}},{attr:{cx:k=>330+k*26,cy:k=>215+(k%3)*40},opacity:.15,duration:1.6,stagger:.12,ease:'power1.out'});
    tl.to(edema,{opacity:.22,duration:1},'-=1')}
  if(i===4){say(tl,lab,'краевое стояние');tl.to(N,{y:158,duration:.8,stagger:.1});
    say(tl,lab,'эмиграция через стенку');N.forEach((n,k)=>{tl.to(n,{x:389,duration:.7});tl.to(n,{y:196,scaleY:.6,scaleX:1.2,duration:.4});tl.to(n,{scaleX:1,scaleY:1,duration:.2})});
    say(tl,lab,'хемотаксис к очагу');tl.to(N[0],{x:466,y:270,duration:.9});tl.to(N[1],{x:498,y:262,duration:.9},'<.1');tl.to(N[2],{x:492,y:292,duration:.9},'<.1')}
  if(i===5){say(tl,lab,'фагоцитоз');MI.forEach((m,k)=>{const n=N[k%3];tl.to(m,{x:()=>gsap.getProperty(n,'x')-m._x,y:()=>gsap.getProperty(n,'y')-m._y,scale:.4,duration:.5},k?'-=.25':undefined);tl.to(m,{opacity:0,duration:.3})});
    tl.to(N,{scale:1.15,duration:.3,yoyo:true,repeat:1})}
  if(i===6){say(tl,lab,'пролиферация → грануляции → рубец');tl.to(FB,{opacity:1,duration:.6,stagger:.15});tl.to(sprout,{opacity:1,duration:.1},'<');tl.to(sprout,{strokeDashoffset:0,duration:1.4},'<');
    tl.to(N,{opacity:.25,duration:.8},'<');tl.to(hurt.map(c=>c.b),{attr:{fill:'#e9d3a6'},duration:1});tl.to(edema,{opacity:.08,duration:.8},'<')}
},{repeatDelay:1.5,onStep:i=>flow.timeScale(SPEED[i])});
})();

/* ───── 2. Крупозное и дифтеритическое ───── */
(function(){
const fig=document.getElementById('a-fib');if(!fig)return;const S=fig.querySelector('svg');
S.setAttribute('viewBox','0 0 640 414');fig.style.setProperty('--gxm-t','25px');fig.style.setProperty('--gxm-ts','23px');fig.style.setProperty('--gxm-tb','28px');
const FIBR='#f4ecc8',FIBRs='#b9a24a',CT='#f0cfc4',CTs='#c99a8c',EP='#f6dfe4',EPs='#c28a96';
function panel(x0,kind){
  const g=el(S,'g',{});el(g,'rect',{x:x0,y:200,width:290,height:130,fill:CT,stroke:CTs});
  for(let k=0;k<6;k++)el(g,'path',{d:`M${x0+20+k*48} 240 q12 20 0 50`,stroke:'#c97a83','stroke-width':4,fill:'none',opacity:.6});
  const film=el(S,'g',{}),keep=el(g,'g',{});const dead=[];
  const lx0=x0+70,lx1=x0+220;
  if(kind==='c'){for(let x=x0;x<x0+290;x+=14.5){const tgt=x>=lx0-1&&x+14<lx1+1?film:keep;const c=el(tgt,'rect',{x,y:155,width:13.5,height:45,rx:3,fill:EP,stroke:EPs});el(tgt,'ellipse',{cx:x+6.75,cy:188,rx:3.5,ry:4.5,fill:'#9c5a63'});if(tgt===film)dead.push(c)}
    el(g,'line',{x1:x0,y1:200,x2:x0+290,y2:200,stroke:'#7b4a52','stroke-width':2.5})}
  else{for(let r=0;r<4;r++)for(let x=x0-(r%2)*14;x<x0+290;x+=29){const xa=Math.max(x,x0),w=Math.min(x+28,x0+290)-xa;if(w<6)continue;const tgt=xa>=lx0-1&&xa+w<=lx1+1?film:keep;
      const c=el(tgt,'rect',{x:xa,y:128+r*18,width:w-1,height:17,rx:r===3?4:7,fill:EP,stroke:EPs});el(tgt,'ellipse',{cx:xa+w/2,cy:136.5+r*18,rx:r<1?6:4,ry:r<1?1.5:3,fill:'#9c5a63'});if(tgt===film)dead.push(c)}
    const band=el(film,'rect',{x:lx0,y:200,width:lx1-lx0,height:38,fill:CT});dead.push(band)}
  const fib=el(film,'g',{opacity:0});const top=kind==='c'?140:112,bot=kind==='c'?158:238;
  for(let k=0;k<26;k++){const ax=lx0+((k*37)%(lx1-lx0)),ay=top+((k*23)%(bot-top)),bx=ax+((k*17)%40)-20,by=ay+((k*13)%20)-6;el(fib,'line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:FIBRs,'stroke-width':2.2,'stroke-linecap':'round'})}
  const sheet=el(fib,'rect',{x:lx0,y:top,width:lx1-lx0,height:kind==='c'?16:14,rx:4,fill:FIBR,stroke:FIBRs,opacity:.95});
  fib.insertBefore(sheet,fib.firstChild);
  const floor=el(S,'path',{d:kind==='c'?`M${lx0} 200 H${lx1}`:`M${lx0} 200 V238 H${lx1} V200`,stroke:kind==='c'?'#e08a95':'#c0283a','stroke-width':kind==='c'?4:5,fill:'none',opacity:0});
  const drops=[];if(kind==='d')for(let k=0;k<5;k++)drops.push(el(S,'circle',{cx:lx0+20+k*28,cy:236,r:5,fill:'#c0283a',opacity:0}));
  S.appendChild(film);
  return {film,fib,dead,floor,drops,cx:(lx0+lx1)/2};
}
const C=panel(18,'c'),D=panel(332,'d');
el(S,'text',{class:'t',x:163,y:350,'text-anchor':'middle'}).textContent='крупозное';
el(S,'text',{class:'ts',x:163,y:378,'text-anchor':'middle'}).textContent='однослойный эпителий';
el(S,'text',{class:'t',x:477,y:350,'text-anchor':'middle'}).textContent='дифтеритическое';
el(S,'text',{class:'ts',x:477,y:378,'text-anchor':'middle'}).textContent='многослойный плоский';
el(S,'text',{class:'ts',x:163,y:318,'text-anchor':'middle','fill-opacity':.7}).textContent='соед. ткань';
el(S,'text',{class:'ts',x:477,y:318,'text-anchor':'middle','fill-opacity':.7}).textContent='соед. ткань';
const resC=el(S,'text',{class:'tb',x:163,y:406,'text-anchor':'middle'}),resD=el(S,'text',{class:'tb',x:477,y:406,'text-anchor':'middle'});
const arr=[C,D].map(p=>{const a=el(S,'g',{opacity:0});el(a,'path',{d:`M${p.cx} 108 V58 M${p.cx-10} 70 L${p.cx} 56 L${p.cx+10} 70`,stroke:'var(--gx-fg)','stroke-width':3,fill:'none','stroke-linecap':'round'});return a});
const lab=el(S,'text',{class:'tb',x:320,y:26,'text-anchor':'middle'});
function base(tl,i){
  [C,D].forEach(p=>{if(i>=1)tl.set(p.dead,{attr:{fill:DEAD}});tl.set(p.fib,{opacity:i>=2?1:0});tl.set(p.film,{y:i>=4?(p===C?-55:-72):0,opacity:i>=4?.35:1});tl.set(p.floor,{opacity:i>=4?1:0});tl.set(p.drops,{opacity:i>=4?1:0})});
  if(i<1){tl.set(C.dead,{attr:{fill:EP}});tl.set(D.dead.slice(0,-1),{attr:{fill:EP}});tl.set(D.dead[D.dead.length-1],{attr:{fill:CT}})}
  tl.set(arr,{opacity:0});tl.call(()=>{resC.textContent=i>=4?'эрозия':'';resD.textContent=i>=4?'глубокая язва':''});
}
const steps=[
 {label:'<b>Две слизистые.</b> Слева — однослойный эпителий (трахея, бронхи); справа — многослойный плоский (зев, миндалины).'},
 {label:'<b>Некроз.</b> Слева погибает только эпителий, базальная мембрана цела. Справа некроз глубокий: весь пласт эпителия и подлежащая ткань.'},
 {label:'<b>Выпадает фибрин.</b> Слева — тонкая плёнка лежит <i>на</i> мёртвом эпителии. Справа фибрин пропитывает некротизированные слои — плёнка «впаяна» в ткань.'},
 {label:'<b>Пробуем снять плёнку.</b> Слева она отходит легко. Справа держится — и отрывается только вместе с мёртвой тканью.'},
 {label:'<b>Итог.</b> Крупозное: поверхностный дефект (эрозия); в гортани отслоившаяся плёнка может закрыть просвет — асфиксия <span class="src">тетрадь, с. 79</span>. Дифтеритическое: глубокая кровоточащая язва → рубец <span class="src">тетрадь, с. 79, преп. 34, 35</span>.'}];
StepTL(fig,steps,(tl,i)=>{
  base(tl,i);
  if(i===0){say(tl,lab,'норма');tl.to({},{duration:1.2})}
  if(i===1){say(tl,lab,'некроз');tl.to(C.dead,{attr:{fill:DEAD},duration:.9});tl.to(D.dead,{attr:{fill:DEAD},duration:1.1,stagger:.02},'<.3')}
  if(i===2){say(tl,lab,'фибрин');tl.fromTo([C.fib,D.fib],{opacity:0},{opacity:1,duration:1.2})}
  if(i===3){say(tl,lab,'снимаем плёнку');tl.to(arr,{opacity:1,duration:.3});
    tl.to(C.film,{y:-55,duration:1,ease:'power2.out'});tl.call(()=>{resC.textContent='снялась легко'});
    for(let k=0;k<2;k++){tl.to(D.film,{y:-7,duration:.25,ease:'power1.out'});tl.to(D.film,{y:0,duration:.25,ease:'power1.in'})}
    tl.call(()=>{resD.textContent='рвётся с тканью'});tl.to(D.film,{y:-72,duration:.9,ease:'power3.in'});
    tl.to([C.floor,D.floor],{opacity:1,duration:.3});tl.to(D.drops,{opacity:1,duration:.4,stagger:.1})}
  if(i===4){say(tl,lab,'эрозия  vs  язва');tl.to({},{duration:2})}
},{repeatDelay:1.5});
})();

/* ───── 3. Абсцесс и флегмона ───── */
(function(){
const fig=document.getElementById('a-pus');if(!fig)return;const S=fig.querySelector('svg');
S.setAttribute('viewBox','0 0 640 388');fig.style.setProperty('--gxm-t','25px');fig.style.setProperty('--gxm-ts','23px');fig.style.setProperty('--gxm-tb','28px');
/* слева — ткань с очагом */
el(S,'rect',{x:14,y:70,width:296,height:260,rx:8,fill:TIS,opacity:.35});
const lc=[];for(let r=0;r<6;r++)for(let c=0;c<7;c++){const x=40+c*41+(r%2)*20,y=96+r*42;if(x>296)continue;const g=el(S,'g',{});el(g,'rect',{x:x-15,y:y-12,width:30,height:24,rx:7,fill:TIS,stroke:TISs});el(g,'circle',{cx:x,cy:y,r:4,fill:'#9c5a63'});lc.push({g,x,y,d:Math.hypot(x-162,y-200)})}
const CX=162,CY=200;
const capF=el(S,'circle',{cx:CX,cy:CY,r:78,fill:'none',stroke:'#e9e2cf','stroke-width':14,opacity:0});
const ring=el(S,'circle',{cx:CX,cy:CY,r:64,fill:'none',stroke:'#c94f5c','stroke-width':12,opacity:0});
const cav=el(S,'circle',{cx:CX,cy:CY,r:0,fill:PUS,stroke:'#b39020','stroke-width':1.5});
const lN=[];for(let k=0;k<8;k++)lN.push(neut(S,0,0));
const lM=[];for(let k=0;k<5;k++)lM.push(microbe(S,CX-14+k*7,CY-6+(k%2)*12,k*35));
/* справа — мышца */
const fibers=[],gaps=[];
for(let r=0;r<7;r++){const y=82+r*36;const f=el(S,'g',{});el(f,'rect',{x:330,y,width:296,height:24,rx:12,fill:'#e7a0a8',stroke:'#b9707a'});
  for(let x=344;x<620;x+=10)el(f,'line',{x1:x,y1:y+3,x2:x,y2:y+21,stroke:'#b9707a','stroke-width':1,opacity:.6});
  el(f,'ellipse',{cx:360+((r*67)%220),cy:y+12,rx:7,ry:3,fill:'#8a4652'});fibers.push(f);
  if(r<6)gaps.push(el(S,'rect',{x:330,y:y+25,width:296,height:10,rx:5,fill:PUS,opacity:.95}))}
gsap.set(gaps,{scaleX:0,transformOrigin:'478px 50%'});
const rN=[];for(let k=0;k<12;k++)rN.push(neut(S,0,0));
const rM=[];for(let k=0;k<5;k++)rM.push(microbe(S,466+k*6,190+(k%2)*8,k*40));
el(S,'text',{class:'t',x:162,y:62,'text-anchor':'middle'}).textContent='абсцесс';
el(S,'text',{class:'t',x:478,y:62,'text-anchor':'middle'}).textContent='флегмона (мышца)';
const resL=el(S,'text',{class:'ts',x:162,y:356,'text-anchor':'middle'}),resR=el(S,'text',{class:'ts',x:478,y:356,'text-anchor':'middle'});
const resL2=el(S,'text',{class:'ts',x:162,y:378,'text-anchor':'middle'}),resR2=el(S,'text',{class:'ts',x:478,y:378,'text-anchor':'middle'});
const lab=el(S,'text',{class:'tb',x:320,y:26,'text-anchor':'middle'});
const angL=k=>k/8*Math.PI*2;
const rPos=k=>{const row=k%6,y=82+row*36+30,x=360+((k*53)%240);return [x,y]};
function base(tl,i){
  tl.set([...lM,...rM],{opacity:i<=1?1:0,scale:1,transformOrigin:'50% 50%'});
  tl.set(lN,{opacity:i>=1?1:0});tl.set(rN,{opacity:i>=1?1:0});
  if(i>=1){lN.forEach((n,k)=>tl.set(n,{x:CX+Math.cos(angL(k))*(i>=2?54:30),y:CY+Math.sin(angL(k))*(i>=2?54:30)}));rN.forEach((n,k)=>{const p=rPos(k);tl.set(n,{x:i>=2?p[0]:478+((k%4)-1.5)*16,y:i>=2?p[1]:200+((k>>2)-1)*16})})}
  tl.set(cav,{attr:{r:i>=2?44:0}});lc.forEach(c=>tl.set(c.g,{opacity:i>=2&&c.d<52?0:1}));
  tl.set(gaps,{scaleX:i>=2?1:0});tl.set(fibers,{opacity:i>=2?.6:1});
  tl.set(ring,{opacity:i>=3?1:0});tl.set(capF,{opacity:i>=4?1:0});
  tl.call(()=>{resL.textContent=i>=3?(i>=4?'грануляции + капсула':'пиогенная мембрана'):'';resL2.textContent=i>=4?'стенка толстая':'';resR.textContent=i>=3?'границ нет':'';resR2.textContent=i>=3?'гной по прослойкам':''});
}
const steps=[
 {label:'<b>Гноеродные микробы</b> (стафилококки, стрептококки и др.) попали в ткань: слева — в паренхиму органа, справа — в мышцу.'},
 {label:'<b>Нейтрофилы стягиваются к очагу</b> (хемотаксис). Их ферменты убивают микробы, но и расплавляют ткань.'},
 {label:'<b>Расплавление ткани (гистолиз) → гной.</b> Слева образуется полость, заполненная гноем. Справа гной растекается по межмышечным прослойкам и расслаивает волокна — миоциты гибнут <span class="src">тетрадь, с. 81, преп. 80</span>.'},
 {label:'<b>Абсцесс отграничен:</b> вокруг полости — пиогенная мембрана (грануляционная ткань), она изнутри выделяет экссудат и отделяет гной от здоровой ткани. <b>Флегмона не отграничена</b> — разлитое воспаление.'},
 {label:'<b>Хронический абсцесс:</b> снаружи созревает соединительнотканная капсула, стенка утолщается. В тетради стенка хронического абсцесса мозга — плотная, до 0,5 см, трёхслойная <span class="src">с. 79, преп. 36</span>. Сам такой абсцесс не заживает; опасен прорывом.'}];
StepTL(fig,steps,(tl,i)=>{
  base(tl,i);
  if(i===0){say(tl,lab,'внедрение микробов');tl.fromTo([...lM,...rM],{opacity:0,scale:.2},{opacity:1,scale:1,duration:.6,stagger:.05})}
  if(i===1){say(tl,lab,'нейтрофилы к очагу');lN.forEach((n,k)=>tl.fromTo(n,{x:CX+Math.cos(angL(k))*150,y:CY+Math.sin(angL(k))*130},{x:CX+Math.cos(angL(k))*30,y:CY+Math.sin(angL(k))*30,duration:1.1},k?'<.05':undefined));
    rN.forEach((n,k)=>tl.fromTo(n,{x:478+((k%4)-1.5)*90,y:k<6?90:320},{x:478+((k%4)-1.5)*16,y:200+((k>>2)-1)*16,duration:1.1},'<.03'))}
  if(i===2){say(tl,lab,'гистолиз → гной');tl.to([...lM,...rM],{opacity:0,scale:.3,duration:.5});
    tl.to(cav,{attr:{r:44},duration:1.4,ease:'power1.out'});lc.filter(c=>c.d<52).forEach(c=>tl.to(c.g,{opacity:0,duration:.5},'<'));
    lN.forEach((n,k)=>tl.to(n,{x:CX+Math.cos(angL(k))*54,y:CY+Math.sin(angL(k))*54,duration:1.4},'<'));
    tl.to(gaps,{scaleX:1,duration:1.8,stagger:.1,ease:'power1.inOut'},'<');rN.forEach((n,k)=>{const p=rPos(k);tl.to(n,{x:p[0],y:p[1],duration:1.6},'<')});tl.to(fibers,{opacity:.6,duration:1},'<.4')}
  if(i===3){say(tl,lab,'отграничен  vs  разлитой');tl.fromTo(ring,{opacity:0,attr:{'stroke-width':2}},{opacity:1,attr:{'stroke-width':12},duration:1});tl.to({},{duration:1})}
  if(i===4){say(tl,lab,'хронический абсцесс');tl.fromTo(capF,{opacity:0,attr:{'stroke-width':2}},{opacity:1,attr:{'stroke-width':14},duration:1.2})}
},{repeatDelay:1.5});
})();
})();
