/**
 * section2_bg.js
 *
 * Initialises the reversed omega_form_bg canvas inside .section-two.
 * Traces top-to-bottom (setProgress 0→1) once the section scrolls into view.
 */
(function () {
  'use strict';

  var DURATION = 3000; /* ms — matches hero reveal duration */

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function startReveal(bg) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var raw      = Math.min((ts - start) / DURATION, 1);
      var progress = easeInOut(raw);
      bg.setProgress(progress);
      if (raw < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initBackground() {
    var sec = document.querySelector('.section-two');
    if (!sec || typeof initOmegaFormBg !== 'function') return;

    var bg = initOmegaFormBg(sec);
    if (!bg || !bg.canvas) return;

    bg.canvas.id = 'omega-form-bg-2';
    bg.canvas.style.zIndex = '0';
    sec.insertBefore(bg.canvas, sec.firstChild);
    /* _progress already starts at 0 — canvas is hidden until reveal fires */

    /* Fire the reveal once when the section first enters the viewport */
    if (typeof IntersectionObserver !== 'undefined') {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startReveal(bg);
            obs.disconnect();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(sec);
    } else {
      /* Fallback for browsers without IntersectionObserver */
      startReveal(bg);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
  } else {
    initBackground();
  }

}());
