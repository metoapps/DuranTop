# Duran Top — 20261025a: Meto'ya Mixamo "Flying Kick" sevinci (5. sevinç)

Esas: main fb70b0a (20261024a breakdance). Fizik, puan, kaleci, kurallar, sunucu, kupa DEĞİŞMEDİ. Yalnız görsel.

## Ne değişti
- Meto'nun gol yakın planına **ikinci Mixamo sevinci**: "Flying Kick". Sıra: yumruk → uçak → çığlık → breakdance → **flying kick** (kalıcı sayaç).
- Paket `assets/meto3d/sevinc-flyingkick.{json,bin}` ≈ 186 KB; geometri/doku yeniden indirilmez (oyundaki `model.bin`).
- Hareket 1,5 sn (sıçrayıp havada tekme, yere iniş); iniş pozunda 0,9 sn bekler, 0,5 sn'de başa yumuşak döner, "Sıradaki vuruş"a kadar tekrar eder.
- Paket hazır değilse ya da hata olursa sevinç 0 (yumruk) oynar.

## Kod
- `js/meto3d.js`: Mixamo yükleyici genelleşti (`DANSLAR = {3:'breakdance', 4:'flyingkick'}`); her paketin kendi ağırlık tamponu; `hold` (iniş beklemesi) desteği. Breakdance aynen.
- `js/sevinc.js`: Meto dönüşümü 4 → 5.
- `tools/mixamo/paketle.py`: `--bekle SN` ve `--surum` seçenekleri.
- `index.html`: `meto3d.js`, `sevinc.js` etiketleri 20261025a.
- Üretim: `node tools/mixamo/cikar.cjs "Flying Kick.fbx" ham.json` → `python tools/mixamo/paketle.py ham.json flyingkick --bekle 0.9 --surum 20261025a`. Ham FBX depoya konmadı.

## Testler
- `tests/meto-dans.cjs`: iki paket de aynı kurallarla (bütünlük, ağ eşleşmesi, yüz yalnız baş/boyuna bağlı, süreklilik, kadraj, dikişsiz döngü), 5'li dönüşüm, iki sevinçte de yedeğe düşme.
- `tests/meto-dans-webgl.cjs`: gerçek Chromium WebGL'de breakdance 9 + flying kick 8 kare, GL/JS hatası yok, eski üç sevinç sağlam.
- `tests/tribun-sevinc.cjs`: 5'li dönüşüm.
- Tüm paket: 107/107 geçti (Linux + başsız Chromium/SwiftShader).

## Sınırlar
- **Gerçek telefonda denenmedi.**
- Tekme çok hızlı başlıyor (Mixamo'daki gibi, bekleme yok); 30 kare/sn'de hızlı telefonda hafif kesik görünebilir.
- 20261023a (LORT gerçek ağ) hâlâ main'de değil; birleştirilirken Mixamo yükleyicisi karakter başına yapıya taşınmalı.

## Yayın
Yapılmadı. Dal: `meto-flyingkick`.
