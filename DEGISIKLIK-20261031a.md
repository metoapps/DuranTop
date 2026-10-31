# Duran Top — 20261031a: haftalık otomatik kupa (Cmt 13:00 – Pazar 19:00), 3 oyun, gizli sıralama

Esas: canlı `main` f2320f3.

## Kurallar
- Kupa her hafta **Cumartesi 13:00'te otomatik açılır, Pazar 19:00'da otomatik kapanır** (İstanbul saati). Elle açıp kapamak gerekmez.
- Her oyuncu haftada **3 oyun** oynar (her oyun aynı 10 pozisyon, kaleci zarları her vuruşta farklı). **3 oyunun puanı toplanır**; sıralama toplam puana göre (eşitlikte gol, sonra yeşil).
- Sıralama kupa boyunca **gizli**: herkes yalnız kimin kaçıncı oyunda olduğunu görür; kendi puanını görür. Başkalarının puanı, sonuçları ve tüm zamanlar tablosu sunucudan HİÇ gönderilmez (tarayıcıdan bakarak da görülemez).
- **Pazar 19:00'da sıralama otomatik açıklanır**, şampiyon yazılır. Yeni hafta başlayınca geçen haftanın sonucu menüde "Geçen haftanın sonucu" olarak görünür.

## Teknik
- Sunucu (`backend/index.ts`, `kimlik.mjs`, `guvenlik.mjs`): takvim (`kupaDurum`), 30 vuruş sınırı (3 × 10), gizli/açık durum cevabı, geçen hafta sonucu. Ayar: `DT_CUP_MODE` = `otomatik` (varsayılan) | `acik` (deneme için zorla açık) | `kapali` (zorla kapalı). Eski `DT_CUP_OPEN=1` "zorla açık" sayılır.
- Veritabanı (`backend/kupa-3-oyun.sql`): vuruş sınırı 10 → 30. Geriye uyumlu (eski sunucu yine 10'da durur).
- Oyun (`js/oyun.js`, `js/canli.js`): sunucu 3 oyunu bildirirse "Oyun x/3" akışı; bildirmezse eskisi gibi tek oyun. Menüde takvim, gizli sıralama mesajı, kalan hak.

## Testler
Yeni `kupa-takvim.cjs` (gerçek saatlerle: Cmt 12:59 kapalı, 13:00 açık, Pazar 18:59 açık, 19:00 kapanış + açıklama, Pazartesi yeni hafta; gizli sıralama; 30 vuruş). Güncellenen: `kimlik-haftalik` (30 vuruş sınırı; kupa ayarı gün/saatten bağımsız), `kupa-kapali`, `ses-kayit-tam`. 113/113.
**Denenmedi:** gerçek telefon; gerçek sunucu ve veritabanıyla 3 oyunluk akış (sahte veritabanıyla test edildi).

## Yayın sırası (önemli)
1. Veritabanı: `backend/kupa-3-oyun.sql` uygulanır.
2. Sunucu: `duran-top-live` yeniden yüklenir (değişen: index.ts, kimlik.mjs, guvenlik.mjs).
3. Site: `main`'e birleştirilir.
Sunucu yüklendiği anda takvim geçerli olur: **Cumartesi 13:00 – Pazar 19:00 arasında yüklenirse kupa hemen açılır.**
