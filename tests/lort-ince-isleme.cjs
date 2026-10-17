// Shared-ring topology, atlas continuity and yaw-cache regressions.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
(async()=>{const r={DT:{}};vm.createContext(r);for(const f of ['ayar','veri','sevinc','lort-body','futbolcu3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),r);const B=r.DT.lortBody,F=r.DT.futbolcu3d;
for(const opt of [{},{sevinc:{time:1.7,variant:1}},{shot:{elapsed:.85,windup:1.2}}])for(const lod of [4,8]){
 const n=B.pose(F.rig(opt).nodes,opt),mesh=B.build(n,lod);
 for(const joint of ['elbowl','elbowr','kneel','kneer']){const tris=mesh.filter(t=>t.joint===joint),edges=new Map(),key=p=>p.map(x=>x.toFixed(7)).join(',');
  for(const t of tris)for(let i=0;i<3;i++){const e=[key(t.p[i]),key(t.p[(i+1)%3])].sort().join('|');edges.set(e,(edges.get(e)||0)+1);}
  assert([...edges.values()].every(n=>n===1||n===2),'manifold joint surface');assert.equal([...edges.values()].filter(n=>n===1).length,2*(lod===8?10:4),'only the sleeve/sock end loops are open, no elbow/knee cracks');
 }
 assert(mesh.length<=720);assert(B.hands(n,lod,opt).length<=308);
}
const front=await C.loadImage(__dirname+'/../assets/sprites/lort_bekle.webp'),back=await C.loadImage(__dirname+'/../assets/sprites/lort_vurus1.webp');let atlasCount=0,atlas;
function makeCanvas(w,h){const c=C.createCanvas(w,h);if(w===256&&h===192){atlasCount++;atlas=c;}return c;}
const c=C.createCanvas(500,600),g=c.getContext('2d'),o={id:'lort',front,back,makeCanvas,x:250,y:560,scale:1,yaw:0};F.draw(g,o);const rear=c.toBuffer('image/png');g.clearRect(0,0,500,600);F.draw(g,{...o,yaw:Math.PI});assert(!rear.equals(c.toBuffer('image/png')),'idle yaw change invalidates cached render without a special viewKey');
for(let i=0;i<12;i++)F.draw(g,{...o,sevinc:{id:'lort',time:i/10,variant:1}});assert.equal(atlasCount,1,'head atlas allocated once, never during animation');
const p=atlas.getContext('2d').getImageData(0,0,256,192).data;for(let y=0;y<192;y++){for(let x=0;x<256;x++)assert.equal(p[(y*256+x)*4+3],255,'opaque temples, no background bleed');for(let k=0;k<3;k++)assert(Math.abs(p[y*256*4+k]-p[(y*256+255)*4+k])<=2,'continuous wrap seam');}
console.log('PASS LORT refinement: welded elbow/knee surfaces at both LODs, bounded geometry, yaw cache invalidation, one cached opaque seamless head atlas');})();
