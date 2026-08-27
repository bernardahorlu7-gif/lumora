const { query } = require('../db/pool');

function isConfigured() {
  return process.env.TEAMS_ENABLED === 'true' && !!process.env.TEAMS_WEBHOOK_URL;
}

/**
 * Posts a simple MessageCard to a Teams channel via an Incoming Webhook.
 * Set TEAMS_WEBHOOK_URL and TEAMS_ENABLED=true in .env to activate.
 * Docs: Teams channel -> ... -> Connectors -> Incoming Webhook.
 */
async function sendTeamsNotification({ title, text, eventType, relatedProjectId, relatedQuoteId }) {
  if (!isConfigured()) {
    await query(
      `INSERT INTO notifications_log (channel, event_type, recipient, subject, status, related_project_id, related_quote_id)
       VALUES ('teams', $1, 'team-channel', $2, 'skipped_not_configured', $3, $4)`,
      [eventType, title, relatedProjectId || null, relatedQuoteId || null]
    );
    console.log(`[teams] webhook not configured — skipped "${title}". Fill TEAMS_WEBHOOK_URL in .env to enable.`);
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch(process.env.TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: 'A9812F',
        title,
        text,
      }),
    });
    if (!res.ok) throw new Error(`Teams webhook returned HTTP ${res.status}`);

    await query(
      `INSERT INTO notifications_log (channel, event_type, recipient, subject, status, related_project_id, related_quote_id)
       VALUES ('teams', $1, 'team-channel', $2, 'sent', $3, $4)`,
      [eventType, title, relatedProjectId || null, relatedQuoteId || null]
    );
    return { sent: true };
  } catch (err) {
    await query(
      `INSERT INTO notifications_log (channel, event_type, recipient, subject, status, error_message, related_project_id, related_quote_id)
       VALUES ('teams', $1, 'team-channel', $2, 'failed', $3, $4, $5)`,
      [eventType, title, err.message, relatedProjectId || null, relatedQuoteId || null]
    );
    console.error('[teams] notification failed:', err.message);
    return { sent: false, reason: 'send_error', error: err.message };
  }
}

module.exports = { sendTeamsNotification, isConfigured };
