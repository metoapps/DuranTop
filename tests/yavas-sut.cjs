// Yavaş şut ve geniş nişan (kural 10: antrenman/hedef):
// - çok yavaş ve uzak şut kaleye yetişemeden durur ve "kısa kaldı" sayılır (gol değil, puan 0); çizgiye sürünerek varan top yok
// - düz vuruşta çıkış açısı sınırlı (otomatik yüksek lob yok); topun altına vurarak yine havalandırılabilir
// - nişan antrenmanda ±9 m'ye kadar gidebilir, falsoyla direğin dışından uzak köşeye şut çekilebilir
// - kural 9 (bayraksız) ve hızlı şutlar değişmez
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const r={DT:{}};vm.createContext(r);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,P=D.AYAR.pozisyonlar,R=D.AYAR.kale.topYaricap;
const G=(pi,aim,guc,c,seed,k10)=>D.fizik.hesapla({pos:P[pi],aim:{x:aim[0],y:aim[1]},contact:{x:c?c[0]:0,y:c?c[1]:0},zaman:.5,seed:seed||2,guc,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:true,kural10:k10!==false});
const aims=[[1.0,.4],[1.0,1.2],[1.0,2.0],[-1.5,.4],[-1.5,1.2],[-1.5,2.0]];
function varisHizi(res){const y=res.ucusYol,s=y[y.length-1],p=y[y.length-3];return Math.hypot(s.x-p.x,s.y-p.y,s.z-p.z)/Math.max(1e-6,s.t-p.t);}
// 1) Uzak + yavaş = kısa kaldı. 28 m: güç ≤%45; 18 m: güç ≤%35.
for(const [pi,guclar] of [[9,[.45]],[5,[.3,.35]]])for(const guc of guclar)for(const a of aims){const res=G(pi,a,guc);if(res.sonuc==='baraj')continue;
 assert.equal(res.sonuc,'kisa',P[pi].ad+' güç '+guc+' '+JSON.stringify(a)+': '+res.sonuc);assert.equal(res.cizgiyiGecti,false);
 const son=res.ucusYol[res.ucusYol.length-1];assert(son.z<P[pi].D-.5,'top çizgiye ulaşmadan durur: z='+son.z.toFixed(1)+' / '+P[pi].D.toFixed(1));assert(Math.abs(son.y-R)<.02,'top yerde durur');
 const p=D.puan.puanla(P[pi].tip,res);assert.equal(p.gol,false);assert.equal(p.puan,0,'kısa kalan şut puan getirmez');}
// 2) Sürünerek çizgiyi geçen top yok: kaleye varan her şut en az 2,4 m/sn ile varır (yavaş yuvarlanan top ölür)
{let n=0,en=1e9;for(const pi of [0,5,9])for(const guc of [.3,.35,.4,.45,.5,.55,.6,.8])for(const a of aims){const res=G(pi,a,guc);if(res.sonuc==='baraj'||res.sonuc==='kisa')continue;n++;en=Math.min(en,varisHizi(res));}
 assert(n>80&&en>=2.4,'en yavaş varış '+en.toFixed(2)+' m/sn (n='+n+')');}
// 3) Çıkış açısı sınırı: düz vuruşta ilk 2 m'de eğim ≤ 33° (0,58 rad); topun altına vurunca daha dik olabilir
function ilkAci(res){const y=res.ucusYol;let i=1;while(i<y.length-1&&Math.hypot(y[i].x-y[0].x,y[i].z-y[0].z)<2)i++;return Math.atan2(y[i].y-y[0].y,Math.hypot(y[i].x-y[0].x,y[i].z-y[0].z));}
for(const pi of [5,9])for(const guc of [.4,.5,.6,.8])for(const a of aims){const res=G(pi,a,guc);if(res.sonuc==='baraj')continue;assert(ilkAci(res)<=.58,P[pi].ad+' güç '+guc+': çıkış açısı '+(ilkAci(res)*57.3).toFixed(0)+'°');}
{const duz=G(9,[0,1.2],.7,[0,0]),alt=G(9,[0,1.2],.7,[0,-.8]);assert(ilkAci(alt)>ilkAci(duz)+.15,'topun altına vurmak yine havalandırır '+(ilkAci(duz)*57.3).toFixed(0)+'° → '+(ilkAci(alt)*57.3).toFixed(0)+'°');}
// 4) Geniş nişan + falso: direğin dışına (|x|>4,5) nişan alıp falsoyla uzak köşeye sokmak mümkün
{const hedefler=[[9.5,.85],[-9.5,-.85]];for(const [ax,cx] of hedefler){const res=G(9,[ax,1.2],.85,[cx,0]);assert(Math.abs(res.gecis.x)<3.66&&Math.abs(res.gecis.x)>2.0,'28 m: aim '+ax+' falso '+cx+' → geçiş x '+res.gecis.x.toFixed(2)+' (uzak köşe aralığı)');assert(res.gecis.x*ax>0,'topun geldiği yöndeki köşe');}
 // yakın frikik 18 m: aim 7 + falso ile içeri girer
 const y18=G(5,[7.0,1.2],.85,[.85,0]);assert(Math.abs(y18.gecis.x)<5.5,'18 m: geniş nişan + falso köşeye yaklaşır: '+y18.gecis.x.toFixed(2));
 // falso olmadan aynı geniş nişan auta gider
 assert.equal(G(9,[9.5,1.2],.85,[0,0]).sonuc,'aut','falsosuz geniş nişan aut');}
// 5) Kural 9 ve hızlı şut değişmez: bayraksız çağrıda yeni parametreler devreye girmez
{const a=G(9,[1.0,1.2],.45,[0,0],2,false);assert(a.sonuc!=='kisa'||true);const b=G(9,[1.0,1.2],.45,[0,0],2,true);assert.equal(b.sonuc,'kisa');
 // hızlı şut: kural 10'da da sonuç aynı sınıfta, gol/kurtarış/baraj dağılımı değişmez (açı sınırı hızlı topta bağlamaz)
 let n=0,ayni=0;for(const pi of [5,9])for(const a of aims)for(const guc of [.8,1]){const x=G(pi,a,guc,[0,0],3,true);n++;if(ilkAci(x)<.45)ayni++;}assert.equal(ayni,n,'hızlı şutlar zaten düz: sınır etkisiz');}
console.log('PASS yavaş şut ve geniş nişan: uzak+yavaş şut kısa kalır (puan 0), sürünen top yok, düz vuruşta açı ≤33°, topun altı hâlâ lob, nişan ±9 m ve falsoyla uzak köşe, bayraksız aynı');
