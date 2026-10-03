/* Kaleci modeli: top vurulduktan sonra tepki verir, topun gideceği yeri kısmen okur. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR;

  function planla(gecis, tip, antrenman, gauss) {
    var K = A.kaleci;
    var tepki = K.tepki[tip] + (antrenman ? A.antrenman.tepkiEk : 0);
    var okuma = antrenman ? A.antrenman.okuma : K.okuma;
    var yari = A.kale.genislik / 2;

    var hedefte = Math.abs(gecis.x) <= yari + 0.8 && gecis.y <= A.kale.yukseklik + 0.8;
    var okuX = 0, okuY = K.baslangicY;
    if (hedefte) {
      okuX = okuma * gecis.x + K.gurultu * gauss();
      // Plan body position so the leading gloves, not the stomach, pursue the ball.
      if (Math.abs(okuX) > 0.45) okuX -= Math.sign(okuX) * 0.30;
      okuY = K.baslangicY + okuma * (gecis.y - K.baslangicY) + 0.5 * K.gurultu * gauss();
      okuY = Math.max(K.enAz, Math.min(K.enCok, okuY));
    }
    var dalis = hedefte;

    function konum(t) {
      var tau = dalis ? Math.max(0, Math.min(1, (t - tepki) / K.dalis)) : 0;
      var e = tau * tau * (3 - 2 * tau);
      return {
        x: okuX * e,
        y: K.baslangicY + (okuY - K.baslangicY) * e,
        ilerleme: tau,
        yon: okuX === 0 ? 0 : (okuX > 0 ? 1 : -1)
      };
    }
    return { tepki: tepki, dalis: dalis, hedefX: okuX, hedefY: okuY, konum: konum };
  }

  function siluet(k) {
    var dive = k.ilerleme > 0.15 && k.yon !== 0;
    return DT.KALECI_SILUET[dive ? (k.yon < 0 ? 1 : 2) : 0];
  }
  function tutarMi(plan, t, gecis) {
    var k = plan.konum(t), shape = siluet(k), R = A.kale.topYaricap;
    // Same measured silhouette used by the renderer. Ball-circle vs opaque body strips.
    return shape.strips.some(function (r) {
      var dx = Math.max(k.x + r[0] - gecis.x, 0, gecis.x - k.x - r[1]);
      var dy = Math.max(k.y + r[2] - gecis.y, 0, gecis.y - k.y - r[3]);
      return dx * dx + dy * dy <= R * R;
    });
  }

  DT.kaleci = { planla: planla, tutarMi: tutarMi, siluet: siluet };
})(typeof globalThis !== 'undefined' ? globalThis : window);
