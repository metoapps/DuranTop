/* Kullanım: node tools/mixamo/cikar.cjs GIRDI.fbx CIKTI.json
 * Gerekenler (yalnız geliştirici): npm i --no-save three@0.169.0 playwright-core@1.48.2 ; başsız Chromium (PW_CHROMIUM yolu). */
const {chromium}=require('playwright-core'),http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),[fbx,cikti]=process.argv.slice(2);
const exe=process.env.PW_CHROMIUM||'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=u==='/girdi.fbx'?path.resolve(fbx):u==='/'?path.join(__dirname,'cikar.html'):path.join(root,u);
 fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end();}s.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});s.end(d);});}).listen(0,async()=>{
 const b=await chromium.launch({executablePath:exe,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
 await p.goto('http://localhost:'+srv.address().port+'/');await p.waitForFunction('window.SONUC||window.HATA',null,{timeout:180000});
 const hata=await p.evaluate('window.HATA');if(hata){console.error(hata);process.exitCode=1;}else fs.writeFileSync(cikti,JSON.stringify(await p.evaluate('window.SONUC')));
 await b.close();srv.close();});
