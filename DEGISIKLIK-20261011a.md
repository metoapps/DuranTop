# Duran Top — 20261011a: tribün tepkilerine üç yeni yorum

Esas: paket-20261010e. Kupa (rules 9), sunucu, fizik ve Edge değişmez. Yalnız çizim.

## Değişen
- Kaçan şutta tribünden yükselen 5 yorumluk balonlara (aut, kısa, kaleci kurtarışı, baraj, hedef ağı, halka) üç yeni yorum eklendi:
  - "Senin ayağının dümenini skeyim"
  - "Ebenin amk yayım ya!"
  - "Çekeceğin şutun anasını avradını skeyim"
- Her sonuç türünde 5 yorumdan en az ikisi bu üçünden; kalan yerler eski yorumlarda (Yuh!, Çüş!, Nereye vuruyon? vb.). Eski yorumlardan "Çüş!" ve "Hadi canım!" bazı türlerde çıkarıldı, yer açmak için.
- Uzun yorum küçük ekrana sığsın diye balon yazı tipi gerekirse küçülür (genişlik W−28 px sınırı, en az 8 px).

## Dosyalar
`js/cizim.js` (ALAY tablosu, alayBalon), `index.html` (cizim.js etiketi 20261011a), yeni `tests/alay-metin.cjs`.

## Test
`alay-metin.cjs`: altı sonuç türünde tam 5 yorum, tekrarsız, her türde en az iki yeni yorum, üçü de kullanılıyor, 320–430 px ekranda sığma hesabı. Gerçek telefonda küçülen yazının okunabilirliği denenmedi.
