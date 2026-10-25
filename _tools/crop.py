#!/usr/bin/env python3
"""Вырезать рисунок со страницы PDF. Рамка — в процентах страницы (x0 y0 x1 y1), как на сетке из page.py.
Лишние белые поля обрезаются автоматически, так что рамку можно брать с запасом.
Использование: python3 -I _tools/crop.py "кардио.pdf" 22 15 26 85 52 out.png [--dpi 220]
"""
import sys, subprocess, tempfile, os
from PIL import Image, ImageOps
a=sys.argv[1:]; dpi=220
if '--dpi' in a: i=a.index('--dpi'); dpi=int(a[i+1]); del a[i:i+2]
pdf,page,x0,y0,x1,y1,out=a[0],int(a[1]),*map(float,a[2:6]),a[6]
with tempfile.TemporaryDirectory() as t:
    subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r',str(dpi),'-png','-singlefile',pdf,os.path.join(t,'p')],check=True)
    im=Image.open(os.path.join(t,'p.png')).convert('RGB')
W,H=im.size
c=im.crop((int(W*x0/100),int(H*y0/100),int(W*x1/100),int(H*y1/100)))
bb=ImageOps.invert(c.convert('L')).point(lambda v:255 if v>25 else 0).getbbox()
if bb:
    m=int(dpi*0.08); c=c.crop((max(0,bb[0]-m),max(0,bb[1]-m),min(c.width,bb[2]+m),min(c.height,bb[3]+m)))
if c.width>1600: c=c.resize((1600,int(c.height*1600/c.width)),Image.LANCZOS)
ext=os.path.splitext(out)[1].lower()
c.save(out, quality=85) if ext in ('.jpg','.jpeg','.webp') else c.save(out, optimize=True)
print(out, c.size, os.path.getsize(out)//1024,'КБ')
