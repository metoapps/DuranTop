/* Bonus katmanı (yalnız antrenman/hedef; kupa puanına karışmaz): ALTIN BÖLGE ve SERİ ÇARPANI.
 * Altın bölge: YALNIZ penaltı ve frikik vuruşlarında (hedef ağında ve diğer aşamalarda yok), tohumdan seçilen, kale düzleminde küçük bir daire. Golün çizgiyi geçtiği nokta içindeyse +4/+5 puan.
 * Seri: arka arkaya gol sayısı. Çarpan: 1 gol ×1, 2 ×1,25, 3 ×1,5, 4 ve üstü ×2; ek puan = yuvarlanmış (taban+altın) × (çarpan−1). Kaçan şut seriyi sıfırlar. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var BOLGELER=[   // daire: merkez (x,y) kale düzleminde, yarıçap r (m). Kale 7,32×2,44 m; bölgeler köşelerde küçük (çap ≈0,9–1,0 m).
 {ad:'Sol üst köşe',x:-3.0,y:1.9,r:.5,bonus:5,agirlik:3},{ad:'Sağ üst köşe',x:3.0,y:1.9,r:.5,bonus:5,agirlik:3},
 {ad:'Sol alt köşe',x:-3.0,y:.5,r:.45,bonus:4,agirlik:2},{ad:'Sağ alt köşe',x:3.0,y:.5,r:.45,bonus:4,agirlik:2},
 {ad:'Üst orta',x:0,y:2.0,r:.42,bonus:5,agirlik:2}];
function rastgele(seed){var x=((seed|0)^0x27d4eb2f)>>>0||1;return function(){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%100000)/100000;};}
function altinUret(tohum){var r=rastgele(tohum);r();var top=0;BOLGELER.forEach(function(b){top+=b.agirlik;});var u=r()*top,acc=0;for(var i=0;i<BOLGELER.length;i++){acc+=BOLGELER[i].agirlik;if(u<acc)return Object.assign({i:i},BOLGELER[i]);}return Object.assign({i:0},BOLGELER[0]);}
function icinde(b,x,y){return !!b&&Number.isFinite(x)&&Number.isFinite(y)&&Math.hypot(x-b.x,y-b.y)<=b.r;}
function seriCarpan(seri){return seri>=4?2:seri===3?1.5:seri===2?1.25:1;}
/* uygula: p (puanla çıktısı), sonuc: {gol: golMu, x, y}, durum: {seri}, altin bölge → {puan, altin, seri, carpan, ek}; durum.seri güncellenir. */
function uygula(p,sonuc,durum,bolge){var out=Object.assign({},p);out.altin=0;out.carpan=1;out.seriEk=0;
 if(!sonuc.gol){durum.seri=0;out.seri=0;return out;}
 durum.seri=(durum.seri||0)+1;out.seri=durum.seri;
 if(bolge&&icinde(bolge,sonuc.x,sonuc.y)){out.altin=bolge.bonus;}
 var taban=out.puan+out.altin,c=seriCarpan(durum.seri);out.carpan=c;out.seriEk=Math.round(taban*(c-1));out.puan=taban+out.seriEk;return out;}
DT.bonus={BOLGELER:BOLGELER,altinUret:altinUret,icinde:icinde,seriCarpan:seriCarpan,uygula:uygula};
})(typeof globalThis!=='undefined'?globalThis:window);
