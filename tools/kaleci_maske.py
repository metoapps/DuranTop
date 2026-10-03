#!/usr/bin/env python3
"""Kaleci kurtarış maskelerini görsellerden üretir -> js/kaleci_maske.js
Neden: kurtarış alanı çizilen görselle birebir aynı olmalı, ama bacak arası / kol altı boşlukları gerçek bir
kalecinin yetiştiği alandır, topun "içinden geçtiği" yer değil. Bu betik görselin alfa kanalından maske çıkarır,
boşlukları kapatır (closing) ve top yarıçapı kadar genişletir (top merkezi tek hücre sorgusuyla test edilir).

Kullanım:  python3 tools/kaleci_maske.py        (assets/kaleci-v2.png + varsa assets/kaleci/*.png)
Hücre 0.04 m. x: -1.5..1.5 m, y: -1.2..1.2 m (kaleci merkezine göre, y yukarı)."""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = 0.04; X0, X1, Y0, Y1 = -1.5, 1.5, -1.2, 1.2
NX, NY = int((X1 - X0) / H), int((Y1 - Y0) / H)
TOP_R = 0.11; KAPAT = 0.14; PAY = 0.03

# Eski tek sayfa görselin üç pozu: (kutu @2048, dünya genişlik m, dünya yükseklik m) -- js/veri.js ile aynı
ESKI = {'ayakta': ([0, 75, 490, 535], 1.694392523364486, 1.85),
        'sol':    ([500, 90, 840, 470], 2.05531914893617, 1.15),
        'sag':    ([1340, 100, 708, 460], 1.77, 1.15)}
YENI_TUVAL = dict(w=1200, h=800, cx=600, cy=400, pxM=324)

def disk(r):
    n = int(np.ceil(r)); y, x = np.ogrid[-n:n + 1, -n:n + 1]
    return (x * x + y * y) <= r * r

def maskele(alfa_dunya):
    """alfa_dunya: NY x NX bool (y aşağı doğru artar: satır 0 = y üst). -> boşlukları kapat + top yarıçapı kadar şişir"""
    m = ndi.binary_dilation(alfa_dunya, structure=disk(KAPAT / H))
    m = ndi.binary_erosion(m, structure=disk(KAPAT / H))                      # closing: boşluklar kapanır
    m = ndi.binary_dilation(m, structure=disk((TOP_R + PAY) / H))              # top merkezi için genişlet
    return m

def runlar(m):
    out = []
    for j in range(NY):
        row = m[j]; i = 0
        while i < NX:
            if row[i]:
                k = i
                while k + 1 < NX and row[k + 1]: k += 1
                out.append([j, i, k]); i = k + 1
            else: i += 1
    return out

def eski_pozlar(png):
    im = Image.open(png).convert('RGBA'); f = im.width / 2048
    sonuc = {}
    for ad, (kutu, w, h) in ESKI.items():
        x, y, bw, bh = [v * f for v in kutu]
        crop = im.crop((int(x), int(y), int(x + bw), int(y + bh)))
        pxm = crop.height / h                        # piksel / metre
        # çizimdeki yerleşim: merkez (0,0) dünyası; üst = +0.52h, alt = -0.48h; yatay -w/2..w/2
        def dunyaya(cr, aci_rad):
            a = np.array(cr)[..., 3] > 40
            tuval = Image.new('L', (int((X1 - X0) * pxm), int((Y1 - Y0) * pxm)), 0)
            ox = int((0 - X0) * pxm - cr.width / 2); oy = int((Y1 - 0.52 * h) * pxm)
            tuval.paste(Image.fromarray((a * 255).astype(np.uint8)), (ox, oy))
            if aci_rad:                              # dünya (0,0) etrafında saat yönü tersi döndür
                tuval = tuval.rotate(np.degrees(aci_rad), center=(int((0 - X0) * pxm), int((Y1 - 0) * pxm)), resample=Image.BILINEAR)
            kucuk = tuval.resize((NX, NY), Image.BILINEAR)
            return np.array(kucuk) > 60
        varyant = {'ayakta': [('', 0)]}.get(ad) or [('_0', 0), ('_a', 0.5 if ad == 'sol' else -0.5), ('_y', -0.35 if ad == 'sol' else 0.35)]
        for ek, aci in varyant:
            sonuc['eski_%s%s' % ({'ayakta': 'ayakta', 'sol': 'dalis_sol', 'sag': 'dalis_sag'}[ad], ek)] = runlar(maskele(dunyaya(crop, aci)))
    return sonuc

def yeni_pozlar(klasor):
    sonuc = {}
    if not os.path.isdir(klasor): return sonuc
    for ad in sorted(os.listdir(klasor)):
        if not ad.endswith('.png'): continue
        im = Image.open(os.path.join(klasor, ad)).convert('RGBA')
        a = np.array(im)[..., 3] > 40
        t = YENI_TUVAL
        tuval = Image.new('L', (int((X1 - X0) * t['pxM']), int((Y1 - Y0) * t['pxM'])), 0)
        tuval.paste(Image.fromarray((a * 255).astype(np.uint8)), (int(-X0 * t['pxM'] - t['cx']), int(Y1 * t['pxM'] - t['cy'])))
        kucuk = tuval.resize((NX, NY), Image.BILINEAR)
        sonuc[ad[:-4]] = runlar(maskele(np.array(kucuk) > 60))
    return sonuc

if __name__ == '__main__':
    veri = eski_pozlar(os.path.join(KOK, 'assets', 'kaleci-v2.png'))
    veri.update(yeni_pozlar(os.path.join(KOK, 'assets', 'kaleci')))
    meta = dict(h=H, x0=X0, y1=Y1, nx=NX, ny=NY)
    with open(os.path.join(KOK, 'js', 'kaleci_maske.js'), 'w') as f:
        f.write("/* tools/kaleci_maske.py ile üretildi: kurtarış maskeleri (satır, başlangıç, bitiş) hücre = %.2f m. Elle düzenleme. */\n" % H)
        f.write("(function (root) { var DT = (root.DT = root.DT || {}); DT.KALECI_MASKE = {meta: %s, maske: %s}; })(typeof globalThis !== 'undefined' ? globalThis : window);\n" % (json.dumps(meta), json.dumps(veri, separators=(',', ':'))))
    print('maske sayısı', len(veri), 'boyut', os.path.getsize(os.path.join(KOK, 'js', 'kaleci_maske.js')) // 1024, 'KB')
