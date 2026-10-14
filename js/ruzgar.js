/* Rüzgâr (yalnız antrenman/hedef ağı; kupa ve sunucu hesabında yok). Her vuruş için tohumdan üretilir (aynı vuruş aynı rüzgâr).
 * uret(tohum) → { vx, vz, hiz, aci }: vx yan bileşen (+ = sağa), vz boyuna (+ = kaleye doğru, arka rüzgâr). Birim m/sn.
 * Dağılım: %20 durgun (<1), %55 orta (1–4,2), %25 sert (4–6,5). Etki: 6 m/sn yan rüzgâr 28 m'de ≈1,1 m, 18 m'de ≈0,4 m, penaltıda ≈0,14 m sapma. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
function rastgele(seed){var x=(seed|0)^0x5bd1e995;x=x>>>0||1;return function(){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%100000)/100000;};}
function uret(tohum){var r=rastgele(tohum);r();r();var u=r(),hiz=u<.20?r()*1.0:(u<.75?1+r()*3.2:4+r()*2.5),aci=r()*Math.PI*2;hiz=Math.round(hiz*10)/10;
 return{vx:Math.round(hiz*Math.sin(aci)*10)/10,vz:Math.round(hiz*Math.cos(aci)*10)/10,hiz:hiz,aci:aci};}
function seviye(w){return w.hiz<1?'durgun':w.hiz<4.2?'orta':'sert';}
/* Ekranda gösterge oku: yukarı = kaleye doğru (arka rüzgâr). Derece, saat yönü. */
function okAcisi(w){return Math.round(Math.atan2(w.vx,w.vz)*180/Math.PI);}
/* olcekle: rüzgârı k kat güçlendirir/zayıflatır (hayatta kal zorluğu); açı korunur. */
function olcekle(w,k){var h=Math.round(Math.min(6.5*k,w.hiz*k)*10)/10;return{vx:Math.round(w.vx*k*10)/10,vz:Math.round(w.vz*k*10)/10,hiz:Math.round(w.hiz*k*10)/10,aci:w.aci};}
DT.ruzgar={uret:uret,olcekle:olcekle,seviye:seviye,okAcisi:okAcisi};
})(typeof globalThis!=='undefined'?globalThis:window);
