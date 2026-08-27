const nodemailer = require('nodemailer');
const { query } = require('../db/pool');

function isConfigured() {
  return (
    process.env.EMAIL_ENABLED === 'true' &&
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'CHANGE_ME' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'CHANGE_ME'
  );
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs a "skipped" entry so
 * the rest of the app's flow (quote sent, project update, etc.) still works
 * end to end while credentials are pending.
 */
async function sendEmail({ to, subject, html, text, eventType, relatedProjectId, relatedQuoteId, attachments }) {
  if (!isConfigured()) {
    await query(
      `INSERT INTO notifications_log (channel, event_type, recipient, subject, status, related_project_id, related_quote_id)
       VALUES ('email', $1, $2, $3, 'skipped_not_configured', $4, $5)`,
      [eventType, to, subject, relatedProjectId || null, relatedQuoteId || null]
    );
    console.log(`[email] SMTP not configured — skipped "${subject}" to ${to}. Fill in .env to enable.`);
    return { sent: false, reason: 'not_configured' };
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to, subject, html, text, attachments,
    });
    await query(
      `INSERT INTO notifications_log (channel, event_type, recipient, subject, status, related_project_id, related_quote_id)
       VALUES ('email', $1, $2, $3, 'sent', $4, $5)`,
      [eventType, to, subject, relatedProjectId || null, relatedQuoteId || null]
    );
    return { sent: true };
  } catch (err) {
    await query(
      `INSERT INTO notifications_log (channel, event_type, recipient, subject, status, error_message, related_project_id, related_quote_id)
       VALUES ('email', $1, $2, $3, 'failed', $4, $5, $6)`,
      [eventType, to, subject, err.message, relatedProjectId || null, relatedQuoteId || null]
    );
    console.error('[email] send failed:', err.message);
    return { sent: false, reason: 'send_error', error: err.message };
  }
}

module.exports = { sendEmail, isConfigured };
