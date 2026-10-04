# Juninho Kupası 20261004n: bağımsız inceleme ve düzeltmeler

Temel: GitHub `metoapps/DuranTop` @ `1ebf34a083e85ccc375657ba6d6f8711f7e259e3` (20261004m). Hiçbir şey yayınlanmadı; canlı veritabanına ve üretim API'sine hiç istek atılmadı (tarayıcı testlerinde `supabase.co` istekleri engellendi).

## Bu pakette değişenler
| # | Bulgu | Düzeltme | Dosya |
| - | - | - | - |
| 1 | Sonuç kartında "0 puan" bölünüyor, 320 px'te kartın dışına taşıyor | Puan tek satır, başlık satır sonuna sığmazsa puan alt satıra iniyor; 320/360/390 px ve dört başlık metniyle ölçüldü, taşma yok | `css/stil.css` |
| 2 | Tuval çözünürlük sınırı 3'tü; yavaşlatılmış işlemcide kare aralığı DPR 3: 105 ms, DPR 2: 64 ms, DPR 1,5: 49 ms | Sınır 2; 60 kare ortalaması 30 ms'yi aşarsa 1,5'a, sonra 1'e iner (duraklamalar sayılmaz) | `js/cizim.js`, `js/oyun.js`, `tests/kalite.cjs` |
| 3 | Giriş kilidi şakaya açıktı: oyuncu adı herkese açık, 16 yanlış istek = gerçek sahip 15 dk giremiyor; kodlar ~100 bit olduğundan kilit güvenlik de sağlamıyordu | Kilitliyken doğru kod içeri alır; yanlış kod `LOGIN_LIMIT` alır; başarılı girişte sayaç sıfırlanır | `backend/index.ts`, `tests/kimlik-haftalik.cjs` |

Fizik, kaleci, puan, `rules:4` ve SQL'e dokunulmadı: yeni girişte kayıt sürümü değişmedi. Sürüm etiketi 20261004n; Edge fonksiyonu (yalnız giriş kodu değişti) ve site birlikte yayınlanmalı. SQL değişikliği yok.

## Ölçümler
**Gerçek Chromium (mobil emülasyon, gerçek dokunma olayları, yazılım çizimi):** antrenman akışı (duruş → güç → hedef → temas → çubuk → uçuş → sonuç) 320×568, 390×844, 430×932 ve yatay 844×390'da sonuna kadar çalıştı; JS hatası yok, yatay taşma yok; karakter hazırlığı 155–205 ms. Bu iPhone Safari değildir.

**Kaleci dengesi, `rules:4`, kusursuz zamanlama, güç 1,0, merkez temas, 60 tohum (resmi):**
- Penaltı, ortaya ve 0,3–2,8 m arası: kurtarış %90–100 (ortada %100, 1,0–2,8 m'de %90).
- Penaltı, 3,2 m ve üst köşe (2,6; 2,2): %100 gol. Güç %70'te aynı köşeler %10 gol; (2,6; 2,2) yine %100 gol.
- Antrenmanda 2,8 m zaten %100 gol (resmide %10).
- Yakın frikik (18 m, sağ): ortaya ve düz şut %100 baraj; (3,1; 1,2) merkez temas %100 gol; yan temas aynı hedefe aut/baraj.
- Uzak frikik (28 m, sağ ve orta): (0; 2,1) merkez temas %18 gol/%83 kurtarış; köşelere (±2,4; 1,0) merkez temas %100 gol.
Sonuç: kaleci "gövdeni doldurur" ama basamak şeklinde: 2,8 m'ye kadar kurtarıyor, 3,2 m'den sonra neredeyse hiç. Güç düşüşü köşe golünü %100'den %10'a indiriyor, yani "yumuşak şutla köşe" yok. Bunu sınırlı bir ayar sorunu olarak yazıyorum, bozukluk olarak değil: `kaleci.js`'deki hız ve erişim sayıları belirliyor. Ortada köşe şansı için geçiş bölgesini 2,8–3,2 m arasına yaymak tek sayılık bir ayar işi; telefonda denemeden değiştirmedim.

**Performans (başsız Chromium, yazılım çizimi, CPU yavaşlatma 4×):** DPR 3'te ~10 fps, DPR 2'de ~16 fps, DPR 1,5'ta ~20 fps; `ciz()` çağrısı ~15 ms. Bu gerçek iPhone sayısı değildir; yönü gösterir: tuval pikseli kare süresini belirliyor.

**Gerçek PostgreSQL 16 (Supabase değil), `schema.sql` + `kimlik-hafta.sql` uygulandı:**
- Haftalık oda: 60 eşzamanlı istek, her biri farklı kodla → tam 1 oda; `week_start` İstanbul haftası ile aynı (2026-09-28), bitiş 2026-10-05 00:00 İstanbul.
- Aynı oyuncu, aynı vuruş indeksi için 30 eşzamanlı yazma → idx 1, 1 kayıt.
- Sıra atlama `SHOT_ORDER`, 11. vuruş `SHOT_ORDER`, yanlış kimlik `PLAYER_AUTH`.
- Odanın haftası geçmişe alınınca yazma `WEEK_ENDED`; yeni istek yeni hafta odası açıyor, eski oda duruyor, toplam gol tablosunda eski haftanın golü sayılıyor.
- `dt_goal_standings` gol, puan, vuruş dönüyor.
Çalıştırılmayanlar: gerçek Supabase (RLS, JWT, ağ), gerçek giriş kodları, iki gerçek cihaz.

**Testler:** 23 test dosyası, hepsi çıkış 0 (22 devralınan + `kalite.cjs`). `kimlik-haftalik.cjs` yeni giriş davranışına göre güncellendi. Üç çizim testi `/opt/codex/...` yolunu istediği için yerelde taklit edildi.

## Bulup DEĞİŞTİRMEDİĞİM sorunlar (karar sende ya da denemek gerek)
1. **Canlı skor tablosu rakibin gol ve puanını anlık gösteriyor** (`state.weekly`). `oyuncular()` içindeki "rakip bitene kadar gizle" kuralı arayüzde etkisiz; arayüz `weekly`'yi kullanıyor. Ortak koşullar kararıyla çelişiyor: biri oynadıktan sonra "frikik 3 gol oldu" bilgisi sızabilir (toplam artışından). Ürün kararı: canlı tablo mu, bitene kadar gizli mi?
2. **Hafta sınırı:** pazar gecesi 23:55'te başlayan biri kalan vuruşları pazartesi 00:00'dan sonra `WEEK_ENDED` ile kaybediyor ve tur yarım kalıyor. Kural açık ve tutarlı, ama oyuncuya önceden söylenmiyor.
3. **Genel tablo** eşitlik bozucu olarak puanı kullanıyor ama puanı göstermiyor; eşit gol sayılı iki kişinin neden farklı sırada olduğu anlaşılmıyor.
4. **Animasyon:** yürüyüş çok kısa (~0,35 s), yakın çekimde kurtarış karelerinde top küçük. Kareler arası süre kaba olduğu için bunu kesin bulgu saymıyorum; gerçek cihazda bakılmalı.
5. **İstemci beceri girdisini hâlâ kendisi bildiriyor** (zamanlama, temas, güç). Ciddi ödüllü yarışma için hazır değil.

## Oyun fikirleri (kimlik, eşit koşul, haftalık hak korunarak)
| Fikir | Oyuncu ne yapar, neden tekrar oynar | Maliyet |
| - | - | - |
| **Banko vuruşu** | Haftanın 10 vuruşundan birini önceden "banko" ilan edip kalede bir bölge seçer; o bölgeye gol 2 gol sayılır, olmazsa o vuruş 0 (ceza yok). Tek karar vuruşa risk ekler, "bankomu tutturdum" muhabbeti çıkar. Mobilde: vuruştan önce üç bölgeden birine dokunuş. | Küçük: yeni `rules:5`, sunucuda bölge kontrolü, tek ek buton; görsel gerekmez |
| **Haftalık ikili maçlar (lig tablosu)** | 10 vuruş sonucuyla herkes herkesle "maç" yapmış sayılır (4 maç; gol farkıyla galibiyet 3, beraberlik 1 puan). Aynı veriden lig havası: "bu hafta LORT'u geçtim". Yeni oynanış yok ama tablo çok daha dramatik. | Küçük-orta: bir SQL görünümü ve tablo ekranı |
| **Kaleci rövanşı** | Turunu bitirince arkadaşlarının 3 şutunu kurtarmaya çalışırsın (parmakla dalış yönü ve yüksekliği). Rakibin şutu tohum ve girdiyle yeniden oynatılır. Kurtarış sayısı ikinci tablo olur. | Orta-büyük: kayıtlı girdilerin sunucuda saklanıp güvenli yeniden oynatılması, kaleci kontrolü; mevcut model3d kaleci kullanılabilir. Rakip girdisi şu an kasıtlı gizli: bu fikir gizlilik kuralını değiştirir |
| **Haftanın koşulu** | Her hafta herkese aynı küçük koşul: rüzgâr (ekranda bayrak) ya da ıslak zemin (sekme). Becerisi koşula göre nişan alana ödül. | Küçük-orta: fizik terimi, `rules` sürümü, bayrak çizimi |

Önerim: Banko (en ucuz, doğrudan karar ekler) ve haftalık ikili maçlar (hiç yeni oynanış istemiyor, tabloyu canlandırır). Kaleci rövanşı en güçlü bağlılık fikri ama gizlilik kararını ve sunucu işini gerektirir.

## Yayın sırası
1. Edge fonksiyonu (`backend/index.ts`; `guvenlik.mjs`, `kimlik.mjs` ve `../js/` dosyaları aynı kalır). Giriş kodu değişikliği geriye uyumlu: eski istemci etkilenmez.
2. Site (`index.html`, `css/`, `js/`). `?v=20261004n` etiketini doğrula.
3. SQL değişikliği yok.
Geri alma: önceki Edge sürümü (v13) ve 1ebf34a commit'i.

## Denemediğim ortamlar
Gerçek iPhone Safari (kare hızı, DPR, çentik, adres çubuğu, düşük güç modu, ses), gerçek Supabase (RLS, JWT, sunucu zamanı), iki gerçek cihaz/sekme, bağlantı kopması, gerçek giriş kodları, yaklaşık hafta sınırı anında canlı akış, gerçek ses kayıtları.
