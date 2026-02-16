const express = require('express');
const router = express.Router();
const { PaymentMethod } = require('../models');
const { authenticateWalletRequest } = require('../middleware/walletAuth');

/**
 * Shared Wallet BFF (Backend For Frontend) Routes
 * These endpoints are designed to work with the RealPage Shared Wallet UI component
 */

// Apply wallet authentication middleware to all routes
router.use(authenticateWalletRequest);

/**
 * GET /api/SharedWallet/wallet
 * Get payment instruments in the format expected by the Shared Wallet UI component
 * This endpoint returns paymentInstruments array with proper structure for the web component
 */
router.get('/SharedWallet/wallet', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('🏦 [Wallet BFF] Fetching payment instruments for Shared Wallet UI, user:', userId);

    // Fetch payment methods from database
    const paymentMethods = await PaymentMethod.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    // Transform to Shared Wallet UI expected format
    const paymentInstruments = paymentMethods.map(method => {
      if (method.payment_type === 'card') {
        return {
          paymentInstrumentToken: `pi_${method.id}`,
          paymentInstrumentType: 'Card',
          cardProduct: method.card_brand || 'Card',
          maskedNumber: method.card_last_four ? `****${method.card_last_four}` : '****0000',
          isDefault: method.is_default
        };
      } else {
        return {
          paymentInstrumentToken: `pi_${method.id}`,
          paymentInstrumentType: 'BankAccount',
          bankAccountType: method.account_type || 'Checking',
          maskedAccountNumber: method.account_last_four ? `****${method.account_last_four}` : '****0000',
          isDefault: method.is_default
        };
      }
    });

    console.log('✅ [Wallet BFF] Returning', paymentInstruments.length, 'payment instruments for Shared Wallet UI');

    res.json({
      paymentInstruments,
      availableCreditCards: null // Optional field, not used in this implementation
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error fetching payment instruments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch payment instruments',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/v1/payment-instruments
 * List all payment methods for the authenticated user
 */
router.get('/v1/payment-instruments', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('🏦 [Wallet BFF] Fetching payment instruments for user:', userId);

    // Fetch payment methods from database
    const paymentMethods = await PaymentMethod.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    // Transform to Shared Wallet UI format
    const instruments = paymentMethods.map(method => {
      const baseInstrument = {
        paymentInstrumentId: method.id.toString(),
        paymentInstrumentToken: `pi_${method.id}`,
        isDefault: method.is_default,
        nickname: method.nickname || null,
        status: method.status,
        createdAt: method.created_at,
        updatedAt: method.updated_at
      };

      if (method.payment_type === 'card') {
        return {
          ...baseInstrument,
          type: 'card',
          cardBrand: method.card_brand,
          cardLastFour: method.card_last_four,
          cardExpiryMonth: method.card_expiry_month,
          cardExpiryYear: method.card_expiry_year,
          cardHolderName: method.card_holder_name,
          billingAddress: method.billing_address ? JSON.parse(method.billing_address) : null
        };
      } else {
        return {
          ...baseInstrument,
          type: 'bank',
          bankName: method.bank_name,
          accountType: method.account_type,
          accountLastFour: method.account_last_four,
          routingNumber: method.routing_number
        };
      }
    });

    console.log('✅ [Wallet BFF] Returning', instruments.length, 'payment instruments');

    res.json({
      success: true,
      data: instruments,
      meta: {
        total: instruments.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error fetching payment instruments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch payment instruments',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/v1/payment-options
 * Get available payment options (cards and bank accounts)
 * This is what the Shared Wallet UI calls on initial load
 */
router.get('/v1/payment-options', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('🏦 [Wallet BFF] Fetching payment options for user:', userId);

    // Fetch payment methods
    const paymentMethods = await PaymentMethod.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    // Group by type
    const cards = [];
    const bankAccounts = [];

    paymentMethods.forEach(method => {
      const option = {
        id: method.id.toString(),
        token: `pi_${method.id}`,
        isDefault: method.is_default,
        nickname: method.nickname,
        displayText: method.payment_type === 'card'
          ? `${method.card_brand} ending in ${method.card_last_four}`
          : `${method.bank_name || 'Bank'} ${method.account_type} ending in ${method.account_last_four}`
      };

      if (method.payment_type === 'card') {
        cards.push({
          ...option,
          brand: method.card_brand,
          lastFour: method.card_last_four,
          expiryMonth: method.card_expiry_month,
          expiryYear: method.card_expiry_year,
          holderName: method.card_holder_name
        });
      } else {
        bankAccounts.push({
          ...option,
          bankName: method.bank_name,
          accountType: method.account_type,
          lastFour: method.account_last_four,
          routingNumber: method.routing_number
        });
      }
    });

    console.log('✅ [Wallet BFF] Returning payment options:', {
      cards: cards.length,
      bankAccounts: bankAccounts.length
    });

    res.json({
      success: true,
      data: {
        cards,
        bankAccounts,
        hasPaymentMethods: paymentMethods.length > 0
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error fetching payment options:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch payment options',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/v1/payment-instruments/card
 * Add a new credit/debit card
 *
 * Required fields for tokenization:
 * - cardNumber (Card Number)
 * - cardHolderName (Name on Card)
 * - expiryMonth (Card Expiry Month)
 * - expiryYear (Card Expiry Year)
 * - cvv (CVV/Security Code)
 *
 * Optional fields:
 * - billingAddress (Billing Address)
 * - nickname (Card Nickname)
 * - setAsDefault (Set as Default Payment Method)
 */
router.post('/v1/payment-instruments/card', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      cardNumber,
      cardHolderName,
      expiryMonth,
      expiryYear,
      cvv,
      billingAddress,
      nickname,
      setAsDefault
    } = req.body;

    console.log('🏦 [Wallet BFF] Adding new card for user:', userId);
    console.log('🔍 [Wallet BFF] Request fields:', {
      cardNumber: cardNumber ? '****' + cardNumber.slice(-4) : 'missing',
      cardHolderName: cardHolderName || 'missing',
      expiryMonth: expiryMonth || 'missing',
      expiryYear: expiryYear || 'missing',
      cvv: cvv ? '***' : 'missing',
      billingAddress: billingAddress ? 'provided' : 'optional',
      nickname: nickname || 'optional',
      setAsDefault: setAsDefault !== undefined ? setAsDefault : 'optional'
    });

    // Validate ONLY required fields for tokenization
    // Required: Name on Card, Card Number, Expiry Month, Expiry Year, CVV
    // Optional: Billing Address, Nickname, Set as Default
    if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
      const missingFields = [];
      if (!cardNumber) missingFields.push('Card Number');
      if (!cardHolderName) missingFields.push('Name on Card');
      if (!expiryMonth) missingFields.push('Expiry Month');
      if (!expiryYear) missingFields.push('Expiry Year');
      if (!cvv) missingFields.push('CVV');

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing required card fields: ${missingFields.join(', ')}`,
          missingFields
        }
      });
    }

    // Detect card brand (simplified)
    let cardBrand = 'Unknown';
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') cardBrand = 'Visa';
    else if (firstDigit === '5') cardBrand = 'Mastercard';
    else if (firstDigit === '3') cardBrand = 'American Express';
    else if (firstDigit === '6') cardBrand = 'Discover';

    // Get last 4 digits
    const cardLastFour = cardNumber.slice(-4);

    // If setting as default, unset other defaults
    if (setAsDefault) {
      await PaymentMethod.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    // Create payment method
    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type: 'card',
      card_brand: cardBrand,
      card_last_four: cardLastFour,
      card_expiry_month: expiryMonth,
      card_expiry_year: expiryYear,
      card_holder_name: cardHolderName,
      billing_address: billingAddress ? JSON.stringify(billingAddress) : null,
      nickname: nickname || null,
      is_default: setAsDefault || false,
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}`, // Mock token
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ [Wallet BFF] Card added successfully:', paymentMethod.id);

    res.json({
      success: true,
      data: {
        paymentInstrumentId: paymentMethod.id.toString(),
        paymentInstrumentToken: `pi_${paymentMethod.id}`,
        type: 'card',
        cardBrand: paymentMethod.card_brand,
        cardLastFour: paymentMethod.card_last_four,
        isDefault: paymentMethod.is_default,
        displayText: `${paymentMethod.card_brand} ending in ${paymentMethod.card_last_four}`
      },
      message: 'Card added successfully'
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error adding card:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_CARD_ERROR',
        message: 'Failed to add card',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/v1/payment-instruments/bank
 * Add a new bank account
 */
router.post('/v1/payment-instruments/bank', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      accountType,
      routingNumber,
      accountNumber,
      accountHolderName,
      bankName,
      nickname,
      setAsDefault
    } = req.body;

    console.log('🏦 [Wallet BFF] Adding new bank account for user:', userId);

    // Validate required fields
    if (!accountType || !routingNumber || !accountNumber || !accountHolderName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required bank account fields'
        }
      });
    }

    // Get last 4 digits
    const accountLastFour = accountNumber.slice(-4);

    // If setting as default, unset other defaults
    if (setAsDefault) {
      await PaymentMethod.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    // Create payment method
    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type: 'ach',
      account_type: accountType,
      routing_number: routingNumber,
      account_last_four: accountLastFour,
      account_holder_name: accountHolderName,
      bank_name: bankName || 'Bank',
      nickname: nickname || null,
      is_default: setAsDefault || false,
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}`, // Mock token
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ [Wallet BFF] Bank account added successfully:', paymentMethod.id);

    res.json({
      success: true,
      data: {
        paymentInstrumentId: paymentMethod.id.toString(),
        paymentInstrumentToken: `pi_${paymentMethod.id}`,
        type: 'bank',
        bankName: paymentMethod.bank_name,
        accountType: paymentMethod.account_type,
        accountLastFour: paymentMethod.account_last_four,
        isDefault: paymentMethod.is_default,
        displayText: `${paymentMethod.bank_name} ${paymentMethod.account_type} ending in ${paymentMethod.account_last_four}`
      },
      message: 'Bank account added successfully'
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error adding bank account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_BANK_ERROR',
        message: 'Failed to add bank account',
        details: error.message
      }
    });
  }
});

/**
 * DELETE /api/v1/payment-instruments/:id
 * Delete a payment method
 */
router.delete('/v1/payment-instruments/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentMethodId = req.params.id;

    console.log('🏦 [Wallet BFF] Deleting payment instrument:', paymentMethodId);

    // Find the payment method
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        id: paymentMethodId,
        user_id: userId
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Payment method not found'
        }
      });
    }

    // Soft delete (set status to inactive)
    await paymentMethod.update({ status: 'inactive' });

    console.log('✅ [Wallet BFF] Payment instrument deleted successfully');

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error deleting payment instrument:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete payment method',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/v1/wallet
 * Get wallet information
 */
router.get('/v1/wallet', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('🏦 [Wallet BFF] Fetching wallet info for user:', userId);

    const paymentMethods = await PaymentMethod.findAll({
      where: {
        user_id: userId,
        status: 'active'
      }
    });

    res.json({
      success: true,
      data: {
        userId: userId,
        hasPaymentMethods: paymentMethods.length > 0,
        totalPaymentMethods: paymentMethods.length,
        defaultPaymentMethod: paymentMethods.find(m => m.is_default)?.id || null
      }
    });

  } catch (error) {
    console.error('❌ [Wallet BFF] Error fetching wallet info:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WALLET_ERROR',
        message: 'Failed to fetch wallet information',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/SharedWallet/card
 * Add a new credit/debit card (Shared Wallet UI format)
 * This is an alias for the v1 endpoint to match the web component's expected API path
 */
router.post('/SharedWallet/card', async (req, res) => {
  // Forward to the v1 endpoint handler by reusing the same logic
  try {
    const userId = req.user.userId;

    // Map Shared Wallet UI field names to our internal field names
    const cardNumber = req.body.cardNumber;
    const cardHolderName = req.body.cardHolder || req.body.cardHolderName; // UI uses 'cardHolder'
    const expiryMonth = req.body.expirationMonth || req.body.expiryMonth; // UI uses 'expirationMonth'
    const expiryYear = req.body.expirationYear || req.body.expiryYear; // UI uses 'expirationYear'
    const cvv = req.body.cvv || req.body.securityCode; // CVV may not be present in tokenization flows
    const billingAddress = req.body.billingAddress;
    const nickname = req.body.payorInformation?.paymentAccountNickname || req.body.nickname;
    const setAsDefault = req.body.setAsDefault;

    console.log('🏦 [Wallet BFF SharedWallet] Adding new card for user:', userId);
    console.log('🔍 [Wallet BFF SharedWallet] Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [Wallet BFF SharedWallet] Request fields (mapped):', {
      cardNumber: cardNumber ? '****' + cardNumber.slice(-4) : 'missing',
      cardHolderName: cardHolderName || 'missing',
      expiryMonth: expiryMonth || 'missing',
      expiryYear: expiryYear || 'missing',
      cvv: cvv ? '***' : 'not provided (optional for UI)',
      billingAddress: billingAddress ? 'provided' : 'optional',
      nickname: nickname || 'optional',
      setAsDefault: setAsDefault !== undefined ? setAsDefault : 'optional'
    });

    // Validate ONLY required fields for tokenization
    // Note: CVV is optional for Shared Wallet UI since it may handle tokenization client-side
    if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear) {
      const missingFields = [];
      if (!cardNumber) missingFields.push('Card Number');
      if (!cardHolderName) missingFields.push('Name on Card');
      if (!expiryMonth) missingFields.push('Expiry Month');
      if (!expiryYear) missingFields.push('Expiry Year');

      console.log('❌ [Wallet BFF SharedWallet] Validation failed - missing fields:', missingFields);

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing required card fields: ${missingFields.join(', ')}`,
          missingFields
        }
      });
    }

    // Detect card brand
    let cardBrand = 'Unknown';
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') cardBrand = 'Visa';
    else if (firstDigit === '5') cardBrand = 'Mastercard';
    else if (firstDigit === '3') cardBrand = 'American Express';
    else if (firstDigit === '6') cardBrand = 'Discover';

    const cardLastFour = cardNumber.slice(-4);

    // ALWAYS set new payment methods as default and unset all other defaults
    // This ensures the most recently added payment method becomes the default
    console.log('🔄 [Wallet BFF SharedWallet] Setting new card as default and unsetting other defaults...');
    await PaymentMethod.update(
      { is_default: false },
      { where: { user_id: userId } }
    );

    // Create payment method (always set as default)
    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type: 'card',
      card_brand: cardBrand,
      card_last_four: cardLastFour,
      card_expiry_month: expiryMonth,
      card_expiry_year: expiryYear,
      card_holder_name: cardHolderName,
      billing_address: billingAddress ? JSON.stringify(billingAddress) : null,
      nickname: nickname || null,
      is_default: true, // Always set new payment methods as default
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ [Wallet BFF SharedWallet] Card added successfully:', paymentMethod.id);

    // Return in Shared Wallet UI expected format
    res.json({
      paymentInstrumentToken: `pi_${paymentMethod.id}`,
      paymentInstrumentType: 'Card',
      cardProduct: paymentMethod.card_brand,
      maskedNumber: `****${paymentMethod.card_last_four}`,
      isDefault: paymentMethod.is_default
    });

  } catch (error) {
    console.error('❌ [Wallet BFF SharedWallet] Error adding card:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_CARD_ERROR',
        message: 'Failed to add card',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/SharedWallet/bankaccount
 * Add a new bank account (Shared Wallet UI format)
 * This is an alias for the v1 endpoint to match the web component's expected API path
 */
router.post('/SharedWallet/bankaccount', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      accountType,
      routingNumber,
      accountNumber,
      accountHolderName,
      bankName,
      nickname,
      setAsDefault
    } = req.body;

    console.log('🏦 [Wallet BFF SharedWallet] Adding new bank account for user:', userId);

    // Validate required fields
    if (!accountType || !routingNumber || !accountNumber || !accountHolderName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required bank account fields'
        }
      });
    }

    const accountLastFour = accountNumber.slice(-4);

    // ALWAYS set new payment methods as default and unset all other defaults
    // This ensures the most recently added payment method becomes the default
    console.log('🔄 [Wallet BFF SharedWallet] Setting new bank account as default and unsetting other defaults...');
    await PaymentMethod.update(
      { is_default: false },
      { where: { user_id: userId } }
    );

    // Create payment method (always set as default)
    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type: 'ach',
      account_type: accountType,
      routing_number: routingNumber,
      account_last_four: accountLastFour,
      account_holder_name: accountHolderName,
      bank_name: bankName || 'Bank',
      nickname: nickname || null,
      is_default: true, // Always set new payment methods as default
      status: 'active',
      cybersource_token: `cybersource_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ [Wallet BFF SharedWallet] Bank account added successfully:', paymentMethod.id);

    // Return in Shared Wallet UI expected format
    res.json({
      paymentInstrumentToken: `pi_${paymentMethod.id}`,
      paymentInstrumentType: 'BankAccount',
      bankAccountType: paymentMethod.account_type,
      maskedAccountNumber: `****${paymentMethod.account_last_four}`,
      isDefault: paymentMethod.is_default
    });

  } catch (error) {
    console.error('❌ [Wallet BFF SharedWallet] Error adding bank account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_BANK_ERROR',
        message: 'Failed to add bank account',
        details: error.message
      }
    });
  }
});

module.exports = router;
