#!/usr/bin/env python3
"""Достаёт картинку слайда из .pptx, где каждый слайд — одна картинка (лекции «… (сайт).pptx»).
  python3 -I _tools/pptx_slide.py "Л-3 Синапсы (сайт).pptx" 12 slide12.png
  python3 -I _tools/pptx_slide.py "Л-3 Синапсы (сайт).pptx" 12 slide12.png 10 20 60 80   # + обрезка x0 y0 x1 y1 в % кадра
"""
import sys, zipfile, re, io
from PIL import Image
f, n, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
z = zipfile.ZipFile(f)
rel = z.read(f'ppt/slides/_rels/slide{n}.xml.rels').decode()
img = re.findall(r'Target="\.\./media/([^"]+)"', rel)
if not img: sys.exit(f'на слайде {n} нет картинки')
im = Image.open(io.BytesIO(z.read('ppt/media/' + img[0]))).convert('RGB')
if len(sys.argv) == 8:
    x0, y0, x1, y1 = map(float, sys.argv[4:8]); W, H = im.size
    im = im.crop((int(W * x0 / 100), int(H * y0 / 100), int(W * x1 / 100), int(H * y1 / 100)))
im.save(out); print(out, im.size)
