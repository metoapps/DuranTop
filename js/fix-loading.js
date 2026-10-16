/* Hızlı düzeltme: yükleme ekranını kapat ve karakter seçimini serbest bırak */
(function(){
  function fix(){
    var y = document.getElementById('yukleme');
    if(y) y.style.display = 'none';
    // Karakter butonlarını etkinleştir
    document.querySelectorAll('.secim-kart').forEach(function(b){ b.disabled = false; });
    console.log('Loading fix applied');
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
  // Birkaç saniye sonra tekrar dene
  setTimeout(fix, 2000);
  setTimeout(fix, 5000);
})();
