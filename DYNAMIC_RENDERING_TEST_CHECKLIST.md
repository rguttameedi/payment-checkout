# 🧪 Dynamic Field Rendering Test Checklist

## Test Execution Checklist

Use this checklist to verify each scenario is working correctly.

---

## ✅ Scenario 1: DirectMerchant (Minimal Fields)

### Configuration
- [ ] File: `client/src/config/integrationConfig.js`
- [ ] Line 31: `integrationModel: INTEGRATION_MODELS.DIRECT_MERCHANT`
- [ ] Browser auto-reloaded after save

### Console Logs
- [ ] ✅ Console shows: `🎨 Applying dynamic field configuration`
- [ ] ✅ Console shows: `integrationModel: "DirectMerchant"`
- [ ] ✅ Console shows: `✅ Hidden field: firstName`
- [ ] ✅ Console shows: `✅ Hidden field: lastName`
- [ ] ✅ Console shows: `✅ Hidden field: email`
- [ ] ✅ Console shows: `✅ Hidden field: phone`
- [ ] ✅ Console shows: `✅ Hidden field: dob`
- [ ] ✅ Console shows: `✅ Hidden field: govtId`
- [ ] ✅ Console shows: `✅ Hidden field: ssn`
- [ ] ✅ Console shows: `✅ Added integration model badge: DirectMerchant`

### Visible Fields (8-9 fields)
- [ ] ✅ Card Number
- [ ] ✅ Card Holder Name
- [ ] ✅ Expiry Date (Month/Year)
- [ ] ✅ CVV
- [ ] ✅ Billing Address
- [ ] ✅ City
- [ ] ✅ State
- [ ] ✅ ZIP Code
- [ ] ✅ Nick Name (optional)

### Hidden Fields (should NOT be visible)
- [ ] ❌ First Name (not visible)
- [ ] ❌ Last Name (not visible)
- [ ] ❌ Email (not visible)
- [ ] ❌ Phone (not visible)
- [ ] ❌ Date of Birth (not visible)
- [ ] ❌ Government ID (not visible)
- [ ] ❌ SSN (not visible)

### UI Elements
- [ ] ✅ Badge at top: "Rent Payment Portal - DirectMerchant"
- [ ] ✅ Form renders properly
- [ ] ✅ No JavaScript errors in console

### Score: _____ / 27 items

---

## ✅ Scenario 2: ClientDirect (Extended Fields)

### Configuration
- [ ] File: `client/src/config/integrationConfig.js`
- [ ] Line 31: `integrationModel: INTEGRATION_MODELS.CLIENT_DIRECT`
- [ ] Browser auto-reloaded after save

### Console Logs
- [ ] ✅ Console shows: `🎨 Applying dynamic field configuration`
- [ ] ✅ Console shows: `integrationModel: "ClientDirect"`
- [ ] ✅ Console shows: `✅ Hidden field: govtId`
- [ ] ✅ Console shows: `✅ Hidden field: ssn`
- [ ] ✅ Console shows: `✅ Added integration model badge: ClientDirect`

### Visible Fields (15-16 fields)
- [ ] ✅ Card Number
- [ ] ✅ Name on Card
- [ ] ✅ Expiry Date (Month/Year)
- [ ] ✅ CVV
- [ ] ✅ **First Name** (NOW VISIBLE)
- [ ] ✅ **Last Name** (NOW VISIBLE)
- [ ] ✅ **Email** (NOW VISIBLE)
- [ ] ✅ **Phone** (NOW VISIBLE)
- [ ] ✅ **Date of Birth** (NOW VISIBLE)
- [ ] ✅ Billing Address Line 1
- [ ] ✅ Billing Address Line 2 (optional)
- [ ] ✅ City
- [ ] ✅ **Country** (NOW VISIBLE)
- [ ] ✅ State
- [ ] ✅ ZIP Code
- [ ] ✅ Nick Name

### Hidden Fields (should NOT be visible)
- [ ] ❌ Government ID (still hidden)
- [ ] ❌ SSN (still hidden)

### Comparison with DirectMerchant
- [ ] ✅ 7 NEW fields appeared (First Name, Last Name, Email, Phone, DOB, Name on Card, Country)
- [ ] ✅ All DirectMerchant fields are still visible

### UI Elements
- [ ] ✅ Badge at top: "Rent Payment Portal - ClientDirect"
- [ ] ✅ Form renders properly
- [ ] ✅ No JavaScript errors in console

### Score: _____ / 25 items

---

## ✅ Scenario 3: ResidentDirect (All Fields)

### Configuration
- [ ] File: `client/src/config/integrationConfig.js`
- [ ] Line 31: `integrationModel: INTEGRATION_MODELS.RESIDENT_DIRECT`
- [ ] Browser auto-reloaded after save

### Console Logs
- [ ] ✅ Console shows: `🎨 Applying dynamic field configuration`
- [ ] ✅ Console shows: `integrationModel: "ResidentDirect"`
- [ ] ✅ Console shows: `hidden: 0` (no hidden fields)
- [ ] ✅ Console shows: `✅ Added integration model badge: ResidentDirect`

### Visible Fields (18 fields - ALL)
- [ ] ✅ Card Number
- [ ] ✅ Name on Card
- [ ] ✅ Expiry Date (Month/Year)
- [ ] ✅ CVV
- [ ] ✅ First Name
- [ ] ✅ Last Name
- [ ] ✅ Email
- [ ] ✅ Phone
- [ ] ✅ Date of Birth
- [ ] ✅ **Government ID** (NOW VISIBLE)
- [ ] ✅ **SSN** (NOW VISIBLE)
- [ ] ✅ Billing Address Line 1
- [ ] ✅ Billing Address Line 2 (optional)
- [ ] ✅ City
- [ ] ✅ Country
- [ ] ✅ State
- [ ] ✅ ZIP Code
- [ ] ✅ Nick Name

### Hidden Fields (should be NONE)
- [ ] ✅ NO fields are hidden (all 18 visible)

### Comparison with ClientDirect
- [ ] ✅ 2 NEW sensitive fields appeared (Government ID, SSN)
- [ ] ✅ All ClientDirect fields are still visible

### UI Elements
- [ ] ✅ Badge at top: "Rent Payment Portal - ResidentDirect"
- [ ] ✅ Form renders properly
- [ ] ✅ No JavaScript errors in console

### Score: _____ / 25 items

---

## 🎯 Field Comparison Matrix

| Field Name | DirectMerchant | ClientDirect | ResidentDirect |
|------------|:--------------:|:------------:|:--------------:|
| Card Number | ✅ | ✅ | ✅ |
| Card Holder Name | ✅ | ✅ | ✅ |
| Name on Card | ⚠️ | ✅ | ✅ |
| Expiry Date | ✅ | ✅ | ✅ |
| CVV | ✅ | ✅ | ✅ |
| **First Name** | ❌ | ✅ | ✅ |
| **Last Name** | ❌ | ✅ | ✅ |
| **Email** | ❌ | ✅ | ✅ |
| **Phone** | ❌ | ✅ | ✅ |
| **Date of Birth** | ❌ | ✅ | ✅ |
| **Government ID** | ❌ | ❌ | ✅ |
| **SSN** | ❌ | ❌ | ✅ |
| Billing Address | ✅ | ✅ | ✅ |
| Billing Address Line 1 | ⚠️ | ✅ | ✅ |
| Billing Address Line 2 | ❌ | ✅ | ✅ |
| City | ✅ | ✅ | ✅ |
| State | ✅ | ✅ | ✅ |
| **Country** | ❌ | ✅ | ✅ |
| ZIP Code | ✅ | ✅ | ✅ |
| Nick Name | ✅ | ✅ | ✅ |
| **Total Visible** | **8-9** | **15-16** | **18** |

Legend:
- ✅ = Visible
- ❌ = Hidden
- ⚠️ = May vary based on card type

---

## 🔍 Token Inspection Checklist

### Token Structure
- [ ] ✅ Token is base64 encoded
- [ ] ✅ Token contains `application` object
- [ ] ✅ Token contains `field_config` object
- [ ] ✅ Token contains `realpage_id`
- [ ] ✅ Token contains `timestamp`

### Application Object
- [ ] ✅ `name`: "Rent Payment Portal"
- [ ] ✅ `guid`: Valid UUID
- [ ] ✅ `integration_model`: Matches configuration (DirectMerchant/ClientDirect/ResidentDirect)
- [ ] ✅ `allowed_payment_types`: ["Card", "ACH"]

### Field Config Object (Card)
- [ ] ✅ Contains `requiredFields` array
- [ ] ✅ Contains `optionalFields` array
- [ ] ✅ Contains `hiddenFields` array
- [ ] ✅ Contains `allowedPaymentTypes` array

### Field Config Validation
- [ ] ✅ DirectMerchant: 4 required, 7 hidden
- [ ] ✅ ClientDirect: 14 required, 2 hidden
- [ ] ✅ ResidentDirect: 16 required, 0 hidden

---

## 🐛 Troubleshooting Checklist

### If fields are not hiding:
- [ ] Check browser console for errors
- [ ] Verify token is being generated (Network tab → filter "acquire_user_scoped_token")
- [ ] Verify token contains `field_config` object
- [ ] Check Shadow DOM is accessible (`walletRef.current.shadowRoot`)
- [ ] Verify DynamicFieldController is running (check console logs)
- [ ] Hard refresh browser (Ctrl+Shift+R)

### If integration model not changing:
- [ ] Verify file was saved (`integrationConfig.js`)
- [ ] Check for syntax errors in configuration file
- [ ] Restart client (Ctrl+C and `npm start`)
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Restart backend server

### If iframe not loading:
- [ ] Verify backend server is running (port 50155)
- [ ] Check backend logs for errors
- [ ] Verify Shared Wallet UI web component loaded
- [ ] Check for CORS errors in console
- [ ] Verify authentication token is valid

---

## 📊 Overall Test Results

| Scenario | Score | Status |
|----------|-------|--------|
| DirectMerchant | ___ / 27 | ⬜ Pass / ⬜ Fail |
| ClientDirect | ___ / 25 | ⬜ Pass / ⬜ Fail |
| ResidentDirect | ___ / 25 | ⬜ Pass / ⬜ Fail |
| **Total** | **___ / 77** | |

**Test Completed By:** _______________
**Date:** _______________
**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎉 Success Criteria

✅ **All Tests Pass** if:
1. All three scenarios show correct number of fields
2. Hidden fields are not visible in the form
3. Console logs show correct configuration
4. Integration model badge displays correctly
5. Token decoder shows correct field configuration
6. No JavaScript errors in console

🎊 **Congratulations!** Your dynamic field rendering is working perfectly!
