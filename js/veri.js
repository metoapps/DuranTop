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

  DT.SPRITE_NOKTA = {"meto": {"vurus1": {"tipX": 267, "tipY": 336, "top": 63, "bottom": 536}, "vurus2": {"tipX": 289, "tipY": 352, "top": 76, "bottom": 536}, "vurus3": {"tipX": 281, "tipY": 288, "top": 78, "bottom": 536}}, "lort": {"vurus1": {"tipX": 304, "tipY": 350, "top": 64, "bottom": 536}, "vurus2": {"tipX": 299, "tipY": 396, "top": 66, "bottom": 536}, "vurus3": {"tipX": 295, "tipY": 326, "top": 70, "bottom": 536}}, "fero": {"vurus1": {"tipX": 250, "tipY": 324, "top": 63, "bottom": 536}, "vurus2": {"tipX": 283, "tipY": 344, "top": 69, "bottom": 536}, "vurus3": {"tipX": 269, "tipY": 275, "top": 69, "bottom": 536}}, "latte": {"vurus1": {"tipX": 271, "tipY": 330, "top": 63, "bottom": 536}, "vurus2": {"tipX": 293, "tipY": 353, "top": 72, "bottom": 536}, "vurus3": {"tipX": 283, "tipY": 294, "top": 68, "bottom": 536}}, "josh": {"vurus1": {"tipX": 269, "tipY": 335, "top": 63, "bottom": 536}, "vurus2": {"tipX": 293, "tipY": 351, "top": 75, "bottom": 536}, "vurus3": {"tipX": 292, "tipY": 293, "top": 77, "bottom": 536}}};
})(typeof globalThis !== 'undefined' ? globalThis : window);
