(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','ruzgar','bonus','yorum','rozet','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:12}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}




// Erişilebilirlik ayarları: sol el modu, büyük düğmeler, hareket (tam/az), titreşim; kalıcı kayıt.
root.setTimeout=setTimeout;D.cizim.ciz=function(x){};const eski=D.fizik.hesapla;let hedef=null;D.fizik.hesapla=g=>{const r=eski(g);if(hedef){r.sonuc=hedef.sonuc;r.gecis={x:0,y:1};}return r;};D.puan.puanla=(tip,r)=>({puan:r.sonuc==='gol'?5:0,taban:5,zaman:0,zor:0,gol:r.sonuc==='gol'});
const sinif=(id)=>{const e=el(id);e.classList={kume:new Set(),toggle(c,v){(v===undefined?!this.kume.has(c):v)?this.kume.add(c):this.kume.delete(c);},has(c){return this.kume.has(c);}};return e;};
sinif('oyun');['btnSolEl','btnBuyuk','btnHareket','btnTitresim'].forEach(sinif);
const titres=[];root.navigator.vibrate=(k)=>{titres.push(k);return true;};
await flush();
// başlangıç: hepsi kapalı
fire('btnAntrenman','click');await flush();assert.equal(el('btnSolEl').textContent,'Sol el modu: kapalı');assert.equal(el('btnHareket').textContent,'Hareket: tam');assert.equal(D.AYAR.hareket,true);assert.equal(el('btnTitresim').textContent,'Titreşim: açık','titreşim varsayılan açık (eskiden de açıktı)');
// sol el + büyük düğmeler
fire('btnSolEl','click');assert(el('oyun').classList.has('sol-el'),'sol el sınıfı');assert.equal(el('btnSolEl').textContent,'Sol el modu: açık');fire('btnBuyuk','click');assert(el('oyun').classList.has('buyuk'));assert.equal(el('btnBuyuk').textContent,'Büyük düğmeler: açık');
fire('btnSolEl','click');assert(!el('oyun').classList.has('sol-el'),'kapanır');assert(el('oyun').classList.has('buyuk'),'diğeri etkilenmez');
// hareket az: tribün/bayrak durgun (AYAR.hareket=false), geri açılır
fire('btnHareket','click');assert.equal(D.AYAR.hareket,false);assert(/az/.test(el('btnHareket').textContent));fire('btnHareket','click');assert.equal(D.AYAR.hareket,true);assert.equal(el('btnHareket').textContent,'Hareket: tam');
// titreşim: basış (12), temas (14), gol deseni; kapatılınca hiçbiri; kaçan şut ve direk desenleri
async function at(sonuc){hedef={sonuc};fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=400;fire('vurBtn','pointerdown',{isPrimary:true});await flush();let k=0;while(d.faz==='vurus'&&k++<4000){time+=16;root.frame();}time+=16;root.frame();fire('devamBtn','click');}
titres.length=0;await at('gol');assert.deepEqual(titres,[12,14,[40,50,40,50,90]],'varsayılan açık: basış, temas, gol: '+JSON.stringify(titres));titres.length=0;
await at('aut');assert.deepEqual(titres,[12,14,[80]],'kaçan şut: '+JSON.stringify(titres));titres.length=0;
await at('direk_disari');assert.deepEqual(titres,[12,14,[30,40,30]],'direkten dönüş: '+JSON.stringify(titres));titres.length=0;
fire('btnTitresim','click');assert.equal(el('btnTitresim').textContent,'Titreşim: kapalı');assert.equal(titres.length,0,'kapatırken titremez');await at('gol');assert.equal(titres.length,0,'kapalıyken hiç titreşim yok: '+JSON.stringify(titres));fire('btnTitresim','click');assert.deepEqual(titres,[40],'açarken kısa onay titreşimi');
// desteklemeyen cihaz (iPhone): hata yok
delete root.navigator.vibrate;titres.length=0;await at('gol');assert.equal(titres.length,0);
// kalıcılık: ayarlar kaydedilir
const kayit=JSON.parse(memory['dt6_ayar']||memory[Object.keys(memory).find(k=>/ayar/.test(k))]||'null');assert(kayit&&kayit.buyuk===true&&kayit.titresim===true&&kayit.solEl===false&&kayit.hareketAz===false,'ayarlar kaydedilir: '+JSON.stringify(kayit));
console.log('PASS erişilebilirlik: sol el modu, büyük düğmeler, hareket tam/az, titreşim desenleri (iPhone\'da sessizce yok), kalıcı kayıt');
})().catch(e=>{console.error(e);process.exit(1)});
