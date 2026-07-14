(function () {
  function cap() {
    return Math.floor((document.documentElement.scrollHeight - window.innerHeight) * 0.8);
  }

  /* Wheel — stop before the browser moves the page */
  window.addEventListener('wheel', function (e) {
    if (e.deltaY > 0 && window.scrollY >= cap()) e.preventDefault();
  }, { passive: false });

  /* Touch — stop downward drag past cap */
  var _ty = 0;
  window.addEventListener('touchstart', function (e) {
    _ty = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (e.touches[0].clientY < _ty && window.scrollY >= cap()) e.preventDefault();
  }, { passive: false });

  /* Keyboard — ArrowDown / PageDown / Space / End */
  window.addEventListener('keydown', function (e) {
    var down = e.key === 'ArrowDown' || e.key === 'PageDown' ||
               e.key === ' '         || e.key === 'End';
    if (down && window.scrollY >= cap()) e.preventDefault();
  });

  /* Scrollbar drag fallback — lock overflow during snap so no scroll
     events fire while settling, eliminating the bounce loop entirely */
  var _locking = false;
  window.addEventListener('scroll', function () {
    if (_locking || window.scrollY <= cap()) return;
    _locking = true;
    document.documentElement.style.overflowY = 'hidden';
    window.scrollTo(0, cap());
    setTimeout(function () {
      document.documentElement.style.overflowY = '';
      _locking = false;
    }, 50);
  }, { passive: true });
}());
