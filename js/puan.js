/* Puan: gol temel puan getirir; bonuslar küçük ve sınırlı. Gol olmayan vuruş 0 puan. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var P = DT.AYAR.puan;

  function puanla(tip, sonuc, bandaGirdi, kose) {
    var gol = sonuc.sonuc === 'gol' || sonuc.sonuc === 'direk_gol';
    if (!gol) return { puan: 0, taban: 0, zaman: 0, zor: 0, gol: false };
    var taban = tip === 'frikik' ? P.frikik : P.penalti;
    var zaman = sonuc.bandaGirdi ? P.zaman : 0;
    var zor = (sonuc.kose || sonuc.sonuc === 'direk_gol') ? P.zor : 0;
    var bonus = Math.min(P.bonusTavan, zaman + zor);
    return { puan: taban + bonus, taban: taban, zaman: zaman, zor: zor, gol: true };
  }

  DT.puan = { puanla: puanla };
})(typeof globalThis !== 'undefined' ? globalThis : window);
