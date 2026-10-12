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
// Ok kısa: yalnız ilk ~4,5 m. Kaleye (ve baraja) kadar uzanmaz, nişanı kolaylaştırmaz.
{const yl=yol(pos,{x:1,y:1.5},{x:0,y:0}),k=kare(yl);let enUst=1e9;for(let i=0;i<k.length;i+=4)if(Math.abs(k[i]-bos[i])+Math.abs(k[i+1]-bos[i+1])+Math.abs(k[i+2]-bos[i+2])>60&&k[i]>k[i+2]+40)enUst=Math.min(enUst,(i/4/W)|0);
 // yolun 6,4 m'lik 3B uzunluğundaki noktasının ekran satırı: ok bunun ötesine geçmemeli (kaleye/baraja kadar uzanmaz)
 let toplam=0,nokta=yl[0];for(let i=1;i<yl.length;i++){toplam+=Math.hypot(yl[i].x-yl[i-1].x,yl[i].y-yl[i-1].y,yl[i].z-yl[i-1].z);if(toplam>=6.4){nokta=yl[i];break;}}
 const sinir=D.cizim.izdus(nokta.x,nokta.y,nokta.z).y;assert(enUst>=sinir-4,'ok 6,4 m ötesine uzanmaz: en üst piksel '+enUst+', sınır '+sinir.toFixed(0));
 const uzunHal=D.cizim.izdus(pos.bx,0.02,pos.D-.5).y;assert(enUst>uzunHal+30,'ok kaleye ulaşmaz');}
// Ok eğriliği: ok kısa olduğu için gerçek falso sapması ilk 4,5 m'de ~10 cm'dir; gösterimde büyütülür. Falsosuz düz, falsoda görünür biçimde eğri, işaret gerçek sapmayla aynı.
{const tum=[...F,...D.AYAR.pozisyonlar.filter(p=>p.tip==='penalti').slice(0,2)];
 function sapma(nok){const a=nok[0],z=nok[nok.length-1];let tx=nok[Math.min(nok.length-1,4)].x-a.x,tz=nok[Math.min(nok.length-1,4)].z-a.z,l=Math.hypot(tx,tz);tx/=l;tz/=l;return (z.x-a.x)*tz-(z.z-a.z)*tx;}   // sondaki noktanın başlangıç doğrultusuna yanal uzaklığı (m)
 for(const pos of tum){const duz=D.cizim.okNoktalari(yol(pos,{x:1,y:1.4},{x:0,y:0}),4.5,.7),sag=D.cizim.okNoktalari(yol(pos,{x:1,y:1.4},{x:.8,y:0}),4.5,.7),sol=D.cizim.okNoktalari(yol(pos,{x:1,y:1.4},{x:-.8,y:0}),4.5,.7),az=D.cizim.okNoktalari(yol(pos,{x:1,y:1.4},{x:.3,y:0}),4.5,.7);
  assert(duz.length>4&&sag.length>4);
  assert(Math.abs(sapma(duz))<.05,pos.ad+': falsosuz ok düz '+sapma(duz).toFixed(3));
  assert(Math.abs(sapma(sag))>.45&&Math.abs(sapma(sol))>.45,pos.ad+': falsolu ok görünür biçimde eğilir '+sapma(sag).toFixed(2)+' / '+sapma(sol).toFixed(2));
  assert(sapma(sag)*sapma(sol)<0,pos.ad+': iki falso ters yana eğer');
  assert(Math.abs(sapma(az))>.1&&Math.abs(sapma(az))<Math.abs(sapma(sag)),pos.ad+': az falso az eğri');
  assert(Math.abs(sapma(sag))<=1.3,'eğrilik sınırlı');
  // yön: gösterilen eğri, topun GERÇEK sapma yönüyle aynı işaretli (yalnız büyüklük büyütülür)
  for(const cx of [.8,-.8,.4]){const g=yol(pos,{x:1,y:1.4},{x:cx,y:0}),nk=D.cizim.okNoktalari(g,4.5,.7);let kum=[0],t=0;for(let i=1;i<g.length;i++){t+=Math.hypot(g[i].x-g[i-1].x,g[i].y-g[i-1].y,g[i].z-g[i-1].z);kum.push(t);}
   const q=g[kum.findIndex(v=>v>=1)];let tx=q.x-g[0].x,ty=q.y-g[0].y,tz=q.z-g[0].z;const tl=Math.hypot(tx,ty,tz);tx/=tl;ty/=tl;tz/=tl;let nx=tz,nz=-tx;const nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
   const i5=kum.findIndex(v=>v>=5.2),dx=g[i5].x-g[0].x,dy=g[i5].y-g[0].y,dz=g[i5].z-g[0].z,al=dx*tx+dy*ty+dz*tz,ham=(dx-al*tx)*nx+(dz-al*tz)*nz;
   assert(Math.abs(ham)>.03&&Math.abs(ham)<.2,pos.ad+': gerçek sapma küçük ('+(ham*100).toFixed(1)+' cm), ok büyütür');assert(ham*sapma(nk)>0,pos.ad+': gösterilen eğri gerçek sapmayla aynı yönde');}}
 // çizimde: falsolu okun ekrandaki yatay yayılımı falsosuz okunkinden belirgin büyük
 const pp=F[1];D.cizim.sahneKur(pp,0);const dz=fark(yol(pp,{x:1,y:1.4},{x:0,y:0})),fs_=fark(yol(pp,{x:1,y:1.4},{x:.8,y:0}));assert(fs_.gen>dz.gen+10,'ekranda falsolu ok daha geniş yayılır '+dz.gen+' → '+fs_.gen);}
// 3B ok: yolun etrafında kalınlığı olan bir bant (üst + iki yan yüz) ve uçta dört yüzlü ok başı (2B şerit değil)
{const pts=[];for(let i=0;i<=12;i++)pts.push({x:0,y:.11,z:.7+i*.3});   // düz, yatay, +z yönünde 3,6 m
 const tri=D.cizim.okUcgenleri(pts,1),tur=t=>tri.filter(x=>x.tur===t);
 assert(tri.length>=60&&tri.length<=140,'üçgen sayısı makul: '+tri.length);
 for(const t of ['ust','yan','alt','kapak','bas','bas-ust','bas-yan','bas-alt'])assert(tur(t).length>0,t+' yüzleri var');
 // üst yüz yukarı bakar, yan yüzler yatay bakar ve iki yana ters yönde
 assert(tur('ust').every(t=>Math.abs(t.n[1])>.99),'üst yüz yukarı bakar');assert(tur('yan').every(t=>Math.abs(t.n[1])<.05&&Math.abs(t.n[0])>.99),'yan yüzler yatay');
 assert(tur('yan').some(t=>t.v[0][0]>0)&&tur('yan').some(t=>t.v[0][0]<0),'iki yan yüz var (sağ ve sol)');
 // kalınlık: üst ve alt yüzler arası ≈0,12 m; genişlik 0,24 (kuyruk) → 0,40 m (uç)
 const ustY=tur('ust')[0].v[0][1],altY=tur('alt')[0].v[0][1];assert(Math.abs((ustY-altY)-.12)<1e-9,'kalınlık 0,12 m: '+(ustY-altY));
 const xs=tri.filter(t=>t.tur==='ust').flatMap(t=>t.v.map(v=>Math.abs(v[0])));assert(Math.abs(Math.max(...xs)-.20)<1e-9&&Math.abs(Math.min(...xs)-.12)<1e-9,'gövde konik: yarı genişlik 0,12 → 0,20');
 // ok başı gövdeden belirgin geniş (kulakçık) ve uç, yolun devamında (1,15 m ileride)
 const bas=tur('bas')[0].v.map(v=>Math.abs(v[0]));assert(Math.max(...bas)>=.55&&Math.max(...bas)>Math.max(...xs)*2.5,'ok başı kulakçıklı: '+Math.max(...bas));
 const uc=tri.filter(t=>t.tur==='bas-ust')[0].v[2];assert(Math.abs(uc[2]-(pts[12].z+1.15))<1e-9&&Math.abs(uc[0])<1e-9,'uç noktası yolun devamında');
 // eğik yolda (havalanan ok) kalınlık yolun normali yönünde: üst yüz normali yukarıya yakın kalır, yol yükselir
 const yuk=[];for(let i=0;i<=12;i++)yuk.push({x:i*.05,y:.11+i*.12,z:.7+i*.3});const t2=D.cizim.okUcgenleri(yuk,1);assert(t2.filter(t=>t.tur==='ust').every(t=>t.n[1]>.8),'havalanan okta üst yüz hâlâ yukarı bakar');
 // ölçek çarpanı boyutu büyütür
 const b1=D.cizim.okUcgenleri(pts,1.9),xs2=b1.filter(t=>t.tur==='ust').flatMap(t=>t.v.map(v=>Math.abs(v[0])));assert(Math.abs(Math.max(...xs2)-.38)<1e-9,'ölçek çarpanı: '+Math.max(...xs2));
 // çizim: ışıklı yüzler farklı tonda (üst açık, yan koyu, baş en parlak): ok piksellerinde en az 3 farklı parlaklık kümesi + yerde gölge
 const pp=F[1];D.cizim.sahneKur(pp,0);const yl=yol(pp,{x:1,y:1.4},{x:0,y:0}),kr=kare(yl),lum=[];let golge=0;
 for(let i=0;i<kr.length;i+=4){const dr=Math.abs(kr[i]-bos[i])+Math.abs(kr[i+1]-bos[i+1])+Math.abs(kr[i+2]-bos[i+2]);if(dr>60){if(kr[i]>kr[i+2]+40)lum.push(kr[i]);}else{const sk=(kr[i]+kr[i+1]+kr[i+2]),sb=(bos[i]+bos[i+1]+bos[i+2]);if(sb-sk>15&&sb-sk<60&&Math.abs(kr[i]-kr[i+2])<20)golge++;}}
 const kume=new Set(lum.map(v=>Math.floor(v/22)));let dolu=0;const sayac={};lum.forEach(v=>{const k=Math.floor(v/22);sayac[k]=(sayac[k]||0)+1;});for(const k in sayac)if(sayac[k]>=lum.length*.06)dolu++;
 assert(lum.length>800,'ok görünür '+lum.length);assert(dolu>=3,'ışık/gölgeleme: en az 3 belirgin parlaklık kümesi (üst, yan, baş): '+dolu);assert(golge>150,'ok yerde gölge düşürür: '+golge+' piksel');}
const oyun=fs.readFileSync(__dirname+'/../js/cizim.js','utf8');assert(/if \(fifa\) return;/.test(oyun),'hedef halkası frikikte çizilmez');
console.log('PASS FIFA yer oku (3B bant + piramit ok başı, ışık, gölge): kısa ok, falso görünür biçimde iki yana eğer (gösterimde büyütülür), alt temas yükseltir, üst temas yerde, ok görünür ('+duz.n+' px değişti), halka yok');
