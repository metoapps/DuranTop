/* Body and leading hands share geometry with the renderer. Outcomes never depend on a forced save probability. */
(function(root){
'use strict';var DT=root.DT,A=DT.AYAR;
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function planla(target,tip,practice,noise,T){
 var K=A.kaleci,reaction=K.tepki[tip]+(practice?.035:0);
 var gx=target.x+noise()*.06,gy=clamp(target.y+noise()*.04,.15,2.6);
 var direction=gx<0?-1:1,action=Math.abs(gx)<.75?'bekle':'dal';
 var endX=action==='dal'?clamp(gx-direction*.72,-2.6,2.6):clamp(gx,-.42,.42);
 var endY=action==='dal'?clamp(gy-.16,.23,1.6):(gy<.6?.72:(gy>1.75?1.35:1));
 var duration=.08+Math.hypot(endX,endY-1)/(practice?5.4:6.2);
 function konum(t){var u=clamp((t-reaction)/duration,0,1),e=u*u*(3-2*u);
  return {x:endX*e,y:1+(endY-1)*e,ilerleme:u,yon:action==='dal'?direction:0,
   poz:action==='dal'&&u>.18?'dal':'bekle',low:gy<.6,high:gy>1.75,eylem:action};}
 function cizimKonum(t,impactT){var k=konum(t);
  if(action!=='dal'||t<=impactT)return k;
  var start=konum(impactT),fall=Math.max(0,t-impactT-.08),ground=Math.min(.30,start.y);
  k.y=Math.max(ground,start.y-.5*A.yercekimi*fall*fall);
  k.landing=k.y<=ground+1e-6;return k;
 }
 return {eylem:action,tepki:reaction,konum:konum,cizimKonum:cizimKonum,hedefX:endX,hedefY:endY};
}
function model(k){
 if(k.poz!=='dal')return {w:1.25,h:1.85,shapes:[[-.32,-.84,.32,.75]], hands:[[-.46,.0], [.46,.0]], pose:k.saved?2:(k.low?1:0)};
 return {w:2.5,h:1.05,shapes:[[-1.10,-.24,1.10,.30]],hands:[[k.yon*1.04,.16]],pose:k.ilerleme<.55?3:4};
}
function tutarMi(plan,t,p){var k=plan.konum(t),R=A.kale.topYaricap;
 if(k.poz!=='dal'){var dx=Math.max(Math.abs(p.x-k.x)-.47,0),dy=Math.max(k.y-.88-p.y,0,p.y-k.y-.80);return dx*dx+dy*dy<=R*R;}
 // Body capsule and leading arms follow the same dive direction.
 var dx=p.x-k.x,dy=p.y-k.y;
 var a=dx*k.yon, body=Math.max(Math.abs(dx)-.55,0);
 return body*body+dy*dy<=.28*.28 || (a>=.25-R&&a<=1.15+R&&Math.abs(dy-.16)<=.20+R);
}
DT.kaleci={planla:planla,tutarMi:tutarMi,model:model,siluet:function(k){return DT.KALECI_SILUET[k.poz==='dal'?(k.yon<0?1:2):0];}};
})(typeof globalThis!=='undefined'?globalThis:window);
