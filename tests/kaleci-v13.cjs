const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function world(old){const r={};vm.createContext(r);for(const f of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(old?cp.execFileSync('git',['show','b5b106b:js/'+f+'.js'],{encoding:'utf8'}):fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),r);return r.DT;}
const D=world(false),old=world(true);
for(const kural10 of [false,true]){
 let a=0,b=0;for(let i=0;i<1000;i++){
  const o={penaltiTahmin:true,preDecision:(i+.5)/1000,kural10,D:11,yol:[]};
  const before=D.kaleci.planla({},'penalti',false,()=>0,1,o),after=D.kaleci.planla({},'penalti',false,()=>0,1,{...o,kaleciV13:true});
  a+=before.kararYon===1;b+=after.kararYon===1;assert(after.baslamaT<0);
  const other=D.kaleci.planla({x:-999,y:99},'penalti',false,()=>0,9,{...o,hedefX:-999,kaleciV13:true});assert.equal(after.kararYon,other.kararYon,'guess does not read the eventual target');
 }
 assert.equal(a,kural10?380:430);assert.equal(b,kural10?430:460);
 console.log('corner guess '+(kural10?'practice':'official')+': '+a/10+'% -> '+b/10+'%');
}
const pos={tip:'frikik',bx:0,D:25},flight=D.ucus.energyLaunch(pos,{x:3.2,y:1},{x:0,y:0},0,1,()=>0,1,true,null,true);
const opt={yol:flight.yol,D:25,yerTakibi:true,takipFizigi:true,decision:.5,akilliFrikik:true};
const before=D.kaleci.planla({},'frikik',false,()=>0,flight.T,opt),after=D.kaleci.planla({},'frikik',false,()=>0,flight.T,{...opt,kaleciV13:true});
assert(Math.abs(before.okumaT-after.okumaT-.05)<1e-8);assert(after.okumaT>=.20);
const changed=flight.yol.map(p=>p.t>.45?{...p,x:p.x+20}:p),other=D.kaleci.planla({},'frikik',false,()=>0,flight.T,{...opt,yol:changed,kaleciV13:true});
for(let t=0;t<=.45;t+=.01)assert.equal(JSON.stringify(after.konum(t)),JSON.stringify(other.konum(t)),'new keeper uses only past observations');
for(let t=0;t<1.5;t+=.005){const a=after.konum(t),b=after.konum(t+.005);assert(Math.abs(b.x-a.x)/.005<=7.51,'no extra lateral speed or teleporting');}
function firstDive(p){for(let t=0;t<2;t+=.002)if(p.konum(t).poz==='dal')return t;return 2;}
assert(firstDive(after)<firstDive(before),'dives earlier for the representative fast corner shot');
// The old rules use exactly the previous physics, including saved keeper poses.
for(const pos of [D.AYAR.pozisyonlar[0],D.AYAR.pozisyonlar[5],D.AYAR.pozisyonlar[8]])for(let seed=1;seed<=12;seed++){
 const input={pos,seed,aim:{x:2.8,y:1.4},contact:{x:.2,y:0},guc:1,zaman:.5,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,falsoDenge:true,akilliFrikik:true,direkFizigi:true};
 assert.equal(JSON.stringify(D.fizik.hesapla(input)),JSON.stringify(old.fizik.hesapla(input)),'rules 12 replay unchanged');
}
console.log('PASS rules 13: measured pre-kick corner increase, 50 ms earlier reads, earlier dive, causal observations, bounded speed, unchanged rules-12 replay');
