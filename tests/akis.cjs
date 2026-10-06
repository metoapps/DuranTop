(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:9}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}
fire('btnResmi','click');await flush();
for(let i=0;i<10;i++){
 assert.equal(d.idx,i);assert.equal(d.faz,'nisan');assert(el('durusPanel').hidden);assert(!el('hazirlikPanel').hidden);
 fire('sahne','pointerdown',{clientX:105,clientY:65,pointerId:1});assert.equal(d.aim,null);
 fire('durusAc','click');assert(!el('durusPanel').hidden);fire(['durusSol','durusDuz','durusSag'][i%3],'click');assert.equal(d.durusHazir,i%3===1,'unchanged stance skips artificial walking');
 time+=1200;root.frame();assert(d.durusHazir);
 if(d.pos.tip==='frikik'){
  // FIFA 2003 tarzı frikik: güç paneli yok; okla nişan → kilitle → falso → basılı tut-bırak güç → yeşilde bas.
  assert(el('gucPanel').hidden,'frikikte güç paneli yok');assert(!el('fifaNisan').hidden);assert(d.gucHazir);assert(d.aim&&d.aim.x===0&&d.aim.y===1.6);
  fire('sahne','pointerdown',{clientX:105,clientY:65,pointerId:1});fire('sahne','pointerup');assert(!d.kilit,'kaleye dokunmak FIFA modunda kilitlemez');const x0=d.aim.x;
  fire('nisanSag','pointerdown',{pointerId:4,preventDefault(){}});for(let k=0;k<31;k++){time+=16;root.frame();}fire('nisanSag','pointerup');assert(Math.abs(d.aim.x-x0-1.0)<.1,'0,5 sn sağ ok ≈1 m: '+(d.aim.x-x0));
  fire('nisanYukari','pointerdown',{pointerId:5,preventDefault(){}});for(let k=0;k<400;k++){time+=16;root.frame();}fire('nisanYukari','pointerup');assert.equal(d.aim.y,3.1,'üst sınır');
  fire('nisanAsagi','pointerdown',{pointerId:6,preventDefault(){}});for(let k=0;k<60;k++){time+=16;root.frame();}fire('nisanAsagi','pointerup');assert(d.aim.y<2.2&&d.aim.y>1.9);
  fire('nisanKilit','click');assert(d.kilit);assert(el('fifaNisan').hidden);assert(!el('temasPanel').hidden);
  fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(shots,i);assert(!d.fifa.faz,'falso seçilmeden sayaç başlamaz');
  fire('temasTop','pointerdown',{clientX:170,clientY:120,pointerId:2});fire('temasTop','pointerup');fire('temasOnay','click');assert(!el('alt').hidden);assert(!el('fifaKutu').hidden);assert(el('cubukKutu').hidden);
  if(i===5){fire('duzeltBtn','click');assert(!el('fifaNisan').hidden);assert(!d.kilit);fire('nisanKilit','click');fire('temasOnay','click');}
  fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(d.fifa.faz,'guc');time+=550;root.frame();fire('vurBtn','pointerup');assert.equal(d.fifa.faz,'isabet');assert(Math.abs(d.guc-.65)<.02,'yarım dolu güç ≈%65: '+d.guc);assert.equal(shots,i,'bırakmak vurmaz');
  if(i===6){time+=900;root.frame();assert.equal(d.faz,'gonderiliyor','ibre sona varınca en kötü zamanlamayla vurulur');}
  else{time+=400;fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(d.faz,'gonderiliyor');}
  fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(shots,i+1);
 }else{
 assert(!el('gucPanel').hidden);
 fire('sahne','pointerdown',{clientX:105,clientY:65,pointerId:1});assert.equal(d.aim,null,'target remains disabled before power');
 el('gucSec').value=[100,80,30,100,80][i%5];fire('gucSec','input');fire('gucOnay','click');assert.equal(d.guc,[1,.8,.3,1,.8][i%5]);assert(el('gucPanel').hidden);
 fire('sahne','pointerdown',{clientX:105,clientY:65,pointerId:1});fire('sahne','pointerup');assert(!el('temasPanel').hidden);
 const oldPower=d.guc;fire('temasTop','pointerdown',{clientX:170,clientY:120,pointerId:2});fire('temasTop','pointerup');assert.equal(d.guc,oldPower);
 assert(!/Güçlü|Hafif/.test(el('temasNot').textContent));fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(shots,i);
 fire('temasOnay','click');assert(el('gucPanel').hidden,'no second power question');assert(!el('alt').hidden);
 if(i===0){const power=d.guc;fire('duzeltBtn','click');assert(d.gucHazir);assert.equal(d.guc,power);fire('sahne','pointerdown',{clientX:105,clientY:65,pointerId:1});fire('sahne','pointerup');fire('temasOnay','click');}
 time=d.cubukBasla+400;fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(d.faz,'gonderiliyor');fire('vurBtn','pointerdown',{isPrimary:true});assert.equal(shots,i+1);
 }
 await flush();assert.equal(d.faz,'vurus');time+=15000;root.frame();assert.equal(d.faz,'sonuc');fire('devamBtn','click');}

assert.deepEqual(state.players[0].entries.slice(5).map(e=>e.input.zaman),[.5,1,.5,.5,.5],'FIFA sayacı zamanlamayı ibreden alır');assert(state.players[0].entries.slice(5).every(e=>Math.abs(e.input.guc-.65)<.02&&e.input.aim.y<2.2));
assert.equal(state.players[0].idx,10);assert.equal(state.players[0].entries.length,10);assert.equal(shots,10);assert.equal(d.ekran,'tursonu');assert(el('turNot').textContent.includes('otomatik'));console.log('PASS live cup flow; approach→3D walk→power→target→contact→timing; server wait; duplicate-press guard; ten automatic saves; result screen');
})().catch(e=>{console.error(e);process.exit(1)});
