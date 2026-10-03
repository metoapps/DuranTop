DURAN TOP - oynanış prototipi
=============================

Bu sürüm: tek telefonda oynanan penaltı ve frikik. Oda, çevrimiçi skor, Supabase ve Kupon bağlantısı YOK.
Skorlar yalnızca bu telefonun tarayıcısında saklanır.

NASIL DENERİM (GitHub Pages)
1. GitHub'da yeni bir depo aç (ör. duran-top). Bu klasördeki her şeyi (index.html, css, js, assets) deponun köküne yükle.
2. Depoda Settings > Pages > Branch: main, klasör: /(root) > Save.
3. Birkaç dakika sonra https://<kullanici-adin>.github.io/duran-top/ adresinde açılır. Telefondan aç.
   Not: Ücretsiz GitHub Pages deposu herkese açıktır; assets/sprites içindeki yüzler de herkese açık olur.
Not: Dosyayı doğrudan telefonda açarsan (dosya olarak) yazı tipi ve kayıt düzgün çalışmayabilir. Siteyi yayınla.

DOSYALAR
index.html          ekranlar
css/stil.css        görünüm
js/ayar.js          TÜM sayıların yeri: kaleci gücü, puanlar, hızlar, zamanlama bandı (oyun hissini buradan ayarla)
js/fizik.js         sonuç hesabı (saf fonksiyon, sonra sunucuya taşınacak)
js/kaleci.js        kaleci davranışı
js/puan.js          puan formülü
js/cizim.js         kamera ve çizim
js/oyun.js          akış, dokunmatik kontrol, yerel kayıt
js/ses.js           ses (dosyasız, ses KAPALI başlar)
js/veri.js          karakterler ve sprite verisi
assets/sprites/     30 şeffaf PNG (900x560, oyun içi): <ad>_bekle, _sevinc, _kacirma, _vurus1, _vurus2, _vurus3
assets/menu/        aynı karakterlerin boş kenarları kırpılmış hâli (menü, seçim ve tur sonu ekranları için)

KONTROL
Nişan: kaleye dokun, sürükle, bırak (nişan parmağın biraz üstünde görünür). Bırakınca kilitlenir, bir kez değiştirebilirsin.
Frikik: nişandan sonra Sola / Düz / Sağa falso seç. Kesikli çizgi falsolu yolu gösterir.
Zamanlama: çubuk gider gelir, yeşil bantta VUR'a bas. Erken basarsan top alçak ve yavaş, geç basarsan yukarı gider.
Ayarlardan zamanlama çubuğunu kapatabilirsin (şut çubuksuz eğlenceli mi diye test için).

PUAN
Penaltı golü 100, frikik golü 110. Zamanlama bandı +10, köşe ya da direkten giren gol +5. Bir vuruşta en fazla +15 bonus.
Gol olmayan vuruş 0 puan. Seri çarpanı yok. Tur tavanı 595.

RESMİ TUR KURALI (yerel)
Vuruş, VUR'a basıldığı anda sayılır. Sayfayı yenilemek sonucu değiştirmez: kaldığın vuruştan devam edilir.
Nişan kilitlenmiş ama vurulmamış bir vuruş yenilemede aynı nişan ve aynı kaleci davranışıyla geri gelir.
Bu yalnızca bu telefonda geçerli; gerçek doğrulama grup sürümünde sunucuda olacak.

BU SÜRÜMDE DÜZELTİLENLER (ChatGPT incelemesi sonrası)
- Direğe değen şutlarda da önce kaleci kontrol edilir. Kalecinin erişebildiği top artık "direkten gol" sayılmaz.
  Direkten gol ve direkten dönen toplar değdiği yüzeyden (yan direk ya da üst direk) sekerek devam eder.
- Vuran ayağın ucu (yatay ve dikey) topun kenarına oturur. Top yerde kalır, oyuncu topa göre kameraya biraz yakın durur.
- Menü, seçim ve tur sonu ekranları kırpılmış görselleri kullanır; şeffaf boş kenarlar yerleşimi büyütmez.
- Kamera ekran boyuna göre kurulur: top ve oyuncu alttaki kontrol panelinin üstünde kalır. Sonuç kartı alta alındı, kale görünür kalır.
Hâlâ denenmedi: gerçek telefonda dokunma hissi ve ekran taşmaları.

EKSİK GÖRSELLER (yer tutucu çiziliyor)
Kaleci, baraj oyuncuları ve top çizimle gösteriliyor. assets/top.png eklersen top görseli otomatik kullanılır.
Kaleci ve baraj için sprite dosyaları geldiğinde cizim.js'de ilgili çizim yerine bağlanır.

EĞLENCE TESTİ: BAKILACAKLAR
1. Köşeye doğru nişan alınca gol, ortaya alınca kurtarış oluyor mu? (js/ayar.js > kaleci)
2. Frikikte barajı aşmak için ne yapman gerektiğini ilk denemede anladın mı?
3. Zamanlama çubuğu eğlenceli mi, sinir bozucu mu? Kapalıyken oyun nasıl?
4. Kaçırınca nedenini ekrandaki cümleden anlıyor musun?
5. Beş vuruş "bir tur daha" dedirtiyor mu?
