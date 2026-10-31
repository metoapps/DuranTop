// Meto'nun prosedürel sevinçlerinde "kırık kol" yok: dirsek omuzdan belirgin yukarıdayken önkol aşağı sarkmaz; el yüzün önüne gelmez. (Yayındaki 1. sevinçte karelerin %39'unda vardı.)
const fs=require('fs'),vm=require('vm'),assert=require('assert');const D={DT:{},console};vm.createContext(D);for(const f of ['ayar','futbolcu3d','meto3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),D);
const M=D.DT.meto3d,R=D.DT.futbolcu3d,meta=JSON.parse(fs.readFileSync(__dirname+'/../assets/meto3d/model.json'));const U=1/meta.unit_m;const sub=(a,b)=>a.map((v,k)=>v-b[k]),len=a=>Math.hypot(...a);
for(const [ad,cel] of [['sevinç 1',{variant:0}],['sevinç 2',{variant:1}],['sevinç 3',{variant:2}],['direk tepkisi',{variant:0,kind:'near'}],['kaçırma tepkisi',{variant:0,kind:'miss'}]]){
 for(let j=0;j<=900;j++){const t=j/100,r=R.rig({direction:0});r.celebration=Object.assign({time:t},cel);const p=M._pose(r,meta);
  for(const s of ['l','r']){if(p['e'+s][1]>p['s'+s][1]+.06*U)assert(p['h'+s][1]>=p['e'+s][1]-.05*U,ad+' t='+t+' '+s+': dirsek yukarıdayken önkol sarkıyor (kırık kol)');
   const fark=sub(p['h'+s],p.head);if(fark[2]>0)assert(len(fark)>=.10*U,ad+' t='+t+' '+s+': el yüzün önünde');}}}
console.log('PASS kırık kol yok: 3 sevinç + 2 kaçırma tepkisi, 9 sn boyunca');
