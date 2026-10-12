// Kademeli kalite (perf.kalite() 0/1/2): süsler (kalabalık, bayrak, pankart, ağ yenilemesi) sadeleşir; oyun nesneleri (oyuncu, kaleci, baraj, top) aynı kalır.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},location:{search:''}};vm.createContext(root);
for(const n of ['ayar','perf','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
const D=root.DT,W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');D.cizim.kur(cv,W,H,1);for(const k of D.KARAKTER)for(const p of D.POZ)D.cizim.gorselEkle(k.id+'_'+p,new C.Image());
const pos=D.AYAR.pozisyonlar[5];D.cizim.sahneKur(pos,0);
const res=D.fizik.hesapla({pos,aim:{x:2,y:1.4},contact:{x:0,y:0},zaman:.5,seed:3,guc:.8,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:true,kural10:true});
D.cizim.barajIsit(res.baraj);
let sayac=0;const orijinal=g.drawImage.bind(g);g.drawImage=function(){sayac++;return orijinal.apply(null,arguments);};
// Tribün (kalabalık, bayrak, atmosfer) ayrı bir katman tuvaline çizilir (cizim.js tribunKatmaniCiz): oradaki çizimleri de say.
D.cizim.ciz({top:{x:pos.bx,y:.11,z:0}});{const kg=D.cizim._tribunKatman().getContext('2d'),ko=kg.drawImage.bind(kg);kg.drawImage=function(){sayac++;return ko.apply(null,arguments);};}
function kare(t,kademe){D.perf.sabitle(kademe);now=1000+t*1000;sayac=0;D.cizim.ciz({top:{x:pos.bx,y:.11,z:0},oyuncu:{karakter:'meto',durus:0,poz:'vurus1'},kaleci:res.kaleci.cizimKonum(.2),baraj:res.baraj,zaman:0});const n=sayac;return{n,px:Uint8ClampedArray.from(g.getImageData(0,35,W,130).data)};}
const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
const k0=kare(5.0,0),k1=kare(5.0,1),k2=kare(5.0,2);
assert(k1.n<k0.n,'kademe 1 daha az çizim: '+k0.n+' → '+k1.n);assert(k2.n<k1.n,'kademe 2 daha da az: '+k1.n+' → '+k2.n);assert(k2.n<k0.n*.55,'kademe 2 çizim sayısı yarıdan az: '+k0.n+' → '+k2.n);
// kademe 2'de kalabalık durgun, kademe 0'da hareketli (zaman farkı)
const a0=kare(5.0,0),b0=kare(5.4,0),a2=kare(5.0,2),b2=kare(5.4,2);
assert(fark(a0.px,b0.px)>1500,'kademe 0: tribün hareketli '+fark(a0.px,b0.px));assert(fark(a2.px,b2.px)<fark(a0.px,b0.px)*.45,'kademe 2: tribün büyük ölçüde durgun '+fark(a2.px,b2.px));
// oyun alanı (kaleci, baraj, oyuncu) kademeden bağımsız: tribün bandının altındaki bölge birebir aynı
function alt(kademe){D.perf.sabitle(kademe);now=1000+5000;D.cizim.ciz({top:{x:pos.bx,y:.11,z:0},oyuncu:{karakter:'meto',durus:0,poz:'vurus1'},kaleci:res.kaleci.cizimKonum(.2),baraj:res.baraj,zaman:0});return Uint8ClampedArray.from(g.getImageData(0,300,W,500).data);}
assert.equal(fark(alt(0),alt(2)),0,'oyun alanı her kademede aynı (yalnız süsler sadeleşir)');
// kademe, olay sırasında (alay) kalabalığın tepkisini kapatmaz: alay karesi kademe 2'de de çizilir
D.perf.sabitle(2);now=1000+6000;D.cizim.ciz({top:{x:pos.bx,y:.11,z:0},alay:.8,alayTur:'aut'});const alay=Uint8ClampedArray.from(g.getImageData(0,35,W,130).data);D.cizim.ciz({top:{x:pos.bx,y:.11,z:0}});const normal=Uint8ClampedArray.from(g.getImageData(0,35,W,130).data);assert(fark(alay,normal)>1500,'alay kademe 2\'de de görünür');
D.perf.sabitle('auto');
console.log('PASS kademeli kalite: çizim sayısı '+k0.n+' → '+k1.n+' → '+k2.n+' (kademe 0/1/2), kademe 2 tribün durgun, oyun alanı aynı, alay yine görünür');
