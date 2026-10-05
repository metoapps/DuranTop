const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto'),r={};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,P=D.AYAR.pozisyonlar[0],old=[];
for(let i=0;i<100;i++)old.push(D.fizik.hesapla({pos:D.AYAR.pozisyonlar[i%10],aim:{x:(i%9-4)*.8,y:.2+(i%5)*.5},contact:{x:.4,y:0},guc:.3+(i%8)*.1,zaman:.46+(i%9)*.01,seed:i+1,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,sabitKol:true}));
assert.equal(crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),'a7329a459bbe16f1a151dd82166b4d0ae4e792d83c92ea8aa4f2aeeab7828e38','rules7 complete outputs must replay unchanged');
// Grazing diagonal travels through the real aperture without touching either post.
for(const sign of [-1,1]){const path=[];for(let z=10.5;z<11.11;z+=.005)path.push({t:z,x:sign*(3.52+.45*(z-11)),y:1,z});path.push({t:11.11,x:sign*3.5695,y:1,z:11.11});assert(D.fizik.golGecisi(path,11));assert(!D.fizik.golGecisi(path.slice(0,-2),11),'partial crossing is not a goal');}
for(const [x,y] of [[4,1],[0,3],[-4,1]])assert(!D.fizik.golGecisi([{t:0,x,y,z:10},{t:1,x,y,z:12}],11),'outside aperture must not score');
const save=D.kaleci.tutarMi;D.kaleci.tutarMi=()=>false;
for(const [x,c] of [[3.3,-.204],[3.4,-.124],[3.5,-.044],[-3.3,.204]]){
 const input={pos:P,aim:{x,y:1},contact:{x:c,y:0},guc:1,zaman:.5,seed:7,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,sabitKol:true};
 const before=D.fizik.hesapla(input),after=D.fizik.hesapla({...input,golGeometrisi:true});assert.equal(before.sonuc,'aut');assert.equal(after.sonuc,'gol');assert(!after.direkTemas);
 const crossing=after.yol.filter(p=>p.t<=after.olayT);assert(D.fizik.golGecisi(crossing,11));
 for(const p of after.yol.filter(p=>p.t>after.olayT)){assert(Math.abs(p.x)<=3.61+1e-8);assert(p.y<=2.39+1e-8);assert(p.z<=12.39+1e-8);}
}
D.kaleci.tutarMi=save;
// Net impacts dissipate energy and respond on both interior and exterior faces.
for(const [prev,p,v,inside] of [
 [{x:3.5,y:1,z:12},{x:3.7,y:1,z:12},{x:10,y:0,z:0},true],
 [{x:0,y:2.3,z:12},{x:0,y:2.5,z:12},{x:0,y:10,z:0},true],
 [{x:0,y:1,z:12.3},{x:0,y:1,z:12.6},{x:0,y:0,z:10},true],
 [{x:0,y:2.8,z:12},{x:0,y:2.5,z:12},{x:0,y:-10,z:0},false],
 [{x:4,y:1,z:12},{x:3.7,y:1,z:12},{x:-10,y:0,z:0},false],
 [{x:0,y:1,z:12.8},{x:0,y:1,z:12.5},{x:0,y:0,z:-10},false]]){
 const speed=Math.hypot(v.x,v.y,v.z);assert(D.fizik.fileTemasi(prev,p,v,11,inside));assert(Math.hypot(v.x,v.y,v.z)<speed);
 if(!inside)assert(p.y>=2.61-1e-8||p.x>=3.83-1e-8||p.z>=12.61-1e-8,'outside impact stays outside the cage');
}
console.log('PASS rules7 replay hash; four reproduced false-outs corrected; whole sphere/aperture; dissipative two-sided roof/side/rear net impacts');
