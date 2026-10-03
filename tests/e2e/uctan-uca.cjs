// Uçtan uca: gerçek Edge kodu. Ortak kaleci koşulları, görünürlük, tekrar deneme ve oda sınırı. Bkz. OKU-BENI.txt
const assert=require('assert');const EP='http://127.0.0.1:8000/';
const tok=()=>require('crypto').randomBytes(32).toString('hex');
async function api(token,body){const r=await fetch(EP,{method:'POST',headers:{'content-type':'application/json','x-player-token':token},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
(async()=>{
 const A=tok(),B=tok(),C=tok();
 const c=await api(A,{action:'create'});assert.equal(c.status,200,JSON.stringify(c.data));const room=c.data.room.id;assert.equal(c.data.room.version,7);
 for(const [t,p] of [[A,'meto'],[B,'lort'],[C,'fero']])assert.equal((await api(t,{action:'join',room,player:p})).status,200);
 // beş vuruşluk aynı girdi seti: ikinci pozisyonda köşe, frikiklerde merkez yüksek
 const girdiler=[{x:3.0,y:1.1},{x:1.0,y:1.0},{x:-3.0,y:1.7},{x:0,y:2.1},{x:0.2,y:2.1}].map(a=>({aim:a,contact:{x:0,y:0},zaman:.5,guc:1,durus:0}));
 const state=async(t)=>(await api(t,{action:'state',room})).data.players;
 const por=(ps,n)=>ps.find(p=>p.player===n);
 const a=[],b=[];
 // A ilk vuruşu atar; B henüz oynamadı: B, A'nın sonucunu GÖRMEZ
 a.push((await api(A,{action:'shot',room,player:'meto',idx:0,...girdiler[0]})).data.entry);
 let vb=await state(B);assert.equal(por(vb,'meto').idx,1);assert.deepEqual(por(vb,'meto').entries,[]);assert.equal(por(vb,'meto').ozet,null,'devam eden rakibin toplamı gizli');
 // B aynı vuruşu aynı girdiyle atar: AYNI tohum, AYNI sonuç (eşit koşul)
 b.push((await api(B,{action:'shot',room,player:'lort',idx:0,...girdiler[0]})).data.entry);
 assert.equal(a[0].input.seed,b[0].input.seed,'aynı odada ve vuruşta ortak tohum');assert.equal(a[0].sonuc,b[0].sonuc);assert.equal(a[0].puan,b[0].puan);
 // tekrar deneme: aynı kayıt, yeni sonuç seçilmez
 const tekrar=await api(A,{action:'shot',room,player:'meto',idx:0,aim:{x:0,y:1},contact:{x:0,y:0},zaman:.1});assert.equal(tekrar.data.entry.input.seed,a[0].input.seed);assert.deepEqual(tekrar.data.entry.input.aim,girdiler[0].aim);
 for(let i=1;i<5;i++){const ra=await api(A,{action:'shot',room,player:'meto',idx:i,...girdiler[i]});a.push(ra.data.entry);
  if(i===4){ // A bitirdi, B değil: B yalnızca A'nın toplamını görür, vuruş vuruş sonuçlarını değil; A, B'nin devam ettiğini görür
   vb=await state(B);assert(por(vb,'meto').ozet&&por(vb,'meto').ozet.puan>=0);assert.deepEqual(por(vb,'meto').entries,[]);
   const va=await state(A);assert.equal(por(va,'lort').ozet,null);assert.deepEqual(por(va,'lort').entries,[]);assert.equal(por(va,'lort').idx,1);}
  if(i<4||true){/* B daha sonra oynar */}}
 for(let i=1;i<5;i++)b.push((await api(B,{action:'shot',room,player:'lort',idx:i,...girdiler[i]})).data.entry);
 for(let i=0;i<5;i++){assert.equal(a[i].input.seed,b[i].input.seed,'vuruş '+i+': ortak tohum');assert.equal(a[i].sonuc,b[i].sonuc,'vuruş '+i+': aynı girdi aynı sonuç');assert.equal(a[i].puan,b[i].puan);}
 console.log('beş vuruş, iki oyuncu, aynı girdiler:',a.map(e=>e.sonuc).join(','),'| puan',a.reduce((t,e)=>t+e.puan,0),'= ',b.reduce((t,e)=>t+e.puan,0));
 // ikisi de bitti: birbirinin vuruş vuruş sonuçlarını girdisiz görür; devam eden fero'nunki hâlâ gizli
 const va=await state(A);assert.equal(por(va,'lort').entries.length,5);assert(por(va,'lort').entries.every(e=>!('input' in e)&&e.sonuc));assert(!JSON.stringify(va.filter(p=>!p.mine)).includes('"seed"'),'başkasının tohumu hiç görünmez');
 assert.deepEqual(por(va,'fero').entries,[]);assert.equal(por(va,'fero').ozet,null);
 // başka oda: tohum farklı (ortak yalnızca oda içinde)
 const c2=await api(A,{action:'create'});await api(A,{action:'join',room:c2.data.room.id,player:'meto'});const x=await api(A,{action:'shot',room:c2.data.room.id,player:'meto',idx:0,...girdiler[0]});assert.notEqual(x.data.entry.input.seed,a[0].input.seed,'farklı odada farklı tohum');
 // token başına sınır: aynı token 10 eşzamanlı oda isteği; genel sınır: 150 eşzamanlı istek
 const T=tok();const ayni=await Promise.all(Array.from({length:10},()=>api(T,{action:'create'})));const okTok=ayni.filter(r=>r.status===200).length;console.log('aynı tokenla 10 eşzamanlı istek: başarılı',okTok);assert(okTok===8,'token sınırı tam 8: '+okTok);
 const ESZ=await Promise.all(Array.from({length:150},()=>api(tok(),{action:'create'})));
 const ok=ESZ.filter(r=>r.status===200).length,red=ESZ.filter(r=>r.status!==200&&/yeterince/.test(r.data.error||'')).length;
 console.log('eşzamanlı 150 oda isteği: başarılı',ok,'reddedilen',red);assert.equal(ok+red,150);assert(ok<=100);
 const eski=await api(A,{action:'state',room:'11111111-1111-1111-1111-111111111111'});assert.equal(eski.status,400);
 console.log('PASS uçtan uca: ortak tohum, aynı girdi aynı sonuç, görünürlük kuralları, tekrar denemede aynı kayıt, token ve genel oda sınırı');
})().catch(e=>{console.error('BAŞARISIZ',e.message);process.exit(1);});
