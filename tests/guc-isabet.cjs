const fs=require('fs'),vm=require('vm'),assert=require('assert'),r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,pos=D.AYAR.pozisyonlar[0],target={x:3.25,y:2.15},center={x:0,y:1.1};
for(const aim of [center,target]){let previous=Infinity;for(const power of [.3,.5,.7,.85,1]){const b=D.zamanBandi(aim,power);assert(b<previous);previous=b;}assert(D.zamanBandi(aim,.7)>D.zamanBandi(aim,1));}
assert(D.zamanBandi(target,1)<D.zamanBandi(center,1));
function shot(power,z,legacy=false){return D.fizik.hesapla({pos,aim:target,contact:{x:0,y:0},seed:7,guc:power,zaman:z,gucZorlugu:!legacy});}
for(const p of [.3,.6,1])assert.equal(shot(p,.5).quality,1,'perfect timing has no extra random penalty');
const a=shot(.7,.54),b=shot(1,.54);assert(a.quality>b.quality);
for(const p of [.7,1]){let last=1;for(const error of [.005,.01,.02,.04,.08]){const q=shot(p,.5+error).quality;assert(q<last);last=q;}}
const baseline=shot(1,.54,true),strong=shot(1,.54);assert(strong.quality<baseline.quality);
const old=D.koseBandi(target);assert.equal(D.zamanBandi(target),old);assert.equal(baseline.bandaGirdi,Math.abs(.54-.5)<=old);
for(const power of [.7,1]){const band=D.zamanBandi(target,power);assert(shot(power,.5+band*.99).bandaGirdi);assert(!shot(power,.5+band*1.01).bandaGirdi);}
for(const position of D.AYAR.pozisyonlar)for(const power of [.6,.75,.9]){
 const f=D.ucus.hedefliLaunch(position,{x:2.8,y:1.9},{x:0,y:0},0,1,()=>0,power,true);
 assert(Math.hypot(f.son.x-2.8,f.son.y-1.9)<.006,'controlled speed still aims accurately');
}
console.log('PASS monotonic power difficulty, tighter corners, gradual timing penalty, perfect timing preserved, historical replay and green threshold equals physics');
