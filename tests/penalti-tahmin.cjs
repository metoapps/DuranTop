const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function world(old){const r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(old?cp.execFileSync('git',['show','0b24b234:'+`js/${n}.js`],{encoding:'utf8'}):fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);return r.DT;}
const D=world(false),old=world(true),base={pos:D.AYAR.pozisyonlar[0],contact:{x:0,y:0},guc:1,zaman:.5,seed:1,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,sabitKol:true};
function shot(x,y,seed,power=1){return D.fizik.hesapla({...base,aim:{x,y},seed,guc:power,penaltiTahmin:true});}
function plan(path,decision){return D.kaleci.planla({x:999,y:999},'penalti',false,()=>0,999,{yol:path,D:11,penaltiTahmin:true,preDecision:decision});}
const fixture=shot(3.15,1,8),path=fixture.ucusYol;
for(const decision of [.05,.3,.8]){
 const a=plan(path,decision),changed=path.map(p=>p.t>.20?{...p,x:-p.x+100,y:10,z:p.z}:p),b=plan(changed,decision);
 assert.equal(a.kararYon,b.kararYon);assert(a.baslamaT<0);
 for(let t=-.3;t<.2;t+=.002)assert.equal(JSON.stringify(a.konum(t)),JSON.stringify(b.konum(t)),'past pose cannot depend on future samples');
 let previous=a.konum(-.3);for(let t=-.29;t<=3;t+=.01){const k=a.konum(t);assert(Number.isFinite(k.x+k.y));assert(Math.abs(k.x-previous.x)/.01<=D.AYAR.kaleci.penaltiHiz+.001,'lateral speed bounded');if(k.poz==='dal')assert.equal(k.yon,a.kararYon,'no reversal');
  const r=D.model3d.rig(k,11);for(const side of ['l','r'])for(const [x,y] of [['s','e'],['e','h']])assert(Math.abs(Math.hypot(...r.nodes[x+side].map((v,i)=>v-r.nodes[y+side][i]))-.34)<1e-8,'hand-height correction preserves arm bones');previous=k;}
 if(a.kararYon)assert(a.konum(-.02).x*a.kararYon>0,'starts before contact');else assert.equal(a.konum(.5).x,0);
}
let matchedSave=0,wrongGoal=0,correctUnreachable=0,slowSave=0;
for(let seed=1;seed<=80;seed++){
 const right=shot(3.15,1,seed),left=shot(-3.15,2,seed,.6);assert.equal(right.kaleci.kararYon,left.kaleci.kararYon,'choice independent of aim/height/power');
 assert.equal(JSON.stringify(right.kaleci.konum(-.03)),JSON.stringify(left.kaleci.konum(-.03)),'same pre-kick state for same official conditions');
 if(right.kaleci.kararYon===1){matchedSave+=right.sonuc==='kurtaris';correctUnreachable+=shot(3.45,2.3,seed).sonuc==='gol';slowSave+=shot(3.15,1,seed,.6).sonuc==='kurtaris';}
 if(right.kaleci.kararYon===-1)wrongGoal+=right.sonuc==='gol';
 if(right.sonuc==='kurtaris'){const contact=right.yol.find(p=>Math.abs(p.t-right.olayT)<1e-8);assert(D.kaleci.tutarMi(right.kaleci,right.olayT,contact),'save requires real rendered-body contact');}
 // Existing recorded rules 8 and free kicks remain exactly reproducible.
 for(const pos of [base.pos,D.AYAR.pozisyonlar[5]]){const input={...base,pos,aim:{x:2.8,y:1.4},seed};const a=D.fizik.hesapla(input),b=old.fizik.hesapla(input);assert.equal(JSON.stringify(a),JSON.stringify(b),'historical rules 8 unchanged');if(pos.tip==='frikik')assert.equal(JSON.stringify(D.fizik.hesapla({...input,penaltiTahmin:true})),JSON.stringify(a),'free kick still observes shot');}
}
assert(matchedSave>20&&wrongGoal>20&&correctUnreachable>20&&slowSave>20,'save/guess/reach/slow-shot cases all exercised');
console.log('PASS causal pre-kick left/right/center choices, same-seed fairness, locked direction, bounded speed/fixed arms, actual saves and unreachable goals, slow shots, exact rules-8 replay/free kicks');
