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
function integrate(pos,velocity,omega,options){options=options||{};var dt=options.dt||1/120,R=A.kale.topYaricap,s=[pos.bx,R,0].concat(velocity),path=[{t:0,x:s[0],y:s[1],z:s[2]}],t=0;
 for(var i=0;i<Math.ceil(8/dt);i++){
  var next=step(s,omega,t,dt),h=dt;
  // Locate the goal plane by a fractional RK4 step instead of overshooting it.
  if(next[2]>=pos.D){var lo=0,hi=dt;for(var j=0;j<20;j++){var mid=(lo+hi)/2;if(step(s,omega,t,mid)[2]<pos.D)lo=mid;else hi=mid;}h=(lo+hi)/2;next=step(s,omega,t,h);next[2]=pos.D;}
  if(options.zemin!==false&&next[1]<R){next[1]=R;
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
function launch(pos,aim,contact,hata,quality,noise,baseOverride,airOnly){var x=contact.x||0,y=contact.y||0,l=Math.hypot(x,y);if(l>.85){x*=.85/l;y*=.85/l;}var base=baseOverride||temizHiz(pos,aim),power=(.60+.40*quality)*Math.sqrt(1-.35*(x*x+y*y));
 var v=base.map(function(a){return a*power;});v[0]+=hata*2+(1-quality)*.55*noise();v[1]+=hata*2.5-y*1.6;
 var forward=unit(v),right=unit(cross([0,1,0],forward)),up=cross(forward,right),R=A.kale.topYaricap;
 // Contact radius in the plane perpendicular to the kick. Central contact has zero torque.
 var radius=forward.map(function(a,i){return R*(-Math.sqrt(1-x*x-y*y)*a+x*right[i]+y*up[i]);});
 var omega=cross(radius,v),eff=A.aerodinamik.spinAktarimi*(.55+.45*quality)*1.5/(R*R);omega=omega.map(function(a){return a*eff;});
 var endPos={bx:pos.bx,D:pos.D+R,tip:pos.tip};var flight=integrate(endPos,v,omega,{zemin:!airOnly});flight.initialVelocity=v.slice();flight.spin=omega;flight.spinRps=Math.hypot.apply(null,omega)/(2*Math.PI);flight.speed=Math.hypot.apply(null,v);flight.contact={x:x,y:y};return flight;
}
var aimedCache=new Map();
function hedefliLaunch(pos,aim,contact,hata,quality,noise){
 var key=[pos.bx,pos.D,pos.tip,aim.x,aim.y,contact.x,contact.y].join(':'),base=aimedCache.get(key);
 if(!base){base=temizHiz(pos,aim).slice();
  // Solve the launch impulse, never bend the sampled path back towards its target.
  for(var i=0;i<8;i++){
   var f=launch(pos,aim,contact,0,1,function(){return 0;},base,true),dx=aim.x-f.son.x,dy=aim.y-f.son.y;
   if(Math.hypot(dx,dy)<.002)break;
   var vx=base.slice(),vy=base.slice();vx[0]+=.05;vy[1]+=.05;
   var fx=launch(pos,aim,contact,0,1,function(){return 0;},vx,true),fy=launch(pos,aim,contact,0,1,function(){return 0;},vy,true);
   var a=(fx.son.x-f.son.x)/.05,b=(fy.son.x-f.son.x)/.05,c=(fx.son.y-f.son.y)/.05,d=(fy.son.y-f.son.y)/.05,det=a*d-b*c;
   if(Math.abs(det)<1e-6)break;
   base[0]+=Math.max(-8,Math.min(8,(dx*d-b*dy)/det));base[1]+=Math.max(-8,Math.min(8,(a*dy-dx*c)/det));
  }
  if(aimedCache.size>=128)aimedCache.clear();aimedCache.set(key,base.slice());
 }
 return launch(pos,aim,contact,hata,quality,noise,base);
}
DT.ucus={hedefliLaunch:hedefliLaunch,acceleration:acceleration,integrate:integrate,launch:launch,temizHiz:temizHiz};
})(typeof globalThis!=='undefined'?globalThis:window);
