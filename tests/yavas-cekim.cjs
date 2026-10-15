(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:11}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}


// Yavaş çekim: gol, kurtarış ve direkten dönüşte olay penceresi yavaşlar (gerçek süre uzar, sim süresi/sonuç/sıra aynı); kaçan şutta ve kapalıyken yok.
let golSes=[],alayN=0;D.tezahurat={alay(){alayN++;return true;},uh(){return true;},golSes(s){golSes.push(s);return'konusma';},golMetinleri(){return[{m:'Golllaazzzooooooooooo!'}];},ayarla(){},ortam(){}};
await flush();fire('btnAntrenman','click');await flush();
const eski=D.fizik.hesapla;let hedefSonuc=null;D.fizik.hesapla=g=>{const r=eski(g);if(hedefSonuc)r.sonuc=hedefSonuc;return r;};
async function oyna(sonuc,yavasAcik){hedefSonuc=sonuc;D.AYAR.yavasCekim.acik=yavasAcik;golSes=[];alayN=0;
 fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=400;fire('vurBtn','pointerdown',{isPrimary:true});await flush();assert.equal(d.faz,'vurus',sonuc);
 const t0=time,simler=[];let kare=0,olayKare=-1;while(d.faz==='vurus'&&kare<4000){time+=16;root.frame();kare++;if(d.an){simler.push(d.an.simT);if(olayKare<0&&d.an.olay)olayKare=kare;}}
 const bitis=(time-t0)/1000,simBitis=d.an?d.an.simT:null,plan=d.an?d.an.yavas:null,on=d.an?d.an.on:0;fire('devamBtn','click');return{bitis,simler,olayKare,simBitis,on,golSes:golSes.length,alayN,yavas:plan};}
const hizli={},yavas={};
for(const s of ['gol','kurtaris','direk_disari','aut','baraj']){hizli[s]=await oyna(s,false);yavas[s]=await oyna(s,true);}
const Y=D.AYAR.yavasCekim;
// Her koşu kendi içinde tutarlı: gerçek süre = koşu + sim süresi + (yavaş çekim varsa) pencerenin uzaması
let sonEk=0;const tum=Object.entries(hizli).map(([k,v])=>['hızlı '+k,v]).concat(Object.entries(yavas).map(([k,v])=>['yavaş '+k,v]));
for(const [ad,r] of tum){const ek=r.yavas?(r.yavas.b-r.yavas.a)*(1/Y.hiz-1):0;if(r.yavas)sonEk=ek;assert(Math.abs(r.bitis-(r.on+r.simBitis+ek))<.12,ad+': gerçek süre = koşu + sim + yavaş çekim uzaması: '+r.bitis.toFixed(2)+' ≈ '+(r.on+r.simBitis+ek).toFixed(2));}
for(const s of ['gol','kurtaris','direk_disari']){const pl=yavas[s].yavas;assert(pl&&pl.b-pl.a>=Y.sonra-1e-9&&pl.b-pl.a<=Y.once+Y.sonra+1e-9&&pl.k===Y.hiz,s+': yavaş çekim planı var');assert.equal(hizli[s].yavas,null,s+': kapalıyken plan yok');
 const sm=yavas[s].simler.filter(v=>v!==undefined&&v>0);let enAz=9,onc=null;for(const v of sm){if(onc!==null){assert(v>=onc-1e-9,s+': sim zamanı geriye gitmez');const dv=(v-onc)/.016;if(dv>0)enAz=Math.min(enAz,dv);assert(v-onc<.03,s+': sim zamanında sıçrama yok '+(v-onc).toFixed(4));}onc=v;}
 assert(enAz<Y.hiz+.08,s+': pencerede hız ≈'+Y.hiz+' (ölçülen '+enAz.toFixed(2)+')');}
for(const s of ['aut','baraj'])assert.equal(yavas[s].yavas,null,s+': kaçan şutta yavaş çekim yok');
// gol tezahürat: gol olunca bir kez tetiklenir; kaçan şutta ve kurtarışta tetiklenmez
assert.equal(hizli.gol.golSes,1,'gol: tezahürat bir kez');assert.equal(yavas.gol.golSes,1);for(const s of ['kurtaris','aut','baraj','direk_disari'])assert.equal(yavas[s].golSes,0,s+': tezahürat yok');
assert(hizli.gol.alayN===0&&yavas.kurtaris.alayN===1,'gol alay tetiklemez, kurtarış eder');
D.AYAR.yavasCekim.acik=undefined;
console.log('PASS yavaş çekim: gol/kurtarış/direkte olay penceresi '+(1/Y.hiz).toFixed(1)+' kat yavaş (gerçek süre ≈+'+sonEk.toFixed(2)+' sn), sim zamanı sıçramasız, kaçan şutta yok, sonuç ve sıra aynı; gol tezahüratı yalnız golde');
})().catch(e=>{console.error(e);process.exit(1)});
