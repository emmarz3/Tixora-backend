const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const dbConnect = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Create tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        price INTEGER NOT NULL,
        organizer_id INTEGER REFERENCES users(id),
        capacity INTEGER,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        user_id INTEGER REFERENCES users(id),
        ticket_type VARCHAR(100),
        price INTEGER NOT NULL,
        qr_code VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES tickets(id),
        reference VARCHAR(255) UNIQUE NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        paystack_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

module.exports = { pool, dbConnect };
