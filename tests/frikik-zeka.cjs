const fs=require('fs'),vm=require('vm'),assert=require('assert'),r={};vm.createContext(r);
for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,pos={tip:'frikik',bx:0,D:25},flight=D.ucus.energyLaunch(pos,{x:1.5,y:1.1},{x:.6,y:0},0,1,()=>0,1,true,null,true);
const options={yol:flight.yol,D:pos.D,yerTakibi:true,takipFizigi:true,decision:.1,akilliFrikik:true};
function plan(o){return D.kaleci.planla({},'frikik',false,()=>0,flight.T,o);}
const keeper=plan(options);assert(keeper.okumaT>=.24,'human reaction latency remains');assert(keeper.gozlemler.length>1);
const horizon=.55,changed=flight.yol.map(p=>p.t>horizon?{...p,x:p.x+30,y:3}:p),other=plan({...options,yol:changed});
for(let t=0;t<=horizon;t+=.01)assert.equal(JSON.stringify(keeper.konum(t)),JSON.stringify(other.konum(t)),'cannot read future curve');
for(let t=0;t<1.5;t+=.005){const p=keeper.konum(t),q=keeper.konum(t+.005);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(Math.abs(q.x-p.x)/.005<=7.5+.01,'no teleport or superhuman horizontal speed');}
// Fewer blind central dives with identical observed trajectory.
let errorsOld=0,errorsNew=0;
const straight=D.ucus.energyLaunch(pos,{x:0,y:1},{x:0,y:0},0,1,()=>0,1,true,null,true);
for(let i=0;i<100;i++){const o={...options,yol:straight.yol,decision:(i+.5)/100};errorsOld+=+plan({...o,akilliFrikik:false}).merkezHatasi;errorsNew+=+plan(o).merkezHatasi;}
assert(errorsNew<errorsOld&&errorsNew>0,'improved decisions without perfect keeper');
console.log('PASS free-kick intelligence: causal repeated reads, real reaction and speed limits, central mistakes '+errorsOld+' → '+errorsNew+'/100');
