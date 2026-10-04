const fs=require('fs'),vm=require('vm'),assert=require('assert'),r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,P=D.AYAR.pozisyonlar[0],F={tip:'frikik',bx:0,D:28};
function shot(pos,x,y,power=1){return D.fizik.hesapla({pos,aim:{x:0,y:1.1},contact:{x,y},zaman:.5,guc:power,temasFizigi:true,seed:8});}
let previous=0;for(const x of [.2,.4,.6,.8]){const left=shot(P,-x,0),right=shot(P,x,0);assert(left.gecis.x>0&&right.gecis.x<0);assert(Math.abs(left.gecis.x+right.gecis.x)<1e-6);assert(Math.abs(right.gecis.x)>previous);previous=Math.abs(right.gecis.x);}
assert(Math.abs(shot(F,.8,0).gecis.x)>3*Math.abs(shot(P,.8,0).gecis.x));
for(const pos of D.AYAR.pozisyonlar){const f=shot(pos,0,-.8);assert.equal(f.sonuc,'aut');assert(f.gecis.y>D.AYAR.kale.yukseklik+D.AYAR.kale.topYaricap);assert.equal(D.puan.puanla(pos.tip,f).puan,0);}
const center=shot(P,0,0),low=shot(P,0,-.25),under=shot(P,0,-.8);assert(low.gecis.y>center.gecis.y&&under.gecis.y>low.gecis.y);
const f=D.ucus.hedefliLaunch(P,{x:0,y:1.1},{x:.8,y:0},0,1,()=>0,1,true,true),legacy=D.ucus.hedefliLaunch(P,{x:0,y:1.1},{x:.8,y:0},0,1,()=>0,1,true,false);assert(Math.abs(f.son.x)>.7);assert(Math.abs(legacy.son.x)<.005);
for(const power of [.6,.8,1]){const f=D.ucus.hedefliLaunch(P,{x:0,y:1.1},{x:0,y:0},0,1,()=>0,power,true,true);assert(Math.hypot(f.son.x,f.son.y-1.1)<.005);}
console.log('PASS uncancelled mirrored side spin, stronger edge/long-distance bend, underside raises launch, ten full-power underneath shots out with zero points, center aim accurate and old replays preserved');
