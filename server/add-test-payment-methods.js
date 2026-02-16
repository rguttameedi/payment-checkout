const { sequelize } = require('./config/database');
const models = require('./models');

async function addTestPaymentMethods() {
  try {
    console.log('💳 Adding Test Payment Methods...\n');

    // Get test user (John Doe)
    const user = await models.User.findOne({
      where: { email: 'john.doe@example.com' }
    });

    if (!user) {
      console.error('❌ User not found: john.doe@example.com');
      return;
    }

    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    console.log('\n📝 Adding payment methods...\n');

    // 1. Add Test Credit Card (Discover)
    console.log('1️⃣  Adding Discover card...');
    const discoverCard = await models.PaymentMethod.create({
      user_id: user.id,
      payment_type: 'card',
      card_brand: 'Discover',
      card_last_four: '1234',
      card_expiry_month: '08',
      card_expiry_year: '2028',
      card_holder_name: 'John Doe',
      nickname: 'Discover Card',
      billing_address_line1: '456 Oak Avenue',
      billing_address_line2: 'Suite 200',
      billing_city: 'Los Angeles',
      billing_state: 'CA',
      billing_zip_code: '90001',
      billing_country: 'US',
      is_default: false,
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}_discover`,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(`   ✅ Discover card added (ID: ${discoverCard.id}) - ****${discoverCard.card_last_four}`);

    // 2. Add Test Bank Account (Chase Checking)
    console.log('\n2️⃣  Adding Chase checking account...');
    const chaseChecking = await models.PaymentMethod.create({
      user_id: user.id,
      payment_type: 'ach',
      account_type: 'checking',
      routing_number: '021000021',
      account_last_four: '5678',
      account_holder_name: 'John Doe',
      bank_name: 'Chase Bank',
      nickname: 'Chase Checking',
      billing_address_line1: '789 Pine Street',
      billing_city: 'Seattle',
      billing_state: 'WA',
      billing_zip_code: '98101',
      billing_country: 'US',
      is_default: false,
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}_chase`,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(`   ✅ Chase checking added (ID: ${chaseChecking.id}) - ****${chaseChecking.account_last_four}`);

    // 3. Add Test Bank Account (Bank of America Savings)
    console.log('\n3️⃣  Adding Bank of America savings account...');
    const boaSavings = await models.PaymentMethod.create({
      user_id: user.id,
      payment_type: 'ach',
      account_type: 'savings',
      routing_number: '026009593',
      account_last_four: '9012',
      account_holder_name: 'John Doe',
      bank_name: 'Bank of America',
      nickname: 'BofA Savings',
      billing_address_line1: '321 Elm Boulevard',
      billing_address_line2: 'Apt 45',
      billing_city: 'Chicago',
      billing_state: 'IL',
      billing_zip_code: '60601',
      billing_country: 'US',
      is_default: false,
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}_boa`,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(`   ✅ BofA savings added (ID: ${boaSavings.id}) - ****${boaSavings.account_last_four}`);

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ Successfully added 3 new payment methods!');
    console.log('═══════════════════════════════════════════════\n');

    // Show all payment methods for this user
    console.log('📋 All payment methods for John Doe:\n');
    const allPaymentMethods = await models.PaymentMethod.findAll({
      where: { user_id: user.id, status: 'active' },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    console.log('   CARDS:');
    allPaymentMethods
      .filter(pm => pm.payment_type === 'card')
      .forEach((pm, index) => {
        const defaultLabel = pm.is_default ? '⭐ DEFAULT' : '';
        console.log(`   ${index + 1}. ${pm.card_brand} ****${pm.card_last_four} - ${pm.nickname || 'No nickname'} ${defaultLabel}`);
      });

    console.log('\n   BANK ACCOUNTS:');
    allPaymentMethods
      .filter(pm => pm.payment_type === 'ach')
      .forEach((pm, index) => {
        const defaultLabel = pm.is_default ? '⭐ DEFAULT' : '';
        const accountTypeLabel = pm.account_type === 'checking' ? 'Checking' : 'Savings';
        console.log(`   ${index + 1}. ${pm.bank_name} ${accountTypeLabel} ****${pm.account_last_four} - ${pm.nickname || 'No nickname'} ${defaultLabel}`);
      });

    console.log(`\n   Total: ${allPaymentMethods.length} payment method(s)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
addTestPaymentMethods();
