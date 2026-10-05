const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
function world(storage){let r={DT:{},localStorage:storage};vm.createContext(r);for(const n of ['futbolcu3d','sevinc','tribun'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+n+'.js'),'utf8'),r);return r.DT;}
const map={},storage={getItem(k){return map[k]||null},setItem(k,v){map[k]=v}},D=world(storage);
for(const id of ['meto','lort','latte','josh','fero']){
 assert.deepEqual([D.sevinc.next(id),D.sevinc.next(id),D.sevinc.next(id),D.sevinc.next(id)],[1,0,1,0]);
 let previous;for(let j=0;j<330;j++){const r=D.futbolcu3d.rig({sevinc:{id,time:j/60}});for(const n of Object.values(r.nodes))assert(n.every(Number.isFinite));
  for(const side of ['l','r'])for(const [a,b,len] of [['s','e',55],['e','h',55],['hip','k',72],['k','f',72]]){const x=r.nodes[a+side],y=r.nodes[b+side];assert(Math.abs(Math.hypot(...x.map((v,k)=>v-y[k]))-len)<1e-7);}
  if(previous)for(const k of ['hl','hr','head'])assert(Math.hypot(...r.nodes[k].map((v,i)=>v-previous[k][i]))<15,'continuous '+id+' '+k);previous=r.nodes;
 }
}
assert.equal(world(storage).sevinc.next('meto'),1,'alternation survives reload');
const blocked=world({getItem(){throw Error()},setItem(){throw Error()}});assert.deepEqual([blocked.sevinc.next('meto'),blocked.sevinc.next('meto')],[1,0],'private/storage disabled still alternates');
const T=D.tribun,base=[-1.0,1.6,31],m=T.newMesh(12,8,T.pole(0,base));let maxStretch=0,maxLag=0;
for(let i=0;i<=1200;i++){const t=i/60;T.advance(m,t,base,false);const pole=T.pole(t,base);
 for(const n of m.pts){assert(n.p.every(Number.isFinite));if(n.pinned){const want=pole.end.map((v,k)=>v-pole.axis[k]*3.45*n.v);assert(Math.hypot(...n.p.map((v,k)=>v-want[k]))<1e-9,'hoist attached to moving pole');}else maxLag=Math.max(maxLag,Math.abs(n.p[2]-pole.end[2]));}
 for(const l of m.links){const a=m.pts[l.a].p,b=m.pts[l.b].p;maxStretch=Math.max(maxStretch,Math.hypot(...a.map((v,k)=>v-b[k]))/l.rest);}
}
assert(maxStretch<1.12,'cloth remains inextensible: '+maxStretch);assert(maxLag>.15,'free cloth bends behind moving pole');
T.advance(m,1200,base,false);assert(m.pts.every(n=>n.p.every(Number.isFinite)),'resume after tab pause remains stable');
T.advance(m,0,base,true);const stationary=JSON.stringify(m.pts.map(n=>n.p));T.advance(m,8,base,true);assert.equal(stationary,JSON.stringify(m.pts.map(n=>n.p)),'reduced motion is stationary');
assert.equal(T.slogans.meto,'Meto Forever');console.log('PASS 5 distinct fixed-bone celebrations; durable independent two-way alternation; disabled storage; moving anchored pole; bounded cloth strain '+maxStretch.toFixed(3)+'; inertia '+maxLag.toFixed(2)+'m; long-pause recovery; reduced motion; Meto banner');
