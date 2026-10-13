# Duran Top — 20261011b: koşarak vuruş, yavaş çekim, gol tezahüratı

Esas: 20261011a. Fizik, sunucu ve kupa hesabı değişmez; yalnız görüntü, zamanlama ve ses. Edge'e dokunulmaz.

## 1. Koşarak vuruş (`js/futbolcu3d.js`)
- Eskiden oyuncu topun ~1 m arkasından 6 küçük adımla yürüyüp vuruyordu. Şimdi gerçek bir koşu:
  1. **Geri adım** (süreçin %0–34'ü): duruş noktasından, topun arkasındaki ve yanındaki koşu başlangıcına (en çok 1,5 m) topa bakarak geri çekilir.
  2. **Dönüş** (%34–40): koşu yönüne döner.
  3. **Koşu** (%40–82): kavisli bir yayla soldan-arkadan topa; 4 adım (sağ, sol, sağ, sol=basma ayağı), ivmelenip basma ayağında biter. Yüksek diz, dik gövde eğimi (öne), kollar bükük ve ayakla ters sallanır, her adımda hafif zıplama.
  4. **Basma ayağı** topun yanına konur, **vuruş** (%82–100), vuruş sonrası gövde ≈25 cm ileri süzülür.
- Koşu başlangıcı: penaltıda topun 2,0 m, frikikte 2,4 m gerisi. Sol duruşta ya da sola atışta koşu soldan açılmaz (ekranın soluna taşmasın). Gerçek kamerayla taradım: dikey ekranda oyuncu hep ekran içinde (en alt %79); soldan en çok kenara kadar iner.
- **Temas tipine göre bacak/ayak/gövde yatar:** alt temasta gövde geriye yaslanır ve ayak yassı (altına girer), üst temasta gövde öne eğilir ve ayak burnu aşağı; falsoda basma ayağı daha geniş basar, vuruş bacağı gövdenin önünden iki yana ters yönde geçer, ayak dışa/içe döner ve yatar (krampon artık dönük çizilir).
- Süre: basıştan temasa penaltıda 1,5 sn, frikikte 1,7 sn, hedef ağında 1,5 sn (`AYAR.kosuSure`; önceden 0,85). Kısaltmak istersen bu sayılar ayarlanır.
- Kaleci rutini artık koşu boyunca sürer ve temastan hemen önce söner.

## 2. Yavaş çekim (`js/oyun.js`)
- Gol, kurtarış ve direkten dönüşte olaydan 0,45 sn önce başlayıp 0,25 sn sonra biter; hız 0,4 kat (`AYAR.yavasCekim`). Kısa uçuşlarda (penaltı) pencere olaya kadar kısalır.
- Top, kaleci, şutçu ve olay sesleri aynı zaman haritasından geçer; yalnız gerçek süre uzar (≈+1 sn). Kaçan şutlarda (aut, kısa, baraj) yok. Sonuç ve sıra aynı.
- Kapatmak için `AYAR.yavasCekim.acik=false`.

## 3. Gol tezahüratı (`js/tezahurat.js`, `js/cizim.js`)
- Gol olunca tribünde sarı balonlar çıkar (3,4 sn) ve kalabalık tam coşar. Sözler: "Golllaazzzooooooooooo!", "Koçum benim!", "Senin yarrağını yiyeyim!", "Gel bir kere de bana koy öyle!" (ilk dördü sık çıkar) ve yedekler ("Efsane!", "Bu ne vuruş be!", "Yaşa kral!", "Allah Allah!"). Liste `js/tezahurat.js` içinde `GOL_SOZ`'de, serbestçe düzenlenir.
- Ses (üç kademe): 1) `assets/ses/tez-1..tez-6.(mp3|ogg|wav|m4a)` gerçek kayıtlar varsa onlar çalar; 2) yoksa tarayıcının Türkçe konuşma sentezi iki sözü okur (**robotik olabilir**, kayıt yoksa gerçek kalabalık gibi olmaz; `AYAR.tezTTS=false` ile kapanır); 3) ikisi de yoksa yalnız balonlar. iPhone için konuşma sentezi, sesi açtığın ilk dokunuşta sessizce kilit açılır.

## Testler
- Yeni: `kosu.cjs` (zaman çizelgesi, hızlar, ışınlanma yok, faz geçişleri, ayak/diz kemik boyları, yer altı yok, temas tipine göre eğim ve ayak yatışı), `yavas-cekim.cjs`, `gol-tezahurat.cjs`. Güncellenen: `takip-fizigi`, `alay-akis`, `direk-sonuc`.
- Linux'ta 60/60 + e2e. Denenmedi: gerçek telefonda hareketin doğal görünmesi (yalnız karelere baktım), konuşma sentezinin iPhone'daki sesi.

## Yayın
Yalnız site. Etiketler 20261011b (`ayar.js`, `futbolcu3d.js`, `oyun.js`, `cizim.js`, `tezahurat.js`).
