/* omega_popup.js
   Waitlist sign-up widget \u2014 bottom-right slide-in card.
   Reads window.OMEGA_POPUP_DELAY (ms) set inline before this script loads.
   Uses sessionStorage so it only appears once per browser session.
   Submits to the MailChimp endpoint via JSONP (email only). */

(function () {
  'use strict';

  var DELAY       = (typeof window.OMEGA_POPUP_DELAY === 'number') ? window.OMEGA_POPUP_DELAY : 8000;
  var MC_U        = '5f27c55368de67a4f5662f450';
  var MC_ID       = '098dc2d309';
  var MC_F_ID     = '00b7c2e1f0';
  var SESSION_KEY = 'omega_popup_shown';

  if (sessionStorage.getItem(SESSION_KEY)) return;

  var widget, closeBtn, form, inputEl, submitBtn, msgEl;

  function buildPopup() {
    widget = document.createElement('div');
    widget.className = 'popup-widget';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Join the Waitlist');

    widget.innerHTML = [
      '<button class="popup-close" aria-label="Close">&times;</button>',
      '<h2 class="popup-title">Join the<br>Waitlist</h2>',
      '<p class="popup-subtitle">Drop your email below to get notified when our production run opens.</p>',
      '<form class="popup-form" novalidate>',
        '<input class="popup-input" type="email" name="EMAIL"',
               'placeholder="your@email.com" autocomplete="email" required>',
        '<div style="position:absolute;left:-5000px;" aria-hidden="true">',
          '<input type="text" name="b_5f27c55368de67a4f5662f450_098dc2d309" tabindex="-1" value="">',
        '</div>',
        '<div class="popup-footer">',
          '<button type="submit" class="popup-submit">Submit</button>',
          '<span class="popup-disclaimer">No spam. Just creativity and updates on our next drop.</span>',
        '</div>',
        '<p class="popup-msg"></p>',
      '</form>'
    ].join('');

    document.body.appendChild(widget);

    closeBtn  = widget.querySelector('.popup-close');
    form      = widget.querySelector('.popup-form');
    inputEl   = widget.querySelector('[name="EMAIL"]');
    submitBtn = widget.querySelector('.popup-submit');
    msgEl     = widget.querySelector('.popup-msg');

    closeBtn.addEventListener('click', hidePopup);
    form.addEventListener('submit', handleSubmit);
  }

  function showPopup() {
    widget.getBoundingClientRect(); // force layout so transition fires
    widget.classList.add('is-visible');
  }

  function hidePopup() {
    widget.classList.remove('is-visible');
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  function handleSubmit(e) {
    e.preventDefault();
    var emailVal = inputEl.value.trim();
    if (!emailVal) { msgEl.textContent = 'Please enter your email address.'; return; }

    submitBtn.disabled = true;
    msgEl.textContent  = '';

    var cb = '_omegaPopup' + Date.now();
    var params = new URLSearchParams({
      u: MC_U, id: MC_ID, f_id: MC_F_ID,
      EMAIL: emailVal,
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

    var timer = setTimeout(function () {
      cleanup();
      msgEl.textContent = 'Request timed out. Please try again.';
    }, 8000);

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

}());
