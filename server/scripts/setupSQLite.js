const { sequelize } = require('../config/database');
const models = require('../models');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

async function setupSQLite() {
  console.log('\n==============================================');
  console.log('   🚀 SQLite Database Setup');
  console.log('==============================================\n');

  try {
    log.step('Creating database tables from Sequelize models...');

    // Sync all models with database (create tables)
    await sequelize.sync({ force: false });

    log.success('All tables created successfully!');

    // Verify tables
    log.step('Verifying tables...');

    const tables = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nTables created:');
    tables.forEach(table => {
      if (table.name !== 'sqlite_sequence') {
        log.success(`  ${table.name}`);
      }
    });

    // Create sample admin user
    log.step('Creating sample admin user...');

    const { User } = models;

    const existingAdmin = await User.findOne({ where: { email: 'admin@rentpay.com' } });

    if (!existingAdmin) {
      await User.create({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@rentpay.com',
        password_hash: 'Admin123!', // Will be auto-hashed by model hook
        phone: '555-0100',
        role: 'admin',
        status: 'active'
      });
      log.success('Admin user created');
      console.log('    Email: admin@rentpay.com');
      console.log('    Password: Admin123!');
    } else {
      log.info('Admin user already exists');
    }

    // Create sample tenant user
    const existingTenant = await User.findOne({ where: { email: 'john.doe@example.com' } });

    if (!existingTenant) {
      await User.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password_hash: 'Tenant123!', // Will be auto-hashed by model hook
        phone: '555-0101',
        role: 'tenant',
        status: 'active'
      });
      log.success('Tenant user created');
      console.log('    Email: john.doe@example.com');
      console.log('    Password: Tenant123!');
    } else {
      log.info('Tenant user already exists');
    }

    // Success message
    console.log('\n==============================================');
    log.success('SQLite database setup completed!');
    console.log('==============================================\n');

    console.log('Next steps:');
    console.log('  1. Start the server: npm start');
    console.log('  2. Test the frontend: http://localhost:3000');
    console.log('  3. Login with:');
    console.log('     Admin: admin@rentpay.com / Admin123!');
    console.log('     Tenant: john.doe@example.com / Tenant123!\n');

  } catch (error) {
    log.error('Database setup failed!');
    console.error(`\n${colors.red}Error details:${colors.reset}`, error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
setupSQLite();
