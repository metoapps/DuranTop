/* Articulated visual player. Existing portraits/kit textures, fixed limb lengths.
 * This is a procedural mesh, not a scanned likeness or a mirrored flat sprite. */
(function(root){'use strict';var D=root.DT,cache=new Map(),idleCache=new Map();
var crops={meto:{front:[397,62,139,185],back:[326,62,201,185]},lort:{front:[386,62,138,185],back:[357,62,172,185]},fero:{front:[369,61,162,186],back:[333,62,199,185]},latte:{front:[379,62,148,185],back:[341,62,194,185]},josh:{front:[388,62,150,185],back:[337,62,173,185]}};
var kits={meto:['#17191e','#e63946'],lort:['#1455c7','#eeeeee'],fero:['#ededed','#222222'],latte:['#ba2230','#171717'],josh:['#522580','#e8bc56']};
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}function mix(a,b,t){return a+(b-a)*t;}
function add(a,b){return a.map((x,i)=>x+b[i]);}function sub(a,b){return a.map((x,i)=>x-b[i]);}function mul(a,s){return a.map(x=>x*s);}function dot(a,b){return a.reduce((n,x,i)=>n+x*b[i],0);}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function unit(v){return mul(v,1/(Math.hypot.apply(null,v)||1));}
function knee(hip,foot,L,hint){L=L||72;var axis=unit(sub(foot,hip)),distance=Math.hypot.apply(null,sub(foot,hip)),d=clamp(distance,.01,2*L-.01),center=add(hip,mul(axis,d/2)),bend=Math.sqrt(Math.max(0,L*L-d*d/4)),perp=unit(sub(hint=hint||[0,0,1],mul(axis,dot(hint,axis))));return{foot:add(hip,mul(axis,d)),knee:add(center,mul(perp,bend))};}
// Metres, shared with the goal, keeper and ball. Head top 471, sole 8.
var HEIGHT=1.80,UNIT=HEIGHT/463;
/* ---------- Koşarak vuruş ----------
 * Zaman çizelgesi (windup W'nin oranları): 0–.30 geri adım (topun arkasındaki koşu başlangıcına), .30–.36 dönüş, .36–.82 koşu (4 adım: sağ, sol, sağ, sol=basma ayağı topun yanına),
 * .82–1.0 vuruş (sağ ayak savrulur), >1 vuruş sonrası sürüklenme. Koşu yolu soldan-arkadan topa kavisli bir yaydır; hız ivmelenip basma ayağında biter. */
var TB_GERI=.34,TB_KOS=.40,TB_BAS=.82;
function aci(a,b){var d=(b-a)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return d;}
function bez(a,c,b,t){var m=1-t;return[m*m*a[0]+2*m*t*c[0]+t*t*b[0],m*m*a[1]+2*m*t*c[1]+t*t*b[1]];}
function bezT(a,c,b,t){return[2*(1-t)*(c[0]-a[0])+2*t*(b[0]-c[0]),2*(1-t)*(c[1]-a[1])+2*t*(b[1]-c[1])];}
function yatay(v){return Math.atan2(v[0],v[1]);}
function kosuYolu(pos,o,base,launch,start,end){
 var tc=(o.shot&&o.shot.contact)||{x:0,y:0},cx=clamp(tc.x||0,-.85,.85),LA=pos.tip==='frikik'?2.4:2.0,alpha=(.40+.20*Math.abs(cx))*clamp(1+Math.min(0,o.direction||0),0,1)*clamp(1+Math.min(0,launch-base)*3,0,1),H=launch+alpha,hv=[Math.sin(H),Math.cos(H)];
 var R0=[end[0]-hv[0]*LA,end[1]-hv[1]*LA],gd=Math.hypot(R0[0]-start[0],R0[1]-start[1]);if(gd>1.5)R0=[start[0]+(R0[0]-start[0])*1.5/gd,start[1]+(R0[1]-start[1])*1.5/gd];   // geri adım ≤1,5 m (atış yönü duruş yönünden çok farklıysa koşu başı duruşa yaklaşır)
 var pv=[Math.cos(H),-Math.sin(H)],mid=[(R0[0]+end[0])/2,(R0[1]+end[1])/2],C=[mid[0]-pv[0]*.20,mid[1]-pv[1]*.20];
 var L=0,prev=R0,tab=[0];for(var i=1;i<=24;i++){var q=bez(R0,C,end,i/24);L+=Math.hypot(q[0]-prev[0],q[1]-prev[1]);tab.push(L);prev=q;}
 return{R0:R0,C:C,end:end,H:H,L:L,tab:tab,S0:start};
}
function kosuAyak(y,o,tb,point,yaw,launch,W){
 var M=4,tau0=(tb-TB_KOS)/(TB_BAS-TB_KOS),res={};
 function us(t){t=clamp(t,0,1);return t*t*(3-2*t);}
 function tersUs(v){var lo=0,hi=1;for(var i=0;i<30;i++){var m=(lo+hi)/2;if(us(m)<v)lo=m;else hi=m;}return(lo+hi)/2;}
 function yolNokta(s){var f=clamp(s/y.L,0,1)*24,i=Math.min(23,Math.floor(f)),a=y.tab[i],b=y.tab[i+1],t=(f-i);var u=(i+t)/24;return bez(y.R0,y.C,y.end,u);}
 function yolYon(s){var u=clamp(s/y.L,0,1);return yatay(bezT(y.R0,y.C,y.end,u));}
 var tj=[],pj=[],ayakSag=function(h,k){return[Math.cos(h)*k,-Math.sin(h)*k];};
 var tcn=(o.shot&&o.shot.contact)||{x:0,y:0},cxn=clamp(tcn.x||0,-.85,.85),cyn=clamp(tcn.y||0,-.85,.85),plx=(-50-Math.abs(cxn)*12)*UNIT,plz=(28-cyn*12)*UNIT;   // vuruş dalındaki basma ayağı konumuyla aynı
 var endLeft=[y.end[0]+(Math.cos(launch)*plx+Math.sin(launch)*plz),y.end[1]+(-Math.sin(launch)*plx+Math.cos(launch)*plz)],sagSon=[y.end[0]+Math.cos(launch)*24*UNIT,y.end[1]-Math.sin(launch)*24*UNIT];   // sağ ayak vuruşa hazır: gövdenin yanında
 for(var j=1;j<=M;j++){var s=y.L*j/M,tj_=TB_KOS+tersUs(j/M)*(TB_BAS-TB_KOS),pt=yolNokta(s),hd=yolYon(s),off=ayakSag(hd,(j%2?1:-1)*.11*1.0);tj.push(tj_);pj.push(j===M?endLeft:[pt[0]+off[0],pt[1]+off[1]]);}
 var h0=yolYon(0),i0=[ayakSag(h0,-.11),ayakSag(h0,.11)];   // başlangıç: sol, sağ
 var sol0=[y.R0[0]+i0[0][0],y.R0[1]+i0[0][1]],sag0=[y.R0[0]+i0[1][0],y.R0[1]+i0[1][1]];
 var olay={sag:[{t:-9,p:sag0},{t:tj[0],p:pj[0]},{t:tj[2],p:pj[2]},{t:TB_BAS,p:sagSon}],sol:[{t:-9,p:sol0},{t:tj[1],p:pj[1]},{t:tj[3],p:pj[3]}]},SW=.30/W,HW=.03;
 function konum(liste){for(var k=0;k<liste.length-1;k++){var a=liste[k],b=liste[k+1];if(tb<b.t-HW||k===liste.length-2){var bas=Math.max(TB_KOS,a.t+HW,b.t-SW),bit=b.t-HW;/* salınım önceki basıştan sonra başlar (üst üste binmez) */if(tb<=bas)return{p:a.p,l:0};if(tb>=bit)return{p:b.p,l:0};var f=(tb-bas)/(bit-bas),e=ease(f);return{p:[mix(a.p[0],b.p[0],e),mix(a.p[1],b.p[1],e)],l:Math.sin(Math.PI*f)};}}var son=liste[liste.length-1];return{p:son.p,l:0};}
 var sol=konum(olay.sol),sag=konum(olay.sag),cs=Math.cos(yaw),sn=Math.sin(yaw);
 function yerel(p,lift){var dx=(p[0]-point[0])/UNIT,dz=(p[1]-point[1])/UNIT;return[cs*dx-sn*dz,8+lift*44,sn*dx+cs*dz];}
 var tau=clamp(tau0,0,1),ds=6*tau*(1-tau),hiz=clamp(ds/1.5,0,1),sNorm=us(tau),m=M*sNorm;
 // kök sıçraması: ayak basışları arasında yükselir (uçuş), basışta alçalır
 var tp=[TB_KOS].concat(tj),ph=0;for(var q=0;q<tp.length-1;q++)if(tb>=tp[q]&&tb<tp[q+1]){ph=(tb-tp[q])/(tp[q+1]-tp[q]);}
 var amp=1+.6*hiz;
 return{kosu:true,feetLocal:[yerel(sol.p,sol.l),yerel(sag.p,sag.l)],lift:-Math.sin(Math.PI*ph)*8*hiz,lean:46*hiz,arm:Math.sin(Math.PI*m)*(34+18*hiz)*amp/1.6,armBlend:ease(clamp(tau/.18,0,1)),hiz:hiz,steps:M,u:tau};
}
function placement(pos,o){
 var w=o.walk,turn=w?mix(w.from,w.to,ease(w.u)):o.direction||0,base=Math.atan2(-pos.bx,pos.D);
 var shot=o.shot,launch=base,path=o.path;if(path&&path.length>1)launch=Math.atan2(path[1].x-path[0].x,path[1].z-path[0].z);
 function stance(d){return [pos.bx-Math.sin(base)*1.0+Math.cos(base)*d*.35,-Math.cos(base)*1.0-Math.sin(base)*d*.35];}
 var start=stance(o.direction||0),end=[pos.bx-Math.sin(launch)*28*UNIT,-Math.cos(launch)*28*UNIT];
 var point=w?stance(turn):start,yaw=shot?base+(o.direction||0)*.40:base+turn*.40,gait=null,kick=0,drift=0,run=0;
 if(shot){
  var W=shot.windup||1.4,tb=shot.elapsed/W,yaw0=base+(o.direction||0)*.40,y=kosuYolu(pos,o,base,launch,start,end);run=clamp(tb/TB_BAS,0,1);
  if(tb<TB_GERI){var u=clamp(tb/TB_GERI,0,1),e=ease(u);point=[mix(start[0],y.R0[0],e),mix(start[1],y.R0[1],e)];yaw=yaw0+aci(yaw0,launch)*ease(u);
   gait={u:u,start:start,end:y.R0,yaw0:yaw0,yaw1:launch,steps:Math.max(2,Math.ceil(Math.hypot(y.R0[0]-start[0],y.R0[1]-start[1])/.40)),cokme:.5};if(gait.steps%2)gait.steps++;}
  else if(tb<TB_KOS){var u2=(tb-TB_GERI)/(TB_KOS-TB_GERI),yh=y.H;point=y.R0;yaw=launch+aci(launch,yh)*ease(u2);gait={u:u2,start:y.R0,end:y.R0,yaw0:launch,yaw1:yh,steps:2,cokme:.15};}
  else if(tb<TB_BAS){var tau=(tb-TB_KOS)/(TB_BAS-TB_KOS),us=tau*tau*(3-2*tau),f=clamp(us,0,1)*24,i=Math.min(23,Math.floor(f)),ui=us;point=bez(y.R0,y.C,y.end,ui);var th=yatay(bezT(y.R0,y.C,y.end,ui));yaw=th+aci(th,launch)*ease(clamp((tau-.70)/.30,0,1));
   gait=kosuAyak(y,o,tb,point,yaw,launch,W);}
  else{point=end;yaw=launch;}
  if(tb>=TB_BAS)kick=tb>=1?1:clamp((tb-TB_BAS)/(1-TB_BAS),0,1);
  if(tb>1){var post=(tb-1)*W;drift=.26*(1-Math.exp(-post*6));point=[end[0]+Math.sin(launch)*drift,end[1]+Math.cos(launch)*drift];}
 }
 else if(w){
  var S0=stance(w.from),S1=stance(w.to),Y0=base+w.from*.40,Y1=base+w.to*.40,dx=S1[0]-S0[0],dz=S1[1]-S0[1],dist=Math.hypot(dx,dz);
  var travel=dist>.02?Math.atan2(dx,dz):Y0,u3=clamp(w.u,0,1),a3=dist>.02?.30:.50,b3=dist>.02?.72:1.0;
  if(dist<=.02){yaw=Y0+aci(Y0,Y1)*ease(u3);point=S0;gait={u:u3,start:S0,end:S0,yaw0:Y0,yaw1:Y1};}
  else if(u3<a3){var k=u3/a3;yaw=Y0+aci(Y0,travel)*ease(k);point=S0;gait={u:k,start:S0,end:S0,yaw0:Y0,yaw1:travel};}
  else if(u3<b3){var m3=(u3-a3)/(b3-a3);yaw=travel;point=[mix(S0[0],S1[0],ease(m3)),mix(S0[1],S1[1],ease(m3))];gait={u:m3,start:S0,end:S1,yaw0:travel,yaw1:travel};}
  else{var q3=(u3-b3)/(1-b3);yaw=travel+aci(travel,Y1)*ease(q3);point=S1;gait={u:q3,start:S1,end:S1,yaw0:travel,yaw1:Y1};}
 }
 // Ok tuşuyla dönerken: yerinde küçük adımlar (gövde neredeyse hiç çökmez).
 if(!gait&&!w&&!shot&&o.turning!=null)gait={u:clamp(o.turning,0,1),start:point,end:point,yaw0:yaw,yaw1:yaw,cokme:.15};
 if(gait&&!gait.kosu){gait.steps=gait.steps||Math.max(2,Math.ceil(Math.hypot(gait.end[0]-gait.start[0],gait.end[1]-gait.start[1])/.22));if(gait.steps%2)gait.steps++;}
 return {point:point,yaw:yaw,unit:UNIT,height:HEIGHT,gait:gait,run:run,kick:shot?kick:0,drift:drift};
}
function gaitFeet(g){
 var u=clamp(g.u,0,1),e=ease(u),root=[mix(g.start[0],g.end[0],e),mix(g.start[1],g.end[1],e)],yaw=mix(g.yaw0,g.yaw1,e);
 function planted(leg,f){var t=ease(f),a=mix(g.yaw0,g.yaw1,t),x=(leg?24:-24)*UNIT,z=0;
  if(!leg&&g.finishLeft){x=mix(-24,g.finishLeft[0],t)*UNIT;z=g.finishLeft[1]*t*UNIT;}
  return [mix(g.start[0],g.end[0],t)+Math.cos(a)*x+Math.sin(a)*z,mix(g.start[1],g.end[1],t)-Math.sin(a)*x+Math.cos(a)*z];}
 var feet=[planted(0,0),planted(1,0)],step=Math.min(g.steps-1,Math.floor(u*g.steps)),phase=u===1?1:u*g.steps-step,swing=step%2?0:1;
 for(var i=0;i<step;i++)feet[i%2?0:1]=planted(i%2?0:1,Math.min(1,(i+2)/g.steps));
 var next=planted(swing,Math.min(1,(step+2)/g.steps)),t=ease(phase);feet[swing]=[mix(feet[swing][0],next[0],t),mix(feet[swing][1],next[1],t)];
 return feet.map(function(v,i){var dx=(v[0]-root[0])/UNIT,dz=(v[1]-root[1])/UNIT;return [Math.cos(yaw)*dx-Math.sin(yaw)*dz,8+(i===swing?Math.sin(Math.PI*phase)*22:0),Math.sin(yaw)*dx+Math.cos(yaw)*dz];});
}
function rig(o){
 var walk=o.walk,u=walk?clamp(walk.u,0,1):0,from=walk?walk.from:o.direction,to=walk?walk.to:o.direction;
 var turn=mix(from||0,to||0,ease(u)),yaw=turn*.60,travel=walk?(to-from)*52:0;
 var rootX=walk?travel*ease(u):0,feet=[[-24,8,0],[24,8,0]],lift=0,kneeHint=[null,null],ayak=[{pitch:0,yaw:0,roll:0},{pitch:0,yaw:0,roll:0}];
 // Two deliberate steps: support foot stays fixed in world space during each half.
 if(walk&&travel!==0){var half=u<.5?0:1,t=u<.5?u*2:(u-.5)*2,swing=half===0?1:0;
  var start=swing===1?24:-24,end=start+travel;
  feet[swing][0]=mix(start,end,ease(t))-rootX;feet[swing][1]+=Math.sin(Math.PI*t)*25;
  feet[1-swing][0]=(half===0?-24:24+travel)-rootX;lift=Math.sin(Math.PI*t)*2.5;
 }
 var kosu=!!(o.gait&&o.gait.kosu);
 if(kosu){feet=o.gait.feetLocal.map(function(v){return v.slice();});lift=o.gait.lift;}
 else if(o.gait){feet=gaitFeet(o.gait);lift=Math.sin(Math.PI*o.gait.u)*24*(o.gait.cokme==null?1:o.gait.cokme);}
 var nodes={hip:[0,141-lift,0],chest:[0,249-lift,0],neck:[0,287-lift,0],head:[0,382-lift,0],sl:[-55,251-lift,0],sr:[55,251-lift,0]};
 var shot=o.shot,progress=shot?(o.kick===undefined?clamp(shot.elapsed/shot.windup,0,1):o.kick):0,post=shot?Math.max(0,shot.elapsed-shot.windup):0;
 if(shot&&!o.gait){
  var tc=shot.contact||{x:0,y:0},cy=Math.max(-.85,Math.min(.85,tc.y||0)),cx=Math.max(-.85,Math.min(.85,tc.x||0)),rb=.11/UNIT,drift=(o.drift||0)/UNIT;
  // Basma ayağı topun yanında: kıvrımlı vuruşta daha geniş, alt temasta biraz geride, üst temasta biraz önde
  if(o.kick!==undefined)feet[0]=[-50-Math.abs(cx)*12,8,28-cy*12-drift];
  var b=progress<1?Math.sin(progress*Math.PI/2):Math.exp(-post*6),lean=progress<1?Math.sin(progress*Math.PI)*(22+cy*58):-Math.sin(Math.min(1,post/.55)*Math.PI)*(14-cy*30);   // üst temas: gövde topun üstüne eğilir; alt temas: geriye yaslanır
  nodes.chest[2]=lean;nodes.neck[2]=lean;nodes.head[2]=lean;
  // At impact the toe touches the rear ball surface at ball-centre height.
  // The ankle is behind it, never at the ball centre. Cubic downswing retains
  // a nonzero toe velocity through contact, then decelerates in follow-through.
  // Krampon, seçilen temas noktasına gelir: alt temas topun altına girer, üst temas topun üstüne biner (yan temas yana kayar).
  var hit=[-cx*rb*.8,8+rb*(1+cy*.95)+1,28-44-rb*Math.sqrt(Math.max(.1,1-cy*cy))],geriX=8+cx*34,geriY=55+(cy<0?16*-cy:-10*cy);
  var etki=progress<.60?0:progress<1?ease((progress-.60)/.40):1;
  if(progress<.60){var q=ease(progress/.60);feet[1]=[mix(24,geriX,q),mix(8,geriY,q),mix(0,-112,q)];ayak[1]={pitch:mix(.15,.95,q),yaw:0,roll:0};}
  else if(progress<1){var q=Math.pow((progress-.60)/.40,3);feet[1]=[mix(geriX,hit[0],q),mix(geriY,hit[1],q),mix(-112,hit[2],q)];ayak[1]={pitch:mix(.95,.40+cy*.50,etki),yaw:-cx*.55*etki,roll:cx*.45*etki};}
  else {
   var span=(shot.windup||.85)*(o.kick!==undefined?1-TB_BAS:.34)*.40,speed=(hit[2]+112)*3/span;   // vuruş fazının süresi: koşu zaman çizelgesinde windup'ın son %18'i
   var follow=Math.min(.11,2*(55-hit[2])/speed),q=clamp(post/follow,0,1),z=hit[2]+speed*follow*(q-q*q/2);
   var settle=ease((post-follow)/.42),plantZ=z;
   // takip hareketi: alt temasta ayak yukarı süzülür, kıvrımlı vuruşta bacak gövdenin önünden karşıya geçer
   feet[1]=[mix(hit[0]-cx*60*q,24,settle),mix(hit[1]+Math.sin(q*Math.PI/2)*(28+(cy<0?-cy*30:0)),8,settle),plantZ];
   ayak[1]={pitch:mix(.40+cy*.50,.1,settle),yaw:mix(-cx*.55,0,settle),roll:mix(cx*.45,0,settle)};
   // Once planted the foot remains there; no ground sliding back to idle.
  }
  kneeHint[1]=[-cx*.55,.0,1];
  var ka={el:[-65,199+20*b,-10-25*b],er:[65,199-12*b,10+25*b],hl:[-68,145+20*b,-20-30*b],hr:[68,145-12*b,20+30*b]};
  if(o.kick!==undefined){var bl=ease(Math.min(1,progress/.30)),ra={el:[-66,205,0],er:[66,205,0],hl:[-60,212,28],hr:[60,212,28]};   // koşu kollarından vuruş kollarına yumuşak geçiş
   ['el','er','hl','hr'].forEach(function(k){nodes[k]=ka[k].map(function(v,i){return mix(ra[k][i],v,bl);});});}
  else{nodes.el=ka.el;nodes.er=ka.er;nodes.hl=ka.hl;nodes.hr=ka.hr;}
 }else if(kosu){
  var g=o.gait,L=g.lean,a=g.arm;nodes.chest[2]=L;nodes.neck[2]=L*1.4;nodes.head[2]=L*1.3;nodes.sl[2]=L*.8;nodes.sr[2]=L*.8;
  // Koşu kolları: dirsekler bükük, eller göğüs hizasında, ayakla ters yönde sallanır
  var ab=g.armBlend==null?1:g.armBlend,run={el:[-66,205,-a*.5],er:[66,205,a*.5],hl:[-60,212,a*1.2+28],hr:[60,212,-a*1.2+28]},dur={el:[-65,196,0],er:[65,196,0],hl:[-64,143,0],hr:[64,143,0]};   // dururken kollar aşağıda: koşunun ilk %18'inde kaldırılır
  ['el','er','hl','hr'].forEach(function(k){nodes[k]=run[k].map(function(v,i){return mix(dur[k][i],v,ab);});});
 }else{var swing=o.gait?Math.sin(Math.PI*o.gait.steps*o.gait.u)*Math.sin(Math.PI*o.gait.u)*18:(walk?Math.sin(2*Math.PI*u)*Math.sin(Math.PI*u)*18:0);nodes.el=[-65,196,-swing];nodes.er=[65,196,swing];nodes.hl=[-64,143,-2*swing];nodes.hr=[64,143,2*swing];}
 if(o.sevinc&&D.sevinc){var celebration=D.sevinc.pose(o.sevinc.id,o.sevinc.time);nodes.hl=celebration.left;nodes.hr=celebration.right;feet=celebration.feet;Object.keys(nodes).forEach(function(k){nodes[k][1]+=celebration.shift;});}
 [-1,1].forEach(function(side,i){var h=[side*24,nodes.hip[1],0],sol=knee(h,feet[i],72,kneeHint[i]||undefined),suffix=i?'r':'l';nodes['hip'+suffix]=h;nodes['k'+suffix]=sol.knee;nodes['f'+suffix]=sol.foot;});
 ['l','r'].forEach(function(k){var sol=knee(nodes['s'+k],nodes['h'+k],55,kosu?[0,-.35,-1]:undefined);nodes['e'+k]=sol.knee;nodes['h'+k]=sol.foot;});
 return{nodes:nodes,yaw:yaw,rootX:rootX,forward:[Math.sin(yaw),0,Math.cos(yaw)],ayak:ayak};
}
function textures(id,front,back,makeCanvas){var key=id,old=cache.get(key);if(old&&old.front===front&&old.back===back)return old;
 function cut(im,box){var c=makeCanvas(box[2],box[3]);c.getContext('2d').drawImage(im,...box,0,0,c.width,c.height);return c;}
 var t={front:front,back:back,headFront:cut(front,crops[id].front),headBack:cut(back,[crops[id].back[0]+Math.round(crops[id].back[2]*.15),crops[id].back[1],Math.round(crops[id].back[2]*.70),156]),shirtFront:cut(front,[400,262,105,108]),shirtBack:cut(back,[410,248,65,95])};
 var c=t.shirtBack,g=c.getContext('2d'),num=D.KARAKTER.find(k=>k.id===id).numara;g.textAlign='center';g.font='bold 38px Arial';g.fillStyle=id==='fero'?'#161616':'#fff';g.fillText(String(num),c.width/2,67);cache.set(key,t);return t;
}
function draw(g,o){var r=rig(o),n=r.nodes,T=textures(o.id,o.front,o.back,o.makeCanvas),tri=[],kit=kits[o.id],c=Math.cos(o.yaw===undefined?r.yaw:o.yaw),s=Math.sin(o.yaw===undefined?r.yaw:o.yaw);
 function project(p){if(o.project){var rotated=[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];return o.project(rotated);}var xx=p[0]*c+p[2]*s,zz=-p[0]*s+p[2]*c,depth=zz+900,scale=900/depth;return{x:o.x+xx*o.scale*scale,y:o.y-(p[1]+zz*.12)*o.scale*scale,d:depth};}
 /* Ayrıntı düzeyi ekrandaki boya göre: uzak frikikte oyuncu birkaç on piksel; ~1200 üçgenin her biri için clip+drawImage boşuna. Yakın oyuncu (>=140 px) değişmez. */
 var LD={tube:8,ej:6,ei:10,patch:6,hj:10,hi:20};{var pt=project([n.head[0],n.head[1]+89,n.head[2]]),pf=project([(n.fl||n.hipl||n.hip)[0],(n.fl||n.hipl||n.hip)[1],(n.fl||n.hipl||n.hip)[2]]);
  if(pt&&pf&&Number.isFinite(pt.y)&&Number.isFinite(pf.y)){var boyPx=Math.abs(pf.y-pt.y);if(boyPx<80)LD={tube:5,ej:3,ei:6,patch:3,hj:6,hi:12};else if(boyPx<140)LD={tube:6,ej:4,ei:8,patch:4,hj:8,hi:16};}}
 function face(a,b,c,color,uv,texture){if(color){var N=unit(cross(sub(b,a),sub(c,a))),light=.66+.34*Math.max(0,-N[0]*.4+N[1]*.55-N[2]*.65),v=parseInt(color.slice(1),16);color='rgb('+[v>>16,(v>>8)&255,v&255].map(x=>Math.round(x*light)).join(',')+')';}tri.push({p:[a,b,c],color:color,uv:uv,texture:texture});}
 function tube(a,b,radius,color){var w=unit(sub(b,a)),v=unit(cross(w,Math.abs(w[1])>.9?[1,0,0]:[0,1,0])),q=cross(w,v);for(var i=0;i<LD.tube;i++){var t=i*2*Math.PI/LD.tube,tt=(i+1)*2*Math.PI/LD.tube,off=add(mul(v,radius*Math.cos(t)),mul(q,radius*Math.sin(t))),next=add(mul(v,radius*Math.cos(tt)),mul(q,radius*Math.sin(tt)));face(add(a,off),add(b,off),add(a,next),color);face(add(a,next),add(b,off),add(b,next),color);}}
 // Dönük elipsoid (krampon): ayağın yatması/yan yatması/dışa-içe dönmesi. roll = ayak ekseni (z), pitch = yan eksen (x; + = burun aşağı), yaw = dikey eksen.
 function ellipsoidRot(center,radius,color,a){a=a||{pitch:0,yaw:0,roll:0};var cp=Math.cos(a.pitch),sp=Math.sin(a.pitch),cyw=Math.cos(a.yaw),syw=Math.sin(a.yaw),cr=Math.cos(a.roll),sr=Math.sin(a.roll);
  function rot(v){var x=v[0]*cr-v[1]*sr,y=v[0]*sr+v[1]*cr,z=v[2];var y2=y*cp-z*sp,z2=y*sp+z*cp;var x3=x*cyw+z2*syw,z3=-x*syw+z2*cyw;return[x3,y2,z3];}
  function v(al,be){return add(center,rot([radius[0]*Math.sin(al)*Math.cos(be),radius[1]*Math.cos(al),radius[2]*Math.sin(al)*Math.sin(be)]));}
  for(var j=0;j<6;j++)for(var i=0;i<10;i++){var al=j*Math.PI/6,bl=(j+1)*Math.PI/6,t=i*Math.PI/5,tt=(i+1)*Math.PI/5;face(v(al,t),v(bl,t),v(bl,tt),color);face(v(al,t),v(bl,tt),v(al,tt),color);}}
 function ellipsoid(center,radius,color){function v(a,b){return add(center,[radius[0]*Math.sin(a)*Math.cos(b),radius[1]*Math.cos(a),radius[2]*Math.sin(a)*Math.sin(b)]);}for(var j=0;j<LD.ej;j++)for(var i=0;i<LD.ei;i++){var a=j*Math.PI/LD.ej,b=(j+1)*Math.PI/LD.ej,t=i*2*Math.PI/LD.ei,tt=(i+1)*2*Math.PI/LD.ei;face(v(a,t),v(b,t),v(b,tt),color);face(v(a,t),v(b,tt),v(a,tt),color);}}
 // Back and front curved surfaces share finite side volume; no whole-body reflection.
 function patch(center,width,height,depth,back,texture){function v(u,v){var x=(u-.5)*width;return add(center,[x,(.5-v)*height,(back?-1:1)*(depth+12*Math.sqrt(Math.max(0,1-x*x/(width*width/4))))]);}for(var j=0;j<LD.patch;j++)for(var i=0;i<LD.patch;i++){var u=i/LD.patch,vv=j/LD.patch,uu=(i+1)/LD.patch,vvv=(j+1)/LD.patch;face(v(u,vv),v(uu,vv),v(uu,vvv),null,[[u,vv],[uu,vv],[uu,vvv]],texture);face(v(u,vv),v(uu,vvv),v(u,vvv),null,[[u,vv],[uu,vvv],[u,vvv]],texture);}}
 tube(n.hip,n.chest,49,kit[0]);tube(n.chest,n.neck,28,kit[0]);
 tube(n.sl,n.el,18,kit[0]);tube(n.sr,n.er,18,kit[0]);
 // Hands use separate nodes from the hip attachment points.
 tube(n.el,n.hl,13,'#c99a7c');tube(n.er,n.hr,13,'#c99a7c');ellipsoid(n.hl,[14,18,13],'#c99a7c');ellipsoid(n.hr,[14,18,13],'#c99a7c');
 ['l','r'].forEach(function(k,fi){tube(n['hip'+k],n['k'+k],23,'#18191d');tube(n['k'+k],n['f'+k],16,kit[0]);ellipsoidRot(add(n['f'+k],[0,-1,12]),[22,10,32],kit[1],r.ayak[fi]);});
 function headVertex(lat,lon){return [79*Math.sin(lat)*Math.cos(lon),89*Math.cos(lat),63*Math.sin(lat)*Math.sin(lon)];}
 function headFace(a,b,cc){var center=mul(add(add(a,b),cc),1/3),normal=unit(center),visible=(-normal[0]*s+normal[2]*c)<.2;if(!visible)return;
  var texture=center[2]>0?T.headFront:T.headBack,uv=[a,b,cc].map(p=>[(p[0]/79+1)/2,(1-p[1]/89)/2]);
  if(!(o.id==='meto'&&o.sevinc))face(add(n.head,a),add(n.head,b),add(n.head,cc),o.id==='fero'?'#bc9275':'#392b25');
  face(add(n.head,a),add(n.head,b),add(n.head,cc),null,uv,texture);
 }
 for(var hj=0;hj<LD.hj;hj++)for(var hi=0;hi<LD.hi;hi++){var ha=hj*Math.PI/LD.hj,hb=(hj+1)*Math.PI/LD.hj,ht=hi*2*Math.PI/LD.hi,htt=(hi+1)*2*Math.PI/LD.hi;headFace(headVertex(ha,ht),headVertex(hb,ht),headVertex(hb,htt));headFace(headVertex(ha,ht),headVertex(hb,htt),headVertex(ha,htt));}
 // Only the camera-facing hemisphere is textured, avoiding a front face on the back of the head.

 patch([0,220+(n.chest[1]-249),0],88,112,49,true,T.shirtBack);
 tri.forEach(t=>{t.screen=t.p.map(project);t.depth=t.screen.reduce((a,p)=>a+p.d,0)/3;});tri.sort((a,b)=>b.depth-a.depth);
 var ballPainted=false;
 tri.forEach(function(t){if(o.onlyNearDepth!==undefined&&t.depth>=o.onlyNearDepth)return;
  if(o.ball&&!ballPainted&&t.depth<o.ball.depth){o.ball.draw(g);ballPainted=true;}
  var p=t.screen;var cx=(p[0].x+p[1].x+p[2].x)/3,cy=(p[0].y+p[1].y+p[2].y)/3;g.beginPath();p.forEach(function(v,i){var dx=v.x-cx,dy=v.y-cy,l=Math.hypot(dx,dy)||1,x=v.x+dx/l*.35,y=v.y+dy/l*.35;if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.closePath();
  if(t.texture){var uv=t.uv.map(v=>[v[0]*t.texture.width,v[1]*t.texture.height]),a=uv[0],b=sub(uv[1],a),cc=sub(uv[2],a),det=b[0]*cc[1]-cc[0]*b[1],dx1=p[1].x-p[0].x,dx2=p[2].x-p[0].x,dy1=p[1].y-p[0].y,dy2=p[2].y-p[0].y;
   if(Math.abs(det)<1e-9)return;var aa=(dx1*cc[1]-dx2*b[1])/det,bb=(dy1*cc[1]-dy2*b[1])/det,ccc=(b[0]*dx2-cc[0]*dx1)/det,dd=(b[0]*dy2-cc[0]*dy1)/det;
   g.save();g.clip();g.transform(aa,bb,ccc,dd,p[0].x-aa*a[0]-ccc*a[1],p[0].y-bb*a[0]-dd*a[1]);g.drawImage(t.texture,0,0);g.restore();
  }else{g.fillStyle=t.color;g.fill();}
 });
 if(o.ball&&!ballPainted)o.ball.draw(g);
 return r;
}
function render(g,o){
 if(o.walk||o.shot||o.sevinc)return draw(g,o);
 var density=Math.min(2,root.devicePixelRatio||1),key=[o.id,o.direction,o.scale,density,o.viewKey||''].join(':'),stored=idleCache.get(key);
 if(!stored||stored.front!==o.front||stored.back!==o.back){
  var w=Math.ceil(260*o.scale),h=Math.ceil(510*o.scale),cv=o.makeCanvas(Math.ceil(w*density),Math.ceil(h*density)),ctx=cv.getContext('2d');ctx.scale(density,density);
  var options=Object.assign({},o,{x:w/2,y:h-15*o.scale,ball:null});
  if(o.project)options.project=function(v){var q=o.project(v);return{x:q.x-o.x+w/2,y:q.y-o.y+h-15*o.scale,d:q.d};};
  draw(ctx,options);
  stored={cv:cv,w:w,h:h,front:o.front,back:o.back,options:options};if(idleCache.size>=24)idleCache.clear();idleCache.set(key,stored);
 }
 var left=o.x-stored.w/2,top=o.y-stored.h+15*o.scale;
 g.drawImage(stored.cv,left,top,stored.w,stored.h);
 if(o.ball){
  o.ball.draw(g);
  if(!stored.near||stored.nearDepth!==o.ball.depth){
   var near=o.makeCanvas(stored.cv.width,stored.cv.height),ng=near.getContext('2d');ng.scale(density,density);
   draw(ng,Object.assign({},stored.options,{onlyNearDepth:o.ball.depth,ball:null}));stored.near=near;stored.nearDepth=o.ball.depth;
  }
  g.drawImage(stored.near,left,top,stored.w,stored.h);
 }
 return rig(o);
}
D.futbolcu3d={rig:rig,draw:render,placement:placement,gaitFeet:gaitFeet,HEIGHT:HEIGHT,UNIT:UNIT};})(typeof globalThis!=='undefined'?globalThis:window);
