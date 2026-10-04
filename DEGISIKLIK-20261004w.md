# Juninho Kupası — 20261004w

Claude’un 20261004t incelemesindeki doğrulanan fizik ve animasyon sorunları giderildi.

## Davranış
- Yeni vuruşlar rules 6 kullanır. Sunucu rules 4, 5 ve 6 kabul eder; bekleyen eski istekler kendi sürümünde kalır. Oda sürümü 8, haklar ve skorlar korunur. SQL değişikliği yok.
- Kaleci 100 ms arayla yalnız geçmiş top konumlarından hız ve ivme tahmini yapar. Dalış başlamadan planını yeniler; dalış başladıktan sonra yön değiştirmez. Sabit kale düzlemi kullanılır, gerçek uçuş bitiş zamanı ve gelecek nokta kullanılmaz.
- Gözlenen ivme kısa adımlarla ileri tahmin edilir; bu biyomekanik simülasyon değil, sınırlı bir oyun okuma modelidir. Zemin sekmesi sürekli yukarı ivme sanılmaz. Önceki nadir yanlış köşe/merkez hatası olasılıkları korunur.
- Gövde interpolasyonunun tepe hızı hesaba katılır. Yerçekimiyle iniş ve kalkış korunur.
- Ulaşılamayan hedefte topun yer altındaki son noktasını en yakın hedef sanan çözüm kaldırıldı. İlk zemin temasına kadar menzil taranır, merkez temas için en çok 45 dereceyle menzil seçilir. Hız/enerji artırılmaz; alt temas yine daha yüksek çıkış açısı oluşturabilir.
- Kale açıklığı 7,32 x 2,44 m kalır. 12 cm çaplı direk eksenleri ±3,72 ve 2,50 m; çizim de buna uyar.
- Kramponun ucu, bilek yerine topun arka yüzeyine temas eder. Ayak temas anında durmaz; savrulup yere basar, basınca geri kaymaz.
- Sayısal yuvarlama nedeniyle vuruş ilerlemesinin 0,9999999999999999’da kalıp bitiş hareketini engellemesi düzeltildi. Basıştan temas anına animasyon 1,15 yerine 0,85 saniye.

## Kontroller
- Önceki 29 test geçti; ardından yeni takip-fizigi.cjs eklendi. Son animasyon ve sunucu değişiklikleri ilgili testlerle yeniden kontrol edildi.
- Claude’un zayıf merkezi falso örneği (merkez 0/0,3; sağ temas 0,85; güç 0,6; kusursuz zamanlama): tohum 1–100, eski 100 gol; yeni 90 kurtarış, 10 gol. Bu örneklem tüm gol oranlarının garantisi değildir.
- Aynı örneklemde düz merkez şut 100 kurtarış, kusursuz uzak köşe 100 gol. Başarılı her stratejiyi yapay olarak yüzde 90 ile sınırlayan bir kural konmadı.
- İki temas yönü x dört düşük güç x 30 tohum: merkezi yavaş falso ailesinde yüzde 90+ gol veren örnek yok.
- Gelecek yol örneklerini ve bildirilen toplam uçuş süresini değiştirme: önceki kaleci konumları aynı.
- Rules 5 için 100 karma girdinin tam sonuç/iz/plan regresyon SHA-256: e09b5386f6c8195a3eadc35619845aa9f82859527c307477affe52c05e76339f. Rules 4 mevcut sabit özet testi de geçer.
- Gerçek Edge işleyicisi sahte veritabanıyla rules 4/5/6, kimlik, yetki, yinelenen istek ve 10 vuruş sınırını geçti.
- Yeni yürüyüş yolu, gerçek krampon temas noktası, temas boyunca sıfır olmayan hız, yere basan ayağın sabitliği ve piksel örtülmesi test edildi. Canvas sahne karelerine bakıldı.

## Sınırlar
Gerçek iPhone/Safari, iki gerçek cihaz ve gerçek parmak hissi bu ortamda denenmedi. Animasyon hâlâ prosedürel, hareket yakalama kalitesinde değil. Kaleci tahmini dönen topun gizli spin değerini bilmez; geç kıvrım onu yanıltabilir. Tüm pozisyonların kapsamlı 810-strateji taraması bu sürümde tekrarlanmadı. Çoklu direk sekmelerinin genel çözümü bu değişikliğin kapsamına alınmadı. İstemcinin zamanlama girdisini bildirmesi önceki güven sınırı olarak sürer.

## Yayın
Önce geri uyumlu Edge, ardından GitHub Pages. Eski vuruşlar yeniden puanlanmaz. İstemci etiketi 20261004w.
