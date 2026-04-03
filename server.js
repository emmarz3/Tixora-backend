require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const paymentRoutes = require('./routes/payments');
const ticketsRoutes = require('./routes/tickets');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const { dbConnect } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', './tixora/frontend'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
dbConnect();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Frontend proxy (for development)
app.use(express.static('../frontend'));

// Mock data endpoints for frontend demo
app.get('/api/events', (req, res) => {
  const mockEvents = [
    {
      id: 1,
      title: 'Tech Conference 2024',
      date: '2024-12-15',
      location: 'Lagos',
      price: 50000,
      image: 'https://images.unsplash.com/photo-1516321310764-9f3c3899c0a2?w=400',
      tickets: [{ type: 'General', price: 50000 }, { type: 'VIP', price: 100000 }]
    }
  ];
  res.json(mockEvents);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 TIXORA Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

