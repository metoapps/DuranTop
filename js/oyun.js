/* Duran Top - oyun akışı. Ekranlar, dokunmatik kontrol, vuruş animasyonu ve yerel kayıt.
 * Sonuç hesabı fizik.js'de; bu dosya yalnızca girdi toplar ve sonucu gösterir. */
(function (root) {
  'use strict';
  var DT = root.DT, A = DT.AYAR, doc = root.document;
  var $ = function (id) { return doc.getElementById(id); };
  var simdi = function () { return root.performance.now(); };

  var ANAHTAR = { ayar: 'dt_ayar', resmi: 'dt8_resmi', enIyi: 'dt8_en_iyi', gecmis: 'dt8_gecmis' };
  var VURUS_SAYISI = A.pozisyonlar.length;
  // Hedef ağı modu kendi pozisyonlarını kullanır (js/hedef.js); kupa ve antrenman eski 10 pozisyon.
  /* Modlar: resmi (kupa), antrenman, hedef ağı, GÜNLÜK (3 sabit vuruş) ve HAYATTA KAL (ilk kaçırışa kadar sonsuz). */
  function pozlar(){if(d.mod==='gunluk'&&d.gunPoz)return d.gunPoz;if(DT.hedef&&d.mod==='hedef')return DT.hedef.pozisyonlar;if(DT.hedef&&d.mod==='antrenman')return DT.hedef.antrenmanTuru;return A.pozisyonlar;}
  function turSayisi(){return d.mod==='hayat'?1e9:pozlar().length;}
  function yeniModMu(){return d.mod==='gunluk'||d.mod==='hayat';}
  function hesap(g){return g.pos&&g.pos.tip==='hedef'?DT.hedef.hesapla(g):DT.fizik.hesapla(g);}

  var ayar = { ses: false, cubuk: true, muzik: true, solEl: false, buyuk: false, hareketAz: false, titresim: true }, hareketKapatildi = false;
  /* Titreşim (yalnız destekleyen cihazlar: Android; iPhone Safari desteklemez). Vuruş, gol ve kaçan şutta kısa desenler. */
  function titret(kalip) { if (ayar.titresim && root.navigator && typeof root.navigator.vibrate === 'function') { try { root.navigator.vibrate(kalip); } catch (e) { /* desteklenmiyor */ } } }
  var d = {
    ekran: 'menu', mod: 'antrenman', karakter: 'meto', tur: '', idx: 0, sonuclar: [],
    pos: null, faz: 'bos', aim: null, kilit: false, duzeltHak: 1, falso: 0, seed: 1,
    contact: {x:0,y:0}, temasHazir: false, onizleme: null, barajGeo: null, cubukBasla: 0, an: null, son: null
  };

  /* ---------- yerel kayıt ---------- */
  function oku(k, varsayilan) { try { var v = root.localStorage.getItem(k); return v ? JSON.parse(v) : varsayilan; } catch (e) { return varsayilan; } }
  function yaz(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* kayıt yoksa oyun yine çalışır */ } }
  function sil(k) { try { root.localStorage.removeItem(k); } catch (e) { /* yok say */ } }

  /* ---------- ekranlar ---------- */
  var EKRANLAR = ['menu', 'secim', 'oyun', 'tursonu'];
  function ekranGoster(ad) {
    d.ekran = ad;
    EKRANLAR.forEach(function (e) { $(e).hidden = e !== ad; });
    if (DT.tezahurat) DT.tezahurat.ortam(ad === 'oyun');   // tribün uğultusu ve tezahürat yalnız oyun ekranında
    if (DT.muzik) DT.muzik.sahne(ad === 'oyun' ? 'mac' : 'menu');   // oyunda tempolu arka plan, menüde sakin parça
  }

  // Kupa sunucu tarafında kapatılabilir (DT_CUP_OPEN). Eski sunucu bu alanı göndermez: o zaman açık sayılır.
  function kupaKapali(){var st=DT.live&&DT.live.getState&&DT.live.getState();return !!(st&&st.kupaAcik===false);}
  /* Menüdeki alt satırlar: günlük durumu ve hayatta kal rekoru */
  function modDurumYaz() {
    if (!DT.modlar) return;
    var g = DT.modlar.gunNo(), du = DT.modlar.gunlukDurum(g), gd = $('gunlukDurum'), hd = $('hayatDurum'), hy = DT.modlar.hayatDurum();
    if (gd) gd.textContent = '#' + DT.modlar.gunSira(g) + ' · ' + (du.oynadi ? 'bugün ' + du.puan + ' puan' + (du.seri >= 2 ? ' · 🔥 ' + du.seri + ' gün' : '') : 'bugünkü ilk deneme sayılır' + (du.seri >= 1 ? ' · 🔥 ' + du.seri + ' gün seri' : ''));
    if (hd) hd.textContent = hy.rekor ? 'rekor ' + hy.rekor + ' gol' : 'ilk kaçırışa kadar vur';
  }
  function menuGoster() {
    if (DT.rozet && $('rozetListe')) DT.rozet.ciz($('rozetListe'), doc);
    $("temasPanel").hidden = true; kimlikGoster(); kupaGoster();
    d.faz = 'bos';
    ekranGoster('menu');
    var kayit = oku(ANAHTAR.resmi, null);
    var mine=DT.live&&DT.live.current&&DT.live.current();
    $('btnResmi').textContent = mine&&mine.idx>=VURUS_SAYISI?'Bu haftayı tamamladın':kayit||mine&&mine.idx>0?'Yarışmaya devam':'Kupaya katıl';
    if(kupaKapali()){$('btnResmi').textContent='Kupa kapalı';$('btnResmi').disabled=true;}
    $('btnSifirla').hidden = true;
    var en = oku(ANAHTAR.enIyi, null);
    $('menuNot').textContent = kupaKapali() ? 'Juninho Kupası şu an kapalı. Antrenmanda oynayabilirsin; puan tablosu duruyor.' : en ? 'Bu telefonda en iyi tur: ' + en + ' puan. Kupa sonuçları otomatik güncellenir.' : 'Canlı kupa: arkadaşlarının puanları otomatik güncellenir.';
    menuSahne();
  }

  /* menü arkasında boş bir sahne gösterilsin */
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
    [['btnSolEl', 'Sol el modu', 'solEl'], ['btnBuyuk', 'Büyük düğmeler', 'buyuk'], ['btnTitresim', 'Titreşim', 'titresim']].forEach(function (x) { var b = $(x[0]); if (b) { b.textContent = x[1] + ': ' + (ayar[x[2]] ? 'açık' : 'kapalı'); b.classList.toggle('acik', !!ayar[x[2]]); } });
    if ($('btnHareket')) { $('btnHareket').textContent = 'Hareket: ' + (ayar.hareketAz ? 'az (tribün ve bayraklar durgun)' : 'tam'); $('btnHareket').classList.toggle('acik', ayar.hareketAz); }
    if ($('oyun') && $('oyun').classList) { $('oyun').classList.toggle('sol-el', !!ayar.solEl); $('oyun').classList.toggle('buyuk', !!ayar.buyuk); }
    if (ayar.hareketAz) { A.hareket = false; hareketKapatildi = true; } else if (hareketKapatildi) { A.hareket = true; hareketKapatildi = false; }   // sistemin "hareketi azalt" ayarını yok sayarız; bu, oyun içi seçimdir
    $('hudSes').textContent = ayar.ses ? 'Ses açık' : 'Ses kapalı';
    $('btnCubuk').textContent = 'Antrenman çubuğu: ' + (ayar.cubuk ? 'açık' : 'kapalı');
    $('btnCubuk').classList.toggle('acik', ayar.cubuk);
    yaz(ANAHTAR.ayar, ayar);
  }
  function sesDegistir() { ayar.ses = !ayar.ses; DT.ses.ayarla(ayar.ses);if(DT.tezahurat)DT.tezahurat.ayarla(ayar.ses);if(DT.muzik)DT.muzik.ayarla(ayar.ses); ayarGuncelle(); if (ayar.ses) DT.ses.cal('islik'); }

  function cubukAktif() { return d.mod === 'resmi' || ayar.cubuk; }

  /* ---------- seçim ve tur ---------- */
  function secimGoster(mod) {
    var me=DT.live&&DT.live.identity&&DT.live.identity();if(!me){root.alert('Önce kendi oyuncuna giriş yap.');return;}
    d.mod = mod;
    ekranGoster('secim');
    $('secimNot').textContent = mod === 'resmi'
      ? 'Canlı kupa: karakterini seç. Skorun otomatik kaydedilir.'
      : mod === 'hayat' ? 'Hayatta kal: ilk kaçırışa kadar vur. Her golle rüzgâr ve kaleci sertleşir.' : mod === 'gunluk' ? 'Günün meydan okuması: herkese aynı 3 vuruş, aynı rüzgâr. İlk deneme kayda geçer.' : 'Antrenman: skora yazılmaz, kaleci daha yavaş.';
    var iz = $('secimIzgara'); iz.innerHTML = '';
    DT.KARAKTER.forEach(function (k) {
      var b = doc.createElement('button'); b.type = 'button'; b.className = 'secim-kart';
      b.innerHTML = '<img alt="" src="assets/menu/' + k.id + '_bekle.webp"><span>' + k.ad + '</span>';
      b.disabled = k.id!==me.player || (mod==='resmi'&&!DT.live.allowed(k.id));
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
    var me=DT.live&&DT.live.identity&&DT.live.identity();if(!me||me.player!==karakter){root.alert('Bu oyuncu sana ait değil.');return;}
    if (!DT.cizim.hazir() || turYukleniyor) return;
    if (DT.cizim.karakterHazir && !DT.cizim.karakterHazir(karakter)) {
      turYukleniyor=true;
      DT.cizim.karakterYukle(karakter).then(function(ok){turYukleniyor=false;if(ok)turBaslat(karakter,mod,kayit);});
      return;
    }
    d.karakter = karakter; d.mod = mod;
    if (mod === 'resmi' && DT.live && !(kayit && kayit.live)) {
      turYukleniyor=true;
      DT.live.join(karakter).then(function(member){turYukleniyor=false;var state=DT.live.getState();var saved=oku(ANAHTAR.resmi,null);turBaslat(karakter,mod,{live:true,tur:state.room.code,idx:member.idx,sonuclar:member.entries,karakter:karakter,acik:saved&&saved.tur===state.room.code&&saved.idx===member.idx&&saved.karakter===karakter?saved.acik:null});}).catch(function(e){turYukleniyor=false;root.alert(e.message);});return;
    }
    if (mod === 'resmi' && !DT.live && !kayit && kupaKayit()[karakter]) return;
    if (kayit) {
      d.tur = kayit.tur; d.idx = kayit.idx; d.sonuclar = (kayit.sonuclar || []).slice();
      if (d.idx >= turSayisi()) { d.pos = pozlar()[0]; ekranGoster('tursonu'); turSonu(); return; }
    } else {
      d.tur = mod === 'resmi' ? kupaKod : turKimligi(); d.idx = 0; d.sonuclar = [];
      if (mod === 'resmi') yaz(ANAHTAR.resmi, { tur: d.tur, karakter: karakter, idx: 0, sonuclar: [], acik: null });
    }
    ekranGoster('oyun');
    vurusHazirla(kayit && kayit.acik ? kayit.acik : null);
  }

  function toplam() { return d.sonuclar.reduce(function (t, s) { return t + s.puan; }, 0); }

  function panelKonumu(){var el=$('oyun');if(el&&el.classList&&el.classList.toggle)el.classList.toggle('secim-sag',d.durus<=-.5);}

  function vurusHazirla(acik) {
    if (DT.ses.sustur) DT.ses.sustur();   // önceki golün tribün uğultusu yeni pozisyona taşmasın
    var tAcilis = simdi();
    d.pos = d.mod === 'hayat' ? DT.modlar.hayatPoz(d.idx, d.hayatSeed, d.hayatGol, A.pozisyonlar, DT.hedef.pozisyonlar) : pozlar()[d.idx];
    DT.cizim.sahneKur(d.pos, 0);
    // baraj konumu nişandan bağımsız; önizleme hesabından alınır
    var ornek = hesap({ pos: d.pos, aim: { x: 0, y: 1.2 }, falso: 0, zaman: 0.5, seed: 1, antrenman: true, kural10: d.mod !== 'resmi' });   // önizleme barajı vuruştakiyle aynı kurulum
    d.barajGeo = ornek.baraj;
    if (DT.cizim.barajIsit) DT.cizim.barajIsit(d.barajGeo);   // baraj oyuncularının sprite'ları pozisyon açılırken hazırlanır
    d.faz = 'nisan'; d.aim = null; d.kilit = false; d.duzeltHak = 1; d.falso = 0; d.onizleme = null; d.an = null; d.son = null;
    d.seed = d.mod === 'gunluk' ? DT.modlar.gunSeed(d.gun, d.idx) : (Math.random() * 2147483647) | 0;   // günlük: herkes için aynı tohum (kaleci kararı, rüzgâr, altın bölge)   // resmi turda gerçek tohumu sunucu üretir ve vuruştan sonra gönderir; bu değer yalnızca antrenman/önizleme içindir
    d.ruzgar = (d.mod !== 'resmi' && A.ruzgar && A.ruzgar.acik !== false && DT.ruzgar) ? DT.ruzgar.uret(d.seed ^ 0x9e37) : null;
    if (d.ruzgar && d.mod === 'hayat') d.ruzgar = DT.ruzgar.olcekle(d.ruzgar, DT.modlar.hayatZorluk(d.hayatGol).ruzgarOlcek);   // hayatta kal: rüzgâr zorlaşır
    d.altin = (d.mod !== 'resmi' && d.pos.tip !== 'hedef' && DT.bonus) ? DT.bonus.altinUret(d.seed ^ 0x51ed) : null;   // altın bölge: yalnız antrenman penaltı/frikik
    d.contact = {x:0,y:0}; d.temasHazir = false;d.guc=1;d.gucHazir=false;d.durus=0;d.kamDurus=0;d.donus=0;d.donusSon=null;d.yurume=null;d.durusHazir=true;d.alayT0=null;d.konfetiT0=null;d.tekrar=null;panelKonumu();
    $('gucPanel').hidden=true;$('gucSec').value=100;$('gucNot').textContent='%100 · Tam güç';$('fifaNisan').hidden=true;$('fifaKutu').hidden=true;d.fifa={faz:null};d.nisanHiz=null;$('temasPanel').hidden = true;
    $('vurBtn').disabled=false;$('vurBtn').textContent='VUR';$('ucusDurum').textContent='';
    $('sonuc').hidden = true; $('alt').hidden = true;
    $('hudVurus').textContent = d.mod === 'hayat' ? 'Seri ' + d.hayatGol + ' · Rekor ' + Math.max(DT.modlar.hayatDurum().rekor, d.hayatGol) : d.mod === 'gunluk' ? 'Günlük #' + DT.modlar.gunSira(d.gun) + ' · ' + (d.idx + 1) + '/3' : 'Vuruş ' + (d.idx + 1) + '/' + turSayisi();
    $('hudTip').textContent = d.pos.ad + (d.mod === 'antrenman' ? ' · antrenman' : '');
    $('hudPuan').textContent = toplam();
    $('falsoKutu').hidden = true;
    falsoSec(0);
    $('ipucu').hidden = false;
    $('ipucu').textContent = d.pos.tip === 'hedef' ? 'Bir deliğe dokun, sürükle, bırak. Top deliğin içinden tam geçmeli.' : d.pos.tip === 'frikik'
      ? 'Barajın üstünden ya da yanından geçecek yere dokun, sürükle, bırak.'
      : 'Kaleye dokun, parmağını sürükle, bırak. Nişan kilitlenir.';
    if(!acik)DT.ses.cal('islik');   // hakem düdüğü: pozisyon hazır; sayfa yenilenip devam eden vuruşta çalmaz
    if (acik) {   // sayfa yenilendi: aynı vuruş kaldığı yerden devam eder
      d.seed = acik.seed; d.altin = (d.mod !== 'resmi' && d.pos.tip !== 'hedef' && DT.bonus) ? DT.bonus.altinUret(d.seed ^ 0x51ed) : null; d.ruzgar = (d.mod !== 'resmi' && A.ruzgar && A.ruzgar.acik !== false && DT.ruzgar) ? DT.ruzgar.uret(d.seed ^ 0x9e37) : null; d.aim = acik.aim; d.duzeltHak = acik.duzeltHak;
      d.contact = acik.contact || {x:0,y:0}; d.temasHazir = !!acik.temasHazir;d.guc=acik.guc===undefined?1:acik.guc;d.gucHazir=!!acik.gucHazir;d.durus=acik.durus||0;DT.cizim.kameraDurus(d.durus);panelKonumu();$('gucSec').value=Math.round(d.guc*100);
      falsoSec(acik.falso || 0);
      kilitle(true);
    } else { gucVeyaNisan(); }
    if (DT.perf) DT.perf.olay('pozisyon açılışı', simdi() - tAcilis);   // önizleme hesabı, baraj sprite üretimi, kamera: ilk karedeki takılmanın kaynağı
  }

  /* ---------- nişan ---------- */
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
      basili = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* yok say */ }
      nisanGuncelle(e);
    });
    cv.addEventListener('pointermove', function (e) { if (basili && d.faz === 'nisan' && !d.kilit) nisanGuncelle(e); });
    function birak() { if (!basili) return; basili = false; }
    cv.addEventListener('pointerup', birak);
    cv.addEventListener('pointercancel', function () { basili = false; });
  }

  function onizlemeHesapla() {
    // FIFA akışında kesik çizgili tahmini uçuş yok (yer oku ayrı hesaplanır): bu pahalı tam hesap (parmak hareketi başına ≈14 ms, telefonda daha fazla) boşuna çalışmasın.
    if (fifaMod() || !d.aim) { d.onizleme = null; return; }
    var r = hesap({ pos: d.pos, aim: d.aim, contact: d.contact, falso: d.falso, zaman: cubukAktif() ? 0.5 : null, seed: 1, guc:d.guc,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman: true,kural10:d.mod!=="resmi" });
    d.onizleme = (!r.kaleci.onKarar&&(r.sonuc === 'baraj'||r.sonuc === 'kisa')) ? r.ucusYol.filter(function(o){return o.t <= r.olayT;}) : r.ucusYol;
  }

  function k10(){return d.mod!=='resmi';}
  /* Tur sonu paylaşım kartı için veri */
  function kartVeri() {
    var gol = d.sonuclar.filter(function (x) { return x.gol; }).length, n = d.sonuclar.length, mod = d.mod;
    var etiket = mod === 'gunluk' ? 'Günlük #' + DT.modlar.gunSira(d.gun) : mod === 'hayat' ? 'Hayatta kal' : mod === 'hedef' ? 'Hedef ağı' : mod === 'resmi' ? 'Juninho Kupası' : 'Antrenman';
    var ana = mod === 'hayat' ? d.hayatGol + ' gol üst üste' : mod === 'hedef' ? gol + '/' + n + ' delik' : gol + '/' + n + ' gol';
    var tarih = ''; try { tarih = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { tarih = ''; }
    return { oyuncu: d.karakter, mod: etiket, puan: toplam(), ana: ana, vuruslar: d.sonuclar.map(function (x) { return { gol: !!x.gol }; }), enSert: d.turEnSert || 0, rozetler: d.turRozetler || [], rekor: !!d.turRekor, tarih: tarih, alt: mod === 'gunluk' ? 'Aynı 3 vuruş, aynı rüzgâr. Sen kaç yaparsın?' : mod === 'hayat' ? 'Bakalım sen kaç atarsın?' : 'Sen kaç yaparsın?' };
  }
  /* Seri göstergesi ve rozet bildirimi (yalnız antrenman/hedef). */
  function seriYaz() {
    var k = $('seriKutu'); if (!k) return;
    var s = d.seriDurum ? d.seriDurum.seri : 0;
    k.hidden = !(s >= 2 && d.mod !== 'resmi'); if (!k.hidden) k.textContent = '🔥 ×' + DT.bonus.seriCarpan(s) + ' · ' + s + ' gol';
  }
  var toastKuyruk = [], toastAcik = false;
  function rozetBildir(idler) {
    if (!idler || !idler.length || !DT.rozet) return;
    DT.rozet.liste().forEach(function (r) { if (idler.indexOf(r.id) >= 0) { toastKuyruk.push(r.ikon + ' Rozet: ' + r.ad); (d.turRozetler = d.turRozetler || []).push(r.ad); } });
    toastSira();
  }
  function toastSira() {
    if (toastAcik || !toastKuyruk.length) return;
    var k = $('rozetToast'); if (!k) { toastKuyruk.length = 0; return; }
    toastAcik = true; k.textContent = toastKuyruk.shift(); k.hidden = false; if (DT.muzik) DT.muzik.efekt('rozet');
    root.setTimeout(function () { k.hidden = true; toastAcik = false; toastSira(); }, 2600);
  }
  /* Rüzgâr: antrenman/hedef ağında her vuruşa tohumdan (d.seed) üretilir; kupada yok. Ekranda yalnız ok + hız. */
  function ruzgarDizi() { return d.ruzgar ? [d.ruzgar.vx, d.ruzgar.vz] : undefined; }
  function ruzgarYaz() {
    var kutu = $('ruzgarKutu'); if (!kutu) return;
    var goster = !!d.ruzgar && d.ekran === 'oyun' && (d.faz === 'nisan' || d.faz === 'vurus');
    kutu.hidden = !goster; if (!goster) return;
    $('ruzgarYaz').textContent = d.ruzgar.hiz.toFixed(1);
    var sev = DT.ruzgar.seviye(d.ruzgar);
    $('ruzgarOk').style.transform = 'rotate(' + (DT.ruzgar.okAcisi(d.ruzgar) - 90) + 'deg) scale(' + (0.85 + Math.min(1, d.ruzgar.hiz / 6.5) * 0.4).toFixed(2) + ')';   // ok hızla büyür
    if ($('ruzgarSev')) $('ruzgarSev').textContent = sev === 'sert' ? 'SERT' : sev === 'orta' ? 'ORTA' : 'DURGUN';
    kutu.className = 'ruzgar-kutu ' + sev;
  }
  /* Nişan sınırı: kupada ±4,5 m (eski), antrenman/hedefte ±9 m: direğin dışına nişan alıp falsoyla uzak köşeye sokmak için (falso 28 m'de topu ≈6 m saptırır). */
  function aimXMax(){return k10()?9:4.5;}
  function bantGuncelle(){var bant=DT.zamanBandi(d.aim,d.guc,k10());$('cubukBant').style.left=((.5-bant)*100)+'%';$('cubukBant').style.width=(bant*200)+'%';
    $('cubukYazi').textContent='%'+Math.round(d.guc*100)+' güç · '+(d.guc>=.9?'Sert vuruş: dar yeşil, hatada daha fazla sapma':d.guc<=.7?'Kontrollü vuruş: daha geniş yeşil, kaleciye daha fazla süre':'Güç arttıkça isabet zorlaşır')+(DT.koseBandi(d.aim)<A.zaman.bant*.85?' · Hassas köşe: bant daha dar':'');
  }
  function kilitle(yenilenmis) {
    bantGuncelle();
    d.kilit = true;
    onizlemeHesapla();
    $('ipucu').hidden = true;
    $('alt').hidden = !d.temasHazir||!d.gucHazir;
    $('gucPanel').hidden=d.gucHazir;
    $('temasPanel').hidden = !d.gucHazir||d.temasHazir; temasCiz();
    $('cubukKutu').hidden = !cubukAktif()||fifaMod();
    $('fifaNisan').hidden = true; $('fifaKutu').hidden = !fifaMod(); d.fifa = { faz: null }; $('vurBtn').classList.toggle('fifa', fifaMod()); fifaYaz();
    $('duzeltBtn').textContent = 'Nişanı değiştir (' + d.duzeltHak + ')';
    $('duzeltBtn').disabled = d.duzeltHak <= 0;
    d.cubukBasla = simdi();
    if (!yenilenmis) titret(12);   // basış titreşimi (ayardan kapatılabilir)
    acikKaydet();
  }
  function acikKaydet() {
    if (d.mod !== 'resmi') return;
    var k = oku(ANAHTAR.resmi, null);
    if (!k) return;
    k.acik = d.kilit ? { aim: d.aim, falso: d.falso, seed: d.seed, duzeltHak: d.duzeltHak, contact: d.contact, temasHazir: d.temasHazir,guc:d.guc,gucHazir:d.gucHazir,durus:d.durus } : null;
    yaz(ANAHTAR.resmi, k);
  }
  function duzelt() {
    if (!d.kilit || d.duzeltHak <= 0 || d.faz !== 'nisan') return;
    d.duzeltHak--; d.kilit = false; d.temasHazir = false;$('gucPanel').hidden=true; $('temasPanel').hidden = true;
    $('alt').hidden = true; $('ipucu').hidden = false;
    $('ipucu').textContent = 'Yeniden dokun, sürükle, bırak. Bu son düzeltme.';
    if (fifaMod()) { $('ipucu').hidden = true; $('fifaNisan').hidden = false; d.fifa = { faz: null }; }
    acikKaydet();
  }
  function falsoSec(v) {
    d.falso = v;
    Array.prototype.forEach.call(doc.querySelectorAll('#falsoKutu button'), function (b) {
      b.classList.toggle('secili', Number(b.getAttribute('data-falso')) === v);
    });
    if (d.kilit) { onizlemeHesapla(); acikKaydet(); }
  }

  /* zamanlama çubuğu: üçgen dalga, 0..1 */
  function cubukDegeri(now) {
    var s = A.zamanCubuguSuresi * 1000, ph = ((now - d.cubukBasla) / s) % 2;
    return ph < 1 ? ph : 2 - ph;
  }

  /* ---------- vuruş ---------- */
  var gecerliSonuc = null;
  function vur(zamanVerilen) {
    if (d.guncelle) { root.location.reload(); return; }   // sunucu bu istemci sürümünü reddetti (CLIENT_VERSION): yenile
    if (d.faz !== 'nisan' || !d.kilit || !d.temasHazir || !d.gucHazir || !d.durusHazir || !DT.cizim.hazir()) return;
    var now = simdi();
    var zaman = typeof zamanVerilen === 'number' ? zamanVerilen : (zamanVerilen === null ? null : (cubukAktif() ? cubukDegeri(now) : null));
    if (fifaMod() && !(d.fifa && d.fifa.atis)) return;   // FIFA frikikte yalnız sayaç vurdurur
    d.fifa = { faz: null };
    var girdi = { pos: d.pos, aim: d.aim, contact: d.contact, falso: d.falso, zaman: zaman, seed: d.seed,guc:d.guc,durus:d.durus,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman: d.mod === 'antrenman',kural10:d.mod!=='resmi',ruzgar:ruzgarDizi(),seviye:d.mod==='hayat'?DT.modlar.hayatZorluk(d.hayatGol).seviye:undefined };
    if(d.mod==='resmi' && DT.live){
      var requestIdx=d.idx,requestPlayer=d.karakter,requestRoom=DT.live.getState().room.id;
      d.faz='gonderiliyor';$('vurBtn').disabled=true;$('vurBtn').textContent='Kaydediliyor…';
      DT.live.shot(d.karakter,d.idx,girdi).then(function(entry){
        if(d.ekran!=='oyun'||d.idx!==requestIdx||d.karakter!==requestPlayer||DT.live.getState().room.id!==requestRoom)return;
        $('vurBtn').disabled=false;$('vurBtn').textContent='VUR';
        var actual=entry.input;girdi.aim=actual.aim;girdi.contact=actual.contact;girdi.zaman=actual.zaman;girdi.seed=actual.seed;girdi.guc=actual.guc===undefined?1:actual.guc;girdi.durus=actual.durus||0;girdi.gucZorlugu=actual.rules>=2;girdi.temasFizigi=actual.rules>=3;girdi.sabitKol=actual.rules>=4;girdi.enerjiFizigi=actual.rules>=5;girdi.takipFizigi=actual.rules>=6;girdi.yerTakibi=actual.rules>=7;girdi.golGeometrisi=actual.rules>=8;girdi.penaltiTahmin=actual.rules>=9;
        vurusUygula(girdi,entry);
      }).catch(function(e){if(e&&e.code==='CLOSED'){root.alert(e.message);menuGoster();return;}d.faz='nisan';$('vurBtn').disabled=false;if(e&&e.code==='CLIENT_VERSION'){d.guncelle=true;$('vurBtn').textContent='Oyunu güncelle';$('ucusDurum').textContent=e.message;return;}$('vurBtn').textContent='Yeniden bağlan';$('ucusDurum').textContent=e.message+' Aynı vuruşla tekrar dene.';});return;
    }
    vurusUygula(girdi,null);
  }
  function vurusUygula(girdi,serverEntry){
    var now=simdi();
    var tHesap = simdi(), r = hesap(girdi);
    if (DT.perf) DT.perf.olay('vuruş hesabı', simdi() - tHesap);
    var p = d.pos.tip==='hedef' ? DT.hedef.puanla(r) : DT.puan.puanla(d.pos.tip, r);
    if (!serverEntry && d.mod !== 'resmi' && DT.bonus && d.seriDurum) p = DT.bonus.uygula(p, { gol: p.gol, x: r.gecis && r.gecis.x, y: r.gecis && r.gecis.y }, d.seriDurum, d.pos.tip === 'hedef' ? null : d.altin);   // altın bölge + seri çarpanı (kupada yok)
    if(serverEntry&&(serverEntry.sonuc!==r.sonuc||serverEntry.puan!==p.puan||serverEntry.gol!==p.gol)){var mismatch=new Error('Sonuç hesabının sürümü uyuşmuyor. Vuruşun kaydedildi; oyunu güncelle.');mismatch.code='CLIENT_VERSION';throw mismatch;}
    var giris = { yesil:r.bandaGirdi, quality: r.quality, speed: r.speed, ad: d.pos.ad, sonuc: r.sonuc, puan: p.puan, zaman: p.zaman, zor: p.zor, taban: p.taban, gol: p.gol };
    if (p.altin) giris.altin = p.altin; if (p.seriEk) giris.seriEk = p.seriEk;
    if(serverEntry)giris=serverEntry;
    gecerliSonuc = { girdi: girdi, r: r, p: p, giris: giris };
    d.sevincVaryant=p.gol&&DT.sevinc?DT.sevinc.next(d.karakter):0;
    d.faz = 'vurus';
    var netPoint=r.yol.find(function(p){return p.z>=d.pos.D+1.45||(p.z>d.pos.D+.11&&Math.abs(p.x)>A.kale.genislik/2-.12);});
    // A resolved post miss must not wait for the rolling ball's entire path.
    // Keep the authoritative trajectory/result; this is only presentation timing.
    var lastT=r.yol[r.yol.length-1].t,postMiss=r.sonuc==='direk_disari'&&r.direkTemas;
    d.an = { t0: now, on: (A.kosuSure&&A.kosuSure[d.pos.tip])||.85, vurdu: false, olay: false, olayT:postMiss?r.direkTemas.t:r.olayT,
      sonucT:postMiss?Math.min(lastT+.3,r.direkTemas.t+1.4):lastT+.3,
      file:false, fileT:r.fileT===undefined?(netPoint?netPoint.t:Infinity):(r.fileT===null?Infinity:r.fileT), bitti: false };
    d.an.yavas = yavasPlan(r, d.an.olayT);
    $('alt').hidden = true;
    if (d.mod === 'resmi') {          // vuruş açıldığı anda sayılır; yenileme ya da kopma sonucu değiştirmez
      var k = oku(ANAHTAR.resmi, null);
      if (k) { k.sonuclar = (k.sonuclar || []).concat([giris]); k.idx = d.idx + 1; k.acik = null; yaz(ANAHTAR.resmi, k); }
    }
  }

  function yolOrnek(yol, t) {
    var dt = 1 / 120, i = Math.min(yol.length - 1, Math.max(0, Math.floor(t / dt)));
    while (i > 0 && yol[i].t > t) i--;
    while (i < yol.length - 1 && yol[i + 1].t <= t) i++;
    var a = yol[i], b = yol[Math.min(i + 1, yol.length - 1)];
    var f = b.t > a.t ? Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))) : 0;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f };
  }

  /* Gol sayılan sonuçlar: serbest vuruş/penaltıda gol ve direkten gol, hedef ağında delikten geçen top ('delik'). Tepkiler (sevinç, tribün, ağ sesi, flaş) hepsi için aynıdır. */
  function golMu(r) { return r.sonuc === 'gol' || r.sonuc === 'direk_gol' || r.sonuc === 'delik'; }
  var SONUC_SES = { gol: null, direk_gol: 'direk', direk_disari: 'direk', kurtaris: 'kurtaris', baraj: 'baraj', aut: null };

  /* Yavaş çekim: gol, kurtarış ve direkten dönüşte olaydan A.yavasCekim.once sn önce başlar, .sonra sn sonra biter (sim zamanında), hız .hiz kat.
   * Dünya zamanı (top, kaleci, şutçu, sesler, olaylar) aynı haritadan geçer; yalnız gerçek zaman uzar. Kaçan şutlarda (aut, kısa, baraj) yok. */
  function yavasPlan(r, olayT) {
    var Y = A.yavasCekim; if (!Y || Y.acik === false) return null;
    var tur = r.sonuc; if (!(tur === 'gol' || tur === 'direk_gol' || tur === 'kurtaris' || tur === 'direk_disari' || (d.pos && d.pos.tip === 'hedef' && r.delik))) return null;
    return { a: Math.max(0, olayT - Y.once), b: olayT + Y.sonra, k: Y.hiz };
  }
  function simSure(e, y) {   // temastan beri gerçek süre → simülasyon süresi
    if (!y || e <= y.a) return e;
    var pencere = (y.b - y.a) / y.k;
    if (e < y.a + pencere) return y.a + (e - y.a) * y.k;
    return y.b + (e - y.a - pencere);
  }
  /* Tekrar: sonuç kartındaki "Tekrar" düğmesi atışı yeniden oynatır: koşunun son anı, vuruş ve sonuç yarı hızda; kamera (cizim.js zoom) topu izler.
   * Sonucu, puanı ve kayıtları etkilemez; ekrana dokunmak ya da süre dolması tekrarı bitirir. Tezahürat/alay tekrarlanmaz. */
  function tekrarBaslat() {
    if (d.faz !== 'sonuc' || !gecerliSonuc || !d.an || d.tekrar) return;
    d.tekrar = { t0: simdi(), sim: (A.tekrar || {}).baslangic || -0.55, vurdu: false, olay: false, file: false, direk: false };
    $('sonuc').hidden = true; if ($('tekrarEtiket')) $('tekrarEtiket').hidden = false;
    if (DT.ag && d.pos) DT.ag.sifirla(d.pos);   // ağ durgun başlar
  }
  function tekrarBitir() {
    if (!d.tekrar) return;
    d.tekrar = null; if ($('tekrarEtiket')) $('tekrarEtiket').hidden = true; if (d.faz === 'sonuc') $('sonuc').hidden = false;
  }
  function tekrarKare(out, now) {
    var T = d.tekrar, H = A.tekrar || {}, r = gecerliSonuc.r, an = d.an, on = an.on, sim = (H.baslangic === undefined ? -0.55 : H.baslangic) + (now - T.t0) / 1000 * (H.hiz || 0.5);
    if (sim >= r.olayT + (H.sonra === undefined ? 1.0 : H.sonra)) { tekrarBitir(); return false; }
    T.sim = sim;
    var oyuncu = out.oyuncu; oyuncu.sure = on + sim; oyuncu.on = on; oyuncu.ilerleme = Math.max(0, Math.min(1, (on + sim) / (on + 0.40))); oyuncu.temas = on / (on + 0.40);
    oyuncu.yol = r.yol; oyuncu.guide = r.ucusYol; oyuncu.contact = r.contact || null; oyuncu.poz = sim < 0 ? 'vurus1' : (sim < 0.10 ? 'vurus2' : 'vurus3');
    out.zaman = Math.max(0, sim);
    if (r.kaleci.onKarar) out.kaleci = r.kaleci.cizimKonum(sim);
    if (sim > 0) {
      if (!T.vurdu) { T.vurdu = true; if (H.ses !== false) DT.ses.cal('vurus'); }
      var sonT = r.yol[r.yol.length - 1].t, tt = Math.min(sim, sonT);
      out.top = yolOrnek(r.yol, tt); out.topAci = sim * ((r.spin && (r.spin[1] - 0.5 * r.spin[0])) || 0);
      if (sim < 1.6) out.hizBalon = { km: Math.round(r.speed * 3.6), t: sim };
      out.kaleci = (!r.kaleci.onKarar && (r.sonuc === 'baraj' || r.sonuc === 'kisa')) ? { x: 0, y: 1, poz: 'bekle', yon: 0, ilerleme: 0 } : r.kaleci.cizimKonum(sim, r.olayT);
      var olayT = an.olayT;
      if (r.direkTemas && !T.direk && sim >= r.direkTemas.t) { T.direk = true; if (H.ses !== false) DT.ses.cal('direk', { hiz: r.speed }); }
      if (!T.file && golMu(r) && sim >= an.fileT) { T.file = true; if (H.ses !== false) DT.ses.cal('file', { hiz: r.speed }); }
      if (sim >= olayT) { out.kaleci.saved = r.tuttu; if (!T.olay) { T.olay = true; var ses = SONUC_SES[r.sonuc]; if (H.ses !== false && ses && !(T.direk && ses === 'direk')) DT.ses.cal(ses, { hiz: r.speed }); } }
    }
    var rel = Math.max(0, sim - (H.baslangic === undefined ? -0.55 : H.baslangic)), girdi = Math.min(1, rel / 0.6), cikis = Math.min(1, (r.olayT + (H.sonra === undefined ? 1.0 : H.sonra) - sim) / 0.5);   // yakınlaşma içeri ve dışarı yumuşak
    out.zoom = { s: 1 + ((H.zum || 1.5) - 1) * (girdi * girdi * (3 - 2 * girdi)) * Math.max(0, Math.min(1, cikis)), ilk: rel < 0.05 };
    out.heyecan = golMu(r) && sim >= an.olayT ? 1 : 0.35;
    return true;
  }
  function cizimDurumu(now) {
    yonIlerle(now); nisanIlerle(now); ruzgarYaz();
    var R = A.kale.topYaricap, pos = d.pos;
    var B = { x: pos.bx, y: R, z: 0 };
    var out = {
      zaman:0,top: B, topAci: 0, baraj: d.barajGeo,
      kaleci: { x: Math.sin(now / 700) * 0.08, y: A.kaleci.baslangicY, ilerleme: 0, yon: 0, poz: 'bekle',gesture:now/1000 },
      oyuncu: { durus:d.durus,donus:d.donus?d.donusFaz:null,yurume:d.yurume?{from:d.yurume.from,to:d.durus,u:Math.max(0,Math.min(1,(now-d.yurume.t0)/1100))}:null,karakter: d.karakter, poz: 'vurus1', guide:d.onizleme, aim: d.aim, falso: d.falso, ilerleme: 0 }
    };
    if (d.faz === 'nisan') {
      if (d.aim) out.nisan = { aim: d.aim, kilit: d.kilit, onizleme: (d.temasHazir&&!fifaMod())?d.onizleme:null, fifa: fifaMod(), fifaYol: fifaMod()?fifaOnizleme(now):null };
    } else if (d.faz === 'vurus' && d.an) {
      var r = gecerliSonuc.r, an = d.an, el = (now - an.t0) / 1000, simT = el < an.on ? el - an.on : simSure(el - an.on, an.yavas); an.simT = simT;
      out.oyuncu.ilerleme = Math.max(0, Math.min(1, el / (an.on + 0.40)));
      out.oyuncu.sure=el < an.on ? el : an.on + simT;out.oyuncu.on=an.on;   // şutçunun vuruş sonrası hareketi de yavaş çekimde
      out.oyuncu.temas = an.on / (an.on + 0.40);
      out.oyuncu.yol = r.yol; out.oyuncu.guide=r.ucusYol;out.oyuncu.contact=r.contact||null;
      out.oyuncu.poz = el < an.on ? 'vurus1' : (el < an.on + 0.10 ? 'vurus2' : 'vurus3');
      if(r.kaleci.onKarar)out.kaleci=r.kaleci.cizimKonum(simT);
      if (simT > 0) {
        if (!an.vurdu) { an.vurdu = true; DT.ses.cal('vurus'); titret(14); if (DT.muzik) DT.muzik.kis(2.4, 0.4); }
        out.zaman=simT;var sonT = r.yol[r.yol.length - 1].t, tt = Math.min(simT, sonT);
        if (simT < 1.6) out.hizBalon = { km: Math.round(r.speed * 3.6), t: simT };   // vuruş hızı balonu
        out.top = yolOrnek(r.yol, tt); out.topAci = simT * ((r.spin && (r.spin[1] - .5*r.spin[0])) || 0);
        out.kaleci = (!r.kaleci.onKarar&&(r.sonuc === 'baraj'||r.sonuc === 'kisa')) ? {x:0,y:1,poz:'bekle',yon:0,ilerleme:0} : r.kaleci.cizimKonum(simT,r.olayT);
        var se = simT - an.olayT;
        if(r.direkTemas&&!an.direk&&simT>=r.direkTemas.t){an.direk=true;DT.ses.cal('direk',{hiz:r.speed});if(r.sonuc==='direk_disari'&&DT.tezahurat)an.uh=DT.tezahurat.uh();}   // direkten döndü: toplu "ahhh"
        if(!an.file&&golMu(r)&&simT>=an.fileT){an.file=true;DT.ses.cal('file',{hiz:r.speed});}
        if(se >= 0){out.kaleci.saved = r.tuttu;}
        if (se >= 0) {
          if (!an.olay) {
            an.olay = true;
            var ses = SONUC_SES[r.sonuc]; if (ses && !(an.direk&&ses==='direk')) DT.ses.cal(ses,{hiz:r.speed});
            if (golMu(r)) { DT.ses.cal('gol'); titret([40, 50, 40, 50, 90]); if (DT.muzik) { DT.muzik.efekt('gol'); DT.muzik.kis(3.4, 0.35); } d.konfetiT0 = now; d.alayT0 = now; d.alayTur = 'gol'; d.alayTohum = (Math.floor(now) ^ (d.idx || 0)) & 0xffff;
              var pp = gecerliSonuc.p || {}, gx = r.gecis ? r.gecis.x : 0, gy = r.gecis ? r.gecis.y : 1;   // bağlama uygun tezahürat: altın bölge, direk, falso, köşe, sert şut, uzak, seri, penaltı
              d.golCtx = { altin: !!pp.altin, direk: r.sonuc === 'direk_gol', falso: r.spinRps > 1, kose: Math.abs(gx) >= 2.6 && (gy >= 1.6 || gy <= 0.8), sert: r.speed * 3.6 >= 108, uzak: /Uzak/.test(d.pos.ad), seri: pp.seri || 0, tip: d.pos.tip };
              if (DT.tezahurat && DT.tezahurat.golSes) DT.tezahurat.golSes(d.alayTohum, d.golCtx); }   // gol: tribün bağırır (balonlar + ses)
            if (r.sonuc === 'direk_disari') titret([30, 40, 30]);
            if (!(golMu(r) || r.sonuc === 'direk_disari')) { var alayCaldi = DT.tezahurat && DT.tezahurat.alay(); titret([80]); if (DT.muzik) { DT.muzik.efekt('kacti'); DT.muzik.kis(1.6, 0.5); } d.alayT0 = now; d.alayTur = r.sonuc; d.alayTohum = (Math.floor(now) ^ (d.idx || 0)) & 0xffff; if (r.sonuc !== 'aut' && !alayCaldi) DT.ses.cal('ah'); }   // kaçan şut: tribün alay eder (ses + balonlar)
            else if (r.sonuc === 'direk_disari' && !an.uh) DT.ses.cal('ah');
          }
          if (se < 0.3 && r.sonuc !== 'aut') out.sarsinti = 7 * (1 - se / 0.3);
          if (golMu(r) && se < 0.4) out.flas = 0.3 * (1 - se / 0.4);
        }
        if (simT >= an.sonucT && !an.bitti) { an.bitti = true; d.son = { top: out.top, kaleci: out.kaleci, zaman:simT }; sonucGoster(); }
      }
    } else if (d.faz === 'sonuc' && d.tekrar && gecerliSonuc && tekrarKare(out, now)) {
      // tekrar: tekrarKare doldurdu
    } else if (d.faz === 'sonuc' && d.son) {
      out.zaman=d.son.zaman+(now-d.sonucBasla)/1000;out.top=gecerliSonuc.r.sonuc==='direk_disari'?yolOrnek(gecerliSonuc.r.yol,out.zaman):d.son.top;out.kaleci=(!gecerliSonuc.r.kaleci.onKarar&&(gecerliSonuc.r.sonuc==='baraj'||gecerliSonuc.r.sonuc==='kisa'))?d.son.kaleci:gecerliSonuc.r.kaleci.cizimKonum(out.zaman);out.kaleci.saved=gecerliSonuc.r.tuttu;
      var gol = golMu(gecerliSonuc.r);
      out.oyuncu = null;
      out.onKarakter = { karakter: d.karakter, poz: gol ? 'sevinc' : 'kacirma', sure: (now - d.sonucBasla) / 1000, gol: gol, sevinc:d.sevincVaryant||0 };
    }
    if(d.pos&&d.pos.tip==='hedef'&&gecerliSonuc&&gecerliSonuc.r.delik&&(d.faz==='sonuc'||d.faz==='vurus'&&d.an&&(d.an.simT===undefined?(now-d.an.t0)/1000-d.an.on:d.an.simT)>=gecerliSonuc.r.olayT))out.hedefVurulan=gecerliSonuc.r.delik.i;
    if(d.pos&&d.pos.tip==='hedef'&&d.aim&&DT.hedef&&d.faz==='nisan'){var yb=-1,yd=1e9;DT.hedef.delikler.forEach(function(h,i){var u=Math.hypot(d.aim.x-h.x,d.aim.y-h.y);if(u<yd){yd=u;yb=i;}});out.hedefSecili=yb;}   // oka en yakın delik sarı yanar
    // Görsel kaleci (kaleci3d): vuruşa göre zaman ve penaltı öncesi hareketin sönümü. Sonuç hesabına girmez.
    if(out.kaleci&&(d.faz==='vurus'&&d.an||d.faz==='sonuc')){var gk=d.faz==='vurus'?(now-d.an.t0)/1000:99,gs=d.faz==='vurus'?(d.an.simT===undefined?gk-d.an.on:d.an.simT):(d.tekrar?d.tekrar.sim:99);
      out.kaleci=Object.assign({},out.kaleci,{vurusT:gs,gesture:(d.faz==='vurus'&&gk<d.an.on-.1)?now/1000:undefined,gestureW:d.faz==='vurus'?Math.max(0,Math.min(1,(d.an.on-.1-gk)/.45)):0});}   // kaleci rutini koşu boyunca sürer, temastan hemen önce söner
    out.konfeti = (d.konfetiT0 && now - d.konfetiT0 < 4500) ? { t: (now - d.konfetiT0) / 1000, tohum: d.alayTohum || 1 } : null; out.ruzgar = d.ruzgar ? [d.ruzgar.vx, d.ruzgar.vz] : null; out.altin = (d.altin && (d.faz === 'nisan' || d.faz === 'vurus')) ? d.altin : null; out.alay = d.alayT0 ? (now - d.alayT0) / 1000 : -1; out.alayTur = d.alayTur; out.alayTohum = d.alayTohum || 0; out.alayCtx = d.golCtx || null;
    out.heyecan = (d.alayTur === 'gol' && d.alayT0) ? 1 : d.faz === 'sonuc' && gecerliSonuc ? (gecerliSonuc.p && gecerliSonuc.p.gol ? 1 : 0.15) : d.faz === 'vurus' ? 0.35 : 0;   // tribün: gol olunca herkes zıplar
    return out;
  }

  /* ---------- sonuç ---------- */
  var BASLIK = { delik: 'DELİKTEN!', halka: 'HALKAYA ÇARPTI', ag: 'AĞDAN DÖNDÜ', kisa: 'KISA KALDI', gol: 'GOL', direk_gol: 'DİREKTEN GOL', direk_disari: 'DİREKTEN DÖNDÜ', kurtaris: 'KURTARDI', baraj: 'BARAJ', aut: 'AUT' };

  function neden(r, girdi) {
    var h = r.hata, zamanli = typeof girdi.zaman === 'number';
    switch (r.sonuc) {
      case 'delik': return r.delik.puan>=5?'Üst sıradaki küçük deliği buldun.':r.delik.puan>=4?'Temiz vuruş, delikten geçti.':'Alt delik: daha yukarısı daha değerli.';
      case 'halka': return 'Top halkaya değdi; tam ortadan geçmesi gerekiyor.';
      case 'ag': return r.speed<9?'Yavaş geldi, ağın önüne düştü.':'Ağa çarpıp geri döndü. Bir deliği hedefle.';
      case 'kisa': return 'Top kale çizgisine ulaşmadı. Daha temiz temas ve zamanlama gerekiyor.';
      case 'baraj': return 'Top barajda kaldı. Daha yükseğe nişan al ya da falsoyla duvarın yanından dolandır.';
      case 'kurtaris': return r.quality < .8 ? 'Zamanlama şutu yavaşlattı; kaleci yetişti.' : 'Kaleci topun yoluna yetişti. Daha uzak köşeyi dene.';
      case 'direk_disari': return 'Top direğe çarptı; gol olmadı.';
      case 'direk_gol': return 'Direkten içeri girdi.';
      case 'aut':
        if (zamanli && h > 0.08) return 'Geç temas vuruş açısını bozdu. Yeşile daha yakın bas.';
        if (zamanli && h < -0.08) return 'Erken temas şutu yavaşlattı ve alçalttı.';
        return 'Nişan kalenin dışında kaldı.';
      default:
        if (zamanli && !r.bandaGirdi) return 'Gol. Zamanlama bandı kaçtı, bir dahaki sefere yeşilde bas.';
        return r.bandaGirdi ? 'Tam zamanlama.' : '';
    }
  }

  function sonucGoster() {
    var r = gecerliSonuc.r, girdi = gecerliSonuc.girdi, p = gecerliSonuc.p;
    d.sonuclar.push(gecerliSonuc.giris);
    d.faz = 'sonuc'; d.sonucBasla = simdi();
    var gol = p.gol;
    var kutu = $('sonuc');
    kutu.className = 'sonuc ' + (gol ? 'gol' : 'kacti');
    $('sonucBaslik').textContent = BASLIK[r.sonuc];
    $('sonucPuan').textContent = gol ? '+' + p.puan : '0 puan';
    var parca = [];
    if (gol) { parca.push((d.pos.tip==='hedef' ? 'Delik ' : d.pos.tip === 'frikik' ? 'Frikik golü ' : 'Penaltı golü ') + p.taban); if (p.zaman) parca.push('zamanlama +' + p.zaman); if (p.zor) parca.push((r.sonuc === 'direk_gol' ? 'direk' : 'köşe') + ' +' + p.zor); }
    d.turEnSert = Math.max(d.turEnSert || 0, Math.round(r.speed * 3.6));
    if (DT.muzik) { if (p.altin) DT.muzik.efekt('altin'); else if (p.seri >= 2) DT.muzik.efekt('seri'); }
    if (p.altin) parca.push('altın bölge +' + p.altin); if (p.seriEk) parca.push('seri ×' + p.carpan + ' +' + p.seriEk);
    parca.push(Math.round(r.speed * 3.6) + ' km/sa');
    if(r.spinRps>1)parca.push((girdi.contact.x<-.12?'Sağa':girdi.contact.x>.12?'Sola':'Dikey')+' falso');
    $('sonucDetay').textContent = parca.join(' · ');
    $('sonucNeden').textContent = neden(r, girdi);
    if ($('sonucYorum') && DT.yorum) $('sonucYorum').textContent = DT.yorum.uret({ sonuc: r.sonuc, gol: p.gol, km: r.speed * 3.6, falso: r.spinRps > 1, ruzgar: d.ruzgar, seri: p.seri || 0, altin: p.altin || 0 }, d.seed);   // yorumcu bandı
    seriYaz();
    if (d.mod !== 'resmi' && DT.rozet) rozetBildir(DT.rozet.vurus({ gol: !!p.gol, sonuc: r.sonuc, tip: d.pos.tip, km: r.speed * 3.6, falso: r.spinRps > 1, ruzgarHiz: d.ruzgar ? d.ruzgar.hiz : 0, altin: p.altin || 0, seri: p.seri || 0, x: r.gecis ? r.gecis.x : 0, y: r.gecis ? r.gecis.y : 0 }));
    if (d.mod === 'hayat') { if (p.gol) d.hayatGol++; else d.hayatBitti = true; }
    $('devamBtn').textContent = d.mod === 'hayat' ? (d.hayatBitti ? 'Sonuçları gör' : 'Sıradaki vuruş') : d.idx + 1 >= turSayisi() ? 'Turu bitir' : 'Sıradaki vuruş';
    kutu.hidden = false;
    $('hudPuan').textContent = toplam();
  }

  function devam() {
    if (d.faz !== 'sonuc') return;
    d.idx++;
    if (d.idx >= turSayisi() || (d.mod === 'hayat' && d.hayatBitti)) turSonu(); else vurusHazirla(null);
  }

  /* ---------- tur sonu ---------- */
  function turSonu() {
    d.faz = 'bos';
    var t = toplam(), gol = d.sonuclar.filter(function (s) { return s.puan > 0; }).length;
    if (d.mod !== 'resmi' && DT.rozet) rozetBildir(DT.rozet.turSonu({ puan: t, vurus: turSayisi(), gol: d.sonuclar.filter(function (s) { return s.gol; }).length }));
    ekranGoster('tursonu');
    $('turKarakter').src = 'assets/menu/' + d.karakter + '_' + (gol >= 3 ? 'sevinc' : (gol === 0 ? 'kacirma' : 'bekle')) + '.png';
    $('turBaslik').textContent = gol + (d.mod==='hedef'?' delik, ':' gol, ') + turSayisi() + ' vuruş';$('turTekrar').hidden=d.mod==='resmi';
    $('turToplam').textContent = t;
    var ADLAR = {delik:'Delikten', halka:'Halkaya çarptı', ag:'Ağdan döndü', kisa:'Kısa kaldı', gol: 'Gol', direk_gol: 'Direkten gol', direk_disari: 'Direkten döndü', kurtaris: 'Kurtardı', baraj: 'Baraja çarptı', aut: 'Aut' };
    var liste = $('turListe'); liste.innerHTML = '';
    d.sonuclar.forEach(function (s) {
      var li = doc.createElement('li');
      li.innerHTML = '<span class="ad">' + s.ad + '<span class="sonuc-ad">' + ADLAR[s.sonuc] + '</span></span><span class="p' + (s.puan ? '' : ' sifir') + '">' + s.puan + '</span>';
      liste.appendChild(li);
    });
    if (d.mod === 'resmi') {
      var records = kupaKayit();
      records[d.karakter] = { id:d.karakter, puan:t, gol:gol, yesil:d.sonuclar.filter(function(s){return s.yesil === true;}).length };
      yaz('dt6_kupa_' + kupaKod,records); kupaGoster();
      var en = oku(ANAHTAR.enIyi, 0), gecmis = oku(ANAHTAR.gecmis, []);
      gecmis.push({ karakter: d.karakter, puan: t, tarih: new Date().toISOString() });
      yaz(ANAHTAR.gecmis, gecmis.slice(-20));
      if (t > en) yaz(ANAHTAR.enIyi, t);
      sil(ANAHTAR.resmi);
      $('turNot').textContent = (t > en ? 'Bu telefonda yeni en iyi tur. ' : 'Bu telefonda en iyi tur: ' + en + ' puan. ') + 'Gollerin otomatik kaydedildi.';
    } else if (d.mod === 'gunluk' && DT.modlar) {
      var gg = d.sonuclar.filter(function (x) { return x.gol; }).length, kay = DT.modlar.gunlukKaydet(d.gun, t, gg), du = DT.modlar.gunlukDurum(d.gun);
      $('turBaslik').textContent = 'Günlük #' + DT.modlar.gunSira(d.gun) + ': ' + gg + '/3 gol';
      $('turNot').textContent = kay.ilk ? 'Bugünkü sonucun kaydedildi' + (du.seri >= 2 ? ' · 🔥 ' + du.seri + ' gün üst üste' : '') + '. Gruba paylaş, sen kaç yaparsın?' : 'Bu bir deneme: bugünkü ilk denemen (' + kay.puan + ' puan) sayılır.';
      d.sonPaylas = DT.modlar.gunlukMetin(d.gun, kay.ilk ? t : kay.puan, kay.ilk ? gg : kay.goller, du.seri);
    } else if (d.mod === 'hayat' && DT.modlar) {
      var hg = d.hayatGol, hk = DT.modlar.hayatKaydet(hg); d.turRekor = hk.rekor;
      $('turBaslik').textContent = 'Seri bitti: ' + hg + ' gol';
      $('turKarakter').src = 'assets/menu/' + d.karakter + '_' + (hk.rekor ? 'sevinc' : 'kacirma') + '.png';
      $('turNot').textContent = hk.rekor ? '🏆 Yeni rekor! Önceki: ' + hk.onceki + ' gol.' : 'Rekorun: ' + hk.yeni + ' gol. ' + (hk.yeni - hg) + ' gol daha atsan geçerdin.';
      d.sonPaylas = 'Duran Top Hayatta Kal: ' + hg + ' gol üst üste!' + (hk.rekor ? ' 🏆 yeni rekor' : '') + '\nBakalım sen kaç atarsın?';
    } else {
      $('turNot').textContent = 'Antrenman: skora yazılmadı.';
    }
  }

  /* ---------- çizim döngüsü ---------- */
  function dongu() {
    var now = simdi();
    if (d.ekran === 'oyun' || d.ekran === 'menu' || d.ekran === 'secim' || d.ekran === 'tursonu') {
      if (d.faz === 'nisan' && d.kilit && cubukAktif() && !$('alt').hidden) {
        var v = cubukDegeri(now);
        $('cubukImlec').style.left = (v * 100) + '%';
      }
      if (fifaMod() && d.faz === 'nisan' && d.kilit && !$('fifaKutu').hidden) fifaKare(now);
      if (!doc.hidden && d.pos && DT.cizim.kareOlc && d.sonKare) DT.cizim.kareOlc(now - d.sonKare);
      if (!doc.hidden && d.sonKare && DT.perf) DT.perf.kare(now - d.sonKare, d.ekran === 'oyun' ? d.faz : 'menu');   // faza göre kare süresi (gizli performans göstergesi)
      d.sonKare = now;
      if (d.pos) {
        var cd = d.faz === 'menu' || d.ekran !== 'oyun' ? { top: { x: d.pos.bx, y: A.kale.topYaricap, z: 0 }, kaleci: { x: Math.sin(now / 900) * 0.08, y: 1, ilerleme: 0, yon: 0, poz: 'bekle' } } : cizimDurumu(now);
        DT.cizim.ciz(cd);
      }
    }
    root.requestAnimationFrame(dongu);
  }

  /* ---------- başlat ---------- */
  function kadroDoldur() {
    var k = $('kadro'); k.innerHTML = '';
    DT.KARAKTER.forEach(function (c) {
      var im = doc.createElement('img'); im.alt = c.ad+' · '+c.numara+' numara';im.title=im.alt; im.src = 'assets/menu/' + c.id + '_bekle.webp'; k.appendChild(im);
    });
  }

  var kupaKod = '';
  function kupaKayit(){return DT.live ? DT.live.records() : oku('dt6_kupa_' + kupaKod,{});}
  function kimlikGoster(){
    var me=DT.live&&DT.live.identity&&DT.live.identity();$('kimlikForm').hidden=!!me;$('kimlikAcik').hidden=!me;$('kimlikAd').textContent=me?me.player.toUpperCase()+' ile giriş yaptın':'';
    var mine=DT.live&&DT.live.current&&DT.live.current();$('btnResmi').disabled=!me||!!(mine&&mine.idx>=VURUS_SAYISI)||kupaKapali();$('btnAntrenman').disabled=!me;if($('btnHedef'))$('btnHedef').disabled=!me;if($('btnGunluk'))$('btnGunluk').disabled=!me;if($('btnHayat'))$('btnHayat').disabled=!me;modDurumYaz();if(me)d.karakter=me.player;
  }
  function kupaGoster(){
    if(!kupaKod)return;var r=kupaKayit(), rows=DT.KARAKTER.map(function(k){return r[k.id]||{id:k.id,idx:0,puan:0,gol:0,yesil:0};});
    rows.sort(function(a,b){return b.gol-a.gol||b.puan-a.puan||b.yesil-a.yesil;});
    function openRow(id){var node=doc.getElementById(id);return node&&node.open?' open=""':'';}
    var rank=1;$('kupaTablo').innerHTML=rows.map(function(r,i){if(i&&(r.gol!==rows[i-1].gol||r.puan!==rows[i-1].puan))rank=i+1;return '<details id="skor-hafta-'+r.id+'" class="skor-satiri"'+openRow('skor-hafta-'+r.id)+'><summary><b>'+rank+'. '+r.id.toUpperCase()+'</b><span>'+r.gol+' gol</span></summary><p>'+r.idx+' vuruş kullanıldı · '+r.puan+' puan</p></details>';}).join('');
    if(rows.every(function(r){return r.idx===10;})){var best=rows[0],winners=rows.filter(function(r){return r.gol===best.gol&&r.puan===best.puan;});$('kupaTablo').innerHTML+='<p>🏆 '+winners.map(function(r){return r.id.toUpperCase();}).join(' & ')+' haftanın Juninho Kupası şampiyonu!</p>';}
    var st=DT.live&&DT.live.getState();if(st){var me=DT.live.identity(),mine=me&&r[me.player];$('haftaBaslik').textContent=me?(mine&&mine.idx>=10?'Bu haftanın vuruşlarını tamamladın.':(10-(mine?mine.idx:0))+' vuruş hakkın kaldı.'):'Her hafta yeni bir yarış.';var genel=st.totals||[],grank=1;$('genelTablo').innerHTML=genel.map(function(r,i){if(i&&(r.gol!==genel[i-1].gol||r.puan!==genel[i-1].puan))grank=i+1;return '<details id="skor-toplam-'+r.player+'" class="skor-satiri"'+openRow('skor-toplam-'+r.player)+'><summary><b>'+grank+'. '+r.player.toUpperCase()+'</b><span>'+r.gol+' gol</span></summary><p>'+r.puan+' puan · '+r.vurus+' vuruş</p></details>';}).join('');}
  }
  function paylas(text){if(root.navigator&&root.navigator.share)root.navigator.share({text:text}).catch(function(){});else if(root.navigator&&root.navigator.clipboard)root.navigator.clipboard.writeText(text).then(function(){root.alert('Kopyalandı. WhatsApp grubuna yapıştır.');}).catch(function(){root.prompt('Kopyala:',text);});else root.prompt('Kopyala:',text);}
  function kupaKur(){
    if(!DT.live)return;
    $('kupaKod').readOnly=true;
    DT.live.init(function(state){kimlikGoster();if(state){kupaKod=state.room.code;$('kupaKod').value=kupaKod;kupaGoster();}},function(message){$('canliDurum').textContent=message;}).catch(function(){});
    $('kimlikForm').addEventListener('submit',function(e){e.preventDefault();var btn=$('kimlikGiris');btn.disabled=true;$('kimlikNot').textContent='Giriş yapılıyor…';DT.live.login($('kimlikOyuncu').value,$('kimlikKod').value).then(function(){$('kimlikNot').textContent='';menuGoster();}).catch(function(e){$('kimlikNot').textContent=e.message;}).finally(function(){btn.disabled=false;$('kimlikKod').value='';kimlikGoster();});});
    $('kimlikCikis').addEventListener('click',function(){DT.live.logout().then(menuGoster).catch(function(e){root.alert(e.message);});});
    $('yeniKupa').addEventListener('click',function(){DT.live.create().catch(function(e){root.alert(e.message);});});
    $('kupaPaylas').addEventListener('click',function(){DT.live.ensure().then(function(){paylas('Juninho Kupası! Kendi oyuncunla haftalık 10 vuruşunu oyna. Goller otomatik birleşir.\n'+DT.live.link());}).catch(function(e){root.alert(e.message);});});
    $('sonucPaylas').addEventListener('click',function(){if(yeniModMu()&&d.sonPaylas){paylas(d.sonPaylas);return;}if(DT.live.getState())paylas(d.karakter.toUpperCase()+' · '+toplam()+' puan!\n'+DT.live.link());});
  }

  function temasCiz(){var cv=$('temasTop'),g=cv.getContext('2d'),x=110+d.contact.x*90,y=110-d.contact.y*90;
    g.clearRect(0,0,220,220);var fill=g.createRadialGradient(78,65,5,110,110,100);fill.addColorStop(0,'#fff');fill.addColorStop(1,'#aaa');g.fillStyle=fill;g.beginPath();g.arc(110,110,95,0,Math.PI*2);g.fill();g.strokeStyle='#555';g.lineWidth=2;for(var i=0;i<5;i++){var a=i*Math.PI*2/5;g.beginPath();g.moveTo(110,110);g.lineTo(110+Math.cos(a)*90,110+Math.sin(a)*90);g.stroke();}g.fillStyle='#111';g.beginPath();for(i=0;i<5;i++){a=i*Math.PI*2/5-Math.PI/2;g.lineTo(110+Math.cos(a)*25,110+Math.sin(a)*25);}g.closePath();g.fill();g.strokeStyle='#3ddc84';g.lineWidth=4;g.beginPath();g.arc(x,y,10,0,Math.PI*2);g.stroke();
    $('temasNot').textContent=(Math.abs(d.contact.x)<.12?'Düz':d.contact.x<0?'Sağa falso':'Sola falso')+' · '+(d.contact.y<-.15?'Yükselen':d.contact.y>.15?'Öne dönüşlü':'Dengeli')+' şut';
  }
  /* Duruş (vücut yönü) ile nişan (topun gideceği yer) AYRI şeylerdir: ikisi aynı ekranda ama bağımsız oklarla seçilir.
   * Vücut okları: basılı tutulduğu sürece oyuncu -1..1 arasında döner (saniyede 0,9 birim ≈ 21°/sn) ve yerinde küçük adımlar atar.
   * Nişan okları topun hedefini değiştirir; vücut yönünü değiştirmez. Duruş yalnız görüntü ve kameradır: fizik ve puan değişmez
   * (sunucuya en yakın eski duruş -1/0/1 gider). Kamera, vücut oku bırakılınca bir kez yeni açıya geçer. */
  var YON_HIZ = 0.9;
  function yonYaz() { /* gösterge kaldırıldı: kumandada yalnız ok tuşları var */ }
  function kameraGuncelle() {
    if (Math.abs((d.durus || 0) - (d.kamDurus || 0)) < 0.01) return;
    d.kamDurus = d.durus || 0; DT.cizim.kameraDurus(d.durus || 0);
  }
  function yonIlerle(now) {
    if (!d.donus || d.faz !== 'nisan' || d.kilit) { d.donusSon = null; return; }
    if (d.donusSon == null) { d.donusSon = now; d.donusFaz = 0; return; }
    var dt = Math.max(0, Math.min(.1, (now - d.donusSon) / 1000)); d.donusSon = now;
    d.durus = Math.max(-1, Math.min(1, (d.durus || 0) + d.donus * YON_HIZ * dt)); d.donusFaz = ((d.donusFaz || 0) + dt / 0.55) % 1; yonYaz(); panelKonumu();
  }
  function yonBirak() {
    var donuyordu = !!d.donus; d.donus = 0; d.donusSon = null;
    ['yonSol', 'yonSag'].forEach(function (id) { var b = $(id); if (b && b.classList) b.classList.toggle('basili', false); });
    if (donuyordu && d.faz === 'nisan' && !d.kilit) { kameraGuncelle(); acikKaydet(); }
  }
  function yonKur() {
    [['yonSol', -1], ['yonSag', 1]].forEach(function (item) {
      var b = $(item[0]); if (!b) return;
      b.addEventListener('pointerdown', function (e) { if (d.faz !== 'nisan' || d.kilit) return; if (e && e.preventDefault) e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} d.donus = item[1]; if (b.classList) b.classList.toggle('basili', true); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { b.addEventListener(t, yonBirak); });
      b.addEventListener('contextmenu', function (e) { if (e && e.preventDefault) e.preventDefault(); });
    });
    if (root.addEventListener) {   // bilgisayar: A / D vücudu çevirir (oklar nişan içindir)
      root.addEventListener('keydown', function (e) { if (d.faz !== 'nisan' || d.kilit || $('fifaNisan').hidden) return; var k = String(e.key).toLowerCase(); if (k === 'a' || k === 'd') { if (e.preventDefault) e.preventDefault(); d.donus = k === 'a' ? -1 : 1; } });
      root.addEventListener('keyup', function (e) { var k = String(e.key).toLowerCase(); if (k === 'a' || k === 'd') yonBirak(); });
      root.addEventListener('blur', yonBirak);
    }
    yonYaz();
  }
  /* ---------- FIFA 2003 tarzı frikik ----------
   * Sıra: duruş → okla nişan (◀ ▶ yön, ▲ ▼ yükseklik; ya da kaleye dokun) → falso (topun neresine) →
   * VUR'u basılı tut: güç dolar, fazla tutarsan geri düşer; bırak → ibre geri döner, yeşilde tekrar bas.
   * Sunucuya giden girdiler aynı (nişan, temas, güç, zamanlama, duruş): kural sürümü değişmez (rules 9). */
  var FIFA = { gucSure: 1100, nisanX: 3.2, nisanY: 1.6 };   // m/sn; basılı tutuldukça 2,2 katına hızlanır
  /* Yer oku = topun GERÇEK uçuş yolu (tam güç, kusursuz zamanlama): falso verince ok eğilir, alt temasta ok havaya kalkar.
   * Hesap önbelleğe alınır ve en çok ≈14 kez/sn yenilenir (kural 10 hızlı entegrasyonla ≈7 ms). */
  var onizBel = { key: '', yol: null, t: -1e9 };
  function fifaOnizleme(now) {
    if (!d.aim || !d.pos) return null;
    var c = d.contact || { x: 0, y: 0 }, key = [d.pos.ad, d.aim.x.toFixed(2), d.aim.y.toFixed(2), (+c.x).toFixed(2), (+c.y).toFixed(2), k10() ? 1 : 0, d.ruzgar ? d.ruzgar.vx + ',' + d.ruzgar.vz : ''].join('|');
    if (onizBel.key === key) return onizBel.yol;
    if (onizBel.yol && now - onizBel.t < 70) return onizBel.yol;   // en çok ≈14 kez/sn yenilenir (ok tuşu ya da falso sürüklemesi sırasında takılma olmasın)
    var f = DT.ucus.energyLaunch(d.pos, d.aim, c, 0, 1, function () { return 0; }, 1, true, k10() ? { hata: 0, bant: DT.zamanBandi(d.aim, 1, true), ruzgar: ruzgarDizi() } : null);   // ok, rüzgârla sapan gerçek yolu gösterir
    onizBel = { key: key, yol: f.yol, t: now }; return onizBel.yol;
  }
  // FIFA sistemi (yer oku + falso + basılı tut güç + geri dönen ibre) artık penaltı, frikik ve hedef ağında aynı.
  function fifaMod() { return !!d.pos; }
  function gucVeyaNisan() {
    if (!fifaMod()) { $('gucPanel').hidden = false; return; }
    d.gucHazir = true; d.guc = 1; if (!d.aim) d.aim = { x: 0, y: d.pos.tip === 'penalti' ? 1.3 : 1.6 };
    yonYaz(); $('fifaNisan').hidden = false; $('ipucu').hidden = true;
  }
  function nisanIlerle(now) {
    if (!d.nisanHiz || !fifaMod() || d.kilit || d.faz !== 'nisan' || !d.aim) { d.nisanSon = null; d.nisanTut = 0; return; }
    if (d.nisanSon == null) { d.nisanSon = now; d.nisanTut = 0; return; }
    var dt = Math.max(0, Math.min(.1, (now - d.nisanSon) / 1000)); d.nisanSon = now; d.nisanTut = (d.nisanTut || 0) + dt;
    var ivme = 1 + Math.min(1.2, d.nisanTut / 0.5 * 1.2);   // basılı tuttukça hızlanır: ince ayar başta, uzun yol sonra
    d.aim = { x: Math.max(-aimXMax(), Math.min(aimXMax(), d.aim.x + d.nisanHiz.x * FIFA.nisanX * ivme * dt)), y: Math.max(0.11, Math.min(3.1, d.aim.y + d.nisanHiz.y * FIFA.nisanY * ivme * dt)) };

  }
  function nisanBirak() { d.nisanHiz = null; d.nisanSon = null; ['nisanSol','nisanSag','nisanYukari','nisanAsagi'].forEach(function (id) { var b = $(id); if (b && b.classList) b.classList.toggle('basili', false); }); }
  function nisanKilitle() { if (!fifaMod() || d.faz !== 'nisan' || d.kilit || !d.aim || !d.gucHazir) return; nisanBirak(); yonBirak(); kameraGuncelle(); kilitle(false); }
  function fifaGuc(now) { var x = ((now - d.fifa.t0) / FIFA.gucSure) % 2, tri = x < 1 ? x : 2 - x; return Math.round((0.3 + 0.7 * tri) * 100) / 100; }
  // Kural 10: ibre güçle hızlanır (%30 güçte 0,80 sn, %100 güçte 0,62 sn); kupada eski hız.
  function ibreSure(){var t=Math.max(0,Math.min(1,((d.fifa&&d.fifa.guc||d.guc||1)-.3)/.7));return A.zamanCubuguSuresi*(k10()?1-.225*t:1)*1000;}
  /* İbre iki geçiş yapar: yeşilden aşağı iner (1. şans), sonra yukarı geri döner (2. şans). İkinci geçiş de bitince en kötü zamanlamayla vurulur.
   * x: 0→1 aşağı, 1→2 yukarı. Dönen değer ibrenin konumudur (0 = güç noktası, 1 = dip); yeşil bant konumun 0,5 çevresindedir. */
  function fifaIlerleme(now) { return Math.max(0, (now - d.fifa.t0) / ibreSure()); }
  function fifaIsabet(now) { var x = fifaIlerleme(now); return Math.max(0, Math.min(1, x <= 1 ? x : 2 - x)); }
  function fifaHazir() { return d.faz === 'nisan' && d.kilit && d.temasHazir && d.durusHazir && DT.cizim.hazir(); }
  function fifaAt(zaman) { d.fifa.atis = true; vur(zaman); }
  function fifaBas() {
    if (d.guncelle) { root.location.reload(); return; }
    if (!fifaMod() || !fifaHazir()) return;
    var now = simdi();
    if (!d.fifa || !d.fifa.faz) { d.fifa = { faz: 'guc', t0: now }; fifaYaz(); return; }
    if (d.fifa.faz === 'isabet') fifaAt(fifaIsabet(now));
  }
  function fifaBirak() {
    if (!d.fifa || d.fifa.faz !== 'guc') return;
    var now = simdi(); d.guc = fifaGuc(now); bantGuncelle(); acikKaydet();
    if (!cubukAktif()) { fifaAt(null); return; }
    d.fifa = { faz: 'isabet', t0: now, guc: d.guc }; fifaYaz();
  }
  function fifaYaz() {
    var el = $('fifaYazi'); if (!el) return; var f = d.fifa || {};
    el.textContent = f.faz === 'guc' ? 'Güç doluyor… bırak!' : f.faz === 'isabet' ? '%' + Math.round(f.guc * 100) + ' güç · Yeşilde bas! İbre aşağı iner, sonra bir kez geri döner.' : "3/3 · Sertlik: VUR'u basılı tut, dolsun, bırak.";
    $('vurBtn').textContent = f.faz === 'isabet' ? 'BAS!' : 'VUR';
  }
  function fifaKare(now) {
    var f = d.fifa || {}, guc = f.faz === 'guc' ? fifaGuc(now) : f.faz === 'isabet' ? f.guc : null, v = f.faz === 'isabet' ? fifaIsabet(now) : null;
    if (f.faz === 'isabet' && fifaIlerleme(now) >= 2) { fifaAt(0); return; }   // ibre iki geçişi de bitirdi: en kötü zamanlamayla vurulur
    var cv = $('fifaSayac'); if (!cv || !cv.getContext) return; var g = cv.getContext('2d'); if (!g || !g.arc) return;
    var W = 240, c = 120, R = 92, a0 = Math.PI * 0.75, tam = Math.PI * 1.5, oran = function (x) { return (x - 0.3) / 0.7; };
    g.clearRect(0, 0, W, W); g.lineCap = 'butt';
    g.lineWidth = 18; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(c, c, R, a0, a0 + tam); g.stroke();
    if (guc != null) {
      var P = oran(guc), grad = g.createLinearGradient(0, W, W, 0); grad.addColorStop(0, '#f2d04b'); grad.addColorStop(.6, '#f08a2c'); grad.addColorStop(1, '#d8253a');
      g.strokeStyle = grad; g.beginPath(); g.arc(c, c, R, a0, a0 + tam * P); g.stroke();
      if (v != null) {
        var bant = DT.zamanBandi(d.aim, d.guc, k10()), y0 = 1 - (0.5 + bant), y1 = 1 - (0.5 - bant);
        g.strokeStyle = '#3ad16b'; g.lineWidth = 24; g.beginPath(); g.arc(c, c, R, a0 + tam * P * y0, a0 + tam * P * y1); g.stroke();
        var ai = a0 + tam * P * (1 - v); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); g.moveTo(c + Math.cos(ai) * (R - 26), c + Math.sin(ai) * (R - 26)); g.lineTo(c + Math.cos(ai) * (R + 16), c + Math.sin(ai) * (R + 16)); g.stroke();
      }
    }
    // ortada top ve falso noktası (FIFA'daki top simgesi)
    g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(c, c, 46, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#222'; g.beginPath(); for (var k = 0; k < 5; k++) { var a = -Math.PI / 2 + k * Math.PI * 2 / 5; g.lineTo(c + Math.cos(a) * 14, c + Math.sin(a) * 14); } g.closePath(); g.fill();
    var ct = d.contact || { x: 0, y: 0 }; g.fillStyle = '#d8253a'; g.beginPath(); g.arc(c + ct.x * 40, c - ct.y * 40, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; if (guc != null) g.fillText('%' + Math.round(guc * 100), c, W - 14);
  }
  function fifaKur() {
    [['nisanSol', -1, 0], ['nisanSag', 1, 0], ['nisanYukari', 0, 1], ['nisanAsagi', 0, -1]].forEach(function (item) {
      var b = $(item[0]); if (!b) return;
      b.addEventListener('pointerdown', function (e) { if (!fifaMod() || d.kilit || d.faz !== 'nisan') return; if (e && e.preventDefault) e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} d.nisanHiz = { x: item[1], y: item[2] }; if (b.classList) b.classList.toggle('basili', true); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { b.addEventListener(t, nisanBirak); });
      b.addEventListener('contextmenu', function (e) { if (e && e.preventDefault) e.preventDefault(); });
    });
    var k = $('nisanKilit'); if (k) k.addEventListener('click', nisanKilitle);
    if (root.addEventListener) {
      var tus = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
      root.addEventListener('keydown', function (e) {
        if (fifaMod() && $('fifaNisan') && !$('fifaNisan').hidden) { if (tus[e.key]) { if (e.preventDefault) e.preventDefault(); d.nisanHiz = { x: tus[e.key][0], y: tus[e.key][1] }; } else if (e.key === 'Enter') { if (e.preventDefault) e.preventDefault(); nisanKilitle(); } return; }
        if (fifaMod() && e.key === ' ' && !e.repeat && !$('fifaKutu').hidden) { if (e.preventDefault) e.preventDefault(); fifaBas(); }
      });
      root.addEventListener('keyup', function (e) { if (tus[e.key]) nisanBirak(); if (e.key === ' ' && fifaMod()) fifaBirak(); });
    }
  }
  function temasKur(){var cv=$('temasTop'),down=false;function update(e){var r=cv.getBoundingClientRect(),x=((e.clientX-r.left)/r.width*220-110)/90,y=(110-(e.clientY-r.top)/r.height*220)/90,l=Math.hypot(x,y);if(l>.85){x*=.85/l;y*=.85/l;}d.contact={x:x,y:y};temasCiz();}
    cv.addEventListener('pointerdown',function(e){down=true;cv.setPointerCapture(e.pointerId);update(e);});cv.addEventListener('pointermove',function(e){if(down)update(e);});cv.addEventListener('pointerup',function(){down=false;});cv.addEventListener('pointercancel',function(){down=false;});
    function temasOnayla(){if(!d.kilit||!d.gucHazir||d.temasHazir)return;d.temasHazir=true;$('temasPanel').hidden=true;$('alt').hidden=false;bantGuncelle();d.cubukBasla=simdi();onizlemeHesapla();acikKaydet();}
    $('temasOnay').addEventListener('click',temasOnayla);
    cv.addEventListener('pointerup',function(){if(fifaMod()&&d.faz==='nisan')temasOnayla();});   // topa dokunup bırakınca doğrudan sertlik adımına geçer
    $('gucSec').addEventListener('input',function(){d.guc=Math.max(.3,Math.min(1,Number(this.value)/100));$('gucNot').textContent='%'+Math.round(d.guc*100)+' · '+(d.guc<.5?'Yumuşak':d.guc<.8?'Kontrollü':'Sert');onizlemeHesapla();acikKaydet();});
    $('gucOnay').addEventListener('click',function(){if(!d.durusHazir)return;d.gucHazir=true;$('gucPanel').hidden=true;$('ipucu').hidden=false;$('ipucu').textContent='Şimdi kalede hedefini seç. Sert vuruş ve hassas köşe daha zor.';if(d.kilit)kilitle(true);acikKaydet();});
    yonKur(); fifaKur();
  }

  var baslatildi = false;
  function baslat() {
    if (baslatildi) return;
    baslatildi = true;
    var kayit = oku(ANAHTAR.ayar, null);
    if (kayit) { ayar.cubuk = kayit.cubuk !== false; ayar.muzik = kayit.muzik !== false; ayar.solEl = !!kayit.solEl; ayar.buyuk = !!kayit.buyuk; ayar.hareketAz = !!kayit.hareketAz; ayar.titresim = kayit.titresim !== false; }
    ayar.ses = false;                       // ses her açılışta kapalı başlar
    DT.cizim.kur($('sahne'));
    if (DT.perf) DT.perf.baslat();
    if (DT.sestest) DT.sestest.baslat();   // adreste ?sestest=1 varsa ses test paneli ve cihaz raporu
    $('cubukBant').style.left = ((0.5 - A.zaman.bant) * 100) + '%';
    $('cubukBant').style.width = (A.zaman.bant * 200) + '%';
    kadroDoldur(); girisBagla(); ayarGuncelle();

    kupaKur(); temasKur();
    $('yukleme').addEventListener('click', function () { root.location.reload(); });
    $('btnAntrenman').addEventListener('click', function () { var me=DT.live.identity();if(me)turBaslat(me.player,'antrenman',null); });
    if($('btnHedef'))$('btnHedef').addEventListener('click', function () { var me=DT.live.identity();if(me&&DT.hedef)turBaslat(me.player,'hedef',null); });
    if($('btnGunluk'))$('btnGunluk').addEventListener('click', function () { var me=DT.live.identity();if(me&&DT.hedef&&DT.modlar)turBaslat(me.player,'gunluk',null); });
    if($('btnHayat'))$('btnHayat').addEventListener('click', function () { var me=DT.live.identity();if(me&&DT.hedef&&DT.modlar)turBaslat(me.player,'hayat',null); });
    $('btnResmi').addEventListener('click', function () {
      if (kupaKapali()) return;
      var k = oku(ANAHTAR.resmi, null);
      if (DT.live){DT.live.ensure().then(function(){var me=DT.live.identity();if(me)turBaslat(me.player,'resmi',null);}).catch(function(e){root.alert(e.message);});return;}
      if (k) turBaslat(k.karakter, 'resmi', k); else secimGoster('resmi');
    });
    $('btnSifirla').addEventListener('click', function () { sil(ANAHTAR.resmi); menuGoster(); });
    $('btnSes').addEventListener('click', sesDegistir);
    if ($('kartPaylas')) $('kartPaylas').addEventListener('click', function () { if (DT.kart) DT.kart.paylas(kartVeri()); });
    if ($('btnMuzik')) $('btnMuzik').addEventListener('click', function () { ayar.muzik = !ayar.muzik; ayarGuncelle(); });
    [['btnSolEl', 'solEl'], ['btnBuyuk', 'buyuk'], ['btnHareket', 'hareketAz'], ['btnTitresim', 'titresim']].forEach(function (x) { if ($(x[0])) $(x[0]).addEventListener('click', function () { ayar[x[1]] = !ayar[x[1]]; ayarGuncelle(); if (x[1] === 'titresim' && ayar.titresim) titret(40); }); });
    $('hudSes').addEventListener('click', sesDegistir);
    $('btnCubuk').addEventListener('click', function () { ayar.cubuk = !ayar.cubuk; ayarGuncelle(); });
    $('secimGeri').addEventListener('click', menuGoster);
    $('hudGeri').addEventListener('click', menuGoster);
    $('turMenu').addEventListener('click', menuGoster);
    $('turTekrar').addEventListener('click', function () { secimGoster(d.mod); });
    $('vurBtn').addEventListener('pointerdown', function (e) { if (e.isPrimary === false) return; if (fifaMod()) { if (e.preventDefault) e.preventDefault(); try { this.setPointerCapture(e.pointerId); } catch (x) {} fifaBas(); return; } vur(); });
    ['pointerup','pointercancel'].forEach(function(t){$('vurBtn').addEventListener(t,function(){ if (fifaMod()) fifaBirak(); });});
    $('vurBtn').addEventListener('click', function (e) { if (e.detail !== 0) return; if (fifaMod()) { if (d.fifa && d.fifa.faz === 'guc') fifaBirak(); else fifaBas(); return; } vur(); });
    $('cubukYol').addEventListener('pointerdown', vur);
    $('duzeltBtn').addEventListener('click', duzelt);
    $('devamBtn').addEventListener('click', function () { tekrarBitir(); devam(); });
    $('tekrarBtn').addEventListener('click', tekrarBaslat);
    $('sahne').addEventListener('pointerdown', function () { if (d.tekrar) tekrarBitir(); });   // tekrarı ekrana dokunarak bitir
    Array.prototype.forEach.call(doc.querySelectorAll('#falsoKutu button'), function (b) {
      b.addEventListener('click', function () { falsoSec(Number(b.getAttribute('data-falso'))); });
    });
    doc.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    menuGoster();
    root.requestAnimationFrame(dongu);
  }

  DT.oyun = { baslat: baslat, _durum: d, _vur: vur, _devam: devam, _tekrar: tekrarBaslat, _tekrarBitir: tekrarBitir, _kilitle: kilitle, _nisan: function (x, y) { d.aim = { x: x, y: y }; } };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', baslat); else baslat();
})(typeof globalThis !== 'undefined' ? globalThis : window);
