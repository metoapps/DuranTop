# 20261004o — Claude incelemesinin tamamlanması

Temel: yayınlanan 20261004m + Claude'un 20261004n paketi. Sonuç kartı taşma düzeltmesi ve DPR 2 sınırı alındı.

- Adaptif kalite 60 yavaş karede 2 → 1,5 → 1 iner. Kesintisiz 600 hızlı karede bir seviye yükselir; yükselme sonrası 120 kare bekler. Sekme duraklaması örnek pencerelerini sıfırlar; gizli sekmede ölçüm yapılmaz. 600 kare 60 Hz'de yaklaşık 10 saniyedir; farklı yenileme hızında süre değişir.
- Giriş artık herkese açık oyuncu adına kalıcı deneme kilidi yazmaz. Doğru kod, eski SQL sayacı kilitli olsa da kontrol edilir. PBKDF2 doğrulaması worker başına aynı anda en fazla iki adet; yoğunluk LOGIN_BUSY/429 verir. Yanlış adayın SHA-256 anahtarı 60 saniye önbelleğe alınır, tekrar PBKDF2 yapılmaz; önbellek en fazla 256 girdidir. Açık kodlar tutulmaz. Worker/isolate ölçeğinde korumadır, dağıtık genel hız sınırı değildir. Doğru kod yoğunlukta kısa süreli tekrar gerektirebilir, hesap 15 dakika kilitlenmez. Eski SQL RPC yerinde, yeni giriş yolu kullanmaz; şema değişmedi.
- Genel tabloda eşitlik bozucu puan görünür. Dar ekranda satır sarılabilir.
- Haftalık başlık İstanbul pazartesi 00.00 kapanışını ve kalan hakların devretmediğini açıklar. Canlı gol/puan tablosu açık; rakip girdileri gizlidir.
- Fizik, kaleci ve rules:4 değişmedi. Yeni kaleci dengesi/oyun modu bu bakım sürümüne eklenmedi; mevcut haftanın sonuçları korunur.

24 yerel test geçti (23 devralınan + giris-koruma). Kimlik testi gerçek Edge handler'ını taklit DB ile çalıştırır. Kalite testi düşüş, toparlanma ve duraklama sıfırlamasını; giriş koruma testi önbellek, sona erme, eşzamanlı sınır ve hata sonrası kapasiteyi doğrular. Gerçek iPhone/Safari ve iki gerçek cihaz burada denenmedi. Üretimde resmi vuruş veya gerçek özel kodla test yapılmadı.

Yayın: önce Edge (eski istemciyle uyumlu giriş değişikliği), sonra site. SQL değişikliği yok. Geri alma: Edge v13 ve GitHub 1ebf34a083e85ccc375657ba6d6f8711f7e259e3. Yeni modül backend/giris-koruma.mjs Edge paketine dahil edilmelidir.
