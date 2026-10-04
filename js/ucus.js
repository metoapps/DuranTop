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
function derivative(s,omega,t){return s.slice(3).concat(acceleration(s.slice(3),omega,t));}
function add(s,k,h){return s.map(function(x,i){return x+h*k[i];});}
function step(s,omega,t,h){var k1=derivative(s,omega,t),k2=derivative(add(s,k1,h/2),omega,t+h/2),k3=derivative(add(s,k2,h/2),omega,t+h/2),k4=derivative(add(s,k3,h),omega,t+h);return s.map(function(x,i){return x+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6;});}
function groundImpulse(velocity,omega,normalImpulse){
 var R=A.kale.topYaricap,m=A.aerodinamik.kutle,I=(2/3)*m*R*R;
 var slip=[velocity[0]+R*omega[2],velocity[2]-R*omega[0]],speed=Math.hypot.apply(null,slip);
 var impulse=Math.min(.4*m*speed,.25*Math.max(0,normalImpulse)),j=slip.map(v=>-impulse*v/Math.max(speed,1e-12));
 return {velocity:[velocity[0]+j[0]/m,velocity[1],velocity[2]+j[1]/m],spin:[omega[0]-R*j[1]/I,omega[1],omega[2]+R*j[0]/I]};
}
function integrate(pos,velocity,omega,options){options=options||{};var dt=options.dt||1/120,R=A.kale.topYaricap,t=options.startTime||0,s=(options.initialPosition||[pos.bx,R,0]).concat(velocity),path=[{t:t,x:s[0],y:s[1],z:s[2]}];
 omega=omega.slice();
 for(var i=0;i<Math.ceil(8/dt);i++){
  var next=step(s,omega,t,dt),h=dt;
  // Locate the goal plane by a fractional RK4 step instead of overshooting it.
  if(next[2]>=pos.D){var lo=0,hi=dt;for(var j=0;j<20;j++){var mid=(lo+hi)/2;if(step(s,omega,t,mid)[2]<pos.D)lo=mid;else hi=mid;}h=(lo+hi)/2;next=step(s,omega,t,h);next[2]=pos.D;}
  if(options.zemin!==false&&next[1]<R){next[1]=R;
   if(options.groundSpin){var decay=Math.exp(-A.aerodinamik.spinSonumu*(t+h)),contact=groundImpulse(next.slice(3),omega.map(v=>v*decay),A.aerodinamik.kutle*((1+A.aerodinamik.sekme)*Math.max(0,-next[4])+A.yercekimi*h));
    next[3]=contact.velocity[0];next[5]=contact.velocity[2];omega=contact.spin.map(v=>v/decay);}
   if(Math.abs(next[4])<.45){next[4]=0;var roll=Math.hypot(next[3],next[5]),factor=Math.max(0,1-.055*A.yercekimi*h/Math.max(roll,1e-9));next[3]*=factor;next[5]*=factor;}
   else if(next[4]<0)next[4]=-next[4]*A.aerodinamik.sekme;
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
function fixedDirection(pos,aim,speed){
 var key=[pos.bx,pos.D,aim.x,aim.y,speed].join(':'),saved=energyAimCache.get(key);if(saved)return saved.slice();
 var yaw=Math.atan2(aim.x-pos.bx,pos.D+A.kale.topYaricap),end={bx:pos.bx,D:pos.D+A.kale.topYaricap};
 function vector(p){return [speed*Math.cos(p)*Math.sin(yaw),speed*Math.sin(p),speed*Math.cos(p)*Math.cos(yaw)];}
 function trial(p){var f=integrate(end,vector(p),[0,0,0],{zemin:false});return {p:p,f:f,error:f.son.y-aim.y};}
 var lower=trial(-.04),best=lower,upper=null;
 for(var i=1;i<=12;i++){var candidate=trial(i*.09);if(Math.abs(candidate.error)<Math.abs(best.error))best=candidate;
  if(candidate.f.reached&&lower.f.reached&&lower.error<=0&&candidate.error>=0){upper=candidate;break;}lower=candidate;
 }
 if(upper){for(var j=0;j<22;j++){var middle=trial((lower.p+upper.p)/2);if(middle.error<0)lower=middle;else upper=middle;}best=trial((lower.p+upper.p)/2);}
 var answer=vector(best.p);if(energyAimCache.size>=128)energyAimCache.clear();energyAimCache.set(key,answer);return answer.slice();
}
function energyLaunch(pos,aim,contact,hata,quality,noise,guc){
 var power=typeof guc==='number'?Math.max(.3,Math.min(1,guc)):1;
 var x=contact.x||0,y=contact.y||0,r=Math.hypot(x,y);if(r>.85){x*=.85/r;y*=.85/r;r=.85;}
 var R=A.kale.topYaricap,m=A.aerodinamik.kutle,inertia=(2/3)*m*R*R;
 var nominal=A.hiz[pos.tip]*power,clean=fixedDirection(pos,aim,nominal);
 var yaw=Math.atan2(clean[0],clean[2])+hata*.14+(1-quality)*.010*noise();
 var pitch=Math.atan2(clean[1],Math.hypot(clean[0],clean[2]));
 // Under-ball shoe path is an explicit game technique assumption. Contact
// coordinates alone cannot identify a real foot's impulse direction.
 pitch+=y<0?.50*Math.pow(-y,1.4):-.18*y;
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
 var flight=integrate({bx:pos.bx,D:pos.D+R,tip:pos.tip},v,omega,{groundSpin:true});
 flight.initialVelocity=v;flight.spin=omega;flight.spinRps=Math.hypot.apply(null,omega)/(2*Math.PI);flight.speed=speed;flight.contact={x:x,y:y};
 flight.energy={available:budget,translation:.5*m*speed*speed,rotation:.5*inertia*Math.pow(Math.hypot.apply(null,omega),2),nominalSpeed:nominal};return flight;
}
DT.ucus={groundImpulse:groundImpulse,energyLaunch:energyLaunch,fixedDirection:fixedDirection,hedefliLaunch:hedefliLaunch,acceleration:acceleration,integrate:integrate,launch:launch,temizHiz:temizHiz};
})(typeof globalThis!=='undefined'?globalThis:window);
