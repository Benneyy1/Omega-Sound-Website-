/* omega_device_glow.js
   Locks .device-glow-zone to the device orb in omega_handsconnected.png.
   Hover is detected via a mousemove ellipse hit-test on the document so
   the zone never intercepts pointer events — background ripple is unaffected. */

(function () {
  'use strict';

  /* Image layout constants — must match section2.css .hands-connected */
  var IMG_TOP_VH    = 20;    /* top: 20vh  */
  var IMG_HEIGHT_VH = 250;   /* height: 250vh */
  var IMG_WIDTH_PX  = 1248;  /* natural image width */
  var IMG_HEIGHT_PX = 3328;  /* natural image height */

  /* Device orb — 6 outline points: (614,578)(742,560)(832,350)(676,230)(546,282)(536,466)
     Bounding box center: X=(536+832)/2=684, Y=(230+578)/2=404
     Enclosing ellipse semi-axes (scaled 1.18× to contain all 6 points):
     a=175 image-px, b=205 image-px */
  var DEVICE_Y_FRAC = 0.1214;  /* 404 / 3328 */
  var DEVICE_X_FRAC = 0.548;   /* 684 / 1248 */
  var SEMI_X_IMG    = 175;     /* semi-axis x in image pixels */
  var SEMI_Y_IMG    = 205;     /* semi-axis y in image pixels */

  /* Computed page-pixel values, updated on every resize */
  var _anchorX = 0;  /* document x of orb center */
  var _anchorY = 0;  /* document y of orb center */
  var _semiX   = 0;  /* semi-axis x in page pixels */
  var _semiY   = 0;  /* semi-axis y in page pixels */

  function reposition() {
    var zone = document.querySelector('.device-glow-zone');
    if (!zone) return;

    var vh  = window.innerHeight / 100;
    var vw  = window.innerWidth;

    var imgRenderedH = IMG_HEIGHT_VH * vh;
    var imgRenderedW = imgRenderedH * (IMG_WIDTH_PX / IMG_HEIGHT_PX);
    var imgLeft      = (vw - imgRenderedW) / 2;
    var scale        = imgRenderedW / IMG_WIDTH_PX;  /* image-px → page-px */

    _anchorY = (IMG_TOP_VH * vh) + DEVICE_Y_FRAC * imgRenderedH;
    _anchorX = imgLeft + DEVICE_X_FRAC * imgRenderedW;
    _semiX   = SEMI_X_IMG * scale;
    _semiY   = SEMI_Y_IMG * scale;

    zone.style.top  = _anchorY.toFixed(2) + 'px';
    zone.style.left = _anchorX.toFixed(2) + 'px';
  }

  function hitTest(clientX, clientY) {
    var cx = clientX + window.scrollX;
    var cy = clientY + window.scrollY;
    var dx = cx - _anchorX;
    var dy = cy - _anchorY;
    return (dx * dx) / (_semiX * _semiX) +
           (dy * dy) / (_semiY * _semiY) <= 1;
  }

  function attachHover() {
    var zone    = document.querySelector('.device-glow-zone');
    if (!zone) return;
    var _active = false;

    document.addEventListener('mousemove', function (e) {
      var inside = hitTest(e.clientX, e.clientY);

      if (inside && !_active) {
        _active = true;
        zone.classList.add('is-active');
        document.body.style.cursor = 'pointer';
      } else if (!inside && _active) {
        _active = false;
        zone.classList.remove('is-active');
        document.body.style.cursor = '';
      }
    });

    document.addEventListener('click', function (e) {
      if (hitTest(e.clientX, e.clientY)) {
        window.location.href = 'demo.html';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      reposition();
      attachHover();
    });
  } else {
    reposition();
    attachHover();
  }
  window.addEventListener('resize', reposition);
}());
