/**
 * omega_intro.js — Page-load entrance animation
 *
 * Sequence (total: 4.5 seconds):
 *   t=0.0s → 1.5s  Step 1: .hands-connected fades in
 *   t=1.5s → 4.5s  Step 2: background lines reveal top-to-bottom (via window._omegaHeroBg)
 *   t=1.5s → 4.5s  Step 3: .hero__text + .hero__lines slide up + fade in (simultaneous with 2)
 *
 * .hero__logo-group (now in the site-banner) is always visible — no delay.
 * At t≈4.8s, inline transitions are cleared so CSS hover transitions are restored.
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
    var duration = 3000;

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
    var banner    = document.querySelector('.site-banner');
    var heroText  = document.querySelector('.hero__text');
    var heroLines = document.querySelector('.hero__lines');

    if (!hands) return;

    /* Step 1: t=0s — hands + banner fade in over 1.5s.
       Double-rAF: outer frame lets the browser paint opacity:0 (from intro.css),
       inner frame then starts the transition so it animates from that painted state. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hands.style.transition = 'opacity 1.5s ease';
        hands.style.opacity    = '1';
        if (banner) {
          banner.style.transition = 'opacity 1.5s ease, width 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          banner.style.opacity    = '1';
        }
      });
    });

    /* Steps 2 + 3: t=1.5s — only run if text/lines elements are present */
    setTimeout(function () {
      if (heroText) {
        heroText.style.transition = 'opacity 2.4s ease, transform 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        heroText.style.opacity    = '1';
        heroText.style.transform  = 'translateY(0)';
      }

      if (heroLines) {
        heroLines.style.transition = 'opacity 1.8s ease';
        heroLines.style.opacity    = '1';

        var trackStart = null;
        var trackDuration = 2500;
        function trackLine(ts) {
          if (!trackStart) trackStart = ts;
          if (typeof window._positionHeroLine === 'function') {
            window._positionHeroLine();
          }
          if (ts - trackStart < trackDuration) {
            requestAnimationFrame(trackLine);
          }
        }
        requestAnimationFrame(trackLine);
      }

      startBgAnimation();
    }, 1500);

    /* Cleanup */
    setTimeout(function () {
      if (heroText)  heroText.style.transition  = '';
      if (heroLines) heroLines.style.transition = '';
      hands.style.transition = '';
      if (banner) banner.style.transition = '';
      window.dispatchEvent(new Event('resize'));
    }, 4800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
