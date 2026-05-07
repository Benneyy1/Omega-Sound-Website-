/**
 * about_bg.js — Single full-viewport background canvas for the About page.
 * Traces top-to-bottom on load, stays fixed behind content as the page scrolls.
 */
(function () {
  'use strict';

  var DURATION = 3000; /* ms — matches hero */

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function init() {
    var topDiv = document.getElementById('about-bg-top');
    if (!topDiv || typeof initOmegaFormBg !== 'function') return;

    var bg = initOmegaFormBg(topDiv);
    if (!bg || !bg.canvas) return;

    bg.canvas.id = 'about-bg-canvas';

    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var raw = Math.min((ts - start) / DURATION, 1);
      bg.setProgress(easeInOut(raw));
      if (raw < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
