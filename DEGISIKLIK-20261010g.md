# Duran Top — 20261010g: sade kumanda, 3B ok

Esas: 20261010f. Kupa, sunucu ve fizik değişmez; yalnız arayüz ve çizim. Edge'e dokunulmaz.

## 1. Sade kumanda (1/3 ekranı)
- Panel, başlık ("1/3 · Duruş ve yön"), açıklama metni, "Vücut"/"Nişan" etiketleri ve açı göstergesi ("Düz · 0°") kalktı. Yalnız düğmeler var.
- Neden: panel ekranın %44'üne sıkışıyordu (390 px ekranda 172 px); düğme satırı sığmayıp taşıyor, ▼ ve ▶ kesiliyordu (ekran görüntüsünde görüldü).
- Yeni düzen, ekranın altında, oyun alanını kapatmaz:
  - Sol: nişan için artı biçimli ◀ ▲ ▼ ▶.
  - Sağ: Tamam ve altında vücut için ↺ ↻ (dönüş okları).
- Düğmeler 54 px yuvarlak (kısa ekranlarda 46 px), yarı saydam. Gerçek tarayıcıda 320×568, 390×844 ve yatay 844×390'da yedi düğmenin hepsi ekran içinde, taşma yok (Chromium, mobil emülasyon; gerçek telefon değil).
- İşlevler aynı: vücut okları yalnız duruşu, nişan okları yalnız hedefi değiştirir.

## 2. 3B ok
- Kırmızı yer oku artık 2B şerit değil: yolun etrafında kalınlığı olan bir gövde (üst yüz, iki yan yüz, kuyruk kapağı) ve uçta kulakçıklı dört yüzlü ok başı (piramit). Her üçgen ışığa göre gölgelenir (üst açık, yan koyu, baş en parlak), derinliğe göre sıralanır, opaktır (birleşim çizgisi görünmez), kuyruğa doğru koyulaşır. Yerde gölge düşürür, üst yüzün kenarları parlak çizilir.
- Falso, alt temas ve kısa uzunluk davranışları aynı (okNoktalari). Uzakta ok incelmesin diye boyutlar en çok 1,9 kat büyür.

## Testler
- `yon-ok.cjs`: kumandada başlık/açıklama/etiket/gösterge yok, tam 7 düğme.
- `fifa-ok.cjs`: 3B geometri (üst/yan/alt/kapak/baş yüzleri, normaller, kalınlık 0,12 m, konik gövde, kulakçıklı baş, uç yolun devamında, havalanan okta üst yüz yukarı bakar), çizimde ≥3 parlaklık kümesi ve yerde gölge.
- Linux'ta 55/55 + e2e. Denenmedi: gerçek telefon; 2/3 ve 3/3 adımlarının panelleri bu pakette değişmedi.

## Yayın
Yalnız site. Etiketler: `css/stil.css`, `js/cizim.js`, `js/oyun.js` → 20261010g.
