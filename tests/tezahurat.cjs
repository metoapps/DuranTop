// Tribün sesleri: ses kapalıyken hiçbir ses düğümü kurulmaz; açıkken ortam uğultusu döner, tezahürat alkış+koro çalar,
// direkten dönen topta "ahhh" (perdesi düşen koro) çalar; ekrandan çıkınca ortam durur. (Sentez; kulakla dinlenmedi.)
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let sayac={osc:0,buf:0,start:0,stop:0,ramp:0};const zaman={t:0};
function Param(){return{value:0,setValueAtTime(){},linearRampToValueAtTime(){sayac.ramp++;},exponentialRampToValueAtTime(){sayac.ramp++;}};}
function Node(){return{connect(){},disconnect(){},start(){sayac.start++;},stop(){sayac.stop++;},gain:Param(),frequency:Param(),Q:Param(),type:'',buffer:null,loop:false};}
class AC{constructor(){this.sampleRate=8000;this.state='running';this.destination={};}get currentTime(){return zaman.t;}createGain(){return Node();}createBiquadFilter(){return Node();}
 createOscillator(){sayac.osc++;return Node();}createBufferSource(){sayac.buf++;return Node();}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)};}resume(){}}
let acik=false;const timers=[];const root={AudioContext:AC,setTimeout:(f,ms)=>{timers.push(f);return timers.length;},clearTimeout(){},addEventListener(){},DT:{ses:{acikMi:()=>acik}}};vm.createContext(root);
vm.runInContext(fs.readFileSync(__dirname+'/../js/tezahurat.js','utf8'),root);const T=root.DT.tezahurat;
T.ortam(true);assert.equal(T.uh(),false);assert.equal(sayac.osc+sayac.buf,0,'ses kapalı: düğüm yok');
acik=true;T.ayarla(true);assert(T._test().ortam,'açılınca ortam uğultusu başlar');assert(timers.length>=1,'tezahürat zamanlanır');
const o1=sayac.osc;T.tezahurat();assert(sayac.osc>o1+15&&sayac.buf>10,'tezahürat: koro ve alkış');
const o2=sayac.osc;assert.equal(T.uh(),true);assert(sayac.osc>=o2+20,'ahhh: kalabalık koro');
T.ortam(false);assert(!T._test().ortam,'oyun ekranından çıkınca ortam durur');
acik=false;const o3=sayac.osc;T.tezahurat();assert.equal(sayac.osc,o3,'ses kapanınca tezahürat yok');
// Oyun bağlantısı: direkten dönen topta uh, ve aynı anda tekil "ah" çalınmaz.
const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/r\.sonuc==='direk_disari'&&DT\.tezahurat\)an\.uh=DT\.tezahurat\.uh\(\)/.test(oyun));assert(/r\.sonuc !== 'aut' && !an\.uh\) DT\.ses\.cal\('ah'\)/.test(oyun));
assert(/DT\.tezahurat\.ortam\(ad === 'oyun'\)/.test(oyun));
console.log('PASS tezahürat: kapalıyken sessiz, ortam/tezahürat/ahhh düğümleri, ekran ve ses düğmesine bağlı, direkte ahhh');
