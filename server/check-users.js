const { sequelize } = require('./config/database');
const models = require('./models');

async function checkUsers() {
  try {
    console.log('📋 Checking users in database...\n');

    const users = await models.User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.first_name} ${user.last_name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log('---');
    });

    console.log('\n💡 Note: Default password is usually "password123" for test users');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
