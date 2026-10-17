/* LORT: fitted cloth in the same articulated space as the body.
 * Small ring meshes; no simulation, downloads or changes to the shot rig. */
(function(root){'use strict';var D=root.DT;
function add(a,b){return a.map(function(x,i){return x+b[i];});}
function sub(a,b){return a.map(function(x,i){return x-b[i];});}
function mul(a,s){return a.map(function(x){return x*s;});}
function unit(a){var l=Math.hypot.apply(null,a)||1;return mul(a,1/l);}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function rotateY(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
function rotateZ(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]];}
function mix(a,b,t){return a.map(function(x,i){return x+(b[i]-x)*t;});}
function build(n,segments){
 // Multiples of four split the front/back UVs exactly at each side seam.
 var out=[],N=segments&&segments<8?4:8,skin='#c99a7c',blue='#1455c7',white='#e9eff6';
 function face(a,b,c,color,uv,texture,normal){out.push({p:[a,b,c],color:color,uv:uv,texture:texture,normal:normal});}
 // All rings use one shoulder/pelvis frame. Lean and sway follow the SAME joints.
 var shoulders=mul(add(n.sl,n.sr),.5),up=unit(sub(n.neck,n.hip)),right=unit(sub(n.sr,n.sl)),front=unit(cross(right,up));
 var hipRight=unit(sub(n.hipr,n.hipl));
 function at(t){return mix(n.hip,shoulders,t);}
 var collar=add(n.neck,mul(up,-25));
 // Broad upper back, straight lower torso, shallow chest. The pelvis must
 // never be a ball wider/deeper than the rib cage under the fitted shirt.
 var rings=[{c:add(n.hip,mul(up,-5)),w:42,d:24},
  {c:at(.16),w:42,d:24},{c:at(.92),w:52,d:25},
  {c:mix(shoulders,collar,.05),w:52,d:23},{c:collar,w:16,d:14}];
 rings.forEach(function(r,j){r.right=unit(mix(hipRight,right,[0,.16,.92,1,1][j]));r.front=unit(cross(r.right,up));});
 function vertex(r,a){var z=Math.cos(a),x=Math.sin(a);if(z>0)z=Math.pow(z,.55);return add(r.c,add(mul(r.right,r.w*x),mul(r.front,r.d*z)));}
 function vcoord(j){return 1-Math.max(0,Math.min(1,(rings[j].c[1]-rings[0].c[1])/(collar[1]-rings[0].c[1])));}
 for(var j=0;j<rings.length-1;j++)for(var i=0;i<N;i++){
  var a=-Math.PI+i*2*Math.PI/N,b=a+2*Math.PI/N,isFront=Math.cos((a+b)/2)>=0;
  var texture=isFront?'shirtFront':'shirtBack',sign=isFront?-1:1;
  var u=(1+sign*Math.sin(a))*.5,v=(1+sign*Math.sin(b))*.5;
  var p=vertex(rings[j],a),q=vertex(rings[j+1],a),r=vertex(rings[j],b),s=vertex(rings[j+1],b);
  face(p,q,r,blue,[[u,vcoord(j)],[u,vcoord(j+1)],[v,vcoord(j)]],texture);
  face(r,q,s,blue,[[v,vcoord(j)],[u,vcoord(j+1)],[v,vcoord(j+1)]],texture);
 }
 // Narrow sewn collar, rather than a floating rectangular neck patch.
 for(i=0;i<N;i++){a=i*2*Math.PI/N;b=(i+1)*2*Math.PI/N;
  var outer=vertex(rings[rings.length-1],a),next=vertex(rings[rings.length-1],b);
  var inner=add(collar,mul(sub(outer,collar),.85)),innerNext=add(collar,mul(sub(next,collar),.85));
  face(outer,inner,next,white);face(next,inner,innerNext,white);
 }
 function limb(a,b,radii,color,depth,frame,skinPart){
  var S=skinPart&&N===8?10:N,axis=unit(sub(b,a)),guide=frame||right,x=sub(guide,mul(axis,dot(guide,axis)));
  if(Math.hypot.apply(null,x)<.05)x=cross(axis,up);
  x=unit(x);var z=cross(axis,x);
  var rows=radii.map(function(r,j){var c=mix(a,b,j/(radii.length-1)),d=depth?depth[j]:r;return Array.from({length:S},function(_,i){var t=i*2*Math.PI/S;return add(c,add(mul(x,Math.cos(t)*r),mul(z,Math.sin(t)*d)));});});
  for(var k=0;k<rows.length-1;k++)for(var h=0;h<S;h++){var hn=(h+1)%S,u=h/S,v=(h+1)/S,t=k/(rows.length-1),tt=(k+1)/(rows.length-1);
   function panel(p,q,r,uv){if(!skinPart){face(p,q,r,color);return;}var N=unit(cross(sub(q,p),sub(r,p))),off=sub(mul(add(add(p,q),r),1/3),a);off=sub(off,mul(axis,dot(off,axis)));if(dot(N,off)<0)N=mul(N,-1);
    face(p,q,r,color,skinPart?uv:null,skinPart?'skinArm':null,skinPart?N:null);}
   panel(rows[k][h],rows[k+1][h],rows[k][hn],[[u,t],[u,tt],[v,t]]);
   panel(rows[k][hn],rows[k+1][h],rows[k+1][hn],[[v,t],[u,tt],[v,tt]]);
  }
 }
 // Small joint shells close the wedges between differently oriented limb rings.
 function joint(c,r,proximal,distal){
  // The old world-vertical double cone produced pointed, unreadable joints.
  // Two rounded rings follow the limb's bend and close its moving seams.
  var S=N===8?8:4,axis=unit(sub(distal,proximal)),x=sub(right,mul(axis,dot(right,axis)));
  if(Math.hypot.apply(null,x)<.05)x=cross(axis,up);
  x=unit(x);var z=cross(axis,x),rows=[-.4,.4].map(function(t){return Array.from({length:S},function(_,i){var a=i*2*Math.PI/S;return add(c,add(mul(axis,t*r),add(mul(x,.92*r*Math.cos(a)),mul(z,.92*r*Math.sin(a)))));});});
  for(var i=0;i<S;i++){var j=(i+1)%S;
   face(add(c,mul(axis,-r)),rows[0][i],rows[0][j],skin);
   face(rows[0][i],rows[1][i],rows[0][j],skin);face(rows[0][j],rows[1][i],rows[1][j],skin);
   face(add(c,mul(axis,r)),rows[1][j],rows[1][i],skin);
  }
 }
 ['l','r'].forEach(function(k){
  var shoulder=n['s'+k],elbow=n['e'+k],hand=n['h'+k],hip=n['hip'+k],knee=n['k'+k],foot=n['f'+k];
  // Sleeve root overlaps the armhole; hem ends on the upper arm, not at the elbow.
  var cuff=mix(shoulder,elbow,.52),underCuff=mix(shoulder,elbow,.48);
  limb(add(mix(shoulder,shoulders,.32),mul(up,-4)),cuff,[11,16,14.5],blue);
  limb(underCuff,cuff,[14.9,14.6],white);
  limb(mix(shoulder,elbow,.46),elbow,[14,15,11.5],skin,null,null,true);
  limb(elbow,hand,[11.8,12,7.8],skin,null,null,true);
  joint(elbow,11.5,shoulder,hand);joint(knee,12.5,hip,foot);
  var hem=mix(hip,knee,.47);
  limb(add(mix(hip,n.hip,.20),mul(up,8)),hem,[23,23,21],blue,[21,20,19]);
  limb(mix(hip,knee,.44),hem,[21.5,21.2],white,[19.5,19.2]);
  limb(mix(hip,knee,.43),knee,[20,18.5,12.5],skin,[18,17,12.5]);
  limb(knee,mix(knee,foot,.37),[12.5,16,14.5],skin);
  limb(mix(knee,foot,.30),foot,[15.5,14,8.5],white);
  limb(mix(knee,foot,.33),mix(knee,foot,.39),[15.5,15],blue);
 });
 // Pelvic fabric bridges both shorts legs and overlaps the shirt hem.
 limb(add(n.hip,mul(up,5)),add(n.hip,mul(up,-25)),[39,38,34],blue,[23,23,22],hipRight);
 return out;
}
// Wrist nodes are not hand centres. Palms extend past the wrist; four curled
// fingers and an opposed thumb have real volume, including closed tips.
function hands(n,segments,o){
 var out=[],detailed=segments>=8,right=unit(sub(n.sr,n.sl)),up=unit(sub(n.neck,n.hip)),front=unit(cross(right,up));
 ['l','r'].forEach(function(k){
  var side=k==='l'?-1:1,wrist=n['h'+k],axis=unit(sub(wrist,n['e'+k])),guide=add(mul(right,.8),mul(front,side*.6)),width=sub(guide,mul(axis,dot(guide,axis)));
  if(Math.hypot.apply(null,width)<.05)width=cross(axis,front);
  width=unit(width);var m=motion(n,o),twist=side*.05+m.wristTwist*side;
  width=add(mul(width,Math.cos(twist)),mul(cross(axis,width),Math.sin(twist)));
  var normal=unit(cross(width,axis)),bend=m.wristFlex*(k==='l'?1:-1);
  axis=unit(add(mul(axis,Math.cos(bend)),mul(normal,Math.sin(bend))));normal=unit(cross(width,axis));
  var curl=.18+.04*m.grip;
  if(o&&o.sevinc&&o.sevinc.variant===1&&k==='r')curl+=.82*celebration(o.sevinc.time,1).fade;
  function at(length,spread,depth){return add(wrist,add(mul(axis,length),add(mul(width,spread),mul(normal,depth))));}
  function face(a,b,c,part,uv,texture){out.push({p:[a,b,c],color:'#d1a183',hand:k,part:part,uv:uv,texture:texture});}
  function chain(points,radii,depths,part){
   var S=detailed&&part==='palm'?6:4;
   var rows=points.map(function(p,j){var a=unit(sub(points[Math.min(j+1,points.length-1)],points[Math.max(0,j-1)])),v=unit(cross(width,a));
    if(S===6)return [[1,0],[.65,1],[-.65,1],[-1,0],[-.65,-1],[.65,-1]].map(function(q){return add(p,add(mul(width,radii[j]*q[0]),mul(v,depths[j]*q[1])));});
    return [add(p,mul(width,radii[j])),add(p,mul(v,depths[j])),add(p,mul(width,-radii[j])),add(p,mul(v,-depths[j]))];});
   for(var j=0;j<rows.length-1;j++)for(var i=0;i<S;i++){var h=(i+1)%S,u=i/S,v=(i+1)/S,t=j/(rows.length-1),tt=(j+1)/(rows.length-1),tex=part==='palm'?(i<S/2?'skinPalm':'skinHand'):part.indexOf('finger')===0?'skinFinger':'skinHand';
    face(rows[j][i],rows[j+1][i],rows[j][h],part,[[u,t],[u,tt],[v,t]],tex);face(rows[j][h],rows[j+1][i],rows[j+1][h],part,[[v,t],[u,tt],[v,tt]],tex);
   }
   var tip=rows[rows.length-1];for(var h=1;h<S-1;h++)face(tip[0],tip[h],tip[h+1],part);
  }
  if(detailed){
   chain([at(-2,0,0),at(9,0,0),at(24,0,0)],[6.5,10,8.8],[5,4.8,4],'palm');
   [-6.8,-2.3,2.3,6.8].forEach(function(spread,i){var length=[18,24,23,18][i],a=.25+1.15*curl,b=a+.9*curl,
    base=at(22,spread,0),mid=add(base,add(mul(axis,Math.cos(a)*length*.55),mul(normal,Math.sin(a)*length*.55))),
    tip=add(mid,add(mul(axis,Math.cos(b)*length*.45),mul(normal,Math.sin(b)*length*.45)));
    chain([base,mid,tip],[2.3,2.1,1.5],[2.5,2.3,1.6],'finger'+i);
   });
   chain([at(7,-side*8,1),at(15,-side*(14-4*curl),3+curl*8),at(23,-side*(14-12*curl),5+curl*10)],[3.5,3,2.1],[3.2,2.8,2],'thumb');
   // Thenar/web volume joins the opposed thumb to the palm. Without it the
   // closed hand reads as a floating thumb loop instead of a solid fist.
   var wa=at(8,-side*6,1),wb=at(24,-side*7,3),wc=at(15,-side*(14-4*curl),3+curl*8),wd=at(14,-side*6,5+curl*4);
   face(wa,wb,wc,'thumb');face(wa,wd,wb,'thumb');face(wb,wd,wc,'thumb');face(wc,wd,wa,'thumb');
  }else{
   // At phone/free-kick distance retain the palm/knuckle/thumb silhouette.
   chain([at(-2,0,0),at(10,0,0),at(25,0,curl*5),at(39-17*curl,0,4+curl*7)],[6.5,10,9,5],[5,4.8,4.5,3],'palm');
   chain([at(9,-side*8,1),at(22,-side*13,5+curl*3)],[3.5,2],[3.2,2],'thumb');
  }
 });return out;
}
// Feature volumes are positioned in the existing reference photo's UVs:
// brow/eye line +5..+10, nose -9, mouth -20, chin -28.
function headPoint(lat,lon){
 var y=35*Math.cos(lat),rad=Math.sin(lat),x=29*rad*Math.cos(lon),z=27*rad*Math.sin(lon);
 x*=1-.12*Math.max(0,-y/35);
 if(z>0){var facing=Math.pow(Math.max(0,Math.sin(lon)),3);
  function bump(cx,cy,sx,sy,a){return a*Math.exp(-(x-cx)*(x-cx)/(sx*sx)-(y-cy)*(y-cy)/(sy*sy));}
  z+=facing*(bump(-11,10,8,4,2.8)+bump(11,10,8,4,2.8)
   +bump(-11,4,6,4,-2.4)+bump(11,4,6,4,-2.4)
   +bump(-14,-5,8,7,2)+bump(14,-5,8,7,2)
   +bump(0,1,4,10,3)+bump(0,-9,6,5,7.5)
   +bump(0,-19,10,2,1.5)+bump(0,-23,9,2,1)+bump(0,-29,10,5,2.5));
 }return[x,y,z];
}
function materials(makeCanvas){
 var materials={},seed=127615;
 function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
 ['skinArm','skinHand','skinPalm','skinFinger'].forEach(function(name){
  var c=makeCanvas(48,80),g=c.getContext('2d');g.fillStyle=name==='skinPalm'?'#d1a183':name==='skinFinger'?'#cda080':'#c99a7c';g.fillRect(0,0,48,80);
  for(var i=0;i<430;i++){g.fillStyle=i%3?'rgba(75,37,23,.035)':'rgba(255,223,194,.055)';g.fillRect(rand()*48,rand()*80,.4+rand()*.6,.4+rand()*.6);}
  g.strokeStyle='rgba(103,60,42,.11)';g.lineWidth=.6;
  if(name==='skinPalm'){
   [[6,20,30,34,44,21],[5,45,24,37,42,48],[11,68,8,47,20,31]].forEach(function(p){g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[2],p[3],p[4],p[5]);g.stroke();});
  }else if(name==='skinFinger'){
   [37,42].forEach(function(y){g.beginPath();g.moveTo(3,y);g.quadraticCurveTo(24,y-2,45,y+1);g.stroke();});
  }else if(name==='skinArm'){
   for(var h=0;h<22;h++){g.strokeStyle='rgba(78,50,36,.055)';var x=rand()*48,y=rand()*80;g.beginPath();g.moveTo(x,y);g.lineTo(x+.4,y+1.5);g.stroke();}
  }
  materials[name]={levels:[.7,.8,.9,1].map(function(light){var cv=makeCanvas(48,80),p=cv.getContext('2d');p.drawImage(c,0,0);p.fillStyle='rgba(0,0,0,'+(1-light)+')';p.fillRect(0,0,48,80);return cv;})};
 });return materials;
}
function fitPose(nodes){
 var n={};Object.keys(nodes).forEach(function(k){n[k]=nodes[k].slice();
  // Keep head height and foot/contact anchors. Redistribute a small amount of
  // vertical space to shoulders/torso, rather than lowering the tall player.
  if(k!=='head'&&k!=='fl'&&k!=='fr')n[k][1]=8+(n[k][1]-8)*1.035;
 });return n;
}
// Visual skeleton in final drawing units. Feet remain the gameplay rig's
// exact contact anchors; solve joints AFTER applying adult body proportions.
function dot(a,b){return a.reduce(function(v,x,i){return v+x*b[i];},0);}
function solve(a,b,L1,L2,pole){
 var v=sub(b,a),d=Math.hypot.apply(null,v),axis=d<1e-8?[0,-1,0]:mul(v,1/d);
 d=Math.max(.001,Math.min(L1+L2-.001,d));
 var h=sub(pole,mul(axis,dot(pole,axis)));
 if(Math.hypot.apply(null,h)<1e-6)h=cross(axis,[1,0,0]);
 var x=(L1*L1-L2*L2+d*d)/(2*d);
 return add(add(a,mul(axis,x)),mul(unit(h),Math.sqrt(Math.max(0,L1*L1-x*x))));
}
function smooth(a,b,t){var q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);}
function motion(n,o){
 o=o||{};var stride=Math.tanh((n.fl[2]-n.fr[2])/100),wind=0;
 if(o.walk)stride+=.3*Math.sin(o.walk.u*Math.PI*2)*Math.sin(o.walk.u*Math.PI);
 if(o.shot){var t=o.shot.elapsed/(o.shot.windup||1.5);wind=Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.55)/.65)));}
 var pelvis=.11*stride+.055*wind,shoulder=-.14*stride-.08*wind,roll=.018*Math.tanh((n.fl[1]-n.fr[1])/24);
 var m={pelvisYaw:pelvis,shoulderYaw:shoulder,pelvisRoll:roll,shoulderRoll:-roll*.5,
  sway:1.2*stride,wristFlex:.075*stride+.025*wind,wristTwist:.10*stride,grip:Math.abs(stride),
  headPitch:.04*Math.tanh((n.chest[2]-n.hip[2])/24),headYaw:shoulder*.15,headRoll:roll*.15};
 if(o.sevinc){var t=o.sevinc.time||0,f=smooth(.15,1.1,t)*(1-smooth(4.1,5.3,t)),a=t*1.8;
  m.pelvisYaw=.07*Math.sin(a)*f;m.shoulderYaw=-.05*Math.sin(a-.25)*f;
  m.pelvisRoll=.018*Math.sin(a+.2)*f;m.shoulderRoll=-.013*Math.sin(a)*f;
  m.sway=0;m.wristFlex=.045*Math.sin(t*3-.4)*f;m.wristTwist=.065*Math.sin(t*2.3)*f;
  m.grip=.4*f;m.headPitch=-.03*f;m.headYaw=.035*Math.sin(t*.9)*f;m.headRoll=-.012*Math.sin(a)*f;
 }return m;
}
function celebration(t,variant){
 t=Math.max(0,Number(t)||0);var fade=smooth(.15,1.1,t)*(1-smooth(4.1,5.3,t)),wave=Math.sin(t*1.8)*fade;
 function step(a,b,length,height){var u=Math.max(0,Math.min(1,(t-a)/(b-a)));return[length*u*u*(3-2*u),height*Math.pow(Math.sin(Math.PI*u),2)];}
 var a=step(.8,1.65,12,12),b=step(2.1,2.9,9,10),c=step(3.6,4.45,12,10),d=step(4.5,5.3,9,9);
 return {fade:fade,shift:4*wave,crouch:-2*fade+.6*Math.sin(t*2.2)*fade,
  feet:[[-24,8+a[1]+c[1],a[0]-c[0]],[24,8+b[1]+d[1],b[0]-d[0]]],
  left:variant===1?[18+2*Math.sin(t*2.8-.5),12,75]:[65+3*Math.sin(t*2.2),8,24+3*Math.sin(t*2.2-.3)],
  right:variant===1?[65,5+3*Math.sin(t*3.2),110+7*Math.sin(t*3.2-.3),1]:[65-3*Math.sin(t*2.2-.3),8,24-3*Math.sin(t*2.2)]};
}
function pose(raw,o){
 var anim=o&&o.sevinc?celebration(o.sevinc.time,o.sevinc.variant||0):null;
 if(anim)raw=D.futbolcu3d.rig({direction:0}).nodes;
 // The shared follow-through adds half the running lean instantly at impact.
 // Fade that visual offset in over 120 ms for LORT without altering the shot.
 if(!anim&&o&&o.shot&&o.devam&&o.shot.elapsed>=o.shot.windup){
  var post=o.shot.elapsed-o.shot.windup,q=Math.min(1,post/.12),correction=o.devam.lean*.5*Math.exp(-post*4)*(1-q*q*(3-2*q)),copy={};
  Object.keys(raw).forEach(function(k){copy[k]=raw[k].slice();});raw=copy;
  [['chest',1],['neck',1.4],['head',1.3],['sl',.8],['sr',.8]].forEach(function(v){raw[v[0]][2]-=correction*v[1];});
 }
 var n={},dy=(raw.hip[1]-141)*1.45;
 if(anim)dy+=anim.crouch;
 var rest={hip:222,chest:342,neck:413,head:436,sl:372,sr:372};
 Object.keys(rest).forEach(function(k){var v=raw[k];
  var base=k==='head'?382:k==='neck'?287:k==='chest'?249:k==='hip'?141:251;
  n[k]=[v[0]*1.05,rest[k]+dy+(v[1]-raw.hip[1]-base+141)*.7,v[2]*.85];
  if(k==='sl')n[k][0]+=5.75;
  if(k==='sr')n[k][0]-=5.75;
 });
 n.fl=raw.fl.slice();n.fr=raw.fr.slice();
 if(anim){n.fl=anim.feet[0].slice();n.fr=anim.feet[1].slice();
  Object.keys(rest).forEach(function(k){n[k][0]+=anim.shift;});}

 var m=motion(n,o);n.hip[0]+=m.sway;
 var centre=mul(add(n.sl,n.sr),.5);
 ['sl','sr'].forEach(function(k){n[k]=add(centre,rotateZ(rotateY(sub(n[k],centre),m.shoulderYaw),m.shoulderRoll));});
 // Lower the pelvis instead of stretching the support leg or moving its foot.
 var drop=0;['l','r'].forEach(function(k){var side=k==='l'?-1:1,f=n['f'+k],hp=add(n.hip,rotateZ(rotateY([side*22,0,0],m.pelvisYaw),m.pelvisRoll)),dx=hp[0]-f[0],dz=hp[2]-f[2];
  var reach=Math.sqrt(Math.max(1,217.5*217.5-dx*dx-dz*dz));
  drop=Math.max(drop,hp[1]-f[1]-reach);
 });
 Object.keys(rest).forEach(function(k){n[k][1]-=drop;});
 ['l','r'].forEach(function(k){var side=k==='l'?-1:1,hip=add(n.hip,rotateZ(rotateY([side*22,0,0],m.pelvisYaw),m.pelvisRoll));
  n['hip'+k]=hip;n['k'+k]=solve(hip,n['f'+k],110,108,rotateY([0,0,1],m.pelvisYaw));
  var shoulder=n['s'+k],target=add(shoulder,rotateZ(rotateY(mul(sub(raw['h'+k],raw['s'+k]),1.30),m.shoulderYaw),m.shoulderRoll));
  // Wrist targets stay outside the rib cage; elbows flex forward, never invert.
  target[0]=side*Math.max(side*target[0],38);
  var v=sub(target,shoulder),length=Math.hypot.apply(null,v),lo=57,hi=147;
  target=add(shoulder,mul(unit(v),Math.max(lo,Math.min(hi,length))));
  var elbow=solve(shoulder,target,76,72,rotateY([side*.16,-.35,-1],m.shoulderYaw));
  if(anim){var goal=k==='l'?anim.left:anim.right,a=(10+(goal[0]-10)*anim.fade)*Math.PI/180,
   f=(5+(goal[1]-5)*anim.fade)*Math.PI/180,b=(20+(goal[2]-20)*anim.fade)*Math.PI/180;
   var u=[side*Math.sin(a),-Math.cos(a)*Math.cos(f),Math.cos(a)*Math.sin(f)],
    bendUp=(goal[3]||0)*anim.fade,pole=[0,bendUp,1-bendUp],
    hinge=unit(sub(pole,mul(u,dot(pole,u)))),fore=add(mul(u,Math.cos(b)),mul(hinge,Math.sin(b)));
   u=rotateZ(rotateY(u,m.shoulderYaw),m.shoulderRoll);fore=rotateZ(rotateY(fore,m.shoulderYaw),m.shoulderRoll);
   elbow=add(shoulder,mul(u,76));target=add(elbow,mul(fore,72));
  }
  n['e'+k]=elbow;n['h'+k]=target;
 });return n;
}
D.lortBody={build:build,hands:hands,motion:motion,headPoint:headPoint,materials:materials,fitPose:fitPose,pose:pose,celebration:celebration};
})(typeof globalThis!=='undefined'?globalThis:window);
