/* Duran Top - sonuç hesabı.
 * Tek ve saf bir fonksiyon: aynı girdi her zaman aynı top yolunu ve aynı sonucu verir.
 * Ekrandaki uçuş bu yolun çizimidir; sonuç ayrıca hesaplanmaz.
 * Zamana, ekrana ve Math.random'a bağlı değildir. Sonra sunucuda aynen çalışacak.
 *
 * Dünya: x sağ, y yukarı, z kaleye doğru (metre). Top (bx, 0) noktasından vurulur,
 * kale çizgisi z = D düzlemindedir ve ortası x = 0'dadır. y topun merkez yüksekliğidir.
 */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* girdi: { pos:{tip,bx,D}, aim:{x,y}, falso:-1|0|1, zaman:0..1|null, seed:int, antrenman:bool } */
  function hesapla(girdi) {
    var pos = girdi.pos, aim = girdi.aim;
    var rng = mulberry32(girdi.seed | 0);
    function gauss() {
      var u = Math.max(rng(), 1e-9), v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    var g = A.yercekimi, R = A.kale.topYaricap;
    var yari = A.kale.genislik / 2, H = A.kale.yukseklik;

    var zamanVar = typeof girdi.zaman === 'number';
    var hata = zamanVar ? girdi.zaman - 0.5 : 0;
    var bandaGirdi = zamanVar && Math.abs(hata) <= A.zaman.bant;
    var quality = Math.exp(-Math.pow(hata / 0.18, 2));
    var flight = DT.ucus.hedefliLaunch(pos,aim,girdi.contact||{x:0,y:0},hata,quality,gauss);
    var cx=flight.contact.x,cy=flight.contact.y,bx=pos.bx,D=pos.D,T=flight.T,dt=1/120,ornekler=flight.yol;
    var ax=flight.son.x,ay=flight.son.y;

    // 3) Baraj (yalnız frikik)
    var baraj = null, olayIndex = ornekler.length - 1, sonuc = null;
    if (pos.tip === 'frikik') {
      var ux = -bx, uz = D, ul = Math.hypot(ux, uz); ux /= ul; uz /= ul;
      var px = uz, pz = -ux;
      var mesafe = A.baraj.mesafe;
      baraj = { ux: ux, uz: uz, px: px, pz: pz, mesafe: mesafe, merkezX: bx + ux * mesafe, merkezZ: uz * mesafe };
      for (var k = 1; k < ornekler.length; k++) {
        var o = ornekler[k], pr = (o.x - bx) * ux + o.z * uz;
        if (pr >= mesafe) {
          var yanal = (o.x - bx) * px + o.z * pz;
          if (Math.abs(yanal) <= A.baraj.yarimGenislik + R && o.y <= A.baraj.boy + R) {
            sonuc = 'baraj'; olayIndex = k;
          }
          break;
        }
      }
    }

    // 4) Kale çizgisine yaklaşırken kaleci, yoksa direk / gol / aut.
    // Temas yalnızca son yarım metrede aranır; sahanın ortasındaki x,y çakışması kurtarış sayılmaz.
    var son = ornekler[ornekler.length - 1];
    var gecis = { x: son.x, y: son.y };
    var plan = DT.kaleci.planla(gecis, pos.tip, !!girdi.antrenman, gauss, T);
    var bolge = A.kale.direk / 2 + R;
    var kose = false;
    var direkYeri = null;

    function kaleciDegdi() {
      var i, o;
      for (i = 1; i < ornekler.length; i++) {
        o = ornekler[i];
        if (o.z < D - 0.5) continue;
        if (Math.abs(o.x) > yari + 0.4) continue;
        if (o.y > H + 0.3) continue;
        if (DT.kaleci.tutarMi(plan, o.t, o)) return i;
      }
      return -1;
    }

    if (!sonuc) {
      var temas = kaleciDegdi();
      if (temas >= 0) {
        sonuc = 'kurtaris';
        olayIndex = temas;
      } else {
        var disDirek = Math.abs(Math.abs(gecis.x) - yari);
        var direkte = false, iceride = false;
        if (disDirek <= bolge && gecis.y <= H + bolge) {
          direkte = true; direkYeri = 'yan'; iceride = Math.abs(gecis.x) < yari;
        } else if (Math.abs(gecis.y - H) <= bolge && Math.abs(gecis.x) <= yari) {
          direkte = true; direkYeri = 'ust'; iceride = gecis.y < H;
        }
        if (direkte) sonuc = iceride ? 'direk_gol' : 'direk_disari';
        else if (Math.abs(gecis.x) < yari - bolge && gecis.y < H - bolge) sonuc = 'gol';
        else sonuc = 'aut';
      }
    }
    if (sonuc === 'gol' || sonuc === 'direk_gol') {
      kose = Math.abs(gecis.x) >= yari - A.koseMetre;
    }

    // 5) Olay sonrası: aynı yolun devamı (file, kaleci, direk, baraj)
    var e = ornekler[olayIndex];
    var e0 = ornekler[Math.max(0, olayIndex - 1)];
    var gap = Math.max(e.t - e0.t, 1e-6);
    var v = { x: (e.x - e0.x) / gap, y: (e.y - e0.y) / gap, z: (e.z - e0.z) / gap };
    var sag = gecis.x >= 0 ? 1 : -1;
    var damp = 0;
    if (sonuc === 'gol') { v = { x: v.x * 0.3, y: v.y * 0.3, z: v.z * 0.3 }; damp = 3.5; }
    else if (sonuc === 'direk_gol') {
      // Direkten dönüp içeri düşer: değdiği yüzeyden gerçekten sekip file'ye gider.
      if (direkYeri === 'ust') v = { x: v.x * 0.4, y: -(Math.abs(v.y) * 0.5 + 0.8), z: v.z * 0.45 };
      else v = { x: -sag * Math.max(1.5, Math.abs(v.x) * 0.5), y: v.y * 0.5, z: v.z * 0.45 };
      damp = 3.0;
    }
    else if (sonuc === 'kurtaris') {
      var kk = plan.konum(e.t);
      v = { x: (e.x >= kk.x ? 1 : -1) * 2.2 + v.x * 0.1, y: Math.abs(v.y) * 0.15 + 1.5, z: -Math.abs(v.z) * 0.5 };
    }
    else if (sonuc === 'direk_disari') {
      if (direkYeri === 'ust') v = { x: v.x * 0.4, y: Math.abs(v.y) * 0.5 + 2.0, z: v.z * 0.3 };
      else v = { x: sag * Math.max(2.5, Math.abs(v.x) * 0.6), y: Math.abs(v.y) * 0.3 + 1.2, z: -0.3 * v.z };
    }
    else if (sonuc === 'baraj') { v = { x: -v.x * 0.25, y: 1.5, z: -0.3 * v.z }; }
    var p = { x: e.x, y: e.y, z: e.z }, tt = e.t;
    var tuttu = sonuc === 'kurtaris' && plan.eylem !== 'dal';
    var capture = tuttu ? plan.konum(tt) : null;
    var kalan = (sonuc === 'aut') ? 0.9 : 1.1;
    var netZ = D + 1.5;
    var sonrasi = [];
    for (var j = 1; j <= Math.round(kalan / dt); j++) {
      if (tuttu) {
        var kk = plan.konum(tt + j * dt), blend = Math.min(1, j * dt / .24);
        blend = blend * blend * (3 - 2 * blend);
        sonrasi.push({ t: tt + j * dt, x: kk.x + (e.x - capture.x) * (1 - blend),
          y: kk.y + (e.y - capture.y) * (1 - blend) + .2 * blend, z: e.z }); continue;
      }
      var aero = DT.ucus.acceleration([v.x,v.y,v.z],flight.spin,tt+j*dt);
      v.x += aero[0]*dt;v.y += aero[1]*dt;v.z += aero[2]*dt;
      if (damp) { var f = Math.exp(-damp * dt); v.x *= f; v.z *= f; }
      p.x += v.x * dt; p.y += v.y * dt; p.z += v.z * dt;
      if ((sonuc === 'gol' || sonuc === 'direk_gol') && p.z > netZ) { p.z = netZ; v.z = 0; }
      if (p.y < R) { p.y = R; v.y = Math.abs(v.y) > 0.8 ? -v.y * 0.4 : 0; v.x *= 0.85; v.z *= 0.85; }
      sonrasi.push({ t: tt + j * dt, x: p.x, y: p.y, z: p.z });
    }
    var yol = ornekler.slice(0, olayIndex + 1).concat(sonrasi);

    return {
      quality: quality, speed: flight.speed, spin: flight.spin, spinRps: flight.spinRps,
      ucusYol: ornekler, contact: {x:cx,y:cy}, tuttu: tuttu,
      sonuc: sonuc,                 // gol | kurtaris | direk_gol | direk_disari | baraj | aut
      yol: yol, olayT: e.t, ucusT: T,
      gecis: gecis, kose: kose, bandaGirdi: bandaGirdi, hata: hata,
      direkYeri: direkYeri, baraj: baraj, kaleci: plan, nokta: { x: ax, y: ay }
    };
  }

  DT.fizik = { hesapla: hesapla };
})(typeof globalThis !== 'undefined' ? globalThis : window);

