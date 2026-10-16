/* Duran Top - oyun akışı. Ekranlar, dokunmatik kontrol, vuruş animasyonu ve yerel kayıt.
 * Sonuç hesabı fizik.js'de; bu dosya yalnızca girdi toplar ve sonucu gösterir. */
(function (root) {
  'use strict';
  var DT = root.DT, A = DT.AYAR, doc = root.document;
  var $ = function (id) { return doc.getElementById(id); };
  var simdi = function () { return root.performance.now(); };

  var ANAHTAR = { ayar: 'dt_ayar', resmi: 'dt8_resmi', enIyi: 'dt8_en_iyi', gecmis: 'dt8_gecmis' };
  var VURUS_SAYISI = A.pozisyonlar.length;
  function pozlar(){if(d.mod==='gunluk'&&d.gunPoz)return d.gunPoz;if(DT.hedef&&d.mod==='hedef')return DT.hedef.pozisyonlar;if(DT.hedef&&d.mod==='antrenman')return DT.hedef.antrenmanTuru;return A.pozisyonlar;}
  function turSayisi(){return d.mod==='hayat'?1e9:pozlar().length;}
  function yeniModMu(){return d.mod==='gunluk'||d.mod==='hayat';}
  function hesap(g){return g.pos&&g.pos.tip==='hedef'?DT.hedef.hesapla(g):DT.fizik.hesapla(g);}

  var ayar = { ses: true, cubuk: true, muzik: true, solEl: false, buyuk: false, hareketAz: false, titresim: true, sv: { muzik: 100, efekt: 100, tribun: 100 } }, hareketKapatildi = false;
  function seviyeUygula() {
    var sv = ayar.sv || (ayar.sv = { muzik: 100, efekt: 100, tribun: 100 });
    if (DT.muzik && DT.muzik.seviyeAyarla) DT.muzik.seviyeAyarla(sv.muzik / 100);
    if (DT.ses && DT.ses.seviyeAyarla) DT.ses.seviyeAyarla(sv.efekt / 100);
    if (DT.tezahurat && DT.tezahurat.seviyeAyarla) DT.tezahurat.seviyeAyarla(sv.tribun / 100);
    [['muzik', 'svMuzik', 'svMuzikYaz'], ['efekt', 'svEfekt', 'svEfektYaz'], ['tribun', 'svTribun', 'svTribunYaz']].forEach(function (x) { var g = $(x[1]), y = $(x[2]); if (g && String(g.value) !== String(sv[x[0]])) g.value = sv[x[0]]; if (y) y.textContent = sv[x[0]] + '%'; });
  }
  function titret(kalip) { if (ayar.titresim && root.navigator && typeof root.navigator.vibrate === 'function') { try { root.navigator.vibrate(kalip); } catch (e) {} } }
  var d = {
    ekran: 'menu', mod: 'antrenman', karakter: 'meto', tur: '', idx: 0, sonuclar: [],
    pos: null, faz: 'bos', aim: null, kilit: false, duzeltHak: 1, falso: 0, seed: 1,
    contact: {x:0,y:0}, temasHazir: false, onizleme: null, barajGeo: null, cubukBasla: 0, an: null, son: null
  };

  function oku(k, varsayilan) { try { var v = root.localStorage.getItem(k); return v ? JSON.parse(v) : varsayilan; } catch (e) { return varsayilan; } }
  function yaz(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function sil(k) { try { root.localStorage.removeItem(k); } catch (e) {} }

  var EKRANLAR = ['menu', 'secim', 'oyun', 'tursonu'];
  function ekranGoster(ad) {
    d.ekran = ad;
    EKRANLAR.forEach(function (e) { $(e).hidden = e !== ad; });
    if (DT.tezahurat) DT.tezahurat.ortam(ad === 'oyun');
    if (DT.muzik) DT.muzik.sahne(ad === 'oyun' ? 'mac' : 'menu');
  }

  function kupaKapali(){var st=DT.live&&DT.live.getState&&DT.live.getState();return !!(st&&st.kupaAcik===false);}
  function modDurumYaz() {
    if (!DT.modlar) return;
    var g = DT.modlar.gunNo(), du = DT.modlar.gunlukDurum(g), gd = $('gunlukDurum'), hd = $('hayatDurum'), hy = DT.modlar.hayatDurum();
    if (gd) gd.textContent = '#' + DT.modlar.gunSira(g) + ' · ' + (du.oynadi ? 'bugün ' + du.puan + ' puan' : 'bugünkü ilk deneme');
    if (hd) hd.textContent = hy.rekor ? 'rekor ' + hy.rekor + ' gol' : 'ilk kaçırışa kadar vur';
  }
  function menuGoster() {
    if (DT.rozet && $('rozetListe')) DT.rozet.ciz($('rozetListe'), doc);
    $("temasPanel").hidden = true;
    d.faz = 'bos';
    ekranGoster('menu');
    $('btnResmi').textContent = 'Kupaya katıl';
    if(kupaKapali()){$('btnResmi').textContent='Kupa kapalı';$('btnResmi').disabled=true;}
    $('btnSifirla').hidden = true;
    $('menuNot').textContent = 'Tüm karakterler açık. İstediğini seç.';
    menuSahne();
  }

  function menuSahne() {
    d.pos = A.pozisyonlar[0];
    DT.cizim.sahneKur(d.pos);
    d.barajGeo = null; d.aim = null; d.kilit = false; d.karakter = d.karakter || 'meto';
    d.faz = 'menu';
  }

  function ayarGuncelle() {
    $('btnSes').textContent = 'Ses: ' + (ayar.ses ? 'açık' : 'kapalı');
    $('btnSes').classList.toggle('acik', ayar.ses);
    if ($('btnMuzik')) { $('btnMuzik').textContent = 'Müzik: ' + (ayar.muzik ? 'açık' : 'kapalı'); $('btnMuzik').classList.toggle('acik', ayar.muzik); }
    if (DT.muzik) DT.muzik.muzikAyarla(ayar.muzik);
    seviyeUygula();
    [['btnSolEl', 'Sol el modu', 'solEl'], ['btnBuyuk', 'Büyük düğmeler', 'buyuk'], ['btnTitresim', 'Titreşim', 'titresim']].forEach(function (x) { var b = $(x[0]); if (b) { b.textContent = x[1] + ': ' + (ayar[x[2]] ? 'açık' : 'kapalı'); b.classList.toggle('acik', !!ayar[x[2]]); } });
    if ($('btnHareket')) { $('btnHareket').textContent = 'Hareket: ' + (ayar.hareketAz ? 'az' : 'tam'); $('btnHareket').classList.toggle('acik', ayar.hareketAz); }
    if ($('oyun') && $('oyun').classList) { $('oyun').classList.toggle('sol-el', !!ayar.solEl); $('oyun').classList.toggle('buyuk', !!ayar.buyuk); }
    if (ayar.hareketAz) { A.hareket = false; hareketKapatildi = true; } else if (hareketKapatildi) { A.hareket = true; hareketKapatildi = false; }
    $('hudSes').textContent = ayar.ses ? 'Ses açık' : 'Ses kapalı';
    $('btnCubuk').textContent = 'Antrenman çubuğu: ' + (ayar.cubuk ? 'açık' : 'kapalı');
    $('btnCubuk').classList.toggle('acik', ayar.cubuk);
    ayar.sesPolitika=2;
    yaz(ANAHTAR.ayar, ayar);
  }
  function sesDegistir() { ayar.ses = !ayar.ses; DT.ses.ayarla(ayar.ses);if(DT.tezahurat)DT.tezahurat.ayarla(ayar.ses);if(DT.muzik)DT.muzik.ayarla(ayar.ses); ayarGuncelle(); if (ayar.ses) DT.ses.cal('islik'); }

  function cubukAktif() { return d.mod === 'resmi' || ayar.cubuk; }

  /* ---------- seçim ve tur (şifre yok) ---------- */
  function secimGoster(mod) {
    d.mod = mod;
    ekranGoster('secim');
    $('secimNot').textContent = 'Tüm karakterler açık. İstediğini seç.';
    var iz = $('secimIzgara'); iz.innerHTML = '';
    DT.KARAKTER.forEach(function (k) {
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
    d.seriDurum = { seri: 0 }; if (DT.rozet) DT.rozet.turBasla();
    d.turEnSert = 0; d.turRozetler = []; d.turRekor = false;
    d.hayatBitti = false; d.hayatGol = 0; d.hayatSeed = (Math.random() * 2147483647) | 0; d.gun = DT.modlar ? DT.modlar.gunNo() : 0;
    if (mod === 'gunluk' && DT.modlar && DT.hedef) d.gunPoz = DT.modlar.gunPozisyonlar(d.gun, A.pozisyonlar, DT.hedef.pozisyonlar);
    if (!DT.cizim.hazir() || turYukleniyor) return;
    if (DT.cizim.karakterHazir && !DT.cizim.karakterHazir(karakter)) {
      turYukleniyor=true;
      DT.cizim.karakterYukle(karakter).then(function(ok){turYukleniyor=false;if(ok)turBaslat(karakter,mod,kayit);});
      return;
    }
    d.karakter = karakter; d.mod = mod;
    if (kayit) {
      d.tur = kayit.tur; d.idx = kayit.idx; d.sonuclar = (kayit.sonuclar || []).slice();
      if (d.idx >= turSayisi()) { d.pos = pozlar()[0]; ekranGoster('tursonu'); turSonu(); return; }
    } else {
      d.tur = turKimligi(); d.idx = 0; d.sonuclar = [];
    }
    ekranGoster('oyun');
    vurusHazirla(kayit && kayit.acik ? kayit.acik : null);
  }

  function toplam() { return d.sonuclar.reduce(function (t, s) { return t + s.puan; }, 0); }

  function panelKonumu(){var el=$('oyun');if(el&&el.classList&&el.classList.toggle)el.classList.toggle('secim-sag',false);}

  function vurusHazirla(acik) {
    if (DT.ses.sustur) DT.ses.sustur();
    var tAcilis = simdi();
    d.pos = d.mod === 'hayat' ? DT.modlar.hayatPoz(d.idx, d.hayatSeed, d.hayatGol, A.pozisyonlar, DT.hedef.pozisyonlar) : pozlar()[d.idx];
    DT.cizim.sahneKur(d.pos, 0);
    var ornek = hesap({ pos: d.pos, aim: { x: 0, y: 1.2 }, falso: 0, zaman: 0.5, seed: 1, antrenman: true, falsoDenge:true,akilliFrikik:true,direkFizigi:true,kural10: d.mod !== 'resmi' });
    d.barajGeo = ornek.baraj;
    if (DT.cizim.barajIsit) DT.cizim.barajIsit(d.barajGeo);
    d.faz = 'nisan'; d.aim = null; d.kilit = false; d.duzeltHak = 1; d.falso = 0; d.onizleme = null; d.an = null; d.son = null;
    d.seed = d.mod === 'gunluk' ? DT.modlar.gunSeed(d.gun, d.idx) : (Math.random() * 2147483647) | 0;
    d.ruzgar = (d.mod !== 'resmi' && A.ruzgar && A.ruzgar.acik !== false && DT.ruzgar) ? DT.ruzgar.uret(d.seed ^ 0x9e37) : null;
    if (d.ruzgar && d.mod === 'hayat') d.ruzgar = DT.ruzgar.olcekle(d.ruzgar, DT.modlar.hayatZorluk(d.hayatGol).ruzgarOlcek);
    d.altin = (d.mod !== 'resmi' && d.pos.tip !== 'hedef' && DT.bonus) ? DT.bonus.altinUret(d.seed ^ 0x51ed) : null;
    d.contact = {x:0,y:0}; d.temasHazir = false;d.guc=1;d.gucHazir=false;d.durus=0;d.kamDurus=0;d.donus=0;d.donusSon=null;d.yurume=null;d.durusHazir=true;d.alayT0=null;d.konfetiT0=null;d.tekrar=null;panelKonumu();
    $('gucPanel').hidden=true;$('gucSec').value=100;$('gucNot').textContent='%100 · Tam güç';$('fifaNisan').hidden=true;$('fifaKutu').hidden=true;d.fifa={faz:null};d.nisanHiz=null;$('temasPanel').hidden = true;
    $('vurBtn').disabled=false;$('vurBtn').textContent='VUR';$('ucusDurum').textContent='';
    $('sonuc').hidden = true; $('alt').hidden = true;
    $('hudVurus').textContent = d.mod === 'hayat' ? 'Seri ' + d.hayatGol : 'Vuruş ' + (d.idx + 1) + '/' + turSayisi();
    $('hudTip').textContent = d.pos.ad + (d.mod === 'antrenman' ? ' · antrenman' : '');
    $('hudPuan').textContent = toplam();
    $('falsoKutu').hidden = true;
    falsoSec(0);
    $('ipucu').hidden = false;
    $('ipucu').textContent = 'Kaleye dokun, parmağını sürükle, bırak. Nişan kilitlenir.';
    if(!acik)DT.ses.cal('islik');
    if (acik) {
      d.seed = acik.seed; d.aim = acik.aim; d.duzeltHak = acik.duzeltHak;
      d.contact = acik.contact || {x:0,y:0}; d.temasHazir = !!acik.temasHazir;
      kilitle(true);
    } else { gucVeyaNisan(); }
    if (DT.perf) DT.perf.olay('pozisyon açılışı', simdi() - tAcilis);
  }

  function ekranNoktasi(e) {
    var r = root.document.getElementById('sahne').getBoundingClientRect();
    var b = DT.cizim.boyut();
    return { x: (e.clientX - r.left) * b.w / r.width, y: (e.clientY - r.top) * b.h / r.height };
  }
  function nisanGuncelle(e) {
    var p = ekranNoktasi(e), k = DT.cizim.ekranToKale(p.x, p.y);
    if (!k) return;
    d.aim = { x: Math.max(-aimXMax(), Math.min(aimXMax(), k.x)), y: Math.max(0.11, Math.min(3.1, k.y)) };
  }
  function girisBagla() {
    var cv = $('sahne'), basili = false;
    cv.addEventListener('pointerdown', function (e) {
      if (d.faz !== 'nisan' || !d.durusHazir || !d.gucHazir || d.kilit) return;
      basili = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      nisanGuncelle(e);
    });
    cv.addEventListener('pointermove', function (e) { if (basili && d.faz === 'nisan' && !d.kilit) nisanGuncelle(e); });
    function birak() { if (!basili) return; basili = false; }
    cv.addEventListener('pointerup', birak);
    cv.addEventListener('pointercancel', function () { basili = false; });
  }

  function onizlemeHesapla() {
    if (fifaMod() || !d.aim) { d.onizleme = null; return; }
    var r = hesap({ pos: d.pos, aim: d.aim, contact: d.contact, falso: d.falso, zaman: cubukAktif() ? 0.5 : null, seed: 1, guc:d.guc,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman: true,falsoDenge:true,akilliFrikik:true,direkFizigi:true,kural10:d.mod!=="resmi" });
    d.onizleme = (!r.kaleci.onKarar&&(r.sonuc === 'baraj'||r.sonuc === 'kisa')) ? r.ucusYol.filter(function(o){return o.t <= r.olayT;}) : r.ucusYol;
  }

  function k10(){return d.mod!=='resmi';}
  function kartVeri() {
    var gol = d.sonuclar.filter(function (x) { return x.gol; }).length, n = d.sonuclar.length;
    return { oyuncu: d.karakter, mod: d.mod, puan: toplam(), ana: gol + '/' + n + ' gol', vuruslar: d.sonuclar.map(function (x) { return { gol: !!x.gol }; }) };
  }
  function seriYaz() {
    var k = $('seriKutu'); if (!k) return;
    var s = d.seriDurum ? d.seriDurum.seri : 0;
    k.hidden = !(s >= 2 && d.mod !== 'resmi'); if (!k.hidden) k.textContent = '🔥 ×' + (DT.bonus?DT.bonus.seriCarpan(s):1) + ' · ' + s + ' gol';
  }
  var toastKuyruk = [], toastAcik = false;
  function rozetBildir(idler) {
    if (!idler || !idler.length || !DT.rozet) return;
    DT.rozet.liste().forEach(function (r) { if (idler.indexOf(r.id) >= 0) toastKuyruk.push(r.ikon + ' Rozet: ' + r.ad); });
    toastSira();
  }
  function toastSira() {
    if (toastAcik || !toastKuyruk.length) return;
    var k = $('rozetToast'); if (!k) return;
    toastAcik = true; k.textContent = toastKuyruk.shift(); k.hidden = false;
    root.setTimeout(function () { k.hidden = true; toastAcik = false; toastSira(); }, 2800);
  }

  function vur() {
    if (d.faz !== 'nisan' || !d.aim || !d.kilit || !d.temasHazir) return;
    d.faz = 'vurus'; d.an = { t0: simdi(), windup: 0.85 };
    $('alt').hidden = true; $('ipucu').hidden = true;
    if (DT.ses) DT.ses.cal('vurus');
    titret([20, 40, 20]);
  }

  function sonucGoster(r) {
    d.faz = 'sonuc'; d.son = r;
    var gol = r.sonuc === 'gol';
    $('sonucBaslik').textContent = gol ? 'GOL' : r.sonuc === 'kurtaris' ? 'KURTARIŞ' : r.sonuc === 'direk' ? 'DİREK' : r.sonuc === 'baraj' ? 'BARAJ' : 'KAÇTI';
    $('sonucPuan').textContent = (r.puan > 0 ? '+' : '') + r.puan;
    $('sonucDetay').textContent = r.detay || '';
    $('sonucNeden').textContent = r.neden || '';
    $('sonucYorum').textContent = r.yorum || '';
    $('sonuc').hidden = false;
    if (gol) { if (DT.ses) DT.ses.cal('gol'); titret([30, 50, 30, 50, 80]); } else { if (DT.ses) DT.ses.cal('file'); }
    if (d.mod !== 'resmi' && DT.bonus) { d.seriDurum = DT.bonus.seriGuncelle(d.seriDurum, gol); seriYaz(); }
    if (DT.rozet) rozetBildir(DT.rozet.kontrol(d, r));
  }

  function devam() {
    d.idx++;
    if (d.idx >= turSayisi() || (d.mod === 'hayat' && d.hayatBitti)) { ekranGoster('tursonu'); turSonu(); return; }
    vurusHazirla(null);
  }

  function turSonu() {
    $('turBaslik').textContent = 'Tur bitti';
    $('turToplam').textContent = toplam();
    var liste = $('turListe'); liste.innerHTML = '';
    d.sonuclar.forEach(function (s, i) {
      var li = doc.createElement('li'); li.textContent = (i + 1) + '. ' + (s.gol ? 'GOL' : s.sonuc) + ' · ' + s.puan;
      liste.appendChild(li);
    });
    $('turNot').textContent = 'Skor kaydedildi.';
  }

  function baslat() {
    ayar = oku(ANAHTAR.ayar, ayar); ayarGuncelle();
    if (DT.ses) DT.ses.ayarla(ayar.ses);
    if (DT.tezahurat) DT.tezahurat.ayarla(ayar.ses);
    if (DT.muzik) DT.muzik.ayarla(ayar.ses);
    girisBagla();
    $('btnResmi').addEventListener('click', function () { secimGoster('resmi'); });
    $('btnAntrenman').addEventListener('click', function () { secimGoster('antrenman'); });
    $('btnHedef').addEventListener('click', function () { secimGoster('hedef'); });
    $('btnGunluk').addEventListener('click', function () { secimGoster('gunluk'); });
    $('btnHayat').addEventListener('click', function () { secimGoster('hayat'); });
    $('secimGeri').addEventListener('click', menuGoster);
    $('hudGeri').addEventListener('click', menuGoster);
    $('vurBtn').addEventListener('click', vur);
    $('devamBtn').addEventListener('click', devam);
    $('tekrarBtn').addEventListener('click', function () { vurusHazirla(null); });
    $('turTekrar').addEventListener('click', function () { turBaslat(d.karakter, d.mod, null); });
    $('turMenu').addEventListener('click', menuGoster);
    $('hudSes').addEventListener('click', sesDegistir);
    $('btnSes').addEventListener('click', sesDegistir);
    menuGoster();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', baslat); else baslat();
})(typeof globalThis !== 'undefined' ? globalThis : window);
