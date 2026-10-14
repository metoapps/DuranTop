# Duran Top — 20261013a: Hayatta kal, Günün meydan okuması, müzik ve efekt sesleri

Esas: 20261012a. Kupa, sunucu ve kupa hesabı değişmez (yeni modlar yerel, antrenman kurallarıyla). `js/ses.js`'e dokunulmaz (senin depondaki gerçek kayıtlı sürümle çakışmasın diye müzik ayrı modüldür).

## 1. Günün meydan okuması (`js/modlar.js`, `js/oyun.js`)
- Her gün (İstanbul saatiyle gece yarısı değişir) herkese aynı **3 vuruş**: bir penaltı, bir frikik, bir hedef ağı. Pozisyon, rüzgâr, altın bölge ve kaleci kararı günün tohumundan gelir; yani herkes aynı sınavı çözer, fark yalnız beceridir. Altın bölge ve seri bonusu dahil.
- **İlk deneme kayda geçer**; sonrakiler antrenman (aynı vuruşlar, kayıt değişmez). Günlük #1 = 1 Ekim 2026. Ardışık günler 🔥 günlük seri olur.
- Tur sonunda "Sonucu paylaş": `Duran Top Günlük #14: 14 puan (2/3 gol) 🔥 3 gün üst üste` + "Sen kaç yaparsın?". Menüde düğmenin altında durum ("bugün 14 puan · 🔥 3 gün" ya da "bugünkü ilk deneme sayılır").

## 2. Hayatta kal
- İlk kaçırışa kadar sonsuz vuruş. HUD: "Seri 4 · Rekor 9". Her golle zorluk artar (14 golde tepe):
  - **Rüzgâr** 0,25× → 1,3× güçlenir.
  - **Kaleci sezgisi** (penaltı): seviye arttıkça, en çok %45 olasılıkla doğru köşeyi seçer (seçim yine vuruştan önce yapılır, yalnız isabeti artar). Aynı vuruşlarla penaltı gol oranı seviye 0'da %65, seviye 1'de %42.
  - Kaleci biraz hızlanır, frikikte yanlış karar ihtimali azalır.
  - **Baraj** daha çok ve daha erken zıplar.
  - Pozisyonlar: önce penaltı ve yakın frikik; 3 golden sonra uzak frikik; 7 golden sonra hedef ağı da gelir.
- Bitişte "Seri bitti: N gol", rekor kaydı ("🏆 Yeni rekor!" ya da "Rekorun: M gol. K gol daha atsan geçerdin"), paylaşım metni.
- Kupa ve eski kurallar: kaleci seviyesi/hedefX/baraj zorluğu bayraksız çıktıda etkisiz (rules6 hash ve 720 vuruşluk karşılaştırma geçiyor).

## 3. Müzik ve efekt sesleri (`js/muzik.js`)
- İki özgün döngü, ses dosyası gerekmez (tarayıcıda üretilir): **Menü** (96 bpm, la minör, pedli, sakin melodili) ve **Maç** (118 bpm, arpej + bas + hafif davul, arka planda düşük ses). Menüde menü, oyunda maç parçası çalar; geçişte 1 sn yumuşak çapraz geçiş.
- **Vuruş ve gol anında müzik kısılır** (kis), sonra geri açılır.
- **Efektler:** gol fanfarı, kaçan şut ("vıv-vıv-vıv"), altın bölge zili, seri çan, rozet jingle'ı.
- Ayarlar: genel "Ses" düğmesi kapalıyken hiçbir şey çalmaz (ses kapalı başlar); ayrıca **"Müzik: açık/kapalı"** düğmesi.
- **Gerçek parça koymak istersen:** `assets/ses/muzik-menu.mp3` ve `assets/ses/muzik-mac.mp3` (ogg/wav/m4a de olur) varsa sentez yerine onlar döngüyle çalar.
- **Önizleme:** aynı veriden üretilen `muzik-menu-onizleme.wav`, `muzik-mac-onizleme.wav`, `muzik-efektler-onizleme.wav` bilgisayarında dinlenebilir. (Ben dinleyemedim; yalnız sayısal kontrol: kırpma yok, RMS 0,10–0,14, DC yok.)
- Testin yakaladığı hata: parça olayları zaman sırasıyla değil katman sırasıyla üretiliyordu; çalıcı bas, davul ve melodiyi atlıyordu. Düzeltildi.

## Testler
- Yeni: `modlar.cjs` (gün numarası, tohum, günlük kayıt ve seri, hayatta kal zorluğu ve dağılımı, rekor), `modlar-akis.cjs` (iki modun oyun akışı), `muzik.cjs` (parça teorisi, render, çalıcı). Linux'ta 70/70 + e2e; Chromium'da sayfa hatasız açılıyor ve yeni düğmeler görünüyor.
- Denenmedi: gerçek telefon, **müziğin kulağa nasıl geldiği**, hayatta kal zorluk eğrisi hissi.

## Yayın
Yalnız site. Etiketler 20261013a (yeni: `modlar.js`, `muzik.js`; `ayar`, `oyun`, `cizim`, `ruzgar`, `fizik`, `kaleci`, `baraj`, `css/stil.css`).
