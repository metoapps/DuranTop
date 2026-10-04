# Juninho Kupası — temas, falso, uçuş ve perspektif incelemesi

Sürüm: 20261004t · Tarih: 4 Ekim 2026 · Yeni fizik: rules 5.

## Sonuç ve kapsam

Topun oyuncunun gövdesinin içinden görünmesine neden olan çizim sırası düzeltildi. Yeni vuruş hesabı, nişan noktasına ulaşabilmek için ek hız üreten eski çözümün yerine sınırlı enerjiyle çalışan bir model kullanıyor. Güç, temas noktası, zamanlama, dönme, yerçekimi, hava direnci, zemin teması, baraj, kaleci ve direk sonucu aynı örneklenmiş top yoluna bağlı.

Bu bir futbol mini oyunu için fizik tabanlı modeldir. EA'nın kapalı kaynak FC motorunun kopyası, oyuncuların gerçek hareket taraması veya her futbol topu ve saha için deneysel olarak doğrulanmış bir simülatör değildir. Kullanılan fizik yasaları ile oyun için seçilen katsayılar aşağıda ayrılıyor.

## 1. Bulunan kök nedenler

1. **Top, futbolcudan sonra çiziliyordu.** Ekran konumu gövdenin arkasında olsa bile son çizilen nesne görünüyordu. Artık yakındaki top, oyuncunun üçgenlerinin kamera derinliği sırasında çiziliyor. Bekleme çizimindeki önbellek için de topun önündeki gövde yüzeyleri ayrı maske olarak uygulanıyor. Uçuşta oyuncudan uzaklaşan top, kale ve kaleciyle sahnenin normal derinlik sırasına dönüyor. Gölge zeminde kalıyor.
2. **Nişan çözümü hız sınırını korumuyordu.** Eski çözüm hedefe varmak için hız vektörünün bileşenlerini büyütebiliyordu. 28 m, merkezi temas, %60 güç örneğinde gerçek çıkış hızı 19,81 m/s iken yeni sınır 14,40 m/s. Bu yüzden eski güç seçiminin anlamı değişiyordu.
3. **Dönme aynı bütçeden karşılanmıyordu.** İlerleme hızı hesaplandıktan sonra dönüş ekleniyordu. Yeni modelde ilerleme ve dönme enerjisi birlikte hesaplanıyor; kenardan vuruşun hız bedeli var.
4. **Direkten gol bir konum sınıflandırmasıydı.** Direğe yakın ama iç tarafta biten şut, sekmenin gerçekten çizgiyi geçip geçmediği hesaplanmadan gol sayılabiliyordu. Yeni model önce silindirle temas, sonra yansıyan top yolu ve tam çizgi geçişini hesaplıyor.
5. **Kaleci hareketinin başlangıcı gerçek varış süresine bağlıydı.** Yeni kurallarda kendi gözlemindeki hızdan varış zamanını tahmin ediyor. Sonradan oluşacak falsoyu veya gerçek varış süresini önceden bilmiyor.
6. **Zemin, dönüş ile ilerleme arasındaki kaymayı dikkate almıyordu.** Yeni kurallarda temas noktasının zemine göre kayma hızı üzerinden sınırlı sürtünme darbesi uygulanıyor.

## 2. FC 25 ve FC 26'dan alınan tasarım ilkeleri

EA'nın resmi FC 25 açıklaması şut isabetini durum, açı, oyuncu özellikleri ve şut türüyle ilişkilendiriyor; devam hareketinin açı ve güçle uyumuna da değiniyor. Bizim oyunda seçilen hedef, temas tekniği ve gerçek ilk hız yönü arasında aynı türden bir tutarlılık hedefleniyor. Ancak bu belgeler temasın sayısal çözümünü veya aerodinamik katsayıları yayınlamıyor.

FC 26, Timed Finishing'i kaldırıyor. Bu nedenle yeşil ibreye “FC 26'nın kullandığı fizik” demek doğru olmaz. Biz ibreyi grubun istediği ek beceri unsuru olarak koruyoruz: temas kalitesini ve açısal hatayı etkiliyor. Golü doğrudan garantilemiyor. FC 26'nın hassas nişan, güç, şut türü ve okunabilir sonuç vurgusu tasarım referansıdır.

FC 26'nın Competitive ve Authentic ayrımı da önemli: arkadaşlar arası kısa oyunda gerçek fizik ile anlaşılır geri bildirim birlikte gerekir. Her başarısızlık rastgele kaleci zarıyla açıklanmamalı; kısa kalan top, baraj teması, üstten aut ve kurtarış sahnede görülebilmeli.

## 3. Bir temas noktası gerçek hayatta neyi belirler?

**Yalnızca topun üzerindeki işaret ve güç, gerçek bir şutu tek başına belirlemeye yetmez.** Ayağın geliş yönü, hız vektörü, ayak yüzeyi, topun deformasyonu, sürtünme, topun yerde olup olmaması ve destek ayağı da gerekir. Aynı noktadan farklı ayak hareketleri farklı şut üretebilir.

Asai ve arkadaşlarının çarpışma çalışması, temasın merkezden uzaklaşmasının dönmeyi güçlü biçimde etkilediğini ve hız/dönüş arasında ödünleşim bulunduğunu gösteriyor. Deformasyon nedeniyle dönme, basit bir sürtünme açıklamasından daha karmaşıktır. Bu yüzden aşağıdaki aktarım katsayısı bir deneysel evrensel sabit olarak sunulmuyor.

Oyundaki açık varsayım: temiz orta temas için oyuncu, seçilen hedefe uygun alçak uçuş açısıyla ayağını getirir. Yan temas, bu darbeye tork ekler. Alt temas seçiminde oyuncu ayağını topun altına sokan bir teknik uygular; bu yüzden darbe açısı da yukarı döner. Üst temas, daha aşağı çıkış ve ileri dönüş tekniğini temsil eder.

| Temas seçimi | İlk çıkış ve dönme | Beklenen sonuç |
|---|---|---|
| Merkez | Yaklaşık sıfır tork; seçilen güçte temiz şut | Ulaşılabilir hedefe yakın varış |
| Sağ kenar | Dikey eksende, sola kıvıran dönme | Başlangıç yönünden giderek sola ayrılan yol |
| Sol kenar | Sağ kenarın ayna simetriği | Sağa kıvrılan yol |
| Alt | Yukarı çıkış açısı ve geri dönüş | Daha yüksek uçuş; fazla alt temas ve güçlü vuruşta üstten aut |
| Üst | Daha düşük çıkış açısı ve ileri dönüş | Aşağı inen/alçak şut; baraja veya zemine daha erken temas |
| Alt-sağ / alt-sol | Eğik dönme ekseni | Yükselme ve yan kıvrımın birlikte oluşması |
| Aşırı kenar | Daha fazla dönme, daha düşük ileri hız | Büyük falso; hedef dışına çıkma veya kısa kalma riski |

Sağ kenarın sola falso üretmesi kamera dünyasında **arkadan kaleye bakan oyuncuya göre** tanımlıdır. Gerçek ayak içi/dışı vuruşun adı, sağ/sol ayak ve ayak hareketiyle değişir; burada işaret doğrudan temas noktasını ifade eder. Arayüzdeki sola/sağa falso yazısı bu tanımla aynı.

## 4. Yeni vuruş hesabı

### Güç ve nişan

Güç çubuğu bir çıkış hızı parametresidir: penaltı için temiz tam güç 25 m/s, frikik için 24 m/s. %60, bu hızın %60'ıdır; enerjinin %60'ı değildir. Bunlar mevcut mini oyunun tempo değerleridir, profesyonel futbolcuların evrensel maksimumu değildir.

Temiz merkezi vuruşta sabit hız büyüklüğü korunarak çıkış açısı aranır. Yerçekimi ve hava direnciyle üretilen uçuş hedef yüksekliğine ulaşabiliyorsa alçak yay seçilir. Ulaşamıyorsa hız artırılmaz; sınırlı açı aramasındaki en yakın çözüm kullanılır. Zeminli gerçek uçuş bundan sonra hesaplanır. Bu bir otomatik nişan tekniği varsayımıdır; sınırsız hedef garantisi değildir.

Hedef halkası niyet edilen noktadır. Beyaz yol ve tahmin halkası, seçilen güç ve temasta kusursuz zamanlamanın fiziksel sonucudur. Bunların farklı olması hata değildir: kenardan temas ve aşırı alt temas niyet edilen noktayı değiştirebilir. Gerçek zamanlama hatası sonrası uçuş ayrıca bu tahminden sapabilir.

### Darbe, enerji ve dönme

Top kütlesi m=0,43 kg, yarıçap R=0,11 m; ince küresel kabuk yaklaşımında dönme ataleti I=(2/3)mR².

Temas yarıçapı r, darbe J ve dönüş aktarımı eta için:

- J = m v
- I omega = eta (r × J)
- E = (1/2)m|v|² + (1/2)I|omega|²

Önce mevcut enerji bütçesi belirlenir; sonra hız ve dönüş birlikte bu bütçeden çıkarılır. Merkezden uzaklık, vuruş kalitesi ve aktarım verimi bütçeyi azaltır. Dönme enerjisi eklenirken tam ileri hız ayrıca korunmaz. eta=0,23 ve merkez dışı enerji kaybı eğrisi oyun için kalibre edilmiş yaklaşımlardır.

### Zamanlama

Mevcut güç ve köşe hassasiyetine göre daralan bant korunur. İbreden sapma, sürekli bir kalite eğrisiyle hız aktarımını azaltır ve çıkış yönü/yüksekliğinde açısal hata üretir. Vektöre bağımsız hız eklemek yerine açısı değiştirilir; enerji sınırı korunur.

Kaleci kurtarışı “yeşil kaçtı, kurtar” şeklinde yazılmaz. Daha yavaş veya hatalı şut, kaleciye daha fazla süre verebilir; ancak sonucunu gerçek top yolu ile kalecinin kapsülleri belirler. Kusursuz zamanlama da barajdan, direkten veya güçlü bir kaleciden gol garantisi değildir.

## 5. Uçuş ve çarpışma

### Havada

Newton hareketi, yerçekimi, karesel hava direnci ve Magnus kuvveti kullanılıyor. Magnus yönü omega × v ile bulunuyor; bu kuvvet hız vektörüne diktir. Dikey dönme ekseni yan falsoyu, yatay eksen kaldırma veya aşağı inmeyi üretir. NASA'nın futbol topu açıklaması bu eksen ilişkisini ve gerçek toplarda deneysel kaldırma katsayısı gerektiğini destekliyor.

Hava direnci: Fd = -(1/2) rho Cd A |v| v.

Magnus büyüklüğü, dönme parametresinden çıkan sınırlı Cl eğrisiyle hesaplanıyor. Cd=0,25 sabit; Cl eğimi 0,9, tavanı 0,35; dönüş sönümü 0,12/s. Bunlar kalibrasyon değerleri. Dikiş/panel şekli, Reynolds sayısıyla drag krizi, hava değişimi ve knuckleball çalkantısı modellenmiyor. Carré ve arkadaşlarının uçuş çalışması katsayıların deneysel ölçümüne dayanır; her top için tek sabitin yeterli olduğunu söylemez.

Yol 1/120 s adımla RK4 yöntemiyle hesaplanır. Son çizgi adımı, düzlemi tam yakalayacak biçimde bölünür. 1/240 s karşılaştırması yeni modelde hedef noktası farkının 5 mm'nin altında kaldığını kontrol eder. Bu sayısal tutarlılık kontrolüdür; gerçek top deneyinin yerine geçmez.

### Zeminde

Topun zemine temas eden noktasındaki kayma hızı v + omega × (0,-R,0) ile bulunur. Darbe, kaymayı azaltır; Coulomb sınırıyla sınırlanır. İlerleme ve dönme arasında aktarım olur, toplam enerji artmaz. Dikey sekme 0,35; kayma sürtünmesi 0,25; düşük hızdaki yuvarlanma kaybı mevcut yaklaşık katsayıyla sürer. Çim sertliği, ıslaklık ve ezilmesi ayrı çözülmüyor.

### Baraj, kaleci ve direk

Baraj mevcut farklı boy ve sıçramalı bireysel kapsüllerini kullanır. Topun çizilen yoluyla temas kontrolü aynı örneklerdedir. Kaleci kapsüllerinin uzunluğu sabittir; kollar erişimi artırmak için uzatılmaz.

Yeni direk hesabı, iki ardışık top konumu arasındaki segment ile top yarıçapı kadar genişletilmiş direk silindirini kesiştirir. Temas normaliyle normal hız bileşeni 0,55 restitüsyonla yansıtılır. Sonraki uçuş yeniden bütünleştirilir; kaleci sekmeden sonra da topu karşılayabilir. İçeri sekme ile dışarı sekme ayrımı artık gerçekten sekmiş yoldan çıkar.

Gol için topun tamamı çizgiyi geçmeli: top merkezinin z konumu en az D+R olmalı, kale ağzının içinde kalmalı. Kısa kalan top gol olamaz. Direk sesi yeni kurallarda gerçek temas anında çalar, sonuç anında ikinci kez çalmaz.

Sınır: ardışık birden fazla direk teması ve direğin köşe birleşimindeki tam üç boyutlu uç kapak geometrisi henüz genel rijit cisim çözücüsüyle ele alınmıyor. File teması ve olay sonrası gösterim sadeleştirilmiş. Yeni direk çözümü, eski konum varsayımını düzeltir; tüm olası top/direk temaslarının eksiksiz simülasyonu değildir.

## 6. Ölçülebilir örnekler

Aşağıdaki örnekler merkez hedef (0;1,1), kusursuz zamanlama, rüzgârsız, doğrudan uçuş modeli içindir; baraj/kaleci dahil maç gol yüzdesi değildir. Yükseklik top merkezini gösterir.

| Durum | Eski hız | Yeni hız | Yeni varış |
|---|---:|---:|---|
| 11 m, merkezi temas, tam güç | 25,43 m/s | 25,00 m/s | Hedef yüksekliği 1,10 m |
| 11 m, merkezi temas, %60 güç | 15,93 m/s | 15,00 m/s | Hedef yüksekliği 1,10 m |
| 28 m, merkezi temas, %60 güç | 19,81 m/s | 14,40 m/s | Hedef yüksekliğine çıkamıyor, yerde geliyor |
| 28 m, merkezi temas, %30 güç | 7,63 m/s | 7,20 m/s | Kale çizgisine ulaşamıyor |
| 11 m, sağ kenar x=0,8 | 22,40 m/s | 20,58 m/s | Yaklaşık 0,85 m sola sapma |
| 28 m, sağ kenar x=0,8 | 22,40 m/s | 19,76 m/s | Yaklaşık 5,98 m sola sapma |
| 11 m, alt temas y=-0,8 | 22,67 m/s | 20,58 m/s | Yaklaşık 5,91 m yükseklik; üstten aut |
| 28 m, alt temas y=-0,8 | 22,85 m/s | 19,76 m/s | Yaklaşık 3,95 m yükseklik; üstten aut |

Bu tablo “kenara vurunca hep gol” veya “alt temas her güçte aut” kuralı değildir. Mesafe, hız kaybı, yön ve dönüş ekseni birlikte sonucu değiştirir.

## 7. Testler ve kalan işler

29 Node test dosyası geçti. Yeni kontroller: bekleme ve hareket halinde gerçek piksel örtülmesi; sabit hız ve toplam enerji bütçesi; kenar temasının ayna simetrisi ve mesafe etkisi; alt/üst temas; zayıf şutta gol yasağı; zemin darbesinde enerji kaybı; RK4 yakınsaması; direğe sürekli temas, sekmeden gol ve dışarı sekme; kalecinin gerçek gelecek varış zamanına bağlı olmaması.

Kimlik/haftalık hak testi gerçek Edge işleyicisini sahte veritabanıyla çalıştırdı. Aynı tur içinde rules 4 ve rules 5 kabulü, başkasının oyuncusuyla vuruş yasağı, yinelenen istek ve 10 vuruş sınırı kontrol edildi. Gerçek üretim hesabıyla vuruş atılmadı, kimsenin hakkı harcanmadı. Bu turda gerçek PostgreSQL eşzamanlılık testleri yeniden çalıştırılmadı; SQL değişmedi.

Yedi ekran boyutunda Canvas çizimi ve altı sahne karesi kontrol edildi. Gerçek iPhone/Safari, gerçek parmakla isabet hissi ve düşük güçte kare hızı bu turda ölçülmedi. Kaleci geometrisi sert erişim sınırlarına sahip; gol oranı kimi hedeflerde hâlâ keskin değişebilir. Tam insan hareket yakalama, yumuşak doku ve çok eklemli fizik animasyonu yapılmadı.

## 8. Sürüm uyumu ve yayın

Yeni vuruşlar rules 5 kullanır. Sunucu rules 4 ve 5'i kabul eder; eski kaydedilmiş vuruşlar kendi rules değeriyle çizilir. Eski kuralların on pozisyonluk çıktısı önceki sürümle karşılaştırıldı ve SHA256 regresyon özeti testte sabitlendi. Bekleyen eski rules 4 isteği yeni kurala çevrilmez.

Oda sürümü 8 olarak kalır. SQL değişikliği yok. Haftalık goller, puanlar, giriş kodları, oturumlar ve kalan haklar sıfırlanmaz. Aynı hafta içinde eski ve yeni fizik sürümüyle oynanmış kayıtlar bulunabilir; onları sonradan yeni kuralla yeniden puanlamak yapılmaz.

Yayın sırası: önce eski istemciyle de uyumlu Edge, sonra site. İstemci/sunucu ortak dosyaları: ayar.js, model3d.js, baraj.js, kaleci.js, ucus.js, fizik.js, puan.js. Canlı kontrol yalnızca kimliksiz `me` ve yayın dosyalarının okunmasıdır.

Başlıca değişen dosyalar: js/ucus.js, js/fizik.js, js/kaleci.js, js/futbolcu3d.js, js/cizim.js, js/oyun.js, js/canli.js, backend/index.ts, index.html; yeni derinlik/enerji/direk testleri, güncellenen kimlik testi ve bu rapor.

## 9. Kaynaklar

- EA, FC 25 Gameplay Deep Dive: https://www.ea.com/games/ea-sports-fc/fc-25/news/pitch-notes-fc-25-gameplay-deep-dive
- EA, FC 26 Gameplay Deep Dive: https://forums.ea.com/blog/ea-sports-fc-game-info-hub-en/ea-sports-fc-26--pitch-notes---gameplay-deep-dive/12371925
- NASA Glenn, Lift of a Soccer Ball: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-of-a-soccer-ball/
- Asai ve diğerleri, 2002, The curve kick of a football I: impact with the foot, Sports Engineering, DOI: https://doi.org/10.1046/j.1460-2687.2002.00108.x
- Carré ve diğerleri, 2002, The curve kick of a football II: flight through the air, Sports Engineering, DOI: https://doi.org/10.1046/j.1460-2687.2002.00109.x
- Peacock, 2018, doktora tezi, Victoria University: https://vuir.vu.edu.au/37861/1/PEACOCK,%20James-Final%20Thesis_nosignature.pdf

Birinci kaynaklar oyunun kamuya açık tasarım kararlarını; NASA kuvvet yönünü; çarpışma/uçuş araştırmaları fizik yaklaşımını destekler. Oyuna özel katsayılar, gol dengesi ve basitleştirmeler kendi uygulama kararlarımızdır.
