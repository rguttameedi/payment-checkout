# Shared Wallet UI Integration Guide

## 🎉 Integration Complete!

The Shared Wallet UI has been successfully integrated into your payment-checkout application. This guide will help you understand what was integrated and how to use it.

---

## 📋 Table of Contents

1. [What Was Integrated](#what-was-integrated)
2. [New Pages & Routes](#new-pages--routes)
3. [How to Test the Integration](#how-to-test-the-integration)
4. [Architecture Overview](#architecture-overview)
5. [Key Components](#key-components)
6. [Mock vs Production](#mock-vs-production)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 What Was Integrated

### 1. **Shared Wallet UI Web Components**
- Built from source: `C:\Users\rguttameedi1\source\repos\upp-wallet-ui`
- Copied to: `C:\Misc\Project_Learning\payment-checkout\client\public\lib\wallet-ui\`
- Main files:
  - `wallet-ui.esm.js` - Web component bundle
  - `wallet-ui.css` - Component styles

### 2. **Mock Authentication Service**
- File: `client/src/services/mockWalletAuth.js`
- Purpose: Generates mock JWT tokens for local development
- Functions:
  - `getOperationsToken()` - Get operations scope token
  - `getWalletToken()` - Get wallet scope token
  - `acquireUserScopedToken()` - Get encrypted user context token
  - `initializeWallet()` - Initialize all tokens at once

### 3. **Mock BFF API Endpoints**
- Controller: `server/controllers/mockWalletBffController.js`
- Routes: `server/routes/mockWalletBff.js`
- Base URL: `http://localhost:5000/api/wallet-bff`
- Endpoints:
  - `POST /UserScoped/acquire_user_scoped_token` - Get user scoped token
  - `GET /SharedWallet/wallet` - List payment instruments
  - `POST /SharedWallet/card` - Add credit card
  - `POST /SharedWallet/bankaccount` - Add bank account
  - `POST /SharedWallet/ValidateMFA` - MFA validation (auto-approved in mock)
  - `GET /SharedWallet/MfaStatus` - Check MFA status

### 4. **React Wrapper Component**
- File: `client/src/components/wallet/SharedWalletDropdown.js`
- Purpose: React wrapper for the web component
- Features:
  - Automatic token initialization
  - Event handling
  - Loading states
  - Error handling

### 5. **New Pages**
- **Make Payment with Wallet**: `client/src/pages/tenant/MakePaymentWithWallet.js`
- **Payment Methods with Wallet**: `client/src/pages/tenant/PaymentMethodsWithWallet.js`

---

## 🗺️ New Pages & Routes

### Available Routes

| Route | Description | Component |
|-------|-------------|-----------|
| `/tenant/make-payment-wallet` | Make payment using Shared Wallet UI | MakePaymentWithWallet |
| `/tenant/payment-methods-wallet` | Manage payment methods | PaymentMethodsWithWallet |

### Original Routes (Still Available)

| Route | Description |
|-------|-------------|
| `/tenant/make-payment` | Original payment page (without wallet UI) |
| `/tenant/payment-methods` | Original payment methods page |

---

## 🧪 How to Test the Integration

### Step 1: Start the Backend Server

```bash
cd C:\Misc\Project_Learning\payment-checkout\server
npm start
```

The server should start on `http://localhost:5000` and show the wallet BFF endpoints:

```
🔄 Mock Wallet BFF (Shared Wallet UI):
   POST   /api/wallet-bff/UserScoped/acquire_user_scoped_token
   GET    /api/wallet-bff/SharedWallet/wallet
   POST   /api/wallet-bff/SharedWallet/card
   POST   /api/wallet-bff/SharedWallet/bankaccount
```

### Step 2: Start the Frontend Client

```bash
cd C:\Misc\Project_Learning\payment-checkout\client
npm start
```

The React app should start on `http://localhost:3000`

### Step 3: Login to the Application

1. Go to `http://localhost:3000`
2. Login with your tenant credentials
3. You'll be redirected to the tenant dashboard

### Step 4: Test Make Payment with Wallet

1. Navigate to: `http://localhost:3000/tenant/make-payment-wallet`
2. You should see:
   - Lease information
   - Payment details form (amount, month, year)
   - **Shared Wallet UI dropdown** for payment method selection
   - A "🆕 Shared Wallet UI Integration" badge
3. Try the following:
   - **Select an existing payment method** (if you have any)
   - **Add a new credit card**:
     - Click "Add Card" in the dropdown
     - Fill in card details (use test card: `4111111111111111`)
     - CVV: `123`, Expiry: Any future date
     - Submit the form
   - **Add a new bank account**:
     - Click "Add Bank Account"
     - Routing Number: `011000015` (test routing number)
     - Account Number: Any 10-12 digits
     - Account Type: Checking or Savings
     - Submit the form
4. After adding/selecting a payment method, complete the payment

### Step 5: Test Payment Methods Management

1. Navigate to: `http://localhost:3000/tenant/payment-methods-wallet`
2. You should see:
   - Info card explaining payment methods
   - **Shared Wallet UI** for managing payment instruments
   - Selected payment details (when you select one)
   - Help section
   - Integration info
3. Try:
   - View all your payment methods
   - Add new cards and bank accounts
   - Select a payment method
   - Click "Make Payment with This Method" to proceed to payment

### Expected Behavior

#### ✅ Successful Credit Card Addition
1. Fill in card details
2. System validates card number (Luhn algorithm)
3. Mock BFF creates payment method in database
4. Success toast notification
5. Card appears in wallet dropdown

#### ✅ Successful Bank Account Addition
1. Fill in account details
2. System validates routing number
3. Mock BFF creates payment method in database
4. Success toast notification
5. Account appears in wallet dropdown

#### 🔍 Console Logs to Watch
Check browser console (F12) for:
- `🔐 Mock Operations Token generated`
- `🔐 Mock Wallet Token generated`
- `✅ Mock User Scoped Token acquired`
- `✅ Wallet UI script loaded successfully`
- `✅ Wallet authentication initialized`
- `💳 Payment method selected`
- `✅ Card added` or `✅ Bank account added`

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MakePaymentWithWallet.js /                   │  │
│  │      PaymentMethodsWithWallet.js                     │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │   SharedWalletDropdown.js (React Wrapper)      │ │  │
│  │  │                                                 │ │  │
│  │  │   ┌─────────────────────────────────────────┐ │ │  │
│  │  │   │  <wallet-dropdown> Web Component        │ │ │  │
│  │  │   │  (StencilJS - from upp-wallet-ui)       │ │ │  │
│  │  │   └─────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   mockWalletAuth.js (Token Generation)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    HTTP Requests
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Node.js Express Server                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   mockWalletBffController.js (Mock BFF Logic)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   PaymentMethod Model (Sequelize/SQLite)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Component Mounts** → `SharedWalletDropdown` loads wallet UI script
2. **Authentication** → `mockWalletAuth.initializeWallet()` generates tokens
3. **Wallet Loads** → Web component calls mock BFF to fetch payment methods
4. **User Action** → Add card/bank account via wallet UI
5. **Submit** → Web component posts to mock BFF
6. **BFF Processing** → Mock BFF validates and saves to database
7. **Success** → Event emitted, React component updates
8. **Payment** → Selected payment method used for payment processing

---

## 🔑 Key Components

### 1. SharedWalletDropdown Component

**Location**: `client/src/components/wallet/SharedWalletDropdown.js`

**Props**:
```javascript
<SharedWalletDropdown
  environment="localdevelopment"      // Environment setting
  displayMode="full"                  // Display mode
  paymentType="all"                   // Filter: all, card, bank
  selectPayment=""                    // Pre-selected payment token
  onPaymentSelected={handleFunc}      // Callback on selection
  onPaymentAdded={handleFunc}         // Callback on addition
  onError={handleFunc}                // Callback on error
/>
```

**Events**:
- `onPaymentSelected(paymentDetail)` - When user selects a payment method
- `onPaymentAdded(paymentDetail)` - When user adds a new payment method
- `onError(error)` - When an error occurs

### 2. Mock Wallet Auth Service

**Location**: `client/src/services/mockWalletAuth.js`

**Key Methods**:
```javascript
// Initialize all tokens
const tokens = await mockWalletAuth.initializeWallet();

// Get or use cached tokens
const tokens = await mockWalletAuth.getOrInitializeTokens();

// Force refresh tokens
const tokens = await mockWalletAuth.getOrInitializeTokens(true);
```

**Token Structure**:
```javascript
{
  operationsToken: "eyJhb...",           // JWT for operations scope
  walletToken: "eyJhb...",               // JWT for wallet scope
  userScopedAccessToken: "encrypted...", // Encrypted user context
  expiresAt: "2026-02-13T20:00:00Z",    // Expiration timestamp
  expiresIn: 3600                        // Expiration in seconds
}
```

### 3. Mock BFF Controller

**Location**: `server/controllers/mockWalletBffController.js`

**Key Functions**:
- `acquireUserScopedToken()` - Generate encrypted user token
- `getWallet()` - List all payment instruments
- `addCard()` - Add credit card
- `addBankAccount()` - Add bank account
- `validateMFA()` - MFA validation (auto-approved)
- `getMfaStatus()` - Check MFA status (always verified)

---

## 🔄 Mock vs Production

### Current Setup: Mock Mode

The integration is currently running in **MOCK MODE** for learning and development:

✅ **What Works in Mock Mode**:
- Token generation (fake JWT tokens)
- Payment method storage (local SQLite database)
- UI functionality (all features work)
- Event handling
- Validation
- All API endpoints

❌ **What's Mocked**:
- Authentication (fake tokens instead of real IDP)
- BFF API (local Node.js instead of real BFF)
- Tokenization (mock tokens instead of real vendor tokens)
- MFA (auto-approved instead of real verification)
- Fraud detection (bypassed)

### Moving to Production

To use the **REAL** Shared Wallet UI with production infrastructure:

1. **Get Real Tokens**:
   - Integrate with Unified Login IDP
   - Get operations token with `urn:upp-wallet-operations` scope
   - Get wallet token with `urn:upp-wallet` scope

2. **Configure BFF**:
   - Point to real Shared Wallet BFF
   - Production: `https://internalapi.realpage.com/payments/sharedwallet-bff`
   - Staging: `https://internalapi-sat.realpage.com/payments/sharedwallet-bff`

3. **Update Environment**:
   ```javascript
   <SharedWalletDropdown
     environment="production"  // or "staging"
     // ... other props
   />
   ```

4. **Replace Mock Auth**:
   - Remove `mockWalletAuth` calls
   - Use real authentication service
   - Get real user scoped token from BFF

---

## 🌐 API Endpoints

### Mock BFF Endpoints

**Base URL**: `http://localhost:5000/api/wallet-bff`

#### 1. Acquire User Scoped Token
```http
POST /api/wallet-bff/UserScoped/acquire_user_scoped_token
Authorization: Bearer {operations_token}
Content-Type: application/json

{
  "realpage_id": "123",
  "upp_wallet_token": "jwt_token_here"
}
```

**Response**:
```json
{
  "user_scoped_access_token": "encrypted_token",
  "expiresAt": "2026-02-13T20:00:00Z",
  "expires_in": 3600
}
```

#### 2. Get Wallet (List Payment Methods)
```http
GET /api/wallet-bff/SharedWallet/wallet
Authorization: Bearer {operations_token}
X-SW-API-KEY: {user_scoped_token}
```

**Response**:
```json
{
  "paymentInstruments": [
    {
      "paymentInstrumentToken": "pi_123",
      "paymentInstrumentType": "Card",
      "paymentCard": {
        "maskedNumber": "****1111",
        "cardInformation": {
          "cardProduct": "Visa"
        }
      }
    }
  ],
  "availableCreditCards": [
    { "accountTypeId": 1, "name": "Visa" }
  ]
}
```

#### 3. Add Credit Card
```http
POST /api/wallet-bff/SharedWallet/card
Authorization: Bearer {operations_token}
X-SW-API-KEY: {user_scoped_token}
Content-Type: application/json

{
  "cardNumber": "4111111111111111",
  "expirationMonth": "12",
  "expirationYear": "2027",
  "cvv": "123",
  "payorInformation": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "billingAddress": {
    "addressLine1": "123 Main St",
    "city": "Dallas",
    "provinceOrStateCode": "TX",
    "postalCode": "75201",
    "countryCode": "US"
  }
}
```

#### 4. Add Bank Account
```http
POST /api/wallet-bff/SharedWallet/bankaccount
Authorization: Bearer {operations_token}
X-SW-API-KEY: {user_scoped_token}
Content-Type: application/json

{
  "accountNumber": "1234567890",
  "routingNumber": "011000015",
  "accountType": "Checking",
  "payorInformation": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "billingAddress": { ... }
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to load Wallet UI script"

**Cause**: Wallet UI files not found in public folder

**Solution**:
1. Verify files exist: `client/public/lib/wallet-ui/wallet-ui.esm.js`
2. If missing, rebuild and copy:
   ```bash
   cd C:\Users\rguttameedi1\source\repos\upp-wallet-ui
   npm run build
   cp -r dist/wallet-ui/* C:\Misc\Project_Learning\payment-checkout\client\public\lib/wallet-ui/
   ```

### Issue: "Authentication Failed"

**Cause**: Mock token generation issue

**Solution**:
1. Check browser console for token generation logs
2. Clear session storage: `sessionStorage.clear()`
3. Refresh the page

### Issue: "Payment method not appearing after adding"

**Cause**: Database not updating or wallet not refreshing

**Solution**:
1. Check backend console for BFF logs
2. Verify database: `server/database.sqlite`
3. Force refresh wallet by navigating away and back

### Issue: "CORS Errors"

**Cause**: Frontend and backend running on different ports

**Solution**:
1. Ensure backend is running on `localhost:5000`
2. Ensure frontend is running on `localhost:3000`
3. Check `server/server.js` CORS configuration

### Issue: "Web component not rendering"

**Cause**: StencilJS web component not loaded properly

**Solution**:
1. Check browser console for errors
2. Verify script tag in browser DevTools
3. Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

---

## 📚 Additional Resources

### Documentation Files
- **UPP Wallet UI Repo**: `C:\Users\rguttameedi1\source\repos\upp-wallet-ui\README.md`
- **Integration Guide**: `C:\Users\rguttameedi1\source\repos\upp-wallet-ui\Guide.md`
- **Event Tracking**: `C:\Users\rguttameedi1\source\repos\upp-wallet-ui\docs\EVENT_TRACKING.md`

### Test Cards
- **Visa**: `4111111111111111`
- **Mastercard**: `5555555555554444`
- **Amex**: `378282246310005`
- **Discover**: `6011111111111117`

### Test Bank Routing Numbers
- `011000015` - Federal Reserve Bank
- `021000021` - JPMorgan Chase
- `122000661` - Wells Fargo

---

## 🎓 Learning Points

### What You've Learned
1. **Web Components Integration** - How to integrate StencilJS web components in React
2. **Dual-Token Authentication** - Operations token + User scoped token pattern
3. **BFF Pattern** - Backend for Frontend architecture
4. **Event-Driven UI** - Custom events for component communication
5. **Mock Services** - Creating mock services for development
6. **Payment Tokenization** - Secure payment instrument storage

### Next Steps
1. Explore the wallet UI source code in `upp-wallet-ui`
2. Try adding different payment types
3. Customize the wallet UI styling
4. Add more validation logic
5. Implement real authentication when ready

---

## 🎉 Congratulations!

You've successfully integrated the Shared Wallet UI into your payment-checkout application! The integration is fully functional in mock mode and ready for testing.

**Quick Links**:
- Make Payment: http://localhost:3000/tenant/make-payment-wallet
- Payment Methods: http://localhost:3000/tenant/payment-methods-wallet

**Questions or Issues?**
Check the browser console and backend logs for debugging information.

Happy coding! 🚀
