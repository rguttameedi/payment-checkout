# 📘 Phase 3 API Testing Guide

Complete guide to testing all Tenant and Admin API endpoints.

---

## 🔐 Step 1: Get Authentication Token

First, login to get a JWT token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Tenant123!"
  }'
```

**Save the token** from the response. You'll need it for all subsequent requests.

Set it as an environment variable (optional):
```bash
# Windows (PowerShell)
$TOKEN = "your-jwt-token-here"

# Linux/Mac
export TOKEN="your-jwt-token-here"
```

---

## 👤 TENANT ENDPOINTS

### 1. Get Tenant Dashboard

```bash
curl -X GET http://localhost:3000/api/tenant/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "lease": {
      "id": 1,
      "unit": {...},
      "monthlyRent": "1500.00",
      "leaseStartDate": "2024-01-01",
      "leaseEndDate": "2024-12-31"
    },
    "nextPayment": {
      "dueDate": "2024-03-01",
      "amount": "1500.00",
      "isPaid": false,
      "daysUntilDue": 15
    },
    "recentPayments": [...],
    "autoPayEnabled": true
  }
}
```

---

### 2. Get Payment History

```bash
curl -X GET "http://localhost:3000/api/tenant/payments?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**With filters:**
```bash
curl -X GET "http://localhost:3000/api/tenant/payments?status=completed&year=2024" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get Specific Payment Details

```bash
curl -X GET http://localhost:3000/api/tenant/payments/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Get Saved Payment Methods

```bash
curl -X GET http://localhost:3000/api/tenant/payment-methods \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Add New Payment Method (Card)

```bash
curl -X POST http://localhost:3000/api/tenant/payment-methods \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_type": "card",
    "nickname": "My Visa Card",
    "cybersource_token": "tok_card_abc123",
    "card_last_four": "4242",
    "card_brand": "Visa",
    "card_expiry_month": "12",
    "card_expiry_year": "2026",
    "billing_address": {
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94105",
      "country": "US"
    },
    "is_default": true
  }'
```

---

### 6. Add New Payment Method (ACH/Bank)

```bash
curl -X POST http://localhost:3000/api/tenant/payment-methods \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_type": "ach",
    "nickname": "My Checking Account",
    "cybersource_token": "tok_ach_xyz789",
    "account_last_four": "6789",
    "account_type": "checking",
    "bank_name": "Chase Bank",
    "billing_address": {
      "line1": "456 Oak St",
      "city": "Los Angeles",
      "state": "CA",
      "zip_code": "90028"
    }
  }'
```

---

### 7. Update Payment Method

```bash
curl -X PUT http://localhost:3000/api/tenant/payment-methods/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Primary Card",
    "is_default": true
  }'
```

---

### 8. Delete Payment Method

```bash
curl -X DELETE http://localhost:3000/api/tenant/payment-methods/2 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Get Auto-Pay Schedule

```bash
curl -X GET http://localhost:3000/api/tenant/recurring-schedule \
  -H "Authorization: Bearer $TOKEN"
```

---

### 10. Setup Auto-Pay

```bash
curl -X POST http://localhost:3000/api/tenant/recurring-schedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lease_id": 1,
    "payment_method_id": 1,
    "payment_day": 1,
    "send_reminder_email": true,
    "reminder_days_before": 3
  }'
```

---

### 11. Update Auto-Pay Schedule

```bash
curl -X PUT http://localhost:3000/api/tenant/recurring-schedule/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": 2,
    "payment_day": 5,
    "reminder_days_before": 5
  }'
```

---

### 12. Cancel Auto-Pay

```bash
curl -X DELETE http://localhost:3000/api/tenant/recurring-schedule/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏢 ADMIN ENDPOINTS

### 1. Get Admin Dashboard

First, login as admin:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentpay.com",
    "password": "Admin123!"
  }'
```

Then get dashboard:
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProperties": 2,
      "totalUnits": 5,
      "occupiedUnits": 3,
      "vacantUnits": 2,
      "occupancyRate": "60.00",
      "totalTenants": 3,
      "activeLeases": 3
    },
    "financial": {
      "monthlyRevenue": "4600.00",
      "pendingPayments": 0,
      "currentMonth": "February",
      "currentYear": 2024
    },
    "recentPayments": [...]
  }
}
```

---

### 2. List All Properties

```bash
curl -X GET "http://localhost:3000/api/admin/properties?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**With search:**
```bash
curl -X GET "http://localhost:3000/api/admin/properties?search=oak" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 3. Get Property Details

```bash
curl -X GET http://localhost:3000/api/admin/properties/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 4. Create New Property

```bash
curl -X POST http://localhost:3000/api/admin/properties \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Riverside Apartments",
    "address_line1": "789 River Road",
    "city": "San Diego",
    "state": "CA",
    "zip_code": "92101",
    "country": "US",
    "property_manager_id": 2,
    "total_units": 20,
    "property_type": "apartment",
    "description": "Luxury waterfront apartments"
  }'
```

---

### 5. Update Property

```bash
curl -X PUT http://localhost:3000/api/admin/properties/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Oak Hill Luxury Apartments",
    "total_units": 12,
    "description": "Updated description"
  }'
```

---

### 6. Delete Property

```bash
curl -X DELETE http://localhost:3000/api/admin/properties/3 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 7. List Units in Property

```bash
curl -X GET http://localhost:3000/api/admin/properties/1/units \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Filter by status:**
```bash
curl -X GET "http://localhost:3000/api/admin/properties/1/units?status=vacant" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 8. Create New Unit

```bash
curl -X POST http://localhost:3000/api/admin/properties/1/units \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unit_number": "3B",
    "bedrooms": 2,
    "bathrooms": 2,
    "square_feet": 1200,
    "floor_number": 3,
    "monthly_rent": 2500.00,
    "security_deposit": 2500.00,
    "description": "Corner unit with balcony"
  }'
```

---

### 9. Update Unit

```bash
curl -X PUT http://localhost:3000/api/admin/units/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_rent": 1550.00,
    "status": "occupied"
  }'
```

---

### 10. Delete Unit

```bash
curl -X DELETE http://localhost:3000/api/admin/units/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 11. List All Tenants

```bash
curl -X GET "http://localhost:3000/api/admin/tenants?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**With search:**
```bash
curl -X GET "http://localhost:3000/api/admin/tenants?search=john" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 12. List All Leases

```bash
curl -X GET "http://localhost:3000/api/admin/leases?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**With filters:**
```bash
curl -X GET "http://localhost:3000/api/admin/leases?status=active&property_id=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 13. Create New Lease

```bash
curl -X POST http://localhost:3000/api/admin/leases \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": 4,
    "tenant_id": 5,
    "monthly_rent": 2200.00,
    "security_deposit": 2200.00,
    "lease_start_date": "2024-03-01",
    "lease_end_date": "2025-02-28",
    "rent_due_day": 1,
    "payment_grace_period_days": 5,
    "late_fee_amount": 75.00,
    "notes": "12-month lease"
  }'
```

---

### 14. Update Lease

```bash
curl -X PUT http://localhost:3000/api/admin/leases/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_rent": 1600.00,
    "late_fee_amount": 60.00
  }'
```

---

### 15. Terminate Lease

```bash
curl -X PUT http://localhost:3000/api/admin/leases/2/terminate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 16. View All Payments

```bash
curl -X GET "http://localhost:3000/api/admin/payments?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**With filters:**
```bash
curl -X GET "http://localhost:3000/api/admin/payments?status=completed&month=2&year=2024&property_id=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🧪 Testing Workflow

### Scenario 1: New Tenant Onboarding

1. Admin creates a new tenant user
2. Admin creates a lease for the tenant
3. Tenant logs in
4. Tenant views dashboard (sees lease info)
5. Tenant adds payment method
6. Tenant sets up auto-pay

### Scenario 2: Property Management

1. Admin creates new property
2. Admin creates units in the property
3. Admin views property details
4. Admin creates leases for available units

### Scenario 3: Payment Management

1. Tenant views payment history
2. Tenant adds new payment method
3. Tenant sets up recurring payments
4. Admin monitors all payments

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🔒 Authorization Rules

**Tenant Endpoints (`/api/tenant/*`):**
- Requires JWT token
- Requires `role: "tenant"`
- Tenant can only access their own data

**Admin Endpoints (`/api/admin/*`):**
- Requires JWT token
- Requires `role: "admin"` or `role: "property_manager"`
- Some endpoints (delete) require admin only

---

## ✅ Next Steps

Once you've tested these endpoints:
1. ✅ All tenant features working
2. ✅ All admin features working
3. ⏳ Add payment processing (Phase 4)
4. ⏳ Build React frontend (Phase 5)

---

**Happy Testing!** 🚀
