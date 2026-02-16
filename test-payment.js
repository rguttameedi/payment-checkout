const https = require('https');

// Test credentials - adjust these based on your database
const TEST_USER = {
  email: 'john.doe@example.com', // User ID 2 from the logs
  password: 'password123'
};

async function testPayment() {
  try {
    console.log('🔐 Step 1: Logging in...');

    // Step 1: Login
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (!loginResponse.success) {
      console.error('❌ Login failed:', loginResponse);

      // Try with tenant@test.com
      console.log('\n🔄 Trying alternative credentials...');
      const altLoginResponse = await makeRequest('POST', '/api/auth/login', {
        email: 'tenant@test.com',
        password: 'password123'
      });

      if (!altLoginResponse.success) {
        console.error('❌ Alternative login also failed');
        return;
      }

      console.log('✅ Logged in successfully with alternative credentials');
      const token = altLoginResponse.token;

      // Continue with the test
      await runPaymentTest(token);
      return;
    }

    console.log('✅ Logged in successfully');
    const token = loginResponse.token;

    await runPaymentTest(token);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runPaymentTest(token) {
  console.log('\n💳 Step 2: Fetching payment methods...');
  const paymentMethodsResponse = await makeRequest('GET', '/api/tenant/payment-methods', null, token);
  console.log('   Response:', JSON.stringify(paymentMethodsResponse, null, 2));

  // Handle different response formats
  let paymentMethods = paymentMethodsResponse;
  if (paymentMethodsResponse && paymentMethodsResponse.data) {
    paymentMethods = paymentMethodsResponse.data;
  } else if (paymentMethodsResponse && paymentMethodsResponse.paymentMethods) {
    paymentMethods = paymentMethodsResponse.paymentMethods;
  }

  if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
    console.error('❌ No payment methods found. Creating a test card...');

    // Create a test payment method
    const newCard = await makeRequest('POST', '/api/tenant/payment-methods', {
      payment_type: 'card',
      card_number: '4111111111111111',
      card_holder_name: 'John Doe',
      card_expiry_month: '12',
      card_expiry_year: '2025',
      cvv: '123',
      billing_address: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      }
    }, token);

    console.log('   Created test card:', newCard);

    // Fetch again
    const retryResponse = await makeRequest('GET', '/api/tenant/payment-methods', null, token);
    paymentMethods = retryResponse.data || retryResponse.paymentMethods || retryResponse;
  }

  console.log(`✅ Found ${paymentMethods.length} payment method(s)`);
  const paymentMethodId = paymentMethods[0].id;
  console.log(`   Using payment method ID: ${paymentMethodId}`);

  console.log('\n🏠 Step 3: Fetching lease information...');
  const dashboardResponse = await makeRequest('GET', '/api/tenant/dashboard', null, token);
  console.log('   Dashboard response:', JSON.stringify(dashboardResponse, null, 2));

  const dashboard = dashboardResponse.data || dashboardResponse;

  if (!dashboard || !dashboard.lease) {
    console.error('❌ No active lease found');
    console.error('   Dashboard data:', dashboard);
    return;
  }

  console.log('✅ Found active lease');
  const leaseId = dashboard.lease.id;
  console.log(`   Lease ID: ${leaseId}`);
  console.log(`   Monthly rent: $${dashboard.lease.monthly_rent}`);

  console.log('\n💰 Step 4: Processing $50 payment...');
  // Use March 2026 to avoid conflict with existing payments
  const paymentMonth = 3;
  const paymentYear = 2026;

  const paymentData = {
    lease_id: leaseId,
    payment_method_id: paymentMethodId,
    amount: 50.00,
    payment_month: paymentMonth,
    payment_year: paymentYear
  };

  console.log('   Payment details:', paymentData);

  const paymentResult = await makeRequest('POST', '/api/payment/process', paymentData, token);

  if (paymentResult.success) {
    console.log('✅ Payment processed successfully!');
    console.log('   Transaction ID:', paymentResult.data.transaction_id);
    console.log('   Payment ID:', paymentResult.data.payment_id);
    console.log('   Amount:', `$${paymentResult.data.amount}`);
    console.log('   Status:', paymentResult.data.status);
  } else {
    console.error('❌ Payment failed:', paymentResult);
  }

  // Step 5: Verify payment status
  if (paymentResult.success && paymentResult.data.payment_id) {
    console.log('\n🔍 Step 5: Verifying payment status...');
    const paymentStatus = await makeRequest('GET', `/api/payment/${paymentResult.data.payment_id}`, null, token);

    if (paymentStatus.success) {
      console.log('✅ Payment verification successful');
      console.log('   Final status:', paymentStatus.data.payment_status);
    }
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
      },
      // Disable SSL verification for local testing
      rejectUnauthorized: false
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = require('http').request(options, (res) => {
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

// Run the test
console.log('🧪 Starting Payment End-to-End Test');
console.log('====================================\n');
testPayment();
