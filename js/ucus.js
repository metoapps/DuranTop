/* SI flight model. Gravity + quadratic drag + spin-dependent Magnus force.
 * Force forms: Goff/Carre 2012, NASA Glenn soccer aerodynamics.
 * Cd, Cl curve, contact efficiency and spin decay are explicit calibrated approximations.
 */
(function(root){
'use strict';var DT=root.DT,A=DT.AYAR,cache=new Map();
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function unit(a){var n=Math.hypot.apply(null,a)||1;return a.map(function(x){return x/n;});}
function acceleration(v,omega,t){var P=A.aerodinamik,R=A.kale.topYaricap,speed=Math.hypot.apply(null,v),q=.5*P.havaYogunlugu*Math.PI*R*R/P.kutle;
 var c=cross(omega,v),cm=Math.hypot.apply(null,c),sp=R*cm/Math.max(speed*speed,1e-9)*Math.exp(-P.spinSonumu*t);
 var cl=Math.min(P.clTavan,P.clEgilim*sp),lift=q*speed*speed*cl;
 return v.map(function(x,i){return -q*P.cd*speed*x+(cm>1e-9?lift*c[i]/cm:0)-(i===1?A.yercekimi:0);});
}
/* Hızlı yol: acceleration() ile AYNI aritmetik, AYNI işlem sırası (bit düzeyinde aynı sonuç; eski kuralların kayıtları ve sunucu tekrarı bozulmaz),
 * ama dizi/closure oluşturmadan. RK4 adımı yalnız bu fonksiyonla yapılır; acceleration() hâlâ dışarıya açık ve hedef.js/fizik.js tarafından kullanılır. */
function accel6(vx,vy,vz,ox,oy,oz,t,out,o){var P=A.aerodinamik,R=A.kale.topYaricap,speed=Math.hypot(vx,vy,vz),q=.5*P.havaYogunlugu*Math.PI*R*R/P.kutle;
 var c0=oy*vz-oz*vy,c1=oz*vx-ox*vz,c2=ox*vy-oy*vx,cm=Math.hypot(c0,c1,c2),sp=R*cm/Math.max(speed*speed,1e-9)*Math.exp(-P.spinSonumu*t);
 var cl=Math.min(P.clTavan,P.clEgilim*sp),lift=q*speed*speed*cl,g=A.yercekimi,kd=-q*P.cd*speed;
 out[o]=vx;out[o+1]=vy;out[o+2]=vz;
 out[o+3]=kd*vx+(cm>1e-9?lift*c0/cm:0)-0;out[o+4]=kd*vy+(cm>1e-9?lift*c1/cm:0)-g;out[o+5]=kd*vz+(cm>1e-9?lift*c2/cm:0)-0;}
/* Kural 10 hızlı yolu (yalnız antrenman/hedef; HIZLI bayrağı energyLaunch ile açılır): Math.hypot yerine sqrt, üstel terim adım başına bir kez hesaplanır,
 * nişan çözümünde adım 1/60 sn. Sonuçlar 1e-9 göreli düzeyde aynıdır ama bit düzeyinde değil; bu yüzden eski kurallar ve kupa bu yolu KULLANMAZ. */
var HIZLI=false;
var RZ=[0,0];   // rüzgâr [x, z] m/sn (yalnız kural 10 hızlı yolu; havadaki top için)
function accelF(vx,vy,vz,ox,oy,oz,ex,out,wx,wz){var P=A.aerodinamik,R=A.kale.topYaricap,rx=vx-wx,rz=vz-wz,speed=Math.sqrt(rx*rx+vy*vy+rz*rz),q=.5*P.havaYogunlugu*Math.PI*R*R/P.kutle;   // sürtünme ve Magnus havaya göre bağıl hızla
 var c0=oy*rz-oz*vy,c1=oz*rx-ox*rz,c2=ox*vy-oy*rx,cm=Math.sqrt(c0*c0+c1*c1+c2*c2),sp=R*cm/Math.max(speed*speed,1e-9)*ex;
 var cl=Math.min(P.clTavan,P.clEgilim*sp),lift=q*speed*speed*cl,kd=-q*P.cd*speed,lm=cm>1e-9?lift/cm:0;
 out[0]=vx;out[1]=vy;out[2]=vz;out[3]=kd*rx+lm*c0;out[4]=kd*vy+lm*c1-A.yercekimi;out[5]=kd*rz+lm*c2;}
var F1=new Float64Array(6),F2=new Float64Array(6),F3=new Float64Array(6),F4=new Float64Array(6);
function stepF(s,omega,t,h){var ox=omega[0],oy=omega[1],oz=omega[2],h2=h/2,k=A.aerodinamik.spinSonumu,e0=Math.exp(-k*t),e1=Math.exp(-k*(t+h2)),e2=Math.exp(-k*(t+h)),hava=s[1]>.25,wx=hava?RZ[0]:0,wz=hava?RZ[1]:0;   // yerde yuvarlanırken rüzgâr etkisi yok
 accelF(s[3],s[4],s[5],ox,oy,oz,e0,F1,wx,wz);
 accelF(s[3]+h2*F1[3],s[4]+h2*F1[4],s[5]+h2*F1[5],ox,oy,oz,e1,F2,wx,wz);
 accelF(s[3]+h2*F2[3],s[4]+h2*F2[4],s[5]+h2*F2[5],ox,oy,oz,e1,F3,wx,wz);
 accelF(s[3]+h*F3[3],s[4]+h*F3[4],s[5]+h*F3[5],ox,oy,oz,e2,F4,wx,wz);
 var h6=h/6;return [s[0]+h6*(F1[0]+2*F2[0]+2*F3[0]+F4[0]),s[1]+h6*(F1[1]+2*F2[1]+2*F3[1]+F4[1]),s[2]+h6*(F1[2]+2*F2[2]+2*F3[2]+F4[2]),
  s[3]+h6*(F1[3]+2*F2[3]+2*F3[3]+F4[3]),s[4]+h6*(F1[4]+2*F2[4]+2*F3[4]+F4[4]),s[5]+h6*(F1[5]+2*F2[5]+2*F3[5]+F4[5])];}
function stepSec(s,omega,t,h){return HIZLI?stepF(s,omega,t,h):step(s,omega,t,h);}
var K1=new Float64Array(6),K2=new Float64Array(6),K3=new Float64Array(6),K4=new Float64Array(6);
function step(s,omega,t,h){var ox=omega[0],oy=omega[1],oz=omega[2],h2=h/2;
 accel6(s[3],s[4],s[5],ox,oy,oz,t,K1,0);
 accel6(s[3]+h2*K1[3],s[4]+h2*K1[4],s[5]+h2*K1[5],ox,oy,oz,t+h2,K2,0);
 accel6(s[3]+h2*K2[3],s[4]+h2*K2[4],s[5]+h2*K2[5],ox,oy,oz,t+h2,K3,0);
 accel6(s[3]+h*K3[3],s[4]+h*K3[4],s[5]+h*K3[5],ox,oy,oz,t+h,K4,0);
 return [s[0]+h*(K1[0]+2*K2[0]+2*K3[0]+K4[0])/6,s[1]+h*(K1[1]+2*K2[1]+2*K3[1]+K4[1])/6,s[2]+h*(K1[2]+2*K2[2]+2*K3[2]+K4[2])/6,
  s[3]+h*(K1[3]+2*K2[3]+2*K3[3]+K4[3])/6,s[4]+h*(K1[4]+2*K2[4]+2*K3[4]+K4[4])/6,s[5]+h*(K1[5]+2*K2[5]+2*K3[5]+K4[5])/6];}
function groundImpulse(velocity,omega,normalImpulse){
 var R=A.kale.topYaricap,m=A.aerodinamik.kutle,I=(2/3)*m*R*R;
 var slip=[velocity[0]+R*omega[2],velocity[2]-R*omega[0]],speed=Math.hypot.apply(null,slip);
 var impulse=Math.min(.4*m*speed,.25*Math.max(0,normalImpulse)),j=slip.map(v=>-impulse*v/Math.max(speed,1e-12));
 return {velocity:[velocity[0]+j[0]/m,velocity[1],velocity[2]+j[1]/m],spin:[omega[0]-R*j[1]/I,omega[1],omega[2]+R*j[0]/I]};
}
function integrate(pos,velocity,omega,options){options=options||{};RZ=options.ruzgar||[0,0];var rulo=options.rulo===undefined?.055:options.rulo,ruloV=options.ruloV||0,minVaris=options.minVaris||0,dt=options.dt||1/120,R=A.kale.topYaricap,t=options.startTime||0,s=(options.initialPosition||[pos.bx,R,0]).concat(velocity),path=[{t:t,x:s[0],y:s[1],z:s[2]}];
 omega=omega.slice();
 for(var i=0;i<Math.ceil(8/dt);i++){
  var next=stepSec(s,omega,t,dt),h=dt;
  // Locate the goal plane by a fractional RK4 step instead of overshooting it.
  if(next[2]>=pos.D){var lo=0,hi=dt;for(var j=0;j<20;j++){var mid=(lo+hi)/2;if(stepSec(s,omega,t,mid)[2]<pos.D)lo=mid;else hi=mid;}h=(lo+hi)/2;next=stepSec(s,omega,t,h);next[2]=pos.D;}
  if(options.zemin!==false&&next[1]<R){next[1]=R;
   if(options.groundSpin){var decay=Math.exp(-A.aerodinamik.spinSonumu*(t+h)),contact=groundImpulse(next.slice(3),omega.map(v=>v*decay),A.aerodinamik.kutle*((1+A.aerodinamik.sekme)*Math.max(0,-next[4])+A.yercekimi*h));
    next[3]=contact.velocity[0];next[5]=contact.velocity[2];omega=contact.spin.map(v=>v/decay);}
   if(Math.abs(next[4])<.45){next[4]=0;var roll=Math.hypot(next[3],next[5]),sur=rulo*A.yercekimi+ruloV*roll;if(minVaris&&roll<minVaris)sur=Math.max(sur,8);   // kural 10: yerde yuvarlanan top minVaris'in altına düşünce çok güçlü sürtünme: top hemen durur (sürünerek çizgiye varmaz)
   var factor=Math.max(0,1-sur*h/Math.max(roll,1e-9));next[3]*=factor;next[5]*=factor;}
   else if(next[4]<0){next[4]=-next[4]*A.aerodinamik.sekme;if(minVaris&&Math.hypot(next[3],next[5])<minVaris*1.6){next[3]*=.35;next[5]*=.35;}}   // kural 10: yavaş sekme de enerji kaybeder (top sekerek sürünmez)
  }
  t+=h;s=next;path.push({t:t,x:s[0],y:s[1],z:s[2]});if(s[2]>=pos.D-1e-8)break;if(options.zemin!==false&&s[1]<=R+1e-6&&Math.hypot(s[3],s[5])<.15)break;
 }
 return {yol:path,velocity:s.slice(3),T:t,son:path[path.length-1],reached:s[2]>=pos.D-1e-8};
}
function temizHiz(pos,aim){var key=[pos.bx,pos.D,pos.tip,aim.x,aim.y].join(':'),stored=cache.get(key);if(stored)return stored.slice();var T=Math.hypot(aim.x-pos.bx,pos.D)/A.hiz[pos.tip],v=[(aim.x-pos.bx)/T,(aim.y-A.kale.topYaricap+.5*A.yercekimi*T*T)/T,pos.D/T];
 // Aim represents a clean central strike. Solve its launch direction with drag present.
 for(var i=0;i<9;i++){var f=integrate({bx:pos.bx,D:pos.D+A.kale.topYaricap,tip:pos.tip},v,[0,0,0],{zemin:false}),dx=aim.x-f.son.x,dy=aim.y-f.son.y;if(Math.abs(dx)+Math.abs(dy)<1e-5)break;v[0]+=dx/f.T;v[1]+=dy/f.T;}
 if(cache.size>=128)cache.clear();cache.set(key,v.slice());return v;
}
function launch(pos,aim,contact,hata,quality,noise,baseOverride,airOnly,temasFizigi){var x=contact.x||0,y=contact.y||0,l=Math.hypot(x,y);if(l>.85){x*=.85/l;y*=.85/l;}var base=baseOverride||temizHiz(pos,aim),power=(.60+.40*quality)*Math.sqrt(1-.35*(x*x+y*y));
 var v=base.map(function(a){return a*power;});v[0]+=hata*2+(1-quality)*.55*noise();v[1]+=hata*2.5-y*1.6;
 if(temasFizigi&&y<0){
  // Getting under the ball raises launch angle; the stronger strike carries it higher.
  // Rotate the velocity, preserving its magnitude instead of adding free energy.
  var horizontal=Math.hypot(v[0],v[2]),speed=Math.hypot.apply(null,v),pitch=Math.atan2(v[1],horizontal);
  var loft=(-y)*(-y)*.50*(.55+.45*Math.min(1.2,speed/25)),newPitch=Math.min(1.25,pitch+loft),ratio=speed*Math.cos(newPitch)/Math.max(horizontal,1e-9);
  v[0]*=ratio;v[2]*=ratio;v[1]=speed*Math.sin(newPitch);
 }
 var forward=unit(v),right=unit(cross([0,1,0],forward)),up=cross(forward,right),R=A.kale.topYaricap;
 // Contact radius in the plane perpendicular to the kick. Central contact has zero torque.
 var radius=forward.map(function(a,i){return R*(-Math.sqrt(1-x*x-y*y)*a+x*right[i]+y*up[i]);});
 var omega=cross(radius,v),eff=A.aerodinamik.spinAktarimi*(.55+.45*quality)*1.5/(R*R);omega=omega.map(function(a){return a*eff;});
 var endPos={bx:pos.bx,D:pos.D+R,tip:pos.tip};var flight=integrate(endPos,v,omega,{zemin:!airOnly});flight.initialVelocity=v.slice();flight.spin=omega;flight.spinRps=Math.hypot.apply(null,omega)/(2*Math.PI);flight.speed=Math.hypot.apply(null,v);flight.contact={x:x,y:y};return flight;
}
var aimedCache=new Map();
function hedefliLaunch(pos,aim,contact,hata,quality,noise,guc,kontrollu,temasFizigi){
 var chosen=typeof guc==='number'?Math.max(.3,Math.min(1,guc)):1;
 // Aim at the chosen forward speed: lower speed needs more loft.
 // Very weak shots may still fall short. Do not warp a sampled flight.
 var adjusted=kontrollu&&chosen>=.55&&chosen<1;
 var key=[pos.bx,pos.D,pos.tip,aim.x,aim.y,contact.x,contact.y,adjusted?chosen:'legacy',temasFizigi?'contact3':'contact2'].join(':'),base=aimedCache.get(key);
 if(!base){base=temizHiz(pos,aim).map(function(v){return adjusted?v*chosen:v;});
  // Only a clean central strike is aimed at the marker. Off-centre contact must
  // alter the launch/spin and landing point, never be cancelled by inverse aiming.
  var calibrated=temasFizigi?{x:0,y:0}:contact;
  // Historical rules still solve using their original contact for exact replays.
  for(var i=0;i<8;i++){
   var f=launch(pos,aim,calibrated,0,1,function(){return 0;},base,true),dx=aim.x-f.son.x,dy=aim.y-f.son.y;
   if(Math.hypot(dx,dy)<.002)break;
   var vx=base.slice(),vy=base.slice();vx[0]+=.05;vy[1]+=.05;
   var fx=launch(pos,aim,calibrated,0,1,function(){return 0;},vx,true),fy=launch(pos,aim,calibrated,0,1,function(){return 0;},vy,true);
   var a=(fx.son.x-f.son.x)/.05,b=(fy.son.x-f.son.x)/.05,c=(fx.son.y-f.son.y)/.05,d=(fy.son.y-f.son.y)/.05,det=a*d-b*c;
   if(Math.abs(det)<1e-6)break;
   base[0]+=Math.max(-8,Math.min(8,(dx*d-b*dy)/det));base[1]+=Math.max(-8,Math.min(8,(a*dy-dx*c)/det));
  }
  if(aimedCache.size>=128)aimedCache.clear();aimedCache.set(key,base.slice());
 }
 return launch(pos,aim,contact,hata,quality,noise,base.map(function(v){return adjusted?v:v*chosen;}),false,temasFizigi);
}
// Rules 5: finite kick energy. The aim selects the low central-contact arc;
// it never changes the available speed or cancels off-centre spin.
var energyAimCache=new Map();
function fixedDirection(pos,aim,speed,tracked){
 var key=[pos.bx,pos.D,aim.x,aim.y,speed,(tracked?6:5)+(HIZLI?'h':'')].join(':'),saved=energyAimCache.get(key);if(saved)return saved.slice();
 var yaw=Math.atan2(aim.x-pos.bx,pos.D+A.kale.topYaricap),end={bx:pos.bx,D:pos.D+A.kale.topYaricap};
 function vector(p){return [speed*Math.cos(p)*Math.sin(yaw),speed*Math.sin(p),speed*Math.cos(p)*Math.cos(yaw)];}
 function trial(p){var f=integrate(end,vector(p),[0,0,0],{zemin:false,dt:HIZLI?1/60:undefined});return {p:p,f:f,error:f.son.y-aim.y};}
 var lower=trial(-.04),best=lower,upper=null;
 var sinir=HIZLI?A.aerodinamik.maxAciK10:9;   // kural 10: düz vuruşta çözücünün çıkış açısı sınırlı (yavaş şutla uzak hedefe 'otomatik lob' yok)
 for(var i=1;i<=12;i++){if(i*.09>sinir)break;var candidate=trial(i*.09);if(Math.abs(candidate.error)<Math.abs(best.error))best=candidate;
  if(candidate.f.reached&&lower.f.reached&&lower.error<=0&&candidate.error>=0){upper=candidate;break;}lower=candidate;
 }
 if(upper){for(var j=0;j<22;j++){var middle=trial((lower.p+upper.p)/2);if(middle.error<0)lower=middle;else upper=middle;}best=trial((lower.p+upper.p)/2);}
 if(tracked&&!upper){
  // Unreachable airborne target: maximize first-landing range, never compare
  // a below-ground endpoint to a goal-height target. Keep available speed.
  var range=-1;
  for(var k=0;k<=30;k++){var angle=k*Math.PI/120;if(angle>sinir)break;var f=trial(angle).f,dist=0;
   for(var n=1;n<f.yol.length;n++){var a=f.yol[n-1],b=f.yol[n];
    if(b.y<=A.kale.topYaricap){var u=(a.y-A.kale.topYaricap)/Math.max(a.y-b.y,1e-12);dist=a.z+(b.z-a.z)*u;break;}
    dist=b.z;
   }
   if(dist>range){range=dist;best={p:angle};}
  }
 }
 var answer=vector(best.p);if(energyAimCache.size>=128)energyAimCache.clear();energyAimCache.set(key,answer);return answer.slice();
}
function energyLaunchIc(pos,aim,contact,hata,quality,noise,guc,tracked,k10){
 var power=typeof guc==='number'?Math.max(.3,Math.min(1,guc)):1;
 /* Kural 10 (k10, şimdilik yalnız antrenman/hedef): sert vuruş gerçekten hızlı (her iki vuruşta %100 = 36 m/sn ≈130 km/sa, %30'da 9 m/sn);
  * temas yüksekliği atış açısını belirler (alt: yükselir, orta: nişan yüksekliği, üst: yerden); yeşilden çok uzak + sert vuruş: top savrulur. */
 var x=contact.x||0,y=contact.y||0,r=Math.hypot(x,y);if(r>.85){x*=.85/r;y*=.85/r;r=.85;}
 var R=A.kale.topYaricap,m=A.aerodinamik.kutle,inertia=(2/3)*m*R*R;
 var nominal=k10?9+(36-9)*(power-.3)/.7:A.hiz[pos.tip]*power,clean=fixedDirection(pos,aim,nominal,tracked);
 var yaw=Math.atan2(clean[0],clean[2])+hata*.14+(1-quality)*.010*noise();
 var pitch=Math.atan2(clean[1],Math.hypot(clean[0],clean[2]));
 // Under-ball shoe path is an explicit game technique assumption. Contact
// coordinates alone cannot identify a real foot's impulse direction.
 if(k10){pitch+=-.32*y+(y<0?.14*y*y:0);   // alt (y=-0,85): +21°, orta: nişan, üst (y=+0,85): -16° → yerden
  var asim=Math.max(0,Math.abs(k10.hata)-k10.bant)/Math.max(.05,.5-k10.bant),savrul=asim*power*power,yon=k10.hata>=0?1:-1;
  yaw+=yon*.32*savrul;pitch+=k10.hata>=0?.30*savrul:-.12*savrul;}   // geç bas: yükselir ve açılır; erken bas: alçalır
 else pitch+=y<0?.50*Math.pow(-y,1.4):-.18*y;
 pitch+=hata*.18+(1-quality)*.008*noise();pitch=Math.max(-.45,Math.min(1.35,pitch));
 var direction=[Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
 var right=unit(cross([0,1,0],direction)),up=cross(direction,right);
 var offset=direction.map(function(a,i){return -Math.sqrt(1-r*r)*a+x*right[i]+y*up[i];});
 // J=m*v, I*w=eta*(r x J). Allocate one finite energy budget to
// translation AND rotation rather than adding spin energy to a full-speed kick.
 var eta=A.aerodinamik.spinAktarimi,spinPerSpeed=cross(offset,direction).map(function(a){return 1.5*eta*a/R;});
 var budget=.5*m*nominal*nominal*Math.pow(.72+.28*quality,2)*(1-.45*r*r);
 var speed=Math.sqrt(2*budget/(m+inertia*Math.pow(Math.hypot.apply(null,spinPerSpeed),2)));
 var v=direction.map(function(a){return a*speed;}),omega=spinPerSpeed.map(function(a){return a*speed;});
 var flight=integrate({bx:pos.bx,D:pos.D+R,tip:pos.tip},v,omega,{groundSpin:true,rulo:k10?A.aerodinamik.ruloK10:undefined,ruloV:k10?A.aerodinamik.ruloVK10:0,minVaris:k10?A.aerodinamik.minVarisK10:0,ruzgar:k10&&k10.ruzgar?k10.ruzgar:undefined});   // kural 10: gerçek çimde yuvarlanma sürtünmesi (yavaş top kaleye varamadan durur)
 flight.initialVelocity=v;flight.spin=omega;flight.spinRps=Math.hypot.apply(null,omega)/(2*Math.PI);flight.speed=speed;flight.contact={x:x,y:y};
 flight.energy={available:budget,translation:.5*m*speed*speed,rotation:.5*inertia*Math.pow(Math.hypot.apply(null,omega),2),nominalSpeed:nominal};return flight;
}
function energyLaunch(pos,aim,contact,hata,quality,noise,guc,tracked,k10){var eski=HIZLI;HIZLI=!!k10;try{return energyLaunchIc(pos,aim,contact,hata,quality,noise,guc,tracked,k10);}finally{HIZLI=eski;}}
DT.ucus={groundImpulse:groundImpulse,energyLaunch:energyLaunch,fixedDirection:fixedDirection,hedefliLaunch:hedefliLaunch,acceleration:acceleration,integrate:integrate,launch:launch,temizHiz:temizHiz};
})(typeof globalThis!=='undefined'?globalThis:window);
