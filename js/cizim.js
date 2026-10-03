/* Duran Top - çizim. Canvas 2.5D: dünya (metre) bir kamerayla ekrana izdüşürülür.
 * Bu dosya sonuç hesaplamaz; yalnızca fizik.js'nin verdiği yolu ve kaleci konumunu çizer. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR, S = DT.SPRITE;

  var KAMERA = {
    penalti: { geri: 5.0, yuk: 3.2, kaleGen: 0.74, kaleY: 0.27 },
    frikik:  { geri: 15.0, yuk: 4.5, kaleGen: 0.74, kaleY: 0.27 }
  };

  var cv, ctx, W = 360, H = 640, dpr = 1;
  var kam = null, arka = null, pos = null;
  var gorseller = {};          // yüklenen sprite görselleri
  var yuklenen = 0, gereken = DT.KARAKTER.length * (DT.POZ.length + 3) + 1, yuklemeHatasi = false;
  function yuklemeBildir() {
    var el = root.document && root.document.getElementById("yukleme");
    if (!el) return;
    el.hidden = !yuklemeHatasi && yuklenen >= gereken;
    el.textContent = yuklemeHatasi ? "Görseller yüklenemedi. Yenilemek için buraya dokun." : "Görseller yükleniyor…";
  }
  var opsiyonel = {};          // varsa assets/ içindeki top, kaleci vb. görselleri

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  function kameraKur(p) {
    var ayar = KAMERA[p.tip];
    if (H < 650) ayar = { geri: ayar.geri, yuk: p.tip === 'frikik' ? ayar.yuk : 1.8, kaleGen: ayar.kaleGen, kaleY: .25 };   // küçük ekranda frikikte alçak kamera barajı kalenin önüne koyar
    var ul = Math.hypot(-p.bx, p.D), ux = -p.bx / ul, uz = p.D / ul;
    var C = [p.bx - ux * ayar.geri, ayar.yuk, -uz * ayar.geri];
    var hedef = [0, 1.0, p.D];
    var f = norm([hedef[0] - C[0], hedef[1] - C[1], hedef[2] - C[2]]);
    var r = norm(cross([0, 1, 0], f));
    var up = cross(f, r);
    var k = { C: C, f: f, r: r, up: up, cx: W / 2, cy: 0, F: 1, ky: 1 };
    var merkez = [0, 1.2, p.D];
    var d = [merkez[0] - C[0], merkez[1] - C[1], merkez[2] - C[2]];
    var zc = dot(d, f);
    k.F = ayar.kaleGen * W * zc / A.kale.genislik;
    var yc = dot(d, up);
    var kaleYpx = ayar.kaleY * H;
    // Top, alttaki kontrol panelinin ve oyuncunun üstünde kalsın: panel yaklaşık 235 px, oyuncunun ayakları topun ~0.083H altında.
    var panel = p.tip === 'frikik' ? 229 : 165;      // alt panelin yüksekliği (px); oyuncunun ayakları topun ~70 px altında
    var topHedef = Math.max(0.5 * H, Math.min(0.66 * H, H - panel - 82));
    var db = [p.bx - C[0], A.kale.topYaricap - C[1], 0 - C[2]];
    var zb = dot(db, f);
    var terim = k.F * (dot(d, up) / zc - dot(db, up) / zb);       // ky = 1 için top, kale merkezinin bu kadar altında
    k.ky = terim > 1 ? Math.max(H < 650 ? (p.tip === 'frikik' ? 0.55 : 1.1) : 0.82, Math.min(1.3, (topHedef - kaleYpx) / terim)) : 1;
    k.cy = kaleYpx + k.F * k.ky * yc / zc;
    return k;
  }

  function izdus(x, y, z) {
    var d = [x - kam.C[0], y - kam.C[1], z - kam.C[2]];
    var zc = dot(d, kam.f);
    if (zc < 0.3) return null;
    return { x: kam.cx + kam.F * dot(d, kam.r) / zc, y: kam.cy - kam.F * kam.ky * dot(d, kam.up) / zc, d: zc, olcek: kam.F / zc };
  }

  /* Ekrandaki bir noktadan kale düzlemine (z = D) ışın at. */
  function ekranToKale(px, py) {
    var xc = (px - kam.cx) / kam.F, yc = -(py - kam.cy) / (kam.F * kam.ky);
    var dir = [
      kam.f[0] + xc * kam.r[0] + yc * kam.up[0],
      kam.f[1] + xc * kam.r[1] + yc * kam.up[1],
      kam.f[2] + xc * kam.r[2] + yc * kam.up[2]
    ];
    if (Math.abs(dir[2]) < 1e-6) return null;
    var t = (pos.D - kam.C[2]) / dir[2];
    if (t <= 0) return null;
    return { x: kam.C[0] + t * dir[0], y: kam.C[1] + t * dir[1] };
  }

  /* ---------- görseller ---------- */
  var SURUM = '20261003e';
  function gorselYukle(ad, yol, istege) {
    var im = new root.Image();
    im.onload = function () { gorseller[ad] = im; if (!istege) { yuklenen++; yuklemeBildir(); } };
    im.onerror = function () { if (!istege) { yuklemeHatasi = true; yuklemeBildir(); } };   // isteğe bağlı kare yoksa oyun yedeğiyle sürer
    im.src = yol + '?v=' + SURUM;
  }
  function spriteleriYukle() {
    DT.KARAKTER.forEach(function (k) {
      DT.POZ.forEach(function (p) { gorselYukle(k.id + '_' + p, 'assets/sprites/' + k.id + '_' + p + '.png'); });
      ['bekle', 'sevinc', 'kacirma'].forEach(function (p) { gorselYukle('_menu_' + k.id + '_' + p, 'assets/menu/' + k.id + '_' + p + '.png'); });
    });
    // Sonradan üretilen kareler assets/manifest.json içinde listelenir (tools/manifest.py üretir); liste yoksa yedek diziler kullanılır.
    if (root.fetch) {
      root.fetch('assets/manifest.json?v=' + SURUM).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
        if (!m) return;
        (m.sprites || []).forEach(function (f) { gorselYukle(f.replace(/\.png$/, ''), 'assets/sprites/' + f, true); });
        (m.kaleci || []).forEach(function (f) { gorselYukle('_kaleci_' + f.replace(/\.png$/, ''), 'assets/kaleci/' + f, true); });
      }).catch(function () { /* liste okunamazsa oyun yedek dizilerle sürer */ });
    }
    gorselYukle('_kaleci-v2', 'assets/kaleci-v2.png');
  }
  function sprite(id, poz) { return gorseller[id + '_' + poz] || null; }

  /* ---------- arka plan (her pozisyon için bir kez çizilir) ---------- */
  function rng(seed) {
    var a = seed;
    return function () { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  }
  function yerelCanvas(w, h) {
    if (typeof root.document !== 'undefined' && root.document.createElement) {
      var c = root.document.createElement('canvas'); c.width = w; c.height = h; return c;
    }
    return root.__yapCanvas(w, h);
  }

  function arkaPlanCiz() {
    var c = yerelCanvas(Math.round(W * dpr), Math.round(H * dpr));
    var g = c.getContext('2d');
    g.scale(dpr, dpr);
    var D = pos.D;
    var ufuk = izdus(0, 0, D + 400);
    var uy = ufuk ? ufuk.y : H * 0.3;

    // gökyüzü
    var gk = g.createLinearGradient(0, 0, 0, uy);
    gk.addColorStop(0, '#050506'); gk.addColorStop(1, '#1a1b1e');
    g.fillStyle = gk; g.fillRect(0, 0, W, uy + 2);

    // tribün (kalenin arkasında dikey bir duvar)
    var t0 = izdus(-60, 0, D + 22), t1 = izdus(60, 14, D + 22);
    if (t0 && t1) {
      var tx0 = Math.min(t0.x, t1.x), tx1 = Math.max(t0.x, t1.x), ty0 = Math.min(t0.y, t1.y), ty1 = Math.max(t0.y, t1.y);
      var tg = g.createLinearGradient(0, ty0, 0, ty1);
      tg.addColorStop(0, '#1b1c1f'); tg.addColorStop(1, '#4a4b50');
      g.fillStyle = tg; g.fillRect(tx0, ty0, tx1 - tx0, ty1 - ty0);
      var r = rng(7);
      for (var i = 0; i < 1400; i++) {
        var x = tx0 + r() * (tx1 - tx0), y = ty0 + r() * (ty1 - ty0);
        var a = 0.15 + r() * 0.5;
        g.fillStyle = r() < 0.5 ? 'rgba(235,235,235,' + a + ')' : 'rgba(120,120,125,' + a + ')';
        g.fillRect(x, y, 1.6, 1.6);
      }
    }

    // projektör ışıkları
    [[-26, 16], [26, 16], [-10, 18], [12, 18]].forEach(function (j) {
      var p = izdus(j[0], j[1], D + 30);
      if (!p) return;
      var rg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 90);
      rg.addColorStop(0, 'rgba(255,255,255,0.85)'); rg.addColorStop(0.15, 'rgba(255,255,255,0.28)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(p.x - 90, p.y - 90, 180, 180);
    });

    // çim
    g.fillStyle = '#16201a'; g.fillRect(0, uy, W, H - uy);
    var z0 = -kam.C[2] * 0 - 12;
    for (var z = z0, n = 0; z < D + 25; z += 3, n++) {
      var a1 = izdus(-45, 0, z), a2 = izdus(45, 0, z), b1 = izdus(-45, 0, z + 3), b2 = izdus(45, 0, z + 3);
      if (!a1 || !a2 || !b1 || !b2) continue;
      g.fillStyle = (n % 2) ? '#1c2a21' : '#16201a';
      g.beginPath(); g.moveTo(a1.x, a1.y); g.lineTo(a2.x, a2.y); g.lineTo(b2.x, b2.y); g.lineTo(b1.x, b1.y); g.closePath(); g.fill();
    }
    var sis = g.createLinearGradient(0, uy - 6, 0, uy + 70);
    sis.addColorStop(0, 'rgba(180,185,190,0.18)'); sis.addColorStop(1, 'rgba(180,185,190,0)');
    g.fillStyle = sis; g.fillRect(0, uy - 6, W, 76);

    // reklam panoları: kale arkasında alçak, siyah-beyaz bloklar
    for (var bxw = -42, bi = 0; bxw < 42; bxw += 3, bi++) {
      var q1 = izdus(bxw * 2.2, 0, D + 46), q2 = izdus(bxw * 2.2 + 6.4, 2.0, D + 46);
      if (!q1 || !q2) continue;
      g.fillStyle = (bi % 4 === 0) ? '#cfcfd2' : (bi % 2 ? '#0e0e10' : '#2b2c30');
      g.fillRect(q1.x, q2.y, q2.x - q1.x, q1.y - q2.y);
    }
    // çizgiler
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2; g.lineCap = 'round';
    function cizgi(x0, z0_, x1, z1) {
      var p = izdus(x0, 0, z0_), q = izdus(x1, 0, z1);
      if (!p || !q) return;
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    }
    cizgi(-40, D, 40, D);                      // kale çizgisi
    cizgi(-9.16, D, -9.16, D - 5.5); cizgi(9.16, D, 9.16, D - 5.5); cizgi(-9.16, D - 5.5, 9.16, D - 5.5);   // 5.5 m alanı
    if (pos.tip === 'penalti') {
      var s = izdus(0, 0, 0);
      if (s) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(s.x, s.y, 5 * s.olcek / 30 + 2, 2.2, 0, 0, 6.3); g.fill(); }
      cizgi(-20.16, D - 16.5, 20.16, D - 16.5); cizgi(-20.16, D, -20.16, D - 16.5); cizgi(20.16, D, 20.16, D - 16.5);
    }

    // hafif vinyet
    var vg = g.createRadialGradient(W / 2, H * 0.5, H * 0.25, W / 2, H * 0.5, H * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- parçalar ---------- */
  function kaleArka(g) {
    var D = pos.D, w = A.kale.genislik / 2, h = A.kale.yukseklik, nz = D + 1.5;
    var a = izdus(-w, 0, nz), b = izdus(w, h, nz);
    if (!a || !b) return;
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1;
    var i, p, q;
    for (i = 0; i <= 16; i++) {
      p = izdus(-w + (2 * w) * i / 16, 0, nz); q = izdus(-w + (2 * w) * i / 16, h, nz);
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    }
    for (i = 0; i <= 6; i++) {
      p = izdus(-w, h * i / 6, nz); q = izdus(w, h * i / 6, nz);
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    }
    [[-w, 0], [w, 0], [-w, h], [w, h]].forEach(function (c) {
      var m = izdus(c[0], c[1], D), n = izdus(c[0], c[1], nz);
      g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(n.x, n.y); g.stroke();
    });
    for (i = 1; i < 8; i++) {  // tavan filesi
      p = izdus(-w + (2 * w) * i / 8, h, D); q = izdus(-w + (2 * w) * i / 8, h, nz);
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    }
  }

  function kaleOn(g) {
    var D = pos.D, w = A.kale.genislik / 2, h = A.kale.yukseklik;
    var a = izdus(-w, 0, D), b = izdus(-w, h, D), c = izdus(w, h, D), d = izdus(w, 0, D);
    if (!a || !b || !c || !d) return;
    var kal = Math.max(2.5, a.olcek * A.kale.direk);
    g.strokeStyle = '#ffffff'; g.lineWidth = kal; g.lineCap = 'square'; g.lineJoin = 'miter';
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.stroke();
  }

  function golgeTop(g, x, z) {
    var p = izdus(x, 0, z);
    if (!p) return;
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath(); g.ellipse(p.x, p.y, 0.14 * p.olcek, 0.05 * p.olcek, 0, 0, 6.3); g.fill();
  }

  function topCiz(g, t, aci) {
    var R = A.kale.topYaricap;
    var p = izdus(t.x, t.y, t.z);
    if (!p) return;
    golgeTop(g, t.x, t.z);
    var r = Math.max(2, R * p.olcek);
    if (gorseller._top) { g.drawImage(gorseller._top, p.x - r, p.y - r, r * 2, r * 2); return; }
    g.save(); g.translate(p.x, p.y);
    g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(0, 0, r, 0, 6.3); g.fill();
    g.rotate(aci || 0); g.fillStyle = '#111';
    function bes(cx, cy, rr) { g.beginPath(); for (var i = 0; i < 5; i++) { var a = i * 1.2566 - 1.5708; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); }
    bes(0, 0, r * 0.38);
    for (var i = 0; i < 5; i++) { var a2 = i * 1.2566 - 1.5708; bes(Math.cos(a2) * r * 0.95, Math.sin(a2) * r * 0.95, r * 0.28); }
    var sh = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = sh; g.beginPath(); g.arc(0, 0, r, 0, 6.3); g.fill();
    g.restore();
  }

  function insan(g, x, z, boy, renk, forma) {
    var ayak = izdus(x, 0, z), bas = izdus(x, boy, z);
    if (!ayak || !bas) return;
    var s = ayak.olcek;
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath(); g.ellipse(ayak.x, ayak.y, 0.35 * s, 0.1 * s, 0, 0, 6.3); g.fill();
    g.fillStyle = '#0c0c0d'; g.fillRect(ayak.x - 0.22 * s, ayak.y - 0.85 * s, 0.44 * s, 0.85 * s);               // bacaklar/şort
    g.fillStyle = forma;       g.fillRect(ayak.x - 0.27 * s, ayak.y - 1.5 * s, 0.54 * s, 0.7 * s);                // forma
    g.fillStyle = renk;        g.beginPath(); g.arc(ayak.x, ayak.y - (boy - 0.14) * s, 0.14 * s, 0, 6.3); g.fill(); // kafa
  }

  /* Kaleci: çarpışma ile aynı eylem/poz adını çizer. Yeni kareler (assets/kaleci/<poz>.png, 1200x800, gövde merkezi 600,400,
   * 324 px/m, sola bakar) varsa onlar; yoksa eski tek sayfa görselinin üç pozu. */
  function kaleciCiz(g, k) {
    var p = izdus(k.x, k.y, pos.D);
    if (!p) return;
    var zemin = izdus(k.x, 0, pos.D);
    if (zemin) { g.fillStyle = 'rgba(0,0,0,0.30)'; g.beginPath(); g.ellipse(zemin.x, zemin.y, 0.5 * p.olcek, 0.08 * p.olcek, 0, 0, 6.3); g.fill(); }
    var T = DT.KALECI_TUVAL, ad = k.poz || 'hazir';
    var yeni = gorseller['_kaleci_' + ad];
    var ayna = k.yon > 0, sx = p.olcek, sy = p.olcek * kam.ky;      // kamera dikeyi de gerdiği için çizim dünya ölçeğiyle yapılır
    if (yeni) {
      g.save(); g.translate(p.x, p.y); g.scale(sx / T.pxM, sy / T.pxM); if (ayna) g.scale(-1, 1); g.rotate(-(k.aci || 0));
      g.drawImage(yeni, -T.cx, -T.cy, T.w, T.h); g.restore();
      return;
    }
    var keeper = gorseller['_kaleci-v2'];
    if (keeper) {
      var dalis = /dalis/.test(ad);
      var shape = DT.KALECI_SILUET[dalis ? (k.yon < 0 ? 1 : 2) : 0], box = shape.box, f = keeper.width / 2048;
      g.save(); g.translate(p.x, p.y); g.scale(sx, sy); g.rotate(-(dalis ? (k.aci || 0) : 0));
      g.drawImage(keeper, box[0] * f, box[1] * f, box[2] * f, box[3] * f, -shape.w / 2, -shape.h * 0.5 - 0.02 * shape.h, shape.w, shape.h); g.restore();
      return;
    }
    g.fillStyle = '#c9d92e'; g.fillRect(p.x - 0.28 * sx, p.y - 0.5 * sy, 0.56 * sx, 0.6 * sy);
    g.fillStyle = '#0c0c0d'; g.fillRect(p.x - 0.2 * sx, p.y + 0.1 * sy, 0.4 * sx, 0.55 * sy);
    g.fillStyle = '#d9a37a'; g.beginPath(); g.ellipse(p.x, p.y - 0.66 * sy, 0.14 * sx, 0.14 * sy, 0, 0, 6.3); g.fill();
  }

  function kaleciHitCiz(g, k, plan) {     // yalnızca denetim için: kurtarış maskesini çiz
    var hc = DT.kaleci.maskeHucreleri(plan, k.t), o = izdus(0, 0, pos.D);
    if (!o) return;
    g.save(); g.fillStyle = 'rgba(255,60,200,0.22)';
    hc.forEach(function (h) {
      var a = izdus(h[0] - h[2] / 2, h[1] + h[2] / 2, pos.D), b = izdus(h[0] + h[2] / 2, h[1] - h[2] / 2, pos.D);
      if (a && b) g.fillRect(a.x, a.y, b.x - a.x + 0.5, b.y - a.y + 0.5);
    });
    g.restore();
  }

  function barajCiz(g, ogeler) {
    if (!pos || pos.tip !== 'frikik') return;
    var b = ogeler.baraj, n = A.baraj.oyuncu, aralik = (2 * A.baraj.yarimGenislik) / n;
    for (var i = 0; i < n; i++) {
      var off = (i - (n - 1) / 2) * aralik;
      var x = b.merkezX + b.px * off, z = b.merkezZ + b.pz * off;
      insan(g, x, z, A.baraj.boy, '#cf9f7c', i % 2 ? '#5b5c60' : '#8a8b8f');
    }
  }

  /* ---- şutçu dizisi ---- */
  var tipOnbellek = {};
  function tipHesapla(im, anahtar) {      // karenin en sol (vuran ayak) noktası
    if (tipOnbellek[anahtar]) return tipOnbellek[anahtar];
    var c = yerelCanvas(S.genislik, S.yukseklik), g = c.getContext('2d'), d;
    try { g.drawImage(im, 0, 0); d = g.getImageData(0, 0, S.genislik, S.yukseklik).data; } catch (e) { return null; }
    var x0 = -1;
    for (var x = 0; x < S.genislik && x0 < 0; x++) for (var y = 0; y < S.yukseklik; y++) if (d[(y * S.genislik + x) * 4 + 3] > 128) { x0 = x; break; }
    if (x0 < 0) return null;
    var top = 0, n = 0;
    for (x = x0; x < Math.min(S.genislik, x0 + 22); x++) for (y = 0; y < S.yukseklik; y++) if (d[(y * S.genislik + x) * 4 + 3] > 128) { top += y; n++; }
    return (tipOnbellek[anahtar] = { tipX: x0, tipY: Math.round(top / Math.max(1, n)) });
  }
  function vurusSekansi(karakter) {
    var uzun = DT.VURUS_SEKANS.uzun, tam = uzun.every(function (f) { return !!sprite(karakter, f.k); });
    var dizi = tam ? uzun : DT.VURUS_SEKANS.kisa, t = 0, temasT = 0, i;
    for (i = 0; i < dizi.length; i++) { if (dizi[i].temas) temasT = t + 0.03; t += dizi[i].s; }
    return { kareler: dizi, temasT: temasT, toplam: t, uzun: tam };
  }
  function oyuncuCiz(g, karakter, topEkran, durum) {
    if (!topEkran) return;
    var dz = (durum && durum.sekans) || vurusSekansi(karakter), t = durum && typeof durum.t === 'number' ? durum.t : -1;
    var kare = dz.kareler[0], i, acc = 0;
    if (t >= 0) { kare = dz.kareler[dz.kareler.length - 1]; for (i = 0; i < dz.kareler.length; i++) { if (t < acc + dz.kareler[i].s) { kare = dz.kareler[i]; break; } acc += dz.kareler[i].s; } }
    var temasKare = dz.kareler.filter(function (f) { return f.temas; })[0];
    var nokta = (dz.uzun && tipHesapla(sprite(karakter, temasKare.k), karakter + temasKare.k)) || DT.SPRITE_NOKTA[karakter].vurus2;
    var olcek = (Math.min(0.21 * H, Math.max(100, H - topEkran.y - 155))) / S.boy;
    var r = Math.max(2, A.kale.topYaricap * topEkran.olcek);
    var im = sprite(karakter, kare.k); if (!im) return;
    var kx = 0;
    if (dz.uzun && t >= 0) {       // yaklaşırken oyuncu topa doğru süzülür; duruş aynı kalır, yön değişmez
      var yaklasT = dz.kareler[0].s + dz.kareler[1].s; kx = 46 * olcek * Math.max(0, 1 - t / yaklasT);
    }
    g.save(); g.translate(topEkran.x + r + kx, topEkran.y); g.scale(olcek, olcek);
    g.drawImage(im, -nokta.tipX, -nokta.tipY, S.genislik, S.yukseklik); g.restore();
  }

  /* Sonuç ekranı: karaktere özgü sevinç dizisi varsa oynar, yoksa durağan kare (sallama yok). */
  function onSpriteCiz(g, karakter, poz, cx, taban, boy, durum) {
    var olcek = boy / S.boy, im = sprite(karakter, poz), t = durum.sure || 0, i, n = DT.OPSIYONEL.sevincKare;
    if (durum.gol) {
      var dizi = [];
      for (i = 1; i <= n; i++) { var f = sprite(karakter, 'sev' + i); if (f) dizi.push(f); }
      if (dizi.length === n) im = dizi[Math.floor(t * DT.OPSIYONEL.sevincFps) % n];
    }
    if (!im) return;
    g.save(); g.translate(cx, taban); g.scale(olcek, olcek);
    g.drawImage(im, -S.ankrajX, -S.ankrajY, S.genislik, S.yukseklik); g.restore();
  }

  function nisanCiz(g, aim, kilit, falso, onizleme) {
    if (!aim) return;
    var D = pos.D;
    if (onizleme) {
      g.save(); g.setLineDash([3, 6]); g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2; g.lineCap = 'round';
      g.beginPath();
      var ilk = true;
      for (var i = 0; i < onizleme.length; i += 3) {
        var o = onizleme[i], p = izdus(o.x, o.y, o.z);
        if (!p) continue;
        if (ilk) { g.moveTo(p.x, p.y); ilk = false; } else g.lineTo(p.x, p.y);
      }
      g.stroke(); g.restore();
    }
    var c = izdus(aim.x, aim.y, D);
    if (!c) return;
    var r = Math.max(12, 0.22 * c.olcek);
    g.save(); g.translate(c.x, c.y);
    g.strokeStyle = kilit ? '#3ddc84' : '#ffffff'; g.fillStyle = kilit ? 'rgba(61,220,132,0.22)' : 'rgba(255,255,255,0.1)'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(0, 0, r, 0, 6.3); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-r - 6, 0); g.lineTo(-r * 0.4, 0); g.moveTo(r + 6, 0); g.lineTo(r * 0.4, 0);
    g.moveTo(0, -r - 6); g.lineTo(0, -r * 0.4); g.moveTo(0, r + 6); g.lineTo(0, r * 0.4); g.stroke();
    g.restore();
  }

  /* ---------- ana çizim ---------- */
  var ogeAdlari = null;
  function ciz(d) {
    if (!kam || !arka) return;
    var g = ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (d.sarsinti) g.translate((Math.random() - 0.5) * d.sarsinti, (Math.random() - 0.5) * d.sarsinti);
    g.drawImage(arka, 0, 0, W, H);

    kaleArka(g);

    // derinliğe göre sıralanan nesneler (uzaktan yakına)
    var liste = [];
    var D = pos.D;
    var kd = izdus(0, 1, D + 0.25);
    if (d.kaleci) liste.push({ z: kd ? kd.d : 1e9, ciz: function () { kaleciCiz(g, d.kaleci); } });
    var fd = izdus(0, 1, D);
    liste.push({ z: fd ? fd.d + 0.01 : 1e9, ciz: function () { kaleOn(g); } });
    if (d.baraj) {
      var bd = izdus(d.baraj.merkezX, 1, d.baraj.merkezZ);
      liste.push({ z: bd ? bd.d : 0, ciz: function () { barajCiz(g, d); } });
    }
    if (d.top) {
      var td = izdus(d.top.x, d.top.y, d.top.z);
      liste.push({ z: td ? td.d : 0, ciz: function () { topCiz(g, d.top, d.topAci); } });
    }
    liste.sort(function (a, b) { return b.z - a.z; });
    liste.forEach(function (o) { o.ciz(); });

    // oyuncu ve nişan her zaman en önde
    var topEkran = izdus(pos.bx, A.kale.topYaricap, 0);
    if (d.oyuncu) oyuncuCiz(g, d.oyuncu.karakter, topEkran, d.oyuncu);
    if (d.onKarakter) onSpriteCiz(g, d.onKarakter.karakter, d.onKarakter.poz, W * 0.5, H * 0.67, Math.min(0.26 * H, 150), d.onKarakter);
    if (d.kaleciHit && d.kaleci) kaleciHitCiz(g, d.kaleci, d.kaleciHit);
    if (d.nisan) nisanCiz(g, d.nisan.aim, d.nisan.kilit, d.nisan.falso, d.nisan.onizleme);
    if (d.flas) { g.fillStyle = 'rgba(255,255,255,' + d.flas + ')'; g.fillRect(0, 0, W, H); }
  }

  function boyutla() {
    var kutu = cv.getBoundingClientRect();
    W = Math.max(280, Math.round(kutu.width)); H = Math.max(420, Math.round(kutu.height));
    dpr = Math.min(2, root.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (pos) sahneKur(pos);
  }

  function sahneKur(p) {
    pos = p; kam = kameraKur(p); arka = arkaPlanCiz();
  }

  function kur(canvas, genislik, yukseklik, dprZorla) {
    cv = canvas; ctx = cv.getContext('2d');
    if (genislik) { W = genislik; H = yukseklik; dpr = dprZorla || 1; cv.width = W * dpr; cv.height = H * dpr; }
    else { boyutla(); if (root.addEventListener) root.addEventListener('resize', boyutla); }
    spriteleriYukle();
  }

  DT.cizim = {
    kameraAyar: KAMERA,
    kur: kur, sahneKur: sahneKur, ciz: ciz, ekranToKale: ekranToKale, izdus: izdus,
    boyut: function () { return { w: W, h: H }; },
    hazir: function () { return yuklenen >= gereken && !yuklemeHatasi; },
    vurusSekansi: vurusSekansi,
    gorselHazir: function (ad) { return !!gorseller[ad]; },
    gorselEkle: function (ad, im) { gorseller[ad] = im; }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
