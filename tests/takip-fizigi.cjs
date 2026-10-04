const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
function load(){const r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan']){let file=__dirname+'/../js/'+n+'.js';vm.runInContext(fs.readFileSync(file,'utf8'),r);}return r.DT;}
const D=load(false),P=D.AYAR.pozisyonlar[0],F=D.AYAR.pozisyonlar[9];
const shot=(extra={})=>({pos:P,aim:{x:0,y:.3},contact:{x:.85,y:0},guc:.6,zaman:.5,seed:1,enerjiFizigi:true,takipFizigi:true,sabitKol:true,...extra});
let saves=0;for(let seed=1;seed<=100;seed++){let r=D.fizik.hesapla(shot({seed}));saves+=r.sonuc==='kurtaris';}assert(saves>=80,'slow central curl exploit must be tracked, while rare wrong decisions remain');
for(const sign of [-1,1])for(const power of [.4,.5,.6,.7]){let saves=0,goals=0;for(let seed=1;seed<=30;seed++){let r=D.fizik.hesapla(shot({seed,guc:power,contact:{x:sign*.85,y:0}}));saves+=r.sonuc==='kurtaris';goals+=r.sonuc==='gol';}assert(goals<27,'no near-guaranteed weak central curl strategy');}
for(const speed of [7.2,9,12]){const v=D.ucus.fixedDirection(F,{x:0,y:1.1},speed,true);assert(Math.atan2(v[1],Math.hypot(v[0],v[2]))<=Math.PI/4+1e-8);assert(Math.abs(Math.hypot(...v)-speed)<1e-10);}
const f=D.ucus.energyLaunch(P,{x:0,y:.3},{x:.85,y:0},0,1,()=>0,.6,true);
function plan(path,T=2){return D.kaleci.planla({x:999,y:999},'penalti',false,()=>0,T,{takipFizigi:true,sabitKol:true,decision:1,D:11,yol:path});}
for(const cutoff of [.2,.35,.6,.8]){let edited=f.yol.map(p=>p.t<=cutoff?p:{...p,x:p.x+30,y:9,z:p.z+10}),a=plan(f.yol,1),b=plan(edited,7);for(let t=0;t<=cutoff;t+=.005)assert.equal(JSON.stringify(a.konum(t)),JSON.stringify(b.konum(t)),'no future path or true duration knowledge');}
const k=plan(f.yol);for(let t=0;t<.19;t+=.005)assert.equal(k.konum(t).x,0);assert(k.konum(5).recovery===1&&k.konum(5).poz==='bekle','keeper lands and gets up');
let maxSpeed=0;for(let t=.001;t<2;t+=.001){maxSpeed=Math.max(maxSpeed,Math.abs(k.konum(t).x-k.konum(t-.001).x)/.001);}assert(maxSpeed<=D.AYAR.kaleci.penaltiHiz+.01);
// Freeze serialized rules 5 outputs, including trajectories and decisions.
const inputs=[];for(let i=0;i<100;i++)inputs.push(shot({pos:D.AYAR.pozisyonlar[i%10],seed:i+1,aim:{x:(i%9-4)*.8,y:.2+(i%5)*.5},guc:.3+(i%8)*.1,zaman:.46+(i%9)*.01,takipFizigi:false}));
const hash=d=>crypto.createHash('sha256').update(JSON.stringify(inputs.map(x=>d.fizik.hesapla(x)))).digest('hex');
const expected='e09b5386f6c8195a3eadc35619845aa9f82859527c307477affe52c05e76339f';assert.equal(hash(D),expected,'rules 5 historical playback is unchanged');
console.log('PASS causal repeated observations, weak-curl strategy matrix, landing/recovery, finite body speed, bounded fallback angle and unchanged energy; saves '+saves+'/100');
// Regulation opening and finite ball radius, isolated from goalkeeper and aim solver.
const launch0=D.ucus.energyLaunch,keeper0=D.kaleci.tutarMi;
D.kaleci.tutarMi=()=>false;
for(const [x,expected] of [[3.54,'gol'],[3.58,'direk'],[-3.54,'gol'],[-3.58,'direk']]){
 D.ucus.energyLaunch=()=>({yol:[{t:0,x,y:1,z:0},{t:1,x,y:1,z:10.5},{t:1.05,x,y:1,z:11.11}],T:1.05,son:{x,y:1,z:11.11},reached:true,speed:12,spin:[0,0,0],spinRps:0,contact:{x:0,y:0}});
 const r=D.fizik.hesapla(shot());if(expected==='gol')assert.equal(r.sonuc,'gol');else assert(r.direkTemas,'post contact uses axes outside opening');
}
D.ucus.energyLaunch=launch0;D.kaleci.tutarMi=keeper0;
// Actual new rig: nonzero through-contact speed and stationary grounded follow-through.
const rigRoot={DT:D};vm.createContext(rigRoot);vm.runInContext(fs.readFileSync(__dirname+'/../js/futbolcu3d.js','utf8'),rigRoot);
function foot(t){const shot={elapsed:t,windup:.85},place=D.futbolcu3d.placement(P,{direction:0,shot}),rig=D.futbolcu3d.rig({direction:0,shot,kick:place.kick,gait:place.gait});return rig.nodes.fr.map(x=>x*D.futbolcu3d.UNIT);}
const before=foot(.849),at=foot(.85),after=foot(.851);assert((at[2]-before[2])/.001>5,'foot is moving through the ball');assert(Math.abs((at[2]-before[2])-(after[2]-at[2]))<.001,'no stopped foot or position jump at contact');
const planted=foot(1.45),later=foot(1.55);assert(Math.hypot(...planted.map((x,i)=>x-later[i]))<1e-8,'planted follow-through does not slide');
console.log('PASS regulation post opening and through-contact foot continuity / stable planted foot');
