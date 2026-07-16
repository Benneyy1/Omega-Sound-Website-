(function () {
  'use strict';

  var banner     = document.querySelector('.site-banner');
  var hero       = document.querySelector('.hero-video');
  var footerLogo = document.querySelector('.footer__logo-group');
  var sectionTwo = document.querySelector('.section-two');

  if (!banner || !hero) return;

  function update() {
    /* Banner: fix once the hero's top edge leaves the viewport */
    if (hero.getBoundingClientRect().top <= 0) {
      banner.classList.add('is-fixed');
    } else {
      banner.classList.remove('is-fixed');
    }

    /* Footer logo: reveal after 25% of total scroll distance */
    if (footerLogo) {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY >= maxScroll * 0.25) {
        footerLogo.classList.add('is-visible');
      } else {
        footerLogo.classList.remove('is-visible');
      }
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  /* Keep the section-two canvas ripple alive while hovering the footer logo.
     The footer logo sits on top of section-two in a separate stacking context,
     so section-two fires mouseleave when the cursor moves onto it.  We cancel
     that stop-timer by dispatching a synthetic mouseenter back onto section-two
     the moment the footer logo receives its own mouseenter. */
  if (footerLogo && sectionTwo) {
    footerLogo.addEventListener('mouseenter', function () {
      sectionTwo.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true }));
    });

    /* When leaving the footer logo, if the cursor is still inside section-two
       re-fire mouseenter so the ripple keeps running without a gap. */
    footerLogo.addEventListener('mouseleave', function (e) {
      var r = sectionTwo.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top  && e.clientY <= r.bottom) {
        sectionTwo.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true }));
      }
    });
  }

}());
