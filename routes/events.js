const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as organizer 
      FROM events e 
      LEFT JOIN users u ON e.organizer_id = u.id 
      ORDER BY e.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (organizer only)
router.post('/', authenticateToken, authorizeRole(['organizer', 'admin']), async (req, res) => {
  try {
    const { title, description, date, location, price, capacity, image_url } = req.body;
    
    const result = await pool.query(
      `INSERT INTO events (title, description, date, location, price, capacity, image_url, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, date, location, price, capacity, image_url, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (eventResult.rows[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, date, location, price, capacity } = req.body;
    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, date=$3, location=$4, price=$5, capacity=$6 
       WHERE id=$7 RETURNING *`,
      [title, description, date, location, price, capacity, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

module.exports = router;

