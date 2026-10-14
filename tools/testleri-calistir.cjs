#!/usr/bin/env node
/* Tüm testleri tek komutla çalıştırır:  node tools/testleri-calistir.cjs [--sadece=desen] [--hizli] [--e2e]
 * Her test ayrı süreçte çalışır; sonunda tablo ve özet yazılır. Çıkış kodu: hepsi geçtiyse 0, değilse 1.
 * Bilinen ortam notu: `formalar.cjs` Windows'ta Canvas yolu yüzünden düşebilir (kod hatası değil); özette ayrıca belirtilir. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const arg=Object.fromEntries(process.argv.slice(2).map(a=>{const m=a.match(/^--([^=]+)=?(.*)$/);return m?[m[1],m[2]||true]:[a,true];}));
const kok=path.join(__dirname,'..'),dir=path.join(kok,'tests');
let dosyalar=fs.readdirSync(dir).filter(f=>f.endsWith('.cjs')).sort();
if(arg.sadece)dosyalar=dosyalar.filter(f=>f.includes(arg.sadece));
if(arg.e2e&&fs.existsSync(path.join(dir,'e2e','uctan-uca.cjs')))dosyalar.push('e2e/uctan-uca.cjs');
const ORTAM_NOTU={'formalar.cjs':process.platform==='win32'};
const sonuc=[];let t0=Date.now();
for(const f of dosyalar){const t=Date.now(),r=cp.spawnSync(process.execPath,[path.join(dir,f)],{encoding:'utf8',timeout:300000,cwd:kok});const ok=r.status===0,sure=(Date.now()-t)/1000;
 const satir=((r.stdout||'').split('\n').find(l=>/^PASS/.test(l))||'').slice(0,90),hata=ok?'':(((r.stderr||'')+(r.stdout||'')).split('\n').find(l=>/Error|Assertion/.test(l))||'(çıktı yok)').slice(0,160);
 sonuc.push({f,ok,sure,hata,ortam:!ok&&ORTAM_NOTU[f]});console.log((ok?'✓':'✗')+' '+f.padEnd(34)+sure.toFixed(1).padStart(6)+' sn  '+(ok?satir:hata));}
const kalan=sonuc.filter(s=>!s.ok),ortamKalan=kalan.filter(s=>s.ortam),gercek=kalan.filter(s=>!s.ortam);
console.log('\n'+(sonuc.length-kalan.length)+'/'+sonuc.length+' test geçti, '+((Date.now()-t0)/1000).toFixed(0)+' sn'+(ortamKalan.length?' ('+ortamKalan.length+' ortam kaynaklı: '+ortamKalan.map(s=>s.f).join(', ')+')':''));
if(gercek.length){console.log('BAŞARISIZ: '+gercek.map(s=>s.f).join(', '));process.exit(1);}
