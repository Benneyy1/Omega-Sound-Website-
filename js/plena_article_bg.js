/**
 * plena_article_bg.js
 *
 * Fills #article-bg-wrap with four instances of the Omega form background:
 *   1st quarter — normal      (top)
 *   2nd quarter — scaleY(-1)  (bottom / mirror)
 *   3rd quarter — normal      (top)
 *   4th quarter — scaleY(-1)  (bottom / mirror)
 * All animate in on load, blurred via CSS.
 */
(function () {
  'use strict';

  var DURATION = 3000;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function reveal(bg) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var raw = Math.min((ts - start) / DURATION, 1);
      bg.setProgress(easeInOut(raw));
      if (raw < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    var wrap = document.getElementById('article-bg-wrap');
    if (!wrap || typeof initOmegaFormBg !== 'function') return;

    var slots = [
      { id: 'article-bg-1', canvasId: 'article-canvas-1', flip: false },
      { id: 'article-bg-2', canvasId: 'article-canvas-2', flip: true  },
      { id: 'article-bg-3', canvasId: 'article-canvas-3', flip: false },
      { id: 'article-bg-4', canvasId: 'article-canvas-4', flip: true  }
    ];

    slots.forEach(function (slot) {
      var div = document.createElement('div');
      div.id = slot.id;
      wrap.appendChild(div);

      var bg = initOmegaFormBg(div);
      if (bg && bg.canvas) {
        bg.canvas.id = slot.canvasId;
        if (slot.flip) bg.canvas.style.transform = 'scaleY(-1)';
      }
      reveal(bg);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
