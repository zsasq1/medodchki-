SEC='''
  <h3 id="norm-el">Нормальная ЭКГ по элементам</h3>
  <p>Нажмите на элемент — он подсветится на кривой, рядом появятся мерка и карточка: что отражает, где искать, норма по методичке, с чем не путать. Ниже тот же элемент показан во всех 12 отведениях: подписи говорят, где так и должно быть, где в норме бывает, а где это уже отклонение; кнопка «Как выглядит отклонение» рисует примеры патологии красным. «▶ по порядку» проводит по всем элементам.</p>
  <figure class="gx ne"><div class="figbar">Разбор одного цикла · схема составлена для сайта, не из методички</div><div id="ne-a"></div>
  <figcaption>Кривые построены так, что все величины лежат в нормах методички (с. 88–89): P 0,09 с и 1,5 мм, PQ 0,16 с, QRS 0,09 с, R 11 мм, QRST 0,37 с, R–R 0,80 с. Зубец U в методичке только назван (с. 87), норм для него нет — поэтому он не нарисован. Примеры отклонений — учебные схемы по критериям методички.</figcaption></figure>
  <h3>Как не перепутать</h3>
  <div class="tbl"><table>
    <tr><th>Похожие</th><th>Как отличить</th></tr>
    <tr><td>P и T</td><td>P — перед QRS, маленький (≤ 2,5 мм, ≤ 0,10 с), симметричный, туповершинный. T — после QRS, через сегмент ST, шире и асимметричный <span class="src">с. 88–89</span></td></tr>
    <tr><td>Q и S</td><td>Оба отрицательные. Q — до R, S — после R <span class="src">с. 88–89</span></td></tr>
    <tr><td>Сегмент и интервал</td><td>Сегмент — только ровный отрезок между зубцами: PQ — от конца P до начала Q, ST — от конца S до начала T. Интервал включает зубцы: PQ — от начала P до начала Q, QRST — от начала Q до конца T <span class="src">с. 88–89</span></td></tr>
    <tr><td>QRS и QRST</td><td>QRS — только возбуждение желудочков, 0,06–0,10 с. QRST — вся электрическая систола желудочков, до 0,40 с <span class="src">с. 88–89</span></td></tr>
    <tr><td>R и R′</td><td>Первый положительный зубец QRS — R, второй — R′; в норме R′ нет, он появляется при блокаде ножки <span class="src">с. 102</span></td></tr>
    <tr><td>Где Q, а где нет</td><td>Маленький q — в I, II, aVF, V5–V6; в V1–V3 Q быть не должно; в aVR возможен QS <span class="src">с. 88</span></td></tr>
  </table></div>
  <p><b>Порядок одного цикла:</b> P → сегмент PQ (изолиния) → Q → R → S → сегмент ST (изолиния) → T → изолиния до следующего P.</p>
  <h3>Проверь себя: что подсвечено?</h3>
  <figure class="gx ne"><div class="figbar">Тренажёр · частота меняется от ленты к ленте</div><div id="ne-c"></div></figure>
  <h3>Тренажёр: найди и оцени — три уровня</h3>
  <p>Нажимайте прямо на ленту. <b>Лёгкий</b> — найти зубец или сегмент на нормальной ЭКГ. <b>Средний</b> — найти элемент и решить, в норме он или нет (меряйте по клеткам). <b>Сложный</b> — в 12 отведениях отметить все отведения с отклонением; среди них попадаются варианты нормы, которые выглядят подозрительно.</p>
  <figure class="gx ne"><div class="figbar">Тренажёр · задания генерируются заново, критерии — кардио.pdf, с. 88–111</div><div id="ne-d"></div></figure>
'''
CSS='''
.ne-chips{display:flex;flex-wrap:wrap;gap:6px}.ne-chips button{font-size:13px;padding:3px 9px}
.ne-chips button[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft,transparent);font-weight:600}
.ne .qz-strip{margin-top:8px}
.ne-wide .qz-svg{max-width:680px;margin:0 auto}.ne-wide .qz-tr{stroke-width:.3}
#ne-svgB{max-width:720px;margin:0 auto}#ne-svgB .qz-tr{stroke-width:.3}
.ne-band{fill:var(--accent);opacity:.13}.ne-hl{fill:none;stroke:var(--accent);stroke-width:.75;stroke-linecap:round}
.ne-br,.ne-dim{fill:none;stroke:var(--mk,#1d55b0);stroke-width:.25}.ne-iso{stroke:var(--accent);stroke-width:.25;stroke-dasharray:1 1}
.ne-bt{font:600 1.9px var(--body);fill:var(--mk,#1d55b0);text-anchor:middle}
.ne-l{font:600 2.3px var(--body);fill:var(--muted);text-anchor:middle}.ne-l.on{fill:var(--accent);font-weight:800}
.ne-ld{font:700 2.2px var(--mono);fill:var(--trace,#1b1416)}.ne-num{font:600 1.7px var(--body);fill:var(--mk,#1d55b0)}.ne-mk{font:700 1.7px var(--body);fill:var(--accent)}
.ne-tour{display:flex;gap:6px;align-items:center;margin-top:8px}.ne-tour button{min-height:36px}.ne-cnt{font:500 12px var(--mono);color:var(--muted)}
.ne-card{border-left:3px solid var(--accent);padding:2px 0 2px 12px;margin-top:8px}.ne-card h4{margin:.2em 0 .4em;font-size:17px}
.ne-dl{display:grid;grid-template-columns:9.5em 1fr;gap:4px 12px;margin:0}.ne-dl dt{font-weight:600;color:var(--muted);font-size:14px}.ne-dl dd{margin:0}.ne-dl ul{margin:0;padding-left:1.1em}
@media (max-width:560px){.ne-dl{grid-template-columns:1fr}.ne-dl dt{margin-top:6px}}
.ne-note{border-left:3px solid var(--accent);padding-left:10px;margin:8px 0 0}
'''
CSS+='''@media (max-width:600px){.ne-mk,.ne-num{font-size:2.3px}.ne-ld{font-size:2.8px}.ne-bt{font-size:2.3px}}
'''
CSS+='''
/* ЭКГ-бумага всегда светлая, как настоящая — и в тёмной теме */
.qz-bg{fill:#fffdfd}.qz-g1{stroke:#f4d0d4}.qz-g5{stroke:#e7a2ab}.qz-tr{stroke:#1b1416}.qz-ld,.ne-ld{fill:#1b1416}.qz-sep{stroke:#1b1416}
.ne-l{fill:#6b5c5e}.ne-l.on{fill:#c0283a}.ne-hl{stroke:#c0283a}.ne-band{fill:#c0283a;opacity:.12}.ne-bt,.ne-num{fill:#1d55b0}.ne-br,.ne-dim{stroke:#1d55b0}.ne-iso{stroke:#c0283a}
.qz-tr.ne-bad{stroke:#c0283a;stroke-width:.42}
.ne-mk{font:700 1.6px var(--body)}.ne-mk.ok{fill:#1f6b52}.ne-mk.may{fill:#8a5a00}.ne-mk.no,.ne-mk.bad{fill:#c0283a}
.ne-12{max-width:760px;margin:0 auto}.ne-12 .qz-tr{stroke-width:.3}
.ne-h12{margin:14px 0 6px;font-size:16px}
.ne-mode{display:flex;gap:6px;flex-wrap:wrap}.ne-mode button{font-size:13px;padding:4px 10px}.ne-mode button[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft,transparent);font-weight:600}
.ne-leg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;margin:6px 0 0}.ne-leg .l-ok{color:var(--ok,#1f6b52)}.ne-leg .l-may{color:var(--warn,#8a5a00)}.ne-leg .l-no,.ne-leg .l-bad{color:var(--hot,#c0283a)}
.ne-nb{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}@media (max-width:640px){.ne-nb{grid-template-columns:1fr}}
.ne-nb>div{border:1px solid var(--line);border-radius:8px;padding:8px 10px}.ne-nb h5{margin:0 0 4px;font-size:14px}.ne-nb ul{margin:0;padding-left:1.1em}
.ne-ok{border-left:4px solid var(--ok,#1f6b52)!important}.ne-no{border-left:4px solid var(--hot,#c0283a)!important}
@media (max-width:600px){.ne-mk{font-size:2.1px}}
'''
CSS+='''
.nd-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px}.nd-lvl{font-size:14px;color:var(--muted);margin:6px 0 0}
.nd-strip .qz-svg{max-width:760px;margin:0 auto;cursor:crosshair}.nd-strip .qz-tr{stroke-width:.32}
.nd-tap{stroke:#fff;stroke-width:.35}.nd-tap.ok{fill:#1f6b52}.nd-tap.no{fill:#c0283a}
.ne-band.ok{fill:#1f6b52;opacity:.18}
.nd-sel{fill:none;stroke-width:.6}.nd-sel.pick{stroke:#1d55b0;fill:#1d55b0;fill-opacity:.08}.nd-sel.hit{stroke:#1f6b52;fill:#1f6b52;fill-opacity:.12}.nd-sel.miss{stroke:#c0283a;fill:#c0283a;fill-opacity:.12;stroke-dasharray:1.2 .8}.nd-sel.fa{stroke:#8a5a00;fill:#8a5a00;fill-opacity:.1}
.nd-act{margin-top:8px}.nd-cnt{font:500 13px var(--mono);color:var(--muted);margin-left:8px}
'''
