// Kaleci yerde sekip yuvarlanan topu okuyabiliyor mu? Kötü zamanlama, sürekli kullanılabilen kolay gol yöntemine dönüşmemeli.
// (Gol oranının zamanlama kötüleştikçe HER ZAMAN düşmesi şart koşulmaz: hatalı vuruş tesadüfen gol olabilir. Şart: kusursuz zamanlamadan 30 puandan fazla iyi bir kötü zamanlama olmasın.)
// node tests/kaleci-yer-topu.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const r={};vm.createContext(r);for(const n of ['ayar','veri','baraj','model3d','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,P=D.AYAR.pozisyonlar,R=D.AYAR.kale.topYaricap,R6={temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,sabitKol:true,gucZorlugu:true};
function oran(idx,aim,c,g,ms,N){let n=0;for(let i=0;i<N;i++){const s=D.fizik.hesapla(Object.assign({pos:P[idx],aim,contact:c,guc:g,zaman:.5+ms/800,seed:1000+i*7919,antrenman:false},R6));if(D.puan.puanla(P[idx].tip,s).gol)n++;}return n/N;}
// 1) okuma pencereleri yer temasını içermez
{const s=D.fizik.hesapla(Object.assign({pos:P[9],aim:{x:3,y:.8},contact:{x:0,y:0},guc:.8,zaman:.5-160/800,seed:1000,antrenman:false},R6));
 const y=s.ucusYol,inis=[];for(let j=4;j<y.length;j++)if(y[j].y<=R+.004&&y[j-1].y>R+.004)inis.push(y[j].t);assert(inis.length>=2,'senaryo yerde sekmeli olmalı');
 for(const g of s.kaleci.gozlemler)for(const t of inis)assert(!(g.t>=t&&g.t<=t+.11),'okuma yer temasından hemen sonraki pencerede yapıldı: t='+g.t+' temas='+t);}
// 2) zamanlama ızgarası
const ms=[-160,-120,-80,80,120,160],N=24;
const set=[['Penaltı (3.2;1.0) g1',0,{x:3.2,y:1},{x:0,y:0},1],['Yakın frikik (3.0;1.4) g.6',5,{x:3,y:1.4},{x:0,y:0},.6],['Yakın frikik (2.4;1.4) g1 c-.3',5,{x:2.4,y:1.4},{x:-.3,y:0},1],['Uzak frikik orta (3.0;0.8) g.8',9,{x:3,y:.8},{x:0,y:0},.8],['Uzak frikik orta (0;2.0) g1',9,{x:0,y:2},{x:0,y:0},1],['Uzak frikik sol (-3.2;1.2) g.8',7,{x:-3.2,y:1.2},{x:0,y:0},.8],['Uzak frikik orta (3.0;0.3) g.6',9,{x:3,y:.3},{x:0,y:0},.6]];
const ozet=[];for(const [ad,idx,aim,c,g] of set){const kus=oran(idx,aim,c,g,0,N),kotu=Math.max(...ms.map(m=>oran(idx,aim,c,g,m,N)));ozet.push(ad+': kusursuz %'+Math.round(kus*100)+', en iyi kötü %'+Math.round(kotu*100));assert(kotu-kus<=.30,'kötü zamanlama kolay gol yöntemi: '+ad+' kusursuz %'+Math.round(kus*100)+' kötü %'+Math.round(kotu*100));}
// 3) bilinen örnek: önceki sürümde −160/−120 ms'de %73/%83 gol
const e160=oran(9,{x:3,y:.8},{x:0,y:0},.8,-160,N),e120=oran(9,{x:3,y:.8},{x:0,y:0},.8,-120,N);assert(e160<=.25&&e120<=.25,'yerde yuvarlanan top sürekli gol: '+e160+' '+e120);
console.log('PASS ground-contact windows are never used for keeper reads; no timing error beats perfect timing by >30 points across 7 strategies; slow rolling shot is no longer a free goal ('+Math.round(e160*100)+'%/'+Math.round(e120*100)+'% vs 73%/83% before)');
