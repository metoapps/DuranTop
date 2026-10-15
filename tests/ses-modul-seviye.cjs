// Ses modüllerinde ana ses düzeyi (seviyeAyarla) ve spiker tekrar yorgunluğu (yedek grupta olasılıkla).
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function dunya(ek){const gainler=[],kaynaklar=[];const root=Object.assign({DT:{AYAR:{}},AudioContext:function(){this.state='running';this.currentTime=0;this.destination={};this.sampleRate=22050;
  this.createGain=()=>{const g={gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}},connect(){},disconnect(){}};gainler.push(g);return g;};
  this.createBiquadFilter=()=>({frequency:{value:0},Q:{value:0},type:'',connect(){}});this.createOscillator=()=>({frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}});
  this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n),duration:n/22050});this.createBufferSource=()=>{const s={buffer:null,playbackRate:{value:1},loop:false,connect(){},disconnect(){},start(){kaynaklar.push(s.buffer&&s.buffer.ad);},stop(){}};return s;};
  this.decodeAudioData=(h,ok)=>ok({duration:3,byteLength:h.byteLength,ad:h.ad});},addEventListener(){},setInterval(){return 1;}},ek||{});vm.createContext(root);
 for(const n of ['tezahurat','muzik','ses'])try{vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);}catch(e){}
 return{D:root.DT,gainler,kaynaklar,root};}
// 1) tezahurat: ana ses düzeyi çarpanı
{const w=dunya();w.D.tezahurat.seviyeAyarla(.5);w.D.tezahurat.ayarla(true);const ana=w.gainler[0];assert(Math.abs(ana.gain.value-.45)<1e-9,'tezahurat ana düzey .9×.5 = '+ana.gain.value);w.D.tezahurat.seviyeAyarla(0);assert.equal(ana.gain.value,0);w.D.tezahurat.seviyeAyarla(2);assert(Math.abs(ana.gain.value-.9)<1e-9,'1 üstü kısılır');w.D.tezahurat.seviyeAyarla(-1);assert.equal(ana.gain.value,0,'eksi kısılır');}
// 2) müzik
{const w=dunya();w.D.muzik.seviyeAyarla(.5);w.D.muzik.ayarla(true);const ana=w.gainler[0];assert(Math.abs(ana.gain.value-.55*.5)<1e-9,'müzik ana düzey: '+ana.gain.value);w.D.muzik.seviyeAyarla(1);assert(Math.abs(ana.gain.value-.55)<1e-9);}
// 3) efektler (ses.js)
{const w=dunya({fetch:async()=>({ok:false})});if(w.D.ses&&w.D.ses.seviyeAyarla){w.D.ses.seviyeAyarla(.25);w.D.ses.ayarla(true);const ana=w.gainler[0];assert(ana&&Math.abs(ana.gain.value-.8*.25)<1e-9,'efekt ana düzey .8×.25: '+(ana&&ana.gain.value));w.D.ses.seviyeAyarla(1);assert(Math.abs(ana.gain.value-.8)<1e-9);}else assert(false,'ses.seviyeAyarla yok');}
// 4) Spiker: tercih edilen grup varsa HER ZAMAN çalar; yalnız yedek grup varsa olasılıkla (1 kayıt ≈%55, 2 kayıt ≈%75, 3+ hep)
(async()=>{
 const kayit=(liste)=>async(u)=>{const m=String(u).match(/spiker-(gol|gollazo)-(\d+)\.mp3$/);const ad=m&&m[1]+m[2];return liste.includes(ad)?{ok:true,arrayBuffer:async()=>{const b=new ArrayBuffer(8);b.ad=ad;return b;}}:{ok:false};};
 const bekle=async()=>{for(let i=0;i<60;i++)await new Promise(r=>setTimeout(r,5));};
 const oran=async(liste,c,N)=>{const w=dunya({fetch:kayit(liste)});w.D.ses={acikMi:()=>true};w.D.tezahurat.ayarla(true);await bekle();let cal=0;for(let s=0;s<N;s++){const r=w.D.tezahurat.golSes(s*7919+13,c);if(r==='spiker')cal++;}return cal/N;};
 const bir=await oran(['gollazo1'],{},600),iki=await oran(['gollazo1','gollazo2'],{},600),uc=await oran(['gollazo1','gollazo2','gollazo3'],{},300);
 assert(bir>.45&&bir<.65,'tek yedek kayıt ≈%55: '+bir.toFixed(2));assert(iki>.67&&iki<.83,'iki yedek kayıt ≈%75: '+iki.toFixed(2));assert.equal(uc,1,'üç kayıt hep çalar');
 assert.equal(await oran(['gollazo1'],{sert:true},200),1,'büyük gol: gollazo grubu hep çalar');assert.equal(await oran(['gol1'],{},200),1,'sıradan gol: gol grubu hep çalar');assert.equal(await oran(['gol1'],{altin:1},600)<1,true,'büyük gol için yalnız gol grubu varsa yedek olasılığı');
 console.log('PASS ses modülleri: ana ses düzeyi çarpanları (tezahurat, müzik, efekt), kısıtlar; spiker tekrar yorgunluğu (yedek grupta olasılıkla, tercih edilen grupta hep)');
})().catch(e=>{console.error(e);process.exit(1)});
