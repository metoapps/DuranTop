/* Articulated visual player. Existing portraits/kit textures, fixed limb lengths.
 * This is a procedural mesh, not a scanned likeness or a mirrored flat sprite. */
(function(root){'use strict';var D=root.DT,cache=new Map(),idleCache=new Map();
var crops={meto:{front:[397,62,139,185],back:[326,62,201,185]},lort:{front:[386,62,138,185],back:[357,62,172,185]},fero:{front:[369,61,162,186],back:[333,62,199,185]},latte:{front:[379,62,148,185],back:[341,62,194,185]},josh:{front:[388,62,150,185],back:[337,62,173,185]}};
var kits={meto:['#17191e','#e63946'],lort:['#1455c7','#eeeeee'],fero:['#ededed','#222222'],latte:['#ba2230','#171717'],josh:['#522580','#e8bc56']};
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}function mix(a,b,t){return a+(b-a)*t;}
function add(a,b){return a.map((x,i)=>x+b[i]);}function sub(a,b){return a.map((x,i)=>x-b[i]);}function mul(a,s){return a.map(x=>x*s);}function dot(a,b){return a.reduce((n,x,i)=>n+x*b[i],0);}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function unit(v){return mul(v,1/(Math.hypot.apply(null,v)||1));}
function knee(hip,foot,L){L=L||72;var axis=unit(sub(foot,hip)),distance=Math.hypot.apply(null,sub(foot,hip)),d=clamp(distance,.01,2*L-.01),center=add(hip,mul(axis,d/2)),bend=Math.sqrt(Math.max(0,L*L-d*d/4)),hint=[0,0,1],perp=unit(sub(hint,mul(axis,dot(hint,axis))));return{foot:add(hip,mul(axis,d)),knee:add(center,mul(perp,bend))};}
function rig(o){
 var walk=o.walk,u=walk?clamp(walk.u,0,1):0,from=walk?walk.from:o.direction,to=walk?walk.to:o.direction;
 var turn=mix(from||0,to||0,ease(u)),yaw=turn*.60,travel=walk?(to-from)*52:0;
 var rootX=walk?travel*ease(u):0,feet=[[-24,8,0],[24,8,0]],lift=0;
 // Two deliberate steps: support foot stays fixed in world space during each half.
 if(walk&&travel!==0){var half=u<.5?0:1,t=u<.5?u*2:(u-.5)*2,swing=half===0?1:0;
  var start=swing===1?24:-24,end=start+travel;
  feet[swing][0]=mix(start,end,ease(t))-rootX;feet[swing][1]+=Math.sin(Math.PI*t)*25;
  feet[1-swing][0]=(half===0?-24:24+travel)-rootX;lift=Math.sin(Math.PI*t)*2.5;
 }
 var nodes={hip:[0,141-lift,0],chest:[0,249-lift,0],neck:[0,287-lift,0],head:[0,382-lift,0],sl:[-55,251-lift,0],sr:[55,251-lift,0]};
 var shot=o.shot,progress=shot?clamp(shot.elapsed/shot.windup,0,1):0,post=shot?Math.max(0,shot.elapsed-shot.windup):0;
 if(shot){
  var b=progress<1?Math.sin(progress*Math.PI/2):Math.exp(-post*6),lean=progress<1?Math.sin(progress*Math.PI)*8:-Math.sin(Math.min(1,post/.55)*Math.PI)*10;
  nodes.chest[2]=lean;nodes.neck[2]=lean;nodes.head[2]=lean;
  if(progress<.60){var q=ease(progress/.60);feet[1]=[24,8+q*35,-q*55];}
  else if(progress<1){var q=ease((progress-.60)/.40);feet[1]=[mix(24,0,q),mix(43,8,q),mix(-55,28,q)];}
  else {var q=ease(post/.27),settle=ease((post-.27)/.45);feet[1]=[mix(0,24,settle),8+Math.sin(Math.PI*q/2)*55*(1-settle),mix(28,80,q)*(1-settle)];}
  nodes.el=[-65,199+20*b,-10-25*b];nodes.er=[65,199-12*b,10+25*b];nodes.hl=[-68,145+20*b,-20-30*b];nodes.hr=[68,145-12*b,20+30*b];
 }else{var swing=walk?Math.sin(2*Math.PI*u)*Math.sin(Math.PI*u)*18:0;nodes.el=[-65,196,-swing];nodes.er=[65,196,swing];nodes.hl=[-64,143,-2*swing];nodes.hr=[64,143,2*swing];}
 [-1,1].forEach(function(side,i){var h=[side*24,nodes.hip[1],0],sol=knee(h,feet[i]),suffix=i?'r':'l';nodes['hip'+suffix]=h;nodes['k'+suffix]=sol.knee;nodes['f'+suffix]=sol.foot;});
 ['l','r'].forEach(function(k){var sol=knee(nodes['s'+k],nodes['h'+k],55);nodes['e'+k]=sol.knee;nodes['h'+k]=sol.foot;});
 return{nodes:nodes,yaw:yaw,rootX:rootX,forward:[Math.sin(yaw),0,Math.cos(yaw)]};
}
function textures(id,front,back,makeCanvas){var key=id,old=cache.get(key);if(old&&old.front===front&&old.back===back)return old;
 function cut(im,box){var c=makeCanvas(box[2],box[3]);c.getContext('2d').drawImage(im,...box,0,0,c.width,c.height);return c;}
 var t={front:front,back:back,headFront:cut(front,crops[id].front),headBack:cut(back,[crops[id].back[0]+Math.round(crops[id].back[2]*.15),crops[id].back[1],Math.round(crops[id].back[2]*.70),156]),shirtFront:cut(front,[400,262,105,108]),shirtBack:cut(back,[410,248,65,95])};
 var c=t.shirtBack,g=c.getContext('2d'),num=D.KARAKTER.find(k=>k.id===id).numara;g.textAlign='center';g.font='bold 38px Arial';g.fillStyle=id==='fero'?'#161616':'#fff';g.fillText(String(num),c.width/2,67);cache.set(key,t);return t;
}
function draw(g,o){var r=rig(o),n=r.nodes,T=textures(o.id,o.front,o.back,o.makeCanvas),tri=[],kit=kits[o.id],c=Math.cos(o.yaw===undefined?r.yaw:o.yaw),s=Math.sin(o.yaw===undefined?r.yaw:o.yaw);
 function project(p){if(o.project){var rotated=[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];return o.project(rotated);}var xx=p[0]*c+p[2]*s,zz=-p[0]*s+p[2]*c,depth=zz+900,scale=900/depth;return{x:o.x+xx*o.scale*scale,y:o.y-(p[1]+zz*.12)*o.scale*scale,d:depth};}
 function face(a,b,c,color,uv,texture){if(color){var N=unit(cross(sub(b,a),sub(c,a))),light=.66+.34*Math.max(0,-N[0]*.4+N[1]*.55-N[2]*.65),v=parseInt(color.slice(1),16);color='rgb('+[v>>16,(v>>8)&255,v&255].map(x=>Math.round(x*light)).join(',')+')';}tri.push({p:[a,b,c],color:color,uv:uv,texture:texture});}
 function tube(a,b,radius,color){var w=unit(sub(b,a)),v=unit(cross(w,Math.abs(w[1])>.9?[1,0,0]:[0,1,0])),q=cross(w,v);for(var i=0;i<8;i++){var t=i*Math.PI/4,tt=(i+1)*Math.PI/4,off=add(mul(v,radius*Math.cos(t)),mul(q,radius*Math.sin(t))),next=add(mul(v,radius*Math.cos(tt)),mul(q,radius*Math.sin(tt)));face(add(a,off),add(b,off),add(a,next),color);face(add(a,next),add(b,off),add(b,next),color);}}
 function ellipsoid(center,radius,color){function v(a,b){return add(center,[radius[0]*Math.sin(a)*Math.cos(b),radius[1]*Math.cos(a),radius[2]*Math.sin(a)*Math.sin(b)]);}for(var j=0;j<6;j++)for(var i=0;i<10;i++){var a=j*Math.PI/6,b=(j+1)*Math.PI/6,t=i*Math.PI/5,tt=(i+1)*Math.PI/5;face(v(a,t),v(b,t),v(b,tt),color);face(v(a,t),v(b,tt),v(a,tt),color);}}
 // Back and front curved surfaces share finite side volume; no whole-body reflection.
 function patch(center,width,height,depth,back,texture){function v(u,v){var x=(u-.5)*width;return add(center,[x,(.5-v)*height,(back?-1:1)*(depth+12*Math.sqrt(Math.max(0,1-x*x/(width*width/4))))]);}for(var j=0;j<6;j++)for(var i=0;i<6;i++){var u=i/6,vv=j/6,uu=(i+1)/6,vvv=(j+1)/6;face(v(u,vv),v(uu,vv),v(uu,vvv),null,[[u,vv],[uu,vv],[uu,vvv]],texture);face(v(u,vv),v(uu,vvv),v(u,vvv),null,[[u,vv],[uu,vvv],[u,vvv]],texture);}}
 tube(n.hip,n.chest,49,kit[0]);tube(n.chest,n.neck,28,kit[0]);
 tube(n.sl,n.el,18,kit[0]);tube(n.sr,n.er,18,kit[0]);
 // Hands use separate nodes from the hip attachment points.
 tube(n.el,n.hl,13,'#c99a7c');tube(n.er,n.hr,13,'#c99a7c');ellipsoid(n.hl,[14,18,13],'#c99a7c');ellipsoid(n.hr,[14,18,13],'#c99a7c');
 ['l','r'].forEach(function(k){tube(n['hip'+k],n['k'+k],23,'#18191d');tube(n['k'+k],n['f'+k],16,kit[0]);ellipsoid(add(n['f'+k],[0,-1,12]),[22,10,32],kit[1]);});
 function headVertex(lat,lon){return [79*Math.sin(lat)*Math.cos(lon),89*Math.cos(lat),63*Math.sin(lat)*Math.sin(lon)];}
 function headFace(a,b,cc){var center=mul(add(add(a,b),cc),1/3),normal=unit(center),visible=(-normal[0]*s+normal[2]*c)<.2;if(!visible)return;
  var texture=center[2]>0?T.headFront:T.headBack,uv=[a,b,cc].map(p=>[(p[0]/79+1)/2,(1-p[1]/89)/2]);
  face(add(n.head,a),add(n.head,b),add(n.head,cc),o.id==='fero'?'#bc9275':'#392b25');
  face(add(n.head,a),add(n.head,b),add(n.head,cc),null,uv,texture);
 }
 for(var hj=0;hj<10;hj++)for(var hi=0;hi<20;hi++){var ha=hj*Math.PI/10,hb=(hj+1)*Math.PI/10,ht=hi*Math.PI/10,htt=(hi+1)*Math.PI/10;headFace(headVertex(ha,ht),headVertex(hb,ht),headVertex(hb,htt));headFace(headVertex(ha,ht),headVertex(hb,htt),headVertex(ha,htt));}
 // Only the camera-facing hemisphere is textured, avoiding a front face on the back of the head.

 patch([0,220+(n.chest[1]-249),0],88,112,49,true,T.shirtBack);
 tri.forEach(t=>{t.screen=t.p.map(project);t.depth=t.screen.reduce((a,p)=>a+p.d,0)/3;});tri.sort((a,b)=>b.depth-a.depth);
 tri.forEach(function(t){var p=t.screen;var cx=(p[0].x+p[1].x+p[2].x)/3,cy=(p[0].y+p[1].y+p[2].y)/3;g.beginPath();p.forEach(function(v,i){var dx=v.x-cx,dy=v.y-cy,l=Math.hypot(dx,dy)||1,x=v.x+dx/l*.35,y=v.y+dy/l*.35;if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.closePath();
  if(t.texture){var uv=t.uv.map(v=>[v[0]*t.texture.width,v[1]*t.texture.height]),a=uv[0],b=sub(uv[1],a),cc=sub(uv[2],a),det=b[0]*cc[1]-cc[0]*b[1],dx1=p[1].x-p[0].x,dx2=p[2].x-p[0].x,dy1=p[1].y-p[0].y,dy2=p[2].y-p[0].y;
   if(Math.abs(det)<1e-9)return;var aa=(dx1*cc[1]-dx2*b[1])/det,bb=(dy1*cc[1]-dy2*b[1])/det,ccc=(b[0]*dx2-cc[0]*dx1)/det,dd=(b[0]*dy2-cc[0]*dy1)/det;
   g.save();g.clip();g.transform(aa,bb,ccc,dd,p[0].x-aa*a[0]-ccc*a[1],p[0].y-bb*a[0]-dd*a[1]);g.drawImage(t.texture,0,0);g.restore();
  }else{g.fillStyle=t.color;g.fill();}
 });
 return r;
}
function render(g,o){
 if(o.walk||o.shot)return draw(g,o);
 var density=Math.min(2,root.devicePixelRatio||1),key=[o.id,o.direction,o.scale,density,o.viewKey||''].join(':'),stored=idleCache.get(key);
 if(!stored||stored.front!==o.front||stored.back!==o.back){
  var w=Math.ceil(260*o.scale),h=Math.ceil(510*o.scale),cv=o.makeCanvas(Math.ceil(w*density),Math.ceil(h*density)),ctx=cv.getContext('2d');ctx.scale(density,density);
  var options=Object.assign({},o,{x:w/2,y:h-15*o.scale});
  if(o.project)options.project=function(v){var q=o.project(v);return{x:q.x-o.x+w/2,y:q.y-o.y+h-15*o.scale,d:q.d};};
  draw(ctx,options);
  stored={cv:cv,w:w,h:h,front:o.front,back:o.back};if(idleCache.size>=24)idleCache.clear();idleCache.set(key,stored);
 }
 g.drawImage(stored.cv,o.x-stored.w/2,o.y-stored.h+15*o.scale,stored.w,stored.h);return rig(o);
}
D.futbolcu3d={rig:rig,draw:render};})(typeof globalThis!=='undefined'?globalThis:window);
