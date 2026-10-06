// İkinci sevinç: yalnız kişinin kendi fotoğraf kareleri (3B gövdeye sarma yok), kareler bilinen anahtarlar,
// hareket sürekli (kare değişiminde sıçrama yok), görüntü boyu sabit, eksik karede güvenli düşüş.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={DT:{SPRITE:{genislik:900,yukseklik:560,ankrajX:450,ankrajY:540,boy:474}},localStorage:{getItem(){return null},setItem(){}}};vm.createContext(r);
for(const n of ['futbolcu3d','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const S=r.DT.sevinc;
let r3=0;r.DT.futbolcu3d.draw=()=>{r3++;};
const izinli=new Set(['bekle','sevinc','sevinc2','sevinc3','sevinc4']);
for(const id of ['meto','lort','latte','josh','fero']){let prev=null;const keys=new Set();
 for(let i=0;i<=60*8;i++){const t=i/60,f=S.frame(id,t);assert(izinli.has(f.key),id+' bilinmeyen kare '+f.key);keys.add(f.key);
  for(const k of ['dx','lift','rot','sx','sy'])assert(Number.isFinite(f[k]));assert(f.lift>=0&&f.lift<.4);assert(Math.abs(f.rot)<.2);assert(f.sx>.9&&f.sx<1.1&&f.sy>.9&&f.sy<1.1);
  if(prev)assert(Math.hypot(f.dx-prev.dx,f.lift-prev.lift)<.05,id+' sürekli hareket t='+t);prev=f;}
 assert(keys.size>=4,id+' en az dört farklı fotoğraf karesi');}
// Çizim: 3B gövde çağrılmaz; yalnız verilen sprite görselleri çizilir; görsel yoksa false döner.
const cv=C.createCanvas(390,844),g=cv.getContext('2d'),img=C.createCanvas(900,560);img.getContext('2d').fillStyle='#f00';img.getContext('2d').fillRect(420,100,60,440);
const istenen=[];assert(S.draw(g,{id:'meto',time:1.0,x:195,y:700,height:300,sprite:k=>{istenen.push(k);return img;},makeCanvas:(w,h)=>C.createCanvas(w,h)}));
assert.equal(r3,0,'3B gövde kullanılmaz');assert(istenen.every(k=>izinli.has(k)));
assert.equal(S.draw(g,{id:'meto',time:1,x:0,y:0,height:300,sprite:()=>null}),false,'kare yoksa eski yola düşer');
assert.equal(S.draw(g,{id:'meto',time:1,x:0,y:0,height:300}),false);
console.log('PASS ikinci sevinç: 5 kişi × 8 sn, yalnız fotoğraf kareleri, sürekli hareket, 3B gövde yok');
