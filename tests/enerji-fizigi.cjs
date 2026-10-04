const fs=require('fs'),vm=require('vm'),assert=require('assert'),r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,U=D.ucus,P={tip:'penalti',bx:0,D:11},F={tip:'frikik',bx:0,D:28},aim={x:0,y:1.1};
function kick(pos,c={x:0,y:0},power=1,q=1){return U.energyLaunch(pos,aim,c,0,q,()=>0,power);}
for(const pos of D.AYAR.pozisyonlar)for(const power of [.3,.55,.7,1])for(const c of [{x:0,y:0},{x:.8,y:0},{x:0,y:-.8},{x:.6,y:.6}]){const f=U.energyLaunch(pos,{x:3.1,y:2.1},c,0,1,()=>0,power);assert(f.speed<=D.AYAR.hiz[pos.tip]*power+1e-9,'aim cannot manufacture launch speed');assert(Math.abs(f.energy.translation+f.energy.rotation-f.energy.available)<1e-8,'one finite energy budget');assert(f.yol.every(p=>[p.t,p.x,p.y,p.z].every(Number.isFinite)));}
for(const pos of [P,F]){let bend=0;for(const x of [.2,.4,.6,.8]){const left=kick(pos,{x:-x,y:0}),right=kick(pos,{x,y:0});assert(left.son.x>0&&right.son.x<0);assert(Math.abs(left.son.x+right.son.x)<1e-6);assert(Math.abs(right.son.x)>bend);bend=Math.abs(right.son.x);assert(right.speed<kick(pos).speed);}}
assert(Math.abs(kick(F,{x:.8,y:0}).son.x)>3*Math.abs(kick(P,{x:.8,y:0}).son.x));
assert(kick(P,{x:0,y:-.8}).son.y>D.AYAR.kale.yukseklik+.11);assert(kick(F,{x:0,y:-.8}).son.y>D.AYAR.kale.yukseklik+.11);
assert(kick(P,{x:0,y:.6}).son.y<kick(P).son.y);assert(kick(P).spinRps<1e-8);
for(const power of [.6,.8,1])assert(Math.abs(kick(P,{x:0,y:0},power).son.y-aim.y)<.001);
const weak=D.fizik.hesapla({pos:F,aim,contact:{x:0,y:0},guc:.3,zaman:.5,seed:7,enerjiFizigi:true,sabitKol:true});assert(!weak.cizgiyiGecti);assert(!['gol','direk_gol'].includes(weak.sonuc));
const launch=kick(F,{x:.6,y:-.2}),fine=U.integrate({bx:0,D:28.11},launch.initialVelocity,launch.spin,{dt:1/240,groundSpin:true});assert(Math.hypot(fine.son.x-launch.son.x,fine.son.y-launch.son.y)<.005);
// Tangential ground impulse trades translation and rotation, dissipating energy.
const m=.43,I=(2/3)*m*.11*.11,E=(v,w)=>.5*m*Math.hypot(...v)**2+.5*I*Math.hypot(...w)**2;
for(const w of [[0,0,0],[60,0,0],[-60,0,0],[0,0,60]]){const v=[3,-2,12],k=U.groundImpulse(v,w,2);assert(E(k.velocity,k.spin)<=E(v,w)+1e-8);assert(k.velocity[1]===v[1]);}
// Legacy replay must remain bit-for-bit equivalent after the new model is added.
const legacy=[];for(const pos of D.AYAR.pozisyonlar){const input={pos,aim:{x:2.8,y:1.6},contact:{x:.35,y:-.1},guc:.7,zaman:.47,seed:93,temasFizigi:true,sabitKol:true};legacy.push(D.fizik.hesapla(input));}
assert.equal(require('crypto').createHash('sha256').update(JSON.stringify(legacy)).digest('hex'),'1088b4077b261c628646a8d449d97fbca2b48c7e991c810639b25e705044234a','legacy replay regression hash measured against release s');
// The keeper's motion schedule is based on observed speed, not a future arrival.
const sample=kick(F,{x:.6,y:0}),opts={decision:1,yol:sample.yol,sabitKol:true,enerjiFizigi:true};
const a=D.kaleci.planla(sample.son,'frikik',false,()=>0,sample.T,opts),b=D.kaleci.planla(sample.son,'frikik',false,()=>0,sample.T+3,opts);
for(let t=0;t<3;t+=.02)assert.equal(JSON.stringify(a.konum(t)),JSON.stringify(b.konum(t)),'no exact future arrival knowledge');
console.log('PASS finite speed and translational/rotational energy, mirrored uncancelled Magnus curve, long-distance bend, loft/dip, no premature goal, RK4 convergence, causal keeper scheduling and identical old replays');
