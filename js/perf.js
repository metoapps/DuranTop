/* Performans ölçümü ve kademeli kalite (yalnız istemci; oyun sonucuna ve sunucuya karışmaz).
 * 1) Ölçüm: oyun döngüsü her kare süresini faza göre (menü, nişan, uçuş, sonuç) toplar; p95, en uzun kare, yavaş (>50 ms) ve takılma (>120 ms) sayar.
 *    Olaylar (pozisyon açılışı, vuruş hesabı...) ayrı ölçülür. Gizli gösterge: ?perf=1 ile açılır ya da puana 5 kez dokunarak; göstergeye dokununca rapor çıkar (kopyalanır).
 * 2) Kademeli kalite (kalite() = 0, 1, 2): kare süresi uzun kalırsa süsler (kalabalık, bayrak, ağ animasyonu) sadeleşir, uzun süre akıcıysa geri döner.
 *    ?kalite=0|1|2 kademeyi sabitler (otomatik karar kapanır). Çözünürlük (DPR) kararı cizim.js'te ayrı kalır. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var PENCERE=240,FAZ={nisan:'nişan',vurus:'uçuş',gonderiliyor:'uçuş',sonuc:'sonuç',menu:'menü',bos:'menü'};
var fazlar={},olaylar={},pencere=[],sonDeger=0,kademe=0,otomatik=true,aktif=false,tikla=[],baslangic=0,toplamKare=0,kareSonKademe=0,akici=0,timer=null,kutu=null,rapor=null,ayarlar={};
function depo(k,v){try{if(v===undefined)return root.localStorage.getItem(k);root.localStorage.setItem(k,v);}catch(e){return null;}}
function yeniFaz(){return{n:0,toplam:0,maks:0,yavas:0,takilma:0,ms:[]};}
function pct(dizi,p){if(!dizi.length)return 0;var s=dizi.slice().sort(function(a,b){return a-b;});return s[Math.min(s.length-1,Math.floor(p*(s.length-1)+.5))];}
function ort(dizi){var t=0;for(var i=0;i<dizi.length;i++)t+=dizi[i];return dizi.length?t/dizi.length:0;}
/* kare(ms, faz): oyun döngüsünden her karede. Sekme arka plandayken gelen çok uzun kareler (>1000 ms) sayılmaz. */
function kare(ms,faz){if(!(ms>0)||ms>1000)return;var ad=FAZ[faz]||'diğer',f=fazlar[ad]||(fazlar[ad]=yeniFaz());
 if(!baslangic)baslangic=ms;f.n++;f.toplam+=ms;if(ms>f.maks)f.maks=ms;if(ms>50)f.yavas++;if(ms>120)f.takilma++;f.ms.push(ms);if(f.ms.length>PENCERE)f.ms.shift();
 toplamKare++;if(ms<=250){pencere.push(ms);if(pencere.length>90)pencere.shift();}
 if(otomatik&&toplamKare%30===0)kademeKarari();}
/* Kademe kararı: son 90 karenin ortalaması ve p95'i. Yavaşsa bir kademe sadeleşir (en çok 2); en az 180 kare sonra yeniden karar verir.
 * 900 kare (≈15 sn) boyunca ortalama <17 ms ve p95 <24 ms ise bir kademe geri döner. */
function kademeKarari(){if(pencere.length<60)return;var o=ort(pencere),p=pct(pencere,.95);
 if((o>26||p>45)&&kademe<2&&toplamKare-kareSonKademe>=180){kademe++;kareSonKademe=toplamKare;akici=0;return;}
 if(o<17&&p<24){akici+=30;if(akici>=900&&kademe>0&&toplamKare-kareSonKademe>=180){kademe--;kareSonKademe=toplamKare;akici=0;}}else akici=0;}
function olay(ad,ms){if(!(ms>=0))return;var o=olaylar[ad]||(olaylar[ad]={n:0,toplam:0,maks:0});o.n++;o.toplam+=ms;if(ms>o.maks)o.maks=ms;}
function kalite(){return kademe;}
function sabitle(k){if(k===null||k===undefined||k==='auto'){otomatik=true;return;}k=Math.max(0,Math.min(2,k|0));kademe=k;otomatik=false;}
function f1(v){return(Math.round(v*10)/10).toFixed(1);}
function pad(s,n){s=String(s);while(s.length<n)s+=' ';return s;}
function metin(){var c=DT.cizim||{},b=c.boyut?c.boyut():{w:0,h:0},dpr=c.dpr?c.dpr():0,nav=root.navigator||{},scr=root.screen||{};
 var s=['DURAN TOP PERFORMANS RAPORU'];
 var sur='';try{var sc=root.document&&root.document.querySelectorAll('script[src*="oyun.js"]');if(sc&&sc[0])sur=(sc[0].getAttribute('src').match(/v=([0-9a-z]+)/)||[])[1]||'';}catch(e){}
 s.push('Sürüm: '+(sur||'?'));
 s.push('Cihaz: '+String(nav.userAgent||'?').replace(/\s+/g,' ').slice(0,110));
 s.push('Ekran: '+(scr.width||'?')+'×'+(scr.height||'?')+' @'+(root.devicePixelRatio||'?')+'x | tuval: '+b.w+'×'+b.h+' (dpr '+dpr+', sınır '+(c.dprSiniri?c.dprSiniri():'?')+') | çekirdek: '+(nav.hardwareConcurrency||'?')+' | bellek: '+(nav.deviceMemory?nav.deviceMemory+' GB':'?'));
 s.push('Kalite kademesi: '+kademe+(otomatik?' (otomatik)':' (sabit)')+' | toplam kare: '+toplamKare);
 s.push(pad('Faz',8)+pad('kare',7)+pad('ort ms',8)+pad('p95 ms',8)+pad('maks',7)+pad('>50ms',7)+'>120ms');
 ['menü','nişan','uçuş','sonuç','diğer'].forEach(function(ad){var f=fazlar[ad];if(!f||!f.n)return;s.push(pad(ad,8)+pad(f.n,7)+pad(f1(f.toplam/f.n),8)+pad(f1(pct(f.ms,.95)),8)+pad(f1(f.maks),7)+pad(f.yavas,7)+f.takilma);});
 var ol=Object.keys(olaylar);if(ol.length){s.push('Olaylar (ms): '+ol.map(function(k){var o=olaylar[k];return k+' n='+o.n+' ort='+f1(o.toplam/o.n)+' maks='+f1(o.maks);}).join(' | '));}
 return s.join('\n');}
function ozet(){var o=ort(pencere),p=pct(pencere,.95),mx=0;pencere.forEach(function(v){if(v>mx)mx=v;});return{fps:o>0?Math.round(1000/o):0,ort:o,p95:p,maks:mx,kademe:kademe};}
function guncelleKutu(){if(!kutu||!aktif)return;var z=ozet();kutu.textContent='FPS '+z.fps+' · ort '+f1(z.ort)+' · p95 '+f1(z.p95)+' · maks '+f1(z.maks)+' · K'+kademe;}
function goster(v){aktif=!!v;depo('dt_perf',aktif?'1':'0');if(kutu){kutu.hidden=!aktif;}if(!aktif&&rapor)rapor.hidden=true;
 if(root.clearInterval&&timer){root.clearInterval(timer);timer=null;}if(aktif&&root.setInterval){timer=root.setInterval(guncelleKutu,500);guncelleKutu();}}
/* puana 5 kez dokunma (3 sn içinde): göstergeyi açar/kapatır */
function dokun(now){now=now===undefined?Date.now():now;tikla=tikla.filter(function(t){return now-t<3000;});tikla.push(now);if(tikla.length>=5){tikla=[];goster(!aktif);return true;}return false;}
function raporGoster(){var m=metin();depo('dt_perf_son',m);if(rapor){rapor.value=m;rapor.hidden=false;try{rapor.focus();rapor.select();}catch(e){}}
 try{if(root.navigator&&root.navigator.clipboard&&root.navigator.clipboard.writeText)root.navigator.clipboard.writeText(m).catch(function(){});}catch(e){}return m;}
function baslat(o){o=o||{};var doc=root.document;ayarlar=o;
 try{var q=String(root.location&&root.location.search||'');var m=q.match(/[?&]kalite=([0-2])/);if(m)sabitle(+m[1]);if(/[?&]perf=1/.test(q))depo('dt_perf','1');}catch(e){}
 if(doc&&doc.getElementById){kutu=doc.getElementById('perfKutu');rapor=doc.getElementById('perfRapor');
  if(kutu&&kutu.addEventListener)kutu.addEventListener('click',function(){if(rapor&&!rapor.hidden){rapor.hidden=true;}else raporGoster();});
  if(rapor&&rapor.addEventListener)rapor.addEventListener('click',function(){});
  var puan=doc.getElementById('hudPuan');if(puan&&puan.addEventListener)puan.addEventListener('click',function(){dokun();});}
 if(depo('dt_perf')==='1')goster(true);}
DT.perf={kare:kare,olay:olay,kalite:kalite,sabitle:sabitle,rapor:metin,raporGoster:raporGoster,dokun:dokun,goster:goster,baslat:baslat,ozet:ozet,aktif:function(){return aktif;},sifirla:function(){fazlar={};olaylar={};pencere=[];kademe=0;otomatik=true;toplamKare=0;kareSonKademe=0;akici=0;tikla=[];baslangic=0;},_yuzdelik:pct};
})(typeof globalThis!=='undefined'?globalThis:window);
