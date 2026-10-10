(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:9}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}

// Kaçan şutta tribün alay eder (aut, kısa, kurtarış, baraj); gol ve direkten dönen toppta alay yok (direkte "ahhh").
let alayN=0,uhN=0;D.tezahurat={alay(){alayN++;return true;},uh(){uhN++;return true;},ayarla(){},ortam(){}};
await flush();fire('btnAntrenman','click');await flush();
const eski=D.fizik.hesapla;let hedefSonuc=null;D.fizik.hesapla=g=>{const r=eski(g);if(hedefSonuc)r.sonuc=hedefSonuc;return r;};
const tablo={aut:true,kisa:true,kurtaris:true,baraj:true,gol:false,direk_gol:false,direk_disari:false};
for(const [sonuc,alayBeklenen] of Object.entries(tablo)){
 hedefSonuc=sonuc;alayN=0;uhN=0;
 fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=400;fire('vurBtn','pointerdown',{isPrimary:true});
 await flush();assert.equal(d.faz,'vurus',sonuc);time+=15000;root.frame();assert.equal(d.faz,'sonuc',sonuc);
 assert.equal(alayN,alayBeklenen?1:0,sonuc+': alay '+(alayBeklenen?'var':'yok'));assert.equal(!!d.alayT0,alayBeklenen,sonuc+': alay balonları '+(alayBeklenen?'var':'yok'));
 if(alayBeklenen)assert.equal(d.alayTur,sonuc);
 // sonuç ekranında alay süresi ilerler ve yeni pozisyonda sıfırlanır
 time+=500;root.frame();fire('devamBtn','click');assert.equal(d.alayT0,null,'yeni vuruşta alay sıfırlandı');
}
console.log('PASS alay: kaçan şutta (aut, kısa, kurtarış, baraj) ses ve balon tetiklenir; gol, direk golü ve direkten dönen toppta tetiklenmez');
})().catch(e=>{console.error(e);process.exit(1)});
