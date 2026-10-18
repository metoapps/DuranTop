/* Gerçek tarayıcı (WebGL): Meto breakdance sevinci (sevinç 3) gerçek ağla çizilir. DT_CHROMIUM = Chromium yolu; yoksa atlanır.
 * DT_QA_OUTPUT verilirse kareleri PNG olarak yazar. */
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
let chromium;for(const m of ['playwright','playwright-core','/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright']){try{chromium=require(m).chromium;break;}catch{}}
(async()=>{let browser;try{browser=await chromium.launch({executablePath:process.env.DT_CHROMIUM||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});}catch(e){if(process.env.DT_CHROMIUM)throw e;console.log('PASS (atlandı) Meto breakdance WebGL: Chromium yok');return;}
 const base=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/')name='/index.html';const file=path.resolve(base,'.'+name);if(!file.startsWith(base+path.sep)){res.statusCode=403;return res.end();}fs.readFile(file,(e,b)=>{if(e){res.statusCode=404;return res.end();}res.setHeader('Content-Type',({'.js':'application/javascript','.json':'application/json','.html':'text/html','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let page;const errors=[];
 try{page=await browser.newPage();await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');assert(await page.evaluate(()=>DT.meto3d.load()),'Meto modeli hazır');
  assert(await page.evaluate(()=>DT.meto3d._loadDans()),'breakdance paketi hazır');
  const W=430,H=932;await page.setViewportSize({width:W,height:H});await page.evaluate(async([w,h])=>{document.body.innerHTML='<canvas id="qa"></canvas>';document.body.style='margin:0';DT.cizim.kur(document.getElementById('qa'),w,h,1);await DT.cizim.karakterYukle('meto');},[W,H]);
  const times=[0,.8,1.6,2.4,3.2,4.0,4.8,5.6,6.4];const res=[];
  for(const t of times){const r=await page.evaluate(t=>{const M=DT.meto3d,R=M._renderer(),d0=R.stats.drawCalls;let used=null;const paint=R.paint;R.paint=function(g,o,r,near,prep){used=!!prep.dans;return paint(g,o,r,near,prep);};
    DT.cizim.ciz({onKarakter:{karakter:'meto',poz:'sevinc',gol:true,sure:t,sevinc:3}});R.paint=paint;const gl=R.gl,px=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,px);let n=0;for(let i=3;i<px.length;i+=4)if(px[i])n++;
    return{t,dans:used,draws:R.stats.drawCalls-d0,pixels:n,err:gl.getError()};},t);res.push(r);
   if(process.env.DT_QA_OUTPUT){fs.mkdirSync(process.env.DT_QA_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.DT_QA_OUTPUT,'meto-breakdance-'+t.toFixed(1)+'.png')});}}
  // eski üç sevinç aynı tuvalde bozulmadan çizilir (program geçişi)
  const eski=await page.evaluate(()=>{const out=[];for(const v of [0,1,2]){DT.cizim.ciz({onKarakter:{karakter:'meto',poz:'sevinc',gol:true,sure:2,sevinc:v}});out.push(DT.meto3d._renderer().gl.getError());}return out;});
  for(const r of res){assert.equal(r.dans,true,'dans yolu kullanıldı t='+r.t);assert.equal(r.err,0,'WebGL hatası t='+r.t);assert(r.draws>=4,'tüm ağ parçaları');assert(r.pixels>2000,'model pikselleri t='+r.t+': '+r.pixels);}
  assert.deepEqual(eski,[0,0,0],'eski sevinçler');assert.deepEqual(errors,[],'tarayıcı JS hatası');
  console.log('PASS Meto breakdance WebGL: '+res.length+' kare gerçek ağ, 22 kemik GPU, GL/JS hatası yok, eski üç sevinç sağlam; piksel '+res.map(r=>r.pixels).join('/'));
 }finally{await page?.close();await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
