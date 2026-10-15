/* Müzik ve efekt sesleri (ayrı modül: ses.js'e dokunmaz). Genel "Ses" düğmesi kapalıyken hiçbir şey çalmaz; ayrıca "Müzik" ayarı vardır.
 * İki özgün döngü (ses dosyası gerekmez, tarayıcıda üretilir):  MENÜ (96 bpm, la minör, sakin pedli ve melodili),  MAÇ (118 bpm, tempolu ama arka planda, düşük ses).
 * İstersen gerçek parça koy: assets/ses/muzik-menu.(mp3|ogg|wav|m4a) ve assets/ses/muzik-mac.(...) varsa sentez yerine onlar döngüyle çalınır.
 * Efektler (kısa): gol fanfarı, seri, rozet, altın bölge, kaçan şut, tık. Müzik, vuruş ve tezahürat anında kısılır (kis).
 * Parçalar VERİ olarak tanımlıdır (olayUret): aynı olaylardan hem WebAudio çalar hem de render() ile WAV önizlemesi üretilir. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var AKOR={Am:[57,60,64],F:[53,57,60],C:[55,60,64],G:[55,59,62],Dm:[53,57,62],E:[56,59,64]},KOK={Am:45,F:41,C:48,G:43,Dm:50,E:40};
var SES={   // ses karakterleri: dalga, giriş/çıkış süresi (sn), alçak geçiren süzgeç (Hz)
 pad:{dalga:'triangle',a:.30,r:.55,lp:1500},bas:{dalga:'triangle',a:.012,r:.10,lp:700},basM:{dalga:'sawtooth',a:.008,r:.07,lp:520},arp:{dalga:'square',a:.004,r:.05,lp:2600},lead:{dalga:'square',a:.015,r:.14,lp:2200},
 kick:{dalga:'kick'},snare:{dalga:'snare'},hat:{dalga:'hat'},zil:{dalga:'sine',a:.003,r:.9,lp:9000},fanfar:{dalga:'square',a:.01,r:.25,lp:3000}};
var PARCALAR={
 menu:{bpm:96,bar:8,akor:['Am','F','C','G','Am','F','Dm','E'],
  lead:[[[0,76,4],[4,72,2],[6,74,2],[8,76,6]],[[0,77,4],[4,76,2],[6,72,2],[8,69,6]],[[0,72,4],[4,74,2],[6,76,2],[8,79,6]],[[0,79,4],[4,76,2],[6,74,2],[8,71,6]],
        [[0,76,4],[4,72,2],[6,74,2],[8,76,4],[12,79,4]],[[0,77,4],[4,81,2],[6,79,2],[8,77,6]],[[0,74,4],[4,77,2],[6,76,2],[8,74,6]],[[0,76,4],[4,80,2],[6,76,2],[8,71,6]]]},
 mac:{bpm:118,bar:8,akor:['Am','G','F','G','Am','G','F','E']}};
function bolumMs(ad){var p=PARCALAR[ad];return p.bar*16*60/p.bpm/4;}
/* olayUret(ad): bir döngünün olayları { t (sn), tur, midi, sure (sn), ses (0..1) } */
function olayUret(ad){var p=PARCALAR[ad],adim=60/p.bpm/4,o=[],tur=ad==='mac'?'basM':'bas';
 function ekle(b,s,t,midi,len,ses){o.push({t:(b*16+s)*adim,tur:t,midi:midi,sure:len*adim,ses:ses});}
 for(var b=0;b<p.bar;b++){var ak=p.akor[b],tri=AKOR[ak],kok=KOK[ak];
  if(ad==='menu'){
   tri.forEach(function(m){ekle(b,0,'pad',m,16,.075);});
   ekle(b,0,tur,kok,6,.20);ekle(b,8,tur,kok,4,.17);ekle(b,12,tur,kok,2,.13);
   ekle(b,0,'kick',0,1,.20);ekle(b,8,'kick',0,1,.17);ekle(b,4,'hat',0,1,.045);ekle(b,12,'hat',0,1,.045);
   p.lead[b].forEach(function(n){ekle(b,n[0],'lead',n[1],n[2],.085);});
  }else{
   for(var s=0;s<16;s++){var idx=[0,1,2,1][s%4],m=tri[idx]+12;ekle(b,s,'arp',m,1,.040);}
   [0,3,6,8,11,14].forEach(function(s2){ekle(b,s2,tur,kok,2,.15);});
   [0,4,8,12].forEach(function(s3){ekle(b,s3,'kick',0,1,.22);});[4,12].forEach(function(s4){ekle(b,s4,'snare',0,1,.10);});[2,6,10,14].forEach(function(s5){ekle(b,s5,'hat',0,1,.038);});
  }}
 o.sort(function(a,b){return a.t-b.t||(a.tur<b.tur?-1:1);});   // çalıcı zaman sırasına güvenir
 return o;}
var EFEKT={
 gol:[[0,72,.12],[.11,76,.12],[.22,79,.12],[.33,84,.55]].map(function(n){return{t:n[0],tur:'fanfar',midi:n[1],sure:n[2],ses:.20};}).concat([[.33,72,.55],[.33,67,.55]].map(function(n){return{t:n[0],tur:'fanfar',midi:n[1],sure:n[2],ses:.10};})),
 seri:[[0,76],[.09,79],[.18,83]].map(function(n){return{t:n[0],tur:'zil',midi:n[1]+12,sure:.5,ses:.16};}),
 rozet:[[0,88],[.14,93],[.28,100]].map(function(n){return{t:n[0],tur:'zil',midi:n[1],sure:.45,ses:.14};}),
 altin:[[0,96,.6,.18],[.04,103,.5,.07]].map(function(n){return{t:n[0],tur:'zil',midi:n[1],sure:n[2],ses:n[3]};}),
 kacti:[[0,57,.22],[.20,54,.22],[.40,50,.5]].map(function(n){return{t:n[0],tur:'lead',midi:n[1],sure:n[2],ses:.10};}),
 tik:[{t:0,tur:'hat',midi:0,sure:.04,ses:.10}]};
function frek(m){return 440*Math.pow(2,(m-69)/12);}
/* ---- Çevrimdışı render (WAV önizleme ve testler): aynı olaylar, basit sentez ---- */
function render(olaylar,sure,rate){rate=rate||22050;var n=Math.ceil(sure*rate),out=new Float32Array(n),seed=12345;function nz(){seed=(Math.imul(seed,1664525)+1013904223)|0;return((seed>>>0)/4294967296)*2-1;}
 olaylar.forEach(function(e){var k=SES[e.tur],i0=Math.floor(e.t*rate),len=Math.ceil((e.sure+(k.r||.1))*rate),ph=0,ysv=0;
  if(k.dalga==='kick'){for(var i=0;i<Math.ceil(.18*rate)&&i0+i<n;i++){var t=i/rate,f=150*Math.exp(-t*18)+45;ph+=2*Math.PI*f/rate;out[i0+i]+=Math.sin(ph)*Math.exp(-t*14)*e.ses*1.6;}return;}
  if(k.dalga==='snare'){var lp=0;for(var j=0;j<Math.ceil(.16*rate)&&i0+j<n;j++){var tj=j/rate,w=nz();lp+=.55*(w-lp);out[i0+j]+=(lp*Math.exp(-tj*26)*.9+Math.sin(2*Math.PI*190*tj)*Math.exp(-tj*30)*.5)*e.ses*1.4;}return;}
  if(k.dalga==='hat'){var pv=0;for(var h=0;h<Math.ceil(.05*rate)&&i0+h<n;h++){var th=h/rate,w2=nz(),hp=w2-pv;pv=w2;out[i0+h]+=hp*Math.exp(-th*90)*e.ses*1.2;}return;}
  var f0=frek(e.midi),alfa=1-Math.exp(-2*Math.PI*k.lp/rate);
  for(var q=0;q<len&&i0+q<n;q++){var tq=q/rate,x,fase=(ph%(2*Math.PI))/(2*Math.PI);ph+=2*Math.PI*f0/rate;
   if(k.dalga==='sine')x=Math.sin(ph);else if(k.dalga==='triangle')x=4*Math.abs(fase-.5)-1;else if(k.dalga==='square')x=fase<.5?1:-1;else x=2*fase-1;
   var env=tq<k.a?tq/k.a:1;if(tq>e.sure)env*=Math.max(0,1-(tq-e.sure)/k.r);if(k.dalga==='sine')env*=Math.exp(-tq*3.2);
   ysv+=alfa*(x-ysv);out[i0+q]+=ysv*env*e.ses;}});
 return out;}
function wav(veri,rate){var buf=Buffer.alloc(44+veri.length*2),pk=0;for(var i=0;i<veri.length;i++)pk=Math.max(pk,Math.abs(veri[i]));var g=pk>.9?.9/pk:1;
 buf.write('RIFF',0);buf.writeUInt32LE(36+veri.length*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(veri.length*2,40);
 for(var j=0;j<veri.length;j++)buf.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(veri[j]*g*32767))),44+j*2);return buf;}
/* ---- WebAudio çalıcı ---- */
var ctx=null,ana=null,duck=null,acik=false,muzikAcik=true,sahneAd=null,parca=null,timer=null,carpan=1,kayit={},kayitDenendi=false,seviye=.55;
function genelAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=seviye*carpan;duck=ctx.createGain();duck.gain.value=1;ana.connect(duck);duck.connect(ctx.destination);return true;}
function gurultu(sure){var n=Math.floor(ctx.sampleRate*sure),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;var s=ctx.createBufferSource();s.buffer=b;return s;}
function cal(e,t,cikis){var k=SES[e.tur],g=ctx.createGain();g.connect(cikis);
 if(k.dalga==='kick'){var o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(e.ses*1.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);o.start(t);o.stop(t+.2);return;}
 if(k.dalga==='snare'||k.dalga==='hat'){var s=gurultu(.18),f=ctx.createBiquadFilter();f.type=k.dalga==='hat'?'highpass':'bandpass';f.frequency.value=k.dalga==='hat'?7000:1800;g.gain.setValueAtTime(e.ses*1.3,t);g.gain.exponentialRampToValueAtTime(.0001,t+(k.dalga==='hat'?.05:.16));s.connect(f);f.connect(g);s.start(t);s.stop(t+.2);return;}
 var o2=ctx.createOscillator(),f2=ctx.createBiquadFilter();o2.type=k.dalga;o2.frequency.value=frek(e.midi);f2.type='lowpass';f2.frequency.value=k.lp;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(e.ses,t+k.a);g.gain.setValueAtTime(e.ses,t+Math.max(k.a,e.sure));g.gain.exponentialRampToValueAtTime(.0001,t+e.sure+k.r);o2.connect(f2);f2.connect(g);o2.start(t);o2.stop(t+e.sure+k.r+.05);}
/* parça çalıcı: ileriye bakan zamanlayıcı (120 ms pencere), döngü */
function parcaBaslat(ad){var olay=olayUret(ad),uz=bolumMs(ad),g=ctx.createGain();g.gain.value=0;g.connect(ana);var P={ad:ad,olay:olay,uz:uz,g:g,t0:ctx.currentTime+.08,tur:0,idx:0,bitti:false,gercek:null};
 if(kayit[ad]){var s=ctx.createBufferSource();s.buffer=kayit[ad];s.loop=true;s.connect(g);s.start();P.gercek=s;}
 g.gain.linearRampToValueAtTime(1,ctx.currentTime+1.4);return P;}
function ilerle(P){if(!P||P.gercek||P.bitti)return;var son=ctx.currentTime+.14;
 while(true){var e=P.olay[P.idx],t=P.t0+P.tur*P.uz+e.t;if(t>son)break;if(t>=ctx.currentTime-.02)cal(e,Math.max(t,ctx.currentTime),P.g);P.idx++;if(P.idx>=P.olay.length){P.idx=0;P.tur++;}}}
function adim(){if(!genelAcik()||!muzikAcik||!ctx)return;ilerle(parca);}
function kayitYukle(){if(kayitDenendi||!ctx||!root.fetch)return;kayitDenendi=true;['menu','mac'].forEach(function(ad){var denemeler=['mp3','ogg','wav','m4a'],i=0;(function dene(){if(i>=denemeler.length)return;var u='assets/ses/muzik-'+ad+'.'+denemeler[i++];root.fetch(u).then(function(r){return r&&r.ok?r.arrayBuffer():null;}).then(function(b){return b?ctx.decodeAudioData(b):null;}).then(function(buf){if(buf)kayit[ad]=buf;else dene();}).catch(dene);})();});}
function sahne(ad){if(!PARCALAR[ad]&&ad!==null&&ad!=='sessiz')return;var hedef=PARCALAR[ad]?ad:null;if(hedef===sahneAd&&(hedef===null||parca))return;sahneAd=hedef;
 if(!ctx)return;if(parca){var eski=parca;eski.bitti=true;try{eski.g.gain.cancelScheduledValues(ctx.currentTime);eski.g.gain.setValueAtTime(eski.g.gain.value||1,ctx.currentTime);eski.g.gain.linearRampToValueAtTime(0,ctx.currentTime+1.0);if(eski.gercek)eski.gercek.stop(ctx.currentTime+1.05);}catch(e){}parca=null;}
 if(hedef&&genelAcik()&&muzikAcik)parca=parcaBaslat(hedef);}
function baslat(){if(!kur())return;if(ctx.state==='suspended'&&ctx.resume)ctx.resume();kayitYukle();if(!timer&&root.setInterval)timer=root.setInterval(adim,25);if(sahneAd&&!parca&&genelAcik()&&muzikAcik)parca=parcaBaslat(sahneAd);}
function durdur(){if(parca){parca.bitti=true;try{parca.g.gain.setValueAtTime(0,ctx.currentTime);if(parca.gercek)parca.gercek.stop();}catch(e){}parca=null;}}
var api={
 seviyeAyarla:function(v){carpan=Math.max(0,Math.min(1,+v||0));if(ana)ana.gain.value=seviye*carpan;},   // müzik ve müzik efektleri ses düzeyi
 ayarla:function(v){acik=!!v;if(acik)baslat();else durdur();},
 muzikAyarla:function(v){muzikAcik=!!v;if(!muzikAcik)durdur();else if(acik&&ctx)baslat();},
 sahne:sahne,
 /* kis(sure, oran): müziği kısa süre kısar (vuruş ve tezahürat anında) */
 kis:function(sure,oran){if(!ctx||!duck)return;var t=ctx.currentTime;try{duck.gain.cancelScheduledValues(t);duck.gain.setValueAtTime(duck.gain.value,t);duck.gain.linearRampToValueAtTime(oran===undefined?.3:oran,t+.15);duck.gain.linearRampToValueAtTime(1,t+(sure||2));}catch(e){}},
 efekt:function(ad){if(!genelAcik()||!ctx||!EFEKT[ad])return false;var t=ctx.currentTime+.02,out=ctx.createGain();out.gain.value=1;out.connect(ctx.destination);EFEKT[ad].forEach(function(e){cal(e,t+e.t,out);});return true;},
 bolumMs:bolumMs,olayUret:olayUret,render:render,wav:wav,EFEKT:EFEKT,PARCALAR:PARCALAR,AKOR:AKOR,KOK:KOK,SES:SES,
 _durum:function(){return{acik:acik,muzikAcik:muzikAcik,sahne:sahneAd,calan:parca?parca.ad:null,gercek:!!(parca&&parca.gercek),kayit:Object.keys(kayit)};}
};
if(root.addEventListener)root.addEventListener('pointerdown',function(){if(ctx&&ctx.state==='suspended'&&acik&&ctx.resume)ctx.resume();});
DT.muzik=api;
})(typeof globalThis!=='undefined'?globalThis:window);
