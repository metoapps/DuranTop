# Juninho Kupası — 20261005ab

## Gol/aut tutarlılığı

Yeni vuruşlar `rules: 8` kullanır. Eski 4–7 sürümlerinin sonuçları ve uçuşları korunur; önceki puanlar yeniden hesaplanmaz. Haftalık oda ve veritabanı şeması değişmez.

- `fizik.js`: Topun tamamının çizgiyi geçmesi ve geçiş sırasında çizgiyle kesişen küre kesitinin kale açıklığında kalması kontrol edilir. Eski hesabın tam geçiş anında hâlâ tam top yarıçapını yatay/dikey sınırdan çıkarması, temiz çapraz geçişleri aut sayıyordu.
- Dört gerçek uçuş girdisi tekrarlandı: hedef x=3,3/3,4/3,5 ve −3,3 m; yan temas −0,204/−0,124/−0,044 ve +0,204; %100 güç, kusursuz zamanlama. Kaleci bağımsız geometri deneyinde direğe çarpmayan bu dört eski aut, yeni hesapta gol.
- Yan, üst ve arka file iki yüzlü çarpışır. İçeriden vuruş topu ağ içinde tutar; dışarıdan temasta top dışarıda seker. Çarpışma enerji kaybettirir. Kale ağının önü açıktır.
- Gol çizgisinde yapay olarak %70 yavaşlatma kaldırıldı. Yeni şut gerçek hızla fileye ulaşır; hız kaybı file temasında oluşur. File sesi bu temasın zamanında çalınır.
- `cizim.js`: Arka, sol, sağ ve üst ağ ayrı önbellek katmanlarıdır. Kameranın ve topun yüzeye göre konumu, topun ağın önünde/arkasında çizilmesini belirler. Kale arkasındaki aut topu artık arka ağın üzerine çizilmez.
- `oyun.js`: Sunucu sonucu ile yerel çizim hesabı farklıysa yanıltıcı animasyon gösterilmez; sürüm yenileme mesajı çıkar. Kaydedilmiş şut ikinci kez tüketilmez.

## Kontroller

- `gol-file.cjs`: önceki rules 7'nin 100 tam çıktısının SHA-256 özeti birebir; dört gerçek yanlış aut; her iki direğe yakın çapraz küre geçişi; kısmi çizgi geçişinin gol olmaması; açıklık dışının aut olması; iç/dış üst/yan/arka filede enerji azalması.
- `file-derinlik.cjs`: gerçek Canvas çizim çağrılarında içeride, arkada ve üstte topun ağ katmanlarına göre sırası; önbellek kullanımı. Üç sahnenin görüntüsü yerelde incelendi.
- `kimlik-haftalik.cjs`: gerçek Edge işleyicisi, sahte veritabanı ile on kayıtlı girdide istemci/sunucu sonuç ve puan eşitliği; başka karakterle vuruş reddi; on hak; eski sürüm reddinde hak korunması; kaydedilmiş eski isteğin tekrarında mevcut sonucun dönmesi.
- Eski rules 4/5/6 tekrar oynatma kontrolleri korunur.

Gerçek iPhone/Safari, gerçek parmak ve iki gerçek cihazla deneme yapılmadı. Canlı haftalık vuruş hakları test amacıyla kullanılmadı. Gerçek veritabanına şut yazılmadı. Bu inceleme genel kaleci dengesi taraması değildir.

## Yayın

Önce Edge `duran-top-live`, ardından site. Yeni SQL yok. İstemci önbellek etiketi `20261005ab`. Eski site yeni bir vuruş gönderirse sunucu hakkı tüketmeden `CLIENT_VERSION` verir. Kaydedilmiş tekrar istekleri aynı kaydı döndürür.
