// Baraj: kural 9 eskisi gibi (4 oyuncu, ortadaki ikisi hep zıplar, merkez topla kale merkezi hattında).
// Kural 10 (antrenman/hedef): gerçekçi kurulum: mesafeye göre 5/4/3 oyuncu, omuz omuza, yakın direğe giden hattı örter, boylar ve küçük hizalama hataları pozisyondan türer
// (önizleme ve vuruşta aynı baraj); zıplama seed'den (orta %92, kenar %60, en az 2). Görünüm: 6 farklı yüz, önbellekli sprite, çarpışma geometrisi eski kurallarda aynı.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={DT:{}};vm.createContext(r);for(const n of ['ayar','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,P=D.AYAR.pozisyonlar.filter(p=>p.tip==='frikik');
const G=(pos,seed,k10)=>D.fizik.hesapla({pos,aim:{x:1.2,y:1.2},contact:{x:0,y:-.5},zaman:.5,seed,guc:.8,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,kural10:k10});
// 1) Kural 9: sabit.
for(const p of P){const k=D.baraj.kur(p);assert.deepEqual(k.map(o=>o.jump),[false,true,true,false]);assert.equal(k[1].v,2.6);assert.equal(k[2].v,2.35);assert(Math.abs(k[1].start-.315)<1e-9);[-.825,-.275,.275,.825].forEach((v,i)=>assert(Math.abs(k[i].off-v)<1e-9,'kural 9 aralığı eski'));
 const a=G(p,5,false),b=a.baraj;assert.equal(b.oyuncular.length,4);assert(Math.abs(b.merkezX-(p.bx+b.ux*b.mesafe))<1e-9&&Math.abs(b.merkezZ-b.uz*b.mesafe)<1e-9,'kural 9: baraj merkezi topla kale merkezi arasındaki hatta');
 assert(a.baraj.oyuncular.every(o=>Object.keys(o).sort().join()==='boy,jump,off,start,v'),'baraj çıktısında görünüm alanı yok (eski kayıtlar birebir)');}
// 2) Kural 10 kurulum: sayı, aralık, boy, determinizm
const beklenen=p=>{const m=Math.hypot(p.bx,p.D);return m<19?5:m<26?4:3;};
for(const p of P){const a=G(p,1,true).baraj,b=G(p,99,true).baraj,n=beklenen(p);assert.equal(a.oyuncular.length,n,p.ad+': oyuncu sayısı '+n);assert.equal(D.baraj.sayi(p),n);
 for(let i=1;i<n;i++){const ara=a.oyuncular[i].off-a.oyuncular[i-1].off;assert(ara>.44&&ara<.60,p.ad+': omuz omuza aralık '+ara.toFixed(3));}
 assert(a.oyuncular.every(o=>o.boy>=1.7&&o.boy<=1.97),'boylar gerçekçi');
 assert.deepEqual(a.oyuncular.map(o=>[o.boy,o.off]),b.oyuncular.map(o=>[o.boy,o.off]),p.ad+': boy ve konum seed\'den bağımsız (önizleme = vuruş)');
 assert.equal(a.merkezX,b.merkezX);}
let eskiKacirdi=0;
// 3) Yakın direk örtüsü: top→yakın direk hattı baraj mesafesinde bir oyuncunun yanından geçmeli; ortadaki top simetrik
for(const p of P){const b=G(p,3,true).baraj;const bx=p.bx;
 if(Math.abs(bx)<.3){const ort=b.oyuncular.reduce((s,o)=>s+o.off,0)/b.oyuncular.length;assert(Math.abs(ort)<.06,p.ad+': ortadaki topta baraj simetrik '+ort.toFixed(3));continue;}
 const sg=bx>0?1:-1,nx=sg*3.66-bx,nz=p.D,nl=Math.hypot(nx,nz),dx=nx/nl,dz=nz/nl,s=b.mesafe/(dx*b.ux+dz*b.uz),Px=bx+dx*s,Pz=dz*s;
 const lat=o=>{const x=b.merkezX+b.px*o.off,z=b.merkezZ+b.pz*o.off;return (x-Px)*b.px+(z-Pz)*b.pz;};
 const en=Math.min(...b.oyuncular.map(o=>Math.abs(lat(o))));assert(en<.2,p.ad+': yakın direk hattı barajın dış ucundan geçer, uzaklık '+en.toFixed(2));
 // hat barajın uçlarının arasında ya da dış ucundan en çok 0,25 m içeride: baraj hattı kaçırmaz
 const ls=b.oyuncular.map(lat);assert(Math.min(...ls)-.25<=0&&Math.max(...ls)+.25>=0,p.ad+': hat baraj kapsamında');
 // eski kurulum (kural 9) bu hattı kaçırıyordu: karşılaştırma
 const e=G(p,3,false).baraj,late=o=>{const x=e.merkezX+e.px*o.off,z=e.merkezZ+e.pz*o.off;return (x-Px)*e.px+(z-Pz)*e.pz;};eskiKacirdi=Math.max(eskiKacirdi,Math.min(...e.oyuncular.map(o=>Math.abs(late(o)))));}
assert(eskiKacirdi>.5,'kural 9 barajı en az bir pozisyonda yakın direk hattını kaçırıyordu ('+eskiKacirdi.toFixed(2)+' m)');
// 4) Zıplama istatistiği (kural 10): orta ≈%92, kenar ≈%60, en az 2, ortalama > kural 9'un 2'si
for(const p of P){const n=beklenen(p),say=new Array(n).fill(0);let ort=0,farkli=new Set();for(let seed=1;seed<=2000;seed++){const k=D.baraj.kur(p,{seed,kural10:true});let m=0;k.forEach((o,i)=>{if(o.jump){say[i]++;m++;}});assert(m>=2,'en az iki zıplayan');ort+=m;farkli.add(k.map(o=>o.jump?1:0).join(''));}
 const orta=(n-1)/2;say.forEach((c,i)=>{const f=c/2000,mrk=Math.abs(i-orta)<=1;if(mrk)assert(f>.93,p.ad+': orta oyuncu '+i+' '+f);else assert(f>.80&&f<.98,p.ad+': kenar oyuncu '+i+' '+f);});assert(ort/2000>2.0,'ortalama zıplayan '+ort/2000);assert(farkli.size>=3);
 assert.equal(JSON.stringify(D.baraj.kur(p,{seed:7,kural10:true})),JSON.stringify(D.baraj.kur(p,{seed:7,kural10:true})),'aynı tohum aynı baraj');}
// 5) Görünüm: 6 farklı ten/saç, yüz dokuları farklı; sprite önbelleği
const G6=D.baraj.GORUNUM;assert.equal(G6.length,6);assert.equal(new Set(G6.map(x=>x.ten)).size,6);assert(new Set(G6.map(x=>x.stil)).size>=3);
const yap=(w,h)=>C.createCanvas(w,h),dk=G6.map((x,i)=>D.baraj3d.yuzDoku(x,i,yap));assert.equal(new Set(dk).size,6);
const px=dk.map(c=>{const d=c.getContext('2d').getImageData(0,0,128,158).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]*3+d[i+2]*7;return s;});assert.equal(new Set(px).size,6,'yüzler birbirinden farklı');
const cv=C.createCanvas(300,300),ctx=cv.getContext('2d'),proj=(x,y,z)=>({x:150+x*70,y:280-y*70,d:z+10,olcek:70});
let cagri=0;const yap2=(w,h)=>{cagri++;return C.createCanvas(w,h);};
for(const havada of [0,.4]){ctx.clearRect(0,0,300,300);assert.equal(D.baraj3d.oyuncu(ctx,proj,{x:0,y:havada,z:10,boy:1.85},1,{t:1.2,makeCanvas:yap2,dpr:1,surum:1,kare:1,isit:false}),true);
 const d=ctx.getImageData(0,0,300,300).data;let dolu=0,mavi=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){dolu++;if(d[i+2]>d[i]+40)mavi++;}assert(dolu>3000&&mavi>1200,'oyuncu çizildi, rakip forması mavi '+dolu+'/'+mavi);}
const c0=cagri;for(let k=0;k<30;k++){ctx.clearRect(0,0,300,300);D.baraj3d.oyuncu(ctx,proj,{x:0,y:k%3?0:.3,z:10,boy:1.85},1,{t:1+k*.016,makeCanvas:yap2,dpr:1,surum:1});}assert.equal(cagri,c0,'aynı oyuncu yerde ve havada tekrar çizilmez: önbellekten tek drawImage');
const c1=cagri;D.baraj3d.oyuncu(ctx,proj,{x:0,y:0,z:10,boy:1.85},1,{t:2,makeCanvas:yap2,dpr:1,surum:2});assert(cagri>c1,'kamera/sahne sürümü değişince önbellek boşalır');
// zıplama: sprite dikey kayar (kafa yukarı), gölge yerde
{const iz=(y)=>{ctx.clearRect(0,0,300,300);D.baraj3d.oyuncu(ctx,proj,{x:0,y,z:10,boy:1.85},1,{t:0,makeCanvas:yap2,dpr:1,surum:2});const d=ctx.getImageData(0,0,300,300).data;let en=1e9,mavi=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200&&d[i+2]>d[i]+40){en=Math.min(en,(i/4/300)|0);mavi++;}return en;};
 const yer=iz(0),havada=iz(.4);assert(yer-havada>=24&&yer-havada<=32,'0,4 m zıplayınca sprite ≈28 px yükselir: '+(yer-havada));}
// isit: pozisyon açılırken üretilir; sonra çizimde yeni tuval gerekmez
const c2=cagri;assert.equal(D.baraj3d.isit(proj,{x:1,y:0,z:10,boy:1.9},2,{makeCanvas:yap2,dpr:1,surum:3}),true);const uretilen=cagri-c2;assert(uretilen>=1,'ısınma sprite üretir');
const c3=cagri;D.baraj3d.oyuncu(ctx,proj,{x:1,y:0,z:10,boy:1.9},2,{t:3,makeCanvas:yap2,dpr:1,surum:3});assert.equal(cagri,c3,'ısınmış oyuncu çizilirken yeni tuval üretilmez');
assert.equal(D.baraj3d.oyuncu(ctx,proj,{x:0,y:0,z:10,boy:1.85},0,{t:0}),false,'makeCanvas yoksa eski çizime düşer');
// AKILLI BARAJ (kural 10): okuma, eşzamanlı ve erken kalkış, kollar yukarıda, belirgin sıçrama
{const B=D.baraj,pos=D.AYAR.pozisyonlar[5],A2=D.AYAR;
 const dene=(aimY,zorluk,N)=>{let say=0,top=0,orta=0,ortaN=0;for(let seed=1;seed<=N;seed++){const w=B.kur(pos,{seed,kural10:true,zorluk,aimY});w.forEach((q,i)=>{top++;if(q.jump)say++;if(Math.abs(i-(w.length-1)/2)<=1){ortaN++;if(q.jump)orta++;}});}return{oran:say/top,orta:orta/ortaN};};
 const yuk=dene(1.8,0,1500),alc=dene(.5,0,1500),alcZor=dene(.5,1,1500),yukZor=dene(1.8,1,1500);
 assert(yuk.oran>.9,'yüksek hedefte baraj hep zıplar '+yuk.oran.toFixed(2));assert(alc.oran<yuk.oran-.15,'alçak hedefte baraj daha az zıplar (okuma): '+alc.oran.toFixed(2)+' < '+yuk.oran.toFixed(2));assert(alcZor.oran<alc.oran-.05,'zorluk arttıkça baraj daha çok okur: '+alcZor.oran.toFixed(2)+' < '+alc.oran.toFixed(2));assert(yukZor.oran>=yuk.oran-.02,'yüksek hedefte zorlukla da hep zıplar');
 assert(Math.abs(dene(undefined,0,300).oran-yuk.oran)<.05,'hedef yüksekliği bilinmiyorsa temkinli: yüksek varsayar');
 // zamanlama: zıplayanlar atıştan hemen önce/çok yakın kalkar, birbirlerine en çok ±0,05 sn farkla; zirve ≈0,45–0,6 m
 let enErken=9,enGec=-9,zirveMin=9,zirveMax=0;for(let seed=1;seed<=800;seed++){const w=B.kur(pos,{seed,kural10:true,zorluk:0,aimY:1.8});const j=w.filter(q=>q.jump);const st=j.map(q=>q.start);enErken=Math.min(enErken,...st);enGec=Math.max(enGec,...st);assert(Math.max(...st)-Math.min(...st)<=.085,'zıplayanlar neredeyse eşzamanlı: '+(Math.max(...st)-Math.min(...st)).toFixed(3));for(const q of j){assert(q.kollarAsagi===true&&q.kolYukari===undefined,'zıplayan oyuncuda kollar AŞAĞIDA (ele çarpan top penaltı olur)');const zir=q.v*q.v/(2*A2.yercekimi);zirveMin=Math.min(zirveMin,zir);zirveMax=Math.max(zirveMax,zir);}}
 assert(enErken>=.02&&enGec<=.14,'kalkış penceresi '+enErken.toFixed(3)+'…'+enGec.toFixed(3));assert(zirveMin>=.41&&zirveMax<=.55,'sıçrama zirvesi '+zirveMin.toFixed(2)+'…'+zirveMax.toFixed(2)+' m (eskiden 0,26–0,40)');
 // durum: çömelme → havada (kollar yukarı) → iner; kural 9 oyuncuları eskisi gibi (poz alanı yok)
 const w=B.kur(pos,{seed:3,kural10:true,zorluk:0,aimY:1.8}),q=w.find(x=>x.jump);const d0=B.durum(q,q.start-.2),d1=B.durum(q,q.start-.05),d2=B.durum(q,q.start+.2),d3=B.durum(q,q.start+1.2);assert.equal(d0.poz,'dur');assert.equal(d1.poz,'cokus','kalkıştan hemen önce çömelir');assert.equal(d2.poz,'havada');assert(d2.y>.3,'havada yükselmiş '+d2.y.toFixed(2));assert.equal(d3.poz,'dur');assert.equal(d3.y,0);
 const eski=B.kur({bx:5,D:17.3,tip:'frikik'},null);assert(eski.every(x=>x.kolYukari===undefined&&x.kollarAsagi===undefined),'kural 9 oyuncularında yeni alan yok');
 // havadaki oyuncunun elleri başın üstünde: çarpışma geometrisi yüksek (blok yüksekliği)
 const kalem=(t)=>B.parcalar(q,t),yuk0=Math.max(...kalem(q.start-.3).map(s=>Math.max(s.a[1],s.b[1])+s.r)),yuk1=Math.max(...kalem(q.start+.2).map(s=>Math.max(s.a[1],s.b[1])+s.r));assert(Math.abs((yuk1-yuk0)-d2.y)<=.03,'zıplarken kollar yukarı kalkmaz: blok yüksekliği yalnız sıçrama kadar artar '+(yuk1-yuk0).toFixed(3)+' ≈ '+d2.y.toFixed(3));}
console.log('PASS baraj: kural 9 eskisi gibi; kural 10 mesafeye göre 5/4/3 oyuncu, omuz omuza, yakın direk hattını örter (kural 9 kaçırıyordu), zıplama istatistiği, 6 farklı yüz, sprite önbelleği');
