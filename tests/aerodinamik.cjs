const fs=require('fs'),vm=require('vm'),assert=require('assert');const root={};vm.createContext(root);for(const n of ['ayar','ucus'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT,U=D.ucus,P=D.AYAR.pozisyonlar[0],F={tip:'frikik',ad:'Calibration 22m',bx:7,D:Math.sqrt(22*22-49)},aim={x:0,y:1.1};
function launch(p,x,y,q=1){return U.launch(p,aim,{x,y},0,q,()=>0);}
const base=launch(P,0,0);assert(base.spinRps<1e-8);assert(Math.abs(base.son.x-aim.x)<1e-4&&Math.abs(base.son.y-aim.y)<1e-4);
let last=0;for(const x of [.1,.3,.6,.85]){const l=launch(P,-x,0),r=launch(P,x,0);assert(l.son.x>0&&r.son.x<0);assert(Math.abs(l.son.x+r.son.x)<1e-6);assert(Math.abs(r.son.x)>last);last=Math.abs(r.son.x);assert(r.spinRps<15);}
assert(Math.abs(launch(F,.6,0).son.x)>3*Math.abs(launch(P,.6,0).son.x));assert(launch(P,0,-.3).son.y>base.son.y);assert(launch(P,0,.3).son.y<base.son.y);assert(launch(P,.6,0,.4).spinRps<launch(P,.6,0).spinRps);
const v=[3,4,25],w=[0,40,0],a=U.acceleration(v,w,0),drag=U.acceleration(v,[0,0,0],0),magnus=a.map((x,i)=>x-drag[i]);assert(Math.abs(magnus.reduce((sum,x,i)=>sum+x*v[i],0))<1e-8);assert(drag.reduce((sum,x,i)=>sum+(x+(i===1?9.81:0))*v[i],0)<0);
const initial=U.temizHiz(F,aim),omega=[0,40,0],coarse=U.integrate(F,initial,omega,{dt:1/120}),fine=U.integrate(F,initial,omega,{dt:1/240});assert(Math.hypot(coarse.son.x-fine.son.x,coarse.son.y-fine.son.y)<.005);
console.log('PASS center torque; mirrored and monotonic side spin; lift/dip; long-distance bend; timing spin transfer; Magnus perpendicular to velocity; dissipative drag; RK4 step convergence');
console.log('Max side contact:',{penaltyMeters:launch(P,.85,0).son.x,freekickMeters:launch(F,.85,0).son.x,spinRps:launch(P,.85,0).spinRps});
