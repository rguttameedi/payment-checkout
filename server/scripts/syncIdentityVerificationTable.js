const { sequelize, UserIdentityVerification } = require('../models');

async function syncIdentityVerificationTable() {
  try {
    console.log('🔄 Syncing user_identity_verifications table...');

    // Force sync only the UserIdentityVerification table
    await UserIdentityVerification.sync({ alter: true });

    console.log('✅ Table synced successfully!');

    // Verify table exists
    const tableInfo = await sequelize.getQueryInterface().describeTable('user_identity_verifications');
    console.log('\n📋 Table structure:');
    console.log(Object.keys(tableInfo).join(', '));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing table:', error);
    process.exit(1);
  }
}

syncIdentityVerificationTable();
