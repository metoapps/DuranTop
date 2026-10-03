# 20261004f — yaklaşma, güç ve 8-bit müzik

- Vuruş öncesi Soldan / Düz / Sağdan yaklaşma seçimi. Seçim sırasında 1,1 saniye eklemli 3D gövde yürüyüşü, özgün karakter sprite'ından kafa dokusu. Normal vuruş ve tepkiler mevcut karakter sprite'larını kullanır; tam taranmış 3D insan modeli değildir.
- Seçilen tarafta hazırlık duruşu; nişan otomatik olarak gövdeyi aynalamaz. Vuruş öncesinde topa yaklaşır.
- Hedef ve temas seçiminden sonra kırmızı güç çubuğu (%30–100), sonra yeşil zamanlama. Güç başlangıç hızını ve spin aktarımını etkiler. Daha düşük güç aynı hedefe zorlanmaz; önizleme seçilmiş güçle beklenen fizik yolunu gösterir.
- Canlı sunucu güç ve yaklaşma girdilerini doğrular/kaydeder. İstemci ve sunucu aynı fizik kullanır. Oda fiziği 7; eski kupalar yeni kupa oluşturma mesajı alır. SQL şeması değişmez.
- Özgün 132 BPM, 8-bit pulse melodi, bas ve hafif ritim. Ses kapalı başlar; mevcut ses düğmesi açar/kapatır. Sekme gizlenince durur.

Doğrulama: 16 yerel test dosyası, yeni akışta beş canlı vuruş ve güç/fizik kontrolleri; beş karakter yürüyüşünün Canvas kareleri. Gerçek iPhone/Safari ve insan parmağı hissi bu ortamda denenmedi.
Yayın: önce Edge işlevi, hemen ardından site. Yeni kupa oluştur.
