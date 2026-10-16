const fs=require('fs'),vm=require('vm'),assert=require('assert');const root={DT:{}};vm.createContext(root);
for(const f of ['futbolcu3d','lort-body'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),root);
const D=root.DT,R=D.futbolcu3d.rig,B=D.lortBody.build;
const idle=R({direction:0}).nodes,base=B(idle,8),low=B(idle,4);
assert(base.length<=520&&low.length<=340,'bounded cloth geometry, lower detail for distant players');
function check(mesh){for(const t of mesh){assert(t.p.every(p=>p.length===3&&p.every(Number.isFinite)));if(t.uv){assert(t.uv.every(p=>p.every(v=>v>=0&&v<=1)));const [a,b,c]=t.uv;assert(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))>1e-9,'no collapsed UV triangles / invisible cloth side panels');}}}
check(base);check(low);
const delta=[19,31,-22],moved={};for(const [k,v] of Object.entries(idle))moved[k]=v.map((x,i)=>x+delta[i]);
const translated=B(moved,8);base.forEach((t,i)=>t.p.forEach((p,j)=>p.forEach((x,k)=>assert(Math.abs(translated[i].p[j][k]-x-delta[k])<1e-8,'cloth follows the body exactly; no world-space lag'))));
for(const t of base.filter(t=>t.texture==='shirtBack'))for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(Math.abs(t.p[i][1]-t.p[j][1])<1e-7){assert((t.p[i][0]-t.p[j][0])*(t.uv[i][0]-t.uv[j][0])>=-1e-8,'back number is readable, not mirrored');}
for(const dir of [-1,0,1])for(let i=0;i<=80;i++){
 const rig=R({direction:dir,shot:{elapsed:i/80*.7,windup:.44}});check(B(rig.nodes,8));
 const walk=R({direction:dir,walk:{from:-dir,to:dir,u:i/80}});check(B(walk.nodes,8));
}
const html=fs.readFileSync(__dirname+'/../index.html','utf8');assert(html.indexOf('js/lort-body.js')<html.indexOf('js/futbolcu3d.js'),'module loaded before renderer');
const src=fs.readFileSync(__dirname+'/../js/futbolcu3d.js','utf8');assert(src.includes("o.id==='lort'&&D.lortBody"),'new body only used for LORT');
console.log('PASS LORT: fitted mesh follows joints, 486 animated poses finite, readable back UVs, '+base.length+'/'+low.length+' triangles, other characters keep original renderer');
