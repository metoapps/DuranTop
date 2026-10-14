// Paylaşım kartı: 1080×1350 çizim (skor, vuruş noktaları, rozetler, rekor) ve paylaşma zinciri (dosya > indir > metin > iptal).
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const r={DT:{}};vm.createContext(r);vm.runInContext(fs.readFileSync(__dirname+'/../js/kart.js','utf8'),r);const K=r.DT.kart,yap=(w,h)=>C.createCanvas(w,h);
const veri=(o)=>Object.assign({oyuncu:'meto',mod:'Günlük #14',puan:14,ana:'2/3 gol',vuruslar:[{gol:true},{gol:false},{gol:true}],enSert:118,rozetler:['İlk Gol','Hız Canavarı'],rekor:false,tarih:'14 Ekim 2026',alt:'Sen kaç yaparsın?'},o||{});
const piksel=(cv)=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
const say=(d,fn)=>{let n=0;for(let i=0;i<d.length;i+=4)if(fn(d[i],d[i+1],d[i+2]))n++;return n;};
const yesil=(a,b,c)=>a>30&&a<70&&b>190&&c>100&&c<130,altin=(a,b,c)=>a>240&&b>200&&b<220&&c>70&&c<110,kirmizi=(a,b,c)=>a>210&&b>70&&b<100&&c>65&&c<95;
// 1) Boyut ve içerik
{const cv=K.uret(veri(),yap);assert.equal(cv.width,1080);assert.equal(cv.height,1350);const d=piksel(cv);assert(say(d,yesil)>2*2500&&say(d,yesil)<2*6000,'2 gol = 2 yeşil daire '+say(d,yesil));assert(say(d,kirmizi)>400,'1 kaçan = kırmızı çerçeve '+say(d,kirmizi));
 const sad=piksel(K.uret(veri({vuruslar:[{gol:true},{gol:true},{gol:true}]}),yap));assert(say(sad,yesil)>say(d,yesil)*1.4&&say(sad,kirmizi)<say(d,kirmizi)*.3,'3 gol: daha çok yeşil, kırmızı yok');
 // rekor bandı altın
 const rek=piksel(K.uret(veri({rekor:true}),yap));assert(say(rek,altin)>say(d,altin)+12000,'rekor bandı: '+say(d,altin)+' → '+say(rek,altin));
 // rozet satırı ve en sert şut bilgisi: kapatınca farklı
 const bos=piksel(K.uret(veri({rozetler:[],enSert:0}),yap));let fark=0;for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-bos[i])+Math.abs(d[i+1]-bos[i+1])>80)fark++;assert(fark>4000,'rozetler ve hız yazısı çizilir '+fark);
 // aynı veri aynı görsel
 assert.deepEqual(Buffer.from(piksel(K.uret(veri(),yap))),Buffer.from(d),'deterministik');}
// 2) Çok vuruş (hayatta kal): iki satır, taşma yok, kenar boşluğu korunur
{const v=veri({mod:'Hayatta kal',ana:'23 gol üst üste',puan:140,vuruslar:Array.from({length:24},(_,i)=>({gol:i<23})),rekor:true});const cv=K.uret(v,yap),d=piksel(cv);assert(say(d,yesil)>17*2300&&say(d,yesil)<20*3100,'son 20 vuruş çizilir (19 gol): '+say(d,yesil));
 // yan kenarlarda (çerçeve dışı 40 px şeridin içinde, y 850-1150) altın/yeşil dışında taşma yok: ilk ve son 70 px'te yeşil yok
 let tasma=0;for(let y=850;y<1150;y++)for(let x=0;x<1080;x++){if(x>90&&x<990)continue;const i=(y*1080+x)*4;if(yesil(d[i],d[i+1],d[i+2]))tasma++;}assert.equal(tasma,0,'noktalar kenara taşmaz');}
// 3) Paylaşma zinciri
function env(ek){const log={};const e=Object.assign({File,URL:{createObjectURL:()=>'blob:x'},navigator:{},document:{createElement:(t)=>{if(t==='canvas'){const cv=C.createCanvas(10,10);cv.toBlob=function(cb){cb(new Blob([cv.toBuffer('image/png')],{type:'image/png'}));};return cv;}return{click(){log.indir=this.download;},set href(v){},style:{}};},body:{appendChild(){},removeChild(){}}}},ek||{});return{e,log};}
(async()=>{
 {const {e,log}=env({navigator:{canShare:()=>true,share:async(x)=>{log.paylasilan=x;}}});assert.equal(await K.paylas(veri(),e),'dosya');assert(log.paylasilan.files[0].name==='duran-top-skor.png'&&log.paylasilan.files[0].type==='image/png'&&log.paylasilan.files[0].size>8000,'PNG dosyası paylaşıldı');assert(/meto · Günlük #14: 14 puan \(2\/3 gol\)/.test(log.paylasilan.text),log.paylasilan.text);}
 {const {e,log}=env({navigator:{canShare:()=>false,share:async(x)=>{log.metin=x;}}});assert.equal(await K.paylas(veri(),e),'indir','dosya paylaşımı yoksa indirir');assert.equal(log.indir,'duran-top-skor.png');}
 {const {e,log}=env({navigator:{share:async(x)=>{log.metin=x;}},URL:{}});assert.equal(await K.paylas(veri(),e),'metin','indirme de yoksa metin');assert(/14 puan/.test(log.metin.text));}
 {const {e,log}=env({navigator:{clipboard:{writeText:async(t)=>{log.pano=t;}}},URL:{}});assert.equal(await K.paylas(veri(),e),'metin');assert(/14 puan/.test(log.pano),'panoya kopyalanır');}
 {const {e}=env({navigator:{},URL:{}});assert.equal(await K.paylas(veri(),e),'yok','hiçbir yol yoksa hata vermez');}
 {const {e}=env({navigator:{canShare:()=>true,share:async()=>{const x=new Error('iptal');x.name='AbortError';throw x;}}});assert.equal(await K.paylas(veri(),e),'iptal','kullanıcı iptal ederse');}
 // oyun entegrasyonu
 const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');assert(/DT\.kart\.paylas\(kartVeri\(\)\)/.test(oyun)&&/id="kartPaylas"/.test(html)&&/js\/kart\.js/.test(html)&&/d\.turEnSert = Math\.max/.test(oyun)&&/d\.turRekor = hk\.rekor/.test(oyun));
 fs.writeFileSync('/tmp/kart-ornek.png',K.uret(veri({mod:'Hayatta kal',oyuncu:'meto',puan:96,ana:'7 gol üst üste',vuruslar:[1,1,1,1,1,1,1,0].map(x=>({gol:!!x})),rekor:true,enSert:121,rozetler:['Hız Canavarı','Seri Katil']}),yap).toBuffer('image/png'));
 console.log('PASS paylaşım kartı: 1080×1350, skor/vuruş noktaları/rozet/rekor, 20 vuruşa kadar taşmasız, paylaşma zinciri (dosya, indirme, metin, pano, iptal)');
})().catch(e=>{console.error(e);process.exit(1)});
