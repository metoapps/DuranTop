/* Tribün sesleri (tarayıcıda sentez; gerçek kayıt değil):
 *  - ortam: sürekli kalabalık uğultusu, yavaşça kabarıp iner
 *  - tezahürat: aralıklarla toplu "üç alkış" ve "o-le" nakaratı
 *  - uh(): direkten dönen topta toplu "ahhh" (perdesi düşen, kabarıp sönen kalabalık sesi)
 * Ana ses düğmesine bağlıdır (DT.ses.acikMi). Ses kapalıyken hiçbir düğüm oluşturulmaz. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var ctx=null,ana=null,ortamDugum=null,ortamAcik=false,zamanlayici=null,acik=false,rnd=Math.random;
function sesAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=.9;ana.connect(ctx.destination);return true;}
function gurultu(sure){var n=Math.max(1,Math.floor(ctx.sampleRate*sure)),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0),son=0;
 for(var i=0;i<n;i++){var w=rnd()*2-1;son=.97*son+.03*w;d[i]=son*3+w*.25;}return b;}   // pembe gürültüye yakın: kalabalık dokusu
function zarf(g,t,tepe,a,bitis){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,tepe),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+bitis);}
// Kalabalık sesi: biraz farklı perdede çok sayıda testere dalga + iki formant (ünlü harf rengi) + nefes gürültüsü.
var UNLU={o:[480,860],e:[420,1900],a:[760,1220],u:[340,760]};
function koro(t,sure,f0,f1,unlu,ses,kisi){var F=UNLU[unlu],g=ctx.createGain(),b1=ctx.createBiquadFilter(),b2=ctx.createBiquadFilter();
 b1.type='bandpass';b1.frequency.value=F[0];b1.Q.value=5;b2.type='bandpass';b2.frequency.value=F[1];b2.Q.value=7;
 var top=ctx.createGain();top.gain.value=1;b1.connect(top);b2.connect(top);top.connect(g);g.connect(ana);zarf(g,t,ses,Math.min(.12,sure*.3),sure);
 for(var i=0;i<kisi;i++){var o=ctx.createOscillator(),k=1+(rnd()-.5)*.06,gec=rnd()*.05;o.type='sawtooth';o.frequency.setValueAtTime(f0*k,t);o.frequency.linearRampToValueAtTime(f1*k,t+sure);
  var og=ctx.createGain();og.gain.value=1/kisi;o.connect(og);og.connect(b1);og.connect(b2);o.start(t+gec);o.stop(t+sure+.05);}
 var n=ctx.createBufferSource();n.buffer=gurultu(sure);var nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=F[0]*1.3;nf.Q.value=1.2;var ng=ctx.createGain();ng.gain.value=.35;n.connect(nf);nf.connect(ng);ng.connect(g);n.start(t);n.stop(t+sure);}
function alkis(t,ses){for(var i=0;i<12;i++){var s=ctx.createBufferSource();s.buffer=gurultu(.03);var f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=1200+rnd()*900;var g=ctx.createGain();var tt=t+(rnd()-.5)*.05;
 zarf(g,tt,ses/6,.003,.06);s.connect(f);f.connect(g);g.connect(ana);s.start(tt);s.stop(tt+.08);}}
function tezahurat(){if(!sesAcik()||!ortamAcik||!ctx)return;var t=ctx.currentTime+.05;
 if(rnd()<.5){[0,.42,.84,1.7,2.12,2.54].forEach(function(d){alkis(t+d,.55);});koro(t+3.2,.5,215,215,'o',.10,10);koro(t+3.75,.6,245,230,'e',.10,10);}   // üç alkış ×2, "o-le"
 else{koro(t,.45,220,220,'o',.09,10);koro(t+.5,.45,247,247,'e',.09,10);koro(t+1.0,.45,220,220,'o',.09,10);koro(t+1.5,.8,262,240,'e',.10,10);[2.5,2.9,3.3].forEach(function(d){alkis(t+d,.5);});}}
function planla(){root.clearTimeout(zamanlayici);if(!ortamAcik)return;zamanlayici=root.setTimeout(function(){tezahurat();planla();},7000+rnd()*6000);}
function ortamBaslat(){if(ortamDugum||!sesAcik()||!kur())return;if(ctx.state==='suspended'&&ctx.resume)ctx.resume();
 var s=ctx.createBufferSource();s.buffer=gurultu(4);s.loop=true;var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=560;f.Q.value=.6;
 var g=ctx.createGain();g.gain.value=.045;var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.08;lg.gain.value=.018;lfo.connect(lg);lg.connect(g.gain);
 s.connect(f);f.connect(g);g.connect(ana);s.start();lfo.start();ortamDugum={s:s,lfo:lfo,g:g};}
function ortamDurdur(){if(!ortamDugum)return;try{ortamDugum.s.stop();ortamDugum.lfo.stop();}catch(e){}ortamDugum.g.disconnect();ortamDugum=null;}
var api={
 ayarla:function(v){acik=!!v;if(acik&&kur()&&ctx.state==='suspended'&&ctx.resume)ctx.resume();if(acik&&ortamAcik){ortamBaslat();planla();}else{ortamDurdur();root.clearTimeout(zamanlayici);}},
 ortam:function(v){ortamAcik=!!v;if(ortamAcik&&sesAcik()){ortamBaslat();planla();}else{ortamDurdur();root.clearTimeout(zamanlayici);}},
 // Direkten dönen top: toplu "ahhh". Perde 230→150 Hz, 'u'dan 'a'ya, 1,7 sn.
 uh:function(){if(!sesAcik()||!kur())return false;var t=ctx.currentTime+.02;koro(t,1.7,230,150,'a',.22,14);koro(t,.5,260,220,'u',.10,8);return true;},
 tezahurat:function(){tezahurat();},
 _test:function(fakeRnd){if(fakeRnd)rnd=fakeRnd;return{ctx:ctx,ortam:!!ortamDugum};}
};
if(root.addEventListener)root.addEventListener('pointerdown',function(){if(ctx&&ctx.state==='suspended'&&acik&&ctx.resume)ctx.resume();});   // iPhone: ses ilk dokunuşta açılır
DT.tezahurat=api;
})(typeof globalThis!=='undefined'?globalThis:window);
