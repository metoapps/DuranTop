# Gol spikeri: yapay zekâ sesiyle kayıt rehberi

Gol olunca **maç anlatan bir spikerin bağırışı** çalar ("Goooooool!", "Gollllaaaazzzoooo!"). Bu sesler oyunun içinde üretilemez; bir yapay zekâ ses aracıyla (ElevenLabs gibi) sen üretip klasöre koyarsın, oyun otomatik bulur. Dosya yoksa gollerde ses çalmaz (konuşma sentezi KULLANILMAZ), yalnız tribün balonları ve gol uğultusu olur.

## Dosya adları (assets/ses/ klasörüne)
- `spiker-gol-1`, `spiker-gol-2`, … (en çok 8): sıradan goller
- `spiker-gollazo-1`, `spiker-gollazo-2`, … (en çok 8): büyük goller (sert şut, falso, köşe, altın bölge, direkten gol, uzak frikik, 3+ seri)
- Uzantı: `.mp3`, `.m4a`, `.ogg` ya da `.wav`. **Numaralar 1'den kesintisiz** gitsin (3'ü atlarsan 4 ve sonrası yüklenmez).
- Her kayıt 2–5 saniye, başında/sonunda boşluk olmasın.

## Aracı nasıl ayarlarsın
- Türkçe, **erkek, spiker tonunda** bir ses seç (ya da sesini klonla).
- Kararlılık (stability) **düşük**, stil/abartı (style exaggeration) **yüksek**, hız normal-hızlı: bağırarak, coşkulu çıkması için.
- Aracın duygu/etiket desteği varsa metnin başına `[bağırarak]` ya da `[shouting]` ekle.
- Her metinden 3–4 deneme üret, en iyisini al. Uzun "oooo/aaaa" için harf uzatmak işe yarar.

## Üretilecek metinler (kopyala-yapıştır)
**spiker-gol-N** (sıradan goller):
1. `Vuruuuuş... GOOOOOOOOOOOOOOOL!`
2. `Gooooooooooooool! Gooooooooool!`
3. `İçeriiiiiide! GOOOOOOOOOL!`
4. `Ağlarla buluştu! Gooooooooooool!`
5. `Evet evet evet! GOOOOOOOOL!`

**spiker-gollazo-N** (büyük goller):
1. `GOOOOOOOOOLLLLLL! Gollllllaaaaaaazzzzzoooooooooo!`
2. `Ne vuruuuuuş! Ne gooool! Gollllaaaaazzzoooooo!`
3. `İnanılmaz! İnanılmaz! Gooooooooool! Gollllllaaaazooooo!`
4. `Süper, süper, süper vuruş! GOOOOOOOOLLLLLL!`

(Sadece "Gooool" ve "Gollazo" istiyorsan yalnız 1 ve 2'yi üret; ne kadar çok farklı kayıt olursa o kadar az tekrar eder.)

## Kontrol
Telefonda adrese `?sestest=1` ekle → "Sesi aç" → "Kayıt durumunu yenile": "Spiker kayıtları: gol N adet, gollazo M adet" yazmalı. "Spiker: gol" ve "Spiker: gollazo" düğmeleri kaydı çalar.
