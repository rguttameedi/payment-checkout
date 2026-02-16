/**
 * Add more test cards to user ID 2
 */

const { PaymentMethod } = require('../models');

async function addMoreCards() {
  try {
    // Add test Mastercard
    await PaymentMethod.create({
      user_id: 2,
      payment_type: 'card',
      nickname: 'Test Mastercard',
      cybersource_token: `PI_CC_MC_2_${Date.now()}`,
      card_last_four: '5454',
      card_brand: 'Mastercard',
      card_expiry_month: '06',
      card_expiry_year: '2027',
      billing_address_line1: '789 Broadway',
      billing_city: 'New York',
      billing_state: 'NY',
      billing_zip_code: '10003',
      billing_country: 'US',
      is_default: false,
      status: 'active'
    });

    // Add test Amex
    await PaymentMethod.create({
      user_id: 2,
      payment_type: 'card',
      nickname: 'Test Amex',
      cybersource_token: `PI_CC_AMEX_2_${Date.now()}`,
      card_last_four: '1005',
      card_brand: 'American Express',
      card_expiry_month: '09',
      card_expiry_year: '2026',
      billing_address_line1: '321 Market Street',
      billing_city: 'Boston',
      billing_state: 'MA',
      billing_zip_code: '02101',
      billing_country: 'US',
      is_default: false,
      status: 'active'
    });

    console.log('✅ Added 2 more payment methods to user ID 2');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMoreCards();
