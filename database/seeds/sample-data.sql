-- ============================================
-- SAMPLE SEED DATA FOR DEVELOPMENT/TESTING
-- ============================================
-- Run this AFTER all migrations are complete
-- Password for all test users: "Test123!"
-- ============================================

-- Clear existing data (for re-seeding)
TRUNCATE TABLE recurring_payment_schedules, rent_payments, payment_methods, leases, units, properties, users RESTART IDENTITY CASCADE;

-- ============================================
-- 1. INSERT USERS
-- ============================================

-- Admin user (email: admin@rentpay.com, password: Test123!)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status) VALUES
('admin@rentpay.com', '$2a$10$YourHashedPasswordHere', 'admin', 'Admin', 'User', '555-0001', 'active');

-- Property Manager (email: manager@example.com, password: Test123!)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status) VALUES
('manager@example.com', '$2a$10$YourHashedPasswordHere', 'property_manager', 'Sarah', 'Johnson', '555-0002', 'active');

-- Tenants
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, date_of_birth, status) VALUES
('john.doe@example.com', '$2a$10$YourHashedPasswordHere', 'tenant', 'John', 'Doe', '555-1001', '1990-05-15', 'active'),
('jane.smith@example.com', '$2a$10$YourHashedPasswordHere', 'tenant', 'Jane', 'Smith', '555-1002', '1988-08-22', 'active'),
('bob.wilson@example.com', '$2a$10$YourHashedPasswordHere', 'tenant', 'Bob', 'Wilson', '555-1003', '1985-03-10', 'active');

-- ============================================
-- 2. INSERT PROPERTIES
-- ============================================

INSERT INTO properties (name, address_line1, city, state, zip_code, country, property_manager_id, total_units, property_type, description) VALUES
('Oak Hill Apartments', '123 Oak Street', 'San Francisco', 'CA', '94105', 'US', 2, 10, 'apartment', 'Modern apartment complex with amenities'),
('Sunset Towers', '456 Sunset Blvd', 'Los Angeles', 'CA', '90028', 'US', 2, 15, 'apartment', 'Luxury high-rise building');

-- ============================================
-- 3. INSERT UNITS
-- ============================================

-- Oak Hill Apartments units
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, square_feet, floor_number, status, monthly_rent, security_deposit) VALUES
(1, '1A', 1, 1, 650, 1, 'occupied', 1500.00, 1500.00),
(1, '1B', 1, 1, 700, 1, 'occupied', 1600.00, 1600.00),
(1, '2A', 2, 1.5, 950, 2, 'occupied', 2000.00, 2000.00),
(1, '2B', 2, 2, 1100, 2, 'vacant', 2200.00, 2200.00),
(1, '3A', 3, 2, 1300, 3, 'vacant', 2800.00, 2800.00);

-- Sunset Towers units
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, square_feet, floor_number, status, monthly_rent, security_deposit) VALUES
(2, '101', 1, 1, 750, 1, 'occupied', 1800.00, 1800.00),
(2, '201', 2, 2, 1200, 2, 'vacant', 2500.00, 2500.00);

-- ============================================
-- 4. INSERT LEASES
-- ============================================

-- Current date for lease calculations
-- Adjust dates based on when you're running this seed

-- John Doe - Unit 1A (Active lease)
INSERT INTO leases (unit_id, tenant_id, monthly_rent, security_deposit, lease_start_date, lease_end_date, rent_due_day, status, payment_grace_period_days, late_fee_amount) VALUES
(1, 3, 1500.00, 1500.00, '2024-01-01', '2024-12-31', 1, 'active', 5, 50.00);

-- Jane Smith - Unit 1B (Active lease)
INSERT INTO leases (unit_id, tenant_id, monthly_rent, security_deposit, lease_start_date, lease_end_date, rent_due_day, status, payment_grace_period_days, late_fee_amount) VALUES
(2, 4, 1600.00, 1600.00, '2024-02-01', '2025-01-31', 1, 'active', 5, 50.00);

-- Bob Wilson - Unit 2A (Active lease)
INSERT INTO leases (unit_id, tenant_id, monthly_rent, security_deposit, lease_start_date, lease_end_date, rent_due_day, status, payment_grace_period_days, late_fee_amount) VALUES
(3, 5, 2000.00, 2000.00, '2023-12-01', '2024-11-30', 1, 'active', 5, 75.00);

-- ============================================
-- 5. INSERT PAYMENT METHODS (Tokenized)
-- ============================================

-- John Doe's saved card
INSERT INTO payment_methods (user_id, payment_type, nickname, card_last_four, card_brand, card_expiry_month, card_expiry_year, cybersource_token, billing_address_line1, billing_city, billing_state, billing_zip_code, billing_country, is_default, status) VALUES
(3, 'card', 'My Visa Card', '4242', 'Visa', '12', '2026', 'tok_card_johndoe_4242', '789 Main St', 'San Francisco', 'CA', '94105', 'US', true, 'active');

-- Jane Smith's saved ACH
INSERT INTO payment_methods (user_id, payment_type, nickname, account_last_four, account_type, bank_name, cybersource_token, billing_address_line1, billing_city, billing_state, billing_zip_code, billing_country, is_default, status) VALUES
(4, 'ach', 'My Checking Account', '6789', 'checking', 'Chase Bank', 'tok_ach_janesmith_6789', '321 Elm St', 'San Francisco', 'CA', '94110', 'US', true, 'active');

-- ============================================
-- 6. INSERT RENT PAYMENTS (Historical)
-- ============================================

-- John Doe's payments (January, February 2024)
INSERT INTO rent_payments (lease_id, tenant_id, payment_method_id, amount, currency, payment_type, payment_status, cybersource_transaction_id, payment_month, payment_year, rent_due_date, payment_date, total_amount, masked_payment_info, is_recurring) VALUES
(1, 3, 1, 1500.00, 'USD', 'card', 'completed', 'txn_john_jan_2024', 1, 2024, '2024-01-01', '2024-01-01 10:30:00', 1500.00, 'Card ending in 4242', false),
(1, 3, 1, 1500.00, 'USD', 'card', 'completed', 'txn_john_feb_2024', 2, 2024, '2024-02-01', '2024-02-01 09:15:00', 1500.00, 'Card ending in 4242', true);

-- Jane Smith's payment (February 2024)
INSERT INTO rent_payments (lease_id, tenant_id, payment_method_id, amount, currency, payment_type, payment_status, cybersource_transaction_id, payment_month, payment_year, rent_due_date, payment_date, total_amount, masked_payment_info, is_recurring) VALUES
(2, 4, 2, 1600.00, 'USD', 'ach', 'completed', 'txn_jane_feb_2024', 2, 2024, '2024-02-01', '2024-02-02 11:00:00', 1600.00, 'Account ending in 6789', false);

-- ============================================
-- 7. INSERT RECURRING PAYMENT SCHEDULES
-- ============================================

-- John Doe's auto-pay (active)
INSERT INTO recurring_payment_schedules (lease_id, tenant_id, payment_method_id, is_active, schedule_type, payment_day, start_date, default_amount, next_payment_date, last_payment_date, total_payments_made, failed_payment_attempts, send_reminder_email, reminder_days_before, send_receipt_email) VALUES
(1, 3, 1, true, 'monthly', 1, '2024-02-01', 1500.00, '2024-03-01', '2024-02-01', 1, 0, true, 3, true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Uncomment these to verify seed data after running:

-- SELECT 'Users:' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'Properties:', COUNT(*) FROM properties
-- UNION ALL
-- SELECT 'Units:', COUNT(*) FROM units
-- UNION ALL
-- SELECT 'Leases:', COUNT(*) FROM leases
-- UNION ALL
-- SELECT 'Payment Methods:', COUNT(*) FROM payment_methods
-- UNION ALL
-- SELECT 'Rent Payments:', COUNT(*) FROM rent_payments
-- UNION ALL
-- SELECT 'Recurring Schedules:', COUNT(*) FROM recurring_payment_schedules;

-- ============================================
-- NOTES
-- ============================================
-- 1. Replace '$2a$10$YourHashedPasswordHere' with actual bcrypt hashes
--    Password: "Test123!" → bcrypt hash with 10 rounds
-- 2. Adjust dates (lease_start_date, lease_end_date, payment dates) to current dates
-- 3. Cybersource tokens are dummy values - replace with real tokens when testing payments
-- 4. Update next_payment_date in recurring schedules to future dates for cron testing
