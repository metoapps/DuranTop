// Tribün atmosferi: direkli dalgalanan bayraklar + flama dizileri. Yalnız görüntü; tribün bandının dışına taşmaz, zamanla hareket eder, azaltılmış harekette durur.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
function world(reduce){const r={DT:{},matchMedia:()=>({matches:reduce})};vm.createContext(r);vm.runInContext(fs.readFileSync(__dirname+'/../js/tribun.js','utf8'),r);return r.DT.tribun;}
const mk=(w,h)=>C.createCanvas(w,h);
function ciz(T,W,H,ust,alt,t){const cv=C.createCanvas(W,H),g=cv.getContext('2d');T.atmosfer(g,{W,ust,alt,time:t,makeCanvas:mk});return g.getImageData(0,0,W,H).data;}
function satirDolu(d,W,y){for(let x=0;x<W;x++)if(d[(y*W+x)*4+3])return true;return false;}
const T=world(false);let n=0;
for(const [W,H,ust,alt] of [[320,568,35,140],[390,844,35,165],[430,932,35,175],[844,390,35,110],[1366,768,35,230]]){
 for(const t of [0,1.3,7.9]){const d=ciz(T,W,H,ust,alt,t),hb=alt-ust;
  for(let y=0;y<H;y++)if(y<ust-.12*hb||y>alt+12)assert(!satirDolu(d,W,y),W+'x'+H+' t='+t+': bant dışına taşma y='+y);
  let boya=0;for(let i=3;i<d.length;i+=4)if(d[i])boya++;assert(boya>W*hb*.08,'tribünde görünür bayrak/flama olmalı');n++;}
 const a=ciz(T,W,H,ust,alt,1),b=ciz(T,W,H,ust,alt,1.4);let fark=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])fark++;assert(fark>500,'bayraklar zamanla dalgalanır');}
const S=world(true),a=ciz(S,390,844,35,165,1),b=ciz(S,390,844,35,165,9);assert(Buffer.compare(Buffer.from(a),Buffer.from(b))===0,'azaltılmış harekette sabit');
T.atmosfer(C.createCanvas(10,10).getContext('2d'),{W:10,ust:35,alt:40,time:1,makeCanvas:mk});// çok dar bant: sessizce çizmez
console.log('PASS tribün atmosferi: '+n+' ekran×zaman, bant dışına taşma yok, dalgalanma var, azaltılmış harekette sabit');
