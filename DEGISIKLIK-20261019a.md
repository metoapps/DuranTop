# Duran Top — 20261019a: menü cilası, ses düzeyi kaydırıcıları, spiker tekrarı, kaleci yakası

Esas: 20261018b (ChatGPT paketi, b281a44). Fizik, sunucu, kural sürümleri ve kaleci fizik gövdesi DEĞİŞMEDİ (yalnız görüntü, ses ayarı ve menü).

## 1. Menü
- Başlık tek satır (eskiden iki satırda ekranın dörtte birini kaplıyordu), "Kupaya katıl" tam genişlik, mod düğmeleri iki sütunlu eşit ızgarada ve aynı satırda eşit yükseklikte. Antrenman ve Hedef ağı düğmelerine tek satırlık açıklama eklendi. 390×844, 320×568 ve 844×390'da taşma yok.
- Yeni test `menu-yerlesim.cjs` (Chromium; yoksa atlanır).

## 2. Ses düzeyi kaydırıcıları (Ayarlar)
- Üç ayrı kaydırıcı: **Müzik**, **Efektler** (vuruş, direk, ağ, düdük, gol uğultusu), **Spiker ve tribün**. 0–100, ayar kaydedilir, geri yüklenir, aşırı değerler kısılır. Telefonda kulakla dengelemek içindir: spiker çok yüksekse ya da müzik bastırıyorsa kod değiştirmeden ayarlanır.
- Yeni test `ses-seviye.cjs` (oyun akışı) ve `ses-modul-seviye.cjs` (her modülün ana ses düğümü).

## 3. Spiker tekrar yorgunluğu
- Yalnız bir spiker kaydı olduğu için her gol aynı bağırışı çalıyordu. Tercih edilen grup (sıradan gol: `spiker-gol-N`, büyük gol: `spiker-gollazo-N`) boşsa ve yedek gruptan çalınacaksa artık her gole çalmaz: 1 kayıt ≈%55, 2 kayıt ≈%75, 3+ her seferinde. Tercih edilen grup doluysa hep çalar.

## 4. Kaleci
- Boyun uzun ve çıplak çubuk gibi görünüyordu: yüksek yaka eklendi (forma boyuna doğru uzanıyor, görünen boyun kısa). Yalnız çizim; fizik gövdesi ve düğüm konumları aynen, kural sürümleri etkilenmez.

## Uyarı (değişmedi)
- `assets/ses/spiker-gollazo-1.mp3` herkese açık bir GitHub deposundan alınmış ve kaynak notu "ses için ayrı lisans belirtilmemiş" diyor. Kalıcı koymadan önce izin al ya da kendi/yapay zekâ kaydınla değiştir (`SPIKER-REHBERI.md`).

## Testler
Yeni: `menu-yerlesim`, `ses-seviye`, `ses-modul-seviye`. Denenmedi: gerçek telefon (kaydırıcıların parmakla kullanımı, dengenin kulağa gelişi).

## Yayın
Yalnız site. Etiketler 20261019a (`oyun`, `ses`, `muzik`, `tezahurat`, `kaleci3d`, `css/stil.css`). Edge'e dokunulmaz.
