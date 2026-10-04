const fs=require('fs'),vm=require('vm'),assert=require('assert'),r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,pos=D.AYAR.pozisyonlar[0],counts={};let hits=0;
for(let x=3.2;x<=3.96;x+=.01){const f=D.fizik.hesapla({pos,aim:{x,y:1},contact:{x:0,y:0},guc:1,zaman:.5,seed:8,enerjiFizigi:true,sabitKol:true});counts[f.sonuc]=(counts[f.sonuc]||0)+1;
if(f.direkTemas){hits++;const p=f.direkTemas;assert(Math.abs(Math.hypot(p.x-3.66,p.z-11)-.17)<.0001,'swept sphere meets expanded cylindrical post surface');assert(p.t<f.olayT||f.sonuc==='kurtaris');}
if(f.sonuc==='direk_gol'){assert(f.direkTemas);assert(f.cizgiyiGecti);assert(f.gecis.x<3.55&&f.gecis.y<2.33);assert(f.ucusYol.some(p=>p.t>f.direkTemas.t&&p.z>=11.11-1e-6),'goal only after reflected path fully crosses');}
if(f.sonuc==='direk_disari')assert.equal(D.puan.puanla('penalti',f).puan,0);
}
assert(hits>10&&counts.direk_gol>0&&counts.direk_disari>0);
console.log('PASS continuous sphere/post sweep, genuine reflected goals, reflected misses zero points:',counts);
