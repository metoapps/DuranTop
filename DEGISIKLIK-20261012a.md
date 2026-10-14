# Duran Top — 20261012a: hedef ağı gol hatası + rüzgâr, altın bölge, seri, yorumcu, rozetler, efektler

Esas: 20261011c. Fizik kuralı, sunucu ve kupa hesabı değişmez. Yeni oynanış katmanları yalnız antrenman ve hedef ağında (kupada yok). Edge'e dokunulmaz.

## 1. Hata: delikten geçen top "gol atamadı" gibi karşılanıyordu
- Nedeni: hedef ağında başarılı sonucun adı `delik` (puanı var, gol sayılıyor). 20261010b'de eklediğim alay özelliği "gol, direk golü ve direkten dönüş dışındaki her sonuç" için çalışıyordu; yani delikten geçen şutta "Yuh!" balonları ve "ah" sesi çıkıyor, gol sevinci, tribün bağırışı, ağ sesi ve flaş çıkmıyordu.
- Düzeltme: `golMu(r)` (gol, direkten gol, delik) tek noktadan tanımlandı; sevinç, tribün bağırışı, konfeti, ağ sesi, flaş, tekrar ve alay engeli hepsi buna bağlandı. Halkaya ve ağa çarpma alayla karşılanmaya devam eder.
- Test `hedef-delik-tepki.cjs`: düzeltme olmadan başarısız, düzeltmeyle geçiyor.

## 2. Rüzgâr (yalnız antrenman/hedef)
- Her vuruşa tohumdan (aynı vuruş aynı rüzgâr) 0–6,5 m/sn: %20 durgun, %55 orta, %25 sert. Fizik: sürtünme ve Magnus havaya göre bağıl hızla hesaplanır (yerde yuvarlanırken etkisiz). 6 m/sn yan rüzgâr: 28 m'de ≈1,1 m, 18 m'de ≈0,4 m, penaltıda ≈0,14 m sapma; arka/karşı rüzgâr topun yüksekliğini ±0,4–0,6 m oynatır.
- Ekranda yalnız ok + hız (sağ üst; ok yukarı = kaleye doğru). Yer oku rüzgârla sapan gerçek yolu gösterir. Tribün bayrakları ve flamalar rüzgâr yönüne yatar ve daha çok dalgalanır.
- Kural 9 ve kupa: rüzgâr yok sayılır (bayraksız çıktı birebir aynı, testte).

## 3. Altın bölge ve seri çarpanı (yalnız antrenman penaltı/frikik)
- Her vuruşta kalede tohumdan seçilen bir bölge (köşeler, üst orta, alt orta) altın yarı saydam çerçeveyle işaretlenir; golün geçtiği nokta içindeyse +3/+4 puan.
- Seri: arka arkaya gol çarpanı ×1,25 (2), ×1,5 (3), ×2 (4+); ek puan (taban+altın)×(çarpan−1) yuvarlanır. Kaçan şut seriyi sıfırlar. Ekranda 🔥 seri göstergesi; sonuç kartında "altın bölge +4 · seri ×1.5 +3".

## 4. Yorumcu bandı
- Her sonuçta kartta kısa esprili bir cümle: 10 sonuç türüne göre havuz; hız, falso, sert rüzgâr, seri ve altın bölge özel cümleleri öne çıkarır.

## 5. Rozetler ve istatistikler (yerel, tarayıcıda saklanır)
- 12 rozet: İlk Gol, Hız Canavarı (110+ km/sa), Sessiz Suikastçı (<55 km/sa gol), Falso Ustası, Köşe Kralı, Direk Dostu, Altın Ayak, Seri Katil (5), Rüzgâr Ustası, Frikik Sanatçısı, Delik Avcısı, Kusursuz Tur (10/10).
- Kazanılınca üstte altın bildirim. Menüde "Rozetler ve istatistikler": toplam vuruş/gol, en sert şut, en uzun seri, en iyi tur; kazanılmayanlar ipucuyla soluk görünür.

## 6. Efektler
- **Hız balonu:** vuruş anında büyük "118 km/sa" yazısı (renk hıza göre: beyaz, sarı, turuncu, kırmızı), yükselip söner.
- **Konfeti:** gol (ve delik) sonrası 4,5 sn renkli parça dökülür (150 parça; kademe 1'de 70; kademe 2'de yok).
- **Top izi:** hızlı topun arkasında sönen şerit (`AYAR.topIzi`, kademe 2'de yok).

## Testler
- Yeni: `hedef-delik-tepki`, `ruzgar`, `ruzgar-hud`, `bonus-yorum-rozet`, `bonus-akis`, `efektler`. Linux'ta 67/67 + e2e. Denenmedi: gerçek telefon; oynanış dengesi (rüzgâr şiddeti, altın bölge puanı, seri çarpanları) elde oynayarak ayarlanmalı: hepsi `js/ruzgar.js`, `js/bonus.js` içinde tek sayılar.

## Yayın
Yalnız site. Etiketler 20261012a (yeni: `ruzgar.js`, `bonus.js`, `yorum.js`, `rozet.js`).
