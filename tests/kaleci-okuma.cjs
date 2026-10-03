// Kaleci okuma ve denge: orta şut kurtarılır, güzel köşe ve güçlü falso ödüllenir, ayarlar ölü değil.
// Çalıştır: node tests/kaleci-okuma.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const r={};vm.createContext(r);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,pen=D.AYAR.pozisyonlar[0],fk=D.AYAR.pozisyonlar[3];
// Oyuncu gibi: nişan sapması σ=0,15 m, zamanlama sapması σ≈40 ms (çubuk 0,8 s). Tohumlu, tekrarlanabilir.
function rngF(a){return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function oran(pos,x,y,contact,N=200){const rnd=rngF(7),gs=()=>{const u=Math.max(rnd(),1e-9),v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};let gol=0;
 for(let s=1;s<=N;s++){const z=Math.max(0,Math.min(1,.5+gs()*40/800));const o=D.fizik.hesapla({pos,aim:{x:x+gs()*.15,y:Math.max(.12,y+gs()*.15)},contact:contact||{x:0,y:0},zaman:z,seed:s*977,antrenman:false});if(o.sonuc==='gol'||o.sonuc==='direk_gol')gol++;}return gol/N;}
// 1) penaltı: üstüne ve yakınına gelen şut çoğunlukla kurtarılır
for(const [x,y] of [[0,1],[0,.4],[0,2],[.8,1],[1.4,1]])assert(oran(pen,x,y)<=.15,'merkeze yakın şutta gol oranı düşük olmalı: ('+x+';'+y+')');
// 2) kaleci gücü sürekli bir eğri: köşeye yaklaştıkça gol oranı artar
const g22=oran(pen,2.2,1),g27=oran(pen,2.7,1),g31=oran(pen,3.1,1);assert(g22<=g27&&g27<=g31,'gol oranı köşeye doğru azalmamalı: '+[g22,g27,g31]);assert(g31>=.2,'direğe yakın köşe (σ=40 ms insan, orta yükseklik: kalecinin en güçlü yeri) ödüllenmeli: '+g31);const gUst=oran(pen,3.1,1.8);assert(gUst>=.4,'üst köşe daha çok ödüllenmeli: '+gUst);assert(g27<=.15&&g22<=.15,'orta bölge zor (%7 yanlış köşe kararı taban oluşturur): '+[g22,g27]);
// 3) frikik: güçlü falso (yanal temas) kalecinin okumadığı kıvrımla köşeye gider, düz temas gitmez
const kıvrim=oran(fk,-2.4,1,{x:.7,y:0}),duz=oran(fk,-2.4,1,{x:0,y:0});assert(kıvrim>=.6,'güçlü falsolu köşe şutu çoğunlukla gol olmalı: '+kıvrim);assert(duz<=.2,'aynı hedefe düz temas barajda/kalecide kalmalı: '+duz);
// 3b) köşe zamanlama penceresi (yeşil bant 29 ms): kusursuz = gol, 32 ms erken = kurtarış, 96 ms erken = kurtarış
function kose(z){let g=0;for(let s=1;s<=60;s++){const q=D.fizik.hesapla({pos:pen,aim:{x:3.15,y:1.1},zaman:z,seed:s*977,antrenman:false});if(q.sonuc==='gol'||q.sonuc==='direk_gol')g++;}return g/60;}
// %7 yanlış köşe kararı (ortak tohumdan) bir taban oluşturur: yakın/kötü zamanlamada bile ~%7-12 gol
assert(kose(.5)>=.95&&kose(.46)<=.2&&kose(.4)<=.15,'köşe penceresi: '+[kose(.5),kose(.46),kose(.4)]);
// 3c) NEDENSELLİK: kaleci okuma anından sonraki örneklere bakmaz ve okumadan önce hareket etmez
{const R=D.fizik.hesapla({pos:pen,aim:{x:2.9,y:1.1},zaman:.5,seed:5}),pl=R.kaleci,tR=pl.okumaT,yol=R.ucusYol;
 const bozuk=yol.map(o=>o.t>tR+1e-9?{t:o.t,x:o.x+4,y:o.y+2,z:o.z}:o);
 const p2=D.kaleci.planla(R.gecis,'penalti',false,()=>0,R.ucusT,{decision:1,yol:bozuk}),p1=D.kaleci.planla(R.gecis,'penalti',false,()=>0,R.ucusT,{decision:1,yol:yol});
 assert.equal(p1.hedefX,p2.hedefX);assert.equal(p1.hedefY,p2.hedefY);assert.equal(p1.okunanX,p2.okunanX,'okuma yalnızca okuma anına kadarki örneklere bağlı');
 for(let t=0;t<tR;t+=1/120){const k=pl.konum(t);assert(k.x===0&&Math.abs(k.y-1)<1e-12&&k.ilerleme===0,'okumadan önce hareket yok: t='+t.toFixed(3)+' x='+k.x);}
 assert(tR>=pl.tepki&&tR<R.ucusT,'okuma anı tepkiden sonra, top çizgiye gelmeden önce');}
// 4) kaleci, falsoyu önceden bilmez: tahmin edilen nokta ile gerçek çizgi noktası frikikte ayrışır, penaltıda ayrışmaz
function sapma(pos,x,y,contact){let top=0,n=0;for(let s=1;s<=60;s++){const o=D.fizik.hesapla({pos,aim:{x,y},contact,zaman:.5,seed:s*977,antrenman:false});if(o.kaleci.yanlisKose||o.kaleci.merkezHatasi)continue;top+=Math.abs(o.kaleci.okunanX-o.gecis.x);n++;}return top/n;}   // yanlış karar tohumları hariç: yalnızca okuma
assert(sapma(pen,2.5,1,{x:0,y:0})<.15,'düz penaltıda kaleci topu doğru okur');assert(sapma(fk,-2.4,1,{x:.7,y:0})>.4,'falsolu frikikte kaleci kıvrımın bir kısmını göremez');
// 5) ayarlar ölü değil: A.kaleci ve A.antrenman içindeki her anahtar kaynakta kullanılıyor
const kaynak=['kaleci','fizik','oyun','cizim','model3d','baraj'].map(n=>fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8')).join('\n');
for(const k of Object.keys(D.AYAR.kaleci))assert(new RegExp('\\b'+k+'\\b').test(kaynak.replace(/\/\*[\s\S]*?\*\//g,'')),'kullanılmayan kaleci ayarı: '+k);
for(const k of Object.keys(D.AYAR.antrenman))assert(new RegExp('\\b'+k+'\\b').test(kaynak),'kullanılmayan antrenman ayarı: '+k);
console.log('PASS central saves; goal rate rises toward the post (%d/%d/%d at 2.2/2.7/3.1 m); strong side-spin freekick %d%% vs straight %d%%; keeper misreads curl; no dead keeper settings',Math.round(g22*100),Math.round(g27*100),Math.round(g31*100),Math.round(kıvrim*100),Math.round(duz*100));
