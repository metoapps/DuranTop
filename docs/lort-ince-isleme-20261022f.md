# LORT — anatomi ve animasyon incelemesi, 20261022f

Esas sürüm: bfcb336 (20261022e). Değişiklikler LORT görsel modeli ve animasyonuyla sınırlıdır. Ortak çizim önbelleğinde eksik olan yaw anahtarı da düzeltildi. Oyun kuralları, kaleci kararları, şut fiziği ve temas noktaları değiştirilmedi.

## İnceleme ve düzeltmeler

| Alan | Bulunan sorun | Uygulanan düzeltme | Kalan sınır |
|---|---|---|---|
| Beden oranları | Çene ile yaka arasında gereksiz açık boyun; uzuv birleşimlerinde ayrı kabuk görünümü | Yaka 5 birim yükseltildi; boyun iç örtüşmesi uyarlandı. Uzun boy, omuz/kalça eni ve kemik uzunlukları korundu | Omuz, kas ve kumaş deformasyonu hâlâ düşük poligonlu |
| Eller ve eklemler | Dirsek/dizde üst üste gelen parçalar, parmaklarda yalnız iki segment, koşuda düz parmaklar | Ortak halkalı kesintisiz dirsek/diz yüzeyi; her parmakta üç falanks; kontrollü gevşek kavrama ve yumruk bükülmesi | Ayrıntılı tırnaklar ve kas/tendon deformasyonu yok |
| Hareket | Koşu kolları el hedeflerini takip ediyor, doğal dirsek bükülmesi zayıf; açı değiştiren bekleme görüntüsü eski önbellekten gelebiliyor | Koşuya özel sınırlı kol salınımı, başlangıç ve vuruşa geçişte yumuşak karışım; yaw önbellek anahtarına eklendi | Hareket yakalama verisi ve ağırlıklı mesh skinning yok; omuz hâlâ mekanik görünebilir |
| Üç boyutlu yüz | Ön/arka fotoğraf birleşiminde dikey sınır, çift basılı kulak, şakaklarda saydamlık; yakın planda yüz hatları kaba | Tek opak çevresel atlas, ortak şakak rengi, fotoğraf kenarının kontrollü karışımı; yakın planda 12×24 topoloji; gözlüğe hacimli yan saplar; kulak kafaya yaklaştırıldı | Gözler, dudaklar ve mimikler hâlâ fotoğrafa dayanıyor. Gerçek bir tarama ya da fotogerçekçi yüz değildir |

## Doğrulama

- LORT: 6 test dosyası başarılı. 6.405 iskelet pozu, 1.338 el/LOD durumu, 1.442 destekli kutlama pozu; sabit kemik boyları ve değişmeyen top/ayak temasları.
- Yeni test: iki ayrıntı düzeyinde dirsek/diz yüzeylerinin ortak kenarları; yalnız uç halkalar açık. Atlas tüm piksellerde opak, çevresel dikiş tutarlı, animasyonda yeniden üretilmiyor. Bekleme önbelleği açı değişince yenileniyor.
- Diğer 8 test dosyası: derinlik, çizim (7 ekran boyutu), oyun başlangıcı, akış, tribün/sevinç, Meto anatomisi, koşu ve ortak futbolcu3d başarılı.
- Beden üçgen sayısı 816→720 (yakın), 392→328 (uzak). İki el 244→308 (yakın), uzakta72. Beden+eller toplamı 1.060→1.028. Yüz atlası bir defa oluşturulur. Bu sayılar gerçek telefon FPS ölçümü yerine geçmez.
- Ön/yan/arka, koşu, vuruş, iki kutlama ve yakın el/diz/dirsek görüntüleri gerçek oyun çizicisiyle üretildi. Video 30 fps sunumdur; oyun performans ölçümü değildir.

## Dürüst kalite değerlendirmesi

Öznel görsel değerlendirme: beden6,5/10; eller ve eklemler6,5/10; hareket6/10; yüzün üç boyutlu gerçekçiliği5/10. Bu yama birleşimleri ve sürekliliği iyileştirir; profesyonel ağırlıklı iskelet/mesh ve elle düzenlenmiş yüzün yerini almaz.
