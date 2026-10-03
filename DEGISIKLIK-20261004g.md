# 20261004g — önce sahayı göster, forma dokusunu koru, müziği kaldır

- Vuruş başlangıcında saha ve mevcut oyuncu duruşu görünür. Kullanıcı alttaki “Duruşunu seç” düğmesine basınca Soldan / Düz / Sağdan sorusu açılır. Seçenekler sahayı örten tam ekran katman yerine altta küçük paneldedir.
- Yürüyüşte kafa dokusu ile düz renkli başka gövdeye geçiş kaldırıldı. Özgün karakterin tamamı, forma/sleeve/şort/kafa ayrıntılarıyla aynı görsel dokusunu koruyan bir derinlik ve adım deformasyonu üzerinde çizilir. Bu taranmış tam 3D insan modeli değildir.
- Müzik üretimi, döngüsü ve görünürlük dinleyicisi tamamen kaldırıldı. Ses açmak müzik başlatmaz; vuruş/direk/file/kurtarış sesleri çalışır.
- Güç, zamanlama, fizik, kayıt ve oda sürümü değişmedi. Mevcut v7 kupaları devam edebilir; sunucu/SQL yayını gerekmez.

Kontroller: beş vuruşluk akışta önce sahne, ardından yön seçimi; yön seçmeden nişan engeli; ses açınca kendiliğinden müzik başlamaması; etki seslerinin kayıt ve sentez yolu; yedi ekran boyutunda Canvas çizimi; canlı istemci kayıt testi. Beş karakterin yürüyüş kareleri görsel olarak incelendi. Gerçek telefonda bu sürüm denenmedi.
