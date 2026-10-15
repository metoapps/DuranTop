/* Tribün tepkisi: ağırlıkla GERÇEK ses kaydıyla çalar.
 * golSes(): gol olunca tribün bağırışları. Kaynak sırası: 1) assets/ses/tez-1..tez-24.(mp3|ogg|wav|m4a) gerçek kayıtlar (arkadaşlarla kendi sesinizi kaydedin: bkz. assets/ses/KAYIT-REHBERI.md); 2) yoksa tarayıcının Türkçe konuşma sentezi (speechSynthesis) bağırış metinlerini okur (robotik olabilir); 3) ikisi de yoksa sessiz (balonlar yine çıkar).
 * golMetinleri(seed, ctx): gol balonlarında gösterilen ve (konuşma sentezinde) okunan 5 söz; ~60 cümlelik havuzdan, bağlama (altın bölge, direk, falso, köşe, sert şut, uzak, seri, penaltı) göre; aynı seed ve bağlam aynı sözler. alayMetinleri(tur, seed): kaçan şutlarda ~12'lik havuzdan 5 söz.
 * alay(): kaçan şutta (aut, kısa, kaleci kurtarışı, baraj) toplu "yuh"/gülüş. Kaynak: assets/ses/yuh.(mp3|ogg|wav|m4a); yoksa gol.* kaydı yavaşlatılıp kısılarak uğultuya çevrilir; ikisi de yoksa sessiz (balonlar yine çıkar).
 * uh(): direkten dönen topta toplu "ahhh". Kaynak sırası:
 *   1) assets/ses/ah.(mp3|ogg|wav|m4a)  ← asıl dosya (kalabalık "ooh/ahh" kaydı; yoksa 2'ye düşer)
 *   2) assets/ses/gol.(mp3|ogg|wav|m4a) ← gol uğultusu kaydı, yavaşlatılıp kısılarak "hayal kırıklığı" uğultusuna çevrilir
 * İkisi de yoksa uh() false döner ve oyun eski kısa "ah" sesini kullanır. Ses kapalıyken hiçbir şey çalmaz. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var ctx=null,ana=null,acik=false,ah=null,yuh=null,gol=null,yukleniyor=false,UZANTI=['mp3','ogg','wav','m4a'],TEZ=[],tezYuk=false;
/* Gol sözleri: ~60 cümle, etiketli. Her gole 5 söz seçilir: 1 nida (kısa bağırış) + 1 favori (senin dört cümlen) + bağlama uygun 1 söz (altın bölge, direk, falso, köşe, sert şut, uzak, seri, penaltı) + 2 genel/esprili.
 * Liste serbestçe düzenlenir. m = ekranda ve balonda görünen; soz = konuşma sentezinde okunuşu (uzatmalar yerine tekrar ve ünlem). tur = etiket. */
var GOL_HAVUZ=[
 // nida: kısa, coşkulu bağırışlar
 {m:'Gooooool!',soz:'Gol! Gol! Gooool!',tur:'nida'},{m:'Eveeeet!',soz:'Evet! Evet! Eveet!',tur:'nida'},{m:'Yaşasıııın!',soz:'Yaşasın! Yaşasııın!',tur:'nida'},{m:'Şööööyle!',soz:'Şöyle! Şööyle!',tur:'nida'},{m:'Hadi beee!',soz:'Hadi be! Hadi beee!',tur:'nida'},{m:'Oleeey!',soz:'Ole! Oleey!',tur:'nida'},{m:'Vaaay be!',soz:'Vay be! Vaay!',tur:'nida'},{m:'Allaaah Allaaah!',soz:'Allah Allah! Allaah!',tur:'nida'},{m:'Yok artık!',soz:'Yok artık! Yooook artık!',tur:'nida'},{m:'İşte buuu!',soz:'İşte bu! İşte buu!',tur:'nida'},
 // favori: kullanıcının istediği dört cümle
 {m:'Golllaazzzooooooooooo!',soz:'Gooool laaazooo!',tur:'fav'},{m:'Koçum benim!',soz:'Koçum benim! Koçum!',tur:'fav'},{m:'Senin yarrağını yiyeyim!',tur:'fav'},{m:'Gel bir kere de bana koy öyle!',tur:'fav'},
 // genel övgü
 {m:'Aslan gibi vurdu!',tur:'genel'},{m:'Çok yaşa kral!',tur:'genel'},{m:'Maşallah maşallah!',tur:'genel'},{m:'Bu çocuk bambaşka!',tur:'genel'},{m:'Tamam kardeşim, bu iş bitti!',tur:'genel'},{m:'Sana bayılıyorum!',tur:'genel'},{m:'Hasta olurum bu çocuğa!',tur:'genel'},{m:'Alın bunu da yazın!',tur:'genel'},{m:'Böyle atılır be!',tur:'genel'},{m:'Ellerine sağlık usta!',tur:'genel'},{m:'Fenomen!',tur:'genel'},{m:'Efsane!',tur:'genel'},{m:'Bu ne vuruş be!',tur:'genel'},{m:'Hayırlı olsun!',tur:'genel'},{m:'Eyvallah koçum!',tur:'genel'},{m:'Helal olsun sana!',tur:'genel'},
 // esprili
 {m:'Kaleci kimin yeğeni?',tur:'esprili'},{m:'Kaleci bunu rüyasında görecek!',tur:'esprili'},{m:'Annemi arayıp anlatacağım!',tur:'esprili'},{m:'Bunu tekrar izlemek lazım!',tur:'esprili'},{m:'Kaleciye geçmiş olsun!',tur:'esprili'},{m:'Kaleci tribüne bakıyor!',tur:'esprili'},{m:'Bu golü sigorta kapsamaz!',tur:'esprili'},
 // bağlama özel
 {m:'Altın vuruş!',tur:'altin'},{m:'Nişangahla mı attın sen?',tur:'altin'},{m:'Tam hedefe, tam ödüle!',tur:'altin'},{m:'Cep telefonu kadar yer vardı!',tur:'altin'},
 {m:'Direk de alkışlıyor!',tur:'direk'},{m:'Direkten döndü de girdi, şansın var!',tur:'direk'},{m:'Direk bile yol verdi!',tur:'direk'},
 {m:'Falso bu, resim değil!',tur:'falso'},{m:'Top kıvrıldı, kaleci kıvrandı!',tur:'falso'},{m:'Juninho abi ayakta alkışlıyor!',tur:'falso'},{m:'Bu falso sanat eseri!',tur:'falso'},{m:'Topa ne yaptın öyle, dönerek girdi!',tur:'falso'},
 {m:'Dokuzun dokuzuna!',tur:'kose'},{m:'Rafa kaldırdı!',tur:'kose'},{m:'Köşeyi buldu, kaleci bakakaldı!',tur:'kose'},{m:'Örümceğin ağına!',tur:'kose'},{m:'Ağlar havalandı!',tur:'kose'},
 {m:'Roketatar bu çocuk!',tur:'sert'},{m:'Kaleci eldivenini yakmış!',tur:'sert'},{m:'Mermi gibi!',tur:'sert'},{m:'Ağı yırttı geçti!',tur:'sert'},{m:'Top yanıp tutuştu!',tur:'sert'},
 {m:'Ta uzaktan!',tur:'uzak'},{m:'Bu mesafeden mi?',tur:'uzak'},{m:'Duvarı da kaleciyi de dize getirdi!',tur:'uzak'},{m:'Ayağında GPS var bunun!',tur:'uzak'},
 {m:'Durmuyor, durmuyor!',tur:'seri'},{m:'Yine yine yine!',tur:'seri'},{m:'Ateş ediyor bu çocuk!',tur:'seri'},{m:'Seri bozulmuyor!',tur:'seri'},
 {m:'Soğukkanlılık dersi!',tur:'penalti'},{m:'Penaltı böyle atılır!',tur:'penalti'},{m:'Kaleciyi çaresiz bıraktı!',tur:'penalti'}];
/* Alay sözleri (kaçan şutlar): her sonuç türü için ~12 cümle; her seferinde 5'i seçilir. */
var ALAY_HAVUZ={
 aut:['Yuh!','Çüş!','Nereye vuruyon?','Hahaha!','Kaleyi göremedin mi?','Hava atışı mı bu?','Tribüne iyi mesaj!','Kale öbür tarafta!','Nişan al be kardeşim!','Uçak gibi gitti!','Satellite mi vuruyon?','Bu top artık Ay\'a gider!'],
 kisa:['Yuh!','Çüş!','Kısa kaldı!','Hahaha!','Topa kuvvet!','Yürüyerek bile giderdi!','Top yorulmuş!','Pil bitti galiba!','Biraz protein lazım!','Kaleye varmadan emekli oldu!','Uyuyakaldı top!','Aman, çok yazık!'],
 kurtaris:['Kaleci aldı!','Hadi canım!','Yuhhh!','Hahaha!','Bu muydu?','Kaleci okudu seni!','Eldivenler konuştu!','Çok kolay çıkardı!','Boşuna uğraşma!','Kaleci duvar gibi!','Kaleci sana kızdı!','Bunu da tutar!'],
 baraj:['Baraj yedi!','Yuh!','Hahaha!','Üstünden at!','Çüş!','Duvara vurdun!','Barajın arkasında kimse yok!','Baraj sağ olsun!','Duvar bile şaşırdı!','Üstünden aşırtmak yok mu?','Barajın dizilişi bozulmadı!','Yan topla ya da yukarı!'],
 direk_disari:['Direk seni sevmiyor!','Ahhh, bir karış!','Direk gol atmak istemedi!','Kıl payı!','Direk bunu sevmedi!','Bir santim daha!','Direk de kaleci gibi!','Yazık, çok yazık!'],
 ag:['Delik orada!','Yuh!','Hahaha!','Çüş!','Nişan nerede?','Ağa gitti, deliği kaçırdı!','Delik bir adım yanda!','Ağ topu sevdi!','Delik de bekliyordu!','Biraz sağa, biraz sola!','Top ağlarda, delik başka yerde!','Hedef orada değildi!'],
 halka:['Delik orada!','Yuh!','Hahaha!','Çüş!','Nişan nerede?','Halkaya değdi!','Kıl payı kaçtı!','Halka konuştu!','Bir pırtık daha içeri!','Halkaya selam verdi!','Bu kadar yakın mı olur!','Tam kenara!']};
function tohum(seed){var s=((seed|0)^0x5bd1e995)>>>0||1;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function karis(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* ctx: { altin, direk, falso, kose, sert, uzak, seri(>=3), tip }  → bağlama uygun tek söz seçilir (öncelik sırasıyla) */
function baglamEtiket(c){c=c||{};if(c.altin)return'altin';if(c.direk)return'direk';if(c.falso)return'falso';if(c.kose)return'kose';if(c.sert)return'sert';if(c.uzak)return'uzak';if(c.seri>=3)return'seri';if(c.tip==='penalti')return'penalti';return null;}
function golMetinleri(seed,c){var r=tohum(seed),tur=function(t){return GOL_HAVUZ.filter(function(x){return x.tur===t;});},sec=[],kullan={};
 function al(liste){var k=karis(liste,r);for(var i=0;i<k.length;i++)if(!kullan[k[i].m]){kullan[k[i].m]=1;sec.push(k[i]);return;}}
 al(tur('nida'));al(tur('fav'));var e=baglamEtiket(c);if(e)al(tur(e));
 var kalan=tur('genel').concat(tur('esprili'));while(sec.length<5)al(kalan);
 // sıra: nida önce (ilk bağırış), sonra karışık
 var ilk=sec[0],geri=karis(sec.slice(1),r);return[ilk].concat(geri);}
function alayMetinleri(tur,seed){var h=ALAY_HAVUZ[tur]||ALAY_HAVUZ.aut,k=karis(h.map(function(m){return{m:m};}),tohum(seed));return k.slice(0,5);}
/* Konuşma sentezi: Türkçe sesler arasında dönüşümlü, söz başına perde ve hız değişir; ilk söz (nida) en coşkulu. */
function trSesler(){try{var v=root.speechSynthesis.getVoices()||[],o=[];for(var i=0;i<v.length;i++)if(/^tr/i.test(v[i].lang))o.push(v[i]);return o;}catch(e){}return[];}
function konus(m,perde,hiz,ses){var u=new root.SpeechSynthesisUtterance(m.soz||m.m);u.lang='tr-TR';if(ses)u.voice=ses;u.pitch=perde;u.rate=hiz;u.volume=1;root.speechSynthesis.speak(u);}
function sesAcik(){return acik&&(!DT.ses||!DT.ses.acikMi||DT.ses.acikMi());}
function kur(){if(ctx)return true;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;ctx=new AC();ana=ctx.createGain();ana.gain.value=.9;ana.connect(ctx.destination);return true;}
async function getir(ad){
 if(!root.fetch)return null;
 for(var i=0;i<UZANTI.length;i++){try{var r=await root.fetch('assets/ses/'+ad+'.'+UZANTI[i]);if(!r||!r.ok)continue;var ham=await r.arrayBuffer();
  return await new Promise(function(ok,hata){var p=ctx.decodeAudioData(ham,ok,hata);if(p&&p.then)p.then(ok,hata);});}catch(e){}}
 return null;}
async function yukle(){if(yukleniyor||!kur())return;yukleniyor=true;ah=await getir('ah');yuh=await getir('yuh');if(!ah||!yuh)gol=await getir('gol');if(!tezYuk){tezYuk=true;for(var k=1;k<=24;k++){var b=await getir('tez-'+k);if(b)TEZ.push(b);else if(k>3&&!TEZ.length)break;}}}
function cal(buf,oran,kesim,ses,sure){var t=ctx.currentTime+.02,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
 s.buffer=buf;s.playbackRate.value=oran;f.type='lowpass';f.frequency.value=kesim;f.Q.value=.5;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(ses,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+sure);
 s.connect(f);f.connect(g);g.connect(ana);s.start(t,0,sure*oran+.2);s.stop(t+sure+.05);}
var api={
 ayarla:function(v){acik=!!v;if(acik&&kur()){if(ctx.state==='suspended'&&ctx.resume)ctx.resume();yukle();}
  if(acik&&root.speechSynthesis&&root.SpeechSynthesisUtterance){try{var u=new root.SpeechSynthesisUtterance(' ');u.volume=0;root.speechSynthesis.speak(u);}catch(e){}}},   // iOS: konuşma sentezi ilk kullanıcı dokunuşunda sessizce açılır
 golMetinleri:golMetinleri,
 golSes:function(seed,c){if(!sesAcik())return null;var m=golMetinleri(seed,c);
  if(TEZ.length&&kur()){var b=TEZ[((seed|0)%TEZ.length+TEZ.length)%TEZ.length];cal(b,1,9000,.95,Math.min(4,b.duration));return'kayit';}
  if(DT.AYAR&&DT.AYAR.tezTTS===false)return null;
  if(root.speechSynthesis&&root.SpeechSynthesisUtterance){try{root.speechSynthesis.cancel();var r=tohum(seed+7),sesler=trSesler(),n=Math.min(3,m.length);
   for(var i=0;i<n;i++){var ses=sesler.length?sesler[(i+((seed|0)&3))%sesler.length]:null,coskulu=i===0;
    konus(m[i],coskulu?1.12+r()*.2:.82+r()*.25,coskulu?1.08+r()*.12:1.0+r()*.14,ses);}}catch(e){return null;}return'konusma';}
  return null;},
 alayMetinleri:alayMetinleri,GOL_HAVUZ:GOL_HAVUZ,ALAY_HAVUZ:ALAY_HAVUZ,
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
