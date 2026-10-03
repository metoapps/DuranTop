(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert'),{stripTypeScriptTypes}=require('module');
const K=await import('../backend/kimlik.mjs'),G=await import('../backend/guvenlik.mjs');
assert.equal(K.weekKey(Date.parse('2026-10-04T20:59:59Z')),'2026-09-28');assert.equal(K.weekKey(Date.parse('2026-10-04T21:00:00Z')),'2026-10-05');
assert.equal(K.normalCode(' abcde-fghjk-lmnpq-rstuv '),'ABCDEFGHJKLMNPQRSTUV');
assert.throws(()=>K.requirePlayer(null,'meto'),/LOGIN/);assert.throws(()=>K.requirePlayer({player:'lort'},'meto'),/FORBIDDEN/);
const code='ABCDEFGHJKLMNPQRSTUV',salt='fake-test-salt',accounts=['meto','lort','fero','latte','josh'].map(player=>({player,id:player,salt,attempts:0}));
for(const a of accounts)a.credential_hash=await K.passwordHash(code,salt);
assert(K.equalHash(accounts[0].credential_hash,await K.passwordHash(code,salt)));assert(!K.equalHash(accounts[0].credential_hash,await K.passwordHash(code+'A',salt)));
const sessions=[],rooms=[],members=[];let handler;const root={DT:{},crypto,TextEncoder,Uint8Array,DataView,URL,Date,Request,Response,...K,...G,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://fake.invalid':'fake-secret'},serve:f=>handler=f},console};
function selected(rows,u){return rows.filter(r=>{for(const [k,v] of u.searchParams){if(k==='select')continue;if(v.startsWith('eq.')&&String(r[k])!==v.slice(3))return false;if(v.startsWith('gt.')&&!(r[k]>v.slice(3)))return false;}return true;});}
const sum=es=>({gol:es.filter(e=>e.gol).length,puan:es.reduce((n,e)=>n+e.puan,0)});
root.fetch=async(url,opt)=>{const u=new URL(url),path=u.pathname.split('/rest/v1/')[1],body=opt.body?JSON.parse(opt.body):null;let out;
if(path==='rpc/dt_identity_attempt'){const a=accounts.find(a=>a.player===body.p_player);out=!a||a.attempts>=16?{allowed:false}:{allowed:true,...a};if(a)a.attempts++;}
else if(path==='dt_identity_sessions'){if(opt.method==='POST'){const r={...body,expires_at:new Date(Date.now()+90*86400000).toISOString()};sessions.push(r);out=[r];}else if(opt.method==='DELETE'){const rs=selected(sessions,u);rs.forEach(r=>sessions.splice(sessions.indexOf(r),1));out=rs;}else out=selected(sessions,u);}
else if(path==='dt_identity_accounts'){out=selected(accounts,u);if(opt.method==='PATCH')out.forEach(r=>Object.assign(r,body));}
else if(path==='rpc/dt_weekly_room'){let r=rooms.find(r=>r.week_start===K.weekKey());if(!r){r={id:'11111111-1111-4111-8111-111111111111',code:'AAAAAA',version:8,week_start:K.weekKey(),expires_at:'2099-01-01T00:00:00Z'};rooms.push(r);}out=r;}
else if(path==='dt_live_rooms')out=selected(rooms,u);
else if(path==='dt_live_players'){if(opt.method==='POST'){if(members.some(p=>p.room_id===body.room_id&&p.player===body.player))return new Response(JSON.stringify({code:'23505'}),{status:409});const r={...body,idx:0,entries:[]};members.push(r);out=[r];}else out=selected(members,u);}
else if(path==='rpc/dt_goal_standings')out=accounts.map(a=>({player:a.player,...sum(members.filter(m=>m.player===a.player).flatMap(m=>m.entries)),vurus:members.filter(m=>m.player===a.player).reduce((n,m)=>n+m.idx,0)}));
else if(path==='rpc/dt_live_save_shot'){const p=members.find(m=>m.room_id===body.p_room&&m.player===body.p_player&&m.token_hash===body.p_hash);if(body.p_idx<p.idx)out={entry:p.entries[body.p_idx]};else{assert(p.idx<10&&body.p_idx===p.idx);p.entries.push(body.p_entry);p.idx++;out={entry:body.p_entry};}}
else throw Error(path);return new Response(JSON.stringify(out),{status:200});};
vm.createContext(root);for(const n of ['ayar','model3d','baraj','kaleci','ucus','fizik','puan'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
const src=fs.readFileSync(__dirname+'/../backend/index.ts','utf8').replace(/^import.*$/gm,'');vm.runInContext(stripTypeScriptTypes(src),root);
const api=async(body,session)=>{const h={'x-player-token':'a'.repeat(64),'content-type':'application/json'};if(session)h['x-player-session']=session;const r=await handler(new Request('https://fake.invalid',{method:'POST',headers:h,body:JSON.stringify(body)}));return {status:r.status,data:await r.json()};};
assert.equal((await api({action:'create'})).data.code,'LOGIN');assert.equal((await api({action:'login',player:'meto',password:'Z'.repeat(20)})).data.code,'LOGIN');
const A=(await api({action:'login',player:'meto',password:code})).data.session,B=(await api({action:'login',player:'lort',password:code})).data.session;
assert(A&&B&&A!==B);const week=(await api({action:'create'},A)).data;assert.equal(week.room.id,(await api({action:'create'},B)).data.room.id);assert.equal(week.room.version,8);
const room=week.room.id;assert.equal((await api({action:'join',room,player:'meto'},B)).data.code,'FORBIDDEN');assert.equal((await api({action:'join',room,player:'meto'})).data.code,'LOGIN');
for(const [session,player] of [[A,'meto'],[B,'lort']])assert.equal((await api({action:'join',room,player},session)).status,200);
const shot={action:'shot',room,player:'meto',idx:0,aim:{x:3.15,y:1.1},contact:{x:0,y:0},zaman:.5,guc:1,durus:0};assert.equal((await api(shot,B)).data.code,'FORBIDDEN');assert.equal(members[0].idx,0);
let first;for(let idx=0;idx<10;idx++){const r=await api({...shot,idx,contact:{x:idx>=5?.7:0,y:0}},A);assert.equal(r.status,200,JSON.stringify(r.data));if(!idx)first=r.data.entry;}
assert.deepEqual((await api(shot,A)).data.entry,first);assert.equal(members[0].idx,10);assert.equal((await api({...shot,idx:10},A)).data.code,'INPUT');
const C=(await api({action:'login',player:'meto',password:code})).data.session;const st=(await api({action:'create'},C)).data;assert.equal(st.players.find(p=>p.mine).idx,10,'second device cannot reset weekly rights');
const publicState=(await api({action:'state',room})).data;assert.equal(publicState.weekly.find(p=>p.player==='meto').idx,10);assert(!JSON.stringify(publicState).includes('"input"'));assert(!JSON.stringify(publicState).includes('credential_hash'));
await api({action:'logout'},A);assert.equal((await api({action:'me'},A)).data.code,'LOGIN');
for(let i=0;i<17;i++)await api({action:'login',player:'josh',password:'Z'.repeat(20)});assert.equal((await api({action:'login',player:'josh',password:code})).data.code,'LOGIN_LIMIT');
const p=root.DT.AYAR.pozisyonlar;assert.equal(p.length,10);assert.equal(p.filter(x=>x.tip==='penalti').length,5);assert.equal(p.filter(x=>x.tip==='frikik'&&Math.hypot(x.bx,x.D)<20).length,2);assert.equal(p.filter(x=>x.tip==='frikik'&&Math.hypot(x.bx,x.D)>25).length,3);
console.log('PASS real Edge handler with mocked database: private identity, forged character denied, stable multi-device owner, ten-shot weekly limit, duplicate retry, shared week, goal totals, hidden inputs, logout revocation, login rate limit, Monday boundary and 5+2+3 schedule');
})().catch(e=>{console.error(e);process.exit(1)});
