/* Approved Meto v03 geometry, GPU skinning, same camera and shot timeline.
 * Runtime derivative only; high-resolution master remains unchanged. */
(function(root){'use strict';
var D=root.DT, state={status:'idle',error:null}, model, renderer, promise;
function add(a,b){return a.map((x,i)=>x+b[i]);}function sub(a,b){return a.map((x,i)=>x-b[i]);}function mul(a,s){return a.map(x=>x*s);}function dot(a,b){return a.reduce((n,x,i)=>n+x*b[i],0);}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function len(a){return Math.hypot.apply(null,a);}function unit(a){return mul(a,1/(len(a)||1));}function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function load(){
 if(promise)return promise;if(!root.document||!root.fetch)return Promise.resolve(false);
 state.status='loading';
 promise=Promise.all([fetch('assets/meto3d/model.json?v=20261020b').then(check).then(r=>r.json()),fetch('assets/meto3d/model.bin?v=20261020b').then(check).then(r=>r.arrayBuffer())]).then(async function(pair){
  var meta=pair[0],bin=pair[1];if(bin.byteLength!==meta.binaryBytes)throw Error('Incomplete Meto mesh');
  var names=Array.from(new Set(meta.meshes.map(m=>m.texture).filter(Boolean))),images={};
  await Promise.all(names.map(name=>new Promise((resolve,reject)=>{var im=new Image();im.onload=()=>{images[name]=im;resolve();};im.onerror=()=>reject(Error('Meto texture '+name));im.src='assets/meto3d/'+name+'?v=20261020b';})));
  model={meta:meta,bin:bin,images:images};renderer=createRenderer(model);state.status='ready';return true;
 }).catch(function(e){state.status='error';state.error=String(e.message||e);console.warn('Meto 3D:',state.error);return false;});return promise;
}
function check(r){if(!r.ok)throw Error('Meto HTTP '+r.status);return r;}
function ik(a,b,L1,L2){var axis=unit(sub(b,a)),d=clamp(len(sub(b,a)),.001,L1+L2-.001),x=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-x*x)),hint=[0,0,1],perp=unit(sub(hint,mul(axis,dot(hint,axis))));return add(add(a,mul(axis,x)),mul(perp,h));}
function celebration(t,variant){
 t=Math.max(0,Number(t)||0);variant=((variant||0)%3+3)%3;
 function ease(a,b){var q=clamp((t-a)/(b-a),0,1);return q*q*(3-2*q);}
 var u=ease(.2,variant===2?1.5:1.1)*(1-ease(3.5,4.7)),rest={abduction:10,flex:5,elbow:20};
 var targets=variant===0?[{abduction:12,flex:10,elbow:25},{abduction:25,flex:50,elbow:100}]:variant===1?[{abduction:67,flex:12,elbow:24},{abduction:67,flex:12,elbow:24}]:[{abduction:105,flex:5,elbow:55},{abduction:105,flex:5,elbow:55}];
 return{arms:targets.map(a=>Object.fromEntries(Object.keys(rest).map(k=>[k,rest[k]+(a[k]-rest[k])*u]).concat([['bendUp',variant===2?u:0]]))),turn:variant===1?.22*Math.sin(Math.PI*ease(1.2,3.5)):variant===0?-.12*u:.10*u,variant:variant};
}
function armAnatomy(shoulder,side,upper,lower,angles){
 var a=angles.abduction*Math.PI/180,f=angles.flex*Math.PI/180,b=angles.elbow*Math.PI/180;
 var u=[side*Math.sin(a),-Math.cos(a)*Math.cos(f),Math.cos(a)*Math.sin(f)],front=unit([0,angles.bendUp||0,1-(angles.bendUp||0)]),hinge=unit(sub(front,mul(u,dot(front,u))));
 var fore=add(mul(u,Math.cos(b)),mul(hinge,Math.sin(b))),elbow=add(shoulder,mul(u,upper));return{elbow:elbow,hand:add(elbow,mul(fore,lower))};
}
function pose(r,meta){
 var b=meta.rest,n=r.nodes,neutral=D.futbolcu3d.rig({direction:0}).nodes,p={};
 ['hip','chest','neck','head','sl','sr'].forEach(k=>p[k]=add(b[k],mul(sub(n[k],neutral[k]),.94)));
 // Keep the reconstructed face rigid; its orientation follows the upper spine.
 var headAxis=add(sub(b.head,b.neck),mul(sub(sub(n.head,n.neck),sub(neutral.head,neutral.neck)),.4));p.head=add(p.neck,mul(unit(headAxis),len(sub(b.head,b.neck))));
 ['l','r'].forEach(function(s,i){
  p['hip'+s]=add(b['hip'+s],sub(p.hip,b.hip));
  var shoulder=p['s'+s],upper=len(sub(b['e'+s],b['s'+s])),lower=len(sub(b['h'+s],b['e'+s]));
  if(r.celebration){var c=celebration(r.celebration.time,r.celebration.variant),arm=armAnatomy(shoulder,i?1:-1,upper,lower,c.arms[i]);p['e'+s]=arm.elbow;p['h'+s]=arm.hand;}
  else{p['e'+s]=add(shoulder,mul(unit(sub(n['e'+s],n['s'+s])),upper));p['h'+s]=add(p['e'+s],mul(unit(sub(n['h'+s],n['e'+s])),lower));}
  // Rig feet describe sole/contact anchors; anatomical ankle is 18 units higher.
  p['f'+s]=add(n['f'+s],[0,b['f'+s][1]-8,0]);
  var h=p['hip'+s],foot=p['f'+s],L1=len(sub(b['k'+s],b['hip'+s])),L2=len(sub(b['f'+s],b['k'+s]));
  p['k'+s]=ik(h,foot,L1,L2);
 });return p;
}
// Column-major affine transform between bind and posed bone segments.
function boneMatrix(a,b,c,d,stable){
 var u=unit(sub(b,a)),v=unit(sub(d,c)),axis=cross(u,v),co=clamp(dot(u,v),-1,1),si=len(axis),R;
 if(si<1e-6){if(co>0)R=[1,0,0,0,1,0,0,0,1];else{axis=unit(cross(u,Math.abs(u[0])<.8?[1,0,0]:[0,1,0]));R=Array.from({length:9},(_,k)=>2*axis[Math.floor(k/3)]*axis[k%3]-(Math.floor(k/3)===k%3?1:0));}}
 else{axis=mul(axis,1/si);var x=axis[0],y=axis[1],z=axis[2],t=1-co;R=[co+x*x*t,x*y*t-z*si,x*z*t+y*si,y*x*t+z*si,co+y*y*t,y*z*t-x*si,z*x*t-y*si,z*y*t+x*si,co+z*z*t];}
 if(stable){
  function basis(axis){var z=unit(sub([0,0,1],mul(axis,axis[2])));if(len(z)<.01)z=unit(cross(axis,[1,0,0]));return[axis,z,unit(cross(axis,z))];}
  var A=basis(u),B=basis(v);R=Array.from({length:9},(_,k)=>{var row=Math.floor(k/3),col=k%3;return B.reduce((sum,b,j)=>sum+b[row]*A[j][col],0);});
 }
 var stretch=clamp(len(sub(d,c))/(len(sub(b,a))||1),.65,1.45),A=[];
 for(var row=0;row<3;row++)for(var col=0;col<3;col++)A[row*3+col]=R[row*3+col]+(stretch-1)*v[row]*u[col];
 var tr=c.map((q,j)=>q-dot(A.slice(j*3,j*3+3),a));return[A[0],A[3],A[6],0,A[1],A[4],A[7],0,A[2],A[5],A[8],0,tr[0],tr[1],tr[2],1];
}
function matrices(r,meta){var p=pose(r,meta),b=meta.rest,all=[];meta.bones.forEach((pair,i)=>{var a=pair[0],z=pair[1],end=p[z];
 if(i===10||i===13){var angle=r.ayak[i===10?0:1],v=sub(b[z],b[a]),cr=Math.cos(angle.roll),sr=Math.sin(angle.roll),cp=Math.cos(angle.pitch),sp=Math.sin(angle.pitch),cy=Math.cos(angle.yaw),sy=Math.sin(angle.yaw),x=v[0]*cr-v[1]*sr,y=v[0]*sr+v[1]*cr,zz=v[2],yy=y*cp-zz*sp,z2=y*sp+zz*cp;end=add(p[a],[x*cy+z2*sy,yy,-x*sy+z2*cy]);}
 all.push.apply(all,boneMatrix(b[a],b[z],p[a],end,i>=2&&i<=7));});return new Float32Array(all);}
function createRenderer(data){
 var canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');if(!gl.getExtension('OES_element_index_uint'))throw Error('32 bit mesh indices unavailable');
 var lost=false;canvas.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true;state.status='context-lost';});canvas.addEventListener('webglcontextrestored',function(){renderer=createRenderer(model);state.status='ready';});
 var vs='precision highp float;attribute vec3 aP,aN,aC;attribute vec2 aUV,aJ,aW;uniform mat4 uB[14];uniform vec4 uPX,uPY,uPD;uniform vec2 uSize,uDepth;uniform vec2 uOrigin;uniform float uYaw;varying vec2 vUV;varying vec3 vC;varying float vL,vD;void main(){mat4 m=uB[int(aJ.x)]*aW.x+uB[int(aJ.y)]*aW.y;vec3 p=(m*vec4(aP,1.)).xyz;vec3 n=normalize(mat3(m)*aN);float c=cos(uYaw),s=sin(uYaw);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);n=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);vec4 q=vec4(p,1.);float d=dot(uPD,q);float x=dot(uPX,q),y=dot(uPY,q);gl_Position=vec4(2.*(x-uOrigin.x*d)/uSize.x-d,d-2.*(y-uOrigin.y*d)/uSize.y,uDepth.x*d+uDepth.y,d);vD=d;vUV=aUV;vC=aC;vL=.64+.36*max(0.,dot(n,normalize(vec3(-.4,.7,.8))));}';
 var fs='precision mediump float;uniform sampler2D uTex;uniform float uNear;varying vec2 vUV;varying vec3 vC;varying float vL,vD;void main(){if(uNear>0.&&vD>=uNear)discard;vec3 t=pow(texture2D(uTex,vUV).rgb,vec3(2.2));gl_FragColor=vec4(pow(max(vec3(0.),t*vC*vL),vec3(1./2.2)),1.);}';
 function shader(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 var prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
 var locations={};['uB[0]','uPX','uPY','uPD','uSize','uOrigin','uDepth','uYaw','uNear','uTex'].forEach(k=>locations[k]=gl.getUniformLocation(prog,k));
 var attrib=[['aP',3,0],['aN',3,12],['aUV',2,24],['aC',3,32],['aJ',2,44],['aW',2,52]].map(a=>[gl.getAttribLocation(prog,a[0]),a[1],a[2]]);
 var tex={};function texture(name){if(tex[name||'white'])return tex[name||'white'];var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);if(name)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,data.images[name]);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);tex[name||'white']=t;return t;}
 var meshes=data.meta.meshes.map(function(m){var vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.bin,m.vertexOffset,m.vertices*15),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(data.bin,m.indexOffset,m.indices),gl.STATIC_DRAW);return{vb:vb,ib:ib,count:m.indices,tex:texture(m.texture)};});
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 var cache=[null,null],stats={drawCalls:0,cacheHits:0,pixels:0};
 function bounds(o,r){
  var ps=pose(r,data.meta),all=Object.values(ps),lo=[0,1,2].map(k=>Math.min(...all.map(p=>p[k]))-60),hi=[0,1,2].map(k=>Math.max(...all.map(p=>p[k]))+60),yaw=o.yaw===undefined?r.yaw:o.yaw,c=Math.cos(yaw),s=Math.sin(yaw),points=[];
  for(var x of [lo[0],hi[0]])for(var y of [lo[1],hi[1]])for(var z of [lo[2],hi[2]]){var q=o.project([x*c+z*s,y,-x*s+z*c]);if(q)points.push(q);}
  return{left:Math.floor(Math.min(...points.map(q=>q.x)))-2,top:Math.floor(Math.min(...points.map(q=>q.y)))-2,right:Math.ceil(Math.max(...points.map(q=>q.x)))+2,bottom:Math.ceil(Math.max(...points.map(q=>q.y)))+2,minDepth:Math.min(...points.map(q=>q.d)),maxDepth:Math.max(...points.map(q=>q.d))};
 }
 function paint(g,o,r,near,prepared){
  if(lost)return false;var transform=g.getTransform(),vp=o.viewport||{},density=Math.min(1.5,vp.dpr||Math.abs(transform.a)||1),w=vp.width||g.canvas.width/(Math.abs(transform.a)||1),h=vp.height||g.canvas.height/(Math.abs(transform.d)||1),box=prepared.box;if(near&&o.ball&&o.ball.rect){var rect=o.ball.rect;box={left:Math.max(box.left,rect.left),top:Math.max(box.top,rect.top),right:Math.min(box.right,rect.right),bottom:Math.min(box.bottom,rect.bottom)};}
  var left=Math.max(0,box.left),top=Math.max(0,box.top),cw=Math.min(w,box.right)-left,ch=Math.min(h,box.bottom)-top;if(cw<=0||ch<=0)return true;
  density=Math.min(density,Math.sqrt(220000/(cw*ch)));var W=Math.max(1,Math.ceil(cw*density)),H=Math.max(1,Math.ceil(ch*density));
  var isStatic=!o.walk&&!o.gait&&!o.sevinc&&!o.metoCelebration&&(!o.shot||o.shot.elapsed-o.shot.windup>1.25),slot=near?1:0,key=isStatic?[o.viewKey||'',o.yaw,near,W,H,left,top,cw,ch,Array.from(prepared.bones,v=>Math.round(v*1000)).join(',')].join(':'):null;
  if(key&&cache[slot]&&cache[slot].key===key){stats.cacheHits++;g.drawImage(cache[slot].canvas,left,top,cw,ch);return true;}
  var points=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]].map(v=>o.project(v));if(points.some(p=>!p))return false;
  function row(fn){var b=fn(points[0]);return new Float32Array([fn(points[1])-b,fn(points[2])-b,fn(points[3])-b,b]);}
  if(!near&&(canvas.width!==W||canvas.height!==H)){canvas.width=W;canvas.height=H;}gl.viewport(0,canvas.height-H,W,H);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(prog);gl.uniformMatrix4fv(locations['uB[0]'],false,prepared.bones);gl.uniform4fv(locations.uPX,row(p=>p.x*p.d));gl.uniform4fv(locations.uPY,row(p=>p.y*p.d));gl.uniform4fv(locations.uPD,row(p=>p.d));gl.uniform2f(locations.uSize,cw,ch);gl.uniform2f(locations.uOrigin,left,top);var dr=row(p=>p.d),spread=Math.max(.5,600*Math.hypot(dr[0],dr[1],dr[2])),nearZ=Math.max(.05,dr[3]-spread),farZ=Math.max(nearZ+1,dr[3]+spread);gl.uniform2f(locations.uDepth,(farZ+nearZ)/(farZ-nearZ),-2*farZ*nearZ/(farZ-nearZ));gl.uniform1f(locations.uYaw,o.yaw===undefined?r.yaw:o.yaw);gl.uniform1f(locations.uNear,near||0);gl.uniform1i(locations.uTex,0);
  meshes.forEach(function(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);attrib.forEach(a=>{gl.enableVertexAttribArray(a[0]);gl.vertexAttribPointer(a[0],a[1],gl.FLOAT,false,60,a[2]);});gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.bindTexture(gl.TEXTURE_2D,m.tex);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);stats.drawCalls++;});stats.pixels+=W*H;
  if(key){var cv=cache[slot]?cache[slot].canvas:document.createElement('canvas');cv.width=W;cv.height=H;cv.getContext('2d').drawImage(canvas,0,0,W,H,0,0,W,H);cache[slot]={key:key,canvas:cv};g.drawImage(cv,left,top,cw,ch);}else g.drawImage(canvas,0,0,W,H,left,top,cw,ch);return true;
 }

 return{paint:paint,bounds:bounds,stats:stats,canvas:canvas,gl:gl};
}
function draw(g,o){
 if(o.id!=='meto'||!o.project)return false;if(state.status==='idle')load();if(state.status!=='ready')return false;
 var r=D.futbolcu3d.rig(o);r.celebration=o.metoCelebration;var prepared={bones:matrices(r,model.meta),box:renderer.bounds(o,r)};
 if(o.ball&&o.ball.depth>=prepared.box.maxDepth){o.ball.draw(g);return renderer.paint(g,o,r,0,prepared);}
 if(!renderer.paint(g,o,r,0,prepared))return false;
 if(o.ball){o.ball.draw(g);if(o.ball.depth>prepared.box.minDepth)renderer.paint(g,o,r,o.ball.depth,prepared);}return true;
}
function portrait(g,o){
 if(o.id!=='meto')return false;
 var t=o.time||0,celebrate=o.goal?{time:t,variant:o.variant||0}:null,c=celebrate?celebration(t,o.variant):null,scale=o.height/(1.71024522529/D.futbolcu3d.UNIT);
 return draw(g,{id:'meto',direction:0,yaw:.12+(c?c.turn:0),metoCelebration:celebrate,viewport:o.viewport,project:function(v){var d=900-v[2],q=900/d;return{x:o.x+v[0]*scale*q,y:o.y-(v[1]-8)*scale*q,d:d};}});
}
D.meto3d={load:load,draw:draw,portrait:portrait,status:state,_pose:pose,_celebration:celebration,_armAnatomy:armAnatomy,_matrices:matrices,_boneMatrix:boneMatrix,_model:()=>model,_renderer:()=>renderer};
// Loaded with Meto's selected character assets; other players do not download this model.
})(typeof globalThis!=='undefined'?globalThis:window);
