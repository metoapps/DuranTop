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
    aerodinamik: { kutle:.43, havaYogunlugu:1.20, cd:.25, clEgilim:.9,
      clTavan:.35, spinAktarimi:.23, spinSonumu:.12, sekme:.35 },

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
      penaltiHiz:6.32, penaltiYanlisKose: .07, frikikMerkezHatasi: .20, frikikHiz: 7.5,
      tepki: { penalti: 0.17, frikik: 0.24 },  // top vurulduktan kaç saniye sonra hareket eder
      dalis: 0.34,        // dalışın süresi (s)
      okuma: 0.84,        // topun gideceği yeri ne kadar doğru okur (1 = kusursuz)
      gurultu: 0.12,      // okuma sapması (m)
      erisimX: 0.80,      // yana erişim (m)
      erisimY: 0.90,      // yukarı-aşağı erişim (m)
      baslangicY: 1.0,
      enAz: 0.45, enCok: 1.9
    },
    antrenman: { tepkiEk: 0.035, okuma: 0.90 },   // antrenmanda kaleci daha yavaş

    puan: { penalti: 100, frikik: 110, zaman: 10, zor: 5, bonusTavan: 15 },
    koseMetre: 1.0,       // direğe bu kadar yakın gol = "köşe"

    zamanCubuguSuresi: 0.80   // çubuğun bir yönde gidiş süresi (s)
  };
  // Shared by the visible bar, launch quality and server-side bonus calculation.
  DT.zamanBandi=function(aim){var base=DT.AYAR.zaman.bant;if(!aim)return base;
    function clamp(v){return Math.max(0,Math.min(1,v));}
    var side=clamp((Math.abs(aim.x)-2.45)/.85),top=clamp((aim.y-1.65)/.55),bottom=clamp((.70-aim.y)/.50);
    return base*(1-.48*side*Math.max(top,bottom));
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

