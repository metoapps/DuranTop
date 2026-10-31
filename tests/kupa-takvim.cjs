// Kupa takvimi ve gizli sıralama: Cumartesi 13:00 – Pazar 19:00 (İstanbul) otomatik açık; sıralama Pazar 19:00'da açıklanır; her oyuncu 3 oyun × 10 vuruş.
const assert=require('assert'),fs=require('fs');
(async()=>{const K=await import('../backend/kimlik.mjs'),G=await import('../backend/guvenlik.mjs');
 const an=(s)=>K.kupaDurum(Date.parse(s));
 const beklenen=[['2026-11-06T20:00:00Z','Cuma 23:00',false,false],['2026-11-07T09:59:00Z','Cumartesi 12:59',false,false],['2026-11-07T10:00:00Z','Cumartesi 13:00',true,false],['2026-11-08T15:59:00Z','Pazar 18:59',true,false],['2026-11-08T16:00:00Z','Pazar 19:00',false,true],['2026-11-08T20:59:00Z','Pazar 23:59',false,true],['2026-11-08T21:01:00Z','Pazartesi 00:01 (yeni hafta)',false,false]];
 for(const [t,ad,acik,ac] of beklenen){const d=an(t);assert.equal(d.acik,acik,ad+': açık='+acik);assert.equal(d.aciklandi,ac,ad+': açıklandı='+ac);}
 assert.equal(K.kupaDurum(Date.parse('2026-11-04T12:00:00Z'),'acik').acik,true,'deneme modu: zorla açık');assert.equal(K.kupaDurum(Date.parse('2026-11-07T12:00:00Z'),'kapali').acik,false,'zorla kapalı');
 assert.deepEqual(K.KUPA,{oyun:3,vurus:10},'3 oyun × 10 vuruş');
 // Gizli sıralama: başkasının puanı/sonucu gönderilmez; kendi sonucun görünür
 const rows=[{player:'meto',idx:12,entries:Array.from({length:12},()=>({puan:50,gol:true,input:{aim:1}})),token_hash:'ben'},{player:'lort',idx:30,entries:Array.from({length:30},()=>({puan:80,gol:true,input:{aim:2}})),token_hash:'o'}];
 const gizli=G.oyuncular(rows,'ben',30,false),acik=G.oyuncular(rows,'ben',30,true);
 const lG=gizli.find(p=>p.player==='lort'),mG=gizli.find(p=>p.player==='meto');assert.equal(lG.idx,30,'ilerleme görünür');assert.deepEqual(lG.entries,[],'gizliyken sonuçlar yok');assert.equal(lG.ozet,null,'gizliyken toplam puan yok');assert.equal(mG.entries.length,12,'kendi sonuçların görünür');
 const lA=acik.find(p=>p.player==='lort');assert.equal(lA.ozet.puan,2400,'açıklanınca toplam puan');assert(lA.entries.every(e=>e.input===undefined),'açıklansa da başkasının girdisi gizli');
 // Sunucu ve istemci bağlantıları
 const be=fs.readFileSync(__dirname+'/../backend/index.ts','utf8'),oy=fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),sql=fs.readFileSync(__dirname+'/../backend/kupa-3-oyun.sql','utf8');
 assert(/kupaDurum\(Date\.now\(\),kupaMod\(\)\)/.test(be)&&/DT_CUP_MODE/.test(be),'sunucu takvime göre açılır');assert(/b\.idx>=TOPLAM/.test(be)&&/pozisyonlar\[b\.idx%KUPA\.vurus\]/.test(be),'sunucu 30 vuruş kabul eder, her oyun aynı 10 pozisyon');
 assert(/totals=aciklandi\?/.test(be)&&/gizli:true/.test(be),'gizliyken tüm zamanlar tablosu ve başkalarının haftalık puanı gönderilmez');assert(/onceki:aciklandi\?null:await oncekiHafta\(\)/.test(be),'geçen haftanın sonucu gösterilir');
 assert(/r\.idx>=30/.test(sql)&&/idx between 0 and 30/.test(sql),'veritabanı 30 vuruşa izin verir');
 assert(/\(d\.oyunNo\|\|0\)\*VURUS_SAYISI\+d\.idx/.test(oy),'istemci sunucuya oyun×10+vuruş gönderir');assert(/Sıralama gizli\. Pazar 19:00/.test(oy),'istemci gizli sıralama mesajı');assert(/b\.puan-a\.puan\|\|b\.gol-a\.gol/.test(oy),'sıralama 3 oyunun toplam puanına göre');
 console.log('PASS kupa takvimi: Cmt 13:00 açılır, Pazar 19:00 kapanır ve sıralama açıklanır; 3 oyun × 10 vuruş; gizli sıralama (yalnız ilerleme), açıklanınca toplam puan; geçen hafta sonucu');
})().catch(e=>{console.error(e);process.exit(1)});
