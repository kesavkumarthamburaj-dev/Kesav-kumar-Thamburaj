// Vercel Serverless Function: /api/contact.js
// Handles portfolio enquiry submissions with validation, honeypot spam guard,
// in-memory rate limiting, and delivery via the official Resend SDK.
import { Resend } from 'resend';

// In-memory rate limiting store (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 4;

function isRateLimited(clientIp) {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

// Cleanup stale rate limit records every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 15 * 60 * 1000).unref?.();

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Method Not Allowed. Please send a POST request.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: 'validation',
          fields: { form: 'Invalid JSON request payload' }
        });
      }
    }
    body = body || {};
    const { name, email, projectType, message, honeypot, _hp } = body;

    // 1. Honeypot check (Bots fill invisible fields)
    if (honeypot || _hp) {
      // Silently discard bot spam with 200 OK so bots think it succeeded
      return res.status(200).json({ ok: true });
    }

    // 2. Client IP extraction & Rate limiting
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown-ip';

    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'unknown-ip';
    const testRateLimit = req.headers['x-test-rate-limit'] === 'true';

    // Apply rate limit in production or if explicitly requested in tests
    if ((!isLocalhost || testRateLimit) && isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'rate_limit',
        message: 'Too many requests. Please wait a few minutes before submitting another enquiry.'
      });
    }

    // 3. Validation: Collect all failing fields with clean trimmed values
    const fields = {};

    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeText(email);
    const cleanProjectType = sanitizeText(projectType);
    const cleanMessage = sanitizeText(message);

    if (!cleanName || cleanName.length < 2) {
      fields.name = 'Name must be at least 2 characters';
    } else if (cleanName.length > 100) {
      fields.name = 'Name must be 100 characters or fewer';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      fields.email = 'Enter a valid email address';
    }

    const validProjectTypes = ['Packaging', 'Posters/Banners', 'Video editing', 'Software', 'Other'];
    if (!cleanProjectType || !validProjectTypes.includes(cleanProjectType)) {
      fields.projectType = 'Select a valid project type';
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      fields.message = 'Message must be at least 10 characters';
    } else if (cleanMessage.length > 3000) {
      fields.message = 'Message must be 3000 characters or fewer';
    }

    if (Object.keys(fields).length > 0) {
      return res.status(400).json({
        error: 'validation',
        fields,
      });
    }

    // 4. Check env vars (log server-side only without printing secret values)
    console.log('[Contact API] Env check: RESEND_API_KEY is', process.env.RESEND_API_KEY ? 'PRESENT' : 'MISSING');
    console.log('[Contact API] Env check: CONTACT_TO_EMAIL is', process.env.CONTACT_TO_EMAIL ? 'PRESENT' : 'MISSING');

    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.CONTACT_TO_EMAIL;

    if (!resendApiKey || !recipientEmail) {
      console.error('[Contact API] Missing environment variables: RESEND_API_KEY and/or CONTACT_TO_EMAIL.');
      return res.status(500).json({ error: 'config' });
    }

    // 5. Send email via official Resend SDK
    const resend = new Resend(resendApiKey);

    const emailText = `New Portfolio Enquiry:
Name: ${cleanName}
Email: ${cleanEmail}
Project Type: ${cleanProjectType}
Timestamp: ${new Date().toISOString()}

Message:
${cleanMessage}
`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #111111; background-color: #FFF8EC; color: #111111;">
        <div style="background-color: #FFD60A; padding: 16px; border-bottom: 2px solid #111111; margin: -24px -24px 20px -24px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px;">New Portfolio Enquiry</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #111111;">Received from Kesav Kumar T Portfolio</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: 700; width: 130px;">Name:</td>
            <td style="padding: 8px 0;">${cleanName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${cleanEmail}" style="color: #2F5BFF; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Project Type:</td>
            <td style="padding: 8px 0;"><span style="display: inline-block; background-color: #FF3D81; color: #111111; padding: 3px 8px; font-weight: 700; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${cleanProjectType}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Sent At:</td>
            <td style="padding: 8px 0; color: #555555;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
          </tr>
        </table>

        <div style="background-color: #FFFFFF; border: 1.5px solid #111111; padding: 16px; border-radius: 6px; margin-top: 12px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #777777;">Client Message:</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${cleanMessage}</p>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #CCCCCC; font-size: 12px; color: #777777; text-align: center;">
          Kesav Kumar T &bull; Packaging Designer, Video Editor & Software Founder &bull; Tamil Nadu, India
        </div>
      </div>
    `;

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'Kesav Portfolio <onboarding@resend.dev>',
      to: [recipientEmail],
      replyTo: cleanEmail,
      subject: `[Portfolio Enquiry] ${cleanProjectType} from ${cleanName}`,
      text: emailText,
      html: emailHtml,
    });

    if (resendError) {
      console.error('[Resend Error]', resendError?.message || resendError);
      return res.status(502).json({
        error: 'send_failed',
      });
    }

    return res.status(200).json({
      ok: true,
      id: resendData?.id
    });
  } catch (error) {
    console.error('[Contact Handler Error]', error);
    return res.status(500).json({
      error: 'server_error',
    });
  }
}
