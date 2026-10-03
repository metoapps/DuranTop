import '../js/ayar.js';import '../js/model3d.js';import '../js/baraj.js';import '../js/kaleci.js';import '../js/ucus.js';import '../js/fizik.js';import '../js/puan.js';
const D=(globalThis as any).DT;
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,x-player-token','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Max-Age':'600','Content-Type':'application/json','Cache-Control':'no-store'};
const players=['meto','lort','fero','latte','josh'];
async function hash(t:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function db(path:string,method='GET',body?:unknown){const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.code==='23505'?'TAKEN':'DB');return data;}
function fail(s:string){throw new Error(s);}
async function room(id:string){if(!/^[a-f0-9-]{36}$/.test(id))fail('ROOM');const rs=await db('dt_live_rooms?id=eq.'+id+'&select=id,code,version,expires_at');if(!rs[0]||Date.parse(rs[0].expires_at)<Date.now())fail('ROOM');return rs[0];}
async function state(r:any,h:string){const rows=await db('dt_live_players?room_id=eq.'+r.id+'&select=player,idx,entries,token_hash');return {room:{id:r.id,code:r.code,version:r.version,expires_at:r.expires_at},players:rows.map((p:any)=>({player:p.player,idx:p.idx,entries:p.entries,mine:p.token_hash===h}))};}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return new Response('{}',{status:405,headers});
 try{
  // Login-free guest capability authentication: random 256-bit token, stored only as SHA-256 in DB.
  const token=req.headers.get('x-player-token')||'';if(!/^[a-f0-9]{64}$/.test(token))fail('AUTH');const h=await hash(token);
  const text=await req.text();if(text.length>4096)fail('INPUT');const b=JSON.parse(text);let result:any;
  if(b.action==='create'){
   const recent=await db('dt_live_rooms?creator_hash=eq.'+h+'&created_at=gte.'+encodeURIComponent(new Date(Date.now()-86400000).toISOString())+'&select=id');if(recent.length>=8)fail('LIMIT');
   let r;for(let i=0;i<3;i++){try{const code=[...crypto.getRandomValues(new Uint8Array(3))].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();r=(await db('dt_live_rooms','POST',{code,creator_hash:h,version:5}))[0];break;}catch(e){if((e as Error).message!=='TAKEN')throw e;}}
   if(!r)fail('DB');result=await state(r,h);
  }else{
   const r=await room(b.room);if(r.version!==5)fail('VERSION');
   if(b.action==='state'){if(r.version!==5)fail('VERSION');result=await state(r,h);}
   else if(b.action==='join'){
    if(!players.includes(b.player))fail('INPUT');const rows=await db('dt_live_players?room_id=eq.'+r.id+'&select=player,token_hash');const mine=rows.find((x:any)=>x.token_hash===h);if(mine&&mine.player!==b.player)fail('ONE_PLAYER');const slot=rows.find((x:any)=>x.player===b.player);if(slot&&slot.token_hash!==h)fail('TAKEN');if(!slot)await db('dt_live_players','POST',{room_id:r.id,player:b.player,token_hash:h});result=await state(r,h);
   }else if(b.action==='shot'){
    if(!players.includes(b.player)||!Number.isInteger(b.idx)||b.idx<0||b.idx>4)fail('INPUT');const rows=await db('dt_live_players?room_id=eq.'+r.id+'&player=eq.'+b.player+'&token_hash=eq.'+h+'&select=idx,entries');if(!rows[0])fail('AUTH');
    if(b.idx<rows[0].idx)result={entry:rows[0].entries[b.idx],state:await state(r,h)};
    else{
     if(b.idx!==rows[0].idx)fail('ORDER');const a=b.aim,c=b.contact;if(!a||!c||![a.x,a.y,c.x,c.y,b.zaman].every(Number.isFinite)||Math.abs(a.x)>4.5||a.y<.11||a.y>3.2||Math.hypot(c.x,c.y)>.851||b.zaman<0||b.zaman>1)fail('INPUT');
     const pos=D.AYAR.pozisyonlar[b.idx],seed=(parseInt(r.code,16)*977+b.idx*7919)|0;
     const physics=D.fizik.hesapla({pos,aim:a,contact:c,zaman:b.zaman,seed,antrenman:false}),p=D.puan.puanla(pos.tip,physics);
     const entry={ad:pos.ad,sonuc:physics.sonuc,puan:p.puan,zaman:p.zaman,zor:p.zor,taban:p.taban,gol:p.gol,yesil:physics.bandaGirdi,quality:physics.quality,speed:physics.speed,input:{aim:a,contact:c,zaman:b.zaman,seed}};
     const saved=await db('rpc/dt_live_save_shot','POST',{p_room:r.id,p_player:b.player,p_hash:h,p_idx:b.idx,p_entry:entry});result={entry:saved.entry,state:await state(r,h)};
    }
   }else fail('INPUT');
  }
  return new Response(JSON.stringify(result),{headers});
 }catch(e){const errors:any={VERSION:'Bu kupa önceki oyun sürümünde. Yeni kupa oluştur.',AUTH:'Oyuncu oturumu geçersiz.',ROOM:'Kupa bulunamadı veya süresi doldu.',TAKEN:'Bu karakter başka bir arkadaş tarafından seçildi.',ONE_PLAYER:'Bu kupada zaten bir karakter seçtin.',ORDER:'Vuruş sırası değişti. Sayfayı yenile.',LIMIT:'Bugün yeterince kupa oluşturuldu.',INPUT:'Vuruş bilgisi geçersiz.'};const msg=(e as Error).message;return new Response(JSON.stringify({error:errors[msg]||'Bağlantı kurulamadı. Yeniden dene.'}),{status:msg==='DB'?503:400,headers});}
});
