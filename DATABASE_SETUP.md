# Database Setup Guide

Complete guide to setting up the PostgreSQL database for the Rent Payment Application.

## Prerequisites

- PostgreSQL 12+ installed locally OR
- Render.com account (for cloud PostgreSQL)

## Option 1: Local PostgreSQL Setup (Development)

### Step 1: Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer, note the password you set for `postgres` user
3. Add PostgreSQL bin directory to PATH

**Mac (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

Open terminal/command prompt:

```bash
# Login as postgres user
psql -U postgres

# Create database
CREATE DATABASE rent_payment_db;

# Create user (optional, for better security)
CREATE USER rent_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rent_payment_db TO rent_admin;

# Exit psql
\q
```

### Step 3: Run Migrations

Navigate to your project directory:

```bash
cd C:\Misc\Project_Learning\payment-checkout

# Run each migration in order
psql -U postgres -d rent_payment_db -f database/migrations/001-create-users.sql
psql -U postgres -d rent_payment_db -f database/migrations/002-create-properties.sql
psql -U postgres -d rent_payment_db -f database/migrations/003-create-units.sql
psql -U postgres -d rent_payment_db -f database/migrations/004-create-leases.sql
psql -U postgres -d rent_payment_db -f database/migrations/005-create-payment-methods.sql
psql -U postgres -d rent_payment_db -f database/migrations/006-create-rent-payments.sql
psql -U postgres -d rent_payment_db -f database/migrations/007-create-recurring-schedules.sql
```

**OR run all at once:**

**Windows PowerShell:**
```powershell
Get-ChildItem database\migrations\*.sql | ForEach-Object { psql -U postgres -d rent_payment_db -f $_.FullName }
```

**Mac/Linux Bash:**
```bash
for file in database/migrations/*.sql; do
  psql -U postgres -d rent_payment_db -f "$file"
done
```

### Step 4: Verify Tables Created

```bash
psql -U postgres -d rent_payment_db

# List all tables
\dt

# You should see:
#  Schema |            Name             | Type  |  Owner
# --------+-----------------------------+-------+----------
#  public | users                       | table | postgres
#  public | properties                  | table | postgres
#  public | units                       | table | postgres
#  public | leases                      | table | postgres
#  public | payment_methods             | table | postgres
#  public | rent_payments               | table | postgres
#  public | recurring_payment_schedules | table | postgres

# Check table structure
\d users

# Exit
\q
```

### Step 5: Load Sample Data (Optional for Testing)

**IMPORTANT:** Before running seed data, you need to hash test passwords.

```bash
# In your project directory, create a quick password hasher
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Test123!', 10, (err, hash) => console.log(hash));"
```

Replace `$2a$10$YourHashedPasswordHere` in `database/seeds/sample-data.sql` with the actual hash.

Then run:

```bash
psql -U postgres -d rent_payment_db -f database/seeds/sample-data.sql
```

Verify seed data:

```bash
psql -U postgres -d rent_payment_db -c "SELECT COUNT(*) FROM users;"
# Should return: 5 (1 admin, 1 manager, 3 tenants)
```

### Step 6: Update .env File

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL=postgres://postgres:your_password@localhost:5432/rent_payment_db

# OR using individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rent_payment_db
DB_USER=postgres
DB_PASSWORD=your_password

# Generate a JWT secret
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_here
```

---

## Option 2: Render.com PostgreSQL Setup (Production)

### Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `rent-payment-db`
   - **Database:** `rent_payment_db`
   - **User:** (auto-generated)
   - **Region:** Oregon (US West) or nearest
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait for provisioning (1-2 minutes)

### Step 2: Get Connection Details

After creation, you'll see:

- **Internal Database URL** (for backend service)
- **External Database URL** (for local access)
- **PSQL Command** (for connecting via terminal)

**Example External URL:**
```
postgres://user:password@dpg-xxxx-xxxx.oregon-postgres.render.com/rent_payment_db
```

### Step 3: Run Migrations via Render Shell

**Option A: Using Render Shell (Recommended)**

1. In Render dashboard, go to your database
2. Click **"Connect"** → **"External Connection"** → Click **"PSQL Command"**
3. Copy the command (looks like `PGPASSWORD=xxx psql -h xxx...`)
4. In your local terminal, navigate to project directory
5. Run migrations:

```bash
# Replace with your actual PSQL command from Render
PGPASSWORD=your_password psql -h dpg-xxx.oregon-postgres.render.com -U user rent_payment_db < database/migrations/001-create-users.sql
```

**Repeat for migrations 002-007**.

**Option B: Using SQL Editor (Render Dashboard)**

1. In Render dashboard, go to your database
2. Scroll to **"Queries"** section
3. Copy contents of `001-create-users.sql`
4. Paste and click **"Run Query"**
5. Repeat for migrations 002-007

### Step 4: Verify Tables on Render

In Render SQL editor, run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all 7 tables listed.

### Step 5: Configure Environment Variables in Render

When deploying your backend service to Render:

1. Go to your web service dashboard
2. Click **"Environment"** tab
3. Add environment variables:
   - **DATABASE_URL:** (automatically added from database connection)
   - **JWT_SECRET:** Click "Generate Value" or paste your generated secret
   - **NODE_ENV:** `production`
   - **CYBERSOURCE_MERCHANT_ID:** (from your existing setup)
   - **CYBERSOURCE_API_KEY_ID:** (from your existing setup)
   - **CYBERSOURCE_SECRET_KEY:** (from your existing setup)
   - **CYBERSOURCE_ENVIRONMENT:** `apitest.cybersource.com` (or `api.cybersource.com` for prod)

---

## Database Management

### Backup Database

**Local:**
```bash
pg_dump -U postgres rent_payment_db > backup_$(date +%Y%m%d).sql
```

**Render:**
```bash
# Using external connection URL
PGPASSWORD=xxx pg_dump -h dpg-xxx.oregon-postgres.render.com -U user rent_payment_db > backup_production.sql
```

### Restore from Backup

**Local:**
```bash
psql -U postgres -d rent_payment_db < backup_20240213.sql
```

**Render:**
```bash
PGPASSWORD=xxx psql -h dpg-xxx.oregon-postgres.render.com -U user rent_payment_db < backup_production.sql
```

### Reset Database (Delete All Data)

**WARNING: This will delete ALL data!**

```sql
-- Connect to database
psql -U postgres -d rent_payment_db

-- Truncate all tables
TRUNCATE TABLE recurring_payment_schedules, rent_payments, payment_methods, leases, units, properties, users RESTART IDENTITY CASCADE;

-- Re-run seed data if needed
\i database/seeds/sample-data.sql
```

### Common Queries

**Check user count:**
```sql
SELECT role, COUNT(*) FROM users GROUP BY role;
```

**View all properties with unit count:**
```sql
SELECT p.name, p.city, p.state, COUNT(u.id) as unit_count
FROM properties p
LEFT JOIN units u ON u.property_id = p.id
GROUP BY p.id, p.name, p.city, p.state;
```

**View active leases with tenant info:**
```sql
SELECT
    u.first_name || ' ' || u.last_name as tenant_name,
    p.name as property_name,
    un.unit_number,
    l.monthly_rent,
    l.lease_start_date,
    l.lease_end_date
FROM leases l
JOIN users u ON u.id = l.tenant_id
JOIN units un ON un.id = l.unit_id
JOIN properties p ON p.id = un.property_id
WHERE l.status = 'active';
```

**Total rent collected this month:**
```sql
SELECT
    SUM(total_amount) as total_collected,
    COUNT(*) as payment_count
FROM rent_payments
WHERE payment_status = 'completed'
  AND payment_month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND payment_year = EXTRACT(YEAR FROM CURRENT_DATE);
```

---

## Troubleshooting

### Error: "database does not exist"
```bash
# Create the database first
createdb rent_payment_db
```

### Error: "role does not exist"
```bash
# Create user
createuser -s rent_admin
```

### Error: "permission denied"
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE rent_payment_db TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Can't connect to PostgreSQL
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql-x64-15

# Mac:
brew services start postgresql@15

# Linux:
sudo systemctl status postgresql
```

### Render database connection timeout
- Ensure you're using the **External Database URL** for local connections
- Render databases sleep after 90 days of inactivity (free tier)
- Check Render dashboard for database status

---

## Next Steps

After database setup is complete:

1. ✅ Database created and migrations run
2. ➡️ **Next:** Set up backend server (Phase 2)
3. Configure Sequelize ORM to connect to this database
4. Build API endpoints
5. Test database operations

See the main implementation plan for full roadmap.
