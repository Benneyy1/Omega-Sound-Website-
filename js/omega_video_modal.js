/* omega_video_modal.js
   YouTube lightbox triggered by #video-play-trigger.
   Lazy-mounts iframe on open; removes it entirely on close so audio stops.
   Focus is trapped inside the modal while open, returned to trigger on close. */

(function () {
  'use strict';

  var YT_VIDEO_ID = 'e42x0c0-YIY';
  var YT_BASE     = 'https://www.youtube-nocookie.com/embed/';
  var YT_PARAMS   = '?autoplay=1&rel=0&modestbranding=1';

  var modal    = document.getElementById('video-modal');
  var frame    = modal  && modal.querySelector('.video-modal__frame');
  var closeBtn = modal  && modal.querySelector('.video-modal__close');
  var backdrop = modal  && modal.querySelector('.video-modal__backdrop');
  var trigger  = document.getElementById('video-play-trigger');

  if (!modal || !frame || !closeBtn || !backdrop || !trigger) return;

  /* ── Focus trap ── */
  function getFocusableEls() {
    return Array.prototype.slice.call(
      modal.querySelectorAll(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function trapFocus(e) {
    var els   = getFocusableEls();
    var first = els[0];
    var last  = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  /* ── Open ── */
  function openModal() {
    var iframe = document.createElement('iframe');
    iframe.src            = YT_BASE + YT_VIDEO_ID + YT_PARAMS;
    iframe.allow          = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.title          = 'Omega — Life Is A Performance';
    frame.appendChild(iframe);

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    document.addEventListener('keydown', onKeyDown);
  }

  /* ── Close ── */
  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';

    /* Unmount iframe — stops YouTube audio completely */
    while (frame.firstChild) { frame.removeChild(frame.firstChild); }

    document.removeEventListener('keydown', onKeyDown);
    trigger.focus();
  }

  /* ── Keyboard: Escape to close, Tab to trap ── */
  function onKeyDown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab')    { trapFocus(e); }
  }

  trigger.addEventListener('click',  openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

}());
