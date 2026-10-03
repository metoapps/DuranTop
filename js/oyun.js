/* Duran Top - oyun akışı. Ekranlar, dokunmatik kontrol, vuruş animasyonu ve yerel kayıt.
 * Sonuç hesabı fizik.js'de; bu dosya yalnızca girdi toplar ve sonucu gösterir. */
(function (root) {
  'use strict';
  var DT = root.DT, A = DT.AYAR, doc = root.document;
  var $ = function (id) { return doc.getElementById(id); };
  var simdi = function () { return root.performance.now(); };

  var ANAHTAR = { ayar: 'dt_ayar', resmi: 'dt_resmi', enIyi: 'dt_en_iyi', gecmis: 'dt_gecmis' };
  var VURUS_SAYISI = A.pozisyonlar.length;

  var ayar = { ses: false, cubuk: true };
  var d = {
    ekran: 'menu', mod: 'antrenman', karakter: 'meto', tur: '', idx: 0, sonuclar: [],
    pos: null, faz: 'bos', aim: null, kilit: false, duzeltHak: 1, falso: 0, seed: 1,
    onizleme: null, barajGeo: null, cubukBasla: 0, an: null, son: null
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
    d.faz = 'bos';
    ekranGoster('menu');
    var kayit = oku(ANAHTAR.resmi, null);
    $('btnResmi').textContent = kayit ? 'Resmi tura devam (' + kayit.idx + '/' + VURUS_SAYISI + ')' : 'Resmi tur';
    $('btnSifirla').hidden = !kayit;
    var en = oku(ANAHTAR.enIyi, null);
    $('menuNot').textContent = en ? 'Bu telefonda en iyi tur: ' + en + ' puan. Skorlar yalnızca bu telefonda tutulur.' : 'Prototip. Skorlar yalnızca bu telefonda tutulur.';
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
    d.mod = mod;
    ekranGoster('secim');
    $('secimNot').textContent = mod === 'resmi'
      ? 'Resmi tur: aynı beş pozisyon, zamanlama zorunlu. Skor bu telefona yazılır.'
      : 'Antrenman: skora yazılmaz, kaleci daha yavaş.';
    var iz = $('secimIzgara'); iz.innerHTML = '';
    DT.KARAKTER.forEach(function (k) {
      var b = doc.createElement('button'); b.type = 'button'; b.className = 'secim-kart';
      b.innerHTML = '<img alt="" src="assets/menu/' + k.id + '_bekle.png?v=20261003c"><span>' + k.ad + '</span>';
      b.addEventListener('click', function () { turBaslat(k.id, mod, null); });
      iz.appendChild(b);
    });
  }

  function turKimligi() { return Math.floor(Math.random() * 1e9).toString(36); }

  function turBaslat(karakter, mod, kayit) {
    if (!DT.cizim.hazir()) return;
    d.karakter = karakter; d.mod = mod;
    if (kayit) {
      d.tur = kayit.tur; d.idx = kayit.idx; d.sonuclar = kayit.sonuclar || [];
      if (d.idx >= VURUS_SAYISI) { d.pos = A.pozisyonlar[0]; ekranGoster('tursonu'); turSonu(); return; }
    } else {
      d.tur = turKimligi(); d.idx = 0; d.sonuclar = [];
      if (mod === 'resmi') yaz(ANAHTAR.resmi, { tur: d.tur, karakter: karakter, idx: 0, sonuclar: [], acik: null });
    }
    ekranGoster('oyun');
    vurusHazirla(kayit && kayit.acik ? kayit.acik : null);
  }

  function toplam() { return d.sonuclar.reduce(function (t, s) { return t + s.puan; }, 0); }

  function vurusHazirla(acik) {
    d.pos = A.pozisyonlar[d.idx];
    DT.cizim.sahneKur(d.pos);
    // baraj konumu nişandan bağımsız; önizleme hesabından alınır
    var ornek = DT.fizik.hesapla({ pos: d.pos, aim: { x: 0, y: 1.2 }, falso: 0, zaman: 0.5, seed: 1, antrenman: true });
    d.barajGeo = ornek.baraj;
    d.faz = 'nisan'; d.aim = null; d.kilit = false; d.duzeltHak = 1; d.falso = 0; d.onizleme = null; d.an = null; d.son = null;
    d.seed = (Math.random() * 2147483647) | 0;
    $('sonuc').hidden = true; $('alt').hidden = true;
    $('hudVurus').textContent = 'Vuruş ' + (d.idx + 1) + '/' + VURUS_SAYISI;
    $('hudTip').textContent = d.pos.ad + (d.mod === 'antrenman' ? ' · antrenman' : '');
    $('hudPuan').textContent = toplam();
    $('falsoKutu').hidden = d.pos.tip !== 'frikik';
    falsoSec(0);
    $('ipucu').hidden = false;
    $('ipucu').textContent = d.pos.tip === 'frikik'
      ? 'Barajın üstünden ya da yanından geçecek yere dokun, sürükle, bırak.'
      : 'Kaleye dokun, parmağını sürükle, bırak. Nişan kilitlenir.';
    if (acik) {   // sayfa yenilendi: aynı vuruş kaldığı yerden devam eder
      d.seed = acik.seed; d.aim = acik.aim; d.duzeltHak = acik.duzeltHak;
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
    d.aim = { x: Math.max(-4.6, Math.min(4.6, k.x)), y: Math.max(0.05, Math.min(3.1, k.y)) };
  }
  function girisBagla() {
    var cv = $('sahne'), basili = false;
    cv.addEventListener('pointerdown', function (e) {
      if (d.faz !== 'nisan' || d.kilit) return;
      basili = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* yok say */ }
      nisanGuncelle(e);
    });
    cv.addEventListener('pointermove', function (e) { if (basili && d.faz === 'nisan' && !d.kilit) nisanGuncelle(e); });
    function birak() { if (!basili) return; basili = false; if (d.faz === 'nisan' && !d.kilit && d.aim) kilitle(false); }
    cv.addEventListener('pointerup', birak);
    cv.addEventListener('pointercancel', function () { basili = false; });
  }

  function onizlemeHesapla() {
    if (!d.aim || d.pos.tip !== 'frikik') { d.onizleme = null; return; }
    var r = DT.fizik.hesapla({ pos: d.pos, aim: d.aim, falso: d.falso, zaman: cubukAktif() ? 0.5 : null, seed: 1, antrenman: true });
    d.onizleme = r.yol.filter(function (o) { return o.t <= r.ucusT + 1e-6; });
  }

  function kilitle(yenilenmis) {
    d.kilit = true;
    onizlemeHesapla();
    $('ipucu').hidden = true;
    $('alt').hidden = false;
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
    k.acik = d.kilit ? { aim: d.aim, falso: d.falso, seed: d.seed, duzeltHak: d.duzeltHak } : null;
    yaz(ANAHTAR.resmi, k);
  }
  function duzelt() {
    if (!d.kilit || d.duzeltHak <= 0 || d.faz !== 'nisan') return;
    d.duzeltHak--; d.kilit = false;
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
    if (d.faz !== 'nisan' || !d.kilit || !DT.cizim.hazir()) return;
    var now = simdi();
    var zaman = cubukAktif() ? cubukDegeri(now) : null;
    var girdi = { pos: d.pos, aim: d.aim, falso: d.falso, zaman: zaman, seed: d.seed, antrenman: d.mod === 'antrenman' };
    var r = DT.fizik.hesapla(girdi);
    var p = DT.puan.puanla(d.pos.tip, r);
    var giris = { ad: d.pos.ad, sonuc: r.sonuc, puan: p.puan, zaman: p.zaman, zor: p.zor, taban: p.taban, gol: p.gol };
    gecerliSonuc = { girdi: girdi, r: r, p: p, giris: giris };
    d.faz = 'vurus';
    d.an = { t0: now, on: 0.32, vurdu: false, olay: false, bitti: false };
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

  var SONUC_SES = { gol: 'file', direk_gol: 'direk', direk_disari: 'direk', kurtaris: 'kurtaris', baraj: 'baraj', aut: null };

  function cizimDurumu(now) {
    var R = A.kale.topYaricap, pos = d.pos;
    var B = { x: pos.bx, y: R, z: 0 };
    var out = {
      top: B, topAci: 0, baraj: d.barajGeo,
      kaleci: { x: Math.sin(now / 700) * 0.12, y: A.kaleci.baslangicY, ilerleme: 0, yon: 0 },
      oyuncu: { karakter: d.karakter, poz: 'vurus1', aim: d.aim, falso: d.falso, ilerleme: 0 }
    };
    if (d.faz === 'nisan') {
      if (d.aim) out.nisan = { aim: d.aim, kilit: d.kilit, onizleme: d.onizleme };
    } else if (d.faz === 'vurus' && d.an) {
      var r = gecerliSonuc.r, an = d.an, el = (now - an.t0) / 1000, simT = el - an.on;
      out.oyuncu.ilerleme = Math.max(0, Math.min(1, el / (an.on + 0.28)));
      out.oyuncu.temas = an.on / (an.on + 0.28);
      out.oyuncu.yol = r.yol;
      out.oyuncu.poz = el < an.on ? 'vurus1' : (el < an.on + 0.10 ? 'vurus2' : 'vurus3');
      if (simT > 0) {
        if (!an.vurdu) { an.vurdu = true; DT.ses.cal('vurus'); }
        var sonT = r.yol[r.yol.length - 1].t, tt = Math.min(simT, sonT);
        out.top = yolOrnek(r.yol, tt); out.topAci = simT * 16;
        out.kaleci = r.kaleci.konum(tt);
        var se = simT - r.olayT;
        if (se >= 0) {
          if (!an.olay) {
            an.olay = true;
            var ses = SONUC_SES[r.sonuc]; if (ses) DT.ses.cal(ses);
            if (r.sonuc === 'gol' || r.sonuc === 'direk_gol') DT.ses.cal('gol');
            else if (r.sonuc !== 'aut') DT.ses.cal('ah');
          }
          if (se < 0.3 && r.sonuc !== 'aut') out.sarsinti = 7 * (1 - se / 0.3);
          if ((r.sonuc === 'gol' || r.sonuc === 'direk_gol') && se < 0.4) out.flas = 0.3 * (1 - se / 0.4);
        }
        if (simT >= sonT + 0.3 && !an.bitti) { an.bitti = true; d.son = { top: out.top, kaleci: out.kaleci }; sonucGoster(); }
      }
    } else if (d.faz === 'sonuc' && d.son) {
      out.top = d.son.top; out.kaleci = d.son.kaleci;
      var gol = gecerliSonuc.r.sonuc === 'gol' || gecerliSonuc.r.sonuc === 'direk_gol';
      out.oyuncu = null;
      out.onKarakter = { karakter: d.karakter, poz: gol ? 'sevinc' : 'kacirma', sure: (now - d.sonucBasla) / 1000, gol: gol };
    }
    return out;
  }

  /* ---------- sonuç ---------- */
  var BASLIK = { gol: 'GOL', direk_gol: 'DİREKTEN GOL', direk_disari: 'DİREK', kurtaris: 'KURTARDI', baraj: 'BARAJ', aut: 'AUT' };

  function neden(r, girdi) {
    var h = r.hata, zamanli = typeof girdi.zaman === 'number';
    switch (r.sonuc) {
      case 'baraj': return 'Top barajda kaldı. Daha yükseğe nişan al ya da falsoyla duvarın yanından dolandır.';
      case 'kurtaris': return 'Kaleci yetişti. Direğe daha yakın bir noktaya nişan al.';
      case 'direk_disari': return 'Direk! Birkaç santim içeride olsaydı gol olurdu.';
      case 'direk_gol': return 'Direkten içeri girdi.';
      case 'aut':
        if (zamanli && h > 0.08) return 'Geç bastın, top yukarı gitti. Bandın ortasında bas.';
        if (zamanli && h < -0.08) return 'Erken bastın, top alçak ve yavaş gitti.';
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
    $('turKarakter').src = 'assets/menu/' + d.karakter + '_' + (gol >= 3 ? 'sevinc' : (gol === 0 ? 'kacirma' : 'bekle')) + '.png?v=20261003c';
    $('turBaslik').textContent = gol + ' gol, ' + VURUS_SAYISI + ' vuruş';
    $('turToplam').textContent = t;
    var ADLAR = { gol: 'Gol', direk_gol: 'Direkten gol', direk_disari: 'Direkten döndü', kurtaris: 'Kurtardı', baraj: 'Baraja çarptı', aut: 'Aut' };
    var liste = $('turListe'); liste.innerHTML = '';
    d.sonuclar.forEach(function (s) {
      var li = doc.createElement('li');
      li.innerHTML = '<span class="ad">' + s.ad + '<span class="sonuc-ad">' + ADLAR[s.sonuc] + '</span></span><span class="p' + (s.puan ? '' : ' sifir') + '">' + s.puan + '</span>';
      liste.appendChild(li);
    });
    if (d.mod === 'resmi') {
      var en = oku(ANAHTAR.enIyi, 0), gecmis = oku(ANAHTAR.gecmis, []);
      gecmis.push({ karakter: d.karakter, puan: t, tarih: new Date().toISOString() });
      yaz(ANAHTAR.gecmis, gecmis.slice(-20));
      if (t > en) yaz(ANAHTAR.enIyi, t);
      sil(ANAHTAR.resmi);
      $('turNot').textContent = (t > en ? 'Bu telefonda yeni en iyi tur. ' : 'Bu telefonda en iyi tur: ' + en + ' puan. ') + 'Ortak skor tablosu sonraki aşamada.';
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
      if (d.pos) {
        var cd = d.faz === 'menu' || d.ekran !== 'oyun' ? { top: { x: d.pos.bx, y: A.kale.topYaricap, z: 0 }, kaleci: { x: Math.sin(now / 900) * 0.15, y: 1, ilerleme: 0, yon: 0 } } : cizimDurumu(now);
        DT.cizim.ciz(cd);
      }
    }
    root.requestAnimationFrame(dongu);
  }

  /* ---------- başlat ---------- */
  function kadroDoldur() {
    var k = $('kadro'); k.innerHTML = '';
    DT.KARAKTER.forEach(function (c) {
      var im = doc.createElement('img'); im.alt = ''; im.src = 'assets/menu/' + c.id + '_bekle.png?v=20261003c'; k.appendChild(im);
    });
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

    $('yukleme').addEventListener('click', function () { root.location.reload(); });
    $('btnAntrenman').addEventListener('click', function () { secimGoster('antrenman'); });
    $('btnResmi').addEventListener('click', function () {
      var k = oku(ANAHTAR.resmi, null);
      if (k) turBaslat(k.karakter, 'resmi', k); else secimGoster('resmi');
    });
    $('btnSifirla').addEventListener('click', function () { sil(ANAHTAR.resmi); menuGoster(); });
    $('btnSes').addEventListener('click', sesDegistir);
    $('hudSes').addEventListener('click', sesDegistir);
    $('btnCubuk').addEventListener('click', function () { ayar.cubuk = !ayar.cubuk; ayarGuncelle(); });
    $('secimGeri').addEventListener('click', menuGoster);
    $('hudGeri').addEventListener('click', menuGoster);
    $('turMenu').addEventListener('click', menuGoster);
    $('turTekrar').addEventListener('click', function () { turBaslat(d.karakter, d.mod, null); });
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
