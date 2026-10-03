/* Duran Top - ses. Dosya gerekmez: sesler tarayıcıda üretilir. Ses KAPALI başlar. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var ctx = null, acik = false, ana = null;

  function baslat() {
    if (ctx) return true;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    ana = ctx.createGain(); ana.gain.value = 0.8; ana.connect(ctx.destination);
    return true;
  }
  function gurultu(sure) {
    var n = Math.floor(ctx.sampleRate * sure), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = b; return s;
  }
  function zarf(g, t0, a, tepe, bitis) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(a, 0.0002), t0 + tepe);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + bitis);
  }
  function gurultuSes(sure, tip, frek, q, ses, tepe) {
    var t = ctx.currentTime, s = gurultu(sure), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = tip; f.frequency.value = frek; f.Q.value = q;
    zarf(g, t, ses, tepe, sure);
    s.connect(f); f.connect(g); g.connect(ana); s.start(t); s.stop(t + sure);
  }
  function ton(tip, frek, sure, ses, bitisFrek) {
    var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tip; o.frequency.setValueAtTime(frek, t);
    if (bitisFrek) o.frequency.exponentialRampToValueAtTime(bitisFrek, t + sure);
    zarf(g, t, ses, 0.005, sure);
    o.connect(g); g.connect(ana); o.start(t); o.stop(t + sure);
  }

  // A short impact excites damped metal modes; net impact has no pitched ringing.
  function ornekUret(ad,rate,seed){rate=rate||44100;var duration=ad==='direk'?1.15:.43,n=Math.ceil(rate*duration),data=new Float32Array(n),state=seed||37;
    function noise(){state=(Math.imul(state,1664525)+1013904223)|0;return ((state>>>0)/4294967296)*2-1;}
    var modes=[[482,.23,.43],[781,.18,.31],[1193,.13,.20],[1741,.075,.14],[2637,.035,.075]],low=0,peak=0;
    for(var i=0;i<n;i++){var t=i/rate,w=noise(),v=0;
      if(ad==='direk'){
        v=w*.27*Math.exp(-t/ .009);
        modes.forEach(function(m){v+=m[1]*Math.sin(2*Math.PI*m[0]*t)*Math.exp(-t/m[2]);});
        v+=.20*Math.sin(2*Math.PI*105*t)*Math.exp(-t/.025);
      }else{
        low+=.20*(w-low);var high=w-low;
        var flutter=(.5+.5*Math.sin(2*Math.PI*31*t))*(.7+.3*Math.sin(2*Math.PI*47*t));
        v=.34*Math.sin(2*Math.PI*(110*t-38*t*t))*Math.exp(-t/.022)+.18*low*Math.exp(-t/.027);
        v+=high*.12*flutter*Math.exp(-t/.085)*(1-Math.exp(-t/.006));
        for(var j=0;j<3;j++){var start=.025+j*.028;if(t>=start)v+=low*.04*Math.exp(-(t-start)/.025);}
      }
      var attack=Math.min(1,t/.0007),release=Math.min(1,(duration-t)/.015);v*=attack*release;
      data[i]=v;peak=Math.max(peak,Math.abs(v));
    }
    if(peak>.70)for(i=0;i<n;i++)data[i]*=.70/peak;
    return data;
  }
  /* Gerçek kayıt (isteğe bağlı): assets/ses/direk.mp3 ve assets/ses/file.mp3 varsa onlar çalınır, yoksa yukarıdaki sentez.
   * Karşılaştırma için adrese ?ses=sentez eklemek kayıtları devre dışı bırakır (telefonda A/B dinleme). */
  var kayit = {}, kayitDenendi = false, zorlaSentez = !!(root.location && /[?&]ses=sentez/.test(root.location.search || ''));
  function kayitlariYukle() {
    if (kayitDenendi || zorlaSentez || !ctx || !root.fetch) return; kayitDenendi = true;
    ['direk', 'file'].forEach(function (ad) {
      root.fetch('assets/ses/' + ad + '.mp3?v=20261004c').then(function (r) { return r.ok ? r.arrayBuffer() : null; })
        .then(function (b) { return b ? ctx.decodeAudioData(b) : null; })
        .then(function (buf) { if (buf) kayit[ad] = buf; }).catch(function () { /* dosya yok ya da çözülemedi: sentez kullanılır */ });
    });
  }
  function darbe(ad,options){var t=ctx.currentTime,hiz=Math.max(.45,Math.min(1.05,((options&&options.hiz)||24)/24)),buffer;
    var source=ctx.createBufferSource(),gain=ctx.createGain();
    if(kayit[ad]){buffer=kayit[ad];source.playbackRate.value=.97+.06*Math.random();}   // gerçek kayıt: hıza göre ses şiddeti, küçük perde farkı
    else{var values=ornekUret(ad,ctx.sampleRate,1+Math.floor(Math.random()*100000));buffer=ctx.createBuffer(1,values.length,ctx.sampleRate);buffer.getChannelData(0).set(values);}
    source.buffer=buffer;gain.gain.value=hiz;source.connect(gain);gain.connect(ana);source.start(t);
    source.onended=function(){source.disconnect();gain.disconnect();};
  }
  // Original 8-bar plucked arcade loop; generated once, quiet beneath the impact sounds.
  var muzikKaynak=null,muzikBuffer=null;
  function muzikDurdur(){if(muzikKaynak){try{muzikKaynak.stop();muzikKaynak.disconnect();}catch(e){}muzikKaynak=null;}}
  function muzikGuncelle(){
    if(!acik||!ctx||(root.document&&root.document.hidden)){muzikDurdur();return;}
    if(muzikKaynak)return;
    if(!muzikBuffer){
      var sr=ctx.sampleRate,beat=60/108,length=beat*32,buf=ctx.createBuffer(1,Math.ceil(sr*length),sr),samples=buf.getChannelData(0);
      var melody=[72,76,79,76,74,77,81,77,71,74,79,74,72,76,79,83];
      function note(midi,at,duration,level){var hz=440*Math.pow(2,(midi-69)/12),begin=Math.floor(at*sr),end=Math.min(samples.length,begin+Math.floor(duration*sr));
        for(var i=begin;i<end;i++){var t=(i-begin)/sr,env=Math.min(1,t/.008)*Math.exp(-t*7)*Math.min(1,(end-i)/(sr*.025));samples[i]+=level*env*(Math.sin(2*Math.PI*hz*t)+.2*Math.sin(4*Math.PI*hz*t));}}
      for(var step=0;step<64;step++){var at=step*beat/2;note(melody[step%16],at,beat*.8,.055);if(step%4===0)note([48,53,55,48][Math.floor(step/16)],at,beat*1.5,.055);}
      muzikBuffer=buf;
    }
    muzikKaynak=ctx.createBufferSource();muzikKaynak.buffer=muzikBuffer;muzikKaynak.loop=true;muzikKaynak.connect(ana);muzikKaynak.start();
  }
  if(root.document&&root.document.addEventListener)root.document.addEventListener('visibilitychange',muzikGuncelle);

  var sesler = {
    vurus: function () { gurultuSes(0.09, 'lowpass', 900, 0.7, 0.9, 0.004); ton('sine', 140, 0.12, 0.8, 60); },
    file: function (options) { darbe('file',options); },
    direk: function (options) { darbe('direk',options); },
    kurtaris: function () { gurultuSes(0.14, 'lowpass', 400, 0.7, 0.9, 0.004); ton('sine', 110, 0.14, 0.6, 70); },
    baraj: function () { gurultuSes(0.16, 'lowpass', 300, 0.7, 0.9, 0.004); ton('sine', 90, 0.16, 0.6, 55); },
    gol: function () { gurultuSes(1.7, 'bandpass', 780, 0.5, 0.28, 0.45); },
    ah: function () { gurultuSes(1.0, 'bandpass', 420, 0.6, 0.4, 0.3); },
    islik: function () { ton('sine', 2800, 0.45, 0.15, 3000); }
  };

  DT.ses = {
    ornekUret:ornekUret,acikMi: function () { return acik; },kayitVarMi: function (ad) { return !!kayit[ad]; },
    ayarla: function (v) {                       // kullanıcı dokunuşuyla çağrılmalı
      acik = !!v;
      if (acik && baslat() && ctx.state === 'suspended') ctx.resume();
      if (acik) kayitlariYukle();
      muzikGuncelle();
    },
    cal: function (ad,options) {
      if (!acik || !ctx || !sesler[ad]) return;
      try { sesler[ad](options); } catch (e) { /* ses hatası oyunu durdurmasın */ }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
