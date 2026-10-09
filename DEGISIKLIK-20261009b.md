# Duran Top — 20261009b: antrenman turu, kural 10, tribün sesleri

Esas: 20261009a. Sunucu, SQL ve kupa (rules 9, 5+2+3) değişmez. Yeni fizik yalnız `kural10` bayrağıyla çalışır; bu bayrak yalnız antrenman ve hedef ağı modunda verilir. Bayraksız sonuçlar 0f9bfc1 ile birebir aynı (720 vuruşta ölçüldü).

## Hata düzeltmesi
- Hedef ağı yalnız ayrı "Hedef ağı" düğmesindeydi, antrenman turunda yoktu. Artık antrenman turunda var.

## 1. Antrenman turu: 10 atış
- 5 penaltı + 3 frikik (yakın sağ 18 m, uzak sol 28 m, uzak orta 28 m) + 2 hedef ağı (16 m, 20 m).
- Kupa sırası (sunucu) 5+2+3 kalır. Kupa yeniden açılırken bu sıra istenirse sunucu ve kural sürümü değişmeli.

## 2. Frikikte kaleci daha erken
- Topu okuma gecikmesi 0,30 → 0,12 sn (tepki 0,24 aynı). İlk hareket 0,54 → 0,36 sn.

## 3. Temas yüksekliği
- Atış açısı temas noktasına göre: alt (y = −0,85) nişandan +21° yukarı, orta: nişan yüksekliği, üst (y = +0,85) −16° → top yerden gider.
- Eskiden yavaş vuruşta uçuş çözümü yüksek kavisi seçiyordu; orta temas bile 7 m'ye çıkıyordu. Şimdi uzak frikikte orta temas ≈3,9 m, üst temas 0,3 m.
- Görsel: krampon seçilen noktaya gelir (alt: topun altına girer, üst: topun üstüne biner, yan: yana kayar).

## 4. Sert vuruş hızlı
- Hız güçle doğrusal: %30'da 9 m/sn, %100'de penaltı 31, frikik 30 m/sn. Ölçülen: penaltı 112, frikik 108 km/sa.

## 5. Yeşilden uzak sert vuruş savrulur
- Yeşil bandın dışındaki pay × güç² kadar sapma: geç basış yükselir ve açılır (en çok +18° yan, +17° yukarı), erken basış alçalır.
- %100 güçte en kötü zamanlamada top kaleden 8–14 m açılıyor; %40 güçte aynı hata çok daha az sapıyor.

## 6. Tribün sesleri (`js/tezahurat.js`, sentez)
- Oyun ekranında sürekli kalabalık uğultusu; 7–13 sn'de bir toplu "üç alkış" ya da "o-le" nakaratı.
- Direkten dönen topta toplu "ahhh" (perdesi düşen kalabalık; tekil "ah" yerine).
- Ana ses düğmesine bağlı; ses kapalıyken hiçbir ses üretilmez.
- Gerçek kayıt değil, tarayıcıda üretiliyor; kulakla dinlenmedi.

## Testler
- Yeni `kural10.cjs`: bayraksız 720 vuruş eski sürümle aynı; alt > orta > üst ve üst yerden; hız eşikleri ve güçle artış; savrulma; frikik okuması 0,18 sn erken.
- Yeni `tezahurat.cjs`: kapalıyken sessiz, ortam/tezahürat/ahhh, ekran ve ses düğmesi bağlantısı.
- `hedef.cjs`: antrenman turu 5+3+2 tam akış, kural 10 açık, sunucuya istek yok.
- `direk-sonuc.cjs`: antrenman girdisine kural 10.
- Linux'ta 48/48 + e2e geçti. Gerçek telefonda denenmedi.

## Yayın
Yalnız site; sunucu ve SQL değişmez. Etiketler 20261009b.
