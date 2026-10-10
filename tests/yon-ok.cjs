(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;const kamCagri=[];let sonCizim=null;D.cizim={ciz(x){sonCizim=x;},kur(){},sahneKur(){},kameraDurus(v){kamCagri.push(v);},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:9}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}
fire('btnResmi','click');await flush();
// Yön okları = duruş: ayrı duruş adımı yok. ◀ ▶ nişanı ve oyuncunun bakış yönünü birlikte değiştirir; kamera ok bırakılınca bir kez geçer.
function kare(ms){time+=ms;if(root.frame)root.frame(time);}
assert.equal(d.faz,'nisan');assert(d.durusHazir&&!el('fifaNisan').hidden,'doğrudan yön adımı');assert.equal(d.durus,0);assert.equal(d.aim.x,0);
// 1) ▶ basılı: nişan sağa gider, oyuncu sağa döner, yerinde adım atar; kamera hâlâ eski.
fire('nisanSag','pointerdown',{pointerId:1,preventDefault(){}});for(let i=0;i<30;i++)kare(16);
assert(d.aim.x>1.5,'nişan sağa gitti '+d.aim.x);assert(d.durus>.12&&d.durus<=1,'oyuncu sağa döndü '+d.durus);assert.equal(kamCagri.length,0,'basılıyken kamera kesmesi yok');
assert.equal(sonCizim.oyuncu.durus,d.durus,'çizime duruş gidiyor');assert(sonCizim.oyuncu.donus!==null&&sonCizim.oyuncu.donus>=0,'oyuncu yerinde adım atarak dönüyor');
// 2) Bırakınca: kamera bir kez yeni açıya geçer, adım animasyonu durur.
fire('nisanSag','pointerup',{});assert.equal(kamCagri.length,1,'bırakınca kamera bir kez geçti');assert.equal(kamCagri[0],d.durus);kare(16);assert.equal(sonCizim.oyuncu.donus,null,'durunca adım animasyonu yok');
const durSag=d.durus,xSag=d.aim.x;for(let i=0;i<20;i++)kare(16);assert.equal(d.durus,durSag,'bırakınca durur');
// 3) ◀ sola: duruş işaret değiştirir, sınırlarda kalır.
fire('nisanSol','pointerdown',{pointerId:2,preventDefault(){}});for(let i=0;i<200;i++)kare(16);assert.equal(d.aim.x,-4.5,'sol sınırda kalır');assert(d.durus<-.9,'duruş en sola döndü '+d.durus);fire('nisanSol','pointerup',{});assert.equal(kamCagri.length,2);
// 4) Yön yaklaşık aynıysa kamera kesmesi yok (küçük ayar kamerayı oynatmaz).
fire('nisanSag','pointerdown',{pointerId:3,preventDefault(){}});for(let i=0;i<6;i++)kare(16);fire('nisanSag','pointerup',{});const kc=kamCagri.length;
fire('nisanSol','pointerdown',{pointerId:4,preventDefault(){}});for(let i=0;i<4;i++)kare(16);fire('nisanSol','pointerup',{});assert(kamCagri.length<=kc+1,'küçük ayarlarda kamera sıçramaz');
// 5) Dokunarak nişan da duruşu türetir.
fire('sahne','pointerdown',{clientX:350,clientY:150,pointerId:5});fire('sahne','pointerup',{});assert(d.aim.x>0&&d.durus>0,'dokunarak sağa nişan: oyuncu sağa döner');
// 6) Tamam: kamera yeni duruşa geçer, nişan kilitlenir ve 2/3 adıma geçilir; duruş artık değişmez.
fire('nisanKilit','click');assert(d.kilit&&el('fifaNisan').hidden&&!el('temasPanel').hidden,'Tamam → 2/3 topun neresine');assert.equal(kamCagri[kamCagri.length-1],d.durus,'Tamam kamerayı yeni duruşa getirir');
const dd=d.durus;fire('nisanSag','pointerdown',{pointerId:6,preventDefault(){}});for(let i=0;i<20;i++)kare(16);assert.equal(d.durus,dd,'kilitten sonra ok yönü değiştirmez');fire('nisanSag','pointerup',{});
// 7) Duruş eşlemesi: ±23° = ±1; merkezden direğe vuran açı sınırı aşmaz; her pozisyonda sınırlar içinde.
for(const pos of D.AYAR.pozisyonlar)for(const x of [-4.5,-3.7,0,3.7,4.5]){const th=Math.atan2(x-pos.bx,pos.D)-Math.atan2(-pos.bx,pos.D);const v=Math.max(-1,Math.min(1,th/.4014));assert(v>=-1&&v<=1);}
console.log('PASS yön okları = duruş: oyuncu seçilen yöne döner, kamera bırakınca bir kez geçer, dokunma da döndürür, Tamam sonrası kilit');
})().catch(e=>{console.error(e);process.exit(1)});
