/* Rozetler ve istatistikler (yerel, tarayıcıda saklanır; kupa ve sunucudan bağımsız). Rozetler antrenman/hedef ağı vuruşlarından kazanılır.
 * vurus(o): her sonuçta çağrılır → yeni kazanılan rozetlerin listesini döner. turBasla()/turSonu(o): tur bazlı rozetler. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var ANAHTAR='dt_rozet',LISTE=[
 {id:'ilkgol',ad:'İlk Gol',ikon:'⚽',ipucu:'Bir gol at.'},
 {id:'hiz',ad:'Hız Canavarı',ikon:'⚡',ipucu:'110 km/sa ve üstü hızla gol at.'},
 {id:'yavas',ad:'Sessiz Suikastçı',ikon:'🤫',ipucu:'55 km/sa altında bir golle kaleciyi uyut.'},
 {id:'falso',ad:'Falso Ustası',ikon:'🌀',ipucu:'Bir turda 3 falsolu gol at.'},
 {id:'kose',ad:'Köşe Kralı',ikon:'🎯',ipucu:'Üst köşeye gol at.'},
 {id:'direk',ad:'Direk Dostu',ikon:'🥅',ipucu:'Direkten dönüp içeri giren bir gol at.'},
 {id:'altin3',ad:'Altın Ayak',ikon:'⭐',ipucu:'Toplam 3 altın bölge golü at.'},
 {id:'seri5',ad:'Seri Katil',ikon:'🔥',ipucu:'Üst üste 5 gol at.'},
 {id:'ruzgar',ad:'Rüzgâr Ustası',ikon:'🌬️',ipucu:'Sert rüzgârda gol at.'},
 {id:'frikik3',ad:'Frikik Sanatçısı',ikon:'🧱',ipucu:'Bir turda 3 frikik golü at.'},
 {id:'delik3',ad:'Delik Avcısı',ikon:'🎳',ipucu:'Bir turda 3 delikten geçir.'},
 {id:'mukemmel',ad:'Kusursuz Tur',ikon:'👑',ipucu:'10 vuruşun hepsini gol yap.'}];
var depo=null,tur={gol:0,delik:0,frikikGol:0,falsoGol:0};
function oku(){try{var s=root.localStorage&&root.localStorage.getItem(ANAHTAR);if(s){var o=JSON.parse(s);if(o&&o.kazanilan&&o.ist)return o;}}catch(e){}return{kazanilan:{},ist:{vurus:0,gol:0,enSertKm:0,enUzunSeri:0,enIyiTur:0,altinGol:0,tur:0}};}
function yukle(){if(!depo)depo=oku();return depo;}
function kaydet(){try{root.localStorage&&root.localStorage.setItem(ANAHTAR,JSON.stringify(depo));}catch(e){}}
function ver(id,yeni){var s=yukle();if(s.kazanilan[id])return;s.kazanilan[id]=Date.now();yeni.push(id);}
function turBasla(){tur={gol:0,delik:0,frikikGol:0,falsoGol:0};}
/* o: {gol, sonuc, tip, km, falso, ruzgarHiz, altin, seri, x, y} */
function vurus(o){var s=yukle(),yeni=[];s.ist.vurus++;
 if(o.gol){s.ist.gol++;tur.gol++;if(o.sonuc==='delik')tur.delik++;if(o.tip==='frikik')tur.frikikGol++;if(o.falso)tur.falsoGol++;if(o.altin)s.ist.altinGol++;
  if(o.km>s.ist.enSertKm)s.ist.enSertKm=Math.round(o.km);if(o.seri>s.ist.enUzunSeri)s.ist.enUzunSeri=o.seri;
  ver('ilkgol',yeni);if(o.km>=110)ver('hiz',yeni);if(o.km>0&&o.km<55)ver('yavas',yeni);if(Math.abs(o.x)>=2.9&&o.y>=1.7)ver('kose',yeni);if(o.sonuc==='direk_gol')ver('direk',yeni);
  if(s.ist.altinGol>=3)ver('altin3',yeni);if(o.seri>=5)ver('seri5',yeni);if(o.ruzgarHiz>=4.2)ver('ruzgar',yeni);if(tur.frikikGol>=3)ver('frikik3',yeni);if(tur.delik>=3)ver('delik3',yeni);if(tur.falsoGol>=3)ver('falso',yeni);}
 kaydet();return yeni;}
function turSonu(o){var s=yukle(),yeni=[];s.ist.tur++;if(o.puan>s.ist.enIyiTur)s.ist.enIyiTur=o.puan;if(o.vurus>=10&&o.gol===o.vurus)ver('mukemmel',yeni);kaydet();return yeni;}
function liste(){var s=yukle();return LISTE.map(function(r){return Object.assign({kazanildi:!!s.kazanilan[r.id],zaman:s.kazanilan[r.id]||0},r);});}
function istatistik(){return Object.assign({},yukle().ist);}
function sifirla(){depo={kazanilan:{},ist:{vurus:0,gol:0,enSertKm:0,enUzunSeri:0,enIyiTur:0,altinGol:0,tur:0}};turBasla();kaydet();}
/* Menüde liste çizimi (DOM): kazanılanlar renkli, kalanlar soluk + ipucu */
function ciz(kap,doc){if(!kap||!doc)return;kap.innerHTML='';var ist=istatistik(),ek=function(sinif,metin){var e=doc.createElement('div');e.className=sinif;e.textContent=metin;kap.appendChild(e);return e;};
 ek('rozet-ist','Toplam '+ist.vurus+' vuruş · '+ist.gol+' gol · en sert '+(ist.enSertKm||'-')+' km/sa · en uzun seri '+ist.enUzunSeri+' · en iyi tur '+ist.enIyiTur+' puan');
 var kutu=doc.createElement('div');kutu.className='rozet-izgara';liste().forEach(function(r){var e=doc.createElement('div');e.className='rozet '+(r.kazanildi?'var':'yok');e.title=r.ipucu;e.textContent=r.ikon+' '+r.ad+(r.kazanildi?'':' — '+r.ipucu);kutu.appendChild(e);});kap.appendChild(kutu);}
DT.rozet={LISTE:LISTE,vurus:vurus,turBasla:turBasla,turSonu:turSonu,liste:liste,istatistik:istatistik,sifirla:sifirla,ciz:ciz,_yenile:function(){depo=null;}};
})(typeof globalThis!=='undefined'?globalThis:window);
