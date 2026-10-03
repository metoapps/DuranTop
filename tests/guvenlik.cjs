// Sunucu güvenliği: ortak gizli tohum, görünürlük kuralları, oda sınırı değerleri. Çalıştır: node tests/guvenlik.cjs
const assert=require('assert');
(async()=>{
 const g=await import('../backend/guvenlik.mjs');
 const S='gizli-sunucu-anahtari-ornek', room='3f1c0a52-8d1e-4b7a-9a77-0c6e2f9d1b11';
 // 1) deterministik ve ORTAK: oyuncu parametresi yok; aynı oda ve vuruşta herkes için aynı tohum
 assert.equal(await g.tohum(S,room,2),await g.tohum(S,room,2));assert.equal(g.tohum.length,3,'tohum(sir, oda, vurus): oyuncuya bağlı değil');
 // 2) vuruşa, odaya ve sırra göre farklı
 const set=new Set();for(let i=0;i<5;i++)set.add(await g.tohum(S,room,i));assert.equal(set.size,5);
 assert.notEqual(await g.tohum(S,room,0),await g.tohum('baska-sir',room,0));assert.notEqual(await g.tohum(S,room,0),await g.tohum(S,'aaaaaaaa-8d1e-4b7a-9a77-0c6e2f9d1b11',0));
 // 3) eski formül (oda kodu x 977 + vuruş x 7919) tohumu vermiyor
 const kod='A1B2C3';let eski=0;for(let i=0;i<5;i++)if((parseInt(kod,16)*977+i*7919|0)===await g.tohum(S,room,i))eski++;assert.equal(eski,0);
 // 4) görünürlük
 const entry=(puan,gol)=>({ad:'P',sonuc:gol?'gol':'kurtaris',puan,gol,yesil:gol,input:{aim:{x:1,y:1},contact:{x:0,y:0},zaman:.5,seed:123}});
 const tam=[entry(100,true),entry(0,false),entry(115,true),entry(0,false),entry(110,true)];
 const rows=[{player:'meto',idx:5,token_hash:'H1',entries:tam},{player:'lort',idx:5,token_hash:'H2',entries:tam},{player:'fero',idx:2,token_hash:'H3',entries:tam.slice(0,2)},{player:'latte',idx:0,token_hash:'H4',entries:[]}];
 // meto bitirdi: kendi girdisi görünür; bitirenlerin vuruş sonuçları (girdisiz) görünür; devam eden fero'nun yalnızca ilerlemesi
 let v=g.oyuncular(rows,'H1');const por=(n)=>v.find(p=>p.player===n);
 assert(por('meto').mine&&por('meto').entries[0].input.seed===123);
 assert(!por('lort').mine&&por('lort').entries.length===5&&por('lort').entries.every(e=>!('input' in e)&&e.sonuc&&e.puan>=0)&&por('lort').ozet.puan===325);
 assert.deepEqual(por('fero').entries,[]);assert.equal(por('fero').ozet,null);assert.equal(por('fero').idx,2,'ilerleme görünür');
 assert(!JSON.stringify(v.filter(p=>!p.mine)).includes('seed'));
 // ben devam ediyorsam bitirmiş birinin yalnızca toplamı görünür, vuruş vuruş sonuçları değil (kendi turum bitene kadar)
 v=g.oyuncular(rows,'H3');assert.equal(por('meto').entries.length,0);assert.equal(por('meto').ozet.puan,325);assert.equal(por('meto').ozet.gol,3);assert(por('fero').mine&&por('fero').entries.length===2);
 // izleyici (katılmamış): bitirenlerin toplamı görünür, ayrıntı ve devam edenler gizli
 v=g.oyuncular(rows,'YOK');assert(v.every(p=>p.entries.length===0));assert.equal(por('lort').ozet.puan,325);assert.equal(por('latte').ozet,null);
 assert.equal(rows[1].entries[0].input.seed,123,'kaynak veri değişmez');
 // 5) oda sınırı değerleri; sayım ve ekleme atomik SQL işlemi
 assert.deepEqual(g.ODA_SINIRI,{token:8,genel:100});const sql=require('fs').readFileSync(__dirname+'/../backend/schema.sql','utf8');assert(/pg_advisory_xact_lock/.test(sql)&&/ROOM_LIMIT/.test(sql));
 console.log('PASS shared secret keeper seed (same for five players per room+shot); old seed formula invalid; opponents see only progress until finished, finished totals only, per-shot results after own round, never inputs/seeds; atomic room cap');
})().catch(e=>{console.error(e);process.exit(1);});
