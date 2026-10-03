/* Duran Top - karakter ve sprite verisi.
 * Sprite dosyaları 900x560 şeffaf PNG. Basan ayak her karede (450, 540) noktasında.
 * tipX/tipY: vuruş karesinde vuran ayağın ucu (sprite pikseli). Top çıkışı bu noktaya göre hizalanır. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});

  DT.SPRITE = { genislik: 900, yukseklik: 560, ankrajX: 450, ankrajY: 540, boy: 474 };

  DT.KARAKTER = [
    { id: 'meto',  ad: 'METO',  renk: '#e63946' },
    { id: 'lort',  ad: 'LORT',  renk: '#2f6fed' },
    { id: 'fero',  ad: 'FERO',  renk: '#e8e8e8' },
    { id: 'latte', ad: 'LATTE', renk: '#d7263d' },
    { id: 'josh',  ad: 'JOSH',  renk: '#7b3fe4' }
  ];

  DT.POZ = ['bekle', 'sevinc', 'kacirma', 'vurus1', 'vurus2', 'vurus3'];

  DT.SPRITE_NOKTA = {"meto": {"vurus1": {"tipX": 267, "tipY": 336, "top": 63, "bottom": 536}, "vurus2": {"tipX": 291, "tipY": 373, "top": 76, "bottom": 536}, "vurus3": {"tipX": 281, "tipY": 288, "top": 78, "bottom": 536}}, "lort": {"vurus1": {"tipX": 304, "tipY": 350, "top": 64, "bottom": 536}, "vurus2": {"tipX": 300, "tipY": 424, "top": 66, "bottom": 536}, "vurus3": {"tipX": 295, "tipY": 326, "top": 70, "bottom": 536}}, "fero": {"vurus1": {"tipX": 250, "tipY": 324, "top": 63, "bottom": 536}, "vurus2": {"tipX": 286, "tipY": 355, "top": 69, "bottom": 536}, "vurus3": {"tipX": 269, "tipY": 275, "top": 69, "bottom": 536}}, "latte": {"vurus1": {"tipX": 271, "tipY": 330, "top": 63, "bottom": 536}, "vurus2": {"tipX": 298, "tipY": 378, "top": 72, "bottom": 536}, "vurus3": {"tipX": 283, "tipY": 294, "top": 68, "bottom": 536}}, "josh": {"vurus1": {"tipX": 269, "tipY": 335, "top": 63, "bottom": 536}, "vurus2": {"tipX": 296, "tipY": 363, "top": 75, "bottom": 536}, "vurus3": {"tipX": 292, "tipY": 293, "top": 77, "bottom": 536}}};
  // Eski tek-sayfa kaleci görseli (assets/kaleci-v2.png) kesim kutuları. Çarpışma artık kapsüllerle (js/kaleci.js).
  DT.KALECI_SILUET = [{"box": [0, 75, 490, 535], "w": 1.694392523364486, "h": 1.85}, {"box": [500, 90, 840, 470], "w": 2.05531914893617, "h": 1.15}, {"box": [1340, 100, 708, 460], "w": 1.7699999999999998, "h": 1.15}];

  /* Sonradan eklenecek kareler: yoksa oyun yedek diziyle devam eder (adlar assets/ içindeki dosya adlarıdır). */
  DT.OPSIYONEL = {
    vurus: ['yaklas1', 'yaklas2', 'temas', 'dengeye'],        // assets/sprites/<ad>_<kare>.png (900x560, basan ayak 450,540)
    sevincKare: 6, sevincFps: 7,                              // assets/sprites/<ad>_sev1..sev6.png
    kaleci: ['hazir', 'adim', 'alcak_dalis', 'dalis', 'yuksek_dalis', 'blok_alcak', 'ziplama', 'tutus', 'toparlan']   // assets/kaleci/<poz>.png
  };
  DT.KALECI_TUVAL = { w: 1200, h: 800, cx: 600, cy: 400, pxM: 324 };   // gövde merkezi (600,400), 324 piksel = 1 metre
  DT.VURUS_SEKANS = {
    uzun: [{ k: 'yaklas1', s: 0.15 }, { k: 'yaklas2', s: 0.15 }, { k: 'vurus1', s: 0.14 }, { k: 'temas', s: 0.09, temas: true }, { k: 'vurus3', s: 0.22 }, { k: 'dengeye', s: 0.45 }],
    kisa: [{ k: 'vurus1', s: 0.34 }, { k: 'vurus2', s: 0.10, temas: true }, { k: 'vurus3', s: 0.40 }]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
