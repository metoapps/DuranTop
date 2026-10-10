# Duran Top — 20261010a: her aşamada FIFA falso sistemi, ibreye ikinci şans, hareketli tribün ve ağlar

Esas: 20261009c. Kupa (rules 9), sunucu ve fizik değişmez. Sunucuya giden girdiler aynı (nişan, temas, güç, zamanlama, duruş). Edge'e dokunulmaz.

## 1. Falso sistemi tüm aşamalarda
- Penaltı, frikik ve hedef ağı artık aynı akışı kullanır: duruş → ◀▶▲▼ ile nişan (yer oku) → Kilitle → topun neresine vuracağın (falso) → VUR'u basılı tut (güç) → ibre.
- Yer oku her aşamada topun gerçek uçuş yolunu izler: falso verince eğilir, alt temasta havaya kalkar. Hedef halkası kalktı.
- Hedef ağında oka en yakın delik sarı yanar (hangi deliği hedeflediğin görünsün).
- Penaltıda başlangıç nişanı biraz alçak (1,3 m), diğerlerinde 1,6 m. Eski güç çubuğu paneli ve dokun-bırak-kilitle akışı kalktı.

## 2. İbreye ikinci şans
- İbre yeşilden aşağı iner (1. şans), sonra yukarı geri döner (2. şans). İkisi de bitince vuruş en kötü zamanlamayla (0) yapılır. Önceden tek geçişti.
- Ayar: kural 10'da süre güçle kısalır (%100 güçte 0,62 sn/geçiş), kupada 0,80 sn.

## 3. Tribün hareketli (`js/cizim.js`, `js/tribun.js`)
- Seyirciler her sırada ayrı şerit olarak çizilir (iki kare: normal, kollar havada). Herkes kendi ritminde zıplar, gruplar kollarını kaldırır, ~11 sn'de bir "Meksika dalgası" geçer, gol olunca herkes zıplar ve kollar havada.
- Bayraklar daha fazla (en çok 14), daha hızlı ve geniş sallanır; flamalar da.
- Hareketi azalt ayarında tribün ve bayraklar durgun.

## 4. Hareketli ağlar (`js/ag.js`, yeni; `js/cizim.js`, `js/hedef.js`)
- Kale ağı beş yüzey: arka ağ, sol/sağ yan ağ, tavan, hedef ağı modunda delikli ağ. Her biri yaylı bir zar (dalga hızı 3,4 m/sn, sönümlü).
- Top bir yüzeye ilk değdiğinde çarpma hızıyla orantılı darbe verilir: 28 m/sn şut arka ağı ≈0,4–0,5 m göçürür, yavaş top (4 m/sn) ≈0,06 m. Komşu yüzeyler de sarsılır ("bütün ağlar"), ağ ≈5 sn içinde söner.
- Arka ve delikli ağda düğümler çarpma noktasına doğru çekilir (ızgara büzülür). Top ağla birlikte gömülür.
- Delikten geçen top delikli ağı sallamaz; halkaya ya da ağa çarpan sallar.
- Yalnız hareket sürerken yeniden çizilir; sönünce durgun görüntüye birebir döner. Görüntü: sonuç hesabına karışmaz.

## Testler
- Yeni: `ag.cjs` (göçük, salınım, sönüm, komşu yüzeyler, yan ağ/tavan, delik/halka, çizimde değişim ve durgunlaşma), `tribun-hareket.cjs`.
- Güncellenen: `akis.cjs` (FIFA akışı 10 vuruşta, ibre ikinci geçişte vuruş, iki geçişte zaman aşımı), `hedef.cjs`, `kupa-kapali.cjs`, `yon-ok.cjs`, `direk-sonuc.cjs`.
- Testin yakaladığı hata: ağ durgun hâle dönerken eski çizgiler silinmiyordu (düzeltildi).
- Linux'ta 52/52 + e2e. Denenmedi: gerçek telefon (kare hızı, ağ ve tribün maliyeti), parmakla basılı tutma.

## Yayın
Yalnız site. Etiketler 20261010a (`ag.js` yeni, `cizim.js`, `oyun.js`, `hedef.js`, `tribun.js`).
