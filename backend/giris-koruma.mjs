// Per-worker bounded verification; no plaintext codes or persistent player lock.
export function createLoginGuard({max=2,ttl=60000,capacity=256,now=()=>Date.now()}={}) {
 const rejected=new Map();let active=0;
 return async function guarded(key,verify){
  const expiry=rejected.get(key);if(expiry&&expiry>now())return false;
  if(expiry)rejected.delete(key);
  if(active>=max)throw Error('LOGIN_BUSY');
  active++;
  try{
   const ok=await verify();
   if(!ok){if(rejected.size>=capacity)rejected.delete(rejected.keys().next().value);rejected.set(key,now()+ttl);}
   return ok;
  }finally{active--;}
 };
}
