# PostgreSQL Installation Guide for Windows

## Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download PostgreSQL 15 or 16 (recommended)
4. Choose the Windows x86-64 installer

**Direct Link:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

## Step 2: Install PostgreSQL

1. Run the downloaded installer (.exe file)
2. Follow the installation wizard:
   - **Installation Directory:** Use default (C:\Program Files\PostgreSQL\15)
   - **Components:** Select all (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - **Data Directory:** Use default
   - **Password:** Set a password for the `postgres` superuser
     - ⚠️ **IMPORTANT:** Remember this password! You'll need it.
     - Suggestion: Use something simple for development like `postgres123`
   - **Port:** Use default `5432`
   - **Locale:** Use default

3. Click through to complete installation

## Step 3: Verify Installation

1. Open Command Prompt (cmd) or PowerShell
2. Try running:
   ```bash
   psql --version
   ```

If this doesn't work, add PostgreSQL to your PATH:

### Add PostgreSQL to PATH (if needed)

1. Press `Windows + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab → "Environment Variables"
3. Under "System variables", find "Path", click "Edit"
4. Click "New" and add:
   ```
   C:\Program Files\PostgreSQL\15\bin
   ```
   (Replace `15` with your version number)
5. Click "OK" on all windows
6. **Close and reopen** Command Prompt/PowerShell
7. Try `psql --version` again

## Step 4: Test Connection

Open Command Prompt and run:
```bash
psql -U postgres
```

Enter your password when prompted. You should see:
```
postgres=#
```

Type `\q` to exit.

## Step 5: Update .env File

Once PostgreSQL is installed, update your `.env` file:

```env
DB_PASSWORD=your_actual_password_here
```

Replace `your_actual_password_here` with the password you set during installation.

## Alternative: Using Docker (Optional)

If you prefer Docker instead:

```bash
docker run --name rent-payment-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=rent_payment_db -p 5432:5432 -d postgres:15
```

Then update `.env`:
```env
DB_PASSWORD=postgres123
```

## Next Steps

After PostgreSQL is installed:
1. Update your `.env` file with the correct password
2. Run the database setup script: `npm run db:setup` (we'll create this)
3. Start your server: `npm start`

---

**Need Help?** Common issues:
- **Port 5432 already in use:** Another service is using the port. Stop it or use a different port.
- **psql not found:** PostgreSQL bin folder not in PATH. See Step 3.
- **Authentication failed:** Wrong password. Check your `.env` file.
