/* Tribün tepkisi: yalnız GERÇEK ses kaydıyla çalar (sentez yok).
 * alay(): kaçan şutta (aut, kısa, kaleci kurtarışı, baraj) toplu "yuh"/gülüş. Kaynak: assets/ses/yuh.(mp3|ogg|wav|m4a); yoksa gol.* kaydı yavaşlatılıp kısılarak uğultuya çevrilir; ikisi de yoksa sessiz (balonlar yine çıkar).
 * uh(): direkten dönen topta toplu "ahhh". Kaynak sırası:
 *   1) assets/ses/ah.(mp3|ogg|wav|m4a)  ← asıl dosya (kalabalık "ooh/ahh" kaydı; yoksa 2'ye düşer)
 *   2) assets/ses/gol.(mp3|ogg|wav|m4a) ← gol uğultusu kaydı, yavaşlatılıp kısılarak "hayal kırıklığı" uğultusuna çevrilir
 * İkisi de yoksa uh() false döner ve oyun eski kısa "ah" sesini kullanır. Ses kapalıyken hiçbir şey çalmaz. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var ctx=null,ana=null,acik=false,ah=null,yuh=null,gol=null,yukleniyor=false,UZANTI=['mp3','ogg','wav','m4a'];
function sesAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=.9;ana.connect(ctx.destination);return true;}
async function getir(ad){
 if(!root.fetch)return null;
 for(var i=0;i<UZANTI.length;i++){try{var r=await root.fetch('assets/ses/'+ad+'.'+UZANTI[i]);if(!r||!r.ok)continue;var ham=await r.arrayBuffer();
  return await new Promise(function(ok,hata){var p=ctx.decodeAudioData(ham,ok,hata);if(p&&p.then)p.then(ok,hata);});}catch(e){}}
 return null;}
async function yukle(){if(yukleniyor||!kur())return;yukleniyor=true;ah=await getir('ah');yuh=await getir('yuh');if(!ah||!yuh)gol=await getir('gol');}
function cal(buf,oran,kesim,ses,sure){var t=ctx.currentTime+.02,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
 s.buffer=buf;s.playbackRate.value=oran;f.type='lowpass';f.frequency.value=kesim;f.Q.value=.5;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(ses,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+sure);
 s.connect(f);f.connect(g);g.connect(ana);s.start(t,0,sure*oran+.2);s.stop(t+sure+.05);}
var api={
 ayarla:function(v){acik=!!v;if(acik&&kur()){if(ctx.state==='suspended'&&ctx.resume)ctx.resume();yukle();}},
 ortam:function(){},            // eski sentez uğultusu kaldırıldı (düşük kalite); uyumluluk için boş
 tezahurat:function(){},        // eski sentez alkış/koro kaldırıldı
 uh:function(){if(!sesAcik()||!kur()||!(ah||gol))return false;
  if(ah)cal(ah,1,6000,.9,Math.min(2.6,ah.duration));else cal(gol,.72,1100,.7,1.9);return true;},
 alay:function(){if(!sesAcik()||!kur()||!(yuh||gol))return false;
  if(yuh)cal(yuh,1,7000,.9,Math.min(3.2,yuh.duration));else cal(gol,.6,900,.75,2.6);return true;},
 hazirMi:function(){return !!(ah||yuh||gol);},
 _test:function(){return{ah:!!ah,yuh:!!yuh,gol:!!gol};}
};
if(root.addEventListener)root.addEventListener('pointerdown',function(){if(ctx&&ctx.state==='suspended'&&acik&&ctx.resume)ctx.resume();});
DT.tezahurat=api;
})(typeof globalThis!=='undefined'?globalThis:window);
