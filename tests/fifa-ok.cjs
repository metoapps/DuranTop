// FIFA frikik yer oku: topun gerçek uçuş yolunu izler. Falso → yana eğilir; alt temas → havaya kalkar; üst temas → yerde kalır; hedef halkası çizilmez.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}}};vm.createContext(root);
for(const n of ['ayar','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','futbolcu3d','sevinc','tribun','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;
const F=D.AYAR.pozisyonlar.filter(p=>p.tip==='frikik');const yol=(pos,aim,c)=>D.ucus.energyLaunch(pos,aim,c,0,1,()=>0,1,true,{hata:0,bant:.02}).yol;
const ilk=(y,m)=>{const o=[];let t=0;for(let i=1;i<y.length;i++){t+=Math.hypot(y[i].x-y[i-1].x,y[i].y-y[i-1].y,y[i].z-y[i-1].z);o.push(y[i]);if(t>m)break;}return o;};
for(const pos of F){const duz=ilk(yol(pos,{x:1,y:1.5},{x:0,y:0}),9),sag=ilk(yol(pos,{x:1,y:1.5},{x:.8,y:0}),9),sol=ilk(yol(pos,{x:1,y:1.5},{x:-.8,y:0}),9),alt=ilk(yol(pos,{x:1,y:1.5},{x:0,y:-.8}),9),ust=ilk(yol(pos,{x:1,y:1.5},{x:0,y:.8}),9);
 const yan=a=>a[a.length-1].x,yuk=a=>Math.max(...a.map(p=>p.y));
 assert(Math.abs(yan(sag)-yan(duz))>.25&&Math.abs(yan(sol)-yan(duz))>.25&&(yan(sag)-yan(duz))*(yan(sol)-yan(duz))<0,pos.ad+': falso oku iki yana eğer '+[yan(sol),yan(duz),yan(sag)].map(v=>v.toFixed(2)));
 assert(yuk(alt)>yuk(duz)+.3&&yuk(duz)>yuk(ust)+.2,pos.ad+': alt>orta>üst yükseklik '+[yuk(alt),yuk(duz),yuk(ust)].map(v=>v.toFixed(2)));}
// Çizim: yarı saydam kırmızı ok görünür; hedef halkası (beyaz+kırmızı parçalı) çizilmez; ok yola uyar.
const W=390,H=844,cv=C.createCanvas(W,H);D.cizim.kur(cv,W,H,1);for(const k of D.KARAKTER)for(const p of D.POZ)D.cizim.gorselEkle(k.id+'_'+p,new C.Image());
const pos=F[1];D.cizim.sahneKur(pos,0);const g=cv.getContext('2d');
function kare(y){D.cizim.ciz({top:{x:pos.bx,y:.11,z:0},oyuncu:{karakter:'meto',durus:0,poz:'vurus1'},nisan:{aim:{x:1,y:1.5},kilit:false,fifa:true,fifaYol:y}});return Uint8ClampedArray.from(g.getImageData(0,0,W,H).data);}
const bos=kare(null);
function fark(y){const k=kare(y);let n=0,x0=1e9,x1=-1,kirm=0;for(let i=0;i<k.length;i+=4){if(Math.abs(k[i]-bos[i])+Math.abs(k[i+1]-bos[i+1])+Math.abs(k[i+2]-bos[i+2])>60){n++;const px=(i/4)%W;x0=Math.min(x0,px);x1=Math.max(x1,px);if(k[i]>k[i+2]+40)kirm++;}}return{n,gen:x1-x0,kirm};}
const duz=fark(yol(pos,{x:1,y:1.5},{x:0,y:0})),egri=fark(yol(pos,{x:1,y:1.5},{x:.9,y:0}));
assert(duz.n>600&&egri.n>600&&duz.kirm>.8*duz.n,'ok görünür ve kırmızı '+JSON.stringify(duz));assert(egri.gen>duz.gen+4,'falsoda ok yatayda daha geniş yayılır '+duz.gen+'→'+egri.gen);
assert.equal(fark(null).n,0,'yol yoksa ok yok');
const oyun=fs.readFileSync(__dirname+'/../js/cizim.js','utf8');assert(/if \(fifa\) return;/.test(oyun),'hedef halkası frikikte çizilmez');
console.log('PASS FIFA yer oku: falso iki yana eğer, alt temas yükseltir, üst temas yerde, ok görünür ('+duz.n+' px değişti), halka yok');
