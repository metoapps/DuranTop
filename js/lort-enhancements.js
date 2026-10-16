/* LORT Gerçekçi Model İyileştirmeleri
 * Hedef: yapıştırma yüz azaltılacak, hacimli 3D baş, sarışın saç, uzun boy, anatomik kısıtlar.
 */
(function(root){
'use strict';
var D = root.DT;
if(!D) return;

// LORT için özel profil (mevcut yüz yapısı + kullanıcı tarifine göre)
D.lortProfile = {
  hair: 'blond',
  hairColor: '#e8d5a3',
  heightScale: 1.07,          // uzun boy
  build: 'athletic',
  faceBase: 'existing-photo',
  glasses: true,
  glassesColor: '#222',
  stubble: true,
  stubbleColor: '#c4a574',
  jawStrength: 1.05,
  expression: 'focused-confident'
};

// Anatomik kol kısıtları (Meto seviyesine yaklaşma)
D.lortArmLimits = {
  elbowMin: 10 * Math.PI/180,
  elbowMax: 140 * Math.PI/180,
  shoulderRaiseMax: 150 * Math.PI/180,
  backReach: 0.55
};

// Gelecek entegrasyon: futbolcu3d.js çizim fonksiyonunda LORT için
// - Baş küresine hacim + burun/kaş/ağız ekleme
// - Sarışın saç küresi
// - Gözlük çizgileri
// - Kol çözücüde limit uygulama

console.log('LORT enhancements loaded (head model params ready)');
})(typeof globalThis!=='undefined'?globalThis:window);
