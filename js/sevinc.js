/* Cosmetic only: two celebrations per person. No score, seed or weekly rights. */
(function(root){'use strict';var D=root.DT;
var counts={},names={latte:'Bir yudum, bir gol',lort:'Gol otele yazıldı',josh:'Bu gol minik için',fero:'Lezzet tamam, rota hazır',meto:'Bu gol tribüne'};
function smooth(a,b,t){t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);}
function blend(a,b,u){return a.map(function(x,i){return x+(b[i]-x)*u;});}
function pose(id,t){
 t=Math.max(0,Number(t)||0);if(id!=='meto')t%=5.6;var inU=smooth(0,.5,t),beat=Math.sin(t*5),p={left:[-65,155,18],right:[65,155,18],feet:[[-24,8,0],[24,8,0]],shift:0,turn:0,prop:null,propAngle:0};
 if(id==='latte'){
  var sip=smooth(.7,1.5,t)*(1-smooth(2.1,2.7,t)),cheers=smooth(2.7,3.5,t)*(1-smooth(4.7,5.5,t));
  p.right=blend([67,210,35],[-38,316,45],sip);p.right=blend(p.right,[88,300,38],cheers);
  p.left=[-72,205,25];p.prop='latte';p.propAngle=-.28*sip+.06*Math.sin(t*7)*(1-sip);p.turn=.08*Math.sin(t*1.4);
 }else if(id==='lort'){
  var ring=smooth(.35,.8,t)*(1-smooth(1.25,1.7,t)),pocket=smooth(1.6,2.1,t)*(1-smooth(2.4,2.8,t)),horon=smooth(2.6,3.1,t)*(1-smooth(5.0,5.6,t));
  p.left=[-62,203,30];p.right=blend([67,194,35],[-26,204+9*Math.sin(t*15),56],ring);
  p.right=blend(p.right,[42,156,23],pocket);p.left=blend(p.left,[-110,272,12],horon);p.right=blend(p.right,[110,272,12],horon);
  p.feet[0]=[-24-8*horon*beat,8+12*horon*Math.max(0,beat),0];p.feet[1]=[24-8*horon*beat,8+12*horon*Math.max(0,-beat),0];
  p.shift=3*horon*Math.sin(t*10);p.prop=t<1.7?'bell':t<2.7?'coin':null;p.propAngle=ring;
 }else if(id==='josh'){
  var rock=smooth(.25,.9,t)*(1-smooth(4.3,5.5,t));p.left=[-26,202,55];p.right=[30,210,55];p.prop='baby';
  p.turn=.12*rock*Math.sin(t*2.5);p.shift=2*rock*Math.cos(t*5);p.propAngle=.12*rock*Math.sin(t*2.5);
 }else if(id==='fero'){
  var taste=smooth(.3,1,t)*(1-smooth(1.6,2.3,t)),travel=smooth(2.4,3.2,t);
  p.right=blend([70,210,35],[-24,310,48],taste);p.left=blend([-70,188,25],[-75,148,18],travel);
  p.right=blend(p.right,[90,274,18],travel);p.prop=t<2.5?'food':'suitcase';p.turn=.14*travel*Math.sin(t*2);
  p.feet[1][1]=8+Math.max(0,Math.sin(t*6))*8*travel;
 }else if(id==='meto'){
  // Badge touch -> grounded, open-arm salute -> turn to the stands -> relax.
  // No prop, repetitive flapping or bobbing. Both feet stay planted.
  var badge=smooth(.20,.65,t)*(1-smooth(.95,1.45,t)),eagle=smooth(1.15,2.35,t)*(1-smooth(4.45,5.75,t));
  p.left=blend([-65,155,18],[-158,260,8],eagle);
  p.right=blend([65,155,18],[-17,237,57],badge);p.right=blend(p.right,[158,260,8],eagle);
  p.feet=[[-26,8,0],[26,8,0]];p.shift=-2*smooth(.1,.5,t)*(1-smooth(1.0,1.8,t));
  p.turn=.32*smooth(1.5,2.65,t)-.60*smooth(3.1,4.15,t)+.28*smooth(4.5,5.7,t);
  p.prop=null;
 }
 p.left=blend([-65,155,18],p.left,inU);p.right=blend([65,155,18],p.right,inU);return p;
}
function next(id){var key='dt_cosmetic_celebrations',m=counts,n=0;try{var stored=JSON.parse(root.localStorage.getItem(key)||'null');if(stored&&typeof stored==='object'&&!Array.isArray(stored))m=stored;}catch(e){}n=Number(m[id]);if(!Number.isFinite(n)||n<0)n=0;var choice=n%2===0?1:0;m[id]=(n+1)%1000000;counts=m;try{root.localStorage.setItem(key,JSON.stringify(m));}catch(e){}return choice;}
function drawProp(g,project,p,r,id){
 var hand=p.prop==='bell'||p.prop==='food'||p.prop==='suitcase'?r.nodes.hl:r.nodes.hr;
 if(p.prop==='baby')hand=[0,213,64];
 var q=project(hand),above=project([hand[0],hand[1]+35,hand[2]]),scale=Math.max(.15,Math.hypot(q.x-above.x,q.y-above.y)/35);
 g.save();g.translate(q.x,q.y);g.scale(scale,scale);g.rotate(p.propAngle||0);g.lineWidth=2.4;g.strokeStyle='#f5e6c9';
 function ellipse(x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
 if(p.prop==='latte'){
  var glass=g.createLinearGradient(-15,0,16,0);glass.addColorStop(0,'rgba(222,251,255,.72)');glass.addColorStop(.35,'rgba(255,255,255,.14)');glass.addColorStop(1,'rgba(222,251,255,.70)');
  g.fillStyle='#cb9971';g.beginPath();g.moveTo(-16,-34);g.lineTo(16,-34);g.lineTo(12,10);g.lineTo(-12,10);g.closePath();g.fill();g.fillStyle=glass;g.fill();g.stroke();
  ellipse(0,-34,16,5,'#ead4b5');ellipse(0,-34,11,3,'#967251');g.strokeStyle='#20282c';g.lineWidth=3;g.beginPath();g.moveTo(7,-29);g.lineTo(12,-57);g.stroke();
  [[-7,-24],[4,-18],[-2,-9]].forEach(function(v){g.fillStyle='rgba(247,253,255,.54)';g.fillRect(v[0],v[1],7,7);});
 }else if(p.prop==='bell'){
  ellipse(0,11,31,7,'#242932');ellipse(0,5,25,20,'#d3b15e');ellipse(0,-12,6,4,'#f4db92');g.fillStyle='#e8d4a4';g.fillRect(-2,-18,4,8);
 }else if(p.prop==='coin'){ellipse(0,-10,12,12,'#d6b350');g.fillStyle='#523c15';g.font='bold 16px Arial';g.textAlign='center';g.fillText('₺',0,-4);
 }else if(p.prop==='baby'){
  ellipse(0,2,46,19,'#b0ccdf');ellipse(-32,-7,15,15,'#edc4a2');g.strokeStyle='#738ca2';g.beginPath();g.moveTo(-20,-10);g.quadraticCurveTo(6,21,39,4);g.stroke();
  g.strokeStyle='#785447';g.lineWidth=1.7;g.beginPath();g.moveTo(-38,-7);g.lineTo(-32,-6);g.moveTo(-27,-7);g.lineTo(-22,-6);g.stroke();
 }else if(p.prop==='food'){
  ellipse(0,5,35,10,'#e7eceb');ellipse(-6,-1,18,7,'#b1844d');ellipse(14,0,12,7,'#77a555');
  var h=project(r.nodes.hr);g.restore();g.save();g.translate(h.x,h.y);g.scale(scale,scale);ellipse(0,-6,10,9,'#bc8951');
 }else if(p.prop==='suitcase'){
  g.fillStyle='#95734a';g.fillRect(-27,8,52,64);g.strokeStyle='#e5cc98';g.strokeRect(-27,8,52,64);g.strokeRect(-9,-2,17,10);g.strokeRect(-15,14,28,51);ellipse(-16,77,5,5,'#171b21');ellipse(16,77,5,5,'#171b21');
 }else if(p.prop==='radio'){
  g.fillStyle='#263137';g.fillRect(-8,-28,18,39);g.strokeStyle='#d8ded9';g.strokeRect(-8,-28,18,39);g.fillStyle='#71ac86';g.fillRect(-4,-21,10,9);g.strokeStyle='#182228';g.lineWidth=3;g.beginPath();g.moveTo(6,-28);g.lineTo(7,-43);g.stroke();
 }
 g.restore();
}
function draw(g,o){
 if(!D.futbolcu3d||!o.front||!o.back)return false;
 if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)o=Object.assign({},o,{time:3.2});
 var p=pose(o.id,o.time),scale=o.height/471,yaw=Math.PI+p.turn;
 function project(v){var x=v[0]*Math.cos(yaw)+v[2]*Math.sin(yaw),z=-v[0]*Math.sin(yaw)+v[2]*Math.cos(yaw),s=900/(900+z);return{x:o.x+x*scale*s,y:o.y-v[1]*scale*s,d:900+z};}
 var r=D.futbolcu3d.draw(g,{id:o.id,front:o.front,back:o.back,makeCanvas:o.makeCanvas,x:o.x,y:o.y,scale:scale,yaw:yaw,sevinc:{id:o.id,time:o.time},project:function(v){var s=900/(900+v[2]);return{x:o.x+v[0]*scale*s,y:o.y-v[1]*scale*s,d:900+v[2]};}});
 if(p.prop)drawProp(g,project,p,r,o.id);
 g.save();g.textAlign='center';g.font='bold '+Math.max(11,Math.min(15,o.height*.055))+'px Arial';g.fillStyle='#f5e8ca';g.shadowColor='#000';g.shadowBlur=3;g.fillText(names[o.id]||'',o.x,o.y+22);g.restore();return true;
}
D.sevinc={pose:pose,next:next,draw:draw,names:names};
})(typeof globalThis!=='undefined'?globalThis:window);
