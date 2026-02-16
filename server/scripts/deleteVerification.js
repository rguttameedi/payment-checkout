const { sequelize, UserIdentityVerification } = require('../models');

async function deleteVerification() {
  try {
    console.log('🗑️  Deleting identity verification for user 4...');
    
    const result = await UserIdentityVerification.destroy({
      where: { user_id: 4 }
    });
    
    console.log(`✅ Deleted ${result} verification record(s)`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteVerification();
