// Final rendered skeleton, not only the smaller gameplay rig.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const root={DT:{}};vm.createContext(root);
for(const f of ['ayar','futbolcu3d','sevinc','lort-body'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),root);
const D=root.DT,F=D.futbolcu3d,B=D.lortBody,dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));let count=0,maxStep=0;
function validate(raw,o){const n=B.pose(raw,o);for(const p of Object.values(n))assert(p.every(Number.isFinite));
 for(const side of ['l','r']){for(const [a,b,L] of [['s','e',76],['e','h',72],['hip','k',110],['k','f',108]])assert(Math.abs(dist(n[a+side],n[b+side])-L)<1e-6,'rendered bone length stays constant: '+a+b);
 if(!o.sevinc)assert.deepEqual(Array.from(n['f'+side]),Array.from(raw['f'+side]),'gameplay contact anchor stays exact');
 const u=n['e'+side].map((v,i)=>(v-n['s'+side][i])/76),f=n['h'+side].map((v,i)=>(v-n['e'+side][i])/72),angle=Math.acos(Math.max(-1,Math.min(1,u.reduce((s,v,i)=>s+v*f[i],0))))*180/Math.PI;
 assert(angle>=9&&angle<=141,'elbow cannot hyperextend or fold flat: '+angle);
 assert(n['f'+side][1]>=8-1e-6,'foot above floor');
 }count++;return n;}
const idle=validate(F.rig({direction:0}).nodes,{});assert.equal(idle.head[1]+35,471,'tall head silhouette retained');assert(idle.hip[1]>215,'adult leg / torso proportions');assert(idle.head[1]-35-(idle.neck[1]-25)<16,'short anatomical neck above collar');
for(const pos of [D.AYAR.pozisyonlar[0],D.AYAR.pozisyonlar.find(p=>p.tip==='frikik')])for(const direction of [-1,0,1])for(const contact of [{x:0,y:0},{x:.8,y:.8},{x:-.8,y:-.8}]){
 const W=D.AYAR.kosuSure[pos.tip],path=[{x:pos.bx,z:0},{x:pos.bx+direction*.03,z:.1}];
 function sample(tb){const shot={elapsed:tb*W,windup:W,contact},p=F.placement(pos,{direction,shot,path}),o={direction,shot,kick:p.kick,gait:p.gait,drift:p.drift,plant:p.plant,devam:p.devam,cok:p.cok};return validate(F.rig(o).nodes,o);}
 for(let i=0;i<=300;i++)sample(i/200);
 for(const t of [F.TB_GERI,F.TB_KOS,F.tbBas(W),1]){const a=sample(t-.0001),b=sample(t+.0001);for(const k of Object.keys(a)){const step=dist(a[k],b[k]);maxStep=Math.max(maxStep,step);assert(step<6,'continuous phase boundary: '+k+' '+step+' t='+t+' dir='+direction+' contact='+JSON.stringify(contact)+' tip='+pos.tip);}}
}
for(const variant of [0,1]){let prev;for(let i=0;i<=420;i++){const o={sevinc:{id:'lort',time:i/60,variant}},n=validate(F.rig(o).nodes,o);if(prev)for(const k of Object.keys(n))assert(dist(prev[k],n[k])<9,'no celebration frame jumps: '+k+' i='+i+' variant='+variant+' step='+dist(prev[k],n[k]));prev=n;}}
const src=fs.readFileSync(__dirname+'/../js/cizim.js','utf8');assert(src.includes("sevinc:{id:'lort',time:lt,variant:durum.sevinc||0}"),'goal close-up uses articulated body for both LORT celebrations');
console.log('PASS LORT final anatomy: '+count+' poses; fixed rendered bones, exact shot anchors, adult proportions, short neck, bounded elbows, two continuous 3D celebrations; max phase step '+maxStep.toFixed(3));
