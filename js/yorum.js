/* Yorumcu bandı: her sonuç için kısa, esprili Türkçe bir cümle (sonuç kartında). Seçim tohumdan (aynı vuruş aynı cümle); koşullara göre (hız, falso, rüzgâr, seri, altın bölge) daha özel cümleler öne çıkar. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var HAVUZ={
 gol:['Kaleci yalnızca izledi.','Top ağlarla buluştu, tribün ayakta!','Bu vuruşa "dur" diyen çıkmaz.','Ağlar havalandı!','Usta işi, kaleci ne yapsın?'],
 direk_gol:['Direk de oyuna katıldı, topu içeri yolladı!','Direkten döndü ama içeri girdi, şans bu kadar yakışır!'],
 kurtaris:['Kaleci bu sefer okudu.','Eldivenler konuştu.','Kaleci "buradayım" dedi.','Bunu da çıkardı, tribün alkışlıyor.'],
 direk_disari:['Direk seni sevmiyor bugün.','Bir karış içerideydi, direk yetişti.','Direk gol atmak istemedi.'],
 aut:['Hava atışı mı bu?','Tribüne iyi mesaj gönderdin.','Kale tam öbür tarafta!','Nişan almak da ayrı bir sanat.'],
 kisa:['Top yorulmuş, kale uzakta kalmış.','Yürüyerek bile ulaşırdı.','Biraz daha vuruş gücü lazım.'],
 baraj:['Baraj duvar gibi dikildi.','Barajın üstünden bir de mi atsak?','Duvar bugün çok güçlü.'],
 delik:['Tam delikten!','Delikten geçti, ağlar titredi.','Nişancı kral!'],
 halka:['Halka konuştu!','Kıl payı: halkaya değdi.'],
 ag:['Ağ topu sevdi ama delik kaçtı.','Delik orada, top şurada...']
};
function rastgele(seed){var x=((seed|0)^0x6a09e667)>>>0||1;return function(){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%100000)/100000;};}
function sec(liste,r){return liste[Math.floor(r()*liste.length)];}
/* uret({sonuc, gol, km, falso, ruzgar:{hiz}, seri, altin, zorluk}, tohum) */
function uret(o,tohum){var r=rastgele(tohum),s=o.sonuc;r();
 if(o.gol){
  if(o.altin)return sec(['Altın bölge! Nişancı kral!','Tam altın bölgeye, ne vuruş!'],r);
  if(o.seri>=4&&r()<.6)return 'Seri bozulmuyor! '+o.seri+' gol üst üste.';
  if(o.ruzgar&&o.ruzgar.hiz>=4.2&&r()<.6)return 'Rüzgâr hesabı doğru, ağlar tanık.';
  if(o.km>=115&&r()<.7)return Math.round(o.km)+' km/sa! Kaleci rüzgârı hissetti.';
  if(o.falso&&r()<.7)return sec(['Falsoya bak, sanat bu!','Top kıvrıldı, kaleci kıvranıyor.','Falso mu bu, resim mi?'],r);
  return sec(HAVUZ[s]||HAVUZ.gol,r);}
 if(o.ruzgar&&o.ruzgar.hiz>=4.2&&(s==='aut'||s==='direk_disari')&&r()<.6)return 'Rüzgâr bahane değil... biraz da bahane.';
 return sec(HAVUZ[s]||HAVUZ.aut,r);}
DT.yorum={uret:uret,HAVUZ:HAVUZ};
})(typeof globalThis!=='undefined'?globalThis:window);
