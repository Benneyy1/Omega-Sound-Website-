/* omega_form_submit.js
   Intercepts the MailChimp sign-up form, submits via JSONP (no page redirect),
   and shows a thank-you message below the submit button on success.
   reCAPTCHA v3 token is generated before each submission to block non-JS bots.
   No dependencies — vanilla JS, no module syntax. */

(function () {
  'use strict';

  var RECAPTCHA_SITE_KEY = '6LfFj88sAAAAALtIPMLKS2R921HBlHDBfWScU63F';
  var TIMEOUT_MS = 8000;

  var form      = document.getElementById('mc-embedded-subscribe-form');
  var submitBtn = document.getElementById('mc-embedded-subscribe');
  if (!form || !submitBtn) return;

  /* ── Show a message node directly after the submit button ── */
  function showMessage(text) {
    var existing = document.getElementById('omega-form-msg');
    if (existing) existing.remove();

    var msg = document.createElement('p');
    msg.id = 'omega-form-msg';
    msg.textContent = text;
    submitBtn.insertAdjacentElement('afterend', msg);
  }

  /* ── Strip HTML tags MailChimp sometimes injects into msg strings ── */
  function stripHtml(str) {
    return str.replace(/<[^>]*>/g, '').trim();
  }

  /* ── Fire the MailChimp JSONP request ── */
  function submitToMailchimp(recaptchaToken) {
    var emailField = document.getElementById('mce-EMAIL');
    submitBtn.disabled = true;

    var callbackName = '_omegaMc' + Date.now();

    var params = new URLSearchParams({
      u:                   '5f27c55368de67a4f5662f450',
      id:                  '098dc2d309',
      f_id:                '00b7c2e1f0',
      FNAME:               (document.getElementById('mce-FNAME') || {}).value || '',
      EMAIL:               emailField.value.trim(),
      PHONE:               (document.getElementById('mce-PHONE') || {}).value || '',
      'g-recaptcha-response': recaptchaToken || '',
      c:                   callbackName
    });

    var script = document.createElement('script');
    script.src = 'https://omegasoundinc.us9.list-manage.com/subscribe/post-json?' + params.toString();

    function cleanup() {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      submitBtn.disabled = false;
    }

    window[callbackName] = function (data) {
      clearTimeout(timer);
      cleanup();

      if (data.result === 'success') {
        form.reset();
        showMessage('Thank you \u2014 you\u2019re on the list.');
      } else {
        var raw = stripHtml(data.msg || '');
        var text = raw.toLowerCase().indexOf('already subscribed') !== -1
          ? 'You\u2019re already on the list \u2014 thank you!'
          : (raw || 'Something went wrong. Please try again.');
        showMessage(text);
      }
    };

    var timer = setTimeout(function () {
      cleanup();
      showMessage('Request timed out. Please try again.');
    }, TIMEOUT_MS);

    document.head.appendChild(script);
  }

  /* ── Main submit handler ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailField = document.getElementById('mce-EMAIL');
    if (!emailField || !emailField.value.trim()) {
      showMessage('Please enter your email address.');
      return;
    }

    /* Generate reCAPTCHA v3 token, then submit.
       Falls back to submitting without a token if grecaptcha failed to load
       (e.g. ad blocker) so the form still works for real users. */
    if (window.grecaptcha && window.grecaptcha.execute) {
      /* grecaptcha.ready() fires even on unregistered domains, but
         grecaptcha.execute() returns a promise that never resolves there.
         The timeout lives INSIDE ready() so it covers the execute() hang. */
      grecaptcha.ready(function () {
        var settled = false;
        function proceed(token) {
          if (settled) return;
          settled = true;
          submitToMailchimp(token);
        }

        /* Fall through after 3 s if execute never resolves */
        setTimeout(function () { proceed(''); }, 3000);

        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then(function (token) { proceed(token); })
          .catch(function ()      { proceed('');    });
      });
    } else {
      submitToMailchimp('');
    }
  });
})();
