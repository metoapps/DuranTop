"""Meto oyun modelini Mixamo'ya yuklenebilir OBJ+MTL+doku paketine cevirir.
Calistir: python tools/meto-mixamo-disari.py [cikis_klasoru]
- Iskelet/agirlik atilir (Mixamo kendi iskeletini kurar).
- Govdedeki tepe renkleri (vertex color) ucgen atlasi dokusuna pisirilir; OBJ'de konumlar paylasimli kalir.
- Birim: santimetre, Y yukari, yuz +Z, ayak tabani y=0.
"""
import sys, json, math, zipfile
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
src = root / 'assets/meto3d'
out = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'dist/meto-mixamo'
out.mkdir(parents=True, exist_ok=True)
meta = json.loads((src / 'model.json').read_text())
blob = (src / 'model.bin').read_bytes()
CM = meta['unit_m'] * 100

parts = []
for m in meta['meshes']:
    v = np.frombuffer(blob, '<f4', m['vertices'] * 15, m['vertexOffset']).reshape(-1, 15)
    ix = np.frombuffer(blob, '<u4', m['indices'], m['indexOffset']).reshape(-1, 3)
    parts.append((m, v, ix))
ground = min(v[:, 1].min() for _, v, _ in parts)

ATLAS = 2048
def bake(v, ix):
    """Her ucgene kendi hucresini verip uc tepe rengini barisentrik boyar."""
    n = len(ix); g = math.ceil(math.sqrt(n)); c = ATLAS // g
    assert c >= 6, 'atlas hucresi cok kucuk'
    k = np.arange(n); x0 = (k % g) * c; y0 = (k // g) * c
    a, b = 1.0, c - 2.0  # hucre ici ucgen koseleri (piksel)
    P = np.stack([np.stack([x0 + a, y0 + a], 1), np.stack([x0 + b, y0 + a], 1), np.stack([x0 + a, y0 + b], 1)], 1)  # n,3,2
    img = np.zeros((ATLAS, ATLAS, 3), np.float32)
    py, px = np.mgrid[0:c, 0:c]; px = px.ravel() + .5; py = py.ravel() + .5
    # Dik ucgen: l1=(x-a)/(b-a), l2=(y-a)/(b-a); dolgu pikselleri disa uzatilir (sizinti icin)
    l1 = np.clip((px - a) / (b - a), 0, 1); l2 = np.clip((py - a) / (b - a), 0, 1)
    s = l1 + l2; over = s > 1; l1[over] /= s[over]; l2[over] /= s[over]; l0 = 1 - l1 - l2
    col = v[:, 8:11][ix]  # n,3,3
    pix = l0[None, :, None] * col[:, 0, None] + l1[None, :, None] * col[:, 1, None] + l2[None, :, None] * col[:, 2, None]
    gx = (x0[:, None] + px.astype(int) - 0).ravel(); gy = (y0[:, None] + py.astype(int)).ravel()
    img[gy, gx] = pix.reshape(-1, 3)
    uv = P.copy(); uv[..., 0] /= ATLAS; uv[..., 1] = 1 - uv[..., 1] / ATLAS
    return Image.fromarray((np.clip(img, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)), uv.reshape(-1, 2)

lines = ['# Meto - Duran Top (MakeHuman CC0 tabanli). Mixamo icin.', 'mtllib meto.mtl', 'o Meto']
mtl = []; vbase = 1; tbase = 1; tex_files = []
for m, v, ix in parts:
    name = m['name'].replace('Meto_mobile_', 'meto_')
    p = (v[:, :3] - [0, ground, 0]) * CM
    lines += [f'v {x:.4f} {y:.4f} {z:.4f}' for x, y, z in p]
    lines += [f'vn {x:.4f} {y:.4f} {z:.4f}' for x, y, z in v[:, 3:6]]
    if m['texture']:
        uv = v[:, 6:8].copy(); uv[:, 1] = 1 - uv[:, 1]  # WebGL FLIP_Y kapali -> OBJ'de ters
        lines += [f'vt {s:.5f} {t:.5f}' for s, t in uv]
        tex = m['texture']; tex_files.append(src / tex)
        fv = ix + vbase; ft = ix + tbase; tbase += len(uv)
    else:
        img, uv = bake(v, ix); tex = 'meto_govde.png'; img.save(out / tex, optimize=True)
        lines += [f'vt {s:.5f} {t:.5f}' for s, t in uv]
        fv = ix + vbase; ft = np.arange(len(uv)).reshape(-1, 3) + tbase; tbase += len(uv)
    mtl += [f'newmtl {name}', 'Kd 1 1 1', 'Ka 0 0 0', 'Ks 0 0 0', 'd 1', 'illum 1', f'map_Kd {tex}', '']
    lines += [f'g {name}', f'usemtl {name}']
    lines += [f'f {a}/{ta}/{a} {b}/{tb}/{b} {c}/{tc}/{c}' for (a, b, c), (ta, tb, tc) in zip(fv, ft)]
    vbase += len(v)

(out / 'meto.obj').write_text('\n'.join(lines) + '\n')
(out / 'meto.mtl').write_text('\n'.join(mtl))
for t in tex_files: (out / t.name).write_bytes(t.read_bytes())
zp = out / 'meto-mixamo.zip'
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['meto.obj', 'meto.mtl', 'meto_govde.png'] + [t.name for t in tex_files]: z.write(out / f, f)
h = max(v[:, 1].max() for _, v, _ in parts) - ground
print(json.dumps({'zip': str(zp), 'bytes': zp.stat().st_size, 'triangles': sum(len(ix) for _, _, ix in parts), 'height_cm': round(float(h * CM), 1)}))
