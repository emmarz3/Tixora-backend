const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { generateQR } = require('../services/qrService');
const { sendTicketEmail } = require('../services/emailService');

const router = express.Router();

// Create ticket after payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { event_id, ticket_type, price, payment_reference } = req.body;

    // Verify payment exists
    const paymentCheck = await pool.query(
      'SELECT * FROM payments WHERE reference = $1 AND status = $2',
      [payment_reference, 'success']
    );
    if (paymentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    // Generate QR data
    const qrData = {
      ticketId: `TIX${Date.now()}`,
      eventId: event_id,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    };
    const qrCode = await generateQR(qrData);

    // Create ticket
    const ticketResult = await pool.query(
      `INSERT INTO tickets (event_id, user_id, ticket_type, price, qr_code, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [event_id, req.user.id, ticket_type, price, qrCode, 'confirmed']
    );

    const ticket = ticketResult.rows[0];

    // Get event details for email
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [event_id]);

    // Send email
    await sendTicketEmail(
      req.user.email,
      {
        event_title: eventResult.rows[0].title,
        date: eventResult.rows[0].date,
        location: eventResult.rows[0].location,
        ticket_id: qrData.ticketId,
        type: ticket_type
      },
      qrCode
    );

    // Update payment
    await pool.query(
      'UPDATE payments SET ticket_id = $1 WHERE reference = $2',
      [ticket.id, payment_reference]
    );

    res.status(201).json({
      message: 'Ticket created and emailed',
      ticket,
      qrCode
    });
  } catch (error) {
    console.error('Ticket creation failed:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get user tickets
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, e.title as event_title, e.date, e.location 
      FROM tickets t 
      JOIN events e ON t.event_id = e.id 
      WHERE t.user_id = $1 
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

module.exports = router;

