/* LORT: fitted cloth in the same articulated space as the body.
 * Small ring meshes; no simulation, downloads or changes to the shot rig. */
(function(root){'use strict';var D=root.DT;
function add(a,b){return a.map(function(x,i){return x+b[i];});}
function sub(a,b){return a.map(function(x,i){return x-b[i];});}
function mul(a,s){return a.map(function(x){return x*s;});}
function unit(a){var l=Math.hypot.apply(null,a)||1;return mul(a,1/l);}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function mix(a,b,t){return a.map(function(x,i){return x+(b[i]-x)*t;});}
function build(n,segments){
 // Multiples of four split the front/back UVs exactly at each side seam.
 var out=[],N=segments&&segments<8?4:8,skin='#c99a7c',blue='#1455c7',white='#e9eff6';
 function face(a,b,c,color,uv,texture){out.push({p:[a,b,c],color:color,uv:uv,texture:texture});}
 // All rings use one shoulder/pelvis frame. Lean and sway follow the SAME joints.
 var shoulders=mul(add(n.sl,n.sr),.5),up=unit(sub(n.neck,n.hip)),right=unit(sub(n.sr,n.sl)),front=unit(cross(right,up));
 function at(t){return mix(n.hip,shoulders,t);}
 var collar=add(n.neck,mul(up,-25));
 var rings=[{c:add(n.hip,mul(up,-5)),w:46,d:27},
  {c:at(.16),w:44,d:27},{c:at(.75),w:55,d:32},
  {c:mix(shoulders,collar,.44),w:49,d:24},{c:collar,w:18,d:17}];
 function vertex(r,a){var z=Math.cos(a),x=Math.sin(a);return add(r.c,add(mul(right,r.w*x),mul(front,r.d*z)));}
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
 function limb(a,b,radii,color){
  var S=N,axis=unit(sub(b,a)),x=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),z=cross(axis,x);
  var rows=radii.map(function(r,j){var c=mix(a,b,j/(radii.length-1));return Array.from({length:S},function(_,i){var t=i*2*Math.PI/S;return add(c,add(mul(x,Math.cos(t)*r),mul(z,Math.sin(t)*r)));});});
  for(var k=0;k<rows.length-1;k++)for(var h=0;h<S;h++){var hn=(h+1)%S;face(rows[k][h],rows[k+1][h],rows[k][hn],color);face(rows[k][hn],rows[k+1][h],rows[k+1][hn],color);}
 }
 // Small joint shells close the wedges between differently oriented limb rings.
 function joint(c,r){var S=N===8?6:4;
  for(var i=0;i<S;i++){var a=i*2*Math.PI/S,b=(i+1)*2*Math.PI/S,
   p=add(c,[r*Math.cos(a),0,r*Math.sin(a)]),q=add(c,[r*Math.cos(b),0,r*Math.sin(b)]);
   face(add(c,[0,r,0]),p,q,skin);face(add(c,[0,-r,0]),q,p,skin);
  }
 }
 ['l','r'].forEach(function(k){
  var shoulder=n['s'+k],elbow=n['e'+k],hand=n['h'+k],hip=n['hip'+k],knee=n['k'+k],foot=n['f'+k];
  // Sleeve root overlaps the armhole; hem ends on the upper arm, not at the elbow.
  var cuff=mix(shoulder,elbow,.52),underCuff=mix(shoulder,elbow,.48);
  limb(mix(shoulder,shoulders,.32),cuff,[13,20,18],blue);
  limb(underCuff,cuff,[18.4,18.1],white);
  limb(mix(shoulder,elbow,.46),elbow,[16,17,14],skin);
  limb(elbow,hand,[14.2,13.4,9],skin);
  joint(elbow,14);joint(knee,16);
  var hem=mix(hip,knee,.47);
  limb(add(hip,mul(up,8)),hem,[28,29,25],blue);
  limb(mix(hip,knee,.44),hem,[25.5,25.2],white);
  limb(mix(hip,knee,.43),knee,[22,21,16],skin);
  limb(knee,mix(knee,foot,.37),[16,19,17],skin);
  limb(mix(knee,foot,.30),foot,[18,17,10],white);
  limb(mix(knee,foot,.33),mix(knee,foot,.39),[18.2,18],blue);
 });
 // Pelvic fabric bridges both shorts legs and overlaps the shirt hem.
 limb(add(n.hip,mul(up,5)),add(n.hip,mul(up,-25)),[45,44,40],blue);
 return out;
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
function celebration(t,variant){
 t=Math.max(0,Number(t)||0);function ease(a,b){var q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);}
 var fade=ease(.15,1.1)*(1-ease(4.1,5.3)),wave=Math.sin(t*4.4)*fade;
 // Both variants settle on the floor. No sprite swaps or repeating teleports.
 return {fade:fade,shift:3*wave,crouch:-3*fade,step:5*wave,
  left:variant===1?[18,12,75]:[65,8,24],
  right:variant===1?[65,5,110+5*Math.sin(t*5),1]:[65,8,24]};
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
 var rest={hip:222,chest:342,neck:413,head:436,sl:365,sr:365};
 Object.keys(rest).forEach(function(k){var v=raw[k];
  var base=k==='head'?382:k==='neck'?287:k==='chest'?249:k==='hip'?141:251;
  n[k]=[v[0]*1.05,rest[k]+dy+(v[1]-raw.hip[1]-base+141)*.7,v[2]*.85];
 });
 n.fl=raw.fl.slice();n.fr=raw.fr.slice();
 if(anim){n.fl[2]+=anim.step;n.fr[2]-=anim.step;
  Object.keys(rest).forEach(function(k){n[k][0]+=anim.shift;});}

 // Lower the pelvis instead of stretching the support leg or moving its foot.
 var drop=0;['l','r'].forEach(function(k){var side=k==='l'?-1:1,f=n['f'+k],dx=side*24+n.hip[0]-f[0],dz=n.hip[2]-f[2];
  var reach=Math.sqrt(Math.max(1,217.5*217.5-dx*dx-dz*dz));
  drop=Math.max(drop,n.hip[1]-f[1]-reach);
 });
 Object.keys(rest).forEach(function(k){n[k][1]-=drop;});
 ['l','r'].forEach(function(k){var side=k==='l'?-1:1,hip=add(n.hip,[side*24,0,0]);
  n['hip'+k]=hip;n['k'+k]=solve(hip,n['f'+k],110,108,[0,0,1]);
  var shoulder=n['s'+k],target=add(shoulder,mul(sub(raw['h'+k],raw['s'+k]),1.30));
  // Wrist targets stay outside the rib cage; elbows flex forward, never invert.
  target[0]=side*Math.max(side*target[0],38);
  var v=sub(target,shoulder),length=Math.hypot.apply(null,v),lo=57,hi=147;
  target=add(shoulder,mul(unit(v),Math.max(lo,Math.min(hi,length))));
  var elbow=solve(shoulder,target,76,72,[side*.16,-.35,-1]);
  if(anim){var goal=k==='l'?anim.left:anim.right,a=(10+(goal[0]-10)*anim.fade)*Math.PI/180,
   f=(5+(goal[1]-5)*anim.fade)*Math.PI/180,b=(20+(goal[2]-20)*anim.fade)*Math.PI/180;
   var u=[side*Math.sin(a),-Math.cos(a)*Math.cos(f),Math.cos(a)*Math.sin(f)],
    bendUp=(goal[3]||0)*anim.fade,pole=[0,bendUp,1-bendUp],
    hinge=unit(sub(pole,mul(u,dot(pole,u)))),fore=add(mul(u,Math.cos(b)),mul(hinge,Math.sin(b)));
   elbow=add(shoulder,mul(u,76));target=add(elbow,mul(fore,72));
  }
  n['e'+k]=elbow;n['h'+k]=target;
 });return n;
}
D.lortBody={build:build,fitPose:fitPose,pose:pose,celebration:celebration};
})(typeof globalThis!=='undefined'?globalThis:window);
