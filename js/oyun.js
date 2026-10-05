/* Duran Top - oyun akışı. Ekranlar, dokunmatik kontrol, vuruş animasyonu ve yerel kayıt.
 * Sonuç hesabı fizik.js'de; bu dosya yalnızca girdi toplar ve sonucu gösterir. */
(function (root) {
  'use strict';
  var DT = root.DT, A = DT.AYAR, doc = root.document;
  var $ = function (id) { return doc.getElementById(id); };
  var simdi = function () { return root.performance.now(); };

  var ANAHTAR = { ayar: 'dt_ayar', resmi: 'dt8_resmi', enIyi: 'dt8_en_iyi', gecmis: 'dt8_gecmis' };
  var VURUS_SAYISI = A.pozisyonlar.length;

  var ayar = { ses: false, cubuk: true };
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
  }

  function menuGoster() {
    $("temasPanel").hidden = true; kimlikGoster(); kupaGoster();
    d.faz = 'bos';
    ekranGoster('menu');
    var kayit = oku(ANAHTAR.resmi, null);
    var mine=DT.live&&DT.live.current&&DT.live.current();
    $('btnResmi').textContent = mine&&mine.idx>=VURUS_SAYISI?'Bu haftayı tamamladın':kayit||mine&&mine.idx>0?'Yarışmaya devam':'Kupaya katıl';
    $('btnSifirla').hidden = true;
    var en = oku(ANAHTAR.enIyi, null);
    $('menuNot').textContent = en ? 'Bu telefonda en iyi tur: ' + en + ' puan. Kupa sonuçları otomatik güncellenir.' : 'Canlı kupa: arkadaşlarının puanları otomatik güncellenir.';
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
    $('hudSes').textContent = ayar.ses ? 'Ses açık' : 'Ses kapalı';
    $('btnCubuk').textContent = 'Antrenman çubuğu: ' + (ayar.cubuk ? 'açık' : 'kapalı');
    $('btnCubuk').classList.toggle('acik', ayar.cubuk);
    yaz(ANAHTAR.ayar, ayar);
  }
  function sesDegistir() { ayar.ses = !ayar.ses; DT.ses.ayarla(ayar.ses); ayarGuncelle(); if (ayar.ses) DT.ses.cal('islik'); }

  function cubukAktif() { return d.mod === 'resmi' || ayar.cubuk; }

  /* ---------- seçim ve tur ---------- */
  function secimGoster(mod) {
    var me=DT.live&&DT.live.identity&&DT.live.identity();if(!me){root.alert('Önce kendi oyuncuna giriş yap.');return;}
    d.mod = mod;
    ekranGoster('secim');
    $('secimNot').textContent = mod === 'resmi'
      ? 'Canlı kupa: karakterini seç. Skorun otomatik kaydedilir.'
      : 'Antrenman: skora yazılmaz, kaleci daha yavaş.';
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
      if (d.idx >= VURUS_SAYISI) { d.pos = A.pozisyonlar[0]; ekranGoster('tursonu'); turSonu(); return; }
    } else {
      d.tur = mod === 'resmi' ? kupaKod : turKimligi(); d.idx = 0; d.sonuclar = [];
      if (mod === 'resmi') yaz(ANAHTAR.resmi, { tur: d.tur, karakter: karakter, idx: 0, sonuclar: [], acik: null });
    }
    ekranGoster('oyun');
    vurusHazirla(kayit && kayit.acik ? kayit.acik : null);
  }

  function toplam() { return d.sonuclar.reduce(function (t, s) { return t + s.puan; }, 0); }

  function panelKonumu(){var el=$('oyun');if(el&&el.classList&&el.classList.toggle)el.classList.toggle('secim-sag',d.durus===-1);}

  function vurusHazirla(acik) {
    d.pos = A.pozisyonlar[d.idx];
    DT.cizim.sahneKur(d.pos, 0);
    // baraj konumu nişandan bağımsız; önizleme hesabından alınır
    var ornek = DT.fizik.hesapla({ pos: d.pos, aim: { x: 0, y: 1.2 }, falso: 0, zaman: 0.5, seed: 1, antrenman: true });
    d.barajGeo = ornek.baraj;
    d.faz = 'nisan'; d.aim = null; d.kilit = false; d.duzeltHak = 1; d.falso = 0; d.onizleme = null; d.an = null; d.son = null;
    d.seed = (Math.random() * 2147483647) | 0;   // resmi turda gerçek tohumu sunucu üretir ve vuruştan sonra gönderir; bu değer yalnızca antrenman/önizleme içindir
    d.contact = {x:0,y:0}; d.temasHazir = false;d.guc=1;d.gucHazir=false;d.durus=0;d.yurume=null;d.durusHazir=!!acik;panelKonumu();
    $('gucPanel').hidden=true;$('gucSec').value=100;$('gucNot').textContent='%100 · Tam güç';$('durusPanel').hidden=true;$('hazirlikPanel').hidden=!!acik; $('temasPanel').hidden = true;
    $('vurBtn').disabled=false;$('vurBtn').textContent='VUR';$('ucusDurum').textContent='';
    $('sonuc').hidden = true; $('alt').hidden = true;
    $('hudVurus').textContent = 'Vuruş ' + (d.idx + 1) + '/' + VURUS_SAYISI;
    $('hudTip').textContent = d.pos.ad + (d.mod === 'antrenman' ? ' · antrenman' : '');
    $('hudPuan').textContent = toplam();
    $('falsoKutu').hidden = true;
    falsoSec(0);
    $('ipucu').hidden = false;
    $('ipucu').textContent = d.pos.tip === 'frikik'
      ? 'Barajın üstünden ya da yanından geçecek yere dokun, sürükle, bırak.'
      : 'Kaleye dokun, parmağını sürükle, bırak. Nişan kilitlenir.';
    if(!acik)$('ipucu').textContent='Pozisyona bak. Hazır olunca duruşunu seç.';
    if (acik) {   // sayfa yenilendi: aynı vuruş kaldığı yerden devam eder
      d.seed = acik.seed; d.aim = acik.aim; d.duzeltHak = acik.duzeltHak;
      d.contact = acik.contact || {x:0,y:0}; d.temasHazir = !!acik.temasHazir;d.guc=acik.guc===undefined?1:acik.guc;d.gucHazir=!!acik.gucHazir;d.durus=acik.durus||0;DT.cizim.kameraDurus(d.durus);panelKonumu();$('gucSec').value=Math.round(d.guc*100);
      falsoSec(acik.falso || 0);
      kilitle(true);
    }
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
    d.aim = { x: Math.max(-4.5, Math.min(4.5, k.x)), y: Math.max(0.11, Math.min(3.1, k.y)) };
  }
  function girisBagla() {
    var cv = $('sahne'), basili = false;
    cv.addEventListener('pointerdown', function (e) {
      if (d.faz !== 'nisan' || !d.durusHazir || !d.gucHazir || d.kilit) return;
      basili = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* yok say */ }
      nisanGuncelle(e);
    });
    cv.addEventListener('pointermove', function (e) { if (basili && d.faz === 'nisan' && !d.kilit) nisanGuncelle(e); });
    function birak() { if (!basili) return; basili = false; if (d.faz === 'nisan' && !d.kilit && d.aim) kilitle(false); }
    cv.addEventListener('pointerup', birak);
    cv.addEventListener('pointercancel', function () { basili = false; });
  }

  function onizlemeHesapla() {
    if (!d.aim) { d.onizleme = null; return; }
    var r = DT.fizik.hesapla({ pos: d.pos, aim: d.aim, contact: d.contact, falso: d.falso, zaman: cubukAktif() ? 0.5 : null, seed: 1, guc:d.guc,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,sabitKol:true,antrenman: true });
    d.onizleme = (r.sonuc === 'baraj'||r.sonuc === 'kisa') ? r.ucusYol.filter(function(o){return o.t <= r.olayT;}) : r.ucusYol;
  }

  function bantGuncelle(){var bant=DT.zamanBandi(d.aim,d.guc);$('cubukBant').style.left=((.5-bant)*100)+'%';$('cubukBant').style.width=(bant*200)+'%';
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
    $('cubukKutu').hidden = !cubukAktif();
    $('duzeltBtn').textContent = 'Nişanı değiştir (' + d.duzeltHak + ')';
    $('duzeltBtn').disabled = d.duzeltHak <= 0;
    d.cubukBasla = simdi();
    if (!yenilenmis && root.navigator && root.navigator.vibrate) root.navigator.vibrate(12);
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
  function vur() {
    if (d.guncelle) { root.location.reload(); return; }   // sunucu bu istemci sürümünü reddetti (CLIENT_VERSION): yenile
    if (d.faz !== 'nisan' || !d.kilit || !d.temasHazir || !d.gucHazir || !d.durusHazir || !DT.cizim.hazir()) return;
    var now = simdi();
    var zaman = cubukAktif() ? cubukDegeri(now) : null;
    var girdi = { pos: d.pos, aim: d.aim, contact: d.contact, falso: d.falso, zaman: zaman, seed: d.seed,guc:d.guc,durus:d.durus,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,sabitKol:true,antrenman: d.mod === 'antrenman' };
    if(d.mod==='resmi' && DT.live){
      var requestIdx=d.idx,requestPlayer=d.karakter,requestRoom=DT.live.getState().room.id;
      d.faz='gonderiliyor';$('vurBtn').disabled=true;$('vurBtn').textContent='Kaydediliyor…';
      DT.live.shot(d.karakter,d.idx,girdi).then(function(entry){
        if(d.ekran!=='oyun'||d.idx!==requestIdx||d.karakter!==requestPlayer||DT.live.getState().room.id!==requestRoom)return;
        $('vurBtn').disabled=false;$('vurBtn').textContent='VUR';
        var actual=entry.input;girdi.aim=actual.aim;girdi.contact=actual.contact;girdi.zaman=actual.zaman;girdi.seed=actual.seed;girdi.guc=actual.guc===undefined?1:actual.guc;girdi.durus=actual.durus||0;girdi.gucZorlugu=actual.rules>=2;girdi.temasFizigi=actual.rules>=3;girdi.sabitKol=actual.rules>=4;girdi.enerjiFizigi=actual.rules>=5;girdi.takipFizigi=actual.rules>=6;girdi.yerTakibi=actual.rules>=7;
        vurusUygula(girdi,entry);
      }).catch(function(e){d.faz='nisan';$('vurBtn').disabled=false;if(e&&e.code==='CLIENT_VERSION'){d.guncelle=true;$('vurBtn').textContent='Oyunu güncelle';$('ucusDurum').textContent=e.message;return;}$('vurBtn').textContent='Yeniden bağlan';$('ucusDurum').textContent=e.message+' Aynı vuruşla tekrar dene.';});return;
    }
    vurusUygula(girdi,null);
  }
  function vurusUygula(girdi,serverEntry){
    var now=simdi();
    var r = DT.fizik.hesapla(girdi);
    var p = DT.puan.puanla(d.pos.tip, r);
    var giris = { yesil:r.bandaGirdi, quality: r.quality, speed: r.speed, ad: d.pos.ad, sonuc: r.sonuc, puan: p.puan, zaman: p.zaman, zor: p.zor, taban: p.taban, gol: p.gol };
    if(serverEntry)giris=serverEntry;
    gecerliSonuc = { girdi: girdi, r: r, p: p, giris: giris };
    d.faz = 'vurus';
    var netPoint=r.yol.find(function(p){return p.z>=d.pos.D+1.45||(p.z>d.pos.D+.11&&Math.abs(p.x)>A.kale.genislik/2-.12);});
    d.an = { t0: now, on: .85, vurdu: false, olay: false, file:false, fileT:netPoint?netPoint.t:Infinity, bitti: false };
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

  var SONUC_SES = { gol: null, direk_gol: 'direk', direk_disari: 'direk', kurtaris: 'kurtaris', baraj: 'baraj', aut: null };

  function cizimDurumu(now) {
    if(d.yurume&&now-d.yurume.t0>=1100){d.yurume=null;d.durusHazir=true;$('gucPanel').hidden=false;$('ipucu').hidden=true;} 
    var R = A.kale.topYaricap, pos = d.pos;
    var B = { x: pos.bx, y: R, z: 0 };
    var out = {
      zaman:0,top: B, topAci: 0, baraj: d.barajGeo,
      kaleci: { x: Math.sin(now / 700) * 0.08, y: A.kaleci.baslangicY, ilerleme: 0, yon: 0, poz: 'bekle',gesture:pos.tip==='penalti'?now/1000:undefined },
      oyuncu: { durus:d.durus,yurume:d.yurume?{from:d.yurume.from,to:d.durus,u:Math.max(0,Math.min(1,(now-d.yurume.t0)/1100))}:null,karakter: d.karakter, poz: 'vurus1', guide:d.onizleme, aim: d.aim, falso: d.falso, ilerleme: 0 }
    };
    if (d.faz === 'nisan') {
      if (d.aim) out.nisan = { aim: d.aim, kilit: d.kilit, onizleme: d.temasHazir?d.onizleme:null };
    } else if (d.faz === 'vurus' && d.an) {
      var r = gecerliSonuc.r, an = d.an, el = (now - an.t0) / 1000, simT = el - an.on;
      out.oyuncu.ilerleme = Math.max(0, Math.min(1, el / (an.on + 0.40)));
      out.oyuncu.sure=el;out.oyuncu.on=an.on;
      out.oyuncu.temas = an.on / (an.on + 0.40);
      out.oyuncu.yol = r.yol; out.oyuncu.guide=r.ucusYol;
      out.oyuncu.poz = el < an.on ? 'vurus1' : (el < an.on + 0.10 ? 'vurus2' : 'vurus3');
      if (simT > 0) {
        if (!an.vurdu) { an.vurdu = true; DT.ses.cal('vurus'); }
        out.zaman=simT;var sonT = r.yol[r.yol.length - 1].t, tt = Math.min(simT, sonT);
        out.top = yolOrnek(r.yol, tt); out.topAci = simT * ((r.spin && (r.spin[1] - .5*r.spin[0])) || 0);
        out.kaleci = (r.sonuc === 'baraj'||r.sonuc === 'kisa') ? {x:0,y:1,poz:'bekle',yon:0,ilerleme:0} : r.kaleci.cizimKonum(simT,r.olayT);
        var se = simT - r.olayT;
        if(r.direkTemas&&!an.direk&&simT>=r.direkTemas.t){an.direk=true;DT.ses.cal('direk',{hiz:r.speed});}
        if(!an.file&&(r.sonuc==='gol'||r.sonuc==='direk_gol')&&simT>=an.fileT){an.file=true;DT.ses.cal('file',{hiz:r.speed});}
        if(se >= 0){out.kaleci.saved = r.tuttu;}
        if (se >= 0) {
          if (!an.olay) {
            an.olay = true;
            var ses = SONUC_SES[r.sonuc]; if (ses && !(an.direk&&ses==='direk')) DT.ses.cal(ses,{hiz:r.speed});
            if (r.sonuc === 'gol' || r.sonuc === 'direk_gol') DT.ses.cal('gol');
            else if (r.sonuc !== 'aut') DT.ses.cal('ah');
          }
          if (se < 0.3 && r.sonuc !== 'aut') out.sarsinti = 7 * (1 - se / 0.3);
          if ((r.sonuc === 'gol' || r.sonuc === 'direk_gol') && se < 0.4) out.flas = 0.3 * (1 - se / 0.4);
        }
        if (simT >= sonT + 0.3 && !an.bitti) { an.bitti = true; d.son = { top: out.top, kaleci: out.kaleci, zaman:simT }; sonucGoster(); }
      }
    } else if (d.faz === 'sonuc' && d.son) {
      out.top = d.son.top; out.zaman=d.son.zaman+(now-d.sonucBasla)/1000;out.kaleci=(gecerliSonuc.r.sonuc==='baraj'||gecerliSonuc.r.sonuc==='kisa')?d.son.kaleci:gecerliSonuc.r.kaleci.cizimKonum(out.zaman);out.kaleci.saved=gecerliSonuc.r.tuttu;
      var gol = gecerliSonuc.r.sonuc === 'gol' || gecerliSonuc.r.sonuc === 'direk_gol';
      out.oyuncu = null;
      out.onKarakter = { karakter: d.karakter, poz: gol ? 'sevinc' : 'kacirma', sure: (now - d.sonucBasla) / 1000, gol: gol };
    }
    return out;
  }

  /* ---------- sonuç ---------- */
  var BASLIK = { kisa: 'KISA KALDI', gol: 'GOL', direk_gol: 'DİREKTEN GOL', direk_disari: 'DİREK', kurtaris: 'KURTARDI', baraj: 'BARAJ', aut: 'AUT' };

  function neden(r, girdi) {
    var h = r.hata, zamanli = typeof girdi.zaman === 'number';
    switch (r.sonuc) {
      case 'kisa': return 'Top kale çizgisine ulaşmadı. Daha temiz temas ve zamanlama gerekiyor.';
      case 'baraj': return 'Top barajda kaldı. Daha yükseğe nişan al ya da falsoyla duvarın yanından dolandır.';
      case 'kurtaris': return r.quality < .8 ? 'Zamanlama şutu yavaşlattı; kaleci yetişti.' : 'Kaleci topun yoluna yetişti. Daha uzak köşeyi dene.';
      case 'direk_disari': return 'Direk! Birkaç santim içeride olsaydı gol olurdu.';
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
    if (gol) { parca.push((d.pos.tip === 'frikik' ? 'Frikik golü ' : 'Penaltı golü ') + p.taban); if (p.zaman) parca.push('zamanlama +' + p.zaman); if (p.zor) parca.push((r.sonuc === 'direk_gol' ? 'direk' : 'köşe') + ' +' + p.zor); }
    parca.push(Math.round(r.speed * 3.6) + ' km/sa');
    if(r.spinRps>1)parca.push((girdi.contact.x<-.12?'Sağa':girdi.contact.x>.12?'Sola':'Dikey')+' falso');
    $('sonucDetay').textContent = parca.join(' · ');
    $('sonucNeden').textContent = neden(r, girdi);
    $('devamBtn').textContent = d.idx + 1 >= VURUS_SAYISI ? 'Turu bitir' : 'Sıradaki vuruş';
    kutu.hidden = false;
    $('hudPuan').textContent = toplam();
  }

  function devam() {
    if (d.faz !== 'sonuc') return;
    d.idx++;
    if (d.idx >= VURUS_SAYISI) turSonu(); else vurusHazirla(null);
  }

  /* ---------- tur sonu ---------- */
  function turSonu() {
    d.faz = 'bos';
    var t = toplam(), gol = d.sonuclar.filter(function (s) { return s.puan > 0; }).length;
    ekranGoster('tursonu');
    $('turKarakter').src = 'assets/menu/' + d.karakter + '_' + (gol >= 3 ? 'sevinc' : (gol === 0 ? 'kacirma' : 'bekle')) + '.png';
    $('turBaslik').textContent = gol + ' gol, ' + VURUS_SAYISI + ' vuruş';$('turTekrar').hidden=d.mod==='resmi';
    $('turToplam').textContent = t;
    var ADLAR = {kisa:'Kısa kaldı', gol: 'Gol', direk_gol: 'Direkten gol', direk_disari: 'Direkten döndü', kurtaris: 'Kurtardı', baraj: 'Baraja çarptı', aut: 'Aut' };
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
      if (!doc.hidden && d.pos && DT.cizim.kareOlc && d.sonKare) DT.cizim.kareOlc(now - d.sonKare);
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
    var mine=DT.live&&DT.live.current&&DT.live.current();$('btnResmi').disabled=!me||!!(mine&&mine.idx>=VURUS_SAYISI);$('btnAntrenman').disabled=!me;if(me)d.karakter=me.player;
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
    $('sonucPaylas').addEventListener('click',function(){if(DT.live.getState())paylas(d.karakter.toUpperCase()+' · '+toplam()+' puan!\n'+DT.live.link());});
  }

  function temasCiz(){var cv=$('temasTop'),g=cv.getContext('2d'),x=110+d.contact.x*90,y=110-d.contact.y*90;
    g.clearRect(0,0,220,220);var fill=g.createRadialGradient(78,65,5,110,110,100);fill.addColorStop(0,'#fff');fill.addColorStop(1,'#aaa');g.fillStyle=fill;g.beginPath();g.arc(110,110,95,0,Math.PI*2);g.fill();g.strokeStyle='#555';g.lineWidth=2;for(var i=0;i<5;i++){var a=i*Math.PI*2/5;g.beginPath();g.moveTo(110,110);g.lineTo(110+Math.cos(a)*90,110+Math.sin(a)*90);g.stroke();}g.fillStyle='#111';g.beginPath();for(i=0;i<5;i++){a=i*Math.PI*2/5-Math.PI/2;g.lineTo(110+Math.cos(a)*25,110+Math.sin(a)*25);}g.closePath();g.fill();g.strokeStyle='#3ddc84';g.lineWidth=4;g.beginPath();g.arc(x,y,10,0,Math.PI*2);g.stroke();
    $('temasNot').textContent=(Math.abs(d.contact.x)<.12?'Düz':d.contact.x<0?'Sağa falso':'Sola falso')+' · '+(d.contact.y<-.15?'Yükselen':d.contact.y>.15?'Öne dönüşlü':'Dengeli')+' şut';
  }
  function temasKur(){var cv=$('temasTop'),down=false;function update(e){var r=cv.getBoundingClientRect(),x=((e.clientX-r.left)/r.width*220-110)/90,y=(110-(e.clientY-r.top)/r.height*220)/90,l=Math.hypot(x,y);if(l>.85){x*=.85/l;y*=.85/l;}d.contact={x:x,y:y};temasCiz();}
    cv.addEventListener('pointerdown',function(e){down=true;cv.setPointerCapture(e.pointerId);update(e);});cv.addEventListener('pointermove',function(e){if(down)update(e);});cv.addEventListener('pointerup',function(){down=false;});cv.addEventListener('pointercancel',function(){down=false;});
    $('temasOnay').addEventListener('click',function(){if(!d.kilit||!d.gucHazir)return;d.temasHazir=true;$('temasPanel').hidden=true;$('alt').hidden=false;bantGuncelle();d.cubukBasla=simdi();onizlemeHesapla();acikKaydet();});
    $('gucSec').addEventListener('input',function(){d.guc=Math.max(.3,Math.min(1,Number(this.value)/100));$('gucNot').textContent='%'+Math.round(d.guc*100)+' · '+(d.guc<.5?'Yumuşak':d.guc<.8?'Kontrollü':'Sert');onizlemeHesapla();acikKaydet();});
    $('gucOnay').addEventListener('click',function(){if(!d.durusHazir)return;d.gucHazir=true;$('gucPanel').hidden=true;$('ipucu').hidden=false;$('ipucu').textContent='Şimdi kalede hedefini seç. Sert vuruş ve hassas köşe daha zor.';if(d.kilit)kilitle(true);acikKaydet();});
    $('durusAc').addEventListener('click',function(){if(d.faz!=='nisan'||d.durusHazir)return;$('hazirlikPanel').hidden=true;$('durusPanel').hidden=false;$('ipucu').hidden=true;});
    [['durusSol',-1],['durusDuz',0],['durusSag',1]].forEach(function(item){$(item[0]).addEventListener('click',function(){var old=d.durus;d.durus=item[1];DT.cizim.kameraDurus(d.durus);panelKonumu();if(old===d.durus){d.durusHazir=true;$('durusPanel').hidden=true;$('gucPanel').hidden=false;return;}d.durusHazir=false;d.yurume={from:old,t0:simdi()};$('durusPanel').hidden=true;$('ipucu').hidden=true;});});
  }

  var baslatildi = false;
  function baslat() {
    if (baslatildi) return;
    baslatildi = true;
    var kayit = oku(ANAHTAR.ayar, null);
    if (kayit) { ayar.cubuk = kayit.cubuk !== false; }
    ayar.ses = false;                       // ses her açılışta kapalı başlar
    DT.cizim.kur($('sahne'));
    $('cubukBant').style.left = ((0.5 - A.zaman.bant) * 100) + '%';
    $('cubukBant').style.width = (A.zaman.bant * 200) + '%';
    kadroDoldur(); girisBagla(); ayarGuncelle();

    kupaKur(); temasKur();
    $('yukleme').addEventListener('click', function () { root.location.reload(); });
    $('btnAntrenman').addEventListener('click', function () { var me=DT.live.identity();if(me)turBaslat(me.player,'antrenman',null); });
    $('btnResmi').addEventListener('click', function () {
      var k = oku(ANAHTAR.resmi, null);
      if (DT.live){DT.live.ensure().then(function(){var me=DT.live.identity();if(me)turBaslat(me.player,'resmi',null);}).catch(function(e){root.alert(e.message);});return;}
      if (k) turBaslat(k.karakter, 'resmi', k); else secimGoster('resmi');
    });
    $('btnSifirla').addEventListener('click', function () { sil(ANAHTAR.resmi); menuGoster(); });
    $('btnSes').addEventListener('click', sesDegistir);
    $('hudSes').addEventListener('click', sesDegistir);
    $('btnCubuk').addEventListener('click', function () { ayar.cubuk = !ayar.cubuk; ayarGuncelle(); });
    $('secimGeri').addEventListener('click', menuGoster);
    $('hudGeri').addEventListener('click', menuGoster);
    $('turMenu').addEventListener('click', menuGoster);
    $('turTekrar').addEventListener('click', function () { secimGoster(d.mod); });
    $('vurBtn').addEventListener('pointerdown', function (e) { if (e.isPrimary !== false) vur(); });
    $('vurBtn').addEventListener('click', function (e) { if (e.detail === 0) vur(); });
    $('cubukYol').addEventListener('pointerdown', vur);
    $('duzeltBtn').addEventListener('click', duzelt);
    $('devamBtn').addEventListener('click', devam);
    Array.prototype.forEach.call(doc.querySelectorAll('#falsoKutu button'), function (b) {
      b.addEventListener('click', function () { falsoSec(Number(b.getAttribute('data-falso'))); });
    });
    doc.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    menuGoster();
    root.requestAnimationFrame(dongu);
  }

  DT.oyun = { baslat: baslat, _durum: d, _vur: vur, _devam: devam, _kilitle: kilitle, _nisan: function (x, y) { d.aim = { x: x, y: y }; } };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', baslat); else baslat();
})(typeof globalThis !== 'undefined' ? globalThis : window);

