(function () {
  'use strict';

  var banner = document.querySelector('.site-banner');
  var hero   = document.querySelector('.hero-video');

  if (!banner || !hero) return;

  function update() {
    /* When the video hero's top edge scrolls above the viewport top,
       switch to fixed so the banner follows the user down the page. */
    if (hero.getBoundingClientRect().top <= 0) {
      banner.classList.add('is-fixed');
    } else {
      banner.classList.remove('is-fixed');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); /* run once on load in case page is already scrolled */
}());
