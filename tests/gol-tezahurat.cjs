// Tribün cümleleri ve spiker sesi: YALNIZ kullanıcının cümleleri; golde 3'ü (sarı), kaçan şutta genel olumsuz cümleler (krem), top auta gidince oyuncuya özel cümleler (pembe, yalnız o oyuncu);
// balonlar 4,2 sn kalır; uzun cümleler iki satıra bölünür; gol sesi: spiker kayıtları (gol / gollazo), konuşma sentezi YOK.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
function dunya(ek){const speak=[],cal={n:0,kaynaklar:[]};
 const root=Object.assign({DT:{AYAR:{}},AudioContext:function(){this.state='running';this.currentTime=0;this.destination={};this.createGain=()=>({gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});this.createBiquadFilter=()=>({frequency:{value:0},Q:{value:0},connect(){}});
  this.createBufferSource=()=>{const s={buffer:null,playbackRate:{value:1},connect(){},start(){cal.n++;cal.kaynaklar.push(s.buffer&&s.buffer.ad);},stop(){}};return s;};this.decodeAudioData=(h,ok)=>ok({duration:3,byteLength:h.byteLength,ad:h.ad});},
  speechSynthesis:{speak(u){speak.push(u);},cancel(){},getVoices:()=>[{lang:'tr-TR'}]},SpeechSynthesisUtterance:function(t){this.text=t;},addEventListener(){}},ek||{});
 vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/tezahurat.js','utf8'),root);return{T:root.DT.tezahurat,speak,cal,root};}
const KULLANICI_GOL=['Golllaazzzooooooooooo!','Koçum benim!','Senin yarrağını yiyeyim!','Gel bir kere de bana koy öyle!'];
const KULLANICI_GENEL=['Senin ayağının dümenini sikeyim','Kazma herif','Ya bi siktir git amk ya','Seni bu takıma alan hocanın anasını avradını sikeyim'];
const KULLANICI_OZEL={lort:['Topa Taksim\'den vurdu Çekmeköy\'e gitti amk','3 ölü 1 yaralı var','Giresunlu futbolcu olmaz zaten'],latte:['Hollandalı hıyar seni','Baba sen topu mopu bırak paket atmaya devam et'],josh:['Çektiği şuta bak aq','senin çektiğin şutun anasını sikeyim','Yozgat\'a geri dön'],fero:['Gözünü sikeyim vurduğun yere bak!','Mars\'a gitti top aq','Karga marga kalmadı hepsi öldü amk']};
// ---- 1) Cümleler: kullanıcının listeleri, başka cümle yok ----
{const {T}=dunya();assert.deepEqual(T.GOL_SOZ,KULLANICI_GOL,'gol cümleleri: yalnız dört cümlen');assert.deepEqual(T.GENEL_OLUMSUZ,KULLANICI_GENEL,'genel olumsuz cümleler');assert.deepEqual(T.OZEL_OLUMSUZ,KULLANICI_OZEL,'oyuncuya özel cümleler');
 assert.equal(T.GOL_HAVUZ,undefined,'eski 60 cümlelik havuz yok');assert.equal(T.ALAY_HAVUZ,undefined,'eski alay havuzu yok');
 const hepsi=[].concat(T.GOL_SOZ,T.GENEL_OLUMSUZ,...Object.values(T.OZEL_OLUMSUZ));assert(!hepsi.some(x=>/ibne/i.test(x)),'yerine konan ifade: hakaret ama ayrımcı sözcük yok');
 // gol: dörtten üçü, karışık, deterministik, hepsi sık çıkar
 const say={};for(let s=0;s<800;s++){const m=T.golMetinleri(s);assert.equal(m.length,3);assert.equal(new Set(m.map(x=>x.m)).size,3);m.forEach(x=>{assert(KULLANICI_GOL.includes(x.m),'gol cümlesi senin listende: '+x.m);say[x.m]=(say[x.m]||0)+1;});assert.deepEqual(m.map(x=>x.m),T.golMetinleri(s).map(x=>x.m));}
 for(const k of KULLANICI_GOL)assert(say[k]>800*.62&&say[k]<800*.88,k+' ≈%75 çıkar: '+say[k]);
 // kaçan şut
 const gec=(tur,kisi,s)=>T.alayMetinleri(tur,s,kisi);
 for(let s=0;s<200;s++){
  const meto=gec('aut','meto',s);assert.deepEqual(meto.map(x=>x.m).sort(),KULLANICI_GENEL.slice().sort(),'meto: yalnız genel dört cümle');assert(meto.every(x=>!x.ozel));
  for(const [kisi,ozel] of Object.entries(KULLANICI_OZEL)){const a=gec('aut',kisi,s);assert.equal(a.length,5,kisi+': 5 balon');assert.equal(new Set(a.map(x=>x.m)).size,5);for(const o of ozel)assert(a.some(x=>x.m===o&&x.ozel===true),kisi+': özel cümle var: '+o);assert.equal(a.filter(x=>x.ozel).length,ozel.length,kisi+': özel sayısı');assert(a.every(x=>x.ozel?ozel.includes(x.m):KULLANICI_GENEL.includes(x.m)),kisi+': yalnız senin cümlelerin');
   // başkasının özel cümlesi çıkmaz
   for(const [k2,oz2] of Object.entries(KULLANICI_OZEL))if(k2!==kisi)assert(!a.some(x=>oz2.includes(x.m)),kisi+': '+k2+'\'nin cümlesi çıkmaz');
   // top auta gitmeyince özel cümle yok
   {const b=gec('direk_disari',kisi,s);assert(b.every(x=>!x.ozel&&KULLANICI_GENEL.includes(x.m)),kisi+' direk: yalnız genel cümleler');assert.equal(b.length,4);}
   for(const tur of ['kurtaris','baraj','kisa','halka','ag','gol'])assert.deepEqual(gec(tur,kisi,s),[],kisi+' '+tur+': balon yok (yalnız aut ve direkte)');}
  assert.deepEqual(gec('aut','bilinmeyen',s).map(x=>x.m).sort(),KULLANICI_GENEL.slice().sort(),'bilinmeyen oyuncu: genel');assert.deepEqual(gec('aut','lort',s).map(x=>x.m),gec('aut','lort',s).map(x=>x.m),'deterministik');}
 const farkli=new Set();for(let s=0;s<100;s++)farkli.add(gec('aut','fero',s).map(x=>x.m).join('|'));assert(farkli.size>10,'sıra ve genel seçim değişir: '+farkli.size);}
// ---- 2) Ses: konuşma sentezi KULLANILMAZ; spiker kayıtları (gol/gollazo) ----
{const {T,speak,cal,root}=dunya();T.ayarla(true);assert.equal(speak.length,0,'sesi açarken konuşma sentezi yok (iOS kilidi dahil)');assert.equal(T.golSes(7,{}),null,'kayıt yokken gol sesi çalmaz');assert.equal(T.golSes(7,{sert:true}),null);assert.equal(speak.length,0,'konuşma sentezi hiç çağrılmaz');
 assert(!/speechSynthesis|SpeechSynthesisUtterance/.test(fs.readFileSync(__dirname+'/../js/tezahurat.js','utf8')),'kodda konuşma sentezi yok');}
(async()=>{
 const kayit=(liste)=>async(u)=>{const m=String(u).match(/spiker-(gol|gollazo)-(\d+)\.mp3$/);const ad=m&&m[1]+m[2];return liste.includes(ad)?{ok:true,arrayBuffer:async()=>{const b=new ArrayBuffer(8);b.ad=ad;return b;}}:{ok:false};};
 const bekle=async()=>{for(let i=0;i<60;i++)await new Promise(r=>setTimeout(r,5));};
 {const e=dunya({fetch:kayit(['gol1','gol2','gollazo1'])});e.T.ayarla(true);await bekle();assert.deepEqual([e.T._test().spikerGol,e.T._test().spikerGollazo],[2,1],'iki gol, bir gollazo kaydı yüklendi');
  for(let s=0;s<20;s++){e.cal.kaynaklar.length=0;assert.equal(e.T.golSes(s,{}),'spiker');assert(/^gol\d$/.test(e.cal.kaynaklar[0]),'sıradan gol: gol grubundan '+e.cal.kaynaklar[0]);}
  for(const c of [{sert:1},{falso:1},{kose:1},{altin:1},{direk:1},{uzak:1},{seri:3}]){e.cal.kaynaklar.length=0;assert.equal(e.T.golSes(5,c),'spiker');assert.equal(e.cal.kaynaklar[0],'gollazo1','büyük gol: gollazo grubundan '+JSON.stringify(c));}
  e.cal.kaynaklar.length=0;e.T.golSes(5,{seri:2});assert(/^gol\d$/.test(e.cal.kaynaklar[0]),'seri 2: büyük sayılmaz');const kullanilan=new Set();for(let s=0;s<40;s++){e.cal.kaynaklar.length=0;e.T.golSes(s,{});kullanilan.add(e.cal.kaynaklar[0]);}assert.deepEqual([...kullanilan].sort(),['gol1','gol2'],'kayıtlar dönüşümlü');}
 // yedek: yalnız bir grup varsa o çalar
 {const e=dunya({fetch:kayit(['gol1'])});e.T.ayarla(true);await bekle();e.T.golSes(1,{sert:1});assert.equal(e.cal.kaynaklar[0],'gol1','gollazo yoksa gol kaydı çalar');}
 {const e=dunya({fetch:kayit(['gollazo1','gollazo2'])});e.T.ayarla(true);await bekle();e.T.golSes(1,{});assert(/^gollazo/.test(e.cal.kaynaklar[0]),'gol grubu yoksa gollazo çalar');}
 // numaralar kesintisiz olmalı (1,3 → yalnız 1)
 {const e=dunya({fetch:kayit(['gol1','gol3'])});e.T.ayarla(true);await bekle();assert.equal(e.T._test().spikerGol,1,'2. dosya yoksa 3. aranmaz');}
 // ses kapalıyken sessiz
 {const e=dunya({fetch:kayit(['gol1'])});e.T.ayarla(true);await bekle();e.root.DT.ses={acikMi:()=>false};assert.equal(e.T.golSes(1,{}),null);}
 // ---- 3) Balonlar (çizim) ----
 let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},location:{search:''}};vm.createContext(root);
 for(const n of ['ayar','perf','ruzgar','bonus','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','tezahurat','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
 const D=root.DT;
 function tuval(W,H){const cv=C.createCanvas(W,H),g=cv.getContext('2d');D.cizim.kur(cv,W,H,1);D.cizim.sahneKur(D.AYAR.pozisyonlar[5],0);return{cv,g,W,H};}
 const kare=(t,ek)=>{now=1000+6000;D.cizim.ciz(Object.assign({top:{x:D.AYAR.pozisyonlar[5].bx,y:.11,z:0}},ek));return Uint8ClampedArray.from(t.g.getImageData(0,35,t.W,130).data);};
 const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
 const sar=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>240&&f[i+1]>225&&f[i+2]>130&&f[i+2]<190)n++;return n;},krem=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>240&&f[i+1]>235&&f[i+2]>205&&f[i+2]<235)n++;return n;},pembe=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>245&&f[i+1]>205&&f[i+1]<228&&f[i+2]>195&&f[i+2]<220)n++;return n;};
 {const t=tuval(390,844);const bos=kare(t,{}),gol=kare(t,{alay:.9,alayTur:'gol',alayTohum:5,heyecan:1}),meto=kare(t,{alay:1.2,alayTur:'aut',alayTohum:4,alayKisi:'meto'}),lort=kare(t,{alay:1.2,alayTur:'aut',alayTohum:4,alayKisi:'lort'}),lortDirek=kare(t,{alay:1.2,alayTur:'direk_disari',alayTohum:4,alayKisi:'lort'});
  assert(sar(gol)>sar(bos)+150,'gol balonları sarı');assert(krem(meto)>krem(bos)+150&&pembe(meto)<=pembe(bos)+30,'meto: krem genel balonlar, pembe özel yok: '+pembe(bos)+'→'+pembe(meto));assert(pembe(lort)>pembe(bos)+250,'lort + aut: pembe özel balonlar: '+pembe(bos)+'→'+pembe(lort));assert(pembe(lortDirek)<=pembe(bos)+30&&krem(lortDirek)>krem(bos)+150,'lort + direk: özel cümle yok, genel var');
  // süre: balon 4,2 sn yaşar (ilk balon 4,2'de biter, sonuncusu ≈4,7'de), 5,4 sn'de hiçbiri yok; eskiden 3,4 sn'ydi
  const erken=kare(t,{alay:.9,alayTur:'aut',alayTohum:4,alayKisi:'meto'}),dort=kare(t,{alay:4.0,alayTur:'aut',alayTohum:4,alayKisi:'meto'}),bes=kare(t,{alay:4.5,alayTur:'aut',alayTohum:4,alayKisi:'meto'}),son=kare(t,{alay:5.6,alayTur:'aut',alayTohum:4,alayKisi:'meto'});
  assert(fark(bos,dort)>400,'4,0 sn: balonlar hâlâ ekranda, sönmeye başlamış (eskiden 3,4 sn de kalkıyordu): '+fark(bos,dort));assert(fark(bos,bes)>0&&fark(bos,bes)<fark(bos,dort),'4,5 sn: son balonlar sönüyor '+fark(bos,bes)+' < '+fark(bos,dort));const uc=kare(t,{alay:3.0,alayTur:'aut',alayTohum:4,alayKisi:'meto'});assert(krem(uc)>krem(bos)+150,'3,0 sn: balonlar tam görünür '+krem(uc));assert.equal(fark(bos,son),0,'5,6 sn: hiç balon yok');
  const g4=kare(t,{alay:3.3,alayTur:'gol',alayTohum:5,heyecan:1}),g6=kare(t,{alay:5.6,alayTur:'gol',alayTohum:5,heyecan:1});assert(sar(g4)>sar(bos)+60,'gol balonları 3,3 sn de hâlâ ekranda (eskiden 2,6 sn de kalkardı)');assert(sar(g6)<=sar(bos)+5,'gol balonları 5,6 sn\'de yok');}
 // ekrana sığma: dar ekranda (320) en uzun cümleler iki satıra bölünür ve kenara taşmaz
 {const t=tuval(320,568),bos=Uint8ClampedArray.from((kare(t,{}),t.g.getImageData(0,0,320,130).data));let tasma=0;
  for(const kisi of ['lort','latte','josh','fero','meto'])for(let tohum=0;tohum<12;tohum++){now=7000;D.cizim.ciz({top:{x:D.AYAR.pozisyonlar[5].bx,y:.11,z:0},alay:1.5,alayTur:'aut',alayTohum:tohum,alayKisi:kisi});const f=t.g.getImageData(0,0,320,130).data;for(let y=0;y<130;y++)for(const x of [0,1,2,317,318,319]){const i=(y*320+x)*4;if(krem(f.slice(i,i+4))+pembe(f.slice(i,i+4))>0)tasma++;}}
  assert.equal(tasma,0,'balonlar 320 px ekranda kenara taşmaz');}
 // ---- 4) Oyun entegrasyonu ----
 {const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/d\.alayTur = 'gol'/.test(oyun)&&/DT\.tezahurat\.golSes\(d\.alayTohum, d\.golCtx\)/.test(oyun),'gol: balon ve spiker sesi');assert(/out\.alayKisi = d\.karakter/.test(oyun),'oyuncu kimliği çizime gider');assert(/d\.alayTur = 'direk_disari'/.test(oyun),'direkten dönüşte de balonlar');assert(/\(d\.alayTur === 'gol' && d\.alayT0\) \? 1/.test(oyun),'gol anında tribün tam coşar');}
 console.log('PASS tribün: yalnız senin cümlelerin (gol: dörtten 3; kaçan şut: genel 4; auta gidince oyuncuya özel, yalnız o oyuncu), balonlar 4,2 sn ve iki satır, gol sesi spiker kaydı (gol/gollazo), konuşma sentezi yok');
})().catch(e=>{console.error(e);process.exit(1)});
