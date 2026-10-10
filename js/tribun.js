/* Perspective cloth in world metres: pole-driven Verlet mesh, fixed hoist,
 * free hem, inertia, wind and shaded textured folds. Never touches physics. */
(function(root){'use strict';var D=root.DT,cache={},states={};
var colors={meto:['#16191d','#dfd8c9','#d83243'],lort:['#1243a0','#e8dfc9','#b6d2ec'],latte:['#8a1726','#f0dfcc','#ded2b0'],josh:['#37226a','#efdab0','#bd333e'],fero:['#e0e1dc','#20252a','#c74b3f']};
var slogans={meto:'Meto Forever',lort:'Gökhanlort 28 GİRESUNLUMM',latte:'IceLatte · Bergen',josh:'Yozgatlım ♥',fero:'ÇIKAR MASAYA KOY FERO BABA ♥'};
function reduced(){return !!(D.AYAR&&D.AYAR.hareket===false);}   // sistem "hareketi azalt" ayarı yok sayılır (oyun süsü); testler AYAR.hareket=false ile dondurur
function dot(a,b){return a.reduce(function(n,x,i){return n+x*b[i];},0);}
function unit(v){var l=Math.hypot.apply(null,v)||1;return v.map(function(x){return x/l;});}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function pole(t,base){var a=.43*Math.sin(t*1.65)+.07*Math.sin(t*3.3+.8),depth=.12*Math.sin(t*1.65-.4),axis=unit([Math.sin(a),Math.cos(a),depth]);return {base:base,axis:axis,end:base.map(function(v,i){return v+axis[i]*4.4;})};}
function anchor(p,v){return p.end.map(function(x,i){return x-p.axis[i]*3.45*v;});}
function newMesh(cols,rows,p){var pts=[],links=[],width=4.9,height=3.45;
 var right=unit([p.axis[1],-p.axis[0],0]);
 for(var y=0;y<=rows;y++)for(var x=0;x<=cols;x++){var a=anchor(p,y/rows),pos=a.map(function(v,i){return v+right[i]*width*x/cols;});pts.push({p:pos.slice(),old:pos.slice(),u:x/cols,v:y/rows,pinned:x===0});}
 function link(a,b){var p=pts[a].p,q=pts[b].p;links.push({a:a,b:b,rest:Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])});}
 for(var j=0;j<=rows;j++)for(var i=0;i<=cols;i++){var k=j*(cols+1)+i;if(i<cols)link(k,k+1);if(j<rows)link(k,k+cols+1);if(i<cols&&j<rows){link(k,k+cols+2);link(k+1,k+cols+1);}if(i+2<=cols)link(k,k+2);}
 return {cols:cols,rows:rows,pts:pts,links:links,time:null,clock:0};
}
function advance(mesh,t,base,still){
 var dt=1/60;if(mesh.time===null){mesh.time=t;mesh.clock=t;}
 var elapsed=Math.max(0,Math.min(.1,t-mesh.time));mesh.time=t;
 if(still){var p=pole(0,base);mesh.pts.forEach(function(n){var a=anchor(p,n.v);n.p=[a[0]+n.u*4.9,a[1]-.22*Math.sin(Math.PI*n.u),a[2]+.20*Math.sin(n.u*Math.PI*3)*Math.sin(Math.PI*n.v)];n.old=n.p.slice();});return;}
 var steps=Math.min(6,Math.floor((t-mesh.clock)/dt+1e-8));if(steps<0||elapsed===0)return;
 if(t-mesh.clock>.15)mesh.clock=t-steps*dt;
 for(var s=0;s<steps;s++){
  mesh.clock+=dt;var time=mesh.clock,p=pole(time,base);
  mesh.pts.forEach(function(n){if(n.pinned){n.p=anchor(p,n.v);n.old=n.p.slice();return;}
   var old=n.p.slice(),gust=Math.sin(time*3.7-n.u*4.8+n.v*1.2),flutter=Math.sin(time*8.8-n.u*8+n.v*3);
   var force=[3.0+.6*gust,-1.1,6.5+3.3*gust+1.2*flutter];
   n.p=n.p.map(function(v,i){return v+(v-n.old[i])*.975+force[i]*dt*dt;});n.old=old;
  });
  for(var it=0;it<5;it++){
   mesh.links.forEach(function(l){var a=mesh.pts[l.a],b=mesh.pts[l.b],delta=b.p.map(function(v,i){return v-a.p[i];}),len=Math.hypot.apply(null,delta)||1,correction=(len-l.rest)/len;
    var wa=a.pinned?0:1,wb=b.pinned?0:1,total=wa+wb;if(!total)return;
    for(var i=0;i<3;i++){a.p[i]+=delta[i]*correction*wa/total;b.p[i]-=delta[i]*correction*wb/total;}
   });
   mesh.pts.forEach(function(n){if(n.pinned)n.p=anchor(p,n.v);});
  }
 }
 var livePole=pole(t,base);mesh.pts.forEach(function(n){if(n.pinned)n.p=anchor(livePole,n.v);});
}
function texture(id,image,makeCanvas,banner){
 var key=id+(banner?'_banner':'_flag'),old=cache[key];if(old&&old.image===image)return old.canvas;
 var width=banner?1200:640,height=banner?144:448,c=makeCanvas(width/2,height/2),g=c.getContext('2d'),col=colors[id]||colors.meto;g.scale(.5,.5);
 g.fillStyle=col[0];g.fillRect(0,0,width,height);g.fillStyle=col[1];g.fillRect(7,7,width-14,4);g.fillRect(7,height-11,width-14,4);
 if(banner){
  g.fillStyle=col[1];g.textAlign='center';g.textBaseline='middle';var size=58;g.font='900 '+size+'px Arial';while(g.measureText(slogans[id]).width>width-70&&size>20){size--;g.font='900 '+size+'px Arial';}g.fillText(slogans[id],width/2,height/2);
 }else{
  g.save();g.globalAlpha=.16;g.fillStyle=col[1];for(var x=-448;x<640;x+=180){g.beginPath();g.moveTo(x,0);g.lineTo(x+100,0);g.lineTo(x+548,448);g.lineTo(x+448,448);g.closePath();g.fill();}g.restore();
  if(image){var w=image.width,h=image.height,side=Math.min(w,h*.59),sx=(w-side)/2;
   // Exact existing portrait pixels, no generated substitute identity.
   g.save();g.beginPath();g.ellipse(320,196,144,168,0,0,Math.PI*2);g.clip();g.drawImage(image,sx,0,side,Math.min(h,side*1.17),176,28,288,336);g.restore();
  }
  g.fillStyle=col[1];g.textAlign='center';g.font='900 49px Arial';g.fillText(id==='lort'?'GÖKHANLORT':id.toUpperCase(),320,407);
 }
 g.strokeStyle='rgba(240,235,218,.35)';g.lineWidth=2;g.setLineDash([3,5]);g.strokeRect(9,9,width-18,height-18);
 cache[key]={image:image,canvas:c};return c;
}
function triangles(g,vertices,cols,rows,tex,project){var list=[];
 function add(a,b,c){var p=[a,b,c].map(function(n){return project(n.p[0],n.p[1],n.p[2]);});if(p.some(function(q){return !q;}))return;
  var ab=b.p.map(function(v,i){return v-a.p[i];}),ac=c.p.map(function(v,i){return v-a.p[i];}),normal=unit(cross(ab,ac));
  list.push({v:[a,b,c],p:p,depth:(p[0].d+p[1].d+p[2].d)/3,shade:Math.max(.10,.42-.32*Math.abs(dot(normal,unit([-.3,.6,-1]))))});
 }
 for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){var i=y*(cols+1)+x,a=vertices[i],b=vertices[i+1],c=vertices[i+cols+1],d=vertices[i+cols+2];add(a,c,b);add(b,c,d);}
 list.sort(function(a,b){return b.depth-a.depth;});
 list.forEach(function(t){var uv=t.v.map(function(n){return[n.u*tex.width,n.v*tex.height];}),a=uv[0],du=uv[1][0]-a[0],dv=uv[1][1]-a[1],eu=uv[2][0]-a[0],ev=uv[2][1]-a[1],det=du*ev-eu*dv;if(Math.abs(det)<1e-8)return;
  var p=t.p,dx=p[1].x-p[0].x,dy=p[1].y-p[0].y,ex=p[2].x-p[0].x,ey=p[2].y-p[0].y,A=(dx*ev-ex*dv)/det,B=(dy*ev-ey*dv)/det,C=(du*ex-eu*dx)/det,E=(du*ey-eu*dy)/det;
  var center={x:(p[0].x+p[1].x+p[2].x)/3,y:(p[0].y+p[1].y+p[2].y)/3};
  g.save();g.beginPath();p.forEach(function(q,i){var vx=q.x-center.x,vy=q.y-center.y,len=Math.hypot(vx,vy)||1,x=q.x+.35*vx/len,y=q.y+.35*vy/len;if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.closePath();g.clip();
  g.save();g.transform(A,B,C,E,p[0].x-A*a[0]-C*a[1],p[0].y-B*a[0]-E*a[1]);g.drawImage(tex,0,0);g.restore();g.fillStyle='rgba(0,0,0,'+t.shade.toFixed(3)+')';g.fillRect(Math.min(p[0].x,p[1].x,p[2].x)-1,Math.min(p[0].y,p[1].y,p[2].y)-1,Math.max(p[0].x,p[1].x,p[2].x)-Math.min(p[0].x,p[1].x,p[2].x)+2,Math.max(p[0].y,p[1].y,p[2].y)-Math.min(p[0].y,p[1].y,p[2].y)+2);g.restore();
 });
}
function line(g,a,b,project,color,width){var p=project.apply(null,a),q=project.apply(null,b);if(!p||!q)return;g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();}
function draw(g,o){
 var still=reduced(),time=still?0:o.time,base=[-1.0,1.6,o.D+20],p=pole(time,base),key=o.id+':'+o.D,mesh=states[key];
 if(!mesh){states={};mesh=newMesh(12,8,p);states[key]=mesh;}
 advance(mesh,time,base,still);
 // Fan's hands and pivot are attached to the same pole, never a floating flag.
 var h=base.map(function(v,i){return v+p.axis[i]*.6;}),head=[base[0],base[1]-.15,base[2]+.2],hp=o.project.apply(null,head);
 if(hp){g.fillStyle='#d0aa8d';g.beginPath();g.arc(hp.x,hp.y,Math.max(2,.12*hp.olcek),0,Math.PI*2);g.fill();line(g,[head[0],head[1]-.1,head[2]],[head[0],head[1]-.8,head[2]],o.project,colors[o.id][1],Math.max(3,.18*hp.olcek));line(g,[head[0]-.17,head[1]-.35,head[2]],h,o.project,'#d0aa8d',2);line(g,[head[0]+.17,head[1]-.35,head[2]],base,o.project,'#d0aa8d',2);}
 line(g,base,p.end,o.project,'#a5adaf',2.5);line(g,base,p.end,o.project,'#d1d8d7',.8);
 triangles(g,mesh.pts,mesh.cols,mesh.rows,texture(o.id,o.image,o.makeCanvas,false),o.project);
 // Hanging banner has fixed upper corners, sag, free lower edge and shallow folds.
 var cols=20,rows=3,verts=[];
 for(var y=0;y<=rows;y++)for(var x=0;x<=cols;x++){var u=x/cols,v=y/rows,sag=.13*Math.sin(Math.PI*u),wave=.08*Math.sin(u*18-time*1.4)*Math.sin(Math.PI*u)*(v+.15);
  verts.push({u:u,v:v,p:[-4.5+9*u,4.15-.73*v-sag-.06*v*Math.sin(time*.9+u*9),o.D+10.5+wave]});}
 triangles(g,verts,cols,rows,texture(o.id,null,o.makeCanvas,true),o.project);
 [[-4.5,4.15,o.D+10.5],[4.5,4.15,o.D+10.5]].forEach(function(a){line(g,[a[0],a[1]+.30,a[2]+.12],a,o.project,'#d4c8ab',1);});
}

/* Tribün atmosferi (her karede, yalnız görüntü): üstte ve korkulukta flama dizileri,
 * seyircilerin elinde direkte dalgalanan bayraklar. Ekran uzayında, tribün bandının içinde. */
var BAYRAKLAR=[['tr'],['#c8102e','#f2f2f2'],['#f4c430','#1d3f86'],['#141414','#f2f2f2'],['#f4c430','#c8102e'],['#1d3f86','#f2f2f2'],['#7d1d24','#62a8e5'],['tr'],['#0f7a3b','#f2f2f2']];
var FLAMA=['#c8102e','#f2f2f2','#f4c430','#1d3f86','#f2f2f2','#141414'];
var bayrakCache={};
function bayrakDoku(i,makeCanvas){var k=i%BAYRAKLAR.length;if(bayrakCache[k])return bayrakCache[k];var w=96,h=60,c=makeCanvas(w,h),g=c.getContext('2d'),b=BAYRAKLAR[k];
 if(b[0]==='tr'){g.fillStyle='#e30a17';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();g.arc(h*.5,h*.5,h*.25,0,Math.PI*2);g.fill();g.fillStyle='#e30a17';g.beginPath();g.arc(h*.5+h*.0625,h*.5,h*.2,0,Math.PI*2);g.fill();
  g.fillStyle='#fff';g.beginPath();for(var j=0;j<10;j++){var r=j%2?h*.05:h*.125,a=-Math.PI/2+j*Math.PI/5;var x=h*.5+h*.3+r*Math.cos(a+Math.PI/2),y=h*.5+r*Math.sin(a+Math.PI/2);if(j)g.lineTo(x,y);else g.moveTo(x,y);}g.closePath();g.fill();}
 else if(k%3===0){for(var v=0;v<4;v++){g.fillStyle=b[v%2];g.fillRect(v*w/4,0,w/4+1,h);}}
 else if(k%3===1){g.fillStyle=b[0];g.fillRect(0,0,w,h/2+1);g.fillStyle=b[1];g.fillRect(0,h/2,w,h/2);}
 else{g.fillStyle=b[0];g.fillRect(0,0,w,h);g.fillStyle=b[1];g.beginPath();g.moveTo(0,h*.38);g.lineTo(w,h*.18);g.lineTo(w,h*.52);g.lineTo(0,h*.72);g.closePath();g.fill();}
 bayrakCache[k]=c;return c;}
function rastgele(seed){var x=seed>>>0||1;return function(){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%10000)/10000;};}
function flamaDizisi(g,W,y,sag,boy,t,durgun,kayma){
 var adim=boy*1.7,n=Math.ceil(W/adim)+2,dayanak=W/3;g.save();g.strokeStyle='rgba(225,225,215,.55)';g.lineWidth=1;g.beginPath();
 function ip(x){var u=((x%dayanak)+dayanak)%dayanak/dayanak;return y+sag*4*u*(1-u);}
 for(var x=0;x<=W;x+=4){if(x)g.lineTo(x,ip(x));else g.moveTo(x,ip(x));}g.stroke();
 for(var i=0;i<n;i++){var px=i*adim+kayma,py=ip(px),a=durgun?0:Math.sin(t*3.2+i*.8)*.32+Math.sin(t*6.4+i*1.9)*.08;
  g.save();g.translate(px,py);g.rotate(a);g.fillStyle=FLAMA[i%FLAMA.length];g.beginPath();g.moveTo(-boy*.55,0);g.lineTo(boy*.55,0);g.lineTo(0,boy*1.25);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(0,0);g.lineTo(boy*.55,0);g.lineTo(0,boy*1.25);g.closePath();g.fill();g.restore();}
 g.restore();}
function atmosfer(g,o){
 var W=o.W,ust=o.ust,alt=o.alt,hb=alt-ust;if(!(hb>20)||!o.makeCanvas)return;var durgun=reduced(),t=durgun?0:o.time,r=rastgele(97+Math.round(W));
 // direkli bayraklar: arka sıralar küçük, ön sıralar büyük
 var adet=Math.max(6,Math.min(14,Math.round(W/46))),liste=[];
 for(var i=0;i<adet;i++){var u=(i+.15+.7*r())/adet,derin=r();liste.push({i:i,x:u*W,yb:ust+hb*(.38+.52*derin),olcek:.65+.55*derin,faz:r()*6.28,yon:r()<.5?-1:1});}
 liste.sort(function(a,b){return a.yb-b.yb;});
 liste.forEach(function(f){
  var direk=hb*.36*f.olcek,a=durgun?0:Math.sin(t*1.9+f.faz)*.42+Math.sin(t*3.6+f.faz*2)*.10,tx=f.x+Math.sin(a)*direk,ty=f.yb-Math.cos(a)*direk;
  g.save();g.strokeStyle='#b9bdb9';g.lineWidth=Math.max(1,1.3*f.olcek);g.beginPath();g.moveTo(f.x,f.yb);g.lineTo(tx,ty);g.stroke();
  // taşıyan seyircinin kolları
  g.strokeStyle='#c9a284';g.lineWidth=Math.max(1,1.4*f.olcek);g.beginPath();g.moveTo(f.x-3*f.olcek,f.yb+5*f.olcek);g.lineTo(f.x+Math.sin(a)*direk*.12,f.yb-Math.cos(a)*direk*.12);g.moveTo(f.x+3*f.olcek,f.yb+5*f.olcek);g.lineTo(f.x+Math.sin(a)*direk*.25,f.yb-Math.cos(a)*direk*.25);g.stroke();
  var doku=bayrakDoku(f.i,o.makeCanvas),fw=direk*.95,fh=fw*.62,dilim=8,yon=f.yon*(Math.cos(a)>=0?1:-1);
  for(var k=0;k<dilim;k++){var u0=k/dilim,u1=(k+1)/dilim,dalga=function(u){return durgun?fh*.06*Math.sin(u*6):Math.sin(t*8.5-u*7+f.faz)*fh*.26*u+Math.sin(t*4.2-u*4)*fh*.09*u;};
   var x0=tx+yon*fw*u0,x1=tx+yon*fw*u1+yon*.6,y0=ty+dalga(u0)-a*fw*u0*.3,y1=ty+dalga(u1)-a*fw*u1*.3,egim=(y1-y0)/(fw/dilim);
   var sx=Math.floor(u0*doku.width),sw=Math.ceil(doku.width/dilim);
   g.save();g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x1,y1+fh*(1-.06*u1));g.lineTo(x0,y0+fh*(1-.06*u0));g.closePath();g.clip();
   g.drawImage(doku,sx,0,sw,doku.height,Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0)+1,fh+Math.abs(y1-y0));
   g.restore();
   var isik=Math.max(-.35,Math.min(.35,egim*.9));g.fillStyle=isik>0?'rgba(0,0,0,'+(.10+isik).toFixed(3)+')':'rgba(255,255,255,'+(-isik*.45).toFixed(3)+')';
   g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x1,y1+fh*(1-.06*u1));g.lineTo(x0,y0+fh*(1-.06*u0));g.closePath();g.fill();
  }
  g.restore();
 });
 // flamalar: tribün üstünde ve korkulukta
 var boy=Math.max(4,Math.min(10,hb*.075));
 flamaDizisi(g,W,ust+3,6,boy,t,durgun,0);
 flamaDizisi(g,W,alt-5,4,boy*.85,t+1.3,durgun,boy*.8);
}
D.tribun={draw:draw,atmosfer:atmosfer,pole:pole,newMesh:newMesh,advance:advance,slogans:slogans};
})(typeof globalThis!=='undefined'?globalThis:window);
