const { sequelize, RentPayment } = require('../models');

async function deleteRecentPayment() {
  try {
    console.log('🗑️  Deleting recent payments for user 4...');
    
    const result = await RentPayment.destroy({
      where: { tenant_id: 4 }
    });
    
    console.log(`✅ Deleted ${result} payment record(s)`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteRecentPayment();
