/* Müzik ve efekt sesleri (ayrı modül: ses.js'e dokunmaz). Genel "Ses" düğmesi kapalıyken hiçbir şey çalmaz; ayrıca "Müzik" ayarı vardır.
 * Menü: üç lisanslı, tam aranjmanlı rock/elektronik/funk kayıt sırayla çalar. Dosya yüklenemezse mevcut yerel sentez yedektir. MAÇ (118 bpm) korunur.
 * Menü kayıtları MENU_KAYIT ile eşlenir; yalnız mevcut ve sonraki kayıt hazırlanır. İsteğe bağlı muzik-mac dosyası desteği korunur. Kaynak/lisans: assets/ses/MUZIK-KAYNAKLAR.txt.
 * Efektler (kısa): gol fanfarı, seri, rozet, altın bölge, kaçan şut, tık. Müzik, vuruş ve tezahürat anında kısılır (kis).
 * Parçalar VERİ olarak tanımlıdır (olayUret): aynı olaylardan hem WebAudio çalar hem de render() ile WAV önizlemesi üretilir. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var AKOR={Am:[57,60,64],F:[53,57,60],C:[55,60,64],G:[55,59,62],Dm:[53,57,62],E:[56,59,64]},KOK={Am:45,F:41,C:48,G:43,Dm:50,E:40};
var SES={   // ses karakterleri: dalga, giriş/çıkış süresi (sn), alçak geçiren süzgeç (Hz)
 piano:{dalga:'sine',a:.018,r:.30,lp:2800},pluk:{dalga:'triangle',a:.008,r:.22,lp:1900},soft:{dalga:'sine',a:.08,r:.40,lp:1600},
 pad:{dalga:'triangle',a:.30,r:.55,lp:1500},bas:{dalga:'triangle',a:.012,r:.10,lp:700},basM:{dalga:'sawtooth',a:.008,r:.07,lp:520},arp:{dalga:'square',a:.004,r:.05,lp:2600},lead:{dalga:'square',a:.015,r:.14,lp:2200},
 kick:{dalga:'kick'},snare:{dalga:'snare'},hat:{dalga:'hat'},zil:{dalga:'sine',a:.003,r:.9,lp:9000},fanfar:{dalga:'square',a:.01,r:.25,lp:3000}};
var PARCALAR={
 "menu":{"bpm":104,"bar":8,"akor":["Am","Dm","F","C","Am","F","Dm","E"],"lead":[[[0,69,2],[3,72,2],[6,76,2],[10,74,2],[13,72,2]],[[0,74,3],[4,77,2],[8,76,3],[12,74,2]],[[0,72,2],[3,77,2],[6,76,2],[10,72,4]],[[0,76,3],[4,79,2],[8,76,3],[12,72,2]],[[0,69,2],[3,72,2],[6,76,2],[10,79,2],[13,76,2]],[[0,77,3],[4,76,2],[8,72,3],[12,69,2]],[[0,74,3],[4,77,2],[8,74,3],[12,72,2]],[[0,71,3],[4,76,2],[8,80,2],[12,71,3]]],"melodi":"piano","menu":true},
 "menu-gece":{"bpm":84,"bar":8,"akor":["Am","F","C","G","Am","F","Dm","E"],"lead":[[[0,76,6],[8,72,6]],[[0,77,6],[8,72,6]],[[0,79,6],[8,76,6]],[[0,74,6],[8,71,6]],[[0,72,6],[8,69,6]],[[0,77,6],[8,76,6]],[[0,74,6],[8,77,6]],[[0,80,6],[8,76,6]]],"melodi":"soft","menu":true},
 "menu-tribun":{"bpm":112,"bar":8,"akor":["Am","G","F","Dm","Am","F","G","E"],"lead":[[[0,69,2],[2,72,2],[6,76,2],[10,72,2],[14,69,2]],[[0,71,2],[2,74,2],[6,79,2],[10,74,2],[14,71,2]],[[0,69,2],[2,72,2],[6,77,2],[10,72,2],[14,69,2]],[[0,74,2],[2,77,2],[6,81,2],[10,77,2],[14,74,2]],[[0,76,2],[2,72,2],[6,69,2],[10,72,2],[14,76,2]],[[0,77,2],[2,72,2],[6,69,2],[10,72,2],[14,77,2]],[[0,79,2],[2,74,2],[6,71,2],[10,74,2],[14,79,2]],[[0,80,2],[2,76,2],[6,71,2],[10,76,2],[14,80,2]]],"melodi":"pluk","menu":true},
 mac:{bpm:118,bar:8,akor:['Am','G','F','G','Am','G','F','E']}};
function bolumMs(ad){var p=PARCALAR[ad];return p.bar*16*60/p.bpm/4;}
/* olayUret(ad): bir döngünün olayları { t (sn), tur, midi, sure (sn), ses (0..1) } */
function olayUret(ad){var p=PARCALAR[ad],adim=60/p.bpm/4,o=[],tur=ad==='mac'?'basM':'bas';
 function ekle(b,s,t,midi,len,ses){o.push({t:(b*16+s)*adim,tur:t,midi:midi,sure:len*adim,ses:ses});}
 for(var b=0;b<p.bar;b++){var ak=p.akor[b],tri=AKOR[ak],kok=KOK[ak];
  if(p.menu){
   tri.forEach(function(m){ekle(b,0,'pad',m,16,.075);});
   ekle(b,0,tur,kok,6,.20);ekle(b,8,tur,kok,4,.17);ekle(b,12,tur,kok,2,.13);
   ekle(b,0,'kick',0,1,.20);ekle(b,8,'kick',0,1,.17);ekle(b,4,'hat',0,1,.045);ekle(b,12,'hat',0,1,.045);
   p.lead[b].forEach(function(n){ekle(b,n[0],p.melodi,n[1],n[2],p.melodi==='soft'?.065:.085);});
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
var ctx=null,ana=null,duck=null,acik=false,muzikAcik=true,sahneAd=null,parca=null,timer=null,carpan=1,kayit={},kayitDenendi=false,seviye=.55,calanlar=[],menuSira=0;
var MENU=['menu','menu-gece','menu-tribun'];
var MENU_KAYIT={menu:'assets/ses/menu-eighties-20261019c.mp3','menu-gece':'assets/ses/menu-kickshock-20261019c.mp3','menu-tribun':'assets/ses/menu-funkorama-20261019c.mp3'},menuIstek={};
function genelAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=seviye*carpan;duck=ctx.createGain();duck.gain.value=1;ana.connect(duck);duck.connect(ctx.destination);return true;}
function gurultu(sure){var n=Math.floor(ctx.sampleRate*sure),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;var s=ctx.createBufferSource();s.buffer=b;return s;}
function cal(e,t,cikis,owner){var k=SES[e.tur],g=ctx.createGain();g.connect(cikis);
 function izle(node){if(!owner)return;owner.nodes.push(node);node.onended=function(){var i=owner.nodes.indexOf(node);if(i>=0)owner.nodes.splice(i,1);if(node.disconnect)node.disconnect();if(g.disconnect)g.disconnect();};}
 if(k.dalga==='kick'){var o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(e.ses*1.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);izle(o);o.start(t);o.stop(t+.2);return;}
 if(k.dalga==='snare'||k.dalga==='hat'){var s=gurultu(.18),f=ctx.createBiquadFilter();f.type=k.dalga==='hat'?'highpass':'bandpass';f.frequency.value=k.dalga==='hat'?7000:1800;g.gain.setValueAtTime(e.ses*1.3,t);g.gain.exponentialRampToValueAtTime(.0001,t+(k.dalga==='hat'?.05:.16));s.connect(f);f.connect(g);izle(s);s.start(t);s.stop(t+.2);return;}
 var o2=ctx.createOscillator(),f2=ctx.createBiquadFilter();o2.type=k.dalga;o2.frequency.value=frek(e.midi);f2.type='lowpass';f2.frequency.value=k.lp;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(e.ses,t+k.a);g.gain.setValueAtTime(e.ses,t+Math.max(k.a,e.sure));g.gain.exponentialRampToValueAtTime(.0001,t+e.sure+k.r);o2.connect(f2);f2.connect(g);izle(o2);o2.start(t);o2.stop(t+e.sure+k.r+.05);}
/* parça çalıcı: ileriye bakan zamanlayıcı (120 ms pencere), döngü */
function parcaBaslat(ad){var olay=olayUret(ad),uz=bolumMs(ad),g=ctx.createGain();g.gain.value=0;g.connect(ana);var P={ad:ad,olay:olay,uz:uz,g:g,t0:ctx.currentTime+.08,tur:0,idx:0,bitti:false,gercek:null,nodes:[]};calanlar.push(P);
 if(kayit[ad]){var s=ctx.createBufferSource();s.buffer=kayit[ad];s.loop=ad==='mac';s.connect(g);s.start();P.gercek=s;P.nodes.push(s);if(ad!=='mac')P.uz=Math.max(.1,s.buffer.duration);}
 g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(1,ctx.currentTime+.8);if(MENU_KAYIT[ad]){menuYukle(ad);menuYukle(MENU[(MENU.indexOf(ad)+1)%MENU.length]);}return P;}
function ilerle(P){if(!P||P.gercek||P.bitti)return;var son=ctx.currentTime+.14;
 // Background timer stalls must not replay a backlog or scan thousands of notes.
 if(P.t0+P.tur*P.uz+P.olay[P.idx].t<ctx.currentTime-.30){var elapsed=Math.max(0,ctx.currentTime-P.t0);P.tur=Math.floor(elapsed/P.uz);P.idx=0;while(P.idx<P.olay.length-1&&P.t0+P.tur*P.uz+P.olay[P.idx].t<ctx.currentTime-.02)P.idx++;}
 while(true){var e=P.olay[P.idx],t=P.t0+P.tur*P.uz+e.t;if(t>son)break;if(t>=ctx.currentTime-.02)cal(e,Math.max(t,ctx.currentTime),P.g,P);P.idx++;if(P.idx>=P.olay.length){P.idx=0;P.tur++;}}}
function gorunur(){return !root.document||!root.document.hidden;}
function sonrakiMenu(){var ad=MENU[menuSira%MENU.length];menuSira++;return ad;}
function emekli(P,fade){if(!P||P.bitti)return;var t=ctx.currentTime;P.bitti=true;P.stopT=t+fade;
 try{var held=P.g.gain.value;if(P.g.gain.cancelAndHoldAtTime)P.g.gain.cancelAndHoldAtTime(t);else{P.g.gain.cancelScheduledValues(t);P.g.gain.setValueAtTime(held,t);}P.g.gain.linearRampToValueAtTime(0,t+fade);}catch(e){}
 P.nodes.forEach(function(n){try{n.stop(t+fade+.02);}catch(e){}});
}
function degistir(ad){if(parca)emekli(parca,.8);parca=parcaBaslat(ad);}
function adim(){if(!ctx)return;calanlar=calanlar.filter(function(P){if(P.bitti&&ctx.currentTime>P.stopT+.05){if(P.g.disconnect)P.g.disconnect();return false;}return true;});
 if(!genelAcik()||!muzikAcik||!gorunur())return;
 if(sahneAd==='menu'&&parca&&ctx.currentTime>=parca.t0+parca.uz-.8)degistir(sonrakiMenu());
 ilerle(parca);}
function menuOnbellek(){var current=parca&&parca.ad,next=MENU[(MENU.indexOf(current)+1)%MENU.length];Object.keys(kayit).filter(function(k){return MENU_KAYIT[k]&&k!==current&&k!==next;}).forEach(function(k){delete kayit[k];});}
function menuYukle(ad){if(!MENU_KAYIT[ad]||!root.fetch||!ctx||kayit[ad]||menuIstek[ad])return;
 menuIstek[ad]=root.fetch(MENU_KAYIT[ad]).then(function(r){return r&&r.ok?r.arrayBuffer():null;}).then(function(b){return b?ctx.decodeAudioData(b):null;}).then(function(buf){
  if(!buf)return;menuIstek[ad]=null;kayit[ad]=buf;
  if(parca&&parca.ad===ad&&!parca.gercek&&genelAcik()&&muzikAcik&&gorunur())degistir(ad);
  menuOnbellek();
 }).catch(function(){}); // Yerel sentez, bağlantı hatasında oyunu ve menüyü çalışır tutar.
}
function kayitYukle(){if(!ctx||!root.fetch)return;menuYukle(parca&&MENU_KAYIT[parca.ad]?parca.ad:MENU[menuSira%MENU.length]);
 if(kayitDenendi)return;kayitDenendi=true;var denemeler=['mp3','ogg','wav','m4a'],i=0;(function dene(){if(i>=denemeler.length)return;root.fetch('assets/ses/muzik-mac.'+denemeler[i++]).then(function(r){return r&&r.ok?r.arrayBuffer():null;}).then(function(b){return b?ctx.decodeAudioData(b):null;}).then(function(buf){if(buf){kayit.mac=buf;if(parca&&parca.ad==='mac'&&!parca.gercek&&genelAcik()&&muzikAcik&&gorunur())degistir('mac');}else dene();}).catch(dene);})();
}
function sahne(ad){if(ad!=='menu'&&ad!=='mac'&&ad!==null&&ad!=='sessiz')return;var hedef=ad==='menu'||ad==='mac'?ad:null;
 if(hedef===sahneAd&&(hedef===null||parca))return;sahneAd=hedef;
 if(!ctx)return;if(parca){emekli(parca,.8);parca=null;}
 if(hedef&&genelAcik()&&muzikAcik&&gorunur())parca=parcaBaslat(hedef==='menu'?sonrakiMenu():hedef);
}
function baslat(){if(!kur())return;if(ctx.state==='suspended'&&ctx.resume){var promise=ctx.resume();if(promise&&promise.catch)promise.catch(function(){});}kayitYukle();if(!timer&&root.setInterval)timer=root.setInterval(adim,25);if(sahneAd&&!parca&&genelAcik()&&muzikAcik&&gorunur())parca=parcaBaslat(sahneAd==='menu'?sonrakiMenu():sahneAd);}
function durdur(){if(!ctx)return;var t=ctx.currentTime;calanlar.forEach(function(P){P.bitti=true;try{P.g.gain.cancelScheduledValues(t);P.g.gain.setValueAtTime(0,t);}catch(e){}P.nodes.forEach(function(n){try{n.stop(t);}catch(e){}});if(P.g.disconnect)P.g.disconnect();});calanlar=[];parca=null;}
var api={
 seviyeAyarla:function(v){carpan=Math.max(0,Math.min(1,+v||0));if(ana)ana.gain.value=seviye*carpan;},   // müzik ve müzik efektleri ses düzeyi
 ayarla:function(v){acik=!!v;if(acik)baslat();else durdur();},
 muzikAyarla:function(v){muzikAcik=!!v;if(!muzikAcik)durdur();else if(acik&&ctx)baslat();},
 sahne:sahne,
 /* kis(sure, oran): müziği kısa süre kısar (vuruş ve tezahürat anında) */
 kis:function(sure,oran){if(!ctx||!duck)return;var t=ctx.currentTime;try{duck.gain.cancelScheduledValues(t);duck.gain.setValueAtTime(duck.gain.value,t);duck.gain.linearRampToValueAtTime(oran===undefined?.3:oran,t+.15);duck.gain.linearRampToValueAtTime(1,t+(sure||2));}catch(e){}},
 efekt:function(ad){if(!genelAcik()||!ctx||!EFEKT[ad])return false;var t=ctx.currentTime+.02,out=ctx.createGain();out.gain.value=1;out.connect(ctx.destination);EFEKT[ad].forEach(function(e){cal(e,t+e.t,out);});return true;},
 MENU_KAYIT:MENU_KAYIT,bolumMs:bolumMs,olayUret:olayUret,render:render,wav:wav,EFEKT:EFEKT,PARCALAR:PARCALAR,AKOR:AKOR,KOK:KOK,SES:SES,
 _durum:function(){return{acik:acik,muzikAcik:muzikAcik,sahne:sahneAd,calan:parca?sahneAd:null,parca:parca?parca.ad:null,gercek:!!(parca&&parca.gercek),kayit:Object.keys(kayit)};}
};
if(root.addEventListener)root.addEventListener('pointerdown',function(){if(ctx&&ctx.state==='suspended'&&acik&&ctx.resume)ctx.resume();});
if(root.document&&root.document.addEventListener)root.document.addEventListener('visibilitychange',function(){if(!gorunur())durdur();else if(acik&&muzikAcik)baslat();});
DT.muzik=api;
})(typeof globalThis!=='undefined'?globalThis:window);
