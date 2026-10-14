# Duran Top — 20261011c: tekrar (replay)

Esas: 20261011b. Fizik, sunucu, kupa ve sonuç hesabı değişmez; yalnız görüntü. Edge'e dokunulmaz.

## Tekrar
- Sonuç kartında yeni **"↺ Tekrar"** düğmesi (Devam'ın yanında). Her sonuçta (gol, kurtarış, direk, aut...) çalışır.
- Atış yeniden oynar: koşunun son 0,55 sn'si, vuruş ve sonuç, **yarı hızda**; kamera **topu izleyerek 1,5 kat yakınlaşır** ve sonda yumuşakça geri çıkar. Sol üstte kırmızı "● TEKRAR" etiketi.
- Biter: olaydan 1 sn sonra kendiliğinden, ekrana dokununca ya da Devam'a basınca. Sonuç kartı geri gelir.
- Sonucu, puanı, kayıtları ve tezahüratı etkilemez (gol sevinç balonları tekrarlanmaz). Sesler: vuruş, ağ ve olay sesi tekrar çalar.
- Ayar: `AYAR.tekrar` ({baslangic, hiz, sonra, zum, ses}).
- Kamera aynı kalır, yalnız yakınlaşır (farklı açı yok; farklı açı için sahne arka planını yeniden kurmak gerekir, ayrı bir iş).

## Dosyalar
`index.html` (tekrarBtn, tekrarEtiket), `css/stil.css`, `js/oyun.js` (tekrarBaslat/tekrarKare/tekrarBitir), `js/cizim.js` (zoom), `js/ayar.js`. Etiketler 20261011c.

## Testler
- Yeni `tekrar.cjs`: yalnız sonuç ekranında çalışır; yarı hız (kare başına 0,008 sim sn); başlangıç temastan önce; zoom 1→1,5→1 yumuşak; top yeniden uçar; bitince kart geri gelir; sonuç kaydı ve tezahürat çoğalmaz; vuruş sesi bir kez; dokunma ve Devam bitirir; kurtarış ve kaçan şutta da çalışır; kaleci tekrar zamanında hareket eder.
- Linux'ta 61/61 + e2e. Denenmedi: gerçek telefon (zoom'un keskinliği: 1,5 kat büyütme görüntüyü biraz yumuşatır).

## Yayın
Yalnız site.
