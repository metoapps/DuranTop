# 20261021b — Açılışın ve oyun akışının geri yüklenmesi

Ana oyun dosyası `PLACEHOLDER_WILL_BE_REPLACED` satırına dönüşmüştü. Tarayıcı bu satırda hata verdiği için başlangıç, görsel yükleyici ve düğme olayları çalışmıyordu.

- `js/oyun.js`, son tam sürüm `d1fe9b8` üzerinden geri getirildi. Hazırlık süresi, kendiliğinden vurmayan ibre, basılı güç girişi, hızlı şut sineması ve mevcut oyun kuralları korundu.
- Giriş yapılmadan antrenman ve bütün antrenman karakterlerinin seçimi açıldı. Canlı kupa sunucu kimliği ve skor kaydetme sözleşmesi korundu.
- Sonraki Meto/LORT model ve ses değişiklikleri korundu. `kosu.cjs` testi, son koşu kolu pozunun vuruş başlangıcıyla uyuşmadığını buldu: `js/futbolcu3d.js` iki aşamada aynı kol pozu hesabını kullanır; ellerin yaklaşık 43 birim sıçraması giderildi.
- `index.html` ana oyun kodunu yeni `20261021b` etiketiyle yükler.
- `tests/oyun-baslangic.cjs` gerçek oyun giriş kodunu çalıştırır; girişsiz karakter seçimini, şut/sonuç/sonraki vuruş akışını ve kupanın kimlik kontrolünü doğrular. Yer tutucuya dönülürse bu test başarısız olur.

Yükleme katmanını süre dolunca zorla gizleyen bir çözüm kullanılmadı; oyunun gerçek başlangıcı onarıldı.

Test notu: `tribun-katman.cjs` gerçek çizim süresi 100 ms’yi geçtiğinde kasıtlı süre aşımı yenilemesini yanlışlıkla hata sayıyordu. Denetlenen saatle 16 ms kare aralığı ve 101 ms güvenlik yenilemesi ayrı ayrı doğrulanır; tribün üretim kodu değiştirilmedi.
