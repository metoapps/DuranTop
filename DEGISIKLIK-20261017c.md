# 20261017c — yayın düzeltmeleri

- 20261017a ve 20261017b mevcut 20261016a hazırlık dalına birleştirildi. İlgisiz önbellek etiketleri korundu.
- Eski `ALAY` tablosunu bekleyen test, güncel tezahürat sağlayıcısını sınayacak şekilde yenilendi. Aut/direk dışındaki sonuçlar, kişiye özel cümlelerin karışmaması ve deterministik seçim denetleniyor.
- Barajın zıplama görselinde el ve dirsek hedefleri yükseltildi. Eller başın üstüne çıkar; aynı iki kemikli IK ve sabit kol boyları korunur. Baraj pozunun piksel testi artık geçer; testin eşiği düşürülmedi.
- Ses entegrasyon testindeki eski oyun.js önbellek beklentisi 20261017a sürümüne güncellendi; ses dosyası ve ses etiketi korunur.
- Değişen baraj3d dosyasının tarayıcı önbellek etiketi 20261017c oldu.
- js/ses.js, canlı bağlantı ve sunucu kodu değiştirilmedi.
- Spiker dosyaları pakette bulunmuyor: gol/gollazo seslerinin altyapısı var, gerçek spiker kaydı eklenene kadar bu sesler çalmaz.

Doğrulama: `node tools/testleri-calistir.cjs --e2e`. Ayrıntılı sonuç yayın commit mesajındadır. Chromium olmayan ortamda yerleşim testi kendi yönergesine uygun olarak atlanır; gerçek telefonda görsel kontrol yapılmadı.

Sonuç: 81 test giriş noktası; 80 çalıştırılan test başarılı, 1 Chromium yerleşim testi atlandı. Tam koşudaki tek kalan hata eski önbellek beklentisiydi; yalnız test beklentisi düzeltildikten sonra ilgili ses entegrasyon testi ayrıca başarılı çalıştırıldı.
