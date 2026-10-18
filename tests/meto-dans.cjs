/* Meto Mixamo sevinci (breakdance, sevinç 3): paket bütünlüğü, ağ eşleşmesi, kare sürekliliği, kadraj, dönüşüm sırası. Tarayıcı gerekmez. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.join(__dirname,'../assets/meto3d'),meta=JSON.parse(fs.readFileSync(dir+'/model.json')),M=JSON.parse(fs.readFileSync(dir+'/sevinc-breakdance.json')),bin=fs.readFileSync(dir+'/sevinc-breakdance.bin');
const buf=bin.buffer.slice(bin.byteOffset,bin.byteOffset+bin.byteLength);
assert.equal(bin.length,M.binaryBytes,'tam paket');assert(bin.length<400000,'paket küçük: '+bin.length);
assert.equal(M.bones.length,22,'22 kemik (WebGL1 128 vec4 sınırının altında: '+(M.bones.length*4)+')');assert.equal(M.frameStride,M.bones.length*7);assert.equal(M.fps,30);
assert.deepEqual(M.skinVertices,meta.meshes.map(m=>m.vertices),'oyun ağıyla birebir aynı tepe sayısı (geometri yeniden indirilmez)');
let ziplanan=0;M.skinOffsets.forEach((o,i)=>{const s=new Uint8Array(buf,o,M.skinVertices[i]*8);for(let v=0;v<M.skinVertices[i];v++){let sum=0;for(let k=0;k<4;k++){assert(s[v*8+k]<M.bones.length,'kemik dizini');sum+=s[v*8+4+k];}assert.equal(sum,255,'ağırlık toplamı 1');}});
// yüz (ağ 0) ve gözler (1,2) baş/boyun kemiklerinden başka kemiğe bağlanmaz: yüz yamulmaz
const bas=['Neck','Head'].map(n=>M.bones.indexOf(n)),ust=['Spine2','Neck','Head'].map(n=>M.bones.indexOf(n));
for(const i of [0,1,2]){const s=new Uint8Array(buf,M.skinOffsets[i],M.skinVertices[i]*8);for(let v=0;v<M.skinVertices[i];v++)for(let k=0;k<4;k++)if(s[v*8+4+k])assert(ust.includes(s[v*8+k]),'baş ağı üst gövde dışına bağlı');}
const root={DT:{},console};vm.createContext(root);for(const f of ['futbolcu3d','meto3d','sevinc'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+f+'.js'),'utf8'),root);
const D=root.DT,frames=new Float32Array(buf,M.frameOffset,M.frames*M.frameStride);
for(let f=0;f<M.frames;f++)for(let b=0;b<M.bones.length;b++){const o=f*M.frameStride+b*7;assert(Math.abs(Math.hypot(frames[o],frames[o+1],frames[o+2],frames[o+3])-1)<1e-4,'birim dördey');}
// süreklilik: dans hızlı (ayak ucu ≈10 m/sn), ama 1/60 sn'de hiçbir eklem 60 birimi (≈23 cm) aşmaz; bitişteki geri dönüş ve döngü, dansın kendi en hızlı anından yavaş
const cyc=M.duration+.5;let prev=null,maxJump=0,loopJump=0,minY=1e9,maxDrift=0;const hip=M.bones.indexOf('Hips');
for(let i=0;i<=Math.ceil(2*cyc*60);i++){const p=D.meto3d._dansPose(i/60,M,frames);assert.equal(p.bones.length,M.bones.length*16);assert(p.bones.every(Number.isFinite));
 for(const j of p.joints){assert(j.every(Number.isFinite));minY=Math.min(minY,j[1]);}
 maxDrift=Math.max(maxDrift,Math.hypot(p.joints[hip][0]-M.joints[hip][0],p.joints[hip][2]-M.joints[hip][2]));
 if(prev)p.joints.forEach((j,k)=>{const d=Math.hypot(...j.map((v,q)=>v-prev[k][q])),tt=(i/60)%cyc;if(tt>M.duration-.02||tt<.02)loopJump=Math.max(loopJump,d);else maxJump=Math.max(maxJump,d);});prev=p.joints;}
assert(maxJump<60,'kesintisiz hareket: '+maxJump.toFixed(1));assert(loopJump<maxJump,'döngü geçişi sıçramasız: '+loopJump.toFixed(1));assert(maxDrift<120,'kök kayması (ham Mixamo ≈490 birim=1,9 m) çıkarıldı, kadrajda kalır: '+maxDrift.toFixed(1));assert(minY>-15,'eklemler zeminin altına girmez: '+minY.toFixed(1));
// t=0: ilk kare; bitiş+0.5 sn: yine ilk kare (döngü dikişsiz)
const a=D.meto3d._dansPose(0,M,frames).bones,b=D.meto3d._dansPose(cyc-1e-6,M,frames).bones;assert(a.every((v,i)=>Math.abs(v-b[i])<.05),'döngü başa dikişsiz döner');
// dönüşüm: Meto artık dört sevinç arasında döner (kalıcı sayaç), diğerleri değişmez
const map={},st={getItem(k){return map[k]||null},setItem(k,v){map[k]=v}};const W=()=>{const r={DT:{},localStorage:st};vm.createContext(r);for(const f of ['futbolcu3d','sevinc'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+f+'.js'),'utf8'),r);return r.DT;};
const S=W();assert.deepEqual([0,1,2,3,4].map(()=>S.sevinc.next('meto')),[0,1,2,3,0]);assert.deepEqual([0,1,2].map(()=>S.sevinc.next('lort')),[1,0,1]);
// paket hazır değilken sevinç 3 güvenle yumruk sevincine (0) düşer: model yoksa çizim false döner, istisna yok
assert.equal(D.meto3d.draw({},{id:'meto',project:()=>({x:0,y:0,d:1}),metoCelebration:{time:1,variant:3}}),false);
console.log('PASS Meto breakdance: '+bin.length+' bayt, '+M.frames+' kare, 22 kemik, ağ eşleşmesi tam, süreklilik '+maxJump.toFixed(1)+' < 60, döngü geçişi '+loopJump.toFixed(1)+', kayma '+maxDrift.toFixed(0)+', döngü dikişsiz, dört sevinç dönüşümü');
