FIG='''
<h3 id="axis-3d">Электрическая ось в 3D — объяснение «на пальцах»</h3>
<div class="ax-kid">
  <p><b>Представьте:</b> когда желудочки возбуждаются, по сердцу «бежит» электрический сигнал — как толпа людей, которая в среднем бежит в одну сторону. <b>Электрическая ось</b> — это стрелка, куда в среднем бежит эта толпа во фронтальной плоскости (как будто смотрим на человека спереди) <span class="src">кардио.pdf, с. 91</span>.</p>
  <p><b>Отведения — это фотографы</b>, которые стоят вокруг сердца в разных местах (их «линии» — синие лучи). Правило простое <span class="src">с. 92</span>:</p>
  <ul><li>толпа бежит <b>к фотографу</b> → на его ЭКГ большой зубец <b>вверх</b> (R);</li><li>бежит <b>от него</b> → зубец <b>вниз</b> (S);</li><li>бежит <b>мимо, поперёк</b> → вверх и вниз поровну, R ≈ S.</li></ul>
  <p>Угол меряют от линии I отведения (к левой руке = 0°), вниз — плюс, вверх — минус. Нормальная ось смотрит влево-вниз, примерно туда, куда смотрит верхушка сердца.</p>
</div>
<figure class="anim ax3d" id="a-axis3d">
<div class="figbar"><span>3D · электрическая ось, оси отведений и треугольник Эйнтховена</span></div>
<div class="ax-3d v3d"></div>
<p class="ax-legend"><span><i style="background:#d62f3a"></i>электрическая ось</span><span><i style="background:#1d55b0"></i>оси отведений (+)</span><span><i style="background:#2f9e6e"></i>норма +30…+70°</span><span><i style="background:#7cc29b"></i>горизонтальная / вертикальная</span><span><i style="background:#e0a43a"></i>отклонение</span><span><i style="background:#d0505e"></i>резкое отклонение</span></p>
<div class="ax-ui"></div>
<svg class="ax-ecg" role="img" aria-label="QRS в шести отведениях от конечностей при выбранном положении оси"></svg>
<div class="ax-info" aria-live="polite"></div>
<figcaption>Схема составлена для сайта, не из методички. Модель вращается пальцем или мышью — видно, что все оси лежат в одной, фронтальной, плоскости. Положения оси: 0…+30° горизонтальное, +30…+70° нормальное, +70…+90° вертикальное, меньше 0° — отклонение влево (меньше −30° — резкое), больше +90° — вправо (больше +120° — резкое) — кардио.pdf, с. 91. Причины отклонения: гипертрофия — в сторону гипертрофированного желудочка; блокады ножек и ветвей левой ножки — в соответствующую сторону (с. 91–92). Цвета электродов (красный, жёлтый, зелёный) — общепринятые, в методичке их нет. Мини-ЭКГ упрощены: высота R и глубина S пропорциональны проекции оси. 3D-модель: BodyParts3D © The Database Center for Life Science, CC BY 4.0.</figcaption>
</figure>
'''
CSS='''
.ax-kid{background:var(--paper);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:10px 14px;margin:8px 0}
.ax-kid p,.ax-kid ul{margin:.35em 0}.ax-kid ul{padding-left:1.2em}
.ax3d .ax-3d{min-height:260px}.ax-lab span{transform:translate(-50%,-50%);font-size:11.5px}
.ax-lab .ax-lead{background:#fff;border-color:#1d55b0;color:#1d55b0}.ax-lab .ax-lead small{font-weight:500;opacity:.8}
.ax-lab .ax-tick{background:transparent;border:0;color:var(--muted);font-weight:500}.ax-lab .ax-el{background:#fff;border-color:#888;color:#333;font-weight:700;white-space:nowrap;text-align:center;line-height:1.15}.ax-lab .ax-el small{font-weight:500}
.ax-legend{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:13px;margin:6px 0}.ax-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-1px}
.ax-ui{display:flex;flex-direction:column;gap:8px}.ax-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.ax-row input{flex:1 1 220px;accent-color:#d62f3a}
.ax-pre{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ax-pre button{font-size:13px;padding:3px 9px}.ax-game{font-weight:600;border-color:#7b3fc4!important}
.ax-chk{font-size:13px;color:var(--muted)}
.ax-ecg{display:block;width:100%;height:auto;max-width:760px;margin:10px auto 0}
.ax-l rect{fill:#fffdfd;stroke:#e7a2ab;stroke-width:1}.ax-l path{fill:none;stroke:#1b1416;stroke-width:2.2;stroke-linejoin:round}
.ax-l.max rect{stroke:#2f9e6e;stroke-width:3}.ax-l.per rect{stroke:#e0a43a;stroke-width:3;stroke-dasharray:6 4}
.ax-ln{font:700 15px var(--mono);fill:#1b1416}.ax-deg{font:500 12px var(--mono);fill:#6b5c5e}.ax-cap{font:600 12px var(--body);fill:#6b5c5e}
@media (max-width:600px){.ax-ln{font-size:19px}.ax-deg{font-size:14px}.ax-cap{font-size:14px}}
.ax-info{margin-top:6px}.ax-info ul{margin:.3em 0;padding-left:1.2em}.ax-cat{font-size:16px;margin:.3em 0}.ax-cat.ok{color:var(--ok,#1f6b52)}.ax-cat.warn{color:var(--warn,#8a5a00)}.ax-cat.bad{color:var(--hot,#c0283a)}
.ax-check,.ax-next{font-weight:600;border-color:#7b3fc4!important}
'''
