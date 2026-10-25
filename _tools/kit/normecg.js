/* normecg.js — разбор нормальной ЭКГ: элементы цикла (зубцы, сегменты, интервалы), 12 отведений в норме, тренажёр «что подсвечено».
   Нормы — кардио.pdf, с. 88–92. Кривая — учебная схема, построена так, чтобы все величины укладывались в нормы методички.
   Разметка: <div id="ne-a"></div><div id="ne-b"></div><div id="ne-c"></div>; вызов NormECG({a,b,c}). */
(function(){
const SRC=p=>`<span class="src">кардио.pdf, с. ${p}</span>`,U='<span class="tag t-dis">учебн.</span>';
const f2=x=>x.toFixed(2).replace('.',','),f1=x=>(Math.round(x*10)/10+'').replace('.',',');
const lerp=(pts,t)=>{if(t<=pts[0][0]||t>=pts[pts.length-1][0])return 0;for(let i=1;i<pts.length;i++)if(t<=pts[i][0]){const [a,va]=pts[i-1],[b,vb]=pts[i],k=(t-a)/(b-a),s=k*k*(3-2*k);return va+(vb-va)*(.35*k+.65*s)}return 0};
/* один нормальный цикл во II отведении: начало QRS = q */
function beatII(q){const P=[q-.16,q-.07],Q=[q,q+.0143],R=[q+.0143,q+.0604],S=[q+.0604,q+.09],T=[q+.19,q+.37];
  return{P,PQs:[P[1],q],PQ:[P[0],q],Q,R,S,QRS:[q,q+.09],ST:[q+.09,T[0]],T,QT:[q,T[1]],
    v(t){if(t>=P[0]&&t<=P[1])return .15*Math.sin(Math.PI*(t-P[0])/(P[1]-P[0]))**2*1.0;
      if(t>=q&&t<=q+.09)return lerp([[q,0],[q+.012,-.1],[q+.04,1.1],[q+.065,-.25],[q+.09,0]],t);
      if(t>=T[0]&&t<=T[1]){const pk=T[0]+.11;return t<pk?.3*Math.sin(Math.PI/2*(t-T[0])/.11)**2:.3*Math.cos(Math.PI/2*(t-pk)/(T[1]-pk))**2}return 0}}}
function strip(qs){const B=qs.map(beatII);return{B,v:t=>{let s=0;for(const b of B)s+=b.v(t);return s}}}
/* ---------- элементы ---------- */
const EL=[
 {k:'P',name:'Зубец P',kind:'wave',amp:.15,
  what:'Возбуждение (деполяризацию) предсердий: восходящая часть — правого, нисходящая — левого '+SRC(88)+'.',
  where:'Первый небольшой округлый зубец цикла, стоит перед QRS и отделён от него ровным отрезком (сегментом PQ).',
  norm:['длительность не больше 0,10 с','амплитуда не больше 2,5 мм','форма туповершинная (при 50 мм/с), не заострённая','всегда (+) во II, (−) в aVR'],np:'88',
  diff:'Не путать с T: P стоит перед QRS, маленький и симметричный; T — после QRS, крупнее и асимметричный.'},
 {k:'PQs',name:'Сегмент PQ',kind:'seg',
  what:'Время проведения после окончания возбуждения предсердий — по AV-соединению к желудочкам; на ЭКГ это изолиния '+SRC(88)+'.',
  where:'От конца P до начала Q (если Q нет — до начала R).',norm:['лежит на изоэлектрической линии'],np:'88',
  diff:'Сегмент — это только ровный отрезок без зубцов. Интервал PQ включает ещё и сам P.'},
 {k:'PQ',name:'Интервал PQ',kind:'int',
  what:'Распространение возбуждения по предсердиям и AV-соединению до желудочков '+SRC(88)+'.',
  where:'От начала P до начала Q; если Q нет — до начала R.',norm:['0,12–0,20 с'],np:'88',
  diff:'Длиннее 0,20 с — AV-блокада I степени (с. 101); короче 0,12 с — предсердный ритм или WPW (с. 95, 104).'},
 {k:'Q',name:'Зубец Q',kind:'wave',amp:-.1,
  what:'Возбуждение межжелудочковой перегородки '+SRC(88)+'.',where:'Первый отрицательный зубец комплекса QRS, стоит перед R.',
  norm:['глубина не больше ¼ R','длительность до 0,03 с','заострённый, без зазубрин','в V1–V3 его быть не должно','в aVR может быть глубоким и широким, вплоть до QS'],np:'88',
  diff:'Q — отрицательный зубец до R, S — после R. Если хоть одно требование нарушено, Q называют патологическим (признак инфаркта, с. 88, 108).'},
 {k:'R',name:'Зубец R',kind:'wave',amp:1.1,
  what:'Почти полное возбуждение желудочков '+SRC(89)+'.',where:'Первый положительный зубец комплекса QRS — самый высокий острый пик цикла.',
  norm:['регистрируется во всех отведениях; в aVR может быть малым или отсутствовать','амплитуда 5–15 мм','остроконечный, без зазубрин','в грудных нарастает от V1 к V4, затем уменьшается к V6','в отведениях от конечностей по R определяют электрическую ось'],np:'89',
  diff:'Любой положительный зубец QRS называется R; второй положительный — R′ (так бывает при блокаде ножки, с. 102).'},
 {k:'S',name:'Зубец S',kind:'wave',amp:-.25,
  what:'Возбуждение базальных отделов — окончание возбуждения желудочков '+SRC(89)+'.',where:'Отрицательный зубец сразу после R.',
  norm:['в грудных отведениях уменьшается от V1 к V4','в V5–V6 должен отсутствовать','R = S — переходная зона, в норме в V3'],np:'89',
  diff:'S в V5–V6 бывает при повороте сердца против часовой стрелки, увеличении правых отделов, блокаде правой ножки (с. 89).'},
 {k:'QRS',name:'Комплекс QRS',kind:'int',
  what:'Деполяризацию желудочков '+SRC(88)+'.',where:'От начала Q (или R, если Q нет) до конца S (или R, если S нет).',norm:['0,06–0,10 с'],np:'88',
  diff:'Шире 0,10 с — блокада ножки (0,10–0,12 — неполная, > 0,12 — полная), желудочковый комплекс (с. 96, 102).'},
 {k:'ST',name:'Сегмент ST',kind:'seg',
  what:'Желудочки полностью охвачены возбуждением, разности потенциалов нет '+SRC(89)+'.',where:'От конца QRS (точка окончания S) до начала T.',
  norm:['на изолинии','в V1–V3 допускается подъём не больше 2 мм','в V5–V6 допускается снижение не больше 0,5 мм'],np:'89',
  diff:'Подъём ST — повреждение (острейшая и острая стадии ИМ), депрессия больше 1 мм — ишемия (с. 107–108).'},
 {k:'T',name:'Зубец T',kind:'wave',amp:.3,
  what:'Процесс быстрой реполяризации желудочков '+SRC(89)+'.',where:'Широкая пологая волна после сегмента ST.',
  norm:['по направлению совпадает с R, т.е. (+); в aVR (−)','в aVL может быть (−) при вертикальной оси, в III — при горизонтальной','высота в отведениях от конечностей около 5 мм, в грудных до 15 мм','T<sub>V6</sub> > T<sub>V1</sub>','туповершинный, асимметричный'],np:'89',
  diff:'Асимметрия: подъём пологий, спуск круче '+U+'. Симметричный остроконечный T — признак ишемии (с. 107).'},
 {k:'QT',name:'Интервал QRST (QT)',kind:'int',
  what:'Электрическую систолу желудочков '+SRC(89)+'.',where:'От начала Q до конца T.',norm:['до 0,40 с, меняется с ЧСС'],np:'89',
  diff:'Не путать с сегментом ST: QRST включает и QRS, и T.'},
 {k:'RR',name:'Интервал R–R',kind:'int',
  what:'Длительность одного сердечного цикла '+SRC(89)+'.',where:'Между вершинами двух соседних R.',
  norm:['около 0,80 с при ЧСС ≈ 70 в мин','ЧСС = 60 / R–R (с)','ритм правильный, если R–R отличаются не больше чем на 0,10 с','ЧСС в норме 60–90 в мин'],np:'89–91',
  diff:'При 50 мм/с 1 мм = 0,02 с, при 25 мм/с — 0,04 с (с. 91).'},
 {k:'iso',name:'Изолиния',kind:'iso',
  what:'Нулевой уровень, когда в сердце нет разности потенциалов.',where:'Ровные отрезки: сегмент PQ '+SRC(88)+' и отрезок TP от конца T до следующего P '+U+'.',
  norm:['от неё отсчитывают амплитуду зубцов и смещение ST'],np:'88',
  diff:'Если изолиния «дрожит» волнами и P нет — фибрилляция предсердий; если вместо неё «пила» — трепетание (с. 99).'}
];
const BYK=Object.fromEntries(EL.map(e=>[e.k,e]));
const fact=(b,k)=>{const r=b[k];if(!r)return'';const d=r[1]-r[0];
  return{P:`P: ${f2(d)} с, 1,5 мм`,PQs:`сегмент PQ: ${f2(d)} с`,PQ:`PQ: ${f2(d)} с`,Q:`Q: 1 мм при R 11 мм (меньше ¼), ${f2(d)} с`,R:'R: 11 мм',S:'S: 2,5 мм',QRS:`QRS: ${f2(d)} с`,ST:`ST: ${f2(d)} с, на изолинии`,T:`T: 3 мм, (+), асимметричный`,QT:`QRST: ${f2(d)} с`}[k]||''};
/* ---------- рисование ---------- */
function drawA(svg,o){/* o: {qs, t0,t1, mmps, sel, labels} */
  const S=strip(o.qs),mm=o.mmps,X=t=>(t-o.t0)*mm,W=X(o.t1),base=15,Y=v=>base-v*10,H=26;let d='';
  for(let t=o.t0;t<=o.t1+1e-9;t+=.001)d+=(d?'L':'M')+X(t).toFixed(2)+' '+Y(S.v(t)).toFixed(2);
  let g='';const sel=o.sel&&BYK[o.sel],b=S.B[o.focus??0];
  if(sel){const band=(r,cls)=>`<rect x="${X(r[0])}" y="0" width="${X(r[1])-X(r[0])}" height="${H}" class="${cls}"/>`;
    const seg=r=>{let s='';for(let t=r[0];t<=r[1]+1e-9;t+=.0005)s+=(s?'L':'M')+X(t).toFixed(2)+' '+Y(S.v(t)).toFixed(2);return`<path d="${s}" class="ne-hl"/>`};
    const brk=(r,y,txt)=>`<path d="M${X(r[0])} ${y-1.2}V${y}H${X(r[1])}V${y-1.2}" class="ne-br"/><text x="${(X(r[0])+X(r[1]))/2}" y="${y+2.5}" class="ne-bt">${txt}</text>`;
    if(o.sel==='RR'){const r=[S.B[0].QRS[0]+.04,S.B[1].QRS[0]+.04];g+=`<path d="M${X(r[0])} 2V${H-3} M${X(r[1])} 2V${H-3}" class="ne-br" stroke-dasharray="1 1"/>`+brk(r,H-4.6,o.labels===false?'':f2(r[1]-r[0])+' с')}
    else if(o.sel==='iso'){S.B.forEach((bb,i)=>{g+=band(bb.PQs,'ne-band')+seg(bb.PQs);const nx=S.B[i+1];if(nx)g+=band([bb.T[1],nx.P[0]],'ne-band')+seg([bb.T[1],nx.P[0]])});g+=`<line x1="0" x2="${W}" y1="${base}" y2="${base}" class="ne-iso"/>`}
    else{const r=b[o.sel];g+=band(r,'ne-band')+seg(r);g+=brk(r,H-4.6,o.labels===false?'':f2(r[1]-r[0])+' с');
      if(sel.kind==='wave'){const tp=o.sel==='P'?(r[0]+r[1])/2:o.sel==='T'?b.T[0]+.11:o.sel==='Q'?b.QRS[0]+.012:o.sel==='R'?b.QRS[0]+.04:b.QRS[0]+.065,v=S.v(tp),xp=X(tp)+(o.sel==='R'?2.2:1.6);
        g+=`<path d="M${xp} ${base}V${Y(v)}" class="ne-dim"/><path d="M${xp-.8} ${base}H${xp+.8}M${xp-.8} ${Y(v)}H${xp+.8}" class="ne-dim"/>`;if(o.labels!==false)g+=`<text x="${xp+1.2}" y="${v>0?Y(v)-.6:Y(v)+2.4}" class="ne-bt" text-anchor="start">${f1(Math.abs(v)*10)} мм</text>`}}}
  let lab='';if(o.letters!==false)S.B.forEach(bb=>{const L=[['P',(bb.P[0]+bb.P[1])/2,.15,-1.6],['Q',bb.QRS[0]+.012,-.1,3.2],['R',bb.QRS[0]+.04,1.1,-1.4],['S',bb.QRS[0]+.065,-.25,3.4],['T',bb.T[0]+.11,.3,-1.6]];
    L.forEach(([n,t,v,dy])=>{if(t<o.t0||t>o.t1)return;lab+=`<text x="${X(t)}" y="${Y(v)+dy}" class="ne-l${o.sel===n?' on':''}">${n}</text>`})});
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML=`<defs><pattern id="${svg.id}-p" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M1 0V5M2 0V5M3 0V5M4 0V5M0 1H5M0 2H5M0 3H5M0 4H5" class="qz-g1"/><path d="M0 0H5M0 0V5" class="qz-g5"/></pattern></defs>
    <rect width="${W}" height="${H}" class="qz-bg"/><rect width="${W}" height="${H}" fill="url(#${svg.id}-p)"/>${g}<path d="${d}" class="qz-tr"/>${lab}`;
  return S}
function card(e,b){return`<h4>${e.name}</h4><dl class="ne-dl"><dt>Что отражает</dt><dd>${e.what}</dd><dt>Где искать</dt><dd>${e.where}</dd>
  <dt>Норма ${SRC(e.np)}</dt><dd><ul>${e.norm.map(x=>`<li>${x}</li>`).join('')}</ul></dd>${b&&fact(b,e.k)?`<dt>На схеме</dt><dd>${fact(b,e.k)}</dd>`:''}<dt>Не путать</dt><dd>${e.diff}</dd></dl>`}
/* ---------- A: один цикл по элементам ---------- */
function partA(root){
  root.innerHTML=`<div class="ne-chips" role="group" aria-label="Элемент ЭКГ">${EL.map(e=>`<button type="button" data-k="${e.k}">${e.name.replace('Зубец ','').replace('Комплекс ','').replace('Интервал ','инт. ').replace('Сегмент ','сегм. ')}</button>`).join('')}</div>
   <div class="qz-strip ne-wide"><svg id="ne-svgA" class="qz-svg" role="img" aria-label="Нормальный кардиоцикл во II отведении"></svg></div>
   <p class="qz-scale">II отведение · 50 мм/с: маленькая клетка = 0,02 с, большая = 0,10 с · 10 мм/мВ: маленькая клетка = 0,1 мВ</p>
   <div class="ne-tour"><button type="button" data-a="tour">▶ по порядку</button><button type="button" data-a="prev">◀</button><button type="button" data-a="next">▶</button><span class="ne-cnt"></span></div>
   <div class="ne-card" aria-live="polite"></div>`;
  const svg=root.querySelector('svg'),cardEl=root.querySelector('.ne-card'),chips=[...root.querySelectorAll('.ne-chips button')],cnt=root.querySelector('.ne-cnt');let i=0,timer=null;
  const show=k=>{i=EL.findIndex(e=>e.k===k);const S=drawA(svg,{qs:[.26,1.06],t0:0,t1:1.2,mmps:50,sel:k});cardEl.innerHTML=card(EL[i],S.B[0]);chips.forEach(c=>c.setAttribute('aria-pressed',c.dataset.k===k));cnt.textContent=`${i+1} из ${EL.length}`};
  root.querySelector('.ne-chips').addEventListener('click',e=>{const b=e.target.closest('button');if(b){stop();show(b.dataset.k)}});
  const stop=()=>{if(timer){clearInterval(timer);timer=null;root.querySelector('[data-a=tour]').textContent='▶ по порядку'}};
  root.querySelector('.ne-tour').addEventListener('click',e=>{const a=e.target.closest('button')?.dataset.a;if(!a)return;
    if(a==='tour'){if(timer){stop();return}e.target.textContent='❚❚ пауза';show(EL[(i+1)%EL.length].k);timer=setInterval(()=>show(EL[(i+1)%EL.length].k),4500)}
    else{stop();show(EL[(i+(a==='next'?1:-1)+EL.length)%EL.length].k)}});
  show('P')}
/* ---------- B: 12 отведений ---------- */
const LD={I:{p:.08,q:[[0,0],[.012,-.05],[.04,.7],[.065,-.1],[.09,0]],t:.2},II:{p:.15,q:[[0,0],[.012,-.1],[.04,1.1],[.065,-.25],[.09,0]],t:.3},III:{p:.07,q:[[0,0],[.014,-.05],[.042,.5],[.066,-.15],[.09,0]],t:.1},
 aVR:{p:-.1,q:[[0,0],[.042,-.85],[.09,0]],t:-.25},aVL:{p:.03,q:[[0,0],[.035,.35],[.062,-.2],[.09,0]],t:.1},aVF:{p:.1,q:[[0,0],[.013,-.07],[.041,.8],[.066,-.18],[.09,0]],t:.2},
 V1:{p:.07,q:[[0,0],[.025,.25],[.055,-1.0],[.09,0]],t:.1},V2:{p:.08,q:[[0,0],[.028,.45],[.058,-1.2],[.09,0]],t:.4},V3:{p:.08,q:[[0,0],[.03,.8],[.06,-.8],[.09,0]],t:.45},
 V4:{p:.08,q:[[0,0],[.036,1.4],[.065,-.4],[.09,0]],t:.45},V5:{p:.07,q:[[0,0],[.012,-.08],[.038,1.3],[.075,0]],t:.35},V6:{p:.06,q:[[0,0],[.012,-.08],[.038,1.1],[.075,0]],t:.3}};
const GRID=[['I','II','III'],['aVR','aVL','aVF'],['V1','V2','V3'],['V4','V5','V6']];
const ext=(pts,s)=>pts.reduce((m,[,v])=>s>0?Math.max(m,v):Math.min(m,v),0);
function leadV(l,t){const L=LD[l],q=.2;let v=0;if(t>=q-.16&&t<=q-.07)v+=L.p*Math.sin(Math.PI*(t-q+.16)/.09)**2;if(t>=q&&t<=q+.09)v+=lerp(L.q.map(([a,b])=>[q+a,b]),t);
  if(t>=q+.19&&t<=q+.37){const pk=q+.30;v+=t<pk?L.t*Math.sin(Math.PI/2*(t-q-.19)/.11)**2:L.t*Math.cos(Math.PI/2*(t-pk)/.07)**2}return v}
const VIEWS={
 p:{name:'P',note:`P всегда (+) во II и (−) в aVR; не шире 0,10 с и не выше 2,5 мм ${SRC(88)}.`,mark:{II:'P (+) всегда',aVR:'P (−)'},el:'P'},
 r:{name:'R и ось',note:`В отведениях от конечностей R<sub>II</sub> > R<sub>I</sub> > R<sub>III</sub> — нормальное положение оси; R<sub>I</sub> > R<sub>II</sub> > R<sub>III</sub> — горизонтальное; максимум в III — отклонение вправо, в aVL — влево ${SRC('92–93')}. Вольтаж достаточный: R<sub>max</sub> > 5 мм и R<sub>I</sub> + R<sub>II</sub> + R<sub>III</sub> > 15 мм ${SRC(91)}.`,num:['I','II','III'],el:'R'},
 rs:{name:'R/S в грудных',note:`В грудных R нарастает от V1 к V4 (максимум), затем снижается к V6; S уменьшается от V1 к V4, в V5–V6 его нет; R = S — переходная зона, в норме V3 ${SRC(89)}.`,num:['V1','V2','V3','V4','V5','V6'],mark:{V3:'R = S',V4:'R max'},el:'R'},
 q:{name:'Q',note:`Маленький q (меньше ¼ R, до 0,03 с) в норме бывает в I, II, aVF, V5–V6; в V1–V3 Q быть не должно; в aVR возможен глубокий Q вплоть до QS ${SRC(88)}.`,mark:{I:'q',II:'q',V5:'q',V6:'q',V1:'нет Q',V2:'нет Q',V3:'нет Q',aVR:'QS — норма'},el:'Q'},
 st:{name:'ST',note:`ST на изолинии; в V1–V3 допустим подъём до 2 мм, в V5–V6 — снижение до 0,5 мм ${SRC(89)}.`,mark:{V1:'до +2 мм',V2:'до +2 мм',V3:'до +2 мм',V5:'до −0,5 мм',V6:'до −0,5 мм'},el:'ST'},
 t:{name:'T',note:`T совпадает по направлению с R, т.е. (+), кроме aVR; в aVL может быть (−) при вертикальной оси, в III — при горизонтальной; T<sub>V6</sub> > T<sub>V1</sub> ${SRC(89)}.`,mark:{aVR:'T (−)',III:'может быть (−)',aVL:'может быть (−)',V1:'T мал',V6:'T > V1'},el:'T'}};
function partB(root){
  root.innerHTML=`<div class="ne-chips" role="group" aria-label="Что показать">${Object.entries(VIEWS).map(([k,v])=>`<button type="button" data-v="${k}">${v.name}</button>`).join('')}</div>
   <div class="qz-strip"><svg id="ne-svgB" class="qz-svg" role="img" aria-label="Нормальная ЭКГ в 12 отведениях"></svg></div><p class="qz-scale">25 мм/с · 10 мм/мВ · по одному комплексу в каждом отведении</p><p class="ne-note" aria-live="polite"></p>`;
  const svg=root.querySelector('svg'),note=root.querySelector('.ne-note');
  function draw(vk){const V=VIEWS[vk],cw=17,mm=25;let rows='',y=0;
    const rowH=GRID[0].map((_,ri)=>{let mx=.3,mn=-.3;GRID.forEach(c=>{const L=LD[c[ri]];mx=Math.max(mx,ext(L.q,1),L.t,L.p);mn=Math.min(mn,ext(L.q,-1),L.t,L.p)});return[mx,mn]});
    GRID[0].forEach((_,ri)=>{const [mx,mn]=rowH[ri],base=y+6+mx*10,hh=(mx-mn)*10+12;
      GRID.forEach((c,ci)=>{const l=c[ri],x0=ci*cw;let d='';for(let t=.02;t<=.6;t+=.002)d+=(d?'L':'M')+(x0+(t-.02)*mm).toFixed(2)+' '+(base-leadV(l,t)*10).toFixed(2);
        let hl='';const q=.2,el=V.el;const rg={P:[q-.16,q-.07],R:[q,q+.09],Q:[q,q+.03],ST:[q+.09,q+.19],T:[q+.19,q+.37]}[el];
        if(rg){let s='';for(let t=rg[0];t<=rg[1];t+=.001)s+=(s?'L':'M')+(x0+(t-.02)*mm).toFixed(2)+' '+(base-leadV(l,t)*10).toFixed(2);hl=`<path d="${s}" class="ne-hl"/>`}
        rows+=`<path d="${d}" class="qz-tr"/>${hl}<text x="${x0+1}" y="${y+3.6}" class="ne-ld">${l}</text>`;if(ci)rows+=`<line x1="${x0}" x2="${x0}" y1="${y}" y2="${y+hh}" class="qz-sep"/>`;
        const m=V.mark&&V.mark[l],nm=V.num&&V.num.includes(l);
        if(nm){const L=LD[l],r=ext(L.q,1),s=-ext(L.q,-1);rows+=`<text x="${x0+cw-1}" y="${y+3.6}" class="ne-num" text-anchor="end">R ${f1(r*10)}${vk==='rs'?` / S ${f1(s*10)}`:''}</text>`}
        if(m)rows+=`<text x="${x0+cw-1}" y="${y+hh-1.6}" class="ne-mk" text-anchor="end">${m}</text>`});
      y+=hh});
    const W=GRID.length*cw;svg.setAttribute('viewBox',`0 0 ${W} ${y}`);
    svg.innerHTML=`<defs><pattern id="ne-pB" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M1 0V5M2 0V5M3 0V5M4 0V5M0 1H5M0 2H5M0 3H5M0 4H5" class="qz-g1"/><path d="M0 0H5M0 0V5" class="qz-g5"/></pattern></defs><rect width="${W}" height="${y}" class="qz-bg"/><rect width="${W}" height="${y}" fill="url(#ne-pB)"/>${rows}`;
    note.innerHTML=V.note;root.querySelectorAll('[data-v]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===vk))}
  root.querySelector('.ne-chips').addEventListener('click',e=>{const b=e.target.closest('button');if(b)draw(b.dataset.v)});draw('p')}
/* ---------- C: тренажёр «что подсвечено?» ---------- */
function partC(root){
  root.innerHTML=`<p class="qz-q"></p><div class="qz-strip ne-wide"><svg id="ne-svgC" class="qz-svg" role="img" aria-label="Лента с подсвеченным элементом"></svg></div><div class="qz-opts"></div><div class="qz-ex" aria-live="polite"></div>
   <div class="qz-nav"><button type="button" class="qz-next" data-a="n">Следующий →</button><span class="qz-sc"></span></div>`;
  const svg=root.querySelector('svg'),opts=root.querySelector('.qz-opts'),ex=root.querySelector('.qz-ex'),sc=root.querySelector('.qz-sc'),q=root.querySelector('.qz-q');let cur,score=[0,0],done,n=0,bag=[];
  const sim={P:['T','Q','PQs'],PQs:['PQ','ST','iso'],PQ:['PQs','QRS','QT'],Q:['S','R','P'],R:['Q','S','T'],S:['Q','R','ST'],QRS:['PQ','QT','R'],ST:['PQs','T','QT'],T:['P','ST','R'],QT:['ST','QRS','RR'],RR:['QT','PQ','QRS'],iso:['ST','PQs','PQ']};
  function next(){if(!bag.length)bag=EL.map(e=>e.k).sort(()=>Math.random()-.5);cur=bag.pop();done=false;n++;const rr=60/(60+Math.random()*30);
    drawA(svg,{qs:[.26,.26+rr],t0:0,t1:.26+rr+.25,mmps:50,sel:cur,labels:false,letters:false});
    q.innerHTML=`<b>${n}.</b> Что подсвечено на ленте?`;const o=[cur,...sim[cur]].sort(()=>Math.random()-.5);
    opts.innerHTML=o.map(k=>`<button type="button" class="qz-o" data-k="${k}">${BYK[k].name}</button>`).join('');ex.innerHTML='';sc.textContent=`верно ${score[0]} из ${score[1]}`}
  opts.addEventListener('click',e=>{const b=e.target.closest('.qz-o');if(!b||done)return;done=true;score[1]++;const ok=b.dataset.k===cur;if(ok)score[0]++;
    [...opts.children].forEach(x=>{x.disabled=true;if(x.dataset.k===cur)x.classList.add('ok');else if(x===b)x.classList.add('bad')});
    const e2=BYK[cur],w=BYK[b.dataset.k];ex.innerHTML=`<p class="qz-v ${ok?'ok':'bad'}">${ok?'Верно.':'Неверно.'} Это <b>${e2.name}</b>: ${e2.where}</p>${ok?'':`<p class="qz-why"><b>${w.name}</b> — ${w.where}</p>`}<p class="qz-diff">${e2.diff}</p>`;sc.textContent=`верно ${score[0]} из ${score[1]}`});
  root.querySelector('[data-a=n]').addEventListener('click',next);next()}
window.NormECG=function(o){if(o.a)partA(o.a);if(o.b)partB(o.b);if(o.c)partC(o.c)};
})();
