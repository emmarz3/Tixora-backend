# 🚀 TIXORA Backend - Event Ticketing API

Production-ready **Node.js/Express/PostgreSQL** API for event ticketing.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/emmarz3/Tixora-backend)

## Quick Deploy to Render (5 mins)

1. **Connect GitHub**: Login Render.com → New Web Service → Connect GitHub (emmarz3/Tixora-backend)
2. **Settings**:
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Port: Auto (or set 10000)
3. **Environment Variables** (Dashboard → Environment):
   ```
   DATABASE_URL=postgresql://...  # Render Postgres or external
   JWT_SECRET=your-secure-secret
   PAYSTACK_SECRET_KEY=sk_test_...
   PAYSTACK_PUBLIC_KEY=pk_test_...
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=app-password
   # Full list: .env.example
   ```
4. **Deploy** → Live URL: `https://your-app.onrender.com`

**API Docs**: `/docs` (Swagger if added) or test `/health`, `/api/events`

## Local Setup

```bash
git clone https://github.com/emmarz3/Tixora-backend.git
cd Tixora-backend
npm install
cp .env.example .env  # Edit with your keys
npm start
```

Live: http://localhost:3000

## Features

- ✅ JWT Auth (/api/auth/register, /login)
- ✅ Events CRUD (/api/events)
- ✅ Paystack Payments (/api/payments)
- ✅ QR Tickets + Email Delivery
- ✅ Admin Dashboard Data
- ✅ PostgreSQL ORM-ready
- ✅ Rate Limited + Helmet Security

## Env Vars Required

See `.env.example`

## Endpoints

```
GET    /api/events           List events
POST   /api/auth/register    Create user
POST   /api/auth/login       Login + JWT
POST   /api/payments/init    Paystack checkout
POST   /api/tickets/qr       Generate QR
GET    /health               Status
```

## Production Notes

- **DB**: Render PostgreSQL (free tier) → copy DATABASE_URL
- **Paystack**: Test cards `4084084084084081`
- **Email**: Gmail App Password (not regular password)
- **Scaling**: Render auto-scales, Postgres persistent

---
⭐ Star on GitHub | Deploy & Enjoy!

