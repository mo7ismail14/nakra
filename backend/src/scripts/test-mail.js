// Checks the SMTP settings in backend/.env and sends one test email.
// Usage: npm run mail:test -- you@example.com [test|invite|reset|admin]
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { emails, renderEmail } from '../services/mail.service.js';

const to = process.argv[2];
const { host, port, secure, user, pass } = config.smtp;

if (!to || !to.includes('@')) {
  console.error('Usage: npm run mail:test -- you@example.com');
  process.exit(1);
}
if (!host) {
  console.error('SMTP_HOST is empty in backend/.env. Fill the SMTP_* values first.');
  process.exit(1);
}

console.log(`Connecting to ${host}:${port} (${secure ? 'SSL' : 'STARTTLS'}) as ${user || '(no user)'} ...`);
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user ? { user, pass } : undefined,
});

try {
  await transporter.verify();
  console.log('Login OK.');
  // Send with a chosen template so you can see how the real emails look:
  //   npm run mail:test -- you@example.com            -> test email
  //   npm run mail:test -- you@example.com invite     -> owner invitation sample
  //   npm run mail:test -- you@example.com reset|admin
  const samples = {
    test: () => emails.test(),
    invite: () => emails.ownerInvitation('كافيه النيل', `${config.frontendUrl}/invite/sample-token`),
    reset: () => emails.passwordReset(`${config.frontendUrl}/reset-password/sample-token`),
    admin: () => emails.adminWelcome(`${config.frontendUrl}/reset-password/sample-token`),
  };
  const kind = process.argv[3] || 'test';
  if (!samples[kind]) throw new Error(`Unknown template "${kind}". Use one of: ${Object.keys(samples).join(', ')}`);
  const { subject, link: _link, ...content } = samples[kind]();
  const info = await transporter.sendMail({ from: config.mailFrom, to, subject, ...renderEmail(content) });
  console.log(`Sent to ${to} (message id ${info.messageId}). Check the inbox and the spam folder.`);
} catch (err) {
  console.error(`\nFailed: ${err.message}`);
  if (err.code === 'EAUTH') {
    console.error('Wrong SMTP_USER / SMTP_PASS. For Gmail use an App Password, not your normal password.');
  } else if (['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS'].includes(err.code)) {
    console.error('Cannot reach the server. Check SMTP_HOST and SMTP_PORT (587 or 465), and your internet/firewall.');
  }
  process.exit(1);
}
