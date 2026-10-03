/* Duran Top - kaleci.
 * Eski model yalnızca kale çizgisinde, görselin piksel şeridine bakıyordu: bacak arası, kol altı ve poz
 * değişimi anında top "içinden geçiyordu". Bu modelde:
 *   1) kaleci topun nereye gittiğini (gürültülü) okur ve bir EYLEM seçer: tutuş, alçak blok, zıplama, yan adım, dalış;
 *   2) beden ve eldivenler zamanla hareket eder; hareket süresi mesafeye bağlıdır (erişim fizikten çıkar);
 *   3) kurtarış bölgesi kapsüllerden (gövde, kollar, bacaklar) oluşur, boşluk bırakmaz ve poz ile sürekli değişir;
 *   4) çizim aynı eylem ve poz adını kullanır, çarpışma ile görüntü aynı kaynaktan gelir.
 * Dünya: x yan, y yukarı (m). Kaleci merkezi gövdenin ortası; ayakta yaklaşık y = 1.0. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR, K = A.kaleci;

  var EYLEM = {
    tutus:        { govde: 'ayakta', y: 1.00, tutar: true },
    blok_alcak:   { govde: 'ayakta', y: 0.80, tutar: true },
    ziplama:      { govde: 'ayakta', y: 1.35, tutar: true },
    adim:         { govde: 'ayakta' },
    dalis:        { govde: 'dalis', aci: 0, elX: 0.97, elY: 0.40, ek: '_0' },
    alcak_dalis:  { govde: 'dalis', aci: 0.5, elX: 1.04, elY: -0.11, ek: '_a' },
    yuksek_dalis: { govde: 'dalis', aci: -0.35, elX: 0.77, elY: 0.71, ek: '_y' }
  };

  /* Kurtarış maskesi: görselin alfa kanalından üretilir (tools/kaleci_maske.py), boşluklar kapalı, top yarıçapı eklenmiş.
   * Çizilen poz ile aynı kaynak olduğu için "topa değmeden tuttu / içinden geçti" olmaz. */
  var gridOnbellek = {};
  function izgara(anahtar) {
    var M = DT.KALECI_MASKE; if (!M || !M.maske[anahtar]) return null;
    if (gridOnbellek[anahtar]) return gridOnbellek[anahtar];
    var g = new Uint8Array(M.meta.nx * M.meta.ny);
    M.maske[anahtar].forEach(function (r) { for (var i = r[1]; i <= r[2]; i++) g[r[0] * M.meta.nx + i] = 1; });
    return (gridOnbellek[anahtar] = g);
  }
  /* Bu anda hangi maske? Yeni kare (assets/kaleci/<poz>.png) varsa onun maskesi, yoksa eski görselin eşleşen pozu. */
  function maskeSec(s) {
    var M = DT.KALECI_MASKE; if (!M) return null;
    var ad = s.poz, ayna = s.yon > 0;
    if (M.maske[ad]) return { anahtar: ad, ayna: ayna };           // yeni sola bakan kare, sağa ayna
    var e = EYLEM[s.eylem];
    if (e && e.govde === 'dalis' && /dalis/.test(ad)) return { anahtar: 'eski_dalis_' + (s.yon < 0 ? 'sol' : 'sag') + e.ek, ayna: false };
    return { anahtar: 'eski_ayakta', ayna: false };
  }
  function icerir(m, lx, ly) {
    var g = m && izgara(m.anahtar), M = DT.KALECI_MASKE; if (!g) return false;
    if (m.ayna) lx = -lx;
    var i = Math.floor((lx - M.meta.x0) / M.meta.h), j = Math.floor((M.meta.y1 - ly) / M.meta.h);
    return !(i < 0 || j < 0 || i >= M.meta.nx || j >= M.meta.ny) && g[j * M.meta.nx + i] === 1;
  }
  function sinifMaske(eylem, yon) {         // eylem sırasında kullanılan maske
    var M = DT.KALECI_MASKE, E = EYLEM[eylem];
    if (M.maske[eylem]) return { anahtar: eylem, ayna: yon > 0 };
    if (E.govde === 'dalis') return { anahtar: 'eski_dalis_' + (yon < 0 ? 'sol' : 'sag') + E.ek, ayna: false };
    return { anahtar: 'eski_ayakta', ayna: false };
  }
  /* Kaleci, topu maskesinin MERKEZİNE en derin alacak yerleşimi, zamanında yetişebileceği adaylar arasından seçer
   * (gövdeyi eldivene göre kaydırma). Okuma hatasına karşı derinlik payı kalır; yetişemiyorsa en uzağa uzanır. */
  function derinlik(m, lx, ly) {
    if (!icerir(m, lx, ly)) return -1;
    for (var P = 0.02; P <= 0.30001; P += 0.02) {
      if (!(icerir(m, lx + P, ly) && icerir(m, lx - P, ly) && icerir(m, lx, ly + P) && icerir(m, lx, ly - P))) return P - 0.02;
    }
    return 0.30;
  }
  function yerlesim(eylem, yon, gx, gy, butce) {
    var E = EYLEM[eylem], m = sinifMaske(eylem, yon), best = null, bx, by;
    var byListe = [];
    if (E.y) byListe.push(E.y);
    else if (E.govde === 'ayakta') byListe.push(K.baslangicY);
    else for (by = 0.55; by <= 1.6001; by += 0.05) byListe.push(by);
    var azami = Math.max(0, (butce - K.dalisSure0)) * K.dalisHiz;        // bu sürede alınabilecek en uzun yol (m)
    for (var iy = 0; iy < byListe.length; iy++) for (bx = -2.4; bx <= 2.4001; bx += 0.05) {
      var c = Math.hypot(bx, byListe[iy] - K.baslangicY);
      if (c > azami + 1e-6 && !(E.govde === 'ayakta' && c < 1e-6)) continue;
      var dp = derinlik(m, gx - bx, gy - byListe[iy]);
      if (dp < 0) continue;
      dp = Math.min(dp, 0.24);
      if (!best || dp > best.dp + 1e-9 || (Math.abs(dp - best.dp) < 1e-9 && c < best.c)) best = { bx: bx, by: byListe[iy], c: c, dp: dp };
    }
    return best;
  }
  function maskeHucreleri(plan, t) {          // yalnızca denetim çizimi için (dünya koordinatı kareleri)
    var s = plan.konum(t), m = maskeSec(s), g = m && izgara(m.anahtar), M = DT.KALECI_MASKE, out = [];
    if (!g) return out;
    for (var j = 0; j < M.meta.ny; j++) for (var i = 0; i < M.meta.nx; i++) if (g[j * M.meta.nx + i]) {
      var x = M.meta.x0 + (i + 0.5) * M.meta.h, y = M.meta.y1 - (j + 0.5) * M.meta.h;
      out.push([(m.ayna ? -x : x) + s.x, y + s.y, M.meta.h]);
    }
    return out;
  }

  function planla(gecis, tip, antrenman, gauss, ucusT) {
    var yari = A.kale.genislik / 2;
    var tepki = K.tepki[tip] + (antrenman ? A.antrenman.tepkiEk : 0);
    var okuma = antrenman ? A.antrenman.okuma : K.okuma;
    var hiz = (antrenman ? K.dalisHizAntrenman : K.dalisHiz) * Math.max(0.8, Math.min(1.2, 1 + K.hizSapma * gauss()));   // her vuruşta küçük, tohumdan gelen fark
    var hedefte = Math.abs(gecis.x) <= yari + 0.8 && gecis.y <= A.kale.yukseklik + 0.8;
    var eylem = 'tutus', gx = 0, gy = K.baslangicY, yon = 0, bx = 0, by = K.baslangicY, aci = 0;
    if (hedefte) {
      // okunan nokta: gürültülü ve (antrenmanda) biraz eksik okunur
      gx = (gecis.x * okuma) + K.gurultu * (antrenman ? 1.5 : 1) * gauss();
      gy = gecis.y + 0.8 * K.gurultu * (antrenman ? 1.5 : 1) * gauss();
      var ax = Math.abs(gx), yg; yon = gx < 0 ? -1 : 1;
      if (ax < K.merkez) {                    // üstüne gelen top: yerinde kalır, tutar ya da bloklar
        eylem = gy < 0.55 ? 'blok_alcak' : (gy > 1.7 ? 'ziplama' : 'tutus');
        yon = 0;
      } else if (ax < K.yanAdim && gy >= 0.65 && gy <= 1.7) {
        eylem = 'adim';
      } else {
        eylem = gy < 0.7 ? 'alcak_dalis' : (gy > 1.6 ? 'yuksek_dalis' : 'dalis');
      }
      var butce = (antrenman ? 0.0 : 0.0) + (ucusT || 0.5) - tepki;      // vuruştan topun çizgiye gelmesine kalan süre
      yg = yerlesim(eylem, yon, gx, gy, butce);
      if (!yg && eylem === 'adim') { eylem = gy < 0.7 ? 'alcak_dalis' : (gy > 1.6 ? 'yuksek_dalis' : 'dalis'); yg = yerlesim(eylem, yon, gx, gy, butce); }
      if (yg) { bx = yg.bx; by = yg.by; }
      else if (EYLEM[eylem].elX) {            // yetişemeyecek bir top: yine de o yöne en uzağa uzanır
        bx = Math.max(-2.4, Math.min(2.4, gx - yon * EYLEM[eylem].elX * 0.9));
        by = Math.max(0.55, Math.min(1.6, gy - EYLEM[eylem].elY));
      }
      if (EYLEM[eylem].y) by = EYLEM[eylem].y;
    }
    var sure = Math.max(0.12, K.dalisSure0 + Math.hypot(bx, by - K.baslangicY) / hiz);

    function konum(t) {
      var tau = Math.max(0, Math.min(1, (t - tepki) / (bx || by !== K.baslangicY ? sure : 0.18)));
      var e = tau * tau * (3 - 2 * tau), E = EYLEM[eylem];
      var dalistaMi = E.govde === 'dalis' && tau > 0.15;                 // dalış pozu tek adımda: çizim ve maske aynı
      var poz = t < tepki ? 'hazir' : (E.govde === 'dalis' && !dalistaMi ? 'hazir' : eylem);
      return { x: bx * e, y: K.baslangicY + (by - K.baslangicY) * e, ilerleme: tau, yon: yon, poz: poz, eylem: eylem,
               aci: dalistaMi ? E.aci * (-yon) : 0 };    // matematiksel dönüş (saat yönü tersi +): sola dalışta eldivenler aşağı = +
    }
    return { eylem: eylem, tepki: tepki, sure: sure, hedefX: bx, hedefY: by, okunan: { x: gx, y: gy },
             dalis: eylem !== 'tutus', tutar: !!EYLEM[eylem].tutar, konum: konum };
  }

  /* Top bu anda kalecinin maskesine giriyor mu? (top merkezi, yarıçap maskeye eklenmiş) */
  function tutarMi(plan, t, gecis) {
    var s = plan.konum(t);
    return icerir(maskeSec(s), gecis.x - s.x, gecis.y - s.y);
  }

  DT.kaleci = { planla: planla, tutarMi: tutarMi, maskeHucreleri: maskeHucreleri, EYLEM: EYLEM };
})(typeof globalThis !== 'undefined' ? globalThis : window);
