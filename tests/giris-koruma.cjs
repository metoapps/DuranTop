(async()=>{
const assert=require('assert'),{createLoginGuard}=await import('../backend/giris-koruma.mjs');let clock=0,calls=0;
const guard=createLoginGuard({max:2,ttl:100,capacity:2,now:()=>clock});
assert.equal(await guard('wrong',async()=>{calls++;return false;}),false);
for(let i=0;i<20;i++)assert.equal(await guard('wrong',async()=>{calls++;return false;}),false);
assert.equal(calls,1,'repeated wrong candidate hashes only once');
assert.equal(await guard('owner',async()=>true),true,'wrong candidates cannot lock correct candidate');
clock=101;await guard('wrong',async()=>{calls++;return false;});assert.equal(calls,2,'cache expires');
let release1,release2;
const p1=guard('first',()=>new Promise(r=>release1=r));const p2=guard('second',()=>new Promise(r=>release2=r));
await assert.rejects(guard('third',async()=>true),/LOGIN_BUSY/);
release1(true);release2(true);await Promise.all([p1,p2]);
await assert.rejects(guard('exception',async()=>{throw Error('DB');}),/DB/);
assert.equal(await guard('owner',async()=>true),true,'slot released after failure');
console.log('PASS bounded verification, rejected-code cache, expiry, owner admission and exception cleanup');
})().catch(e=>{console.error(e);process.exit(1)});
