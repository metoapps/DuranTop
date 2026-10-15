# Duran Top — 20261016a: kullanıcı düzenlemeleri (rüzgâr ibresi, durmadan koşu, kaleci, baraj, altın bölge, delik, tribün)

Esas: 20261015a. Fizik kuralı, sunucu ve kupa hesabı değişmez (rules6-koruma ve kural10 bit düzeyi karşılaştırması geçiyor). Edge'e dokunulmaz.

## 1. Rüzgâr ibresi
Büyük kadran (54 px) ve ok, büyük hız rakamı (32 px) + "m/sn", şiddet etiketi (DURGUN / ORTA / SERT). Ok hızla büyür; sert rüzgârda turuncu ve nabız atar.

## 2. Koşu: oyuncu vuruştan önce durmuyor
- Eskiden gövde basma ayağında duruyor, sonra vuruyordu. Şimdi koşu başladıktan sonra hız temasa kadar hiç düşmüyor; temasta penaltıda ≈3,4 m/sn, frikikte ≈2,7 m/sn; vuruştan sonra da yavaşlayarak koşmaya devam ediyor (0,3–1 m).
- Basma ayağı topun yanına basıp dünyada sabit kalıyor (gövde üstünden geçiyor); son adımda kalça çömeliyor (bacak erişimi için). Koşu yolu atış doğrultusuna hizalı kavisli. Geri adım hızı ≤4,5 m/sn.
- Test (`kosu.cjs`) "durmadan"ı kilitliyor: koşu hızı temasa kadar düşmez, temasta ≥2,3 m/sn, basma ayağı kayma <2 cm ve yerde, geçişlerde sıçrama yok.

## 3. Kaleci
- **Eldiven:** tek küre yerine avuç + 4 parmak + başparmak. Parmaklar dururken gevşek/bitişik, dalış-kurtarış-blokta açık (yelpaze). Parmaklar çizgi olarak çizilir (üçgen olsaydı kare süresi 12 ms → 45 ms'ye çıkıyordu; ölçüp çizgiye çevirdim, şimdi ≈14 ms).
- **Anatomi:** kol omuzda kalın, bilekte ince; V gövde; ayrıntı ≥1'de deltoid ve trapez, kulaklar.
- **Yüz:** değişmedi (fotoğraf dokusu). Daha gerçekçi yüz için daha iyi bir ön yüz fotoğrafı gerekir.

## 4. Baraj
- **Akıllı karar (kural 10):** hedef yüksekliğine bakar (zorlukla daha çok): yüksek hedefte hep zıplar, alçak hedefte çoğu oyuncu zıplamaz ve elleriyle kasığı korur.
- **Net sıçrama:** atıştan hemen önce (0,02–0,14 sn), zıplayanlar ±0,03 sn farkla eşzamanlı, zirve 0,41–0,55 m (eskiden 0,26–0,40), kollar başın üstünde (çarpışma yüksekliği de buna göre).
- **Hareketli:** üç poz (duruş, çömelme, havada: kollar yukarı, dizler toplu); duruşta nefes, ağırlık aktarma ve arada adım düzeltme.
- Maliyet: ek pozlar düşük ayrıntıyla ve arka planda üretilir (hazır değilse duruş çizimi; açılışta takılma yok).

## 5. Altın bölge
Küçük daire (yarıçap 0,42–0,5 m), +4/+5 puan. Yalnız penaltı ve frikikte; hedef ağında, delikli kale aşamasında, günlük ve hayatta kal'ın hedef vuruşlarında yok (tüm modlarda testle doğrulandı).

## 6. Delikli kale
Delik sayısı 14 → 6 (üstte 3: iki büyük köşe + küçük orta; ortada 2; altta 1). Puanlar aynı.

## 7. Tribün seslendirmesi
- Gol sözleri ≈60 cümlelik havuzdan, bağlama göre (altın bölge, direk, falso, köşe, sert şut, uzak frikik, seri, penaltı): her gole 1 nida + 1 favori (senin 4 cümlen) + 1 bağlam + 2 genel/esprili. Kaçan şutlarda her sonuç için 12'şer alay cümlesi, her seferinde 5'i.
- Konuşma sentezi 3 söz art arda okur: ilk bağırış daha yüksek perdeli ve hızlı, Türkçe sesler dönüşümlü. **Robotik kalır**; gerçek ses için `assets/ses/KAYIT-REHBERI.md` (arkadaşlarla kaydet, `tez-1…tez-24`).

## Testler
Yeni: `baraj-poz`, `kaleci-eldiven`; güncellenen: `kosu`, `baraj-gorsel`, `gol-tezahurat`, `hedef`, `ag`, `ruzgar`, `ruzgar-hud`, `bonus-*`, `modlar-akis`, `hedef-delik-tepki`. Linux'ta 76/76 + e2e. **Denenmedi:** gerçek telefon (koşunun canlı akışı, barajın hareketi, kaleci eldivenin küçük ekranda görünüşü), baraj denge etkisi.

## Yayın
Yalnız site. Etiketler 20261016a (`baraj`, `baraj3d`, `bonus`, `cizim`, `fizik`, `futbolcu3d`, `hedef`, `kaleci3d`, `oyun`, `tezahurat`, `css/stil.css`).
