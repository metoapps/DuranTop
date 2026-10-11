// Penaltıda "ortaya nişan + falso" artık garanti gol değil (kural 10: antrenman/hedef). Resmi kupa (kural 9) hesabı aynı kalır: orada sınır eski davranışı korur.
const fs=require('fs'),path=require('path'),assert=require('assert');
for(const n of ['ayar','baraj','model3d','kaleci3d','baraj3d','kaleci','ucus','fizik','puan'])(0,eval)(fs.readFileSync(path.join(__dirname,'../js/'+n+'.js'),'utf8'));
const D=globalThis.DT,pos=D.AYAR.pozisyonlar[0];
function oran(k10,aim,cx,cy,N=100){let g=0;for(let s=1;s<=N;s++){const r=D.fizik.hesapla({pos,aim,contact:{x:cx,y:cy},zaman:.5,seed:Math.imul(s,2654435761)^0x77,guc:.9,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:k10,kural10:k10});if(r.sonuc==='gol'||r.sonuc==='direk_gol')g++;}return 100*g/N;}
const merkezFalso=[[{x:0,y:1.2},.6],[{x:0,y:1.2},-.6],[{x:0,y:1.8},.6],[{x:0,y:.8},-.5]];
// Kural 9 (resmi): ortaya falsolu şut hâlâ (eski hesapla) neredeyse her seferinde gol; bu pakette değişmedi.
for(const [aim,cx] of merkezFalso)assert(oran(false,aim,cx,0)>=95,'kural 9 değişmemeli');
// Kural 10: aynı şutlar artık %45-85 arası gol (kaleci yerinde kalıp yana kayabilir, dalışlar kısa kalabilir).
for(const [aim,cx] of merkezFalso){const o=oran(true,aim,cx,0);assert(o>=45&&o<=85,'kural 10 ortaya falsolu şut garanti gol olmamalı: %'+o+' '+JSON.stringify(aim)+' '+cx);}
// Köşe şutları yine daha riskli/ödüllü: sol köşe düz kural 10'da %50-90 arası
const kose=oran(true,{x:-2.9,y:1.2},0,0);assert(kose>=50&&kose<=92,'köşe şutu oranı makul: %'+kose);
console.log('PASS penaltı ortaya+falso: kural 9 ≥%95 (aynı), kural 10 %45-85; köşe %'+kose.toFixed(0));
