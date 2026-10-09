# Duran Top — 20261009a: Hedef ağı (3. aşama)

Esas: 20261006f. Kupa, sunucu, SQL, kural sürümü ve penaltı/frikik fiziği değişmez. Hedef ağı yalnız telefonda hesaplanır, sunucuya istek gitmez, puan tablosuna yazılmaz.

## Oyun
- Menüde yeni düğme: **Hedef ağı**. 5 vuruş: 11 m, 16 m, 16 m sağ açı, 16 m sol açı, 20 m.
- Kaleci ve baraj yok. Kale ağzına gerili ağda 14 delik: üstte 5, ortada 4, altta 5; köşe halkaları büyük (görseldeki yerleşim).
- Top bir deliğin içinden **tam** geçerse sayılır (merkeze uzaklık + top yarıçapı ≤ delik yarıçapı). Delikten geçen top arkadaki kale filesine düşer.
- Halkaya değen top dışarı itilerek seker; ağa çarpan hızlı top geri döner (hızla artan esneklik), 9 m/sn altı top enerjisini bırakıp ağın önüne düşer.
- Puan: üst sıra küçük delik 5, üst köşe 4, orta sıra 4, alt sıra küçük 3, alt köşe 2; yeşil bantta vuruş +1.
- Akış penaltı gibi: duruş → güç → deliğe dokun-sürükle-bırak → falso → zamanlama çubuğu.
- Kamera: hedef ağı için ayrı, daha yakın ve alçak.
- Vurulan delik beyaz parlar. Yeni sonuç başlıkları: DELİKTEN!, HALKAYA ÇARPTI, AĞDAN DÖNDÜ.

## Dosyalar
- Yeni `js/hedef.js` (delikler, uçuş + ağ teması, puan, çizim). Uçuş aynı enerji/falso/zamanlama fiziğini kullanır (`DT.ucus.energyLaunch`). Hedef vuruş hızı, yalnız istemcide frikik hızına eşitlenir.
- `js/oyun.js`: mod `hedef` için kendi pozisyon listesi, hesap ve puanlama; menü düğmesi; metinler.
- `js/cizim.js`: hedef kamerası; hedef modunda kaleci çizilmez; delikli ağ derinliğe göre topla sıralanır.
- `index.html`: düğme, `hedef.js`, etiketler 20261009a.

## Testler
- Yeni `hedef.cjs`: menüden 5 vuruşluk tam akış (sunucuya istek yok); 14 delik 5/4/5, kale içinde, çakışmasız; kenara değen top tam geçmez; 510 vuruşluk taramada delikten geçen top arkaya gider, ağa çarpan top ağın önünde kalır, hızlı topların %84'ü 1 m'den fazla geri döner, yavaş topların hepsi ağın önüne düşer, top zeminin altına inmez; kupa pozisyonları 10.
- Linux'ta 46/46 + e2e geçti. Sahne kareleri başsız çizimle incelendi.
- Denenmedi: gerçek telefon; delik boyutlarının telefonda zorluğu (gerçek parmakla nişan hatası taramada yok).
