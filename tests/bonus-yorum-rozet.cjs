// Bonus (altın bölge, seri çarpanı), yorumcu bandı ve rozetler: saf mantık.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function dunya(){const depo={};const r={DT:{},localStorage:{getItem:k=>depo[k]===undefined?null:depo[k],setItem:(k,v)=>{depo[k]=String(v);}}};vm.createContext(r);for(const n of ['bonus','yorum','rozet'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);return{D:r.DT,depo,r};}
const {D}=dunya(),B=D.bonus;
// 1) Altın bölge: tohumdan, ağırlıklı, geçerli dikdörtgenler
{assert.deepEqual(B.altinUret(5),B.altinUret(5));const say={};for(let s=0;s<6000;s++){const z=B.altinUret(s*131+7);assert(z.x1<z.x2&&z.y1<z.y2&&z.x1>=-3.66&&z.x2<=3.66&&z.y1>=0&&z.y2<=2.44&&z.bonus>=3&&z.bonus<=4);say[z.ad]=(say[z.ad]||0)+1;}
 assert.equal(Object.keys(say).length,6,'6 bölgenin hepsi çıkar');assert((say['Sol üst köşe']+say['Sağ üst köşe'])>(say['Alt orta']*3),'köşeler daha sık');
 const z=B.BOLGELER[0];assert(B.icinde(z,-3,2)&&!B.icinde(z,0,1)&&!B.icinde(z,-3,1)&&!B.icinde(z,NaN,2)&&!B.icinde(null,0,0),'içinde testi');assert(B.icinde(z,-3.66,2.44)&&B.icinde(z,-2.2,1.5),'sınırlar dahil');}
// 2) Seri çarpanı ve puan
{assert.deepEqual([1,2,3,4,5,9].map(B.seriCarpan),[1,1.25,1.5,2,2,2]);const durum={seri:0},p0={puan:5,taban:5,zaman:0,zor:0,gol:true},bolge=B.BOLGELER[0];
 const a=B.uygula(p0,{gol:true,x:0,y:1},durum,bolge);assert.equal(a.puan,5);assert.equal(a.seri,1);assert.equal(a.altin,0);assert.equal(a.seriEk,0);
 const b=B.uygula(p0,{gol:true,x:-3,y:2},durum,bolge);assert.equal(b.altin,4,'altın bölge +4');assert.equal(b.carpan,1.25);assert.equal(b.seriEk,Math.round(9*.25));assert.equal(b.puan,9+Math.round(9*.25));assert.equal(durum.seri,2);
 const c=B.uygula(p0,{gol:true,x:0,y:1},durum,bolge);assert.equal(c.carpan,1.5);assert.equal(c.puan,5+Math.round(5*.5));
 const d=B.uygula(p0,{gol:true,x:0,y:1},durum,bolge);assert.equal(d.carpan,2);assert.equal(d.puan,10);
 const e=B.uygula({puan:0,gol:false},{gol:false,x:0,y:0},durum,bolge);assert.equal(e.puan,0);assert.equal(durum.seri,0,'kaçan şut seriyi sıfırlar');assert.equal(e.seri,0);
 const f=B.uygula(p0,{gol:true,x:0,y:1},durum,null);assert.equal(f.altin,0,'bölge yoksa altın yok (hedef ağı)');assert.equal(f.puan,5);assert.equal(p0.puan,5,'girdi nesnesi değişmez');}
// 3) Yorumcu bandı
{const Y=D.yorum,hepsi=new Set();for(const s of ['gol','direk_gol','kurtaris','direk_disari','aut','kisa','baraj','delik','halka','ag'])for(let t=0;t<200;t++){const m=Y.uret({sonuc:s,gol:s==='gol'||s==='direk_gol'||s==='delik',km:80},t);assert(typeof m==='string'&&m.length>8&&m.length<80,s+': '+m);hepsi.add(s+'|'+m);assert.equal(Y.uret({sonuc:s,gol:s==='gol'||s==='delik',km:80},t),m,'aynı tohum aynı cümle');}
 for(const s of Object.keys(Y.HAVUZ))assert(new Set([...hepsi].filter(x=>x.startsWith(s+'|'))).size>=2,s+': çeşitli cümleler');
 assert(/Altın bölge/.test(Y.uret({sonuc:'gol',gol:true,altin:4,km:90},1)),'altın bölge öne çıkar');let hiz=0;for(let t=0;t<100;t++)if(/km\/sa/.test(Y.uret({sonuc:'gol',gol:true,km:122},t)))hiz++;assert(hiz>40,'yüksek hızda hız cümlesi sık: '+hiz);
 let seri=0,ruz=0;for(let t=0;t<100;t++){if(/Seri bozulmuyor/.test(Y.uret({sonuc:'gol',gol:true,km:90,seri:5},t)))seri++;if(/Rüzgâr bahane/.test(Y.uret({sonuc:'aut',gol:false,ruzgar:{hiz:5}},t)))ruz++;}assert(seri>35&&ruz>35,'seri ve rüzgâr yorumları');}
// 4) Rozetler
{const {D:D2,depo}=dunya(),R=D2.rozet;R.sifirla();R.turBasla();const gol=(o)=>R.vurus(Object.assign({gol:true,sonuc:'gol',tip:'penalti',km:90,falso:false,ruzgarHiz:0,altin:0,seri:1,x:0,y:1},o||{}));
 assert.deepEqual(gol(),['ilkgol']);assert.deepEqual(gol(),[],'aynı rozet tekrar verilmez');assert.deepEqual(gol({km:118}),['hiz']);assert.deepEqual(gol({km:50}),['yavas']);assert.deepEqual(gol({x:-3.2,y:2.0}),['kose']);assert.deepEqual(gol({x:-3.2,y:1.0}),[],'alt köşe köşe rozeti vermez');assert.deepEqual(gol({sonuc:'direk_gol'}),['direk']);assert.deepEqual(gol({ruzgarHiz:5}),['ruzgar']);assert.deepEqual(gol({seri:5}),['seri5']);
 assert.deepEqual(gol({altin:4}).concat(gol({altin:4}),gol({altin:4})),['altin3']);
 R.turBasla();assert.deepEqual(gol({falso:true}).concat(gol({falso:true}),gol({falso:true})),['falso']);R.turBasla();gol({tip:'frikik'});gol({tip:'frikik'});assert.deepEqual(gol({tip:'frikik'}),['frikik3']);R.turBasla();gol({sonuc:'delik',tip:'hedef'});gol({sonuc:'delik',tip:'hedef'});assert.deepEqual(gol({sonuc:'delik',tip:'hedef'}),['delik3']);
 assert.deepEqual(R.vurus({gol:false,sonuc:'aut',tip:'penalti',km:90,seri:0,x:0,y:0}),[],'kaçan şut rozet vermez');
 assert.deepEqual(R.turSonu({puan:80,vurus:10,gol:10}),['mukemmel']);assert.deepEqual(R.turSonu({puan:40,vurus:10,gol:9}),[]);const ist=R.istatistik();assert.equal(ist.enSertKm,118);assert.equal(ist.enUzunSeri,5);assert.equal(ist.enIyiTur,80);assert.equal(ist.tur,2);assert(ist.gol>10&&ist.vurus>ist.gol);
 // kalıcılık: yeniden yüklenince korunur
 R._yenile();const k=R.liste();assert.equal(k.length,12);assert(k.every(x=>x.id&&x.ad&&x.ikon&&x.ipucu));assert.equal(k.filter(x=>x.kazanildi).length,12,'hepsi kazanıldı ve saklandı: '+k.filter(x=>x.kazanildi).map(x=>x.id));assert.equal(R.istatistik().enSertKm,118);assert(depo.dt_rozet);
 // bozuk kayıt yoksayılır
 const e=dunya();e.depo.dt_rozet='{bozuk';e.D.rozet._yenile();assert.equal(e.D.rozet.liste().filter(x=>x.kazanildi).length,0);
 // menü çizimi
 const doc={createElement:()=>({className:'',children:[],appendChild(c){this.children.push(c);},set innerHTML(v){this.children=[];}}),};const kap=doc.createElement();R.ciz(kap,doc);assert.equal(kap.children.length,2,'istatistik + ızgara');assert.equal(kap.children[1].children.length,12);}
console.log('PASS bonus/yorum/rozet: altın bölge, seri çarpanı, 10 sonuç türü için yorumlar, 12 rozet ve kalıcı istatistik');
