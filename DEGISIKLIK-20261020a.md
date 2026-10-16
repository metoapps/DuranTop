# Duran Top — 20261020a: ağır çekim eşiği, alevli şut, gerçekçi kaleci sıçraması, ayrı ibre alanı, kollar aşağıda baraj, ikinci gol sesi

Esas: 20261019a. **Kupa ve sunucu hesabı DEĞİŞMEDİ** (Edge'e dokunulmaz; kalecinin yeni dalışı yalnız kupa dışı modlarda açılan `balistikDalis` bayrağına bağlı).

## 1. Ağır çekim yalnız 100 km/sa ve üstü şutlarda
- Eşik `A.yavasCekim.minKmh = 100`. Altında ağır çekim, ses efekti ve görsel vurgu YOK; 100 ve üstünde (gol, kurtarış, direk, aut) hepsi var. Barajda ve kısa kalan şutta yok.
- **Ses:** pencere başlarken "ağır çekim" süpürmesi (alçalan ton + gürleme), biterken "hızlanma" süpürmesi (yükselen ton); ağır çekimle eş zamanlı (sim zamanına bağlı); müzik pencere boyunca kısılır.
- **Görsel:** kenarlarda koyu vinyet ve hafif soğuk ton; ağır çekimin başında ve sonunda yumuşakça girer çıkar.

## 2. Alevli şut
- Güç ≥ %98 **ve** hareketli imleç yeşil bandı tam yakaladıysa: topun arkasında sarıdan turuncuya ve kırmızıya sönen ateş izi, parlama, "ALEVLİ ŞUT!" yazısı, özel ses, belirgin sarsıntı ve titreşim. Yalnız görsel/ses ödülü: fizik ve sonuç aynı. Kademe 2'de parçacıklar kapalı, yalnız parlama. Alevli şutta normal beyaz iz çizilmez.

## 3. Kaleci sıçraması ve becerisi
- **Hata:** kaleci 0,1 sn'de yere paralel yatıyor ama merkezi yerden 1 m yüksekte kalıp yan yan "yükseliyordu" (ölçüldü: 285 örnek).
- **Çözüm (yalnız kupa dışı modlar):** çömelme → itiş → yerçekimi altında parabol; gövde itişle birlikte yatar (kalkışta dik, zirvede yatay), alçak toplarda serbest düşüş. Ölçüm: 93 dalış, çıkış hızı en çok 3,66 m/sn, havada ivme −9,81, yatayken hızlı yükselme yok.
- **Beceri/zekâ:** yalnız **antrenman** kalecisi biraz güçlendi (tepki payı 0,035→0,012, hız kısıntısı 0,6→0,30, seviye 0,30). Penaltıda gol oranı yaklaşık %66 → %60 (ölçüm); frikik değişmedi. Günlük, hayatta kal ve hedef ağı zaten tam güçteydi.

## 4. Güç sonrası ibre ayrı yerde
- Güç bırakılınca ibre artık HEMEN başlamıyor: 0,65 sn "Hazırlan…" (dokunuşlar yok sayılır), sonra ekranın ortasında büyük bir daire (ibre + yeşil bant) belirir ve **o daireye** dokunulur. VUR düğmesi ibre sırasında pasif; güç yine VUR'la (basılı tut) seçilir. Klavyede boşluk aynen çalışır.

## 5. Baraj: kollar aşağıda
- Zıplarken kollar havaya kalkmıyor (eller önde kenetli); blok yüksekliği yalnız sıçrama kadar artıyor. Ele çarpan top penaltı olur.

## 6. İkinci gerçek gol sesi
- `assets/ses/gol-2.mp3`: gerçek kalabalık tezahüratı (freesound "Crowd Cheering", SoundsExciting, **CC0 1.0**; belgeli kaynaktan alındı, ayrıntı `KAYNAKLAR.txt`). Goller `gol.mp3` ve `gol-2.mp3` arasında dönüşümlü çalar (art arda aynı yok). **Dinlenmedi**; genel kalabalık sesi, stadyuma özel kükreme değil. Mevcut `gol.mp3` kaldı.

## Eklenmeyen: menü müziği
- GitHub'da lisansı sağlam, indirilebilir bir menü parçası bulamadım (Kevin MacLeod deposu yalnız liste; "CC0" diyen küçük depoların kaynağı güvenilir değil). Çözüm: incompetech.com'dan sen bir parça seç ve `assets/ses/muzik-menu.mp3` olarak koy (oyun gerçek dosyayı otomatik kullanır). Lisans CC BY 4.0: oyunda "Music by Kevin MacLeod (incompetech.com), CC BY 4.0" yazısı gerekir.

## Testler
Yeni: `alevli-sut`, `alev-cizim`, `kaleci-dalis`. Güncellenen: `akis`, `yavas-cekim`, `baraj-gorsel`, `baraj-poz`, `ses-kayit-tam`, `efektler` ve ibreyi kullanan 10 akış testi. **Denenmedi:** gerçek telefon (merkez ibre dairesinin parmakla kullanımı, ağır çekim/alev sesinin kulağa gelişi, gol-2 sesi).

## Yayın
Yalnız site. Etiketler 20261020a (`ayar`, `baraj`, `baraj3d`, `cizim`, `fizik`, `kaleci`, `kaleci3d`, `model3d`, `muzik`, `oyun`, `ses`, `css/stil.css`). Edge'e dokunulmaz.
