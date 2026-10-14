// Günlük meydan okuma ve hayatta kal: saf mantık (gün numarası, tohum, pozisyon seçimi, kayıt ve seri, zorluk eğrisi, rekor).
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function dunya(){const depo={};const r={DT:{},localStorage:{getItem:k=>depo[k]===undefined?null:depo[k],setItem:(k,v)=>{depo[k]=String(v);}}};vm.createContext(r);for(const n of ['ayar','ucus','fizik','hedef','modlar'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);return{D:r.DT,depo};}
const {D,depo}=dunya(),M=D.modlar,P=D.AYAR.pozisyonlar,H=D.hedef.pozisyonlar;
// 1) Gün numarası: İstanbul (UTC+3) gece yarısı değişir; #1 = 1 Ekim 2026
{const t=(y,a,g,sa,dk)=>Date.UTC(y,a-1,g,sa,dk);assert.equal(M.gunSira(M.gunNo(t(2026,10,1,10,0))),1,'1 Ekim = #1');assert.equal(M.gunSira(M.gunNo(t(2026,10,14,10,0))),14);
 assert.equal(M.gunNo(t(2026,10,14,20,59)),M.gunNo(t(2026,10,14,10,0)),'20:59 UTC = 23:59 İstanbul: aynı gün');assert.equal(M.gunNo(t(2026,10,14,21,0)),M.gunNo(t(2026,10,14,10,0))+1,'21:00 UTC = 00:00 İstanbul: yeni gün');}
// 2) Günlük pozisyonlar: aynı gün aynı vuruşlar, tür sırası penaltı-frikik-hedef; günler arası çeşitlilik; tohumlar
{const g=M.gunNo(Date.UTC(2026,9,14,12,0));const a=M.gunPozisyonlar(g,P,H),b=M.gunPozisyonlar(g,P,H);assert.deepEqual(a.map(p=>p.ad),b.map(p=>p.ad));assert.deepEqual(a.map(p=>p.tip),['penalti','frikik','hedef']);
 const gorulen=new Set(),turler={pen:new Set(),fr:new Set(),he:new Set()};for(let i=0;i<400;i++){const x=M.gunPozisyonlar(g+i,P,H);turler.pen.add(x[0].ad);turler.fr.add(x[1].ad);turler.he.add(x[2].ad);gorulen.add(x.map(p=>p.ad).join('|'));}
 assert(turler.pen.size===5&&turler.fr.size===5&&turler.he.size===5,'her havuzdan çıkar');assert(gorulen.size>60,'günler arası çeşitlilik '+gorulen.size);
 const s=[0,1,2].map(i=>M.gunSeed(g,i));assert.equal(new Set(s).size,3,'vuruş başına ayrı tohum');assert.deepEqual(s,[0,1,2].map(i=>M.gunSeed(g,i)),'aynı gün aynı tohum');assert.notDeepEqual(s,[0,1,2].map(i=>M.gunSeed(g+1,i)));assert(s.every(v=>Number.isInteger(v)&&v>=0&&v<=0x7fffffff));}
// 3) Günlük kayıt: ilk deneme sayılır, seri ardışık günleri sayar
{const g=M.gunNo(Date.UTC(2026,9,14,12,0));assert.deepEqual(M.gunlukDurum(g),{oynadi:false,puan:0,goller:0,deneme:0,seri:0,toplamGun:0});
 assert.deepEqual(M.gunlukKaydet(g,14,2),{ilk:true,puan:14,goller:2});assert.deepEqual(M.gunlukKaydet(g,30,3),{ilk:false,puan:14,goller:2},'ikinci deneme kayda geçmez, ilk puan kalır');
 let d=M.gunlukDurum(g);assert.equal(d.puan,14);assert.equal(d.deneme,2);assert.equal(d.seri,1);
 M.gunlukKaydet(g-1,9,1);M.gunlukKaydet(g-2,11,2);assert.equal(M.gunlukDurum(g).seri,3,'3 gün üst üste');M.gunlukKaydet(g-4,5,1);assert.equal(M.gunlukDurum(g).seri,3,'boşluk seriyi keser');
 assert.equal(M.gunlukDurum(g+1).seri,3,'bugün henüz oynanmadıysa dünkü seri korunur');M.gunlukKaydet(g+1,20,3);assert.equal(M.gunlukDurum(g+1).seri,4);assert.equal(M.gunlukDurum(g+5).seri,0,'iki gün boş: seri sıfır');
 const t=M.gunlukMetin(g,14,2,3);assert(/Günlük #14: 14 puan \(2\/3 gol\)/.test(t)&&/🔥 3 gün üst üste/.test(t)&&/Aynı 3 vuruş/.test(t),t);assert(!/🔥/.test(M.gunlukMetin(g,14,2,1)));
 const e=dunya();e.depo.dt_gunluk='{bozuk';assert.equal(e.D.modlar.gunlukDurum(5).oynadi,false);assert.equal(e.D.modlar.gunlukKaydet(5,3,1).ilk,true,'bozuk kayıt yoksayılır');}
// 4) Hayatta kal: zorluk eğrisi monoton ve sınırlı
{let on=-1,or=-1;for(let g=0;g<=30;g++){const z=M.hayatZorluk(g);assert(z.seviye>=on&&z.ruzgarOlcek>=or,'zorluk azalmaz');assert(z.seviye<=1&&z.ruzgarOlcek<=1.3&&z.ruzgarOlcek>=.25);on=z.seviye;or=z.ruzgarOlcek;}assert.equal(M.hayatZorluk(0).seviye,0);assert.equal(M.hayatZorluk(14).seviye,1);assert(M.hayatZorluk(0).ruzgarOlcek<.3&&M.hayatZorluk(12).ruzgarOlcek>1.2);}
// 5) Hayatta kal pozisyon dağılımı: erken penaltı ağırlıklı; geç uzak frikik ve hedef ağı da çıkar; aynı tohum aynı dizi
{const dag=(g)=>{const s={pen:0,yakin:0,uzak:0,hedef:0},N=6000;for(let i=0;i<N;i++){const p=M.hayatPoz(i,12345,g,P,H);if(p.tip==='hedef')s.hedef++;else if(p.tip==='penalti')s.pen++;else if(/Yakın/.test(p.ad))s.yakin++;else s.uzak++;}for(const k in s)s[k]/=N;return s;};
 const e=dag(0),o=dag(5),g=dag(10);assert(e.pen>.55&&e.pen<.65&&e.uzak===0&&e.hedef===0&&e.yakin>.35,'erken: penaltı ağırlıklı, uzak ve hedef yok '+JSON.stringify(e));assert(o.uzak>.25&&o.hedef===0,'orta: uzak frikik gelir '+JSON.stringify(o));assert(g.hedef>.15&&g.uzak>.2&&g.pen>.2&&g.pen<.3,'geç: hedef ağı da gelir '+JSON.stringify(g));
 assert.deepEqual([0,1,2,3,4,5].map(i=>M.hayatPoz(i,99,4,P,H).ad),[0,1,2,3,4,5].map(i=>M.hayatPoz(i,99,4,P,H).ad));assert.notDeepEqual([0,1,2,3,4,5,6,7].map(i=>M.hayatPoz(i,99,4,P,H).ad),[0,1,2,3,4,5,6,7].map(i=>M.hayatPoz(i,100,4,P,H).ad),'farklı tohum farklı dizi');}
// 6) Rekor
{const e=dunya(),m=e.D.modlar;assert.deepEqual(m.hayatDurum(),{rekor:0,oyun:0,toplamGol:0});assert.deepEqual(m.hayatKaydet(4),{rekor:true,onceki:0,yeni:4});assert.deepEqual(m.hayatKaydet(2),{rekor:false,onceki:4,yeni:4});assert.deepEqual(m.hayatKaydet(4),{rekor:false,onceki:4,yeni:4},'eşitlik rekor değil');assert.deepEqual(m.hayatKaydet(9),{rekor:true,onceki:4,yeni:9});assert.deepEqual(m.hayatDurum(),{rekor:9,oyun:4,toplamGol:19});}
console.log('PASS modlar: gün numarası (İstanbul gece yarısı), günlük tohum ve pozisyonlar, ilk deneme kaydı ve günlük seri, paylaşım metni, hayatta kal zorluk eğrisi, pozisyon dağılımı, rekor');
