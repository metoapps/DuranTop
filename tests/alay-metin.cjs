// Rendered crowd reactions follow the public provider; no duplicate fallback table.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root={DT:{}};vm.createContext(root);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/tezahurat.js'),'utf8'),root);
const T=root.DT.tezahurat,source=fs.readFileSync(path.join(__dirname,'../js/cizim.js'),'utf8');
assert(!/var ALAY =/.test(source),'renderer has no obsolete second phrase table');
for(const seed of [0,1,47,999])for(const person of [null,'meto','lort','fero','latte','josh','unknown']){
 for(const result of ['aut','direk_disari','kisa','kurtaris','baraj','ag','halka','gol','unknown']){
  const items=T.alayMetinleri(result,seed,person);
  if(!['aut','direk_disari'].includes(result)){assert.equal(items.length,0,result+': no negative bubble');continue;}
  assert(items.length>=4&&items.length<=5);assert.equal(new Set(items.map(x=>x.m)).size,items.length);
  for(const item of items){assert(typeof item.m==='string'&&item.m.length>0);
   if(item.ozel){assert.equal(result,'aut');assert(T.OZEL_OLUMSUZ[person].includes(item.m),'only own personal phrases');}
   else assert(T.GENEL_OLUMSUZ.includes(item.m));}
  assert.deepEqual(items,T.alayMetinleri(result,seed,person),'stable for same shot');
 }
}
console.log('PASS crowd phrase provider: only out/post misses, unique deterministic comments, personal phrases restricted to own player');
