# Juninho Kupası — 20261006a

## Gerçek ses kayıtları

Fizik, kurallar, sunucu ve veritabanı değişmez. Yeni vuruşlar yine `rules: 9`. Yalnız istemci sesi değişir.

- `assets/ses/`: beş kayıt eklendi: `vurus.mp3`, `direk.mp3`, `file.mp3`, `islik.mp3`, `gol.mp3`. Mono, 44,1 kHz, 128 kbps, tepe ≈ −3 dB. Kaynak ve lisans: `assets/ses/KAYNAKLAR.txt` (Mixkit ve Pixabay ücretsiz lisansları; oyunda kullanım serbest, dosyaları tek başına dağıtmak yasak).
  - `vurus`, `islik`, `gol` tek gerçek kayıttır.
  - `direk` ve `file` iki gerçek kaydın katmanıdır (top darbesi + metal direk / ağ hışırtısı). Ücretsiz kütüphanelerde gerçek "top direğe çarpıyor" ve "top futbol ağına giriyor" kaydı bulunamadı; bulunan tek ağ kaydı yapay zekâ üretimi olduğu için alınmadı.
- `js/ses.js`: kayıt desteği `direk`/`file`'dan beşe genişledi. Kayıt yoksa ya da çözülemezse eski sentez çalar; `?ses=sentez` hepsini kapatır.
  - Gol uğultusu (9 sn) takip edilir: yeni gol, ses kapatma ve yeni pozisyon onu 0,3 sn'de kısarak keser (`DT.ses.sustur`).
  - Sesi ilk açışta düdük kaydı henüz inmemişse en çok 0,7 sn beklenir, sonra sentez çalar; iki kez çalmaz.
  - Kayıt önbellek etiketi `20261006a` (eski `20261004c`).
- `js/oyun.js`: hakem düdüğü artık her vuruşta koşu başlarken çalar (`d.faz='vurus'`); temas 0,85 sn sonradır. Resmi turda sunucu kaydı onayladıktan sonra çalar. Yeni pozisyon kurulurken önceki golün uğultusu susturulur.
- `index.html`: yalnız `ses.js` ve `oyun.js` etiketi `20261006a`. Diğer dosyaların etiketleri (`ab`/`ae`) değişmedi.

## Kontroller

- Yeni `tests/ses-kayit-tam.cjs`: beş dosyanın varlığı, MP3 başlığı ve boyutu; beşinin de istenmesi ve kayıttan çalması; doğru önbellek etiketi; gol uğultusunun yeni golde, `sustur()`da ve ses kapatılınca 0,32 sn'de durması; kısa seslerin susturulmaması; kayıt yokken sentez; ilk açışta düdüğün kaydı bekleyip tek kez çalması, kayıt gelmezse 0,7 sn'de sentez; `oyun.js` ve `index.html` bağlantıları.
- 41/41 `tests/*.cjs` geçti (değişiklikten önce 40/40). `tests/e2e/uctan-uca.cjs` önce ve sonra geçti. Canvas testleri Linux'ta `@napi-rs/canvas` ile çalıştırıldı.
- Başsız Chromium'da gerçek `decodeAudioData`: beş dosya çözüldü ve yüklendi. Süreler 0,40 / 0,45 / 0,33 / 0,75 / 9,0 sn; tepe −2,7…−3,5 dB; ilk ses 5–15 ms içinde.

Sesler insan kulağıyla dinlenmedi; spektrum ve seviye ölçümüyle seçildi. Gerçek iPhone/Safari ve gerçek telefon hoparlöründe denenmedi. Safari'nin MP3 başındaki boşluğu Chromium gibi kırpıp kırpmadığı ölçülmedi. Düdüğün koşu başında çalması bir tasarım tercihidir; istenirse pozisyon hazır olduğunda çalacak şekilde taşınabilir.

## Yayın

Yalnız site. Edge ve SQL yok. Eski site ile yeni site aynı vuruşları üretir; ses dışında davranış farkı yok.
