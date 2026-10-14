/* Bonus katmanı (yalnız antrenman/hedef; kupa puanına karışmaz): ALTIN BÖLGE ve SERİ ÇARPANI.
 * Altın bölge: her penaltı/frikik vuruşunda tohumdan seçilen, kale düzleminde bir dikdörtgen. Golün çizgiyi geçtiği nokta içindeyse +3 puan (dar bölgede +4).
 * Seri: arka arkaya gol sayısı. Çarpan: 1 gol ×1, 2 ×1,25, 3 ×1,5, 4 ve üstü ×2; ek puan = yuvarlanmış (taban+altın) × (çarpan−1). Kaçan şut seriyi sıfırlar. */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var BOLGELER=[
 {ad:'Sol üst köşe',x1:-3.66,x2:-2.2,y1:1.5,y2:2.44,bonus:4,agirlik:3},{ad:'Sağ üst köşe',x1:2.2,x2:3.66,y1:1.5,y2:2.44,bonus:4,agirlik:3},
 {ad:'Sol alt köşe',x1:-3.66,x2:-2.2,y1:0,y2:.9,bonus:3,agirlik:2},{ad:'Sağ alt köşe',x1:2.2,x2:3.66,y1:0,y2:.9,bonus:3,agirlik:2},
 {ad:'Üst orta',x1:-1.1,x2:1.1,y1:1.7,y2:2.44,bonus:4,agirlik:2},{ad:'Alt orta',x1:-1.1,x2:1.1,y1:0,y2:.6,bonus:3,agirlik:1}];
function rastgele(seed){var x=((seed|0)^0x27d4eb2f)>>>0||1;return function(){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%100000)/100000;};}
function altinUret(tohum){var r=rastgele(tohum);r();var top=0;BOLGELER.forEach(function(b){top+=b.agirlik;});var u=r()*top,acc=0;for(var i=0;i<BOLGELER.length;i++){acc+=BOLGELER[i].agirlik;if(u<acc)return Object.assign({i:i},BOLGELER[i]);}return Object.assign({i:0},BOLGELER[0]);}
function icinde(b,x,y){return !!b&&Number.isFinite(x)&&Number.isFinite(y)&&x>=b.x1&&x<=b.x2&&y>=b.y1&&y<=b.y2;}
function seriCarpan(seri){return seri>=4?2:seri===3?1.5:seri===2?1.25:1;}
/* uygula: p (puanla çıktısı), sonuc: {gol: golMu, x, y}, durum: {seri}, altin bölge → {puan, altin, seri, carpan, ek}; durum.seri güncellenir. */
function uygula(p,sonuc,durum,bolge){var out=Object.assign({},p);out.altin=0;out.carpan=1;out.seriEk=0;
 if(!sonuc.gol){durum.seri=0;out.seri=0;return out;}
 durum.seri=(durum.seri||0)+1;out.seri=durum.seri;
 if(bolge&&icinde(bolge,sonuc.x,sonuc.y)){out.altin=bolge.bonus;}
 var taban=out.puan+out.altin,c=seriCarpan(durum.seri);out.carpan=c;out.seriEk=Math.round(taban*(c-1));out.puan=taban+out.seriEk;return out;}
DT.bonus={BOLGELER:BOLGELER,altinUret:altinUret,icinde:icinde,seriCarpan:seriCarpan,uygula:uygula};
})(typeof globalThis!=='undefined'?globalThis:window);
