// Tribün katmanı önbelleği: kalabalık + atmosfer + bayrak ayrı tuvalde her 2. karede çizilir; katman ekranın yalnız üst bölgesi kadar ve içerik sınırın içinde.
const fs=require('fs'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
globalThis.Image=C.Image;globalThis.__yapCanvas=C.createCanvas;
for(const n of ['ayar','veri','baraj','model3d','kaleci3d','baraj3d','kaleci','ucus','fizik','hedef','ag','puan','tezahurat','futbolcu3d','sevinc','tribun','cizim'])(0,eval)(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'));
(async()=>{const D=globalThis.DT;D.model3d.setFace(await C.loadImage(__dirname+'/../assets/kaleci-neuer-face.webp'));
for(const [w,h] of [[320,568],[390,844],[844,390]]){const cv=C.createCanvas(w,h);D.cizim.kur(cv,w,h,1);
 for(const k of D.KARAKTER)for(const p of D.POZ)D.cizim.gorselEkle(k.id+'_'+p,await C.loadImage(__dirname+'/../assets/sprites/'+k.id+'_'+p+'.png'));
 let enAlt=0;
 for(const pos of D.AYAR.pozisyonlar){D.cizim.sahneKur(pos);
  for(const kar of ['meto','lort','fero','latte','josh'])for(const [heyecan,alay] of [[0,-1],[1,-1],[0,.5]]){
   D.cizim.ciz({top:{x:pos.bx,y:.11,z:0},oyuncu:{karakter:kar,poz:'bekle'},heyecan,alay,alayTur:'aut'});
   const t=D.cizim._tribunKatman(),sinir=D.cizim._tribunSinir();assert(t&&t.height<=Math.ceil(sinir)+1&&sinir<h,'katman yalnız üst bölge: '+sinir+'/'+h);
   const dat=t.getContext('2d').getImageData(0,0,t.width,t.height).data;let mx=-1;
   for(let y=t.height-1;y>=0&&mx<0;y--)for(let x=0;x<t.width;x++)if(dat[(y*t.width+x)*4+3]>0){mx=y;break;}
   assert(mx<t.height-8,'tribün içeriği katman sınırının içinde (kesilmiyor): '+mx+'/'+t.height+' '+w+'x'+h+' '+pos.ad);enAlt=Math.max(enAlt,mx);}}
 // Önbellek: aynı durumda ardışık 4 çizimde tribün en çok 2 kez yeniden çizilir.
 const pos=D.AYAR.pozisyonlar[0];D.cizim.sahneKur(pos);const eski=D.tribun.draw;let n=0;D.tribun.draw=function(){n++;return eski.apply(this,arguments);};
 const d={top:{x:0,y:.11,z:0},oyuncu:{karakter:'meto',poz:'bekle'}};
 // Gerçek çizim süresi ağır CI makinelerinde 100 ms'yi aşabilir; kare sınırı ve
 // 100 ms güvenlik yenilemesini birbirinden bağımsız, denetlenen saatle ölç.
 const realPerformance=Object.getOwnPropertyDescriptor(globalThis,'performance');let clock=0;
 Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>clock}});
 try{
  for(let i=0;i<4;i++){clock=i*16;D.cizim.ciz(d);}
  assert(n>=1&&n<=2,'4 karede tribün '+n+' kez çizildi (en çok 2 beklenir)');
  n=0;clock+=101;D.cizim.ciz(d);assert.equal(n,1,'100 ms geçince kare sayısı beklenmeden yenilenir');
 }finally{Object.defineProperty(globalThis,'performance',realPerformance);D.tribun.draw=eski;}
 console.log(w+'x'+h,'en alt dolu satır',enAlt,'sınır',D.cizim._tribunSinir());}
console.log('PASS tribün katmanı: üst bölge kadar, içerik sınırın içinde, 4 karede ≤2 yeniden çizim');
})().catch(e=>{console.error(e);process.exit(1);});
