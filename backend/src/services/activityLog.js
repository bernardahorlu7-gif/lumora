const { query } = require('../db/pool');

async function logActivity({ userId, action, entityType, entityId, details }) {
  try {
    await query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, entityType, entityId || null, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    // Audit logging should never break the primary request
    console.error('[activityLog] failed to write entry:', err.message);
  }
}

module.exports = { logActivity };
