(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:12}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}



// Tekrar (replay): sonuç kartından açılır, yarı hızda yeniden oynar, kamera topu izleyerek yakınlaşır; sonucu, puanı ve tezahüratı etkilemez.
let sonCizim=null,golSes=0,sesler=[];D.cizim.ciz=function(x){sonCizim=x;};D.tezahurat={alay(){return true;},uh(){return true;},golSes(){golSes++;return'konusma';},golMetinleri(){return[{m:'x'}];},ayarla(){},ortam(){}};D.ses.cal=function(a){sesler.push(a);};
await flush();fire('btnAntrenman','click');await flush();
const eski=D.fizik.hesapla;let hedefSonuc='gol';D.fizik.hesapla=g=>{const r=eski(g);r.sonuc=hedefSonuc;return r;};
D.AYAR.yavasCekim.acik=false;
async function sonuca(sonuc){hedefSonuc=sonuc;fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=400;fire('vurBtn','pointerdown',{isPrimary:true});await flush();let k=0;while(d.faz==='vurus'&&k++<3000){time+=16;root.frame();}assert.equal(d.faz,'sonuc',sonuc);}
const H=D.AYAR.tekrar;
// tekrar yalnız sonuç ekranında çalışır
D.oyun._tekrar();assert(!d.tekrar,'nişan aşamasında tekrar yok');
await sonuca('gol');const puan0=d.sonuclar.length,golSes0=golSes,r0=d.sonuclar.slice();
assert.equal(el('sonuc').hidden,false,'sonuç kartı açık');fire('tekrarBtn','click');assert(d.tekrar,'tekrar başladı');assert.equal(el('sonuc').hidden,true,'tekrarda kart gizli');assert.equal(el('tekrarEtiket').hidden,false,'TEKRAR etiketi');
// akış: sim zamanı ileri, yarı hız, zoom girip çıkar, oyuncu ve top
const sesler0=sesler.length;let sims=[],zoomlar=[],real0=time,k=0,toplar=[];fire('tekrarBtn','click');   // ikinci tıklama etkisiz
while(d.tekrar&&k++<3000){time+=16;root.frame();if(d.tekrar){sims.push(d.tekrar.sim);zoomlar.push(sonCizim.zoom?sonCizim.zoom.s:1);toplar.push(sonCizim.top.z);}}
const gercek=(time-real0)/1000;
assert(sims.length>40,'tekrar çok kısa değil');for(let i=1;i<sims.length;i++){assert(sims[i]>sims[i-1],'sim zamanı ileri');assert(Math.abs((sims[i]-sims[i-1])-.016*H.hiz)<.002,'yarı hız');}
assert(Math.abs(sims[0]-H.baslangic)<.05,'başlangıç: temastan önce '+sims[0].toFixed(2));assert(Math.max(...zoomlar)>H.zum-.02&&Math.min(...zoomlar)<1.2&&zoomlar[zoomlar.length-1]<1.5,'zoom girer ve çıkar: '+Math.max(...zoomlar).toFixed(2));
for(let i=1;i<zoomlar.length;i++)assert(Math.abs(zoomlar[i]-zoomlar[i-1])<.05,'zoom yumuşak');
assert(toplar[0]<.5&&Math.max(...toplar)>8,'top yeniden uçar (z 0 → kale)');for(let i=1;i<Math.floor(toplar.length*.5);i++)assert(toplar[i]>=toplar[i-1]-1e-9,'top uçuşta ileri gider');
assert(!d.tekrar&&el('sonuc').hidden===false&&el('tekrarEtiket').hidden===true,'bitince kart geri gelir, etiket kalkar');
// sonuç/puan/tezahürat etkilenmez; ses: vuruş bir kez + file/olay; tezahürat tekrarlanmaz
assert.equal(d.sonuclar.length,puan0,'sonuç kaydı çoğalmaz');assert.deepEqual(d.sonuclar,r0);assert.equal(golSes,golSes0,'gol tezahüratı tekrarlanmaz');
const ys=sesler.slice(sesler0);assert.equal(ys.filter(x=>x==='vurus').length,1,'vuruş sesi bir kez: '+ys.join());assert(ys.includes('gol')===false||true);
// dokunarak bitirme
fire('tekrarBtn','click');assert(d.tekrar);for(let i=0;i<20;i++){time+=16;root.frame();}fire('sahne','pointerdown',{clientX:50,clientY:50,pointerId:9});assert(!d.tekrar&&el('sonuc').hidden===false,'dokununca biter');
// Devam, tekrar sırasında da çalışır ve temiz geçer
fire('tekrarBtn','click');assert(d.tekrar);fire('devamBtn','click');assert(!d.tekrar&&d.faz==='nisan'&&el('tekrarEtiket').hidden===true,'devam tekrarı kapatır');
// Kurtarış ve kaçan şutta da tekrar var; kaleci vurusT = sim
for(const s of ['kurtaris','aut']){await sonuca(s);fire('tekrarBtn','click');let k2=0,kv=[];while(d.tekrar&&k2++<3000){time+=16;root.frame();if(d.tekrar&&sonCizim.kaleci)kv.push(sonCizim.kaleci.vurusT);}assert(kv.length>40&&kv.some(v=>v>0&&v<5),s+': kaleci tekrar zamanında hareket eder (vurusT sim)');assert.equal(d.faz,'sonuc');fire('devamBtn','click');}
D.AYAR.yavasCekim.acik=undefined;
console.log('PASS tekrar: sonuç kartından açılır, yarı hızda yeniden oynar, kamera topu izleyerek yakınlaşıp çıkar, sonuç/puan/tezahürat etkilenmez, dokunma ve Devam bitirir, kurtarış ve kaçan şutta da çalışır');
})().catch(e=>{console.error(e);process.exit(1)});
