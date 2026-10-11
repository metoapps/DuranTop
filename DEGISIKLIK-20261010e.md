# Duran Top — 20261010e: frikikte akıcılık, gerçekçi baraj

Esas: 20261010d. Kupa (rules 9), sunucu ve kupa sonuçları değişmez; yeni baraj kurulumu yalnız `kural10` bayrağı altında (antrenman). Edge'e dokunulmaz (sunucunun içe aldığı `js/baraj.js` ve `js/fizik.js` değişti ama bayraksız çıktı birebir aynı: eski sürüm koruma testleri geçiyor).

## 1. Frikikte "kare kare" akış
- Neden: baraj oyuncuları (dört kişi, kişi başına ≈4.000 üçgen) her karede sıfırdan çiziliyordu. Ölçüm (masaüstü, yazılım çizimi; telefon değil): frikik sahnesi 248 ms/kare, bunun ≈190 ms'si baraj, ≈50 ms'si kaleci. Penaltıda baraj olmadığı için akıcıydı.
- Düzeltme (`js/baraj3d.js`): her baraj oyuncusu BİR kez bir tuvale çizilir (önbellek), her karede tek `drawImage`. Zıplama sprite'ın dikey kaydırılması, gölge ayrı. Sprite'lar pozisyon açılırken üretilir (`barajIsit`), vuruş sırasında takılma olmasın. Kamera/sahne/çözünürlük değişince önbellek boşalır.
- Kaleci çizimi de hafifletildi (`js/kaleci3d.js` ayrıntı düzeyi 1: 8 kenarlı uzuvlar, küçük eklem küreleri, 2×2 yüz): ≈50 → ≈20–35 ms.
- Sonuç: frikik sahnesi 248 → ≈60 ms/kare (≈4 kat). Baraj artık ≈1 ms. Telefonda ölçülmedi; kare hızı telefonda sende görülecek.

## 2. Gerçekçi baraj kurulumu (kural 10)
- Oyuncu sayısı mesafeye göre: <19 m 5 kişi, <26 m 4, daha uzak 3 (önceden hep 4).
- Omuz omuza (0,52 m), boylar 1,74–1,94 m arası dağılır, küçük hizalama hataları; hepsi pozisyondan türer (önizleme ve vuruşta aynı baraj), zıplama seed'den (orta %92, kenar %60, en az 2).
- **Yakın direk hattını örter:** baraj merkezi yana kayar, dış oyuncu topun yakın direğe giden hattına gelir (yakın frikikte hat 4,30 m'de, dış oyuncu 4,23 m'de). Eski kurulum (kural 9) bu hattı bazı pozisyonlarda >0,5 m kaçırıyordu.
- Önizleme barajı artık vuruştakiyle aynı kurulumla hesaplanır (önceden antrenmanda önizleme eski kurulumdu).

## 3. Daha gerçekçi çizim (baraj)
- Altı farklı oyuncu: farklı ten, saç stili, kaş/göz, sakal/bıyık, kulak, boy ve beden. Yüzler kodla çizilir (fotoğraf değil).
- Daha oranlı vücut: yuvarlak omuzlar (omuz pedi yok), kafa %12 küçük, beyaz şort bandı ve uyluğun ortasına kadar şort (altı ten), beyaz çorap (dizde top gibi şişme yok), siyah krampon, eller önde kenetli.
- Ayrıntılı çizim (ayrıntı düzeyi 2) önbelleğe alındığı için maliyet yok.

## Testler
- `baraj-gorsel.cjs` yeniden yazıldı: kural 9 eskisi gibi; kural 10'da sayı 5/4/3, aralık, boylar, seed'den bağımsız konum, yakın direk örtüsü (ve kural 9'un kaçırdığı), zıplama istatistiği, 6 farklı yüz, sprite önbelleği (yerde ve havada tekrar çizilmez, sürüm değişince boşalır, `barajIsit` önceden üretir, zıplayınca ≈28 px yükselir).
- Linux'ta 54/54 + e2e. Denenmedi: gerçek telefon kare hızı, sprite üretiminin telefondaki ilk-açılış maliyeti.
- Sınırlar: zıplarken dizler toplanmıyor (sprite kayıyor); barajda oyuncu sayısı 5'e çıkınca daha çok şut barajdan döner (antrenmanda gol dengesi değişir).

## Yayın
Yalnız site. Etiketler 20261010e (`baraj.js`, `baraj3d.js`, `fizik.js`, `kaleci3d.js`, `cizim.js`, `oyun.js`).
