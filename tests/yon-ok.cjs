(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;const kamCagri=[];let sonCizim=null;D.cizim={ciz(x){sonCizim=x;},kur(){},sahneKur(){},kameraDurus(v){kamCagri.push(v);},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:9}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}
fire('btnResmi','click');await flush();
// Duruş (vücut) ve nişan (topun gideceği yer) AYRI: vücut okları yalnız duruşu, nişan okları yalnız hedefi değiştirir. İkisi aynı ekranda.
function kare(ms){time+=ms;if(root.frame)root.frame(time);}
assert.equal(d.faz,'nisan');assert(d.durusHazir&&!el('fifaNisan').hidden,'pozisyon açılınca doğrudan 1/3 ekranı');assert.equal(d.durus,0);assert.equal(d.aim.x,0);const y0=d.aim.y;
assert(/Düz/.test(el('yonAci').textContent),'gösterge: '+el('yonAci').textContent);
// 1) Vücut ▶ basılı: yalnız duruş döner, nişan aynı; basılıyken kamera kesmesi yok; yerinde adım atar.
fire('yonSag','pointerdown',{pointerId:1,preventDefault(){}});for(let i=0;i<30;i++)kare(16);
assert(d.durus>.3&&d.durus<.5,'0,5 sn ≈0,43: '+d.durus);assert.equal(d.aim.x,0,'vücut oku nişanı değiştirmez');assert.equal(d.aim.y,y0);assert.equal(kamCagri.length,0);
assert(/^Sağa · \d+°$/.test(el('yonAci').textContent),el('yonAci').textContent);assert.equal(sonCizim.oyuncu.durus,d.durus);assert(sonCizim.oyuncu.donus!==null&&sonCizim.oyuncu.donus>=0,'oyuncu yerinde adım atıyor');
fire('yonSag','pointerup',{});assert.equal(kamCagri.length,1,'bırakınca kamera bir kez geçti');assert.equal(kamCagri[0],d.durus);kare(16);assert.equal(sonCizim.oyuncu.donus,null,'durunca adım animasyonu yok');
const dur=d.durus;for(let i=0;i<20;i++)kare(16);assert.equal(d.durus,dur,'bırakınca durur');
// 2) Nişan ▶ basılı: yalnız hedef değişir, duruş ve kamera aynı.
const x1=d.aim.x;fire('nisanSag','pointerdown',{pointerId:2,preventDefault(){}});for(let i=0;i<30;i++)kare(16);fire('nisanSag','pointerup',{});
assert(d.aim.x>x1+1.5,'nişan sağa gitti '+d.aim.x);assert.equal(d.durus,dur,'nişan oku duruşu değiştirmez (vücut sağa dönük değilse bile top sağa gidebilir)');assert.equal(kamCagri.length,1,'nişan kamerayı oynatmaz');
// 3) Tersi: vücut tam sola, nişan sağda: ikisi birbirinden bağımsız.
fire('yonSol','pointerdown',{pointerId:3,preventDefault(){}});for(let i=0;i<200;i++)kare(16);fire('yonSol','pointerup',{});assert.equal(d.durus,-1,'vücut en sola döndü');assert(d.aim.x>x1+1.5,'nişan hâlâ sağda: '+d.aim.x);
// 4) Dokunarak nişan duruşu değiştirmez.
const dd=d.durus;fire('sahne','pointerdown',{clientX:350,clientY:150,pointerId:4});fire('sahne','pointerup',{});assert.equal(d.durus,dd,'dokunarak nişan duruşu değiştirmez');
// 5) Rastgele karışık işlemler: duruş yalnız vücut oklarıyla, nişan yalnız nişan/dokunmayla değişir.
let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
for(let k=0;k<40;k++){const op=Math.floor(rnd()*4),n=3+Math.floor(rnd()*20),dur0=d.durus,aim0=JSON.stringify(d.aim);
 const id=['yonSol','yonSag','nisanSol','nisanYukari'][op];fire(id,'pointerdown',{pointerId:10+k,preventDefault(){}});for(let i=0;i<n;i++)kare(16);fire(id,'pointerup',{});
 if(op<2){assert.equal(JSON.stringify(d.aim),aim0,'vücut oku nişanı değiştirmedi');}else{assert.equal(d.durus,dur0,'nişan oku duruşu değiştirmedi');}}
// 6) Tamam: ikisi birlikte kilitlenir, 2/3'e geçilir; sonra vücut oku bir şey yapmaz.
fire('nisanKilit','click');assert(d.kilit&&el('fifaNisan').hidden&&!el('temasPanel').hidden,'Tamam → 2/3 topun neresine');assert.equal(kamCagri[kamCagri.length-1],d.durus,'kamera son duruşta');
const d2=d.durus;fire('yonSag','pointerdown',{pointerId:99,preventDefault(){}});for(let i=0;i<20;i++)kare(16);fire('yonSag','pointerup',{});assert.equal(d.durus,d2,'kilitten sonra vücut oku etkisiz');
console.log('PASS duruş ve nişan ayrı: vücut okları yalnız duruşu, nişan okları yalnız hedefi değiştirir; kamera vücut oku bırakılınca bir kez geçer; 40 karışık işlemde bağımsız; Tamam sonrası kilit');
})().catch(e=>{console.error(e);process.exit(1)});
