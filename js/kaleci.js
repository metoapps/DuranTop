/* Body and leading hands share geometry with the renderer. Outcomes never depend on a forced save probability. */
(function(root){
'use strict';var DT=root.DT,A=DT.AYAR;
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
/* Kaleci topun kale çizgisindeki gerçek noktasını bilmez. Okuma anına (t) kadar uçmuş yolu görür, o andaki hızı
 * (yalnızca t ve ÖNCEKİ örneklerden) düz balistikle çizgiye uzatır: yerçekimi var, Magnus/falso yok. Düz şutta tahmin gerçeğe
 * yakındır; güçlü falsolu şutta falsonun henüz oluşmamış kısmını göremez. Gözlemden önce hareket etmez (startT >= okuma anı). */
function oku(yol,t){
 if(!yol||yol.length<8)return null;
 var end=yol[yol.length-1],i=0;t=Math.min(t,end.t);
 while(i+1<yol.length&&yol[i+1].t<=t)i++;
 var b=yol[i],a=yol[Math.max(0,i-6)],dt=b.t-a.t;if(dt<=1e-9)return null;
 var vx=(b.x-a.x)/dt,vy=(b.y-a.y)/dt,vz=(b.z-a.z)/dt;if(vz<=1e-6)return null;
 var rem=(end.z-b.z)/vz;return {x:b.x+vx*rem,y:b.y+vy*rem-.5*A.yercekimi*rem*rem,t:b.t,arrival:b.t+rem};
}
function planla(target,tip,practice,noise,T,options){
 if(options&&options.penaltiTahmin&&tip==='penalti')return penaltiPlan(practice,noise,options);
 if(options&&options.takipFizigi)return takipPlan(tip,practice,noise,options);
 var K=A.kaleci,reaction=K.tepki[tip]+(practice?A.antrenman.tepkiEk:0);
 options=options||{};var decision=options.decision===undefined?1:options.decision;
 var okumaT=Math.min(reaction+K.okumaGecikme[tip],T*.85),seen=oku(options.yol,okumaT);
 var gx=(seen?seen.x:target.x)+noise()*K.hedefGurultuX,gy=clamp((seen?seen.y:target.y)+noise()*K.hedefGurultuY,.15,2.6);
 // Yanlış kararların zarı (decision) resmi turda ODA+VURUŞ başına ortak tohumdan gelir: beş arkadaşın kaleci koşulu aynıdır.
 var sans=true;
 var central=Math.abs(gx)<=K.merkezEsik;
 var wrong=sans&&tip==='penalti'&&!central&&decision<K.penaltiYanlisKose;
 var lapse=sans&&tip==='frikik'&&central&&decision<K.frikikMerkezHatasi;
 var direction=gx<0?-1:1,action=Math.abs(gx)<K.merkezEsik?'bekle':'dal';
 if(wrong){gx=-gx;direction=-direction;action='dal';}
 if(lapse){direction=decision<K.frikikMerkezHatasi/2?-1:1;gx=direction*3.0;action='dal';}

 var endX=action==='dal'?clamp(gx-direction*K.elMenzili,tip==='frikik'?-2.85:-2.72,tip==='frikik'?2.85:2.72):clamp(gx,-.42,.42);
 var endY=action==='dal'?clamp(gy-.16,.30,tip==='penalti'?1.70:1.6):(gy<.6?.72:(gy>1.75?1.35:1));
 var duration=K.hareketSabit+Math.hypot(endX,endY-1)/(tip==='frikik'?(practice?K.frikikHiz-A.antrenman.hizAzalt:K.frikikHiz):(practice?K.penaltiHiz-A.antrenman.hizAzalt:K.penaltiHiz));
 var arrival=options.enerjiFizigi&&seen?seen.arrival:T;
 var startT=Math.max(okumaT,arrival-duration-.04),endT=startT+duration;   // gözlemden önce hareket yok
 function konum(t){var u=clamp((t-startT)/duration,0,1),e=u*u*(3-2*u),after=Math.max(0,t-endT-.04);
  var dive=action==='dal'&&u>.18,ground=dive?.30:(gy<.6?.72:1),y=1+(endY-1)*e;
  if(u===1&&y>ground)y=Math.max(ground,y-.5*A.yercekimi*after*after);
  var landed=u===1&&y<=ground+1e-6,landingT=endT+.04+Math.sqrt(2*Math.max(0,endY-ground)/A.yercekimi);
  var recovery=landed?clamp((t-landingT-.22)/1.15,0,1):0;
  if(recovery>0)y=ground+(1-ground)*recovery;
  return {eskiKol:!options.sabitKol,x:endX*e,y:y,ilerleme:u,yon:dive?direction:0,
   poz:dive&&recovery<1?'dal':'bekle',low:gy<.6&&recovery<1,high:gy>1.75&&t<endT+.6,eylem:action,
   landing:landed&&dive,recovery:recovery,airborne:y>ground+.01,block:tip==='frikik'&&central&&!lapse?Math.min(1,u*2)*Math.max(0,1-Math.max(0,t-endT-.2)/.25):0};}
 function cizimKonum(t){return konum(t);}

 return {yanlisKose:wrong,merkezHatasi:lapse,eylem:action,tepki:reaction,okumaT:okumaT,sans:sans,konum:konum,cizimKonum:cizimKonum,hedefX:endX,hedefY:endY,okunanX:gx,okunanY:gy};
}
// Rules 6: observations contain only past samples. The goal plane is known
// field geometry; the actual landing point/flight duration are never inputs.
function gozlem(path,t,D,yerTakibi){
 var i=0;while(i+1<path.length&&path[i+1].t<=t+1e-10)i++;
 if(i<12||t-path[i].t>.025)return null;
 // Zemin darbesi, hız ve ivmeyi bir anda değiştirir (sekme + sürtünme darbesi). Pencere bir yer temasını kapsıyorsa bu gözlem güvenilmezdir:
 // atla, önceki plan geçerli kalsın. Aksi halde kaleci sekmeden hemen sonra yanlış varış tahminiyle erken dalıp kalıcı olarak yanlış yere gider.
 if(yerTakibi){var zemin=A.kale.topYaricap+.004;for(var j=i-11;j<=i;j++)if(path[j].y<=zemin&&path[j-1].y>zemin)return null;}
 var b=path[i],a=path[i-6],c=path[i-12],dt=b.t-a.t,dt0=a.t-c.t;
 if(dt<.001||dt0<.001)return null;
 var v=['x','y','z'].map(k=>(b[k]-a[k])/dt),prev=['x','y','z'].map(k=>(a[k]-c[k])/dt0);
 var acc=v.map((x,j)=>clamp((x-prev[j])/((dt+dt0)/2),-20,20));
 v=v.map((x,j)=>x+acc[j]*dt/2);
 // Ground impact is an impulse, not a sustained upward acceleration.
 if(b.y<=.115){v[1]=0;acc[1]=0;}else if(acc[1]>0){var q=path[i-2];v[1]=(b.y-q.y)/(b.t-q.t);acc[1]=-A.yercekimi;}
 if(v[2]<=.1||b.z>=D)return null;
 var remain=clamp((D-b.z)/v[2],0,2),x=b.x,y=b.y,z=b.z;
 // Short forward estimate using the acceleration visible in recent motion.
 // Lateral curvature decays with air speed; no access to hidden ball spin.
 for(var elapsed=0;elapsed<2&&z<D;elapsed+=.025){var h=Math.min(.025,(D-z)/Math.max(v[2],.1));
  x+=v[0]*h+.5*acc[0]*h*h;y+=v[1]*h+.5*acc[1]*h*h;z+=v[2]*h+.5*acc[2]*h*h;
  v=v.map((q,j)=>q+acc[j]*h);acc[0]*=.985;acc[2]*=.985;
  if(y<.11){y=.11;v[1]=Math.max(0,-v[1]*.35);acc[1]=-A.yercekimi;}
  remain=elapsed+h;if(v[2]<=.1)break;
 }
 return {x:x,y:y,t:b.t,arrival:b.t+remain};
}
// Rules 9: choose BEFORE the kick from an independent seeded draw. No aim,
// final target, flight duration or future samples can affect the lateral dive.
function penaltiPlan(practice,noise,o){
 var K=A.kaleci,decision=o.preDecision===undefined?.5:o.preDecision;
 var dir=decision<.14?0:decision<.57?-1:1,start=-.10,x=dir*2.20;
 var vmax=K.penaltiHiz-(practice?A.antrenman.hizAzalt:0);
 var duration=K.hareketSabit+1.5*Math.abs(x)/vmax,end=start+duration;
 var readT=.13+(practice?.025:0),seen=gozlem(o.yol||[],readT,o.D,true);
 // Only height is read after the shot. Lateral commitment cannot be corrected.
 var heightNoise=noise()*K.hedefGurultuY,reads=[];
 for(var rt=readT;rt<=1.3;rt+=.10){var observed=gozlem(o.yol||[],rt,o.D,true);if(observed)reads.push({t:rt,x:observed.x,y:clamp(observed.y+heightNoise,.15,2.6)});}
 var gy=seen?clamp(seen.y+heightNoise,.15,2.6):1;
 var targetY=dir?clamp(gy-.16,.30,1.7):(gy<.6?.72:gy>1.75?1.35:1);
 var heightDuration=Math.max(.22,1.5*Math.abs(targetY-1)/4.0),heightEnd=readT+heightDuration;
 var fallStart=Math.max(end,heightEnd)+.04,ground=dir?.30:(gy<.6?.72:1);
 var landingT=fallStart+Math.sqrt(2*Math.max(0,targetY-ground)/A.yercekimi);
 function konum(t){
  var u=clamp((t-start)/duration,0,1),e=u*u*(3-2*u),v=clamp((t-readT)/heightDuration,0,1),ve=v*v*(3-2*v);
  var y=1+(targetY-1)*ve;
  if(t<readT)y=1+.035*Math.sin(Math.PI*u);
  if(t>fallStart)y=Math.max(ground,y-.5*A.yercekimi*Math.pow(t-fallStart,2));
  var landed=t>=landingT,recovery=landed?clamp((t-landingT-.25)/1.15,0,1):0;
  if(recovery)y=ground+(1-ground)*recovery;
  var dive=dir!==0&&u>.08&&recovery<1,observed=t>=readT,handY=1;
  for(var i=0;i<reads.length&&reads[i].t<=t;i++){var hu=clamp((t-reads[i].t)/.10,0,1);handY+=(reads[i].y-handY)*hu*hu*(3-2*hu);}
  return {x:x*e,y:y,poz:dive?'dal':'bekle',yon:dive?dir:0,ilerleme:u,eylem:dir?'dal':'bekle',eskiKol:false,
    low:observed&&gy<.6&&recovery<1,high:observed&&gy>1.75&&t<fallStart+.4,block:0,
    reachHeight:observed?handY:undefined,reachBlend:clamp((t-readT)/.14,0,1),
    landing:landed&&dir!==0,recovery:recovery,airborne:dive&&!landed};
 }
 return {onKarar:true,kararYon:dir,baslamaT:start,yanlisKose:!!(seen&&dir&&Math.abs(seen.x)>.75&&dir*seen.x<0),merkezHatasi:false,
  eylem:dir?'dal':'bekle',tepki:start,okumaT:readT,sans:true,hedefX:x,hedefY:targetY,okunanX:seen?seen.x:0,okunanY:gy,
  gozlemler:reads,konum:konum,cizimKonum:konum};
}
function takipPlan(tip,practice,noise,o){
 var K=A.kaleci,first=K.tepki[tip]+(o.kural10&&tip==='frikik'?.05:K.okumaGecikme[tip])+(practice?A.antrenman.tepkiEk:0);   // kural 10: frikikte okuma 0,30→0,05 sn
 var nx=noise()*K.hedefGurultuX,ny=noise()*K.hedefGurultuY,decision=o.decision===undefined?1:o.decision;
 var vmax=(tip==='frikik'?K.frikikHiz:K.penaltiHiz)-(practice?A.antrenman.hizAzalt:0);
 var segments=[],wrong=false,lapse=false,chosen=false,reads=[];
 function idle(){return {x:0,y:1,poz:'bekle',yon:0,ilerleme:0,eylem:'bekle',eskiKol:false,low:false,high:false,block:0,landing:false,recovery:0,airborne:false};}
 function sample(seg,t){
  if(!seg)return idle();var u=clamp((t-seg.start)/seg.duration,0,1),e=u*u*(3-2*u),dive=seg.action==='dal'&&u>.18;
  var ground=dive?.30:(seg.gy<.6?.72:1),y=seg.origin.y+(seg.y-seg.origin.y)*e,end=seg.start+seg.duration;
  if(u===1)y=Math.max(ground,y-.5*A.yercekimi*Math.pow(Math.max(0,t-end-.04),2));
  var landingT=end+.04+Math.sqrt(2*Math.max(0,seg.y-ground)/A.yercekimi),landed=u===1&&y<=ground+1e-6;
  var recovery=landed?clamp((t-landingT-.22)/1.15,0,1):0;if(recovery)y=ground+(1-ground)*recovery;
  return {x:seg.origin.x+(seg.x-seg.origin.x)*e,y:y,poz:dive&&recovery<1?'dal':'bekle',yon:dive?seg.dir:0,
   ilerleme:u,eylem:seg.action,eskiKol:false,low:seg.gy<.6&&recovery<1,high:seg.gy>1.75&&t<end+.6,
   block:tip==='frikik'&&seg.central&&!lapse?Math.min(1,u*2):0,landing:landed&&dive,recovery:recovery,airborne:dive&&!landed};
 }
 for(var t=first;t<=8;t+=.10){
  var old=segments[segments.length-1],current=sample(old,t);
  // Once a dive starts its momentum is committed. No mid-air teleport/reversal.
  if(old&&current.poz==='dal')break;
  var seen=gozlem(o.yol||[],t,o.D,o.yerTakibi===true);if(!seen)continue;
  var gx=seen.x+nx,gy=clamp(seen.y+ny,.15,2.6),central=Math.abs(gx)<=K.merkezEsik;
  if(!chosen){wrong=tip==='penalti'&&!central&&decision<K.penaltiYanlisKose;lapse=tip==='frikik'&&central&&decision<K.frikikMerkezHatasi;chosen=true;}
  if(wrong)gx=-gx;if(lapse)gx=(decision<K.frikikMerkezHatasi/2?-1:1)*3;
  var dir=gx<current.x?-1:1,action=Math.abs(gx-current.x)<K.merkezEsik?'bekle':'dal';
  var x=action==='dal'?clamp(gx-dir*K.elMenzili,-2.85,2.85):clamp(gx,-2.85,2.85);
  var y=action==='dal'?clamp(gy-.16,.30,1.7):(gy<.6?.72:(gy>1.75?1.35:1));
  // Smoothstep peak speed is 1.5 times average. Bound body speed accordingly.
  var duration=K.hareketSabit+1.5*Math.hypot(x-current.x,y-current.y)/vmax;
  var seg={at:t,start:Math.max(t,seen.arrival-duration-.09),duration:duration,origin:current,x:x,y:y,gy:gy,dir:dir,central:central,action:action};
  segments.push(seg);reads.push({t:t,x:gx,y:gy});
 }
 function konum(t){var seg=null;for(var i=0;i<segments.length&&segments[i].at<=t;i++)seg=segments[i];return sample(seg,t);}
 var last=segments[segments.length-1];
 return {yanlisKose:wrong,merkezHatasi:lapse,eylem:last?last.action:'bekle',tepki:K.tepki[tip],okumaT:first,sans:true,
  konum:konum,cizimKonum:konum,hedefX:last?last.x:0,hedefY:last?last.y:1,okunanX:reads.length?reads[reads.length-1].x:0,okunanY:reads.length?reads[reads.length-1].y:1,gozlemler:reads};
}
function model(k){
 if(k.poz!=='dal')return {w:1.25,h:1.85,shapes:[[-.32,-.84,.32,.75]], hands:[[-.46,.0], [.46,.0]], pose:k.saved?2:(k.low?1:0)};
 return {w:2.5,h:1.05,shapes:[[-1.10,-.24,1.10,.30]],hands:[[k.yon*1.04,.16]],pose:k.ilerleme<.55?3:4};
}
function tutarMi(plan,t,p){return DT.model3d.ballHits(plan.konum(t),p,A.kale.topYaricap,plan.D);}

DT.kaleci={planla:planla,tutarMi:tutarMi,model:model,siluet:function(k){return DT.KALECI_SILUET[k.poz==='dal'?(k.yon<0?1:2):0];}};
})(typeof globalThis!=='undefined'?globalThis:window);
