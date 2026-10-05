// İstemci: eski sürümden kalan bekleyen istek. Kayıtlıysa mevcut sonuç döner; kayıtlı değilse hak harcanmaz, güncel girdi rules 8 ile gönderilir. node tests/surum-gecis.cjs
(async()=>{const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto').webcrypto;
 for(const senaryo of ['kayitli','kayitsiz'])for(const eskiRules of [4,5,6,7]){
  let storage={},istekler=[],kayit=null;const room={id:'11111111-1111-4111-8111-111111111111',code:'AABBCC',version:8,week_start:'2026-09-28'};
  storage.dt_live_pending=JSON.stringify({rules:eskiRules,action:'shot',room:room.id,player:'meto',idx:0,aim:{x:1,y:1},contact:{x:0,y:0},zaman:.4,guc:1,durus:0});
  if(senaryo==='kayitli')kayit={input:{rules:eskiRules,aim:{x:1,y:1},contact:{x:0,y:0},zaman:.4,guc:1,durus:0,seed:7},puan:100,sonuc:'gol'};
  const state=()=>({room,players:[{player:'meto',idx:kayit?1:0,entries:kayit?[kayit]:[],mine:true}],identity:{player:'meto'},active:true,weekly:[],totals:[]});
  const root={DT:{},crypto,Uint8Array,URLSearchParams,URL,AbortController,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},location:{search:'',href:'https://x/'},history:{replaceState(){}},document:{hidden:true},setTimeout:()=>0,clearTimeout(){},
   fetch:async(u,o)=>{const b=JSON.parse(o.body);istekler.push(b);let data,ok=true;
    if(b.action==='shot'){if(b.idx<(kayit?1:0))data={entry:kayit,state:state()};else if(b.rules!==8){ok=false;data={code:'CLIENT_VERSION',error:'Oyun güncellendi. Vuruş hakkın harcanmadı.'};}else{kayit={input:{rules:8,aim:b.aim,contact:b.contact,zaman:b.zaman,guc:b.guc,durus:b.durus,seed:9},puan:50,sonuc:'kurtaris'};data={entry:kayit,state:state()};}}
    else if(b.action==='me')data={identity:{player:'meto'}};else data=state();return {ok,json:async()=>data};}};
  root.window=root;storage.dt_identity_session=JSON.stringify('e'.repeat(64));vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/canli.js','utf8'),root);
  const L=root.DT.live;await L.init(()=>{},()=>{});
  const entry=await L.shot('meto',0,{aim:{x:-2,y:1.5},contact:{x:0,y:0},zaman:.5,guc:.8,durus:1});
  const shots=istekler.filter(b=>b.action==='shot');
  if(senaryo==='kayitli'){assert.equal(shots.length,1,'kayıtlıysa tek istek');assert.equal(shots[0].rules,eskiRules,'eski bekleyen istek olduğu gibi sorulur');assert.deepEqual(entry,kayit);assert.equal(entry.input.rules,eskiRules,'mevcut sonuç yeniden hesaplanmaz');}
  else{assert.equal(shots.length,2,'önce eski istek (reddedilir), sonra güncel istek');assert.equal(shots[0].rules,eskiRules);assert.equal(shots[1].rules,8);assert.deepEqual(shots[1].aim,{x:-2,y:1.5},'kayıtsız eski istek bırakılır; güncel girdi gönderilir');assert.equal(entry.input.rules,8);}
  assert.equal(JSON.parse(storage.dt_live_pending),null,'bekleyen istek temizlenir');}
 console.log('PASS stale pending request: saved one returns its stored result unchanged; unsaved old-version one is dropped without consuming a shot and the current input is sent with rules 8');
})().catch(e=>{console.error(e);process.exit(1);});
