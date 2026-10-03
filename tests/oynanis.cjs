// Run: node tests/oynanis.cjs (no dependencies)
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root={};vm.createContext(root);
for(const name of ['ayar','veri','kaleci','fizik','puan'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name+'.js'),'utf8'),root);
const D=root.DT;let checked=0;
for(const pos of D.AYAR.pozisyonlar)for(const x of [-3,0,3])for(const y of [.35,1.1,2.2])for(const seed of [1,17,42,101]){
 const input={pos,aim:{x,y},zaman:.5,falso:0,seed};let a=D.fizik.hesapla(input),b=D.fizik.hesapla(input);
 assert.equal(JSON.stringify(a.yol),JSON.stringify(b.yol));assert(a.yol.every(p=>Number.isFinite(p.x+p.y+p.z)&&p.y>=D.AYAR.kale.topYaricap-1e-8));checked++;
}
for(const pos of D.AYAR.pozisyonlar.slice(3)){
 let goals=0;for(let seed=1;seed<=100;seed++){let r=D.fizik.hesapla({pos,aim:{x:0,y:2.2},falso:0,zaman:.5,seed});assert(!['baraj','aut'].includes(r.sonuc));if(r.sonuc==='gol')goals++;}assert(goals>0&&goals<100);
}
for(const direction of [-1,1]){
 const k={x:0,y:1,ilerleme:1,yon:direction},shape=D.kaleci.siluet(k),plan={konum:()=>k};
 const strip=shape.strips[Math.floor(shape.strips.length/2)];assert(D.kaleci.tutarMi(plan,1,{x:(strip[0]+strip[1])/2,y:1+(strip[2]+strip[3])/2}));
 assert(!D.kaleci.tutarMi(plan,1,{x:3,y:3}));
}
console.log('PASS:',checked,'deterministic trajectories, left/right overhead freekicks, goalkeeper silhouette contact.');
