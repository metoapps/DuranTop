# 20261004q — Futbolcu dönüş ve hareket iskeleti

Önceki yürüyüş bütün sprite'ı ortada aynalıyor ve turnScale ile genişliğini %12'ye indiriyordu. Bu, gerçek dönüş değil kâğıt çevirme etkisiydi. Yeni js/futbolcu3d.js, yön/walk/şut sırasında ayrı hacimli gövde, baş, kollar, dizler ve ayaklar çizer. Yaw kesintisiz -0,60..+0,60 radyandır; sağ seçimi ileri eksenini sağa döndürür. Hazırlık ve şut yeni model kullanır, gol sevinci mevcut özgün sprite dizisinde kalır.

İki adımda bir ayak destek olur, diğeri yükselir; dizler iki kemikli çözümlenir. Bacak kemikleri 72, kol kemikleri 55 yerel birim ve sabittir. Şut hazırlığı, temas ve takip hareketi süreye bağlıdır. Topu hedefe göre karakteri aynalama yapılmaz. Aynı duruş seçilince gereksiz yürüyüş atlanır. Şut temas yerleşimi yeni ayağa göre çizilir, skor hesabı değişmedi.

Yüz/saç ve forma dokuları mevcut karakter PNG/WebP'lerinden alınır; yeni fotoğraf veya görsel üretilmedi. Numaralar 10/28/35/60/31 korunur. Baş küresine ön/arka doku uygulanır; arkadaki kaynak fotoğrafın profil kısmı saçın arkasına basılmasın diye merkezden alınır. Model prosedüreldir: birebir fotoğraf taraması veya stüdyo kalitesinde rig değildir. Hacimler ve bazı kıyafet ayrıntıları yaklaşık, sade kalır. Daha gerçekçi yan görünüş için yeni çok açılı karakter referansı/rig gerekir; bunun tamamlandığı iddia edilmez.

Dört gerekli görsel: vurus1/2/3/bekle. Ön portre yaklaşık 30 KB ek yük getirir; mevcut zaman aşımı ve tekrar deneme korunur. Bekleme pozu DPI sınırı 2 ile önbelleğe alınır (en fazla 24 poz), hareketler canlı çizilir. Yeni fizik veya backend/SQL sürümü yok; resmi haklar, skorlar ve geçmiş girdiler aynı kalır.

25 yerel testin tamamı geçti: eski 24 + futbolcu3d. Yeni test dönüş sürekliliği, yön, kemik uzunlukları, destek ayağı ve sonlu şut koordinatlarını doğrular; çizim testi yeni modeli yedi ekran ölçüsünde çalıştırır. Beş karakterin hazırlık/dönüş/temas/takip kareleri yerel canvas görselleriyle incelendi. Gerçek Chromium/iPhone/Safari hareket kalitesi ve cihaz FPS burada denenmedi.

## Sonraki geliştirme fikirleri — bu sürümde uygulanmadı
1. Topun temas ettiği yere göre ağın yerel dalgalanması, direğin kısa titreşimi ve temiz vuruşta 2 saniyelik tekrar. Yeni karar eklemeden şutun hissini güçlendirir.
2. Haftalık eşleşmeler: her hafta iki ikili düello, bir kişi dinlenir; beş haftalık döngüde herkes herkesle bir kez karşılaşır. Aynı 10 vuruş kullanılır, Juninho gol kupası ayrı kalır.
3. Banko meydan okuması: bir vuruşta hedef bölge ilan edilir, başarı rozet/ayrı banko puanı verir. Gerçek gol tablosunda gol ikiye katlanmaz; haftalık 10 hak bozulmaz.
