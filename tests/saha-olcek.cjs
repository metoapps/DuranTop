const fs=require('fs'),vm=require('vm'),assert=require('assert'),root={DT:{}};vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/futbolcu3d.js','utf8'),root);const D=root.DT.futbolcu3d;
assert(Math.abs(463*D.UNIT-1.80)<1e-12,'player is 1.80m in the same pitch units as ball/goal');
const positions=[{bx:0,D:11},{bx:5,D:Math.sqrt(299)},{bx:-5,D:Math.sqrt(299)},{bx:7,D:Math.sqrt(735)},{bx:-7,D:Math.sqrt(735)},{bx:0,D:28}];
function world(P,v){let c=Math.cos(P.yaw),s=Math.sin(P.yaw);return [P.point[0]+(v[0]*c+v[2]*s)*D.UNIT,(v[1]-8)*D.UNIT,P.point[1]+(-v[0]*s+v[2]*c)*D.UNIT];}
let worst=0;
for(const pos of positions)for(const from of [-1,0,1])for(const to of [-1,0,1]){
 let previous;for(let i=0;i<=200;i++){let u=i/200,o={direction:to,walk:{from,to,u}},P=D.placement(pos,o),R=D.rig({...o,gait:P.gait}),feet=['fl','fr'].map(k=>world(P,R.nodes[k]));
  assert(P.point[1]<0,'preparation remains behind the ball');if(u===0)assert(Math.abs(P.yaw-(Math.atan2(-pos.bx,pos.D)+from*.40))<1e-12,'walk starts at the old stance yaw');if(u===1)assert(Math.abs(P.yaw-(Math.atan2(-pos.bx,pos.D)+to*.40))<1e-12,'walk ends at the new stance yaw');   // ara yaw artık dön–yürü–dön: tests/yuruyus-donus.cjs
  if(previous)for(let j=0;j<2;j++)if(feet[j][1]<1e-8&&previous[j][1]<1e-8)worst=Math.max(worst,Math.hypot(...feet[j].map((x,k)=>x-previous[j][k])));
  previous=feet;
 }
 const first=D.placement(pos,{direction:to,walk:{from,to,u:0}}),last=D.placement(pos,{direction:to,walk:{from,to,u:1}}),idle=D.placement(pos,{direction:to});
 assert(Math.hypot(...last.point.map((x,j)=>x-idle.point[j]))<1e-12,'end of walking persists into idle');
 assert(Math.abs(Math.hypot(...last.point.map((x,j)=>x-first.point[j]))-Math.abs(to-from)*.35)<1e-10,'actual body displacement, not in-place stepping');
 for(const dir of [-1,0,1]){let shot={elapsed:1.15,windup:1.15},P=D.placement(pos,{direction:dir,shot}),R=D.rig({direction:dir,shot,kick:P.kick}),foot=world(P,R.nodes.fr);const toe=world(P,[R.nodes.fr[0],R.nodes.fr[1]-1,R.nodes.fr[2]+44]);assert(Math.abs(toe[1]-.11)<1e-8,'toe at ball height');assert(Math.abs(Math.hypot(toe[0]-pos.bx,toe[2])-.11)<1e-8,'toe touches rear sphere, ankle stays outside');}
}
assert(worst<1e-8,'support foot stays still on the pitch throughout walking');
console.log('PASS SI height, 54 stance paths, persistent translation, stationary support feet, actual kick contact; max support drift '+worst.toExponential(2)+' m');
