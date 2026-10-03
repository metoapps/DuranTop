# Duran Top — Kaptanlık Kupası

Mobil tarayıcıda METO, LORT, FERO, LATTE ve JOSH için 3 penaltı + 2 frikik.

## Oynanış
1. Kaleye dokunarak hedefi seç ve bırak.
2. Top üzerinde temas noktası seç: merkez temiz şut, alt daha yüksek yay, yanlar falso. Temas, son hedefi değiştirebilir; frikikte alttan temas barajı aşmayı sağlar.
3. Zamanlamaya geç ve VUR'a bas. Resmi turda zamanlama zorunlu; antrenmanda kapatılabilir. Yeşil bant dar bırakıldı.

## Fizik ve kaleci
Metre ve saniye kullanılır. Yerçekimi 9.81 m/s²; top kütlesi 0.43 kg, yarıçap 0.11 m, hava yoğunluğu 1.20 kg/m³. Temel yatay şut hızı penaltıda 25, frikikte 24 m/s.

`js/ucus.js` topun üç boyutlu uçuşunu 1/120 saniyelik RK4 adımlarıyla çözer:
- Sürükleme: Fd = −½ ρ A Cd |v| v, Cd=0.25.
- Magnus: Fl = ½ ρ A Cl |v|², yönü ω × v. Spin parametresi S=R|ω×v|/|v|²; Cl=min(0.35,0.9S). Spin saniyede exp(−0.12t) ile azalır.
- Temas yarıçapı, şut yönüne dik düzlemde seçilir. Temas açısal itkisi L=η(r×mv); ince kabuk yaklaşımı I=2mR²/3 ile ω=L/I. Aktarım η=0.23(0.55+0.45q). Merkez temas sıfır tork verir; yan temas sağ/sol falso, alt/üst temas geri/üst spin üretir.
- Zamanlama hatası h=zaman−0.5; q=exp(−(h/0.18)²). İleri hız çarpanı (0.60+0.40q)√(1−0.35(temasX²+temasY²)). Kötü zamanlama hız, temas açısı ve spin aktarımını azaltır. Fazla kenar temas daha fazla spin, daha az ileri enerji verir.
- Temiz merkez vuruşunun çıkış yönü hava direnciyle hedefe ulaşacak şekilde çözülür. Falso uygulandıktan sonra tekrar hedefe ayarlanmaz; dönüş gerçek bitiş yerini değiştirir.
- Kale düzlemi geçişi kesirli adımla bulunur. Yerde sekme katsayısı 0.35 kullanılır. Yer sürtünmesi ve sekme yaklaşık modellenir.

Kuvvet yönleri ve spin parametresi: Goff & Carré, 2012, *Investigations into soccer aerodynamics via trajectory analysis and dust experiments*, https://eprints.whiterose.ac.uk/id/eprint/98035/1/1-s2.0-S1877705812016414-main.pdf . NASA Glenn'in sürükleme katsayısı varsayımı: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-on-a-soccer-ball/ . Falso ilkeleri: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bending-a-soccer-ball/ .

Bu model temel aerodinamik kuvvetleri kullanır. Cl eğrisi, temas aktarımı, spin sönümü ve sekme oyun için kalibre edilmiş yaklaşık parametrelerdir; belirli bir top/ayakkabı için deneysel doğrulama yapılmadı. Değişken Reynolds sayısında sürükleme krizi, ters Magnus, panel yönüne bağlı knuckleball ve ayak biyomekaniği modellenmez. Profesyonel ölçüm simülatörü değildir.

Kaleci, baraj, direk ve gol aynı uçuş yolunu kullanır. Kalecinin erişimi tepki ve hareket süresinden hesaplanır; ayrıca rastgele kurtarış yüzdesi yoktur. Çarpışma alanları stilize görsel uzanımının yaklaşık geometrisidir. Beyaz önizleme kusursuz zamanlamanın uçuşudur; gerçek basış sonucu değiştirebilir. Önizleme iki modda da görünür. Şutçu üç kare; kaleci altı poz. Sağ dalış için yalnız kaleci aynalanır. Kaleci ve menü WebP optimizasyonları korunur.

## Beş arkadaşın kupası
Ev sahibi altı haneli ortak kodu paylaşır. Herkes aynı kodla aynı beş pozisyonu ve aynı rastgele tohumları oynar. Kişi başı bir resmi tur; antrenman sınırsız. Tur bitince “Sonuç kodunu paylaş”; ev sahibi diğer dört kodu “Arkadaşın sonuç kodunu ekle” ile tabloya ekler.
Sıralama: puan, yeşil isabet sayısı, gol sayısı. Tam eşitlikte ortak kaptan. Beş sonuç tamamlanınca kaptan açıklanır. “Yeni kupa oluştur” bir sonraki kupa için yeni kod verir. Sonuncu rövanş kupasını açsın; günlük veya haftalık rövanşla kaptanlık el değiştirsin.

Tablo bu telefonda localStorage'da saklanır; canlı sunucu odası veya kimlik doğrulaması yoktur. Sonuç kodları doğrulanmış yarışma kanıtı değildir. Depoyu temizleme, farklı cihaz veya değiştirilmiş istemci tekrar oynamayı mümkün kılar. Kupon ödülü/gerçek değer aktarımı bağlı değildir. Yeni aerodinamik sürüm skorları `dt6_*` alanında, sonuç kodları `DT6-` biçiminde v=1 ile tutulur. Eski kayıtlar silinmez; farklı fizik sürümlerinin puanları karıştırılmaz. Yeni sürümle yeni kupa açın.

## Kontroller
`node tests/oynanis.cjs`: 540 deterministik yol, 600 merkez kurtarışı, temas/falso/baraj, zamanlama-hız-kurtarış ilişkisi.
`node tests/akis.cjs`: DOM taklidiyle hedef→temas→zamanlama, beş vuruşluk resmi akış, tek kayıt, resmi çubuk zorunluluğu, tamamlanan oyuncu kilidi.
`node tests/cizim.cjs`: @napi-rs/canvas ile 320×568, 390×844 ve 430×932; izdüşüm ve altı kaleci pozunun çizimi.
Gerçek iPhone Safari ve gerçek parmakla doğrulanmadı. Chromium kurulumu bu ortamda başarısız olduğundan gerçek tarayıcı testi yapılmadı.

## Açılış yükleme iyileştirmesi (20261003g)
Açılış artık 30 oyun sprite'ı + 15 menü pozu + kaleci (46 zorunlu görsel) beklemez. Beş menü portresi ve kaleci WebP olarak yüklenir: toplam 307266 bayt. PNG kaynakları korunur. Seçilen karakterin altı oyun pozu karakter seçimi sırasında yüklenir; dört yeni sevinç pozu ardından yüklenir ve oyunu engellemez. Seçilmeyen karakterlerin sprite'ları indirilmez. Menü görsellerinin farklı sorgu parametreleriyle çift indirilmesi kaldırıldı. Google font CSS'i başlangıç scriptlerini engellemeden yüklenir. `node tests/yukleme.cjs` başlangıç istek sayısını, seçili karakter kapısını, istek birleştirmeyi ve isteğe bağlı sevinç yüklemesini doğrular. Gerçek mobil ağda süre ölçülmedi.


## Aerodinamik kontrolleri
`node tests/aerodinamik.cjs`: merkezde sıfır tork, sağ/sol simetri, kenara yaklaştıkça artan kıvrım, mesafe etkisi, yükselme/bastırma, zamanlama-spin ilişkisi, Magnus kuvvetinin hıza dikliği, drag enerji kaybı ve 1/120–1/240 adım yakınsaması. Tam güçlü yan temas ve yeşil zamanlama ile nişan (0,1.1) için kalede yana sapma: penaltı yaklaşık 0.89 m, 22 m frikik yaklaşık 4.53 m. Bunlar simülasyon çıktısıdır, deneysel ölçüm değildir. `tests/akis.cjs` DT6 sonuç importunu, çift oyuncu engelini, sürüm reddini ve yeni kupa oluşturmayı da kontrol eder.

## Canlı kupa ve geniş ekran (20261003i)
Bu sürümde sonuç kodu kopyalama/ekleme kaldırıldı. `js/canli.js` ortak bir sunucu odasına bağlanır; “Tur linkini paylaş” oda UUID'sini linke ekler. Arkadaşlar kendi karakterlerini seçer; ilk seçen o karakteri bu tarayıcıda alır. Resmi vuruşların sonucu `duran-top-live` Edge Function içinde aynı fizik dosyalarıyla hesaplanır. Toplam tablo görünür sekmelerde yaklaşık 3–5 saniyede bir otomatik yenilenir. Antrenman yerel ve sınırsızdır. Yarım tur, aynı tarayıcıda sunucudaki vuruş numarası ve sonuçlarla devam eder. Her kupa 7 gün geçerlidir.

Sunucu: mevcut KUPON Supabase projesinde yalnız `dt_live_rooms` ve `dt_live_players` tabloları ile `dt_live_save_shot` servis RPC'si. Kupon verisine veya ödüllerine bağlı değildir. Tablolar RLS açık, anon/authenticated erişimi kapalıdır; servis anahtarı sadece sunucu ortamında kullanılır. Misafir yetkisi 256-bit tarayıcı anahtarıyla doğrulanır; veritabanında sadece SHA-256 özeti tutulur. Davet linki odayı okumayı sağlar. Bir tarayıcı/oda bir karakter; telefon ile laptop farklı misafir oturumlarıdır. Hesap girişi ve cihazlar arası kimlik taşıma bu sürümde yoktur. Zamanlama girdisi istemciden gelir; sunucu puanı yeniden hesaplar ama zamanlama becerisinin hilesiz olduğuna dair kanıt üretmez. Gerçek ödül entegrasyonu yoktur.

Bağlantı hatasında vuruşun ilk nişanı, teması ve zamanlaması yerelde bekletilir; tekrar bağlantı aynı girdiyi gönderir. RPC satır kilidi ve sıra kontrolüyle tekrar/yarış durumunda aynı vuruş ikinci kez eklenmez. Sunucu sonucu almadan resmi animasyon başlamaz. Sekme kapanınca sunucudaki kabul edilmiş sonuç kaybolmaz.

Masaüstünde menü iki sütun, seçim beş sütun; oyun sahnesi tüm ekranı kullanır. Geniş ekran kamerası kalenin en/boy oranını korur; kontroller sağa yerleşir. Dikey telefonda kontroller altta; yatay kısa ekranda sağ taraftadır. DPR 3'e kadar desteklenir. Test edilen çizim boyutları: 320×568, 390×844, 430×932, 844×390, 1366×768, 1920×1080, 2560×1440. Gerçek Safari ve tarayıcı CSS görüntüsü bu ortamda doğrulanmadı.

`backend/schema.sql` kurulan DDL'nin tekrar çalıştırılabilir kaynağıdır. `backend/index.ts`, `backend/deno.json` ve `js/{ayar,kaleci,ucus,fizik,puan}.js` Edge Function dağıtım kaynaklarıdır. Fonksiyon JWT geçidi yerine kendi misafir yetki kontrolünü kullandığı için verify_jwt=false; yazma işlemleri karakterin token özetiyle doğrulanır. Güvenlik danışmanında yalnız servis kullanımına kapalı tablolar için [RLS Enabled No Policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) bilgi bildirimi beklenir; RLS veya anonim yetki gevşetilmez.

Kontroller: `tests/canli.cjs` davet, misafir token, çevrimdışı tekrarın aynı zamanlamayı koruması ve ortak skor; `tests/akis.cjs` beş vuruşluk asenkron resmi akış; `tests/cizim.cjs` yedi ekran boyutu. Gerçek Edge Function üzerinde iki istemciyle karakter çakışması, başka oyuncu adına vuruş reddi, eşzamanlı tekrar, beş vuruşlu tur, altıncı vuruş reddi ve ikinci istemcinin güncel sonuçları okuması doğrulandı.
