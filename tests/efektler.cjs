// Görsel efektler: hız balonu (km/sa), konfeti (gol sonrası), top izi (hızlı top). Kademeli kalite: konfeti 150/70/0, top izi kademe 2'de yok.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
let now=1000;const root={setTimeout,clearTimeout,Image:C.Image,__yapCanvas:C.createCanvas,performance:{now:()=>now},localStorage:{getItem(){return null},setItem(){}},location:{search:''}};vm.createContext(root);
for(const n of ['ayar','perf','ruzgar','bonus','veri','model3d','kaleci3d','baraj3d','baraj','kaleci','ucus','fizik','hedef','ag','futbolcu3d','sevinc','tribun','tezahurat','cizim'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
const D=root.DT,W=390,H=844,cv=C.createCanvas(W,H),g=cv.getContext('2d');D.AYAR.hareket=false;D.cizim.kur(cv,W,H,1);const pos=D.AYAR.pozisyonlar[5];D.cizim.sahneKur(pos,0);
const top0={x:pos.bx,y:.11,z:0};
function kare(ek,x0,y0,w,h){now=1000+5000;D.cizim.ciz(Object.assign({top:top0},ek));return Uint8ClampedArray.from(g.getImageData(x0||0,y0||0,w||W,h||H).data);}
const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
const turuncu=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>230&&f[i+1]>80&&f[i+1]<150&&f[i+2]<110)n++;return n;},beyaz=(f)=>{let n=0;for(let i=0;i<f.length;i+=4)if(f[i]>235&&f[i+1]>235&&f[i+2]>235)n++;return n;};
D.perf.sabitle(0);
// 1) Hız balonu
{const bos=kare({}),b60=kare({hizBalon:{km:60,t:.5}}),b120=kare({hizBalon:{km:123,t:.5}}),gec=kare({hizBalon:{km:123,t:1.4}}),son=kare({hizBalon:{km:123,t:1.7}}),pop=kare({hizBalon:{km:123,t:.02}});
 assert(fark(bos,b120)>900,'hız yazısı çizilir: '+fark(bos,b120));assert(turuncu(b120)>turuncu(b60)+200,'120+ km/sa turuncu-kırmızı: '+turuncu(b60)+' → '+turuncu(b120));assert(beyaz(b60)>beyaz(bos)+200,'düşük hız beyaz');
 assert(fark(bos,gec)<fark(bos,b120)&&fark(bos,gec)>50,'sönerken zayıflar');assert.equal(fark(bos,son),0,'1,6 sn sonra yok');assert(fark(b120,pop)>400,'başlangıçta büyük (pop)');
 // yazı ekranın üst-orta bölgesinde
 const ust=kare({hizBalon:{km:123,t:.5}},0,0,W,300),altb=kare({hizBalon:{km:123,t:.5}},0,500,W,300),altb0=kare({},0,500,W,300);assert(fark(ust,kare({},0,0,W,300))>900&&fark(altb,altb0)===0,'yazı üst-orta bölgede');}
// 2) Konfeti
{const bos=kare({}),k0=kare({konfeti:{t:1.5,tohum:5}}),k2=kare({konfeti:{t:1.5,tohum:5}});assert(fark(bos,k0)>1500,'konfeti çizilir: '+fark(bos,k0));assert.equal(fark(k0,k2),0,'aynı tohum aynı kare');assert(fark(k0,kare({konfeti:{t:1.5,tohum:6}}))>1500,'farklı tohum farklı dökülme');
 assert.equal(fark(bos,kare({konfeti:{t:4.6,tohum:5}})),0,'4,5 sn sonra yok');assert(fark(bos,kare({konfeti:{t:.1,tohum:5}}))<fark(bos,kare({konfeti:{t:2,tohum:5}})),'zamanla dolar');
 // renkli parçalar: sarı, kırmızı-pembe, yeşil, mavi hepsi görünür
 let renk=new Set();for(let i=0;i<k0.length;i+=4){const r=k0[i],gg=k0[i+1],b=k0[i+2];if(Math.abs(r-bos[i])+Math.abs(gg-bos[i+1])+Math.abs(b-bos[i+2])<80)continue;if(r>230&&gg>190&&b<110)renk.add('sari');if(r>220&&gg<110&&b>80&&b<150)renk.add('pembe');if(r<40&&gg>190&&b>140&&b<190)renk.add('yesil');if(r<40&&gg>110&&gg<160&&b>160)renk.add('mavi');}
 assert(renk.size>=3,'çok renkli: '+[...renk]);
 D.perf.sabitle(1);const bos1=kare({}),k1=kare({konfeti:{t:1.5,tohum:5}});D.perf.sabitle(2);const bos2=kare({}),kd=kare({konfeti:{t:1.5,tohum:5}});D.perf.sabitle(0);
 assert(fark(bos1,k1)<fark(bos,k0)*.8&&fark(bos1,k1)>300,'kademe 1: daha az parça '+fark(bos1,k1)+' < '+fark(bos,k0));assert.equal(fark(bos2,kd),0,'kademe 2: konfeti yok');}
// 3) Top izi: hızlı top (ekranda kareler arası >3 px) arkasında açık renkli şerit bırakır; AYAR.topIzi=false, kademe 2 ve duran topta yok
{const y=[];for(let i=0;i<=40;i++)y.push({x:pos.bx+.4*i/40,y:.6+.5*Math.sin(i/40*Math.PI),z:.5+i*.3});
 function ucus(izli,adim,kademe){D.AYAR.topIzi=izli;D.perf.sabitle(kademe||0);D.cizim.sahneKur(pos,0);for(let i=0;i<adim;i++){now+=16;D.cizim.ciz({top:y[i],zaman:.1+i*.016});}now+=16;D.cizim.ciz({top:y[adim],zaman:.1+adim*.016});return Uint8ClampedArray.from(g.getImageData(0,0,W,H).data);}
 const izli=ucus(true,20),izsiz=ucus(false,20);const a=fark(izli,izsiz);assert(a>60,'iz var: '+a+' piksel');
 const q=D.cizim.izdus(y[20].x,y[20].y,y[20].z);let alt=0,ust=0,acik=0;for(let i=0;i<izli.length;i+=4)if(Math.abs(izli[i]-izsiz[i])+Math.abs(izli[i+1]-izsiz[i+1])+Math.abs(izli[i+2]-izsiz[i+2])>30){const py=Math.floor(i/4/W);if(py>q.y+1)alt++;else if(py<q.y-14)ust++;if(izli[i]>izsiz[i]&&izli[i+2]>izsiz[i+2])acik++;}
 assert(alt>ust*4&&alt>40,'iz topun arkasında (ekranda aşağıda): alt '+alt+' / üst '+ust);assert(acik>alt*.6,'iz açık renkli: '+acik+'/'+alt);
 assert.equal(fark(ucus(true,20,2),ucus(false,20,2)),0,'kademe 2: iz yok');
 D.AYAR.topIzi=true;D.perf.sabitle(0);D.cizim.sahneKur(pos,0);for(let i=0;i<20;i++){now+=16;D.cizim.ciz({top:y[i],zaman:.2});}now+=400;D.cizim.ciz({top:y[20],zaman:0});const dur=Uint8ClampedArray.from(g.getImageData(0,0,W,H).data);D.AYAR.topIzi=false;D.cizim.sahneKur(pos,0);now+=16;D.cizim.ciz({top:y[20],zaman:0});const ref=Uint8ClampedArray.from(g.getImageData(0,0,W,H).data);assert.equal(fark(dur,ref),0,'zaman 0 iken iz yok');D.AYAR.topIzi=true;}
D.perf.sabitle('auto');
// 4) Oyun entegrasyonu
{const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/out\.hizBalon = \{ km: Math\.round\(r\.speed \* 3\.6\), t: simT \}/.test(oyun)&&/out\.konfeti = \(d\.konfetiT0/.test(oyun)&&/d\.konfetiT0 = now; d\.alayT0 = now/.test(oyun),'oyun hız balonu ve konfeti verir');}
console.log('PASS efektler: hız balonu (renk eşiği, sönme), konfeti (150/70/0 parça, deterministik, 4,5 sn), top izi (arkada, durunca yok, kademe 2 yok)');
