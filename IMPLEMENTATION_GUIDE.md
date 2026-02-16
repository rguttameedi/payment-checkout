# LOFT Feature Implementation Guide

## ✅ Completed Features

### 1. AutoPay / Recurring Payments ✅
- Database: `recurring_payment_schedules` table
- API: `/api/autopay/*` endpoints
- Frontend: `AutoPaySetup.js` component

### 2. Split Rent (Up to 4 Payments) ✅
- Database: `split_payment_plans`, `split_payment_installments` tables
- API: `/api/split-payment/*` endpoints
- Frontend: `SplitRent.js` component

---

## 🔄 In Progress

### 3. Split with Roommates
**Status:** Database schema created, needs API + Frontend

**Database:**
- ✅ `roommate_split_plans` table
- ✅ `roommate_shares` table

**API Endpoints Needed:** (`server/routes/roommateSplit.js`)
```javascript
POST   /api/roommate-split/create      // Create split plan
GET    /api/roommate-split/plans       // Get active plans
POST   /api/roommate-split/pay-share   // Pay individual share
POST   /api/roommate-split/send-reminder // Send payment reminder
DELETE /api/roommate-split/cancel/:id  // Cancel plan
```

**Frontend Component:** (`client/src/pages/tenant/RoommateSplit.js`)
- Add roommates with email and share amount
- Track who has paid
- Send payment reminders
- View payment status

---

## 📋 Remaining Features - Implementation Plan

### 4. Flexible Payment Plans (Weekly/Biweekly)
**Extends:** AutoPay feature
**Changes Needed:**
- Update `recurring_payment_schedules.schedule_type` to support 'weekly', 'biweekly'
- Add logic to calculate next payment date based on schedule type
- Update AutoPaySetup.js to allow schedule type selection

### 5. Maintenance Request Submission ⭐ High Priority
**New Tables:**
```sql
CREATE TABLE maintenance_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  unit_id INTEGER NOT NULL,
  category VARCHAR(50), -- plumbing, electrical, appliance, etc.
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, emergency
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted', -- submitted, assigned, in_progress, completed, cancelled
  preferred_access_date DATE,
  preferred_access_time VARCHAR(50),
  allow_entry BOOLEAN DEFAULT 0,
  assigned_to INTEGER, -- maintenance staff
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(id)
);
```

**API Endpoints:**
```javascript
POST   /api/maintenance/create         // Submit request
GET    /api/maintenance/my-requests    // List my requests
GET    /api/maintenance/:id            // Get request details
POST   /api/maintenance/:id/photo      // Upload photo
PUT    /api/maintenance/:id/cancel     // Cancel request
```

**Frontend:**
- Form with category selection, description, photo upload
- My requests list with status tracking
- Request detail page with timeline

### 6. Maintenance Status Tracking
**Extends:** Maintenance Requests
**New Table:**
```sql
CREATE TABLE maintenance_status_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  comment TEXT,
  updated_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(id)
);
```

**Features:**
- Real-time status updates
- Timeline view of request progress
- Notifications on status changes

### 7. Real-time Notifications
**Technology:** WebSockets (Socket.io) or Server-Sent Events (SSE)

**Setup:**
```bash
npm install socket.io socket.io-client
```

**Server Side:**
```javascript
// server/sockets/notificationSocket.js
const setupNotifications = (io) => {
  io.on('connection', (socket) => {
    socket.on('subscribe', (userId) => {
      socket.join(`user_${userId}`);
    });
  });
};

// Emit notification
io.to(`user_${userId}`).emit('notification', {
  type: 'payment_reminder',
  message: 'Rent payment due in 3 days',
  data: { ... }
});
```

**Client Side:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:50155');
socket.emit('subscribe', userId);

socket.on('notification', (notification) => {
  // Show toast notification
});
```

### 8. Community Announcements
**New Table:**
```sql
CREATE TABLE community_announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50), -- general, urgent, event, maintenance
  priority VARCHAR(20) DEFAULT 'normal',
  publish_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Features:**
- View announcements on dashboard
- Filter by type (events, maintenance notices, etc.)
- Mark as read
- Push notifications for urgent announcements

### 9. Messaging with Property Management
**New Tables:**
```sql
CREATE TABLE message_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, closed
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- tenant, manager, staff
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES message_threads(id)
);
```

**Features:**
- Inbox with message threads
- Send/receive messages
- Read receipts
- File attachments

### 10. Reward Points System
**New Tables:**
```sql
CREATE TABLE reward_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL UNIQUE,
  total_points_earned DECIMAL(10, 2) DEFAULT 0,
  total_points_redeemed DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  tier_level VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reward_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- earned, redeemed, expired, adjusted
  points DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  reference_type VARCHAR(50), -- payment, referral, review, etc.
  reference_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES reward_accounts(id)
);
```

**Point Earning Rules:**
- On-time rent payment: 100 points
- AutoPay enrollment: 50 points bonus
- Referral: 500 points
- Maintenance review: 25 points
- Community engagement: 10 points

### 11. Points for Rent Payments
**Integration with Payment Processing:**
```javascript
// In payment completion handler
const awardPaymentPoints = async (tenantId, amount, onTime) => {
  let points = 100; // Base points
  if (onTime) points += 50; // Bonus for on-time
  if (amount > 1000) points += 25; // Bonus for larger amounts

  await RewardAccount.increment('current_balance', {
    by: points,
    where: { tenant_id: tenantId }
  });

  await RewardTransaction.create({
    account_id: accountId,
    transaction_type: 'earned',
    points: points,
    reason: 'Rent payment',
    reference_type: 'payment',
    reference_id: paymentId
  });
};
```

### 12. Rewards Marketplace
**New Table:**
```sql
CREATE TABLE reward_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type VARCHAR(50) NOT NULL, -- gift_card, discount, service
  brand_name VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required DECIMAL(10, 2) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT 1,
  stock_quantity INTEGER,
  terms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Features:**
- Browse rewards by category
- Search rewards
- Filter by points required
- Featured/popular rewards
- Redeem rewards

### 13. Digital Rewards Redemption
**New Table:**
```sql
CREATE TABLE reward_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  catalog_item_id INTEGER NOT NULL,
  points_redeemed DECIMAL(10, 2) NOT NULL,
  redemption_code VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, issued, used, expired
  expires_at TIMESTAMP,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES reward_accounts(id),
  FOREIGN KEY (catalog_item_id) REFERENCES reward_catalog(id)
);
```

**Redemption Flow:**
1. User selects reward
2. System deducts points
3. Generate unique redemption code
4. Send code via email
5. Track code usage

### 14. Lease Document Access
**New Table:**
```sql
CREATE TABLE lease_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- lease_agreement, addendum, notice, renewal
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (lease_id) REFERENCES leases(id)
);
```

**Features:**
- View all lease documents
- Download PDF documents
- Document version history
- E-signature support (future)

### 15. Lease Renewal
**New Tables:**
```sql
CREATE TABLE lease_renewal_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_lease_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  new_monthly_rent DECIMAL(10, 2) NOT NULL,
  new_lease_start DATE NOT NULL,
  new_lease_end DATE NOT NULL,
  new_terms TEXT,
  offer_expires_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired
  decision_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (original_lease_id) REFERENCES leases(id)
);
```

**Features:**
- Receive renewal offers
- Compare current vs. new terms
- Accept/decline online
- Digital signature
- Automatic lease activation

### 16. Moving Checklist
**New Table:**
```sql
CREATE TABLE moving_checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  lease_id INTEGER NOT NULL,
  move_type VARCHAR(20) NOT NULL, -- move_in, move_out
  move_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checklist_id INTEGER NOT NULL,
  item_category VARCHAR(50) NOT NULL, -- utilities, insurance, inspection, etc.
  item_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  completed_at TIMESTAMP,
  notes TEXT,
  sort_order INTEGER,
  FOREIGN KEY (checklist_id) REFERENCES moving_checklists(id)
);
```

**Pre-populated Items:**
- Set up utilities (water, gas, electric)
- Purchase renter's insurance
- Schedule move-in inspection
- Change mailing address
- Register parking permit
- Get keys and access codes

### 17. Utility Setup Integration
**Third-party Integrations:**
- Partner APIs for utility companies
- Affiliate links for services
- One-click setup workflows

**Features:**
- Browse available utility providers
- Compare rates
- Schedule service start/stop
- Track setup progress
- Confirmation & account numbers

---

## Integration Steps

### For Each Feature:

1. **Run Migration:**
```bash
cd server
sqlite3 database/rent_payment.sqlite < migrations/[migration-file].sql
```

2. **Add Model** (if needed):
```bash
# Create in server/models/[ModelName].js
```

3. **Add Route:**
```javascript
// In server/server.js
const featureRoutes = require('./routes/[feature]');
app.use('/api/[feature]', featureRoutes);
```

4. **Add Frontend Route:**
```javascript
// In client/src/App.js
import FeatureComponent from './pages/tenant/[Feature]';
<Route path="/tenant/[feature]" element={<FeatureComponent />} />
```

5. **Add Navigation Link:**
```javascript
// In Dashboard.js or Layout.js
<Link to="/tenant/[feature]">Feature Name</Link>
```

6. **Test:**
- Test API endpoints with Postman/curl
- Test frontend flow
- Test edge cases
- Verify existing features still work

---

## Priority Order for Implementation

1. ✅ AutoPay (DONE)
2. ✅ Split Rent (DONE)
3. 🔄 Split with Roommates (In Progress)
4. ⭐ Maintenance Request Submission
5. ⭐ Maintenance Status Tracking
6. 🎁 Reward Points System
7. 🎁 Points for Rent Payments
8. 📱 Real-time Notifications
9. 🎁 Rewards Marketplace
10. 🎁 Digital Rewards Redemption
11. 💬 Community Announcements
12. 💬 Messaging with Property Management
13. 📄 Lease Document Access
14. 📄 Lease Renewal
15. 📦 Moving Checklist
16. 🔌 Utility Setup Integration
17. 💰 Flexible Payment Plans

---

## Testing Checklist

After implementing each feature:

- [ ] API endpoints work correctly
- [ ] Frontend displays data properly
- [ ] Form validation works
- [ ] Error handling is in place
- [ ] Success messages display
- [ ] Database constraints are enforced
- [ ] Existing features still work
- [ ] Mobile responsive design
- [ ] Authentication/authorization works
- [ ] No console errors

---

## Common Patterns

### API Response Format:
```javascript
// Success
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE"
}
```

### Authentication Middleware:
```javascript
const { authenticateToken } = require('../middleware/auth');
router.get('/endpoint', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  // ...
});
```

### Date Handling:
```javascript
// Always use ISO format for dates
const date = new Date().toISOString();
const dateOnly = new Date().toISOString().split('T')[0];
```

---

## Resources

- **Database Browser:** Download DB Browser for SQLite to view tables
- **API Testing:** Use Postman or Thunder Client VSCode extension
- **React DevTools:** Install for debugging React components
- **Documentation:** Keep this guide updated as you implement features

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify database schema matches migration
4. Ensure all imports are correct
5. Test API endpoints independently before frontend integration

Happy coding! 🚀
