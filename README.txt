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

3 Ekim 2026 oynanış güncellemesi
- Dokunulan nokta doğrudan hedef olur; 70 piksel parmak ofseti kaldırıldı.
- Yeşil zamanlama bandı %7, tek yön çubuk süresi 0.8 saniye.
- VUR dokunmanın başlangıcında ölçülür, bırakma gecikmesi eklenmez.
- Penaltı 25, frikik 27 m/s; falso uçuşta kademeli oluşur.
- Üç mevcut vuruş karesi harmanlanır, ağırlık aktarımı ve yön çevirme uygulanır.
  Bu henüz gerçek 3D eklem animasyonu değildir.
- Kalecinin okuması/tepkisi güçlendirildi. Yeni yeşil formalı kaleci sprite'ı eklendi.
- Menü karakterlerinin görünen yüksekliği eşitlendi.
- METO zıplama, LORT sağ-sol dans, FERO güçlü sıçrama, LATTE salınım,
  JOSH dönüş sevinci yapar; bunlar mevcut sevinç görselinin hareketleridir.

Yeni asset: assets/kaleci-v2.png
Yerleşik görüntü üretimiyle oluşturuldu. İstem özeti: Neuer'i andıran kısa sarı
saçlı, yeşil formalı kaleci; hazır, sola dalış ve sağa dalış; şeffaf sprite sayfası.
Kontrol: üç ekran boyutunda Canvas çizimi, 135 nişan izdüşüm tersleme kontrolü,
3000 deterministik şut. Gerçek mobil tarayıcı/dokunmatik test yapılmadı.

İnceleme sonrası düzeltmeler (20261003d)
- Hayalet gövde üreten alfa harmanlama kaldırıldı. Tek opak vuruş pozu ve
  sürekli yaklaşma/ağırlık aktarımı kullanılıyor. Beş temas ayağı yeniden ölçüldü.
- Kaleci çizimi ve kurtarış, aynı PNG'den ölçülmüş 64 silüet bandını kullanıyor.
  El ve vücut teması top yarıçapı dahil kontrol ediliyor. Kaleci artık kale
  çizgisinde çiziliyor. Yaklaşım hâlâ 2D silüet; tam hacim fiziği değil.
- Frikik hızı 24 m/s. Her iki tarafta merkez 2.2 m hedefte baraj üstü gol yolu var.
- Resmi turda zamanlama her zaman açık; kapatma yalnızca antrenmanı etkiliyor.
  Yeşil bant %7 olarak korundu; gerçek telefon denemesi bekleniyor.
- 320x568 kamerada kale yaklaşık 103 px yüksekliğinde. Ön plandaki karakter
  kompakt ekrana göre küçültülüyor. Menü ve seçim gerektiğinde kaydırılabiliyor.
- Tüm gerekli oyun/menü görselleri yüklenene kadar yükleme ekranı gösteriliyor;
  hata olursa yenileme mesajı çıkıyor. Görsel URL'leri de sürümlendi.
- Eksik top.png isteği kaldırıldı; top Canvas ile çiziliyor.
- Kontroller: node tests/oynanis.cjs; üç Canvas ekran boyutu ve beş karakterin
  hazırlık/temas/devam görüntüsü; 135 nişan tersleme kontrolü; girdi akışı kontrolü.
  Gerçek iPhone Safari testi yapılmadı. Sevinçler mevcut görsellerin hareketleri;
  yeni eklemli sevinç animasyonları üretilmedi.


4 Ekim 2026 kaleci ve animasyon düzeltmesi (kaynak: 4fd48da üzerine)
- Kaleci modeli baştan yazıldı (js/kaleci.js). Eski model yalnızca kale çizgisinde, görselin piksel şeritlerine bakıyordu.
  Yeni model: topun gideceği yeri okur, bir EYLEM seçer (tutuş, alçak blok, zıplama, yan adım, alçak/orta/yüksek dalış),
  gövdesini topu kendi maskesinin ortasına alacak yere, zamanında yetişebileceği kadar kaydırır. Erişim "kaleci gücü" sayısından
  değil, hareket süresinden çıkar (mesafe / hız).
- Kurtarış maskesi çizilen görselden üretilir (tools/kaleci_maske.py -> js/kaleci_maske.js): bacak arası ve kol altı boşlukları kapalı,
  top yarıçapı eklenmiş. Çizim ve çarpışma aynı pozu ve aynı ölçeği kullanır; dikey kamera germesi de hesaba katıldı.
- Merkeze gelen şutta yan dalış pozu yok; kaleci yerinde tutar, bloklar ya da zıplar. Çok az durumda kısa yan adım atar.
- Antrenmandaki kaleci artık "heykel" değil: tepki gecikmesi 0,20 s'den 0,08 s'ye indi ve dalış hızı resmi turdakinin %90'ı.
- Frikikte kaleci barajın görüşü kapattığı için topu geç görür (tepki 0,55 s): köşeler ödüllendirilir, ortası kurtarılır.
- Şutçu: nişana göre dönme/ayna kaldırıldı. Duruş sabit; top yalnızca temas karesinde çıkar. Kare dizisi veri.js'de tanımlı:
  yeni kareler (yaklas1, yaklas2, temas, dengeye) eklenirse otomatik uzun dizi oynar, yoksa 3 karelik yedek dizi.
- Gol sevinçleri: karaktere özel dizi (assets/sprites/<ad>_sev1..sev6.png) varsa oynar; yoksa durağan kare (sallama kaldırıldı).
- Kaleci için yeni kareler assets/kaleci/<poz>.png (1200x800, gövde merkezi 600,400, 324 px = 1 m). Gelince:
  python3 tools/manifest.py && python3 tools/kaleci_maske.py
- İsteğe bağlı kareler assets/manifest.json ile yüklenir; olmayan dosya için 404 isteği atılmaz.
- Testler: node tests/oynanis.cjs (197 kontrol).
Gerçek telefonda denenmedi.

ChatGPT kontrolü / yayın 20261003e
- Claude paketindeki 197 kontrol yeniden çalıştırıldı, geçti.
- Tutulan topun temas noktasından ele geçişindeki anlık sıçrama giderildi.
- Vuruş dizisi vuruş başında sabitleniyor; geç yüklenen opsiyonel kareler
  devam eden vuruşun temas zamanını değiştiremiyor.
- Yeni yaklaşma/temas, kaleci eylem ve karaktere özel sevinç PNG'leri
  bu pakette henüz bulunmuyor; manifest boş. Mevcut kareler yedek olarak kullanılır.
- Yeni fizik incelemesi yapıldı; gerçek iPhone/Safari kontrolü yapılmadı.
