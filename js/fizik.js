/* Duran Top - sonuç hesabı.
 * Tek ve saf bir fonksiyon: aynı girdi her zaman aynı top yolunu ve aynı sonucu verir.
 * Ekrandaki uçuş bu yolun çizimidir; sonuç ayrıca hesaplanmaz.
 * Zamana, ekrana ve Math.random'a bağlı değildir. Sonra sunucuda aynen çalışacak.
 *
 * Dünya: x sağ, y yukarı, z kaleye doğru (metre). Top (bx, 0) noktasından vurulur,
 * kale çizgisi z = D düzlemindedir ve ortası x = 0'dadır. y topun merkez yüksekliğidir.
 */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var A = DT.AYAR;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The sphere's intersection with the goal plane is a shrinking disk,
  // not a full-radius disk at the instant its trailing point crosses the line.
  // Sample the swept disk at 1 mm depth intervals. Post contacts are handled first.
  function golGecisi(path,D) {
    var R=A.kale.topYaricap,w=A.kale.genislik/2,H=A.kale.yukseklik;
    if(!path.length||path[0].z>D-R||path[path.length-1].z<D+R-1e-8)return false;
    var crossed=false;
    for(var i=1;i<path.length;i++){
      var a=path[i-1],b=path[i],dz=b.z-a.z;
      if(Math.max(a.z,b.z)<D-R||Math.min(a.z,b.z)>D+R)continue;
      if(Math.abs(dz)<1e-12)continue;
      var lo=Math.max(0,Math.min((D-R-a.z)/dz,(D+R-a.z)/dz)),hi=Math.min(1,Math.max((D-R-a.z)/dz,(D+R-a.z)/dz));
      var steps=Math.max(1,Math.ceil(Math.abs(dz)*(hi-lo)/.001));
      for(var j=0;j<=steps;j++){
        var u=lo+(hi-lo)*j/steps,z=a.z+dz*u,x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;
        var radius=Math.sqrt(Math.max(0,R*R-(z-D)*(z-D)));
        if(Math.abs(x)+radius>w+1e-7||y+radius>H+1e-7||y-radius < -1e-7)return false;
        if(dz>0&&z>=D+R-1e-8)crossed=true;
      }
    }
    return crossed;
  }

  // Net sides/roof/rear have two faces. A miss can hit the OUTSIDE of the
  // net without becoming a goal. Front mouth is open; ground handled separately.
  function fileTemasi(prev,p,v,D,inside) {
    var R=A.kale.topYaricap,w=A.kale.genislik/2+A.kale.direk/2,H=A.kale.yukseklik+A.kale.direk/2,Z=D+1.5,hit=false;
    function reflect(k){v[k]=-v[k]*.12;['x','y','z'].forEach(function(n){if(n!==k)v[n]*=.65;});hit=true;}
    if(inside){
      if(p.z>=D){if(p.x>w-R){p.x=w-R;if(v.x>0)reflect('x');}else if(p.x<-w+R){p.x=-w+R;if(v.x<0)reflect('x');}
        if(p.y>H-R){p.y=H-R;if(v.y>0)reflect('y');}
        if(p.z>Z-R){p.z=Z-R;if(v.z>0)reflect('z');}}
    }else{
      var best=null;
      function plane(k,value,sign){var a=prev[k]-value,b=p[k]-value;if(a*sign<0||b*sign>=0||a===b)return;
        var u=a/(a-b),q={x:prev.x+(p.x-prev.x)*u,y:prev.y+(p.y-prev.y)*u,z:prev.z+(p.z-prev.z)*u};
        if(q.z<D-R||q.z>Z+R||Math.abs(q.x)>w+R+1e-7||q.y<0||q.y>H+R+1e-7)return;
        if(!best||u<best.u)best={k:k,value:value,u:u,q:q};}
      plane('x',w+R,1);plane('x',-w-R,-1);plane('y',H+R,1);plane('z',Z+R,1);
      if(best){p.x=best.q.x;p.y=best.q.y;p.z=best.q.z;p[best.k]=best.value;reflect(best.k);}
    }
    return hit;
  }

  /* girdi: { pos:{tip,bx,D}, aim:{x,y}, falso:-1|0|1, zaman:0..1|null, seed:int, antrenman:bool } */
  function hesapla(girdi) {
    var pos = girdi.pos, aim = girdi.aim;
    var rng = mulberry32(girdi.seed | 0);
    function gauss() {
      var u = Math.max(rng(), 1e-9), v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    var g = A.yercekimi, R = A.kale.topYaricap;
    var yari = A.kale.genislik / 2, H = A.kale.yukseklik;

    var zamanVar = typeof girdi.zaman === 'number';
    var hata = zamanVar ? girdi.zaman - 0.5 : 0;
    var bant=DT.zamanBandi(aim,girdi.gucZorlugu===false?undefined:girdi.guc);
    var kontrolSapmasi=hata*DT.koseBandi(aim)/bant;
    var bandaGirdi = zamanVar && Math.abs(hata) <= bant;
    var quality = Math.exp(-Math.pow(hata / (0.18*bant/A.zaman.bant), 2));
    var flight = girdi.enerjiFizigi===true ? DT.ucus.energyLaunch(pos,aim,girdi.contact||{x:0,y:0},kontrolSapmasi,quality,gauss,girdi.guc,girdi.takipFizigi===true,girdi.kural10===true?{hata:hata,bant:bant}:null) : DT.ucus.hedefliLaunch(pos,aim,girdi.contact||{x:0,y:0},kontrolSapmasi,quality,gauss,girdi.guc,girdi.gucZorlugu!==false,girdi.temasFizigi===true);
    var cx=flight.contact.x,cy=flight.contact.y,bx=pos.bx,D=pos.D,T=flight.T,dt=1/120,ornekler=flight.yol;
    var ax=flight.son.x,ay=flight.son.y;

    // 3) Baraj (yalnız frikik)
    var baraj = null, olayIndex = ornekler.length - 1, sonuc = null;
    if (pos.tip === 'frikik') {
      var ux = -bx, uz = D, ul = Math.hypot(ux, uz); ux /= ul; uz /= ul;
      var px = uz, pz = -ux;
      var mesafe = A.baraj.mesafe;
      baraj = { ux: ux, uz: uz, px: px, pz: pz, mesafe: mesafe, merkezX: bx + ux * mesafe, merkezZ: uz * mesafe };
      baraj.oyuncular=DT.baraj.kur(pos);
      var hit=DT.baraj.ilkTemas(baraj,ornekler,R);
      if(hit){sonuc='baraj';olayIndex=hit.index;baraj.temas=hit;}

    }

    // 4) Kale çizgisine yaklaşırken kaleci, yoksa direk / gol / aut.
    // Temas yalnızca son yarım metrede aranır; sahanın ortasındaki x,y çakışması kurtarış sayılmaz.
    var son = ornekler[ornekler.length - 1];
    var gecis = { x: son.x, y: son.y };
    var plan = DT.kaleci.planla(gecis, pos.tip, !!girdi.antrenman, gauss, T,{decision:rng(),penaltiTahmin:girdi.penaltiTahmin===true,preDecision:girdi.penaltiTahmin?mulberry32((girdi.seed|0)^0x50394B31)():undefined,quality:quality,speed:flight.speed,yol:ornekler,sabitKol:girdi.sabitKol===true,enerjiFizigi:girdi.enerjiFizigi===true,takipFizigi:girdi.takipFizigi===true,yerTakibi:girdi.yerTakibi===true,kural10:girdi.kural10===true,D:D});
    plan.D=D;var bolge = A.kale.direk / 2 + R;
    var kose = false;
    var direkYeri = null;

    // Continuous swept sphere/cylinder contact, rules 5 only. Never award a
    // post goal from its incoming position: reflect, then check the full crossing.
    function ilkDirek(path) {
      var first=null;
      for(var i=1;i<path.length;i++){
        var p=path[i-1],q=path[i],delta={x:q.x-p.x,y:q.y-p.y,z:q.z-p.z};
        function cylinder(axis,center,label){
          var k=axis==='y'?'x':'y',a=p[k]-center,b=p.z-D,dx=delta[k],dz=delta.z;
          var aa=dx*dx+dz*dz,bb=2*(a*dx+b*dz),cc=a*a+b*b-bolge*bolge,disc=bb*bb-4*aa*cc;
          if(aa<1e-12||disc<0)return;var u=cc<=0?0:(-bb-Math.sqrt(disc))/(2*aa);if(u<0||u>1)return;
          var at={t:p.t+(q.t-p.t)*u,x:p.x+delta.x*u,y:p.y+delta.y*u,z:p.z+delta.z*u};
          if(axis==='y'&&(at.y<0||at.y>H+(girdi.takipFizigi?A.kale.direk/2:0)))return;if(axis==='x'&&Math.abs(at.x)>yari+(girdi.takipFizigi?A.kale.direk/2:0))return;
          var n=[0,0,at.z-D];n[k==='x'?0:1]=at[k]-center;var len=Math.hypot.apply(null,n);n=n.map(v=>v/Math.max(len,1e-9));
          var v=[delta.x,delta.y,delta.z].map(v=>v/(q.t-p.t));var dot=v.reduce((sum,v,j)=>sum+v*n[j],0);
          if(dot>=0)return;v=v.map((v,j)=>v-1.55*dot*n[j]);
          if(!first||at.t<first.at.t)first={at:at,index:i,label:label,velocity:v,normal:n};
        }
        var offset=girdi.takipFizigi?A.kale.direk/2:0;
        cylinder('y',-yari-offset,'yan');cylinder('y',yari+offset,'yan');cylinder('x',H+offset,'ust');
        if(first)return first;
      }return null;
    }
    var pole=girdi.enerjiFizigi===true?ilkDirek(ornekler):null,physicalRebound=false;
    function kaleciDegdi(limit) {
      var i, o;
      for (i = 1; i < ornekler.length; i++) {
        o = ornekler[i];
        if(limit!==undefined&&o.t>limit)break;
        if (o.z < D - 0.5) continue;
        if (Math.abs(o.x) > yari + 0.4) continue;
        if (o.y > H + 0.3) continue;
        if (DT.kaleci.tutarMi(plan, o.t, o)) return i;
      }
      return -1;
    }

    if (!sonuc) {
      var temas = kaleciDegdi(pole?pole.at.t:undefined);
      if (temas >= 0) {
        sonuc = 'kurtaris';
        olayIndex = temas;
      } else if(pole){
        physicalRebound=true;direkYeri=pole.label;
        var p0=pole.at,n=pole.normal,reb=DT.ucus.integrate({bx:bx,D:D+R},pole.velocity,flight.spin,
          {initialPosition:[p0.x+n[0]*.00001,p0.y+n[1]*.00001,p0.z+n[2]*.00001],startTime:p0.t,groundSpin:true});
        ornekler=ornekler.slice(0,pole.index).concat(reb.yol);olayIndex=ornekler.length-1;flight.reached=reb.reached;T=reb.T;
        var afterSave=kaleciDegdi();
        if(afterSave>=0){sonuc='kurtaris';olayIndex=afterSave;}
        else {gecis={x:reb.son.x,y:reb.son.y};sonuc=(girdi.golGeometrisi?golGecisi(ornekler,D):reb.reached&&Math.abs(gecis.x)<yari-R&&gecis.y<H-R)?'direk_gol':'direk_disari';}
      } else if(!flight.reached){sonuc='kisa';} else {
        var disDirek = Math.abs(Math.abs(gecis.x) - yari);
        var direkte = false, iceride = false;
        if (!girdi.enerjiFizigi && disDirek <= bolge && gecis.y <= H + bolge) {
          direkte = true; direkYeri = 'yan'; iceride = Math.abs(gecis.x) < yari;
        } else if (!girdi.enerjiFizigi && Math.abs(gecis.y - H) <= bolge && Math.abs(gecis.x) <= yari) {
          direkte = true; direkYeri = 'ust'; iceride = gecis.y < H;
        }
        if (direkte) sonuc = iceride ? 'direk_gol' : 'direk_disari';
        else if (girdi.golGeometrisi ? golGecisi(ornekler,D) : Math.abs(gecis.x) < yari - (girdi.enerjiFizigi?R:bolge) && gecis.y < H - (girdi.enerjiFizigi?R:bolge)) sonuc = 'gol';
        else sonuc = 'aut';
      }
    }
    if (sonuc === 'gol' || sonuc === 'direk_gol') {
      kose = Math.abs(gecis.x) >= yari - A.koseMetre;
    }

    // 5) Olay sonrası: aynı yolun devamı (file, kaleci, direk, baraj)
    var e = ornekler[olayIndex];
    var e0 = ornekler[Math.max(0, olayIndex - 1)];
    var gap = Math.max(e.t - e0.t, 1e-6);
    var v = { x: (e.x - e0.x) / gap, y: (e.y - e0.y) / gap, z: (e.z - e0.z) / gap };
    var sag = gecis.x >= 0 ? 1 : -1;
    var damp = 0;
    if (sonuc === 'gol' && !girdi.golGeometrisi) { v = { x: v.x * 0.3, y: v.y * 0.3, z: v.z * 0.3 }; damp = 3.5; }
    else if (sonuc === 'direk_gol' && physicalRebound && !girdi.golGeometrisi) {v={x:v.x*.3,y:v.y*.3,z:v.z*.3};damp=3.5;}
    else if (sonuc === 'direk_gol' && !girdi.golGeometrisi) {
      // Direkten dönüp içeri düşer: değdiği yüzeyden gerçekten sekip file'ye gider.
      if (direkYeri === 'ust') v = { x: v.x * 0.4, y: -(Math.abs(v.y) * 0.5 + 0.8), z: v.z * 0.45 };
      else v = { x: -sag * Math.max(1.5, Math.abs(v.x) * 0.5), y: v.y * 0.5, z: v.z * 0.45 };
      damp = 3.0;
    }
    else if (sonuc === 'kurtaris') {
      var kk = plan.konum(e.t);
      v = { x: (e.x >= kk.x ? 1 : -1) * 2.2 + v.x * 0.1, y: Math.abs(v.y) * 0.15 + 1.5, z: -Math.abs(v.z) * 0.5 };
    }
    else if (sonuc === 'direk_disari' && physicalRebound) { /* already reflected at cylinder */ }
    else if (sonuc === 'direk_disari') {
      if (direkYeri === 'ust') v = { x: v.x * 0.4, y: Math.abs(v.y) * 0.5 + 2.0, z: v.z * 0.3 };
      else v = { x: sag * Math.max(2.5, Math.abs(v.x) * 0.6), y: Math.abs(v.y) * 0.3 + 1.2, z: -0.3 * v.z };
    }
    else if (sonuc === 'baraj') { v = { x: -v.x * 0.25, y: 1.5, z: -0.3 * v.z }; }
    var p = { x: e.x, y: e.y, z: e.z }, tt = e.t;
    var tuttu = sonuc === 'kurtaris' && plan.eylem !== 'dal';
    var capture = tuttu ? plan.konum(tt) : null;
    var kalan = (sonuc === 'aut') ? 0.9 : 1.1;
    var netZ = D + 1.5;
    var sonrasi = [],fileT=null;
    for (var j = 1; j <= Math.round(kalan / dt); j++) {
      if (tuttu) {
        var kk = plan.cizimKonum(tt + j * dt), blend = Math.min(1, j * dt / .24);
        blend = blend * blend * (3 - 2 * blend);
        sonrasi.push({ t: tt + j * dt, x: kk.x + (e.x - capture.x) * (1 - blend),
          y: kk.y + (e.y - capture.y) * (1 - blend) + .2 * blend, z: e.z }); continue;
      }
      var aero = DT.ucus.acceleration([v.x,v.y,v.z],flight.spin,tt+j*dt);
      v.x += aero[0]*dt;v.y += aero[1]*dt;v.z += aero[2]*dt;
      if (damp) { var f = Math.exp(-damp * dt); v.x *= f; v.z *= f; }
      var prev={x:p.x,y:p.y,z:p.z};
      p.x += v.x * dt; p.y += v.y * dt; p.z += v.z * dt;
      if(girdi.golGeometrisi && (sonuc==='gol'||sonuc==='direk_gol'||sonuc==='aut'||sonuc==='direk_disari')){if(fileTemasi(prev,p,v,D,sonuc==='gol'||sonuc==='direk_gol')){damp=5;if(fileT===null)fileT=tt+j*dt;}}
      if (!girdi.golGeometrisi && (sonuc === 'gol' || sonuc === 'direk_gol') && p.z > netZ) { p.z = netZ; v.z = 0; }
      if (p.y < R) { p.y = R; v.y = Math.abs(v.y) > 0.8 ? -v.y * 0.4 : 0; v.x *= 0.85; v.z *= 0.85; }
      sonrasi.push({ t: tt + j * dt, x: p.x, y: p.y, z: p.z });
    }
    var yol = ornekler.slice(0, olayIndex + 1).concat(sonrasi);

    return {
      ...(girdi.golGeometrisi?{fileT:fileT}:{}),energy:flight.energy,quality: quality, speed: flight.speed, spin: flight.spin, spinRps: flight.spinRps,
      cizgiyiGecti:flight.reached,ucusYol: ornekler, contact: {x:cx,y:cy}, tuttu: tuttu,
      sonuc: sonuc,                 // gol | kurtaris | direk_gol | direk_disari | baraj | aut
      yol: yol, olayT: e.t, ucusT: T,
      gecis: gecis, kose: kose, bandaGirdi: bandaGirdi, hata: hata,
      ...(girdi.enerjiFizigi?{direkTemas:pole?pole.at:null}:{}),direkYeri: direkYeri, baraj: baraj, kaleci: plan, nokta: { x: ax, y: ay }
    };
  }

  DT.fizik = { hesapla: hesapla, golGecisi:golGecisi, fileTemasi:fileTemasi };
})(typeof globalThis !== 'undefined' ? globalThis : window);

