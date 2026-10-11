# Duran Top — 20261011b: akıcılık (frikikte takılma) ve penaltıda "ortaya + falso" dengesi

Esas: 20261011a. Kupa (rules 9), sunucu ve Edge değişmez; rules 9 hesabı bayt bayt aynı (1800 vuruşluk SHA-256 karşılaştırması: önce ve sonra aynı özet). Yeni davranış yalnız `kural10` (antrenman ve hedef ağı).

## 1. Oyun akıcılığı (frikikte kare kare takılma)
Ölçüm (Node + Skia CPU tuvali; telefon GPU'su farklı, göreli karşılaştırma): kare süresi önce ≈ 54-56 ms (bekleme) / 70-82 ms (koşu ve uçuş); sonra ≈ 28-35 ms / 45-60 ms. Üç neden bulundu:
- **Tribün her karede baştan çiziliyordu** (kalabalık şeritleri, atmosfer, bayrak bezi = kare süresinin ~%30'u). Artık ayrı bir tuvalde her 2. karede (en geç 100 ms'de bir) çizilir, aradaki karelerde tek `drawImage` ile konur. Tuval yalnız ekranın üst bölgesi kadar (tribün bölgesi, `tribunSinir`). Sahne, boyut, destekçi, gol heyecanı ve alay açılıp kapanınca hemen yenilenir. (`js/cizim.js`)
- **Kaleci ve oyuncu ağı ekrandaki boyuna göre sadeleşir:** uzak frikikte kaleci/oyuncu birkaç on piksel; ~1000-1200 üçgen çizmek boşuna. 140 px altı, 80 px altı iki kademe; yakın (penaltı) görünüm değişmez. (`js/kaleci3d.js`, `js/futbolcu3d.js`)
- **Top fiziği ön izleme ve vuruş hesabı ~2,2 kat hızlandı** (`acceleration` yeniden yazıldı: `apply/map/slice/concat` yok; işlemler ve sıra aynı → sonuç bayt bayt aynı). 28 m frikik: ok ön izlemesi 7,4 → 3,2 ms, vuruş hesabı 10 → 4,8 ms (tarayıcıya yakın Node, vm dışı). Frikik penaltının ~2 katı pahalıydı. (`js/ucus.js`)

## 2. Penaltıda "ortaya nişan + falso = her seferinde gol"
- Neden: rules 9'da kaleci vuruştan önce yön seçer (%43 sol, %43 sağ, %14 yerinde) ve dalış hep ±2,2 m; falsolu ortaya şut ±0,6-1,4 m bandına düşer, hiçbir kaleci konumunun menzilinde değil → ölçüm: 100/100 gol.
- Kural 10 (antrenman/hedef) kaleci: %24 yerinde, %38 sol, %38 sağ; dalışlar %55 tam (2,2 m), %45 kısa (1,0-1,9 m); yerinde kalan kaleci topu gördükten sonra yana kayar (en çok ±0,9 m). Ölçüm (100 tohum): ortaya düz %78, ortaya+falso %66-68 gol (önce 100), köşe %58-77 (önce %49-63). `js/kaleci.js` penaltiPlan, `js/fizik.js` (ek tohum).
- **Resmi kupa (rules 9) bu açığı hâlâ taşıyor** (ortaya + falso = %100). Kapatmak için yeni kural sürümü (rules 10) ve Edge yüklemesi gerekir; karar kullanıcıda. Kupa şu an kapalı.
- Frikikte ortaya falsolu şutlar zaten barajda kalıyor (ölçüm: ≤%5 gol), orada sömürü yok.

## Dosyalar
`js/cizim.js`, `js/kaleci3d.js`, `js/futbolcu3d.js`, `js/ucus.js`, `js/fizik.js`, `js/kaleci.js`, `index.html` (etiketler 20261011b), yeni `tests/kaleci-merkez.cjs`, `tests/tribun-katman.cjs`.

## Testler
- `kaleci-merkez.cjs`: kural 9 ortaya+falso ≥%95 (aynı), kural 10 %45-85.
- `tribun-katman.cjs`: katman üst bölge kadar, içerik sınırın içinde (3 ekran, 10 pozisyon, 5 destekçi), 4 karede ≤2 yeniden çizim.
- Denenmedi: gerçek telefon (kare hızı kazancı yalnız CPU tuvalinde ölçüldü), kalabalığın ~30 Hz hareketinin gözle kabul edilebilirliği.
