# Duran Top — 20261010c: duruş ve nişan ayrıldı, falso oku yine eğiliyor

Esas: 20261010b. Kupa (rules 9), sunucu ve fizik değişmez. Edge'e dokunulmaz.

## Hata 1: duruş nişana bağlanmıştı (20261010b)
- 20261010b'de oyuncunun bakış yönü, topun gideceği yerden (nişan) hesaplanıyordu. Yanlıştı: vücut yönü ile topun gideceği yer ayrı şeylerdir (sağ köşeye vurmak için vücudun sağa dönük olması gerekmez).
- Düzeltme: 1/3 ekranında iki ayrı ok grubu var, aynı ekranda ama bağımsız:
  - **Vücut** ◀ ▶: yalnız duruşu çevirir (basılı tut, ≈21°/sn, oyuncu yerinde küçük adımlarla döner, gösterge "Sağa · 12°"). Kamera ok bırakılınca bir kez geçer. Bilgisayarda A / D.
  - **Nişan** ◀ ▶ ▲ ▼: yalnız topun gideceği yeri seçer; duruşu ve kamerayı değiştirmez. Dokunarak nişan da duruşu değiştirmez.
  - Tamam: ikisini birlikte kilitler.
- Eski "Duruşunu seç" düğmesi, Sola/Düz/Sağa düğmeleri ve 1,1 sn yürüme beklemesi dönmedi; ayrı adım yok.
- Vuruş süreci: 1/3 Duruş ve yön (oklar + Tamam), 2/3 Topun neresine (topa dokununca otomatik ilerler), 3/3 Sertlik (VUR basılı tut, ibre).

## Hata 2: falsoda ok eğilmiyordu
- Nedeni: 20261010b'de oku 3–4,5 m'ye kısaltmıştım; falso eğrisi bu kısa mesafede en çok ≈10 cm sapma yapar, ekranda görünmez.
- Düzeltme (`js/cizim.js` okNoktalari): ok kısa kalır ama yanal sapma yalnız GÖSTERİMDE 8 kat büyütülür (en çok 1,2 m). Falso yoksa ok düz; falso verince ok topun gerçek sapma yönüne eğilir, az falso az eğri.
- Not: ok sapmanın yönünü ve miktarını gösterir, topun nereye varacağını göstermez.

## Dosyalar
`js/oyun.js` (vücut okları geri geldi, duruş nişandan ayrıldı), `js/cizim.js` (okNoktalari), `index.html` (1/3 ekranında iki ok satırı, Tamam), `css/stil.css`. Etiketler 20261010c.

## Testler
- `yon-ok.cjs` yeniden yazıldı: vücut okları yalnız duruşu, nişan okları yalnız hedefi değiştirir; kamera vücut oku bırakılınca bir kez; 40 karışık işlemde bağımsızlık; Tamam sonrası kilit.
- `fifa-ok.cjs`: falsosuz ok düz (<5 cm), falsolu ok ≥45 cm eğri, iki falso ters yana, az falso az eğri, gösterilen yön topun gerçek sapma yönüyle aynı işaretli (5 pozisyonda); ok kaleye ulaşmaz.
- `akis.cjs`: nişan oku duruşu değiştirmez.
- Linux'ta 53/53 + e2e. Denenmedi: gerçek telefon, iki ok satırının küçük ekranda sığması (320 px), parmakla basılı tutma.
