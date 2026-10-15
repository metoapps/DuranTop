// Rüzgâr (antrenman/hedef; kupada yok): üretim (tohum, dağılım), fizik (yan/boyuna etki, yerde yok, kural 9 aynı), HUD göstergesi, bayrak/flama yatışı.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={DT:{}};vm.createContext(r);for(const n of ['ayar','ruzgar','model3d','baraj','kaleci','ucus','fizik','hedef','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);const D=r.DT,P=D.AYAR.pozisyonlar,R=D.ruzgar;
// 1) Üretim
{assert.deepEqual(R.uret(5),R.uret(5),'aynı tohum aynı rüzgâr');assert.notDeepEqual(R.uret(5),R.uret(6));let durgun=0,orta=0,sert=0,mx=0,tutarli=true,yonler=[0,0,0,0];const N=20000;
 for(let s=0;s<N;s++){const w=R.uret(s*7919+13);mx=Math.max(mx,w.hiz);if(Math.abs(Math.hypot(w.vx,w.vz)-w.hiz)>.15)tutarli=false;const sv=R.seviye(w);if(sv==='durgun')durgun++;else if(sv==='orta')orta++;else sert++;yonler[(w.vx>=0?1:0)+(w.vz>=0?2:0)]++;assert(R.okAcisi(w)>=-180&&R.okAcisi(w)<=180);}
 assert(tutarli&&mx<=6.5,'bileşenler tutarlı, en çok 6,5 m/sn: '+mx);assert(durgun/N>.14&&durgun/N<.26&&sert/N>.19&&sert/N<.31&&orta/N>.45,'dağılım: durgun %'+(100*durgun/N).toFixed(0)+' orta %'+(100*orta/N).toFixed(0)+' sert %'+(100*sert/N).toFixed(0));assert(yonler.every(v=>v/N>.18),'her yönden eser: '+yonler.join());}
// 2) Fizik
const G=(pi,w,k10,guc,aim)=>D.fizik.hesapla({pos:P[pi],aim:aim||{x:0,y:1.3},contact:{x:0,y:0},zaman:.5,seed:3,guc:guc||.9,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:true,kural10:k10!==false,ruzgar:w});
for(const [pi,ad,aralik] of [[0,'penaltı',[.05,.30]],[5,'18 m',[.30,.65]],[9,'28 m',[.8,1.5]]]){const b=G(pi);const s=G(pi,[6,0]),n=G(pi,[-6,0]);
 const dx=s.gecis.x-b.gecis.x,dn=n.gecis.x-b.gecis.x;assert(dx>aralik[0]&&dx<aralik[1],ad+': 6 m/sn yan rüzgâr sapması '+dx.toFixed(2));assert(Math.abs(dx+dn)<.12,ad+': iki yön simetrik');
 assert.equal(JSON.stringify(G(pi,undefined).gecis),JSON.stringify(b.gecis),'rüzgâr yoksa aynı');assert.equal(JSON.stringify(G(pi,[0,0]).gecis),JSON.stringify(b.gecis),'sıfır rüzgâr = rüzgâr yok');}
{const b=G(9),arka=G(9,[0,6]),karsi=G(9,[0,-6]);assert(arka.ucusT<b.ucusT&&karsi.ucusT>b.ucusT,'arka rüzgâr topu hızlandırır, karşı yavaşlatır');assert(arka.gecis.y>b.gecis.y&&karsi.gecis.y<b.gecis.y,'arka rüzgâr yüksek, karşı rüzgâr alçak geçirir ('+arka.gecis.y.toFixed(2)+' / '+karsi.gecis.y.toFixed(2)+')');assert(Math.abs(arka.gecis.x-b.gecis.x)<.05,'boyuna rüzgâr yana saptırmaz');}
// kural 9 / kupa: bayraksız çağrıda rüzgâr hiçbir şey değiştirmez
for(const pi of [0,5,9]){const a=G(pi,undefined,false),b=G(pi,[6,3],false);assert.equal(JSON.stringify(a),JSON.stringify(b),'kural 10 kapalıyken rüzgâr yok sayılır');}
// hedef ağı uçuşu da rüzgârdan etkilenir
{const hp=D.hedef.pozisyonlar[1],h=D.hedef.delikler[1],gh=(w)=>D.hedef.hesapla({pos:hp,aim:{x:h.x,y:h.y},contact:{x:0,y:0},zaman:.5,seed:3,guc:.9,kural10:true,antrenman:true,ruzgar:w});assert(Math.abs(gh([6,0]).gecis.x-gh().gecis.x)>.1,'hedef ağında rüzgâr sapması');}
// 3) Bayraklar ve flamalar rüzgârla yatar (görüntü): aynı kare, farklı rüzgâr → farklı piksel; ters yön farklı; rüzgâr yokken değişmez
{const rt={DT:{AYAR:{hareket:true}},matchMedia:()=>({matches:false})};vm.createContext(rt);vm.runInContext(fs.readFileSync(__dirname+'/../js/tribun.js','utf8'),rt);const T=rt.DT.tribun;
 const kare=(w,t)=>{const cv=C.createCanvas(390,200),g=cv.getContext('2d');g.fillStyle='#223';g.fillRect(0,0,390,200);T.atmosfer(g,{W:390,ust:35,alt:150,time:t,makeCanvas:(a,b)=>C.createCanvas(a,b),kalite:0,ruzgar:w});return Uint8ClampedArray.from(g.getImageData(0,0,390,200).data);};
 const fark=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)n++;return n;};
 const yok=kare(null,3.3),sag=kare([6,0],3.3),sol=kare([-6,0],3.3);assert(fark(yok,sag)>400,'sağ rüzgâr bayrakları değiştirir '+fark(yok,sag));assert(fark(sag,sol)>600,'ters rüzgâr farklı görünür '+fark(sag,sol));assert.equal(fark(yok,kare([0,0],3.3)),0,'sıfır rüzgâr = rüzgâr yok');assert.equal(fark(sag,kare([6,0],3.3)),0,'aynı rüzgâr aynı kare');}
console.log('PASS rüzgâr: üretim (tohum, dağılım), fizik, HUD ve bayraklar');
