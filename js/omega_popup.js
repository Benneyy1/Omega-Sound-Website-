/* omega_popup.js
   Waitlist sign-up widget \u2014 bottom-right slide-in card.
   Reads window.OMEGA_POPUP_DELAY (ms) set inline before this script loads.
   Uses sessionStorage so it only appears once per browser session.
   Submits to /api/subscribe (Google Sheets) via fetch + reCAPTCHA v3. */

(function () {
  'use strict';

  var DELAY           = (typeof window.OMEGA_POPUP_DELAY === 'number') ? window.OMEGA_POPUP_DELAY : 8000;
  var RECAPTCHA_KEY   = '6LfFj88sAAAAALtIPMLKS2R921HBlHDBfWScU63F';
  var SESSION_KEY     = 'omega_popup_shown';

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

    function doPost(token) {
      fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:          emailVal,
          firstName:      '',
          phone:          '',
          recaptchaToken: token || '',
        }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.disabled = false;
          if (data.success) {
            msgEl.textContent = data.message || 'You\u2019re on the list \u2014 thank you!';
            sessionStorage.setItem(SESSION_KEY, '1');
            setTimeout(hidePopup, 2200);
          } else {
            msgEl.textContent = data.message || 'Something went wrong. Please try again.';
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          msgEl.textContent = 'Something went wrong. Please try again.';
        });
    }

    if (window.grecaptcha && window.grecaptcha.execute) {
      grecaptcha.ready(function () {
        grecaptcha.execute(RECAPTCHA_KEY, { action: 'popup_subscribe' })
          .then(doPost)
          .catch(function () { doPost(''); });
      });
    } else {
      doPost('');
    }
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
