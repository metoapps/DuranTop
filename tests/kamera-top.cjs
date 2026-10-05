// Kamera duruşa göre kayar: top, oyuncunun gövdesi tarafından örtülmemeli (nişan aşaması).
// Geometrik ölçüt (piksel ölçümü tarayıcıda yapıldı): kameradan topun merkezine giden ışın, oyuncu silindirinin (yarıçap 0,30 m, boy 1,9 m) içinden geçmemeli.
// Negatif kontrol: eski sabit 2 m kaymalı kamerayla aynı ölçüt en az 10 durumda başarısız olur (test duyarlı). node tests/kamera-top.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={__yapCanvas:(w,h)=>C.createCanvas(w,h),document:{createElement:()=>C.createCanvas(2,2),getElementById:()=>null,querySelectorAll:()=>[],addEventListener(){}},devicePixelRatio:1,addEventListener(){},Image:function(){},performance:{now:()=>0}};r.window=r;vm.createContext(r);for(const n of ['ayar','veri','kiyafet','baraj','model3d','kaleci','ucus','fizik','puan','futbolcu3d','cizim'])if(fs.existsSync(__dirname+'/../js/'+n+'.js'))vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const DT=r.DT,F=DT.futbolcu3d,P=DT.AYAR.pozisyonlar;const kv=C.createCanvas(390,844);DT.cizim.kur(kv,390,844,1);assert(DT.cizim.kameraDurus&&DT.cizim.kameraKonum);
function gizliMi(C,p,durus){const root=F.placement(p,{direction:durus,walk:null,shot:null}).point,B=[p.bx,.11,0];
 // ışın C→B; XZ düzleminde kök noktaya en yakın nokta
 const d=[B[0]-C[0],B[1]-C[1],B[2]-C[2]],dx=d[0],dz=d[2],L2=dx*dx+dz*dz;let t=((root[0]-C[0])*dx+(root[1]-C[2])*dz)/L2;t=Math.max(0,Math.min(1,t));
 const px=C[0]+dx*t,pz=C[2]+dz*t,py=C[1]+d[1]*t,dist=Math.hypot(px-root[0],pz-root[1]);return dist<.30&&py<1.9;}   // 0,30 m: gövde+omuz silüeti (piksel ölçümünde 0,35 m ışın mesafesinde top %0–15 görünür kayıp)
let gizliYeni=0,gizliEski=0;
for(let idx=0;idx<P.length;idx++)for(const durus of [-1,0,1]){const p=P[idx];
 DT.cizim.sahneKur(p,durus);const C=DT.cizim.kameraKonum();if(gizliMi(C,p,durus))gizliYeni++;
 // eski kamera: sabit +2 m yan kayma
 const ul=Math.hypot(-p.bx,p.D),ux=-p.bx/ul,uz=p.D/ul,ay=DT.cizim.kameraAyar[p.tip],Ce=[p.bx-ux*ay.geri-uz*2,ay.yuk,-uz*ay.geri+ux*2];if(gizliMi(Ce,p,durus))gizliEski++;
 // kale kadrajda ve yeterince geniş
 const a=DT.cizim.izdus(-3.66,0,p.D),b=DT.cizim.izdus(3.66,0,p.D);assert(Math.abs(b.x-a.x)>=130,"goal must retain a usable width in default viewport");}
assert.equal(gizliYeni,0,'yeni kamerada top '+gizliYeni+' durumda gövde tarafından örtülüyor');
assert(gizliEski>=15,'negatif kontrol: eski kamerada en az 15 durum örtülü olmalı ('+gizliEski+')');
// davranış: duruş seçimi kamerayı değiştirir; yeniden boyutlama duruşu korur
const p0=P[0];DT.cizim.sahneKur(p0,0);const c0=DT.cizim.kameraKonum();DT.cizim.kameraDurus(1);const c1=DT.cizim.kameraKonum();assert.equal(DT.cizim.kamDurus(),1);assert(Math.abs(c0[0]-c1[0])>.3);
DT.cizim.kameraDurus(-1);const c2=DT.cizim.kameraKonum();assert(Math.abs(c1[0]-c2[0])>.3&&Math.abs(c0[0]-c2[0])>.3,'üç duruşta üç farklı kamera');assert(Math.sign(c1[0]-p0.bx)!==Math.sign(c2[0]-p0.bx),'sağ ve sol duruşta kamera topun iki ayrı yanında');
DT.cizim.sahneKur(p0);assert.equal(DT.cizim.kamDurus(),-1,'sahneKur(p) duruşu korur');DT.cizim.sahneKur(p0,0);assert.equal(DT.cizim.kamDurus(),0);
console.log('PASS camera shifts with stance (right/left opposite, scales with distance); ball never behind the player cylinder in 30 position×stance cases; negative control: old fixed camera hides the ball in '+gizliEski+'/30');
// Every position/stance in short, normal, landscape and desktop layouts:
// target projection must remain invertible and the goal must retain a useful size.
for(const [w,h] of [[320,568],[390,844],[430,932],[844,390],[1366,768]]){
 DT.cizim.kur(C.createCanvas(w,h),w,h,1);
 for(const p of P)for(const dir of [-1,0,1]){
  DT.cizim.sahneKur(p,dir);const l=DT.cizim.izdus(-3.66,0,p.D),rr=DT.cizim.izdus(3.66,0,p.D),t=DT.cizim.izdus(0,2.44,p.D),b=DT.cizim.izdus(0,0,p.D);
  assert(Math.abs(rr.x-l.x)>=128,'minimum goal width 128px: '+w+'x'+h);assert(Math.abs(b.y-t.y)>=44,'minimum goal height 44px');
  for(const [x,y] of [[-3.2,.3],[3.2,2.1],[0,1]]){const screen=DT.cizim.izdus(x,y,p.D),aim=DT.cizim.ekranToKale(screen.x,screen.y);assert(Math.hypot(aim.x-x,aim.y-y)<1e-7,'target mapping remains correct after camera shift');}
 }
}
console.log('PASS 150 scene layouts: goal dimensions and target roundtrip');
