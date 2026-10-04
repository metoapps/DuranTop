# Duran Top — Juninho Kupası

METO, LORT, FERO, LATTE ve JOSH için mobil, tablet ve masaüstü duran top oyunu.

## Özel oyuncu girişi ve haftalık yarışma
Her karakterin ayrı özel giriş kodu var. Kodlar kaynak kodda tutulmaz; sunucuda tuzlu PBKDF2-SHA256 özeti bulunur. Giriş 90 günlük bir oturum verir. Sunucu her katılımda ve vuruşta kimliği doğrular; başka karakter adına işlem reddedilir. Kodunu bilen kişi o kimliğe giriş yapabilir; kodunu yalnız sahibine özel iletin. Ortak bilgisayarda çıkış yapın.

Her İstanbul takvim haftası, pazartesi 00.00'dan sonraki pazartesi 00.00'a kadar, beş kişinin paylaşacağı tek resmi kupa açılır. Kişi başına 10 vuruş: 5 penaltı (11 m), 2 yakın frikik (18 m), 3 uzak frikik (28 m). İkinci cihaz, sayfa yenileme veya kupa açma hakkı sıfırlamaz. Antrenman sınırsızdır ve resmi gol tablolarına yazılmaz.

Haftalık sıralama gol sayısı, ardından puanla belirlenir; ikisi de eşitse ortak sıra ve şampiyonluk verilir. Ayrıca tüm haftaların toplam gol tablosu gösterilir. Tablo görünür sekmede yaklaşık beş saniyede bir güncellenir. Oda linki giriş kodunu veya oturumu içermez. Eski beş vuruşluk kupalar korunur, yeni haftalık lige katılmaz.

## Oynanış
Saha ve oyuncu → yaklaşma yönü → kırmızı güç çubuğu → kale hedefi → topun temas noktası → yeşil zamanlama. Resmi turda zamanlama zorunludur; köşelerde yeşil bant daralır. Yön değişiminde formayı koruyan bacak hareketi, şutta dokulu karakter, kalecide eklemli hareket kullanılır. Bunlar stilize animasyonlardır; gerçek insan hareket yakalaması değildir. Müzik yok; efekt sesleri isteğe bağlıdır.

## Fizik
`js/ucus.js` yerçekimi, sürükleme ve Magnus kuvvetiyle üç boyutlu yolu RK4 adımlarıyla hesaplar. Yan temas spin; alt/üst temas yükselme veya bastırma verir. Güç ve zamanlama çıkış hızını, temas doğruluğunu ve spin aktarımını etkiler. Top, baraj, direk, kaleci ve gol aynı yolu kullanır; gol için topun tamamı çizgiyi geçmelidir. Kısa kalan top gol değildir. Kaleci yalnız gözlem anına kadar oluşmuş yolu okur, tepki süresinden sonra hareket eder; iniş ve toparlanma ayrı evrelerdir. Duvar oyuncuları farklı boy ve çarpışma kapsüllerine sahiptir.

Aerodinamik katsayılar, ayak itkisi, zemin sekmesi ve kaleci parametreleri oyun için kalibre edilmiş yaklaşık değerlerdir; deneysel futbol simülatörü değildir. Resmi kupada aynı oda ve aynı vuruş için ortak gizli HMAC tohumu kullanılır. Aynı girdiler beş oyuncuya aynı sonucu verir. Rakibin ham nişan/temas/zamanlama/tohum girdisi gönderilmez. İstemci beceri girdilerini kendisi bildirir; bu sürüm ödüllü ciddi yarışmada hilesiz zamanlama kanıtı sunmaz.

## Sunucu ve yayın
Supabase `duran-top-live` Edge Function kimlik ve puanı doğrular; RLS açık özel tablolar yalnız service_role ile erişilir. Servis anahtarı, giriş kodları ve parola özetleri siteye eklenmez. `backend/kimlik-hafta.sql` mevcut kurulum için kimlik/hafta göçüdür; `backend/schema.sql` tüm şemadır. Önce SQL, sonra Edge Function, sonra site yayınlanır. Oda sürümü 8, site 20261004j.

Edge kaynakları: `backend/index.ts`, `backend/guvenlik.mjs`, `backend/kimlik.mjs`, `backend/deno.json`; `js/ayar.js`, `model3d.js`, `baraj.js`, `kaleci.js`, `ucus.js`, `fizik.js`, `puan.js`. JWT geçidi kapalıdır çünkü fonksiyon kendi özel oturum doğrulamasını uygular. Giriş denemeleri atomik 15 dakikalık bütçeye tabidir. Vuruş kaydı satır kilidiyle idempotenttir; bağlantı hatasındaki tekrar aynı ilk girdileri korur.

## Kontroller
`node tests/kimlik-haftalik.cjs`: gerçek Edge işleyicisi ve sahte veri katmanında özel giriş, başkasının karakterine ret, 10 vuruş sınırı, cihaz değişimi, tekrar, ortak hafta, gol toplamları, çıkış, giriş sınırı ve pazartesi geçişi.

`node tests/akis.cjs`, `node tests/canli.cjs`: arayüz akışı, oturum, çevrimdışı tekrar ve on vuruşluk resmi tur.

`node tests/oynanis.cjs`, `node tests/aerodinamik.cjs`, `node tests/cizgi-baraj.cjs`, `node tests/inis-falso.cjs`: deterministik fizik, spin, gol çizgisi, baraj, iniş ve eski 22 m kalibrasyonu. `tests/cizim.cjs` yedi ekran boyutunda tuval çizimini kontrol eder. Diğer `tests/*.cjs` kaleci, güç, yürüyüş, yükleme ve sesi denetler.

Gerçek iPhone/Safari, dokunma hissi ve tarayıcı DOM yerleşimi bu sürümde burada denenmedi. Gerçek Supabase dağıtımı ayrıca canlı API üzerinden doğrulanır; sahte veri katmanı testi gerçek veritabanı testi olarak sunulmaz.

## Güç ve isabet (20261004j)
Güç hedef seçiminden önce kilitlenir. Güç arttıkça yeşil bant kademeli daralır; hassas üst/alt köşelerde ek daralma korunur. Görünen bant ve sunucu aynı fonksiyonu kullanır. Zamanlama hatası yüksek güçte daha fazla yön/yükseklik sapması ve kalite kaybı getirir. Tam merkez zamanlamada ek rastgele hata yoktur. Kontrollü %55 ve üzeri şutlar, seçilen hızda hedef için gereken çıkış açısını çözer; güç azaltmak tek başına otomatik isabetsizlik değildir. Çok zayıf şutlar kısa kalabilir.

Yeni resmi girdiler `rules:2` taşır. Eski kaydedilmiş sonuçlar ve puanlar korunur; eski girdi canlandırması eski güç/zamanlama hesabını kullanır. Eski açık sekmeler yeni vuruş göndermeden yenilenmelidir. Özel kimlikler ve haftalık haklar değişmez. Forma numaraları METO 10, LORT 28, FERO 35, LATTE 60, JOSH 31; numaralar önbellekli tuval dokusuna çizilir ve yürüyüş/şut dönüşümünü takip eder. Kaynak yüz ve saç görselleri değiştirilmez.

`tests/guc-isabet.cjs` güç/zamanlama/bant/çıkış açısını; `tests/formalar.cjs` 15 vuruş dokusunda doğru numarayı, önbelleği, yüzün korunmasını ve baskının forma içinde kalmasını doğrular.

## Hacimli kale (20261004k)
Kalenin yan, tavan ve arka ağları dünya koordinatlarıyla ayrı yüzeyler olarak çizilir. Arka destek boruları, taban bağlantıları, iplerde hafif sarkma ve zemine oturan gölge eklendi. Ön direkler yuvarlak uçlu, silindir hissi veren ışık/gölge geçişleriyle çizilir. Kale ağzında ağ düzlemi yoktur. File gerisi mevcut fizik sınırıyla aynı 1.5 m derinliktedir; vuruş hesabı ve hedef koordinatları değişmez. Sabit arka kale çizimi yalnız kale bölgesinin yüksek çözünürlüklü tuvalinde önbelleğe alınır; ekran/pozisyon değişiminde yeniden kurulur.

Yedi ekran boyutunda tuval çizimi, oyun akışı, görsel yükleme ve forma kontrolleri yapıldı. Gerçek iPhone/Safari ve düşük güçlü cihazda hız ölçümü yapılmadı.
