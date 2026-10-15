# 20261019b — yalnız menü müziği ve müzik geçişleri

## Esas
Kullanıcının files(3).zip dosyasındaki DuranTop-20261019a.patch, 20261018b (b281a44) üzerine uygulanarak temel alındı. Bu düzeltme 20261019a üzerine uygulanır. Gönderilen ZIP değiştirilmedi. Ana dal ve canlı site değiştirilmedi; Edge dağıtımı yapılmadı.

## Değişiklik
- Üç farklı özgün menü bestesi: 104 BPM piyano benzeri yumuşak melodi, 84 BPM sakin gece teması, 112 BPM ritmik tema. Harici ses dosyası veya yeni bağımlılık gerekmez.
- Menüde parçalar sırayla değişir; menüye geri dönünce sıradaki parça gelir. Aynı menü ekranının tekrar bildirilmesi parçayı baştan başlatmaz.
- Menü parçaları arasında ve menü/maç sahnelerinde yaklaşık 0,8 saniyelik yumuşak geçiş. Eski müzik kaynakları zamanında durur; müzik kapatılırsa sönmekte olan kaynaklar da susar.
- Destekleyen tarayıcılarda geçiş, devam eden ses zarfını mevcut düzeyde tutarak yapılır; diğerlerinde mevcut düzey yakalanarak otomasyon yeniden kurulur.
- Sekme gizlenince müzik durur; dönünce ses ve müzik ayarları açıksa yeniden başlar. Tarayıcının kullanıcı dokunuşu gereksinimi korunur.
- Gecikmiş zamanlayıcı geçmiş notaları topluca çalmaz. İsteğe bağlı gerçek menü kaydı sonradan yüklenirse mevcut parça yumuşak geçişle yükseltilir ve kendi gerçek süresi kullanılır.
- Maç bestesinin nota verisi ve tüm müzik efektlerinin tanımları önceki sürümle SHA-256 karşılaştırmasında aynı. Ses kaydırıcıları, diğer ses modülleri, oyun akışı, fizik, kaleci ve sunucu kodu değiştirilmedi.

## Değişen dosyalar
- js/muzik.js
- index.html: yalnız muzik.js önbellek etiketi 20261019b.
- tests/muzik.cjs: menünün yeni melodi enstrümanını doğrular.
- tests/muzik-menu-gecis.cjs: yeni parça/geçiş/sekme/susturma regresyon testi.
- Bu değişiklik notu.

## Doğrulama
5/5 ilgili test başarılı: muzik, muzik-menu-gecis, ses-modul-seviye, ses-seviye, akis.
Üç parçanın çevrimdışı render çıktıları sonlu, tepe <0,95 ve RMS 0,03–0,25 aralığında. Testler sahte WebAudio saati ile üç parçayı, menü/maç geçişlerini, susturmayı, sekme görünürlüğünü, gecikmiş yüklemeyi ve 30 saniyelik gerçek kaydın doğru süresini doğrular. Oyun akış testi başarılı. Maç müziği ve efektlerin eski veri hash'leri korunur. node --check ve git diff --check başarılı.
Gerçek telefon/tarayıcıda kulakla dinleme ve gerçek WebAudio/otomatik oynatma davranışı bu ortamda denenmedi. Tüm test paketi yeniden çalıştırılmadı; yalnız bu değişikliğin ilgili kontrolleri çalıştırıldı. Sonuç doğrulanınca çalışma bu kapsamda durduruldu.
