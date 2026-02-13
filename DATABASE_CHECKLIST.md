# ✅ Database Setup Checklist

Follow this step-by-step checklist to set up your database.

---

## 📦 Step 1: Install PostgreSQL

**Status:** ⬜ Not Started

### Tasks:
- [ ] Download PostgreSQL from https://www.postgresql.org/download/windows/
- [ ] Run installer (PostgreSQL 15 or 16)
- [ ] Set password during installation (e.g., `postgres123`)
- [ ] Remember or write down your password!
- [ ] Add PostgreSQL to PATH: `C:\Program Files\PostgreSQL\15\bin`
- [ ] Restart terminal
- [ ] Verify: Run `psql --version` in terminal

**Expected Result:** `psql (PostgreSQL) 15.x`

**Having issues?** See [INSTALL_POSTGRESQL.md](INSTALL_POSTGRESQL.md)

---

## 🔧 Step 2: Update Environment Variables

**Status:** ⬜ Not Started

### Tasks:
- [ ] Open `.env` file in root directory
- [ ] Update `DB_PASSWORD=postgres123` (use your actual password)
- [ ] Generate JWT secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Copy the output and update `JWT_SECRET=<paste-here>`
- [ ] Save `.env` file

**Your .env should look like:**
```env
DB_PASSWORD=postgres123
JWT_SECRET=a1b2c3d4e5f6...  (64 character hex string)
```

---

## 🔌 Step 3: Test Database Connection

**Status:** ⬜ Not Started

### Tasks:
- [ ] Open terminal
- [ ] Navigate to server folder:
  ```bash
  cd C:\Misc\Project_Learning\payment-checkout\server
  ```
- [ ] Install dependencies (if not done):
  ```bash
  npm install
  ```
- [ ] Test connection:
  ```bash
  npm run db:test
  ```

**Expected Output:**
```
✓ Connected to PostgreSQL!
⚠ No tables found in database
```

**If you see errors:**
- ❌ `ECONNREFUSED` → PostgreSQL not running
- ❌ `authentication failed` → Wrong password in .env
- ❌ `psql: command not found` → PostgreSQL not in PATH

---

## 🗄️ Step 4: Create Database and Tables

**Status:** ⬜ Not Started

### Tasks:
- [ ] Run database setup:
  ```bash
  npm run db:setup
  ```
- [ ] Wait for completion (should take ~10 seconds)
- [ ] Verify all 7 tables were created
- [ ] Verify sample data was inserted

**Expected Output:**
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

Record counts:
  users: 3 records
  properties: 1 records
  units: 3 records
  leases: 2 records
  payment_methods: 2 records
  rent_payments: 2 records
  recurring_payment_schedules: 1 records

✓ Database setup completed successfully!
```

---

## 🚀 Step 5: Start the Server

**Status:** ⬜ Not Started

### Tasks:
- [ ] Start the Express server:
  ```bash
  npm start
  ```
- [ ] Wait for "Database connected successfully" message
- [ ] Keep this terminal open

**Expected Output:**
```
Server running on port 3000
Database connected successfully
```

---

## ✅ Step 6: Test the API

**Status:** ⬜ Not Started

### Open a NEW terminal and test:

#### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```
- [ ] Expected: `{"status":"ok","timestamp":"..."}`

#### Test 2: Login with Sample User
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"tenant1@example.com\",\"password\":\"Tenant123!\"}"
```
- [ ] Expected: Token and user object returned

#### Test 3: Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"mytest@example.com\",\"password\":\"Test123!\",\"firstName\":\"My\",\"lastName\":\"Test\",\"role\":\"tenant\"}"
```
- [ ] Expected: New user created with token

**All tests passed?** ✅ Database setup is complete!

---

## 📊 Database Verification (Optional)

### Option 1: Using pgAdmin
- [ ] Open pgAdmin 4
- [ ] Connect to localhost (password: your postgres password)
- [ ] Navigate to: rent_payment_db → Schemas → public → Tables
- [ ] You should see 7 tables

### Option 2: Using psql Command Line
```bash
psql -U postgres -d rent_payment_db
```
Then run:
```sql
\dt  -- List all tables
SELECT COUNT(*) FROM users;  -- Should show 3
SELECT email FROM users;  -- Show all user emails
\q  -- Quit
```

---

## 🎉 Success Criteria

### All of these should be TRUE:

- ✅ PostgreSQL installed and `psql --version` works
- ✅ `.env` file has correct `DB_PASSWORD`
- ✅ `.env` file has secure `JWT_SECRET`
- ✅ `npm run db:test` passes
- ✅ `npm run db:setup` completes without errors
- ✅ All 7 tables created
- ✅ Sample data inserted (3 users, 1 property, etc.)
- ✅ `npm start` runs without errors
- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ Can login with `tenant1@example.com` / `Tenant123!`
- ✅ Can register new users

---

## 🔄 Need to Reset?

If something went wrong and you want to start over:

```bash
npm run db:reset
```

This will:
1. Drop the existing database
2. Create a fresh database
3. Run all migrations
4. Insert sample data

---

## 📚 Next Steps

Once all checks pass:

**✅ Phase 1 & 2 Complete:**
- Database schema ✅
- Authentication system ✅
- Database set up ✅

**⏳ Ready for Phase 3:**
- Build tenant API endpoints
- Build admin API endpoints
- Integrate payment processing

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| `psql: command not found` | Add PostgreSQL to PATH, restart terminal |
| `password authentication failed` | Check DB_PASSWORD in .env |
| `ECONNREFUSED` | Start PostgreSQL service |
| `Port 5432 already in use` | Stop other PostgreSQL instances |
| `Database already exists` | Run `npm run db:reset` |

**Detailed help:** See [DATABASE_SETUP_COMPLETE.md](DATABASE_SETUP_COMPLETE.md)

---

**Ready to start? Begin with Step 1! 🚀**
