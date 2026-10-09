// Tribün "ahhh": yalnız gerçek kayıtla çalar, sentez yok. ah.* varsa onu, yoksa gol.* kaydını yavaşlatıp kısarak, ikisi de yoksa çalmaz (false).
// Ses kapalıyken hiçbir düğüm oluşmaz. (Gerçek kayıt kulakla dinlenmedi.)
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sayac={osc:0,src:0,start:0};const Param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
const Node=()=>({connect(){},disconnect(){},start(){sayac.start++;},stop(){},gain:Param(),frequency:Param(),Q:Param(),playbackRate:Param(),type:'',buffer:null});
class AC{constructor(){this.sampleRate=8000;this.state='running';this.destination={};}get currentTime(){return 0;}createGain(){return Node();}createBiquadFilter(){return Node();}createOscillator(){sayac.osc++;return Node();}createBufferSource(){sayac.src++;return Node();}
 decodeAudioData(ham,ok){ok({duration:3.2,tag:Buffer.from(ham).toString()});}resume(){}}
function dunya(dosyalar){const istek=[];const root={AudioContext:AC,addEventListener(){},DT:{ses:{acikMi:()=>true}},
 fetch:async u=>{istek.push(u);const v=dosyalar[u.replace('assets/ses/','')];return v?{ok:true,arrayBuffer:async()=>Buffer.from(v)}:{ok:false};}};vm.createContext(root);
 vm.runInContext(fs.readFileSync(__dirname+'/../js/tezahurat.js','utf8'),root);return{T:root.DT.tezahurat,istek};}
const bekle=()=>new Promise(r=>setTimeout(r,20));
(async()=>{
 // ses kapalı: yükleme ve çalma yok
 let w=dunya({'ah.mp3':'AH'});assert.equal(w.T.uh(),false);assert.equal(sayac.src+sayac.osc,0);assert.equal(w.istek.length,0,'ses kapalıyken indirme yok');
 // ah.mp3 var: o çalınır
 w=dunya({'ah.mp3':'AH','gol.mp3':'GOL'});w.T.ayarla(true);await bekle();assert(w.T._test().ah&&!w.T._test().gol,'ah.* bulundu');assert.equal(w.T.uh(),true);assert.equal(sayac.osc,0,'osilatör yok: sentez kullanılmaz');assert(sayac.src>=1&&sayac.start>=1);
 // yalnız gol.ogg var: türetilir
 sayac.src=0;sayac.start=0;w=dunya({'gol.ogg':'GOL'});w.T.ayarla(true);await bekle();assert(w.T._test().gol&&!w.T._test().ah);assert.equal(w.T.uh(),true);assert(sayac.src>=1);assert(w.istek.some(u=>u==='assets/ses/ah.mp3')&&w.istek.some(u=>u==='assets/ses/gol.ogg'));
 // hiçbiri yok: çalmaz, oyun eski kısa 'ah'a düşer
 sayac.src=0;w=dunya({});w.T.ayarla(true);await bekle();assert.equal(w.T.uh(),false);assert.equal(sayac.src,0);
 // eski sentez API'si boş
 w.T.tezahurat();w.T.ortam(true);assert.equal(sayac.osc,0);
 // oyun bağlantısı
 const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/r\.sonuc==='direk_disari'&&DT\.tezahurat\)an\.uh=DT\.tezahurat\.uh\(\)/.test(oyun));assert(/r\.sonuc !== 'aut' && !an\.uh\) DT\.ses\.cal\('ah'\)/.test(oyun));
 console.log('PASS tribün ahhh: yalnız gerçek kayıt (ah.* → gol.* türevi → sessiz/eski ah), sentez yok, ses kapalıyken indirme ve çalma yok');
})().catch(e=>{console.error(e);process.exit(1)});
