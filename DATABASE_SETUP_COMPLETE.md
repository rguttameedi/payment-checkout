# 🗄️ Complete Database Setup Guide

This guide will walk you through setting up PostgreSQL and your database from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Node.js installed (v16+)
- [ ] npm packages installed (`cd server && npm install`)
- [ ] A text editor to update .env file

---

## Step 1: Install PostgreSQL (If Not Already Installed)

### Option A: Windows Installer (Recommended)

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 installer
   - Direct link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Run the Installer:**
   - Double-click the downloaded .exe file
   - Follow installation wizard:
     - **Components:** Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
     - **Password:** Set password for `postgres` user
       - 💡 Suggestion for development: `postgres123`
       - ⚠️ **REMEMBER THIS PASSWORD!**
     - **Port:** Use default `5432`
     - **Locale:** Use default

3. **Add PostgreSQL to PATH:**
   - Press `Windows + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "System variables", find "Path", click "Edit"
   - Click "New" and add:
     ```
     C:\Program Files\PostgreSQL\15\bin
     ```
   - Click "OK" on all windows
   - **Close and reopen** any Command Prompt/PowerShell windows

4. **Verify Installation:**
   ```bash
   psql --version
   ```
   Should show: `psql (PostgreSQL) 15.x`

### Option B: Using Docker (Alternative)

If you prefer Docker:

```bash
docker run --name rent-payment-postgres ^
  -e POSTGRES_PASSWORD=postgres123 ^
  -e POSTGRES_DB=rent_payment_db ^
  -p 5432:5432 ^
  -d postgres:15
```

---

## Step 2: Update Environment Variables

1. **Open `.env` file** in the root directory:
   ```
   C:\Misc\Project_Learning\payment-checkout\.env
   ```

2. **Update Database Password:**
   Find this line:
   ```env
   DB_PASSWORD=your_postgres_password_here
   ```

   Replace with your actual PostgreSQL password:
   ```env
   DB_PASSWORD=postgres123
   ```
   (Or whatever password you set during installation)

3. **Generate and Update JWT Secret:**

   Open Command Prompt in the `server` folder and run:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the output and update this line:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-generated-secret
   ```

   Example:
   ```env
   JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
   ```

4. **Save the .env file**

---

## Step 3: Test Database Connection

Before setting up the database, let's verify PostgreSQL is running and accessible.

```bash
cd C:\Misc\Project_Learning\payment-checkout\server
npm run db:test
```

**Expected Output:**
```
==============================================
   🔍 Testing Database Connection
==============================================

ℹ Configuration:
  Host: localhost
  Port: 5432
  User: postgres
  Database: rent_payment_db
  Password: **********

Attempting to connect...
✓ Connected to PostgreSQL!
```

**If you see an error:**

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | PostgreSQL is not running. Check if service is started. |
| `authentication failed` | Wrong password. Update DB_PASSWORD in .env |
| `database "rent_payment_db" does not exist` | This is OK! Continue to Step 4 to create it. |

---

## Step 4: Run Database Setup

This automated script will:
- Create the `rent_payment_db` database
- Run all 7 migrations (create tables)
- Insert sample data
- Verify everything is set up correctly

```bash
npm run db:setup
```

**Expected Output:**
```
==============================================
   🚀 Database Setup for Rent Payment App
==============================================

→ Connecting to PostgreSQL server...
✓ Connected to PostgreSQL server
→ Checking if database exists...
→ Creating database 'rent_payment_db'...
✓ Database 'rent_payment_db' created
→ Connecting to rent_payment_db...
✓ Connected to rent_payment_db

--- Running Migrations ---

→ Running migration: 001-create-users.sql
✓ Migration completed: 001-create-users.sql
→ Running migration: 002-create-properties.sql
✓ Migration completed: 002-create-properties.sql
→ Running migration: 003-create-units.sql
✓ Migration completed: 003-create-units.sql
→ Running migration: 004-create-leases.sql
✓ Migration completed: 004-create-leases.sql
→ Running migration: 005-create-payment-methods.sql
✓ Migration completed: 005-create-payment-methods.sql
→ Running migration: 006-create-rent-payments.sql
✓ Migration completed: 006-create-rent-payments.sql
→ Running migration: 007-create-recurring-schedules.sql
✓ Migration completed: 007-create-recurring-schedules.sql

--- Running Seed Data ---

→ Inserting sample data...
✓ Sample data inserted successfully

--- Verifying Database ---

→ Checking tables...

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

==============================================
✓ Database setup completed successfully!
==============================================
```

---

## Step 5: Verify Database with pgAdmin (Optional)

If you want to visually explore the database:

1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to server:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: (your password)
3. Navigate to: Servers → PostgreSQL 15 → Databases → rent_payment_db → Schemas → public → Tables
4. You should see 7 tables

---

## Step 6: Start the Server

Now that the database is set up, start your Express server:

```bash
npm start
```

**Expected Output:**
```
Server running on port 3000
Database connected successfully
```

---

## Step 7: Test the API

Open a new terminal window and test the endpoints:

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

### 2. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"Test123!\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"role\":\"tenant\"}"
```

Expected: User object with token

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"Test123!\"}"
```

Expected: `{"token":"...", "user":{...}}`

**For detailed API testing, see: `API_TESTING_GUIDE.md`**

---

## 🔧 Troubleshooting

### Problem: "psql: command not found"

**Solution:**
- PostgreSQL bin folder is not in PATH
- See Step 1.3 to add PostgreSQL to PATH
- Restart your terminal after adding to PATH

### Problem: "password authentication failed"

**Solution:**
- Wrong password in .env file
- Verify DB_PASSWORD matches the password you set during PostgreSQL installation
- Try connecting manually: `psql -U postgres` and enter your password

### Problem: "Port 5432 already in use"

**Solution:**
- Another PostgreSQL instance is running
- Check Task Manager for postgres.exe processes
- Either stop the other instance or use a different port in .env

### Problem: "Database already exists"

**Solution:**
- The script will ask if you want to drop and recreate
- Type "yes" to recreate from scratch
- Or type "no" to keep existing data

### Problem: Server can't connect to database

**Solution:**
1. Make sure PostgreSQL service is running:
   ```bash
   # Check service status (Windows)
   sc query postgresql-x64-15
   ```

2. Test connection manually:
   ```bash
   npm run db:test
   ```

3. Verify .env settings match your PostgreSQL configuration

---

## 📊 Sample Data Included

The seed data creates:

**Users (3):**
- Admin: admin@example.com (password: Admin123!)
- Tenant 1: tenant1@example.com (password: Tenant123!)
- Tenant 2: tenant2@example.com (password: Tenant123!)

**Property:**
- Sunset Apartments (3 units: A101, A102, A103)

**Leases:**
- Tenant 1 → Unit A101 ($1,500/month)
- Tenant 2 → Unit A102 ($1,600/month)

**Payment Methods:**
- 2 tokenized cards for testing

**Payments:**
- 2 completed rent payments

---

## 🎯 What's Next?

Database is ready! Now you can:

1. ✅ Test authentication endpoints (see API_TESTING_GUIDE.md)
2. ⏳ Build tenant endpoints (Phase 3)
3. ⏳ Build admin endpoints (Phase 3)
4. ⏳ Integrate payment processing (Phase 4)
5. ⏳ Build React frontend (Phase 5)

---

## 🔄 Reset Database (If Needed)

If you need to start fresh:

```bash
npm run db:reset
```

This will drop and recreate the entire database with fresh sample data.

---

## ✅ Success Checklist

Before moving to Phase 3, verify:

- [ ] PostgreSQL is installed and running
- [ ] `psql --version` works
- [ ] .env file has correct DB_PASSWORD
- [ ] .env file has secure JWT_SECRET
- [ ] `npm run db:test` passes
- [ ] `npm run db:setup` completes successfully
- [ ] All 7 tables are created
- [ ] Sample data is inserted
- [ ] `npm start` runs without errors
- [ ] `/api/health` endpoint works
- [ ] `/api/auth/register` endpoint works

**Once all checkboxes are complete, you're ready for Phase 3!** 🚀

---

Need help? Check:
- `DATABASE_SETUP.md` - Original setup guide
- `API_TESTING_GUIDE.md` - API endpoint testing
- `PROJECT_STATUS.md` - Overall project status
