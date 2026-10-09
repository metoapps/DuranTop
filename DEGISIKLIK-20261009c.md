# Duran Top — 20261009c: FIFA 02 yer oku, gerçekçi baraj, daha hızlı top, ses temizliği

Esas: 20261009b. Kupa (rules 9) ve sunucu davranışı değişmez. Yeni fizik yalnız `kural10` bayrağıyla (antrenman, hedef ağı). Beş eski-sürüm koruma testi ve 720 vuruşluk karşılaştırma birebir aynı.

## Geri bildirime göre
- **%100 güç daha hızlı:** penaltı ve frikikte %100 = 36 m/sn ≈ 130 km/sa (önce 112/108). %30'da 9 m/sn.
- **Yeşil bant zorlaştı:** %100 güçte bant 0,70 → 0,55 kat dar, FIFA ibresi güçle hızlanır (%30'da 0,80 sn → %100'de 0,62 sn). Ölçüm (zamanlama hatası ±40 ms): %100 güçte yeşili tutturma frikikte %15 → %4, penaltıda %15 → %7. Gol oranı aynı kaldı (penaltı %45→%47, frikik %9→%8; ızgara taraması). Yeşilden uzak sert vuruş yine kale dışına savrulur.
- **Tribün sesi:** sentez alkış/koro ve sentez uğultu kaldırıldı (kalitesizdi). "Ahhh" yalnız gerçek kayıtla çalar: `assets/ses/ah.(mp3|ogg|wav|m4a)` varsa o; yoksa `assets/ses/gol.*` kaydı yavaşlatılıp kısılarak hayal kırıklığı uğultusuna çevrilir; ikisi de yoksa eski kısa "ah". Direkten dönen top yoksa ses çalmaz. Not: önceki "ahhh" sentezi çok kısık olduğu için duyulmamıştı.

## Yeni fikirler
1. **Yer oku topun gerçek uçuş yolunu izler** (`cizim.js` fifaOkCiz, `oyun.js` fifaOnizleme): falso verince ok yana eğilir, alt temasta havaya kalkar (altında yere izdüşüm çizgisi), üst temasta yerde kalır. Tam güç, kusursuz zamanlama yolu; önbellekli (33 ms hesap), ok tuşu basılıyken en çok 8 kez/sn yenilenir.
2. **Duruş ok tuşlarıyla:** zaten var (20261006b): duruş panelinde ◀ ▶ basılı tut. Değişmedi.
3. **Frikikte hedef halkası kalktı;** yalnız yer oku. Kaleye dokunmak ya da ◀▶▲▼ ile oku yönlendirirsin.
4. **Baraj** (`js/baraj3d.js`, yalnız çizim): dört farklı yüz (ten, saç stili, kaş, göz, sakal/bıyık), dört beden (boy, gövde), rakip forması (açık mavi/beyaz), eller önde kenetli, hafif sallanma, zıplayınca dizler toplanır. Yüzler kodla çizilir, fotoğraf değil. **Zıplama:** kural 10'da her oyuncu olasılıkla zıplar (orta %92, kenar %60, en az 2; ortalama 3,07 oyuncu, önce 2), zamanlama ve hız oyuncudan oyuncuya değişir. Kural 9'da eski sabit düzen.
5. **Frikikte kaleci:** ilk tepki 0,54 sn → 0,29 sn (önceki paket 0,36).

## Dosyalar
Yeni: `js/baraj3d.js`, `tests/fifa-ok.cjs`, `tests/baraj-gorsel.cjs`. Değişen: `ayar.js` (bant), `ucus.js` (hız), `fizik.js`, `hedef.js`, `kaleci.js`, `baraj.js` (sunucunun içe aldığı dosyalar; yalnız `kural10` bayrağı altında), `kaleci3d.js` (çizim genelleştirildi), `tezahurat.js`, `cizim.js`, `oyun.js`, `index.html`. Edge'i yeniden yüklemek gerekmez (sunucu davranışı aynı).

## Testler
50/50 + e2e (Linux). Yeni testler: yer oku (falso iki yana eğer, alt>orta>üst, ok görünür, halka yok), baraj (zıplama istatistiği, 4 farklı yüz, çarpışma geometrisi ve baraj çıktısı eskisiyle aynı), tezahürat (yalnız gerçek kayıt). Denenmedi: gerçek telefon; sesler; gol dengesi telefonda.
