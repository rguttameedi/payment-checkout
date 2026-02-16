/**
 * Script to add test payment methods to all users
 * Run with: node scripts/addTestCards.js
 */

const { PaymentMethod, User } = require('../models');
const { sequelize } = require('../config/database');

async function addTestCardsToAllUsers() {
  try {
    console.log('🔄 Adding test payment methods to all users...\n');

    // Get all active users
    const users = await User.findAll({
      where: { status: 'active' }
    });

    console.log(`Found ${users.length} active users\n`);

    for (const user of users) {
      console.log(`Processing user: ${user.email} (ID: ${user.id})`);

      // Check if user already has payment methods
      const existingMethods = await PaymentMethod.findAll({
        where: {
          user_id: user.id,
          status: 'active'
        }
      });

      if (existingMethods.length > 0) {
        console.log(`  ✓ User already has ${existingMethods.length} payment method(s)`);
        continue;
      }

      // Add test Visa card
      await PaymentMethod.create({
        user_id: user.id,
        payment_type: 'card',
        nickname: 'Test Visa Card',
        cybersource_token: `PI_CC_VISA_${user.id}_${Date.now()}`,
        card_last_four: '1111',
        card_brand: 'Visa',
        card_expiry_month: '12',
        card_expiry_year: '2025',
        billing_address_line1: '123 Main Street',
        billing_city: 'Seattle',
        billing_state: 'WA',
        billing_zip_code: '98101',
        billing_country: 'US',
        is_default: true,
        status: 'active'
      });

      // Add test Mastercard
      await PaymentMethod.create({
        user_id: user.id,
        payment_type: 'card',
        nickname: 'Test Mastercard',
        cybersource_token: `PI_CC_MC_${user.id}_${Date.now()}`,
        card_last_four: '4444',
        card_brand: 'Mastercard',
        card_expiry_month: '03',
        card_expiry_year: '2026',
        billing_address_line1: '456 Oak Avenue',
        billing_city: 'Portland',
        billing_state: 'OR',
        billing_zip_code: '97201',
        billing_country: 'US',
        is_default: false,
        status: 'active'
      });

      // Add test bank account
      await PaymentMethod.create({
        user_id: user.id,
        payment_type: 'ach',
        nickname: 'Test Checking Account',
        cybersource_token: `PI_BA_CHK_${user.id}_${Date.now()}`,
        account_last_four: '9876',
        account_type: 'checking',
        bank_name: 'Test Bank',
        billing_address_line1: '789 Pine Road',
        billing_city: 'San Francisco',
        billing_state: 'CA',
        billing_zip_code: '94102',
        billing_country: 'US',
        is_default: false,
        status: 'active'
      });

      console.log(`  ✅ Added 3 test payment methods (Visa, Mastercard, Checking)`);
    }

    console.log('\n✅ All done! Test payment methods added to all users.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
addTestCardsToAllUsers();
