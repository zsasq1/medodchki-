/* steps-gsap.js — пошаговая анимация на GSAP-таймлайне.
   Нужен gsap 3.12.5 (cdnjs) до этого файла. Глобально: StepTL(fig, steps, build, opts).
   fig — <figure class="anim gx"> с [data-ctrl] и .phase; steps — [{label, hold}]; build(tl, i) добавляет в таймлайн твины шага i.
   Кнопки ◀ ▶/❚❚ ▶, счётчик «шаг N из M», автозапуск только когда блок на экране, prefers-reduced-motion — без автозапуска. */
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* StepTL: fig — <figure> с [data-ctrl] и .phase; steps — [{label}] ; build(tl, i) добавляет твины шага i в таймлайн. */
function StepTL(fig,steps,build,opts={}){
  const ctrl=fig.querySelector('[data-ctrl]'),ph=fig.querySelector('.phase');
  if(!window.gsap){ph.innerHTML='Анимация не загрузилась (нет связи с CDN). '+steps.map(s=>s.label).join('<br>');return null}
  ctrl.innerHTML='<button type="button" data-a="prev" aria-label="Шаг назад">◀ шаг</button><button type="button" data-a="play" aria-label="Пуск">▶</button><button type="button" data-a="next" aria-label="Шаг вперёд">шаг ▶</button><span class="cnt"></span>';
  const pb=ctrl.querySelector('[data-a=play]'),cnt=ctrl.querySelector('.cnt'),n=steps.length;
  const tl=gsap.timeline({paused:true,repeat:opts.repeat===false?0:-1,repeatDelay:opts.repeatDelay??1});
  const at=[];
  steps.forEach((s,i)=>{at.push(tl.duration());tl.addLabel('s'+i);build(tl,i);tl.to({},{duration:s.hold??1.2})});
  at.push(tl.duration());
  let cur=-1,user=false;
  function sync(){const t=tl.time();let i=0;for(let k=0;k<n;k++)if(t>=at[k]-1e-6)i=k;if(i!==cur){cur=i;ph.innerHTML=steps[i].label;cnt.textContent='шаг '+(i+1)+' из '+n;opts.onStep&&opts.onStep(i)}}
  tl.eventCallback('onUpdate',sync);
  const setBtn=p=>{pb.textContent=p?'❚❚':'▶';pb.setAttribute('aria-label',p?'Пауза':'Пуск')};
  function go(i){tl.pause();setBtn(false);user=true;tl.seek(at[i],true);tl.seek(Math.max(0,at[i+1]-0.001),false);sync()} /* сначала к началу шага без событий, затем вперёд: tl.call внутри шага срабатывают по порядку */
  ctrl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='play'){if(tl.paused()||!tl.isActive()){user=false;if(tl.progress()>=1)tl.seek(0);tl.play();setBtn(true)}else{tl.pause();user=true;setBtn(false)}}
    else go(((cur<0?0:cur)+(a==='next'?1:-1)+n)%n)});
  new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){if(!user&&!RM){tl.play();setBtn(true)}}else{tl.pause();setBtn(false)}}),{threshold:.3}).observe(fig);
  if(RM)go(0);else{tl.seek(0);sync()}
  return {tl,go};
}

window.StepTL=StepTL;
})();
