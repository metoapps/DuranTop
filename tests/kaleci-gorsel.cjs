// Görsel kaleci (js/kaleci3d.js): sonucu belirleyen fizik gövdesine dokunmaz.
// Vuruştan 0,12 sn sonra eldiven/baş/göğüs/omuz fizikle birebir; dalışta yalnız bacaklar bükülür (<0,25 m).
// Penaltı öncesi hareketler kalecinin seçtiği yönü bilmez; kemik boyları sabit; ayak zemine girmez; hareket kesintisiz.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={DT:{}};vm.createContext(r);for(const n of ['ayar','veri','model3d','kaleci3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,K=D.kaleci3d,M=D.model3d,P=D.AYAR.pozisyonlar;const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function boylar(n){for(const [a,b,c] of [['sl','el','hl'],['sr','er','hr']]){assert(Math.abs(dist(n[a],n[b])-.34)<1e-6&&Math.abs(dist(n[b],n[c])-.34)<1e-6,'kol boyu');}
 for(const [k,f] of [['kl','fl'],['kr','fr']]){assert(Math.abs(dist(n.hip,n[k])-.375)<1e-6&&Math.abs(dist(n[k],n[f])-.34)<1e-6,'bacak boyu');}}
// 1) Penaltı öncesi rutinler: 6 dakikalık zaman çizgisi.
for(const tip of ['penalti','frikik']){let prev=null,maxAdim=0;
 for(let i=0;i<60*360;i++){const t=i/60,k={x:.05*Math.sin(t),y:1,poz:'bekle',gesture:t},n=K.iskelet(k,11,{tip,barajYan:-1}).nodes;boylar(n);
  for(const key of ['fl','fr'])assert(n[key][1]>=.15-1e-9,'ayak zemine girmez');assert(n.hl[1]<2.44-.12&&n.hr[1]<2.44-.12,'eldiven üst direğin altında');
  if(prev)for(const key in n)maxAdim=Math.max(maxAdim,dist(n[key],prev[key]));prev=n;}
 assert(maxAdim<.12,tip+': kare başı en büyük sıçrama '+maxAdim);}
// 2) Rutin sırası: her 6 bölümde 6 farklı rutin, art arda tekrar yok.
const adlar=[];for(let n=0;n<240;n++){const t=n*K.SURE+K.SURE*.5;adlar.push(JSON.stringify(K.onHareket(t,'penalti')));}
// aynı rutin aynı fazda aynı kalıbı verir; ardışık iki bölümün kalıbı farklı olmalı
for(let n=1;n<240;n++)assert.notEqual(adlar[n],adlar[n-1],'art arda aynı rutin '+n);
// 3) Gerçek planlar: fizik eşitliği ve yön bağımsızlığı.
let dalis=0,maxBacak=0,yonCift={};
for(const [pi,aims] of [[0,[[2.6,1.4],[-2.6,.5],[0,2],[3.3,2.3],[-1.2,.3]]],[5,[[2.8,2],[-3,1.5]]],[9,[[3,2.2],[0,1]]]])for(const a of aims)for(let seed=1;seed<=40;seed++){
 const res=D.fizik.hesapla({pos:P[pi],aim:{x:a[0],y:a[1]},contact:{x:0,y:0},falso:0,zaman:.5,seed,guc:.8,durus:0,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:false});
 const plan=res.kaleci;
 for(let t=.12;t<2.5;t+=.02){const k=Object.assign({},plan.cizimKonum(t,res.olayT),{vurusT:t}),fiz=M.rig(Object.assign({},k,{eskiKol:false}),P[pi].D).nodes,n=K.iskelet(k,P[pi].D,{tip:P[pi].tip}).nodes;
  for(const key of ['hl','hr','el','er','sl','sr','head','neck','chest','hip'])assert(dist(n[key],fiz[key])<1e-9,key+' fizikle aynı olmalı t='+t);
  if(k.poz==='dal'){dalis++;for(const key of ['kl','kr','fl','fr'])maxBacak=Math.max(maxBacak,dist(n[key],fiz[key]));}
  else for(const key of ['kl','kr','fl','fr'])assert(dist(n[key],fiz[key])<1e-9);}
 // vuruş öncesi (koşu): fizik hareketi başlamadan önce görüntü, sol/sağ kararından bağımsız
 if(pi===0&&plan.onKarar){const s0=Math.min(plan.baslamaT,0);const imza=[];for(let t=-1.15;t<s0-.02;t+=.05){const k=Object.assign({},plan.cizimKonum(t),{vurusT:t,gesture:3+t,gestureW:Math.max(0,1-(t+1.15)/.55)});imza.push(JSON.stringify(K.iskelet(k,11,{tip:'penalti'}).nodes));}
  const key=String(plan.kararYon);yonCift[key]=yonCift[key]||imza.join('|').slice(0,4000);
  if(yonCift['-1']&&yonCift['1'])assert.equal(yonCift['-1'].slice(0,2000),yonCift['1'].slice(0,2000),'koşu başında kaleci görüntüsü seçilen yönü ele vermez');}
}
assert(dalis>500,'dalış kareleri sınandı');assert(maxBacak<.25,'dalışta bacak sapması '+maxBacak);assert(yonCift['-1']&&yonCift['1'],'iki yön de sınandı');
// 4) Koşu sonunda sönüm: gestureW 0 iken rutin etkisi yok.
const a=K.iskelet({x:0,y:1,poz:'bekle',gesture:7.3,gestureW:0,vurusT:-.5},11,{tip:'penalti'}).nodes,b=K.iskelet({x:0,y:1,poz:'bekle',gesture:1.1,gestureW:0,vurusT:-.5},11,{tip:'penalti'}).nodes;
for(const key in a)assert(dist(a[key],b[key])<1e-9,'sönmüş hareket her zaman aynı hazır duruş');
// 5) Çizim: hata yok, gölge ve gövde çizilir.
const cv=C.createCanvas(200,200),g=cv.getContext('2d'),proj=(x,y,z)=>({x:100+x*40,y:180-y*40,d:z+20,olcek:40});
K.ciz(g,proj,{x:0,y:1,poz:'bekle',gesture:2},11,{tip:'penalti'});const px=g.getImageData(0,0,200,200).data;let dolu=0;for(let i=3;i<px.length;i+=4)if(px[i])dolu++;assert(dolu>1500);
console.log('PASS görsel kaleci: 2×6 dk rutin (kemik boyu, zemin, direk altı, süreklilik), 240 bölüm sıra, '+dalis+' dalış karesi fizikle aynı eldiven/gövde (bacak sapması '+maxBacak.toFixed(3)+' m), koşuda yön bağımsızlığı, sönüm, çizim');
