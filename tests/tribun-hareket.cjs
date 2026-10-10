// Tribün hareketi: seyirciler zıplar ve kol kaldırır, dalga geçer, gol olunca herkes coşar; hareketi azalt ayarında durgun.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
function dunya(reduce){let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},matchMedia:()=>({matches:true})};vm.createContext(root);   // sistem 'hareketi azalt' AÇIK: oyun bunu yok sayar
 for(const n of ['ayar','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
 const D=root.DT,W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');if(reduce)D.AYAR.hareket=false;D.cizim.kur(cv,W,H,1);D.cizim.sahneKur(D.AYAR.pozisyonlar[5],0);
 return{kare:(t,heyecan,alay,tur)=>{now=t*1000;D.cizim.ciz({top:{x:D.AYAR.pozisyonlar[5].bx,y:.11,z:0},heyecan:heyecan||0,alay:alay===undefined?-1:alay,alayTur:tur});return Uint8ClampedArray.from(g.getImageData(0,35,W,130).data);}};}
const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
const w=dunya(false),a=w.kare(1.0),b=w.kare(1.35),c=w.kare(4.2),dalga=w.kare(2.0),gol=w.kare(4.2,1);
assert(fark(a,b)>1500,'seyirciler ve bayraklar 0,35 sn içinde hareket etti: '+fark(a,b));assert(fark(a,c)>1500);
assert(fark(c,gol)>1200,'gol heyecanı seyirciyi değiştirir: '+fark(c,gol));
// tekrarlanabilirlik: aynı an aynı görüntü
assert.equal(fark(w.kare(3.3),w.kare(3.3)),0,'aynı anda aynı kare');
// dalga: ~11 sn periyotlu; dalga anında kollar havada olan alan artar (B karesi piksel sayısı farkı)
const dalgasiz=w.kare(5.0),dalgali=w.kare(2.6);assert(fark(dalgasiz,dalgali)>1500);
// hareketi azalt: seyirci ve bayraklar durgun
// sistem 'hareketi azalt' açıkken de tribün hareket eder (yukarıdaki ilk dünya matchMedia=true ile çalıştı); yalnız AYAR.hareket=false dondurur
const s=dunya(true);assert.equal(fark(s.kare(1.0),s.kare(4.2,0)),0,'AYAR.hareket=false: tribün durgun');assert.equal(fark(s.kare(1.0),s.kare(3.3,1)),0,'AYAR.hareket=false: gol heyecanı da durgun');assert.equal(fark(s.kare(1.0),s.kare(1.0,0,1.0,'aut')),0,'AYAR.hareket=false: alay da durgun');
// Alay: kaçan şutta (aut, kısa, kurtarış, baraj) balonlar çıkar ve seyirci "yuh" duruşuna geçer; 3,4 sn sonra normale döner.
const normal=w.kare(6.0),alayda=w.kare(6.0,0,0.9,'aut'),alayBitti=w.kare(6.0,0,3.6,'aut');
assert(fark(normal,alayda)>2500,'alayda tribün ve balonlar değişti: '+fark(normal,alayda));assert.equal(fark(normal,alayBitti),0,'alay 3,4 sn sonra biter');
const acik=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>240&&f[i+1]>230&&f[i+2]>200&&f[i+2]<235)n++;return n;};
assert(acik(alayda)>acik(normal)+150,'krem balonlar çizildi: '+acik(normal)+'→'+acik(alayda));
for(const tur of ['aut','kisa','kurtaris','baraj','ag','halka'])assert(fark(normal,w.kare(6.0,0,0.9,tur))>1500,tur+': alay balonları');
assert.equal(fark(w.kare(6.0,0,0.9,'aut'),w.kare(6.0,0,0.9,'aut')),0,'aynı anda aynı balonlar');
// gol heyecanı alaydan farklı
assert(fark(w.kare(6.0,1),alayda)>1500);
console.log('PASS tribün hareketi: seyirci/bayrak hareketli ('+fark(a,b)+' px/0,35 sn), sistem hareketi-azalt yok sayılır, dalga, gol heyecanı, alay balonları, AYAR.hareket=false durgun');
