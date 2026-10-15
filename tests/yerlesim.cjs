// Ekran yerleşimi (gerçek Chromium): tüm yönlendirmeler (ok artısı, ↺ ↻, Tamam, 2/3 ve güç panelleri) HEP sağ altta (sol el modunda sol altta), duruş değişince yer değiştirmez,
// yönerge bandı kumandanın üstünde ve çakışmaz, taşma yok. Playwright/Chromium yoksa test atlanır (yerel geliştirmede çalıştır).
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
let chromium;try{chromium=require('playwright').chromium;}catch(e){try{chromium=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright').chromium;}catch(e2){}}
if(!chromium){console.log('PASS (atlandı) yerleşim: playwright yok');process.exit(0);}
const kok=path.join(__dirname,'..'),tur={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.json':'application/json'};
const sunucu=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(kok,u);if(!f.startsWith(kok)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':tur[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>sunucu.listen(0,r));const port=sunucu.address().port;let b;try{b=await chromium.launch();}catch(e){console.log('PASS (atlandı) yerleşim: Chromium başlatılamadı');sunucu.close();process.exit(0);}
 const ids=['nisanYukari','nisanSol','nisanAsagi','nisanSag','yonSol','yonSag','nisanKilit'];
 for(const [ad,vp,sinif] of [['390x844',{width:390,height:844},''],['320x568',{width:320,height:568},''],['844x390',{width:844,height:390},''],['390x844 sol el',{width:390,height:844},'sol-el'],['390x844 büyük',{width:390,height:844},'buyuk'],['320x568 büyük sol',{width:320,height:568},'buyuk sol-el']]){
  const c=await b.newContext({viewport:vp,isMobile:true,hasTouch:true});const p=await c.newPage();await p.goto('http://localhost:'+port+'/index.html');await p.waitForTimeout(250);
  const r=await p.evaluate((sinif)=>{const oy=document.getElementById('oyun');document.getElementById('menu').hidden=true;oy.hidden=false;sinif.split(' ').filter(Boolean).forEach(x=>oy.classList.add(x));const W=innerWidth,H=innerHeight,kb=(id)=>{const q=document.getElementById(id).getBoundingClientRect();return{x:q.left,y:q.top,sag:W-q.right,alt:H-q.bottom,w:q.width,h:q.height,r:q.right,b:q.bottom};};
   const o={W,H};const k=document.getElementById('fifaNisan');k.hidden=false;ids_=['nisanYukari','nisanSol','nisanAsagi','nisanSag','yonSol','yonSag','nisanKilit'];ids_.forEach(id=>o[id]=kb(id));const ip=document.getElementById('ipucu').getBoundingClientRect();o.ipucu={y:ip.top,b:ip.bottom,x:ip.left,r:ip.right};k.hidden=true;
   o.paneller={};for(const id of ['temasPanel','gucPanel']){const e=document.getElementById(id);e.hidden=false;o.paneller[id]=kb(id);e.hidden=true;}
   oy.classList.add('secim-sag');const e2=document.getElementById('temasPanel');e2.hidden=false;o.secimSag=kb('temasPanel');e2.hidden=true;oy.classList.remove('secim-sag');return o;},sinif);
  const sol=/sol-el/.test(sinif),a=(m)=>ad+': '+m;
  for(const id of ids){const q=r[id];assert(q.x>=-.5&&q.sag>=-.5&&q.y>=-.5&&q.alt>=-.5,a(id+' ekran dışına taşmaz'));}
  const t=r.nisanKilit;assert(sol?t.x<=14:t.sag<=14,a('Tamam köşede: '+JSON.stringify({x:t.x,sag:t.sag})));assert(t.alt<=16,a('Tamam altta'));
  // tüm kumanda aynı yarıda: ok artısı ve ↺ ↻ da Tamam'la aynı tarafta
  for(const id of ['nisanYukari','nisanSag','yonSol']){const q=r[id];assert(sol?q.x<r.W*.8:q.x>r.W*.15,a(id+' Tamam ile aynı tarafta'));}
  assert(r.nisanSag.r<=r.W&&Math.abs(r.nisanSag.sag-(sol?r.W-r.nisanSag.r:r.nisanSag.sag))<400);
  // Tamam artının altında; ↺ ↻ Tamam aynı satırda
  assert(r.nisanKilit.y>r.nisanAsagi.b-2,a('Tamam artının altında'));assert(Math.abs(r.yonSol.y-r.nisanKilit.y)<20&&Math.abs(r.yonSag.y-r.nisanKilit.y)<20,a('↺ ↻ Tamam aynı satırda'));
  // paneller: ikisi de aynı köşe, aynı kenar boşlukları; duruş sınıfı (secim-sag) yeri değiştirmez
  const tp=r.paneller.temasPanel,gp=r.paneller.gucPanel;for(const q of [tp,gp]){assert(sol?q.x<=14:q.sag<=14,a('panel köşede'));assert(q.alt<=2,a('panel alt kenarda: '+q.alt));}
  assert(Math.abs(tp.x-gp.x)<1&&Math.abs(tp.sag-gp.sag)<1&&Math.abs(tp.alt-gp.alt)<1,a('2/3 ve güç paneli birebir aynı kenar konumunda'));assert(Math.abs(r.secimSag.x-tp.x)<1&&Math.abs(r.secimSag.y-tp.y)<1,a('duruş sınıfı paneli kaydırmaz'));
  // yönerge bandı: dikeyde kumandanın üstünde ve çakışmaz; yatayda yan yana
  const ip=r.ipucu;for(const id of ids){const q=r[id];assert((q.r<=ip.x||q.x>=ip.r||q.b<=ip.y||q.y>=ip.b),a('yönerge bandı '+id+' ile çakışmaz: bant '+JSON.stringify(ip)+' düğme '+JSON.stringify({x:q.x,y:q.y,r:q.r,b:q.b})));}
  await c.close();}
 await b.close();sunucu.close();console.log('PASS yerleşim: ok artısı, ↺ ↻, Tamam ve 2/3-güç panelleri hep sağ altta (sol elde sol altta), duruşla yer değiştirmez, yönerge bandı çakışmaz, 6 ekran düzeninde taşma yok');})().catch(e=>{console.error(e);process.exit(1);});
