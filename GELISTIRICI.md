# Duran Top — geliştirici notları

Bu dosya, sohbetler arası devirde kaybolan bilgiyi toplar. Önce bunu oku, sonra ilgili dosyaya git.

## 1. Mimari (dosya haritası)
| Dosya | Rol |
|---|---|
| `js/oyun.js` | Akış ve durum makinesi: ekranlar, modlar, vuruş, sonuç, tur sonu, ayarlar, HUD |
| `js/ucus.js`, `js/fizik.js` | Top uçuşu (hızlı RK4, Magnus, rüzgâr), vuruş sonucu hesabı |
| `js/kaleci.js`, `js/baraj.js` | Kaleci planı (penaltı/frikik/seviye), baraj kurulumu |
| `js/hedef.js`, `js/ag.js` | Hedef ağı (delikli) ve kale ağı fiziği |
| `js/cizim.js` | Tuval çizimi: sahne, oyuncu, top, ok, altın bölge, zoom, efektler |
| `js/futbolcu3d.js`, `js/kaleci3d.js`, `js/baraj3d.js`, `js/model3d.js` | Prosedürel 3B figürler ve animasyon |
| `js/tribun.js`, `js/tezahurat.js`, `js/sevinc.js` | Atmosfer, tezahürat sesi, gol sevinci |
| `js/ruzgar.js`, `js/bonus.js`, `js/yorum.js`, `js/rozet.js`, `js/modlar.js` | Oynanış katmanları (saf mantık, kolay test) |
| `js/ses.js`, `js/muzik.js`, `js/sestest.js`, `js/cihaz.js`, `js/kart.js` | Ses, müzik, ses test paneli, cihaz raporu, paylaşım kartı |
| `js/perf.js` | Performans ölçümü ve kademeli kalite (0/1/2) |
| `js/canli.js`, `backend/*` | Canlı kupa ve sunucu (Supabase Edge + PostgreSQL) |

## 2. Durum makinesi
`d.ekran`: menu → secim → oyun → tursonu. Oyun içinde `d.faz`: nisan → vurus → sonuc (tekrar `d.tekrar` ile sonuç fazının üstünde çalışır). Her karede `cizimDurumu(now)` çizim girdisini üretir; sonuç ve tepkiler `sonucGoster` ile `vurusUygula` içindedir.

## 3. Modlar
| Mod | Vuruş | Sunucu | Kurallar |
|---|---|---|---|
| `resmi` (kupa) | 10 | evet | Rules 9 (bayraksız çağrı); rüzgâr, bonus, seviye YOK |
| `antrenman` | 10 | hayır | Kural 10: rüzgâr, altın bölge, seri, rozet |
| `hedef` | 5 | hayır | Delikli ağ; delik = gol (`golMu`) |
| `gunluk` | 3 | hayır | Günün tohumu: aynı pozisyon, rüzgâr, kaleci kararı; ilk deneme sayılır |
| `hayat` | sonsuz | hayır | İlk kaçırışa kadar; kaleci seviyesi, rüzgâr ölçeği, baraj zorluğu artar |

**Yeni mod eklemek:** `pozlar()` ve `turSayisi()` (oyun.js), `vurusHazirla` (pozisyon ve tohum), `sonucGoster` (puan), `turSonu` (kayıt ve not), menü düğmesi + `secimGoster` notu, `modlar.js` (saf mantık) ve `modlar-akis.cjs` gibi bir akış testi.

**Gol sayılan sonuçlar tek yerde:** `golMu(r)` = gol, direk golü, delik. Tepki eklerken `r.sonuc === 'gol'` yazma; `golMu` kullan (hedef ağı hatası buradan çıktı).

## 4. Kural sürümleri ve kupa güvenliği
- Sunucu sonucu hesaplar; kupa Rules 9. Eski kayıtlar kendi kural sürümüyle aynen tekrar oynatılır.
- Kural 10 (antrenman) ve onun yeni parametreleri (rüzgâr, seviye, zorluk, hedefX) **bayraksız çağrıda hiçbir şeyi değiştirmemelidir**. Bunu `tests/rules6-koruma.cjs` ve `tests/kural10.cjs` (720 vuruşluk bit düzeyi karşılaştırma) kilitler. Fizik/kaleci/baraj'a dokunan her değişiklikten sonra bu ikisi geçmeli.
- Kupa sonucunu etkileyen her değişiklik yeni kural sürümü gerektirir ve sezon başında açılır; hafta ortasında yapılmaz.

## 5. Test
```
node tools/testleri-calistir.cjs            # hepsi, tablo ve özet
node tools/testleri-calistir.cjs --sadece=kosu
node tools/testleri-calistir.cjs --e2e      # uçtan uca testi de çalıştır
```
- Yedi tuval testi `@napi-rs/canvas` ister (`akis`, `cizim`, `derinlik`, `direk-sonuc`, `file-derinlik`, `formalar`, `kamera-top`). Windows'ta yol yoksa `formalar` düşebilir; kod hatası değildir.
- Testler tarayıcı yerine sahte DOM ile çalışır; gerçek cihaz, gerçek ses ve gerçek sunucu **denenmemiş** sayılır. Telefonda: `?perf=1` (ölçüm), `?sestest=1` (ses paneli ve cihaz raporu).
- Her yeni davranışa test ekle. Hatayı düzeltirken önce hatayı yakalayan testi yaz, düzeltmeyi geri alıp testin başarısız olduğunu doğrula.

## 6. Dal, yama ve etiket kuralları (karışıklığı önlemek için)
- **Tek hat:** Yeni iş her zaman son hattın ucundan dal açar. Aynı anda iki paralel "paket" hattı tutma; tutarsan birleştirmeyi önce planla.
- **Dal adı:** `paket-<sürüm>-<konu>` (örn. `paket-20261013a-modlar`). Aynı sürüm numarasını iki farklı iş için kullanma.
- **Yama:** `git format-patch -1 HEAD`; yama başlığında "Esas: <önceki sürüm>" yazar. Yamalar sırayla uygulanır; sırayı DEGISIKLIK notunda belirt.
- **Not dosyası:** `DEGISIKLIK-<sürüm>.md`, her sürüm için **benzersiz** ad. Başka sürümün notunun üzerine yazma.
- **Önbellek etiketi:** `index.html` içindeki `?v=` etiketi, içeriği değişen HER dosya için yükseltilir (içeriği değişmeyene dokunulmaz). Yeni etiket, eski etiketlerle çakışmamalı.
- **Yayın:** Pages `main`'den yayınlar; `main`'e push = canlı yayın. Önce yedek etiket (`git tag yedek-main-<kısa-sha>`), sonra push; yalnız açık onayla. Edge değişmediyse yükleme gerekmez; değiştiyse önce Edge, sonra site.
- Yeni dalı GitHub'a göndermek canlıyı değiştirmez (yalnız `main` yayınlanır).

## 7. Giriş kodları
Oyuncu kodları sunucuda `dt_identity_accounts` tablosunda tuzlu PBKDF2 karması olarak durur; geri okunamaz. Unutulursa yalnız yenisi üretilir (`backend/kimlik.mjs` yöntemiyle). Kodu dosyaya, commit'e ya da log'a yazma.

## 8. Bilinen eksikler
- Gerçek iPhone/Safari, gerçek Supabase (çift basma, bağlantı kopması) ve gerçek ses kayıtları denenmedi.
- `oyun.js` büyük; yeni mod/özellik eklerken küçük saf modüller (ruzgar.js, bonus.js, modlar.js gibi) tercih et.
