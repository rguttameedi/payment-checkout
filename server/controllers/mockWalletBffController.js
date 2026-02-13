/**
 * Mock Shared Wallet BFF Controller
 *
 * This controller simulates the Shared Wallet BFF API endpoints for local development.
 * In production, requests would be proxied to the real BFF at:
 * https://internalapi.realpage.com/payments/sharedwallet-bff
 *
 * MODES:
 * - 'mock' (default): Simulates API responses locally with SQLite
 * - 'real': Proxies requests to real UPP Wallet API
 * - 'hybrid': Uses real API when available, falls back to mock
 *
 * Set WALLET_API_MODE environment variable to configure mode
 */

const { PaymentMethod } = require('../models');
const crypto = require('crypto');
const axios = require('axios');

// Configuration
const WALLET_API_MODE = process.env.WALLET_API_MODE || 'mock'; // 'mock' | 'real' | 'hybrid'
const WALLET_API_URL = process.env.WALLET_API_URL || 'http://localhost:5000';
const WALLET_API_TIMEOUT = parseInt(process.env.WALLET_API_TIMEOUT) || 30000;

/**
 * Mock available credit card types
 */
const MOCK_AVAILABLE_CREDIT_CARDS = [
  { accountTypeId: 1, name: 'Visa', sortOrder: 0 },
  { accountTypeId: 2, name: 'Mastercard', sortOrder: 1 },
  { accountTypeId: 3, name: 'American Express', sortOrder: 2 },
  { accountTypeId: 4, name: 'Discover', sortOrder: 3 }
];

/**
 * Generate trace ID for requests (matches UPP Wallet API format)
 */
function generateTraceId() {
  return crypto.randomUUID();
}

/**
 * Generate wallet ID (matches UPP Wallet API format)
 */
function generateWalletId(userId) {
  return `WLT_${userId}`;
}

/**
 * Generate mock payment instrument token (matches UPP Wallet API format)
 */
function generatePaymentInstrumentToken(type) {
  const prefix = type === 'card' ? 'PI_CC' : 'PI_BA';
  return `${prefix}_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

/**
 * Convert internal payment method to format compatible with Shared Wallet UI
 * This format works with the existing Shared Wallet UI while also including UPP Wallet API fields
 */
function convertToWalletFormat(paymentMethod, userId) {
  const walletId = generateWalletId(userId);
  const baseInstrument = {
    walletId: walletId,
    paymentInstrumentToken: paymentMethod.cybersource_token,
    paymentInstrumentType: paymentMethod.payment_type === 'card' ? 'Card' : 'BankAccount',
    nickname: paymentMethod.nickname,
    isDefault: paymentMethod.is_default,
    vendorInstrumentTokens: [
      {
        vendor: 'Cybersource',
        vendorToken: paymentMethod.cybersource_token,
        isPrimary: true
      }
    ]
  };

  if (paymentMethod.payment_type === 'card') {
    // Shared Wallet UI expects this structure
    baseInstrument.paymentCard = {
      // Fields expected by Shared Wallet UI
      maskedNumber: `****${paymentMethod.card_last_four}`,
      cardInformation: {
        cardProduct: paymentMethod.card_brand,
        expirationMonth: paymentMethod.card_expiry_month,
        expirationYear: paymentMethod.card_expiry_year
      },
      // UPP Wallet API fields (also included for compatibility)
      cardBrand: paymentMethod.card_brand,
      lastFourDigits: paymentMethod.card_last_four,
      expirationMonth: paymentMethod.card_expiry_month,
      expirationYear: paymentMethod.card_expiry_year,
      payorInformation: {
        firstName: 'Mock',
        lastName: 'User',
        payorNickName: paymentMethod.nickname
      },
      billingAddress: {
        addressLine1: paymentMethod.billing_address_line1,
        addressLine2: paymentMethod.billing_address_line2,
        city: paymentMethod.billing_city,
        stateProvince: paymentMethod.billing_state,
        postalCode: paymentMethod.billing_zip_code,
        country: paymentMethod.billing_country || 'US'
      }
    };
  } else if (paymentMethod.payment_type === 'ach') {
    // Shared Wallet UI expects this structure
    baseInstrument.bankAccount = {
      // Fields expected by Shared Wallet UI
      maskedAccountNumber: `****${paymentMethod.account_last_four}`,
      bankAccountType: paymentMethod.account_type,
      bankName: paymentMethod.bank_name || 'Mock Bank',
      // UPP Wallet API fields (also included for compatibility)
      accountType: paymentMethod.account_type,
      lastFourDigits: paymentMethod.account_last_four,
      routingNumber: '****',
      payorInformation: {
        firstName: 'Mock',
        lastName: 'User',
        payorNickName: paymentMethod.nickname
      },
      billingAddress: {
        addressLine1: paymentMethod.billing_address_line1,
        addressLine2: paymentMethod.billing_address_line2,
        city: paymentMethod.billing_city,
        stateProvince: paymentMethod.billing_state,
        postalCode: paymentMethod.billing_zip_code,
        country: paymentMethod.billing_country || 'US'
      }
    };
  }

  return baseInstrument;
}

/**
 * Call real UPP Wallet API
 */
async function callRealWalletAPI(endpoint, method, data, authToken) {
  try {
    const response = await axios({
      method,
      url: `${WALLET_API_URL}${endpoint}`,
      data,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: WALLET_API_TIMEOUT
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(`❌ [REAL API] Error calling ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Check if real API is available
 */
async function isRealAPIAvailable() {
  if (WALLET_API_MODE === 'mock') return false;
  if (WALLET_API_MODE === 'real') return true;

  // For hybrid mode, check if API is reachable
  try {
    await axios.get(`${WALLET_API_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.log('⚠️  [HYBRID] Real API not available, using mock mode');
    return false;
  }
}

/**
 * @route   POST /api/wallet-bff/UserScoped/acquire_user_scoped_token
 * @desc    Mock endpoint to acquire user scoped access token
 * @access  Requires operations token in Authorization header
 */
exports.acquireUserScopedToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid operations token'
      });
    }

    const { realpage_id, upp_wallet_token, client_metadata } = req.body;

    if (!realpage_id || !upp_wallet_token) {
      return res.status(400).json({
        success: false,
        error: 'realpage_id and upp_wallet_token are required'
      });
    }

    // Generate mock encrypted user scoped token
    const tokenData = {
      realpage_id,
      timestamp: Date.now(),
      client_metadata: client_metadata || {}
    };

    const user_scoped_access_token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    console.log(`✅ [MOCK BFF] User scoped token acquired for user ${realpage_id}`);

    res.json({
      user_scoped_access_token,
      expiresAt,
      expires_in: 3600
    });

  } catch (error) {
    console.error('❌ [MOCK BFF] Error acquiring user scoped token:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @route   GET /api/wallet-bff/SharedWallet/wallet
 * @desc    Get all payment instruments from wallet
 * @access  Requires both operations token and user scoped token
 */
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const realPageId = `MOCK-${userId}`;

    console.log(`📂 [${WALLET_API_MODE.toUpperCase()}] Fetching wallet for user ${userId}`);

    // Check if we should use real API
    const useRealAPI = await isRealAPIAvailable();

    if (useRealAPI) {
      console.log('🔄 [REAL API] Calling UPP Wallet API...');
      const result = await callRealWalletAPI(
        '/wallet/v1/wallet',
        'POST',
        {
          realPageId: realPageId,
          customer: {
            customerId: userId.toString(),
            customerType: 'Resident'
          }
        },
        req.headers.authorization?.replace('Bearer ', '')
      );

      if (result.success) {
        console.log('✅ [REAL API] Wallet fetched successfully');
        return res.json({
          ...result.data,
          availableCreditCards: MOCK_AVAILABLE_CREDIT_CARDS
        });
      } else {
        console.log('⚠️  [REAL API] Failed, falling back to mock');
      }
    }

    // Use mock implementation
    const paymentMethods = await PaymentMethod.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    const paymentInstruments = paymentMethods.map(pm => convertToWalletFormat(pm, userId));
    const walletId = generateWalletId(userId);
    const traceId = generateTraceId();

    console.log(`✅ [MOCK] Found ${paymentInstruments.length} payment instruments`);

    // Return in UPP Wallet API format
    res.json({
      traceId,
      resultMessage: 'Wallet retrieved successfully',
      walletId,
      walletOwnerIdentifiers: {
        realPageId: realPageId,
        consumerIdentityId: null,
        customer: {
          customerId: userId.toString(),
          customerType: 'Resident'
        }
      },
      paymentInstruments,
      availableCreditCards: MOCK_AVAILABLE_CREDIT_CARDS
    });

  } catch (error) {
    console.error('❌ [BFF] Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet'
    });
  }
};

/**
 * @route   POST /api/wallet-bff/SharedWallet/card
 * @desc    Add new credit card to wallet
 * @access  Requires both operations token and user scoped token
 */
exports.addCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const realPageId = `MOCK-${userId}`;
    const {
      payorInformation,
      billingAddress,
      cardNumber,
      expirationMonth,
      expirationYear,
      cvv,
      nickname
    } = req.body;

    console.log(`💳 [${WALLET_API_MODE.toUpperCase()}] Adding credit card for user ${userId}`);

    // Validate card number
    if (!cardNumber || cardNumber.length < 13) {
      return res.status(400).json({
        success: false,
        brokenRules: [{
          ruleCode: 'INVALID_CARD_NUMBER',
          message: 'Invalid card number',
          severity: 'Error'
        }]
      });
    }

    // Check if we should use real API
    const useRealAPI = await isRealAPIAvailable();

    if (useRealAPI) {
      console.log('🔄 [REAL API] Calling UPP Wallet API to tokenize card...');
      const result = await callRealWalletAPI(
        '/wallet/v1/paymentinstrument/card',
        'POST',
        {
          walletOwnerIdentifiers: {
            realPageId: realPageId,
            customer: {
              customerId: userId.toString(),
              customerType: 'Resident'
            }
          },
          payorInformation: {
            firstName: payorInformation?.firstName || 'Mock',
            lastName: payorInformation?.lastName || 'User',
            payorNickName: nickname,
            contactInformation: payorInformation?.contactInformation
          },
          accountReferenceId: `ACC_REF_${crypto.randomBytes(8).toString('hex')}`,
          billingAddress: {
            addressLine1: billingAddress?.addressLine1 || '',
            addressLine2: billingAddress?.addressLine2,
            city: billingAddress?.city || '',
            stateProvince: billingAddress?.provinceOrStateCode || '',
            postalCode: billingAddress?.postalCode || '',
            country: billingAddress?.countryCode || 'US'
          },
          cardNumber,
          expirationMonth,
          expirationYear,
          cvv
        },
        req.headers.authorization?.replace('Bearer ', '')
      );

      if (result.success) {
        console.log('✅ [REAL API] Card tokenized successfully');
        return res.status(result.status || 201).json(result.data);
      } else {
        console.log('⚠️  [REAL API] Failed, falling back to mock');
      }
    }

    // Use mock implementation
    let card_brand = 'Unknown';
    if (cardNumber.startsWith('4')) card_brand = 'Visa';
    else if (cardNumber.startsWith('5')) card_brand = 'Mastercard';
    else if (cardNumber.startsWith('3')) card_brand = 'American Express';
    else if (cardNumber.startsWith('6')) card_brand = 'Discover';

    const card_last_four = cardNumber.slice(-4);
    const is_default = req.body.is_default || false;

    if (is_default) {
      await PaymentMethod.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    const paymentInstrumentToken = generatePaymentInstrumentToken('card');

    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type: 'card',
      nickname: nickname || `${card_brand} ending in ${card_last_four}`,
      cybersource_token: paymentInstrumentToken,
      card_last_four,
      card_brand,
      card_expiry_month: expirationMonth,
      card_expiry_year: expirationYear,
      billing_address_line1: billingAddress?.addressLine1,
      billing_address_line2: billingAddress?.addressLine2,
      billing_city: billingAddress?.city,
      billing_state: billingAddress?.provinceOrStateCode,
      billing_zip_code: billingAddress?.postalCode,
      billing_country: billingAddress?.countryCode || 'US',
      is_default,
      status: 'active'
    });

    console.log(`✅ [MOCK] Credit card added successfully (ID: ${paymentMethod.id})`);

    // Return in UPP Wallet API format
    const traceId = generateTraceId();
    const response = {
      traceId,
      resultMessage: 'Payment card tokenized successfully',
      paymentInstrument: convertToWalletFormat(paymentMethod, userId)
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ [BFF] Error adding card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add credit card',
      brokenRules: [{
        ruleCode: 'INTERNAL_ERROR',
        message: error.message,
        severity: 'Error'
      }]
    });
  }
};

/**
 * @route   POST /api/wallet-bff/SharedWallet/bankaccount
 * @desc    Add new bank account to wallet
 * @access  Requires both operations token and user scoped token
 */
exports.addBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const realPageId = `MOCK-${userId}`;
    const {
      payorInformation,
      billingAddress,
      accountNumber,
      routingNumber,
      accountType,
      nickname
    } = req.body;

    console.log(`🏦 [${WALLET_API_MODE.toUpperCase()}] Adding bank account for user ${userId}`);

    // Validate routing number
    if (!routingNumber || routingNumber.length !== 9 || !/^\d+$/.test(routingNumber)) {
      return res.status(400).json({
        success: false,
        brokenRules: [{
          ruleCode: 'INVALID_ROUTING_NUMBER',
          message: 'Routing number must be 9 digits',
          severity: 'Error'
        }]
      });
    }

    // Validate account number
    if (!accountNumber || accountNumber.length < 4) {
      return res.status(400).json({
        success: false,
        brokenRules: [{
          ruleCode: 'INVALID_ACCOUNT_NUMBER',
          message: 'Invalid account number',
          severity: 'Error'
        }]
      });
    }

    // Check if we should use real API
    const useRealAPI = await isRealAPIAvailable();

    if (useRealAPI) {
      console.log('🔄 [REAL API] Calling UPP Wallet API to tokenize bank account...');
      const result = await callRealWalletAPI(
        '/wallet/v1/paymentinstrument/bankaccount',
        'POST',
        {
          walletOwnerIdentifiers: {
            realPageId: realPageId,
            customer: {
              customerId: userId.toString(),
              customerType: 'Resident'
            }
          },
          accountNumber,
          payorInformation: {
            firstName: payorInformation?.firstName || 'Mock',
            lastName: payorInformation?.lastName || 'User',
            payorNickName: nickname,
            contactInformation: payorInformation?.contactInformation
          },
          accountReferenceId: `ACC_REF_${crypto.randomBytes(8).toString('hex')}`,
          billingAddress: {
            addressLine1: billingAddress?.addressLine1 || '',
            addressLine2: billingAddress?.addressLine2,
            city: billingAddress?.city || '',
            stateProvince: billingAddress?.provinceOrStateCode || '',
            postalCode: billingAddress?.postalCode || '',
            country: billingAddress?.countryCode || 'US'
          },
          routingNumber,
          bankAccountType: accountType,
          ownershipType: 'Personal'
        },
        req.headers.authorization?.replace('Bearer ', '')
      );

      if (result.success) {
        console.log('✅ [REAL API] Bank account tokenized successfully');
        return res.status(result.status || 201).json(result.data);
      } else {
        console.log('⚠️  [REAL API] Failed, falling back to mock');
      }
    }

    // Use mock implementation
    const account_last_four = accountNumber.slice(-4);
    const is_default = req.body.is_default || false;

    if (is_default) {
      await PaymentMethod.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    const paymentInstrumentToken = generatePaymentInstrumentToken('bankaccount');

    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type: 'ach',
      nickname: nickname || `${accountType} ending in ${account_last_four}`,
      cybersource_token: paymentInstrumentToken,
      account_last_four,
      account_type: accountType,
      bank_name: 'Mock Bank',
      billing_address_line1: billingAddress?.addressLine1,
      billing_address_line2: billingAddress?.addressLine2,
      billing_city: billingAddress?.city,
      billing_state: billingAddress?.provinceOrStateCode,
      billing_zip_code: billingAddress?.postalCode,
      billing_country: billingAddress?.countryCode || 'US',
      is_default,
      status: 'active'
    });

    console.log(`✅ [MOCK] Bank account added successfully (ID: ${paymentMethod.id})`);

    // Return in UPP Wallet API format
    const traceId = generateTraceId();
    const response = {
      traceId,
      resultMessage: 'Bank account tokenized successfully',
      paymentInstrument: convertToWalletFormat(paymentMethod, userId)
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ [BFF] Error adding bank account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add bank account',
      brokenRules: [{
        ruleCode: 'INTERNAL_ERROR',
        message: error.message,
        severity: 'Error'
      }]
    });
  }
};

/**
 * @route   POST /api/wallet-bff/SharedWallet/ValidateMFA
 * @desc    Mock MFA validation (always returns success for demo)
 * @access  Requires both operations token and user scoped token
 */
exports.validateMFA = async (req, res) => {
  try {
    console.log('🔐 [MOCK BFF] MFA validation requested (auto-approve for mock)');

    // In real implementation, this would trigger MFA flow
    // For mock, we'll just return success immediately
    const mfaInquiryId = `mfa_mock_${crypto.randomBytes(8).toString('hex')}`;

    res.json({
      success: true,
      mfaInquiryId,
      message: 'MFA validation successful (mock mode - auto-approved)'
    });

  } catch (error) {
    console.error('❌ [MOCK BFF] Error in MFA validation:', error);
    res.status(500).json({
      success: false,
      error: 'MFA validation failed'
    });
  }
};

/**
 * @route   GET /api/wallet-bff/SharedWallet/MfaStatus
 * @desc    Get MFA status (always returns verified for mock)
 * @access  Requires both operations token and user scoped token
 */
exports.getMfaStatus = async (req, res) => {
  try {
    const { mfaInquiryId } = req.query;

    console.log(`🔍 [MOCK BFF] MFA status check for ${mfaInquiryId} (auto-verified)`);

    res.json({
      status: 'Verified',
      mfaInquiryId,
      message: 'MFA verification successful (mock mode)'
    });

  } catch (error) {
    console.error('❌ [MOCK BFF] Error checking MFA status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check MFA status'
    });
  }
};

module.exports = exports;
