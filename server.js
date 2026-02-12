// ============================================
// SIMPLE CYBERSOURCE PAYMENT SERVER
// ============================================

// Import required packages
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const https = require('https');
const fs = require('fs').promises;

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static('.')); // Serve static files (like index.html)

// ============================================
// CYBERSOURCE CONFIGURATION
// ============================================
// TODO: Replace these with YOUR actual Cybersource credentials
const CYBERSOURCE_CONFIG = {
  merchantId: '9059034_1770903917',
  apiKeyId: '19bb79cc-59aa-4a28-b5c9-2fa086d3c50e',
  secretKey: 'YMdMdBCLdgFmchmIEMWRgnW/9mr7Nge4legk3Efmtvs=',
  runEnvironment: 'apitest.cybersource.com' // Use 'api.cybersource.com' for production
};

// ============================================
// HELPER FUNCTION: Generate Cybersource Signature
// ============================================
function generateSignature(method, resourcePath, body) {
  const timestamp = Date.now();
  const digest = 'SHA-256=' + crypto.createHash('sha256').update(body).digest('base64');

  const signatureString = [
    `host: ${CYBERSOURCE_CONFIG.runEnvironment}`,
    `date: ${new Date(timestamp).toUTCString()}`,
    `(request-target): ${method.toLowerCase()} ${resourcePath}`,
    `digest: ${digest}`,
    `v-c-merchant-id: ${CYBERSOURCE_CONFIG.merchantId}`
  ].join('\n');

  const signatureBytes = crypto
    .createHmac('sha256', Buffer.from(CYBERSOURCE_CONFIG.secretKey, 'base64'))
    .update(signatureString)
    .digest('base64');

  return {
    signature: `keyid="${CYBERSOURCE_CONFIG.apiKeyId}", algorithm="HmacSHA256", headers="host date (request-target) digest v-c-merchant-id", signature="${signatureBytes}"`,
    digest: digest,
    date: new Date(timestamp).toUTCString()
  };
}

// ============================================
// HELPER FUNCTION: Save Transaction History
// ============================================
async function saveTransaction(transactionData) {
  try {
    const filePath = path.join(__dirname, 'transactions.json');
    let transactions = [];

    // Read existing transactions
    try {
      const data = await fs.readFile(filePath, 'utf8');
      transactions = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start with empty array
      transactions = [];
    }

    // Add new transaction
    transactions.push(transactionData);

    // Save back to file
    await fs.writeFile(filePath, JSON.stringify(transactions, null, 2));
    console.log('✅ Transaction saved to history');
  } catch (error) {
    console.error('⚠️ Failed to save transaction:', error.message);
  }
}

// ============================================
// ENDPOINT: Create Payment Token
// ============================================
app.post('/create-payment-token', async (req, res) => {
  try {
    const {
      // Payment type
      paymentType,

      // Card fields
      nameOnCard, cardNumber, expiryMonth, expiryYear, cvv,

      // ACH fields
      accountHolderName, routingNumber, accountNumber, accountType,

      // Common fields
      firstName, lastName, email, phone, dob, payorNickName,
      address1, address2, city, state, zipCode, country, amount
    } = req.body;

    // Validate required fields based on payment type
    if (paymentType === 'card') {
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
        return res.status(400).json({ error: 'Missing required card fields' });
      }
    } else if (paymentType === 'ach') {
      if (!routingNumber || !accountNumber || !accountType) {
        return res.status(400).json({ error: 'Missing required ACH fields' });
      }
    }

    if (!amount || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required common fields' });
    }

    // Prepare the payment request for Cybersource
    const paymentData = {
      clientReferenceInformation: {
        code: 'PAYMENT_' + Date.now() // Unique reference ID
      },
      processingInformation: {
        capture: false // Set to true to immediately capture the payment
      },
      paymentInformation: {},
      orderInformation: {
        amountDetails: {
          totalAmount: amount,
          currency: 'USD'
        },
        billTo: {
          firstName: firstName || 'Customer',
          lastName: lastName || 'Name',
          address1: address1 || '1 Market St',
          address2: address2 || '',
          locality: city || 'San Francisco',
          administrativeArea: state || 'CA',
          postalCode: zipCode || '94105',
          country: country || 'US',
          email: email || 'customer@example.com',
          phoneNumber: phone || '',
          dateOfBirth: dob || ''
        }
      }
    };

    // Add payment method specific data
    if (paymentType === 'card') {
      paymentData.paymentInformation.card = {
        number: cardNumber,
        expirationMonth: expiryMonth,
        expirationYear: expiryYear,
        securityCode: cvv
      };
    } else if (paymentType === 'ach') {
      // For ACH payments (Note: Cybersource might need different endpoint/setup for ACH)
      paymentData.paymentInformation.bank = {
        account: {
          number: accountNumber,
          type: accountType
        },
        routingNumber: routingNumber
      };
    }

    const requestBody = JSON.stringify(paymentData);
    const resourcePath = '/pts/v2/payments';
    const method = 'POST';

    // Generate authentication signature
    const { signature, digest, date } = generateSignature(method, resourcePath, requestBody);

    // Make request to Cybersource API
    // NOTE: rejectUnauthorized disabled for development/testing only!
    const response = await axios({
      method: method,
      url: `https://${CYBERSOURCE_CONFIG.runEnvironment}${resourcePath}`,
      headers: {
        'Content-Type': 'application/json',
        'v-c-merchant-id': CYBERSOURCE_CONFIG.merchantId,
        'Date': date,
        'Host': CYBERSOURCE_CONFIG.runEnvironment,
        'Digest': digest,
        'Signature': signature
      },
      data: requestBody,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Bypass SSL verification for testing
      })
    });

    // Save transaction to history
    const transaction = {
      transactionId: response.data.id,
      paymentType: paymentType || 'card',
      amount: amount,
      currency: 'USD',
      status: response.data.status,
      firstName: firstName,
      lastName: lastName,
      email: email,
      payorNickName: payorNickName || '',
      // Masked payment details for security
      maskedPaymentInfo: paymentType === 'card'
        ? `Card ending in ${cardNumber?.slice(-4)}`
        : `Account ending in ${accountNumber?.slice(-4)}`,
      timestamp: new Date().toISOString(),
      billingAddress: {
        address1, address2, city, state, zipCode, country
      }
    };

    // Save to transaction history file
    await saveTransaction(transaction);

    // Return success response
    res.json({
      success: true,
      transactionId: response.data.id,
      status: response.data.status,
      paymentType: paymentType,
      message: `${paymentType === 'card' ? 'Card' : 'ACH'} payment processed successfully!`
    });

  } catch (error) {
    // Log detailed error information
    console.error('\n═══════════════ PAYMENT ERROR ═══════════════');
    console.error('Error Message:', error.message);
    console.error('Status Code:', error.response?.status);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('═══════════════════════════════════════════════\n');

    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.response?.data?.reason || 'Payment processing failed',
      details: error.response?.data
    });
  }
});

// ============================================
// ENDPOINT: Get Transaction History
// ============================================
app.get('/transactions', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'transactions.json');
    const data = await fs.readFile(filePath, 'utf8');
    const transactions = JSON.parse(data);
    res.json({ success: true, transactions });
  } catch (error) {
    res.json({ success: true, transactions: [] });
  }
});

// ============================================
// SERVE THE FRONTEND
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START THE SERVER
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('════════════════════════════════════════════════');
  console.log('  🚀 Payment Server is Running!');
  console.log('════════════════════════════════════════════════');
  console.log(`  URL: http://localhost:${PORT}`);
  console.log('  Press Ctrl+C to stop the server');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('✅ Cybersource credentials are already configured!');
  console.log('');
});
