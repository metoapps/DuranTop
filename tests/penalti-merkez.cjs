// Kural 14: penaltıda ortaya atmak artık "her zaman gol" değil. Kural 13'te kupada ortası her güçte %100 gol oluyordu (kaleci %8 yerinde kalıyor, kalınca topa kaymıyordu).
// Kural 14: kaleci %38 yerinde kalır ve topu görüp kayar. Ölçüt: ortası ≤ %80 ve en iyi köşeden en çok 5 puan fazla; toplam gol oranı gerçek penaltılara yakın (%60–80).
// Kural 13 (kaleciV14 yok) aynen kalır: eski kupa kayıtları ve kural 13 istemcileri değişmez.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const root={DT:{}};vm.createContext(root);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT,P=D.AYAR.pozisyonlar;
function g(aim,guc,zaman,seed,ek){return D.fizik.hesapla(Object.assign({pos:P[0],aim:{x:aim[0],y:aim[1]},contact:{x:0,y:0},falso:0,zaman,seed,guc,durus:0,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:false,falsoDenge:true,akilliFrikik:true,kaleciV13:true,direkFizigi:true},ek));}
const Z={merkez:[[0,1.0]],'merkez alçak':[[0,.4]],'merkez üst':[[0,2.0]],'yan orta':[[2.6,1.2],[-2.6,1.2]],'üst köşe':[[3.0,2.0],[-3.0,2.0]],'alt köşe':[[3.0,.35],[-3.0,.35]]};
function oran(ek){const o={};let tg=0,tn=0;for(const [ad,aims] of Object.entries(Z)){let gol=0,n=0;for(const a of aims)for(const guc of [.55,.7,.85,1])for(const z of [.5,.45,.55])for(let s=1;s<=25;s++){const r=g(a,guc,z,s,ek);n++;if(r.sonuc==='gol'||r.sonuc==='direk_gol')gol++;}o[ad]=gol/n;tg+=gol;tn+=n;}o.toplam=tg/tn;return o;}
for(const [ad,ek] of [['kupa (kural 14)',{kaleciV14:true,balistikDalis:true}],['antrenman/diğer modlar',{kaleciV14:true,balistikDalis:true,kural10:true}]]){const o=oran(ek),kose=Math.max(o['yan orta'],o['üst köşe'],o['alt köşe']);
 for(const m of ['merkez','merkez alçak','merkez üst']){assert(o[m]<=.80,ad+': '+m+' en çok %80 gol: %'+Math.round(100*o[m]));assert(o[m]<=kose+.05,ad+': '+m+' en iyi köşeden belirgin kolay değil: %'+Math.round(100*o[m])+' vs %'+Math.round(100*kose));}
 assert(o.toplam>=.60&&o.toplam<=.80,ad+': toplam gol oranı gerçekçi (%'+Math.round(100*o.toplam)+')');console.log('  '+ad+': '+Object.entries(o).map(([k,v])=>k+' %'+Math.round(100*v)).join(', '));}
// Kural 13 değişmedi: aynı girdiyle aynı sonuçlar (kaleciV14 bayrağı yokken)
{const once=oran({});assert.equal(Math.round(100*once.merkez),100,'kural 13 (eski kayıtlar) aynen: ortası %100 kalır (geri uyumluluk)');}
console.log('PASS penaltı merkez açığı kapandı (kural 14); kural 13 eski kayıtlar için aynen');
