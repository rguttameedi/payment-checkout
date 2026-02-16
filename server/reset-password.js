const { sequelize } = require('./config/database');
const models = require('./models');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    console.log('🔐 Resetting password for test users...\n');

    // Get users
    const users = await models.User.findAll({
      where: {
        email: ['john.doe@example.com', 'tenant@test.com', 'admin@rentpay.com']
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    console.log(`Found ${users.length} user(s)`);

    // Reset password for each user
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    for (const user of users) {
      await sequelize.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        {
          replacements: [hashedPassword, user.id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`✅ Password reset for: ${user.email}`);
    }

    console.log(`\n✅ All passwords reset to: ${newPassword}`);
    console.log('\nYou can now login with:');
    console.log('  - john.doe@example.com / password123');
    console.log('  - tenant@test.com / password123');
    console.log('  - admin@rentpay.com / password123\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetPassword();
