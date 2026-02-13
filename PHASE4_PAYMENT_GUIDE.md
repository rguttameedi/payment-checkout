# 💳 Phase 4: Payment Processing Guide

Complete guide to the Cybersource payment integration for rent payments.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Payment Flows](#payment-flows)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Recurring Payments](#recurring-payments)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The payment system integrates with Cybersource to handle:

✅ **One-time rent payments** - Tenants can pay monthly rent
✅ **Recurring/Auto-pay** - Automated monthly payments
✅ **Payment tokenization** - Secure storage of payment methods
✅ **Refunds** - Admin-initiated refunds
✅ **Webhooks** - Real-time payment status updates

---

## 🔧 Setup

### 1. Install Required Dependencies

```bash
cd server
npm install node-cron axios
```

### 2. Configure Environment Variables

Your `.env` file should have:

```env
# Cybersource Configuration
CYBERSOURCE_MERCHANT_ID=9059034_1770903917
CYBERSOURCE_API_KEY=19bb79cc-59aa-4a28-b5c9-2fa086d3c50e
CYBERSOURCE_SECRET_KEY=YMdMdBCLdgFmchmIEMWRgnW/9mr7Nge4legk3Efmtvs=
CYBERSOURCE_API_URL=https://apitest.cybersource.com
CYBERSOURCE_ENVIRONMENT=sandbox

# Payment Processing
ENABLE_RECURRING_PAYMENTS=true
PAYMENT_RETRY_ATTEMPTS=3
PAYMENT_RETRY_DELAY_HOURS=24
```

### 3. Database Schema

The payment system uses these existing tables:
- `rent_payments` - All payment transactions
- `payment_methods` - Tokenized payment methods (cards/ACH)
- `recurring_payment_schedules` - Auto-pay configurations

---

## 💰 Payment Flows

### Flow 1: One-Time Payment

```
1. Tenant selects payment method from saved methods
2. Tenant initiates payment for specific month/year
3. System validates:
   - Active lease exists
   - Payment method belongs to tenant
   - No duplicate payment for period
4. Cybersource processes payment
5. Payment record created with status
6. Tenant receives confirmation
```

### Flow 2: Auto-Pay (Recurring)

```
1. Tenant sets up recurring schedule:
   - Selects payment method
   - Chooses payment day (1-28)
   - Opts in/out of email reminders
2. Cron job runs daily at 2:00 AM
3. Processor finds schedules due today
4. For each schedule:
   - Send reminder email (if enabled)
   - Process payment via Cybersource
   - Create payment record
   - Send success/failure notification
5. Update next payment date
```

### Flow 3: Payment Refund

```
1. Admin initiates refund
2. System validates:
   - Payment is completed/captured
   - Refund amount ≤ payment amount
3. Cybersource processes refund
4. Payment record updated to 'refunded'
5. Tenant notified
```

---

## 🚀 API Endpoints

### Process One-Time Payment

**Endpoint:** `POST /api/payment/process`
**Auth:** Tenant only
**Body:**
```json
{
  "lease_id": 1,
  "payment_method_id": 2,
  "amount": "1500.00",
  "payment_month": 3,
  "payment_year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment_id": 15,
    "transaction_id": "6534567890123456",
    "amount": "1500.00",
    "status": "completed"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/payment/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lease_id": 1,
    "payment_method_id": 2,
    "amount": "1500.00",
    "payment_month": 3,
    "payment_year": 2024
  }'
```

---

### Get Payment Status

**Endpoint:** `GET /api/payment/:payment_id`
**Auth:** Tenant (own), Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "lease_id": 1,
    "payment_method_id": 2,
    "total_amount": "1500.00",
    "payment_status": "completed",
    "payment_date": "2024-03-01T10:30:00Z",
    "transaction_id": "6534567890123456",
    "authorization_code": "123456",
    "payment_month": 3,
    "payment_year": 2024
  }
}
```

---

### Refund Payment

**Endpoint:** `POST /api/payment/:payment_id/refund`
**Auth:** Admin only
**Body:**
```json
{
  "amount": "1500.00",
  "reason": "Duplicate payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "refund_id": "REF123456",
    "amount": "1500.00"
  }
}
```

---

### Payment Webhook

**Endpoint:** `POST /api/payment/webhook`
**Auth:** Signature verification
**Purpose:** Receive real-time updates from Cybersource

Handles events:
- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `refund.completed`

---

## 🧪 Testing

### Test Card Numbers (Cybersource Sandbox)

| Card Type | Number | Expiry | CVV | Result |
|-----------|--------|--------|-----|--------|
| Visa | 4111111111111111 | 12/2025 | 123 | Success |
| Mastercard | 5555555555554444 | 12/2025 | 123 | Success |
| Amex | 378282246310005 | 12/2025 | 1234 | Success |
| Declined | 4000000000000002 | 12/2025 | 123 | Declined |

### Test ACH Account

```
Routing Number: 011401533
Account Number: 4100
Account Type: checking
```

### Testing Workflow

**1. Add Test Payment Method:**
```bash
# Login as tenant first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Tenant123!"
  }'

# Add payment method (use token from above)
curl -X POST http://localhost:3000/api/tenant/payment-methods \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_type": "card",
    "nickname": "Test Visa",
    "cybersource_token": "tok_test_123",
    "card_last_four": "1111",
    "card_brand": "Visa",
    "card_expiry_month": "12",
    "card_expiry_year": "2025",
    "billing_address": {
      "line1": "123 Test St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94105",
      "country": "US"
    },
    "is_default": true
  }'
```

**2. Process Test Payment:**
```bash
curl -X POST http://localhost:3000/api/payment/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lease_id": 1,
    "payment_method_id": 1,
    "amount": "1500.00",
    "payment_month": 3,
    "payment_year": 2024
  }'
```

**3. Check Payment Status:**
```bash
curl -X GET http://localhost:3000/api/payment/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Test Refund (as admin):**
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentpay.com",
    "password": "Admin123!"
  }'

# Refund payment
curl -X POST http://localhost:3000/api/payment/1/refund \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1500.00",
    "reason": "Test refund"
  }'
```

---

## 🔄 Recurring Payments

### How It Works

The `RecurringPaymentProcessor` runs as a cron job:

- **Schedule:** Daily at 2:00 AM
- **Process:** Checks all active schedules with `payment_day` matching current day
- **Logic:**
  1. Find schedules due today
  2. Verify no payment exists for current month
  3. Send reminder email (if enabled)
  4. Process payment
  5. Update `last_payment_date` and `next_payment_date`
  6. Log results for audit

### Manual Trigger (Testing)

```javascript
// In server console or via admin endpoint
const processor = require('./jobs/recurringPaymentProcessor');

// Process all due payments now
await processor.processNow();

// Process specific schedule
await processor.processSchedule(scheduleId);

// Check status
processor.getStatus();
```

### Email Notifications

The processor sends emails at these points:
1. **Reminder** - X days before payment (if enabled)
2. **Success** - After successful payment
3. **Failure** - After failed payment with retry info

*Note: Email sending needs to be implemented using a service like SendGrid, AWS SES, or Nodemailer.*

---

## 🔍 Troubleshooting

### Issue: Payment Fails with "Payment processing failed"

**Check:**
1. Cybersource credentials in `.env`
2. API URL is correct for environment
3. Card/ACH details are valid
4. Merchant account is active

**Solution:**
```bash
# Test Cybersource connection
curl -X POST https://apitest.cybersource.com/pts/v2/payments \
  -H "Content-Type: application/json" \
  -H "v-c-merchant-id: YOUR_MERCHANT_ID"
```

---

### Issue: Recurring payments not running

**Check:**
1. `ENABLE_RECURRING_PAYMENTS=true` in `.env`
2. Server is running continuously
3. Check server logs for cron job start message

**Solution:**
```bash
# Manually trigger to test
const processor = require('./jobs/recurringPaymentProcessor');
await processor.processNow();
```

---

### Issue: "Duplicate payment" error

**Cause:** Payment already exists for the month/year

**Solution:**
- Check `rent_payments` table for existing record
- If legitimate duplicate, refund the first payment
- If testing, use different month/year

```sql
SELECT * FROM rent_payments
WHERE lease_id = 1
AND payment_month = 3
AND payment_year = 2024;
```

---

### Issue: Webhook signature verification fails

**Check:**
1. `CYBERSOURCE_SECRET_KEY` matches Cybersource dashboard
2. Webhook URL is accessible (use ngrok for local testing)
3. Signature header name is correct

**Solution:**
```bash
# Test with ngrok
ngrok http 3000

# Configure webhook URL in Cybersource:
# https://YOUR_NGROK_URL.ngrok.io/api/payment/webhook
```

---

## 📊 Payment Status Flow

```
pending → processing → authorized → captured (completed)
                    ↓
                 failed

completed → refunded
```

**Status Definitions:**
- `pending` - Payment initiated but not processed
- `processing` - Being processed by Cybersource
- `authorized` - Funds reserved but not captured
- `captured` / `completed` - Payment successful
- `failed` - Payment declined or errored
- `refunded` - Payment was refunded

---

## 🔒 Security Best Practices

1. **Never store raw card numbers** - Always tokenize with Cybersource first
2. **Use HTTPS** - All payment requests must be over SSL
3. **Validate signatures** - Verify all webhook requests
4. **Rate limit** - Payment endpoints already have rate limiting
5. **Audit trail** - All payment records are logged in database
6. **PCI Compliance** - Tokenization removes PCI scope

---

## 📈 Monitoring

### Key Metrics to Track

1. **Payment Success Rate**
   ```sql
   SELECT
     COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
   FROM rent_payments
   WHERE payment_date >= NOW() - INTERVAL '30 days';
   ```

2. **Failed Payments**
   ```sql
   SELECT * FROM rent_payments
   WHERE payment_status = 'failed'
   AND payment_date >= NOW() - INTERVAL '7 days';
   ```

3. **Recurring Payment Performance**
   ```sql
   SELECT
     DATE(last_payment_date) as date,
     COUNT(*) as payments_processed
   FROM recurring_payment_schedules
   WHERE last_payment_date IS NOT NULL
   GROUP BY DATE(last_payment_date)
   ORDER BY date DESC
   LIMIT 30;
   ```

---

## ✅ Phase 4 Complete!

You now have:
- ✅ Full Cybersource integration
- ✅ One-time payment processing
- ✅ Automated recurring payments
- ✅ Refund capabilities
- ✅ Webhook handling
- ✅ Test mode for development

**Next:** Phase 5 - React Frontend (Already Complete!)

---

**Questions?** Check the server logs or Cybersource documentation at https://developer.cybersource.com
