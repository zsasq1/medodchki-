/* ecgquiz.js — тренажёр «найди нарушение на ЭКГ» и справочник нарушений.
   Ленты генерируются заново на каждый вопрос (25 мм/с, 10 мм/мВ). Критерии — кардио.pdf, гл. 4 (с. 90–111).
   Разметка: <div id="qz"></div> и <div id="qz-ref"></div>; вызов ECGQuiz(document.getElementById('qz'), document.getElementById('qz-ref')).
   Генератор — учебная модель формы зубцов, не запись реального пациента. */
(function(){
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const f2=x=>x.toFixed(2).replace('.',','),f0=x=>Math.round(x)+'';
const G=(t,c,s)=>{const d=t-c;return Math.exp(-d*d/(2*s*s))};
const S=(x,a,b)=>{const k=Math.min(1,Math.max(0,(x-a)/(b-a)));return k*k*(3-2*k)};
/* ---------- форма комплексов по отведениям: [смещение от начала QRS, амплитуда мВ, сигма] ---------- */
const N={I:[[.012,-.05,.005],[.035,.7,.01],[.06,-.1,.008]],II:[[.012,-.08,.005],[.035,1.1,.01],[.062,-.2,.008]],III:[[.015,-.05,.005],[.037,.5,.01],[.062,-.15,.008]],
 aVL:[[.03,.35,.01],[.056,-.15,.008]],aVF:[[.014,-.06,.005],[.036,.8,.01],[.062,-.18,.008]],V1:[[.025,.25,.009],[.056,-1.0,.012]],V2:[[.028,.45,.01],[.058,-1.2,.012]],
 V3:[[.03,.8,.01],[.06,-.8,.012]],V4:[[.033,1.4,.011],[.062,-.4,.01]],V5:[[.012,-.08,.005],[.035,1.3,.011],[.062,-.15,.008]],V6:[[.012,-.08,.005],[.035,1.1,.011]]};
const TN={I:.2,II:.3,III:.1,aVL:.1,aVF:.2,V1:.1,V2:.4,V3:.45,V4:.45,V5:.35,V6:.3};
const PN={I:.08,II:.15,III:.07,aVL:.03,aVF:.1,V1:.07,V2:.08,V3:.08,V4:.08,V5:.07,V6:.06};
const WIDE={II:{q:[[.045,1.0,.028],[.11,-.35,.025]],d:.15,t:-.45},V1:{q:[[.06,-1.1,.035]],d:.15,t:.4},V6:{q:[[.05,1.2,.03]],d:.15,t:-.4}};
const RBBB={V1:{q:[[.02,.3,.009],[.05,-.35,.01],[.095,.9,.018]],d:.14,t:-.25},V6:{q:[[.012,-.08,.005],[.035,1.0,.011],[.09,-.35,.022]],d:.14,t:.25},II:{q:[[.035,.9,.01],[.09,-.3,.02]],d:.14,t:.25},I:{q:[[.035,.6,.01],[.09,-.3,.022]],d:.14,t:.2}};
const LBBB={V6:{q:[[.04,.9,.018],[.09,1.0,.02]],d:.15,t:-.3,st:-.08},V1:{q:[[.065,-1.3,.032]],d:.15,t:.35,st:.12},I:{q:[[.04,.7,.018],[.09,.75,.02]],d:.15,t:-.25,st:-.05},II:{q:[[.04,.5,.02],[.09,.45,.02]],d:.15,t:-.12}};
const WPW={II:{q:[[.025,.32,.018],[.07,1.0,.011],[.095,-.15,.008]],d:.12,t:.2},V5:{q:[[.025,.35,.018],[.07,1.2,.011]],d:.12,t:.25}};
function morph(lead,b){
  const tp=b.qt||'n';let m=null;
  if(tp==='w')m=WIDE[lead]||WIDE.II;else if(tp==='rbbb')m=RBBB[lead]||RBBB.II;else if(tp==='lbbb')m=LBBB[lead]||LBBB.II;else if(tp==='wpw')m=WPW[lead]||WPW.II;
  else if(tp==='custom')m=b.cm[lead];
  m=m?{q:m.q.map(x=>x.slice()),d:m.d,t:m.t,st:m.st||0}:{q:(N[lead]||N.II).map(x=>x.slice()),d:.09,t:TN[lead]??.3,st:0};
  const md=b.mod&&b.mod[lead];
  if(md){if(md.r!=null)m.q.forEach(x=>{if(x[1]>0)x[1]*=md.r});if(md.qPath){m.q=m.q.filter(x=>x[0]>.02);m.q.unshift([.018,md.qPath,.013])}
    if(md.st!=null)m.st=md.st;if(md.t!=null)m.t=md.t;if(md.v!=null)m.q.forEach(x=>{x[1]*=md.v})}
  return m}
/* значение сигнала в отведении в момент t */
function makeSig(cs,lead){
  const comps=[],plats=[];
  cs.beats.forEach(b=>{
    if(b.p!=null){const a=(PN[lead]||.1)*(b.pa??1),pt=b.pt||'n';
      if(pt==='n')comps.push([b.p+.045,a,.018]);
      else if(pt==='inv')comps.push([b.p+.04,-Math.abs(a)*(lead==='aVL'||lead==='I'?.3:1),.016]);
      else if(pt==='peak')comps.push([b.p+.04,a*2.1,.013]);
      else if(pt==='bif'){if(lead==='V1'){comps.push([b.p+.03,.06,.014]);comps.push([b.p+.085,-.16,.02])}else{comps.push([b.p+.032,a*.85,.016]);comps.push([b.p+.088,a*.9,.017])}}
      else if(pt==='def')comps.push([b.p+.04,a*.6,.012],[b.p+.075,-a*.4,.012])}
    if(b.q!=null){const m=morph(lead,b);m.q.forEach(([dt,a,s])=>comps.push([b.q+dt,a,s]));
      const rr=b.rr||.8,tc=b.q+Math.min(.34,Math.max(.22,.15+.14*rr))+(m.d-.09)*.6,ta=m.t;
      comps.push([tc,ta,b.tw||.045]);if(m.st)plats.push([b.q+m.d-.005,tc-.02,m.st])}});
  const af=cs.af,fl=cs.fl;
  return t=>{let v=0;for(const [c,a,s] of comps)if(Math.abs(t-c)<6*s)v+=a*G(t,c,s);
    for(const [a,b,h] of plats)v+=h*S(t,a,a+.025)*(1-S(t,b,b+.06));
    if(af)v+=.045*Math.sin(2*Math.PI*6.3*t+af[0])+.03*Math.sin(2*Math.PI*8.7*t+af[1])+.022*Math.sin(2*Math.PI*11.9*t+af[2]);
    if(fl&&t>=fl.t0){const fr=((t-fl.t0)/fl.T)%1;v+=fl.a*(fr<.75?(.5-fr/.75):(-.5+(fr-.75)/.25))*(lead==='V1'?-.6:1)}
    return v}}
/* ---------- генераторы ритма ---------- */
function sinus(D,hr,o={}){const rr=60/hr,b=[];let q=o.t0??rnd(.25,.45);while(q<D+.4){b.push({p:o.noP?null:q-(o.pq??.16),pt:o.pt,q,qt:o.qt,rr,mod:o.mod,cm:o.cm});q+=rr}return b}
const rrOf=b=>b.filter(x=>x.q!=null).map(x=>x.q),hrOf=rr=>60/rr;
/* ---------- пункты: критерии из методички, генерация, разметка ---------- */
const SRC=p=>`<span class="src">кардио.pdf, с. ${p}</span>`,U='<span class="tag t-dis">учебн.</span>';
const ITEMS=[
{id:'norm',g:'ritm',name:'Синусовый ритм, норма',page:'88–91',
 crit:['P перед каждым QRS, P (+) во II, одинаковой формы — ритм синусовый (с. 90)','R–R равны (разница ≤ 0,10 с) — ритм правильный (с. 90)','ЧСС 60–90 в мин (с. 91)','PQ 0,12–0,20 с, QRS 0,06–0,10 с (с. 88)'],
 conf:['sinTach','sinBrady','sinArr','av1'],
 gen(){const hr=rnd(64,86),D=6,beats=sinus(D,hr),rr=60/hr;return{leads:['II'],D,beats,facts:[`R–R ≈ ${f2(rr)} с, ЧСС = 60 / ${f2(rr)} ≈ ${f0(hr)} в мин`,'P (+) перед каждым QRS, PQ ≈ 0,16 с, QRS ≈ 0,09 с'],
   ann:[{t0:beats[1].q+.035,t1:beats[2].q+.035,text:`R–R ${f2(rr)} с → ЧСС ≈ ${f0(hr)} в мин`},{t0:beats[1].p,t1:beats[1].q,text:'PQ ≈ 0,16 с — норма'}]}}},
{id:'sinTach',g:'ritm',name:'Синусовая тахикардия',page:'93',crit:['Правильный синусовый ритм','ЧСС > 90 в мин'],conf:['norm','psvt','afl','sinArr'],
 diff:'От пароксизмальной наджелудочковой тахикардии: у синусовой перед каждым QRS обычный P (+), частота обычно ниже 150 и нарастает постепенно; пароксизм начинается внезапно, 110–220 в мин (с. 98).',
 gen(){const hr=rnd(104,132),D=6,beats=sinus(D,hr,{pq:.14}),rr=60/hr;return{leads:['II'],D,beats,facts:[`ЧСС ≈ ${f0(hr)} в мин (R–R ${f2(rr)} с)`,'P (+) перед каждым QRS, ритм правильный'],ann:[{t0:beats[1].q+.035,t1:beats[2].q+.035,text:`R–R ${f2(rr)} с → ${f0(hr)} в мин > 90`},{t:beats[3].p+.045,text:'P (+) перед QRS — ритм синусовый'}]}}},
{id:'sinBrady',g:'ritm',name:'Синусовая брадикардия',page:'93',crit:['Правильный синусовый ритм','ЧСС < 60 в мин'],conf:['norm','nodal','av3','sab'],
 diff:'От узлового и идиовентрикулярного ритма: при синусовой брадикардии P (+) стоит перед каждым QRS с нормальным PQ.',
 gen(){const hr=rnd(40,54),D=6,beats=sinus(D,hr),rr=60/hr;return{leads:['II'],D,beats,facts:[`ЧСС ≈ ${f0(hr)} в мин (R–R ${f2(rr)} с)`,'P (+) перед каждым QRS, PQ нормальный'],ann:[{t0:beats[0].q+.035,t1:beats[1].q+.035,text:`R–R ${f2(rr)} с → ${f0(hr)} в мин < 60`},{t:beats[1].p+.045,text:'P (+), PQ ≈ 0,16 с'}]}}},
{id:'sinArr',g:'ritm',name:'Синусовая аритмия',page:'94',crit:['Ритм синусовый (P перед каждым QRS)','Колебания R–R > 0,10 с','Дыхательная — учащение на вдохе, бывает у здоровых'],conf:['af','norm','sves','sab'],
 diff:'От фибрилляции предсердий: при синусовой аритмии перед каждым QRS есть одинаковый P, а R–R меняются плавно; при ФП P нет, волны f, R–R хаотичны (с. 99).',
 gen(){const D=6,b=[];let q=.3,k=0,ph=rnd(0,6);const base=rnd(.82,.95),amp=rnd(.17,.24);while(q<D+.4){const rr=base+amp*Math.sin(ph+k*1.05);b.push({p:q-.16,q,rr});q+=rr;k++}
   const rr=[];for(let i=1;i<b.length;i++)if(b[i].q<D)rr.push([b[i].q-b[i-1].q,i]);rr.sort((x,y)=>x[0]-y[0]);const mn=rr[0],mx=rr[rr.length-1];
   return{leads:['II'],D,beats:b,facts:[`R–R от ${f2(mn[0])} до ${f2(mx[0])} с — разница ${f2(mx[0]-mn[0])} с > 0,10 с`,'P одинаковые, перед каждым QRS'],
   ann:[{t0:b[mn[1]-1].q+.035,t1:b[mn[1]].q+.035,text:`самый короткий R–R ${f2(mn[0])} с`},{t0:b[mx[1]-1].q+.035,t1:b[mx[1]].q+.035,text:`самый длинный R–R ${f2(mx[0])} с`}]}}},
{id:'sssu',g:'ritm',name:'Синдром слабости синусного узла (брадикардия–тахикардия)',page:'94',crit:['Стойкая синусовая брадикардия, не снимаемая нагрузкой или атропином','Периодические эктопические ритмы, синоатриальная блокада','Чередование выраженной брадикардии и тахикардии — синдром брадикардии–тахикардии'],conf:['sinArr','psvt','sab','sinBrady'],
 gen(){const D=6,b=[];let q=.3;const rb=rnd(1.25,1.45);for(let i=0;i<3;i++){b.push({p:q-.16,q,rr:rb});q+=rb}const st=q-.35;let rt=rnd(.38,.44);q=st;while(q<D+.4){b.push({p:null,q,rr:rt});q+=rt}
   return{leads:['II'],D,beats:b,facts:[`сначала синусовая брадикардия ≈ ${f0(60/rb)} в мин`,`затем без перехода — тахикардия ≈ ${f0(60/rt)} в мин`],
   ann:[{t0:b[0].q+.035,t1:b[1].q+.035,text:`брадикардия ${f0(60/rb)} в мин`},{t0:b[4].q+.035,t1:b[6].q+.035,text:`тахикардия ${f0(60/rt)} в мин`}]}}},
{id:'atrial',g:'ritm',name:'Предсердный (эктопический) ритм',page:'95',crit:['P (+) или (−) — при водителе в нижних отделах предсердий','PQ укорочен < 0,12 с','QRS не изменён','ЧСС до 60 в мин'],conf:['nodal','sinBrady','wpw','idio'],
 diff:'От WPW: PQ короткий, но нет Δ-волны и QRS не расширен (с. 104). От узлового: P стоит перед QRS с PQ около 0,10 с, а не сливается с QRS и не идёт после него.',
 gen(){const hr=rnd(48,58),D=6,beats=sinus(D,hr,{pt:'inv',pq:.1});return{leads:['II'],D,beats,facts:[`ЧСС ≈ ${f0(hr)} в мин`,'P (−) во II перед каждым QRS, PQ ≈ 0,10 с < 0,12 с','QRS узкий'],
   ann:[{t:beats[1].p+.04,text:'P (−) во II — водитель в нижних отделах предсердий'},{t0:beats[2].p,t1:beats[2].q,text:'PQ ≈ 0,10 с < 0,12 с'}]}}},
{id:'nodal',g:'ritm',name:'Узловой (AV) ритм',page:'95–96',crit:['P (−) перед QRS — водитель в верхней части узла; P накладывается на QRS — в средней; P (−) после QRS — в нижней','QRS не изменён','ЧСС 40–60 в мин'],conf:['atrial','idio','sinBrady','av3'],
 diff:'От идиовентрикулярного ритма: QRS узкий, не деформирован (с. 96).',
 gen(){const hr=rnd(42,56),D=6,v=pick(['after','none']),b=sinus(D,hr,{noP:true});if(v==='after')b.forEach(x=>{x.p=x.q+.07;x.pt='inv'});
   return{leads:['II'],D,beats:b,facts:[`ЧСС ≈ ${f0(hr)} в мин`,v==='after'?'P (−) после QRS — водитель в нижней части узла':'P не видно — сливается с QRS (средняя часть узла)','QRS узкий, не изменён'],
   ann:[v==='after'?{t:b[1].q+.11,text:'P (−) после QRS'}:{t:b[1].q+.035,text:'P не виден — скрыт в QRS'},{t0:b[2].q,t1:b[2].q+.09,text:'QRS ≈ 0,09 с — узкий'}]}}},
{id:'idio',g:'ritm',name:'Желудочковый (идиовентрикулярный) ритм',page:'96',crit:['Зубца P нет','QRS расширены и деформированы: возбуждение идёт сначала по одному желудочку, потом по другому','ЧСС 40 и менее в мин'],conf:['nodal','vt','av3','lbbb'],
 gen(){const hr=rnd(30,39),D=6,b=sinus(D,hr,{noP:true,qt:'w'});return{leads:['II'],D,beats:b,facts:[`ЧСС ≈ ${f0(hr)} в мин`,'P нет','QRS ≈ 0,15 с, деформированы; T направлен против QRS'],
   ann:[{t0:b[0].q,t1:b[0].q+.15,text:'QRS ≈ 0,15 с — широкий'},{t0:b[0].q+.04,t1:b[1].q+.04,text:`R–R ${f2(60/hr)} с → ${f0(hr)} в мин`}]}}},
{id:'sves',g:'ritm',name:'Наджелудочковая (предсердная) экстрасистолия',page:'97',crit:['Преждевременный комплекс PQRST','P экстрасистолы деформирован или изменил направление','QRS как у синусового, не шире 0,10 с','Неполная компенсаторная пауза (сцепление + пауза < 2 R–R)'],conf:['ves','nes','sinArr','sab'],
 diff:'От желудочковой: перед экстрасистолой есть P, QRS узкий, пауза неполная (с. 98).',
 gen(){const hr=rnd(66,80),rr=60/hr,D=6,b=[];let q=.3;const k=pick([2,3]);for(let i=0;i<9;i++){if(i===k){const c=rr*rnd(.55,.65);const qe=b[i-1].q+c;b.push({p:qe-.15,pt:pick(['inv','def']),q:qe,rr:c});q=qe+rr*rnd(1.05,1.15);continue}b.push({p:q-.16,q,rr});q+=rr}
   const e=b[k],c=e.q-b[k-1].q,pz=b[k+1].q-e.q;return{leads:['II'],D,beats:b,facts:[`экстрасистола приходит раньше: сцепление ${f2(c)} с при R–R ${f2(rr)} с`,'перед ней P изменённой формы, QRS узкий',`сцепление + пауза = ${f2(c+pz)} с < 2 R–R (${f2(2*rr)} с) — пауза неполная`],
   ann:[{t:e.p+.04,text:'изменённый P экстрасистолы'},{t0:b[k-1].q+.035,t1:e.q+.035,text:`сцепление ${f2(c)} с`},{t0:e.q+.035,t1:b[k+1].q+.035,text:`пауза ${f2(pz)} с — неполная`}]}}},
{id:'nes',g:'ritm',name:'Узловая экстрасистолия',page:'98',crit:['Преждевременный QRS, похожий на синусовый, не шире 0,10 с','P (−) до или после QRS либо отсутствует','Неполная компенсаторная пауза'],conf:['sves','ves','nodal','sinArr'],
 gen(){const hr=rnd(64,80),rr=60/hr,D=6,b=[];let q=.3;const k=pick([2,3,4]);for(let i=0;i<9;i++){if(i===k){const c=rr*rnd(.58,.68);const qe=b[i-1].q+c;b.push({p:qe+.06,pt:'inv',q:qe,rr:c});q=qe+rr*rnd(1.05,1.15);continue}b.push({p:q-.16,q,rr});q+=rr}
   const e=b[k],c=e.q-b[k-1].q,pz=b[k+1].q-e.q;return{leads:['II'],D,beats:b,facts:['преждевременный узкий QRS без P перед ним','P (−) сразу после QRS экстрасистолы',`сцепление + пауза = ${f2(c+pz)} с < 2 R–R (${f2(2*rr)} с) — пауза неполная`],
   ann:[{t:e.q+.035,text:'узкий преждевременный QRS'},{t:e.p+.04,text:'P (−) после QRS'},{t0:e.q+.035,t1:b[k+1].q+.035,text:`пауза ${f2(pz)} с — неполная`}]}}},
{id:'ves',g:'ritm',name:'Желудочковая экстрасистолия',page:'96–98',crit:['Преждевременный QRS, расширен > 0,10 с и деформирован','ST и T дискордантны QRS (направлены в другую сторону)','Перед экстрасистолой нет P','Полная компенсаторная пауза: сцепление + пауза = 2 R–R','Правильное чередование с синусовыми — аллоритмия: бигеминия, тригеминия (с. 97)'],conf:['sves','nes','idio','lbbb'],
 gen(){const hr=rnd(66,78),rr=60/hr,D=6,big=Math.random()<.4,b=[];let q=.3,i=0;const ks=big?[1,3,5,7]:[pick([2,3])];
   while(q<D+.4&&i<14){if(ks.includes(i)){const c=rr*rnd(.55,.62);const qe=b[i-1].q+c;b.push({p:null,q:qe,qt:'w',rr:c});q=b[i-1].q+2*rr;i++;continue}b.push({p:q-.16,q,rr});q+=rr;i++}
   const k=ks[0],e=b[k],c=e.q-b[k-1].q,pz=b[k+1].q-e.q;return{leads:['II'],D,beats:b,facts:[big?'каждый второй комплекс — экстрасистола: бигеминия (аллоритмия)':'одиночная экстрасистола','широкий (≈ 0,15 с) деформированный QRS без P, T направлен против QRS',`сцепление + пауза = ${f2(c+pz)} с = 2 R–R — пауза полная`],
   ann:[{t0:e.q,t1:e.q+.15,text:'QRS ≈ 0,15 с, без P'},{t:e.q+.33,text:'T дискордантен QRS'},{t0:b[k-1].q+.035,t1:b[k+1].q+.035,text:`сцепление + пауза = ${f2(c+pz)} с = 2 R–R`}]}}},
{id:'psvt',g:'ritm',name:'Пароксизмальная наджелудочковая тахикардия',page:'98',crit:['Внезапно начинающийся и внезапно заканчивающийся приступ 110–220 в мин','Ритм регулярный','Источник — предсердия или AV-узел: QRS узкие, как синусовые '+U],conf:['sinTach','afl','vt','af'],
 diff:'От синусовой тахикардии — внезапное начало, частота обычно выше, P перед QRS не виден. От трепетания — нет пилообразных волн F (с. 99).',
 gen(){const D=6,rr0=60/rnd(68,78),b=[];let q=.3;for(let i=0;i<2;i++){b.push({p:q-.16,q,rr:rr0});q+=rr0}const hr=rnd(165,205),rr=60/hr;q=b[1].q+rr0*.55;while(q<D+.4){b.push({p:null,q,rr});q+=rr}
   return{leads:['II'],D,beats:b,facts:['два синусовых комплекса, затем внезапно начинается приступ',`ЧСС в приступе ≈ ${f0(hr)} в мин, ритм регулярный`,'QRS узкие, P не различимы'],
   ann:[{t:b[2].q+.035,text:'внезапное начало приступа'},{t0:b[4].q+.035,t1:b[5].q+.035,text:`R–R ${f2(rr)} с → ${f0(hr)} в мин`}]}}},
{id:'vt',g:'ritm',name:'Пароксизмальная желудочковая тахикардия',page:'98',crit:['Внезапный приступ 110–220 в мин с регулярным ритмом','Источник — желудочки: QRS широкие и деформированные, P не связаны с QRS '+U],conf:['psvt','idio','sinTach','lbbb'],
 gen(){const D=6,rr0=60/rnd(68,78),b=[];let q=.3;for(let i=0;i<2;i++){b.push({p:q-.16,q,rr:rr0});q+=rr0}const hr=rnd(150,185),rr=60/hr;q=b[1].q+rr0*.55;while(q<D+.4){b.push({p:null,q,qt:'w',rr});q+=rr}
   return{leads:['II'],D,beats:b,facts:['после двух синусовых комплексов — внезапный приступ',`≈ ${f0(hr)} в мин, ритм регулярный`,'QRS ≈ 0,15 с, деформированы'],ann:[{t:b[2].q+.04,text:'внезапное начало'},{t0:b[4].q,t1:b[4].q+.15,text:'QRS ≈ 0,15 с — широкий'}]}}},
{id:'af',g:'ritm',name:'Фибрилляция предсердий',page:'99',crit:['Зубца P нет, вместо него беспорядочные волны f разной формы и амплитуды (II, III, V1)','R–R разные — нерегулярный желудочковый ритм','QRS не изменены или чуть изменены','Предсердия > 360 в мин; желудочки < 60 — брадисистолическая, 60–90 — нормосистолическая, > 90 — тахисистолическая форма'],conf:['afl','sinArr','sves','sssu'],
 gen(){const D=6,b=[];let q=.25;const mean=rnd(.5,1.0),form=60/mean;while(q<D+.4){const rr=mean*rnd(.6,1.4);b.push({p:null,q,rr});q+=rr}
   const rrs=[];for(let i=1;i<b.length;i++)if(b[i].q<D)rrs.push(b[i].q-b[i-1].q);const n=b.filter(x=>x.q<D).length,hr=n*10;
   const fm=hr<60?'брадисистолическая':hr<=90?'нормосистолическая':'тахисистолическая';
   return{leads:['II'],D,beats:b,af:[rnd(0,6),rnd(0,6),rnd(0,6)],facts:['P нет, изолиния «дрожит» — волны f',`R–R от ${f2(Math.min(...rrs))} до ${f2(Math.max(...rrs))} с — нерегулярно`,`за 6 с ${n} QRS → ≈ ${hr} в мин: ${fm} форма`],
   ann:[{t0:b[1].q+.3,t1:b[2].q-.02,text:'волны f вместо P'},{t0:b[2].q+.035,t1:b[3].q+.035,text:`R–R ${f2(b[3].q-b[2].q)} с`},{t0:b[3].q+.035,t1:b[4].q+.035,text:`R–R ${f2(b[4].q-b[3].q)} с — другой`}]}}},
{id:'afl',g:'ritm',name:'Трепетание предсердий',page:'99–100',crit:['P нет, вместо него волны F, часто пилообразные, одинаковые','Расстояния между F одинаковы — правильный предсердный ритм 220–360 в мин','Желудочковый ритм чаще регулярный','QRS не изменены, перед каждым — постоянное число F (2:1, 3:1…)'],conf:['af','psvt','sinTach','av2m2'],
 gen(){const D=6,T=rnd(.19,.23),k=pick([2,3,4]),b=[];let q=.25;while(q<D+.4){b.push({p:null,q,rr:T*k});q+=T*k}
   return{leads:['II'],D,beats:b,fl:{t0:0,T,a:.24},facts:[`волны F через ${f2(T)} с → предсердия ≈ ${f0(60/T)} в мин`,`проведение ${k}:1 → желудочки ≈ ${f0(60/(T*k))} в мин, ритм регулярный`],
   ann:[{t0:b[1].q+.13,t1:b[1].q+.13+T,text:`F–F ${f2(T)} с — пила`},{t0:b[1].q+.035,t1:b[2].q+.035,text:`${k} волны F на один QRS (${k}:1)`}]}}},
{id:'sab',g:'prov',name:'Синоатриальная блокада',page:'100',crit:['Периодическое выпадение целого цикла PQRST','Пауза в момент выпадения в 2 раза длиннее обычного R–R'],conf:['av2m2','sinArr','sves','sssu'],
 diff:'От AV-блокады II степени: при СА-блокаде выпадает весь цикл вместе с P; при AV-блокаде P на месте, выпадает только QRS (с. 101).',
 gen(){const hr=rnd(64,78),rr=60/hr,D=6,k=pick([3,4]),b=[];let q=.3;for(let i=0;i<10;i++){if(i===k){q+=rr;continue}b.push({p:q-.16,q,rr});q+=rr}
   return{leads:['II'],D,beats:b,facts:['ритм синусовый, потом нет ни P, ни QRS',`пауза ${f2(2*rr)} с = 2 R–R (${f2(rr)} с)`],ann:[{t0:b[k-1].q+.035,t1:b[k].q+.035,text:`пауза ${f2(2*rr)} с = 2 R–R`},{t:b[k-1].q+rr-.12,text:'здесь выпал целый цикл, P тоже нет'}]}}},
{id:'av1',g:'prov',name:'AV-блокада I степени',page:'101',crit:['Постоянное удлинение PQ > 0,20 с','Выпадений QRS нет: после каждого P идёт QRS'],conf:['norm','av2m1','av2m2','wpw'],
 gen(){const hr=rnd(62,80),pq=rnd(.26,.34),D=6,b=sinus(D,hr,{pq});return{leads:['II'],D,beats:b,facts:[`PQ ≈ ${f2(pq)} с > 0,20 с в каждом цикле`,'за каждым P следует QRS'],ann:[{t0:b[1].p,t1:b[1].q,text:`PQ ${f2(pq)} с`},{t0:b[3].p,t1:b[3].q,text:`PQ ${f2(pq)} с — постоянный`}]}}},
{id:'av2m1',g:'prov',name:'AV-блокада II степени, Мобитц I',page:'101',crit:['Периодическое выпадение QRS при сохранённом P','PQ постепенно удлиняется, затем QRS выпадает — периоды Самойлова–Венкебаха'],conf:['av2m2','av1','sab','av3'],
 diff:'От Мобитц II: при Мобитц II PQ перед выпадением не меняется (с. 101).',
 gen(){const hr=rnd(70,85),pp=60/hr,D=6,n=pick([3,4]),b=[];const PQ=[.16,.25,.30,.33];let p=.12,i=0;const facts=[],ann=[];let first=null;
   while(p<D+.3){const k=i%(n+1);if(k<n){const pq=PQ[k];b.push({p,q:p+pq,rr:pp});if(first===null&&i>=0&&k<n)first=b.length-1}else{b.push({p,q:null})}p+=pp;i++}
   const cyc=b.slice(0,n+1);cyc.forEach((x,j)=>{if(x.q!=null)ann.push({t0:x.p,t1:x.q,text:`PQ ${f2(x.q-x.p)} с`});else ann.push({t:x.p+.05,text:'P есть, QRS выпал'})});
   return{leads:['II'],D,beats:b,facts:[`PQ растёт: ${PQ.slice(0,n).map(f2).join(' → ')} с, затем QRS выпадает`,`проведение ${n+1}:${n} (${n+1} P на ${n} QRS)`],ann}}},
{id:'av2m2',g:'prov',name:'AV-блокада II степени, Мобитц II',page:'101',crit:['Периодическое выпадение QRS при сохранённом P','PQ постоянный (нормальный или удлинённый)','Выпадение регулярное или беспорядочное'],conf:['av2m1','sab','av3','av1'],
 diff:'От СА-блокады: P на месте выпавшего QRS сохранён (с. 100).',
 gen(){const hr=rnd(72,86),pp=60/hr,D=6,pq=pick([.18,.24]),n=pick([2,3]),b=[];let p=.12,i=0;while(p<D+.3){b.push(i%(n+1)===n?{p,q:null}:{p,q:p+pq,rr:pp});p+=pp;i++}
   const d=b.findIndex(x=>x.q==null);return{leads:['II'],D,beats:b,facts:[`PQ всегда ${f2(pq)} с`,`каждый ${n+1}-й P не проводится (${n+1}:${n})`],
   ann:[{t0:b[0].p,t1:b[0].q,text:`PQ ${f2(pq)} с`},{t0:b[d-1].p,t1:b[d-1].q,text:`PQ ${f2(pq)} с — не меняется`},{t:b[d].p+.05,text:'P без QRS — выпадение'}]}}},
{id:'av3',g:'prov',name:'AV-блокада III степени (полная)',page:'101–102',crit:['Предсердия и желудочки работают независимо','P–P постоянные (синусовый узел, 60–90 в мин)','R–R постоянные, 30–60 в мин (водитель II–III порядка)','P–P < R–R; P не связаны с QRS','Клинически — приступы Морганьи–Эдемса–Стокса (с. 102)'],conf:['av2m2','idio','nodal','sinBrady'],
 gen(){const ah=rnd(72,88),vh=rnd(32,44),pp=60/ah,rr=60/vh,D=6,wide=Math.random()<.5,b=[];let p=.08;while(p<D+.3){b.push({p,q:null});p+=pp}let q=rnd(.3,.6);while(q<D+.4){b.push({p:null,q,qt:wide?'w':'n',rr});q+=rr}
   const P=b.filter(x=>x.p!=null),Q=b.filter(x=>x.q!=null);return{leads:['II'],D,beats:b,facts:[`P–P ${f2(pp)} с (≈ ${f0(ah)} в мин), R–R ${f2(rr)} с (≈ ${f0(vh)} в мин)`,'PQ всё время разный — P не связаны с QRS',wide?'QRS широкие — водитель в желудочках':'QRS узкие — водитель в AV-соединении'],
   ann:[{t0:P[1].p+.045,t1:P[2].p+.045,text:`P–P ${f2(pp)} с`},{t0:Q[0].q+.035,t1:Q[1].q+.035,text:`R–R ${f2(rr)} с > P–P`}]}}},
{id:'rbbb',g:'prov',name:'Полная блокада правой ножки пучка Гиса',page:'102–103',crit:['QRS шире 0,12 с (0,10–0,12 — неполная)','Широкий расщеплённый R (rSR′) в V1–V2','ST и T дискордантны блокированному R','Умеренное отклонение оси вправо'],conf:['lbbb','rvh','ves','wpw'],
 gen(){const D=3,b=sinus(D,rnd(66,78),{qt:'rbbb'});return{leads:['V1','V6','II','I'],D,beats:b,facts:['QRS ≈ 0,14 с > 0,12 с — полная блокада','V1: rSR′ — расщеплённый R («М»)','V1: T отрицательный — дискордантен R′','V6: широкий S'],
   ann:[{lead:'V1',t0:b[0].q,t1:b[0].q+.14,text:'QRS ≈ 0,14 с'},{lead:'V1',t:b[0].q+.095,text:'R′ в V1 — блокированный R'},{lead:'V6',t:b[0].q+.09,text:'широкий S в V6'}]}}},
{id:'lbbb',g:'prov',name:'Полная блокада левой ножки пучка Гиса',page:'102–103',crit:['QRS шире 0,12 с','Широкий деформированный (зазубренный) R в V5–V6','ST и T дискордантны R в V5–V6','Умеренное отклонение оси влево'],conf:['rbbb','lvh','ves','idio'],
 gen(){const D=3,b=sinus(D,rnd(64,78),{qt:'lbbb'});return{leads:['V1','V6','I','II'],D,beats:b,facts:['QRS ≈ 0,15 с > 0,12 с','V6: широкий R с зазубриной, без q','V6: ST ниже изолинии, T отрицательный — дискордантны','V1: глубокий широкий QS'],
   ann:[{lead:'V6',t0:b[0].q,t1:b[0].q+.15,text:'QRS ≈ 0,15 с'},{lead:'V6',t:b[0].q+.065,text:'зазубренный R'},{lead:'V6',t:b[0].q+.3,text:'T против R'}]}}},
{id:'wpw',g:'prov',name:'Синдром WPW (преждевременное возбуждение)',page:'104',crit:['Импульс идёт в обход AV-узла по дополнительному пути (пучок Кента)','PQ укорочен < 0,12 с','Δ-волна в начале R'],conf:['atrial','av1','lbbb','norm'],
 diff:'От предсердного ритма: там PQ тоже короткий, но P может быть (−), QRS не изменён и Δ-волны нет (с. 95).',
 gen(){const D=3,b=sinus(D,rnd(64,80),{pq:.09,qt:'wpw'});return{leads:['II','V5'],D,beats:b,facts:['PQ ≈ 0,09 с < 0,12 с','пологое начало R — Δ-волна','QRS немного расширен'],
   ann:[{t0:b[0].p,t1:b[0].q,text:'PQ ≈ 0,09 с'},{t:b[0].q+.02,text:'Δ-волна'}]}}},
{id:'ppulm',g:'gip',name:'Дилатация правого предсердия (P-pulmonale)',page:'104–105',crit:['Высокий остроконечный P > 2,5 мм во II, III, aVF','В V1 преобладает первая (+) фаза P','Длительность P не превышает 0,10 с'],conf:['pmitr','norm','rvh','atrial'],
 gen(){const D=3,b=sinus(D,rnd(68,85),{pt:'peak'});return{leads:['II','III','aVF','V1'],D,beats:b,facts:[`P во II ≈ ${f2(PN.II*2.1*10).replace(/,?0+$/,'')} мм > 2,5 мм, остроконечный`,'длительность P ≈ 0,08 с — не расширен'],ann:[{t:b[0].p+.04,text:'P > 2,5 мм, заострён'}]}}},
{id:'pmitr',g:'gip',name:'Дилатация левого предсердия (P-mitrale)',page:'105',crit:['P шире 0,10 с в I, II, aVL','Двугорбый P (раздвоение вершины)','В V1 — глубокая и длинная вторая (−) фаза P','Похожие признаки (P > 0,10 с, расщепление) дают внутрипредсердную блокаду (с. 100)'],conf:['ppulm','norm','av1','atrial'],
 gen(){const D=3,b=sinus(D,rnd(66,82),{pt:'bif',pq:.18});return{leads:['II','I','V1'],D,beats:b,facts:['P ≈ 0,12 с > 0,10 с','две вершины P (позднее возбуждение левого предсердия)','V1: глубокая отрицательная вторая фаза P'],ann:[{t0:b[0].p,t1:b[0].p+.12,text:'P ≈ 0,12 с, двугорбый'},{lead:'V1',t:b[0].p+.085,text:'(−) фаза P в V1'}]}}},
{id:'lvh',g:'gip',name:'Гипертрофия левого желудочка',page:'106–107',crit:['R в V5–V6 высокий: RV5,6 > RV4, RV5,6 > 25 мм','Глубокий S в V1–V2; RV5,6 + SV1,2 > 35 мм','Ось смещена влево; переходная зона смещена к V1–V2','Время внутреннего отклонения в V5–V6 > 0,05 с','При перегрузке — ST ниже изолинии и T (−) в V5–V6, I, aVL'],conf:['rvh','lbbb','isch','norm'],
 gen(){const D=3,rv5=rnd(2.6,3.2),sv1=rnd(1.6,2.1),mod={V5:{r:rv5/1.3,st:-.1,t:-.25},V6:{r:rv5*.9/1.1,st:-.08,t:-.2},V1:{v:sv1},I:{r:1.5,st:-.05,t:-.1},aVL:{r:2.6,t:-.08}};
   const b=sinus(D,rnd(64,80),{mod});return{leads:['V1','V5','V6','I'],D,beats:b,facts:[`RV5 ≈ ${f0(rv5*10)} мм > 25 мм`,`SV1 ≈ ${f0(sv1*10)} мм; RV5 + SV1 ≈ ${f0((rv5+sv1)*10)} мм > 35 мм`,'V5–V6: ST ниже изолинии, T (−) — систолическая перегрузка'],
   ann:[{lead:'V5',t:b[0].q+.035,text:`R ${f0(rv5*10)} мм`},{lead:'V1',t:b[0].q+.056,text:`S ${f0(sv1*10)} мм`},{lead:'V5',t:b[0].q+.26,text:'T (−) в V5'}]}}},
{id:'rvh',g:'gip',name:'Гипертрофия правого желудочка',page:'106',crit:['R в V1–V2 высокий: RV1 > 7 мм','Глубокий S в V5–V6; RV1 + SV6 > 10,5 мм','Ось вертикальна или отклонена вправо','Переходная зона сдвинута влево (V3–V6)','Время внутреннего отклонения в V1 > 0,03 с','При перегрузке — ST смещён и T (−) в V1–V2, III, aVF'],conf:['lvh','rbbb','ppulm','norm'],
 gen(){const D=3,rv1=rnd(.85,1.2),sv6=rnd(.6,.9);const cm={V1:{q:[[.035,rv1,.012],[.065,-.2,.01]],d:.09,t:-.25,st:-.05},V6:{q:[[.03,.55,.01],[.06,-sv6,.013]],d:.09,t:.15},I:{q:[[.03,.2,.01],[.058,-.55,.012]],d:.09,t:.1},III:{q:[[.035,1.2,.011],[.06,-.1,.008]],d:.09,t:-.1}};
   const b=sinus(D,rnd(68,84),{qt:'custom',cm});return{leads:['V1','V6','I','III'],D,beats:b,facts:[`RV1 ≈ ${f0(rv1*10)} мм > 7 мм`,`SV6 ≈ ${f0(sv6*10)} мм; RV1 + SV6 ≈ ${f0((rv1+sv6)*10)} мм > 10,5 мм`,'I: глубокий S, III: высокий R — ось вправо','V1: T (−)'],
   ann:[{lead:'V1',t:b[0].q+.035,text:`R ${f0(rv1*10)} мм в V1`},{lead:'V6',t:b[0].q+.06,text:`S ${f0(sv6*10)} мм в V6`}]}}},
{id:'lowv',g:'gip',name:'Снижение вольтажа',page:'91',crit:['Вольтаж достаточный, если Rmax > 5 мм и RI + RII + RIII > 15 мм в стандартных отведениях','Иначе — снижение вольтажа (диффузное поражение миокарда, эмфизема, выпотной перикардит)'],conf:['norm','isch','mistage','ppulm'],
 gen(){const D=3,mod={I:{v:.45},II:{v:.4},III:{v:.5}},b=sinus(D,rnd(70,90),{mod});const r=[.7*.45,1.1*.4,.5*.5].map(x=>x*10);return{leads:['I','II','III'],D,beats:b,facts:[`RI ≈ ${f0(r[0])}, RII ≈ ${f0(r[1])}, RIII ≈ ${f0(r[2])} мм`,`Rmax ≈ ${f0(r[1])} мм < 5 мм; сумма ≈ ${f0(r[0]+r[1]+r[2])} мм < 15 мм`],ann:[{lead:'II',t:b[0].q+.035,text:`RII ≈ ${f0(r[1])} мм — максимальный`}]}}},
{id:'isch',g:'ibs',name:'Ишемия миокарда (стенокардия)',page:'107–108',crit:['Депрессия ST более 1 мм от изолинии, с динамикой в ближайшие часы','Аномальные T: высокие, симметричные, островершинные','Субэндокардиальная ишемия — горизонтальная депрессия ST, T (+); субэпикардиальная — косонисходящая депрессия ST, T (−)'],conf:['lvh','mistage','norm','lbbb'],
 diff:'От ГЛЖ с перегрузкой: там ST тоже снижен, но высокий вольтаж R в V5–V6 > 25 мм (с. 106). От ИМ без Q: смотрят динамику и клинику.',
 gen(){const D=3,sub=Math.random()<.6,dep=rnd(.15,.22),m={st:-dep,t:sub?.3:-.25};const mod={V4:m,V5:m,V6:{...m,st:-dep*.8},II:{st:-dep*.6,t:sub?.25:-.15}};const b=sinus(D,rnd(68,88),{mod});
   return{leads:['V4','V5','V6','II'],D,beats:b,facts:[`ST ниже изолинии на ≈ ${f2(dep*10).replace(/,?0+$/,'')} мм (> 1 мм) в V4–V6`,sub?'ST горизонтальный, T (+) — субэндокардиальная ишемия (с. 108)':'ST косонисходящий, T (−) — субэпикардиальная ишемия (с. 108)','патологических Q нет'],
   ann:[{lead:'V5',t0:b[0].q+.11,t1:b[0].q+.2,text:`ST ↓ ≈ ${f2(dep*10).replace(/,?0+$/,'')} мм`}]}}},
{id:'mistage',g:'ibs',name:'ИМ с зубцом Q: стадия',page:'108–109',crit:['Острейшая — подъём ST, ST и T сливаются в монофазную кривую (часы, сутки)','Острая — патологический Q, ST приподнят, T становится отрицательным (1–2 недели)','Подострая — Q (или QS) остаётся, ST на изолинии, T отрицательный (2–5 недель)','Рубцовая — Q остаётся, ST на изолинии, T уменьшается или реинвертируется (2–3 месяца)','Патологический Q: глубже ¼ R, шире 0,03 с (с. 88)'],
 opts:['Острейшая стадия ИМ','Острая стадия ИМ','Подострая стадия ИМ','Рубцовая стадия ИМ'],
 gen(){const st=pick([0,1,2,3]),loc=pick(MILOC.slice(0,4));const md=[{st:.38,t:.55,tw:.06},{qPath:-.45,r:.4,st:.22,t:-.3},{qPath:-.45,r:.4,st:0,t:-.45},{qPath:-.45,r:.5,st:0,t:.12}][st];
   const mod={};loc.leads.forEach(l=>mod[l]=md);if(st<2)loc.rec.forEach(l=>mod[l]={st:-.15});const b=sinus(3,rnd(66,90),{mod});const lead=loc.leads[0];
   const desc=['ST резко приподнят и сливается с T — монофазная кривая; Q ещё нет','патологический Q, ST приподнят, T отрицательный','Q остаётся, ST на изолинии, T глубокий отрицательный','Q остаётся, ST на изолинии, T небольшой положительный'][st];
   return{answer:this.opts[st],leads:[...loc.leads.slice(0,3),...(loc.rec.slice(0,1))],D:3,beats:b,facts:[`изменения в ${loc.leads.join(', ')} (${loc.name.toLowerCase()} ИМ)`,desc,st<2?`в ${loc.rec.join(', ')} — реципрокная депрессия ST (с. 110)`:'реципрокных изменений уже нет'],
   ann:[st===0?{lead,t:b[0].q+.2,text:'монофазная кривая'}:{lead,t:b[0].q+.018,text:'патологический Q'},{lead,t:b[0].q+.27,text:st===3?'T (+) — реинверсия':st===0?'ST сливается с T':'T (−)'}]}}},
{id:'miloc',g:'ibs',name:'ИМ: локализация',page:'109–110',crit:['Передний — V2–V4','Передне-перегородочный — V1–V4','Передне-боковой — V4–V6, I, aVL','Нижний — II, III, aVF','Боковой — I, aVL, V5–V6','Реципрокные изменения (депрессия ST) — в отведениях противоположной стенки: I↔III, aVL↔aVF, III↔грудные (с. 110)'],
 opts:null,
 gen(){const loc=pick(MILOC),md={qPath:-.45,r:.4,st:.25,t:-.25},mod={};loc.leads.forEach(l=>mod[l]=md);loc.rec.forEach(l=>mod[l]={st:-.15});const b=sinus(2,rnd(66,90),{mod,t0:.3});
   const others=shuffle(MILOC.filter(x=>x!==loc)).slice(0,3).map(x=>x.name+' ИМ');
   return{answer:loc.name+' ИМ',options:shuffle([loc.name+' ИМ',...others]),leads:['I','II','III','aVL','aVF','V1','V2','V3','V4','V5','V6'],D:2,beats:b,
   facts:[`подъём ST и патологический Q — в ${loc.leads.join(', ')}`,`реципрокная депрессия ST — в ${loc.rec.join(', ')}`],ann:[{lead:loc.leads[0],t:b[0].q+.15,text:'подъём ST, Q'},{lead:loc.rec[0],t:b[0].q+.15,text:'реципрокная депрессия ST'}]}}}
];
const MILOC=[{name:'Передний',leads:['V2','V3','V4'],rec:['III']},{name:'Передне-перегородочный',leads:['V1','V2','V3','V4'],rec:['III']},{name:'Нижний',leads:['II','III','aVF'],rec:['I','aVL']},{name:'Боковой',leads:['I','aVL','V5','V6'],rec:['III','aVF']},{name:'Передне-боковой',leads:['V4','V5','V6','I','aVL'],rec:['III','aVF']}];
const BYID=Object.fromEntries(ITEMS.map(x=>[x.id,x]));
const GROUPS={all:'Все',ritm:'Ритм',prov:'Проводимость',gip:'Гипертрофии',ibs:'ИБС'};
/* ---------- рисование ленты ---------- */
function draw(svg,cs,showAnn){
  const L=cs.leads,n=L.length,cols=n===1?1:n<=4?2:3,Dp=cs.D,W=cols*Dp*25,ms=25;
  const sig=Object.fromEntries(L.map(l=>[l,makeSig(cs,l)]));
  const rows=[];for(let i=0;i<n;i+=cols)rows.push(L.slice(i,i+cols));
  let y=0,h='',ann='',k=0;const pos={};
  rows.forEach(r=>{let mx=.4,mn=-.4;r.forEach(l=>{for(let t=0;t<Dp;t+=.004){const v=sig[l](t);mx=Math.max(mx,v);mn=Math.min(mn,v)}});
    const top=y,base=y+5+mx*10,hh=(mx-mn)*10+10;
    r.forEach((l,j)=>{const x0=j*Dp*ms;let d='';for(let t=0;t<=Dp;t+=.002){const v=sig[l](t);d+=(d?'L':'M')+(x0+t*ms).toFixed(2)+' '+(base-v*10).toFixed(2)}
      h+=`<path d="${d}" class="qz-tr"/><text x="${x0+1.5}" y="${top+4.2}" class="qz-ld">${l}</text>`;if(j>0)h+=`<line x1="${x0}" x2="${x0}" y1="${top}" y2="${top+hh}" class="qz-sep"/>`;
      pos[l]={x0,base,top,hh}});
    y+=hh});
  const vis=showAnn?(cs.ann||[]).filter(a=>pos[a.lead||L[0]]&&(a.t1!=null?a.t0<Dp:a.t<Dp)):[];
  const used=[],brs=[];const free=(x,y)=>!used.some(([u,v])=>Math.abs(u-x)<6.5&&Math.abs(v-y)<6);
  const lab=(x,y)=>{used.push([x,y]);return`<g class="qz-an"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6"/><text x="${x.toFixed(1)}" y="${y.toFixed(1)}" dy="1.1">${k}</text></g>`};
  vis.forEach(a=>{const p=pos[a.lead||L[0]];k++;
    if(a.t1!=null){const xa=p.x0+a.t0*ms,xb=Math.min(p.x0+a.t1*ms,p.x0+Dp*ms);let lv=0;
      while(brs.some(([l,u,v])=>l===lv&&u<xb+1&&v>xa-1)||!free((xa+xb)/2,p.top+3.5+lv*7))lv++;brs.push([lv,xa,xb]);const yy=p.top+6.5+lv*7;
      ann+=`<path class="qz-br" d="M${xa} ${yy+2}V${yy}H${xb}V${yy+2}"/>`+lab((xa+xb)/2,yy-3)}
    else{const xa=p.x0+a.t*ms,v=sig[a.lead||L[0]](a.t),yv=p.base-v*10,lo=p.top+4,hi=p.top+p.hh-3.5;
      const c=[[0,-9],[0,-15],[7,-9],[-7,-9],[0,-21],[7,-15],[-7,-15],[0,9]].map(([dx,dy])=>[xa+dx,Math.min(hi,Math.max(lo,yv+dy))]).find(([x,y])=>free(x,y))||[xa,Math.max(lo,yv-9)];
      const [lx,ly]=c,up=ly<yv;ann+=`<path class="qz-ar" d="M${lx} ${ly+(up?2.8:-2.8)}L${xa} ${yv+(up?-1.5:1.5)}"/>`+lab(lx,ly)}});
  svg.setAttribute('viewBox',`0 0 ${W} ${y}`);svg.style.minWidth=Math.round(W*4.3)+'px';
  svg.innerHTML=`<defs><pattern id="${svg.id}-g" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M1 0V5M2 0V5M3 0V5M4 0V5M0 1H5M0 2H5M0 3H5M0 4H5" class="qz-g1"/><path d="M0 0H5M0 0V5" class="qz-g5"/></pattern></defs>
   <rect width="${W}" height="${y}" class="qz-bg"/><rect width="${W}" height="${y}" fill="url(#${svg.id}-g)"/>${h}${ann}`;
  return vis}
/* ---------- тренажёр ---------- */
function ECGQuiz(root,ref){
  let grp='all',pool=[],cur=null,cs=null,score=[0,0],wrong=[],answered=false,qn=0;
  root.innerHTML=`<div class="qz-top"><div class="qz-grp" role="group" aria-label="Раздел">${Object.entries(GROUPS).map(([k,v])=>`<button type="button" data-g="${k}" aria-pressed="${k==='all'}">${v}</button>`).join('')}</div>
   <span class="qz-sc" aria-live="polite"></span></div>
   <p class="qz-q"></p><div class="qz-strip"><svg id="qz-svg" class="qz-svg" role="img" aria-label="Лента ЭКГ"></svg></div><p class="qz-scale"><span class="qz-swipe">лента листается вбок → · </span>25 мм/с · 10 мм/мВ · маленькая клетка = 0,04 с и 0,1 мВ, большая = 0,20 с и 0,5 мВ</p>
   <div class="qz-opts"></div><div class="qz-ex" aria-live="polite"></div>
   <div class="qz-nav"><button type="button" data-a="hint">Что смотреть</button><button type="button" data-a="next" class="qz-next">Следующая лента →</button><button type="button" data-a="redo" hidden></button></div>`;
  const $=s=>root.querySelector(s),svg=$('#qz-svg'),opts=$('.qz-opts'),ex=$('.qz-ex'),sc=$('.qz-sc'),qq=$('.qz-q'),redo=$('[data-a=redo]');
  const refill=()=>{pool=shuffle(ITEMS.filter(x=>grp==='all'||x.g===grp))};
  function next(fromWrong){if(fromWrong&&wrong.length){cur=wrong.shift()}else{if(!pool.length)refill();cur=pool.pop()}
    cs=cur.gen();answered=false;qn++;draw(svg,cs,false);
    const ans=cs.answer||cur.name;let o=cs.options||(cur.opts?cur.opts.slice():[ans,...shuffle(cur.conf).slice(0,3).map(id=>BYID[id].name)]);o=shuffle(o);
    qq.innerHTML=`<b>Лента ${qn}.</b> `+(cur.id==='mistage'?'Какая стадия инфаркта миокарда?':cur.id==='miloc'?'Где локализуется инфаркт?':`Какое нарушение${cs.leads.length>1?' (отведения '+cs.leads.join(', ')+')':' (отведение II)'}?`);
    opts.innerHTML=o.map(t=>`<button type="button" class="qz-o">${t}</button>`).join('');ex.innerHTML='';upd()}
  function upd(){sc.textContent=`верно ${score[0]} из ${score[1]}`;redo.hidden=!wrong.length;redo.textContent=`Повторить ошибки (${wrong.length})`}
  function explain(chosen){const ans=cs.answer||cur.name,ok=chosen===ans,vis=draw(svg,cs,true);
    [...opts.children].forEach(b=>{b.disabled=true;if(b.textContent===ans)b.classList.add('ok');else if(b.textContent===chosen)b.classList.add('bad')});
    const other=ITEMS.find(x=>x.name===chosen&&x.name!==ans);
    ex.innerHTML=`<p class="qz-v ${ok?'ok':'bad'}">${ok?'Верно.':'Неверно.'} Это <b>${ans}</b>.</p>
     <p><b>Критерии</b> ${SRC(cur.page)}:</p><ul>${cur.crit.map(c=>`<li>${c}</li>`).join('')}</ul>
     <p><b>На этой ленте</b> (номера — метки на ленте):</p><ol class="qz-annl">${vis.map(a=>`<li>${a.text}</li>`).join('')}</ol>
     <ul class="qz-facts">${cs.facts.map(f=>`<li>${f}</li>`).join('')}</ul>
     ${!ok&&other?`<p class="qz-why"><b>Почему не «${other.name}»:</b> для неё нужно — ${other.crit.slice(0,2).join('; ').replace(/\s*\(с\. [^)]*\)/g,'')} ${SRC(other.page)}.</p>`:''}
     ${cur.diff?`<p class="qz-diff"><b>Не путать:</b> ${cur.diff}</p>`:''}`}
  opts.addEventListener('click',e=>{const b=e.target.closest('.qz-o');if(!b||answered)return;answered=true;const ok=b.textContent===(cs.answer||cur.name);score[1]++;if(ok)score[0]++;else if(!wrong.includes(cur))wrong.push(cur);upd();explain(b.textContent)});
  root.querySelector('.qz-nav').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='next')next(false);else if(a==='redo')next(true);
    else if(a==='hint')ex.innerHTML=`<p class="qz-hint"><b>Порядок анализа</b> ${SRC('90–93')}: 1) есть ли P перед каждым QRS и какой он во II; 2) равны ли R–R (разница ≤ 0,10 с) и ЧСС = 60 / R–R; 3) PQ 0,12–0,20 с, постоянный ли, не выпадают ли QRS; 4) ширина QRS (≤ 0,10 с), форма; 5) ST на изолинии? T того же направления, что R? 6) амплитуды R и S в грудных отведениях; патологический Q.</p>`});
  root.querySelector('.qz-grp').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;grp=b.dataset.g;[...b.parentNode.children].forEach(x=>x.setAttribute('aria-pressed',x===b));refill();next(false)});
  refill();next(false);
  /* справочник */
  if(ref){ref.innerHTML=Object.entries(GROUPS).filter(([k])=>k!=='all').map(([g,t])=>`<h3>${t}</h3>`+ITEMS.filter(x=>x.g===g).map(x=>`<details class="qz-ref" data-id="${x.id}"><summary>${x.name} <span class="src">с. ${x.page}</span></summary>
      <ul>${x.crit.map(c=>`<li>${c}</li>`).join('')}</ul>${x.diff?`<p class="qz-diff"><b>Не путать:</b> ${x.diff}</p>`:''}<div class="qz-strip"><svg class="qz-svg" id="qzr-${x.id}" role="img" aria-label="Пример ленты: ${x.name}"></svg></div><ol class="qz-annl"></ol><button type="button" class="qz-new">другой пример</button></details>`).join('')).join('');
    const show=d=>{const it=BYID[d.dataset.id],c=it.gen(),vis=draw(d.querySelector('svg'),c,true);d.querySelector('.qz-annl').innerHTML=vis.map(a=>`<li>${a.text}</li>`).join('')+(c.answer&&c.answer!==it.name?`<li>на примере: ${c.answer}</li>`:'')};
    ref.addEventListener('toggle',e=>{const d=e.target;if(d.open&&!d.dataset.done){d.dataset.done=1;show(d)}},true);
    ref.addEventListener('click',e=>{const b=e.target.closest('.qz-new');if(b)show(b.closest('details'))})}
}
window.ECGQuiz=ECGQuiz;window.ECGQuizItems=ITEMS;
})();
