(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert'),C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root={DT:{}};vm.createContext(root);for(const f of ['veri','sevinc','lort-body','futbolcu3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),root);
const front=await C.loadImage(__dirname+'/../assets/sprites/lort_bekle.webp'),back=await C.loadImage(__dirname+'/../assets/sprites/lort_vurus1.webp');
let handBuilds=0;const handMesh=root.DT.lortBody.hands;root.DT.lortBody.hands=function(...a){handBuilds++;return handMesh(...a);};
let builds=0;const build=root.DT.lortBody.build;root.DT.lortBody.build=function(...a){builds++;return build(...a);};
for(const scale of [.24,.9])for(const yaw of [0,Math.PI/2,Math.PI,2.4])for(const elapsed of [0,.28,.44]){
 const cv=C.createCanvas(300,520),g=cv.getContext('2d');root.DT.futbolcu3d.draw(g,{id:'lort',front,back,makeCanvas:C.createCanvas,x:150,y:500,scale,yaw,shot:{elapsed,windup:.44}});
 const px=g.getImageData(0,0,300,520).data;let blue=0,skin=0;
 for(let j=0;j<px.length;j+=4)if(px[j+3]>200){if(px[j+2]>px[j]*1.3&&px[j+2]>px[j+1]*1.2)blue++;if(px[j]>px[j+2]*1.2&&px[j]>px[j+1])skin++;}
 assert(blue>1500*(scale/.9)**2,'shirt/shorts shell is visible from every angle');assert(skin>600*(scale/.9)**2,'body and head remain visible');
}
for(const variant of [0,1])for(const time of [0,.3,.7,1.2,1.7,2.5,3.5,4.5,5.5]){
 const cv=C.createCanvas(300,520),g=cv.getContext('2d');root.DT.futbolcu3d.draw(g,{id:'lort',front,back,makeCanvas:C.createCanvas,x:150,y:500,scale:.9,yaw:Math.PI,sevinc:{id:'lort',time,variant}});
 const px=g.getImageData(0,0,300,520).data;let visible=0;for(let i=3;i<px.length;i+=4)if(px[i]>200)visible++;assert(visible>10000,'3D celebration contains a complete body');
}
assert.equal(handBuilds,42,'actual renderer uses volumetric hands in every tested pose');
assert.equal(builds,42,'actual player renderer uses LORT body for every animated pose');
console.log('PASS actual LORT Canvas renderer: 2 sizes x 4 angles x 3 shot poses, visible kit/body, real texture assets, two 3D celebrations x 9 frames, no runtime errors');
})().catch(e=>{console.error(e);process.exit(1)});
