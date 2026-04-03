const express = require('express');
const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize payment
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { amount, email, event_id, ticket_type } = req.body; // amount in kobo

    // Create pending payment record
    const paymentResult = await pool.query(
      `INSERT INTO payments (reference, amount, paystack_data) 
       VALUES ($1, $2, $3) RETURNING id, reference`,
      [`pay_${Date.now()}`, amount, JSON.stringify({ event_id, ticket_type, user_id: req.user.id })]
    );

    const initializeData = {
      amount,
      email,
      reference: paymentResult.rows[0].reference,
      callback_url: `${req.headers.origin || 'http://localhost:3000'}/payment-success`,
      metadata: {
        event_id,
        ticket_type,
        user_id: req.user.id
      }
    };

    const response = await Paystack.transaction.initialize(initializeData);
    
    res.json({
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      reference: response.data.reference
    });
  } catch (error) {
    console.error('Payment init failed:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Verify payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await Paystack.transaction.verify(reference);

    if (response.data.status === 'success') {
      // Update payment status
      await pool.query(
        'UPDATE payments SET status = $1, paystack_data = $2 WHERE reference = $3',
        ['success', response.data, reference]
      );

      res.json({ 
        status: 'success', 
        message: 'Payment verified',
        data: response.data 
      });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Webhook (Paystack sends this)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const event = req.body;
    
    // Verify webhook signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
      .update(JSON.stringify(event))
      .digest('hex');
    
    if (hash == req.headers['x-paystack-signature']) {
      if (event.event === 'charge.success') {
        const reference = event.data.reference;
        
        // Update payment
        await pool.query(
          'UPDATE payments SET status = $1 WHERE reference = $2',
          ['success', reference]
        );

        console.log('✅ Webhook processed:', reference);
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;

