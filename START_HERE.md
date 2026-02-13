# 🚀 START HERE - Database Setup Quick Guide

## Current Status
✅ Phase 1: Database schema complete (7 migrations ready)
✅ Phase 2: Authentication system complete
⏳ **NEXT:** Set up PostgreSQL database

---

## Quick Start (3 Steps)

### Step 1: Install PostgreSQL

**Don't have PostgreSQL?** Install it first:
- See detailed guide: [INSTALL_POSTGRESQL.md](INSTALL_POSTGRESQL.md)
- Download: https://www.postgresql.org/download/windows/
- During install, set password (e.g., `postgres123`)
- Add to PATH: `C:\Program Files\PostgreSQL\15\bin`

**Verify installation:**
```bash
psql --version
```

---

### Step 2: Update .env File

Open `.env` and update these two lines:

1. **Database Password:**
   ```env
   DB_PASSWORD=postgres123
   ```
   (Use the password you set during PostgreSQL installation)

2. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy output and update:
   ```env
   JWT_SECRET=<paste-generated-secret-here>
   ```

---

### Step 3: Run Database Setup

Open terminal in `server` folder:

```bash
cd C:\Misc\Project_Learning\payment-checkout\server

# Install dependencies (if not done)
npm install

# Test database connection
npm run db:test

# Create database and run migrations
npm run db:setup

# Start the server
npm start
```

---

## Expected Results

After `npm run db:setup`, you should see:

```
✓ Database 'rent_payment_db' created
✓ Migration completed: 001-create-users.sql
✓ Migration completed: 002-create-properties.sql
✓ Migration completed: 003-create-units.sql
✓ Migration completed: 004-create-leases.sql
✓ Migration completed: 005-create-payment-methods.sql
✓ Migration completed: 006-create-rent-payments.sql
✓ Migration completed: 007-create-recurring-schedules.sql
✓ Sample data inserted successfully

Tables created:
✓  users
✓  properties
✓  units
✓  leases
✓  payment_methods
✓  rent_payments
✓  recurring_payment_schedules
```

---

## Test Your Setup

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test user registration
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"tenant\"}"

# Test login with sample user
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"tenant1@example.com\",\"password\":\"Tenant123!\"}"
```

---

## Sample Data Created

After setup, you'll have:

**Users:**
- `admin@example.com` (password: `Admin123!`) - Admin user
- `tenant1@example.com` (password: `Tenant123!`) - Tenant with active lease
- `tenant2@example.com` (password: `Tenant123!`) - Tenant with active lease

**Property:**
- Sunset Apartments with 3 units (A101, A102, A103)

**Leases:**
- Tenant 1 → Unit A101 ($1,500/month)
- Tenant 2 → Unit A102 ($1,600/month)

---

## 📁 Helpful Scripts

We've created these npm scripts for you:

| Command | Purpose |
|---------|---------|
| `npm run db:test` | Test database connection |
| `npm run db:setup` | Create database, run migrations, insert seed data |
| `npm run db:reset` | Drop and recreate database from scratch |
| `npm start` | Start the Express server |
| `npm run dev` | Start server with auto-reload (nodemon) |

---

## 🆘 Having Issues?

### Issue: "psql: command not found"
➜ PostgreSQL not installed or not in PATH
➜ See [INSTALL_POSTGRESQL.md](INSTALL_POSTGRESQL.md)

### Issue: "password authentication failed"
➜ Wrong password in .env file
➜ Update `DB_PASSWORD` to match your PostgreSQL password

### Issue: "ECONNREFUSED"
➜ PostgreSQL service not running
➜ Start PostgreSQL service from Services (Windows)

### Issue: "Port 5432 already in use"
➜ Another PostgreSQL instance is running
➜ Stop it or change port in .env

**For detailed troubleshooting:** See [DATABASE_SETUP_COMPLETE.md](DATABASE_SETUP_COMPLETE.md)

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **START_HERE.md** | This file - Quick start guide |
| **DATABASE_SETUP_COMPLETE.md** | Comprehensive setup guide with troubleshooting |
| **INSTALL_POSTGRESQL.md** | PostgreSQL installation guide |
| **API_TESTING_GUIDE.md** | API endpoint testing examples |
| **DATABASE_SETUP.md** | Original database documentation |
| **PROJECT_STATUS.md** | Complete project status and architecture |

---

## ✅ Success Checklist

Before moving to Phase 3:

- [ ] PostgreSQL installed (`psql --version` works)
- [ ] .env file updated with DB_PASSWORD
- [ ] .env file updated with JWT_SECRET
- [ ] `npm run db:test` passes
- [ ] `npm run db:setup` completes successfully
- [ ] Server starts without errors (`npm start`)
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Can register new user
- [ ] Can login with sample user

---

## 🎯 What's Next?

Once database is set up, we'll build:

**Phase 3: API Endpoints**
- Tenant endpoints (dashboard, payments, payment methods, auto-pay)
- Admin endpoints (properties, units, tenants, leases, payment monitoring)
- Payment service (Cybersource integration)

---

## Need Help?

1. Check [DATABASE_SETUP_COMPLETE.md](DATABASE_SETUP_COMPLETE.md) for detailed troubleshooting
2. Check [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for API examples
3. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for overall project info

**Ready? Let's set up that database! 🚀**
