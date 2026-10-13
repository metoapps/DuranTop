// Gol tezahüratı: sözler (seed'e göre 5 söz), ses (gerçek kayıt > Türkçe konuşma sentezi > sessiz), gol balonları (sarı) ve tribün coşkusu; alay (mavi/krem) yalnız kaçan şutta.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
// ---- 1) tezahurat.js: sözler ve ses zinciri ----
function dunya(ek){const konus=[],cal={n:0};const root=Object.assign({DT:{AYAR:{tezTTS:true}},AudioContext:function(){this.state='running';this.currentTime=0;this.destination={};this.createGain=()=>({gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});this.createBiquadFilter=()=>({frequency:{value:0},Q:{value:0},connect(){}});this.createBufferSource=()=>({buffer:null,playbackRate:{value:1},connect(){},start(){cal.n++;},stop(){}});this.decodeAudioData=(h,ok)=>ok({duration:3,byteLength:h.byteLength});},
 speechSynthesis:{speak(u){konus.push(u);},cancel(){konus.cancelled=(konus.cancelled||0)+1;},getVoices:()=>[{lang:'en-US',name:'en'},{lang:'tr-TR',name:'Yelda'}]},SpeechSynthesisUtterance:function(t){this.text=t;},addEventListener(){}},ek||{});vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/tezahurat.js','utf8'),root);return{T:root.DT.tezahurat,konus,cal,root};}
{const {T}=dunya();const hepsi=new Set(),say={};for(let s=0;s<400;s++){const m=T.golMetinleri(s);assert.equal(m.length,5,'5 söz');assert.equal(new Set(m.map(x=>x.m)).size,5,'tekrar yok');assert.deepEqual(m.map(x=>x.m),T.golMetinleri(s).map(x=>x.m),'aynı seed aynı sözler');m.forEach(x=>{hepsi.add(x.m);say[x.m]=(say[x.m]||0)+1;});}
 for(const k of ['Golllaazzzooooooooooo!','Koçum benim!','Senin yarrağını yiyeyim!','Gel bir kere de bana koy öyle!'])assert(say[k]>=400*.6,k+' sık çıkar: '+say[k]);assert(hepsi.size===8,'8 sözün hepsi çıkar: '+hepsi.size);assert.equal(new Set(Array.from({length:50},(_,s)=>T.golMetinleri(s).map(x=>x.m).join('|'))).size>10,true,'çeşitlilik');}
// ses kapalıyken hiçbir şey çalmaz
{const {T,konus}=dunya();assert.equal(T.golSes(1),null);assert.equal(konus.length,0);}
// konuşma sentezi: kayıt yokken Türkçe sesle iki söz okunur
{const {T,konus}=dunya();T.ayarla(true);assert.equal(konus.length,1,'iOS kilidi: sessiz bir deneme');assert.equal(konus[0].volume,0);konus.length=0;
 const r=T.golSes(7);assert.equal(r,'konusma');assert.equal(konus.length,2,'iki söz');assert(konus.every(u=>u.lang==='tr-TR'&&u.volume===1&&u.voice&&u.voice.lang==='tr-TR'),'Türkçe ses');assert(konus.every(u=>u.pitch>=.75&&u.pitch<=1.05&&u.rate>=1&&u.rate<=1.15),'perde/hız');
 const m=T.golMetinleri(7);assert.equal(konus[0].text,m[0].soz||m[0].m);assert.equal(konus[1].text,m[1].soz||m[1].m);assert(konus.cancelled>=1,'önceki konuşma iptal');
 // Gol sözünün okunuşu uzatılmış yazımdan farklı olabilir (konuşma sentezi için)
 const g=T.golMetinleri(0).concat(T.golMetinleri(1),T.golMetinleri(2),T.golMetinleri(3)).find(x=>/Gol/.test(x.m));assert(g&&g.soz&&g.soz!==g.m,'gol sözünün okunuşu ayrı');}
// konuşma sentezi kapalıysa ve kayıt yoksa sessiz
{const e=dunya();e.root.DT.AYAR.tezTTS=false;e.T.ayarla(true);e.konus.length=0;assert.equal(e.T.golSes(3),null);assert.equal(e.konus.length,0);}
// tarayıcıda konuşma sentezi yoksa sessiz, hata yok
{const e=dunya({speechSynthesis:undefined,SpeechSynthesisUtterance:undefined});e.T.ayarla(true);assert.equal(e.T.golSes(3),null);}
// gerçek kayıtlar (tez-1.mp3, tez-2.mp3): konuşma sentezi çalmaz, kayıt çalar
(async()=>{const e=dunya({fetch:async(u)=>/tez-[12]\.mp3$/.test(u)?{ok:true,arrayBuffer:async()=>new ArrayBuffer(9)}:{ok:false}});e.T.ayarla(true);for(let i=0;i<40;i++)await new Promise(r=>setTimeout(r,5));
 assert.equal(e.T._test().tez,2,'iki kayıt yüklendi');e.konus.length=0;const c0=e.cal.n;assert.equal(e.T.golSes(4),'kayit');assert.equal(e.cal.n,c0+1,'kayıt çalındı');assert.equal(e.konus.length,0,'kayıt varken konuşma sentezi yok');
 // ---- 2) cizim: gol balonları ----
 let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},location:{search:''}};vm.createContext(root);
 for(const n of ['ayar','perf','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','tezahurat','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
 const D=root.DT,W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');D.cizim.kur(cv,W,H,1);D.cizim.sahneKur(D.AYAR.pozisyonlar[5],0);
 const kare=(ek)=>{now=1000+6000;D.cizim.ciz(Object.assign({top:{x:D.AYAR.pozisyonlar[5].bx,y:.11,z:0}},ek));return Uint8ClampedArray.from(g.getImageData(0,35,W,130).data);};
 const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
 const sari=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>240&&f[i+1]>225&&f[i+2]>130&&f[i+2]<190)n++;return n;},krem=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>240&&f[i+1]>235&&f[i+2]>205&&f[i+2]<235)n++;return n;};
 const normal=kare({}),gol=kare({alay:.9,alayTur:'gol',alayTohum:5,heyecan:1}),aut=kare({alay:.9,alayTur:'aut'}),golBitti=kare({alay:3.6,alayTur:'gol',alayTohum:5,heyecan:1}),golBitiksiz=kare({heyecan:1});
 assert(sari(gol)>sari(normal)+150&&sari(gol)>krem(gol)*2,'gol balonları sarı: '+sari(normal)+'→'+sari(gol)+' (krem '+krem(gol)+')');assert(krem(aut)>krem(normal)+150&&sari(aut)<sari(gol)*.3,'alay balonları krem');
 assert(fark(gol,aut)>2000,'gol ve alay farklı görünür');assert.equal(fark(golBitti,golBitiksiz),0,'3,4 sn sonra balonlar kalkar');assert(fark(gol,kare({alay:.9,alayTur:'gol',alayTohum:6,heyecan:1}))>300,'farklı seed farklı sözler/yerler');
 assert.equal(fark(gol,kare({alay:.9,alayTur:'gol',alayTohum:5,heyecan:1})),0,'aynı seed aynı kare');
 // gol sırasında kalabalık alay duruşuna geçmez (kollar havada): gol karesi, balonsuz coşku karesine yalnız balon bölgelerinde farklı
 const balonsuz=fark(gol,golBitiksiz);assert(balonsuz>300&&balonsuz<25000,'gol karesi: yalnız balonlar eklenir ('+balonsuz+')');
 // oyun entegrasyonu
 const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/d\.alayTur = 'gol'/.test(oyun)&&/DT\.tezahurat\.golSes\(d\.alayTohum\)/.test(oyun));assert(/\(d\.alayTur === 'gol' && d\.alayT0\) \? 1/.test(oyun),'gol anında tribün tam coşar');
 console.log('PASS gol tezahüratı: 5 söz (seed), kayıt > Türkçe konuşma > sessiz, iOS kilidi, sarı gol balonları, alaydan farklı, 3,4 sn sonra kalkar');
})().catch(e=>{console.error(e);process.exit(1)});
