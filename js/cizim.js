/* Duran Top - çizim. Canvas 2.5D: dünya (metre) bir kamerayla ekrana izdüşürülür.
 * Bu dosya sonuç hesaplamaz; yalnızca fizik.js'nin verdiği yolu ve kaleci konumunu çizer. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR, S = DT.SPRITE;

  var KAMERA = {
    penalti: { geri: 8.0, yuk: 5.5, kaleGen: 0.78 },
    frikik:  { geri: 13.0, yuk: 5.5, kaleGen: 0.78 },
    hedef:   { geri: 9.0, yuk: 4.8, kaleGen: 0.82 }   // hedef ağı: delikler okunsun diye daha yakın ve alçak
  };

  var cv, ctx, W = 360, H = 640, dpr = 1;
  var kam = null, arka = null, pos = null, kamDurus = 0;
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

  /* Duruş artık -1..1 arası sürekli (ok tuşları). Uç ve orta değerler eski üç kamerayla aynıdır;
   aradaki değerler, top gövdenin arkasında kalmasın diye ölçülerek seçildi; -0,2..0 aralığında kamera biraz daha sağa açılır (tests/kamera-top.cjs). */
  function yanKayma(d){d=Number(d)||0;d=Math.max(-1,Math.min(1,d));if(d<=-YAN_ESIK)return -0.25;if(d<0)return 0.32-0.8*d;return 0.32+(0.20-0.32)*d;}
  var YAN_ESIK=0.2;
  function kameraKur(p) {
    // One perspective camera in SI units. Fit the scene, never shrink a single actor.
    var ul=Math.hypot(-p.bx,p.D),ux=-p.bx/ul,uz=p.D/ul;
    var wide=W>H,ayar=KAMERA[p.tip],back=ayar.geri,height=ayar.yuk;
    // Kamera, oyuncunun duruşuna göre yana kayar: oyuncu topu gövdesiyle örtmesin (ölçüm: tests/kamera-top.cjs). Kayma, geri mesafeyle orantılı:
    // dar bir açı yetmez, mesafe büyüdükçe (frikik) aynı örtüşmeyi çözmek için daha çok yan kayma gerekir.
    var yan=yanKayma(kamDurus)*back;
    var C=[p.bx-ux*back-uz*yan,height,-uz*back+ux*yan];
    var target=[0,1,p.D],f=norm(target.map(function(v,i){return v-C[i];})),r=norm(cross([0,1,0],f)),up=cross(f,r);
    var k={C:C,f:f,r:r,up:up,cx:wide?W*.40:W/2,cy:0,F:1,ky:1};
    function raw(x,y,z){var d=[x-C[0],y-C[1],z-C[2]],depth=dot(d,f);return {x:dot(d,r)/depth,y:-dot(d,up)/depth};}
    var left=raw(-A.kale.genislik/2,1,p.D),right=raw(A.kale.genislik/2,1,p.D);
    var focal=ayar.kaleGen*(wide?Math.min(W*.78,H*1.35):W)/Math.abs(right.x-left.x);
    var points=[];[-1,1].forEach(function(side){[0,A.kale.yukseklik].forEach(function(y){points.push(raw(side*A.kale.genislik/2,y,p.D));});});
    [-.65,.65].forEach(function(x){[0,1.90].forEach(function(y){points.push(raw(p.bx-ux+uz*x,y,-uz-ux*x));});});
    points.push(raw(p.bx,0,0));
    var min=Math.min.apply(null,points.map(function(v){return v.y;})),max=Math.max.apply(null,points.map(function(v){return v.y;}));
    var top=wide?Math.max(80,H*.12):Math.max(150,H*.18),bottom=wide?H-25:H-Math.min(200,H*.235);
    if(bottom-top<140){top=80;bottom=H-120;}
    var minX=Math.min.apply(null,points.map(function(v){return v.x;})),maxX=Math.max.apply(null,points.map(function(v){return v.x;}));
    var leftMargin=wide?20:16,rightLimit=wide?W*.78:W-16;
    k.F=Math.min(focal,(bottom-top)/(max-min),(rightLimit-leftMargin)/(maxX-minX));k.cy=top-k.F*min;k.cx=(leftMargin+rightLimit-k.F*(minX+maxX))/2;
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
      im.onload = function(){if(finished)return;finished=true;root.clearTimeout(timeout);gorseller[ad]=im;if(ad==='_kaleci-yuz'&&DT.model3d)DT.model3d.setFace(im);resolve(im);};
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
    gorselYukle('_kaleci-yuz','assets/kaleci-neuer-face.webp');
  }
  var VURUS_POZ = ['vurus1','vurus2','vurus3','bekle'];
  function karakterHazir(id) {return VURUS_POZ.every(function(p){return !!gorseller[id+'_'+p];});}
  function karakterYukle(id) {
    if(karakterHazir(id))return Promise.resolve(true);
    if(karakterIstekleri[id])return karakterIstekleri[id];
    yuklemeHatasi=false;karakterBekleniyor=true;yuklemeBildir();
    var el=root.document&&root.document.getElementById('yukleme');
    var loaded=0;if(el)el.textContent=id.toUpperCase()+' hazırlanıyor… 0/4';
    karakterIstekleri[id]=Promise.all(VURUS_POZ.map(function(p){return gorselDosya(id+'_'+p,'assets/sprites/'+id+'_'+p+'.webp').then(function(im){loaded++;if(el)el.textContent=id.toUpperCase()+' hazırlanıyor… '+loaded+'/4';return im;});})).then(function(){
      karakterBekleniyor=false;yuklemeBildir();
      ['bekle','sevinc','kacirma'].forEach(function(p){gorselDosya(id+'_'+p,'assets/sprites/'+id+'_'+p+'.webp').catch(function(){});});
      ['sevinc1','sevinc2','sevinc3','sevinc4'].forEach(function(p){gorselDosya(id+'_'+p,'assets/sprites/'+id+'_'+p+'.png').catch(function(){});});
      return true;
    },function(){delete karakterIstekleri[id];karakterBekleniyor=false;yuklemeHatasi=true;yuklemeBildir();return false;});
    return karakterIstekleri[id];
  }
  // Render shirt numbers onto a cached canvas, then skin the complete kit during walking.
  // Source portraits, faces and sprite assets remain intact.
  var formalar = {};
  function formaSprite(id, poz,reverse) {
    var im=gorseller[id+'_'+poz]||null;if(!im||!/^vurus[123]$/.test(poz))return im;
    var meta=DT.KARAKTER.find(function(k){return k.id===id;});if(!meta)return im;
    var key=id+'_'+poz+(reverse?'_right':''),cached=formalar[key];if(cached&&cached.source===im)return cached.canvas;
    var points={meto:[[434,284],[436,280],[432,294]],lort:[[445,291],[442,289],[440,295]],fero:[[440,297],[444,294],[444,299]],latte:[[432,285],[433,289],[434,300]],josh:[[433,287],[434,285],[431,295]]};
    var p=points[id][Number(poz.slice(-1))-1],c=yerelCanvas(S.genislik,S.yukseklik),g=c.getContext('2d');g.drawImage(im,0,0,S.genislik,S.yukseklik);
    g.save();var frame=Number(poz.slice(-1));g.translate(p[0]+(frame===3?42:18),p[1]-(frame===3?7:0));g.rotate(frame===3?.28:frame===2?.10:-.10);g.transform(.82,.06,-.10,1,0,0);if(reverse)g.scale(-1,1);g.font='900 54px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=2;
    g.strokeStyle=id==='fero'?'#f4f4f4':'#181818';g.fillStyle=id==='fero'?'#151515':id==='josh'?'#f6d278':'#f5f3eb';g.strokeText(String(meta.numara),0,0);g.fillText(String(meta.numara),0,0);g.restore();
    formalar[key]={source:im,canvas:c};return c;
  }
  function sprite(id, poz,reverse) {return formaSprite(id,poz,reverse);}


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

  var kalabalik = null;
  var KTEN = ['#cdc6b2', '#af8d75', '#d6ad8a', '#adada8'], KFORMA = ['#e1e0d8', '#08090b', '#b3262f', '#d7b33a', '#1d3f86', '#e1e0d8', '#08090b', '#7d1d24'];
  /* Bir sıra seyirci: A = normal, B = kollar havada, C = alay (kollar aşağıda dışa açık, "yuh"). Aynı kişiler, aynı konumlar; kareler arasında yalnız kollar değişir. */
  function kalabalikSerit(kisiler, sy, sc) {
    var h = Math.ceil(20 * sc), y0 = sy - 7 * sc, kare = [];
    [0, 1, 2].forEach(function (tur) {
      var c = yerelCanvas(Math.ceil(W * dpr), Math.ceil(h * dpr)), g = c.getContext('2d'); g.scale(dpr, dpr); g.translate(0, -y0);
      kisiler.forEach(function (k) {
        g.fillStyle = KTEN[k.ten]; g.beginPath(); g.arc(k.px, k.py, 1.7 * sc, 0, Math.PI * 2); g.fill();
        g.strokeStyle = KFORMA[k.fa]; g.lineWidth = 2.8 * sc; g.beginPath(); g.moveTo(k.px, k.py + 2); g.lineTo(k.px, k.py + 6 * sc); g.stroke();
        g.lineWidth = 1.3 * sc; g.beginPath();
        if (tur === 1) { g.moveTo(k.px - 3.8 * sc, k.py - 6 * sc); g.lineTo(k.px, k.py + 3 * sc); g.lineTo(k.px + 3.8 * sc, k.py - (k.kol ? 7 : 5) * sc); }
        else if (tur === 2) { g.moveTo(k.px - 4.4 * sc, k.py + 5.5 * sc); g.lineTo(k.px, k.py + 3 * sc); g.lineTo(k.px + 4.4 * sc, k.py + (k.kol ? 2 : 5.5) * sc); }
        else { g.moveTo(k.px - 3 * sc, k.py + (k.kol ? -2 : 4) * sc); g.lineTo(k.px, k.py + 3 * sc); g.lineTo(k.px + 3 * sc, k.py - 1 * sc); }
        g.stroke();
      });
      kare.push(c);
    });
    return { A: kare[0], B: kare[1], C: kare[2], y0: y0, h: h, sc: sc };
  }
  var ALAY = { aut: ['Yuh!', 'Çüş!', 'Nereye vuruyon?', 'Hahaha!', 'Kaleyi göremedin mi?'], kisa: ['Yuh!', 'Çüş!', 'Kısa kaldı!', 'Hahaha!', 'Topa kuvvet!'], kurtaris: ['Kaleci aldı!', 'Hadi canım!', 'Yuhhh!', 'Hahaha!', 'Bu muydu?'], baraj: ['Baraj yedi!', 'Yuh!', 'Hahaha!', 'Üstünden at!', 'Çüş!'], ag: ['Delik orada!', 'Yuh!', 'Hahaha!', 'Çüş!', 'Nişan nerede?'], halka: ['Delik orada!', 'Yuh!', 'Hahaha!', 'Çüş!', 'Nişan nerede?'] };
  /* Alay balonları: kaçan şutta tribünden 5 yorum yükselip kaybolur. Konumlar sonuç türünden türetilir (deterministik). */
  function alayBalon(g, s, tur) {
    var metin = ALAY[tur] || ALAY.aut, K = kalabalik, ust = 52, alt = Math.max(ust + 40, K.alt - 20);
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + Math.round(Math.max(11, Math.min(15, W / 28))) + 'px Arial';
    for (var i = 0; i < metin.length; i++) {
      var t0 = 0.12 * i + 0.05 * ((i * 3) % 2), u = (s - t0) / 2.6; if (u <= 0 || u >= 1) continue;
      var a = u < 0.12 ? u / 0.12 : u > 0.75 ? (1 - u) / 0.25 : 1, w = g.measureText(metin[i]).width + 16, h = 21;
      var x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, W * (0.14 + 0.72 * (((i * 37 + 11) % 100) / 100)))), y = alt - (alt - ust) * (((i * 53 + 7) % 100) / 100) - u * 18;
      g.globalAlpha = a * 0.95; g.fillStyle = '#fff6df'; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1;
      g.beginPath(); if (g.roundRect) g.roundRect(x - w / 2, y - h / 2, w, h, 9); else g.rect(x - w / 2, y - h / 2, w, h); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x - 4, y + h / 2 - 1); g.lineTo(x + 2, y + h / 2 + 6); g.lineTo(x + 5, y + h / 2 - 1); g.closePath(); g.fill();
      g.fillStyle = '#2a1a10'; g.fillText(metin[i], x, y + 1);
    }
    g.restore();
  }
  /* Seyirci hareketi (belirgin): herkes kendi ritminde zıplar ve sallanır, gruplar kollarını kaldırır (~%40), ~7 sn'de bir "Meksika dalgası" geçer.
   * heyecan (0..1): gol olunca herkes zıplar, kollar havada. alay (sn, <0 yok): kaçan şutta herkes kollarını aşağı açıp titreyerek güler, balonlar çıkar.
   * AYAR.hareket=false → durgun (testler). Sistem "hareketi azalt" ayarı yok sayılır. Yalnız görüntü. */
  function kalabalikCiz(g, t, heyecan, alay, alayTur) {
    var K = kalabalik; if (!K) return;
    if (A.hareket === false) { t = 0; heyecan = 0; alay = -1; }
    var seg = 22, tw = t % 7, onde = tw < 3.2 ? (tw / 3.2) * (W + 300) - 150 : -1e9, alayda = alay >= 0 && alay < 3.4, alayYog = alayda ? Math.min(1, alay / 0.25) * (alay > 2.8 ? (3.4 - alay) / 0.6 : 1) : 0;
    g.save(); g.beginPath(); g.rect(0, 30, W, Math.max(0, K.alt - 30)); g.clip();
    K.satirlar.forEach(function (r, ri) {
      for (var x0 = 0; x0 < W; x0 += seg) {
        var k = (x0 / seg) | 0, ph = ((ri * 7 + k * 13) % 19) / 19 * 6.283, w = Math.min(seg, W - x0);
        var bob = Math.sin(t * (3.0 + (k % 3) * 0.5) + ph) * (1.5 + 2.4 * heyecan) * r.sc * 0.7;
        var dx = Math.sin(t * 1.9 + ph * 2) * 1.3 * r.sc;
        var kare = Math.sin(t * 1.5 + ph * 3) > (0.35 - heyecan * 1.4) ? r.B : r.A;
        var dalga = Math.exp(-Math.pow((x0 + ri * 6 - onde) / 60, 2));
        if (dalga > 0.3) kare = r.B;
        bob -= dalga * 5 * r.sc + heyecan * 2.4 * r.sc * Math.abs(Math.sin(t * 5.2 + ph));
        if (alayYog > 0.05) { kare = r.C; bob = bob * (1 - alayYog) + Math.sin(alay * 17 + ph) * 2.6 * r.sc * alayYog; dx += Math.sin(alay * 11 + ph * 3) * 1.2 * r.sc * alayYog; }
        g.drawImage(kare, x0 * dpr, 0, w * dpr, r.h * dpr, x0 + dx, r.y0 + bob, w, r.h);
      }
    });
    g.restore();
  }
  // Balonlar bayrakların ve pankartın üstünde görünsün diye ayrı çağrılır (atmosfer çiziminden sonra).
  function alayCiz(g, alay, tur) { if (A.hareket === false || !kalabalik || !(alay >= 0 && alay < 3.4)) return; alayBalon(g, alay, tur); }
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

    // Stepped, occupied terrace behind the goal. Draw once with the background.
    var goalTop=izdus(0,A.kale.yukseklik,D),standBottom=goalTop.y+14;
    var standGradient=g.createLinearGradient(0,35,0,standBottom);
    standGradient.addColorStop(0,'#13171e');standGradient.addColorStop(1,'#34383d');
    g.fillStyle=standGradient;g.fillRect(0,35,W,standBottom-35);
    // Seyirciler artık hareketli: her sıra iki kare (normal, kollar havada) olarak ayrı şeride çizilir; her karede şeritler zıplatılıp kare değiştirilir.
    var crowd=rng(19),row=0;kalabalik={satirlar:[],alt:standBottom-6};
    for(var sy=48;sy<standBottom-8;sy+=Math.min(15,8+row*.65),row++){
      var scale=Math.min(1.4,.7+row*.065),spacing=10*scale,kisiler=[];
      g.fillStyle='#0c1015';g.fillRect(0,sy+7*scale,W,3);
      for(var sx=-8+(row%2)*spacing*.5;sx<W+8;sx+=spacing){
        kisiler.push({px:sx+(crowd()-.5)*3,py:sy+(crowd()-.5)*3,ten:Math.floor(crowd()*4),fa:Math.floor(crowd()*8),kol:crowd()<.4});
      }
      g.strokeStyle='rgba(177,184,194,.23)';g.lineWidth=1;g.beginPath();g.moveTo(0,sy+10*scale);g.lineTo(W,sy+10*scale);g.stroke();
      kalabalik.satirlar.push(kalabalikSerit(kisiler,sy,scale));
    }
    g.fillStyle='#a4a6a3';g.fillRect(0,standBottom-4,W,2);

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
  // All net surfaces live in world space. The mouth is open, never a flat grid.
  var kaleArkaCache=null;
  function kaleCizgi(g,points,color,width){g.beginPath();points.forEach(function(p,i){var q=izdus(p[0],p[1],p[2]);if(!q)return;if(i)g.lineTo(q.x,q.y);else g.moveTo(q.x,q.y);});g.strokeStyle=color;g.lineWidth=width;g.stroke();}
  function kaleYuz(g,points,color){g.beginPath();points.forEach(function(p,i){var q=izdus(p[0],p[1],p[2]);if(i)g.lineTo(q.x,q.y);else g.moveTo(q.x,q.y);});g.closePath();g.fillStyle=color;g.fill();}
  function kaleBoru(g,p0,p1,radius,rear){var a=izdus(p0[0],p0[1],p0[2]),b=izdus(p1[0],p1[1],p1[2]);if(!a||!b)return;
    var width=Math.max(rear?1:3,(a.olcek+b.olcek)*.5*radius),len=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;
    var light=g.createLinearGradient(a.x-nx*width/2,a.y-ny*width/2,a.x+nx*width/2,a.y+ny*width/2);
    light.addColorStop(0,rear?'#59666a':'#919ba0');light.addColorStop(.25,rear?'#b5c0c2':'#fafdfd');light.addColorStop(.48,rear?'#d2d9da':'#ffffff');light.addColorStop(1,rear?'#515d60':'#757f84');
    g.save();g.lineCap='round';g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=width+1.8;g.beginPath();g.moveTo(a.x,a.y+1);g.lineTo(b.x,b.y+1);g.stroke();g.strokeStyle=light;g.lineWidth=width;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.restore();
  }
  function kaleArka(g) {
    if(kaleArkaCache){var cache=kaleArkaCache;g.drawImage(cache.canvas,cache.x,cache.y,cache.w,cache.h);return;}
    var D=pos.D,w=A.kale.genislik/2+A.kale.direk/2,h=A.kale.yukseklik+A.kale.direk/2,depth=1.5,z=D+depth;
    var corners=[];[-w-.2,w+.45].forEach(function(x){[0,h+.12].forEach(function(y){[D,z+.6].forEach(function(zz){corners.push(izdus(x,y,zz));});});});
    var left=Math.max(0,Math.floor(Math.min.apply(null,corners.map(function(p){return p.x;}))-5)),top=Math.max(0,Math.floor(Math.min.apply(null,corners.map(function(p){return p.y;}))-5));
    var width=Math.min(W-left,Math.ceil(Math.max.apply(null,corners.map(function(p){return p.x;}))-left+5)),height=Math.min(H-top,Math.ceil(Math.max.apply(null,corners.map(function(p){return p.y;}))-top+5));
    var c=yerelCanvas(Math.ceil(width*dpr),Math.ceil(height*dpr)),b=c.getContext('2d');b.scale(dpr,dpr);b.translate(-left,-top);
    // Grounded cage shadow and different brightness per surface expose the depth.
    kaleYuz(b,[[-w-.12,.01,D],[w+.12,.01,D],[w+.4,.01,z+.55],[-w+.15,.01,z+.55]],'rgba(0,0,0,.25)');
    // Rear supports, feet and side stays are thinner than the front goal frame.
    [-w,w].forEach(function(x){
      kaleBoru(b,[x,0,z],[x,h,z],.045,true);kaleBoru(b,[x,h,D],[x,h,z],.045,true);kaleBoru(b,[x,.025,D],[x,.025,z],.045,true);
      kaleBoru(b,[x,0,z+.32],[x,h*.78,z],.035,true);
      var foot=izdus(x,0,D);b.fillStyle='rgba(0,0,0,.4)';b.beginPath();b.ellipse(foot.x,foot.y,.12*foot.olcek,.035*foot.olcek,0,0,Math.PI*2);b.fill();
    });
    kaleBoru(b,[-w,h,z],[w,h,z],.045,true);kaleBoru(b,[-w,.025,z],[w,.025,z],.035,true);
    // Ağ yüzeyleri: her biri ayrı tuval. ciz(dyn): dyn=false → durgun ağ; dyn=true → js/ag.js'deki yer değiştirmelerle (top çarpınca sallanan ağ) yeniden çizer.
    var faces=[],cols=32,rows=11,layers=7,line=Math.max(.55,Math.min(1.1,W/650)),i,j,pts,AG=DT.ag;
    function yuz(kind,value,corners,cizici){
      var fc=yerelCanvas(c.width,c.height),fg=fc.getContext('2d');fg.scale(dpr,dpr);fg.translate(-left,-top);
      var middle=corners.reduce(function(m,p){return m.map(function(v,i){return v+p[i]/corners.length;});},[0,0,0]);
      var ilk=true,f={canvas:fc,kind:kind,value:value,depth:izdus.apply(null,middle).d,ciz:function(dyn){
        if(!ilk){fg.save();fg.setTransform(1,0,0,1,0,0);fg.clearRect(0,0,fc.width,fc.height);fg.restore();}   // ilk çizimden sonra her yeniden çizimde önce temizle (durgun hâle dönerken de)
        ilk=false;
        kaleYuz(fg,corners,'rgba(200,225,219,.035)');cizici(fg,dyn&&AG);}};
      f.ciz(false);faces.push(f);return f;}
    // Arka ağ: ince ipler iki nokta arasında hafif kavis yapar; darbede çukura doğru çekilir (düzlem içi) ve geriye göçer.
    yuz('z',z,[[-w,0,z],[w,0,z],[w,h,z],[-w,h,z]],function(ag,dyn){
      function rear(x,y){var p=[x,y,z+.06*Math.sin(Math.PI*(x+w)/(2*w))*Math.sin(Math.PI*y/h)];
        if(dyn){var k=AG.kay(AG.z,(x+w)/(2*w),y/h);p=[p[0]-AG.GAIN*k[1],p[1]-AG.GAIN*k[2],p[2]+k[0]];}return p;}
      function iz(a,b){var q=[];for(var t=0;t<=b;t++)q.push(a(t));return q;}
      for(i=0;i<=cols;i++){pts=[];for(j=0;j<=rows;j++)pts.push(rear(-w+2*w*i/cols,h*j/rows));kaleCizgi(ag,pts,'rgba(225,236,233,.25)',line);}
      for(j=0;j<=rows;j++){pts=[];for(i=0;i<=cols;i++)pts.push(rear(-w+2*w*i/cols,h*j/rows));kaleCizgi(ag,pts,'rgba(230,240,237,.3)',line);}
    });
    [-1,1].forEach(function(side){var yy=side<0?'xl':'xr';
      yuz('x',side*w,[[side*w,0,D],[side*w,0,z],[side*w,h,z],[side*w,h,D]],function(ag,dyn){
        function sidePoint(y,t){var u=dyn?AG.ornek(AG[yy],t,y/h):0;return [side*(w+.04*Math.sin(Math.PI*y/h)*Math.sin(Math.PI*t)+u),y,D+depth*t];}
        for(i=0;i<=layers;i++){pts=[];for(j=0;j<=rows;j++)pts.push(sidePoint(h*j/rows,i/layers));kaleCizgi(ag,pts,'rgba(231,242,238,.42)',line);}
        for(j=0;j<=rows;j++){pts=[];for(i=0;i<=layers;i++)pts.push(sidePoint(h*j/rows,i/layers));kaleCizgi(ag,pts,'rgba(233,243,240,.4)',line);}
      });
    });
    yuz('y',h,[[-w,h,D],[w,h,D],[w,h,z],[-w,h,z]],function(ag,dyn){
      function roof(x,t){var u=dyn?AG.ornek(AG.y,(x+w)/(2*w),t):0;return [x,h-.045*Math.sin(Math.PI*(x+w)/(2*w))*Math.sin(Math.PI*t)+u,D+depth*t];}
      for(i=0;i<=cols;i++){pts=[];for(j=0;j<=layers;j++)pts.push(roof(-w+2*w*i/cols,j/layers));kaleCizgi(ag,pts,'rgba(237,245,242,.36)',line);}
      for(j=0;j<=layers;j++){pts=[];for(i=0;i<=cols;i++)pts.push(roof(-w+2*w*i/cols,j/layers));kaleCizgi(ag,pts,'rgba(226,241,235,.3)',line);}
    });
    kaleArkaCache={canvas:c,x:left,y:top,w:c.width/dpr,h:c.height/dpr,faces:faces,sallanan:false};g.drawImage(c,left,top,c.width/dpr,c.height/dpr);
  }
  function kaleOn(g) {
    var D=pos.D,w=A.kale.genislik/2+A.kale.direk/2,h=A.kale.yukseklik+A.kale.direk/2;
    kaleBoru(g,[-w,0,D],[-w,h,D],A.kale.direk,false);
    kaleBoru(g,[w,0,D],[w,h,D],A.kale.direk,false);
    kaleBoru(g,[-w,h,D],[w,h,D],A.kale.direk,false);
  }

  function golgeTop(g, x, z) {
    var p = izdus(x, 0, z);
    if (!p) return;
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath(); g.ellipse(p.x, p.y, 0.14 * p.olcek, 0.05 * p.olcek, 0, 0, 6.3); g.fill();
  }

  function topCiz(g, t, aci, skipShadow) {
    var R = A.kale.topYaricap;
    var p = izdus(t.x, t.y, t.z);
    if (!p) return;
    if(!skipShadow)golgeTop(g, t.x, t.z);
    var r = R * p.olcek;
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

  function kaleciCiz(g, k, baraj) {
    if(DT.kaleci3d){DT.kaleci3d.ciz(g,izdus,k,pos.D,{tip:pos.tip,barajYan:baraj&&baraj.merkezX<0?-1:1});return;}
    if(DT.model3d){DT.model3d.kaleciCiz(g,izdus,k,pos.D);return;}
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
    var b=ogeler.baraj, players=b.oyuncular||DT.baraj.kur(pos);
    players.map(function(player,i){var q=izdus(b.merkezX+b.px*player.off,0,b.merkezZ+b.pz*player.off);return{player:player,i:i,d:q?q.d:0};}).sort(function(a,c){return c.d-a.d;}).forEach(function(e){var player=e.player,i=e.i,state=DT.baraj.durum(player,ogeler.zaman||0),x=b.merkezX+b.px*player.off,z=b.merkezZ+b.pz*player.off;
      if(!(DT.baraj3d&&DT.baraj3d.oyuncu(g,izdus,{x:x,y:state.y,z:z,boy:state.boy},i,{t:(root.performance?root.performance.now():0)/1000,makeCanvas:yerelCanvas})))DT.model3d.barajCiz(g,izdus,{x:x,y:state.y,z:z,boy:state.boy},i);
    });
  }

  /* Şutçu yalnız seçilen duruş yönüne döner. Köşe nişanı yönünü değiştirmez.
   * Nişan beklerken oyuncu topun arkasında bekler. Top, vurus2 karesine geçince çıkar. */
  function oyuncuCiz(g, karakter, poz, topEkran, durum) {
    if (!topEkran) return;
    durum = durum || {};
    var olcek = (W>H&&H>=600?Math.min(240,H*.27):Math.min(0.21 * H, Math.max(100, H - topEkran.y - 155))) / S.boy;
    var r = Math.min(H*.012,Math.max(2, A.kale.topYaricap * topEkran.olcek));
    var u = durum.ilerleme || 0, temas = durum.temas || 0.533333;
    var kare = !durum.yol ? 'vurus1' : (u < temas ? 'vurus1' : (u < temas + 0.12 ? 'vurus2' : 'vurus3'));
    if(DT.futbolcu3d && gorseller[karakter+'_bekle'] && gorseller[karakter+'_vurus1']){
      var walk3=durum.yurume,dir=durum.durus||0;
      var elapsed3=durum.sure||0,windup3=durum.on||1.15;
      var shot=durum.yol?{elapsed:elapsed3,windup:windup3,contact:durum.contact||null}:null;
      var placement=DT.futbolcu3d.placement(pos,{direction:dir,walk:walk3,shot:shot,path:durum.guide,turning:durum.donus});
      var ball=durum.renderTop,ballScreen=ball&&izdus(ball.x,ball.y,ball.z);
      var ballLayer=ballScreen?{depth:ballScreen.d,draw:function(target){topCiz(target,ball,durum.topAci,true);}}:null;
      var rootX=placement.point[0],rootZ=placement.point[1],unit=placement.unit,yaw=placement.yaw;
      var anchor=izdus(rootX,0,rootZ),actorScale=unit*anchor.olcek;
      var worldProject=function(v){return izdus(rootX+v[0]*unit,(v[1]-8)*unit,rootZ+v[2]*unit);};
      var shadow=izdus(rootX,0,rootZ);g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(shadow.x,shadow.y,.28*shadow.olcek,.09*shadow.olcek,0,0,Math.PI*2);g.fill();g.restore();
      DT.futbolcu3d.draw(g,{id:karakter,front:gorseller[karakter+'_bekle'],back:gorseller[karakter+'_vurus1'],makeCanvas:yerelCanvas,
        x:anchor.x,y:anchor.y,scale:actorScale,direction:dir,walk:walk3,yaw:yaw,project:worldProject,gait:placement.gait,kick:placement.kick,
        viewKey:[W,H,pos.bx,pos.D,yaw,rootX,rootZ].join(':'),shot:shot,ball:ballLayer});
      return;
    }
    if(durum.renderTop)topCiz(g,durum.renderTop,durum.topAci,true);
    var walk=durum.yurume,reverse=walk?(walk.u<.5?walk.from>0:walk.to>0):durum.durus>0;
    var im = sprite(karakter, kare,reverse);
    var nokta = DT.SPRITE_NOKTA[karakter] && DT.SPRITE_NOKTA[karakter][kare];
    if (!im || !nokta) return;
    var anchor = DT.SPRITE_NOKTA[karakter].vurus2;
    g.save();
    var elapsed=durum.sure||0,windup=durum.on||.44,active=!!durum.yol;
    var before=Math.max(0,Math.min(1,elapsed/windup)),after=Math.max(0,elapsed-windup);
    var approach=active?(1-before)*(1-before):0;
    // Rotate around the planted foot, keeping the original face and uniform pixels intact.
    var lean=active?(elapsed<windup?Math.sin(before*Math.PI)*.055:-.075*Math.sin(Math.min(1,after/.55)*Math.PI)):0;
    var footX=S.ankrajX,footY=nokta.bottom,px=topEkran.x+(reverse?-1:1)*(r+(footX-anchor.tipX)*olcek)+approach*18,
        py=topEkran.y+(footY-anchor.tipY)*olcek;
    px+=(durum.durus||0)*26*(active?(1-before):1);
    if(durum.yurume&&DT.model3d.oyuncuYuru){
      var walk=durum.yurume,e=walk.u*walk.u*(3-2*walk.u);var start=walk.from>0?-1:1,end=walk.to>0?-1:1;px=topEkran.x+(start+(end-start)*e)*(r+(footX-anchor.tipX)*olcek)+(durum.durus||0)*26;px+=(walk.from+(walk.to-walk.from)*e-(durum.durus||0))*26;
      DT.model3d.oyuncuYuru(g,im,walk,{x:px,y:py,scale:olcek,anchorX:footX,bottom:footY,boy:S.boy,karakter:karakter});g.restore();return;
    }
    g.translate(px,py);g.rotate(lean);g.scale(reverse?-olcek:olcek,olcek);
    var turn=(durum.durus||0)*(active?(1-before):1);g.transform(1-.10*Math.abs(turn),0,-turn*.12,1,0,0);
    g.drawImage(im,-footX,-footY,S.genislik,S.yukseklik);
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
    if(durum&&durum.gol&&durum.sevinc===1&&DT.sevinc){
      if(DT.sevinc.draw(g,{id:karakter,time:durum.sure||0,x:cx,y:taban,height:boy,sprite:function(k){return sprite(karakter,k);},makeCanvas:yerelCanvas}))return;
    }
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

  /* FIFA 02 tarzı yer oku: topun gerçek uçuş yolunu izler. Falso → ok yana eğilir; alt temas → ok havaya kalkar; üst temas → ok yerde kalır.
   * Altında yere izdüşüm çizgisi var (yükseklik okunabilsin). Yalnız görüntü. */
  function fifaOkCiz(g, yol, kilit) {
    if (!yol || yol.length < 3 || !pos) return;
    // Kısa ok: yalnız ilk 3–4,5 m gösterilir (kaleye kadar uzanmaz, nişanı kolaylaştırmaz).
    var uzun = Math.max(3, Math.min(4.5, 0.2 * pos.D)), bas = 0.7, nok = [], yer = [], top = 0, onc = null, zaman = (root.performance ? root.performance.now() : Date.now()) / 1000;
    for (var i = 0; i < yol.length; i++) {
      var p = yol[i]; if (onc) top += Math.hypot(p.x - onc.x, p.y - onc.y, p.z - onc.z); onc = p;
      if (top < bas) continue; if (top > uzun + bas) break;
      var s = izdus(p.x, Math.max(0.03, p.y), p.z), z0 = izdus(p.x, 0.02, p.z); if (!s || !z0) continue;
      if (s.y < 70) break;   // ok ekranın üstünden taşmasın
      nok.push(s); yer.push(z0);
    }
    if (nok.length < 4) return;
    var gen = 0.34;   // ok gövde genişliği (m)
    function normal(a, i) { var u = a[Math.max(0, i - 1)], v = a[Math.min(a.length - 1, i + 1)], dx = v.x - u.x, dy = v.y - u.y, l = Math.hypot(dx, dy) || 1; return { tx: dx / l, ty: dy / l, nx: -dy / l, ny: dx / l }; }
    g.save();
    // yere izdüşüm
    g.strokeStyle = 'rgba(0,0,0,0.32)'; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); yer.forEach(function (q, i) { if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }); g.stroke(); g.setLineDash([]);
    var sol = [], sag = [];
    nok.forEach(function (s, i) { var n = normal(nok, i), w = Math.max(2.2, gen * s.olcek) / 2 * (0.55 + 0.45 * i / (nok.length - 1)); sol.push({ x: s.x + n.nx * w, y: s.y + n.ny * w }); sag.push({ x: s.x - n.nx * w, y: s.y - n.ny * w }); });
    var son = nok[nok.length - 1], nn = normal(nok, nok.length - 1), wd = Math.max(2.2, gen * son.olcek) / 2, bw = wd * 2.3, bl = wd * 4.2;
    var tip = { x: son.x + nn.tx * bl, y: son.y + nn.ty * bl }, a = nok[0], parla = kilit ? 0.86 : 0.74 + 0.10 * Math.sin(zaman * 4);
    var grad = g.createLinearGradient(a.x, a.y, tip.x, tip.y); grad.addColorStop(0, 'rgba(229,57,53,0.25)'); grad.addColorStop(0.35, 'rgba(229,57,53,' + (parla * 0.9).toFixed(3) + ')'); grad.addColorStop(1, 'rgba(255,92,76,' + parla.toFixed(3) + ')');
    g.fillStyle = grad; g.strokeStyle = 'rgba(255,225,215,' + (parla * 0.7).toFixed(3) + ')'; g.lineWidth = 1;
    g.beginPath(); sol.forEach(function (q, i) { if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); });
    g.lineTo(son.x + nn.nx * bw, son.y + nn.ny * bw); g.lineTo(tip.x, tip.y); g.lineTo(son.x - nn.nx * bw, son.y - nn.ny * bw);
    for (var k = sag.length - 1; k >= 0; k--) g.lineTo(sag[k].x, sag[k].y); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function nisanCiz(g, aim, kilit, falso, onizleme, fifa) {
    if (!aim) return;
    var D = pos.D;
    if (fifa) return;   // FIFA frikik: hedef halkası yok; yalnız yer oku (fifaOkCiz)
    if (onizleme) {
      g.save(); g.setLineDash([3, 6]); g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2; g.lineCap = 'round';
      g.beginPath();
      var ilk = true;
      for (var i = 0; i < onizleme.length; i += 3) {
        var o = onizleme[i]; if(o.z>D)break; var p = izdus(o.x, o.y, o.z);
        if (!p) continue;
        if (ilk) { g.moveTo(p.x, p.y); ilk = false; } else g.lineTo(p.x, p.y);
      }
      g.stroke();
      var son=null;
      for(var j=1;j<onizleme.length;j++){var prev=onizleme[j-1],next=onizleme[j];if(prev.z<=D&&next.z>=D){var t=(D-prev.z)/(next.z-prev.z);son={x:prev.x+(next.x-prev.x)*t,y:prev.y+(next.y-prev.y)*t,z:D};break;}}
      var end = son && izdus(son.x,son.y,D);
      if(end){g.setLineDash([]);g.strokeStyle='#ffcc66';g.beginPath();g.arc(end.x,end.y,5,0,Math.PI*2);g.stroke();g.font='11px sans-serif';g.fillStyle='#ffcc66';g.fillText('Tahmini',end.x+9,end.y-8);}
      g.restore();
    }
    var c = izdus(aim.x, aim.y, D);
    if (!c) return;
    var r = Math.max(12, 0.22 * c.olcek);
    g.save(); g.translate(c.x, c.y);
    g.strokeStyle = '#ffffff'; g.fillStyle = 'rgba(255,255,255,0.1)'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(0, 0, r, 0, 6.3); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-r - 6, 0); g.lineTo(-r * 0.4, 0); g.moveTo(r + 6, 0); g.lineTo(r * 0.4, 0);
    g.moveTo(0, -r - 6); g.lineTo(0, -r * 0.4); g.moveTo(0, r + 6); g.lineTo(0, r * 0.4); g.stroke();
    g.restore();
  }

  // Player supporters' cloth banner. Cached separately from the stadium: no new downloads.
  var pankartMetinleri = {
    meto: 'Meto Forever',
    fero: 'ÇIKAR MASAYA KOY FERO BABA ♥️',
    lort: 'Gökhanlort 28 GİRESUNLUMM',
    josh: 'Yozgatlım ♥️',
    latte: 'IceLatte 📍 Bergen'
  };
  var pankartCache = {};
  function pankartCiz(g, id) {
    var text=pankartMetinleri[id]; if(!text)return;
    var goal=izdus(0,A.kale.yukseklik,pos.D); if(!goal)return;
    var wide=W>H, bw=wide?Math.min(W*.43,520):W*.86;
    var gap=Math.max(24,Math.min(48,H*.052));
    var bh=Math.max(20,Math.min(48,goal.y-gap-68));
    var x=Math.max(12,Math.min(W-bw-12,goal.x-bw/2));
    var y=goal.y-bh-gap;
    var key=id+'_'+Math.round(bw)+'_'+Math.round(bh)+'_'+dpr;
    var c=pankartCache[key];
    if(!c){
      c=yerelCanvas(Math.ceil(bw*dpr),Math.ceil(bh*dpr));var b=c.getContext('2d');b.scale(dpr,dpr);
      // Uneven cloth edges and stitched white borders distinguish it from the HUD.
      b.fillStyle='#151518';b.beginPath();b.moveTo(1,3);b.lineTo(bw-2,0);b.lineTo(bw-1,bh-4);b.quadraticCurveTo(bw*.5,bh+3,3,bh-3);b.closePath();b.fill();
      b.strokeStyle='#ddd7c7';b.lineWidth=1;b.stroke();
      var cloth=b.createLinearGradient(0,0,0,bh);cloth.addColorStop(0,'rgba(255,255,255,.15)');cloth.addColorStop(.4,'rgba(255,255,255,0)');cloth.addColorStop(1,'rgba(0,0,0,.4)');b.fillStyle=cloth;b.fill();
      b.fillStyle='#ece8da';b.fillRect(7,5,3,bh-10);b.fillRect(bw-10,5,3,bh-10);
      b.strokeStyle='rgba(255,255,255,.08)';b.lineWidth=1;
      for(var fold=20;fold<bw;fold+=36){b.beginPath();b.moveTo(fold,3);b.lineTo(fold+4,bh-3);b.stroke();}
      var fs=Math.min(19,bh*.48);b.font='bold '+fs+'px Arial, sans-serif';
      var parts=text.split(/(♥️|📍)/);
      function textWidth(){return parts.reduce(function(sum,t){return sum+(t==='♥️'||t==='📍'?fs*.85:b.measureText(t).width);},0);}
      while(textWidth()>bw-34&&fs>8){fs-=.5;b.font='bold '+fs+'px Arial, sans-serif';}
      var pen=(bw-textWidth())/2,mid=bh/2+.5;b.textAlign='left';b.textBaseline='middle';
      parts.forEach(function(t){
        if(t==='♥️'||t==='📍'){
          b.save();b.translate(pen+fs*.425,mid);b.scale(fs*.8,fs*.8);b.fillStyle='#ff5368';b.beginPath();
          if(t==='♥️'){b.moveTo(0,.43);b.bezierCurveTo(-.85,-.12,-.42,-.72,0,-.3);b.bezierCurveTo(.42,-.72,.85,-.12,0,.43);b.closePath();b.fill();}
          else{b.moveTo(0,.55);b.bezierCurveTo(-.66,-.05,-.44,-.63,0,-.63);b.bezierCurveTo(.44,-.63,.66,-.05,0,.55);b.fill();b.fillStyle='#fff6dc';b.beginPath();b.arc(0,-.25,.12,0,Math.PI*2);b.fill();}
          b.restore();pen+=fs*.85;
        }else{b.fillStyle='#fff6dc';b.fillText(t,pen,mid);pen+=b.measureText(t).width;}
      });
      if(Object.keys(pankartCache).length>20)pankartCache={};pankartCache[key]=c;
    }
    g.save();g.strokeStyle='#beb6a1';g.lineWidth=1;[x+5,x+bw-5].forEach(function(px){g.beginPath();g.moveTo(px,y-9);g.lineTo(px,y+6);g.stroke();});g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=5;g.translate(x+bw/2,y+bh/2);g.rotate(-.012);g.drawImage(c,-bw/2,-bh/2,bw,bh);g.restore();
  }

  /* ---------- ana çizim ---------- */
  var ogeAdlari = null;
  /* Ağ: top çarpınca yüzeyler sallanır. Enerji varken her karede yeniden çizilir, sönünce son bir kez durgun hâle döner (maliyet yalnız hareket sürerken). */
  function agGuncelle(d) {
    if (!DT.ag || !kaleArkaCache) return;
    var now = root.performance ? root.performance.now() : Date.now();
    DT.ag.guncelle(d.top || null, now);
    var e = DT.ag.enerji(), cache = kaleArkaCache;
    if (e > 1e-2) { cache.faces.forEach(function (f) { f.ciz(true); }); cache.sallanan = true; }
    else if (cache.sallanan) { DT.ag.temizle(); cache.faces.forEach(function (f) { f.ciz(false); }); cache.sallanan = false; }
  }
  function ciz(d) {
    if (!kam || !arka) return;
    var g = ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (d.sarsinti) g.translate((Math.random() - 0.5) * d.sarsinti, (Math.random() - 0.5) * d.sarsinti);
    g.drawImage(arka, 0, 0, W, H);
    kalabalikCiz(g, (root.performance ? root.performance.now() : Date.now()) / 1000, d.heyecan || 0, d.alay === undefined ? -1 : d.alay, d.alayTur);
    if (d.top && DT.ag) { var off = DT.ag.topOfset(d.top); if (off > 0.005) d = Object.assign({}, d, { top: { x: d.top.x, y: d.top.y, z: d.top.z + off } }); }
    var supporter=d.oyuncu?d.oyuncu.karakter:d.onKarakter?d.onKarakter.karakter:null;
    if(DT.tribun&&DT.tribun.atmosfer)DT.tribun.atmosfer(g,{W:W,ust:35,alt:izdus(0,A.kale.yukseklik,pos.D).y+14,time:(root.performance?root.performance.now():Date.now())/1000,makeCanvas:yerelCanvas});
    if(supporter&&DT.tribun){DT.tribun.draw(g,{id:supporter,D:pos.D,time:(root.performance?root.performance.now():Date.now())/1000,project:izdus,makeCanvas:yerelCanvas,image:gorseller['_menu_'+supporter+'_bekle']||sprite(supporter,'bekle')});}
    else if(supporter)pankartCiz(g,supporter);
    alayCiz(g, d.alay === undefined ? -1 : d.alay, d.alayTur);

    kaleArka(g);
    agGuncelle(d);
    if (d.nisan && d.nisan.fifa) fifaOkCiz(g, d.nisan.fifaYol, d.nisan.kilit);

    // derinliğe göre sıralanan nesneler (uzaktan yakına)
    var liste = [];
    var D = pos.D;
    var kd = izdus(0, 1, D + 0.25);
    if (d.kaleci && pos.tip !== 'hedef') liste.push({ z: kd ? kd.d : 1e9, ciz: function () { kaleciCiz(g, d.kaleci, d.baraj); } });
    // Hedef ağı: kale ağzına gerili delikli ağ; derinliğe göre topla sıralanır (delikten geçen top arkasında kalır).
    if (pos.tip === 'hedef' && DT.hedef) { var hd = izdus(0, 1.2, pos.D); liste.push({ z: hd ? hd.d : 1e9, ciz: function () { DT.hedef.ciz(g, izdus, pos.D, d.hedefVurulan, d.hedefSecili); } }); }
    var fd = izdus(0, 1, D);
    liste.push({ z: fd ? fd.d + 0.01 : 1e9, ciz: function () { kaleOn(g); } });
    if (d.baraj) {
      var bd = izdus(d.baraj.merkezX, 1, d.baraj.merkezZ);
      liste.push({ z: bd ? bd.d : 0, ciz: function () { barajCiz(g, d); } });
    }
    // Four independently cached net surfaces. A ball behind the net is
    // drawn behind its cords, never on top of the entire cage.
    var farBall=d.top&&Math.hypot(d.top.x-pos.bx,d.top.z)>=2?d.top:null;
    kaleArkaCache.faces.forEach(function(face){
      var depth=face.depth;
      if(farBall){
        var coordinate=face.kind==='x'?0:face.kind==='y'?1:2;
        var hidden=(kam.C[coordinate]-face.value)*(farBall[face.kind]-face.value)<0;
        var ballDepth=izdus(farBall.x,farBall.y,farBall.z);
        if(ballDepth)depth=ballDepth.d+(hidden?-.002:.002);
      }
      liste.push({z:depth,ciz:function(){var cache=kaleArkaCache;g.drawImage(face.canvas,cache.x,cache.y,cache.w,cache.h);}});
    });
    var actorBall=!!(d.top&&d.oyuncu&&Math.hypot(d.top.x-pos.bx,d.top.z)<2);
    if (d.top && !actorBall) {
      var td = izdus(d.top.x, d.top.y, d.top.z);
      liste.push({ z: td ? td.d : 0, ciz: function () { topCiz(g, d.top, d.topAci); } });
    }
    liste.sort(function (a, b) { return b.z - a.z; });
    liste.forEach(function (o) { o.ciz(); });

    // oyuncu ve nişan her zaman en önde
    var topEkran = izdus(pos.bx, A.kale.topYaricap, 0);
    if(actorBall)golgeTop(g,d.top.x,d.top.z);
    if (d.oyuncu) oyuncuCiz(g, d.oyuncu.karakter, d.oyuncu.poz, topEkran, Object.assign({},d.oyuncu,{renderTop:actorBall?d.top:null,topAci:d.topAci}));
    if (d.onKarakter) {
      var boy = Math.min(0.38 * H, 260);
      var taban = Math.min(H * 0.76, H - 156);
      if (taban < boy + 64) taban = boy + 64;
      onSpriteCiz(g, d.onKarakter.karakter, d.onKarakter.poz, W * 0.5, taban, boy, d.onKarakter);
    }
    if (d.nisan) nisanCiz(g, d.nisan.aim, d.nisan.kilit, d.nisan.falso, d.nisan.onizleme, d.nisan.fifa);
    if (d.flas) { g.fillStyle = 'rgba(255,255,255,' + d.flas + ')'; g.fillRect(0, 0, W, H); }
  }

  /* Çözünürlük sınırı: varsayılan 2 (3 değil). Karakterler 900 px'lik görsellerden küçültüldüğü için 3x piksel fark yaratmaz ama
   * tuval pikselini 2,25 katına çıkarır. Kare süresi uzun kalırsa sınır 1,5'a, sonra 1'e iner (kareOlc oyun döngüsünden çağrılır). */
  var dprSiniri = 2, kareToplam = 0, kareSayi = 0, kareBekle = 0, hizliKare = 0;
  function kareOlc(ms) {
    if (!(ms > 0) || ms > 250) { kareToplam = 0; kareSayi = 0; hizliKare = 0; return dprSiniri; }          // sekme arka plandaydı ya da duraklama: ölçme
    if (kareBekle > 0) { kareBekle--; return dprSiniri; } // boyut değişiminden sonra kısa süre ölçme
    hizliKare = ms < 21 ? hizliKare + 1 : 0;
    if (hizliKare >= 600 && dprSiniri < 2) {
      dprSiniri = dprSiniri < 1.5 ? 1.5 : 2;
      hizliKare = 0; kareToplam = 0; kareSayi = 0; kareBekle = 120;
      if (cv && root.document) boyutla();
      return dprSiniri;
    }
    kareToplam += ms; kareSayi++;
    if (kareSayi >= 60) {
      var ort = kareToplam / kareSayi; kareToplam = 0; kareSayi = 0;
      if (ort > 30 && dprSiniri > 1) { dprSiniri = dprSiniri > 1.5 ? 1.5 : 1; hizliKare = 0; kareBekle = 20; if (cv && root.document) boyutla(); }
    }
    return dprSiniri;
  }
  function boyutla() {
    var kutu = cv.getBoundingClientRect();
    W = Math.max(280, Math.round(kutu.width)); H = Math.max(280, Math.round(kutu.height));
    dpr = Math.min(dprSiniri, root.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (pos) sahneKur(pos);
  }

  function sahneKur(p, durus) {
    pos = p; if (durus !== undefined) kamDurus = durus; kam = kameraKur(p); kaleArkaCache=null; if(DT.ag)DT.ag.sifirla(p); arka = arkaPlanCiz();
  }
  // Duruş seçilince kamera yeni duruşa göre döner (tek kesme; arka plan bir kez yeniden çizilir, her karede değil).
  function kameraDurus(durus) {
    if (durus === kamDurus || !pos) return;
    kamDurus = durus; kam = kameraKur(pos); kaleArkaCache=null; if(DT.ag)DT.ag.sifirla(pos); arka = arkaPlanCiz();
  }

  function kur(canvas, genislik, yukseklik, dprZorla) {
    cv = canvas; ctx = cv.getContext('2d');
    if (genislik) { W = genislik; H = yukseklik; dpr = dprZorla || 1; cv.width = W * dpr; cv.height = H * dpr; }
    else { boyutla(); if (root.addEventListener) root.addEventListener('resize', boyutla); }
    spriteleriYukle();
  }

  DT.cizim = {
    kameraAyar: KAMERA,
    kur: kur, sahneKur: sahneKur, kameraDurus: kameraDurus, kamDurus: function () { return kamDurus; }, kameraKonum: function () { return kam ? kam.C.slice() : null; }, ciz: ciz, ekranToKale: ekranToKale, izdus: izdus,
    boyut: function () { return { w: W, h: H }; },
    kareOlc: kareOlc, dprSiniri: function () { return dprSiniri; },
    karakterHazir: karakterHazir, karakterYukle: karakterYukle,
    hazir: function () { return yuklenen >= gereken && !yuklemeHatasi; },
    gorselHazir: function (ad) { return !!gorseller[ad]; },
    formaSprite: formaSprite,
    gorselEkle: function (ad, im) { gorseller[ad] = im; }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
