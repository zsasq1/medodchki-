SEC='''<section id="trainer">
  <h2>11. Тренажёр: найди нарушение на ЭКГ</h2>
  <p>Каждый раз программа рисует новую ленту: частота, интервалы и вариант нарушения меняются случайно, поэтому одну и ту же картинку не запомнишь — приходится мерить. Выберите ответ: на ленте появятся пронумерованные метки, а ниже — критерии из методички и что именно на этой ленте их подтверждает. Ошибки собираются, их можно прогнать ещё раз.</p>
  <p class="small">Ленты сгенерированы для сайта, это не записи пациентов: форма зубцов упрощена. Критерии — кардио.pdf, гл. 4, с. 88–111; пометка <span class="tag t-dis">учебн.</span> — признак, которого нет в методичке.</p>
  <div id="qz" class="qz"></div>
  <h3>Справочник: все нарушения с примерами</h3>
  <p class="small">Раскройте пункт — появятся критерии и пример ленты с разметкой; кнопка «другой пример» рисует новый вариант.</p>
  <div id="qz-ref"></div>
</section>
'''
CSS='''
.qz{display:flex;flex-direction:column;gap:10px;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px}
.qz-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.qz-grp{display:flex;flex-wrap:wrap;gap:6px}.qz-grp button{font-size:13px;padding:3px 10px}
.qz-grp button[aria-pressed="true"]{border-color:var(--accent);font-weight:600;background:var(--accent-soft,transparent)}
.qz-sc{font:500 13px var(--mono);color:var(--muted)}
.qz-q{margin:0;font-size:16px}
.qz-strip{overflow-x:auto;overscroll-behavior-x:contain;border-radius:6px;border:1px solid var(--line);-webkit-overflow-scrolling:touch}
.qz-svg{display:block;width:100%;height:auto}
.qz-bg{fill:var(--grid-bg,#fffdfd)}.qz-g1{stroke:var(--grid-sm,#f4d0d4);stroke-width:.12;fill:none}.qz-g5{stroke:var(--grid-bg2,#e7a2ab);stroke-width:.3;fill:none}
.qz-tr{fill:none;stroke:var(--trace,#1b1416);stroke-width:.45;stroke-linejoin:round}
.qz-ld{font:700 3.6px var(--mono);fill:var(--trace,#1b1416)}.qz-sep{stroke:var(--trace,#1b1416);stroke-width:.3;opacity:.5}
.qz-an circle{fill:var(--mk,#1d55b0)}.qz-an text{font:700 3.2px var(--body);fill:#fff;text-anchor:middle}
.qz-br,.qz-ar{fill:none;stroke:var(--mk,#1d55b0);stroke-width:.45}
.qz-scale{margin:0;font-size:12.5px;color:var(--muted)}
.qz-opts{display:grid;grid-template-columns:1fr;gap:6px}@media (min-width:640px){.qz-opts{grid-template-columns:1fr 1fr}}
.qz-o{text-align:left;font-size:15px;padding:8px 12px;min-height:44px}
.qz-o.ok{border-color:var(--ok,#1f6b52);background:var(--ok-soft,#e1efe8);font-weight:600}.qz-o.bad{border-color:var(--hot,#b0283a);background:var(--warn-soft,#fbf0d4);text-decoration:line-through}
.qz-ex p,.qz-ex ul,.qz-ex ol{margin:.35em 0}.qz-ex ul,.qz-ex ol{padding-left:1.3em}
.qz-v{font-size:16px}.qz-v.ok{color:var(--ok,#1f6b52)}.qz-v.bad{color:var(--hot,#b0283a)}
.qz-annl li::marker{color:var(--mk,#1d55b0);font-weight:700}
.qz-facts{color:var(--muted)}.qz-why,.qz-diff,.qz-hint{border-left:3px solid var(--accent);padding-left:10px}
.qz-nav{display:flex;flex-wrap:wrap;gap:8px}.qz-nav button{min-height:40px}.qz-next{font-weight:600;border-color:var(--accent)!important}
details.qz-ref{border:1px solid var(--line);border-radius:8px;padding:6px 10px;margin:6px 0;background:var(--paper)}
details.qz-ref summary{cursor:pointer;font-weight:600}details.qz-ref ul{padding-left:1.3em}
details.qz-ref .qz-new{font-size:13px;margin:4px 0}
'''
CSS+='''.qz-swipe{display:none}@media (max-width:700px){.qz-swipe{display:inline}}
'''
