const http = require('http');

async function verifyPaymentMethods() {
  try {
    console.log('🔍 Verifying Payment Methods via API\n');
    console.log('═══════════════════════════════════════════════\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'password123'
    });

    if (!loginResponse.success) {
      console.error('❌ Login failed:', loginResponse);
      return;
    }

    const token = loginResponse.token;
    console.log('   ✅ Login successful\n');

    // Step 2: Fetch payment methods
    console.log('2️⃣  Fetching payment methods from API...');
    const response = await makeRequest('GET', '/api/tenant/payment-methods', null, token);

    if (!response.success) {
      console.error('❌ Failed to fetch payment methods:', response);
      return;
    }

    const paymentMethods = response.data;
    console.log(`   ✅ Found ${paymentMethods.length} payment method(s)\n`);

    // Display cards
    console.log('   💳 CREDIT/DEBIT CARDS:\n');
    const cards = paymentMethods.filter(pm => pm.payment_type === 'card');
    cards.forEach((card, index) => {
      const defaultBadge = card.is_default ? '⭐ DEFAULT' : '';
      console.log(`   ${index + 1}. ${card.card_brand} ending in ${card.card_last_four}`);
      console.log(`      Nickname: ${card.nickname || 'None'}`);
      console.log(`      Expires: ${card.card_expiry_month}/${card.card_expiry_year}`);
      console.log(`      Address: ${card.billing_city}, ${card.billing_state} ${card.billing_zip_code}`);
      console.log(`      ${defaultBadge}\n`);
    });

    // Display bank accounts
    console.log('   🏦 BANK ACCOUNTS:\n');
    const bankAccounts = paymentMethods.filter(pm => pm.payment_type === 'ach');
    bankAccounts.forEach((account, index) => {
      const defaultBadge = account.is_default ? '⭐ DEFAULT' : '';
      const accountType = account.account_type === 'checking' ? 'Checking' : 'Savings';
      console.log(`   ${index + 1}. ${account.bank_name} ${accountType} ending in ${account.account_last_four}`);
      console.log(`      Nickname: ${account.nickname || 'None'}`);
      console.log(`      Address: ${account.billing_city}, ${account.billing_state} ${account.billing_zip_code}`);
      console.log(`      ${defaultBadge}\n`);
    });

    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Total: ${cards.length} card(s) + ${bankAccounts.length} bank account(s) = ${paymentMethods.length} payment methods`);
    console.log('═══════════════════════════════════════════════\n');

    // Step 3: Test payment with new bank account
    console.log('3️⃣  Testing $25 payment with Chase checking account...\n');

    const chaseAccount = bankAccounts.find(ba => ba.bank_name === 'Chase Bank');
    if (!chaseAccount) {
      console.log('   ⚠️  Chase account not found, skipping payment test');
      return;
    }

    const dashboard = await makeRequest('GET', '/api/tenant/dashboard', null, token);
    const leaseId = dashboard.data.lease.id;

    const paymentData = {
      lease_id: leaseId,
      payment_method_id: chaseAccount.id,
      amount: 25.00,
      payment_month: 4, // April 2026
      payment_year: 2026
    };

    console.log('   Payment details:');
    console.log(`   - Amount: $${paymentData.amount}`);
    console.log(`   - Method: ${chaseAccount.bank_name} ${chaseAccount.account_type} ****${chaseAccount.account_last_four}`);
    console.log(`   - Period: ${paymentData.payment_month}/${paymentData.payment_year}\n`);

    const paymentResult = await makeRequest('POST', '/api/payment/process', paymentData, token);

    if (paymentResult.success) {
      console.log('   ✅ Payment processed successfully!');
      console.log(`   - Transaction ID: ${paymentResult.data.transaction_id}`);
      console.log(`   - Payment ID: ${paymentResult.data.payment_id}`);
      console.log(`   - Status: ${paymentResult.data.status}\n`);
    } else {
      console.log('   ❌ Payment failed:', paymentResult.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 50155,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the verification
verifyPaymentMethods();
