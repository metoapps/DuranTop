// Ağ fiziği (js/ag.js) ve çizimi: sert şut ağı ~0,5 m göçürür, ağ sallanıp söner; yavaş top az sallar; yan ağ ve tavan da sarsılır;
// delikten geçen top delikli ağı sallamaz, halkaya çarpan sallar; sönünce ağ durgun hâle döner; sonuç hesabı etkilenmez.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}}};vm.createContext(root);
for(const n of ['ayar','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
root.matchMedia=()=>({matches:true});   // hareketi azalt: tribün ve bayraklar durgun, karşılaştırma yalnız ağı ölçer
const D=root.DT,A=D.AYAR,AG=D.ag,R=A.kale.topYaricap,w=A.kale.genislik/2+A.kale.direk/2,h=A.kale.yukseklik+A.kale.direk/2;
const pen=A.pozisyonlar[0],Z=pen.D+1.5;
function topla(y){let m=0;for(const v of y.u)m=Math.max(m,Math.abs(v));return m;}
function enerjiYuz(y){let e=0;for(let k=0;k<y.u.length;k++)e+=y.u[k]*y.u[k];return e;}
function oyna(yol,saniye=3){AG.sifirla(pen);now=1000;AG.guncelle(null,now);let tepe=0,isaret=0,onc=0;
 for(let t=0;t<=saniye;t+=1/60){now=1000+t*1000;const b=yol(t);AG.guncelle(b,now);const u=AG.z.u[Math.floor(AG.z.ny/2)*(AG.z.nx+1)+Math.floor(AG.z.nx/2)];tepe=Math.max(tepe,topla(AG.z));if(onc*u<-1e-6)isaret++;if(Math.abs(u)>1e-5)onc=u;}return{tepe,isaret,son:AG.enerji()};}
// 1) Sert şut: ortaya, 28 m/sn. Top arka ağa kadar uçar, ağa değince durur.
const sert=oyna(t=>({x:0,y:1.2,z:Math.min(Z-R,pen.D-5+28*t)}));
assert(sert.tepe>.35&&sert.tepe<.8,'sert şut ağı ≈0,5 m göçürür: '+sert.tepe.toFixed(2));assert(sert.isaret>=2,'ağ ileri geri sallanır (işaret değişimi '+sert.isaret+')');
// 2) Yavaş top az sallar; hız arttıkça göçme artar.
const yavas=oyna(t=>({x:0,y:1.2,z:Math.min(Z-R,pen.D-.4+4*t)})),orta=oyna(t=>({x:0,y:1.2,z:Math.min(Z-R,pen.D-2+14*t)}));
assert(yavas.tepe<.2&&yavas.tepe<orta.tepe&&orta.tepe<sert.tepe,'göçme hızla artar: '+[yavas.tepe,orta.tepe,sert.tepe].map(v=>v.toFixed(2)));
// 3) Sönüm: 6 sn sonra neredeyse durgun, hiçbir değer sonsuza kaçmaz.
const uzun=oyna(t=>({x:1,y:1.5,z:Math.min(Z-R,pen.D-5+28*t)}),7);assert(uzun.son<.02,'ağ söner: enerji '+uzun.son);assert(Number.isFinite(AG.enerji())&&topla(AG.z)<.05,'durgunlaştı '+topla(AG.z));
// 4) Komşu yüzeyler de sarsılır (bütün ağlar sallanır) ama arka ağdan zayıf.
oyna(t=>({x:0,y:1.2,z:Math.min(Z-R,pen.D-5+28*t)}),.8);assert(topla(AG.xl)>.01&&topla(AG.xr)>.01&&topla(AG.y)>.01,'yan ağlar ve tavan sarsıldı');assert(topla(AG.xl)<topla(AG.z)&&topla(AG.y)<topla(AG.z),'komşular daha zayıf');
// 5) Yan ağa ve tavana vuran top o yüzeyi sallar.
AG.sifirla(pen);now=1000;AG.guncelle(null,now);for(let k=0;k<12;k++){now+=16;AG.guncelle({x:Math.min(w-R,2.9+k*.25),y:1.2,z:pen.D+.8},now);}assert(topla(AG.xr)>.15,'sağ yan ağ sallandı '+topla(AG.xr));
AG.sifirla(pen);now=1000;AG.guncelle(null,now);for(let k=0;k<12;k++){now+=16;AG.guncelle({x:0,y:Math.min(h-R,1.0+k*.25),z:pen.D+.8},now);}assert(topla(AG.y)>.08,'tavan sallandı '+topla(AG.y));
// 6) Kilit: top ağda dururken darbe tekrarlanmaz.
AG.sifirla(pen);now=1000;AG.guncelle(null,now);now+=16;AG.guncelle({x:0,y:1.2,z:Z-R-.4},now);now+=16;AG.guncelle({x:0,y:1.2,z:Z-R},now);const v1=AG.enerji();for(let k=0;k<5;k++){now+=16;AG.guncelle({x:0,y:1.2,z:Z-R},now);}assert(AG.enerji()<v1*1.5,'darbe tekrarlanmadı');
// 7) Hedef ağı: delikten geçen top delikli ağı sallamaz, halkaya çarpan sallar.
const hp=D.hedef.pozisyonlar[1],hd=D.hedef.delikler[2];AG.sifirla(hp);function hedefAt(x,y){AG.sifirla(hp);now=1000;AG.guncelle(null,now);for(let k=0;k<12;k++){now+=16;AG.guncelle({x:x,y:y,z:hp.D-1.6+k*.35},now);}return topla(AG.hole);}
const gecen=hedefAt(hd.x,hd.y),carpan=hedefAt(hd.x+hd.r+.05,hd.y+.1);assert(gecen<.01,'delikten geçen top ağı sallamaz '+gecen);assert(carpan>.2,'halkaya çarpan top sallar '+carpan);
// 8) topOfset: ağın dışında 0; ağ göçükken top ağla birlikte gömülür; sınırlı.
AG.sifirla(pen);assert.equal(AG.topOfset({x:0,y:1.2,z:pen.D-3}),0);oyna(t=>({x:0,y:1.2,z:Math.min(Z-R,pen.D-5+28*t)}),.3);const of=AG.topOfset({x:0,y:1.2,z:Z-R});assert(of>.1&&of<=.7,'top ağa gömülür '+of);
// 9) Çizim: ağ yüzeyleri sallanırken piksel olarak değişir, sönünce durgun hâle birebir döner; sonuç etkilenmez.
const W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');D.cizim.kur(cv,W,H,1);D.cizim.sahneKur(pen,0);
const kare=(top)=>{now+=16;D.cizim.ciz({top});return Uint8ClampedArray.from(g.getImageData(0,0,W,H).data);};
const hesapA=JSON.stringify(D.fizik.hesapla({pos:pen,aim:{x:2,y:1.4},contact:{x:0,y:0},zaman:.5,seed:1,guc:1,kural10:true,antrenman:true}).yol.slice(-3));
const farkSay=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>40)n++;return n;};
const top0={x:pen.bx,y:.11,z:0};const durgun=kare(top0);
kare({x:2,y:1.4,z:Z-R-.5});kare({x:2,y:1.4,z:Z-R});let salla;for(let k=0;k<8;k++)salla=kare({x:2,y:1.4,z:Z-R});assert(farkSay(durgun,salla)>150,'sallanan ağ görüntüde değişti: '+farkSay(durgun,salla));
let son;for(let k=0;k<560;k++)son=kare(top0);   // ≈9 sn gerçek zamanlı kare akışıassert.equal(farkSay(durgun,son),0,'ağ sönünce durgun görüntüye birebir döner');
assert.equal(hesapA,JSON.stringify(D.fizik.hesapla({pos:pen,aim:{x:2,y:1.4},contact:{x:0,y:0},zaman:.5,seed:1,guc:1,kural10:true,antrenman:true}).yol.slice(-3)),'ağ animasyonu sonuç hesabına karışmaz');
console.log('PASS ağ: sert şut göçüğü '+sert.tepe.toFixed(2)+' m (yavaş '+yavas.tepe.toFixed(2)+'), salınım, sönüm, yan ağ+tavan sarsılır, delikten geçen sallamaz, çizimde değişir ve durgunlaşır');
