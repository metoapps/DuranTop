import {createLoginGuard} from './giris-koruma.mjs';
import '../js/ayar.js';import '../js/model3d.js';import '../js/baraj.js';import '../js/kaleci.js';import '../js/ucus.js';import '../js/fizik.js';import '../js/puan.js';
import {tohum,oyuncular} from './guvenlik.mjs';import {normalCode,passwordHash,equalHash,requirePlayer,weekKey} from './kimlik.mjs';
const guardedLogin=createLoginGuard();
const D=(globalThis as any).DT,players=['meto','lort','fero','latte','josh'];
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,x-player-token,x-player-session','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Max-Age':'600','Content-Type':'application/json','Cache-Control':'no-store'};
async function hash(t:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function randomToken(){return [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function fail(s:string):never{throw Error(s);}
async function db(path:string,method='GET',body?:unknown){const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.code==='23505'?'TAKEN':data.message==='WEEK_ENDED'?'WEEK_ENDED':'DB');return data;}
async function identity(req:Request){const token=req.headers.get('x-player-session');if(!token)return null;if(!/^[a-f0-9]{64}$/.test(token))fail('LOGIN');const rs=await db('dt_identity_sessions?token_hash=eq.'+await hash(token)+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=player');if(!rs[0])fail('LOGIN');return {player:rs[0].player};}
function owner(who:any){return who?'identity:'+who.player:'';}
async function room(id:string){if(!/^[a-f0-9-]{36}$/.test(id))fail('ROOM');const rs=await db('dt_live_rooms?id=eq.'+id+'&select=id,code,version,week_start,expires_at');if(!rs[0])fail('ROOM');if(rs[0].version!==8||!rs[0].week_start)fail('VERSION');return rs[0];}
function summary(p:any){const es=p?.entries||[];return {player:p?.player,idx:p?.idx||0,gol:es.filter((e:any)=>e.gol).length,puan:es.reduce((n:number,e:any)=>n+(e.puan||0),0),yesil:es.filter((e:any)=>e.yesil).length};}
async function state(r:any,who:any){const rows=await db('dt_live_players?room_id=eq.'+r.id+'&select=player,idx,entries,token_hash');const totals=await db('rpc/dt_goal_standings','POST',{});return {room:r,identity:who,active:r.week_start===weekKey(),players:oyuncular(rows,owner(who),10),weekly:players.map(player=>({...summary(rows.find((p:any)=>p.player===player)),player})),totals};}
async function weekly(who:any){if(!who)fail('LOGIN');let r;for(let i=0;i<3;i++){try{const code=randomToken().slice(0,6).toUpperCase();r=await db('rpc/dt_weekly_room','POST',{p_code:code,p_creator_hash:owner(who)});break;}catch(e){if((e as Error).message!=='TAKEN')throw e;}}if(!r)fail('DB');return state(r,who);}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response('{}',{status:405,headers});
 try{
  const guest=req.headers.get('x-player-token')||'';if(!/^[a-f0-9]{64}$/.test(guest))fail('AUTH');
  const text=await req.text();if(text.length>4096)fail('INPUT');const b=JSON.parse(text);let result:any;
  if(b.action==='login'){
   const code=normalCode(b.password);if(!players.includes(b.player)||! /^[A-Z2-9]{20}$/.test(code))fail('LOGIN');
   // Read-only lookup: public player names cannot impose a persistent lock on their owner.
   const rows=await db('dt_identity_accounts?player=eq.'+b.player+'&select=player,salt,credential_hash');
   const a=rows[0];if(!a)fail('LOGIN');
   const cacheKey=await hash(b.player+':'+a.credential_hash+':'+code);
   if(!await guardedLogin(cacheKey,async()=>equalHash(await passwordHash(code,a.salt),a.credential_hash)))fail('LOGIN');
   const session=randomToken();await db('dt_identity_sessions','POST',{token_hash:await hash(session),player:a.player});
   result={session,identity:{player:a.player}};
  }else{
   const who=await identity(req);
   if(b.action==='me')result={identity:who};
   else if(b.action==='logout'){if(who)await db('dt_identity_sessions?token_hash=eq.'+await hash(req.headers.get('x-player-session')!),'DELETE');result={identity:null};}
   else if(b.action==='create')result=await weekly(who);
   else {
    const r=await room(b.room),h=owner(who);
    if(b.action==='state')result=await state(r,who);
    else if(b.action==='join'){
     requirePlayer(who,b.player);if(r.week_start!==weekKey())fail('WEEK_ENDED');
     const rows=await db('dt_live_players?room_id=eq.'+r.id+'&player=eq.'+b.player+'&select=player,token_hash');
     if(rows[0]&&rows[0].token_hash!==h)fail('FORBIDDEN');
     if(!rows[0]){try{await db('dt_live_players','POST',{room_id:r.id,player:b.player,token_hash:h});}catch(e){if((e as Error).message!=='TAKEN')throw e;const check=await db('dt_live_players?room_id=eq.'+r.id+'&player=eq.'+b.player+'&select=token_hash');if(check[0]?.token_hash!==h)fail('FORBIDDEN');}}
     result=await state(r,who);
    }else if(b.action==='shot'){
     requirePlayer(who,b.player);if(r.week_start!==weekKey())fail('WEEK_ENDED');
     if(!Number.isInteger(b.idx)||b.idx<0||b.idx>=10)fail('INPUT');
     const rows=await db('dt_live_players?room_id=eq.'+r.id+'&player=eq.'+b.player+'&token_hash=eq.'+h+'&select=idx,entries');if(!rows[0])fail('AUTH');
     if(b.idx<rows[0].idx)result={entry:rows[0].entries[b.idx],state:await state(r,who)};
     else{
      if(b.idx!==rows[0].idx)fail('ORDER');if(b.rules!==4&&b.rules!==5&&b.rules!==6)fail('CLIENT_VERSION');const a=b.aim,c=b.contact;if(!a||!c||![a.x,a.y,c.x,c.y,b.zaman].every(Number.isFinite)||Math.abs(a.x)>4.5||a.y<.11||a.y>3.2||Math.hypot(c.x,c.y)>.851||b.zaman<0||b.zaman>1||!Number.isFinite(b.guc)||b.guc<.3||b.guc>1||![-1,0,1].includes(b.durus))fail('INPUT');
      const pos=D.AYAR.pozisyonlar[b.idx],seed=await tohum((Deno.env.get('DT_SEED_SECRET')||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!,r.id,b.idx),physics=D.fizik.hesapla({pos,aim:a,contact:c,zaman:b.zaman,seed,guc:b.guc,temasFizigi:true,enerjiFizigi:b.rules>=5,takipFizigi:b.rules>=6,sabitKol:true,antrenman:false}),p=D.puan.puanla(pos.tip,physics);
      const entry={ad:pos.ad,sonuc:physics.sonuc,puan:p.puan,zaman:p.zaman,zor:p.zor,taban:p.taban,gol:p.gol,yesil:physics.bandaGirdi,quality:physics.quality,speed:physics.speed,input:{rules:b.rules,aim:a,contact:c,zaman:b.zaman,seed,guc:b.guc,durus:b.durus}};
      const saved=await db('rpc/dt_live_save_shot','POST',{p_room:r.id,p_player:b.player,p_hash:h,p_idx:b.idx,p_entry:entry});result={entry:saved.entry,state:await state(r,who)};
     }
    }else fail('INPUT');
   }
  }
  return new Response(JSON.stringify(result),{headers});
 }catch(e){const errors:any={CLIENT_VERSION:'Oyun güncellendi. Sayfayı yenileyip devam et.',LOGIN:'Karakterini seçip özel giriş kodunu yaz.',LOGIN_LIMIT:'Giriş yoğun. Kısa süre sonra tekrar dene.',LOGIN_BUSY:'Giriş yoğun. Birkaç saniye sonra tekrar dene.',FORBIDDEN:'Bu oyuncu sana ait değil.',WEEK_ENDED:'Bu haftanın turu sona erdi. Güncel haftayı aç.',VERSION:'Bu kupa eski sürümde. Bu haftanın kupasını aç.',AUTH:'Oyuncu oturumu geçersiz.',ROOM:'Kupa bulunamadı.',TAKEN:'Bu oyuncu başka oturuma ait.',ORDER:'Vuruş sırası değişti. Sayfayı yenile.',INPUT:'Vuruş bilgisi geçersiz.'};const msg=(e as Error).message;return new Response(JSON.stringify({code:msg==='DB'?'CONNECTION':msg,error:errors[msg]||'Bağlantı kurulamadı. Yeniden dene.'}),{status:msg==='LOGIN_BUSY'?429:msg==='DB'?503:400,headers});}
});
