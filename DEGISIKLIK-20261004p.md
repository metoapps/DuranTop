# 20261004p — Ekran dışındaki içeriklere erişim

Uzun masaüstü menüsü ortalanınca başlangıcı ekranın üstünde kalabiliyordu. Menü artık üstten yerleşir; dikey kaydırma tüm içeriğe ulaşır. Seçim ve tur sonundaki flex öğelerinin sıkışması önlenir. Kadro ve kod alanı dar ekranı taşırmaz; sıralama satırları sarılır.

Temas/güç panelleri taşarsa üstten erişilebilir ve kaydırılabilir. Alt kontrol, sonuç ve duruş panelleri ekran yüksekliği ile güvenli alanlara göre sınırlandırılır. Kısa/yatay ve 360 px altı ekranlarda başlık, top ve HUD küçülür. Oyun sahnesi tam ekran kalır.

Fizik, skor, kimlik ve haftalık haklar değişmedi. Yerel çizim ve akış regresyonları çalıştırıldı. Bu ortamda Chromium kurulumu başarısız olduğundan gerçek DOM ölçümü ve iPhone/Safari görsel kontrolü yapılmadı. Yayındaki kaynak sürümü doğrulandı.
