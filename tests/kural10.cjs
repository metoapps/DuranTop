// Kural 10 (antrenman/hedef): temas yüksekliği atış açısı, gerçek sert vuruş hızı, yeşilden uzak sert vuruşta savrulma, frikikte daha erken kaleci.
// Bayrak yokken (kupa, sunucu, rules 9) sonuçlar 0f9bfc1 ile birebir aynı kalmalı.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function yukle(kaynak){const r={DT:{}};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik'])vm.runInContext(kaynak(n),r);return r.DT;}
const D=yukle(n=>fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'));const P=D.AYAR.pozisyonlar;
const G=girdi=>Object.assign({contact:{x:0,y:0},zaman:.5,seed:3,guc:.8,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true},girdi);
// 1) Bayraksız: eski sürümle aynı (git varsa 0f9bfc1'den yüklenir).
let eski=null;try{eski=yukle(n=>cp.execFileSync('git',['show','0f9bfc1:js/'+n+'.js'],{cwd:__dirname+'/..',encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch(e){}
if(eski){let n=0;for(let pi=0;pi<10;pi++)for(const aim of [[2.8,1.9],[-3,.4],[0,2.2],[1.2,1.1]])for(const c of [[0,0],[-.6,-.5],[.5,.6]])for(const z of [.5,.2,.9])for(const guc of [.5,1]){
 const g=G({pos:P[pi],aim:{x:aim[0],y:aim[1]},contact:{x:c[0],y:c[1]},zaman:z,guc,seed:pi*7+n});const a=D.fizik.hesapla(g),b=eski.fizik.hesapla(g);
 assert.equal(a.sonuc,b.sonuc);assert.equal(JSON.stringify(a.yol.slice(-1)),JSON.stringify(b.yol.slice(-1)));n++;}
 console.log('PASS bayraksız (kupa/sunucu) '+n+' vuruş 0f9bfc1 ile birebir');}else console.log('UYARI git yok: eski sürüm karşılaştırması atlandı');
const K=girdi=>D.fizik.hesapla(G(Object.assign({kural10:true},girdi)));const maxY=r=>Math.max(...r.ucusYol.map(p=>p.y));
// 2) Temas yüksekliği: alt > orta > üst; üst temas yerden gider.
for(const pi of [0,5,9]){const al=K({pos:P[pi],aim:{x:1.5,y:1.4},contact:{x:0,y:-.8}}),or=K({pos:P[pi],aim:{x:1.5,y:1.4},contact:{x:0,y:0}}),us=K({pos:P[pi],aim:{x:1.5,y:1.4},contact:{x:0,y:.8}});
 assert(maxY(al)>maxY(or)+.3&&maxY(or)>maxY(us)+.3,P[pi].ad+' alt>orta>üst '+[maxY(al),maxY(or),maxY(us)].map(v=>v.toFixed(2)));assert(maxY(us)<.7,P[pi].ad+' üst temas yerden: '+maxY(us).toFixed(2));
 const or9=D.fizik.hesapla(G({pos:P[pi],aim:{x:1.5,y:1.4}}));if(pi===9)assert(maxY(or)<maxY(or9),'orta temas eskisi kadar havalanmaz');}
// 3) Hız: %100 penaltı ≥125, frikik ≥120 km/sa; güçle artar.
const hp=K({pos:P[0],aim:{x:2,y:1},guc:1}).speed*3.6,hf=K({pos:P[9],aim:{x:2,y:1.6},guc:1}).speed*3.6;assert(hp>=125&&hf>=120,'hız '+hp.toFixed(0)+' / '+hf.toFixed(0));
let once=0;for(const guc of [.3,.5,.7,.9,1]){const v=K({pos:P[0],aim:{x:2,y:1},guc}).speed;assert(v>once);once=v;}
// 4) Savrulma: %100 güçte yeşilden çok uzak → kale dışına çok farkla; %40 güçte aynı hata çok daha az sapar.
for(const z of [.98,.02]){const sert=K({pos:P[9],aim:{x:0,y:1.5},guc:1,zaman:z}),yumu=K({pos:P[9],aim:{x:0,y:1.5},guc:.4,zaman:z});
 const sapS=Math.hypot(sert.gecis.x,Math.max(0,sert.gecis.y-1.5)),sapY=Math.hypot(yumu.gecis.x,Math.max(0,yumu.gecis.y-1.5));
 assert(sert.sonuc==='aut'||sert.sonuc==='kisa'||sert.sonuc==='baraj',z+': '+sert.sonuc);assert(Math.abs(sert.gecis.x)>5||sert.gecis.y>4||sert.sonuc==='baraj','dağa taşa: '+JSON.stringify(sert.gecis));assert(sapS>2*sapY,'sert vuruş daha çok savrulur');}
// Yeşil bant %100 güçte daha dar; ibre aynı hatada daha çok sapar.
const zb=(g,k)=>D.zamanBandi({x:0,y:1.5},g,k);assert.equal(zb(.3,true),zb(.3,false),'düşük güçte bant aynı');assert(Math.abs(D.zamanBandi({x:0,y:1.5},1,true)/D.zamanBandi({x:0,y:1.5},1,false)-.55/.70)<1e-9,'bant oranı');
const yesil=K({pos:P[9],aim:{x:0,y:1.5},guc:1,zaman:.5});assert(Math.abs(yesil.gecis.x)<.5,'yeşilde sapma yok');
// 5) Kaleci: frikikte ilk okuma 0,25 sn erken (0,54 → 0,29); penaltı aynı.
const f9=D.fizik.hesapla(G({pos:P[9],aim:{x:2,y:1.5}})),f10=K({pos:P[9],aim:{x:2,y:1.5}});assert(Math.abs((f9.kaleci.okumaT-f10.kaleci.okumaT)-.25)<1e-9,'frikik okuma '+f9.kaleci.okumaT+'→'+f10.kaleci.okumaT);
console.log('PASS kural 10: temas alt>orta>üst (üst yerden), %100 hız '+hp.toFixed(0)+'/'+hf.toFixed(0)+' km/sa, uzak zamanlamada savrulma, frikik kalecisi 0,25 sn erken');
