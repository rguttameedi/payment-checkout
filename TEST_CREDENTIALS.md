# Test Credentials - Identity Verification Testing

## ✅ Test Account Ready!

### Tenant Login Credentials:
```
Email: test.tenant@example.com
Password: Password123!
```

### Account Details:
- **Name**: Test Tenant
- **Unit**: #101 at Test Apartments
- **Monthly Rent**: **$3,500** (perfect for triggering identity verification!)
- **Lease**: Active (Jan 1, 2026 - Dec 31, 2026)

---

## 🧪 Testing Steps

### Step 1: Login
1. Open: http://localhost:3000
2. Click **Login**
3. Enter:
   - Email: `test.tenant@example.com`
   - Password: `Password123!`
4. Click **Login**

### Step 2: Navigate to Make Payment
1. After login, click **Make Payment** in the sidebar
2. You should see:
   - Lease information for Unit #101
   - Monthly rent: $3,500.00
   - Amount field pre-filled with $3,500.00

### Step 3: Add a Payment Method
1. Click the **"+ Add New Payment Method"** button
2. The Shared Wallet UI modal will appear
3. Choose either:
   - **💳 Add Card** or
   - **🏦 Add Bank Account**
4. Fill in test card details:
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: 12/28
   CVV: 123
   Name: Test Tenant
   ZIP: 94105
   ```
5. Click **Save**

### Step 4: Trigger Identity Verification ⭐
1. After adding payment method, the payment form should be ready
2. The amount field should already show **$3500.00**
3. **Wait 500ms** (debounce delay)
4. 🎉 **Identity Verification Modal should appear automatically!**

### Expected Result:
```
┌─────────────────────────────────────────────────┐
│  🔒 Identity Verification Required              │
├─────────────────────────────────────────────────┤
│  For security, we need to verify your identity  │
│  for transactions over $3,000.                  │
│                                                 │
│  📋 Security Notice                              │
│  ✓ Your data is encrypted (AES-256-GCM)        │
│  ✓ Required for federal compliance              │
│  ✓ This information is collected only once     │
│                                                 │
│  Social Security Number *                       │
│  [___-__-____] (auto-formats as you type)      │
│                                                 │
│  Government ID Number *                         │
│  [_________________]                            │
│                                                 │
│  ID Type *                                      │
│  [Driver's License ▼]                          │
│                                                 │
│  🔐 Privacy Notice:                             │
│  Your SSN and Government ID are encrypted       │
│  using bank-level AES-256-GCM encryption.      │
│                                                 │
│  [Cancel] [Submit & Continue →]                 │
└─────────────────────────────────────────────────┘
```

### Step 5: Complete Verification
1. Fill in the form:
   - **SSN**: Type `123456789` (it will auto-format to `123-45-6789`)
   - **Government ID**: `DL123456789`
   - **ID Type**: Select "Driver's License"
2. Click **Submit & Continue**

### Step 6: Expected Success
1. ✅ Toast message: "Identity verified successfully! You may now proceed with your payment."
2. ✅ Modal closes automatically
3. ✅ Payment form is now ready
4. ✅ You can proceed to pay

### Step 7: Verify One-Time Collection
1. **Logout** from the account
2. **Login again** with same credentials
3. **Navigate to Make Payment**
4. Enter amount: **$4000** (above threshold)
5. ✅ **Identity Verification Modal should NOT appear**
6. ✅ Console log: "✅ User already has identity verification on file"

---

## 🎯 Alternative Test Scenarios

### Test Scenario A: Below Threshold (No Verification)
1. Login as test.tenant@example.com
2. Go to Make Payment
3. Change amount to **$2500** (below $3000)
4. ✅ No identity verification modal should appear

### Test Scenario B: Cancel Verification
1. Login as test.tenant@example.com
2. Go to Make Payment
3. Keep amount at **$3500**
4. When verification modal appears, click **Cancel**
5. ✅ Amount field should be cleared
6. ✅ Toast: "Payment cancelled. Please adjust the amount or try again later."

### Test Scenario C: Create New User (Fresh Verification)
1. Logout
2. Click **Register**
3. Create a new account (use any email/password)
4. ⚠️ This user won't have a lease, so can't make payments
5. Use the existing test.tenant@example.com account instead

---

## 🔍 Checking Encrypted Data in Database

After submitting verification, check the database:

### SQLite Location:
```
C:\Misc\Project_Learning\payment-checkout\server\database\rent_payment.sqlite
```

### Query to Verify:
```sql
SELECT
  id,
  user_id,
  ssn_last_four,
  govt_id_type,
  status,
  verified_at,
  LENGTH(ssn_encrypted) as ssn_length,
  LENGTH(govt_id_encrypted) as govt_id_length
FROM user_identity_verifications
WHERE user_id = 4;
```

### Expected Output:
```
id: 1
user_id: 4
ssn_last_four: 6789
govt_id_type: drivers_license
status: verified
verified_at: 2026-02-16 17:22:00
ssn_length: 100+ characters (encrypted)
govt_id_length: 100+ characters (encrypted)
```

The encrypted fields should look like:
```
abc123def456...:ghi789jkl012...:mno345pqr678...
    ↑              ↑                ↑
   IV          Auth Tag        Encrypted Data
```

---

## 📊 Backend Logs to Monitor

Watch the server logs for these messages:

```bash
# When checking verification (amount > $3000):
💰 User 4 - Recent 24h payments: $0, Current: $3500, Total: $3500
🔒 Identity verification required for $3500

# When submitting verification:
✅ Identity verification saved for user 4 (SSN: ***-**-6789)

# When already verified:
✅ User already has identity verification on file
```

---

## ⚠️ Troubleshooting

### Issue: Can't login
**Solution**: Use exact credentials:
- Email: `test.tenant@example.com` (lowercase!)
- Password: `Password123!` (capital P and !)

### Issue: Dashboard shows "No lease found"
**Solution**: The lease was created for user ID 4. Make sure you're logged in with test.tenant@example.com

### Issue: Modal doesn't appear when entering $3500
**Solution**:
1. Check browser console for errors
2. Wait at least 500ms after typing amount
3. Make sure you're logged in
4. Verify backend server is running on port 50155

### Issue: "Invalid token" error
**Solution**: Logout and login again

---

## 🎉 Quick Start

**TL;DR**:
1. Go to: http://localhost:3000
2. Login: `test.tenant@example.com` / `Password123!`
3. Click **Make Payment**
4. Add a payment method (use test card 4111 1111 1111 1111)
5. Amount should be $3500 (pre-filled)
6. Wait 500ms → Identity Verification modal appears!
7. Fill SSN: `123456789` (auto-formats), GovtID: `DL123456789`, Type: Driver's License
8. Submit → Success! ✅

---

## 📝 Additional Test Accounts

If you need more test accounts, use:

### Property Manager Account:
```
Email: manager@example.com
Password: Manager123!
Role: Property Manager
```

(Can create properties, units, and leases via Admin portal)

---

**Everything is ready to test!** 🚀

Start here: http://localhost:3000
