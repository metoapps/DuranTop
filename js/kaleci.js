/* Kaleci: önce ne yapacağına karar verir, sonra o pozu çizer ve aynı pozla temas arar.
 * Ortaya gelen top için dalış yok. Köşe, gövdenin yetişemeyeceği yerdir.
 * Aynı girdi (nişan, zaman, tohum) aynı kararı verir.
 */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function eylemSec(x, y) {
    var ax = Math.abs(x);
    // Gövde ve bir adımlık yan: ayakta kal, bacakları kapat, dalma.
    if (ax <= 1.22 && y >= 0.12 && y <= 2.2) {
      return {
        poz: 'bekle',
        yon: 0,
        hx: clamp(x, -0.5, 0.5),
        hy: clamp(y - 0.78, 1.0, 1.32)
      };
    }
    var yon = x >= 0 ? 1 : -1;
    return {
      poz: 'dal',
      yon: yon,
      hx: clamp(x, -1.32, 1.32),
      hy: clamp(y, 0.58, 1.42)
    };
  }

  function planla(gecis, tip, antrenman, gauss) {
    var K = A.kaleci;
    var tepki = K.tepki[tip] + (antrenman ? A.antrenman.tepkiEk : 0);
    var okuma = antrenman ? A.antrenman.okuma : K.okuma;
    var yari = A.kale.genislik / 2;
    var hedefte = Math.abs(gecis.x) <= yari + 0.55 && gecis.y <= A.kale.yukseklik + 0.4 && gecis.y >= 0;
    var okuX = 0, okuY = K.baslangicY;
    if (hedefte) {
      okuX = okuma * gecis.x + K.gurultu * gauss();
      okuY = K.baslangicY + okuma * (gecis.y - K.baslangicY) + 0.35 * K.gurultu * gauss();
      okuY = clamp(okuY, 0.2, 2.15);
    }
    var eylem = hedefte ? eylemSec(okuX, okuY) : { poz: 'bekle', yon: 0, hx: 0, hy: K.baslangicY };

    function konum(t) {
      var tau = Math.max(0, Math.min(1, (t - tepki) / K.dalis));
      var e = tau * tau * (3 - 2 * tau);
      var dal = eylem.poz === 'dal' && e > 0.42;
      return {
        x: eylem.hx * e,
        y: K.baslangicY + (eylem.hy - K.baslangicY) * e,
        ilerleme: e,
        yon: dal ? eylem.yon : 0,
        poz: dal ? 'dal' : 'bekle'
      };
    }
    return { tepki: tepki, dalis: eylem.poz === 'dal', hedefX: eylem.hx, hedefY: eylem.hy, eylem: eylem.poz, konum: konum };
  }

  function siluet(k) {
    var idx = k.poz === 'dal' ? (k.yon < 0 ? 1 : 2) : 0;
    return DT.KALECI_SILUET[idx];
  }

  /* Ayakta: dolu gövde (bacak arası delik yok). Dalışta: gövde + giden el. */
  function tutarMi(plan, t, gecis) {
    var k = plan.konum(t), R = A.kale.topYaricap;
    var dx = gecis.x - k.x, dy = gecis.y - k.y;
    if (k.poz !== 'dal') {
      return Math.abs(dx) <= 0.62 + R && dy >= -0.96 - R && dy <= 0.86 + R;
    }
    var yon = k.yon || 1;
    var gx = dx - yon * 0.62, gy = dy - 0.02;
    if ((gx * gx) / (0.78 * 0.78) + (gy * gy) / (0.38 * 0.38) <= 1) return true;
    return (dx * dx) / (0.48 * 0.48) + (dy * dy) / (0.34 * 0.34) <= 1;
  }

  DT.kaleci = { planla: planla, tutarMi: tutarMi, siluet: siluet };
})(typeof globalThis !== 'undefined' ? globalThis : window);
