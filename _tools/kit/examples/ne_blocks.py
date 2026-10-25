SEC='''
  <h3 id="norm-el">Нормальная ЭКГ по элементам</h3>
  <p>Нажмите на элемент — он подсветится на кривой, рядом появятся мерка и карточка: что отражает, где искать, норма по методичке, с чем не путать. Кнопка «▶ по порядку» проводит по всем элементам цикла.</p>
  <figure class="gx ne"><div class="figbar">Разбор одного цикла · схема составлена для сайта, не из методички</div><div id="ne-a"></div>
  <figcaption>Кривая построена так, что все величины лежат в нормах методички (с. 88–89): P 0,09 с и 1,5 мм, PQ 0,16 с, QRS 0,09 с, R 11 мм, QRST 0,37 с, R–R 0,80 с. Зубец U в методичке только назван (с. 87), норм для него нет — поэтому он не нарисован.</figcaption></figure>
  <h3>Нормальная ЭКГ в 12 отведениях</h3>
  <p>Форма комплекса зависит от отведения. Переключайте, что показать: подсвеченная часть и подписи меняются.</p>
  <figure class="gx ne"><div class="figbar">12 отведений в норме · схема для сайта</div><div id="ne-b"></div>
  <figcaption>Амплитуды подобраны в пределах норм методички (с. 88–92); у реальных людей они заметно различаются.</figcaption></figure>
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
