"""Вставляет GSAP-анимации (steps-gsap.js + gx.css) в готовую страницу. python3 build_gx.py farm|lih|grud"""
import sys,re,subprocess
K='/home/claude/medodchki-/_tools/kit/'
GSAP='<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
def fig(i,title,cap):
    return (f'\n<figure class="gx" id="{i}"><div class="figbar">Анимация · {title}</div>'
            f'<svg role="img" aria-label="{title}"></svg><p class="phase" aria-live="polite"></p><div class="ctrl" data-ctrl></div>'
            f'<figcaption>{cap}</figcaption></figure>\n')
P={
 'farm':dict(src='src/farm',fn='index.html',out='out/2026-10-29-farmakologiya-n-holinoretseptory.html',js='farm_anim.js',ins=[
   ('after','столбец «преобладающий тонус» — учебное объяснение.</p>',fig('a-gang','ганглиоблокатор выключает преобладающий тонус','Кружки — ганглии (красный — симпатический, синий — парасимпатический), полосы — сила тонуса. Преобладающий тонус — учебное объяснение; перечень эффектов — РЛС: азаметония бромид.')),
   ('before_end','<section id="mr">',fig('a-nmj','нервно-мышечный синапс и миорелаксанты','<span style="color:#e0a020">●</span> ацетилхолин &nbsp;<span style="color:#6b5bb5">▮▮</span> Nm-холинорецептор (ионный канал) &nbsp;<span style="color:#2e8b6e">●</span> ацетилхолинэстераза в складках &nbsp;<span style="color:#3c3c3c">■</span> антидеполяризующий миорелаксант &nbsp;<span style="color:#c0392b">◆</span> суксаметоний &nbsp;<span style="color:#c0392b">✕</span> неостигмин угнетает фермент.<br>Схема, не в масштабе. Деполяризующий блок — по РЛС; антидеполяризующий блок и неостигмин — учебная схема, сверьте с лекцией.'))]),
 'lih':dict(src='src/lih',fn='index.html',out='out/2026-10-24-patofiziologiya-lihoradka.html',js='lih_anim.js',ins=[
   ('after_in','<section id="path">','</ol>',fig('a-fevpath','патогенез лихорадки по шагам','◀ на термометре — установочная точка, красный столбик — температура тела. Основной (гуморальный) путь, без масштаба по времени; значения температуры условные.')),
   ('before_end','<section id="stages">',fig('a-fevst','стадии лихорадки и теплообмен','Без масштаба по времени; значения температуры и длины полос условные. Пунктир — установочная точка, сплошная — температура тела.'))]),
 'grud':dict(src='src/grud',fn='index.html',out='out/2026-10-22-topanatomiya-grudnaya-polost.html',js='grud_anim.js',ins=[
   ('before','<h3>Пункция плевральной полости по Петрову',fig('a-pnx','виды пневмоторакса','Схема фронтального среза, не в масштабе: слева на рисунке — поражённая (правая) половина груди. Виды и тактика — по методичке «Грудь», с. 13–14.'))]),
}
k=sys.argv[1];c=P[k]
if k=='grud': subprocess.run(['python3','build_grud.py'],check=True)
h=open(f"{c['src']}/{c['fn']}",encoding='utf-8').read()
assert 'id="a-gang"' not in h and 'gsap' not in h.lower() or k=='grud'
for it in c['ins']:
    mode=it[0]
    if mode=='after': i=h.index(it[1])+len(it[1]); h=h[:i]+it[2]+h[i:]
    elif mode=='before': i=h.index(it[1]); h=h[:i]+it[2]+h[i:]
    elif mode=='after_in': s=h.index(it[1]); i=h.index(it[2],s)+len(it[2]); h=h[:i]+it[3]+h[i:]
    elif mode=='before_end': s=h.index(it[1]); i=h.index('</section>',s); h=h[:i]+it[2]+h[i:]
css=open(K+'gx.css',encoding='utf-8').read()
i=h.index('</style>'); h=h[:i]+'\n'+css+'\n'+h[i:]
js=open(K+'steps-gsap.js',encoding='utf-8').read()+'\n'+open(c['js'],encoding='utf-8').read()
i=h.rindex('</body>'); h=h[:i]+GSAP+'<script>\n'+js+'\n</script>\n'+h[i:]
open(f"{c['src']}/index.gx.html",'w',encoding='utf-8').write(h)
subprocess.run(['python3','pack.py',c['src'],c['out'],'index.gx.html'],check=True)
