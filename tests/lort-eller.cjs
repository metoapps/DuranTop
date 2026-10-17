const fs=require('fs'),vm=require('vm'),assert=require('assert'),root={DT:{}};vm.createContext(root);
for(const f of ['ayar','sevinc','lort-body','futbolcu3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),root);
const D=root.DT,F=D.futbolcu3d,B=D.lortBody,dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]);let count=0;
function check(n,o){for(const lod of [4,8]){const mesh=B.hands(n,lod,o);assert(mesh.length<=(lod===8?308:72),'bounded hand mesh replaces the old ellipsoids');
 for(const side of ['l','r']){const parts=mesh.filter(t=>t.hand===side),w=n['h'+side],v=sub(w,n['e'+side]),len=Math.hypot(...v),axis=v.map(x=>x/len);
  assert(parts.some(t=>t.part==='palm')&&parts.some(t=>t.part==='thumb'),'both hands have a palm and opposed thumb');
  if(lod===8)for(let i=0;i<4;i++)assert(parts.some(t=>t.part==='finger'+i),'four fingers per hand');
  const extension=[];for(const face of parts)for(const p of face.p){assert(p.every(Number.isFinite));extension.push(dot(sub(p,w),axis));}
  assert(Math.min(...extension)>=-3,'palm joins the wrist rather than replacing the forearm');assert(Math.max(...extension)>24&&Math.max(...extension)<51,'hand visibly extends past wrist within adult proportions');
 }count++;}}
const idle=B.pose(F.rig({direction:0}).nodes,{});check(idle,{});
function tip(mesh){const p=mesh.filter(t=>t.hand==='r'&&t.part==='finger1').slice(-2).flatMap(t=>t.p);return p[0].map((_,i)=>p.reduce((s,x)=>s+x[i],0)/p.length);}
const open=tip(B.hands(idle,8,{})),closed=tip(B.hands(idle,8,{sevinc:{time:1.7,variant:1}})),axis=sub(idle.hr,idle.er).map(x=>x/72);
assert(dot(sub(open,closed),axis)>15,'fist celebration flexes the fingers back into the palm');
const shift=[19,31,-22],translated={};for(const [k,v] of Object.entries(idle))translated[k]=v.map((x,i)=>x+shift[i]);
const a=B.hands(idle,8,{}),b=B.hands(translated,8,{});a.forEach((f,i)=>f.p.forEach((p,j)=>p.forEach((x,k)=>assert(Math.abs(b[i].p[j][k]-x-shift[k])<1e-7,'hand remains attached while root moves'))));
for(const pos of [D.AYAR.pozisyonlar[0],D.AYAR.pozisyonlar.find(p=>p.tip==='frikik')])for(const direction of [-1,0,1])for(let i=0;i<=80;i++){
 const W=D.AYAR.kosuSure[pos.tip],shot={elapsed:i/80*W*1.5,windup:W,contact:{x:direction*.7,y:.7}},p=F.placement(pos,{direction,shot,path:[{x:pos.bx,z:0},{x:pos.bx+direction*.03,z:.1}]}),o={direction,shot,kick:p.kick,gait:p.gait,drift:p.drift,plant:p.plant,devam:p.devam,cok:p.cok};check(B.pose(F.rig(o).nodes,o),o);
}
for(const variant of [0,1])for(let i=0;i<=90;i++){const o={sevinc:{id:'lort',time:i/15,variant}};check(B.pose(F.rig(o).nodes,o),o);}
console.log('PASS LORT hands: '+count+' pose/LOD cases, two palms, eight fingers, two thumbs, closed fingertips, attached wrists, curled fist and bounded geometry');
