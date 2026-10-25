#!/usr/bin/env python3
"""Вырезает набор анатомических структур из BodyParts3D 4.0 (CC BY 4.0) и сохраняет как GLB для three.js.

Примеры:
  python3 -I _tools/anat3d.py --preset heart --out heart.glb
  python3 -I _tools/anat3d.py --match "kidney|ureter|adrenal|Abdominal aorta|Inferior vena cava|psoas" --out retro.glb
  python3 -I _tools/anat3d.py --list "rib"          # найти названия структур
Данные: assets/bodyparts3d/ (atlas.json + body-N.bin.gz). Русские названия и цвета — в _tools/anat3d_ru.json.
В каждом узле GLB: name = русское название (или английское), extras = {en, ru, group}.
"""
import argparse, gzip, json, os, re, struct, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'assets', 'bodyparts3d')
RU = json.load(open(os.path.join(ROOT, '_tools', 'anat3d_ru.json'), encoding='utf-8'))

PRESETS = {
  'heart': r'^(Wall of (left|right) atrium|Wall of ventricle|.*leaflet of (mitral|tricuspid) valve|.*cusp of (aortic|pulmonary) valve|Ascending aorta|Arch of aorta|Pulmonary trunk|(Left|Right) pulmonary artery|(Left|Right) (superior|inferior) pulmonary vein|Superior vena cava|.*papillary muscle.*|Trunk of anterior interventricular branch of left coronary artery|Posterior interventricular branch of right coronary artery|Trunk of (left|right) coronary artery|Circumflex branch of left coronary artery|Marginal branch of right coronary artery|Diagonal branch of anterior descending branch of left coronary artery|First (anterior|posterior) ventricular branch of right coronary artery|Coronary sinus|Great cardiac vein|Middle cardiac vein)$',
  'thorax': r'^((Left|Right) \w+ rib|(Left|Right) \w+ costal cartilage|Manubrium|Body of sternum|Xiphoid process|\w+ thoracic vertebra|Wall of (left|right) atrium|Wall of ventricle|Ascending aorta|Arch of aorta|Descending thoracic aorta|Pulmonary trunk|(Left|Right) pulmonary artery|(Left|Right) (superior|inferior) pulmonary vein|Superior vena cava|(Left|Right) brachiocephalic vein|Brachiocephalic artery|Left common carotid artery|Left subclavian artery|Trachea|(Left|Right) main bronch.*|.*segmental bronchial tree|.*lingular bronchial tree|Esophagus|Diaphragm|Azygos vein|Hemiazygos vein|(Left|Right) lobe of thymus)$',
  'retroperitoneum': r'^((Left|Right) kidney|(Left|Right) ureter|(Left|Right) adrenal gland|Abdominal aorta|Inferior vena cava|(Left|Right) renal artery|(Left|Right) renal vein|(Left|Right) psoas major|(Left|Right) iliacus|Diaphragm|\w+ lumbar vertebra|Twelfth thoracic vertebra|(Left|Right) (eleventh|twelfth) rib|Pancreas|Duodenum|Ascending colon|Descending colon|(Left|Right) common iliac (artery|vein)|Urinary bladder|Sacrum)$',
  'pelvis': r'^((Left|Right) hip bone|Sacrum|Coccyx|Urinary bladder|Rectum|Urethra|(Left|Right) ureter|(Left|Right) (common|internal|external) iliac (artery|vein)|Abdominal aorta|Inferior vena cava|(Left|Right) psoas major|(Left|Right) iliacus|Fifth lumbar vertebra)$',
  'urinary': r'^((Left|Right) kidney|(Left|Right) ureter|Urinary bladder|Urethra|(Left|Right) adrenal gland|Abdominal aorta|Inferior vena cava|(Left|Right) renal artery|(Left|Right) renal vein)$',
}

def load():
    atlas = json.load(open(os.path.join(DATA, 'atlas.json')))
    cache = {}
    def chunk(i):
        if i not in cache:
            p = os.path.join(DATA, f'body-{i}.bin.gz')
            cache[i] = gzip.open(p).read()
        return cache[i]
    return atlas, chunk

def ru_of(en):
    if en in RU['names']: return RU['names'][en]
    return None

def group_of(en, system):
    for g, pat in RU['groups']:
        if re.search(pat, en, re.I): return g
    return system

def write_glb(parts, out):
    # центрирование всего набора
    allp = np.concatenate([p['pos'] for p in parts]); c = (allp.min(0) + allp.max(0)) / 2
    bin_ = bytearray(); views = []; accs = []; meshes = []; nodes = []; mats = []; matidx = {}
    def add_view(b, target):
        while len(bin_) % 4: bin_.append(0)
        off = len(bin_); bin_.extend(b); views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(b), 'target': target}); return len(views) - 1
    for p in parts:
        pos = (p['pos'] - c).astype('<f4'); nrm = p['nrm'].astype('<f4'); idx = p['idx']
        n = np.linalg.norm(nrm, axis=1, keepdims=True); n[n == 0] = 1; nrm = (nrm / n).astype('<f4')
        if idx.max() < 65535: idx = idx.astype('<u2'); ct = 5123
        else: idx = idx.astype('<u4'); ct = 5125
        vp = add_view(pos.tobytes(), 34962); vn = add_view(nrm.tobytes(), 34962); vi = add_view(idx.tobytes(), 34963)
        accs.append({'bufferView': vp, 'componentType': 5126, 'count': len(pos), 'type': 'VEC3', 'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()}); ap = len(accs) - 1
        accs.append({'bufferView': vn, 'componentType': 5126, 'count': len(nrm), 'type': 'VEC3'}); an = len(accs) - 1
        accs.append({'bufferView': vi, 'componentType': ct, 'count': len(idx), 'type': 'SCALAR'}); ai = len(accs) - 1
        g = p['group']
        if g not in matidx:
            col = RU['colors'].get(g, '#c8b8a8').lstrip('#'); rgb = [int(col[i:i+2], 16) / 255 for i in (0, 2, 4)]
            lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in rgb]
            mats.append({'name': g, 'pbrMetallicRoughness': {'baseColorFactor': lin + [1], 'metallicFactor': 0, 'roughnessFactor': 0.62}, 'doubleSided': True}); matidx[g] = len(mats) - 1
        meshes.append({'name': p['label'], 'primitives': [{'attributes': {'POSITION': ap, 'NORMAL': an}, 'indices': ai, 'material': matidx[g]}]})
        nodes.append({'name': p['label'], 'mesh': len(meshes) - 1, 'extras': {'en': p['en'], 'ru': p['ru'] or '', 'group': g, 'id': p['id']}})
    gltf = {'asset': {'version': '2.0', 'generator': 'anat3d.py',
                      'copyright': 'BodyParts3D, © The Database Center for Life Science, CC BY 4.0; adapted (simplified, cropped, recolored)'},
            'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}], 'nodes': nodes, 'meshes': meshes, 'materials': mats,
            'accessors': accs, 'bufferViews': views, 'buffers': [{'byteLength': len(bin_)}]}
    while len(bin_) % 4: bin_.append(0)
    js = json.dumps(gltf, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    while len(js) % 4: js += b' '
    glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
    open(out, 'wb').write(glb)
    return len(glb)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preset'); ap.add_argument('--match'); ap.add_argument('--system'); ap.add_argument('--out'); ap.add_argument('--list')
    ap.add_argument('--parts-json', help='куда записать список структур (ru/en/group)')
    a = ap.parse_args()
    atlas, chunk = load()
    if a.list:
        seen = set()
        for p in atlas['parts']:
            if re.search(a.list, p['name'], re.I) and p['name'] not in seen:
                seen.add(p['name']); print(f"{p['name']}  |  {p['system']}  |  ru: {ru_of(p['name']) or '—'}")
        return
    pat = re.compile(PRESETS[a.preset] if a.preset else (a.match or '.*'), re.I)
    sel = [p for p in atlas['parts'] if pat.search(p['name']) and (not a.system or p['system'] == a.system)]
    if not sel: sys.exit('ничего не найдено')
    parts = []
    for p in sel:
        b = chunk(p['chunk']); n = p['vertexCount']
        pos = np.frombuffer(b, '<f4', n * 3, p['positions']).reshape(-1, 3)
        nrm = np.frombuffer(b, '<i2', n * 3, p['normals']).reshape(-1, 3).astype('f4') / 32767
        idx = np.frombuffer(b, '<u4', p['indexCount'], p['indices'])
        ru = ru_of(p['name']); g = group_of(p['name'], p['system'])
        parts.append(dict(pos=pos, nrm=nrm, idx=idx, en=p['name'], ru=ru, group=g, id=p['id'], label=ru or p['name']))
    size = write_glb(parts, a.out)
    tri = sum(len(p['idx']) for p in parts) // 3
    print(f"{a.out}: {len(parts)} структур, {tri} треугольников, {size/1e6:.2f} МБ")
    miss = sorted({p['en'] for p in parts if not p['ru']})
    if miss: print('без русского названия:', '; '.join(miss))
    if a.parts_json:
        json.dump(sorted({(p['ru'] or p['en'], p['en'], p['group']) for p in parts}), open(a.parts_json, 'w'), ensure_ascii=False, indent=0)

if __name__ == '__main__':
    main()
