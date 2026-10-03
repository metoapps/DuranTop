/* Each wall player has the same geometry in drawing and contact tests. Units: metres. */
(function(root){'use strict';var D=root.DT,A=D.AYAR;
function kur(pos){var heights=pos.bx>0?[1.78,1.94,1.85,1.89]:[1.89,1.85,1.94,1.78];return heights.map(function(h,i){return {boy:h,off:(i-1.5)*.55,jump:i===1||i===2,v:i===1?2.6:2.35,start:.28+i*.035};});}
function durum(p,t){var u=t-p.start,j=p.jump&&u>0?Math.max(0,p.v*u-.5*A.yercekimi*u*u):0;return {boy:p.boy,off:p.off,y:j};}
function distance(px,py,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-a[0]-u*dx,py-a[1]-u*dy);}
function parcalar(p,t){var d=durum(p,t),scale=d.boy/1.92,rig=D.model3d.rig({x:d.off,y:d.y+1,poz:'bekle'},0);
 function point(n){return [d.off+(n[0]-d.off)*scale,d.y+(n[1]-d.y)*scale];}
 var shapes=rig.bones.map(function(b){return {a:point(rig.nodes[b[0]]),b:point(rig.nodes[b[1]]),r:b[2]*scale,ad:b[3]==='shorts'||b[3]==='socks'?'bacak':b[3]==='skin'?'kol':'gövde'};});
 shapes.push({a:point(rig.nodes.head),b:point(rig.nodes.head),r:.19*scale,ad:'baş'});return shapes;
}
function ilkTemas(b,path,R){for(var i=1;i<path.length;i++){var a=path[i-1],p=path[i];var da=(a.x-b.merkezX)*b.ux+(a.z-b.merkezZ)*b.uz,dp=(p.x-b.merkezX)*b.ux+(p.z-b.merkezZ)*b.uz;
 if(da>.22+R||dp<-.22-R)continue;
 // Subdivide the swept segment so a fast ball cannot jump through a limb.
 var steps=Math.max(1,Math.ceil(Math.hypot(p.x-a.x,p.y-a.y,p.z-a.z)/(R*.5)));
 for(var j=0;j<=steps;j++){var u=j/steps,t=a.t+(p.t-a.t)*u,x=a.x+(p.x-a.x)*u,y=a.y+(p.y-a.y)*u,z=a.z+(p.z-a.z)*u,depth=(x-b.merkezX)*b.ux+(z-b.merkezZ)*b.uz;if(Math.abs(depth)>.22+R)continue;
 var lateral=(x-b.merkezX)*b.px+(z-b.merkezZ)*b.pz;
 for(var n=0;n<b.oyuncular.length;n++){var shapes=parcalar(b.oyuncular[n],t);for(var k=0;k<shapes.length;k++){var s=shapes[k];if(distance(lateral,y,s.a,s.b)<=s.r+R)return {index:i,player:n,part:s.ad,t:t,x:x,y:y,z:z};}}
 }}return null;}
D.baraj={kur:kur,durum:durum,parcalar:parcalar,ilkTemas:ilkTemas};})(typeof globalThis!=='undefined'?globalThis:window);
