const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const kaynak=fs.readFileSync(path.join(__dirname,'../js/cizim.js'),'utf8');
const satir=kaynak.split(/\r?\n/).find(l=>l.trim().startsWith('var ALAY = {'));assert(satir,'ALAY tablosu bulunamadı');
const ALAY=vm.runInNewContext('('+satir.trim().replace(/^var ALAY = /,'').replace(/;$/,'')+')');
const TUR=['aut','kisa','kurtaris','baraj','ag','halka'];
const YENI=['Senin ayağının dümenini skeyim','Ebenin amk yayım ya!','Çekeceğin şutun anasını avradını skeyim'];
for(const t of TUR){const l=ALAY[t];assert(Array.isArray(l)&&l.length===5,t+': tam 5 yorum');assert.equal(new Set(l).size,5,t+': yorumlar tekrarsız');
  assert(l.filter(x=>YENI.includes(x)).length>=2,t+': en az iki yeni tribün yorumu');l.forEach(x=>assert(typeof x==='string'&&x.length>0&&x.length<=45,t+': yorum uzunluğu'));}
for(const y of YENI)assert(TUR.some(t=>ALAY[t].includes(y)),'her yeni yorum bir sonuçta kullanılmalı: '+y);
// Uzun yorum küçük ekrana sığmalı: yazı tipi, genişlik W-28'i aşınca küçültülür.
assert(/tw > W - 28/.test(kaynak)&&/Math\.max\(8,/.test(kaynak),'uzun yorum için sığdırma kodu');
const font=(W,metin)=>{let fs=Math.round(Math.max(11,Math.min(15,W/28)));const olc=f=>metin.length*f*0.56;let tw=olc(fs);if(tw>W-28){fs=Math.max(8,Math.floor(fs*(W-28)/tw));}return olc(fs);};
for(const W of [320,360,390,430])for(const t of TUR)for(const m of ALAY[t])assert(font(W,m)<=W-28+1e-6||W<=320&&font(W,m)<=W,'balon ekrana sığmalı '+W+' '+m);
console.log('PASS 6 sonuç türü × 5 yorum, üç yeni tribün yorumu dağıtıldı, uzun yorum küçük ekranda sığar');
