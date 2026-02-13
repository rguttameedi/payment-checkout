# UPP Wallet API Integration Guide

This document explains how the Shared Wallet BFF integrates with the UPP Wallet Tokenization API and how our mock implementation simulates this integration.

## Architecture Overview

```
┌──────────────────────┐
│  Shared Wallet UI    │ (Frontend - StencilJS Web Components)
│  (Web Components)    │
└──────────┬───────────┘
           │ HTTP Calls
           ↓
┌──────────────────────┐
│  Shared Wallet BFF   │ (Backend for Frontend)
│                      │ - Handles authentication
│                      │ - Formats requests/responses
│                      │ - Calls UPP Wallet API
└──────────┬───────────┘
           │ HTTP Calls
           ↓
┌──────────────────────┐
│  UPP Wallet API      │ (.NET 9 Tokenization Service)
│  (Backend)           │ - Payment tokenization
│                      │ - DynamoDB storage
│                      │ - Vendor integration (JackHenry, Cybersource)
│                      │ - AWS Payment Cryptography
└──────────────────────┘
```

## Real UPP Wallet API Endpoints

### Base URL
- **Production**: `https://wallet-api.realpage.com` (example)
- **Development**: `https://wallet-api-dev.realpage.com` (example)
- **Local**: `http://localhost:5000` (when running locally)

### Authentication
All endpoints require JWT Bearer token with:
- **Authority**: Unified Login IDP
- **Audience**: `urn:upp-wallet`
- **Scope**: Must include wallet operations scope

### 1. Get Wallet (List Payment Instruments)

**Endpoint**: `POST /wallet/v1/wallet`

**Request Body**:
```json
{
  "walletId": "string (optional)",
  "realPageId": "1234567-4567891-1111-78899",
  "customer": {
    "customerId": "string",
    "customerType": "Resident|Applicant|Guarantor"
  }
}
```

**Response** (200 OK):
```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "resultMessage": "Wallet retrieved successfully",
  "walletId": "WLT_123456",
  "walletOwnerIdentifiers": {
    "realPageId": "1234567-4567891-1111-78899",
    "consumerIdentityId": null,
    "customer": {
      "customerId": "12345",
      "customerType": "Resident"
    }
  },
  "paymentInstruments": [
    {
      "walletId": "WLT_123456",
      "paymentInstrumentToken": "PI_CC_789012",
      "paymentInstrumentType": "Card",
      "vendorInstrumentTokens": [
        {
          "vendor": "Cybersource",
          "vendorToken": "7010000000012345678",
          "isPrimary": true
        }
      ],
      "paymentCard": {
        "cardBrand": "Visa",
        "lastFourDigits": "1111",
        "expirationMonth": "12",
        "expirationYear": "2025",
        "payorInformation": {
          "firstName": "John",
          "lastName": "Doe",
          "payorNickName": "My Visa Card"
        },
        "billingAddress": {
          "addressLine1": "123 Main St",
          "city": "Dallas",
          "stateProvince": "TX",
          "postalCode": "75001",
          "country": "US"
        }
      }
    }
  ]
}
```

### 2. Tokenize Credit Card

**Endpoint**: `POST /wallet/v1/paymentinstrument/card`

**Request Body**:
```json
{
  "walletOwnerIdentifiers": {
    "realPageId": "1234567-4567891-1111-78899",
    "customer": {
      "customerId": "12345",
      "customerType": "Resident"
    }
  },
  "payorInformation": {
    "firstName": "John",
    "lastName": "Doe",
    "payorNickName": "My Visa Card",
    "contactInformation": {
      "emailAddresses": [
        {
          "emailAddress": "john.doe@example.com",
          "isPrimary": true
        }
      ],
      "phoneNumbers": [
        {
          "phoneNumber": "214-555-1234",
          "phoneNumberType": "Mobile"
        }
      ]
    }
  },
  "accountReferenceId": "ACC_REF_12345",
  "billingAddress": {
    "addressLine1": "123 Main St",
    "city": "Dallas",
    "stateProvince": "TX",
    "postalCode": "75001",
    "country": "US"
  },
  "cardNumber": "4111111111111111",
  "expirationMonth": "12",
  "expirationYear": "2025",
  "cvv": "123"
}
```

**Response** (201 Created):
```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "resultMessage": "Payment card tokenized successfully",
  "paymentInstrument": {
    "walletId": "WLT_123456",
    "paymentInstrumentToken": "PI_CC_789012",
    "paymentInstrumentType": "Card",
    "vendorInstrumentTokens": [
      {
        "vendor": "Cybersource",
        "vendorToken": "7010000000012345678",
        "isPrimary": true
      }
    ],
    "paymentCard": {
      "cardBrand": "Visa",
      "lastFourDigits": "1111",
      "expirationMonth": "12",
      "expirationYear": "2025",
      "payorInformation": {
        "firstName": "John",
        "lastName": "Doe",
        "payorNickName": "My Visa Card"
      },
      "billingAddress": {
        "addressLine1": "123 Main St",
        "city": "Dallas",
        "stateProvince": "TX",
        "postalCode": "75001",
        "country": "US"
      }
    }
  }
}
```

### 3. Tokenize Bank Account

**Endpoint**: `POST /wallet/v1/paymentinstrument/bankaccount`

**Request Body**:
```json
{
  "walletOwnerIdentifiers": {
    "realPageId": "1234567-4567891-1111-78899",
    "customer": {
      "customerId": "12345",
      "customerType": "Resident"
    }
  },
  "accountNumber": "123456789",
  "payorInformation": {
    "firstName": "John",
    "lastName": "Doe",
    "payorNickName": "My Checking Account"
  },
  "accountReferenceId": "ACC_REF_12345",
  "billingAddress": {
    "addressLine1": "123 Main St",
    "city": "Dallas",
    "stateProvince": "TX",
    "postalCode": "75001",
    "country": "US"
  },
  "routingNumber": "021000021",
  "bankAccountType": "Checking",
  "ownershipType": "Personal"
}
```

**Response** (201 Created):
```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "resultMessage": "Bank account tokenized successfully",
  "paymentInstrument": {
    "walletId": "WLT_123456",
    "paymentInstrumentToken": "PI_BA_456789",
    "paymentInstrumentType": "BankAccount",
    "vendorInstrumentTokens": [
      {
        "vendor": "JackHenry",
        "vendorToken": "JH_1234567890",
        "isPrimary": true
      }
    ],
    "bankAccount": {
      "accountType": "Checking",
      "lastFourDigits": "6789",
      "routingNumber": "021000021",
      "payorInformation": {
        "firstName": "John",
        "lastName": "Doe",
        "payorNickName": "My Checking Account"
      },
      "billingAddress": {
        "addressLine1": "123 Main St",
        "city": "Dallas",
        "stateProvince": "TX",
        "postalCode": "75001",
        "country": "US"
      }
    }
  }
}
```

### 4. Delete Payment Instrument

**Endpoint**: `DELETE /wallet/v1/paymentinstrument/{paymentInstrumentToken}`

**Response** (200 OK):
```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "resultMessage": "Payment instrument deleted successfully"
}
```

## Key Differences: Real API vs Mock

| Aspect | Real UPP Wallet API | Current Mock BFF |
|--------|---------------------|------------------|
| **Authentication** | JWT Bearer from Unified Login | Simple JWT from mockWalletAuth |
| **Tokenization** | AWS Payment Cryptography + Vendor APIs | Generates fake tokens (e.g., `MOCK_CC_123456`) |
| **Storage** | DynamoDB with encryption | SQLite database |
| **Response Format** | Includes `traceId`, `resultMessage`, vendor tokens | Simplified format matching Wallet UI expectations |
| **Wallet ID** | Generated by backend (e.g., `WLT_123456`) | Uses user ID from local auth |
| **Payment Instrument Token** | Format: `PI_CC_xxx` or `PI_BA_xxx` | Format: `MOCK_CC_xxx` or `MOCK_BA_xxx` |
| **Vendor Tokens** | Real tokens from Cybersource/JackHenry | Not included |
| **Error Handling** | `OperationException` with fault codes | Standard Express error handling |

## How the BFF Should Work (Production)

In production, the Shared Wallet BFF would:

1. **Receive request from Shared Wallet UI** with user scoped access token
2. **Validate the token** and extract user identity
3. **Transform the request** to match UPP Wallet API format
4. **Call UPP Wallet API** with appropriate authentication
5. **Transform the response** to match Shared Wallet UI expectations
6. **Return to UI** with wallet data

## Current Mock Implementation

Our mock BFF currently:

1. ✅ Receives requests from Shared Wallet UI
2. ✅ Validates simple mock tokens
3. ✅ Stores data in local SQLite database
4. ✅ Returns data in format Wallet UI expects
5. ❌ Does NOT call real UPP Wallet API
6. ❌ Does NOT perform real tokenization

## Hybrid Approach (Mock + Real API)

We can create a hybrid approach where the BFF can:
- **Default**: Use mock mode (current behavior)
- **Optional**: Call real UPP Wallet API when configured

This is useful for:
- **Learning**: Understand how the real integration works
- **Testing**: Test against real backend when available
- **Development**: Gradual migration from mock to real

See the updated implementation in `server/controllers/mockWalletBffController.js`

## Running UPP Wallet API Locally

If you want to run the real UPP Wallet API locally:

```bash
# Navigate to UPP Wallet repository
cd C:\Users\rguttameedi1\source\repos\upp-wallet

# Restore packages
dotnet restore UPP.Wallet.sln

# Run the API
cd src\UPP.Wallet.Api
dotnet run
```

The API will be available at `http://localhost:5000` (or configured port).

**Note**: You'll need to configure:
- AWS credentials (DynamoDB, SQS, Payment Cryptography)
- Database connections (PostgreSQL for routing numbers)
- Vendor credentials (Cybersource, JackHenry)
- Authentication (Unified Login IDP)

## Configuration

See `.env` file for configuration options:

```env
# Wallet API Mode
WALLET_API_MODE=mock           # Options: mock | real | hybrid
WALLET_API_URL=http://localhost:5000  # UPP Wallet API URL (when using real/hybrid mode)
WALLET_API_TIMEOUT=30000       # Request timeout in milliseconds
```

## Next Steps

1. ✅ Updated mock BFF to match real API response structure
2. ✅ Added hybrid mode to optionally call real API
3. ⚠️  To use real API, configure authentication and AWS services
4. ⚠️  Run UPP Wallet API locally or point to dev environment
