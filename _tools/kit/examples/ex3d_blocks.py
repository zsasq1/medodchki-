import json
COND=open('../cond/cond.json').read()
FIG='''<figure class="anim ex3d" id="a-excite">
<div class="figbar"><span>3D · проводящая система и волна возбуждения — синхронно с ЭКГ</span></div>
<div class="ex-3d v3d"></div>
<p class="hm-legend"><span><i style="background:#c76b6b"></i>миокард в покое</span><span><i style="background:#fff3b0"></i>фронт возбуждения</span><span><i style="background:#ffa81f"></i>возбуждён</span><span><i style="background:#d8342c"></i>узлы</span><span><i style="background:#f0b400"></i>пучок Гиса, ножки, Пуркинье</span></p>
<svg class="ex-ecg" role="img" aria-label="Один кардиоцикл ЭКГ с бегущим курсором"></svg>
<div class="ex-ctrl"></div>
<p class="phase" aria-live="polite"></p>
<div class="ex-ph" aria-label="Перейти к фазе"></div>
<figcaption>Анимация составлена для сайта, не из методички: что отражает каждый зубец и нормы длительности — кардио.pdf, с. 88–89; положение узлов и пучков нанесено на модель по анатомическим ориентирам (устье верхней полой вены, треугольник Коха, перегородка, папиллярные мышцы), порядок возбуждения стенок — упрощённая учебная схема. Проводящая система показана поверх полупрозрачных стенок. 3D-модель: BodyParts3D © The Database Center for Life Science, CC BY 4.0 (упрощена, обрезана, перекрашена); проводящей системы в исходной модели нет — она дорисована.</figcaption>
</figure>'''
S='<span class="src">кардио.pdf, с. %s</span>'
U='<span class="tag t-dis">учебн.</span>'
PH=[
 dict(key='sa',short='СА-узел',t0=0,t1=.012,at=.006,label='<b>Синусовый узел</b> — в норме водитель ритма '+(S%'90')+'. Лежит в стенке правого предсердия у впадения верхней полой вены; отсюда импульс расходится по предсердиям.'),
 dict(key='p',band='P',short='P',t0=.012,t1=.10,at=.05,label='<b>Зубец P</b> — возбуждение предсердий: восходящая часть — правого, нисходящая — левого; P не дольше 0,10 с '+(S%'88')+'.'),
 dict(key='pq',band='PQ',short='AV-задержка',t0=.10,t1=.15,at=.12,label='<b>Сегмент PQ</b> — изолиния '+(S%'88')+'. Импульс задерживается в AV-узле (узел пульсирует), затем идёт по пучку Гиса. Весь интервал PQ (от начала P до начала Q) — 0,12–0,20 с '+(S%'88')+'.'),
 dict(key='br',short='ножки',t0=.15,t1=.165,at=.16,label='<b>Ножки пучка Гиса</b> — левая и правая, по обеим сторонам межжелудочковой перегородки. Масса проводящей системы мала, на ЭКГ это ещё изолиния '+U+'.'),
 dict(key='q',band='Q',short='Q',t0=.165,t1=.185,at=.176,label='<b>Зубец Q</b> — возбуждение межжелудочковой перегородки '+(S%'88')+'. На модели волна начинается с левой стороны перегородки '+U+'.'),
 dict(key='r',band='R',short='R',t0=.185,t1=.215,at=.20,label='<b>Зубец R</b> — почти полное возбуждение желудочков '+(S%'89')+': по волокнам Пуркинье от верхушки к стенкам, от внутреннего слоя к наружному '+U+'.'),
 dict(key='s',band='S',short='S',t0=.215,t1=.245,at=.232,label='<b>Зубец S</b> — возбуждение базальных отделов, окончание возбуждения желудочков '+(S%'89')+'. QRS в норме 0,06–0,10 с '+(S%'88')+'. Предсердия в это время восстанавливаются — на ЭКГ это скрыто комплексом QRS '+U+'.'),
 dict(key='st',band='ST',short='ST',t0=.245,t1=.38,at=.31,label='<b>Сегмент ST</b> — желудочки охвачены возбуждением полностью, разности потенциалов нет — изолиния '+(S%'89')+'.'),
 dict(key='t',band='T',short='T',t0=.38,t1=.47,at=.42,label='<b>Зубец T</b> — реполяризация желудочков; по направлению совпадает с R '+(S%'89')+'. На модели первыми восстанавливаются участки, возбудившиеся последними — так объясняют одинаковое направление R и T '+U+'.'),
 dict(key='d',short='диастола',t0=.47,t1=.8,at=.6,label='<b>Покой до следующего импульса</b> (отрезок TP). При ЧСС около 70 в мин интервал RR ≈ 0,80 с '+(S%'89–90')+'; здесь цикл 0,80 с.')]
CSS='''
.ex3d .ex-3d{min-height:260px}
.ex3d .v3d-labels span{transform:translate(-50%,-50%);font-size:11.5px}
.ex3d .ex-ecg{display:block;width:100%;height:auto;max-width:820px;margin:0 auto}
.ex3d .ex-bands rect{fill:var(--line);opacity:.35}.ex3d .ex-bands rect.on{fill:var(--accent);opacity:.18}
.ex3d .ex-bands text{fill:var(--muted);font:600 13px var(--mono)}
.ex3d .ex-iso{stroke:var(--line);stroke-dasharray:3 4}
.ex3d .ex-wave{fill:none;stroke:var(--muted);stroke-width:1.6;opacity:.45}
.ex3d .ex-done{fill:none;stroke:var(--trace,var(--fg));stroke-width:2.6}
.ex3d .ex-cur{stroke:var(--accent);stroke-width:1.5}.ex3d .ex-dot{fill:var(--accent)}
.ex3d .ex-ctrl{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;font-size:14px}
.ex3d .ex-ctrl input[type=range]{flex:1 1 160px;min-width:140px;accent-color:var(--accent)}
.ex3d .ex-ms{font:500 13px var(--mono);color:var(--muted);min-width:4.5em}
.ex3d .ex-ph{display:flex;flex-wrap:wrap;gap:6px}
.ex3d .ex-ph button{font-size:13px;padding:3px 9px}
.ex3d .ex-ph button.on{border-color:var(--accent);background:var(--accent-soft,transparent);font-weight:600}
@media (max-width:600px){.ex3d .ex-bands text{font-size:20px}}
'''
def call():
    return "Excite3D(document.getElementById('a-excite'),{src:'3d/heart.glb.txt',cond:"+COND+",phases:"+json.dumps(PH,ensure_ascii=False)+"});\n"
