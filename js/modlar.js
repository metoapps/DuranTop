/* Yeni oyun modları (yalnız yerel; kupa ve sunucudan bağımsız): HAYATTA KAL ve GÜNÜN MEYDAN OKUMASI.
 * Günlük: her gün (İstanbul saatiyle) herkese aynı 3 vuruş: bir penaltı, bir frikik, bir hedef ağı; rüzgâr, altın bölge ve kaleci kararı da günün tohumundan gelir
 *   (yani herkes aynı sınavı çözer; fark yalnız beceridir). İlk deneme kayda geçer, sonrakiler antrenmandır. Ardışık günler "günlük seri" sayılır.
 * Hayatta kal: ilk kaçırışa kadar sonsuz vuruş; her golle zorluk artar (rüzgâr, kaleci seviyesi, uzak frikik ve hedef ağı payı). Rekor kaydedilir. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var GUN_MS=86400000,UTC3=3*3600000,TABAN=Math.floor(Date.UTC(2026,9,1)/GUN_MS);   // 1 Ekim 2026 = Günlük #1
function gunNo(simdi){return Math.floor(((simdi===undefined?Date.now():simdi)+UTC3)/GUN_MS);}
function gunSira(g){return g-TABAN+1;}
function hash(a){a=(a^0x9e3779b9)>>>0;a=Math.imul(a^(a>>>16),0x85ebca6b)>>>0;a=Math.imul(a^(a>>>13),0xc2b2ae35)>>>0;return(a^(a>>>16))>>>0;}
function rastgele(seed){var x=hash(seed)||1;return function(){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%100000)/100000;};}
function depoOku(k,vars){try{var s=root.localStorage&&root.localStorage.getItem(k);if(s){var o=JSON.parse(s);if(o&&typeof o==='object')return o;}}catch(e){}return vars;}
function depoYaz(k,v){try{root.localStorage&&root.localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
/* ---- Günlük ---- */
function gunSeed(g,idx){return hash(g*1009+idx*7919+13)&0x7fffffff;}
function gunPozisyonlar(g,pozlar,hedefler){var r=rastgele(g*31+5),pen=pozlar.filter(function(p){return p.tip==='penalti';}),fr=pozlar.filter(function(p){return p.tip==='frikik';});
 return[pen[Math.floor(r()*pen.length)],fr[Math.floor(r()*fr.length)],hedefler[Math.floor(r()*hedefler.length)]];}
function gunlukDurum(g){var o=depoOku('dt_gunluk',{gunler:{}}),G=o.gunler||{},k=G[g]||null,seri=0,c=k?g:g-1;   // seri: bugün oynandıysa bugünden geriye; oynanmadıysa dünden geriye (bugün hâlâ yetişilebilir)
 while(G[c]){seri++;c--;}return{oynadi:!!k,puan:k?k.puan:0,goller:k?k.goller:0,deneme:k?k.deneme:0,seri:seri,toplamGun:Object.keys(G).length};}
/* ilk deneme sayılır; sonraki denemeler yalnız deneme sayacını artırır */
function gunlukKaydet(g,puan,goller){var o=depoOku('dt_gunluk',{gunler:{}});if(!o.gunler)o.gunler={};var k=o.gunler[g];if(k){k.deneme=(k.deneme||1)+1;depoYaz('dt_gunluk',o);return{ilk:false,puan:k.puan,goller:k.goller};}
 o.gunler[g]={puan:puan,goller:goller,deneme:1,ts:Date.now()};depoYaz('dt_gunluk',o);return{ilk:true,puan:puan,goller:goller};}
function gunlukMetin(g,puan,goller,seri){return'Duran Top Günlük #'+gunSira(g)+': '+puan+' puan ('+goller+'/3 gol)'+(seri>=2?' 🔥 '+seri+' gün üst üste':'')+'\nSen kaç yaparsın? Aynı 3 vuruş, aynı rüzgâr.';}
/* ---- Hayatta kal ---- */
function hayatZorluk(goller){var s=Math.min(1,goller/14);return{seviye:s,ruzgarOlcek:Math.min(1.3,.25+goller*.09)};}
function hayatPoz(idx,seed,goller,pozlar,hedefler){var r=rastgele(seed*131+idx*17+3),u=r(),pen=pozlar.filter(function(p){return p.tip==='penalti';}),yakin=pozlar.filter(function(p){return p.tip==='frikik'&&/Yakın/.test(p.ad);}),uzak=pozlar.filter(function(p){return p.tip==='frikik'&&/Uzak/.test(p.ad);}),secili;
 var a,b,c;if(goller<3){a=.6;b=1;c=1;}else if(goller<7){a=.35;b=.70;c=1;}else{a=.25;b=.50;c=.80;}
 if(u<a)secili=pen[Math.floor(r()*pen.length)];else if(u<b)secili=yakin[Math.floor(r()*yakin.length)];else if(u<c)secili=uzak[Math.floor(r()*uzak.length)];else secili=hedefler[Math.floor(r()*hedefler.length)];return secili;}
function hayatDurum(){var o=depoOku('dt_hayat',{rekor:0,oyun:0,toplamGol:0});return{rekor:o.rekor|0,oyun:o.oyun|0,toplamGol:o.toplamGol|0};}
function hayatKaydet(goller){var o=hayatDurum(),onceki=o.rekor,rekor=goller>onceki;o.oyun++;o.toplamGol+=goller;if(rekor)o.rekor=goller;depoYaz('dt_hayat',o);return{rekor:rekor,onceki:onceki,yeni:o.rekor};}
DT.modlar={gunNo:gunNo,gunSira:gunSira,gunSeed:gunSeed,gunPozisyonlar:gunPozisyonlar,gunlukDurum:gunlukDurum,gunlukKaydet:gunlukKaydet,gunlukMetin:gunlukMetin,hayatZorluk:hayatZorluk,hayatPoz:hayatPoz,hayatDurum:hayatDurum,hayatKaydet:hayatKaydet,_hash:hash};
})(typeof globalThis!=='undefined'?globalThis:window);
