
/* Фармакология: нервно-мышечный синапс и ганглиоблокаторы (GSAP) */
(function(){
if(!window.gsap||!window.StepTL)return;
const NS='http://www.w3.org/2000/svg';
/* ---------- 1. Нервно-мышечный синапс ---------- */
(function(){
  const fig=document.getElementById('a-nmj');if(!fig)return;const S=fig.querySelector('svg');
  const RX=[200,260,320,380,440],VES=[[245,112],[290,124],[335,108],[380,122],[415,100],[300,82]];
  let s=`<defs><radialGradient id="nmj-ax" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#f7e6c9"/><stop offset="1" stop-color="#e3c391"/></radialGradient>
   <linearGradient id="nmj-mus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a3a0"/><stop offset="1" stop-color="#cf7b78"/></linearGradient>
   <filter id="nmj-gl"><feGaussianBlur stdDeviation="3"/></filter></defs>
  <path d="M262 0 L378 0 L378 54 Q470 62 462 126 Q452 162 320 162 Q188 162 178 126 Q170 62 262 54 Z" fill="url(#nmj-ax)" stroke="#a7834c" stroke-width="2"/>
  <circle id="nmj-imp" cx="320" cy="-10" r="11" fill="#fff4a8" filter="url(#nmj-gl)"/><circle id="nmj-imp2" cx="320" cy="-10" r="5" fill="#ffd23f"/>
  <g id="nmj-ves">${VES.map(([x,y],k)=>`<g data-k="${k}"><circle cx="${x}" cy="${y}" r="16" fill="#fff7e8" stroke="#c8a46a" stroke-width="1.5"/></g>`).join('')}</g>
  <rect x="100" y="216" width="440" height="120" rx="14" fill="url(#nmj-mus)"/>
  <g id="nmj-sarc" stroke="#9e4a49" stroke-width="3" opacity=".55">${Array.from({length:15},(_,k)=>`<line x1="${128+k*28}" y1="250" x2="${128+k*28}" y2="326"/>`).join('')}</g>
  <path id="nmj-mem" d="M100 216 H170 v22 h12 v-22 H230 v22 h12 v-22 H290 v22 h12 v-22 H350 v22 h12 v-22 H410 v22 h12 v-22 H470 v22 h12 v-22 H540" fill="none" stroke="#9e4a49" stroke-width="3"/>
  <g id="nmj-rec">${RX.map(x=>`<g data-x="${x}"><rect class="l" x="${x-12}" y="196" width="10" height="26" rx="3" fill="#6b5bb5"/><rect class="r" x="${x+2}" y="196" width="10" height="26" rx="3" fill="#6b5bb5"/></g>`).join('')}</g>
  <g id="nmj-ache">${[176,296,416].map(x=>`<g transform="translate(${x} 229)"><circle r="7" fill="#2e8b6e"/><path d="M0 0 L8 -5 L8 5 Z" fill="var(--gx-paper)"/></g>`).join('')}</g>
  <g id="nmj-ach"></g><g id="nmj-na"></g><g id="nmj-blk"></g><g id="nmj-sux"></g>
  <g id="nmj-x" opacity="0">${[176,296,416].map(x=>`<path d="M${x-10} 219 l20 20 M${x+10} 219 l-20 20" stroke="#c0392b" stroke-width="3"/>`).join('')}</g>
  <text class="tb" x="320" y="30" text-anchor="middle">нервное окончание</text>
  <text class="tb" x="320" y="296" text-anchor="middle" style="fill:#fff;paint-order:stroke;stroke:#9e4a49;stroke-width:5px">мышечное волокно</text>
  <text id="nmj-st" class="tb" x="320" y="364" text-anchor="middle"></text>`;
  S.setAttribute('viewBox','96 0 448 372');S.innerHTML=s;
  const ach=S.querySelector('#nmj-ach'),na=S.querySelector('#nmj-na'),blk=S.querySelector('#nmj-blk'),sux=S.querySelector('#nmj-sux');
  const A=[];VES.forEach(([x,y],k)=>{for(let j=0;j<3;j++){const c=document.createElementNS(NS,'circle');const hx=x+[-6,5,0][j],hy=y+[-4,-3,6][j];c.setAttribute('r',4);c.setAttribute('fill','#e0a020');c.setAttribute('stroke','#8a5a00');
    c.dataset.hx=hx;c.dataset.hy=hy;c.setAttribute('cx',hx);c.setAttribute('cy',hy);ach.appendChild(c);A.push(c)}});
  const N=[];RX.forEach(x=>{for(let j=0;j<2;j++){const t=document.createElementNS(NS,'text');t.textContent='Na⁺';t.setAttribute('class','ts');t.setAttribute('x',x-10+j*4);t.setAttribute('y',190);t.setAttribute('fill','#1d55b0');t.style.opacity=0;na.appendChild(t);N.push(t)}});
  const B=RX.map(x=>{const r=document.createElementNS(NS,'rect');r.setAttribute('x',x-9);r.setAttribute('y',176);r.setAttribute('width',18);r.setAttribute('height',14);r.setAttribute('rx',2);r.setAttribute('fill','#3c3c3c');r.style.opacity=0;blk.appendChild(r);return r});
  const X=RX.map(x=>{const g=document.createElementNS(NS,'path');g.setAttribute('d',`M${x} 174 l8 8 l-8 8 l-8 -8 Z`);g.setAttribute('fill','#c0392b');g.style.opacity=0;sux.appendChild(g);return g});
  const L=[...S.querySelectorAll('#nmj-rec .l')],R=[...S.querySelectorAll('#nmj-rec .r')],sarc=S.querySelector('#nmj-sarc'),mem=S.querySelector('#nmj-mem'),st=S.querySelector('#nmj-st'),imp=[S.querySelector('#nmj-imp'),S.querySelector('#nmj-imp2')],xx=S.querySelector('#nmj-x');
  const say=(tl,t,pos)=>tl.call(()=>{st.textContent=t},null,pos);
  const site=(k)=>({cx:RX[k%5]+(k%2?5:-5),cy:186+(k%3)*3}), cleft=(k)=>({cx:150+((k*37)%380),cy:172+((k*13)%26)});
  function reset(tl){tl.set(A,{attr:{cx:i=>A[i].dataset.hx,cy:i=>A[i].dataset.hy},opacity:1});tl.set(L,{x:0});tl.set(R,{x:0});tl.set(N,{opacity:0,y:0});tl.set(B,{opacity:0,y:-60});tl.set(X,{opacity:0,y:-60});
    tl.set(sarc,{scaleX:1,svgOrigin:'320 288'});tl.set(mem,{attr:{stroke:'#9e4a49'}});tl.set(imp,{attr:{cy:-10},opacity:1});tl.set(xx,{opacity:0});say(tl,'')}
  const open=(tl,pos,on=true)=>{tl.to(L,{x:on?-5:0,duration:.35},pos);tl.to(R,{x:on?5:0,duration:.35},pos)};
  const naIn=(tl,pos)=>{tl.fromTo(N,{opacity:1,y:0},{opacity:0,y:58,duration:1,stagger:.06,ease:'power1.in'},pos)};
  const contract=(tl,pos,k=.86)=>{tl.to(sarc,{scaleX:k,duration:.45,ease:'power2.out'},pos)};
  const release=(tl,pos)=>{tl.to(A,{attr:{cx:i=>cleft(i).cx,cy:i=>cleft(i).cy},duration:1,stagger:.02,ease:'power1.out'},pos)};
  const bind=(tl,pos,n=10)=>{tl.to(A.slice(0,n),{attr:{cx:i=>site(i).cx,cy:i=>site(i).cy},duration:.7,stagger:.03},pos)};
  const steps=[
   {label:'<b>1.</b> Нервный импульс приходит к окончанию двигательного нерва.'},
   {label:'<b>2.</b> Везикулы сливаются с мембраной, ацетилхолин (АХ) выходит в синаптическую щель.'},
   {label:'<b>3.</b> АХ связывается с Nm-холинорецепторами. Открывается собственный ионный канал рецептора, катионы (Na⁺) входят в волокно — деполяризация концевой пластинки, волокно сокращается.'},
   {label:'<b>4.</b> Ацетилхолинэстераза расщепляет АХ: каналы закрываются, волокно расслабляется. <span class="tag t-dis">учебн.</span>'},
   {label:'<b>5. Антидеполяризующий миорелаксант</b> конкурентно блокирует Nm: АХ не может связаться, деполяризации нет — паралич без фасцикуляций. <span class="tag t-dis">учебн.</span>'},
   {label:'<b>6. Неостигмин</b> (после атропина) угнетает ацетилхолинэстеразу: АХ накапливается и вытесняет миорелаксант — блок снимается. <span class="tag t-dis">учебн.</span>'},
   {label:'<b>7. Деполяризующий миорелаксант (суксаметоний)</b> вызывает стойкую деполяризацию концевой пластинки: сначала фасцикуляции, затем паралич. Ацетилхолинэстераза его не разрушает, его гидролизует псевдохолинэстераза крови <span class="src">РЛС</span>.'}];
  StepTL(fig,steps,(tl,i)=>{reset(tl);
    if(i===0){say(tl,'норма');tl.to(imp,{attr:{cy:96},duration:1.2,ease:'power1.in'});tl.to(imp,{opacity:0,duration:.3})}
    if(i===1){say(tl,'норма');tl.set(imp,{opacity:0});release(tl,'+=0')}
    if(i===2){say(tl,'норма');tl.set(imp,{opacity:0});tl.set(A,{attr:{cx:k=>cleft(k).cx,cy:k=>cleft(k).cy}});bind(tl,'+=0');open(tl,'-=.2');tl.to(mem,{attr:{stroke:'#e0a020'},duration:.3},'<');naIn(tl,'<');contract(tl,'-=.5')}
    if(i===3){say(tl,'норма');tl.set(imp,{opacity:0});tl.set(A,{attr:{cx:k=>site(k).cx,cy:k=>site(k).cy}});tl.set(L,{x:-5});tl.set(R,{x:5});tl.set(sarc,{scaleX:.86});tl.set(mem,{attr:{stroke:'#e0a020'}});
      tl.to(A,{attr:{cx:k=>[176,296,416][k%3],cy:229},duration:.8,stagger:.03}).to(A,{opacity:0,duration:.3});open(tl,'-=.3',false);tl.to(mem,{attr:{stroke:'#9e4a49'},duration:.3},'<');tl.to(sarc,{scaleX:1,duration:.5},'<')}
    if(i===4){say(tl,'антидеполяризующий блок');tl.set(imp,{opacity:0});tl.to(B,{opacity:1,y:0,duration:.7,stagger:.08});tl.to(imp,{opacity:1,duration:.01});tl.fromTo(imp,{attr:{cy:-10}},{attr:{cy:96},duration:.8});tl.set(imp,{opacity:0});release(tl,'+=0');
      tl.to(A,{attr:{cy:k=>168+(k%4)*3},duration:.5},'+=.1');say(tl,'АХ не связывается — сокращения нет')}
    if(i===5){say(tl,'неостигмин + блок');tl.set(imp,{opacity:0});tl.set(B,{opacity:1,y:0});tl.set(A,{attr:{cx:k=>cleft(k).cx,cy:k=>cleft(k).cy}});tl.to(xx,{opacity:1,duration:.4});
      tl.to(A,{attr:{cx:k=>site(k).cx,cy:k=>site(k).cy-6},duration:.8,stagger:.02},'+=.3');tl.to(B,{y:-50,opacity:0,duration:.6,stagger:.06});bind(tl,'-=.2',15);open(tl,'-=.2');tl.to(mem,{attr:{stroke:'#e0a020'},duration:.3},'<');naIn(tl,'<');contract(tl,'-=.6')}
    if(i===6){say(tl,'деполяризующий блок');tl.set(imp,{opacity:0});tl.set(A,{opacity:0});tl.to(X,{opacity:1,y:0,duration:.7,stagger:.06});open(tl,'-=.1');tl.to(mem,{attr:{stroke:'#e0a020'},duration:.3},'<');naIn(tl,'<');
      tl.to(sarc,{keyframes:[{scaleX:.93,duration:.08},{scaleX:1,duration:.08},{scaleX:.95,duration:.08},{scaleX:1,duration:.08},{scaleX:.94,duration:.08},{scaleX:1,duration:.1}]});
      say(tl,'фасцикуляции → паралич','+=.2');tl.to(sarc,{opacity:.35,duration:.6})}
  },{repeatDelay:1.5});
})();

/* ---------- 2. Ганглиоблокаторы: выключается преобладающий тонус ---------- */
(function(){
  const fig=document.getElementById('a-gang');if(!fig)return;const S=fig.querySelector('svg');
  const O=[['Артериолы и вены','С','Расширение, ↓АД,|ортостатическая гипотензия'],['Сердце','П','Тахикардия'],['Глаз','П','Мидриаз, паралич аккомодации'],['ЖКТ','П','↓ моторики, вплоть до атонии'],['Мочевой пузырь','П','Атония, задержка мочи'],['Слюнные железы','П','Сухость во рту'],['Бронхи','П','Расширение']];
  const BX=236,BW=170;let y=58,s=`<circle cx="18" cy="20" r="7" fill="#c0392b"/><text class="ts" x="32" y="26">симпатический тонус</text><circle cx="18" cy="44" r="7" fill="#1d55b0"/><text class="ts" x="32" y="50">парасимпатический тонус</text>`,ys=[];
  O.forEach(([o,d,e],k)=>{const ln=e.split('|');ys.push(y);
    s+=`<line x1="8" x2="432" y1="${y}" y2="${y}" stroke="var(--gx-line)"/>
     <text class="tb" x="12" y="${y+30}">${o}</text>
     <circle cx="${BX-12}" cy="${y+16}" r="6" fill="#c0392b"/><circle cx="${BX-12}" cy="${y+34}" r="6" fill="#1d55b0"/>
     <rect class="bs" x="${BX}" y="${y+11}" height="10" rx="3" width="${d==='С'?BW:50}" fill="#c0392b" opacity=".85"/>
     <rect class="bp" x="${BX}" y="${y+29}" height="10" rx="3" width="${d==='П'?BW:50}" fill="#1d55b0" opacity=".85"/>
     <path class="xg" d="M${BX-20} ${y+8} l16 16 M${BX-4} ${y+8} l-16 16 M${BX-20} ${y+26} l16 16 M${BX-4} ${y+26} l-16 16" stroke="var(--gx-fg)" stroke-width="2.6" style="opacity:0"/>
     <text class="ef t" x="12" y="${y+62}" style="opacity:0;fill:var(--gx-acc)">${ln.map((l,j)=>`<tspan x="12" dy="${j?22:0}">${l}</tspan>`).join('')}</text>`;
    y+=74+(ln.length-1)*22});
  S.setAttribute('viewBox',`0 0 440 ${y+4}`);S.style.maxWidth='560px';S.innerHTML=s;
  const bs=[...S.querySelectorAll('.bs')],bp=[...S.querySelectorAll('.bp')],ef=[...S.querySelectorAll('.ef')],xg=[...S.querySelectorAll('.xg')];
  StepTL(fig,[
    {label:'<b>До введения.</b> Органы получают и симпатические, и парасимпатические импульсы; у каждого органа один из тонусов преобладает (кружки — ганглии, полосы — сила тонуса). Какой тонус преобладает — учебное объяснение <span class="tag t-dis">учебн.</span>.'},
    {label:'<b>Ганглиоблокатор</b> блокирует Nn-холинорецепторы симпатических и парасимпатических ганглиев — передача выключается в обоих отделах <span class="src">РЛС: азаметония бромид</span>.'},
    {label:'<b>Итог:</b> в каждом органе выключается преобладавший тонус — эффект противоположен ему. Перечень эффектов — <span class="src">РЛС: азаметония бромид</span>.'}],
  (tl,i)=>{tl.set(bs,{attr:{width:k=>O[k][1]==='С'?BW:50}});tl.set(bp,{attr:{width:k=>O[k][1]==='П'?BW:50}});tl.set(ef,{opacity:0,x:-10});tl.set(xg,{opacity:0});tl.set([...bs,...bp],{opacity:.85});
    if(i===0){tl.fromTo([...bs,...bp],{scaleX:.2,transformOrigin:'0 50%'},{scaleX:1,duration:.8,stagger:.03})}
    if(i===1){tl.to(xg,{opacity:1,duration:.4,stagger:.05});tl.to([...bs,...bp],{attr:{width:8},opacity:.35,duration:.9,stagger:.04},'+=.2')}
    if(i===2){tl.set(xg,{opacity:1});tl.set([...bs,...bp],{attr:{width:8},opacity:.35});tl.to(ef,{opacity:1,x:0,duration:.5,stagger:.25})}
  });
})();
})();
