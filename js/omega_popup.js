/* omega_popup.js
   Pre-order sign-up modal.
   Reads window.OMEGA_POPUP_DELAY (ms) set inline before this script loads.
   Uses sessionStorage to show the popup only once per browser session.
   Submits to the same MailChimp endpoint as the palm form via JSONP. */

(function () {
  'use strict';

  var DELAY     = (typeof window.OMEGA_POPUP_DELAY === 'number') ? window.OMEGA_POPUP_DELAY : 10000;
  var MC_U      = '5f27c55368de67a4f5662f450';
  var MC_ID     = '098dc2d309';
  var MC_F_ID   = '00b7c2e1f0';
  var SESSION_KEY = 'omega_popup_shown';

  if (sessionStorage.getItem(SESSION_KEY)) return;

  var overlay, closeBtn, form, submitBtn, msgEl;

  function buildPopup() {
    overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = [
      '<div class="popup-card">',
        '<button class="popup-close" aria-label="Close">&times;</button>',
        '<div class="popup-logo">',
          '<img src="assets/omega_logo.png" alt="Omega Sound" draggable="false">',
        '</div>',
        '<p class="popup-headline">Pre-order coming soon. Be first to know.</p>',
        '<form class="popup-form" novalidate>',
          '<input class="popup-input" type="text"  name="FNAME"  placeholder="First Name"  autocomplete="given-name">',
          '<input class="popup-input" type="email" name="EMAIL"  placeholder="E-Mail"       autocomplete="email" required>',
          '<input class="popup-input" type="tel"   name="PHONE"  placeholder="Phone Number" autocomplete="tel">',
          '<div style="position:absolute;left:-5000px;" aria-hidden="true">',
            '<input type="text" name="b_5f27c55368de67a4f5662f450_098dc2d309" tabindex="-1" value="">',
          '</div>',
          '<button type="submit" class="popup-submit">Notify Me</button>',
        '</form>',
        '<p class="popup-msg"></p>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    closeBtn  = overlay.querySelector('.popup-close');
    form      = overlay.querySelector('.popup-form');
    submitBtn = overlay.querySelector('.popup-submit');
    msgEl     = overlay.querySelector('.popup-msg');

    closeBtn.addEventListener('click', hidePopup);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hidePopup();
    });

    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { hidePopup(); document.removeEventListener('keydown', onKey); }
    });

    form.addEventListener('submit', handleSubmit);
  }

  function showPopup() {
    overlay.getBoundingClientRect();
    overlay.classList.add('is-visible');
  }

  function hidePopup() {
    overlay.classList.remove('is-visible');
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  function handleSubmit(e) {
    e.preventDefault();
    var emailVal = form.querySelector('[name="EMAIL"]').value.trim();
    if (!emailVal) { msgEl.textContent = 'Please enter your email address.'; return; }

    submitBtn.disabled = true;
    msgEl.textContent = '';

    var cb = '_omegaPopup' + Date.now();
    var params = new URLSearchParams({
      u: MC_U, id: MC_ID, f_id: MC_F_ID,
      FNAME: form.querySelector('[name="FNAME"]').value,
      EMAIL: emailVal,
      PHONE: form.querySelector('[name="PHONE"]').value,
      c: cb
    });

    var script = document.createElement('script');
    script.src = 'https://omegasoundinc.us9.list-manage.com/subscribe/post-json?' + params.toString();

    function cleanup() {
      delete window[cb];
      if (script.parentNode) script.parentNode.removeChild(script);
      submitBtn.disabled = false;
    }

    window[cb] = function (data) {
      clearTimeout(timer);
      cleanup();
      if (data.result === 'success') {
        msgEl.textContent = 'You\u2019re on the list \u2014 thank you!';
        sessionStorage.setItem(SESSION_KEY, '1');
        setTimeout(hidePopup, 2200);
      } else {
        var raw = (data.msg || '').replace(/<[^>]*>/g, '').trim();
        msgEl.textContent = raw.toLowerCase().indexOf('already subscribed') !== -1
          ? 'You\u2019re already on the list!'
          : (raw || 'Something went wrong. Please try again.');
      }
    };

    var timer = setTimeout(function () { cleanup(); msgEl.textContent = 'Request timed out. Please try again.'; }, 8000);
    document.head.appendChild(script);
  }

  function boot() {
    buildPopup();
    setTimeout(showPopup, DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
