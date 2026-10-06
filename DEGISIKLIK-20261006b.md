# Juninho Kupası — 20261006b

Esas: `main` 0f9bfc1. Kural sürümü değişmez (rules 9). Sunucu ve SQL değişmez. Fizik, puan, kaleci değişmez.

## İkinci gol sevinci (`js/sevinc.js`, `js/cizim.js`)
- Eski: yüz ve forma fotoğrafı kutu gibi bir 3B gövdeye sarılıyordu (balon görüntüsü).
- Yeni: kişinin kendi fotoğraf kareleri (bekle, sevinc, sevinc2, sevinc3, sevinc4) 2B olarak taşınır, eğilir, hafif ezilip esner. Akış: koşup gelme → zıplama → uçak koşusu → gökyüzü → iki zıplama. Takım renginde konfeti, gölge.
- Kayıp: eski sevinçteki eşyalar (bardak, bebek, bavul, zil vb.) yok.
- Birinci sevinç (dört kare) ve sırayla değişme aynı.

## Ok tuşlarıyla anlık yön (`index.html`, `css/stil.css`, `js/oyun.js`, `js/futbolcu3d.js`, `js/cizim.js`, `js/canli.js`)
- Duruş panelinde ◀ ▶ basılı tutulur, oyuncu yerinde küçük adımlarla −1..1 arası döner (≈21°/sn), Tamam ile güç adımı. Klavye: ← → ve Enter. Eski üç hazır düğme duruyor.
- Kamera ara açılarda: uçlar ve orta eski üç kamerayla aynı; −0,2..0 arası kamera biraz daha sağa açılır, −0,2 altında sol kamera.
- Sunucuya en yakın eski duruş (−1/0/1) gider (`canli.js`). Duruş fiziği etkilemediği için sonuç değişmez; tekrar izlemede ara açı en yakın duruşa yuvarlanmış görünür.

## Tribün (`js/tribun.js`, `js/cizim.js`)
- Seyirci elinde direkte dalgalanan bayraklar (Türk bayrağı + iki renkli taraftar bayrakları), üstte ve korkulukta sallanan flama dizileri, daha renkli seyirci formaları.
- Hareketi azalt ayarında sabit. Masaüstü işlemcide kare başına ≈2,9 ms (telefonda ölçülmedi).

## Testler
- Yeni: `yon-ok.cjs` (basılı tut-dön, bırak-dur, sınır, onay, onay sonrası kilit), `tribun-atmosfer.cjs` (5 ekran boyu, bant dışına taşma yok, dalgalanma, azaltılmış hareket), `sevinc-2b.cjs` (yalnız fotoğraf kareleri, sürekli hareket, 3B gövde çağrılmaz).
- Değişen: `kamera-top.cjs` (410 pozisyon×ara açı: top gövdenin arkasında kalmıyor, kale ≥130 px), `canli.cjs` (ara açı sunucuya −1 olarak gider).
- Linux'ta 43/43 + `tests/e2e/uctan-uca.cjs` geçti. Ok testi, dönüş hızının yuvarlamaya takılıp yavaşladığı bir hatayı yakaladı (düzeltildi).
- Denenmedi: gerçek iPhone/Safari, gerçek parmakla basılı tutma, başsız tarayıcı turu, telefonda kare hızı.

## Yayın
SQL ve Edge değişmez; yalnız site. Etiketi değişenler 20261006b. Ses paketi 20261006a bu pakete dahil değil.
