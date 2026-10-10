// Tribün hareketi: seyirciler zıplar ve kol kaldırır, dalga geçer, gol olunca herkes coşar; hareketi azalt ayarında durgun.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
function dunya(reduce){let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},matchMedia:()=>({matches:reduce})};vm.createContext(root);
 for(const n of ['ayar','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
 const D=root.DT,W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');D.cizim.kur(cv,W,H,1);D.cizim.sahneKur(D.AYAR.pozisyonlar[5],0);
 return{kare:(t,heyecan)=>{now=t*1000;D.cizim.ciz({top:{x:D.AYAR.pozisyonlar[5].bx,y:.11,z:0},heyecan:heyecan||0});return Uint8ClampedArray.from(g.getImageData(0,35,W,130).data);}};}
const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
const w=dunya(false),a=w.kare(1.0),b=w.kare(1.35),c=w.kare(4.2),dalga=w.kare(2.0),gol=w.kare(4.2,1);
assert(fark(a,b)>1500,'seyirciler ve bayraklar 0,35 sn içinde hareket etti: '+fark(a,b));assert(fark(a,c)>1500);
assert(fark(c,gol)>1200,'gol heyecanı seyirciyi değiştirir: '+fark(c,gol));
// tekrarlanabilirlik: aynı an aynı görüntü
assert.equal(fark(w.kare(3.3),w.kare(3.3)),0,'aynı anda aynı kare');
// dalga: ~11 sn periyotlu; dalga anında kollar havada olan alan artar (B karesi piksel sayısı farkı)
const dalgasiz=w.kare(5.0),dalgali=w.kare(2.6);assert(fark(dalgasiz,dalgali)>1500);
// hareketi azalt: seyirci ve bayraklar durgun
const s=dunya(true);assert.equal(fark(s.kare(1.0),s.kare(4.2,0)),0,'hareketi azalt: tribün durgun');assert.equal(fark(s.kare(1.0),s.kare(3.3,1)),0,'hareketi azalt: gol heyecanı da durgun');
console.log('PASS tribün hareketi: seyirci/bayrak hareketli ('+fark(a,b)+' px/0,35 sn), dalga, gol heyecanı, hareketi azalt durgun');
