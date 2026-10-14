/* Cihaz uyumluluk raporu: tarayıcının oyunun ihtiyaç duyduğu özellikleri destekleyip desteklemediğini ve çizim hızını ölçer.
 * `?sestest=1` panelindeki "Cihaz raporu" düğmesinden çalışır; çıktı kopyalanıp yapıştırılabilir. Oyun sonucuna ve sunucuya karışmaz. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
function dene(f,vars){try{var v=f();return v===undefined?vars:v;}catch(e){return vars;}}
function ortam(env){env=env||root;var nav=env.navigator||{},scr=env.screen||{},doc=env.document;
 var c={};c.ua=String(nav.userAgent||'?').replace(/\s+/g,' ').slice(0,120);
 c.ekran={w:scr.width||0,h:scr.height||0,dpr:env.devicePixelRatio||1,iw:env.innerWidth||0,ih:env.innerHeight||0,yon:dene(function(){return env.screen.orientation.type;},'?')};
 c.guvenliAlan=dene(function(){var p=doc.createElement('div');p.style.cssText='position:fixed;left:0;top:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);visibility:hidden';doc.body.appendChild(p);var cs=env.getComputedStyle(p),r=[cs.paddingTop,cs.paddingRight,cs.paddingBottom,cs.paddingLeft].join(' ');doc.body.removeChild(p);return r;},'?');
 c.dokunma=dene(function(){return nav.maxTouchPoints||0;},0);
 c.ses=dene(function(){var AC=env.AudioContext||env.webkitAudioContext;return AC?'var':'yok';},'yok');
 c.konusma=dene(function(){if(!env.speechSynthesis||!env.SpeechSynthesisUtterance)return{var:false,tr:false,adet:0};var v=env.speechSynthesis.getVoices()||[];return{var:true,tr:v.some(function(x){return /^tr/i.test(x.lang);}),adet:v.length};},{var:false,tr:false,adet:0});
 c.paylas=dene(function(){var s={metin:typeof nav.share==='function',dosya:false};if(typeof nav.canShare==='function'&&env.File)s.dosya=!!nav.canShare({files:[new env.File(['x'],'a.png',{type:'image/png'})]});return s;},{metin:false,dosya:false});
 c.titresim=dene(function(){return typeof nav.vibrate==='function';},false);
 c.tuval=dene(function(){var cv=doc.createElement('canvas'),g=cv.getContext('2d');return{iki:!!g,ellipse:!!(g&&g.ellipse),roundRect:!!(g&&g.roundRect),offscreen:typeof env.OffscreenCanvas==='function'};},{iki:false,ellipse:false,roundRect:false,offscreen:false});
 c.depo=dene(function(){env.localStorage.setItem('dt_cihaz_test','1');var ok=env.localStorage.getItem('dt_cihaz_test')==='1';env.localStorage.removeItem('dt_cihaz_test');return ok;},false);
 c.donanim={cekirdek:nav.hardwareConcurrency||0,bellek:nav.deviceMemory||0,ag:dene(function(){return nav.connection.effectiveType;},'?')};
 c.erisim={hareketAz:dene(function(){return env.matchMedia('(prefers-reduced-motion: reduce)').matches;},false),koyu:dene(function(){return env.matchMedia('(prefers-color-scheme: dark)').matches;},false),uygulama:dene(function(){return env.matchMedia('(display-mode: standalone)').matches||nav.standalone===true;},false)};
 return c;}
/* Çizim hız testi: oyuna benzer bir yük (yol dolgusu, görüntü çizimi, gradyan, kırpma) senkron döngüde ölçülür. Düşük ms = iyi. */
function hizTesti(yap,kare){kare=kare||50;var cv=yap(390,300),g=cv.getContext('2d'),t=[];var tuval2=yap(64,64),g2=tuval2.getContext('2d');g2.fillStyle='#4f9fd8';g2.fillRect(0,0,64,64);
 var simdi=(root.performance&&root.performance.now)?function(){return root.performance.now();}:function(){return Date.now();};
 for(var f=0;f<kare+6;f++){var t0=simdi();var gr=g.createLinearGradient(0,0,0,300);gr.addColorStop(0,'#101820');gr.addColorStop(1,'#1d3a2a');g.fillStyle=gr;g.fillRect(0,0,390,300);
  for(var i=0;i<160;i++){g.fillStyle='rgba('+(40+i%200)+','+(90+i%120)+',160,.8)';g.beginPath();g.moveTo(i*2%390,(i*7)%300);g.lineTo((i*2+30)%390,(i*7+10)%300);g.lineTo((i*2+12)%390,(i*7+40)%300);g.closePath();g.fill();g.stroke();}
  for(var k=0;k<40;k++){g.save();g.beginPath();g.rect(k*8,k*5,50,30);g.clip();g.drawImage(tuval2,k*8-5,k*5-5,64,64);g.restore();}
  var ms=simdi()-t0;if(f>=6)t.push(ms);}
 t.sort(function(a,b){return a-b;});var ort=t.reduce(function(a,b){return a+b;},0)/t.length,p95=t[Math.min(t.length-1,Math.floor(t.length*.95))];
 return{ort:ort,p95:p95,kare:t.length,sinif:ort<8?'hızlı':ort<16?'iyi':ort<30?'sınırda':'yavaş'};}
function satir(ok,ad,ayr,ipucu){return (ok?'✓ ':'✗ ')+ad+(ayr?': '+ayr:'')+(!ok&&ipucu?'  → '+ipucu:'');}
function rapor(env,hiz){var c=ortam(env),s=['DURAN TOP CİHAZ RAPORU','Cihaz: '+c.ua,'Ekran: '+c.ekran.w+'×'+c.ekran.h+' @'+c.ekran.dpr+'x | pencere '+c.ekran.iw+'×'+c.ekran.ih+' ('+c.ekran.yon+') | güvenli alan: '+c.guvenliAlan,
 'Donanım: '+c.donanim.cekirdek+' çekirdek, bellek '+(c.donanim.bellek||'?')+' GB, ağ '+c.donanim.ag,
 satir(c.dokunma>0,'Dokunmatik',c.dokunma+' nokta','parmakla denenmeli'),satir(c.ses==='var','Ses (AudioContext)',c.ses,'ses ve müzik çalışmaz'),
 satir(c.konusma.var,'Konuşma sentezi',c.konusma.var?(c.konusma.tr?'Türkçe ses var ('+c.konusma.adet+' ses)':'Türkçe ses YOK ('+c.konusma.adet+' ses)'):'yok','gol tezahürat sesi çalmaz'),
 satir(c.paylas.metin,'Paylaş (metin)',String(c.paylas.metin),'panoya kopyalama kullanılır'),satir(c.paylas.dosya,'Paylaş (görsel dosya)',String(c.paylas.dosya),'görsel indirilir, elle paylaşılır'),
 satir(c.titresim,'Titreşim',String(c.titresim),'iPhone Safari titreşimi desteklemez, normal'),satir(c.tuval.iki,'Canvas 2B',String(c.tuval.iki),'oyun çalışmaz'),satir(c.tuval.ellipse,'Canvas ellipse',String(c.tuval.ellipse),'bazı çizimler eksik'),satir(c.tuval.roundRect,'Canvas roundRect',String(c.tuval.roundRect),'balonlar köşeli çizilir (sorun değil)'),
 satir(c.depo,'Yerel depolama',String(c.depo),'rozetler, rekor ve ayarlar kaydedilmez (özel gezinti?)'),
 'Erişim: hareketi azalt='+c.erisim.hareketAz+' (oyun bunu yok sayar, Ayarlar\'dan değiştirilebilir) | koyu mod='+c.erisim.koyu+' | ana ekran uygulaması='+c.erisim.uygulama];
 if(hiz)s.push('Çizim hız testi: ort '+hiz.ort.toFixed(1)+' ms/kare, p95 '+hiz.p95.toFixed(1)+' ms → '+hiz.sinif+' (oyunun ağır sahnesine benzer yük; <16 ms akıcı beklenir)');
 return s.join('\n');}
DT.cihaz={ortam:ortam,hizTesti:hizTesti,rapor:rapor};
})(typeof globalThis!=='undefined'?globalThis:window);
