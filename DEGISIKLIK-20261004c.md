# Duran Top 20261004c: değişiklik ve yayın notu

Temel: GitHub `metoapps/DuranTop` @ `2eed88605cee1e232efc6711033b9006b200677f` (20261003p). a ve b yayınlanmadı. Hiçbir şey yayınlanmadı; Supabase ve GitHub'a erişimim yok.

## ChatGPT'nin b incelemesi ve cevabım
| Bulgu | Durum | Ne yaptım |
| - | - | - |
| Oyuncuya özel tohum sonucu değiştirebiliyor (977 kurtarış, 14655 gol); "koşullar eşit" ve "±6 cm" iddiaları fazla güçlüydü | Doğru, iddialarım yanlıştı | Tohum artık oyuncudan BAĞIMSIZ: `tohum(sır, oda, vuruş)`. Aynı odada aynı vuruşta beş arkadaşın kaleci koşulları (yanlış karar zarı ve tahmin gürültüsü dahil) birebir aynı; aynı girdi herkese aynı sonucu veriyor. "±6 cm" iddiasını geri alıyorum: gürültü Gauss dağılımlı, kesin sınırı yok, ama artık herkes için aynı değer. |
| İstenen davranışlar (nadir yanlış köşe, merkez frikikte ~%20 gol) resmi turdan çıkarılmıştı | Doğru, geri getirildi | `resmiSans` anahtarı silindi. %7 yanlış köşe ve %20 merkez frikik hatası her iki modda var. Resmi turda zar odada ve vuruşta ortak: bir odada "merkez frikik hatası var" herkes için, yok ise hiç kimse için. Seed örneklemi yine 80/500. |

## Eşitlik tam olarak neyi kapsıyor (abartmadan)
- Aynı odada, aynı vuruşta, aynı girdi (nişan, temas, zamanlama) → her oyuncu için aynı sonuç. Uçtan uca testte iki oyuncu aynı beş girdiyi attı: sonuçlar ve tohumlar birebir aynı.
- Farklı odalar farklı koşul alır (şansa bağlı kararlar odadan odaya değişir). Bir odanın içinde herkes aynı kaleciyle oynar.
- Ortak koşulun bedeli: biri oynadıktan sonra kalecinin o vuruştaki kararını öğrenmek sonradan oynayana bilgi verebilir. Bunu kodla kapatılabilecek kadar kapattım: başkasının nişan, temas, zamanlama ve tohumu hiç görünmez; başkası turunu bitirene kadar yalnızca ilerlemesi (kaç vuruş) görünür; bitirenin toplam puanı görünür; vuruş vuruş sonuçlarını ise sen de turunu bitirdikten sonra görürsün.
- Kapatılamayanlar: arkadaşların birbirine sözle söylemesi ("frikik 1'de kaleci hata yaptı"); istemcinin zamanlamayı kendisinin bildirmesi (sahte kusursuz zamanlama). Bu bir arkadaş oyunu güveni; ciddi ödül için yeterli değil.
- Skor tablosunda devam eden rakip "Oynuyor (n/5)" olarak görünür, toplamı bitene kadar gizli.

## Önceki düzeltmeler (b'den, doğrulandı)
Kaleci nedensel (okuma anından önce hareket yok, okuma yalnızca geçmiş örneklere bakıyor); penaltı hızı 6,6 m/s; atomik oda sınırı (`dt_live_create_room`, gerçek PostgreSQL'de 150 eşzamanlıda tam 100); girdiler başkalarından gizli; ayar temizliği; isteğe bağlı gerçek ses kaydı.

## Ölçümler (gerçek kod, tohumlu; nişan σ=0,15 m, zamanlama σ=40 ms)
Penaltı gol: (2,2; 1,0) %9, (2,7; 1,0) %10, (3,1; 1,0) %34, (3,1; 1,8) ~%57. Orta bölgenin ~%7-10 tabanı yanlış köşe kararından gelir. Köşe (3,15; 1,1) zamanlama: kusursuz %100 gol, 32 ms erken ~%12 gol, 96 ms erken ~%10 gol (taban şans). Frikik, yan temaslı şut (−2,4; 1,0): %84 gol, düz temasta %0.

## Testler
15 test dosyası, hepsi çıkış 0. `tests/e2e/` gerçek Edge kodunu Deno'da gerçek PostgreSQL 16 + PostgREST ile çalıştırdı (Supabase değil): iki oyuncu aynı beş girdiyle aynı sonuçları aldı, görünürlük kuralları, tekrar denemede aynı kayıt, farklı odada farklı tohum, aynı token 10 eşzamanlıda tam 8, 150 eşzamanlıda tam 100 oda.
YAPILMADI: gerçek Supabase (RLS, JWT, ağ), Safari, telefon, gerçek insan.

## Yayın sırası (zorunlu)
1. **Veritabanı:** `backend/schema.sql` sonundaki `dt_live_create_room` fonksiyonunu çalıştır (`create or replace`, mevcut tablo ve satırlara dokunmaz). Edge'den ÖNCE.
2. **Edge fonksiyonu:** `backend/index.ts` + `backend/guvenlik.mjs` + `../js/` dosyaları (ayar, model3d, baraj, kaleci, ucus, fizik, puan). İsteğe bağlı `DT_SEED_SECRET`; yoksa servis anahtarı.
3. **Site:** `index.html`, `css/`, `js/`, `assets/`; Pages işinin bittiğini ve `?v=20261004c` etiketini doğrula.
4. 2 ile 3 arasında oyun oynama. Eski kupa odaları "yeni kupa oluştur" der.
Geri alma: Edge'in önceki sürümü (7) + 2eed886 commit'i; yeni SQL fonksiyonu zararsız.

## Yapılmayanlar
Şut animasyonu (yeni kare gerekir), gerçek ses kaydı (dosya yok; kod hazır), sunucu tarafı zamanlama kanıtı, banko ve kaleci rövanşı.
