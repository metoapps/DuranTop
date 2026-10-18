# Duran Top — 20261024a: Meto'ya Mixamo breakdance sevinci (4. sevinç)

Esas: 20261022f (16199fd). Fizik, puan, kaleci, kurallar, sunucu, kupa DEĞİŞMEDİ. Edge'e dokunulmaz. Yalnız görsel.

## Ne değişti
- Meto'nun gol yakın planına **4. sevinç** eklendi: Mixamo "Breakdance Freeze Var 3". Sıra: yumruk → uçak → çığlık → breakdance (kalıcı sayaç).
- Paket `assets/meto3d/sevinc-breakdance.{json,bin}` ≈ 270 KB. Geometri ve doku yeniden indirilmez; oyundaki `model.bin` aynen kullanılır. Pakette yalnız tepe başına 4 kemik ağırlığı ve 30 kare/sn kemik kareleri var.
- Meto modeli hazır olunca arka planda yüklenir (yalnız Meto oynayanlar). Hazır değilse ya da hata olursa sevinç 0 (yumruk) oynar.
- 22 kemik (parmaklar ele katıldı): telefonlarda WebGL1'in asgari 128 vec4 sınırının altında (88).
- Mixamo'daki yerde gezinme (≈1,9 m) çıkarıldı; karakter yakın planda kadrajda kalır.
- Dans 6,2 sn; bitince 0,5 sn'de başa yumuşakça döner ve "Sıradaki vuruş"a basılana kadar tekrar eder. Ara karelerde uzuvlar eklemden kopmaz (ebeveyne göre dönüş).

## Kod
- `js/meto3d.js`: `loadDans`, `dansPose`; çizicide ikinci (4-kemik) gölgelendirici. Eski üç sevinç ve vuruş yolu aynı.
- `js/sevinc.js`: Meto dönüşümü 3 → 4.
- `index.html`: `meto3d.js`, `sevinc.js` etiketleri 20261024a.
- Araçlar: `tools/meto-mixamo-disari.py` (Mixamo'ya yüklenecek OBJ paketi), `tools/mixamo/cikar.cjs` + `cikar.html` (FBX → ham veri, başsız Chromium + three.js), `tools/mixamo/paketle.py` (ham veri → oyun paketi). Ham FBX depoya konmaz.

## Yeni animasyon eklemek
1. Mixamo: FBX Binary, With Skin, 30 kare/sn, Keyframe Reduction: none.
2. `npm i --no-save three@0.169.0 playwright-core@1.48.2`
3. `node tools/mixamo/cikar.cjs ANIM.fbx ham.json` → `python tools/mixamo/paketle.py ham.json AD [--bas SN --son SN]`
4. `meto3d.js` şu an yalnız `sevinc-breakdance` yükler; ikinci animasyon için yükleyici genelleştirilmeli.

## Testler
- Yeni: `tests/meto-dans.cjs` (paket bütünlüğü, ağ eşleşmesi, yüz yalnız baş/boyuna bağlı, süreklilik, kadraj, dikişsiz döngü, 4'lü dönüşüm, yedeğe düşme), `tests/meto-dans-webgl.cjs` (gerçek Chromium WebGL: 9 kare, GL/JS hatası yok, eski üç sevinç sağlam).
- `tests/tribun-sevinc.cjs`: Meto dönüşümü 4'lü.
- Tüm paket: 106/106 geçti (Linux + başsız Chromium/SwiftShader).

## Sınırlar (açıkça)
- **Gerçek telefonda denenmedi.** FPS, yükleme, görünüm yalnız başsız Chromium'da görüldü.
- Döngü geçişinde (0,5 sn) bacaklar kısa süre çaprazlanmış görünebilir.
- Dans hızlı (ayak ucu ≈10 m/sn); 30 kare/sn'de çok hızlı telefonda hafif kesik görünebilir.
- **20261023a (LORT gerçek ağ) bu dalda yok**: GitHub'da değil. O değişiklik `meto3d.js`'yi karakter başına kuruluma çevirdi; birleştirirken `loadDans`/`dansPose`/ikinci gölgelendirici o yapıya taşınmalı.

## Yayın
Yapılmadı. Dal: `paket-20261024a-mixamo`. Edge'e dokunulmaz.
