(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:9}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}
fire('btnResmi','click');await flush();
// Ok tuşlarıyla anlık yön: basılı tutunca döner, bırakınca durur, sınırda kalır, Tamam ile güç paneline geçer.
function kare(ms){time+=ms;if(root.frame)root.frame(time);}
assert.equal(d.faz,'nisan');fire('durusAc','click');assert(!el('durusPanel').hidden);assert.equal(d.durus,0);
fire('yonSag','pointerdown',{pointerId:1,preventDefault(){}});for(let i=0;i<30;i++)kare(16);
assert(d.durus>.3&&d.durus<.5,'0,5 sn basılı sağ ok ≈0,43: '+d.durus);assert(!d.durusHazir,'dönerken onay yok');assert(/^Sağa · \d+°$/.test(el('yonAci').textContent),el('yonAci').textContent);
fire('yonSag','pointerup',{});const dur=d.durus;for(let i=0;i<20;i++)kare(16);assert.equal(d.durus,dur,'bırakınca durur');
fire('yonSol','pointerdown',{pointerId:2,preventDefault(){}});for(let i=0;i<300;i++)kare(16);assert.equal(d.durus,-1,'sol sınırda kalır');fire('yonSol','pointercancel',{});
// klavye

fire('yonTamam','click');assert(d.durusHazir&&el('durusPanel').hidden&&!el('gucPanel').hidden,'Tamam güç paneline geçer');
fire('yonSag','pointerdown',{pointerId:3,preventDefault(){}});for(let i=0;i<20;i++)kare(16);assert.equal(d.durus,-1,'onaydan sonra ok yönü değiştirmez');fire('yonSag','pointerup',{});
console.log('PASS ok tuşu: basılı tut-dön, bırak-dur, sınır, onay, onay sonrası kilit');
})().catch(e=>{console.error(e);process.exit(1)});
