/* Duran Top - ayarlar. Oyunun hissini değiştirmek için yalnızca bu dosyadaki sayıları değiştir. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});

  var FRIKIK_MESAFE = 22;     // kale ortasına doğrudan mesafe (m)
  var FRIKIK_YAN = 7;         // topun orta çizgiden yanal uzaklığı (m)

  DT.AYAR = {
    kale: { genislik: 7.32, yukseklik: 2.44, direk: 0.12, topYaricap: 0.11 },

    // Herkes aynı beş pozisyonu oynar. Kimse mesafe seçmez.
    pozisyonlar: [
      { tip: 'penalti', ad: 'Penaltı 1', bx: 0, D: 11 },
      { tip: 'penalti', ad: 'Penaltı 2', bx: 0, D: 11 },
      { tip: 'penalti', ad: 'Penaltı 3', bx: 0, D: 11 },
      { tip: 'frikik', ad: 'Frikik (sağdan)', bx: FRIKIK_YAN, D: Math.sqrt(FRIKIK_MESAFE * FRIKIK_MESAFE - FRIKIK_YAN * FRIKIK_YAN) },
      { tip: 'frikik', ad: 'Frikik (soldan)', bx: -FRIKIK_YAN, D: Math.sqrt(FRIKIK_MESAFE * FRIKIK_MESAFE - FRIKIK_YAN * FRIKIK_YAN) }
    ],

    baraj: { mesafe: 9.15, yarimGenislik: 1.1, boy: 1.82, oyuncu: 4 },

    hiz: { penalti: 25, frikik: 24 },   // m/s
    yercekimi: 9.81,

    // Zamanlama çubuğu: 0..1, tam isabet 0.5
    zaman: {
      bant: 0.035,        // tam bandın yarı genişliği
      sapmaY: 3.2,       // geç basınca top yukarı, erken basınca aşağı gider (m, hatanın 1 birimi için)
      sapmaX: 1.5,       // yana sapma
      erkenYavas: 0.7,   // erken basınca top yavaşlar
      gecHiz: 0.25
    },

    falsoMetre: 1.6,     // falsonun topu yandan en fazla ne kadar eğdiği (m)

    kaleci: {
      tepki: { penalti: 0.17, frikik: 0.55 },  // vuruştan sonra harekete geçme süresi (s); frikikte baraj görüşü kapatır, kaleci topu geç görür
      okuma: 1.0,         // topun gideceği yeri ne kadar okur (1 = kusursuz; antrenmanda aşağıdaki değer)
      gurultu: 0.18,      // okuma sapması (m)
      hizSapma: 0.10,     // dalış hızının vuruştan vuruşa değişimi (oran)
      dalisSure0: 0.10,   // her hareketin sabit kısmı (s)
      dalisHiz: 6.0,      // beden ortalama bu hızla yer değiştirir (m/s); erişim bundan çıkar
      dalisHizAntrenman: 5.4,
      merkez: 0.35,       // |x| bunun altındaki şutlar kalecinin üstüne gelmiş sayılır: yerinde tutar ya da bloklar
      yanAdim: 1.0,       // |x| bunun altındaki orta yükseklikte şutlarda kısa yan adım
      baslangicY: 1.0
    },
    antrenman: { tepkiEk: 0.08, okuma: 0.80 },   // antrenmanda kaleci daha yavaş

    puan: { penalti: 100, frikik: 110, zaman: 10, zor: 5, bonusTavan: 15 },
    koseMetre: 1.0,       // direğe bu kadar yakın gol = "köşe"

    zamanCubuguSuresi: 0.80   // çubuğun bir yönde gidiş süresi (s)
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
