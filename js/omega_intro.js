/**
 * omega_intro.js — Page-load entrance animation
 *
 * Sequence (total: 6 seconds):
 *   t=0.0s → 1.5s  Step 1: .hands-connected fades in
 *   t=1.5s → 3.0s  Step 2: .hero__logo-group fades in
 *   t=3.0s → 6.0s  Step 3: background lines reveal top-to-bottom (via window._omegaHeroBg)
 *   t=3.0s → 6.0s  Step 4: .hero__text + .hero__lines slide up + fade in (simultaneous with 3)
 *
 * At t≈6.3s, inline transitions are cleared so the CSS hover gradient
 * transition (defined in hero.css) is restored.
 */
(function () {
  'use strict';

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function startBgAnimation() {
    var bg = window._omegaHeroBg;
    if (!bg || typeof bg.setProgress !== 'function') return;

    var start    = null;
    var duration = 3000; // 3 seconds

    function step(ts) {
      if (!start) start = ts;
      var raw      = Math.min((ts - start) / duration, 1);
      var progress = easeInOut(raw);
      bg.setProgress(progress);
      if (raw < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    var hands     = document.querySelector('.hands-connected');
    var logoGroup = document.querySelector('.hero__logo-group');
    var heroText  = document.querySelector('.hero__text');
    var heroLines = document.querySelector('.hero__lines');

    if (!hands || !logoGroup || !heroText || !heroLines) return;

    /* Step 1: t=0s — hands-connected fades in over 1.5s */
    requestAnimationFrame(function () {
      hands.style.transition = 'opacity 1.5s ease';
      hands.style.opacity    = '1';
    });

    /* Step 2: t=1.5s — logo fades in over 1.5s */
    setTimeout(function () {
      logoGroup.style.transition = 'opacity 1.5s ease';
      logoGroup.style.opacity    = '1';
    }, 1500);

    /* Steps 3 + 4: t=3.0s — simultaneous */
    setTimeout(function () {
      /* Step 4a: hero text slides up + fades in */
      heroText.style.transition = 'opacity 2.4s ease, transform 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      heroText.style.opacity    = '1';
      heroText.style.transform  = 'translateY(0)';

      /* Step 4b: SVG connecting line fades in */
      heroLines.style.transition = 'opacity 1.8s ease';
      heroLines.style.opacity    = '1';

      /* Step 3: background lines reveal top-to-bottom over 3s */
      startBgAnimation();
    }, 3000);

    /* Cleanup: clear inline transition so CSS hover transitions are restored.
       Opacity/transform inline styles stay so intro.css rules are not re-exposed.
       Fire a synthetic resize so omega_hero_lines.js repositions the line now
       that heroText is at its final translateY(0) position. */
    setTimeout(function () {
      heroText.style.transition  = '';
      heroLines.style.transition = '';
      hands.style.transition     = '';
      logoGroup.style.transition = '';
      window.dispatchEvent(new Event('resize'));
    }, 6300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
