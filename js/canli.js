/* Fixed private identities; one shared ten-shot cup per calendar week. */
(function(root){'use strict';var DT=root.DT,endpoint='https://ovryjrniokyxiwesfsqw.supabase.co/functions/v1/duran-top-live',state=null,who=null,callback=function(){},status=function(){},timer=null,ready=null,pending=null;
function get(k){try{return JSON.parse(root.localStorage.getItem(k));}catch(e){return null;}}function put(k,v){root.localStorage.setItem(k,JSON.stringify(v));}
function random(){return Array.from(root.crypto.getRandomValues(new Uint8Array(32)),function(n){return n.toString(16).padStart(2,'0');}).join('');}
var token=get('dt_live_token');if(!token){token=random();put('dt_live_token',token);}var session=get('dt_identity_session');
async function api(body){var controller=new AbortController(),timeout=root.setTimeout(function(){controller.abort();},20000);try{var headers={'Content-Type':'application/json','x-player-token':token};if(session)headers['x-player-session']=session;var r=await root.fetch(endpoint,{method:'POST',headers:headers,body:JSON.stringify(body),signal:controller.signal}),data=await r.json();if(!r.ok){var error=Error(data.error||'Bağlantı kurulamadı.');error.code=data.code;if(data.code==='LOGIN'){session=null;who=null;put('dt_identity_session',null);callback(state);}throw error;}return data;}finally{root.clearTimeout(timeout);}}
function set(s){state=s;if(s){who=s.identity||null;put('dt_live_room',s.room.id);}callback(s);status(s?'Skorlar güncel.':'Oyuncunu seçip giriş yap.');return s;}
function current(){return state&&state.players.find(function(p){return p.mine;});}
function schedule(){root.clearTimeout(timer);timer=root.setTimeout(async function(){if(state&&!root.document.hidden){try{set(await api({action:'state',room:state.room.id}));}catch(e){status(e.code==='LOGIN'?'Giriş yapman gerekiyor.':'Bağlantı bekleniyor · skorlar korunuyor');}}schedule();},5000);}
function init(onState,onStatus){callback=onState;status=onStatus;pending=get('dt_live_pending');ready=(async function(){if(session){try{who=(await api({action:'me'})).identity;}catch(e){if(e.code!=='LOGIN')throw e;}}
 var query=new URLSearchParams(root.location.search),id=query.get('oda')||get('dt_live_room');
 if(who)return set(await api({action:'create'}));
 if(id){try{return set(await api({action:'state',room:id}));}catch(e){if(e.code!=='VERSION'&&e.code!=='ROOM')throw e;}}
 return set(null);
 })().then(function(s){schedule();return s;}).catch(function(e){ready=null;status(e.message);throw e;});return ready;}
async function ensure(){if(!who)throw Error('Önce kendi oyuncuna giriş yap.');if(state&&state.active)return state;return create();}
async function create(){if(!who)throw Error('Önce kendi oyuncuna giriş yap.');var s=set(await api({action:'create'}));ready=Promise.resolve(s);schedule();var url=new URL(root.location.href);url.searchParams.set('oda',s.room.id);root.history.replaceState(null,'',url);return s;}
async function login(player,password){var r=await api({action:'login',player:player,password:password});var changed=!who||who.player!==r.identity.player;session=r.session;who=r.identity;put('dt_identity_session',session);if(changed){pending=null;put('dt_live_pending',null);}return create();}
async function logout(){try{await api({action:'logout'});}finally{session=null;who=null;pending=null;put('dt_identity_session',null);put('dt_live_pending',null);put('dt8_resmi',null);if(state){state.identity=null;state.players=state.players.map(function(p){return {player:p.player,idx:p.idx,mine:false,entries:[]};});}callback(state);status('Çıkış yapıldı.');}}
async function join(player){await ensure();if(player!==who.player)throw Error('Bu oyuncu sana ait değil.');var s=set(await api({action:'join',room:state.room.id,player:player}));return s.players.find(function(p){return p.mine;});}
async function shot(player,idx,input){await ensure();if(player!==who.player)throw Error('Bu oyuncu sana ait değil.');if(pending&&(pending.room!==state.room.id||pending.player!==player||pending.idx!==idx)){pending=null;put('dt_live_pending',null);}if(!pending){pending={rules:5,action:'shot',room:state.room.id,player:player,idx:idx,aim:input.aim,contact:input.contact,zaman:input.zaman,guc:input.guc===undefined?1:input.guc,durus:input.durus||0};put('dt_live_pending',pending);}pending.rules=pending.rules===4?4:5;var result=await api(pending);pending=null;put('dt_live_pending',null);set(result.state);return result.entry;}
function records(){var out={};if(state)(state.weekly||[]).forEach(function(p){out[p.player]={id:p.player,idx:p.idx,puan:p.puan,gol:p.gol,yesil:p.yesil};});return out;}
function allowed(player){if(!who||player!==who.player||!state||!state.active)return false;var slot=state.players.find(function(p){return p.player===player;});return !slot||(slot.mine&&slot.idx<10);}
function link(){return 'https://metoapps.github.io/DuranTop/?oda='+state.room.id+'&v=20261004s';}
DT.live={init:init,ensure:ensure,create:create,join:join,shot:shot,records:records,allowed:allowed,current:current,login:login,logout:logout,identity:function(){return who;},link:link,getState:function(){return state;}};
})(window);
