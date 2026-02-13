const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

// Determine which database to use
const useSQLite = process.env.USE_SQLITE === 'true';
const isSupabase = process.env.DB_HOST?.includes('supabase.com');

// SQLite configuration
if (useSQLite) {
  const path = require('path');
  const dbPath = path.join(__dirname, '../database/rent_payment.sqlite');

  var sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });

  console.log(`🗄️  Using SQLite database at: ${dbPath}`);
}
// PostgreSQL configuration
else {
  var sequelize = new Sequelize(
    process.env.DATABASE_URL || {
      database: process.env.DB_NAME || 'rent_payment_db',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: isSupabase ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    console.error('   Please check your .env file and database configuration.');
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
