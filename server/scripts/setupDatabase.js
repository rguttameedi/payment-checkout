const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

async function setupDatabase() {
  console.log('\n==============================================');
  console.log('   🚀 Database Setup for Rent Payment App');
  console.log('==============================================\n');

  // Connect to database
  log.step('Connecting to PostgreSQL database...');

  const dbClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_HOST?.includes('supabase.com') ? { rejectUnauthorized: false } : false
  });

  try {
    await dbClient.connect();
    log.success('Connected to database successfully!');

    // Check if using Supabase
    const isSupabase = process.env.DB_HOST?.includes('supabase.com');
    if (isSupabase) {
      log.info('Using Supabase cloud database');
    }

    // Run migrations in order
    const migrationsDir = path.join(__dirname, '../../database/migrations');
    const migrationFiles = [
      '001-create-users.sql',
      '002-create-properties.sql',
      '003-create-units.sql',
      '004-create-leases.sql',
      '005-create-payment-methods.sql',
      '006-create-rent-payments.sql',
      '007-create-recurring-schedules.sql'
    ];

    console.log('\n--- Running Migrations ---\n');

    for (const file of migrationFiles) {
      log.step(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);

      if (!fs.existsSync(filePath)) {
        log.error(`Migration file not found: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await dbClient.query(sql);
        log.success(`Migration completed: ${file}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          log.warning(`Table already exists, skipping: ${file}`);
        } else {
          throw error;
        }
      }
    }

    // Run seed data
    console.log('\n--- Running Seed Data ---\n');
    log.step('Inserting sample data...');

    const seedFile = path.join(__dirname, '../../database/seeds/sample-data.sql');

    if (fs.existsSync(seedFile)) {
      const seedSql = fs.readFileSync(seedFile, 'utf8');

      try {
        await dbClient.query(seedSql);
        log.success('Sample data inserted successfully');
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          log.warning('Sample data already exists, skipping');
        } else {
          throw error;
        }
      }
    } else {
      log.warning('Seed file not found, skipping sample data');
    }

    // Verify tables
    console.log('\n--- Verifying Database ---\n');
    log.step('Checking tables...');

    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tablesResult = await dbClient.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);

    const expectedTables = [
      'users',
      'properties',
      'units',
      'leases',
      'payment_methods',
      'rent_payments',
      'recurring_payment_schedules'
    ];

    console.log('\nTables created:');
    expectedTables.forEach(table => {
      if (tables.includes(table)) {
        log.success(`  ${table}`);
      } else {
        log.error(`  ${table} (MISSING)`);
      }
    });

    // Show record counts
    console.log('\nRecord counts:');
    for (const table of expectedTables) {
      if (tables.includes(table)) {
        const countResult = await dbClient.query(`SELECT COUNT(*) FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`  ${table}: ${count} records`);
      }
    }

    await dbClient.end();

    // Success message
    console.log('\n==============================================');
    log.success('Database setup completed successfully!');
    console.log('==============================================\n');

    if (isSupabase) {
      console.log('✨ Your Supabase database is ready!\n');
    }

    console.log('Next steps:');
    console.log('  1. Start the server: npm start');
    console.log('  2. Test the API: curl http://localhost:3000/api/health');
    console.log('  3. See API_TESTING_GUIDE.md for more examples\n');

  } catch (error) {
    log.error('Database setup failed!');
    console.error(`\n${colors.red}Error details:${colors.reset}`, error.message);

    if (error.message.includes('authentication failed') || error.message.includes('password')) {
      console.log('\n' + colors.yellow + '❌ Authentication Error!' + colors.reset);
      console.log('Tips:');
      console.log('  1. Check DB_PASSWORD in .env file');
      console.log('  2. Make sure you replaced YOUR_SUPABASE_PASSWORD_HERE with your actual password');
      console.log('  3. Verify the password matches what you set in Supabase');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log('\n' + colors.yellow + '❌ Connection Error!' + colors.reset);
      console.log('Tips:');
      console.log('  1. Check your internet connection');
      console.log('  2. Verify DB_HOST in .env is correct');
      console.log('  3. Make sure your Supabase project is active');
    }

    process.exit(1);
  }
}

// Run the setup
setupDatabase();
