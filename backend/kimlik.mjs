const enc=new TextEncoder();
export function normalCode(code){return typeof code==='string'?code.replace(/[\s-]/g,'').toUpperCase():'';}
export async function passwordHash(code,salt){const key=await crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:160000},key,256);return Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('');}
export function equalHash(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export function requirePlayer(identity,player){if(!identity)throw Error('LOGIN');if(identity.player!==player)throw Error('FORBIDDEN');}
export function weekKey(time=Date.now()){const d=new Date(time+3*3600000),days=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10);}
/* KUPA TAKVİMİ (İstanbul saati, UTC+3): her hafta Cumartesi 13:00'te OTOMATİK açılır, Pazar 19:00'da OTOMATİK kapanır.
 * Sıralama kupa boyunca GİZLİ; Pazar 19:00'da otomatik açıklanır. Her oyuncu 3 oyun × 10 vuruş oynar, 3 oyunun puanı toplanır.
 * mod: 'otomatik' (varsayılan) | 'acik' (deneme için zorla açık) | 'kapali' (zorla kapalı). Sunucuda DT_CUP_MODE ile verilir. */
export const KUPA = { oyun: 3, vurus: 10 };
export function kupaTakvim(time = Date.now()) {
  const pazartesi = Date.parse(weekKey(time) + 'T00:00:00Z') - 3 * 3600000;   // bu haftanın Pazartesi 00:00 (İstanbul), UTC ms
  return { acilis: pazartesi + 5 * 86400000 + 13 * 3600000, kapanis: pazartesi + 6 * 86400000 + 19 * 3600000 };
}
export function kupaDurum(time = Date.now(), mod = 'otomatik') {
  const t = kupaTakvim(time), zaman = time >= t.acilis && time < t.kapanis;
  return { acik: mod === 'acik' ? true : mod === 'kapali' ? false : zaman, aciklandi: time >= t.kapanis, acilis: t.acilis, kapanis: t.kapanis };
}
