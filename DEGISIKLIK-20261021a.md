# Duran Top — 20261021a: anatomik Meto kolları, canlı Meto sevinci, kendiliğinden seçim yapmayan ibre

Esas: 20261020b (637bef0, devir paketi). Fizik, skor, sunucu, kimlik/kupa sözleşmesi, alev/ağır çekim, diğer oyuncular DEĞİŞMEDİ. Edge'e dokunulmaz.

## 1. Meto'nun kolları (koşu, vuruş, sevinç)
- **Ölçülen hata:** koşu/vuruşta dirsek 163°'ye kadar bükülüyordu (insanda ≈145°), üst kol yatay biçimde ≈70° geriye savruluyordu (insanda ≈55–60°), kare başına ≈%24 önkol ters yöne katlanıyordu. Mevcut anatomi testi yalnız sevinçleri denetliyordu; koşu ve vuruş hiç denetlenmiyordu.
- **Çözüm (`js/meto3d.js`):** anatomik kol çözücü (`solveArm`): dirsek 10–140°, omuz yüksekliği ≤105°, geri uzanma ≤55°, gövdeyi çaprazlama yok, dirsek insan gibi geriye-aşağıya düşer; kemik boyları sabit. Kemik dönüş çerçevesi artık dirsek bükülme düzleminin normaline bağlı: kol kendi ekseninde dünya yönüne göre savrulmaz/burulmaz (üst kol, önkol ve el aynı düzlemi paylaşır).
- Rig'in (fizik/yürüyüş) kendisi değişmedi; çözücü yalnız Meto'nun çizim pozunu sınırlar.

## 2. Meto'nun gol sevinci (artık "put" değil)
- Eskiden yalnız kollar oynuyor, ayaklar ve gövde sabit duruyordu ve ≈4,7 sn sonra heykel gibi duruyordu. Şimdi **üç tam-beden sevinç** (dönüşümlü): **yumruk** (çömelip zıplama, sağ yumruk havada, sol el rozete, baş geride), **uçak** (kollar açık, sağa-sola yatarak adım adım sekme, gövde dönüşü), **çığlık** (üç güçlü zıplama, kollar V, baş geride, sonra kollar yukarıda sekme). Ayaklar yerden kalkar (dizler bükülür), gövde öne/yana eğilir.
- Sevinç bittikten sonra **canlı bekleme**: nefes, ağırlık aktarma, hafif kol salınımı, baş hafif döner.

## 3. Güç ve yeşil bar (ibre)
- **Düzeltilen hata:** güç bırakılınca ibre HEMEN başlıyor ve ibre iki geçişi bitirince oyun KENDİSİ en kötü zamanlamayla vuruyordu.
- Güç bırakılınca **0,65 sn "Hazırlan…"** (dokunuşlar yok sayılır). Sonra ekranın ortasında **büyük bir daire** (ibre + yeşil bant) çıkar; **o daireye** dokunulur (VUR düğmesi ibre sırasında pasif; güç yine VUR'u basılı tutarak). İbre **sen dokunana kadar gidip gelir; oyun kendiliğinden vurmaz.**
- 0,14 sn'den kısa dokunuş güç seçimi sayılmaz. Fare/parmak basılıyken tarayıcı yakalamayı kaybederse (lostpointercapture) seçim yapılmaz, yakalama yenilenir; düğme dışında bırakılan fare/parmak pencere düzeyinde de yakalanır.
- **Not:** gerçek fareyle (Chromium) basılı tutunca güç aşamasının kendiliğinden bırakıldığını yeniden üretemedim; asıl yeniden üretilen hata ibrenin kendiliğinden vurmasıydı. Güç tarafı için eklenenler sağlamlaştırmadır. Sorun sürerse hangi anda olduğunu bildir.

## Testler
Yeni: `ibre-fare.cjs` (gerçek fare, Chromium), yeniden yazılan `meto-anatomi.cjs` (3 sevinç + 1020 koşu/vuruş pozu: dirsek 10–140°, omuz ≤105°, geri uzanma ≤55°, sabit kemik boyları, sürekli eller, canlı bekleme). Güncellenen: ibreyi kullanan 11 akış testi, `ses-kayit-tam` (etiket). **Denenmedi:** gerçek telefon/iPhone, gerçek fareyle masaüstünde kendi donanımında; kol görünümü yalnız başsız Chromium karelerinde incelendi.
Not: `falso-denge` ve `penalti-tahmin` git geçmişi ister (depoda geçer; `falso-denge` taban referansıyla çalıştırıldı, geçti).

## Yayın
Yalnız site. Etiketler 20261021a (`meto3d`, `oyun`, `css/stil.css`). Edge'e dokunulmaz.
