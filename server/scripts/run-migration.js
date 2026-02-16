const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: node run-migration.js <migration-file.sql>');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
const dbPath = path.join(__dirname, '..', 'database', 'rent_payment.sqlite');

// Check if migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database file not found: ${dbPath}`);
  process.exit(1);
}

// Read migration SQL
const sql = fs.readFileSync(migrationPath, 'utf8');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Run migration
console.log(`🔄 Running migration: ${migrationFile}`);
console.log('');

db.exec(sql, (err) => {
  if (err) {
    console.error('❌ Migration failed:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('');
  console.log('✅ Migration completed successfully!');

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
      process.exit(1);
    }
    console.log('✅ Database connection closed');
  });
});
