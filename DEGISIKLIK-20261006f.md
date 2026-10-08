# Juninho Kupası — 20261006f: kupayı kapatma anahtarı

Esas: 20261006e. Fizik, puan, kural sürümü (rules 9) ve veritabanı değişmez. SQL yok. Hiçbir kayıt silinmez.

## Sunucu (`backend/index.ts`)
- Yeni anahtar: Edge ortam değişkeni `DT_CUP_OPEN`. Yalnız `1` iken yeni katılım (`join`) ve vuruş (`shot`) kabul edilir. **Varsayılan kapalı**: bu Edge yüklendiği an kupa kapanır.
- Kapalıyken `join` ve `shot` hak harcamadan `CLOSED` döner: "Juninho Kupası şu an kapalı. Vuruş hakkın harcanmadı. Antrenman modunda oynayabilirsin."
- Giriş, çıkış, durum ve puan tablosu çalışmaya devam eder. Durum yanıtına `kupaAcik` alanı eklendi.
- Yeniden açmak: `supabase secrets set DT_CUP_OPEN=1` (kod değişikliği gerekmez). Kapatmak: değişkeni sil ya da `0` yap.

## İstemci (`js/oyun.js`, `js/canli.js`)
- Sunucu `kupaAcik:false` derse menüde "Kupa kapalı", düğme pasif, açıklama satırı bilgi verir; antrenman açık.
- Alan yoksa (eski sunucu) kupa açık sayılır: Edge ve site hangi sırayla yüklenirse yüklensin bozulmaz.
- Tur sırasında kupa kapanırsa `CLOSED` uyarısı gösterilir, menüye dönülür; bekleyen istek silinir (kapanınca eski nişan sonradan gönderilmez).

## Testler
- `kimlik-haftalik.cjs`: kapalıyken katılım ve vuruş `CLOSED`, sahte veritabanında hiçbir kayıt değişmez, durum ve tablo gelir; anahtar `1` olunca yeniden açık.
- Yeni `kupa-kapali.cjs`: menü etiketi/pasif düğme, tıklama tur başlatmaz, antrenman açık, tur içinde `CLOSED` menüye döner.
- Linux'ta 45/45 + e2e geçti. Gerçek Supabase'de denenmedi.

## Yayın
1. Edge `duran-top-live` (`backend/index.ts`) yüklenir → kupa kapanır. `DT_CUP_OPEN` tanımlamayın.
2. Site: `oyun.js`, `canli.js` → 20261006f.
