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
 var rem=(end.z-b.z)/vz;return {x:b.x+vx*rem,y:b.y+vy*rem-.5*A.yercekimi*rem*rem,t:b.t};
}
function planla(target,tip,practice,noise,T,options){
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
 var startT=Math.max(okumaT,T-duration-.04),endT=startT+duration;   // gözlemden önce hareket yok
 function konum(t){var u=clamp((t-startT)/duration,0,1),e=u*u*(3-2*u),after=Math.max(0,t-endT-.04);
  var dive=action==='dal'&&u>.18,ground=dive?.30:(gy<.6?.72:1),y=1+(endY-1)*e;
  if(u===1&&y>ground)y=Math.max(ground,y-.5*A.yercekimi*after*after);
  var landed=u===1&&y<=ground+1e-6,landingT=endT+.04+Math.sqrt(2*Math.max(0,endY-ground)/A.yercekimi);
  var recovery=landed?clamp((t-landingT-.22)/1.15,0,1):0;
  if(recovery>0)y=ground+(1-ground)*recovery;
  return {x:endX*e,y:y,ilerleme:u,yon:dive?direction:0,
   poz:dive&&recovery<1?'dal':'bekle',low:gy<.6&&recovery<1,high:gy>1.75&&t<endT+.6,eylem:action,
   landing:landed&&dive,recovery:recovery,airborne:y>ground+.01,block:tip==='frikik'&&central&&!lapse?Math.min(1,u*2)*Math.max(0,1-Math.max(0,t-endT-.2)/.25):0};}
 function cizimKonum(t){return konum(t);}

 return {yanlisKose:wrong,merkezHatasi:lapse,eylem:action,tepki:reaction,okumaT:okumaT,sans:sans,konum:konum,cizimKonum:cizimKonum,hedefX:endX,hedefY:endY,okunanX:gx,okunanY:gy};
}
function model(k){
 if(k.poz!=='dal')return {w:1.25,h:1.85,shapes:[[-.32,-.84,.32,.75]], hands:[[-.46,.0], [.46,.0]], pose:k.saved?2:(k.low?1:0)};
 return {w:2.5,h:1.05,shapes:[[-1.10,-.24,1.10,.30]],hands:[[k.yon*1.04,.16]],pose:k.ilerleme<.55?3:4};
}
function tutarMi(plan,t,p){return DT.model3d.ballHits(plan.konum(t),p,A.kale.topYaricap,plan.D);}

DT.kaleci={planla:planla,tutarMi:tutarMi,model:model,siluet:function(k){return DT.KALECI_SILUET[k.poz==='dal'?(k.yon<0?1:2):0];}};
})(typeof globalThis!=='undefined'?globalThis:window);
