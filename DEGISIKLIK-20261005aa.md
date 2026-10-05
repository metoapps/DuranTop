# Juninho Kupası 20261005aa

Temel yayımlı commit: 885fc8b15954ab1a961fe22cb0d8ae2597a18c66 (w). Claude'un yayımlanmamış z paketinden yürüyüş, kamera, sürüm isteği ve yer temasında gözlem düzeltmeleri alındı.

## Son davranış
- Yeni resmi vuruşlar yalnız **rules 7** ile kabul edilir. İstemci daha kolay eski fiziği seçemez.
- Kayıtlı eski isteğin yinelenmesi mevcut sonucu döndürür. Kaydedilmemiş rules 4/5/6 isteği hak harcamadan CLIENT_VERSION alır. Güncel istemci böyle bekleyen isteği önce sorgular, kayıt yoksa güncel girdiyle rules 7 gönderir. Ağ hatası bekleyen isteği silmez.
- **Rules 6 korunur:** yer teması filtresi yalnız yerTakibi=true (rules 7) için çalışır. Yeni kodda 100 karma girdinin bütün sonuç/yol/kaleci verileri yayımlı w ile birebir aynı. Rules 4/5 testleri de geçer. Oda sürümü 8, SQL ve haftalık haklar değişmedi.
- Kaleci, yer darbesini kapsayan kısa hız/ivme penceresini atlar. Önceki planı korur, sonraki temiz gözlemde tekrar okur. Eski örnek: uzak orta frikik, hedef 3/0.8, merkez temas, güç .8, zaman .3, seed 1000+i*7919 (40 örnek): rules 6 29 gol / 11 kurtarış; rules 7 40 kurtarış.
- Duruş değişimi dön–yürü–dön olarak 1.1 saniyede tamamlanır; başlangıç ve bitiş konumu kalıcıdır, destek ayağı kaymaz.
- Kamera duruşa göre yan kayar. z'nin katsayıları (-.32/.37/.25) yerine (-.25/.32/.20) × kamera geri mesafesi kullanılır; kadrajın üst ve alt boşlukları azaltıldı. Top gövdenin üstüne çizilmez.
- 10 pozisyon × 3 duruş × 5 ekran (320x568,390x844,430x932,844x390,1366x768): en küçük kale genişliği sırasıyla 130/162/180/131/299 px, yüksekliği 46/57/63/46/105 px. Kale boyutları ve hedef izdüşümünün ters hesabı gerçekten test edilir; önceki boş kontrol tamamlandı.

## Doğrulama
- Claude'un paketinden alınan 34 test bu çalışma kopyasında geçti.
- Yeni rules6-koruma.cjs: tam sonuç hash'i 7ad6db2dce8152b49118e156d8ab72c1d9040996c9f1e2c40c4daeb70462b89e, yayımlı w ile karşılaştırılarak üretildi.
- Güncellenen surum-gecis: kayıtlı/kayıtsız rules 4, 5 ve 6 tekrarları.
- Güncellenen kamera-top: 150 kadrajda kale genişliği >=128 px, yüksekliği >=44 px ve köşe/merkez dokunma dönüşümü; yaklaşık gövde örtülmesi kontrolü.
- Sunucu işleyicisi sahte veritabanıyla sınandı. Gerçek kullanıcı vuruşu veya hakkı test için tüketilmez.
- Altı Canvas sahnesi (penaltı/uzak frikik, üç duruş) üretildi ve gözle incelendi.

## Sınırlar
Gerçek iPhone/Safari/parmak hissi test edilmedi. Yeni kameranın piksel bazlı tam top görünürlüğü ölçümü bu turda tekrarlanmadı; geometrik kontrol ve Canvas sahne incelemesi yapıldı. Küçük ekranlarda hedef yüksekliği hâlâ sınırlıdır. Kaleci rövanşı, Banko ve diğer yeni oyun fikirleri eklenmedi. 810 stratejilik genel denge taraması yeniden yapılmadı; rastgele gol tavanı eklenmedi. İstemcinin zamanlamayı bildirmesi mevcut güven sınırıdır.

## Yayın ve geri alma
Önce Edge (kurallar geriye dönük gösterim için korunur, yeni istek yalnız 7), hemen ardından Pages; istemci etiketi 20261005aa. Geri alma: w commit ve Edge 16. Yeni rules 7 kayıtlarındaki hak/puanları silmeyin; geri alırsanız yeni kayıtların gösterim sürümünü ayrıca koruyun.
