# Duran Top — 20261017a: kendi cümlelerin, kişiye özel tepkiler, spiker sesi, sabit seçim paneli

Esas: 20261016a. Fizik, sunucu ve kupa hesabı değişmez. Edge'e dokunulmaz.

## 1. Tribünden yalnız SENİN cümlelerin
- **Gol:** "Golllaazzzooooooooooo!", "Koçum benim!", "Senin yarrağını yiyeyim!", "Gel bir kere de bana koy öyle!". Her gole bunlardan 3'ü, karışık sırayla (sarı balon). Önceki ~60 cümlelik havuz kaldırıldı.
- **Kaçan şut (aut, direk, kurtarış, baraj, kısa, halka, ağ):** genel olumsuz dört cümlen (krem balon): "Senin ayağının dümenini sikeyim", "Kazma herif", "Ya bi siktir git amk ya", "Seni bu takıma alan hocanın anasını avradını sikeyim". Direkten dönüşte de çıkar (eskiden yalnız "ahhh" sesi vardı).
- **Oyuncuya özel (yalnız top AUTA gidince, yalnız o oyuncu için, pembe balon):** Lort 3, Buzlulatte 2, Josh 3, Fero 3 cümle; hepsi gösterilir, genel cümlelerle 5'e tamamlanır. METO için özel cümle yok (yalnız genel dört). Başka oyuncunun özel cümlesi hiç çıkmaz.
- **Süre:** balonlar 2,6 sn yerine **4,2 sn** kalır (pencere 5,4 sn). Uzun cümleler iki satıra bölünür (320 px ekranda taşmaz). Balonlar artık ayrı yatay şeritlere yerleşir (üst üste binip birbirini kapatmaz).
- Not: Buzlulatte'nin bir cümlesini ("Hollandalı ibne seni") ayrımcı bir sözcük içerdiği için yazmadım; yerine "Hollandalı hıyar seni" koydum. Listeyi `js/tezahurat.js` içinde `OZEL_OLUMSUZ` (ve `GOL_SOZ`, `GENEL_OLUMSUZ`) olarak kendin düzenleyebilirsin.

## 2. Ses: konuşma sentezi iptal, golde spiker
- Tribünün konuşma sentezi (robotik okuma) **tamamen kaldırıldı**; kodda `speechSynthesis` yok.
- Gol olunca **spiker bağırışı** çalar: `assets/ses/spiker-gol-1..8` (sıradan goller) ve `assets/ses/spiker-gollazo-1..8` (sert şut, falso, köşe, altın bölge, direkten gol, uzak frikik, 3+ seri). Dosya yoksa gollerde ses çalmaz (yalnız balonlar ve gol uğultusu).
- **Bu sesleri ben üretemiyorum**: gerçekçi, uzatmalı, maç anlatan spiker tonu için yapay zekâ ses aracı (ElevenLabs gibi) gerekir. `assets/ses/SPIKER-REHBERI.md` aracı nasıl ayarlayacağını ve üretilecek metinleri (Goooool!, Gollllaaazzzoooo! vb.) adım adım anlatır. Ses test panelinde (`?sestest=1`) "Spiker: gol" ve "Spiker: gollazo" düğmeleri var.

## 3. Seçim panelleri hep aynı yerde
- 2/3 "Topun neresine?" ve güç panelleri, oyuncunun duruşuna göre sağa-sola atlıyordu. Artık **hep sağ alt köşede** (alt ve sağ kenardan 10 px), ikisinin de kenar konumu birebir aynı; **sol el modunda sol alt**. Chromium'da dikey, yatay ve sol el için konum ölçüldü; duruş sınıfı eklenince yer değişmiyor.

## Testler
Yeniden yazılan `gol-tezahurat.cjs` (cümleler, kişiye özel, süre, iki satır, spiker, konuşma sentezi yok); güncellenen `alay-akis`, `tribun-hareket`, `cihaz-sestest`. **Denenmedi:** gerçek telefon; spiker sesi (dosyalar yok); panellerin oyuncuyu kapatıp kapatmadığı canlı oyunda.

## Yayın
Yalnız site. Etiketler 20261017a (`cizim`, `oyun`, `tezahurat`, `sestest`, `css/stil.css`).
