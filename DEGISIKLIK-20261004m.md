# Yön ve kol animasyonu düzeltmesi

## Yön seçimi ve sabit uzunluklu kollar (20261004m)
Sağa dön seçimi sağa bakan şutçu pozu, sola dön seçimi sola bakan poz verir. Yön yalnız duruş seçimine bağlıdır; kale hedefi karakteri çevirmez. Yürüyüşte kök konumu iki duruş arasında taşınır ve dönüş ortasında gövde incelerek yön değiştirir; bacak hareketi korunur. Forma numarası ters yönde ön basıldığı için sağa dönünce de okunabilir.

Kalecinin omuz-dirsek ve dirsek-bilek kemikleri her biri 0.34 m olarak sabittir. El hedefleri iki kemikli ters kinematikle çözülür; toplam erişim aşıldığında el hedefi sınırlanır, kemikler uzatılmaz. El kaldırma, kolları açma, jest, dalış ve toparlanma aynı sınırı kullanır. Yerden kalkışta ellerin zemine erişebilmesi için ara gövde pozu düzeltildi. Yeni kurtarış çarpışması çizilen aynı kol geometrisini kullanır.

Yeni resmi girdiler rules=4; eski sonuçların hesapları, puanları ve kol çarpışması korunur. Yeni istemci ve sunucu birlikte yayınlanmalıdır. SQL değişikliği yok. Görsel kontroller beş karakterin iki yönünde, kalecinin hazır/açık/yüksek/jest pozlarında yapıldı. tests/kol-boyu.cjs 909 pozda dört kol kemiğinin sabit uzunluk ve sonlu koordinatlarını doğrular. Yerden kalkış desteği/sürekliliği, yürüyüş, oyun akışı, kimlik/haftalık sınır ve fizik testleri de çalıştırıldı. Gerçek iPhone/Safari bu sürümde burada denenmedi.
