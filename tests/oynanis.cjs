const fs=require('fs'),vm=require('vm'),assert=require('assert');const r={};vm.createContext(r);for(const n of ['ayar','veri','kaleci','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,P=D.AYAR.pozisyonlar[0];
function shot(x,y,z=.5,c={x:0,y:0},seed=1,pos=P,practice=false){return D.fizik.hesapla({pos,aim:{x,y},zaman:z,contact:c,seed,antrenman:practice});}
let n=0;for(const pos of D.AYAR.pozisyonlar)for(const x of [-3,0,3])for(const y of [.35,1.1,2.2])for(const z of [.3,.46,.5,.7])for(const c of [{x:0,y:0},{x:.6,y:0},{x:0,y:-.5}]){const a=shot(x,y,z,c,42,pos),b=shot(x,y,z,c,42,pos);assert.equal(JSON.stringify(a.yol),JSON.stringify(b.yol));assert(a.yol.every(p=>Number.isFinite(p.x+p.y+p.z)&&p.y>=.109999));assert(a.speed>0);n++;}
for(const practice of [false,true])for(const y of [.3,1.1,2.1])for(let s=1;s<=100;s++)assert.equal(shot(0,y,.5,undefined,s,P,practice).sonuc,'kurtaris');
let perfect=0,near=0,miss=0;for(let s=1;s<=100;s++){perfect+=shot(3.15,1.1,.5,undefined,s).sonuc==='kurtaris';near+=shot(3.15,1.1,.46,undefined,s).sonuc==='kurtaris';miss+=shot(3.15,1.1,.4,undefined,s).sonuc==='kurtaris';assert(shot(3.15,1.1,.5,undefined,s).speed>shot(3.15,1.1,.4,undefined,s).speed);}assert(miss>perfect+70);assert(near<=miss);
const left=shot(3,1.1,.5,{x:-.5,y:0}),right=shot(3,1.1,.5,{x:.5,y:0});assert(left.yol[20].x>right.yol[20].x);
for(const pos of D.AYAR.pozisyonlar.slice(3)){assert.equal(shot(0,2,.5,undefined,1,pos).sonuc,'baraj');assert.notEqual(shot(0,2,.5,{x:0,y:-.3},1,pos).sonuc,'baraj');}
assert.equal(shot(0,1.1).tuttu,true);assert.equal(shot(0,1.1).kaleci.eylem,'bekle');
console.log('PASS',n,'deterministic trajectories; 600 central saves; contact loft/spin; corner saves per100:',{perfect,near,miss});
