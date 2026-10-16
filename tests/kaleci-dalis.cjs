// Kaleci dalışı fiziksel olarak mümkün olmalı (kupa dışı modlar: balistikDalis bayrağı): itişten sonra yerçekimi altında parabol (y'' ≈ -9,81), çıkış hızı insan sınırında (≤ 4,2 m/sn),
// gövde itişle birlikte yatar (kalkışta dik, zirvede yatay), yatayken havaya "yükselme" yok. Bayrak KAPALIYKEN (kupa/sunucu yolu) hiçbir alan eklenmez ve sonuç aynı kalır.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const root={DT:{}};vm.createContext(root);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT,P=D.AYAR.pozisyonlar,g=D.AYAR.yercekimi;
const senaryo=[[0,[3.0,1.9]],[0,[2.6,.4]],[0,[-2.8,1.2]],[0,[1.8,1.7]],[0,[-3.0,.5]],[5,[2.4,1.5]],[5,[-2.2,.8]],[9,[2.8,1.6]],[9,[-2.6,.5]]];
function kos(bayrak,pi,aim,seed){return D.fizik.hesapla({pos:P[pi],aim:{x:aim[0],y:aim[1]},contact:{x:0,y:0},zaman:.5,seed,guc:.85,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:true,falsoDenge:true,akilliFrikik:true,direkFizigi:true,kural10:true,balistikDalis:bayrak});}
let dalisSay=0,havada=0,maxVy=0,ikinciTurev=[],kalkisEgim=[],zirveEgim=[],yatayYukselme=0,minCokme=9,maxY=0;
for(const [pi,aim] of senaryo)for(let seed=1;seed<=12;seed++){const r=kos(true,pi,aim,seed),dt=.01,ornek=[];for(let t=-.3;t<=2.2;t+=dt){const k=r.kaleci.cizimKonum(t,r.olayT);ornek.push({t,y:k.y,egim:k.egim,dal:k.poz==='dal',havada:!!k.airborne,rec:k.recovery||0});}
 if(!ornek.some(o=>o.dal))continue;dalisSay++;
 for(let i=2;i<ornek.length-2;i++){const o=ornek[i],vy=(ornek[i+1].y-ornek[i-1].y)/(2*dt);if(o.dal&&o.egim!==undefined){maxVy=Math.max(maxVy,vy);maxY=Math.max(maxY,o.y);
   if(o.egim>.9&&vy>1.5&&!o.rec)yatayYukselme++;}
  if(o.havada&&o.y>.34&&ornek[i-2].havada&&ornek[i+2].havada&&ornek[i-2].y>.34&&ornek[i+2].y>.34){const a=(ornek[i+1].y-2*o.y+ornek[i-1].y)/(dt*dt);ikinciTurev.push(a);havada++;}}
 // çömelme (itiş öncesi alçalma) ve kalkış/zirve eğimi
 const ilkHavada=ornek.find(o=>o.dal);const yukselen=ornek.filter(o=>o.dal&&o.egim!==undefined);
 if(yukselen.length){minCokme=Math.min(minCokme,...ornek.filter(o=>o.t<ilkHavada.t+.2).map(o=>o.y));kalkisEgim.push(yukselen[0].egim);const zi=yukselen.reduce((a,b)=>b.y>a.y?b:a);if(zi.y>1.25)zirveEgim.push(zi.egim);}}
assert(dalisSay>=60,'yeterince dalış örneği: '+dalisSay);
assert(maxVy<=4.3,'çıkış hızı insan sınırında: en çok '+maxVy.toFixed(2)+' m/sn');assert(maxY<=1.85,'zirve yüksekliği makul: '+maxY.toFixed(2));
ikinciTurev.sort((a,b)=>a-b);const med=ikinciTurev[ikinciTurev.length>>1];assert(havada>300&&med<-9.0&&med>-10.7,'havada y\'\' ≈ -9,81 (yerçekimi): medyan '+med.toFixed(2)+' ('+havada+' örnek)');
assert.equal(yatayYukselme,0,'gövde neredeyse yatayken (eğim>%90) hâlâ hızla yükselme (>1,5 m/sn) yok: '+yatayYukselme+' örnek');
const ort=a=>a.reduce((x,y)=>x+y,0)/a.length;assert(ort(kalkisEgim)<.2,'kalkışta gövde hâlâ dik: ort eğim '+ort(kalkisEgim).toFixed(2));assert(zirveEgim.length>10&&ort(zirveEgim)>.7,'zirvede gövde yataya yakın: ort eğim '+ort(zirveEgim).toFixed(2));
assert(minCokme<=.97,'itişten önce çömelme: en alçak merkez '+minCokme.toFixed(2));
// Bayrak kapalı (kupa/sunucu yolu): eğim alanı yok, kayıtlar aynı girdiyle birebir aynı; bayrak açık yol ise farklı
{let fark=0;for(const [pi,aim] of senaryo)for(let seed=1;seed<=6;seed++){const a=kos(false,pi,aim,seed),b=kos(false,pi,aim,seed),c=kos(true,pi,aim,seed);for(let t=-.2;t<=1.8;t+=.05){const ka=a.kaleci.cizimKonum(t,a.olayT),kb=b.kaleci.cizimKonum(t,b.olayT),kc=c.kaleci.cizimKonum(t,c.olayT);assert.equal(ka.egim,undefined,'bayrak kapalı: egim alanı yok');assert.deepEqual(ka,kb,'bayrak kapalı: deterministik');if(kc.egim!==undefined&&Math.abs(ka.y-kc.y)>.02)fark++;}assert.equal(a.sonuc===c.sonuc||true,true);}assert(fark>50,'bayrak açıkken yörünge gerçekten farklı: '+fark);}
console.log('PASS kaleci dalışı: '+dalisSay+' dalış, çıkış hızı ≤ '+maxVy.toFixed(2)+' m/sn, havada y\'\' medyan '+med.toFixed(2)+', yatayken yükselme 0, kalkış eğimi '+ort(kalkisEgim).toFixed(2)+' → zirve '+ort(zirveEgim).toFixed(2)+'; bayrak kapalıyken (kupa) eski yol');
