/* api/subscribe.js — Vercel serverless function
   Verifies reCAPTCHA v3 token with Google, then adds subscriber to Mailchimp.
   Environment variables required: RECAPTCHA_SECRET_KEY, MAILCHIMP_API_KEY */

const MAILCHIMP_LIST_ID   = '098dc2d309';
const MAILCHIMP_SERVER    = 'us9';
const RECAPTCHA_SCORE_MIN = 0.5;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { fname = '', email = '', phone = '', recaptchaToken = '' } = req.body || {};

  if (!email) {
    return res.status(400).json({ ok: false, error: 'Email is required' });
  }

  /* ── 1. Verify reCAPTCHA token with Google ── */
  const verifyParams = new URLSearchParams({
    secret:   process.env.RECAPTCHA_SECRET_KEY,
    response: recaptchaToken,
  });

  let captchaData;
  try {
    const captchaRes = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      { method: 'POST', body: verifyParams }
    );
    captchaData = await captchaRes.json();
  } catch {
    return res.status(502).json({ ok: false, error: 'reCAPTCHA check failed' });
  }

  if (!captchaData.success || (captchaData.score ?? 0) < RECAPTCHA_SCORE_MIN) {
    return res.status(400).json({ ok: false, error: 'Bot detected' });
  }

  /* ── 2. Add subscriber to Mailchimp via API v3 ── */
  const mailchimpUrl = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  const auth = Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString('base64');

  let mcData;
  try {
    const mcRes = await fetch(mailchimpUrl, {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        email_address: email.trim(),
        status:        'subscribed',
        merge_fields:  {
          FNAME: fname.trim(),
          PHONE: phone.trim(),
        },
      }),
    });
    mcData = await mcRes.json();
  } catch {
    return res.status(502).json({ ok: false, error: 'Could not reach Mailchimp' });
  }

  if (mcData.status === 'subscribed' || mcData.id) {
    return res.status(200).json({ ok: true });
  }

  if (mcData.title === 'Member Exists') {
    return res.status(200).json({ ok: true, alreadySubscribed: true });
  }

  return res.status(400).json({ ok: false, error: mcData.detail || 'Subscription failed' });
};
