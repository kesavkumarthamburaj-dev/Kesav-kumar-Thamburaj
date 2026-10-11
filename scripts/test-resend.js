import { Resend } from 'resend';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Attempt to load .env.local if present
const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  const content = readFileSync(envLocalPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

// Replace 're_xxxxxxxxx' with your real API key or set RESEND_API_KEY in .env.local
const apiKey = process.env.RESEND_API_KEY || 're_xxxxxxxxx';

if (!apiKey || apiKey === 're_xxxxxxxxx') {
  console.error('\n⚠️ Please replace "re_xxxxxxxxx" with your real Resend API key or set RESEND_API_KEY in .env.local.\n');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function sendTestEmail() {
  console.log(`Sending test email via Resend to kesavkumarthamburaj@gmail.com...`);
  
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'kesavkumarthamburaj@gmail.com',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });

  if (error) {
    console.error('❌ Failed to send email via Resend:', error);
    process.exit(1);
  }

  console.log('✅ Success! Test email sent via Resend.');
  console.log('Email ID:', data?.id);
}

sendTestEmail();
