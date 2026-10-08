# Juninho Kupası — 20261006e: görsel kaleci

Esas: 20261006c. Kural sürümü aynı (rules 9). Sunucu, SQL, fizik, kaleci kararı ve puan değişmez: `model3d.js`, `kaleci.js`, `fizik.js`, `ucus.js`, `backend/` dokunulmadı (sunucu `model3d.js`'i içe aldığı için görsel katman ayrı dosyada).

## Yeni: `js/kaleci3d.js` (yalnız çizim)
- Görünen kaleci ile kurtarışı hesaplayan gövde ayrıldı. Vuruştan 0,12 sn sonra eldiven, dirsek, omuz, baş, göğüs ve kalça fizik gövdesiyle birebir aynı yerde (test: 27 bin dalış karesi). Dalışta yalnız bacaklar görsel olarak bükülür (üstteki bacak dizden çekilir, alttaki uzanır; en çok 0,16 m sapma).
- Kollar: kemik boyu sabit iki kemikli ters kinematik, dirsekler doğal yöne bükülür. Hazır duruş: dizler kırık, eller bel hizasında önde.
- Penaltı öncesi oyunbozan hareketler (her 2,9 sn bir rutin, her 6'lık turda her biri bir kez, aralarında yumuşak geçiş): kollar iki yana açık yaylanma; çizgide yan adımlar; üst direğe uzanma zıplaması; eldiven çırpıp bir köşeyi gösterme (blöf, gösterilen köşe zamandan gelir); "spagetti bacak" diz sallama; eller dizlerde eğilip doğrulma.
- Frikikte kaleci aralıklarla barajın olduğu tarafı kolla gösterip başını çevirir.
- Koşu başlayınca hareketler 0,55 sn içinde söner; vuruş anında küçük sıçrama (split-step), sonra fizik duruşu.
- Penaltı öncesi görüntü kalecinin seçtiği yönü bilmez (test: sol ve sağ karar veren planlarda koşu görüntüsü birebir aynı).
- Görünüm: uzun kollu forma, kırmızı manşetli büyük eldivenler, kalçadan omza genişleyen gövde, 10 kenarlı yuvarlak uzuvlar, iki yüzlü ışık, yerde gölge (havadayken açılır).

## Bağlantılar
- `js/cizim.js`: kaleci `DT.kaleci3d` ile çizilir (yoksa eski çizim). Baraj tarafı kaleciye verilir.
- `js/oyun.js`: kaleciye görsel `vurusT` (vuruşa göre zaman), `gesture`, `gestureW` (sönüm) alanları eklenir; sonuç hesabına girmez. Frikikte de hareket zamanı verilir.
- `index.html`: `kaleci3d.js` `model3d.js`'ten sonra yüklenir.

## Testler
- Yeni `kaleci-gorsel.cjs`: 2×6 dk rutin (kemik boyları, ayak zemin üstü, eldiven üst direk altı, kare başı sıçrama <0,12 m), 240 bölümde art arda aynı rutin yok, 9 hedef × 40 tohum gerçek planda fizik eşitliği, yön bağımsızlığı, sönüm, çizim.
- Linux'ta 44/44 + e2e geçti. Kareler başsız çizimle incelendi.
- Sınır: dalış gövdesi hâlâ fizikteki gibi tek parça döner (gövde bükülmesi fizik değişikliği ister: rules 10). Gerçek telefonda kare hızı ölçülmedi.

## Yayın
Yalnız site. Etiketler: `kaleci3d.js` (yeni), `cizim.js`, `oyun.js` → 20261006e.
