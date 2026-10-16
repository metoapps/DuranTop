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
  var S=Math.min(N,6),axis=unit(sub(b,a)),x=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),z=cross(axis,x);
  var rows=radii.map(function(r,j){var c=mix(a,b,j/(radii.length-1));return Array.from({length:S},function(_,i){var t=i*2*Math.PI/S;return add(c,add(mul(x,Math.cos(t)*r),mul(z,Math.sin(t)*r)));});});
  for(var k=0;k<rows.length-1;k++)for(var h=0;h<S;h++){var hn=(h+1)%S;face(rows[k][h],rows[k+1][h],rows[k][hn],color);face(rows[k][hn],rows[k+1][h],rows[k+1][hn],color);}
 }
 ['l','r'].forEach(function(k){
  var shoulder=n['s'+k],elbow=n['e'+k],hand=n['h'+k],hip=n['hip'+k],knee=n['k'+k],foot=n['f'+k];
  // Sleeve root overlaps the armhole; hem ends on the upper arm, not at the elbow.
  var cuff=mix(shoulder,elbow,.52),underCuff=mix(shoulder,elbow,.48);
  limb(mix(shoulder,shoulders,.32),cuff,[13,22,19],blue);
  limb(underCuff,cuff,[19.4,19.1],white);
  limb(mix(shoulder,elbow,.46),elbow,[16,17,14],skin);
  limb(elbow,hand,[14.2,13.4,9],skin);
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
D.lortBody={build:build};
})(typeof globalThis!=='undefined'?globalThis:window);
