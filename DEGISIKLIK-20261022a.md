# 20261022a — LORT boynu ve kaleci kararları

## LORT
Başın toplam yüksekliği ve ayak/temas koordinatları sabit kalır. Omuz, gövde ve yaka iskeletinin görsel yüksekliği %3,5 artırılarak gereğinden uzun boyun boşluğu doldurulur. Oyuncunun uzun boyu korunur; başı aşağı indirip karakteri kısaltma yapılmaz. Ön ve yan karşılaştırma: `docs/lort-boyun-20261022a.png`.

## Kaleci — rules 13
- Penaltı yönü vuruştan önce, nişandan bağımsız aynı tohumla seçilir. Merkezde bekleme kupada %14 → %8, antrenmanda %24 → %14: herhangi bir belirli yan köşeyi seçme olasılığı sırasıyla %43 → %46 ve %38 → %43 olur. Bu kurtarış yüzdesi değildir; erişilemeyen şutlar gol olabilir.
- Akıllı frikikte ilk gözlem 50 ms erken (kupada 260 → 210 ms), tekrar gözlem aralığı 75 → 60 ms. Dalış zamanlama payı 120 → 170 ms: seçilen hızlı köşe şutu testinde dalış 50 ms daha erken başlar.
- Hız ve uzuv sınırları aynı; gelecek uçuş örnekleri okunmaz.
- İstemci yeni atışları rules 13 ile gönderir. Sunucu 12 ve 13'ü kabul eder; daha eski sürümler hak harcamadan reddedilir. Kayıtlı bir atışın tekrarı kaydedilmiş sonucu döndürür. Rules 12'de yeni kaleci bayrağı kapalıdır; eski fizik ve tekrar korunur.
- Kimlik, giriş koruması, kupa açma/kapama ve veritabanı kuralları değiştirilmez.

## Doğrulama
`kaleci-v13`: 1000 bağımsız yön kararı, geçmişe bağlı gözlem, sınırlı hareket hızı, erken dalış ve rules-12 birebir tekrar karşılaştırması. Gerçek Edge işleyicisinin sahte veritabanıyla testinde hem rules 12 hem rules 13 için onar atışta istemci/sunucu sonuç eşleşmesi ve yeniden istek kontrolü. LORT baş yüksekliği ve ayak hizası sabitliği, iki ölçekte 24 çizim pozu, oyun/menü/ibre/tekrar ve ilgili kaleci testleri.
