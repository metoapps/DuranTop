/* Each wall player has the same geometry in drawing and contact tests. Units: metres. */
(function(root){'use strict';var D=root.DT,A=D.AYAR;
function rnd(seed){var a=(seed|0)+0x9E3779B9|0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
/* Kural 9 (opts yok): ortadaki iki oyuncu hep zıplar. Kural 10 (opts.seed): her oyuncu olasılıkla zıplar (orta 0,92, kenar 0,60; en az 2 zıplayan), zamanlama ve hız oyuncudan oyuncuya değişir.
 * GORUNUM: yalnız çizim (yüz, ten, saç, beden), oyuncunun sırasına göre js/baraj3d.js seçer; sonuç çıktısına girmez (eski kurallar birebir aynı kalsın). */
var GORUNUM=[{ten:'#c68f6a',sac:'#1f1a16',stil:'kisa',sakal:.0,kas:.9,beden:.97},{ten:'#8a5a3c',sac:'#14110f',stil:'kivircik',sakal:.5,kas:1.2,beden:1.02},{ten:'#e2b896',sac:'#6a4a2c',stil:'ince',sakal:.2,kas:.8,beden:.93},{ten:'#b97d55',sac:'#0e0c0b',stil:'dazlak',sakal:.7,kas:1.0,beden:1.0},{ten:'#d9a47f',sac:'#3b2a1c',stil:'kisa',sakal:.35,kas:1.1,beden:.99},{ten:'#9a6a49',sac:'#1a1410',stil:'ince',sakal:.0,kas:.9,beden:.95}];
/* Kural 10 baraj kurulumu (gerçekçi): oyuncu sayısı mesafeye göre (<19 m: 5, <26 m: 4, daha uzak: 3), omuz omuza (0,52 m), boy dağılımı ve küçük hizalama
 * hataları pozisyondan türetilir (aynı pozisyonda hep aynı baraj; önizleme ve vuruş aynı), zıplama seed'den. yanKayma: baraj yakın direğe giden hattı örter. */
var SP10=.52,BOYLAR=[1.74,1.78,1.81,1.84,1.87,1.90,1.94];
function sayi(pos){var m=Math.hypot(pos.bx||0,pos.D);return m<19?5:m<26?4:3;}
function posTohum(pos){return Math.round((pos.bx||0)*100)*31+Math.round(pos.D*10)*7+5;}
/* yanKayma: topun yakın direğe giden hattı (top → yakın direk, kale çizgisinde 3,66 m) baraj mesafesinde nereden geçiyorsa, barajın dış ucu o hatta gelecek şekilde
 * barajın merkezini yana kaydırır. (px,pz) baraj çizgisinin yatay yönüdür. Ortadaki top (bx=0) için 0. */
function yanKayma(pos,ux,uz,px,pz,mesafe){var bx=pos.bx||0;if(Math.abs(bx)<.3)return 0;var sg=bx>0?1:-1,nx=sg*3.66-bx,nz=pos.D,nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
 var dot=nx*ux+nz*uz;if(dot<.2)return 0;var s=mesafe/dot,Px=bx+nx*s,Pz=nz*s,Cx=bx+ux*mesafe,Cz=uz*mesafe,lN=(Px-Cx)*px+(Pz-Cz)*pz,yan=lN<0?-1:1,n=sayi(pos),yari=(n-1)*SP10/2+.22;
 return lN-yan*(yari-.2);}
function kur(pos,opts){
 if(opts&&opts.kural10){var n=sayi(pos),rp=rnd(posTohum(pos)),rs=rnd(opts.seed),say=0,orta=(n-1)/2;
  var l10=[];for(var i=0;i<n;i++){var h=BOYLAR[Math.floor(rp()*BOYLAR.length)],jit=(rp()-.5)*.07,merkez=Math.abs(i-orta)<=1,jump=rs()<(merkez?.92:.60),v=2.25+rs()*.55,start=.24+Math.abs(i-orta)*.03+rs()*.07;if(jump)say++;
   l10.push({boy:h,off:(i-orta)*SP10+jit,jump:jump,v:v,start:start});}
  if(say<2)l10.map(function(q,i){return i;}).sort(function(a,b){return Math.abs(a-orta)-Math.abs(b-orta);}).slice(0,2).forEach(function(i){l10[i].jump=true;});   // en az iki zıplayan: ortadaki iki oyuncu
  return l10;}
 var heights=pos.bx>0?[1.78,1.94,1.85,1.89]:[1.89,1.85,1.94,1.78],r=opts?rnd(opts.seed):null,say2=0;
 var liste=heights.map(function(h,i){var orta=i===1||i===2,jump=r?r()<(orta?.92:.60):orta,v=r?2.25+r()*.55:(i===1?2.6:2.35),start=r?.24+i*.03+r()*.07:.28+i*.035;if(jump)say2++;return {boy:h,off:(i-1.5)*.55,jump:jump,v:v,start:start};});
 if(r&&say2<2)[1,2].forEach(function(i){liste[i].jump=true;});return liste;}
function durum(p,t){var u=t-p.start,j=p.jump&&u>0?Math.max(0,p.v*u-.5*A.yercekimi*u*u):0;return {boy:p.boy,off:p.off,y:j};}
function distance(px,py,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-a[0]-u*dx,py-a[1]-u*dy);}
function parcalar(p,t){var d=durum(p,t),scale=d.boy/1.92,rig=D.model3d.rig({x:d.off,y:d.y+1,poz:'bekle'},0);
 function point(n){return [d.off+(n[0]-d.off)*scale,d.y+(n[1]-d.y)*scale];}
 var shapes=rig.bones.map(function(b){return {a:point(rig.nodes[b[0]]),b:point(rig.nodes[b[1]]),r:b[2]*scale,ad:b[3]==='shorts'||b[3]==='socks'?'bacak':b[3]==='skin'?'kol':'gövde'};});
 shapes.push({a:point(rig.nodes.head),b:point(rig.nodes.head),r:.19*scale,ad:'baş'});return shapes;
}
function ilkTemas(b,path,R){for(var i=1;i<path.length;i++){var a=path[i-1],p=path[i];var da=(a.x-b.merkezX)*b.ux+(a.z-b.merkezZ)*b.uz,dp=(p.x-b.merkezX)*b.ux+(p.z-b.merkezZ)*b.uz;
 if(da>.22+R||dp<-.22-R)continue;
 // Subdivide the swept segment so a fast ball cannot jump through a limb.
 var steps=Math.max(1,Math.ceil(Math.hypot(p.x-a.x,p.y-a.y,p.z-a.z)/(R*.5)));
 for(var j=0;j<=steps;j++){var u=j/steps,t=a.t+(p.t-a.t)*u,x=a.x+(p.x-a.x)*u,y=a.y+(p.y-a.y)*u,z=a.z+(p.z-a.z)*u,depth=(x-b.merkezX)*b.ux+(z-b.merkezZ)*b.uz;if(Math.abs(depth)>.22+R)continue;
 var lateral=(x-b.merkezX)*b.px+(z-b.merkezZ)*b.pz;
 for(var n=0;n<b.oyuncular.length;n++){var shapes=parcalar(b.oyuncular[n],t);for(var k=0;k<shapes.length;k++){var s=shapes[k];if(distance(lateral,y,s.a,s.b)<=s.r+R)return {index:i,player:n,part:s.ad,t:t,x:x,y:y,z:z};}}
 }}return null;}
D.baraj={GORUNUM:GORUNUM,sayi:sayi,yanKayma:yanKayma,kur:kur,durum:durum,parcalar:parcalar,ilkTemas:ilkTemas};})(typeof globalThis!=='undefined'?globalThis:window);
