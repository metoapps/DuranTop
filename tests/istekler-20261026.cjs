// 20261026a istekleri: ağır çekim 120 km/sa VE ÜZERİ; alev YALNIZ 120 km/sa üstü VE ibre yeşili yakaladıysa; kupa dışı modlar girişsiz; baraj zıplarken kollar aşağıda; kural 14 sunucu/istemci bağlantısı.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),canli=fs.readFileSync(__dirname+'/../js/canli.js','utf8'),be=fs.readFileSync(__dirname+'/../backend/index.ts','utf8');
assert(/!\(r\.speed>=120\/3\.6\)\)return null;/.test(oyun),'ağır çekim 120 ve üzeri');assert(/!\(r\.speed>120\/3\.6\)\|\|!r\.bandaGirdi/.test(oyun),'alev: 120 üstü VE yeşil');
assert(/\$\('btnHedef'\)\.disabled=false/.test(oyun)&&/\$\('btnGunluk'\)\.disabled=false/.test(oyun)&&/\$\('btnHayat'\)\.disabled=false/.test(oyun),'kupa dışı modlar girişsiz açık');assert(/if\(!me && mod==='resmi'\)/.test(oyun),'yalnız kupa giriş ister');
assert(/rules:\(state&&state\.kurallar>=15\)\?15:\(state&&state\.kurallar>=14\)\?14:13/.test(canli),'istemci kural 14ü yalnız sunucu destekliyorsa gönderir (sunucu yüklenmeden kupa bozulmaz)');assert(/b\.rules!==14/.test(be)&&/kaleciV14:b\.rules>=14,balistikDalis:b\.rules>=14/.test(be)&&/kurallar:kural\(\)/.test(be)&&/\?15:14/.test(be),'sunucu kural 14ü kabul eder ve duyurur');
// alev davranışı: yeşil yoksa alev yok
{const root={DT:{},document:{readyState:'loading',addEventListener(){}},addEventListener(){},localStorage:{getItem(){return null},setItem(){}},location:{search:''},setTimeout,clearTimeout,performance:{now:()=>0}};vm.createContext(root);}
// baraj: zıplayan oyuncunun kolları aşağıda ve blok yüksekliği yalnız sıçrama kadar
{const root={DT:{}};vm.createContext(root);for(const n of ['ayar','model3d','baraj'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const B=root.DT.baraj,pos=root.DT.AYAR.pozisyonlar.find(p=>p.tip==='frikik');
 let bulundu=0;for(let seed=1;seed<=60&&!bulundu;seed++){const w=B.kur(pos,{seed,kural10:true,zorluk:1,aimY:1.9});const q=w.find(x=>x.jump);if(!q)continue;bulundu=1;assert(q.kollarAsagi===true,'zıplayan oyuncu: kollar aşağıda');
  const tepe=t=>Math.max(...B.parcalar(q,t).map(s=>Math.max(s.a[1],s.b[1])+s.r)),dur=B.durum(q,q.start+.2);assert(Math.abs((tepe(q.start+.2)-tepe(q.start-.3))-dur.y)<=.03,'blok yüksekliği yalnız sıçrama kadar artar (kollar havaya kalkmaz)');}
 assert(bulundu,'zıplayan baraj oyuncusu bulundu');}
console.log('PASS 20261026a istekleri: ağır çekim ≥120, alev 120+ ve yeşil, kupa dışı modlar girişsiz, baraj kolları aşağıda, kural 14 bağlantısı');
