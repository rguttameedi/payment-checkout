const { PaymentMethod, User } = require('../models');

(async () => {
  try {
    // Get all users
    const users = await User.findAll({ attributes: ['id', 'email', 'first_name', 'last_name'] });
    console.log('📋 Users in database:');
    users.forEach(u => console.log(`  - User ID: ${u.id}, Email: ${u.email}, Name: ${u.first_name} ${u.last_name}`));

    console.log('\n💳 Payment Methods by user:');
    for (const user of users) {
      const methods = await PaymentMethod.findAll({
        where: { user_id: user.id, status: 'active' },
        attributes: ['id', 'payment_type', 'card_brand', 'card_last_four', 'bank_name', 'account_last_four', 'is_default', 'nickname']
      });

      console.log(`\n  User ${user.id} (${user.email}):`);
      if (methods.length === 0) {
        console.log('    ❌ No payment methods');
      } else {
        console.log(`    ✅ Found ${methods.length} payment methods:`);
        methods.forEach(m => {
          if (m.payment_type === 'card') {
            console.log(`    - [${m.id}] ${m.card_brand} ending in ${m.card_last_four} ${m.is_default ? '(DEFAULT)' : ''}`);
          } else {
            console.log(`    - [${m.id}] ${m.bank_name || 'Bank'} account ending in ${m.account_last_four} ${m.is_default ? '(DEFAULT)' : ''}`);
          }
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
