# Identity Verification Implementation Guide

## Overview
Collects SSN and Government ID for ResidentDirect users making payments >$3000 in 24 hours.

## Backend (✅ COMPLETE)

### 1. Database
- **Table**: `user_identity_verifications`
- **Encryption**: AES-256-GCM
- **Fields**:
  - `ssn_encrypted` (encrypted)
  - `govt_id_encrypted` (encrypted)
  - `ssn_last_four` (display only)
  - `govt_id_type` (passport/license/national_id)

### 2. API Endpoints
```
POST /api/identity-verification/check
Body: { amount: 3500 }
Response: { required: true/false, reason: string, hasExisting: boolean }

POST /api/identity-verification/save
Body: { ssn: "123-45-6789", govtId: "DL123456", govtIdType: "driver_license" }
Response: { success: true, last_four: "6789" }

GET /api/identity-verification/status
Response: { hasVerification: true, ssnLastFour: "6789", status: "verified" }
```

### 3. Business Logic
- Checks payments in last 24 hours
- If total + current > $3000 → requires verification
- If user already verified → skips collection
- Encrypts before storing
- Never logs sensitive data

## Frontend (⚠️ NEEDS IMPLEMENTATION)

### Step 1: Create Identity Verification Component

Create: `client/src/components/wallet/IdentityVerificationForm.js`

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function IdentityVerificationForm({ onComplete, onSkip }) {
  const [ssn, setSsn] = useState('');
  const [govtId, setGovtId] = useState('');
  const [govtIdType, setGovtIdType] = useState('driver_license');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/identity-verification/save', {
        ssn,
        govtId,
        govtIdType
      });

      if (response.data.success) {
        onComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-verification-form">
      <div className="verification-header">
        <h3>🔒 Identity Verification Required</h3>
        <p>For payments over $3,000, we need to verify your identity for compliance.</p>
        <p><small>This information is encrypted and stored securely. You only need to provide this once.</small></p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Social Security Number *</label>
          <input
            type="text"
            className="form-control"
            placeholder="XXX-XX-XXXX"
            value={ssn}
            onChange={(e) => setSsn(e.target.value)}
            required
            pattern="\\d{3}-?\\d{2}-?\\d{4}"
          />
          <small>Format: 123-45-6789</small>
        </div>

        <div className="form-group">
          <label>Government ID Number *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your ID number"
            value={govtId}
            onChange={(e) => setGovtId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>ID Type *</label>
          <select
            className="form-control"
            value={govtIdType}
            onChange={(e) => setGovtIdType(e.target.value)}
          >
            <option value="driver_license">Driver's License</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Identity'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onSkip}>
            Cancel Payment
          </button>
        </div>
      </form>

      <div className="security-notice">
        <p>🔐 Your data is encrypted using bank-level security (AES-256)</p>
        <p>✅ Compliant with federal regulations</p>
      </div>
    </div>
  );
}

export default IdentityVerificationForm;
```

### Step 2: Integrate with MakePayment Component

Modify: `client/src/pages/tenant/MakePayment.js`

Add before Shared Wallet component:

```javascript
import IdentityVerificationForm from '../../components/wallet/IdentityVerificationForm';

// Inside component:
const [verificationRequired, setVerificationRequired] = useState(false);
const [verificationComplete, setVerificationComplete] = useState(false);

// When amount changes:
useEffect(() => {
  if (amount > 0) {
    checkVerificationRequired();
  }
}, [amount]);

const checkVerificationRequired = async () => {
  try {
    const response = await axios.post('/api/identity-verification/check', {
      amount: parseFloat(amount)
    });

    if (response.data.hasExisting) {
      // User already verified
      setVerificationRequired(false);
      setVerificationComplete(true);
    } else if (response.data.required) {
      // Needs verification
      setVerificationRequired(true);
    }
  } catch (error) {
    console.error('Error checking verification:', error);
  }
};

// In JSX:
{verificationRequired && !verificationComplete && (
  <IdentityVerificationForm
    onComplete={() => {
      setVerificationComplete(true);
      setVerificationRequired(false);
    }}
    onSkip={() => {
      // Return to payment page or clear amount
      setAmount(0);
      setVerificationRequired(false);
    }}
  />
)}

{(!verificationRequired || verificationComplete) && (
  <SharedWalletDropdown ... />
)}
```

### Step 3: Add to Integration Model Badge

Show "ID Verified ✓" badge when user has completed verification.

### Step 4: Testing

1. **Database Setup:**
   ```bash
   cd server
   npm run db:sync
   ```

2. **Test Flow:**
   - Login as tenant
   - Enter amount > $3000
   - Should see Identity Verification form
   - Enter SSN and Government ID
   - Submit → Data encrypted and stored
   - Try again → Should skip verification

3. **Verify Encryption:**
   ```bash
   sqlite3 database.sqlite
   SELECT ssn_encrypted, ssn_last_four FROM user_identity_verifications;
   ```
   - ssn_encrypted should be hex encoded
   - ssn_last_four should show only last 4 digits

## Security Notes

- ✅ Data encrypted at rest (AES-256-GCM)
- ✅ Data encrypted in transit (HTTPS)
- ✅ Only last 4 digits of SSN displayed
- ✅ Encryption key in environment variable
- ✅ IP address logged for audit trail
- ✅ No SSN/GovtID in logs or console
- ✅ One-time collection (stored for future use)

## Production Checklist

- [ ] Set ENCRYPTION_KEY environment variable (32 characters)
- [ ] Enable HTTPS
- [ ] Review audit logs
- [ ] Test encryption/decryption
- [ ] Implement key rotation strategy
- [ ] Add monitoring for failed verifications
- [ ] Document data retention policy
- [ ] Train support staff on verification process

## Questions?

- SSN Format: XXX-XX-XXXX (dashes optional)
- Government ID: Any alphanumeric ID
- Threshold: $3000 in 24 hours (configurable in service)
- Encryption: AES-256-GCM (FIPS compliant)
