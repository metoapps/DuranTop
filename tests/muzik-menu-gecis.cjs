const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const source=fs.readFileSync(__dirname+'/../js/muzik.js','utf8');
function world(extra={}){let now=0,tick;const nodes=[],gains=[],events={};
 const doc={hidden:false,addEventListener(k,f){events[k]=f}};
 function param(){return{value:1,events:[],setValueAtTime(v,t){this.value=v;this.events.push(['set',v,t])},linearRampToValueAtTime(v,t){this.events.push(['ramp',v,t])},exponentialRampToValueAtTime(v,t){this.events.push(['exp',v,t])},cancelScheduledValues(t){this.events.push(['cancel',t])}}}
 function AC(){this.currentTime=0;Object.defineProperty(this,'currentTime',{get:()=>now});this.state='running';this.sampleRate=8000;this.destination={};this.resume=()=>Promise.resolve();this.createGain=()=>{let n={gain:param(),connect(){},disconnect(){n.disconnected=true}};gains.push(n);return n};
 const make=()=>{let n={frequency:param(),playbackRate:{value:1},connect(){},disconnect(){},start(t=now){n.startT=t},stop(t=now){n.stopT=t}};nodes.push(n);return n};this.createOscillator=make;this.createBufferSource=make;this.createBiquadFilter=()=>({frequency:param(),Q:param(),connect(){}});this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n)});this.decodeAudioData=async()=>({duration:30});}
 const root={DT:{ses:{acikMi:()=>true}},AudioContext:AC,document:doc,setInterval(f){tick=f;return 1},addEventListener(){},...extra};vm.createContext(root);vm.runInContext(source,root);return{M:root.DT.muzik,root,nodes,gains,advance(seconds){let end=now+seconds;while(now<end){now=Math.min(end,now+.025);if(tick)tick()}},jump(seconds){now+=seconds;if(tick)tick()},hide(v){doc.hidden=v;events.visibilitychange()},time:()=>now};}
// Three independent compositions, bounded signal and no change to match/FX data.
const w=world(),M=w.M,menus=Object.keys(M.PARCALAR).filter(k=>k.startsWith('menu'));
assert.equal(menus.length,3);assert.equal(new Set(menus.map(k=>M.PARCALAR[k].bpm)).size,3);
const fingerprints=new Set();for(const ad of menus){const e=M.olayUret(ad),end=M.bolumMs(ad);fingerprints.add(JSON.stringify(e));assert(e.every(x=>x.t>=0&&x.t<end&&x.sure>0));const data=M.render(e,end+.7,8000);let peak=0,sum=0;for(const x of data){assert(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));sum+=x*x}const rms=Math.sqrt(sum/data.length);assert(peak<.95&&rms>.03&&rms<.25,ad+' peak/RMS: '+peak+'/'+rms);}
assert.equal(fingerprints.size,3);
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
assert.equal(hash(M.olayUret('mac')),'4448d0e39b43741ac1e061451ddf852341a72fd77c4708fdc03e99be89ad0f02');assert.equal(hash(M.EFEKT),'367894def01651f400fe320449b8c17862c189b3f9db21b8e6c08ce6b85dd944');
// First menu, no restart from repeated screen events, rotation, match and re-entry.
M.sahne('menu');M.ayarla(true);w.advance(.2);assert.equal(M._durum().parca,'menu');const gainCount=w.gains.length;M.sahne('menu');assert.equal(w.gains.length,gainCount);
w.advance(M.bolumMs('menu'));assert.equal(M._durum().parca,'menu-gece');w.advance(M.bolumMs('menu-gece'));assert.equal(M._durum().parca,'menu-tribun');
M.sahne('mac');w.advance(.2);assert.equal(M._durum().parca,'mac');M.sahne('menu');w.advance(.2);assert.equal(M._durum().parca,'menu');
const born=w.nodes.filter(n=>n.startT!==undefined);M.muzikAyarla(false);assert.equal(M._durum().calan,null);assert(born.every(n=>n.stopT<=w.time()),'mute stops current AND fading music, including scheduled notes');
const n=w.nodes.length;w.advance(2);assert.equal(w.nodes.length,n);M.muzikAyarla(true);w.advance(.2);assert.equal(M._durum().calan,'menu');
w.hide(true);const n2=w.nodes.length;w.advance(90);assert.equal(w.nodes.length,n2,'hidden phone/browser tab stays silent');w.hide(false);w.advance(.2);assert.equal(M._durum().calan,'menu');
M.sahne('mac');w.jump(60*60);assert(w.nodes.length-n2<100,'late scheduler skips stale notes, no accumulated playback burst');
M.sahne('sessiz');w.advance(2);assert.equal(M._durum().calan,null);M.ayarla(false);const n3=w.nodes.length;w.advance(3);assert.equal(w.nodes.length,n3);
// Delayed download upgrades only the currently playing track; recorded menu uses its actual duration.
(async()=>{let resolve;const a=world({fetch:u=>u.endsWith('menu-eighties-20261019c.mp3')?new Promise(r=>resolve=r):Promise.resolve({ok:false})});a.M.sahne('menu');a.M.ayarla(true);a.advance(.2);assert(!a.M._durum().gercek);resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});for(let i=0;i<20;i++)await Promise.resolve();assert(a.M._durum().gercek);a.advance(23);assert.equal(a.M._durum().parca,'menu','30-second recording must not stop at synthetic 18-second boundary');a.advance(8);assert.equal(a.M._durum().parca,'menu-gece');assert.equal(a.M._durum().gercek,false);
 console.log('PASS 3 distinct menu tracks; rendered peaks/RMS; original match/FX; rotation and crossfade; mute all tails; phone visibility; stalled scheduler; late recording and actual duration');})().catch(e=>{console.error(e);process.exit(1)});
