import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const BRAND = {
  name: 'Nakra',
  color: '#0f766e', // teal-700, same as the dashboard
  colorDark: '#115e59',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  background: '#f3f4f6',
};

export const transporter = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    })
  : null;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const FONT = "'Segoe UI', Tahoma, Arial, sans-serif";

/**
 * One layout for every email: table based + inline styles so it renders the same in
 * Gmail, Outlook and mobile apps. Right-to-left (Arabic).
 *
 * @param {object} p
 * @param {string} p.preheader  short preview text shown in the inbox list
 * @param {string} p.title
 * @param {string} [p.greeting]
 * @param {string[]} p.paragraphs
 * @param {{ text: string, url: string }} [p.button]
 * @param {string} [p.note]     small grey note under the button (e.g. expiry)
 * @param {string} [p.footerNote]
 */
export function renderEmail({ preheader, title, greeting, paragraphs, button, note, footerNote }) {
  const year = new Date().getFullYear();
  const p = (text) =>
    `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.8;color:${BRAND.text}">${escapeHtml(text)}</p>`;

  const buttonHtml = button
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto">
        <tr><td align="center" bgcolor="${BRAND.color}" style="border-radius:10px">
          <a href="${escapeHtml(button.url)}" target="_blank"
             style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px;background:${BRAND.color}">
            ${escapeHtml(button.text)}
          </a>
        </td></tr>
      </table>`
    : '';

  const noteHtml = note
    ? `<p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:1.7;color:${BRAND.muted};text-align:center">${escapeHtml(note)}</p>`
    : '';

  const fallbackHtml = button
    ? `<tr><td style="padding:20px 40px 32px;border-top:1px solid ${BRAND.border}">
        <p style="margin:0 0 8px;font-family:${FONT};font-size:13px;color:${BRAND.muted}">لو الزر مش شغال، انسخ الرابط ده وافتحه في المتصفح:</p>
        <p dir="ltr" style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;word-break:break-all;text-align:left">
          <a href="${escapeHtml(button.url)}" style="color:${BRAND.color}">${escapeHtml(button.url)}</a>
        </p>
      </td></tr>`
    : '';

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.background}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.background}">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" dir="rtl"
             style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border}">
        <tr><td style="background:${BRAND.color};background-image:linear-gradient(135deg,${BRAND.color},${BRAND.colorDark});padding:28px 40px;text-align:center">
          <span style="font-family:${FONT};font-size:26px;font-weight:bold;letter-spacing:1px;color:#ffffff">${BRAND.name}</span>
        </td></tr>
        <tr><td style="padding:36px 40px 16px;text-align:right">
          <h1 style="margin:0 0 20px;font-family:${FONT};font-size:22px;line-height:1.5;color:${BRAND.text}">${escapeHtml(title)}</h1>
          ${greeting ? p(greeting) : ''}
          ${paragraphs.map(p).join('')}
          ${buttonHtml}
          ${noteHtml}
        </td></tr>
        ${fallbackHtml}
      </table>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px">
        <tr><td style="padding:20px 16px;text-align:center;font-family:${FONT};font-size:12px;line-height:1.7;color:${BRAND.muted}">
          ${footerNote ? `${escapeHtml(footerNote)}<br>` : ''}
          دي رسالة تلقائية من ${BRAND.name}، من فضلك ما تردش عليها.<br>
          © ${year} ${BRAND.name}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    BRAND.name,
    '',
    title,
    '',
    ...(greeting ? [greeting, ''] : []),
    ...paragraphs.flatMap((x) => [x, '']),
    ...(button ? [`${button.text}: ${button.url}`, ''] : []),
    ...(note ? [note, ''] : []),
    ...(footerNote ? [footerNote] : []),
  ].join('\n');

  return { html, text };
}

/** Returns true if the email was handed to SMTP. Never throws (the app keeps working without email). */
async function send({ to, subject, link, ...content }) {
  if (!transporter) {
    if (config.isProduction) {
      console.warn(`[mail] SMTP is not configured; email "${subject}" to ${to} was NOT sent.`);
    } else {
      console.log(`\n[mail] SMTP not configured, printing instead.\n  To: ${to}\n  Subject: ${subject}\n  Link: ${link}\n`);
    }
    return false;
  }
  try {
    await transporter.sendMail({ from: config.mailFrom, to, subject, ...renderEmail(content) });
    return true;
  } catch (err) {
    console.error(`[mail] Failed to send "${subject}" to ${to}: ${err.message}`);
    return false;
  }
}

const IGNORE_NOTE = 'لو انت مش متوقع الرسالة دي، تقدر تتجاهلها بأمان ومش هيحصل أي تغيير على حسابك.';

export const emails = {
  passwordReset: (link) => ({
    subject: 'إعادة تعيين كلمة المرور | Nakra',
    preheader: 'رابط لتعيين كلمة مرور جديدة لحسابك على Nakra، صالح لمدة ساعة.',
    title: 'إعادة تعيين كلمة المرور',
    greeting: 'أهلاً بيك،',
    paragraphs: ['وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك على Nakra.', 'اضغط على الزر علشان تختار كلمة مرور جديدة.'],
    button: { text: 'تعيين كلمة مرور جديدة', url: link },
    note: 'الرابط صالح لمدة ساعة واحدة، ويستخدم مرة واحدة بس.',
    footerNote: IGNORE_NOTE,
    link,
  }),

  adminWelcome: (link) => ({
    subject: 'تمت إضافتك كمسؤول في Nakra',
    preheader: 'تمت إضافتك كمسؤول في لوحة تحكم Nakra. عيّن كلمة المرور وابدأ.',
    title: 'أهلاً بيك في فريق Nakra',
    greeting: 'أهلاً بيك،',
    paragraphs: [
      'تمت إضافتك كمسؤول (Admin) في لوحة تحكم Nakra.',
      'هتقدر تضيف المطاعم وتدير المنيو والأسعار وأكواد الـ QR ووسائل الدفع.',
      'علشان تبدأ، اضغط على الزر وعيّن كلمة المرور الخاصة بيك.',
    ],
    button: { text: 'تعيين كلمة المرور', url: link },
    note: 'الرابط صالح لمدة 3 أيام، ويستخدم مرة واحدة بس.',
    footerNote: IGNORE_NOTE,
    link,
  }),

  ownerInvitation: (restaurantName, link) => ({
    subject: `دعوة لإدارة ${restaurantName} على Nakra`,
    preheader: `اتبعتلك دعوة لإدارة ${restaurantName}: المنيو، الأسعار، الصور ووسائل الدفع.`,
    title: `دعوة لإدارة ${restaurantName}`,
    greeting: 'أهلاً بيك،',
    paragraphs: [
      `يسعدنا نبلغك إن تم تجهيز صفحة "${restaurantName}" على Nakra.`,
      'من خلال حسابك هتقدر تعدّل المنيو والأقسام والأسعار والصور، وتتابع رابط المنيو وأكواد الـ QR ووسائل الدفع (إنستاباي وفودافون كاش).',
      'اضغط على الزر علشان تنشئ كلمة المرور وتدخل على لوحة التحكم.',
    ],
    button: { text: 'قبول الدعوة والبدء', url: link },
    note: 'الدعوة صالحة لمدة 3 أيام، وتستخدم مرة واحدة بس.',
    footerNote: IGNORE_NOTE,
    link,
  }),

  test: () => ({
    subject: 'رسالة تجريبية | Nakra',
    preheader: 'لو وصلتك الرسالة دي، يبقى إعدادات البريد في Nakra شغالة.',
    title: 'إعدادات البريد شغالة',
    greeting: 'أهلاً بيك،',
    paragraphs: [
      'دي رسالة تجريبية من Nakra للتأكد إن إعدادات SMTP مظبوطة.',
      'كده رسائل إعادة تعيين كلمة المرور ودعوات المسؤولين وأصحاب المطاعم هتوصل بالشكل ده.',
    ],
    button: { text: 'فتح لوحة التحكم', url: `${config.frontendUrl}/login` },
    link: `${config.frontendUrl}/login`,
  }),
};

export const sendPasswordReset = (to, link) => send({ to, ...emails.passwordReset(link) });
export const sendAdminWelcome = (to, link) => send({ to, ...emails.adminWelcome(link) });
export const sendOwnerInvitation = (to, restaurantName, link) =>
  send({ to, ...emails.ownerInvitation(restaurantName, link) });
