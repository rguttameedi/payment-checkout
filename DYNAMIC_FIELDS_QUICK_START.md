# 🚀 Dynamic Field Rendering - Quick Start

## ✨ What You Can Do

Change **one line of code** to switch between different field layouts for the Shared Wallet iframe:

```javascript
// File: client/src/config/integrationConfig.js

export const APP_CONFIG = {
  integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT  // ← Change this!
};
```

## 🎨 Available Models

| Model | Use Case | Fields Shown |
|-------|----------|--------------|
| **DIRECT_MERCHANT** | Simple checkout | Card + Billing (8 fields) |
| **CLIENT_DIRECT** | Property management | + Contact info (16 fields) |
| **RESIDENT_DIRECT** | Resident onboarding | + Govt ID/SSN (18 fields) |

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION STARTUP                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. Load Integration Config                                      │
│    File: client/src/config/integrationConfig.js                │
│                                                                  │
│    APP_CONFIG = {                                               │
│      applicationName: "Rent Payment Portal",                   │
│      integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT,     │
│      allowedPaymentTypes: ["Card", "ACH"]                      │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. User Initiates Payment / Opens Shared Wallet                 │
│    Component: SharedWalletDropdown                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Get User Scoped Token                                        │
│    File: client/src/services/mockWalletAuth.js                 │
│                                                                  │
│    POST /api/UserScoped/acquire_user_scoped_token              │
│    Body: {                                                      │
│      realpage_id: "1",                                         │
│      upp_wallet_token: "mock.xyz",                             │
│      application_name: "Rent Payment Portal",                  │
│      integration_model: "DirectMerchant",          ← Sent here │
│      allowed_payment_types: ["Card", "ACH"]                    │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BFF Generates Enhanced Token                                 │
│    File: server/controllers/mockWalletBffController.js         │
│    Config: server/config/integrationModels.js                  │
│                                                                  │
│    tokenData = {                                                │
│      realpage_id: "1",                                         │
│      timestamp: 1708024835000,                                 │
│      application: {                                            │
│        name: "Rent Payment Portal",                            │
│        integration_model: "DirectMerchant",                    │
│        allowed_payment_types: ["Card", "ACH"]                  │
│      },                                                         │
│      field_config: {                                           │
│        card: {                                                 │
│          requiredFields: ["cardNumber", ...],     ← Generated │
│          hiddenFields: ["firstName", "ssn", ...]  ← Based on  │
│        },                                          ← Model     │
│        ach: { ... }                                            │
│      }                                                          │
│    }                                                            │
│                                                                  │
│    Token = Base64(JSON.stringify(tokenData))                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Token Passed to Web Component                                │
│    Component: SharedWalletDropdown                              │
│                                                                  │
│    <wallet-dropdown                                             │
│      operations-token={operationsToken}                         │
│      user-scoped-access-token={userScopedAccessToken}          │
│      environment="localdevelopment"                             │
│      api-base-url="http://localhost:50155"                     │
│    />                                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Dynamic Field Controller Activates                           │
│    File: client/src/components/wallet/                         │
│          DynamicFieldController.js                              │
│                                                                  │
│    1. Decode userScopedAccessToken                             │
│    2. Extract field_config from token                          │
│    3. Access Shadow DOM of <wallet-dropdown>                   │
│    4. Apply CSS: Hide fields in hiddenFields[]                 │
│    5. Mark fields in requiredFields[] with asterisk            │
│    6. Hide disabled payment types (IRD, Cash, ApplePay)        │
│    7. Add integration model badge                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. User Sees Dynamic Form                                       │
│                                                                  │
│  ┌────────────────────────────────────┐                        │
│  │ Rent Payment Portal - DirectMerchant                        │
│  ├────────────────────────────────────┤                        │
│  │ Card Number:    [____________]     │                        │
│  │ Card Holder:    [____________]     │                        │
│  │ Expiry Date:    [____] / [____]    │                        │
│  │ CVV:            [____]             │                        │
│  │                                     │                        │
│  │ (Fields like First Name, SSN are   │                        │
│  │  hidden via display: none)         │                        │
│  │                                     │                        │
│  │     [Add Payment Method]           │                        │
│  └────────────────────────────────────┘                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. User Submits Form                                            │
│    Shared Wallet UI → POST /api/SharedWallet/card              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. BFF Validates Required Fields                                │
│    File: server/config/integrationModels.js                    │
│                                                                  │
│    const { isValid, missingFields } =                           │
│      validateRequiredFields(                                    │
│        "DirectMerchant",                                        │
│        "card",                                                  │
│        requestBody                                              │
│      );                                                         │
│                                                                  │
│    if (!isValid) {                                             │
│      return 400 Bad Request with missing fields                │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. Payment Method Saved                                        │
│     Database: payment_methods table                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Checklist

✅ **Backend Configuration**
- [x] Created `server/config/integrationModels.js`
- [x] Updated `server/controllers/mockWalletBffController.js`
- [x] Token includes `field_config` based on integration model

✅ **Frontend Configuration**
- [x] Created `client/src/config/integrationConfig.js`
- [x] Updated `client/src/services/mockWalletAuth.js`
- [x] Passes integration model to BFF

✅ **Dynamic Field Control**
- [x] Created `client/src/components/wallet/DynamicFieldController.js`
- [x] Updated `SharedWalletDropdown` to use dynamic controller
- [x] Fields hidden/shown based on token metadata

✅ **Documentation**
- [x] Created `DYNAMIC_FIELD_RENDERING_GUIDE.md`
- [x] Created `DYNAMIC_FIELDS_QUICK_START.md`

---

## 🎯 How to Switch Models

### **For Development Testing:**

```javascript
// File: client/src/config/integrationConfig.js
export const APP_CONFIG = {
  integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT  // ← Change this line!
};
```

### **For Multi-Tenant Deployment:**

```javascript
// Option 1: Environment Variables
integrationModel: process.env.REACT_APP_INTEGRATION_MODEL

// Option 2: API Configuration
const config = await fetch('/api/config').then(r => r.json());
APP_CONFIG.integrationModel = config.integrationModel;

// Option 3: User-Based
const userType = getCurrentUserType(); // 'merchant', 'client', 'resident'
APP_CONFIG.integrationModel = modelMap[userType];
```

---

## 🧪 Testing

### **Test All Models:**

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd client
npm start
```

### **Switch Models:**

1. Edit `client/src/config/integrationConfig.js`
2. Change `integrationModel` value
3. Refresh browser
4. Open payment method form
5. Verify correct fields are shown/hidden

### **Expected Results:**

| Model | Visible Fields | Hidden Fields |
|-------|----------------|---------------|
| DirectMerchant | 8-9 fields | firstName, lastName, email, phone, dob, govtId, ssn |
| ClientDirect | 15-16 fields | govtId, ssn |
| ResidentDirect | 18 fields | (none - all visible) |

---

## 🐛 Quick Troubleshooting

**Problem**: Fields not hiding

**Solution**: Open browser console, check for:
```
🎨 Applying dynamic field configuration: { integrationModel: "DirectMerchant", ... }
✅ Hidden field: firstName
✅ Hidden field: lastName
...
```

If missing, check:
1. Token decoding: `console.log(atob(userScopedAccessToken))`
2. Shadow DOM access: `console.log(walletRef.current.shadowRoot)`
3. Backend logs: Check server console for token generation

---

## 🚀 Next Steps

1. **Test all three models** by switching `integrationModel`
2. **Customize field lists** in `integrationModels.js` if needed
3. **Add your own model** for custom field combinations
4. **Deploy** with environment-based configuration

---

## 📚 Full Documentation

See [DYNAMIC_FIELD_RENDERING_GUIDE.md](./DYNAMIC_FIELD_RENDERING_GUIDE.md) for:
- Detailed architecture
- Use cases and examples
- Adding custom models
- Advanced configuration
- Complete troubleshooting guide

---

## ✨ Summary

**Dynamic field rendering is now fully implemented!**

- ✅ Change **1 line** to switch models
- ✅ **3 pre-configured** integration models
- ✅ **Automatic** field hiding via Shadow DOM
- ✅ **Backend validation** of required fields
- ✅ **Token-based** configuration (multi-tenant ready)

**Just change this:**
```javascript
integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT
```

**And the iframe will automatically render the correct fields!** 🎉
