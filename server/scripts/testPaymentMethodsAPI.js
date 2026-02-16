const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Simulate different users
const users = [
  { id: 1, email: 'admin@rentpay.com', name: 'Admin User' },
  { id: 2, email: 'john.doe@example.com', name: 'John Doe' },
  { id: 3, email: 'tenant@test.com', name: 'Test Tenant' }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log(`🔑 Using JWT_SECRET: ${JWT_SECRET.substring(0, 20)}...`);

async function testUser(user) {
  try {
    // Generate JWT token for user (must use userId, not id)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'tenant' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`\n🔐 Testing User: ${user.name} (${user.email})`);
    console.log(`Token: ${token.substring(0, 50)}...`);

    // Make API call
    const response = await axios.get('http://localhost:50155/api/tenant/payment-methods', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Response data:`, JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data.length > 0) {
      console.log(`\n💳 Found ${response.data.data.length} payment methods:`);
      response.data.data.forEach(m => {
        if (m.payment_type === 'card') {
          console.log(`  - ${m.card_brand} ending in ${m.card_last_four} ${m.is_default ? '(DEFAULT)' : ''}`);
        } else {
          console.log(`  - ${m.bank_name || 'Bank'} account ending in ${m.account_last_four} ${m.is_default ? '(DEFAULT)' : ''}`);
        }
      });
    } else {
      console.log(`❌ No payment methods returned!`);
    }

  } catch (error) {
    console.error(`❌ Error for ${user.email}:`, error.response?.data || error.message);
  }
}

(async () => {
  console.log('🧪 Testing /api/tenant/payment-methods endpoint\n');
  console.log('=' .repeat(60));

  for (const user of users) {
    await testUser(user);
    console.log('=' .repeat(60));
  }

  process.exit(0);
})();
