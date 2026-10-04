// Adaptif çözünürlük: varsayılan sınır 2; kare süresi uzun kalırsa 1,5'a ve 1'e iner; kısa duraklamalar sayılmaz. node tests/kalite.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={devicePixelRatio:3,addEventListener(){},Image:function(){},document:undefined};root.globalThis=root;vm.createContext(root);
for(const n of ['ayar','veri','baraj','model3d','kaleci','ucus','fizik','puan','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
const C=root.DT.cizim;
assert.equal(C.dprSiniri(),2,'varsayılan sınır 2 (3x piksel kullanılmaz)');
for(let i=0;i<300;i++)C.kareOlc(16.7);assert.equal(C.dprSiniri(),2,'akıcı cihazda düşürme yok');
for(let i=0;i<300;i++)C.kareOlc(900);assert.equal(C.dprSiniri(),2,'sekme duraklaması (>250 ms) ölçülmez');
for(let i=0;i<59;i++)C.kareOlc(45);assert.equal(C.dprSiniri(),2,'60 kare dolmadan karar yok');

C.kareOlc(45);
assert.equal(C.dprSiniri(),1.5,'yavaş cihazda sınır 1,5\'a iner');
for(let i=0;i<20;i++)C.kareOlc(45);                       // boyut değişiminden sonra kısa bekleme
for(let i=0;i<60;i++)C.kareOlc(45);assert.equal(C.dprSiniri(),1,'hâlâ yavaşsa 1\'e iner');
for(let i=0;i<400;i++)C.kareOlc(80);assert.equal(C.dprSiniri(),1,'1\'in altına inmez');
console.log('PASS default DPR cap 2; drops to 1.5 then 1 only after 60 slow frames; ignores pauses; never below 1');
for(let i=0;i<600;i++)C.kareOlc(16.7);assert.equal(C.dprSiniri(),1.5,'sustained recovery raises one level');
for(let i=0;i<120;i++)C.kareOlc(16.7);
for(let i=0;i<300;i++)C.kareOlc(16.7);C.kareOlc(900);
for(let i=0;i<300;i++)C.kareOlc(16.7);assert.equal(C.dprSiniri(),1.5,'pause resets fast window');
for(let i=0;i<300;i++)C.kareOlc(16.7);assert.equal(C.dprSiniri(),2,'second stable window restores full quality');
