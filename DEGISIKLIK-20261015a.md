# Duran Top — 20261015a: puanı 7'nin altındaki alanların iyileştirilmesi

Esas: 20261013a. Fizik, sunucu ve kupa hesabı değişmez. Edge'e dokunulmaz.

## 1. Doğrulama araçları (gerçek cihaz belirsizliği için)
- **Ses test paneli:** adrese `?sestest=1` ekle. Tüm efekt seslerini, gol bağırışını, alayı, menü/maç müziğini ve müzik efektlerini düğmelerle dinlersin. Her ses için **gerçek kayıt mı, sentez mi** yazar (direk, ağ, "ahhh", yuh, tez-1..6, menü/maç müziği).
- **Cihaz raporu** (aynı panelde): ekran, güvenli alan, dokunma, ses, **Türkçe konuşma sentezi var mı**, görsel paylaşım desteği, depolama, titreşim, hareketi azalt ayarı ve bir **çizim hız testi** (ms/kare). Panoya kopyalanır; Claude'a yapıştırılabilir.

## 2. Erişilebilirlik ve ayarlar (menüde Ayarlar)
- **Sol el modu:** kumanda sağ-sol yer değiştirir. **Büyük düğmeler:** ok tuşları 64 px, Tamam 150×56.
- **Hareket: tam / az:** az seçilince tribün, bayrak, ağ ve süslerin hareketi durur (sistemin "hareketi azalt" ayarını hâlâ yok sayarız; seçim oyun içindedir).
- **Titreşim açık/kapalı** (Android; iPhone Safari desteklemez): basış, temas, gol, kaçan şut ve direkten dönüş için ayrı desenler. Not: oyunda zaten basışta hep titreşen bir satır vardı; artık ayara bağlı, varsayılan açık (davranış değişmedi).

## 3. Sosyal: görsel paylaşım kartı
- Tur sonu ekranında **"Görsel paylaş"**: 1080×1350 skor kartı (oyuncu, mod, büyük puan, vuruş noktaları, en sert şut, kazanılan rozetler, yeni rekor bandı, tarih). WhatsApp'a görsel olarak gider; destek yoksa indirir; o da yoksa metin paylaşır. Emoji kullanmaz (şekillerle çizilir).

## 4. Görsel
- **Zemin:** biçilmiş çim şeritleri daha canlı yeşil ve belirgin kontrastlı; derinliğe göre boyutlanan çim dokusu; kale önünde sıcak projektör ışık havuzu. Oyuncu zeminden daha net ayrılır. Maliyet: arka plana bir kez çizilir; kare süresi 12,3 ms (masaüstü, kademe 0).

## 5. Hareket
- **Koşuda yana sallanma ve omuz yalpası:** gövde her adımda basan ayağa doğru sallanır (arkadan kameradan görünür), baş gövdeden az sallanır (gözler topta). Koşu başı ve sonunda sıfır, geçişlerde sıçrama yok.

## 6. Yapı ve bakım
- **`tools/testleri-calistir.cjs`:** `node tools/testleri-calistir.cjs [--sadece=desen] [--e2e]`; tablo ve özet verir, ortam kaynaklı `formalar` düşüşünü ayrı gösterir.
- **`GELISTIRICI.md`:** dosya haritası, durum makinesi, modlar tablosu, yeni mod ekleme, kural sürümleri ve kupa güvenliği, test, **dal/yama/etiket kuralları** (tek hat, benzersiz not dosyası, etiket yükseltme, yayın onayı), giriş kodları.
- **`SURUM.md`:** sürüm geçmişi tablosu.

## Bilerek dokunulmadı
- **Kaleci beden animasyonu:** fizik tabanlı iskelet; dalışta gövde eğimi ve bacak bükülmesi zaten var. Canlı görmeden dokunmak riskli; telefondaki izlenimini bekliyorum.
- **Ses ve müzik kalitesi:** gerçek kayıt gerektirir; araç (ses test paneli) hazır, kayıt senin.

## Testler
- Yeni: `cihaz-sestest`, `erisilebilirlik`, `kart` (+ `kosu` genişletildi). Linux'ta 74/74 + e2e. Chromium'da panel, rapor ve ayar düğmeleri doğrulandı.
- Denenmedi: gerçek telefon (özellikle koşunun canlı görünümü, titreşim, görsel paylaşım dosyası, Türkçe konuşma sesi).

## Yayın
Yalnız site. Etiketler 20261015a (yeni: `cihaz.js`, `sestest.js`, `kart.js`; `ayar`, `oyun`, `cizim`, `futbolcu3d`, `css/stil.css`).
