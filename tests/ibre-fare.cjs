// Gerçek Chromium + GERÇEK FARE: güç basılı tutulurken kendiliğinden seçilmez (fare düğmeden çıksa bile), bırakınca ibre HEMEN başlamaz (hazırlık), hazırlıkta dokunuşlar vurdurmaz,
// ibre sen dokunana kadar gidip gelir (oyun kendiliğinden vurmaz), yalnız ortadaki büyük daireye dokununca vurulur; çok kısa tık güç seçimi sayılmaz. Chromium yoksa atlanır.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
let chromium;try{chromium=require('playwright').chromium;}catch(e){try{chromium=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright').chromium;}catch(e2){}}
if(!chromium){console.log('PASS (atlandı) ibre-fare: playwright yok');process.exit(0);}
const kok=path.join(__dirname,'..'),tur={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.json':'application/json','.bin':'application/octet-stream','.jpg':'image/jpeg'};
const sunucu=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(kok,u);if(!f.startsWith(kok)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':tur[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>sunucu.listen(0,r));const port=sunucu.address().port;let b;try{b=await chromium.launch({executablePath:process.env.DT_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});}catch(e){console.log('PASS (atlandı) ibre-fare: Chromium başlatılamadı');sunucu.close();process.exit(0);}
 const c=await b.newContext({viewport:{width:1100,height:760}});const p=await c.newPage();const hata=[];p.on('pageerror',e=>hata.push(e.message));
 await p.goto('http://localhost:'+port+'/index.html');await p.waitForTimeout(1200);
 const d=()=>p.evaluate(()=>{const o=DT.oyun._durum;return{faz:o.faz,fifa:o.fifa&&o.fifa.faz,guc:o.guc,tikGizli:document.getElementById('fifaTik').hidden,vurPasif:document.getElementById('vurBtn').disabled};});
 const yeniVurus=async()=>{await p.click('#nisanKilit');await p.waitForTimeout(250);const tt=await (await p.$('#temasTop')).boundingBox();await p.mouse.move(tt.x+tt.width/2,tt.y+tt.height/2);await p.mouse.down();await p.mouse.up();await p.waitForTimeout(300);};
 await p.evaluate(()=>{DT.live.identity=()=>({player:'meto'});document.getElementById('btnAntrenman').disabled=false;});await p.click('#btnAntrenman');await p.waitForTimeout(2500);
 await yeniVurus();let vb=await (await p.$('#vurBtn')).boundingBox();const vx=vb.x+vb.width/2,vy=vb.y+vb.height/2;
 // 1) Basılı tut: 3 sn boyunca güç aşamasında kalır; fare düğmeden ve pencereden çıksa da kendiliğinden seçilmez
 await p.mouse.move(vx,vy);await p.mouse.down();for(const ms of [300,900,1000,1000]){await p.waitForTimeout(ms);const s=await d();assert.equal(s.fifa,'guc','basılı tutarken güç seçilmez ('+JSON.stringify(s)+')');assert.equal(s.faz,'nisan');}
 await p.mouse.move(vx-400,vy-300,{steps:6});await p.waitForTimeout(500);assert.equal((await d()).fifa,'guc','fare düğmeden çıkınca da güç seçilmez');await p.mouse.move(vx,vy);
 // 2) Bırak: ibre hemen başlamaz (hazırlık); hazırlıkta tıklamalar vurdurmaz
 await p.mouse.up();let s=await d();assert.equal(s.fifa,'hazir','bırakınca hazırlık evresi');assert.equal(s.tikGizli,false,'ortadaki büyük daire görünür');assert.equal(s.vurPasif,true,'VUR düğmesi ibre sırasında pasif');
 const tk=await (await p.$('#fifaTik')).boundingBox();await p.mouse.move(tk.x+tk.width/2,tk.y+tk.height/2);await p.mouse.down();await p.mouse.up();await p.mouse.move(vx,vy);await p.mouse.down();await p.mouse.up();
 s=await d();assert.equal(s.faz,'nisan','hazırlıktaki tıklamalar vurdurmaz');assert.equal(s.fifa,'hazir');
 // 3) Hazırlık biter, ibre gidip gelir ve oyun KENDİLİĞİNDEN vurmaz
 await p.waitForTimeout(800);s=await d();assert.equal(s.fifa,'isabet','0,65 sn sonra ibre başlar');
 for(const ms of [1200,1500,1500]){await p.waitForTimeout(ms);s=await d();assert.equal(s.faz,'nisan','ibre iki geçişi bitirse de oyun kendiliğinden vurmaz');assert.equal(s.fifa,'isabet');}
 // 4) VUR düğmesi ibreyi durdurmaz; yalnız ortadaki daireye dokununca vurulur
 await p.mouse.move(vx,vy);await p.mouse.down();await p.mouse.up();s=await d();assert.equal(s.faz,'nisan','VUR düğmesi ibreyi durdurmaz');
 await p.mouse.move(tk.x+tk.width/2,tk.y+tk.height/2);await p.mouse.down();await p.mouse.up();await p.waitForTimeout(300);s=await d();assert(s.faz==='vurus'||s.faz==='gonderiliyor','daireye dokununca vurulur: '+s.faz);
 // 5) Çok kısa tık güç seçimi sayılmaz (kazara)
 for(let k=0;k<400&&(await d()).faz!=='sonuc';k++)await p.waitForTimeout(100);await p.click('#devamBtn');await p.waitForTimeout(1800);
 await yeniVurus();vb=await (await p.$('#vurBtn')).boundingBox();await p.mouse.move(vb.x+vb.width/2,vb.y+vb.height/2);await p.mouse.down();await p.waitForTimeout(40);await p.mouse.up();s=await d();assert(!s.fifa,'çok kısa tık güç seçimi sayılmaz ('+JSON.stringify(s)+')');
 assert.deepEqual(hata.filter(h=>!/Failed to load|ERR_/.test(h)),[],'tarayıcı JS hatası yok');
 await b.close();sunucu.close();console.log('PASS ibre-fare: gerçek fare — basılı tutarken kendiliğinden seçim yok, bırakınca hazırlık, hazırlıkta tıklama vurdurmaz, ibre kendiliğinden vurmaz, yalnız büyük daireyle vurulur, çok kısa tık sayılmaz');})().catch(e=>{console.error(e);process.exit(1);});
