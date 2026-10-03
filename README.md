# Duran Top — Kaptanlık Kupası

Mobil tarayıcıda METO, LORT, FERO, LATTE ve JOSH için 3 penaltı + 2 frikik.

## Oynanış
1. Kaleye dokunarak hedefi seç ve bırak.
2. Top üzerinde temas noktası seç: merkez temiz şut, alt daha yüksek yay, yanlar falso. Temas, son hedefi değiştirebilir; frikikte alttan temas barajı aşmayı sağlar.
3. Zamanlamaya geç ve VUR'a bas. Resmi turda zamanlama zorunlu; antrenmanda kapatılabilir. Yeşil bant dar bırakıldı.

## Fizik ve kaleci
Metre ve saniye kullanılır. Yerçekimi 9.81 m/s²; temel şut hızı penaltıda 25, frikikte 24 m/s.
Zamanlama hatası h=zaman−0.5. Temas kalitesi q=exp(−(h/0.18)²); hız çarpanı (0.60+0.40q)(1−0.10|temasX|). Hata ayrıca çıkış açısını ve küçük yanal sapmayı değiştirir. Alt temas, kalibrasyonlu bir yükselme yayı; yan temas, spin kaynaklı yanal ivme ekler. Yerçekimi, dönme ve kuvvet ilkeleri için NASA'nın “Forces on a Soccer Ball” sayfası: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/forces-on-a-soccer-ball/
Bu bir sadeleştirilmiş oyun modelidir. Aerodinamik katsayılar ölçülmüş sporcu verisi değildir; tam hava direnci, ayak eklemleri veya doğrulanmış biyomekanik simüle edilmez. Zemine inen topun yüksekliği top yarıçapında sınırlandırılır.

Kaleci top çıktıktan sonra tepki verir. Gövdeye gelen şutta ayakta kalır; uzak şutta mesafeye bağlı sürede dalar. Yavaş şut daha fazla erişim süresi verir. Kurtarış için ayrı rastgele yüzde yoktur: çizgi önündeki son yarım metrede gövde/kol temas alanı kontrol edilir. Direk, baraj, kaleci ve uçuş aynı örneklenmiş yol üzerinden hesaplanır. Model geometrisi stilize görsellerin yaklaşık uzanımına göre kalibre edilmiştir; piksel düzeyinde maske değildir.

Yeni `assets/kaleci-v3.png`: altı şeffaf poz (hazırlık, alçak blok, göğüste tutuş, dalışa çıkış, uzanma, iniş). Sağ dalış için yalnız kaleci aynalanır. Şutçu nişana göre çevrilmez; vuruş kareleri aynı ankrajda çizilir ve top temas anında çıkar. Şutçu halen üç poz kullanır; kesintisiz iskelet animasyonu değildir. Grok'un dört karelik karaktere özel sevinçleri korunur.

## Beş arkadaşın kupası
Ev sahibi altı haneli ortak kodu paylaşır. Herkes aynı kodla aynı beş pozisyonu ve aynı rastgele tohumları oynar. Kişi başı bir resmi tur; antrenman sınırsız. Tur bitince “Sonuç kodunu paylaş”; ev sahibi diğer dört kodu “Arkadaşın sonuç kodunu ekle” ile tabloya ekler.
Sıralama: puan, yeşil isabet sayısı, gol sayısı. Tam eşitlikte ortak kaptan. Beş sonuç tamamlanınca kaptan açıklanır. Sonuncu bir sonraki kupa kodunu seçsin; günlük veya haftalık rövanşla kaptanlık el değiştirsin.

Tablo bu telefonda localStorage'da saklanır; canlı sunucu odası veya kimlik doğrulaması yoktur. Sonuç kodları doğrulanmış yarışma kanıtı değildir. Depoyu temizleme, farklı cihaz veya değiştirilmiş istemci tekrar oynamayı mümkün kılar. Kupon ödülü/gerçek değer aktarımı bağlı değildir. Eski `dt_*` resmi turları yeni fizik sürümüne taşınmaz; eski kayıtlar silinmez.

## Kontroller
`node tests/oynanis.cjs`: 540 deterministik yol, 600 merkez kurtarışı, temas/falso/baraj, zamanlama-hız-kurtarış ilişkisi.
`node tests/akis.cjs`: DOM taklidiyle hedef→temas→zamanlama, beş vuruşluk resmi akış, tek kayıt, resmi çubuk zorunluluğu, tamamlanan oyuncu kilidi.
`node tests/cizim.cjs`: @napi-rs/canvas ile 320×568, 390×844 ve 430×932; izdüşüm ve altı kaleci pozunun çizimi.
Gerçek iPhone Safari ve gerçek parmakla doğrulanmadı. Chromium kurulumu bu ortamda başarısız olduğundan gerçek tarayıcı testi yapılmadı.

## Açılış yükleme iyileştirmesi (20261003g)
Açılış artık 30 oyun sprite'ı + 15 menü pozu + kaleci (46 zorunlu görsel) beklemez. Beş menü portresi ve kaleci WebP olarak yüklenir: toplam 307266 bayt. PNG kaynakları korunur. Seçilen karakterin altı oyun pozu karakter seçimi sırasında yüklenir; dört yeni sevinç pozu ardından yüklenir ve oyunu engellemez. Seçilmeyen karakterlerin sprite'ları indirilmez. Menü görsellerinin farklı sorgu parametreleriyle çift indirilmesi kaldırıldı. Google font CSS'i başlangıç scriptlerini engellemeden yüklenir. `node tests/yukleme.cjs` başlangıç istek sayısını, seçili karakter kapısını, istek birleştirmeyi ve isteğe bağlı sevinç yüklemesini doğrular. Gerçek mobil ağda süre ölçülmedi.
