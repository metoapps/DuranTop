// Menü düzeni (gerçek Chromium): başlık tek satır, "Kupaya katıl" tam genişlik, aynı satırdaki mod düğmeleri eşit yükseklikte, taşma yok. Chromium yoksa atlanır.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
let chromium;try{chromium=require('playwright').chromium;}catch(e){try{chromium=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright').chromium;}catch(e2){}}
if(!chromium){console.log('PASS (atlandı) menü düzeni: playwright yok');process.exit(0);}
const kok=path.join(__dirname,'..'),tur={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.json':'application/json'};
const sunucu=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(kok,u);if(!f.startsWith(kok)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':tur[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>sunucu.listen(0,r));const port=sunucu.address().port;let b;try{b=await chromium.launch();}catch(e){console.log('PASS (atlandı) menü düzeni: Chromium başlatılamadı');sunucu.close();process.exit(0);}
 for(const [ad,vp] of [['390x844',{width:390,height:844}],['320x568',{width:320,height:568}],['844x390',{width:844,height:390}]]){
  const c=await b.newContext({viewport:vp,isMobile:true,hasTouch:true});const p=await c.newPage();await p.goto('http://localhost:'+port+'/index.html');await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const q=id=>document.getElementById(id).getBoundingClientRect(),h1=document.querySelector('#menu h1'),fs=parseFloat(getComputedStyle(h1).fontSize),hb=h1.getBoundingClientRect();
   return{W:innerWidth,baslikH:hb.height,baslikFs:fs,baslikW:hb.width,resmi:q('btnResmi'),ant:q('btnAntrenman'),hedef:q('btnHedef'),gun:q('btnGunluk'),hayat:q('btnHayat'),menuTasma:document.getElementById('menu').scrollWidth>innerWidth+1,sliders:['svMuzik','svEfekt','svTribun'].every(id=>!!document.getElementById(id))};});
  const a=m=>ad+': '+m;assert(r.baslikH<r.baslikFs*1.35,a('başlık tek satır: '+Math.round(r.baslikH)+' px, yazı '+Math.round(r.baslikFs)+' px'));assert(!r.menuTasma,a('yatay taşma yok'));
  assert(Math.abs(r.ant.height-r.hedef.height)<1.5&&Math.abs(r.gun.height-r.hayat.height)<1.5,a('aynı satırdaki mod düğmeleri eşit yükseklikte: '+[r.ant.height,r.hedef.height,r.gun.height,r.hayat.height].map(Math.round)));
  assert(r.resmi.width>=r.ant.width*1.9,a('Kupaya katıl tam genişlik: '+Math.round(r.resmi.width)+' vs '+Math.round(r.ant.width)));assert(Math.abs(r.ant.top-r.hedef.top)<1.5&&Math.abs(r.gun.top-r.hayat.top)<1.5,a('düğmeler hizalı'));
  assert(r.sliders,a('ses düzeyi kaydırıcıları menüde'));await c.close();}
 await b.close();sunucu.close();console.log('PASS menü düzeni: başlık tek satır, Kupaya katıl tam genişlik, mod düğmeleri eşit ve hizalı, taşma yok (390×844, 320×568, 844×390)');})().catch(e=>{console.error(e);process.exit(1);});
