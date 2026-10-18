"""Mixamo ham verisini (cikar.cjs çıktısı) Meto'nun oyun ağına bağlı küçük bir sevinç paketine çevirir.
Kullanım: python tools/mixamo/paketle.py HAM.json AD [--bas SN] [--son SN] [--bekle SN]
--bekle: hareket bitince son karede bekleme süresi (sonra başa yumuşak dönüş).
Çıktı: assets/meto3d/sevinc-AD.json + .bin
- Geometri indirilmez: oyundaki model.bin aynen kullanılır; pakette yalnız tepe başına 4 kemik/ağırlık (8 bayt) ve kareler var.
- Parmak kemikleri ele katılır (22 kemik; telefonda WebGL1 tekdüzen sınırı 128 vec4'ün altında kalır).
- Kök kayması (kalçanın yerde gezinmesi) yumuşak ortalamayla çıkarılır: karakter yakın planda kadrajda kalır.
- Kare = kemik başına birim dördey (x,y,z,w) + öteleme (oyun birimi), Float32. Kalça dünya dönüşü; diğerleri ebeveyne göre (öteleme 0, eklem etrafında).
"""
import sys, json
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parents[2]
ham = json.loads(Path(sys.argv[1]).read_text()); ad = sys.argv[2]
arg = dict(zip(sys.argv[3::2], sys.argv[4::2]))
meta = json.loads((root / 'assets/meto3d/model.json').read_text())
blob = (root / 'assets/meto3d/model.bin').read_bytes()
CM = meta['unit_m'] * 100; s = 1 / CM
gm = []
for m in meta['meshes']:
    gm.append(np.frombuffer(blob, '<f4', m['vertices'] * 15, m['vertexOffset']).reshape(-1, 15))
ground = min(v[:, 1].min() for v in gm)

TUT = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head']
for t in ['Left', 'Right']: TUT += [t + 'Shoulder', t + 'Arm', t + 'ForeArm', t + 'Hand']
for t in ['Left', 'Right']: TUT += [t + 'UpLeg', t + 'Leg', t + 'Foot', t + 'ToeBase']
names = [n.replace('mixamorig', '') for n in ham['names']]
def hedef(n):
    if n in TUT: return TUT.index(n)
    for t in ['Left', 'Right']:
        if n.startswith(t + 'Hand'): return TUT.index(t + 'Hand')
        if n.startswith(t + 'Toe'): return TUT.index(t + 'ToeBase')
    if n.startswith('HeadTop'): return TUT.index('Head')
    raise SystemExit('bilinmeyen kemik: ' + n)
eslem = np.array([hedef(n) for n in names])
kaynak = [names.index(n) for n in TUT]

# --- tepe ağırlıkları: oyun ağındaki her tepe, aynı adlı FBX ağında aynı konumdaki tepeye eşlenir
skin = []; eksik = 0
for k, v in enumerate(gm):
    fm = next(x for x in ham['meshes'] if x['name'] == 'meto_%d' % k)
    fp = np.array(fm['pos']).reshape(-1, 3); fj = np.array(fm['j']).reshape(-1, 4); fw = np.array(fm['w']).reshape(-1, 4)
    tablo = {}
    for i, key in enumerate(map(tuple, np.round(fp * 20).astype(np.int64))): tablo.setdefault(key, i)
    gp = (v[:, :3] - [0, ground, 0]) * CM
    out = np.zeros((len(v), 8), np.uint8)
    for i, key in enumerate(map(tuple, np.round(gp * 20).astype(np.int64))):
        f = tablo.get(key)
        if f is None:  # yuvarlama sınırı: en yakın tepe
            f = int(np.argmin(((fp - gp[i]) ** 2).sum(1))); eksik += 1
            assert np.linalg.norm(fp[f] - gp[i]) < .05, 'tepe eşlenemedi'
        acc = np.zeros(len(TUT))
        for j, w in zip(fj[f], fw[f]):
            if w > 0: acc[eslem[j]] += w
        top = np.argsort(-acc)[:4]; w = acc[top]; w = w / w.sum()
        q = np.round(w * 255).astype(int); q[0] += 255 - q.sum()
        out[i, :4] = top; out[i, 4:] = q
    skin.append(out)

# --- kareler: dünya (cm) dönüşümü -> oyun birimi; S·F·S^-1
F = np.array(ham['frames']).reshape(len(ham['frames']), -1, 4, 4).transpose(0, 1, 3, 2)[:, kaynak]
fps = 30; bas = int(round(float(arg.get('--bas', 0)) * fps)); son = int(round(float(arg.get('--son', 1e9)) * fps))
F = F[bas:son + 1]
R = F[..., :3, :3]; T = F[..., :3, 3]
assert np.abs(np.linalg.det(R) - 1).max() < 1e-3, 'kemik dönüşümü katı değil'
off = np.array([0, ground, 0])
T = T * s + off - np.einsum('fbij,j->fbi', R, off)
# kök kayması: kalça eklemi konumunun yatay bileşeni, 0.8 sn pencereli ortalama
bj = np.array(ham['bindJoint'])[kaynak] * s + off
hip = np.einsum('fij,j->fi', R[:, 0], bj[0]) + T[:, 0]
pen = 12; pad = np.pad(hip[:, [0, 2]], ((pen, pen), (0, 0)), mode='edge')
ort = np.stack([np.convolve(pad[:, c], np.ones(2 * pen + 1) / (2 * pen + 1), 'valid') for c in (0, 1)], 1)
kay = np.zeros_like(hip); kay[:, [0, 2]] = ort - bj[0][[0, 2]]
T = T - kay[:, None, :]
def quat(m):
    w = np.sqrt(max(0, 1 + m[0, 0] + m[1, 1] + m[2, 2])) / 2; x = np.sqrt(max(0, 1 + m[0, 0] - m[1, 1] - m[2, 2])) / 2
    y = np.sqrt(max(0, 1 - m[0, 0] + m[1, 1] - m[2, 2])) / 2; z = np.sqrt(max(0, 1 - m[0, 0] - m[1, 1] + m[2, 2])) / 2
    x = np.copysign(x, m[2, 1] - m[1, 2]); y = np.copysign(y, m[0, 2] - m[2, 0]); z = np.copysign(z, m[1, 0] - m[0, 1])
    q = np.array([x, y, z, w]); return q / np.linalg.norm(q)
# Yerel (ebeveyne göre) dönüşler: kareler/döngü arası ara değerde uzuvlar eklemden kopmaz. Kalça: dünya dönüşü + öteleme.
def ust(n):
    i = names.index(n)
    while True:
        i = ham['parent'][i]
        if i < 0: return -1
        if names[i] in TUT: return TUT.index(names[i])
PARENT = [ust(n) for n in TUT]
assert PARENT[0] == -1 and all(p < i for i, p in enumerate(PARENT)), 'kemik sırası ebeveyn önce olmalı'
# kontrol: çocuk eklemi ebeveyne bağlı (Mixamo katı iskelet) -> yerel dönüş eklem etrafında
for i, p in enumerate(PARENT):
    if p < 0: continue
    a = np.einsum('fij,j->fi', R[:, i], bj[i]) + T[:, i]; b = np.einsum('fij,j->fi', R[:, p], bj[i]) + T[:, p]
    assert np.abs(a - b).max() < .5, ('eklem kopuk', TUT[i], np.abs(a - b).max())
RL = R.copy()
for i, p in enumerate(PARENT):
    if p >= 0: RL[:, i] = np.einsum('fji,fjk->fik', R[:, p], R[:, i])  # Rp^T · Rc
T = T.copy(); T[:, 1:] = 0
Q = np.array([[quat(r) for r in fr] for fr in RL])
for b in range(Q.shape[1]):  # kareler arası en kısa yol
    for f in range(1, len(Q)):
        if np.dot(Q[f, b], Q[f - 1, b]) < 0: Q[f, b] *= -1
kare = np.concatenate([Q, T], 2).astype('<f4')

body = bytearray()
def ekle(a):
    while len(body) % 4: body.append(0)
    o = len(body); body.extend(a.tobytes()); return o
skinOff = [ekle(x) for x in skin]; kareOff = ekle(kare)
out = {'version': arg.get('--surum', '20261024a'), 'ad': ad, 'fps': fps, 'frames': len(kare), 'duration': (len(kare) - 1) / fps, 'bones': TUT,
       'joints': np.round(bj, 3).tolist(), 'parents': PARENT, 'local': 'kalca dunya; digerleri ebeveyne gore donus (eklem etrafinda)', 'skinOffsets': skinOff, 'skinVertices': [len(x) for x in skin], 'frameOffset': kareOff,
       'frameStride': len(TUT) * 7, 'binaryBytes': len(body), 'hold': float(arg.get('--bekle', 0)), 'rootDrift': 'removed (0.8 s moving average)',
       'source': 'Adobe Mixamo animasyonu, Meto modeline (MakeHuman CC0 tabanı) Mixamo otomatik iskeleti. Ham FBX depoya konmaz.'}
d = root / 'assets/meto3d'
(d / ('sevinc-%s.bin' % ad)).write_bytes(body); (d / ('sevinc-%s.json' % ad)).write_text(json.dumps(out, separators=(',', ':')))
print(json.dumps({'bytes': len(body), 'frames': len(kare), 'duration': out['duration'], 'nearest_fallback': eksik,
                  'hip_drift_max_after': float(np.abs((np.einsum('fij,j->fi', R[:, 0], bj[0]) + T[:, 0])[:, [0, 2]] - bj[0][[0, 2]]).max())}))
