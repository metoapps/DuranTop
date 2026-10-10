# Duran Top — 20261010d: yavaş şutta kaleci davranışı

Esas: 20261010c. Kupa (rules 9), sunucu ve kupa sonuçları değişmez; yeni davranış yalnız `kural10` bayrağı altında (antrenman, hedef ağı). Edge'e dokunulmaz (sunucunun içe aldığı `js/kaleci.js` değişti ama bayraksız çıktı birebir aynı: eski sürüm koruma testleri ve 720 vuruşluk karşılaştırma geçti).

## Sorun (ölçüldü)
- Frikikte kaleci dalışı hep "topun varışından tam dalış süresi önce" başlatıyordu. Yavaş şutta bu, topun uçuşu boyunca (güç %45'te uzak frikikte 4,2 sn'nin ilk 3,6 sn'si) kalecinin hiç kıpırdamaması, sonra durağan hâlden birden fırlaması demekti. Topun hattından uzakta ortalama durgunluk: güç %40'ta 3,1 sn, %50'de 1,6 sn, en uzunu 5 sn.
- Yavaş top yerde sekince kalecinin gözlemi kesiliyor, dalış planı güncellenemiyor; bu yüzden bazen dalışa geç başlayıp golü yiyordu.
- Penaltıda kaleci yönü vuruştan önce seçip hemen yere yatıyordu: güç %30'da top gelmeden 0,5 sn'den fazla önce yatma %95, güç %40'ta top gelirken kalkmaya çalışma %58.

## Düzeltme (`js/kaleci.js`, yalnız kural 10)
- **Frikik:** kaleci vuruşu okuduktan sonra (≈0,3 sn) topun hattına yan adımla yürür (2,8 m/sn), dalışa o yerden başlar (kısa, doğal). Dalış hâlâ topun varışına göre önceden zamanlanır, ama yer sekmesiyle gözlem kesilse bile geç kalmaz (pay 0,12 sn).
- Elle karşılama yalnız top elin ulaşabileceği yerdeyse (yanal <0,35 m, yükseklik 0,6–1,5 m); yoksa dalış.
- **Yavaş penaltı** (top varışı 0,9 sn'den geç, güç ≈%45 altı): kaleci yere yatmaz, topu izler (frikikteki gibi). Hızlı penaltıda yön vuruştan önce seçilir (rules 9) ve değişmez.
- **Görüntü** (`js/kaleci3d.js`): yürürken ayaklar sırayla kalkar (yerde kayma yok); eldiven, baş ve gövde fizik yerinde.

## Ölçümler (yavaş şut, güç %40–60, frikik; eski → yeni)
- Topun hattından uzakta durgunluk: ortalama 3,1/1,6/0,9 sn → 0,05/0,00/0,00 sn; en uzunu 5,0 → 0,23 sn. İlk hareket vuruştan en çok 0,34 sn sonra (eski 5,4 sn).
- Gol oranı aynı: %3/%4/%3 → %2/%4/%3. Eski kalecinin kurtardığı yavaş şuttan yeni kalecinin gol yediği vaka yok (323 karşılaştırma).
- Hızlı şut (güç %80–100): 1.920 vuruşta yalnız 2 sonuç farkı, ikisi de kalecinin kurtardığı üst köşe.
- Yavaş penaltı (güç %30–40): top gelmeden yere yatma %95/0 → %0; kalkmaya çalışma %58 → %0. **Gol oranı %78–87 → %0**: yavaş penaltı artık her zaman kurtarılır. Güç %50'de (varış 0,77 sn) eşik aşılmaz, gol oranı %86 olarak kalır; yani %45–50 civarında keskin bir sınır var. İstenirse eşik (`0,9` sn) ayarlanır.

## Testler
- Yeni `kaleci-yavas.cjs`: yavaş frikikte donma yok (hatta varmadan durgunluk ≤0,25 sn), ilk hareket ≤0,6 sn, dalış topun varışından en çok 0,13 sn sonra ve 0,4 sn'den fazla önce bitmez, ışınlanma yok, yürüyüş ≤3 m/sn, gol oranı ≤%8; yavaş penaltıda erken yere yatma ve kalkma yok; hızlı penaltıda yön önceden seçilir; kural 10 kapalıyken eski davranış; yan adımda ayaklar sırayla kalkar, kemik boyları sabit.
- Linux'ta 54/54 + e2e. Denenmedi: gerçek telefon; yürüme animasyonunun gözle doğal görünmesi.

## Yayın
Yalnız site. Etiketler 20261010d (`kaleci.js`, `kaleci3d.js`).
