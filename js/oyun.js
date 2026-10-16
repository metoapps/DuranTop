/* Duran Top - oyun akışı. Şifre kaldırıldı, yükleme düzeltildi. */
(function (root) {
  'use strict';
  var DT = root.DT, A = DT.AYAR, doc = root.document;
  var $ = function (id) { return doc.getElementById(id); };
  var simdi = function () { return root.performance.now(); };

  var ANAHTAR = { ayar: 'dt_ayar', resmi: 'dt8_resmi', enIyi: 'dt8_en_iyi', gecmis: 'dt8_gecmis' };
  var VURUS_SAYISI = A.pozisyonlar ? A.pozisyonlar.length : 10;
  function pozlar(){if(d.mod==='gunluk'&&d.gunPoz)return d.gunPoz;if(DT.hedef&&d.mod==='hedef')return DT.hedef.pozisyonlar;if(DT.hedef&&d.mod==='antrenman')return DT.hedef.antrenmanTuru;return A.pozisyonlar||[];}
  function turSayisi(){return d.mod==='hayat'?1e9:pozlar().length;}
  function hesap(g){return g.pos&&g.pos.tip==='hedef'&&DT.hedef?DT.hedef.hesapla(g):DT.fizik.hesapla(g);}

  var ayar = { ses: true, cubuk: true, muzik: true, solEl: false, buyuk: false, hareketAz: false, titresim: true, sv: { muzik: 100, efekt: 100, tribun: 100 } }, hareketKapatildi = false;
  function seviyeUygula() {
    var sv = ayar.sv || (ayar.sv = { muzik: 100, efekt: 100, tribun: 100 });
    if (DT.muzik && DT.muzik.seviyeAyarla) DT.muzik.seviyeAyarla(sv.muzik / 100);
    if (DT.ses && DT.ses.seviyeAyarla) DT.ses.seviyeAyarla(sv.efekt / 100);
    if (DT.tezahurat && DT.tezahurat.seviyeAyarla) DT.tezahurat.seviyeAyarla(sv.tribun / 100);
  }
  function titret(kalip) { if (ayar.titresim && root.navigator && typeof root.navigator.vibrate === 'function') { try { root.navigator.vibrate(kalip); } catch (e) {} } }
  var d = { ekran: 'menu', mod: 'antrenman', karakter: 'meto', tur: '', idx: 0, sonuclar: [], pos: null, faz: 'bos', aim: null, kilit: false, duzeltHak: 1, falso: 0, seed: 1, contact: {x:0,y:0}, temasHazir: false, onizleme: null, barajGeo: null, cubukBasla: 0, an: null, son: null };

  function oku(k, varsayilan) { try { var v = root.localStorage.getItem(k); return v ? JSON.parse(v) : varsayilan; } catch (e) { return varsayilan; } }
  function yaz(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var EKRANLAR = ['menu', 'secim', 'oyun', 'tursonu'];
  function ekranGoster(ad) {
    d.ekran = ad;
    EKRANLAR.forEach(function (e) { var el=$(e); if(el) el.hidden = e !== ad; });
    if (DT.tezahurat) DT.tezahurat.ortam(ad === 'oyun');
    if (DT.muzik) DT.muzik.sahne(ad === 'oyun' ? 'mac' : 'menu');
  }

  function menuGoster() {
    d.faz = 'bos';
    ekranGoster('menu');
    var notEl = $('menuNot'); if(notEl) notEl.textContent = 'Tüm karakterler açık. İstediğini seç.';
    menuSahne();
    var yuk = $('yukleme'); if(yuk) yuk.style.display = 'none';
  }

  function menuSahne() {
    if(A.pozisyonlar && A.pozisyonlar[0]) d.pos = A.pozisyonlar[0];
    if(DT.cizim && DT.cizim.sahneKur) DT.cizim.sahneKur(d.pos);
    d.faz = 'menu';
  }

  function ayarGuncelle() {
    var b = $('btnSes'); if(b) b.textContent = 'Ses: ' + (ayar.ses ? 'açık' : 'kapalı');
    seviyeUygula();
    yaz(ANAHTAR.ayar, ayar);
  }
  function sesDegistir() { ayar.ses = !ayar.ses; if(DT.ses) DT.ses.ayarla(ayar.ses); ayarGuncelle(); }

  function secimGoster(mod) {
    d.mod = mod;
    ekranGoster('secim');
    var iz = $('secimIzgara'); if(!iz) return; iz.innerHTML = '';
    (DT.KARAKTER||[]).forEach(function (k) {
      var b = doc.createElement('button'); b.type = 'button'; b.className = 'secim-kart';
      b.innerHTML = '<img alt="" src="assets/menu/' + k.id + '_bekle.webp"><span>' + k.ad + '</span>';
      b.disabled = false;
      b.addEventListener('click', function () { turBaslat(k.id, mod, null); });
      iz.appendChild(b);
    });
  }

  function turKimligi() { return Math.floor(Math.random() * 1e9).toString(36); }
  var turYukleniyor = false;
  function turBaslat(karakter, mod, kayit) {
    if (!DT.cizim || !DT.cizim.hazir || !DT.cizim.hazir() || turYukleniyor) return;
    if (DT.cizim.karakterHazir && !DT.cizim.karakterHazir(karakter)) {
      turYukleniyor=true;
      DT.cizim.karakterYukle(karakter).then(function(ok){turYukleniyor=false;if(ok)turBaslat(karakter,mod,kayit);});
      return;
    }
    d.karakter = karakter; d.mod = mod;
    d.tur = turKimligi(); d.idx = 0; d.sonuclar = [];
    ekranGoster('oyun');
    vurusHazirla(null);
  }

  function toplam() { return d.sonuclar.reduce(function (t, s) { return t + (s.puan||0); }, 0); }

  function vurusHazirla(acik) {
    d.pos = (d.mod === 'hayat' && DT.modlar) ? DT.modlar.hayatPoz(d.idx, d.hayatSeed||0, d.hayatGol||0, A.pozisyonlar, DT.hedef&&DT.hedef.pozisyonlar) : (pozlar()[d.idx] || A.pozisyonlar[0]);
    if(DT.cizim && DT.cizim.sahneKur) DT.cizim.sahneKur(d.pos, 0);
    d.faz = 'nisan'; d.aim = null; d.kilit = false;
    var hud = $('hudVurus'); if(hud) hud.textContent = 'Vuruş ' + (d.idx + 1);
    var ip = $('ipucu'); if(ip) { ip.hidden = false; ip.textContent = 'Kaleye dokun, sürükle, bırak.'; }
  }

  function girisBagla() {
    var cv = $('sahne'); if(!cv) return;
    cv.addEventListener('pointerdown', function (e) {
      if (d.faz !== 'nisan' || d.kilit) return;
      nisanGuncelle(e);
    });
  }

  function nisanGuncelle(e) {
    if(!DT.cizim || !DT.cizim.ekranToKale) return;
    var r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : {left:0,top:0,width:1,height:1};
    var b = DT.cizim.boyut ? DT.cizim.boyut() : {w:1,h:1};
    var p = { x: (e.clientX - r.left) * b.w / r.width, y: (e.clientY - r.top) * b.h / r.height };
    var k = DT.cizim.ekranToKale(p.x, p.y);
    if (k) d.aim = { x: k.x, y: k.y };
  }

  function vur() {
    if (d.faz !== 'nisan' || !d.aim) return;
    d.faz = 'vurus';
    if (DT.ses) DT.ses.cal('vurus');
  }

  function sonucGoster(r) {
    d.faz = 'sonuc';
    var bas = $('sonucBaslik'); if(bas) bas.textContent = r.sonuc === 'gol' ? 'GOL' : 'KAÇTI';
    var son = $('sonuc'); if(son) son.hidden = false;
  }

  function devam() {
    d.idx++;
    if (d.idx >= turSayisi()) { ekranGoster('tursonu'); return; }
    vurusHazirla(null);
  }

  function baslat() {
    ayar = oku(ANAHTAR.ayar, ayar); ayarGuncelle();
    if (DT.ses) DT.ses.ayarla(ayar.ses);
    girisBagla();
    var br = $('btnResmi'); if(br) br.addEventListener('click', function () { secimGoster('resmi'); });
    var ba = $('btnAntrenman'); if(ba) ba.addEventListener('click', function () { secimGoster('antrenman'); });
    var bh = $('btnHedef'); if(bh) bh.addEventListener('click', function () { secimGoster('hedef'); });
    var bg = $('btnGunluk'); if(bg) bg.addEventListener('click', function () { secimGoster('gunluk'); });
    var by = $('btnHayat'); if(by) by.addEventListener('click', function () { secimGoster('hayat'); });
    var sg = $('secimGeri'); if(sg) sg.addEventListener('click', menuGoster);
    var hg = $('hudGeri'); if(hg) hg.addEventListener('click', menuGoster);
    var vb = $('vurBtn'); if(vb) vb.addEventListener('click', vur);
    var db = $('devamBtn'); if(db) db.addEventListener('click', devam);
    menuGoster();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', baslat); else baslat();
})(typeof globalThis !== 'undefined' ? globalThis : window);
