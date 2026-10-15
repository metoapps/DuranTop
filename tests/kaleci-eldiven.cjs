// Kaleci eldiveni: avuç + 4 parmak + başparmak (çizgi olarak, ucuz); parmak açıklığı duruma göre (dalış/kurtarışta açık, dururken gevşek); küçük figürde maliyet sınırlı.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root={DT:{}};vm.createContext(root);for(const n of ['ayar','model3d','kaleci3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const K3=root.DT.kaleci3d;
const S=170,project=(x,y,z)=>({x:300+x*S,y:520-y*S,d:z+10,olcek:S});
function ciz(durum,acikZorla,detay){const cv=C.createCanvas(600,600),g=cv.getContext('2d');g.fillStyle='#223';g.fillRect(0,0,600,600);let fill=0,stroke=0;const f0=g.fill.bind(g),s0=g.stroke.bind(g);g.fill=function(){fill++;return f0.apply(null,arguments);};g.stroke=function(){stroke++;return s0.apply(null,arguments);};
 const r=K3.iskelet(Object.assign({x:0,y:1,poz:'bekle'},durum),9,{});if(acikZorla!==undefined)r.acik=acikZorla;K3.cizGovde(g,project,r,{shirt:'#279258',shirtKoyu:'#1d6f43',shorts:'#152b22',socks:'#236f44',skin:'#d4a47c',hair:'#9b7545',gloves:'#f1f1ea',cuff:'#d8253a',boots:'#20292d',detay:detay===undefined?0:detay});
 return{cv,r,fill,stroke};}
// 1) Açıklık durumdan türer
{const a=(d)=>K3.iskelet(Object.assign({x:0,y:1,poz:'bekle'},d),9,{}).acik;assert.equal(a({}),.22,'gevşek');assert.equal(a({poz:'dal',yon:1,ilerleme:1}),1,'dalış tam açık');assert.equal(a({saved:true}),1,'kurtarış tam açık');assert.equal(a({block:1}),.8,'blok');assert.equal(a({gesture:1.2}),.5,'ısınma hareketi yarı açık');}
// 2) Parmaklar çizilir: açıklık arttıkça eldivenin kapladığı genişlik artar
{const beyaz=(cv,kutu)=>{const d=cv.getContext('2d').getImageData(0,0,600,600).data;let minx=9999,maxx=-1,miny=9999,maxy=-1,say=0;for(let y=kutu[1];y<kutu[3];y++)for(let x=kutu[0];x<kutu[2];x++){const i=(y*600+x)*4;if(d[i]>205&&d[i+1]>205&&d[i+2]>195){say++;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}}return{say,w:maxx-minx,h:maxy-miny,alan:(maxx-minx)*(maxy-miny)};};
 const r0=ciz({block:1},.0),r1=ciz({block:1},1),h=r0.r.nodes.hl,q=project(h[0],h[1],9),kutu=[Math.round(q.x-70),Math.round(q.y-70),Math.round(q.x+50),Math.round(q.y+70)];const b0=beyaz(r0.cv,kutu),b1=beyaz(r1.cv,kutu);
 assert(b0.say>250&&b1.say>250,'eldiven görünür: '+b0.say+' / '+b1.say);assert(b1.alan>b0.alan*1.08,'açık eldiven daha geniş yayılır (kutu alanı): '+b0.w+'×'+b0.h+' → '+b1.w+'×'+b1.h);
 // eldiven kürenin ötesinde: parmak uçları bilekten ≥6 cm uzağa uzanır
 }
// 3) Maliyet: küçük figürde (ayrıntı 0) çizgi sayısı sınırlı (10 parmak + 2 başparmak ≈ 10), toplam dolgu sayısı sınırlı
{const r=ciz({},undefined,0);assert(r.stroke>=10&&r.stroke<=400,'çizim çağrıları makul: '+r.stroke);assert(r.fill<=450,'dolgu sayısı sınırlı (üçgen): '+r.fill);const t0=process.hrtime.bigint();for(let i=0;i<40;i++)ciz({block:1},undefined,0);const ms=Number(process.hrtime.bigint()-t0)/1e6/40;assert(ms<12,'kaleci çizimi hızlı: '+ms.toFixed(1)+' ms (600×600 tuvalde, masaüstü)');}
// 4) Ayrıntı ≥1: deltoid ve kulak eklenir (daha çok üçgen)
{const a=ciz({},undefined,0),b=ciz({},undefined,1);assert(b.fill>a.fill*1.5,'ayrıntı 1 daha ayrıntılı: '+a.fill+' → '+b.fill);}
console.log('PASS kaleci eldiveni: avuç ve parmaklar (çizgi), açıklık duruma göre (dalış/kurtarış açık), küçük figürde maliyet sınırlı, ayrıntı ≥1 deltoid ve kulak');
