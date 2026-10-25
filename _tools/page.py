#!/usr/bin/env python3
"""Рендер страницы PDF в PNG с сеткой в процентах — чтобы посмотреть страницу и выбрать рамку рисунка.
Использование: python3 -I _tools/page.py "кардио.pdf" 22 out.png [--dpi 110] [--no-grid]
"""
import sys, subprocess, tempfile, os
from PIL import Image, ImageDraw, ImageFont
a=sys.argv[1:]; dpi=110; grid='--no-grid' not in a
if '--dpi' in a: i=a.index('--dpi'); dpi=int(a[i+1]); del a[i:i+2]
a=[x for x in a if x!='--no-grid']
pdf, page, out = a[0], int(a[1]), a[2]
with tempfile.TemporaryDirectory() as t:
    subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r',str(dpi),'-png','-singlefile',pdf,os.path.join(t,'p')],check=True)
    im=Image.open(os.path.join(t,'p.png')).convert('RGB')
if grid:
    d=ImageDraw.Draw(im); W,H=im.size
    try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',max(10,W//80))
    except Exception: f=None
    for i in range(1,20):
        x=W*i/20; y=H*i/20; c=(255,0,0) if i%2==0 else (255,170,170)
        d.line((x,0,x,H),fill=c,width=1); d.line((0,y,W,y),fill=c,width=1)
        if i%2==0:
            d.text((x+2,2),f'{i*5}',fill=(255,0,0),font=f); d.text((2,y+2),f'{i*5}',fill=(255,0,0),font=f)
im.save(out); print(out, im.size)
