/**
 * section2_bg.js
 *
 * Initialises the reversed omega_form_bg canvas inside .section-two.
 * The open hand image is now a plain <img> in index.html — no canvas needed.
 */
(function () {
  'use strict';

  function initBackground() {
    var sec = document.querySelector('.section-two');
    if (!sec || typeof initOmegaFormBg !== 'function') return;

    var bg = initOmegaFormBg(sec);
    if (bg && bg.canvas) {
      bg.canvas.id = 'omega-form-bg-2';
      bg.canvas.style.zIndex = '0';
      sec.insertBefore(bg.canvas, sec.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
  } else {
    initBackground();
  }

}());
