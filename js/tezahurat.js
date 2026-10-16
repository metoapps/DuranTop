/* Tribün tepkisi.
 * GOL: ekranda yalnız senin dört cümlen çıkar (her gole 3'ü, sırayla karışık). SES: gerçek bir SPİKER bağırışı ("Goooool!", "Gollllaaazzzoooo!") çalar; kaynak assets/ses/spiker-gol-1..8 ve spiker-gollazo-1..8 (.mp3|.ogg|.wav|.m4a).
 *   Büyük goller (sert şut, falso, köşe, altın bölge, direkten gol, uzak frikik, seri ≥3) "gollazo" grubundan, diğerleri "gol" grubundan seçilir; dosya yoksa ses çalmaz (konuşma sentezi KULLANILMAZ). Hazırlama: assets/ses/SPIKER-REHBERI.md
 * AUT ve DİREKTEN DÖNEN TOP: ekranda yalnız senin genel olumsuz cümlelerin; top AUTA gidince OYUNCUYA ÖZEL cümleler de eklenir (yalnız o oyuncu için). Diğer kaçan şutlarda (kurtarış, baraj, kısa, halka, ağ) balon yok. Ses: toplu "yuh" kaydı (alay) ve "ahhh" (uh).
 * alay(): kaçan şutta toplu "yuh"/gülüş. Kaynak: assets/ses/yuh.(mp3|ogg|wav|m4a); yoksa gol.* kaydı yavaşlatılıp kısılarak uğultuya çevrilir; ikisi de yoksa sessiz (balonlar yine çıkar).
 * uh(): direkten dönen topta toplu "ahhh". Kaynak sırası:
 *   1) assets/ses/ah.(mp3|ogg|wav|m4a)  ← asıl dosya (kalabalık "ooh/ahh" kaydı; yoksa 2'ye düşer)
 *   2) assets/ses/gol.(mp3|ogg|wav|m4a) ← gol uğultusu kaydı, yavaşlatılıp kısılarak "hayal kırıklığı" uğultusuna çevrilir
 * İkisi de yoksa uh() false döner ve oyun eski kısa "ah" sesini kullanır. Ses kapalıyken hiçbir şey çalmaz. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var ctx=null,ana=null,carpan=1,acik=false,ah=null,yuh=null,gol=null,yukleniyor=false,UZANTI=['mp3','ogg','wav','m4a'],SPIKER={gol:[],gollazo:[]},spikerYuk=false,spikerAktif=null;
/* ---- SENİN CÜMLELERİN (listeyi serbestçe düzenleyebilirsin) ---- */
var GOL_SOZ=['Golllaazzzooooooooooo!','Koçum benim!','Senin yarrağını yiyeyim!','Gel bir kere de bana koy öyle!'];
var GENEL_OLUMSUZ=['Senin ayağının dümenini sikeyim','Kazma herif','Ya bi siktir git amk ya','Seni bu takıma alan hocanın anasını avradını sikeyim'];
/* Oyuncuya özel (yalnız o oyuncu için, yalnız top auta gidince). Anahtar: karakter kimliği (veri.js: meto, lort, fero, latte, josh). */
var OZEL_OLUMSUZ={
 lort:['Topa Taksim\'den vurdu Çekmeköy\'e gitti amk','3 ölü 1 yaralı var','Giresunlu futbolcu olmaz zaten'],
 latte:['Hollandalı hıyar seni','Baba sen topu mopu bırak paket atmaya devam et'],
 josh:['Çektiği şuta bak aq','senin çektiğin şutun anasını sikeyim','Yozgat\'a geri dön'],
 fero:['Gözünü sikeyim vurduğun yere bak!','Mars\'a gitti top aq','Karga marga kalmadı hepsi öldü amk']};
function tohum(seed){var s=Math.imul((seed|0)^0x9e3779b9,0x85ebca6b)>>>0;s^=s>>>13;s=Math.imul(s,0xc2b2ae35)>>>0;s^=s>>>16;s=s||1;var f=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;var z=s^(s>>>15);return(Math.imul(z,0x2c1b3c6d)>>>0)/4294967296;};f();f();f();return f;}   // ardışık tohumlar bağımsız görünür
function karis(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* Gol balonları: dört cümleden 3'ü, karışık sırayla (aynı seed aynı seçim). */
function golMetinleri(seed){var k=karis(GOL_SOZ,tohum(seed));return k.slice(0,3).map(function(m){return{m:m};});}
/* Kaçan şut balonları: genel olumsuz dört cümle; top AUTA gidince ve oyuncunun özel cümleleri varsa özel cümleler (hepsi) + genelden tamamlayarak 5'e. */
function alayMetinleri(tur,seed,kisi){if(tur!=='aut'&&tur!=='direk_disari')return[];   // balonlar yalnız aut ve direkten dönüşte (kurtarış, baraj, kısa, halka, ağda yok)
 var r=tohum(seed),genel=karis(GENEL_OLUMSUZ,r).map(function(m){return{m:m};}),ozel=(tur==='aut'&&OZEL_OLUMSUZ[kisi])?OZEL_OLUMSUZ[kisi].map(function(m){return{m:m,ozel:true};}):[];
 var liste=ozel.concat(genel.slice(0,Math.max(0,Math.min(genel.length,5-ozel.length))));return ozel.length?karis(liste,r):liste;}
function sesAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=.9*carpan;ana.connect(ctx.destination);return true;}
async function getir(ad){
 if(!root.fetch)return null;
 for(var i=0;i<UZANTI.length;i++){try{var r=await root.fetch('assets/ses/'+ad+'.'+UZANTI[i]);if(!r||!r.ok)continue;var ham=await r.arrayBuffer();
  return await new Promise(function(ok,hata){var p=ctx.decodeAudioData(ham,ok,hata);if(p&&p.then)p.then(ok,hata);});}catch(e){}}
 return null;}
async function yukle(){if(yukleniyor||!kur())return;yukleniyor=true;ah=await getir('ah');yuh=await getir('yuh');if(!ah||!yuh)gol=await getir('gol');
 // Birden fazla tribün uğultusu varyasyonu (gol.mp3, gol-2.mp3 …) desteklenir.
 if(!spikerYuk){spikerYuk=true;['gol','gollazo'].forEach(function(g){});for(var gi=0;gi<2;gi++){var grup=gi?'gollazo':'gol';for(var k=1;k<=8;k++){var b=await getir('spiker-'+grup+'-'+k);if(b)SPIKER[grup].push(b);else break;}}}
 // Ek tribün kayıtları
 var ekGol=[];for(var i=2;i<=6;i++){var eg=await getir('gol-'+i);if(eg)ekGol.push(eg);}
 if(ekGol.length&&gol)ekGol.unshift(gol);else if(ekGol.length)gol=ekGol[0];
 if(ekGol.length)gol=ekGol[Math.floor(Math.random()*ekGol.length)]; // rastgele seçim için hazır
}
function cal(buf,oran,kesim,ses,sure){var t=ctx.currentTime+.02,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
 s.buffer=buf;s.playbackRate.value=oran;f.type='lowpass';f.frequency.value=kesim;f.Q.value=.5;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(ses,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+sure);
 s.connect(f);f.connect(g);g.connect(ana);s.start(t,0,sure*oran+.2);s.stop(t+sure+.05);}
var api={
 seviyeAyarla:function(v){carpan=Math.max(0,Math.min(1,+v||0));if(ana)ana.gain.value=.9*carpan;},   // spiker, tribün ahhh/yuh ses düzeyi
 ayarla:function(v){acik=!!v;if(!acik&&spikerAktif){try{spikerAktif.stop();}catch(e){}spikerAktif=null;}if(acik&&kur()){if(ctx.state==='suspended'&&ctx.resume)ctx.resume();yukle();}},
 golMetinleri:golMetinleri,
 /* golSes: spiker bağırışı. c = bağlam {altin, direk, falso, kose, sert, uzak, seri, tip}; büyük gollerde "gollazo" grubu. Dosya yoksa ses yok ('yok' döner). */
 golSes:function(seed,c){if(!sesAcik()||!kur())return null;c=c||{};var buyuk=!!(c.altin||c.direk||c.falso||c.kose||c.sert||c.uzak||c.seri>=3),ilk=buyuk?'gollazo':'gol',yedek=buyuk?'gol':'gollazo',liste=SPIKER[ilk].length?SPIKER[ilk]:SPIKER[yedek];
  if(!liste.length)return null;
  if(!SPIKER[ilk].length){var pp=[0,.55,.75][liste.length]||1,uu=(Math.imul((seed|0)^0x9e3779b9,2654435761)>>>0)/4294967296;if(uu>=pp)return null;}   // yalnız yedek grup varsa (örn. sıradan gole gollazo kaydı) her gole çalmaz: aynı bağırış bıktırmasın (1 kayıt %55, 2 kayıt %75, 3+ her seferinde)
  var b=liste[((seed|0)%liste.length+liste.length)%liste.length],t=ctx.currentTime+.02,s=ctx.createBufferSource(),g=ctx.createGain(),d=Math.min(b.duration||4,8);
  if(spikerAktif){try{spikerAktif.stop();}catch(e){}}spikerAktif=s;s.onended=function(){s.disconnect();g.disconnect();if(spikerAktif===s)spikerAktif=null;};if(DT.ses&&DT.ses.spikerOncelik)DT.ses.spikerOncelik(d);s.buffer=b;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1,t+.03);g.gain.setValueAtTime(1,t+Math.max(.1,d-.4));g.gain.linearRampToValueAtTime(.0001,t+d);s.connect(g);g.connect(ana);s.start(t);s.stop(t+d+.05);return'spiker';},
 alayMetinleri:alayMetinleri,GOL_SOZ:GOL_SOZ,GENEL_OLUMSUZ:GENEL_OLUMSUZ,OZEL_OLUMSUZ:OZEL_OLUMSUZ,
 ortam:function(){},            // eski sentez uğultusu kaldırıldı (düşük kalite); uyumluluk için boş
 tezahurat:function(){},        // eski sentez alkış/koro kaldırıldı
 uh:function(){if(!sesAcik()||!kur()||!(ah||gol))return false;
  if(ah)cal(ah,1,6000,.9,Math.min(2.6,ah.duration));else cal(gol,.72,1100,.7,1.9);return true;},
 alay:function(){if(!sesAcik()||!kur()||!(yuh||gol))return false;
  if(yuh)cal(yuh,1,7000,.9,Math.min(3.2,yuh.duration));else cal(gol,.6,900,.75,2.6);return true;},
 hazirMi:function(){return !!(ah||yuh||gol);},
 _test:function(){return{ah:!!ah,yuh:!!yuh,gol:!!gol,spikerGol:SPIKER.gol.length,spikerGollazo:SPIKER.gollazo.length};}
};
if(root.addEventListener)root.addEventListener('pointerdown',function(){if(ctx&&ctx.state==='suspended'&&acik&&ctx.resume)ctx.resume();});
DT.tezahurat=api;
})(typeof globalThis!=='undefined'?globalThis:window);
