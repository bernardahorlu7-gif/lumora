const express = require('express');
const { query } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', asyncHandler(async (req, res) => {
  const [projectCounts, quoteTotals, recentProjects, recentActivity] = await Promise.all([
    query(`SELECT status, COUNT(*)::int AS count FROM projects GROUP BY status`),
    query(`SELECT status, COUNT(*)::int AS count, COALESCE(SUM(total),0)::float AS total_value
           FROM quotes GROUP BY status`),
    query(`SELECT p.id, p.reference_code, p.name, p.status, c.name AS client_name, p.updated_at
           FROM projects p LEFT JOIN clients c ON c.id = p.client_id
           ORDER BY p.updated_at DESC LIMIT 8`),
    query(`SELECT a.action, a.entity_type, a.created_at, u.full_name AS user_name
           FROM activity_log a LEFT JOIN users u ON u.id = a.user_id
           ORDER BY a.created_at DESC LIMIT 10`),
  ]);

  res.json({
    projectsByStatus: projectCounts.rows,
    quotesByStatus: quoteTotals.rows,
    recentProjects: recentProjects.rows,
    recentActivity: recentActivity.rows,
  });
}));

module.exports = router;
