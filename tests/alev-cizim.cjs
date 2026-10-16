// Çizim: alevli şutta topun arkasında turuncu ateş izi ve parlama; alevli değilken yok; kademe 2'de yalnız parlama (parçacık yok); ağır çekim vinyeti köşeleri karartır, yoğunlukla orantılı.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},location:{search:''}};vm.createContext(root);
for(const n of ['ayar','perf','ruzgar','bonus','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','tezahurat','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;
D.model3d.setFace(new C.Image());const W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');D.cizim.kur(cv,W,H,1);const pos=D.AYAR.pozisyonlar[0];D.cizim.sahneKur(pos,0);
const yol=u=>({x:pos.bx+(1.9-pos.bx)*u,y:.11+1.6*Math.sin(Math.PI*u*.9),z:(pos.D||11)*u});
function ucus(ek,kademe){if(D.perf&&D.perf.sabitle)D.perf.sabitle(kademe||0);now=5000;let son=null;for(let i=0;i<30;i++){now+=16;D.cizim.ciz(Object.assign({top:yol(i/45),zaman:.02+i*.016},ek));}return g.getImageData(0,0,W,H).data;}
const turuncu=(d)=>{let n=0;for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2];if(r>215&&gg>70&&gg<190&&b<80)n++;}return n;};
const bolge=(d,x0,y0,w,h)=>{let t=0,n=0;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=(y*W+x)*4;t+=d[i]+d[i+1]+d[i+2];n++;}return t/n;};const koseKarart=(d)=>(bolge(d,0,H-60,60,60)+bolge(d,W-60,H-60,60,60))/2/Math.max(1,bolge(d,W/2-40,H*.45-40,80,80));   // alt köşeler / merkez parlaklık oranı
const bos=ucus({}),alev=ucus({alev:true});const tb=turuncu(bos),ta=turuncu(alev);assert(ta>tb+250,'alevli şutta turuncu ateş pikselleri: '+tb+' → '+ta);
const alev2=ucus({alev:true},2);const t2=turuncu(alev2);assert(t2<ta*.6,'kademe 2: parçacık yok, yalnız parlama (turuncu '+ta+' → '+t2+')');
D.perf.sabitle(0);const y0=ucus({yavas:0}),y5=ucus({yavas:.5}),y1=ucus({yavas:1});const k0=koseKarart(y0),k5=koseKarart(y5),k1=koseKarart(y1);
assert(k1<k0*.7&&k5<k0&&k5>k1,'ağır çekim vinyeti köşeleri merkeze göre yoğunlukla orantılı karartır (köşe/merkez): '+[k0,k5,k1].map(v=>v.toFixed(2)).join(' > '));
console.log('PASS çizim: alevli şutta ateş izi (turuncu '+tb+'→'+ta+'), kademe 2 hafif, ağır çekim vinyeti (köşe/merkez parlaklık '+k0.toFixed(2)+'→'+k1.toFixed(2)+')');
