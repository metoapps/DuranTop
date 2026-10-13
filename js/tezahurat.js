/* Tribün tepkisi: ağırlıkla GERÇEK ses kaydıyla çalar.
 * golSes(): gol olunca tribün bağırışları. Kaynak sırası: 1) assets/ses/tez-1..tez-6.(mp3|ogg|wav|m4a) gerçek kayıtlar; 2) yoksa tarayıcının Türkçe konuşma sentezi (speechSynthesis) bağırış metinlerini okur (robotik olabilir); 3) ikisi de yoksa sessiz (balonlar yine çıkar).
 * golMetinleri(seed): gol balonlarında gösterilen ve (konuşma sentezinde) okunan 5 söz; aynı seed aynı sözler.
 * alay(): kaçan şutta (aut, kısa, kaleci kurtarışı, baraj) toplu "yuh"/gülüş. Kaynak: assets/ses/yuh.(mp3|ogg|wav|m4a); yoksa gol.* kaydı yavaşlatılıp kısılarak uğultuya çevrilir; ikisi de yoksa sessiz (balonlar yine çıkar).
 * uh(): direkten dönen topta toplu "ahhh". Kaynak sırası:
 *   1) assets/ses/ah.(mp3|ogg|wav|m4a)  ← asıl dosya (kalabalık "ooh/ahh" kaydı; yoksa 2'ye düşer)
 *   2) assets/ses/gol.(mp3|ogg|wav|m4a) ← gol uğultusu kaydı, yavaşlatılıp kısılarak "hayal kırıklığı" uğultusuna çevrilir
 * İkisi de yoksa uh() false döner ve oyun eski kısa "ah" sesini kullanır. Ses kapalıyken hiçbir şey çalmaz. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var ctx=null,ana=null,acik=false,ah=null,yuh=null,gol=null,yukleniyor=false,UZANTI=['mp3','ogg','wav','m4a'],TEZ=[],tezYuk=false;
/* Gol sözleri. Listeyi düzenlemek serbest: ilk dört kullanıcı isteği, sonrakiler yedek. soz = konuşma sentezinde okunuşu. */
var GOL_SOZ=[{m:'Golllaazzzooooooooooo!',soz:'Gooooool laaaazoooo!',ana:1},{m:'Koçum benim!',ana:1},{m:'Senin yarrağını yiyeyim!',ana:1},{m:'Gel bir kere de bana koy öyle!',ana:1},{m:'Efsane!'},{m:'Bu ne vuruş be!'},{m:'Yaşa kral!'},{m:'Allah Allah!'}];
function tohum(seed){var s=(seed|0)+12345;return function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};}
function golMetinleri(seed){var r=tohum(seed),ana=GOL_SOZ.filter(function(x){return x.ana;}),ek=GOL_SOZ.filter(function(x){return !x.ana;});
 function karis(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
 var k1=karis(ana),k2=karis(ek);return[k1[0],k1[1],k1[2],k2[0],k2[1]].filter(Boolean);}
function trSes(){try{var v=root.speechSynthesis.getVoices()||[];for(var i=0;i<v.length;i++)if(/^tr/i.test(v[i].lang))return v[i];}catch(e){}return null;}
function konus(m,perde,hiz){var u=new root.SpeechSynthesisUtterance(m.soz||m.m);u.lang='tr-TR';var v=trSes();if(v)u.voice=v;u.pitch=perde;u.rate=hiz;u.volume=1;root.speechSynthesis.speak(u);}
function sesAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=.9;ana.connect(ctx.destination);return true;}
async function getir(ad){
 if(!root.fetch)return null;
 for(var i=0;i<UZANTI.length;i++){try{var r=await root.fetch('assets/ses/'+ad+'.'+UZANTI[i]);if(!r||!r.ok)continue;var ham=await r.arrayBuffer();
  return await new Promise(function(ok,hata){var p=ctx.decodeAudioData(ham,ok,hata);if(p&&p.then)p.then(ok,hata);});}catch(e){}}
 return null;}
async function yukle(){if(yukleniyor||!kur())return;yukleniyor=true;ah=await getir('ah');yuh=await getir('yuh');if(!ah||!yuh)gol=await getir('gol');if(!tezYuk){tezYuk=true;for(var k=1;k<=6;k++){var b=await getir('tez-'+k);if(b)TEZ.push(b);}}}
function cal(buf,oran,kesim,ses,sure){var t=ctx.currentTime+.02,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
 s.buffer=buf;s.playbackRate.value=oran;f.type='lowpass';f.frequency.value=kesim;f.Q.value=.5;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(ses,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+sure);
 s.connect(f);f.connect(g);g.connect(ana);s.start(t,0,sure*oran+.2);s.stop(t+sure+.05);}
var api={
 ayarla:function(v){acik=!!v;if(acik&&kur()){if(ctx.state==='suspended'&&ctx.resume)ctx.resume();yukle();}
  if(acik&&root.speechSynthesis&&root.SpeechSynthesisUtterance){try{var u=new root.SpeechSynthesisUtterance(' ');u.volume=0;root.speechSynthesis.speak(u);}catch(e){}}},   // iOS: konuşma sentezi ilk kullanıcı dokunuşunda sessizce açılır
 golMetinleri:golMetinleri,
 golSes:function(seed){if(!sesAcik())return null;var m=golMetinleri(seed);
  if(TEZ.length&&kur()){var b=TEZ[((seed|0)%TEZ.length+TEZ.length)%TEZ.length];cal(b,1,9000,.95,Math.min(4,b.duration));return'kayit';}
  if(DT.AYAR&&DT.AYAR.tezTTS===false)return null;
  if(root.speechSynthesis&&root.SpeechSynthesisUtterance){try{root.speechSynthesis.cancel();konus(m[0],.85+(((seed|0)%5)*.04),1.0);if(m[1])konus(m[1],.8,1.12);}catch(e){return null;}return'konusma';}
  return null;},
 ortam:function(){},            // eski sentez uğultusu kaldırıldı (düşük kalite); uyumluluk için boş
 tezahurat:function(){},        // eski sentez alkış/koro kaldırıldı
 uh:function(){if(!sesAcik()||!kur()||!(ah||gol))return false;
  if(ah)cal(ah,1,6000,.9,Math.min(2.6,ah.duration));else cal(gol,.72,1100,.7,1.9);return true;},
 alay:function(){if(!sesAcik()||!kur()||!(yuh||gol))return false;
  if(yuh)cal(yuh,1,7000,.9,Math.min(3.2,yuh.duration));else cal(gol,.6,900,.75,2.6);return true;},
 hazirMi:function(){return !!(ah||yuh||gol);},
 _test:function(){return{ah:!!ah,yuh:!!yuh,gol:!!gol,tez:TEZ.length};}
};
if(root.addEventListener)root.addEventListener('pointerdown',function(){if(ctx&&ctx.state==='suspended'&&acik&&ctx.resume)ctx.resume();});
DT.tezahurat=api;
})(typeof globalThis!=='undefined'?globalThis:window);
