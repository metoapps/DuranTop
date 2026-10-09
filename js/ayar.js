/* Duran Top - ayarlar. Oyunun hissini değiştirmek için yalnızca bu dosyadaki sayıları değiştir. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});

  DT.AYAR = {
    kale: { genislik: 7.32, yukseklik: 2.44, direk: 0.12, topYaricap: 0.11 },

    // Official weekly round: five penalties, two 18m free kicks and three 28m free kicks.
    pozisyonlar: [
      {tip:'penalti',ad:'Penaltı 1',bx:0,D:11},
      {tip:'penalti',ad:'Penaltı 2',bx:0,D:11},
      {tip:'penalti',ad:'Penaltı 3',bx:0,D:11},
      {tip:'penalti',ad:'Penaltı 4',bx:0,D:11},
      {tip:'penalti',ad:'Penaltı 5',bx:0,D:11},
      {tip:'frikik',ad:'Yakın frikik · 18 m (sağ)',bx:5,D:Math.sqrt(18*18-25)},
      {tip:'frikik',ad:'Yakın frikik · 18 m (sol)',bx:-5,D:Math.sqrt(18*18-25)},
      {tip:'frikik',ad:'Uzak frikik · 28 m (sağ)',bx:7,D:Math.sqrt(28*28-49)},
      {tip:'frikik',ad:'Uzak frikik · 28 m (sol)',bx:-7,D:Math.sqrt(28*28-49)},
      {tip:'frikik',ad:'Uzak frikik · 28 m (orta)',bx:0,D:28}
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

    // Kaleci: yalnızca js/kaleci.js'in gerçekten kullandığı sayılar (eski kullanılmayan okuma/gürültü/erişim/dalış alanları kaldırıldı).
    kaleci: {
      penaltiHiz: 6.6, frikikHiz: 7.5,          // beden hızı (m/s): erişim hız ve süreden çıkar
      penaltiYanlisKose: .07, frikikMerkezHatasi: .20,   // yanlış karar olasılıkları (tohumdan gelir)
      tepki: { penalti: 0.17, frikik: 0.24 },    // vuruştan sonra harekete geçme süresi (s)
      okumaGecikme: { penalti: 0.02, frikik: 0.30 },   // tepkiden sonra topun hızını görüp tahmin ettiği an (s)
      hedefGurultuX: 0.06, hedefGurultuY: 0.04,  // tahmin sapması (m)
      merkezEsik: 0.75,                          // |x| bunun altı "üstüne gelen" top: yerinde bekler/bloklar
      elMenzili: 0.72,                           // gövde, hedefin bu kadar yanına dalar (eldiven öne uzanır)
      hareketSabit: 0.08,                        // her hareketin sabit süresi (s)
      baslangicY: 1.0
    },
    antrenman: { tepkiEk: 0.035, hizAzalt: 0.6 },   // antrenmanda kaleci biraz yavaş
    puan: { penalti: 100, frikik: 110, zaman: 10, zor: 5, bonusTavan: 15 },
    koseMetre: 1.0,       // direğe bu kadar yakın gol = "köşe"

    zamanCubuguSuresi: 0.80   // çubuğun bir yönde gidiş süresi (s)
  };
  // Shared by the visible bar, launch quality and server-side bonus calculation.
  DT.koseBandi=function(aim){var base=DT.AYAR.zaman.bant;if(!aim)return base;
    function clamp(v){return Math.max(0,Math.min(1,v));}
    var side=clamp((Math.abs(aim.x)-2.45)/.85),top=clamp((aim.y-1.65)/.55),bottom=clamp((.70-aim.y)/.50);
    return base*(1-.48*side*Math.max(top,bottom));
  };
  // Undefined power preserves historical replay; every new shot supplies power.
  DT.zamanBandi=function(aim,guc,k10){var corner=DT.koseBandi(aim);if(typeof guc!=='number')return corner;
    var t=Math.max(0,Math.min(1,(guc-.3)/.7));return corner*(k10?1.35-.80*t*t:1.35-.65*t*t);   // kural 10: %100 güçte yeşil bant 0,55 kat (eskiden 0,70)
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

