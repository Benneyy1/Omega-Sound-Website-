/* omega_form_submit.js
   Intercepts the sign-up form, gets a reCAPTCHA v3 token, then POSTs to the
   /api/subscribe serverless function which verifies the token and calls Mailchimp.
   No dependencies — vanilla JS, no module syntax. */

(function () {
  'use strict';

  var RECAPTCHA_SITE_KEY = '6LfFj88sAAAAALtIPMLKS2R921HBlHDBfWScU63F';
  var TIMEOUT_MS = 10000;

  var form      = document.getElementById('mc-embedded-subscribe-form');
  var submitBtn = document.getElementById('mc-embedded-subscribe');
  if (!form || !submitBtn) return;

  function showMessage(text) {
    var existing = document.getElementById('omega-form-msg');
    if (existing) existing.remove();
    var msg = document.createElement('p');
    msg.id = 'omega-form-msg';
    msg.textContent = text;
    submitBtn.insertAdjacentElement('afterend', msg);
  }

  function submitToApi(recaptchaToken) {
    var fname = (document.getElementById('mce-FNAME') || {}).value || '';
    var email = (document.getElementById('mce-EMAIL') || {}).value || '';
    var phone = (document.getElementById('mce-PHONE') || {}).value || '';

    submitBtn.disabled = true;

    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, TIMEOUT_MS);

    fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        fname:          fname.trim(),
        email:          email.trim(),
        phone:          phone.trim(),
        recaptchaToken: recaptchaToken || '',
      }),
      signal: controller.signal,
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        clearTimeout(timer);
        submitBtn.disabled = false;
        if (data.ok) {
          form.reset();
          showMessage(
            data.alreadySubscribed
              ? 'You’re already on the list — thank you!'
              : 'Thank you — you’re on the list.'
          );
        } else {
          showMessage(data.error || 'Something went wrong. Please try again.');
        }
      })
      .catch(function (err) {
        clearTimeout(timer);
        submitBtn.disabled = false;
        if (err.name === 'AbortError') {
          showMessage('Request timed out. Please try again.');
        } else {
          showMessage('Something went wrong. Please try again.');
        }
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailField = document.getElementById('mce-EMAIL');
    if (!emailField || !emailField.value.trim()) {
      showMessage('Please enter your email address.');
      return;
    }

    if (window.grecaptcha && window.grecaptcha.execute) {
      grecaptcha.ready(function () {
        var settled = false;
        function proceed(token) {
          if (settled) return;
          settled = true;
          submitToApi(token);
        }
        setTimeout(function () { proceed(''); }, 3000);
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then(function (token) { proceed(token); })
          .catch(function ()      { proceed('');    });
      });
    } else {
      submitToApi('');
    }
  });
})();
