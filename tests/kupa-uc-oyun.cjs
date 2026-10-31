(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','ruzgar','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[],kupaAcik:true,oyun:{hak:3,vurus:10}};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:13}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}


// Kupa 3 oyun: 10. vuruştan sonra tur BİTMEZ; "Sonraki oyun (2/3)" ile aynı oturumda 2. oyun başlar, sunucuya giden vuruş numarası 10'dan devam eder.
await flush();fire('turMenu','click');
fire('btnResmi','click');await flush();assert.equal(d.ekran,'oyun');assert.equal(d.oyunNo||0,0);
d.idx=9;d.faz='sonuc';d.sonuclar=Array.from({length:10},(_,i)=>({ad:'P'+i,sonuc:'gol',puan:100,gol:true,yesil:false}));
D.oyun._devam();assert.equal(d.ekran,'tursonu','1. oyun bitince tur sonu ekranı');
assert.equal(el('turTekrar').hidden,false,'kupada oyun kaldıysa sonraki oyun düğmesi görünür');assert.equal(el('turTekrar').textContent,'Sonraki oyun (2/3)');assert(/^Oyun 1\/3/.test(el('turBaslik').textContent));
fire('turTekrar','click');assert.equal(d.ekran,'oyun','sonraki oyun başladı');assert.equal(d.oyunNo,1);assert.equal(d.idx,0);assert.equal(d.sonuclar.length,0);
let gonderilen=-1;D.live.shot=async(p,idx)=>{gonderilen=idx;const e=Error('x');e.code='CLOSED';throw e;};root.alert=()=>{};
fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=700;root.frame();time+=400;fire('fifaTik','pointerdown',{isPrimary:true});await flush();
assert.equal(gonderilen,10,'2. oyunun ilk vuruşu sunucuya 10 numarasıyla gider');
// Son oyun (3/3) bitince sonraki oyun düğmesi gizli.
d.mod='resmi';d.oyunNo=2;d.idx=9;d.faz='sonuc';d.ekran='oyun';d.sonuclar=Array.from({length:10},(_,i)=>({ad:'P'+i,sonuc:'kurtaris',puan:0,gol:false,yesil:false}));
D.oyun._devam();assert.equal(d.ekran,'tursonu');assert.equal(el('turTekrar').hidden,true,'3. oyundan sonra sonraki oyun yok');
// Tek oyunluk (eski sunucu) kupada davranış aynı: oyun alanı yoksa 10 vuruşta biter.
delete state.oyun;d.oyunNo=0;d.idx=9;d.faz='sonuc';d.ekran='oyun';D.oyun._devam();assert.equal(el('turTekrar').hidden,true,'eski sunucuda sonraki oyun yok');
// Kural 15: sunucu kurallar:15 bildirirse kupada rüzgâr vardır (oda+vuruştan, sunucuyla aynı), girdiye ruzgarKupa girer; kural 14'te rüzgâr yok.
state.oyun={hak:3,vurus:10};state.kurallar=15;state.players[0].idx=10;state.players[0].entries=Array.from({length:10},()=>({puan:0,gol:false}));
fire('turMenu','click');fire('btnResmi','click');await flush();assert.equal(d.ekran,'oyun');assert.equal(d.oyunNo,1);
const bekle=D.ruzgar.kupa('test',10);assert.deepEqual({vx:d.ruzgar.vx,vz:d.ruzgar.vz},{vx:bekle.vx,vz:bekle.vz},'kupa rüzgârı oda+vuruş 10dan');
let yakalanan=null;D.live.shot=async(p,idx,g)=>{yakalanan=g;const e=Error('x');e.code='CLOSED';throw e;};
fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=700;root.frame();time+=400;fire('fifaTik','pointerdown',{isPrimary:true});await flush();
assert(yakalanan&&Array.isArray(yakalanan.ruzgarKupa)&&yakalanan.ruzgarKupa[0]===bekle.vx&&yakalanan.ruzgarKupa[1]===bekle.vz,'fizik girdisi kupa rüzgârını taşır');
state.kurallar=14;fire('turMenu','click');fire('btnResmi','click');await flush();assert.equal(d.ruzgar,null,'kural 14te kupada rüzgâr yok');
console.log('PASS kupa 3 oyun: 10. vuruştan sonra sonraki oyun düğmesi, 2. oyun vuruş numarası 10, 3. oyundan sonra bitiş, eski sunucuda tek oyun');
})().catch(e=>{console.error(e);process.exit(1)});
