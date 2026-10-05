/* Procedural solid 3D meshes with articulated joints, perspective projection and per-face lighting.
 * Player walking preserves the complete original clothed sprite on a deforming 3D mesh; no external model downloads. */
(function(root){'use strict';var D=root.DT,faceTexture=null;
function add(a,b){return a.map(function(x,i){return x+b[i];});}function sub(a,b){return a.map(function(x,i){return x-b[i];});}function mul(a,s){return a.map(function(x){return x*s;});}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function unit(a){return mul(a,1/(Math.hypot.apply(null,a)||1));}
function rig(k,z){var dive=k.poz==='dal',tilt=dive?-(k.yon||1)*Math.PI*.47*Math.min(1,(k.ilerleme||0)*2.2)*(1-(k.recovery||0)):0,c=Math.cos(tilt),s=Math.sin(tilt);
 function p(x,y,d){return [k.x+x*c-y*s,k.y+x*s+y*c,z+(d||0)];}
 var low=k.low&& !dive,leg=low?.55:.85;
 var nodes={hip:p(0,-.22,0),chest:p(0,.33,0),neck:p(0,.55,0),head:p(0,.73,0),
 sl:p(-.24,.31,0),sr:p(.24,.31,0),kl:p(-.15,-.56,low?-.10:.05),kr:p(.15,-.56,.05),fl:p(-.20,-leg,-.12),fr:p(.20,-leg,-.12)};
 if(k.saved&&!dive){nodes.el=p(-.26,.13,-.13);nodes.er=p(.26,.13,-.13);nodes.hl=p(-.13,.20,-.32);nodes.hr=p(.13,.20,-.32);}
 else if(dive){nodes.el=p(-.18,.70,-.05);nodes.er=p(.18,.70,-.05);nodes.hl=p(-.15,1.03,-.12);nodes.hr=p(.15,1.03,-.12);}
 else if(k.high){nodes.el=p(-.30,.63,-.07);nodes.er=p(.30,.63,-.07);nodes.hl=p(-.18,.96,-.18);nodes.hr=p(.18,.96,-.18);}
 else {nodes.el=p(-.36,.02,-.05);nodes.er=p(.36,.02,-.05);nodes.hl=p(-.26,low?-.37:.03,-.30);nodes.hr=p(.26,low?-.37:.03,-.30);}
 // Non-contact pre-kick gestures are driven only by visual time, not the scoring seed.
 if(k.gesture!==undefined&&!dive){var time=k.gesture,cycle=Math.floor(time/2.8)%3,phase=(time%2.8)/2.8,beat=Math.sin(phase*Math.PI),side=cycle===1?-1:1;
  if(cycle===0){nodes.el=p(-.38,.43,-.04);nodes.er=p(.38,.43,-.04);nodes.hl=p(-.50,.55+.17*Math.sin(time*7),-.08);nodes.hr=p(.50,.55-.17*Math.sin(time*7),-.08);}
  else {var hand=p(side*(.35+.5*beat),.30+.12*beat,-.10),elbow=p(side*.46,.26,-.04);if(side<0){nodes.el=elbow;nodes.hl=hand;}else{nodes.er=elbow;nodes.hr=hand;}}
 }
 if(k.block>0&&!dive&&!k.saved){var open=k.block,height=k.high?.76:(k.low?-.28:.21);nodes.el=p(-.30-.18*open,height+.05,-.14);nodes.er=p(.30+.18*open,height+.05,-.14);nodes.hl=p(-.22-.50*open,height,-.30);nodes.hr=p(.22+.50*open,height,-.30);}
 // Recovery key poses keep support hands, knees and planted feet on the ground.
 if(dive&&k.recovery>0){
  var dir=k.yon||1,x=k.x,cz=z;
  function point(dx,y,dz){return [x+dir*dx,y,cz+dz];}
  function posture(hipY,chestY,headY,kneeY,rightKnee,handY){return {
   hip:point(0,hipY,.04),chest:point(.03,chestY,-.04),neck:point(.04,headY-.18,-.04),head:point(.04,headY,-.04),
   sl:point(-.22,chestY,-.04),sr:point(.25,chestY,-.04),
   kl:point(-.18,kneeY,-.02),kr:point(.18,rightKnee,.10),fl:point(-.20,.07,-.12),fr:point(.20,.07,-.12),
   el:point(-.34,(chestY+handY)/2,-.15),er:point(.36,(chestY+handY)/2,-.15),
   hl:point(-.32,handY,-.30),hr:point(.34,handY,-.30)};}
  var first=rig({x:x,y:.30,poz:'dal',yon:dir,ilerleme:1,recovery:0,eskiKol:k.eskiKol},z).nodes;
  var poses=[first,posture(.38,.62,.88,.13,.13,.11),posture(.56,k.eskiKol?1.00:.73,k.eskiKol?1.32:1.10,.16,.16,.11),
   posture(.72,1.20,1.53,.45,.15,.68),rig({x:x,y:1,poz:'bekle',yon:0,ilerleme:0,eskiKol:k.eskiKol},z).nodes];
  var phases=[0,.22,.48,.76,1],idx=0;while(idx<3&&k.recovery>phases[idx+1])idx++;
  var u=Math.max(0,Math.min(1,(k.recovery-phases[idx])/(phases[idx+1]-phases[idx])));u=u*u*(3-2*u);
  Object.keys(nodes).forEach(function(key){nodes[key]=poses[idx][key].map(function(value,i){return value+(poses[idx+1][key][i]-value)*u;});});
 }
 // A committed penalty dive can adjust hand HEIGHT after observing the ball.
 // The body keeps its chosen side; the following IK bounds both arm lengths.
 if(dive&&Number.isFinite(k.reachHeight)&&!k.recovery){
  ['hl','hr'].forEach(function(key){nodes[key][1]+=(k.reachHeight-nodes[key][1])*Math.max(0,Math.min(1,k.reachBlend||0));});
 }
 // Two-bone IK: wrists can move, but humerus and forearm never change length.
 if(!k.eskiKol){
  var upper=.34,lower=.34;
  [['sl','el','hl'],['sr','er','hr']].forEach(function(keys){
   var shoulder=nodes[keys[0]],want=nodes[keys[2]],hint=nodes[keys[1]],delta=sub(want,shoulder),distance=Math.hypot.apply(null,delta),axis=unit(delta);
   if(distance<1e-8)axis=[0,-1,0];
   var d=Math.max(.025,Math.min(upper+lower-.0001,distance)),along=(upper*upper-lower*lower+d*d)/(2*d),bend=Math.sqrt(Math.max(0,upper*upper-along*along));
   var h=add(sub(hint,shoulder),[0,0,-.025]),dot=h.reduce(function(n,x,i){return n+x*axis[i];},0),perp=sub(h,mul(axis,dot));
   if(Math.hypot.apply(null,perp)<1e-7)perp=cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0]);
   nodes[keys[1]]=add(shoulder,add(mul(axis,along),mul(unit(perp),bend)));nodes[keys[2]]=add(shoulder,mul(axis,d));
  });
 }
 var bones=[['hip','chest',.24,'shirt'],['chest','neck',.13,'shirt'],['sl','el',.09,'shirt'],['sr','er',.09,'shirt'],['el','hl',.075,'skin'],['er','hr',.075,'skin'],['hip','kl',.12,'shorts'],['hip','kr',.12,'shorts'],['kl','fl',.09,'socks'],['kr','fr',.09,'socks']];
 return {nodes:nodes,bones:bones,tilt:tilt};}
function shapes(k,z){var r=rig(k,z),n=r.nodes,result=r.bones.map(function(b){return {a:n[b[0]],b:n[b[1]],r:b[2]};});result.push({a:n.head,b:n.head,r:.15},{a:n.hl,b:n.hl,r:.115},{a:n.hr,b:n.hr,r:.115});return result;}
function capsuleDistance(p,a,b){var d=sub(b,a),u=Math.max(0,Math.min(1,sub(p,a).reduce(function(t,x,i){return t+x*d[i];},0)/(d.reduce(function(t,x){return t+x*x;},0)||1)));return Math.hypot.apply(null,sub(p,add(a,mul(d,u))));}
function ballHits(k,p,R,z){return shapes(k,z===undefined?p.z:z).some(function(s){return capsuleDistance([p.x,p.y,p.z],s.a,s.b)<=s.r+R;});}
function shade(hex,light){var n=parseInt(hex.slice(1),16);return 'rgb('+[n>>16,(n>>8)&255,n&255].map(function(x){return Math.round(x*light);}).join(',')+')';}
function draw(g,project,r,palette){var triangles=[];
 function face(a,b,c,color){var normal=unit(cross(sub(b,a),sub(c,a))),light=.48+.50*Math.max(0,normal[0]*-.40+normal[1]*.75+normal[2]*-.53);triangles.push({p:[a,b,c],color:shade(color,light)});}
 function cylinder(a,b,r,color){var w=unit(sub(b,a)),u=unit(cross(w,Math.abs(w[1])>.9?[1,0,0]:[0,1,0])),v=cross(w,u);for(var i=0;i<8;i++){var t=i*Math.PI/4,tn=(i+1)*Math.PI/4,offset=add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t))),next=add(mul(u,r*Math.cos(tn)),mul(v,r*Math.sin(tn))),aa=add(a,offset),ab=add(a,next),ba=add(b,offset),bb=add(b,next);face(aa,ba,ab,color);face(ab,ba,bb,color);face(a,ab,aa,color);face(b,ba,bb,color);}}
 function sphere(center,scale,color){function p(lat,lon){return add(center,[scale[0]*Math.sin(lat)*Math.cos(lon),scale[1]*Math.cos(lat),scale[2]*Math.sin(lat)*Math.sin(lon)]);}for(var i=0;i<5;i++)for(var j=0;j<8;j++){var a=i*Math.PI/5,b=(i+1)*Math.PI/5,c=j*Math.PI/4,d=(j+1)*Math.PI/4;face(p(a,c),p(b,c),p(b,d),color);face(p(a,c),p(b,d),p(a,d),color);}}
 var n=r.nodes;r.bones.forEach(function(b){cylinder(n[b[0]],n[b[1]],b[2],palette[b[3]]);});sphere(n.head,[.15,.19,.15],palette.skin);sphere(add(n.head,[0,.11,.01]),[.15,.095,.145],palette.hair);
 ['hl','hr'].forEach(function(key){sphere(n[key],[.12,.09,.12],palette.gloves);});['fl','fr'].forEach(function(key){sphere(add(n[key],[0,-.02,-.06]),[.12,.07,.20],palette.boots);});
 sphere(add(n.head,[0,-.015,-.14]),[.045,.035,.055],palette.skin);
 if(palette===keeper&&faceTexture){
  var up=unit(sub(n.head,n.neck)),right=[up[1],-up[0],0];
  function vertex(u,v){var xx=(u-.5)*.36,yy=(.5-v)*.44,depth=-.14-.035*Math.max(0,1-Math.pow(xx/.18,2));return add(n.head,add(mul(right,xx),add(mul(up,yy),[0,0,depth])));}
  for(var row=0;row<6;row++)for(var col=0;col<4;col++){var u=col/4,v=row/6,uu=(col+1)/4,vv=(row+1)/6;
   triangles.push({p:[vertex(u,v),vertex(uu,v),vertex(uu,vv)],uv:[[u,v],[uu,v],[uu,vv]],texture:faceTexture});
   triangles.push({p:[vertex(u,v),vertex(uu,vv),vertex(u,vv)],uv:[[u,v],[uu,vv],[u,vv]],texture:faceTexture});}
 }
 triangles.forEach(function(t){t.screen=t.p.map(function(p){return project(p[0],p[1],p[2]);});t.depth=t.screen.every(Boolean)?t.screen.reduce(function(s,p){return s+p.d;},0)/3:-1;});triangles.sort(function(a,b){return b.depth-a.depth;});
 triangles.forEach(function(t){if(t.depth<0)return;g.beginPath();g.moveTo(t.screen[0].x,t.screen[0].y);g.lineTo(t.screen[1].x,t.screen[1].y);g.lineTo(t.screen[2].x,t.screen[2].y);g.closePath();if(t.texture){var uv=t.uv.map(function(p){return [p[0]*t.texture.width,p[1]*t.texture.height];}),s0=uv[0],s1=uv[1],s2=uv[2],p0=t.screen[0],p1=t.screen[1],p2=t.screen[2],dx1=s1[0]-s0[0],dy1=s1[1]-s0[1],dx2=s2[0]-s0[0],dy2=s2[1]-s0[1],det=dx1*dy2-dx2*dy1;
   var a=((p1.x-p0.x)*dy2-(p2.x-p0.x)*dy1)/det,c=(dx1*(p2.x-p0.x)-dx2*(p1.x-p0.x))/det,b=((p1.y-p0.y)*dy2-(p2.y-p0.y)*dy1)/det,d=(dx1*(p2.y-p0.y)-dx2*(p1.y-p0.y))/det;
   g.save();g.clip();g.transform(a,b,c,d,p0.x-a*s0[0]-c*s0[1],p0.y-b*s0[0]-d*s0[1]);g.drawImage(t.texture,0,0);g.restore();
  }else{g.fillStyle=t.color;g.fill();}});
}
var keeper={shirt:'#279258',shorts:'#152b22',socks:'#236f44',skin:'#d4a47c',hair:'#9b7545',gloves:'#eeeeea',boots:'#20292d'};
function kaleciCiz(g,project,k,z){draw(g,project,rig(Object.assign({},k,{eskiKol:false}),z),keeper);}
function barajCiz(g,project,p,i){var scale=p.boy/1.92,r=rig({x:p.x,y:p.y+1,poz:'bekle',low:false,high:false},p.z);Object.keys(r.nodes).forEach(function(key){var n=r.nodes[key];n[0]=p.x+(n[0]-p.x)*scale;n[1]=p.y+(n[1]-p.y)*scale;});var colors={shirt:i%2?'#434952':'#d5d7d9',shorts:'#171b21',socks:'#333b45',skin:'#cf9f7c',hair:'#302821',gloves:'#cf9f7c',boots:'#11171a'};draw(g,project,r,colors);}
// Texture-skinned leg chains: hip, knee and ankle rotate independently while preserving the original kit.
var WALK_JOINTS={
 meto:[[431,382],[437,447],[445,509],[452,384],[478,417],[541,430]],
 lort:[[439,387],[445,449],[450,510],[463,389],[488,421],[549,440]],
 fero:[[429,376],[440,446],[449,509],[451,378],[482,411],[544,421]],
 latte:[[432,382],[439,447],[446,509],[454,384],[481,417],[544,430]],
 josh:[[431,382],[440,449],[446,509],[454,384],[480,417],[543,430]]
};
function walkingJoints(walk,id,travel){
 var u=Math.max(0,Math.min(1,walk.u)),bind=WALK_JOINTS[id]||WALK_JOINTS.meto;
 var env=Math.min(1,u/.16,(1-u)/.16);env=env*env*(3-2*env);
 var phase=u*Math.PI*4,targets=[];
 for(var leg=0;leg<2;leg++){
  var h=bind[leg*3],cycle=Math.sin(phase+leg*Math.PI),f=(u*2+leg*.5)%1,swing=f>=.5,sw=(f-.5)*2;
  var lift=swing?Math.sin(Math.PI*sw)*36:0,stride=(travel||0)/2;
  var stepX=swing?stride*(-.25+.5*(sw*sw*(3-2*sw))):stride*(.25-f);
  var ankle=[(leg?505:425)+stepX,510-lift],knee=[h[0]+(leg?27:-12)+cycle*16,453-lift*.6];
  [h,knee,ankle].forEach(function(v,j){var b=bind[leg*3+j];targets.push([b[0]+(v[0]-b[0])*env,b[1]+(v[1]-b[1])*env]);});
 }
 return {bind:bind,nodes:targets,phase:phase,envelope:env};
}
function oyuncuYuru(g,image,walk,placement){
 var u=Math.max(0,Math.min(1,walk.u)),ease=u*u*(3-2*u),turn=walk.from+(walk.to-walk.from)*ease;
 var pose=walkingJoints(walk,placement.karakter,(walk.to-walk.from)*26/placement.scale),phase=pose.phase,yaw=(walk.to||1)*.22*Math.sin(Math.PI*u);
 var width=900,height=560,cols=16,rows=24,vertices=[];
 function distance(p,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
 function bonePoint(p,a,b,ta,tb){var dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),along=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(len*len),side=((p[0]-a[0])*-dy+(p[1]-a[1])*dx)/len,tx=tb[0]-ta[0],ty=tb[1]-ta[1],tl=Math.hypot(tx,ty);return [ta[0]+along*tx-side*ty/tl,ta[1]+along*ty+side*tx/tl];}
 function skinned(x,y){if(y<365)return [x,y];var point=[x,y],B=pose.bind,T=pose.nodes,best=0,min=Infinity;
  for(var leg=0;leg<2;leg++){var i=leg*3,d=Math.min(distance(point,B[i],B[i+1]),distance(point,B[i+1],B[i+2]));if(d<min){min=d;best=i;}}
  var upper=bonePoint(point,B[best],B[best+1],T[best],T[best+1]),lower=bonePoint(point,B[best+1],B[best+2],T[best+1],T[best+2]);
  var d1=distance(point,B[best],B[best+1]),d2=distance(point,B[best+1],B[best+2]),blend=Math.max(0,Math.min(1,.5+(d1-d2)/20)),w=Math.max(0,Math.min(1,(y-365)/25));
  return [x+(upper[0]*(1-blend)+lower[0]*blend-x)*w,y+(upper[1]*(1-blend)+lower[1]*blend-y)*w];
 }
 for(var row=0;row<=rows;row++){vertices[row]=[];for(var col=0;col<=cols;col++){
  var sx=220+400*col/cols,sy=height*row/rows,p=skinned(sx,sy),x=(p[0]-placement.anchorX)*placement.scale,y=(placement.bottom-p[1])*placement.scale;
  var depth=-x*Math.sin(yaw),perspective=600/(600+depth),flip=walk.u<.5?(walk.from>0):(walk.to>0),sign=flip?-1:1,turnScale=(walk.from>0)!==(walk.to>0)?.12+.88*Math.abs(Math.cos(Math.PI*u)):1;
  vertices[row][col]={x:placement.x+sign*(x*Math.cos(yaw)*(1-.10*Math.abs(turn))+turn*.12*y)*perspective*turnScale,y:placement.y-y*perspective,uv:[sx,sy]};
 }}
 function triangle(a,b,c){var dx1=b.uv[0]-a.uv[0],dy1=b.uv[1]-a.uv[1],dx2=c.uv[0]-a.uv[0],dy2=c.uv[1]-a.uv[1],det=dx1*dy2-dx2*dy1;
  var aa=((b.x-a.x)*dy2-(c.x-a.x)*dy1)/det,cc=(dx1*(c.x-a.x)-dx2*(b.x-a.x))/det,bb=((b.y-a.y)*dy2-(c.y-a.y)*dy1)/det,dd=(dx1*(c.y-a.y)-dx2*(b.y-a.y))/det;
  var cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3;function edge(p){var dx=p.x-cx,dy=p.y-cy,l=Math.hypot(dx,dy)||1;return{x:p.x+dx/l*.65,y:p.y+dy/l*.65};}var ca=edge(a),cb=edge(b),ccp=edge(c);
  g.save();g.beginPath();g.moveTo(ca.x,ca.y);g.lineTo(cb.x,cb.y);g.lineTo(ccp.x,ccp.y);g.closePath();g.clip();g.transform(aa,bb,cc,dd,a.x-aa*a.uv[0]-cc*a.uv[1],a.y-bb*a.uv[0]-dd*a.uv[1]);g.drawImage(image,0,0,width,height);g.restore();
 }
 for(row=0;row<rows;row++)for(col=0;col<cols;col++){var a=vertices[row][col],b=vertices[row][col+1],c=vertices[row+1][col+1],d=vertices[row+1][col];triangle(a,b,c);triangle(a,c,d);}
}
D.model3d={walkingJoints:walkingJoints,oyuncuYuru:oyuncuYuru,setFace:function(image){faceTexture=image;},rig:rig,shapes:shapes,ballHits:ballHits,kaleciCiz:kaleciCiz,barajCiz:barajCiz};})(typeof globalThis!=='undefined'?globalThis:window);
