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

  function tutarMi(plan, t, gecis) {
    var k = plan.konum(t);
    var dx = (gecis.x - k.x) / A.kaleci.erisimX, dy = (gecis.y - k.y) / A.kaleci.erisimY;
    return dx * dx + dy * dy <= 1;   // erişim bir elips: hem yana hem yüksekliğe yetişmesi gerekir
  }

  DT.kaleci = { planla: planla, tutarMi: tutarMi };
})(typeof globalThis !== 'undefined' ? globalThis : window);
