# Duran Top — 20261102a: kupada rüzgâr (kural 15), 3 oyun düzeltmesi

Esas: canlı `main` 62e82cb.

## 1. Kupada 3 oyun (20261031b'de yayınlandı)
- Hata: 10. vuruştan sonra tur bitiyor, sıradaki oyuna geçiş yoktu. Şimdi tur sonunda "Sonraki oyun (2/3)" düğmesi; sunucuya giden vuruş numarası oyun×10+vuruş.

## 2. Kupada rüzgâr — KURAL 15
- Rüzgâr oda kimliği + vuruş numarasından türetilir (`DT.ruzgar.kupa`): herkese ve sunucuya aynı, vuruştan ÖNCE göstergede görünür, nişan oku rüzgârla sapan gerçek yolu çizer.
- Top gerçekten sapar (sunucu hesabına girer). Ölçüm (6 m/sn yan rüzgâr, tam güç): penaltı ≈0,2 m, yakın frikik ≈0,6 m, uzak frikik ≈1,7 m; düşük güçte daha fazla (28 m, %60 güçte ≈4 m).
- **Yeni haftada başlar:** sunucu `RUZGAR_HAFTASI='2026-11-02'` ve sonrasında `kurallar:15` bildirir, öncesinde `14` (bu hafta fizik değişmez). İstemci kural 15'i yalnız sunucu bildirirse gönderir.
- Kural ≤14 kayıtları bit düzeyinde aynı (testte 40 örnek, 62e82cb ile karşılaştırıldı).

## Yayın sırası
Sunucuya yeni dosya eklendi: `js/ruzgar.js` (13 dosya). Sunucuyu kupa kapalıyken (Pazar 19:00'dan sonra) yükle; site herhangi bir zaman (kural 15'i sunucu bildirmeden devreye girmez).

## Testler
Yeni: `kupa-uc-oyun` (3 oyun akışı + kural 15 istemci), `kupa-ruzgar` (kural 14 aynılığı, sapma, determinizm, sunucu kapısı).
**Denenmedi:** gerçek telefon; gerçek sunucu/veritabanı ile 11. vuruştan sonrası ve rüzgârlı vuruşlar.
