/* LORT Gerçekçi Model İyileştirmeleri
 * Hedef: yapıştırma yüz kaldırılacak, hacimli 3D baş, sarışın saç, uzun boy, anatomik kısıtlar.
 * Bu dosya futbolcu3d.js üzerine override veya ek çizim mantığı için başlangıç noktasıdır.
 */
(function(root){
'use strict';
var D = root.DT;
if(!D) return;

// LORT için özel profil
D.lortProfile = {
  hair: 'blond',
  heightScale: 1.06,          // uzun boy
  build: 'athletic',
  faceBase: 'existing-photo', // gözlüklü sakallı yüz yapısı temel
  glasses: true,
  stubble: true
};

// Gelecek: baş çiziminde prosedürel burun/kaş/ağız + saç hacmi
// Anatomik kol çözücü paylaşımı (dirsek açısı kısıtı)
console.log('LORT enhancements loaded');
})(typeof globalThis!=='undefined'?globalThis:window);
