# Duran Top — 20261010f: akıcılık, geniş nişan, çok yavaş şut, kalecinin yavaş toplara tavrı

Esas: 20261010e. Kupa (rules 9), sunucu ve kupa sonuçları değişmez; yeni davranışlar yalnız `kural10` bayrağı altında (antrenman, hedef ağı). Eski kuralların tekrar hesabı bit düzeyinde aynı (rules6 hash testi ve 720 vuruşluk karşılaştırma geçiyor).

## 1. Frikikte akıcılık (ölçülerek)
- Top uçuşunun RK4 hesabı tüm hesabın ≈%80'iydi (her adımda onlarca küçük dizi, bir nişan için ≈35 uçuş çözümü). Yalnız kural 10 için dizisiz hızlı entegrasyon (`ucus.js` energyLaunch, sqrt, tek üstel terim, nişan çözümünde 1/60 sn adım): vuruş anı hesabı 45 → 14 ms, ok önizlemesi 26 → 7 ms; 900 vuruşta en büyük fark 0,6 µm, sonuç farkı 0.
- FIFA akışında artık kullanılmayan `onizlemeHesapla` (≈45 ms) her parmak hareketinde ve kilitlemede çalışıyordu; kapatıldı. Ok önizlemesi en çok ≈14 kez/sn yenilenir.
- "Meto Forever" pankartı ve direk bayrağı her karede 300+ üçgeni tek tek kırpıp çiziyordu (kare süresinin ≈%25'i): bayrak ağı 6×4, pankart 10×3, küçük bayraklar 5 dilim. Kaleci ekranda ≤85 px ise 6 kenarlı, kapaksız çizilir.
- Uçuş sırasında kare süresi 71 → 33 ms (masaüstü, yazılım çizimi; telefonda ölçülmedi). Önceki paketle birlikte frikik sahnesi 248 → ≈33 ms.

## 2. Nişan sınırı
- Antrenman/hedefte ±9 m (kupa ±4,5 m). Ölçüm: falso 28 m'de topu ≈6 m, 18 m'de ≈2,5 m, penaltıda ≈1–2 m saptırır. Aim 9,5 + falso 0,85 ile uzak köşeye girer; falsosuz aynı nişan auta gider.

## 3. Çok yavaş şut kısa kalır
- Neden: nişan çözücü, güç ne kadar düşük olursa olsun uzak hedefe ulaşmak için topu 60°'ye kadar yükseltiyordu ("otomatik lob"); güç %40'ta 28 m'de top 5,6 sn sonra 9 km/sa ile varıyordu.
- Kural 10: düz vuruşta çıkış açısı ≤32° (topun altına vurunca yine lob), ağır çim (yuvarlanma sürtünmesi 0,5·g), yerde ya da sekerek 3 m/sn'nin altına düşen top hemen durur (kaleye sürünerek varmaz). Kısa kalan şut gol değil, puan 0, "KISA KALDI".
- Sonuç: 28 m'de güç ≤%45, 18 m'de ≤%35, penaltıda yalnız %30 kısa kalır.

## 4. Kaleci yavaş toplarda uçmaz
- Varışa 1,2 sn'den fazla kalan toplarda kaleci topun hattına yürür (yan direğe kadar ±3,3 m), dik karşılar; alçak topa son 0,55 sn'de çömelir. Dalış yalnız yürüyerek yetişemeyeceği hızlı toplarda. Yavaş toplarda kasıtlı kaleci hatası yok.

## Testler
- Yeni `yavas-sut.cjs`; `kaleci-yavas.cjs` (yavaş topta uçma ≤%10, tutma ≥%85, alçak topa çömelme), `yon-ok.cjs` (nişan sınırı 9/9/4,5) güncellendi.
- Linux'ta 55/55 + e2e. Denenmedi: gerçek telefon kare hızı; yürüyen kalecinin görünümü.

## Yayın
Yalnız site; Edge yeniden yüklenmez (sunucunun içe aldığı `ucus.js`/`kaleci.js` değişti ama bayraksız çıktı aynı). Etiketler 20261010f.
