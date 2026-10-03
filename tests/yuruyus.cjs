const fs=require('fs'),vm=require('vm'),assert=require('assert'),root={DT:{}};vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/model3d.js','utf8'),root);const D=root.DT;
for(const id of ['meto','lort','fero','latte','josh'])for(const to of [-1,0,1]){
const a=D.model3d.walkingJoints({from:0,to,u:.375},id,70*to),b=D.model3d.walkingJoints({from:0,to,u:.625},id,70*to);
assert(a.nodes[2][1]<a.nodes[5][1]-25,'left foot lifts');assert(b.nodes[5][1]<b.nodes[2][1]-25,'right foot lifts');assert(a.nodes[1][1]!==b.nodes[1][1],'left knee bends');assert(a.nodes[4][1]!==b.nodes[4][1],'right knee bends');
for(const u of [0,1]){const p=D.model3d.walkingJoints({from:0,to,u},id,70*to);assert.deepEqual(p.nodes,p.bind,'no pose jump at endpoints');}}
console.log('PASS five characters, three directions: alternating foot lift/support, knee bends, continuous start/end pose');
