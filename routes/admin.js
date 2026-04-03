const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Analytics dashboard
router.get('/analytics', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalTickets,
      totalRevenue,
      recentPayments
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM events'),
      pool.query('SELECT COUNT(*) as count FROM tickets'),
      pool.query('SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p WHERE p.status = $1', ['success']),
      pool.query('SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC LIMIT 10', ['success'])
    ]);

    res.json({
      stats: {
        totalUsers: Number(totalUsers.rows[0].count),
        totalEvents: Number(totalEvents.rows[0].count),
        totalTickets: Number(totalTickets.rows[0].count),
        totalRevenue: Number(totalRevenue.rows[0].total)
      },
      recentPayments: recentPayments.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Analytics fetch failed' });
  }
});

// List all users
router.get('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Users fetch failed' });
  }
});

module.exports = router;

