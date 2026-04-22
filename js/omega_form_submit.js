/* omega_form_submit.js
   Intercepts the MailChimp sign-up form, submits via JSONP (no page redirect),
   and shows a thank-you message below the submit button on success.
   No dependencies — vanilla JS, no module syntax. */

(function () {
  'use strict';

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

  /* ── Main submit handler ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailField = document.getElementById('mce-EMAIL');
    if (!emailField || !emailField.value.trim()) {
      showMessage('Please enter your email address.');
      return;
    }

    submitBtn.disabled = true;

    /* Unique callback name prevents collisions if somehow called twice */
    var callbackName = '_omegaMc' + Date.now();

    var params = new URLSearchParams({
      u:      '5f27c55368de67a4f5662f450',
      id:     '098dc2d309',
      f_id:   '00b7c2e1f0',
      FNAME:  (document.getElementById('mce-FNAME')  || {}).value || '',
      EMAIL:  emailField.value.trim(),
      PHONE:  (document.getElementById('mce-PHONE')  || {}).value || '',
      c:      callbackName
    });

    /* MailChimp JSONP endpoint — note post-json, not post */
    var script = document.createElement('script');
    script.src = 'https://omegasoundinc.us9.list-manage.com/subscribe/post-json?' + params.toString();

    /* Cleanup helper */
    function cleanup() {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      submitBtn.disabled = false;
    }

    /* MailChimp calls this with { result: 'success'|'error', msg: '...' } */
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

    /* Fallback if MailChimp never responds */
    var timer = setTimeout(function () {
      cleanup();
      showMessage('Request timed out. Please try again.');
    }, TIMEOUT_MS);

    document.head.appendChild(script);
  });
})();
