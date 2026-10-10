(async()=>{
const vm=require('vm'),fs=require('fs'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'),elements={};
function el(id){return elements[id]||(elements[id]={hidden:false,style:{},classList:{toggle(){}},events:{},children:[],appendChild(c){this.children.push(c)},getAttribute(){return 0},getContext(){return C.createCanvas(220,220).getContext('2d')},addEventListener(k,v){(this.events[k]||=[]).push(v)},getBoundingClientRect(){return {left:5,top:10,width:195,height:422}},setPointerCapture(){}})}
const doc={readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}};let time=0,ready=true,shots=0;const memory={};const root={document:doc,URLSearchParams,performance:{now:()=>time},navigator:{},location:{search:'',reload(){}},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]},requestAnimationFrame(f){root.frame=f},alert(){}};vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','hedef','puan','sevinc'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT;D.cizim={ciz(){},kur(){},sahneKur(){},kameraDurus(){},kamDurus:()=>0,hazir:()=>ready,boyut:()=>({w:390,h:844}),ekranToKale:(x,y)=>({x:x/100,y:y/100})};D.ses={ayarla(){},cal(){}};
let callback,state={room:{id:'test',code:'ABC123'},players:[]};function records(){let r={};state.players.forEach(p=>r[p.player]={id:p.player,idx:p.idx,puan:p.entries.reduce((a,e)=>a+e.puan,0),gol:p.entries.filter(e=>e.gol).length,yesil:p.entries.filter(e=>e.yesil).length});return r;}
D.live={identity:()=>({player:'meto'}),init(cb){callback=cb;cb(state);return Promise.resolve(state)},ensure:()=>Promise.resolve(state),current:()=>state.players[0],allowed:()=>true,getState:()=>state,records,async join(player){if(!state.players[0])state.players=[{player,idx:0,entries:[],mine:true}];return state.players[0]},async shot(player,idx,input){shots++;const p=D.puan.puanla(input.pos,D.fizik.hesapla(input));const physics=D.fizik.hesapla(input);const entry={ad:input.pos.ad,sonuc:physics.sonuc,puan:D.puan.puanla(input.pos.tip,physics).puan,gol:['gol','direk_gol'].includes(physics.sonuc),yesil:physics.bandaGirdi,input:{...input,rules:9}};state.players[0].entries.push(entry);state.players[0].idx++;callback(state);return entry},create:()=>Promise.resolve(state),link:()=>''};
vm.runInContext(fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),root);D.oyun.baslat();const d=D.oyun._durum;function fire(id,k,v={}){for(const f of el(id).events[k]||[])f.call(el(id),v)}async function flush(){for(let i=0;i<6;i++)await Promise.resolve();}

// --- Antrenman turu: 10 atış = 5 penaltı + 3 frikik + 2 hedef ağı, kural 10 açık, sunucuya istek yok ---
await flush();fire('btnAntrenman','click');await flush();assert.equal(d.mod,'antrenman');assert.equal(el('hudVurus').textContent,'Vuruş 1/10');
const tipler=D.hedef.antrenmanTuru.map(p=>p.tip);assert.deepEqual(tipler,['penalti','penalti','penalti','penalti','penalti','frikik','frikik','frikik','hedef','hedef']);
let k10=0;const eskiH=D.fizik.hesapla,eskiHH=D.hedef.hesapla;D.fizik.hesapla=g=>{if(g.kural10)k10++;return eskiH(g);};D.hedef.hesapla=g=>{if(g.kural10)k10++;return eskiHH(g);};
for(let i=0;i<10;i++){assert.equal(d.pos.tip,tipler[i]);
 fire('durusAc','click');fire('durusDuz','click');time+=1200;root.frame();
 assert(el('gucPanel').hidden&&!el('fifaNisan').hidden,tipler[i]+': FIFA akışı (güç paneli yok, okla nişan)');fire('nisanKilit','click');fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=400;fire('vurBtn','pointerdown',{isPrimary:true});
 await flush();assert.equal(d.faz,'vurus','vuruş '+i);time+=15000;root.frame();assert.equal(d.faz,'sonuc');fire('devamBtn','click');}
D.fizik.hesapla=eskiH;D.hedef.hesapla=eskiHH;assert.equal(d.ekran,'tursonu');assert(/10 vuruş/.test(el('turBaslik').textContent));assert(k10>=10,'antrenmanda kural 10');assert.equal(shots,0);
fire('turMenu','click');await flush();
console.log('PASS antrenman turu: 5 penaltı + 3 frikik + 2 hedef ağı, kural 10, sunucuya istek yok');
// --- Akış: menüden Hedef ağı → 5 vuruş, kaleci/baraj yok, sonuç ve tur sonu ---
await flush();assert(el('btnHedef'),'menüde Hedef ağı düğmesi');fire('btnHedef','click');await flush();
assert.equal(d.mod,'hedef');assert.equal(d.pos.tip,'hedef');assert.equal(el('hudVurus').textContent,'Vuruş 1/5');assert(el('fifaKutu').hidden,'hedefte FIFA sayacı yok');
const sonuclar=[];
for(let i=0;i<5;i++){
 fire('durusAc','click');fire('durusDuz','click');time+=1200;root.frame();assert(el('gucPanel').hidden&&!el('fifaNisan').hidden,'hedefte de FIFA akışı');
 fire('nisanKilit','click');assert(d.kilit);fire('temasOnay','click');fire('vurBtn','pointerdown',{isPrimary:true});time+=500;root.frame();fire('vurBtn','pointerup');time+=400;fire('vurBtn','pointerdown',{isPrimary:true});await flush();assert.equal(shots,0,'hedef vuruşu sunucuya gitmez');
 assert.equal(d.faz,'vurus');time+=15000;root.frame();assert.equal(d.faz,'sonuc');sonuclar.push(d.sonuclar[d.sonuclar.length-1]);
 assert(['delik','halka','ag','kisa','aut','direk_disari'].includes(sonuclar[i].sonuc),sonuclar[i].sonuc);assert(el('sonucBaslik').textContent.length>0);
 fire('devamBtn','click');}
assert.equal(d.ekran,'tursonu');assert(/ (delik|gol), 5 vuruş/.test(el('turBaslik').textContent),el('turBaslik').textContent);
console.log('PASS hedef ağı akışı: menü düğmesi, 5 vuruş, sunucuya istek yok, sonuçlar '+sonuclar.map(s=>s.sonuc).join(','));

// --- Fizik ve yerleşim ---
const H=D.hedef,A=D.AYAR,R=A.kale.topYaricap,yari=A.kale.genislik/2,HH=A.kale.yukseklik;
assert.equal(H.delikler.length,14);for(const y of [1.93,1.22]){}const sira=[...new Set(H.delikler.map(h=>h.y.toFixed(1)))].map(y=>H.delikler.filter(h=>h.y.toFixed(1)===y).length);assert.deepEqual(sira,[5,4,5]);
for(const h of H.delikler){assert(Math.abs(h.x)+h.r<=yari&&h.y-h.r>=0&&h.y+h.r<=HH,'delik kale ağzının içinde');}
for(let i=0;i<14;i++)for(let j=i+1;j<14;j++){const a=H.delikler[i],b=H.delikler[j];assert(Math.hypot(a.x-b.x,a.y-b.y)>a.r+b.r+.1,'delikler çakışmaz');}
const h0=H.delikler[2];assert(H.delikBul(h0.x,h0.y,R).tam);assert(!H.delikBul(h0.x+h0.r-R+.002,h0.y,R).tam,'kenara değen top tam geçmez');assert.equal(H.delikBul(h0.x+h0.r+R+.01,h0.y,R),null);
const say={};let hizliDonus=0,hizli=0,yavasOnde=0,yavas=0;
for(const pos of H.pozisyonlar)for(const aim of H.delikler.concat([{x:-.7,y:1.6},{x:2.6,y:.9},{x:0,y:.9}]))for(const guc of [.35,.6,1])for(const seed of [1,2]){
 const r=H.hesapla({pos,aim:{x:aim.x,y:aim.y},contact:{x:0,y:0},zaman:.5,seed,guc});say[r.sonuc]=(say[r.sonuc]||0)+1;const son=r.yol[r.yol.length-1];
 if(r.sonuc==='delik'){assert(H.delikBul(r.gecis.x,r.gecis.y,R).tam);assert(r.yol.some(p=>p.z>pos.D+R),'delikten geçen top ağın arkasına gider');assert(H.puanla(r).puan>=2&&H.puanla(r).gol);}
 if(r.sonuc==='ag'||r.sonuc==='halka'){assert(!H.delikBul(r.gecis.x,r.gecis.y,R)||!H.delikBul(r.gecis.x,r.gecis.y,R).tam);assert(r.yol.filter(p=>p.t>r.olayT).every(p=>p.z<=pos.D-R+1e-9),'ağa çarpan top ağın önünde kalır');assert.equal(H.puanla(r).puan,0);
  if(r.speed>=14){hizli++;if(son.z<pos.D-1.0)hizliDonus++;}if(r.speed<9){yavas++;if(son.z>pos.D-1.5)yavasOnde++;}}
 assert(r.yol.every(p=>p.y>=R-1e-9),'top zeminin altına inmez');}
assert(say.delik>50&&say.ag>20&&say.halka>10,JSON.stringify(say));assert(hizli>5&&hizliDonus/hizli>.8,'hızlı top ağdan geri döner '+hizliDonus+'/'+hizli);assert(yavas===0||yavasOnde/yavas>.8,'yavaş top ağın önüne düşer');
assert.equal(A.pozisyonlar.length,10,'kupa pozisyonları değişmedi');
console.log('PASS hedef ağı fiziği: 14 delik 5/4/5, kale içinde, çakışmasız; tam geçiş ölçütü; '+JSON.stringify(say)+'; hızlı dönüş '+hizliDonus+'/'+hizli+', yavaş önde '+yavasOnde+'/'+yavas);
})().catch(e=>{console.error(e);process.exit(1)});
