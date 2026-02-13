const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testConnection() {
  console.log('\n==============================================');
  console.log('   🔍 Testing Database Connection');
  console.log('==============================================\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rent_payment_db',
    ssl: process.env.DB_HOST?.includes('supabase.com') ? { rejectUnauthorized: false } : false
  };

  log.info('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  Password: ${'*'.repeat(config.password?.length || 0)}\n`);

  const client = new Client(config);

  try {
    console.log('Attempting to connect...');
    await client.connect();
    log.success('Connected to PostgreSQL!\n');

    // Test query
    log.info('Running test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    log.success('Query successful!\n');

    console.log('PostgreSQL Version:');
    console.log(`  ${result.rows[0].pg_version}\n`);
    console.log('Current Time:');
    console.log(`  ${result.rows[0].current_time}\n`);

    // Check if tables exist
    log.info('Checking for tables...');
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tablesResult = await client.query(tablesQuery);

    if (tablesResult.rows.length === 0) {
      log.warning('No tables found in database');
      console.log('\nRun: npm run db:setup\n');
    } else {
      log.success(`Found ${tablesResult.rows.length} tables:\n`);
      tablesResult.rows.forEach(row => {
        console.log(`    - ${row.table_name}`);
      });
      console.log('');
    }

    await client.end();

    console.log('==============================================');
    log.success('Database connection test passed!');
    console.log('==============================================\n');

  } catch (error) {
    log.error('Connection failed!\n');
    console.error(`${colors.red}Error:${colors.reset} ${error.message}\n`);

    if (error.message.includes('authentication failed')) {
      log.warning('Check your DB_PASSWORD in .env file');
    } else if (error.message.includes('ECONNREFUSED')) {
      log.warning('PostgreSQL is not running or not accessible on port 5432');
      console.log('\nTroubleshooting:');
      console.log('  1. Make sure PostgreSQL is installed');
      console.log('  2. Check if PostgreSQL service is running');
      console.log('  3. Verify the port in .env (default: 5432)');
    } else if (error.message.includes('does not exist')) {
      log.warning(`Database '${config.database}' does not exist`);
      console.log('\nRun: npm run db:setup');
    }

    console.log('');
    process.exit(1);
  }
}

testConnection();
