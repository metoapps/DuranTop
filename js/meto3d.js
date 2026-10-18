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
/* MIXAMO SEVİNCİ (breakdance): ayrı küçük paket (≈270 KB). Geometri/doku aynı model.bin; pakette yalnız 4-kemik ağırlıkları ve 30 kare/sn kemik kareleri var.
 * Meto modeli hazır olunca arka planda yüklenir; hazır değilse sevinç 0 (yumruk) oynar. Vuruş, fizik, kural DEĞİŞMEZ (yalnız görsel). */
/* Mixamo sevinçleri: sevinç numarası -> paket adı. 3: breakdance, 4: flying kick (20261025a). Her paket ayrı yüklenir; hazır değilse sevinç 0 oynar. */
var DANS_SURUM='20261025a',DANSLAR={3:'breakdance',4:'flyingkick'},dansDurum={};
function dansNesne(ad){return dansDurum[ad]||(dansDurum[ad]={ad:ad,status:'idle',error:null,meta:null,bin:null,promise:null});}
var dans=dansNesne('breakdance');
function loadDans(ad){
 var dans=dansNesne(ad||'breakdance');
 if(dans.promise)return dans.promise;if(!root.fetch||!model)return Promise.resolve(false);dans.status='loading';
 return dans.promise=Promise.all([fetch('assets/meto3d/sevinc-'+dans.ad+'.json?v='+DANS_SURUM).then(check).then(r=>r.json()),fetch('assets/meto3d/sevinc-'+dans.ad+'.bin?v='+DANS_SURUM).then(check).then(r=>r.arrayBuffer())]).then(function(pair){
  var m=pair[0],bin=pair[1];if(bin.byteLength!==m.binaryBytes)throw Error('Incomplete Meto dance');
  if(m.skinVertices.length!==model.meta.meshes.length||m.skinVertices.some((n,i)=>n!==model.meta.meshes[i].vertices))throw Error('Meto dance mesh mismatch');
  dans.meta=m;dans.bin=bin;dans.frames=new Float32Array(bin,m.frameOffset,m.frames*m.frameStride);dans.status='ready';return true;
 }).catch(function(e){dans.status='error';dans.error=String(e.message||e);console.warn('Meto dance '+dans.ad+':',dans.error);return false;});
}
/* Kare örnekleme: kemik başına dördey nlerp; kalça dünya dönüşü + öteleme, diğer kemikler ebeveyne göre eklem etrafında döner (ara karelerde uzuv kopmaz).
 * Bitince 0.5 sn'de ilk kareye yumuşakça döner ve baştan oynar (sonuç ekranı dokunuşa kadar açık kalır). */
var DANS_GECIS=.5;
function mat4mul(a,b){var o=new Array(16);for(var c=0;c<4;c++)for(var r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
function dansPose(t,M,frames){
 M=M||dans.meta;frames=frames||dans.frames;var B=M.bones.length,S=M.frameStride,dur=M.duration,hold=M.hold||0,cyc=dur+hold+DANS_GECIS;t=Math.max(0,Number(t)||0)%cyc;
 // hold: hareket bitince son karede bekleme (flying kick yere iner ve durur), sonra başa yumuşak dönüş
 var a,b,u;if(t<=dur){var f=Math.min(t*M.fps,M.frames-1-1e-6);a=Math.floor(f);b=a+1;u=f-a;}else if(t<=dur+hold){a=b=M.frames-1;u=0;}else{a=M.frames-1;b=0;u=(t-dur-hold)/DANS_GECIS;u=u*u*(3-2*u);}
 var bones=new Float32Array(B*16),joints=[],world=[];
 for(var k=0;k<B;k++){var o1=a*S+k*7,o2=b*S+k*7,sg=frames[o1]*frames[o2]+frames[o1+1]*frames[o2+1]+frames[o1+2]*frames[o2+2]+frames[o1+3]*frames[o2+3]<0?-1:1,q=[0,1,2,3].map(i=>frames[o1+i]*(1-u)+sg*frames[o2+i]*u),n=Math.hypot(q[0],q[1],q[2],q[3])||1,x=q[0]/n,y=q[1]/n,z=q[2]/n,w=q[3]/n,j=M.joints[k];
  var m=[1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),0,2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),0,2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y),0,0,0,0,1],p=M.parents[k];
  if(p<0){m[12]=frames[o1+4]*(1-u)+frames[o2+4]*u;m[13]=frames[o1+5]*(1-u)+frames[o2+5]*u;m[14]=frames[o1+6]*(1-u)+frames[o2+6]*u;}
  else{m[12]=j[0]-(m[0]*j[0]+m[4]*j[1]+m[8]*j[2]);m[13]=j[1]-(m[1]*j[0]+m[5]*j[1]+m[9]*j[2]);m[14]=j[2]-(m[2]*j[0]+m[6]*j[1]+m[10]*j[2]);m=mat4mul(world[p],m);}
  world[k]=m;bones.set(m,k*16);joints.push([m[0]*j[0]+m[4]*j[1]+m[8]*j[2]+m[12],m[1]*j[0]+m[5]*j[1]+m[9]*j[2]+m[13],m[2]*j[0]+m[6]*j[1]+m[10]*j[2]+m[14]]);}
 return{bones:bones,joints:joints};
}

function ik(a,b,L1,L2,pole){var axis=unit(sub(b,a)),d=clamp(len(sub(b,a)),.001,L1+L2-.001),x=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-x*x)),hint=pole||[0,0,1],perp=sub(hint,mul(axis,dot(hint,axis)));perp=len(perp)<1e-3?unit(cross(axis,[0,1,0])):unit(perp);return add(add(a,mul(axis,x)),mul(perp,h));}
/* ANATOMİK KOL ÇÖZÜCÜ: dirsek yalnız tek eksende, yalnız ÖNE doğru bükülür (kol geriye katlanamaz); bükülme 10°–140° ile sınırlıdır (insanda ≈0–145°); omuz, kolu yatayın en çok ≈15° üstüne kaldırır (koşu/vuruşta kol baş üstüne sarkmaz).
 * Hedef el konumu bu sınırlara çekilir; kemik boyları sabit kalır. Dirsek, omuz–el doğrusunun ARKASINA/AŞAĞISINA/DIŞINA düşer (kuş kanadı gibi değil, insan gibi). */
var ELB_MIN=10,ELB_MAX=140,OMUZ_MAX=105;
function solveArm(shoulder,target,side,L1,L2){
 var v=sub(target,shoulder),dist=len(v),dir=dist<1e-6?[0,-1,0]:mul(v,1/dist),lim=function(b){return Math.sqrt(L1*L1+L2*L2+2*L1*L2*Math.cos(b*Math.PI/180));};
 var up=Math.cos((180-OMUZ_MAX)*Math.PI/180);   // dir[1] üst sınırı: omuz-kol açısı (aşağıdan) ≤ 105°
 if(dir[1]>up){var xz=Math.hypot(dir[0],dir[2])||1,k=Math.sqrt(Math.max(0,1-up*up))/xz;dir=[dir[0]*k,up,dir[2]*k];}
 var d=clamp(dist,lim(ELB_MAX),lim(ELB_MIN)),hand=add(shoulder,mul(dir,d)),elbow=ik(shoulder,hand,L1,L2,[side*.14,-.6,-1]);
 // Omuz hareket aralığı: üst kol geriye en çok ≈55° uzanır, gövdeyi çaprazlamaz, yatayın ≈15° üstüne çıkmaz. Aşılırsa üst kol sınıra çekilir; dirsek bükümü ve bükülme düzlemi korunur.
 var u0=unit(sub(elbow,shoulder)),f0=unit(sub(hand,elbow)),th=Math.acos(clamp(dot(u0,f0),-1,1)),h0=sub(f0,mul(u0,dot(u0,f0))),u1=limitUpper(u0,side);
 if(len(sub(u1,u0))>1e-4){h0=len(h0)<1e-4?[0,-.5,-1]:h0;var h1=sub(h0,mul(u1,dot(u1,h0)));h1=len(h1)<1e-4?unit(cross(u1,[1,0,0])):unit(h1);var f1=add(mul(u1,Math.cos(th)),mul(h1,Math.sin(th)));elbow=add(shoulder,mul(u1,L1));hand=add(elbow,mul(f1,L2));}
 return{elbow:elbow,hand:hand};
}
var EKS_Z=-Math.sin(55*Math.PI/180),ADD_X=-.15,YUK_Y=Math.cos((180-OMUZ_MAX)*Math.PI/180);
function limitUpper(u,side){u=unit(u);
 // Öncelik sırası: gövdeyi çaprazlama (yumuşak) → yükselme → GERİ UZANMA (en katı, son uygulanır: üst kol hiçbir durumda ≈55°'den fazla geriye gitmez)
 for(var k=0;k<4;k++){
  if(side*u[0]<ADD_X){var yz=Math.hypot(u[1],u[2])||1,q2=Math.sqrt(1-ADD_X*ADD_X)/yz;u=[side*ADD_X,u[1]*q2,u[2]*q2];}
  if(u[1]>YUK_Y){var xz=Math.hypot(u[0],u[2])||1,q3=Math.sqrt(1-YUK_Y*YUK_Y)/xz;u=[u[0]*q3,YUK_Y,u[2]*q3];}
  if(u[2]<EKS_Z){var xy=Math.hypot(u[0],u[1])||1,q=Math.sqrt(1-EKS_Z*EKS_Z)/xy;u=[u[0]*q,u[1]*q,EKS_Z];}
 }
 // Son kesin kısıt: hem geri uzanma hem yükselme sınırı birlikte tutulur (artık yön dışa açık-geride kalır; kol yukarı-geri "kanat" gibi savrulamaz).
 var zz=Math.max(u[2],EKS_Z),yy=Math.min(u[1],YUK_Y);if(zz!==u[2]||yy!==u[1]){var xx=Math.sqrt(Math.max(0,1-zz*zz-yy*yy));return[side*xx,yy,zz];}return unit(u);}
function bendNormal(s,e,h){var n=cross(sub(e,s),sub(h,e));return len(n)<1e-6?[1,0,0]:unit(n);}
/* METO SEVİNCİ: üç tam-beden sevinç (dönüşümlü). Eskiden yalnız kollar oynuyor, ayaklar ve gövde sabit duruyordu ("put gibi").
 * Şimdi: çömelip zıplama, ayakların yerden kalkması (dizler bükülür), gövde eğimi/yalpası, baş geri atma, yumruk ve kol hareketleri; bittikten sonra nefes/ağırlık aktarma ile CANLI bekleme.
 * Dönen: arms (omuz/dirsek açıları), body (m cinsinden lift/shift, lean/roll/headBack radyan, footL/footR m), turn (gövde yönü). Kollar armAnatomy ile üretilir (pozitif dirsek bükümü). */
function celebration(t,variant){
 t=Math.max(0,Number(t)||0);variant=((variant||0)%3+3)%3;
 function ease(a,b){var q=clamp((t-a)/(b-a),0,1);return q*q*(3-2*q);}
 function pulse(a,b){var q=clamp((t-a)/(b-a),0,1);return Math.sin(Math.PI*q);}
 function mix(a,b,u){return{abduction:a.abduction+(b.abduction-a.abduction)*u,flex:a.flex+(b.flex-a.flex)*u,elbow:a.elbow+(b.elbow-a.elbow)*u,bendUp:(a.bendUp||0)+((b.bendUp||0)-(a.bendUp||0))*u};}
 var rest={abduction:10,flex:5,elbow:20,bendUp:0},fade=ease(.1,.4)*(1-ease(4.7,5.5)),idle=1-fade;
 var L=rest,R=rest,body={lift:0,shift:0,lean:0,roll:0,headBack:0,footL:0,footR:0},turn=0;
 if(variant===0){   // YUMRUK: iki çömelip-zıplama, sağ yumruk havada, sol el rozete
  var C=Math.max(pulse(.10,.32),pulse(.95,1.17),pulse(1.80,2.02)),J=Math.max(pulse(.32,.82),pulse(1.17,1.67),pulse(2.02,2.52)),pump=ease(.28,.72)*(1-ease(4.2,4.9));   // yumruk yumuşakça kalkar ve sevinç boyunca havada kalır
  body.lift=.22*J-.05*C;body.lean=.16*C-.12*J;body.shift=.02*Math.sin(t*2.2)*fade;body.headBack=-.35*Math.max(J,pump*.7);
  R=mix(rest,{abduction:14,flex:158,elbow:110,bendUp:0},pump);L=mix(rest,{abduction:22,flex:30,elbow:105,bendUp:0},ease(1.7,2.3)*(1-ease(4.0,4.6)));L=mix(L,{abduction:35,flex:60,elbow:70,bendUp:0},J*.6);
  turn=.18*Math.sin(t*1.4)*fade;
 }else if(variant===1){   // UÇAK: kollar açık, sağa-sola yatarak adım adım sekme
  var h=ease(.15,.55)*(1-ease(3.9,4.8)),w=t*6.4,bank=Math.sin(t*2.2);
  var open={abduction:78,flex:2,elbow:16,bendUp:0};L=mix(rest,{abduction:78+7*Math.sin(w),flex:2,elbow:16,bendUp:0},h);R=mix(rest,{abduction:78+7*Math.sin(w+Math.PI),flex:2,elbow:16,bendUp:0},h);
  body.footL=Math.max(0,Math.sin(w))*.10*h;body.footR=Math.max(0,-Math.sin(w))*.10*h;body.lift=.025*Math.abs(Math.sin(w))*h;body.shift=.045*bank*h;body.roll=.20*bank*h;body.lean=.10*h;
  turn=.34*Math.sin(t*1.5)*h;
 }else{   // ÇIĞLIK: üç güçlü zıplama, kollar V, baş geride; sonra kollar yukarıda sekme
  var C2=Math.max(pulse(.18,.40),pulse(1.02,1.24),pulse(1.86,2.08)),J2=Math.max(pulse(.40,.90),pulse(1.24,1.74),pulse(2.08,2.58)),after=ease(2.5,2.9)*(1-ease(4.3,4.9)),armsRise=ease(.30,.76)*(1-ease(4.3,4.9)),bounce=Math.abs(Math.sin(t*5.5));
  body.lift=.24*J2-.055*C2+.03*bounce*after;body.lean=.18*C2-.14*J2-.06*after;body.headBack=-.42*Math.max(J2,after);body.footL=body.footR=Math.max(0,body.lift)*.95;
  var up={abduction:150,flex:6,elbow:28,bendUp:0},bi={abduction:70,flex:14,elbow:105,bendUp:1},armsU=armsRise,biP=Math.max(pulse(.04,.52),pulse(.88,1.34),pulse(1.72,2.18))*.9;
  L=mix(mix(rest,bi,biP),up,armsU);R=mix(mix(rest,bi,biP),up,armsU);turn=.10*Math.sin(t*1.8)*fade;
 }
 if(variant===0){body.footL=body.footR=Math.max(0,body.lift)*.95;}
 // canlı bekleme (heykel gibi durmasın): nefes, ağırlık aktarma, küçük kol salınımı, baş hafif döner
 body.lift+=idle*.004*Math.sin(t*1.9);body.shift+=idle*.014*Math.sin(t*.75);body.roll+=idle*.025*Math.sin(t*.75);turn+=idle*.06*Math.sin(t*.6);
 L=mix(L,{abduction:rest.abduction+3*Math.sin(t*1.3),flex:rest.flex+5*Math.sin(t*1.3),elbow:rest.elbow,bendUp:0},idle*.5);R=mix(R,{abduction:rest.abduction+3*Math.sin(t*1.3+3),flex:rest.flex+5*Math.sin(t*1.3+3),elbow:rest.elbow,bendUp:0},idle*.5);
 return{arms:[L,R],body:body,turn:turn,variant:variant};
}
function armAnatomy(shoulder,side,upper,lower,angles){
 var a=angles.abduction*Math.PI/180,f=angles.flex*Math.PI/180,b=angles.elbow*Math.PI/180;
 var u=[side*Math.sin(a),-Math.cos(a)*Math.cos(f),Math.cos(a)*Math.sin(f)],front=unit([0,angles.bendUp||0,1-(angles.bendUp||0)]),hinge=unit(sub(front,mul(u,dot(front,u))));
 var fore=add(mul(u,Math.cos(b)),mul(hinge,Math.sin(b))),elbow=add(shoulder,mul(u,upper));return{elbow:elbow,hand:add(elbow,mul(fore,lower))};
}
function rotAbout(pt,pivot,axis,ang){var v=sub(pt,pivot),c=Math.cos(ang),sn=Math.sin(ang);if(axis==='x')return add(pivot,[v[0],v[1]*c-v[2]*sn,v[1]*sn+v[2]*c]);return add(pivot,[v[0]*c-v[1]*sn,v[0]*sn+v[1]*c,v[2]]);}
/* Sevinç gövde dönüşümü: üst gövde (göğüs, boyun, baş, omuzlar) kalçadan öne eğilir/yana yatar; baş boyundan geri atılır; tüm gövde zıplayıp yana kayar. Kemik boyları DEĞİŞMEZ (döndürme + öteleme). */
function applyBody(p,bd,meta){
 var U=1/(meta.unit_m||.00408),hip=p.hip;
 ['chest','neck','head','sl','sr'].forEach(function(k){var q=p[k];if(bd.lean)q=rotAbout(q,hip,'x',bd.lean);if(bd.roll)q=rotAbout(q,hip,'z',bd.roll);p[k]=q;});
 if(bd.headBack){var neck=p.neck;p.head=rotAbout(p.head,neck,'x',bd.headBack);}
 var off=[bd.shift*U,bd.lift*U,0];['hip','chest','neck','head','sl','sr'].forEach(function(k){p[k]=add(p[k],off);});
}
function pose(r,meta){
 var b=meta.rest,n=r.nodes,neutral=D.futbolcu3d.rig({direction:0}).nodes,p={};
 ['hip','chest','neck','head','sl','sr'].forEach(k=>p[k]=add(b[k],mul(sub(n[k],neutral[k]),.94)));
 // Keep the reconstructed face rigid; its orientation follows the upper spine.
 var headAxis=add(sub(b.head,b.neck),mul(sub(sub(n.head,n.neck),sub(neutral.head,neutral.neck)),.4));p.head=add(p.neck,mul(unit(headAxis),len(sub(b.head,b.neck))));
 var celeb=r.celebration?celebration(r.celebration.time,r.celebration.variant):null;
 if(celeb)applyBody(p,celeb.body,meta);
 ['l','r'].forEach(function(s,i){
  p['hip'+s]=add(b['hip'+s],sub(p.hip,b.hip));
  var shoulder=p['s'+s],upper=len(sub(b['e'+s],b['s'+s])),lower=len(sub(b['h'+s],b['e'+s]));
  if(r.celebration){var arm=armAnatomy(shoulder,i?1:-1,upper,lower,celeb.arms[i]);p['e'+s]=arm.elbow;p['h'+s]=arm.hand;}
  else{var reach=(upper+lower)/((len(sub(neutral['e'+s],neutral['s'+s]))+len(sub(neutral['h'+s],neutral['e'+s])))||1),arm=solveArm(shoulder,add(shoulder,mul(sub(n['h'+s],n['s'+s]),reach)),i?1:-1,upper,lower);p['e'+s]=arm.elbow;p['h'+s]=arm.hand;}
  // Rig feet describe sole/contact anchors; anatomical ankle is 18 units higher.
  p['f'+s]=add(n['f'+s],[0,b['f'+s][1]-8,0]);if(celeb){var U=1/(meta.unit_m||.00408),air=clamp(celeb.body.lift/.03,0,1);p['f'+s]=add(p['f'+s],[celeb.body.shift*U*air,(i?celeb.body.footR:celeb.body.footL)*U,0]);}
  var h=p['hip'+s],foot=p['f'+s],L1=len(sub(b['k'+s],b['hip'+s])),L2=len(sub(b['f'+s],b['k'+s]));
  p['k'+s]=ik(h,foot,L1,L2);
 });return p;
}
// Column-major affine transform between bind and posed bone segments.
function boneMatrix(a,b,c,d,stable){
 var u=unit(sub(b,a)),v=unit(sub(d,c)),axis=cross(u,v),co=clamp(dot(u,v),-1,1),si=len(axis),R;
 if(si<1e-6){if(co>0)R=[1,0,0,0,1,0,0,0,1];else{axis=unit(cross(u,Math.abs(u[0])<.8?[1,0,0]:[0,1,0]));R=Array.from({length:9},(_,k)=>2*axis[Math.floor(k/3)]*axis[k%3]-(Math.floor(k/3)===k%3?1:0));}}
 else{axis=mul(axis,1/si);var x=axis[0],y=axis[1],z=axis[2],t=1-co;R=[co+x*x*t,x*y*t-z*si,x*z*t+y*si,y*x*t+z*si,co+y*y*t,y*z*t-x*si,z*x*t-y*si,z*y*t+x*si,co+z*z*t];}
 if(stable&&stable.nb){
  // Kol kemikleri: dönüş çerçevesi dirsek BÜKÜLME DÜZLEMİNİN normaline (üst kol × önkol) bağlanır. Üst kol, önkol ve el aynı düzlemi paylaşır: kol kendi ekseni etrafında
  // dünya yönüne göre savrulmaz/burulmaz ("ters dönen kol" ve şekerlik burulması olmaz).
  function basis(axis,nrm){var zz=sub(nrm,mul(axis,dot(nrm,axis)));zz=len(zz)<.05?unit(cross(axis,Math.abs(axis[0])<.8?[1,0,0]:[0,1,0])):unit(zz);return[axis,zz,unit(cross(axis,zz))];}
  var A=basis(u,stable.nb),B=basis(v,stable.np);R=Array.from({length:9},(_,k)=>{var row=Math.floor(k/3),col=k%3;return B.reduce((sum,bb,j)=>sum+bb[row]*A[j][col],0);});
 }
 var stretch=clamp(len(sub(d,c))/(len(sub(b,a))||1),.65,1.45),A2=[];
 for(var row=0;row<3;row++)for(var col=0;col<3;col++)A2[row*3+col]=R[row*3+col]+(stretch-1)*v[row]*u[col];
 var tr=c.map((q,j)=>q-dot(A2.slice(j*3,j*3+3),a));return[A2[0],A2[3],A2[6],0,A2[1],A2[4],A2[7],0,A2[2],A2[5],A2[8],0,tr[0],tr[1],tr[2],1];
}
function matrices(r,meta){var p=pose(r,meta),b=meta.rest,all=[];meta.bones.forEach((pair,i)=>{var a=pair[0],z=pair[1],end=p[z];
 if(i===10||i===13){var angle=r.ayak[i===10?0:1],v=sub(b[z],b[a]),cr=Math.cos(angle.roll),sr=Math.sin(angle.roll),cp=Math.cos(angle.pitch),sp=Math.sin(angle.pitch),cy=Math.cos(angle.yaw),sy=Math.sin(angle.yaw),x=v[0]*cr-v[1]*sr,y=v[0]*sr+v[1]*cr,zz=v[2],yy=y*cp-zz*sp,z2=y*sp+zz*cp;end=add(p[a],[x*cy+z2*sy,yy,-x*sy+z2*cy]);}
 var kol=i>=2&&i<=7?(i<5?'l':'r'):null,fr=kol?{nb:bendNormal(b['s'+kol],b['e'+kol],b['h'+kol]),np:bendNormal(p['s'+kol],p['e'+kol],p['h'+kol])}:false;all.push.apply(all,boneMatrix(b[a],b[z],p[a],end,fr));});return new Float32Array(all);}
function createRenderer(data){
 var canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');if(!gl.getExtension('OES_element_index_uint'))throw Error('32 bit mesh indices unavailable');
 var lost=false;canvas.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true;state.status='context-lost';});canvas.addEventListener('webglcontextrestored',function(){renderer=createRenderer(model);state.status='ready';});
 function vertexShader(dance){return'precision highp float;attribute vec3 aP,aN,aC;attribute vec2 aUV;'+(dance?'attribute vec4 aJ4,aW4;uniform mat4 uB['+dance+'];':'attribute vec2 aJ,aW;uniform mat4 uB[14];')+'uniform vec4 uPX,uPY,uPD;uniform vec2 uSize,uDepth;uniform vec2 uOrigin;uniform float uYaw;varying vec2 vUV;varying vec3 vC;varying float vL,vD;void main(){mat4 m='+(dance?'uB[int(aJ4.x)]*aW4.x+uB[int(aJ4.y)]*aW4.y+uB[int(aJ4.z)]*aW4.z+uB[int(aJ4.w)]*aW4.w':'uB[int(aJ.x)]*aW.x+uB[int(aJ.y)]*aW.y')+';vec3 p=(m*vec4(aP,1.)).xyz;vec3 n=normalize(mat3(m)*aN);float c=cos(uYaw),s=sin(uYaw);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);n=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);vec4 q=vec4(p,1.);float d=dot(uPD,q);float x=dot(uPX,q),y=dot(uPY,q);gl_Position=vec4(2.*(x-uOrigin.x*d)/uSize.x-d,d-2.*(y-uOrigin.y*d)/uSize.y,uDepth.x*d+uDepth.y,d);vD=d;vUV=aUV;vC=aC;vL=.64+.36*max(0.,dot(n,normalize(vec3(-.4,.7,.8))));}';}
 var fs='precision mediump float;uniform sampler2D uTex;uniform float uNear;varying vec2 vUV;varying vec3 vC;varying float vL,vD;void main(){if(uNear>0.&&vD>=uNear)discard;vec3 t=pow(texture2D(uTex,vUV).rgb,vec3(2.2));gl_FragColor=vec4(pow(max(vec3(0.),t*vC*vL),vec3(1./2.2)),1.);}';
 function shader(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function program(dance){var prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vertexShader(dance)));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
  var loc={};['uB[0]','uPX','uPY','uPD','uSize','uOrigin','uDepth','uYaw','uNear','uTex'].forEach(k=>loc[k]=gl.getUniformLocation(prog,k));
  var at=[['aP',3,0],['aN',3,12],['aUV',2,24],['aC',3,32]].concat(dance?[]:[['aJ',2,44],['aW',2,52]]).map(a=>[gl.getAttribLocation(prog,a[0]),a[1],a[2]]);
  return{prog:prog,loc:loc,attrib:at,j4:dance?gl.getAttribLocation(prog,'aJ4'):-1,w4:dance?gl.getAttribLocation(prog,'aW4'):-1};}
 var main=program(0),danceProg=null;gl.useProgram(main.prog);
 // Dans programı ve ağırlık tamponları ilk dans karesinde kurulur (bağlam yenilenince yeniden).
 var danceProgs={},skinBufs={};
 function danceSetup(d){var M=d.meta,n=M.bones.length;danceProg=danceProgs[n]||(danceProgs[n]=program(n));if(!skinBufs[d.ad])skinBufs[d.ad]=data.meta.meshes.map(function(m,i){var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(d.bin,M.skinOffsets[i],M.skinVertices[i]*8),gl.STATIC_DRAW);return b;});meshes.forEach(function(m,i){m.skin=skinBufs[d.ad][i];});return danceProg;}
 var tex={};function texture(name){if(tex[name||'white'])return tex[name||'white'];var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);if(name)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,data.images[name]);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);tex[name||'white']=t;return t;}
 var meshes=data.meta.meshes.map(function(m){var vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.bin,m.vertexOffset,m.vertices*15),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(data.bin,m.indexOffset,m.indices),gl.STATIC_DRAW);return{vb:vb,ib:ib,count:m.indices,tex:texture(m.texture)};});
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 var cache=[null,null],stats={drawCalls:0,cacheHits:0,pixels:0};
 function bounds(o,r,pts){
  var all=pts||Object.values(pose(r,data.meta)),lo=[0,1,2].map(k=>Math.min(...all.map(p=>p[k]))-60),hi=[0,1,2].map(k=>Math.max(...all.map(p=>p[k]))+60),yaw=o.yaw===undefined?r.yaw:o.yaw,c=Math.cos(yaw),s=Math.sin(yaw),points=[];
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
  if(!near&&(canvas.width!==W||canvas.height!==H)){canvas.width=W;canvas.height=H;}gl.viewport(0,canvas.height-H,W,H);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);var P=prepared.dans?danceSetup(prepared.dans):main,locations=P.loc;gl.useProgram(P.prog);gl.uniformMatrix4fv(locations['uB[0]'],false,prepared.bones);gl.uniform4fv(locations.uPX,row(p=>p.x*p.d));gl.uniform4fv(locations.uPY,row(p=>p.y*p.d));gl.uniform4fv(locations.uPD,row(p=>p.d));gl.uniform2f(locations.uSize,cw,ch);gl.uniform2f(locations.uOrigin,left,top);var dr=row(p=>p.d),spread=Math.max(.5,600*Math.hypot(dr[0],dr[1],dr[2])),nearZ=Math.max(.05,dr[3]-spread),farZ=Math.max(nearZ+1,dr[3]+spread);gl.uniform2f(locations.uDepth,(farZ+nearZ)/(farZ-nearZ),-2*farZ*nearZ/(farZ-nearZ));gl.uniform1f(locations.uYaw,o.yaw===undefined?r.yaw:o.yaw);gl.uniform1f(locations.uNear,near||0);gl.uniform1i(locations.uTex,0);
  meshes.forEach(function(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);P.attrib.forEach(a=>{gl.enableVertexAttribArray(a[0]);gl.vertexAttribPointer(a[0],a[1],gl.FLOAT,false,60,a[2]);});if(prepared.dans){gl.bindBuffer(gl.ARRAY_BUFFER,m.skin);gl.enableVertexAttribArray(P.j4);gl.vertexAttribPointer(P.j4,4,gl.UNSIGNED_BYTE,false,8,0);gl.enableVertexAttribArray(P.w4);gl.vertexAttribPointer(P.w4,4,gl.UNSIGNED_BYTE,true,8,4);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.bindTexture(gl.TEXTURE_2D,m.tex);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);stats.drawCalls++;});for(var ai=0;ai<8;ai++)gl.disableVertexAttribArray(ai);stats.pixels+=W*H;
  if(key){var cv=cache[slot]?cache[slot].canvas:document.createElement('canvas');cv.width=W;cv.height=H;cv.getContext('2d').drawImage(canvas,0,0,W,H,0,0,W,H);cache[slot]={key:key,canvas:cv};g.drawImage(cv,left,top,cw,ch);}else g.drawImage(canvas,0,0,W,H,left,top,cw,ch);return true;
 }

 return{paint:paint,bounds:bounds,stats:stats,canvas:canvas,gl:gl};
}
function draw(g,o){
 if(o.id!=='meto'||!o.project)return false;if(state.status==='idle')load();if(state.status!=='ready')return false;
 Object.keys(DANSLAR).forEach(function(k){if(dansNesne(DANSLAR[k]).status==='idle')loadDans(DANSLAR[k]);});
 var r=D.futbolcu3d.rig(o),celeb=o.metoCelebration,prepared;
 var dk=celeb&&DANSLAR[celeb.variant]?dansNesne(DANSLAR[celeb.variant]):null;
 if(dk){if(dk.status==='ready'){var dp=dansPose(celeb.time,dk.meta,dk.frames);prepared={bones:dp.bones,box:renderer.bounds(o,r,dp.joints),dans:dk};}else celeb={time:celeb.time,variant:0};}
 if(!prepared){r.celebration=celeb;prepared={bones:matrices(r,model.meta),box:renderer.bounds(o,r)};}
 if(o.ball&&o.ball.depth>=prepared.box.maxDepth){o.ball.draw(g);return renderer.paint(g,o,r,0,prepared);}
 if(!renderer.paint(g,o,r,0,prepared))return false;
 if(o.ball){o.ball.draw(g);if(o.ball.depth>prepared.box.minDepth)renderer.paint(g,o,r,o.ball.depth,prepared);}return true;
}
function portrait(g,o){
 if(o.id!=='meto')return false;
 var t=o.time||0,celebrate=o.goal?{time:t,variant:o.variant||0}:null,c=celebrate&&!DANSLAR[o.variant]?celebration(t,o.variant):null,scale=o.height/(1.71024522529/D.futbolcu3d.UNIT);
 return draw(g,{id:'meto',direction:0,yaw:.12+(c?c.turn:0),metoCelebration:celebrate,viewport:o.viewport,project:function(v){var d=900-v[2],q=900/d;return{x:o.x+v[0]*scale*q,y:o.y-(v[1]-8)*scale*q,d:d};}});
}
D.meto3d={load:load,draw:draw,portrait:portrait,status:state,_pose:pose,_celebration:celebration,_armAnatomy:armAnatomy,_solveArm:solveArm,_matrices:matrices,_boneMatrix:boneMatrix,_model:()=>model,_renderer:()=>renderer,_dans:dans,_dansDurum:dansDurum,_danslar:DANSLAR,_dansPose:dansPose,_loadDans:loadDans};
// Loaded with Meto's selected character assets; other players do not download this model.
})(typeof globalThis!=='undefined'?globalThis:window);
