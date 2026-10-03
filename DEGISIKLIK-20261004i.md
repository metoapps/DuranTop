# Özel oyuncular ve haftalık Juninho Kupası

Beş sabit kimlik için ayrı özel giriş kodu ve sunucu oturumu eklendi. Katılım ve vuruş, giriş yapılan karakterle eşleşmek zorunda. Cihaz değiştirmek haftalık hakkı yenilemez.

İstanbul haftasında tek ortak kupa: 5 penaltı, 2 adet 18 m frikik ve 3 adet 28 m frikik. Haftalık ve toplam gol tabloları otomatik güncellenir. Öncelik gol, eşitlikte puan. Antrenman resmi tabloya yazılmaz.

SQL göçü: backend/kimlik-hafta.sql. Yayın sırası SQL → Edge → site. Oda sürümü 8. Eski kupalar silinmez. Giriş kodları ayrı özel dosyada teslim edilir; kaynak depoda bulunmaz. Giriş kodunu bilen kişi kimliğe erişebilir; her kod yalnız sahibine iletilmelidir.

Kontroller: özel kimlik ve haftalık sınır için gerçek Edge işleyicisi/sahte veri katmanı, on vuruşluk arayüz akışı, çevrimdışı tekrar, tüm fizik/kaleci/ses/çizim regresyonları. Yayından önce gerçek Supabase API denemeleri de yapılır; gerçek iPhone/Safari bu sürümde burada denenmemiştir.
