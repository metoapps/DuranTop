# 20261018a — falso, frikik kalecisi ve karakterler

## Top ve eski kayıtlar
- Yeni resmî vuruşlar rules 11; rules 9 ve daha eski kayıtların fizik ve puan hesapları korunur. Kayıtlı isteğin tekrarı yeniden hesaplanmaz; kayıtsız eski sürüm isteği hak tüketmeden reddedilir.
- Yeni `falsoDenge` bayrağı: kenar temasının verim katsayısı (1−0.45r²) yerine (1−0.08r²); spin aktarımı 0.23 yerine 0.18. Bunlar oyun için kalibre edilmiş yaklaşık temas katsayılarıdır, evrensel fizik sabitleri değildir.
- Sonlu darbe enerjisi öteleme ve dönme arasında paylaşılmaya devam eder (I=2/3 mR²). Magnus kuvveti hıza diktir; sürükleme ve yerçekimi değişmedi. Kenara vuruşta hafif hız kaybı korunur.
- Sabit koşullu ölçüm (%100, maksimum yan temas, kural 10 antrenman): önce 103.5 km/sa, yeni 123.6 km/sa; merkez temas 129.6 km/sa. Rüzgâr ve uçuş sırasında hız ayrıca değişir.

## Frikik zekâsı
- Yeni bayrak yalnız frikikte daha sık geçmiş örnek okuması (75 ms), daha düşük tahmin gürültüsü ve daha az merkez karar hatası sağlar.
- Tepki gecikmesi ve beden hız sınırları korunur. Yan adımla hazırlanır, dalışı zamanlar; uçuş başladıktan sonra havada köşe değiştirmez. Gelecekteki top örneklerine göre hareket edemez.
- Sabit merkez-şut karar testi: 100 tohumda yanlış merkez kararı 20 → 8. Bu tüm şutlar için kurtarma yüzdesi değildir.

## Görsel modeller
- Beş karakterin kimlik dokuları korunur; aşırı büyük başlar küçültülür, gövde/bacak oranı ve omuz hacmi geliştirilir. Kollarda ve bacaklarda konik hacim, önde forma dokusu eklenir. Ayak temas düğümleri aynen korunur.
- Neuer benzerliği mevcut dokudan yapay zekâ ile ayrıntılandırılıp 512 px saydam WebP olarak yenilendi. Yüz yüzeyi yakın planda daha çok parçayla eşlenir. Gerçek taranmış 3B insan modeli değildir.

## Doğrulama
- Falso hız/enerji/Magnus ve eski kayıtların sayısal eşitliği: `tests/falso-denge.cjs`.
- Frikik gözlem nedenselliği, tepki ve hız sınırı, merkez kararları: `tests/frikik-zeka.cjs`.
- Gerçek Edge işleyicisi sahte veritabanında rules 11 ve eski kayıtla tekrar denendi. Canlı şut hakkı kullanılmadı.
- Tüm testler ve yayın kontrolleri commit açıklamasındadır. Chromium yerleşimi bu ortamda yoksa atlanır.

Kaynaklar: NASA Forces/Lift/Bending a Soccer Ball; Asai ve diğerleri, The curve kick of a football I: impact with the foot (2002). Kaynaklar kuvvetlerin yönünü ve hız–spin ödünleşmesini destekler; oyun katsayılarının doğrudan deneysel doğrulaması değildir.

Son doğrulama: tam koşuda 82/83 giriş noktası başarılı (biri Chromium yokluğunda atlandı); kalan yükleme testi önbellek sorgusunu dosya uzantısından ayıracak şekilde düzeltildikten sonra tekrar geçti. Toplam 82 çalıştırılan test başarılı, 1 tarayıcı yerleşim testi atlandı. Son ayak-düğümü korumasından sonra cizim, kosu ve futbolcu3d testleri yeniden geçti.
