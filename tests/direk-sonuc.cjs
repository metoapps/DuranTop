// Real rebound physics through the game loop, not a mocked terminal result.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const C=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const elements={},memory={},sounds=[];let now=400,drawn;
function el(id){return elements[id]||(elements[id]={style:{},hidden:false,classList:{toggle(){}},children:[],appendChild(x){this.children.push(x)},addEventListener(){},getContext(){return C.createCanvas(220,220).getContext('2d')},getBoundingClientRect(){return {left:0,top:0,width:390,height:844}}});}
const root={document:{readyState:'loading',getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}},performance:{now:()=>now},URLSearchParams,location:{search:''},navigator:{},requestAnimationFrame(f){root.frame=f},localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v,removeItem:k=>delete memory[k]}};
vm.createContext(root);for(const n of ['ayar','veri','model3d','baraj','kaleci','ucus','fizik','puan','oyun'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);
let fixtureSeed=8;const D=root.DT;D.cizim={kur(){},sahneKur(){},hazir:()=>true,ciz(x){drawn=x},boyut:()=>({w:390,h:844})};D.ses={ayarla(){},cal(x){sounds.push(x)}};D.oyun.baslat();const d=D.oyun._durum;
function input(x){return {pos:D.AYAR.pozisyonlar[0],aim:{x,y:1},contact:{x:0,y:0},guc:1,zaman:.5,seed:fixtureSeed,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:true};}
function shoot(x){now=400;Object.assign(d,{ekran:'oyun',mod:'antrenman',faz:'nisan',idx:0,sonuclar:[],pos:D.AYAR.pozisyonlar[0],aim:{x,y:1},seed:fixtureSeed,kilit:true,guc:1,gucHazir:true,temasHazir:true,durusHazir:true,contact:{x:0,y:0},cubukBasla:0});D.oyun._vur();assert.equal(d.faz,'vurus');return D.fizik.hesapla(input(x));}
function frame(t){now=d.an.t0+1000*(d.an.on+t);root.frame();}
for(fixtureSeed=1;fixtureSeed<100;fixtureSeed++)if(D.fizik.hesapla(input(3.68)).sonuc==='direk_disari')break;assert(fixtureSeed<100);const miss=shoot(3.68);assert.equal(miss.sonuc,'direk_disari');assert(miss.yol.at(-1).t-miss.direkTemas.t>8,'reproduce long rolling rebound');
frame(-.02);assert.equal(drawn.top.z,0);assert(Math.abs(drawn.kaleci.x)>0,'pre-kick commitment is actually rendered before the ball leaves');
frame(miss.direkTemas.t+1.3);assert.equal(d.faz,'vurus','show the rebound before the result');
frame(miss.direkTemas.t+1.41);assert.equal(d.faz,'sonuc','miss shown without waiting nine seconds');assert.equal(el('sonucPuan').textContent,'0 puan');assert.equal(d.sonuclar.length,1);assert.equal(sounds.filter(x=>x==='direk').length,1);assert.equal(sounds.filter(x=>x==='ah').length,1);
const before=JSON.stringify(drawn.top);frame(miss.direkTemas.t+1.8);assert.notEqual(JSON.stringify(drawn.top),before,'ball keeps moving behind result card');frame(12);assert.equal(d.sonuclar.length,1,'no duplicate result');assert.equal(d.sonuclar[0].gol,false);
let goalX;for(let x=3.4;x<3.9;x+=.005)if(D.fizik.hesapla(input(x)).sonuc==='direk_gol'){goalX=x;break;}assert(goalX!==undefined,'genuine post goal fixture');
const goal=shoot(goalX);frame(goal.yol.at(-1).t+.29);assert.equal(d.faz,'vurus','a post goal keeps its full crossing/net animation');frame(goal.yol.at(-1).t+.31);assert.equal(d.faz,'sonuc');assert.equal(d.sonuclar.length,1);assert.equal(d.sonuclar[0].gol,true);assert(D.puan.puanla('penalti',goal).puan>0);
console.log('PASS real 9.6s post rebound: result after 1.4s, ball continues, one zero-score result/sound; actual post goal preserved');
