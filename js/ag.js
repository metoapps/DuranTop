/* Ağ fiziği (yalnız görüntü; sonuç hesabına girmez, sunucu bu dosyayı yüklemez).
 * Kale ağı beş yüzeydir: arka ağ, sol/sağ yan ağ, tavan ve (hedef ağı modunda) delikli ağ.
 * Her yüzey yaylı bir zardır: dalga denklemi (c = 3,4 m/sn), sönüm ve geri çağırma ile sallanır.
 * Top bir yüzeye ilk değdiğinde, çarpma hızıyla orantılı bir darbe verilir; komşu yüzeyler de hafifçe sarsılır ("bütün ağlar sallanır").
 * Topun görünümü ağla birlikte gömülür (topOfset), ağ geri çekilirken top ağın içinde kalır.
 * Çizim tarafı (cizim.js, hedef.js) yer değiştirmeyi kay() ile okur: arka ağ ve delikli ağda ayrıca "çukura doğru çekilme" (düzlem içi) vardır. */
(function(root){'use strict';var D=root.DT=root.DT||{},A=D.AYAR;
var C=3.4,SONUM=1.5,GERI=6,ADIM=1/120,SIGMA=.55,DARBE_KATSAYI=.18,DARBE_TAVAN=30,DERINLIK=1.5;
function yuzey(nx,ny,gen,yuk){return{nx:nx,ny:ny,gen:gen,yuk:yuk,dx:gen/nx,dy:yuk/ny,u:new Float32Array((nx+1)*(ny+1)),v:new Float32Array((nx+1)*(ny+1))};}
function adim(y,dt){var nx=y.nx,ny=y.ny,u=y.u,v=y.v,ix=1/(y.dx*y.dx),iy=1/(y.dy*y.dy),c2=C*C,W=nx+1;
 for(var j=1;j<ny;j++)for(var i=1;i<nx;i++){var k=j*W+i,lap=(u[k-1]-2*u[k]+u[k+1])*ix+(u[k-W]-2*u[k]+u[k+W])*iy;v[k]+=(c2*lap-GERI*u[k]-SONUM*v[k])*dt;}
 for(j=1;j<ny;j++)for(i=1;i<nx;i++){k=j*W+i;u[k]+=v[k]*dt;}}
function darbe(y,a,b,vn,carpan){var J=Math.min(vn,DARBE_TAVAN)*DARBE_KATSAYI*(carpan||1),W=y.nx+1,cx=a*y.gen,cy=b*y.yuk,s2=2*SIGMA*SIGMA;
 for(var j=1;j<y.ny;j++)for(var i=1;i<y.nx;i++){var dx=i*y.dx-cx,dy=j*y.dy-cy;y.v[j*W+i]+=J*Math.exp(-(dx*dx+dy*dy)/s2);}}
function ornek(y,a,b){a=Math.max(0,Math.min(1,a));b=Math.max(0,Math.min(1,b));var fx=a*y.nx,fy=b*y.ny,i=Math.min(y.nx-1,Math.floor(fx)),j=Math.min(y.ny-1,Math.floor(fy)),tx=fx-i,ty=fy-j,W=y.nx+1,u=y.u;
 return (u[j*W+i]*(1-tx)+u[j*W+i+1]*tx)*(1-ty)+(u[(j+1)*W+i]*(1-tx)+u[(j+1)*W+i+1]*tx)*ty;}
/* kay: (a,b) ∈ [0,1]² noktasındaki [normal yer değiştirme, ∂u/∂x, ∂u/∂y] (metre, metre/metre). */
function kay(y,a,b){var ea=.5/y.nx,eb=.5/y.ny,u=ornek(y,a,b);return[u,(ornek(y,a+ea,b)-ornek(y,a-ea,b))/(2*ea*y.gen),(ornek(y,a,b+eb)-ornek(y,a,b-eb))/(2*eb*y.yuk)];}
var S=null,onceki=null,tOnceki=0,kilit={},tBirikim=0;
function sifirla(pos){var w=A.kale.genislik/2+A.kale.direk/2,h=A.kale.yukseklik+A.kale.direk/2;
 S={pos:pos,w:w,h:h,z:yuzey(28,10,2*w,h),xl:yuzey(7,10,DERINLIK,h),xr:yuzey(7,10,DERINLIK,h),y:yuzey(28,7,2*w,DERINLIK),hole:pos&&pos.tip==='hedef'?yuzey(28,10,A.kale.genislik,A.kale.yukseklik):null};
 D.ag.z=S.z;D.ag.xl=S.xl;D.ag.xr=S.xr;D.ag.y=S.y;D.ag.hole=S.hole;onceki=null;kilit={};tBirikim=0;}
function enerji(){if(!S)return 0;var e=0;[S.z,S.xl,S.xr,S.y,S.hole].forEach(function(y){if(!y)return;for(var k=0;k<y.u.length;k++)e+=y.u[k]*y.u[k]*GERI+y.v[k]*y.v[k];});return e;}
function temizle(){if(!S)return;[S.z,S.xl,S.xr,S.y,S.hole].forEach(function(y){if(y){y.u.fill(0);y.v.fill(0);}});}
/* guncelle: top = {x,y,z} ya da null; now = ms (gerçek zaman). Darbeleri verir, zarı ilerletir. */
function guncelle(top,now){if(!S)return;var dt=Math.max(0,Math.min(.05,(now-tOnceki)/1000));if(!tOnceki)dt=0;tOnceki=now;
 var R=A.kale.topYaricap,w=S.w,h=S.h,pos=S.pos,Dz=pos.D,Z=Dz+DERINLIK,yari=A.kale.genislik/2,H=A.kale.yukseklik;
 if(top&&onceki&&dt>0){var vx=(top.x-onceki.x)/dt,vy=(top.y-onceki.y)/dt,vz=(top.z-onceki.z)/dt;
  // arka ağ
  if(!kilit.z&&top.z+R>=Z-.05&&vz>2.5&&Math.abs(top.x)<w&&top.y<h){kilit.z=true;darbe(S.z,(top.x+w)/(2*w),top.y/h,vz);darbe(S.xl,1,top.y/h,vz,.3);darbe(S.xr,1,top.y/h,vz,.3);darbe(S.y,(top.x+w)/(2*w),1,vz,.25);}
  if(top.z+R<Z-.7)kilit.z=false;
  // yan ağlar
  [['xl',-1],['xr',1]].forEach(function(q){var y=S[q[0]],sg=q[1];
   if(!kilit[q[0]]&&sg*top.x+R>=w-.05&&sg*vx>2&&top.z>Dz&&top.z<Z){kilit[q[0]]=true;darbe(y,(top.z-Dz)/DERINLIK,top.y/h,sg*vx);darbe(S.z,sg<0?.02:.98,top.y/h,sg*vx,.3);darbe(S.y,sg<0?.02:.98,(top.z-Dz)/DERINLIK,sg*vx,.25);}
   if(sg*top.x+R<w-.7)kilit[q[0]]=false;});
  // tavan
  if(!kilit.y&&top.y+R>=h-.05&&vy>2&&top.z>Dz&&top.z<Z&&Math.abs(top.x)<w){kilit.y=true;darbe(S.y,(top.x+w)/(2*w),(top.z-Dz)/DERINLIK,vy);darbe(S.z,(top.x+w)/(2*w),.98,vy,.3);}
  if(top.y+R<h-.7)kilit.y=false;
  // delikli hedef ağı: delikten geçen top ağa değmez, halkaya ya da ağa çarpan top değer
  if(S.hole){if(!kilit.hole&&top.z+R>=Dz-.04&&vz>2.5){var b=D.hedef&&D.hedef.delikBul?D.hedef.delikBul(top.x,top.y,R):null;kilit.hole=b&&b.tam?'gecti':'carpti';if(kilit.hole==='carpti')darbe(S.hole,(top.x+yari)/(2*yari),top.y/H,vz);}
   if(top.z+R<Dz-.9)kilit.hole=false;}
 }
 onceki=top?{x:top.x,y:top.y,z:top.z}:null;
 tBirikim+=dt;var n=Math.floor(tBirikim/ADIM);tBirikim-=n*ADIM;n=Math.min(n,12);
 for(var i=0;i<n;i++){[S.z,S.xl,S.xr,S.y,S.hole].forEach(function(y){if(y)adim(y,ADIM);});}}
/* topOfset: top ağa gömülürken görüntüsü ağla birlikte geriye gider (yalnız ileri yönde, ağ topu dışarı itmez). */
function topOfset(top){if(!S||!top)return 0;var R=A.kale.topYaricap,w=S.w,Z=S.pos.D+DERINLIK;
 if(top.z>S.pos.D+.2&&top.z+R>Z-.35&&Math.abs(top.x)<w){var u=ornek(S.z,(top.x+w)/(2*w),top.y/S.h);return Math.max(0,Math.min(.7,u));}
 if(S.hole&&top.z+R>S.pos.D-.35&&top.z<S.pos.D+.25){var yr=A.kale.genislik/2,uh=ornek(S.hole,(top.x+yr)/(2*yr),top.y/A.kale.yukseklik);return Math.max(0,Math.min(.7,uh));}
 return 0;}
D.ag={yuzey:yuzey,adim:adim,darbe:darbe,ornek:ornek,kay:kay,sifirla:sifirla,guncelle:guncelle,enerji:enerji,temizle:temizle,topOfset:topOfset,
 GAIN:1.2,z:null,xl:null,xr:null,y:null,hole:null,_ayar:function(o){if('DARBE_KATSAYI'in o)DARBE_KATSAYI=o.DARBE_KATSAYI;}};
})(typeof globalThis!=='undefined'?globalThis:window);
