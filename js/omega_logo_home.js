/* omega_logo_home.js — Logo → home navigation.
 *
 * Uses click coordinates rather than event.target so the result is
 * independent of CSS stacking order and pointer-events on pseudo-elements.
 * If the click lands inside the logo's bounding box, go to index.html.
 */
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var logo = document.querySelector('a.hero__logo');
    if (!logo) return;

    var r = logo.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top  && e.clientY <= r.bottom) {
      window.location.href = 'index.html';
    }
  }, true); /* capture phase — fires before any other handler */

}());
