# Duran Top — 20261017b: balonlar yalnız aut/direkte, tüm yönlendirmeler sağ altta

Esas: 20261017a. Fizik, sunucu ve kupa hesabı değişmez.

## 1. Tribün balonları yalnız AUT ve DİREKTEN DÖNEN TOPTA
- Genel olumsuz cümleler (ve auta gidince oyuncuya özel cümleler) yalnız aut ve direkten dönüşte çıkar. Kurtarış, baraj, kısa, halka ve ağda balon yok (ses ve seyirci duruşu eskisi gibi).

## 2. Tüm yönlendirmeler sağ altta
- 1/3 adımındaki kumanda da sağa toplandı: üstte ok artısı, altında [↺ ↻ Tamam]; **Tamam** 2/3 ve güç panellerinin onay düğmesiyle aynı köşede (sağ alt). Sol el modunda hepsi sol altta, büyük düğmelerde de aynı düzen.
- 2/3 ve güç panelleri alt kenara yaslı (onay düğmesi ≈11 px, Tamam 10 px: aynı hizada).
- Yönerge bandı ("Kaleye dokun…") kumandanın üstüne alındı (dikeyde çakışma yoktu ama yeni düzende binecekti).
- Yeni test `tests/yerlesim.cjs` (gerçek Chromium; yoksa atlanır): 6 ekran düzeninde (390×844, 320×568, 844×390, sol el, büyük düğmeler, büyük+sol) Tamam köşede, kumanda aynı yarıda, paneller birebir aynı kenar konumunda, duruş sınıfı yer değiştirmez, bant çakışmaz, taşma yok. Eski CSS ile test başarısız oluyor.

## Denenmedi
Gerçek telefon (parmakla erişim, kumandanın oyuncuyu kapatması).

## Yayın
Yalnız site. Etiketler 20261017b (`tezahurat`, `css/stil.css`).
