// ═══════════════════════════════════════════════════════════════
// OMEGA SOUND — Vercel Serverless Function (Google Sheets version)
// Verifies reCAPTCHA, then adds subscriber to Google Sheets
//
// Deploy: Place this file at /api/subscribe.js in your Vercel project
//
// Environment Variables (Vercel Dashboard → Settings → Environment Variables):
//   RECAPTCHA_SECRET  = your Google reCAPTCHA Secret Key
//   GOOGLE_SHEET_URL  = your Google Apps Script web app URL
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // ── CORS headers ──
  res.setHeader('Access-Control-Allow-Origin', 'https://www.omegasoundinc.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, firstName, phone, recaptchaToken } = req.body;

    // ── Validate required fields ──
    if (!email || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Email and reCAPTCHA verification are required.'
      });
    }

    // ── Verify reCAPTCHA with Google ──
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // ── Get subscriber IP ──
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
             || req.headers['x-real-ip']
             || req.socket?.remoteAddress
             || 'unknown';

    // ── Add subscriber to Google Sheets ──
    const sheetResponse = await fetch(process.env.GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        firstName: firstName || '',
        phone: phone || '',
        ip: ip
      }),
      redirect: 'follow' // Google Apps Script redirects on POST
    });

    const sheetData = await sheetResponse.json();

    if (sheetData.success) {
      return res.status(200).json({
        success: true,
        message: sheetData.message || 'You\'re on the list!'
      });
    }

    return res.status(500).json({
      success: false,
      message: sheetData.message || 'Something went wrong. Please try again.'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
}
