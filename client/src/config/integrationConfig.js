/**
 * Integration Configuration
 * Defines the integration model for this application
 */

export const INTEGRATION_MODELS = {
  DIRECT_MERCHANT: 'DirectMerchant',
  CLIENT_DIRECT: 'ClientDirect',
  RESIDENT_DIRECT: 'ResidentDirect'
};

export const PAYMENT_TYPES = {
  CARD: 'Card',
  ACH: 'ACH',
  IRD: 'IRD',
  CASH: 'Cash',
  APPLE_PAY: 'ApplePay'
};

/**
 * Application Configuration
 * Change these values based on your application's integration model
 */
export const APP_CONFIG = {
  // Application identification
  applicationName: 'Rent Payment Portal',
  applicationGuid: '550e8400-e29b-41d4-a716-446655440000', // Generate unique GUID for your app

  // Integration model - determines which fields are shown
  // Options: DIRECT_MERCHANT | CLIENT_DIRECT | RESIDENT_DIRECT
  integrationModel: INTEGRATION_MODELS.RESIDENT_DIRECT, // ← Change this to switch models

  // Allowed payment types for this application
  // Currently enabled: Card, ACH
  // Disabled: IRD, Cash, ApplePay
  allowedPaymentTypes: [PAYMENT_TYPES.CARD, PAYMENT_TYPES.ACH]
};

/**
 * Get configuration for API calls
 */
export function getIntegrationConfig() {
  return {
    application_name: APP_CONFIG.applicationName,
    application_guid: APP_CONFIG.applicationGuid,
    integration_model: APP_CONFIG.integrationModel,
    allowed_payment_types: APP_CONFIG.allowedPaymentTypes
  };
}

/**
 * Field labels mapping for different integration models
 */
export const FIELD_LABELS = {
  // Direct Merchant - Simple labels
  DIRECT_MERCHANT: {
    card: 'Card',
    cardNumber: 'Card Number',
    cardHolderName: 'Card Holder Name',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    accountNumber: 'Account Number',
    routingNumber: 'Routing Number',
    accountType: 'Account Type',
    billingAddress: 'Billing Address',
    city: 'City',
    state: 'State',
    zip: 'ZIP',
    payorAccountNickName: 'Payor Account Nick Name'
  },

  // Client Direct - More detailed labels
  CLIENT_DIRECT: {
    ach: 'ACH',
    nameOnCard: 'Name On Card',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    firstName: 'First Name',
    lastName: 'Last Name',
    accountHolderName: 'Account Holder Name',
    accountNumber: 'Account Number',
    routingNumber: 'Routing Number',
    accountType: 'Account Type',
    payorAccountNickName: 'Payor Account Nick Name',
    billingAddressLine1: 'Billing Address Line 1',
    billingAddressLine2: 'Billing Address Line 2',
    city: 'City',
    country: 'Country',
    state: 'State',
    zip: 'ZIP',
    email: 'E-mail',
    phone: 'Phone',
    dob: 'DOB'
  },

  // Resident Direct - All fields
  RESIDENT_DIRECT: {
    ach: 'ACH',
    nameOnCard: 'Name On Card',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    firstName: 'First Name',
    lastName: 'Last Name',
    accountHolderName: 'Account Holder Name',
    accountNumber: 'Account Number',
    routingNumber: 'Routing Number',
    accountType: 'Account Type',
    payorAccountNickName: 'Payor Account Nick Name',
    billingAddressLine1: 'Billing Address Line 1',
    billingAddressLine2: 'Billing Address Line 2',
    city: 'City',
    country: 'Country',
    state: 'State',
    zip: 'ZIP',
    email: 'E-mail',
    phone: 'Phone',
    dob: 'DOB',
    govtId: 'Govt ID',
    ssn: 'SSN'
  }
};
