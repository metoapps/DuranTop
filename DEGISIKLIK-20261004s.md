# Juninho Kupası — saha ölçeği ve hareket incelemesi (20261004s)

## Düzeltilen nedenler

Önceki şutçu `ekran yüksekliği × 0.55 / izdüşüm` ile ölçekleniyordu; kale 7.32 × 2.44 m, top yarıçapı 0.11 m olarak çiziliyordu. Bu farklı ölçekler karakteri küçülttü. Artık beş şutçu da 1.80 m boyunda, aynı metre koordinatları ve tek perspektif kamera ile çiziliyor. Topun piksel cinsinden yarıçap tavanı kaldırıldı. Kamera bütün sahneyi birlikte sığdırıyor; tek nesne küçültülmüyor ve dikey perspektif esnetilmiyor.

Yürüyüşün bacak dizisi hareket ederken şutçunun dünya konumu sabitti. Yeni yerleşim fonksiyonu sağ/sol seçimde gövdeyi 35 cm kaydırıyor; ters uçlar arasında 70 cm. Bitiş konumu bekleme sırasında korunuyor. Ayaklar dünya üzerinde sırayla sabitleniyor; gövde o destek ayağının üzerinden ilerliyor. Sabit uzunluklu bacak IK'si ve kol salınımı birlikte kullanılıyor.

Şutçu topun 1 m arkasında hazırlanır. Şut hazırlığı 1.15 saniyedir: önce topa yaklaşma adımları, ardından destek ayağını topun yanına basma, geri alma, temas ve takip hareketi. Gövde yaklaşma sonunda durur; destek ayağı vuruşta kaymaz. Başlangıç yönü seçilen duruştur, son vuruş yönü gerçek uçuşun ilk hızıdır. Bütün duruşlarda temas aynı top koordinatıdır.

Hedef açıklaması da yenilendi: beyaz nişan istenen noktadır; çizgi ve sarı halka kusursuz zamanlamadaki tahmindir. Falso, alt temas ve güç bu tahmini değiştirebilir. Sarı halka kale düzlemi geçişinde hesaplanır, tribün/net arkasındaki son örnek kullanılmaz.

## İnceleme ve kontroller

26 yerel test dosyası: aerodinamik, falso/iniş, topun tamamen çizgiyi geçmesi, bireysel baraj çarpışması, kaleci gözlem nedenselliği/kararı, sabit kol uzunluğu, kalkış, güç/isabet ve köşe bandı, yükleme, ses, kayıt/giriş/haftalık akış, yedi ekran izdüşümü ve yeni saha ölçeği testi.

Yeni test altı saha pozisyonunda 54 yön değişimini inceler: 1.80 m boy, gerçek gövde yer değiştirmesi, son konumun korunması, yere basan ayağın kaymaması ve üç duruşta aynı şut teması. Destek ayağı sayısal kayması 1e-15 m mertebesindedir (yuvarlama).

Yerel Canvas ile hazırlık, sağa adım ortası/sonu, yaklaşma ve temas kareleri ayrıca görüntülendi. Bu, gerçek Safari veya dokunmatik tarayıcı testi değildir.

## Devam eden sınırlar

- Kaleci dengesi kusursuz zamanlamada sert bir geçiş içeriyor: 50 tohumda penaltı orta 50 kurtarış, x=2.8/y=1 için 46 kurtarış ve 4 gol, x=3.2/y=1 için 50 gol. Bu turda sunucu fiziği değiştirilmedi. Yeni bir denge değişikliği istemci ve Edge birlikte sürümlenmelidir.
- 50 tohumda orta yüksek frikik 42 kurtarış/8 gol. Bu oran her hedef ve insan zamanlama hatası için geçerli değildir.
- Eklemli model hâlâ stilize, hazır insan hareket kaydı veya fotoğraftan taranmış bir insan modeli değil. Mevcut karakter yüz/saç/forma kaynakları kullanılıyor. Gol sevinçleri mevcut sprite dizileri.
- Gerçek iPhone FPS, Safari, iki gerçek cihaz, canlı Supabase RLS/JWT, ses kayıtları bu turda denenmedi.
- İstemci zamanlama ve temas girdisini bildirmeye devam ediyor; arkadaş yarışı için kullanılabilir, güçlü ödüllü yarışma güvenliği iddia edilmiyor.

## Yayın sınırı

Yalnızca görsel yerleşim, animasyon ve açıklama; skor, resmi haftalık on hak, SQL ve Edge fiziği aynı kaldı. Yeni görsel kaynak veya müzik eklenmedi. İleride kalite için insan hareket kaydıyla şut/koşu ve gerçek top temasına göre ağ deformasyonu öncelikli.
