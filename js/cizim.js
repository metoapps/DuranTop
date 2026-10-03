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
  var yuklenen = 0, gereken = DT.KARAKTER.length + 1, yuklemeHatasi = false;
  function yuklemeBildir() {
    var el = root.document && root.document.getElementById("yukleme");
    if (!el) return;
    el.hidden = !yuklemeHatasi && !karakterBekleniyor && yuklenen >= gereken;
    el.textContent = yuklemeHatasi ? "Görseller yüklenemedi. Yenilemek için buraya dokun." : "Görseller yükleniyor…";
  }
  var opsiyonel = {};          // varsa assets/ içindeki top, kaleci vb. görselleri

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  function kameraKur(p) {
    var ayar = KAMERA[p.tip];
    var wide=W>H&&H>=600;
    if(wide)ayar={geri:p.tip==='penalti'?8:18,yuk:ayar.yuk,kaleGen:.74,kaleY:.24};
    if (H < 650) ayar = { geri: ayar.geri, yuk: 1.8, kaleGen: ayar.kaleGen, kaleY: .25 };
    var ul = Math.hypot(-p.bx, p.D), ux = -p.bx / ul, uz = p.D / ul;
    var C = [p.bx - ux * ayar.geri, ayar.yuk, -uz * ayar.geri];
    var hedef = [0, 1.0, p.D];
    var f = norm([hedef[0] - C[0], hedef[1] - C[1], hedef[2] - C[2]]);
    var r = norm(cross([0, 1, 0], f));
    var up = cross(f, r);
    var k = { C: C, f: f, r: r, up: up, cx: (W>H ? W*.4 : W/2), cy: 0, F: 1, ky: 1 };
    var merkez = [0, 1.2, p.D];
    var d = [merkez[0] - C[0], merkez[1] - C[1], merkez[2] - C[2]];
    var zc = dot(d, f);
    k.F = ayar.kaleGen * Math.min(W,H*(wide?.95:1.15)) * zc / A.kale.genislik;
    var yc = dot(d, up);
    var kaleYpx = ayar.kaleY * H;
    // Top, alttaki kontrol panelinin ve oyuncunun üstünde kalsın: panel yaklaşık 235 px, oyuncunun ayakları topun ~0.083H altında.
    var topHedef = Math.max(0.56 * H, Math.min(0.66 * H, H - 210));
    var db = [p.bx - C[0], A.kale.topYaricap - C[1], 0 - C[2]];
    var zb = dot(db, f);
    var terim = k.F * (dot(d, up) / zc - dot(db, up) / zb);       // ky = 1 için top, kale merkezinin bu kadar altında
    k.ky = terim > 1 ? Math.max(W>H ? .45 : (H < 650 ? 1.1 : 0.82), Math.min(1.3, (topHedef - kaleYpx) / terim)) : 1;
    if(wide)k.ky=1;
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
  var istekler = {}, karakterIstekleri = {}, karakterBekleniyor = false;
  function gorselDosya(ad, yol) {
    if (gorseller[ad]) return Promise.resolve(gorseller[ad]);
    if (istekler[ad]) return istekler[ad];
    istekler[ad] = new Promise(function(resolve,reject){
      var im = new root.Image(), finished=false;
      var timeout=root.setTimeout(function(){if(finished)return;finished=true;delete istekler[ad];reject(new Error(ad));},15000);
      im.onload = function(){if(finished)return;finished=true;root.clearTimeout(timeout);gorseller[ad]=im;resolve(im);};
      im.onerror = function(){if(finished)return;finished=true;root.clearTimeout(timeout);delete istekler[ad];reject(new Error(ad));};
      im.src = yol;
    });
    return istekler[ad];
  }
  function gorselYukle(ad, yol) {
    gorselDosya(ad,yol).then(function(){yuklenen++;yuklemeBildir();},function(){yuklemeHatasi=true;yuklemeBildir();});
  }
  function spriteleriYukle() {
    DT.KARAKTER.forEach(function(k){gorselYukle('_menu_'+k.id+'_bekle','assets/menu/'+k.id+'_bekle.webp');});
    gorselYukle('_kaleci-v3','assets/kaleci-v3.webp');
  }
  var VURUS_POZ = ['vurus1','vurus2','vurus3'];
  function karakterHazir(id) {return VURUS_POZ.every(function(p){return !!gorseller[id+'_'+p];});}
  function karakterYukle(id) {
    if(karakterHazir(id))return Promise.resolve(true);
    if(karakterIstekleri[id])return karakterIstekleri[id];
    yuklemeHatasi=false;karakterBekleniyor=true;yuklemeBildir();
    var el=root.document&&root.document.getElementById('yukleme');
    var loaded=0;if(el)el.textContent=id.toUpperCase()+' hazırlanıyor… 0/3';
    karakterIstekleri[id]=Promise.all(VURUS_POZ.map(function(p){return gorselDosya(id+'_'+p,'assets/sprites/'+id+'_'+p+'.webp').then(function(im){loaded++;if(el)el.textContent=id.toUpperCase()+' hazırlanıyor… '+loaded+'/3';return im;});})).then(function(){
      karakterBekleniyor=false;yuklemeBildir();
      ['bekle','sevinc','kacirma'].forEach(function(p){gorselDosya(id+'_'+p,'assets/sprites/'+id+'_'+p+'.webp').catch(function(){});});
      ['sevinc1','sevinc2','sevinc3','sevinc4'].forEach(function(p){gorselDosya(id+'_'+p,'assets/sprites/'+id+'_'+p+'.png').catch(function(){});});
      return true;
    },function(){delete karakterIstekleri[id];karakterBekleniyor=false;yuklemeHatasi=true;yuklemeBildir();return false;});
    return karakterIstekleri[id];
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
    var r = Math.min(H*.012,Math.max(2, R * p.olcek));
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

  function kaleciCiz(g, k) {
    var keeper = gorseller['_kaleci-v3'];
    if (!keeper) return;
    var m = DT.kaleci.model(k), pose = m.pose;
    if (k.landing && k.poz === 'dal') pose = 5;
    var boxes = [[100,40,330,410],[580,140,410,320],[1150,20,275,450],
                 [0,575,490,345],[498,640,548,205],[1060,715,465,155]];
    var box = boxes[pose], p = izdus(k.x, k.y, pos.D);
    if (!p) return;
    var h = pose === 5 ? 2*k.y : (pose === 3 ? 1.65 : (pose >= 4 ? 1.05 : (pose === 1 ? 1.25 : 1.85)));
    var w = pose === 3 ? 2.1 : (pose >= 4 ? 2.5 : (pose === 1 ? 1.9 : 1.45));
    var pw = w * p.olcek, ph = h * p.olcek;
    g.save(); g.translate(p.x, p.y);
    if (k.yon > 0 && pose >= 3) g.scale(-1, 1);
    g.drawImage(keeper, box[0], box[1], box[2], box[3], -pw/2, -ph/2, pw, ph);
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

  /* Şutçu her zaman aynı yöne bakar. Köşe seçimi karakteri aynalamaz.
   * Nişan beklerken ayaklar topun yanındadır. Top, vurus2 karesine geçince çıkar. */
  function oyuncuCiz(g, karakter, poz, topEkran, durum) {
    if (!topEkran) return;
    durum = durum || {};
    var olcek = (W>H&&H>=600?Math.min(240,H*.27):Math.min(0.21 * H, Math.max(100, H - topEkran.y - 155))) / S.boy;
    var r = Math.min(H*.012,Math.max(2, A.kale.topYaricap * topEkran.olcek));
    var u = durum.ilerleme || 0, temas = durum.temas || 0.533333;
    var kare = !durum.yol ? 'vurus1' : (u < temas ? 'vurus1' : (u < temas + 0.12 ? 'vurus2' : 'vurus3'));
    var im = sprite(karakter, kare);
    var nokta = DT.SPRITE_NOKTA[karakter] && DT.SPRITE_NOKTA[karakter][kare];
    if (!im || !nokta) return;
    g.save();
    var anchor = DT.SPRITE_NOKTA[karakter].vurus2;
    var approach = durum.yol ? Math.max(0, 1 - u / temas) : 0;
    g.translate(topEkran.x + r + approach * 8, topEkran.y);
    g.scale(olcek, olcek);
    g.drawImage(im, -anchor.tipX, -anchor.tipY, S.genislik, S.yukseklik);
    g.restore();
  }

  /* Gol sevinci: dört ayrı poz, harmanlama yok. Kare yoksa tek sevinc durur, zıplamaz. */
  var SEVINC_KARE = ['sevinc1', 'sevinc2', 'sevinc3', 'sevinc4'];
  var SEVINC_ARALIK = 0.42;
  function sevincKaresi(karakter, t) {
    var hazir = [];
    for (var i = 0; i < SEVINC_KARE.length; i++) {
      if (sprite(karakter, SEVINC_KARE[i])) hazir.push(SEVINC_KARE[i]);
    }
    if (hazir.length < 2) return null;
    return hazir[Math.floor((t || 0) / SEVINC_ARALIK) % hazir.length];
  }

  function onSpriteCiz(g, karakter, poz, cx, taban, boy, durum) {
    var kare = poz;
    if (durum && durum.gol) {
      var s = sevincKaresi(karakter, durum.sure || 0);
      if (s) kare = s;
    }
    var im = sprite(karakter, kare); if (!im) return;
    var olcek = boy / S.boy;
    g.save();
    g.translate(cx, taban);
    g.scale(olcek, olcek);
    g.drawImage(im, -S.ankrajX, -S.ankrajY, S.genislik, S.yukseklik);
    g.restore();
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
      g.stroke();
      var son = onizleme[onizleme.length-1], end = son && izdus(son.x,son.y,son.z);
      if(end){g.setLineDash([]);g.strokeStyle='#ffcc66';g.beginPath();g.arc(end.x,end.y,5,0,Math.PI*2);g.stroke();}
      g.restore();
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
    if (d.oyuncu) oyuncuCiz(g, d.oyuncu.karakter, d.oyuncu.poz, topEkran, d.oyuncu);
    if (d.onKarakter) {
      var boy = Math.min(0.38 * H, 260);
      var taban = Math.min(H * 0.76, H - 156);
      if (taban < boy + 64) taban = boy + 64;
      onSpriteCiz(g, d.onKarakter.karakter, d.onKarakter.poz, W * 0.5, taban, boy, d.onKarakter);
    }
    if (d.nisan) nisanCiz(g, d.nisan.aim, d.nisan.kilit, d.nisan.falso, d.nisan.onizleme);
    if (d.flas) { g.fillStyle = 'rgba(255,255,255,' + d.flas + ')'; g.fillRect(0, 0, W, H); }
  }

  function boyutla() {
    var kutu = cv.getBoundingClientRect();
    W = Math.max(280, Math.round(kutu.width)); H = Math.max(280, Math.round(kutu.height));
    dpr = Math.min(3, root.devicePixelRatio || 1);
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
    karakterHazir: karakterHazir, karakterYukle: karakterYukle,
    hazir: function () { return yuklenen >= gereken && !yuklemeHatasi; },
    gorselHazir: function (ad) { return !!gorseller[ad]; },
    gorselEkle: function (ad, im) { gorseller[ad] = im; }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

