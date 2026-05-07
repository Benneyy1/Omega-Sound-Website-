/* omega_hero_lines.js
   Draws a perfectly horizontal line from directly under the "OMEGA"
   eyebrow text to the X position of the thumb's knuckle in the image.
   y2 = y1 so the line is flat (180°) — no diagonal. No dependencies. */

(function () {
  'use strict';

  /* Image constants matching section2.css / hands-connected positioning */
  var IMG_TOP_VH    = 20;    /* top: 20vh in .hands-connected */
  var IMG_HEIGHT_VH = 267;   /* height: 267vh */
  var IMG_WIDTH_PX  = 1115;  /* natural width of omega_handsconnected_pluswriting.png */
  var IMG_HEIGHT_PX = 3643;  /* natural height */

  /* Thumb pixel coordinate inside the source image */
  var THUMB_X_PX = 328;
  var THUMB_Y_PX = 437;

  function positionLine() {
    var eyebrow = document.querySelector('.hero__eyebrow');
    var line    = document.getElementById('hero-omega-thumb-line');
    var svg     = document.querySelector('.hero__lines');
    if (!eyebrow || !line || !svg) return;

    var svgRect     = svg.getBoundingClientRect();
    var eyebrowRect = eyebrow.getBoundingClientRect();

    /* ── Start: bottom-left of OMEGA eyebrow (underline origin) ── */
    var x1 = eyebrowRect.left - svgRect.left;
    var y1 = eyebrowRect.bottom - svgRect.top;

    /* ── End: thumb position derived from image layout ── */
    var vh         = window.innerHeight / 100;
    var imgHeight  = IMG_HEIGHT_VH * vh;
    var imgWidth   = imgHeight * (IMG_WIDTH_PX / IMG_HEIGHT_PX);   /* aspect-ratio preserving */
    var imgTop     = IMG_TOP_VH * vh;
    var imgLeft    = (window.innerWidth - imgWidth) / 2;            /* centered horizontally */

    var thumbViewportX = imgLeft + (THUMB_X_PX / IMG_WIDTH_PX) * imgWidth;

    /* Line is perfectly horizontal (180°) — x2 reaches the knuckle X,
       y2 stays at the same height as the underline start. */
    var x2 = thumbViewportX - svgRect.left;
    var y2 = y1;

    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
  }

  /* Expose for omega_intro.js to call during slide-up animation */
  window._positionHeroLine = positionLine;

  function init() {
    positionLine();
    window.addEventListener('resize', positionLine);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
