# Duran Top — 20261011a: telefonda ölçüm ve kademeli kalite

Esas: 20261010g. Oyun kuralı, fizik, sunucu ve kupa değişmez; yalnız istemci ölçümü ve çizim.

## 1. Gizli performans göstergesi ve rapor (`js/perf.js`, yeni)
- Oyun döngüsü her kare süresini faza göre toplar: menü, nişan, uçuş, sonuç. Faz başına kare sayısı, ortalama, p95, en uzun kare, yavaş (>50 ms) ve takılma (>120 ms) sayısı. Sekme arka plandayken gelen >1 sn kareler sayılmaz.
- Olaylar ayrıca ölçülür: **pozisyon açılışı** (önizleme hesabı + baraj sprite üretimi) ve **vuruş hesabı**. Hâlâ takılma varsa nerede olduğunu gösterir.
- Açma: adresin sonuna `?perf=1` ekle, ya da oyun ekranında **puana 3 sn içinde 5 kez dokun** (tekrar 5 dokunuş kapatır). Açıldıktan sonra kayıtlı kalır.
- Sol üstte küçük gösterge: `FPS 60 · ort 16.6 · p95 20.3 · maks 26.6 · K0`. **Göstergeye dokununca rapor çıkar** (panoya kopyalanır; kopyalanmazsa metin kutusunda seçili, uzun basıp kopyala). Rapor cihaz, ekran, tuval çözünürlüğü, çekirdek, bellek ve faz tablosunu içerir.
- Gerçek tarayıcıda (Chromium) açıldığını ve rapor ürettiğini doğruladım; konsolda bizim hatamız yok.

## 2. Kademeli kalite (kalite() = 0, 1, 2)
- Kare süresi uzun kalırsa (son 90 karenin ortalaması >26 ms ya da p95 >45 ms; ilk karar için ≈3 sn, kararlar arası ≥180 kare) süsler sadeleşir; ≈15 sn akıcıysa geri döner. Çözünürlük (DPR) kararı cizim.js'te ayrı çalışmaya devam eder.
- Kademe 1: kalabalık daha az çizimle hareketlenir, ikinci flama dizisi ve bayraklar azalır (en çok 8), pankart daha seyrek ağ, ağ görüntüsü 2 karede bir yenilenir.
- Kademe 2: kalabalık durgun (sıra başına tek çizim), en çok 4 bayrak, elde bayrak ve kişisel pankart çizilmez. Alay balonları ve kalabalığın alaycı duruşu yine çalışır.
- Oyun alanı (oyuncu, kaleci, baraj, top, ağ fiziği) her kademede aynıdır; yalnız süsler sadeleşir (test: piksel düzeyinde aynı).
- `?kalite=0|1|2` kademeyi sabitler (denemek için).

## 3. Bulunan ve düzeltilen gerçek yük (pankart/bayrak)
- Ölçümde pankart ve elde taşınan bayrak kare süresinin ≈%75'ini yiyordu: her üçgen için tüm doku kırpılıp yeniden çiziliyordu (alan yüzlerce kez boyanıyordu). Artık her ızgara hücresi yalnız kendi doku parçasını afin dönüşümle çiziyor. Görüntü aynı (yakından kontrol edildi), maliyet ≈1/50.
- Sahne (masaüstü, yazılım çizimi): ≈33 → ≈12–17 ms/kare (kademe 0). Kademe 2 ≈7 ms. Telefonda ölçülmedi: bunun için gösterge var.

## Testler
- Yeni `perf.cjs` (faz istatistiği, p95, olaylar, rapor, gizli gösterge, ?kalite/?perf, kademe kararı, entegrasyon), `kalite-dekor.cjs` (çizim sayısı 359 → 236 → 80, kademe 2'de tribün durgun, oyun alanı aynı, alay görünür).
- Linux'ta 57/57 + e2e.

## Yayın
Yalnız site. Etiketler 20261011a (`perf.js` yeni, `cizim.js`, `oyun.js`, `tribun.js`, `css/stil.css`).
