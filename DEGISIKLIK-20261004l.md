# Falso ve alttan temas düzeltmesi

## Temas etkisinin korunması (20261004l)
Kök neden: ters nişan çözücüsü, seçilen yan/alt teması da kullanıyor ve falso/yükselme etkisini hedefe ulaşacak şekilde telafi ediyordu. Yeni kural yalnız temiz merkez teması hedefe kalibre eder. Ardından gerçek temas, spin, çıkış yönü, güç ve zamanlama uygulanır. Magnus kuvveti uçuş boyunca sapma üretir; örneklenmiş yol hedefe geri bükülmez. Yan temasın varış noktası artık hedef işaretinden farklı olabilir; önizleme bu yolu gösterir.

Alttan temas, temas derinliğinin karesiyle ve hızla ölçeklenen ek çıkış açısı üretir. Ek eğim hız vektörünü döndürerek uygulanır; kendi başına hız büyüklüğüne enerji eklemez. Güç, temas ve hava katsayıları deneysel ölçüm değil oyun için kalibre edilmiş yaklaşımlardır. En alttan tam güçlü şutun belirgin yükselmesi ve üstten aut olması doğrulanır.

Yeni resmi girdiler rules=3. Eski rules=1/2 vuruşlar eski hesapla canlandırılır; kaydedilen puanlar yeniden hesaplanmaz. Yeni sunucu/istemci aynı hesabı kullanır. Eski açık sekmeler yenilenmelidir. Kimlikler ve haftalık haklar değişmez; SQL göçü yok.

Kontroller: tests/temas-fizigi.cjs sağ/sol simetriyi, kenara yaklaştıkça ve mesafe arttıkça artan sapmayı, on pozisyonda tam güçlü alt temasın aut/0 puan olmasını, merkez nişan doğruluğunu ve eski girdi uyumunu doğrular. Akış, özel kimlik ve fizik regresyonları da çalıştırıldı. Gerçek iPhone/Safari bu sürümde burada denenmedi.
