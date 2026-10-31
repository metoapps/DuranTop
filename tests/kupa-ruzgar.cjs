// Kural 15 (kupa rüzgârı): eski kurallar (≤14) bit düzeyinde aynı, rüzgâr topu gerçekten sapar, rüzgâr oda+vuruştan belirlenir, sunucu yalnız yeni haftada kural 15 ister.
const vm=require('vm'),fs=require('fs'),assert=require('assert'),cp=require('child_process');
const DOSYA=['ayar','ruzgar','model3d','baraj','kaleci','ucus','fizik','puan'];
function yukle(oku){const root={};vm.createContext(root);for(const n of DOSYA)vm.runInContext(oku(n),root);return root.DT;}
const yeni=yukle(n=>fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'));
const eski=yukle(n=>n==='ruzgar'&&false?'':cp.execFileSync('git',['show','62e82cb:js/'+n+'.js'],{cwd:__dirname+'/..',encoding:'utf8',maxBuffer:1<<26}));
const bayrak={temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,falsoDenge:true,akilliFrikik:true,kaleciV13:true,kaleciV14:true,balistikDalis:true,direkFizigi:true,sabitKol:true,antrenman:false};
function girdi(DT,i,ek){const pos=DT.AYAR.pozisyonlar[i%10];return Object.assign({pos,aim:{x:((i*37)%60-30)/10,y:.4+((i*13)%20)/10},contact:{x:((i*11)%9-4)/10,y:((i*7)%9-4)/10},zaman:.4+((i*17)%20)/100,seed:(i*2654435761)|0,guc:.5+((i*29)%50)/100,durus:0},bayrak,ek||{});}
// 1) Kural ≤14: yeni kod, eski kodla birebir aynı sonucu verir (ruzgarKupa yok).
let kontrol=0;for(let i=0;i<40;i++){const a=JSON.stringify(eski.fizik.hesapla(girdi(eski,i))),b=JSON.stringify(yeni.fizik.hesapla(girdi(yeni,i)));assert.equal(a,b,'kural 14 değişti: örnek '+i);kontrol++;}
// 2) Rüzgâr topu gerçekten sapar (frikik 28 m orta, 6 m/sn yan rüzgâr), sıfır rüzgâr kuralsız yoldan farklı ama makul.
const f=9,g0=yeni.fizik.hesapla(girdi(yeni,f)),g1=yeni.fizik.hesapla(girdi(yeni,f,{ruzgarKupa:[6,0]})),g2=yeni.fizik.hesapla(girdi(yeni,f,{ruzgarKupa:[-6,0]}));
const x=r=>r.ucusYol[r.ucusYol.length-1].x;
assert(Math.abs(x(g1)-x(g0))>.4,'+6 m/sn yan rüzgâr topu sapmalı: '+(x(g1)-x(g0)));assert(x(g1)>x(g2)+.8,'zıt rüzgârlar zıt yöne sapar');
const pg=Object.assign(girdi(yeni,0),{guc:1}),p=yeni.fizik.hesapla(Object.assign({},pg,{ruzgarKupa:[6,0]})),p0=yeni.fizik.hesapla(pg),pd=Math.abs(x(p)-x(p0));assert(pd>.05&&pd<.4,'tam güç penaltıda 6 m/sn yan rüzgâr ~0,2 m saptırır: '+pd);
// 3) Rüzgâr oda+vuruştan deterministik; vuruşa göre değişir; hız sınırlı.
const w=yeni.ruzgar.kupa('oda-1',3);assert.deepEqual(w,yeni.ruzgar.kupa('oda-1',3));assert.notDeepEqual(w,yeni.ruzgar.kupa('oda-1',4));assert.notDeepEqual(w,yeni.ruzgar.kupa('oda-2',3));
let maks=0,sert=0;for(let i=0;i<300;i++){const r=yeni.ruzgar.kupa('oda-x',i);maks=Math.max(maks,r.hiz);if(r.hiz>=4)sert++;}assert(maks<=6.5+1e-9);assert(sert>30&&sert<130,'sert rüzgâr oranı ~%25: '+sert);
// 4) Sunucu: kural 15 yalnız 2026-11-02 haftasından itibaren; rüzgâr sunucuda aynı fonksiyondan, fizik çağrısına geçer.
const ts=fs.readFileSync(__dirname+'/../backend/index.ts','utf8'),cl=fs.readFileSync(__dirname+'/../js/canli.js','utf8'),oy=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');
assert(/RUZGAR_HAFTASI='2026-11-02',kural=\(\)=>weekKey\(\)>=RUZGAR_HAFTASI\?15:14/.test(ts),'kural 15 yeni haftada başlar');assert(/kurallar:kural\(\)/.test(ts));assert(/b\.rules===15&&kural\(\)>=15/.test(ts),'kural 15 vuruşu yalnız yeni haftada kabul');
assert(/D\.ruzgar\.kupa\(r\.id,b\.idx\)/.test(ts)&&/ruzgarKupa:rz/.test(ts),'sunucu rüzgârı oda+vuruştan hesaplar');assert(/import '\.\.\/js\/ruzgar\.js'/.test(ts));
assert(/kurallar>=15\)\?15:/.test(cl),'istemci kural 15i yalnız sunucu bildirirse gönderir');assert(/DT\.ruzgar\.kupa\(DT\.live\.getState\(\)\.room\.id,\(d\.oyunNo\|\|0\)\*VURUS_SAYISI\+d\.idx\)/.test(oy),'istemci rüzgârı sunucuyla aynı oda+vuruştan üretir');
console.log('PASS kupa rüzgârı (kural 15): '+kontrol+' örnekte kural 14 bit düzeyinde aynı, yan rüzgâr topu '+(x(g1)-x(g0)).toFixed(2)+' m saptırır, rüzgâr oda+vuruştan deterministik, sunucu yeni haftada başlatır');
