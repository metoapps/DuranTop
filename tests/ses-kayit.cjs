// Gerçek ses kaydı bağlantısı: dosya varsa o çalınır, yoksa sentez; ?ses=sentez kayıtları kapatır. Çalıştır: node tests/ses-kayit.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
async function dene({kayitVar,sorgu}){
 const calan=[];const buf={decoded:true};
 function ctx(){return{currentTime:0,sampleRate:44100,state:'running',destination:{},resume(){},createGain(){return{gain:{value:1},connect(){},disconnect(){}};},
  createBuffer(c,n){return{getChannelData(){return new Float32Array(n);},sentez:true};},createBufferSource(){const s={playbackRate:{value:1},connect(){},disconnect(){},stop(){s.stopped=true;},start(){calan.push({kaynak:s.buffer.sentez?'sentez':'kayit',rate:s.playbackRate.value,loop:!!s.loop});}};return s;},
  createBiquadFilter(){return{frequency:{},Q:{},connect(){}};},createOscillator(){return{frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}};},decodeAudioData(){return Promise.resolve(buf);}};}
 const root={AudioContext:ctx,location:{search:sorgu||''},fetch:(u)=>Promise.resolve(kayitVar?{ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(8))}:{ok:false})};root.globalThis=root;vm.createContext(root);
 vm.runInContext(fs.readFileSync(__dirname+'/../js/ses.js','utf8'),root);const DT=root.DT;DT.ses.ayarla(true);await new Promise(r=>setTimeout(r,20));assert.equal(calan.length,0,'enabling sound starts no music');DT.ses.cal('direk',{hiz:24});DT.ses.cal('file',{hiz:24});assert.equal(calan.filter(c=>c.loop).length,0,'no music loop');DT.ses.ayarla(false);return {calan:calan.filter(c=>!c.loop),varMi:DT.ses.kayitVarMi('direk')};
}
(async()=>{
 const a=await dene({kayitVar:true});assert(a.varMi);assert(a.calan.every(c=>c.kaynak==='kayit'),'kayıt varsa kayıt çalınır');assert(a.calan.every(c=>c.rate>=.97&&c.rate<=1.03));
 const b=await dene({kayitVar:false});assert(!b.varMi);assert(b.calan.length===2&&b.calan.every(c=>c.kaynak==='sentez'),'kayıt yoksa sentez');
 const c=await dene({kayitVar:true,sorgu:'?ses=sentez'});assert(!c.varMi);assert(c.calan.every(x=>x.kaynak==='sentez'),'?ses=sentez kayıtları kapatır');
 console.log('PASS recorded impact used when present; synth fallback when missing; ?ses=sentez forces synth for A/B');
})().catch(e=>{console.error(e);process.exit(1);});
