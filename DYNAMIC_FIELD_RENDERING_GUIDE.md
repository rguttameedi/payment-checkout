# 🎨 Dynamic Field Rendering Guide

## Overview

This guide explains how to implement **dynamic field rendering** in the Shared Wallet UI based on different integration models:

- **Direct Merchant** - Basic fields (Card/ACH only)
- **Client Direct** - Extended fields (includes contact info)
- **Resident Direct** - All fields (includes govt ID, SSN)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Configure Integration Model                    │
│  File: client/src/config/integrationConfig.js          │
│  Action: Set APP_CONFIG.integrationModel                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Frontend Calls BFF with Config                 │
│  File: client/src/services/mockWalletAuth.js           │
│  Action: Pass integration config to BFF                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: BFF Generates Token with Field Config          │
│  File: server/controllers/mockWalletBffController.js   │
│  Action: Include field_config in token                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Dynamic Field Controller Applies CSS           │
│  File: client/src/components/wallet/                   │
│        DynamicFieldController.js                        │
│  Action: Hide/show fields based on token metadata      │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **1. Choose Your Integration Model**

Edit `client/src/config/integrationConfig.js`:

```javascript
export const APP_CONFIG = {
  applicationName: 'Rent Payment Portal',
  applicationGuid: '550e8400-e29b-41d4-a716-446655440000',

  // Change this line to switch models:
  integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT, // ← Change here

  allowedPaymentTypes: [PAYMENT_TYPES.CARD, PAYMENT_TYPES.ACH]
};
```

### **Options:**

```javascript
// Option 1: Direct Merchant (Basic fields)
integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT

// Option 2: Client Direct (Extended fields)
integrationModel: INTEGRATION_MODELS.CLIENT_DIRECT

// Option 3: Resident Direct (All fields)
integrationModel: INTEGRATION_MODELS.RESIDENT_DIRECT
```

### **2. That's It!**

The field visibility is automatically controlled. No other code changes needed!

---

## 📊 Field Comparison

### **Direct Merchant**
```
Card Fields:
  ✅ Card Number
  ✅ Card Holder Name
  ✅ Expiry Date
  ✅ CVV
  ✅ Billing Address (optional)
  ✅ City (optional)
  ✅ State (optional)
  ✅ ZIP (optional)
  ✅ Payor Account Nick Name (optional)

ACH Fields:
  ✅ Account Number
  ✅ Routing Number
  ✅ Account Type
  ✅ Account Holder Name
  ✅ Payor Account Nick Name (optional)

Hidden Fields:
  ❌ First Name, Last Name
  ❌ Country, Email, Phone, DOB
  ❌ Govt ID, SSN
  ❌ Billing Address Line 2
```

### **Client Direct**
```
Card Fields:
  ✅ Name On Card
  ✅ Card Number
  ✅ Expiry Date
  ✅ CVV
  ✅ First Name
  ✅ Last Name
  ✅ Payor Account Nick Name
  ✅ Billing Address Line 1
  ✅ Billing Address Line 2 (optional)
  ✅ City
  ✅ Country
  ✅ State
  ✅ ZIP
  ✅ E-mail
  ✅ Phone
  ✅ DOB

ACH Fields:
  ✅ Account Holder Name
  ✅ Account Number
  ✅ Routing Number
  ✅ Account Type
  ✅ First Name
  ✅ Last Name
  ✅ Payor Account Nick Name
  ✅ Billing Address Line 1
  ✅ Billing Address Line 2 (optional)
  ✅ City
  ✅ Country
  ✅ State
  ✅ ZIP
  ✅ E-mail
  ✅ Phone
  ✅ DOB

Hidden Fields:
  ❌ Govt ID
  ❌ SSN
```

### **Resident Direct**
```
All Fields Visible:
  ✅ All Card fields
  ✅ All ACH fields
  ✅ First Name, Last Name
  ✅ Contact information
  ✅ Govt ID
  ✅ SSN

Hidden Fields:
  (None - all fields shown)
```

---

## 🔧 How It Works

### **1. Token Generation**

When the frontend calls `/api/UserScoped/acquire_user_scoped_token`, the BFF includes field configuration:

```javascript
// Token contents (decoded)
{
  "realpage_id": "1",
  "timestamp": 1708024835000,

  // Application identification
  "application": {
    "name": "Rent Payment Portal",
    "guid": "550e8400-e29b-41d4-a716-446655440000",
    "integration_model": "DirectMerchant",
    "allowed_payment_types": ["Card", "ACH"]
  },

  // Field configuration per payment type
  "field_config": {
    "card": {
      "requiredFields": ["cardNumber", "cardHolderName", "expiryDate", "cvv"],
      "optionalFields": ["billingAddress", "city", "state", "zip"],
      "hiddenFields": ["firstName", "lastName", "email", "phone", "dob"],
      "allowedPaymentTypes": ["Card", "ACH"]
    },
    "ach": {
      "requiredFields": ["accountNumber", "routingNumber", "accountType"],
      "optionalFields": ["payorAccountNickName"],
      "hiddenFields": ["firstName", "lastName", "email", "phone", "dob"],
      "allowedPaymentTypes": ["Card", "ACH"]
    }
  }
}
```

### **2. Dynamic Field Controller**

The `useDynamicFieldControl` hook:

1. **Decodes the token** to extract `field_config`
2. **Accesses Shadow DOM** of the `<wallet-dropdown>` web component
3. **Applies CSS rules** to hide fields listed in `hiddenFields`
4. **Marks required fields** with asterisks
5. **Filters payment types** (hides IRD, Cash, ApplePay)
6. **Adds visual badge** showing integration model

### **3. CSS Application**

```javascript
// For each hidden field
const formGroup = element.closest('.form-group');
formGroup.style.display = 'none';

// Example: Hiding "First Name" field
shadowRoot.querySelector('[name="firstName"]')
  .closest('.form-group')
  .style.display = 'none';
```

---

## 🎯 Use Cases

### **Use Case 1: Simple Merchant Integration**

```javascript
// For a simple e-commerce checkout
export const APP_CONFIG = {
  applicationName: 'E-Commerce Checkout',
  applicationGuid: 'ecommerce-guid-123',
  integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT, // ← Simple fields only
  allowedPaymentTypes: [PAYMENT_TYPES.CARD, PAYMENT_TYPES.ACH]
};
```

**Result**: Users only see basic card/bank info fields. No personal details required.

---

### **Use Case 2: Property Management Portal**

```javascript
// For a property management system
export const APP_CONFIG = {
  applicationName: 'PropertyWare Portal',
  applicationGuid: 'propertyware-guid-456',
  integrationModel: INTEGRATION_MODELS.CLIENT_DIRECT, // ← Extended fields
  allowedPaymentTypes: [PAYMENT_TYPES.CARD, PAYMENT_TYPES.ACH]
};
```

**Result**: Users must provide contact information (email, phone, DOB) but not sensitive govt ID/SSN.

---

### **Use Case 3: Resident Onboarding**

```javascript
// For LOFT Living resident onboarding
export const APP_CONFIG = {
  applicationName: 'LOFT Living',
  applicationGuid: 'loft-living-guid-789',
  integrationModel: INTEGRATION_MODELS.RESIDENT_DIRECT, // ← All fields
  allowedPaymentTypes: [PAYMENT_TYPES.CARD, PAYMENT_TYPES.ACH]
};
```

**Result**: Users must provide all information including govt ID and SSN for compliance/verification.

---

## 🔒 Backend Validation

The BFF also validates that required fields are present based on the integration model:

```javascript
// File: server/config/integrationModels.js

const { isValid, missingFields } = validateRequiredFields(
  'DirectMerchant',
  'card',
  requestBody
);

if (!isValid) {
  return res.status(400).json({
    success: false,
    brokenRules: [{
      ruleCode: 'MISSING_REQUIRED_FIELDS',
      message: `Missing required fields: ${missingFields.join(', ')}`,
      severity: 'Error'
    }]
  });
}
```

This ensures that even if the frontend is bypassed, the backend still enforces field requirements.

---

## 📝 Adding a New Integration Model

### **Step 1: Add to Configuration**

Edit `server/config/integrationModels.js`:

```javascript
const INTEGRATION_MODELS = {
  DIRECT_MERCHANT: 'DirectMerchant',
  CLIENT_DIRECT: 'ClientDirect',
  RESIDENT_DIRECT: 'ResidentDirect',
  MY_CUSTOM_MODEL: 'MyCustomModel' // ← Add your model
};

const FIELD_CONFIGURATIONS = {
  // ... existing configurations

  [INTEGRATION_MODELS.MY_CUSTOM_MODEL]: {
    card: {
      required: ['cardNumber', 'cardHolderName', 'expiryDate'],
      optional: ['cvv', 'nickname']
    },
    ach: {
      required: ['accountNumber', 'routingNumber'],
      optional: ['accountType']
    },
    hiddenFields: ['ssn', 'govtId', 'dob']
  }
};
```

### **Step 2: Update Frontend Config**

Edit `client/src/config/integrationConfig.js`:

```javascript
export const INTEGRATION_MODELS = {
  DIRECT_MERCHANT: 'DirectMerchant',
  CLIENT_DIRECT: 'ClientDirect',
  RESIDENT_DIRECT: 'ResidentDirect',
  MY_CUSTOM_MODEL: 'MyCustomModel' // ← Add here too
};

export const APP_CONFIG = {
  integrationModel: INTEGRATION_MODELS.MY_CUSTOM_MODEL // ← Use it
};
```

### **Step 3: Done!**

The system will automatically:
- Include your field config in the token
- Apply visibility rules
- Validate required fields on the backend

---

## 🧪 Testing Different Models

### **Option 1: Environment Variables**

```bash
# .env.development
REACT_APP_INTEGRATION_MODEL=DirectMerchant

# .env.staging
REACT_APP_INTEGRATION_MODEL=ClientDirect

# .env.production
REACT_APP_INTEGRATION_MODEL=ResidentDirect
```

Then in `integrationConfig.js`:

```javascript
export const APP_CONFIG = {
  integrationModel: process.env.REACT_APP_INTEGRATION_MODEL || INTEGRATION_MODELS.DIRECT_MERCHANT
};
```

### **Option 2: Runtime Configuration**

Create an API endpoint that returns the integration model:

```javascript
// Backend: GET /api/config
router.get('/config', (req, res) => {
  res.json({
    integrationModel: process.env.INTEGRATION_MODEL || 'DirectMerchant'
  });
});

// Frontend: Fetch at startup
const config = await fetch('/api/config').then(r => r.json());
APP_CONFIG.integrationModel = config.integrationModel;
```

### **Option 3: User-Based Configuration**

Different integration models for different user types:

```javascript
// In mockWalletAuth.js
async acquireUserScopedToken(operationsToken, walletToken) {
  const userType = localStorage.getItem('userType'); // 'merchant', 'client', 'resident'

  const integrationModelMap = {
    'merchant': INTEGRATION_MODELS.DIRECT_MERCHANT,
    'client': INTEGRATION_MODELS.CLIENT_DIRECT,
    'resident': INTEGRATION_MODELS.RESIDENT_DIRECT
  };

  const integrationConfig = {
    ...getIntegrationConfig(),
    integration_model: integrationModelMap[userType] || INTEGRATION_MODELS.DIRECT_MERCHANT
  };

  // Use integrationConfig in API call
}
```

---

## 🐛 Troubleshooting

### **Problem: Fields Not Hiding**

**Solution 1: Check Shadow DOM Access**
```javascript
// Add this debug code to DynamicFieldController.js
console.log('Shadow Root:', walletRef.current.shadowRoot);
console.log('Form Elements:', shadowRoot.querySelectorAll('input'));
```

**Solution 2: Update Field Selectors**

The Shared Wallet UI might use different field names. Update the selectors in `hideFields()`:

```javascript
const selectors = [
  `[name="${fieldName}"]`,
  `[id="${fieldName}"]`,
  `[data-field="${fieldName}"]`,
  `[data-name="${fieldName}"]`, // ← Add more selectors
  `[class*="${fieldName}"]`      // ← Try class-based matching
];
```

---

### **Problem: Token Not Decoded**

**Solution: Check Token Format**

```javascript
// In browser console
const token = sessionStorage.getItem('wallet_tokens');
const parsed = JSON.parse(token);
const decoded = atob(parsed.userScopedAccessToken);
console.log('Decoded Token:', JSON.parse(decoded));
```

If `field_config` is missing, the backend didn't include it. Check:
1. Is `integrationModels.js` imported in the controller?
2. Is `getFieldConfiguration()` being called?
3. Are there any backend errors in the logs?

---

### **Problem: Required Fields Not Marked**

**Solution: Add Manual Indicators**

```javascript
// In markRequiredFields()
const label = shadowRoot.querySelector(`label[for="${element.id}"]`);
if (label) {
  label.innerHTML += '<span style="color: red;"> *</span>';
}
```

---

## 📊 Visual Examples

### **Direct Merchant View**
```
┌─────────────────────────────────────┐
│  Card Number:     [____________]    │
│  Card Holder:     [____________]    │
│  Expiry Date:     [____] / [____]   │
│  CVV:             [____]            │
│                                      │
│  Billing Address: [____________]    │
│  City:            [____________]    │
│  State:           [____]            │
│  ZIP:             [_____]           │
│                                      │
│           [Add Payment Method]      │
└─────────────────────────────────────┘
```

### **Client Direct View**
```
┌─────────────────────────────────────┐
│  Name On Card:    [____________]    │
│  Card Number:     [____________]    │
│  Expiry Date:     [____] / [____]   │
│  CVV:             [____]            │
│                                      │
│  First Name:      [____________]    │
│  Last Name:       [____________]    │
│                                      │
│  Address Line 1:  [____________]    │
│  Address Line 2:  [____________]    │
│  City:            [____________]    │
│  Country:         [____________]    │
│  State:           [____]            │
│  ZIP:             [_____]           │
│                                      │
│  E-mail:          [____________]    │
│  Phone:           [____________]    │
│  DOB:             [____/____/____]  │
│                                      │
│           [Add Payment Method]      │
└─────────────────────────────────────┘
```

### **Resident Direct View**
```
┌─────────────────────────────────────┐
│  (All Client Direct fields PLUS:)  │
│                                      │
│  Govt ID:         [____________]    │
│  SSN:             [___-__-____]     │
│                                      │
│           [Add Payment Method]      │
└─────────────────────────────────────┘
```

---

## 🎯 Summary

✅ **Change ONE line** to switch integration models
✅ **Automatic field hiding** via Shadow DOM manipulation
✅ **Backend validation** ensures data integrity
✅ **Token-based configuration** for multi-tenant support
✅ **No changes** to the Shared Wallet UI component itself

**To switch models, just change:**
```javascript
integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT // ← This line!
```

That's it! 🚀
