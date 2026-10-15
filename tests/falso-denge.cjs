const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function world(old){const r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(old?cp.execFileSync('git',['show','origin/main:js/'+n+'.js'],{encoding:'utf8'}):fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);return r.DT;}
const D=world(false),old=world(true),pos={tip:'frikik',bx:0,D:25},aim={x:0,y:1.1},noise=()=>0;
function launch(x,power,newModel,k10){return D.ucus.energyLaunch(pos,aim,{x,y:0},0,1,noise,power,true,k10?{hata:0,bant:.035}:null,newModel);}
for(const fast of [false,true])for(const power of [.3,.6,1]){
 const straight=launch(0,power,true,fast),curve=launch(.85,power,true,fast),left=launch(-.85,power,true,fast),before=launch(.85,power,false,fast);
 assert(curve.speed>straight.speed*.94,'strong curl retains >94% of central speed');
 assert(curve.speed<straight.speed,'rotation is not free energy');assert(curve.speed>before.speed,'oblique impact no longer over-penalised');
 assert(Math.abs(curve.energy.translation+curve.energy.rotation-curve.energy.available)<1e-8,'finite energy conserved at impact');
 assert(curve.energy.available<=.5*.43*curve.energy.nominalSpeed**2+1e-8);
 assert(Math.abs(curve.speed-left.speed)<1e-10,'mirror speed');assert(Math.abs(curve.spin[1]+left.spin[1])<1e-8,'mirror spin');
 assert(curve.spinRps>0&&curve.spinRps<13,'plausible calibrated spin range');
}
const v=[3,4,30],omega=[0,50,0],a=D.ucus.acceleration(v,omega,.2),b=D.ucus.acceleration(v,[0,0,0],.2);
assert(Math.abs(v.reduce((n,x,i)=>n+x*(a[i]-b[i]),0))<1e-8,'Magnus does no work in still air');
// Old saved shot data must reproduce the old numerical trajectories and outcomes.
for(let seed=1;seed<=24;seed++){
 const input={pos:D.AYAR.pozisyonlar[seed%10],aim:{x:2.5,y:1.2},contact:{x:.6,y:-.2},guc:.8,zaman:.5,seed,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true};
 assert.equal(JSON.stringify(D.fizik.hesapla(input)),JSON.stringify(old.fizik.hesapla(input)),'saved rules 9 replay unchanged');
}
const full=launch(.85,1,true,true),prev=launch(.85,1,false,true);
console.log('PASS finite energy, Magnus perpendicular force, symmetric spin, old replay; max curl '+(prev.speed*3.6).toFixed(1)+' → '+(full.speed*3.6).toFixed(1)+' km/h');
