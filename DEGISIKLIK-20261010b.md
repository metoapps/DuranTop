# Duran Top — 20261010b: 3 adımlı hızlı vuruş, alay, belirgin tribün, kısa ok

Esas: 20261010a. Kupa (rules 9), sunucu ve fizik değişmez. Sunucuya giden girdiler aynı (nişan, temas, güç, zamanlama, duruş). Edge'e dokunulmaz.

## 1. Duruş ve yön tek adım
- "Duruşunu seç" adımı, Sola/Düz/Sağa düğmeleri ve yürüme beklemesi kalktı. Pozisyon açılınca doğrudan yön okları gelir.
- ◀ ▶ nişanı ve oyuncunun bakış yönünü birlikte değiştirir (±23° = duruş ±1; hedef yönün düz hatta göre açısından hesaplanır). Oyuncu dönerken yerinde küçük adımlar atar. ▲ ▼ yükseklik. Dokunarak nişan da duruşu döndürür.
- Kamera, ok bırakılınca (ya da Tamam'da) bir kez yeni açıya geçer; küçük ayarlarda (<0,15) sıçramaz.
- Oklar basılı tutuldukça 1×→2,2× hızlanır (3,2 m/sn yön, 1,6 m/sn yükseklik; önceki 2,0 ve 1,0).

## 2. Üç adımlı hızlı vuruş
1. **1/3 Yön:** oklar + Tamam.
2. **2/3 Topun neresine:** topa dokunup bırakınca doğrudan 3. adıma geçer (ayrıca "Ortadan vur" düğmesi).
3. **3/3 Sertlik:** VUR'u basılı tut, bırak, ibre (iki geçiş).
Eskiye göre: 3 dokunuş ve 1,1 sn yürüme beklemesi azaldı.

## 3. Alay
- Kaçan şutta (aut, kısa, kaleci kurtarışı, baraj; hedef ağında ağ ve halka) seyirci kollarını aşağı açıp titreyerek gülüyor, 5 balon çıkıyor ("Yuh!", "Çüş!", "Hahaha!", "Kaleci aldı!"...), 3,4 sn sürer. Balonlar bayrakların üstündedir.
- Gol, direk golü ve direkten dönen toppta alay yok (direkte "ahhh" çalar).
- Ses: yalnız gerçek kayıt. `assets/ses/yuh.(mp3|ogg|wav|m4a)` varsa o; yoksa `gol.*` kaydı yavaşlatılıp kısılarak uğultuya çevrilir (dinlenmedi); ikisi de yoksa sessiz, balonlar yine çıkar.

## 4. Yer oku kısa
- Ok yalnız ilk 3–4,5 m gösterilir (önceki: mesafenin %55'i, en çok 15 m). Kaleye ve baraja ulaşmaz.

## 5. Tribün belirgin hareketli
- Zıplama genliği ≈3 kat, kol kaldıran grup ≈%40, yan sallanma, dalga her 7 sn'de bir (önce 11), gol olunca herkes zıplar.
- **Sistem "hareketi azalt" ayarı artık yok sayılır** (önceki sürümde açıksa tribün, bayrak ve gol sevinci donuyordu; "tribün hareketsiz" şikâyetinin olası nedeni). Dondurmak için yalnız `AYAR.hareket=false` (testler).

## Dosyalar
`js/oyun.js`, `js/cizim.js`, `js/tribun.js`, `js/tezahurat.js`, `js/sevinc.js`, `js/ayar.js`, `index.html` (hazırlık ve duruş panelleri kalktı, başlıklar 1/3-2/3-3/3, "Tamam", "Ortadan vur"). Etiketler 20261010b.

## Testler
- Yeni: `alay-akis.cjs` (altı sonuç türünde alay tetiklenir/tetiklenmez). Yeniden yazılan: `yon-ok.cjs` (oklar = duruş, kamera bırakınca bir kez geçer).
- Güncellenen: `akis`, `hedef`, `kupa-kapali`, `fifa-ok` (ok kısa), `tribun-hareket` (sistem hareketi-azalt açıkken de hareket, alay), `tribun-atmosfer`, `tezahurat` (alay sesi), `ag`.
- `ag.cjs`'te bir yorum satırı kapanış doğrulamasını yutuyordu; düzeltildi, doğrulama gerçekten çalışıyor.
- Linux'ta 53/53 + e2e. Denenmedi: gerçek telefon, parmakla basılı tutma, alay sesi, tribün ve balon maliyeti.

## Yayın
Yalnız site; sunucu ve SQL değişmez. Kupa yeniden açılırsa bu akışı arkadaşlar da oynar.
