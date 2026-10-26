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
   <div class="ne-card" aria-live="polite"></div>
   <h4 class="ne-h12">Этот элемент во всех 12 отведениях</h4>
   <div class="ne-mode" role="group" aria-label="Что показать"><button type="button" data-m="norm" aria-pressed="true">Норма</button><button type="button" data-m="abn" aria-pressed="false">Как выглядит отклонение</button></div>
   <div class="qz-strip"><svg id="ne-svg12" class="qz-svg ne-12" role="img" aria-label="Выбранный элемент в 12 отведениях"></svg></div>
   <p class="ne-leg"><span class="l-ok">● так в норме</span><span class="l-may">● в норме бывает</span><span class="l-no">● так быть не должно</span><span class="l-bad">— красная кривая: пример отклонения</span></p>
   <div class="ne-nbw" aria-live="polite"></div>`;
  const svg=root.querySelector('svg'),cardEl=root.querySelector('.ne-card'),chips=[...root.querySelectorAll('.ne-chips button')],cnt=root.querySelector('.ne-cnt');let i=0,timer=null;
  const s12=root.querySelector('#ne-svg12'),nbw=root.querySelector('.ne-nbw');let mode='norm';
  const show=k=>{i=EL.findIndex(e=>e.k===k);const S=drawA(svg,{qs:[.26,1.06],t0:0,t1:1.2,mmps:50,sel:k});cardEl.innerHTML=card(EL[i],S.B[0]);chips.forEach(c=>c.setAttribute('aria-pressed',c.dataset.k===k));cnt.textContent=`${i+1} из ${EL.length}`;
    draw12(s12,k,mode);nbw.innerHTML=nbHTML(k,mode)};
  root.querySelector('.ne-mode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mode=b.dataset.m;root.querySelectorAll('.ne-mode button').forEach(x=>x.setAttribute('aria-pressed',x===b));show(EL[i].k)});
  root.querySelector('.ne-chips').addEventListener('click',e=>{const b=e.target.closest('button');if(b){stop();show(b.dataset.k)}});
  const stop=()=>{if(timer){clearInterval(timer);timer=null;root.querySelector('[data-a=tour]').textContent='▶ по порядку'}};
  root.querySelector('.ne-tour').addEventListener('click',e=>{const a=e.target.closest('button')?.dataset.a;if(!a)return;
    if(a==='tour'){if(timer){stop();return}e.target.textContent='❚❚ пауза';show(EL[(i+1)%EL.length].k);timer=setInterval(()=>show(EL[(i+1)%EL.length].k),4500)}
    else{stop();show(EL[(i+(a==='next'?1:-1)+EL.length)%EL.length].k)}});
  show('P')}
/* ---------- B: элемент во всех 12 отведениях — где норма, где отклонение ---------- */
const LD={I:{p:.08,q:[[0,0],[.012,-.05],[.04,.7],[.065,-.1],[.09,0]],t:.2},II:{p:.15,q:[[0,0],[.012,-.1],[.04,1.1],[.065,-.25],[.09,0]],t:.3},III:{p:.07,q:[[0,0],[.014,-.05],[.042,.5],[.066,-.15],[.09,0]],t:.1},
 aVR:{p:-.1,q:[[0,0],[.042,-.85],[.09,0]],t:-.25},aVL:{p:.03,q:[[0,0],[.035,.35],[.062,-.2],[.09,0]],t:.1},aVF:{p:.1,q:[[0,0],[.013,-.07],[.041,.8],[.066,-.18],[.09,0]],t:.2},
 V1:{p:.07,q:[[0,0],[.025,.25],[.055,-1.0],[.09,0]],t:.1},V2:{p:.08,q:[[0,0],[.028,.45],[.058,-1.2],[.09,0]],t:.4},V3:{p:.08,q:[[0,0],[.03,.8],[.06,-.8],[.09,0]],t:.45},
 V4:{p:.08,q:[[0,0],[.036,1.4],[.065,-.4],[.09,0]],t:.45},V5:{p:.07,q:[[0,0],[.012,-.08],[.038,1.3],[.075,0]],t:.35},V6:{p:.06,q:[[0,0],[.012,-.08],[.038,1.1],[.075,0]],t:.3}};
const GRID=[['I','II','III'],['aVR','aVL','aVF'],['V1','V2','V3'],['V4','V5','V6']];
const Q0=.26,TW=[.02,.66];
function geo(l,m={}){const L=LD[l],pq=m.pq??.16,pd=m.pd??.09,pts=m.q??L.q,qd=pts[pts.length-1][0],ts=Q0+qd+.1+(m.tShift||0),te=ts+.18;
  return{L,pq,pd,pts,qd,P:[Q0-pq,Q0-pq+pd],QRS:[Q0,Q0+qd],ST:[Q0+qd,ts],T:[ts,te],QT:[Q0,te],PQ:[Q0-pq,Q0],PQs:[Q0-pq+pd,Q0],pa:m.p??L.p,ta:m.t??L.t,st:m.st||0,tSym:m.tSym,bif:m.pBif}}
function leadV(l,t,m){const g=geo(l,m);let v=0;
  if(t>=g.P[0]&&t<=g.P[1]){const k=(t-g.P[0])/g.pd;v+=g.bif?g.pa*(.85*Math.exp(-(((k-.3)/.16)**2))+.9*Math.exp(-(((k-.72)/.16)**2))):g.pa*Math.sin(Math.PI*k)**2}
  if(t>=g.QRS[0]&&t<=g.QRS[1])v+=lerp(g.pts.map(([a,b])=>[Q0+a,b]),t);
  if(g.st&&t>g.QRS[1]-.005&&t<g.T[1]){const a=g.QRS[1],b=g.T[0]+.09;v+=g.st*Math.min(1,(t-a)/.02)*(t>b?Math.max(0,1-(t-b)/.07):1)}
  if(t>=g.T[0]&&t<=g.T[1]){const pk=g.tSym?g.T[0]+.09:g.T[0]+.11;v+=t<pk?g.ta*Math.sin(Math.PI/2*(t-g.T[0])/(pk-g.T[0]))**2:g.ta*Math.cos(Math.PI/2*(t-pk)/(g.T[1]-pk))**2}
  return v}
const OK='ok',MAY='may',NO='no';
const V12={
 P:{mark:{II:[OK,'(+) всегда'],aVR:[OK,'(−) — норма'],I:[OK,'(+)'],aVF:[OK,'(+)'],V1:[MAY,'бывает двухфазным']},
  norm:[`(+) во II — всегда, (−) в aVR ${SRC(88)}`,`не шире 0,10 с и не выше 2,5 мм, туповершинный ${SRC(88)}`,`одинаковой формы в одном отведении ${SRC(90)}`],
  bad:[`P (−) во II или нет P перед QRS — ритм не синусовый: предсердный, узловой ${SRC('90, 95')}`,`P выше 2,5 мм, острый во II, III, aVF — P-pulmonale ${SRC(104)}`,`P шире 0,10 с, двугорбый в I, II, aVL — P-mitrale ${SRC(105)}`,`вместо P волны f или F — фибрилляция или трепетание предсердий ${SRC(99)}`],
  abn:{II:{p:-.12,label:'P (−) во II'},III:{p:.32,pd:.07,label:'P 3 мм, острый'},I:{p:.1,pd:.12,pBif:true,label:'P 0,12 с, двугорбый'}}},
 PQs:{mark:{II:[OK,'обычно меряют здесь']},note:`Длина сегмента и интервала PQ одинакова во всех отведениях: это время проведения, а не форма. Меряют обычно во II ${SRC(93)}.`,
  norm:[`сегмент PQ лежит на изолинии ${SRC(88)}`],bad:[`методичка сегмент отдельно не оценивает; оценивают весь интервал PQ: больше 0,20 с — AV-блокада I степени ${SRC(101)}`],
  abn:{II:{pq:.28,label:'PQ 0,28 с'}}},
 PQ:{mark:{II:[OK,'обычно меряют здесь']},note:`Интервал PQ одинаков во всех отведениях. Меряют обычно во II ${SRC(93)}.`,
  norm:[`0,12–0,20 с ${SRC(88)}`],bad:[`больше 0,20 с — AV-блокада I степени ${SRC(101)}`,`меньше 0,12 с — предсердный ритм ${SRC(95)} или WPW с Δ-волной ${SRC(104)}`],
  abn:{II:{pq:.28,label:'PQ 0,28 с > 0,20'},V5:{pq:.09,label:'PQ 0,09 с < 0,12'}}},
 Q:{mark:{I:[OK,'q — норма'],II:[OK,'q — норма'],aVF:[OK,'q — норма'],V5:[OK,'q — норма'],V6:[OK,'q — норма'],aVR:[OK,'QS — норма'],V1:[NO,'Q быть не должно'],V2:[NO,'Q быть не должно'],V3:[NO,'Q быть не должно']},
  norm:[`маленький q: глубина не больше ¼ R, до 0,03 с, без зазубрин ${SRC(88)}`,`в aVR возможен глубокий Q, вплоть до QS ${SRC(88)}`,`в каких отведениях маленький q обычно есть (I, II, aVF, V5–V6) ${U}`],
  bad:[`любой Q в V1–V3 ${SRC(88)}`,`Q глубже ¼ R, шире 0,03 с или зазубренный — патологический: признак инфаркта ${SRC('88, 108')}`],
  abn:{V2:{q:[[0,0],[.025,-.7],[.05,-1.1],[.09,0]],label:'QS в V2'},II:{q:[[0,0],[.02,-.45],[.045,.6],[.07,-.2],[.09,0]],label:'Q 4,5 мм при R 6 мм'}}},
 R:{mark:{aVR:[MAY,'мал или нет — норма'],V1:[OK,'r маленький'],V4:[OK,'R максимальный'],II:[OK,'RII > RI > RIII']},num:true,
  norm:[`есть во всех отведениях; в aVR может быть малым или отсутствовать ${SRC(89)}`,`5–15 мм, остроконечный, без зазубрин ${SRC(89)}`,`в грудных растёт от V1 к V4, затем снижается к V6 ${SRC(89)}`,`R<sub>II</sub> > R<sub>I</sub> > R<sub>III</sub> — нормальное положение оси ${SRC(92)}`],
  bad:[`R<sub>V1</sub> > 7 мм — гипертрофия правого желудочка ${SRC(106)}`,`R<sub>V5–6</sub> > 25 мм — гипертрофия левого желудочка ${SRC(106)}`,`R<sub>max</sub> < 5 мм и R<sub>I</sub> + R<sub>II</sub> + R<sub>III</sub> < 15 мм — низкий вольтаж ${SRC(91)}`,`расщеплённый R′ в V1–V2 — блокада правой ножки ${SRC(102)}`],
  abn:{V1:{q:[[0,0],[.035,1.0],[.065,-.2],[.09,0]],t:-.2,label:'R<sub>V1</sub> 10 мм'.replace(/<\/?sub>/g,'')},V5:{q:[[0,0],[.012,-.08],[.038,2.8],[.075,0]],t:-.2,label:'RV5 28 мм'}}},
 S:{mark:{V1:[OK,'S глубокий'],V3:[OK,'R = S'],V5:[NO,'S быть не должно'],V6:[NO,'S быть не должно']},
  norm:[`в грудных уменьшается от V1 к V4 ${SRC(89)}`,`R = S — переходная зона, в норме V3 ${SRC(89)}`],
  bad:[`S в V5–V6 — поворот сердца против часовой стрелки, увеличение правых отделов, блокада правой ножки ${SRC(89)}`,`S<sub>V1–2</sub> + R<sub>V5–6</sub> > 35 мм — гипертрофия левого желудочка ${SRC(106)}`],
  abn:{V6:{q:[[0,0],[.012,-.08],[.038,.8],[.065,-.5],[.09,0]],label:'S в V6'}}},
 QRS:{mark:{aVR:[OK,'QS — норма']},note:`Ширина QRS одинакова во всех отведениях, форма — разная.`,
  norm:[`0,06–0,10 с ${SRC(88)}`,`в aVR — отрицательный комплекс QS ${SRC(89)}`],
  bad:[`0,10–0,12 с — неполная, больше 0,12 с — полная блокада ножки ${SRC(102)}`,`широкий деформированный QRS без P — желудочковый комплекс ${SRC('96, 98')}`],
  abn:{V1:{q:[[0,0],[.02,.3],[.05,-.35],[.095,.9],[.14,0]],t:-.2,label:'QRS 0,14 с, rSR′'}}},
 ST:{mark:{V1:[MAY,'подъём до 2 мм'],V2:[MAY,'подъём до 2 мм'],V3:[MAY,'подъём до 2 мм'],V5:[MAY,'снижение до 0,5 мм'],V6:[MAY,'снижение до 0,5 мм']},
  norm:[`на изолинии ${SRC(89)}`,`в V1–V3 допускается подъём не больше 2 мм ${SRC(89)}`,`в V5–V6 допускается снижение не больше 0,5 мм ${SRC(89)}`],
  bad:[`подъём ST — повреждение: острейшая и острая стадии ИМ; где именно — по отведениям ${SRC('108–110')}`,`снижение ST больше 1 мм — ишемия ${SRC(107)}`,`снижение ST в отведениях противоположной стенки — реципрокные изменения ${SRC(110)}`],
  abn:{II:{st:.3,t:.4,label:'ST ↑ 3 мм'},III:{st:.3,t:.35,label:'ST ↑'},aVF:{st:.3,t:.35,label:'ST ↑'},aVL:{st:-.15,label:'ST ↓ реципрокно'},V5:{st:-.15,label:'ST ↓ 1,5 мм'}}},
 T:{mark:{aVR:[OK,'(−) — норма'],III:[MAY,'может быть (−)'],aVL:[MAY,'может быть (−)'],V1:[MAY,'маленький'],V6:[OK,'T V6 > T V1']},
  norm:[`по направлению совпадает с R, т.е. (+); в aVR (−) ${SRC(89)}`,`в aVL может быть (−) при вертикальной оси, в III — при горизонтальной ${SRC(89)}`,`высота в отведениях от конечностей около 5 мм, в грудных до 15 мм; T<sub>V6</sub> > T<sub>V1</sub> ${SRC(89)}`,`туповершинный, асимметричный ${SRC(89)}`],
  bad:[`T (−) там, где R положительный (I, II, V3–V6) — ишемия, инфаркт, перегрузка при гипертрофии ${SRC('106–109')}`,`высокий, симметричный, островерхий T — ишемия ${SRC(107)}`,`отрицательный симметричный островерхий («коронарный») T — интрамуральный ИМ ${SRC(111)}`],
  abn:{V5:{t:-.3,tSym:true,label:'T (−) в V5'},V3:{t:.95,tSym:true,label:'высокий острый T'}}},
 QT:{mark:{II:[OK,'обычно меряют здесь']},note:`Длительность QRST одинакова во всех отведениях.`,
  norm:[`до 0,40 с, меняется с ЧСС ${SRC(89)}`],bad:[`длиннее 0,40 с при обычной ЧСС — удлинение ${SRC(89)}; точнее оценивают с поправкой на ЧСС (QTc) ${U}`],
  abn:{II:{tShift:.1,label:'QRST 0,47 с'}}},
 RR:{note:`R–R — общий ритм сердца, он одинаков во всех отведениях. Ритм и ЧСС оценивают по II и длинной записи ${SRC(93)}.`,
  norm:[`разница между R–R не больше 0,10 с — ритм правильный ${SRC(90)}`,`ЧСС 60–90 в мин; при ЧСС ≈ 70 R–R ≈ 0,80 с ${SRC('89–91')}`],
  bad:[`ЧСС меньше 60 — брадикардия, больше 90 — тахикардия ${SRC(91)}`,`R–R отличаются больше чем на 0,10 с — ритм неправильный: синусовая аритмия, экстрасистолия, фибрилляция предсердий ${SRC(90)}`],abn:{}},
 iso:{note:`Изолиния одинакова во всех отведениях.`,norm:[`ровные отрезки PQ и TP ${SRC(88)}`],bad:[`волны f вместо изолинии и P — фибрилляция предсердий; пила F — трепетание ${SRC(99)}`],abn:{}}};
const RANGE={P:'P',PQs:'PQs',PQ:'PQ',Q:'Q',R:'R',S:'S',QRS:'QRS',ST:'ST',T:'T',QT:'QT',iso:'iso'};
function draw12(svg,k,mode){const V=V12[k]||{},cw=18,mm=25;let rows='',y=0;
  const mods=mode==='abn'?(V.abn||{}):{};
  const rowR=GRID[0].map((_,ri)=>{let mx=.3,mn=-.3;GRID.forEach(c=>{const l=c[ri];for(let t=TW[0];t<=TW[1];t+=.004){const v=leadV(l,t,mods[l]);mx=Math.max(mx,v);mn=Math.min(mn,v)}});return[mx,mn]});
  GRID[0].forEach((_,ri)=>{const [mx,mn]=rowR[ri],base=y+5+mx*10,hh=(mx-mn)*10+11;
    GRID.forEach((c,ci)=>{const l=c[ri],x0=ci*cw,m=mods[l],X=t=>x0+(t-TW[0])*mm,Y=v=>base-v*10;let d='';
      for(let t=TW[0];t<=TW[1]+1e-9;t+=.002)d+=(d?'L':'M')+X(t).toFixed(2)+' '+Y(leadV(l,t,m)).toFixed(2);
      const g=geo(l,m);let hl='';
      const rgs=k==='iso'?[g.PQs,[g.T[1],TW[1]]]:k==='Q'?[[Q0,Q0+.028]]:k==='R'?[[Q0+.01,Q0+.07]]:k==='S'?[[Q0+.045,g.QRS[1]]]:g[k]?[g[k]]:[];
      rgs.forEach(r=>{let s='';for(let t=r[0];t<=r[1]+1e-9;t+=.001)s+=(s?'L':'M')+X(t).toFixed(2)+' '+Y(leadV(l,t,m)).toFixed(2);hl+=`<rect x="${X(r[0])}" y="${y}" width="${X(r[1])-X(r[0])}" height="${hh}" class="ne-band"/><path d="${s}" class="ne-hl"/>`});
      rows+=hl+`<path d="${d}" class="qz-tr${m?' ne-bad':''}"/><text x="${x0+1}" y="${y+3.4}" class="ne-ld">${l}</text>`;if(ci)rows+=`<line x1="${x0}" x2="${x0}" y1="${y}" y2="${y+hh}" class="qz-sep"/>`;
      if(V.num&&mode!=='abn'&&/^V/.test(l)){const r=ext(LD[l].q,1)*10;rows+=`<text x="${x0+cw-1}" y="${y+3.4}" class="ne-num" text-anchor="end">R ${f1(r)}</text>`}
      const mk=m?['bad',m.label]:(mode==='abn'?null:(V.mark||{})[l]);
      if(mk){const t=mk[1],sp=t.length>13?t.lastIndexOf(' ',Math.ceil(t.length/2)+2):-1,ls=sp>0?[t.slice(0,sp),t.slice(sp+1)]:[t];rows+=`<text x="${x0+cw-.8}" y="${y+hh-1.3-(ls.length-1)*2}" class="ne-mk ${mk[0]}" text-anchor="end">${ls.map((z,i)=>`<tspan x="${x0+cw-.8}" dy="${i?2:0}">${z}</tspan>`).join('')}</text>`}});
    y+=hh});
  const W=GRID.length*cw;svg.setAttribute('viewBox',`0 0 ${W} ${y}`);
  svg.innerHTML=`<defs><pattern id="${svg.id}-p" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M1 0V5M2 0V5M3 0V5M4 0V5M0 1H5M0 2H5M0 3H5M0 4H5" class="qz-g1"/><path d="M0 0H5M0 0V5" class="qz-g5"/></pattern></defs><rect width="${W}" height="${y}" class="qz-bg"/><rect width="${W}" height="${y}" fill="url(#${svg.id}-p)"/>${rows}`}
const ext=(pts,s)=>pts.reduce((m,[,v])=>s>0?Math.max(m,v):Math.min(m,v),0);
function nbHTML(k,mode){const V=V12[k]||{};const hasAbn=Object.keys(V.abn||{}).length;
  return`${V.note?`<p class="ne-note">${V.note}</p>`:''}<div class="ne-nb"><div class="ne-ok"><h5>Норма</h5><ul>${(V.norm||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div>
   <div class="ne-no"><h5>Отклонение — что значит</h5><ul>${(V.bad||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
   ${mode==='abn'&&!hasAbn?'<p class="ne-note">Для этого элемента отклонение по 12 отведениям не показывается — оно одинаково везде.</p>':''}`}
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
window.NormECG=function(o){if(o.a)partA(o.a);if(o.c)partC(o.c)};
})();
