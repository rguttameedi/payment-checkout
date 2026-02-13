# 🚀 Quick Start Guide

Get your Rent Payment Application up and running in minutes!

---

## 📋 Prerequisites

- ✅ Node.js 14+ installed
- ✅ PostgreSQL database (Supabase account created)
- ✅ Cybersource sandbox account

---

## ⚡ Installation

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

**New packages for Phase 4:**
```bash
npm install node-cron axios
```

**All dependencies:**
- express - Web framework
- pg, pg-hstore, sequelize - PostgreSQL ORM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- dotenv - Environment variables
- cors - Cross-origin requests
- helmet - Security headers
- express-rate-limit - Rate limiting
- axios - HTTP client for Cybersource
- node-cron - Scheduled jobs

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

**Dependencies:**
- react, react-dom - UI library
- react-router-dom - Client-side routing
- axios - API requests

---

## 🔧 Configuration

### 1. Environment Variables

The `.env` file is already configured with:

```env
# Database (Supabase)
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.woaygvrkwnfphzvxuiwm
DB_PASSWORD=RentPayment2025!

# JWT
JWT_SECRET=5daaa5e325c2c3390839d3feefc22b0ca23e02ae8df7fe19876644918193328e
JWT_EXPIRES_IN=7d

# Cybersource
CYBERSOURCE_MERCHANT_ID=9059034_1770903917
CYBERSOURCE_API_KEY=19bb79cc-59aa-4a28-b5c9-2fa086d3c50e
CYBERSOURCE_SECRET_KEY=YMdMdBCLdgFmchmIEMWRgnW/9mr7Nge4legk3Efmtvs=
CYBERSOURCE_API_URL=https://apitest.cybersource.com
CYBERSOURCE_ENVIRONMENT=sandbox

# Payment Processing
ENABLE_RECURRING_PAYMENTS=true
PAYMENT_RETRY_ATTEMPTS=3
PAYMENT_RETRY_DELAY_HOURS=24

# Frontend
CLIENT_URL=http://localhost:3001

# Server
PORT=3000
NODE_ENV=development
```

**✅ No changes needed!** All values are pre-configured.

### 2. Database Setup

Your database is already set up in Supabase with:
- ✅ 7 tables created
- ✅ Sample data inserted
- ✅ SSL configuration

**Tables:**
1. users
2. properties
3. units
4. leases
5. payment_methods
6. rent_payments
7. recurring_payment_schedules

---

## 🏃 Running the Application

### Terminal 1: Start Backend Server

```bash
cd server
npm start
```

**Expected output:**
```
════════════════════════════════════════════════
  🚀 Rent Payment API Server Started!
════════════════════════════════════════════════
  Environment: development
  Port: 3000
  URL: http://localhost:3000
  Health: http://localhost:3000/api/health
════════════════════════════════════════════════

📅 Starting Recurring Payment Processor...
✅ Recurring Payment Processor started (runs daily at 2:00 AM)
```

### Terminal 2: Start React Frontend

```bash
cd client
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3001
  On Your Network:  http://192.168.1.x:3001
```

---

## 🎮 Testing the Application

### 1. Open Browser

Navigate to: **http://localhost:3001**

### 2. Login Credentials

**Tenant Account:**
- Email: `john.doe@example.com`
- Password: `Tenant123!`

**Admin Account:**
- Email: `admin@rentpay.com`
- Password: `Admin123!`

### 3. Test Payment Flow

**As Tenant:**
1. ✅ Login → Dashboard shows lease info
2. ✅ Go to Payment Methods → Add test card
   - Card: 4111111111111111
   - Expiry: 12/2025
   - CVV: 123
3. ✅ Go to Payments → Make payment
4. ✅ Set up Auto-Pay → Schedule recurring payment

**As Admin:**
1. ✅ Login → Dashboard shows statistics
2. ✅ Properties → View/manage properties
3. ✅ Tenants → View tenant list
4. ✅ Leases → Manage leases
5. ✅ Payments → View all payments and refunds

---

## 🧪 API Testing with cURL

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Tenant123!"
  }'
```

Save the token from the response!

### Get Dashboard

```bash
curl http://localhost:3000/api/tenant/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Process Payment

```bash
curl -X POST http://localhost:3000/api/payment/process \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "lease_id": 1,
    "payment_method_id": 1,
    "amount": "1500.00",
    "payment_month": 3,
    "payment_year": 2024
  }'
```

---

## 📊 Available Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tenant Portal
- `GET /api/tenant/dashboard` - Dashboard data
- `GET /api/tenant/payments` - Payment history
- `GET /api/tenant/payment-methods` - Saved payment methods
- `POST /api/tenant/payment-methods` - Add payment method
- `GET /api/tenant/recurring-schedule` - Auto-pay settings
- `POST /api/tenant/recurring-schedule` - Setup auto-pay

### Admin Portal
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/properties` - List properties
- `POST /api/admin/properties` - Create property
- `GET /api/admin/tenants` - List tenants
- `GET /api/admin/leases` - List leases
- `POST /api/admin/leases` - Create lease
- `GET /api/admin/payments` - View all payments

### Payment Processing
- `POST /api/payment/process` - Process rent payment
- `GET /api/payment/:id` - Get payment status
- `POST /api/payment/:id/refund` - Refund payment
- `POST /api/payment/webhook` - Cybersource webhook

---

## 🔄 Recurring Payments

The recurring payment processor runs automatically:

**Schedule:** Daily at 2:00 AM
**Processes:** All auto-pay schedules due that day

### Manual Trigger (for testing)

Create a test endpoint or use Node console:

```javascript
const processor = require('./server/jobs/recurringPaymentProcessor');

// Process all due payments now
await processor.processNow();

// Check status
console.log(processor.getStatus());
```

---

## 🐛 Troubleshooting

### Backend won't start

**Check:**
1. Dependencies installed: `npm install`
2. `.env` file exists in project root
3. Port 3000 not in use: `netstat -ano | findstr :3000`

**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Restart
npm start
```

### Frontend won't start

**Check:**
1. Dependencies installed: `cd client && npm install`
2. Backend is running on port 3000

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database connection fails

**Check:**
1. Supabase database is running
2. Network allows connection to Supabase
3. Credentials in `.env` are correct

**Solution:**
- Use Supabase SQL Editor if direct connection blocked by firewall
- Test from home/personal network

### Payments fail

**Check:**
1. Using test card numbers for sandbox
2. Cybersource credentials correct
3. Check server logs for detailed error

**Solution:**
- Use test card: 4111111111111111
- Verify `CYBERSOURCE_API_URL` is sandbox URL
- Check Cybersource dashboard

---

## 📚 Documentation

- **Phase 3 API Guide:** `PHASE3_API_GUIDE.md`
- **Phase 4 Payment Guide:** `PHASE4_PAYMENT_GUIDE.md`
- **Phase 3 Summary:** `PHASE3_SUMMARY.md`
- **Phase 4 Summary:** `PHASE4_SUMMARY.md`
- **Project Status:** `PROJECT_STATUS.md`

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:3001
- [ ] Health check works: http://localhost:3000/api/health
- [ ] Can login as tenant
- [ ] Can login as admin
- [ ] Dashboard loads correctly
- [ ] Payment methods page works
- [ ] Can view payment history
- [ ] Recurring payment processor started (check server logs)

---

## 🎉 You're Ready!

Your complete Rent Payment Application is now running with:

✅ **Full-Stack Architecture**
- Node.js/Express backend
- React frontend
- PostgreSQL database (Supabase)

✅ **Complete Features**
- User authentication (JWT)
- Tenant portal (pay rent, auto-pay, history)
- Admin portal (properties, tenants, leases)
- Payment processing (Cybersource)
- Recurring payments (automated)

✅ **Production-Ready**
- Security (Helmet, CORS, rate limiting)
- Error handling
- Validation
- Audit logging
- Responsive design

---

## 🚀 What's Next?

**Optional Enhancements:**
1. Email notifications (SendGrid/AWS SES)
2. SMS alerts (Twilio)
3. Payment reports/analytics
4. Mobile app (React Native)
5. Advanced search/filters
6. Document management
7. Maintenance requests

**Deployment (Phase 6):**
1. Set up production database
2. Configure production Cybersource account
3. Deploy backend (Heroku, AWS, DigitalOcean)
4. Deploy frontend (Vercel, Netlify)
5. Set up SSL certificates
6. Configure domain
7. Set up monitoring

---

**Happy coding! 🎊**

For questions or issues, check the documentation or server logs.
