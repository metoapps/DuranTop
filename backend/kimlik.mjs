const enc=new TextEncoder();
export function normalCode(code){return typeof code==='string'?code.replace(/[\s-]/g,'').toUpperCase():'';}
export async function passwordHash(code,salt){const key=await crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:160000},key,256);return Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('');}
export function equalHash(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export function requirePlayer(identity,player){if(!identity)throw Error('LOGIN');if(identity.player!==player)throw Error('FORBIDDEN');}
export function weekKey(time=Date.now()){const d=new Date(time+3*3600000),days=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10);}
