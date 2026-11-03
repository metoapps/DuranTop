# TOOLS — Duran Top

Güncelleme: 2026-10-18. Bu belge çalışma kuralıdır; aşağıdaki adaylar henüz kurulu değildir.

## Mevcut mimari
- Mobil odaklı HTML, CSS, JavaScript ve canvas oyunu.
- Oyun fiziği, kaleci, resmi kupa sonuçları, giriş doğrulaması ve sunucu kayıtları birbirinden ayrı sorumluluklardır.
- Mevcut sürümde özgün oyun fiziğini ve resmi sonuçları değiştirmek yalnızca açıkça onaylanan ayrı çalışmanın konusu olabilir.

## Planlanan araçlar
| Araç | Durum | Kullanım | Kabul koşulu |
| --- | --- | --- | --- |
| GSAP | ADAY — kurulu değil | Menü, kupa ve sevinç arayüz hareketleri | Oyun fiziği ve zamanlama etkilenmemeli; düşük hareket tercihine saygı duyulmalı |
| Three.js | PROTOTİP ADAYI — kurulu değil | Ayrı 3D görsel deney | Ana oyuna bağlanmadan önce mobil FPS, boyut ve görsel kalite kıyaslanmalı |
| Audacity | HARİCİ ARAÇ | Ses varlıklarını düzenleme | Kaynak/lisans izleri korunmalı |
| FFmpeg | HARİCİ ARAÇ | Ses/video kodlama ve sıkıştırma | Çıktı biçimi ve boyutu test edilmeli |

## Çalışma yöntemi
1. Başlangıç commit SHA'sını ve çalışan sürümü kaydet.
2. Özellik dalı (branch) aç; doğrudan main'e yazma.
3. Her değişiklikte tek amaç: ayrı commit, küçük diff.
4. Üçüncü taraf araç ekleniyorsa resmi kaynak, sabit sürüm, lisans ve yükleme yöntemi belgelenir. Gereksiz dış bağlantı eklenmez.
5. Mobil dokunma akışı, antrenman/resmi maç ayrımı, haftalık puanlar, şut-top-kale kararı ve erişilebilirlik kontrol edilir.
6. Test kanıtı olmadan 'test edildi' denmez. Pull request incelemesinden sonra main'e alınır.
7. Görsel prototip üretim motoru değildir: gerçekçi yüz, iskelet, animasyon varlıkları ayrıca gerekir.

## İlk önerilen iş
GSAP ile mevcut kupa/sevinç sunumundan **tek** bir animasyonu izole prototipte iyileştir; fizik, skor ve sunucu koduna dokunma. Başarılı olursa ana sürüme taşımak için ayrı PR hazırla.

## Yardımcılarla çalışma
ChatGPT ve Claude önce README.md, TOOLS.md ve ilgili kodu okur. Sürüm/doğrulama bilinmiyorsa varsaymaz. Değişiklik sonrası dosyalar, testler ve geri alma yöntemi kısa raporlanır.
