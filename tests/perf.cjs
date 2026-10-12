// Performans ölçümü (js/perf.js): faza göre kare istatistiği, p95, olaylar, rapor metni, gizli gösterge, kademeli kalite kararı.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function dunya(ek){const depo={};const root=Object.assign({DT:{},localStorage:{getItem:k=>depo[k]===undefined?null:depo[k],setItem:(k,v)=>{depo[k]=String(v);}},navigator:{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',hardwareConcurrency:6},screen:{width:390,height:844},devicePixelRatio:3,location:{search:''}},ek||{});vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/perf.js','utf8'),root);return{P:root.DT.perf,root,depo};}
// 1) Faz istatistiği ve rapor
{const {P}=dunya();for(let i=0;i<100;i++)P.kare(16.7,'nisan');for(let i=0;i<50;i++)P.kare(30,'vurus');P.kare(140,'vurus');P.kare(60,'sonuc');P.kare(12,'menu');P.kare(12,'bos');P.kare(5000,'vurus');P.kare(-3,'nisan');P.kare(NaN,'nisan');   // 5000 ms (sekme arka planda), negatif ve NaN sayılmaz
 P.olay('pozisyon açılışı',90);P.olay('pozisyon açılışı',210);P.olay('vuruş hesabı',12);
 const m=P.rapor();assert(/DURAN TOP PERFORMANS RAPORU/.test(m));assert(/iPhone/.test(m),'cihaz bilgisi');assert(/390×844 @3x/.test(m),'ekran bilgisi');assert(/çekirdek: 6/.test(m));
 const satir=ad=>m.split('\n').find(l=>l.startsWith(ad));const uc=satir('uçuş'),ni=satir('nişan'),so=satir('sonuç'),me=satir('menü');
 assert(/\b51\b/.test(uc)&&/140\.0/.test(uc),'uçuş: 51 kare (5000 ms sayılmadı), en uzun 140 ms: '+uc);assert(/\b1\b\s*$/.test(uc),'uçuş: 1 takılma (>120 ms)');
 assert(/\b100\b/.test(ni)&&/16\.7/.test(ni),'nişan: 100 kare, ort 16.7: '+ni);assert(/\b1\b/.test(so)&&/60\.0/.test(so));assert(/\b2\b/.test(me),'bos ve menu aynı faz: '+me);
 assert(/pozisyon açılışı n=2 ort=150\.0 maks=210\.0/.test(m),'olay istatistiği');assert(/vuruş hesabı n=1 ort=12\.0/.test(m));
 const z=P.ozet();assert(z.fps>0&&z.ort>0&&z.maks>=0);}
// 2) Yüzdelik doğru (p95)
{const {P}=dunya();assert.equal(P._yuzdelik([1,2,3,4,5,6,7,8,9,10],.95),10);assert.equal(P._yuzdelik([5],.95),5);assert.equal(P._yuzdelik([],.95),0);const dz=[];for(let i=1;i<=100;i++)dz.push(i);const p=P._yuzdelik(dz,.95);assert(p>=95&&p<=96,'p95 '+p);}
// 3) Kademeli kalite: akıcı cihazda kademe 0; yavaşta ≥180 kare sonra (≈3 sn) kademe 1, 180 kare sonra 2 (en çok 2); uzun süre akıcıysa geri döner
{const {P}=dunya();for(let i=0;i<1000;i++)P.kare(16.7,'nisan');assert.equal(P.kalite(),0,'akıcı cihazda kademe düşmez');
 P.sifirla();for(let i=0;i<179;i++)P.kare(40,'vurus');assert.equal(P.kalite(),0,'ilk karar için 180 kare beklenir');
 P.kare(40,'vurus');assert.equal(P.kalite(),1,'180 yavaş kare: kademe 1');
 for(let i=0;i<179;i++)P.kare(40,'vurus');assert.equal(P.kalite(),1,'iki karar arasında en az 180 kare');
 P.kare(40,'vurus');assert.equal(P.kalite(),2,'hâlâ yavaşsa kademe 2');
 for(let i=0;i<1500;i++)P.kare(60,'vurus');assert.equal(P.kalite(),2,'kademe 2'+'nin altına inmez ('+P.kalite()+')');
 for(let i=0;i<2400;i++)P.kare(14,'nisan');assert.equal(P.kalite(),0,'uzun süre akıcıysa kademeler geri döner');}
// 4) Tek tük takılma (p95 etkilenmez, ort düşük) kademeyi düşürmez
{const {P}=dunya();for(let k=0;k<30;k++){for(let i=0;i<40;i++)P.kare(15,'nisan');P.kare(130,'nisan');}assert.equal(P.kalite(),0,'seyrek takılma kademeyi düşürmez');}
// 5) Kademe URL ile sabitlenir ve otomatik karar kapanır
{const {P}=dunya({location:{search:'?kalite=2'}});P.baslat();assert.equal(P.kalite(),2);for(let i=0;i<3000;i++)P.kare(10,'nisan');assert.equal(P.kalite(),2,'sabit kademe değişmez');P.sabitle('auto');for(let i=0;i<3000;i++)P.kare(10,'nisan');}
{const {P}=dunya();P.sabitle(7);assert.equal(P.kalite(),2,'sınırlandı');P.sabitle(-4);assert.equal(P.kalite(),0);}
// 6) Gizli gösterge: puana 5 kez dokunma (3 sn içinde) açar/kapatır; ?perf=1 ve kayıt
{const {P,depo}=dunya();assert.equal(P.aktif(),false);for(let i=0;i<4;i++)assert.equal(P.dokun(1000+i*500),false);assert.equal(P.dokun(3000),true);P.goster(true);assert.equal(P.aktif(),true);assert.equal(depo.dt_perf,'1','açık kalır');
 const a=dunya();for(let i=0;i<4;i++)a.P.dokun(i*2000);assert.equal(a.P.aktif(),false,'dokunmalar 3 sn içinde değilse açılmaz');
 const b=dunya({location:{search:'?perf=1'}});b.P.baslat();assert.equal(b.P.aktif(),true,'?perf=1');}
// 7) Rapor kaydedilir ve DOM yokken hata vermez
{const {P,depo}=dunya();P.kare(16,'nisan');const m=P.raporGoster();assert.equal(depo.dt_perf_son,m,'son rapor saklanır');}
// 8) Oyun entegrasyonu: döngü faza göre kare gönderir; olaylar ölçülür; elemanlar var
{const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
 assert(/DT\.perf\.kare\(now - d\.sonKare, d\.ekran === 'oyun' \? d\.faz : 'menu'\)/.test(oyun));assert(/DT\.perf\.olay\('vuruş hesabı'/.test(oyun)&&/DT\.perf\.olay\('pozisyon açılışı'/.test(oyun)&&/DT\.perf\.baslat\(\)/.test(oyun));
 assert(/id="perfKutu"/.test(html)&&/id="perfRapor"/.test(html)&&/js\/perf\.js/.test(html));assert(html.indexOf('js/perf.js')<html.indexOf('js/cizim.js'),'perf.js cizim.js'+'ten önce yüklenir');}
console.log('PASS performans ölçümü: faz istatistiği (sekme duraklaması sayılmaz), p95, olaylar, rapor, 3 sn içinde 5 dokunuşla gizli gösterge, ?kalite ve ?perf, kademeli kalite kararı');
