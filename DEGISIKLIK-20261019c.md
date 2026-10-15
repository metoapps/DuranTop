# 20261019c — aranjmanlı menü müzikleri ve varsayılan açık ses

Esas: canlı 20261019b, be3e6ab4576cc9c637b4fe2b47e358ece308ed2b.

## Müzik
Basit menü sentezi yerine Kevin MacLeod'un tam aranjmanlı üç kaydı eklendi: Eighties Action (80 sn), Kick Shock (62 sn), Funkorama (80 sn). Yaklaşık 3 dakika 42 saniyelik farklı karakterli liste, kayıtların kendi süresini kullanır. Yaklaşık 0,8 saniyelik parça/sahne geçişleri korunur. MP3 dosyaları yerel sunulur; üçüncü taraf akış veya reklam servisi kullanılmaz. Sentez yalnız kayıt yüklenemezken yedektir. Mevcut ve sonraki kayıt hazırlanır; en fazla iki menü kaydı çözülmüş önbellekte tutulur. Önbellekten çıkarılan kayıt liste başa döndüğünde yeniden yüklenebilir.

Kaynak/CC BY 4.0 atıfları `assets/ses/MUZIK-KAYNAKLAR.txt` ve Ayarlar > Müzik kaynakları içinde. Kesit ve ses düzeyi düzenlemeleri belirtilmiştir. Kayıtlar Duran Top'a ait özgün besteler değildir. Stereo 44,1 kHz, 128 kbit/sn. Ölçülen düzeyler yaklaşık -16 ile -17 LUFS aralığında; gerçek ses kaydı kaynaklandığı halde burada kulakla dinleme yapılamadı.

## Otomatik açık ayar
Bu sürüme ilk geçişte Ses ve Müzik açık başlar. Eski müzik seviyesi 0 ise %100'e alınır; diğer ses düzeyleri ve oyun tercihleri korunur. Sonraki bilinçli kapatma/ses düzeyi seçimleri `sesPolitika:2` ile kaydedilir ve yeniden açılışta korunur. Tarayıcının otomatik ses kısıtlaması aşılmaya çalışılmaz: ayar açık görünür, gerçek ses ilk dokunma veya tuş olayında başlatılır. Mobilde sayfa daha açılır açılmaz hiçbir etkileşim olmadan ses garantisi verilmez.

## Korunan kapsam
Maç bestesi, gol ve müzik efektlerinin tanımları; fizik, kaleci, puanlama, sunucu, kural sürümü ve oyun kontrolleri değiştirilmedi. index.html yalnız ses etiketi, önbellek etiketleri ve gerekli müzik atıfları için güncellendi. İlgili eski kayıt/geçiş testleri yeni menü dosya adı ve oyun önbellek sürümüne uyarlandı.

## Kontroller
`tests/ses-otomatik.cjs`: ilk açılış/geçiş, ilk dokunuş, sonradan kapatma ve yeniden açılış, diğer tercihler.
`tests/muzik-kayit-listesi.cjs`: üç gerçek MP3, stereo/süre, atıf, kayıt sırası, <=2 önbellek, çıkarılan kaydın tekrar yüklenmesi, susturma.
`tests/muzik-menu-gecis.cjs` ve `tests/muzik.cjs`: geçiş, gizli sekme, geç yükleme, eski maç/efekt veri hash'leri, sentez yedeği.
Tam koşu: `node tools/testleri-calistir.cjs --e2e`; ham sonuç teslim paketinde. Chromium yoksa iki yerleşim testi atlanır. Gerçek telefon/Safari ve kulakla son dinleme bu ortamda yapılmadı.
