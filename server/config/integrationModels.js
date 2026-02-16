/**
 * Integration Model Configuration
 * Defines field requirements for different integration models
 */

const INTEGRATION_MODELS = {
  DIRECT_MERCHANT: 'DirectMerchant',
  CLIENT_DIRECT: 'ClientDirect',
  RESIDENT_DIRECT: 'ResidentDirect'
};

const PAYMENT_TYPES = {
  CARD: 'Card',
  ACH: 'ACH',
  IRD: 'IRD',           // Disabled for now
  CASH: 'Cash',         // Disabled for now
  APPLE_PAY: 'ApplePay' // Disabled for now
};

/**
 * Field configuration for each integration model
 */
const FIELD_CONFIGURATIONS = {
  [INTEGRATION_MODELS.DIRECT_MERCHANT]: {
    card: {
      required: ['cardNumber', 'cardHolderName', 'expiryDate', 'cvv'],
      optional: ['billingAddress', 'city', 'state', 'zip', 'payorAccountNickName']
    },
    ach: {
      required: ['accountNumber', 'routingNumber', 'accountType', 'accountHolderName'],
      optional: ['payorAccountNickName']
    },
    hiddenFields: [
      'firstName', 'lastName', 'country', 'email', 'phone', 'dob',
      'govtId', 'ssn', 'billingAddressLine2'
    ]
  },

  [INTEGRATION_MODELS.CLIENT_DIRECT]: {
    card: {
      required: [
        'nameOnCard', 'cardNumber', 'expiryDate', 'cvv',
        'firstName', 'lastName', 'payorAccountNickName',
        'billingAddressLine1', 'city', 'country', 'state', 'zip',
        'email', 'phone', 'dob'
      ],
      optional: ['billingAddressLine2']
    },
    ach: {
      required: [
        'accountHolderName', 'accountNumber', 'routingNumber', 'accountType',
        'firstName', 'lastName', 'payorAccountNickName',
        'billingAddressLine1', 'city', 'country', 'state', 'zip',
        'email', 'phone', 'dob'
      ],
      optional: ['billingAddressLine2']
    },
    hiddenFields: ['govtId', 'ssn']
  },

  [INTEGRATION_MODELS.RESIDENT_DIRECT]: {
    card: {
      required: [
        'nameOnCard', 'cardNumber', 'expiryDate', 'cvv',
        'firstName', 'lastName', 'payorAccountNickName',
        'billingAddressLine1', 'city', 'country', 'state', 'zip',
        'email', 'phone', 'dob', 'govtId', 'ssn'
      ],
      optional: ['billingAddressLine2']
    },
    ach: {
      required: [
        'accountHolderName', 'accountNumber', 'routingNumber', 'accountType',
        'firstName', 'lastName', 'payorAccountNickName',
        'billingAddressLine1', 'city', 'country', 'state', 'zip',
        'email', 'phone', 'dob', 'govtId', 'ssn'
      ],
      optional: ['billingAddressLine2']
    },
    hiddenFields: [] // All fields visible
  }
};

/**
 * Get allowed payment types for an integration model
 */
function getAllowedPaymentTypes(integrationModel) {
  // For now, all models support Card and ACH only
  // IRD, Cash, ApplePay are disabled
  return [PAYMENT_TYPES.CARD, PAYMENT_TYPES.ACH];
}

/**
 * Get field configuration for an integration model and payment type
 */
function getFieldConfiguration(integrationModel, paymentType) {
  const config = FIELD_CONFIGURATIONS[integrationModel];

  if (!config) {
    throw new Error(`Unknown integration model: ${integrationModel}`);
  }

  const paymentConfig = paymentType.toLowerCase() === 'card' ? config.card : config.ach;

  return {
    requiredFields: paymentConfig.required,
    optionalFields: paymentConfig.optional,
    hiddenFields: config.hiddenFields,
    allowedPaymentTypes: getAllowedPaymentTypes(integrationModel)
  };
}

/**
 * Validate that required fields are present in request
 */
function validateRequiredFields(integrationModel, paymentType, requestBody) {
  const config = getFieldConfiguration(integrationModel, paymentType);
  const missingFields = [];

  config.requiredFields.forEach(field => {
    // Handle nested fields (e.g., billingAddress.city)
    const fieldValue = getNestedValue(requestBody, field);
    if (!fieldValue || fieldValue === '') {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Get nested value from object (e.g., "billingAddress.city")
 */
function getNestedValue(obj, path) {
  if (!path.includes('.')) {
    return obj[path];
  }

  const parts = path.split('.');
  let value = obj;

  for (const part of parts) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[part];
  }

  return value;
}

module.exports = {
  INTEGRATION_MODELS,
  PAYMENT_TYPES,
  FIELD_CONFIGURATIONS,
  getAllowedPaymentTypes,
  getFieldConfiguration,
  validateRequiredFields
};
