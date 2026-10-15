/* Ses test paneli (`?sestest=1`): tüm sesleri, müziği ve tezahüratı telefonda tek tek dinletir; gerçek kayıt mı sentez mi olduğunu gösterir.
 * Ayrıca "Cihaz raporu" üretir. Oyun akışına karışmaz; yalnız adreste ?sestest=1 varsa açılır. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var SESLER=[['vurus','Vuruş'],['direk','Direk'],['file','Ağ'],['kurtaris','Kurtarış'],['baraj','Baraj'],['gol','Gol uğultusu'],['ah','"Ahhh"'],['islik','Düdük']];
function ac(opt){opt=opt||{};var doc=opt.doc||root.document;if(!doc)return null;var kap=doc.createElement('div');kap.id='sesTest';kap.className='ses-test';
 var log=function(m){durum.textContent=m;},durum=doc.createElement('div');durum.className='ses-test-durum';
 function dugme(ad,f){var b=doc.createElement('button');b.type='button';b.textContent=ad;b.className='ses-test-btn';b.addEventListener('click',function(){try{f();}catch(e){log('Hata: '+e.message);}});kap.appendChild(b);return b;}
 function baslik(m){var h=doc.createElement('div');h.className='ses-test-baslik';h.textContent=m;kap.appendChild(h);}
 baslik('Ses testi — önce "Sesi aç"a bas');
 dugme('🔊 Sesi aç',function(){if(DT.ses)DT.ses.ayarla(true);if(DT.tezahurat)DT.tezahurat.ayarla(true);if(DT.muzik)DT.muzik.ayarla(true);log('Ses açık. Sesin kısık olmadığını ve telefonun sessiz modda olmadığını kontrol et.');});
 baslik('Efekt sesleri');SESLER.forEach(function(s){var gercek=DT.ses&&DT.ses.kayitVarMi&&DT.ses.kayitVarMi(s[0]);dugme(s[1]+(gercek?' (gerçek kayıt)':''),function(){DT.ses.cal(s[0],{hiz:26});log(s[1]+' çalındı'+(gercek?' — gerçek kayıt':' — sentez'));});});
 baslik('Spiker ve tribün');dugme('Spiker: gol',function(){var r=DT.tezahurat&&DT.tezahurat.golSes((Math.random()*1000)|0,{});log('Spiker (gol): '+(r==='spiker'?'çaldı':'çalmadı: spiker kaydı yok (assets/ses/spiker-gol-1.mp3 ...)'));});
 dugme('Spiker: gollazo',function(){var r=DT.tezahurat&&DT.tezahurat.golSes((Math.random()*1000)|0,{sert:true});log('Spiker (gollazo): '+(r==='spiker'?'çaldı':'çalmadı: spiker kaydı yok (assets/ses/spiker-gollazo-1.mp3 ...)'));});
 dugme('Alay (yuh)',function(){var r=DT.tezahurat&&DT.tezahurat.alay();log('Alay: '+(r?'çaldı':'çalmadı (kayıt yok)'));});
 baslik('Müzik');dugme('Menü müziği',function(){DT.muzik.sahne('menu');log('Menü müziği (sentez ya da assets/ses/muzik-menu.* kaydı)');});dugme('Maç müziği',function(){DT.muzik.sahne('mac');log('Maç müziği');});dugme('Müziği durdur',function(){DT.muzik.sahne('sessiz');log('Müzik durdu');});
 baslik('Müzik efektleri');['gol','seri','rozet','altin','kacti'].forEach(function(e){dugme(e,function(){DT.muzik.efekt(e);log('Efekt: '+e);});});
 baslik('Kayıt durumu');var kd=doc.createElement('div');kd.className='ses-test-kayit';kap.appendChild(kd);
 function kayitDurumu(){var z=DT.tezahurat&&DT.tezahurat._test?DT.tezahurat._test():{},m=DT.muzik&&DT.muzik._durum?DT.muzik._durum():{kayit:[]},v=function(a){return a?'✓ gerçek':'• sentez';};
  kd.textContent=['Direk: '+v(DT.ses&&DT.ses.kayitVarMi&&DT.ses.kayitVarMi('direk')),'Ağ: '+v(DT.ses&&DT.ses.kayitVarMi&&DT.ses.kayitVarMi('file')),'"Ahhh": '+(z.ah?'✓ gerçek':'• yok'),'Yuh: '+(z.yuh?'✓ gerçek':'• yok'),'Spiker kayıtları: gol '+(z.spikerGol||0)+' adet, gollazo '+(z.spikerGollazo||0)+' adet','Menü müziği: '+(m.kayit.indexOf('menu')>=0?'✓ gerçek':'• sentez'),'Maç müziği: '+(m.kayit.indexOf('mac')>=0?'✓ gerçek':'• sentez')].join('\n');}
 dugme('Kayıt durumunu yenile',function(){kayitDurumu();log('Kayıtlar yeniden okundu');});kayitDurumu();
 baslik('Cihaz');dugme('Cihaz raporu (hız testi dahil)',function(){var yap=opt.tuvalYap||function(w,h){var c=doc.createElement('canvas');c.width=w;c.height=h;return c;},hiz=DT.cihaz?DT.cihaz.hizTesti(yap,50):null,m=DT.cihaz?DT.cihaz.rapor(opt.env||root,hiz):'cihaz modülü yok';durum.textContent=m;try{var pr=root.navigator&&root.navigator.clipboard?root.navigator.clipboard.writeText(m):null;if(pr&&pr.catch)pr.catch(function(){});}catch(e){}});   // pano izni reddedilirse sessizce geç; rapor ekranda zaten görünür
 dugme('Kapat',function(){if(kap.parentNode)kap.parentNode.removeChild(kap);});
 kap.appendChild(durum);(opt.kok||doc.body).appendChild(kap);return kap;}
function baslat(){try{if(root.location&&/[?&]sestest=1/.test(root.location.search||''))ac();}catch(e){}}
DT.sestest={ac:ac,baslat:baslat,SESLER:SESLER};
})(typeof globalThis!=='undefined'?globalThis:window);
