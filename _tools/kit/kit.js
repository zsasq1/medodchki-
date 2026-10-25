/* kit.js — общий движок разборов «Разборы к парам 314».
   Глобально: Anim(fig,{steps:[{label,dur}],render(i,t){…}}) — пошаговая анимация с кнопками ◀ ▶/❚❚ ▶, счётчиком,
   автозапуском при появлении на экране и учётом prefers-reduced-motion. render может вернуть строку — она станет подписью шага.
   KIT.wave(params,t) — модель кардиоцикла ЭКГ (t в секундах, R при 0,20 с); KIT.NORM — нормальные параметры;
   KIT.path(fn,t0,t1,X,Y) — SVG-путь функции; KIT.ease, KIT.fmt(число,знаков) — «0,80».
   Разметка анимации: <figure class="anim" id="…"><div class="figbar"><span>Анимация N · …</span></div>…SVG…
   <div class="ctrl" data-ctrl></div><p class="phase" aria-live="polite"></p><figcaption>…</figcaption></figure> */
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,r=document)=>r.querySelector(s);
const gs=(x,s)=>Math.exp(-(x*x)/(2*s*s));
const sm=(t,a,b)=>t<=a?0:t>=b?1:((x)=>x*x*(3-2*x))((t-a)/(b-a));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const NORM={pA:.15,pC:.05,pS:.018,q:-.1,qS:.006,r:1,s:-.25,st:0,t:.3};
function wave(p,t){return p.pA*gs(t-p.pC,p.pS)+p.q*gs(t-.175,p.qS)+p.r*gs(t-.20,.009)+p.s*gs(t-.225,.008)+p.st*sm(t,.23,.25)*(1-sm(t,.40,.47))+p.t*gs(t-.42,.04)}
function path(fn,t0,t1,X,Y,dt){let d='';for(let t=t0;t<=t1+1e-9;t+=dt||.002){d+=(d?'L':'M')+X(t).toFixed(1)+' '+Y(fn(t)).toFixed(1)}return d}
const fmt=(n,d=2)=>n.toFixed(d).replace('.',',');

/* общий движок пошаговой анимации */
function Anim(fig,o){
  const ctrl=$('[data-ctrl]',fig),ph=$('.phase',fig);
  ctrl.innerHTML='<button type="button" data-a="prev" aria-label="Шаг назад">◀ шаг</button><button type="button" data-a="play" aria-label="Пуск">▶</button><button type="button" data-a="next" aria-label="Шаг вперёд">шаг ▶</button><span class="cnt"></span>';
  const cnt=$('.cnt',ctrl),pb=$('[data-a=play]',ctrl);const n=o.steps.length;
  let i=0,t=RM?1:0,playing=false,user=false,last=0,raf=0;
  function show(){const r=o.render(i,t);ph.innerHTML=typeof r==='string'?r:o.steps[i].label;cnt.textContent='шаг '+(i+1)+' из '+n}
  function frame(ts){if(!playing)return;const dt=last?Math.min(ts-last,100):0;last=ts;t+=dt/o.steps[i].dur;
    if(t>=1){if(i<n-1){i++;t=0}else{i=0;t=0}}show();raf=requestAnimationFrame(frame)}
  function play(){if(playing)return;playing=true;last=0;pb.textContent='❚❚';pb.setAttribute('aria-label','Пауза');raf=requestAnimationFrame(frame)}
  function stop(){playing=false;cancelAnimationFrame(raf);pb.textContent='▶';pb.setAttribute('aria-label','Пуск')}
  ctrl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='play'){if(playing){stop();user=true}else{user=false;if(t>=1){t=0}play()}}
    else{stop();user=true;i=(i+(a==='next'?1:-1)+n)%n;t=1;show()}});
  new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){if(!user&&!RM)play()}else if(playing)stop()}),{threshold:.3}).observe(fig);
  show();
  return {stop(){stop();user=true},show};
}



window.Anim=Anim;window.KIT={wave,path,gs,sm,ease,fmt,NORM,RM};
/* боковое оглавление: подсветка текущего раздела */
(function(){const links=[...document.querySelectorAll('.side a')];if(!links.length)return;
  const secs=links.map(a=>document.getElementById(a.getAttribute('href').slice(1)));let tk=0;
  function upd(){tk=0;const lim=innerHeight*.3;let cur=-1;secs.forEach((s,k)=>{if(s&&s.getBoundingClientRect().top<lim)cur=k});links.forEach((a,k)=>a.classList.toggle('cur',k===cur))}
  addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(upd)},{passive:true});upd();})();

})();
