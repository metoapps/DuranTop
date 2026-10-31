# Duran Top — 20261026a: penaltı ortası açığı (kural 14), canlı Meto/LORT tepkileri, kırık kol, gerçekçi kaleci dalışı, girişsiz modlar

Esas: canlı `main` 2e4e4f8.

## 1. Penaltıda "ortaya at = her zaman gol" açığı kapandı (KURAL 14)
- Ölçüm (kural 13): kupada ortaya/orta-üste atılan penaltı her güçte %100 gol (kaleci yalnız %8 yerinde kalıyor, kalınca topa kaymıyordu); antrenmanda %93–95.
- Kural 14: kaleci %38 yerinde kalır ve topu görüp kayar. Kupada ortası %72, köşeler %72–85, toplam ≈%77 (gerçek penaltılara yakın). Antrenmanda ortası %71.
- **Sunucu (backend/index.ts) güncellendi:** kural 14'ü kabul eder ve `kurallar:14` duyurur. İstemci kural 14'ü YALNIZ sunucu bunu duyurunca gönderir; sunucu yüklenmeden kupa kural 13'le çalışmaya devam eder (bozulmaz). Kural 13 ve eski kayıtlar birebir aynı tekrarlanır.

## 2. Gol olmayan sonuçta Meto artık heykel değil
- Direkten dönünce: "olamaz!" (eller başta) → alkış → "bir daha!" yumruğu ve sekme. Kaçırmada: omuz silkme ve "yok yok" → alkış → sekme. Sonra ritmik sekmeli MUTLU bekleme; uzun beklemede her ≈4 sn'de kısa alkış. Gol sonrası bekleme de canlandı.

## 3. Meto 1. sevinçte "kırık kol" düzeldi
- Yayında karelerin %39'unda önkol yüzün önüne sarkıyordu. Şimdi: zıplamalarda yumruk dümdüz göğe, aralarda "bicep", sol kol belde "evet!". 0 kare.

## 4. Kaleci yatay hâlde yükselmiyor (kural 14 ve kupa dışı modlar)
- Ölçüm: 3.402 dalış örneğinin 292'sinde kaleci yere paralel hâlde itişsiz yükseliyordu. Şimdi çömelme → itiş → yerçekimiyle parabol; gövde itişle yatar. 0 örnek; çıkış hızı ≤ 3,7 m/sn. Frikik gol oranı değişmedi (600 rastgele frikikte %4,7 → %4,2).

## 5. LORT kaçırmada da 3B
- Golde 3B gövde, kaçırmada eski 2B karikatür resme dönüyordu. Artık kaçırmada da aynı 3B gövde ve kendi tepkisi (direk / kaçırma).

## 9. Kupa dışı modlar girişsiz
- Hedef ağı, Günlük ve Hayatta kal artık antrenman gibi girişsiz (karakter seçilir). Yalnız kupa giriş ister.

## İstekler
- Ağır çekim 120 km/sa VE ÜZERİ (119'da yok).
- Toptan alev YALNIZ 120 km/sa üstünde VE ibre yeşili yakaladıysa.
- Baraj oyuncuları zıplarken kollar AŞAĞIDA (eller önde kenetli); blok yüksekliği yalnız sıçrama kadar artar.

## Testler
Yeni: `penalti-merkez`, `meto-kirik-kol`, `kaleci-balistik`, `sonuc-tepki`, `istekler-20261026`. Güncellenen: `baraj-gorsel`, `lort-anatomi`, `sert-sut-sinema`, `yavas-cekim`, `ses-kayit-tam`.
**Denenmedi:** gerçek telefon; sunucuda kural 14 (yüklenmedi).

## Yapılmayan
MakeHuman/meshoptimizer ile diğer oyuncular ve baraj yüzleri (ayrı iş; oyuncular için fotoğraf/ana model gerekir). 10–12 numaralı küçük maddeler.

## Yayın
Site: `main`'e birleştir (Pages). Sunucu: `backend/index.ts` Edge fonksiyonu yeniden yüklenmeli (kural 14 için). Sıra fark etmez: sunucu yüklenmeden istemci kural 13'te kalır.
