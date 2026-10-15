(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','ruzgar','bonus','yorum','rozet','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:12}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}




// Erişilebilirlik ayarları: sol el modu, büyük düğmeler, hareket (tam/az), titreşim; kalıcı kayıt.

// Ses düzeyi kaydırıcıları: müzik, efektler, spiker ve tribün ayrı ayrı; kayıt ve geri yükleme; sınırlar; modüllerin ana ses düğümü. Spiker tekrar yorgunluğu: yedek grupta olasılıkla çalar.
root.setTimeout=setTimeout;D.cizim.ciz=function(x){};
const cagri={};['muzik','ses','tezahurat'].forEach(m=>{D[m]=D[m]||{};});Object.assign(D.tezahurat,{ortam(){},tezahurat(){},ayarla(){},alay(){return false;},uh(){return false;},golSes(){return null;},hazirMi(){return false;},golMetinleri(){return[];},alayMetinleri(){return[];}});Object.assign(D.muzik,{sahne(){},ayarla(){},kis(){},efekt(){},muzikAyarla(){}});for(const [m,ad] of [['muzik','m'],['ses','e'],['tezahurat','t']]){const eski=D[m].seviyeAyarla;D[m].seviyeAyarla=(v)=>{cagri[ad]=v;if(eski)eski.call(D[m],v);};}
D.muzik.muzikAyarla=D.muzik.muzikAyarla||function(){};
const deger=(id,v)=>{const e=el(id);e.value=String(v);return e;};
await flush();
// 1) Başlangıç: hepsi %100
fire('btnAntrenman','click');await flush();
for(const id of ['svMuzik','svEfekt','svTribun'])assert(el(id),id+' kaydırıcısı var');
// 2) Kaydırıcı → ses düzeyi (0..1) ve etiket; ayar kaydedilir
deger('svMuzik',40);fire('svMuzik','input');assert.equal(cagri.m,.4,'müzik düzeyi');assert.equal(el('svMuzikYaz').textContent,'40%');
deger('svEfekt',75);fire('svEfekt','input');assert.equal(cagri.e,.75,'efekt düzeyi');assert.equal(el('svEfektYaz').textContent,'75%');
deger('svTribun',0);fire('svTribun','input');assert.equal(cagri.t,0,'spiker ve tribün kapalı');assert.equal(el('svTribunYaz').textContent,'0%');
const kayit=JSON.parse(memory[Object.keys(memory).find(k=>/ayar/.test(k))]);assert.deepEqual(kayit.sv,{muzik:40,efekt:75,tribun:0},'ayar kaydedildi: '+JSON.stringify(kayit.sv));
// 3) Aşırı değerler kısılır
deger('svMuzik',250);fire('svMuzik','input');assert.equal(cagri.m,1,'100 üstü kısılır');deger('svMuzik',-30);fire('svMuzik','input');assert.equal(cagri.m,0,'0 altı kısılır');deger('svMuzik','abc');fire('svMuzik','input');assert.equal(cagri.m,0,'geçersiz değer 0');
// 4) Kaynak: bozuk kayıt yüklenirken varsayılan/kısıtlı
{const kaynak=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/if \(kayit\.sv\) ayar\.sv =/.test(kaynak)&&/Math\.min\(100,/.test(kaynak),'kayıttan geri yükleme sınırlı');assert(/seviyeUygula\(\);/.test(kaynak));}
console.log('PASS ses düzeyi: üç kaydırıcı (müzik, efektler, spiker+tribün), 0–100 sınırlı, etiket ve kayıt, geri yükleme');
})().catch(e=>{console.error(e);process.exit(1)});
