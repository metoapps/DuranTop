// Baraj: kural 9'da eskisi gibi (ortadaki ikisi hep zıplar); kural 10'da zıplama olasılıklı (orta 0,92, kenar 0,60, en az 2) ve oyuncudan oyuncuya değişken.
// Görsel: dört farklı yüz/ten/saç, çarpışma geometrisi (parcalar) ve sonuç değişmez, çizim boş değil.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={DT:{}};vm.createContext(r);for(const n of ['ayar','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,P=D.AYAR.pozisyonlar.filter(p=>p.tip==='frikik');
// 1) Kural 9: sabit. Orta iki zıplar, kenarlar durur, hız ve başlangıç eski değerlerde.
for(const p of P){const k=D.baraj.kur(p);assert.deepEqual(k.map(o=>o.jump),[false,true,true,false]);assert.equal(k[1].v,2.6);assert.equal(k[2].v,2.35);assert(Math.abs(k[1].start-.315)<1e-9);}
// 2) Kural 10: istatistik.
const say=[0,0,0,0];let ort=0,farkli=new Set();for(let seed=1;seed<=2000;seed++){const k=D.baraj.kur(P[0],{seed});let n=0;k.forEach((o,i)=>{if(o.jump){say[i]++;n++;}});assert(n>=2,'en az iki zıplayan');ort+=n;farkli.add(k.map(o=>o.jump?1:0).join(''));}
assert(say[1]/2000>.9&&say[2]/2000>.9,'orta oyuncular ≥%90: '+say);assert(say[0]/2000>.55&&say[0]/2000<.75&&say[3]/2000>.55&&say[3]/2000<.75,'kenarlar ≈%60: '+say);assert(ort/2000>2.9&&ort/2000<3.3,'ortalama zıplayan '+ort/2000+' (kural 9: 2)');assert(farkli.size>=6,'farklı zıplama düzenleri '+farkli.size);
const aynı=JSON.stringify(D.baraj.kur(P[0],{seed:7}))===JSON.stringify(D.baraj.kur(P[0],{seed:7}));assert(aynı,'aynı tohum aynı baraj');
// 3) Fizik: kural 10 bayraksız çağrıda eski; çarpışma parçaları (boy/off) aynı.
const g={pos:P[0],aim:{x:1.2,y:1.2},contact:{x:0,y:-.5},zaman:.5,seed:5,guc:.8,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true};
const a=D.fizik.hesapla(g),b=D.fizik.hesapla(Object.assign({},g,{kural10:true}));assert.deepEqual(a.baraj.oyuncular.map(o=>o.jump),[false,true,true,false]);assert.equal(a.baraj.oyuncular.length,4);assert(a.baraj.oyuncular.every(o=>Object.keys(o).sort().join()==='boy,jump,off,start,v'),'baraj çıktısında görünüm alanı yok (eski kayıtlar birebir)');
assert.deepEqual(a.baraj.oyuncular.map(o=>[o.boy,o.off]),b.baraj.oyuncular.map(o=>[o.boy,o.off]),'boy ve konum aynı');
// 4) Görünüm: dört farklı ten+saç, dört farklı yüz dokusu, çizim dolu.
const G=D.baraj.GORUNUM;assert.equal(new Set(G.map(x=>x.ten)).size,4);assert(new Set(G.map(x=>x.stil)).size>=3);
const yap=(w,h)=>C.createCanvas(w,h),dk=G.map((x,i)=>D.baraj3d.yuzDoku(x,i,yap));assert.equal(new Set(dk).size,4);
const px=dk.map(c=>{const d=c.getContext('2d').getImageData(0,0,128,158).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]*3+d[i+2]*7;return s;});assert.equal(new Set(px).size,4,'yüzler birbirinden farklı');
const cv=C.createCanvas(300,300),ctx=cv.getContext('2d'),proj=(x,y,z)=>({x:150+x*70,y:280-y*70,d:z+10,olcek:70});
for(const havada of [0,.4]){ctx.clearRect(0,0,300,300);assert.equal(D.baraj3d.oyuncu(ctx,proj,{x:0,y:havada,z:10,boy:1.85},1,{t:1.2,makeCanvas:yap}),true);
 const d=ctx.getImageData(0,0,300,300).data;let dolu=0,mavi=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){dolu++;if(d[i+2]>d[i]+40)mavi++;}assert(dolu>3000&&mavi>1200,'oyuncu çizildi, rakip forması mavi '+dolu+'/'+mavi);}
assert.equal(D.baraj3d.oyuncu(ctx,proj,{x:0,y:0,z:10,boy:1.85},0,{t:0}),false,'makeCanvas yoksa eski çizime düşer');
console.log('PASS baraj: kural 9 eskisi gibi, kural 10 zıplama '+say.map(v=>(v/20).toFixed(0)+'%')+' ort '+(ort/2000).toFixed(2)+' oyuncu, 4 farklı yüz/ten/saç, çarpışma geometrisi aynı');
