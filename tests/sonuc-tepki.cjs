// Gol olmayan sonuçta Meto ve LORT heykel gibi durmaz: kısa doğal tepki (direk: "olamaz!" → "bir daha!"; kaçırma: omuz silkme → alkış), sonra canlı bekleme.
// LORT kaçırmada da 3B gövdeyle çizilir (2B resme dönmez). Kollar insan aralığında.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const D={DT:{},console};vm.createContext(D);for(const f of ['ayar','futbolcu3d','meto3d','lort-body'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),D);
const M=D.DT.meto3d,R=D.DT.futbolcu3d,meta=JSON.parse(fs.readFileSync(__dirname+'/../assets/meto3d/model.json'));const sub=(a,b)=>a.map((v,k)=>v-b[k]),len=a=>Math.hypot(...a),dot=(a,b)=>a.reduce((n,x,k)=>n+x*b[k],0),ang=(a,b)=>Math.acos(Math.max(-1,Math.min(1,dot(a,b)/len(a)/len(b))))*180/Math.PI;
for(const kind of ['near','miss']){let hMin=[1e9,1e9,1e9],hMax=[-1e9,-1e9,-1e9],gec=0,gecMin=1e9,gecMax=-1e9;
 for(let j=0;j<=1000;j++){const t=j/100,r=R.rig({direction:0});r.celebration={time:t,variant:0,kind};const p=M._pose(r,meta);
  for(const s of ['l','r']){const th=ang(sub(p['e'+s],p['s'+s]),sub(p['h'+s],p['e'+s]));assert(th>=9.9&&th<=140.1,kind+' dirsek insan aralığında: '+th.toFixed(1));}
  for(let k=0;k<3;k++){hMin[k]=Math.min(hMin[k],p.hr[k]);hMax[k]=Math.max(hMax[k],p.hr[k]);}
  if(t>=6){gecMin=Math.min(gecMin,p.hr[2]+p.hip[0]);gecMax=Math.max(gecMax,p.hr[2]+p.hip[0]);}}
 const hareket=Math.max(...hMax.map((v,k)=>v-hMin[k]));assert(hareket>60,kind+': tepki sırasında el belirgin hareket eder ('+hareket.toFixed(0)+' birim)');
 assert(gecMax-gecMin>3,kind+': uzun beklemede de canlı (heykel değil): '+(gecMax-gecMin).toFixed(1));}
// LORT
{const L=D.DT.lortBody;for(const v of ['near','miss']){const a=L.celebration(.9,v),b=L.celebration(2.2,v);assert(a&&b&&Array.isArray(a.left)&&a.left.length>=3,'LORT tepkisi '+v+' tanımlı');assert(JSON.stringify(a.left)!==JSON.stringify(b.left),'LORT tepkisi zamanla değişir ('+v+')');}}
// Bağlantılar: sonuç türü çizime gider; LORT kaçırmada da 3B çizilir; Meto portresi gol olmayınca da hareketli
{const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),c=fs.readFileSync(__dirname+'/../js/cizim.js','utf8'),m=fs.readFileSync(__dirname+'/../js/meto3d.js','utf8');
 assert(/tur: gecerliSonuc\.r\.sonuc/.test(oyun),'sonuç türü (direk/aut…) çizime gider');assert(/tur:durum&&durum\.tur/.test(c),'Meto portresine sonuç türü gider');
 assert(!/karakter==='lort'&&durum&&durum\.gol&&/.test(c)&&/variant:durum\.gol\?\(durum\.sevinc\|\|0\):\(durum\.tur==='direk_disari'\?'near':'miss'\)/.test(c),'LORT kaçırmada da 3B gövde + tepki');
 assert(/celebrate=o\.goal\?\{time:t,variant:o\.variant\|\|0\}:\{time:t,variant:0,kind:/.test(m),'Meto gol olmayınca da hareketli portre (donuk değil)');}
console.log('PASS sonuç tepkileri: Meto (direk, kaçırma) ve LORT (3B) — kısa tepki, canlı bekleme, insan aralığında kollar');
