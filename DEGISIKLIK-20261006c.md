# Juninho Kupası — 20261006c: FIFA 2003 tarzı frikik

Esas: 20261006b. Yalnız frikik (5 vuruş). Penaltı değişmez. Kural sürümü aynı (rules 9); sunucu, SQL, fizik, kaleci, puan değişmez. Sunucuya giden girdiler aynı: nişan, temas, güç, zamanlama, duruş.

## Akış (frikik)
1. Duruş (ok tuşları / hazır düğmeler) — aynı.
2. **Nişan**: topun önünden kaleye uzanan yarı saydam beyaz yer oku + kalede kırmızı-beyaz hedef halkası. ◀ ▶ basılı tut: yön (2 m/sn), ▲ ▼: yükseklik (1 m/sn). Kaleye dokunmak da nişanı taşır ama kilitlemez; "Kilitle" ile kilitlenir. Klavye: oklar + Enter. Başlangıç nişanı orta, 1,6 m.
3. **Falso**: topun neresine vurulacağı (eski temas paneli). Seçilen nokta sayacın ortasındaki topta kırmızı nokta olarak görünür.
4. **Güç + isabet sayacı** (yuvarlak gösterge): VUR basılı tutulunca güç %30→%100 dolar (1,1 sn), fazla tutulursa geri düşer. Bırakınca ibre güç noktasından geriye döner; yeşil bölgede tekrar basılır. İbre sona varırsa vuruş en kötü zamanlamayla (1) yapılır. Klavye: boşluk tuşu.
- Antrenmanda zamanlama çubuğu kapalıysa bırakınca hemen vurur.

## Bilerek yapılan farklar
- Frikikte kesik çizgili tahmini uçuş ve sarı halka gösterilmez (FIFA 2003'te yok). Bu, frikiki eskisinden zorlaştırır.
- Güç paneli frikikte yok; güç sayaçtan gelir. Yeşil bant genişliği eski hesapla aynı (`DT.zamanBandi`), ibre hızı eski çubukla aynı (0,8 sn). Fark: ibre bir kez geçer, tekrar dönmez.
- FIFA'daki vuruştan sonra topu yönlendirme (aftertouch) yok: sonuç vuruştan önce sunucuda hesaplanıyor.

## Testler
- `akis.cjs`: frikiklerde güç paneli yok, dokunma kilitlemez, ok hızı ve sınırlar, kilitle, falso seçilmeden sayaç başlamaz, nişanı değiştir, yarım dolu güç ≈%65, bırakmak vurmaz, yeşilde bas → zaman 0,5, ibre sona varınca zaman 1; gönderilen girdilerde güç ve zaman doğrulandı.
- Linux'ta 43/43 + e2e geçti. Sahne ve sayaç kareleri başsız çizimle incelendi.
- Denenmedi: gerçek telefon, gerçek parmakla basılı tutma, başsız tarayıcı turu.

## Yayın
Yalnız site. Etiketi değişenler 20261006c (`css/stil.css`, `js/cizim.js`, `js/oyun.js`). Hafta ortasında yayınlanırsa aynı haftada iki farklı frikik arayüzü olur.
